'use strict';

const https = require('https');
const { DynamoDBClient, GetItemCommand, PutItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');
const { CognitoIdentityProviderClient, InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const dynamo  = new DynamoDBClient({ region: 'us-east-2' });
const ssm     = new SSMClient({ region: 'us-east-2' });
const cognito = new CognitoIdentityProviderClient({ region: 'us-east-2' });
const s3      = new S3Client({ region: 'us-east-2' });
const TABLE   = 'autism-pathways-users';
const BUCKET  = 'ap-documents-988261628792-us-east-2-an';

// ─── Secrets ──────────────────────────────────────────────────────────────────
let _secrets = null;
async function getSecrets() {
  if (_secrets) return _secrets;
  const res = await ssm.send(new GetParametersCommand({
    Names: ['/autism-pathways/stripe-secret-key', '/autism-pathways/stripe-webhook-secret'],
    WithDecryption: true
  }));
  _secrets = {};
  res.Parameters.forEach(p => {
    if (p.Name.includes('stripe-secret-key'))     _secrets.stripeSecret  = p.Value;
    if (p.Name.includes('stripe-webhook-secret')) _secrets.webhookSecret = p.Value;
  });
  return _secrets;
}

// ─── Cognito ──────────────────────────────────────────────────────────────────
function cognitoGetUser(accessToken) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ AccessToken: accessToken });
    const req  = https.request({
      hostname: 'cognito-idp.us-east-2.amazonaws.com',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode !== 200) {
          console.error('[cognitoGetUser] FAILED status=' + res.statusCode + ' msg=' + parsed.message + ' token_prefix=' + (accessToken || '').slice(0,20));
          return reject(new Error(parsed.message || 'Invalid token'));
        }
        const sub   = parsed.Username;
        const email = (parsed.UserAttributes || []).find(a => a.Name === 'email')?.Value || '';
        console.log('[cognitoGetUser] OK sub=' + sub + ' email=' + email);
        resolve({ sub, email });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Stripe helpers ───────────────────────────────────────────────────────────
function stripeGetCustomerEmail(customerId, stripeSecret) {
  return new Promise((resolve) => {
    if (!customerId || !stripeSecret) { resolve(''); return; }
    const req = https.request({
      hostname: 'api.stripe.com',
      path: `/v1/customers/${customerId}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${stripeSecret}` }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve((JSON.parse(data).email || '').toLowerCase().trim()); }
        catch(e) { resolve(''); }
      });
    });
    req.on('error', () => resolve(''));
    req.end();
  });
}

// ─── DynamoDB helpers ─────────────────────────────────────────────────────────
async function dbGet(key) {
  const res = await dynamo.send(new GetItemCommand({ TableName: TABLE, Key: { pk: { S: key } } }));
  return res.Item || null;
}
async function dbPut(key, data) {
  await dynamo.send(new PutItemCommand({
    TableName: TABLE,
    Item: { pk: { S: key }, data: { S: JSON.stringify(data) } }
  }));
}
async function dbDelete(key) {
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE, Key: { pk: { S: key } } }));
}
function dbParse(item) {
  if (!item) return null;
  try { return JSON.parse(item.data.S); } catch(e) { return null; }
}

// ─── Premium helpers ──────────────────────────────────────────────────────────
async function getPremium(sub) {
  const res = await dynamo.send(new GetItemCommand({ TableName: TABLE, Key: { pk: { S: `premium:${sub}` } } }));
  return res.Item || null;
}
async function getPremiumPending(email) {
  const res = await dynamo.send(new GetItemCommand({ TableName: TABLE, Key: { pk: { S: `premium_pending:${email}` } } }));
  return res.Item || null;
}
async function setPremium(sub, email, source, activatedAt) {
  await dynamo.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      pk: { S: `premium:${sub}` },
      plan: { S: 'premium' },
      source: { S: source },
      email: { S: email },
      activatedAt: { S: activatedAt }
    }
  }));
}
async function deletePending(email) {
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE, Key: { pk: { S: `premium_pending:${email}` } } }));
}
async function setPremiumPending(email, sessionId) {
  await dynamo.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      pk: { S: `premium_pending:${email}` },
      plan: { S: 'premium' },
      source: { S: 'stripe' },
      sessionId: { S: String(sessionId) },
      activatedAt: { S: new Date().toISOString() }
    }
  }));
}

// ─── Progress helpers ─────────────────────────────────────────────────────────
async function getProgress(sub) {
  const item = await dbGet(`progress:${sub}`);
  return dbParse(item);
}
async function setProgress(sub, data) {
  await dbPut(`progress:${sub}`, { ...data, lastSynced: new Date().toISOString() });
}

// ─── Contacts helpers ─────────────────────────────────────────────────────────
const ALLOWED_CONTACT_FIELDS = ['id','name','org','phone','email','category','notes','createdAt'];
function sanitizeContact(c) {
  const out = {};
  ALLOWED_CONTACT_FIELDS.forEach(f => { if (c[f] !== undefined) out[f] = c[f]; });
  return out;
}
async function getContacts(sub) {
  const item = await dbGet(`contacts:${sub}`);
  const data = dbParse(item);
  return Array.isArray(data?.contacts) ? data.contacts : [];
}
async function setContacts(sub, contacts) {
  await dbPut(`contacts:${sub}`, { contacts, updatedAt: new Date().toISOString() });
}

// ─── Document Vault helpers ───────────────────────────────────────────────────
// Metadata stored in DynamoDB: { documents: [{ id, s3Key, fileName, mimeType, uploadedAt, size }] }
async function getDocumentMeta(sub) {
  const item = await dbGet(`documents:${sub}`);
  const data = dbParse(item);
  return Array.isArray(data?.documents) ? data.documents : [];
}
async function setDocumentMeta(sub, documents) {
  await dbPut(`documents:${sub}`, { documents, updatedAt: new Date().toISOString() });
}

// Allowed MIME types for HIPAA-safe document uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// Max 16 MB per file
const MAX_FILE_SIZE = 16 * 1024 * 1024;

// ─── Agency data ──────────────────────────────────────────────────────────────
const AGENCY_DATA = {
  'Colorado': [
    { id: 'co_01', category: 'Medicaid', name: 'Colorado PEAK (Medicaid Applications)', org: 'Colorado HCPF', phone: '1-800-221-3943', web: 'https://peak.colorado.gov', notes: 'Apply for Medicaid online through PEAK' },
    { id: 'co_02', category: 'Medicaid', name: 'Health First Colorado Member Contact Center', org: 'Colorado HCPF', phone: '1-800-221-3943', web: 'https://www.healthfirstcolorado.com', notes: 'Main Medicaid member services line' },
    { id: 'co_03', category: 'Waivers', name: "Children's Extensive Support (CES) Waiver", org: 'Colorado HCPF', phone: '303-692-2700', web: 'https://hcpf.colorado.gov/ces', notes: 'For children with significant developmental disabilities' },
    { id: 'co_04', category: 'Waivers', name: 'Supported Living Services (SLS) Waiver', org: 'Colorado HCPF', phone: '303-692-2700', web: 'https://hcpf.colorado.gov/supported-living-services', notes: 'Waiver for adults with intellectual/developmental disabilities' },
    { id: 'co_05', category: 'Disability', name: 'Community Centered Boards (CCBs)', org: 'CDHS', phone: '303-866-7450', web: 'https://cdhs.colorado.gov/community-centered-boards', notes: 'Local entry point for DD services and waiver applications' },
    { id: 'co_06', category: 'Disability', name: 'Colorado Department of Human Services', org: 'CDHS', phone: '303-866-5700', web: 'https://cdhs.colorado.gov/disability-services', notes: 'State disability services office' },
    { id: 'co_07', category: 'SSI', name: 'Social Security Administration', org: 'SSA', phone: '1-800-772-1213', web: 'https://www.ssa.gov', notes: 'Apply for SSI disability benefits' },
    { id: 'co_08', category: 'Autism Support', name: 'Autism Society of Colorado', org: 'ASC', phone: '720-214-9360', web: 'https://autismcolorado.org', notes: 'Local advocacy, resources, and family support' },
    { id: 'co_09', category: 'Appeals', name: 'Colorado Office of Administrative Courts', org: 'OAC', phone: '303-866-2000', web: 'https://oac.colorado.gov', notes: 'File Medicaid and waiver appeals here' }
  ],
  'California': [
    { id: 'ca_01', category: 'Medicaid', name: 'Medi-Cal (California Medicaid)', org: 'DHCS', phone: '1-800-541-5555', web: 'https://www.dhcs.ca.gov/medi-cal', notes: 'Apply online at BenefitsCal.com' },
    { id: 'ca_02', category: 'Waivers', name: 'HCBS Waiver', org: 'DHCS', phone: '916-552-9105', web: 'https://www.dhcs.ca.gov/services/medi-cal/Pages/HCBS.aspx', notes: 'Main waiver program for disability services' },
    { id: 'ca_03', category: 'Disability', name: 'Regional Center (find yours by ZIP)', org: 'DDS', phone: '916-654-1987', web: 'https://www.dds.ca.gov/rc/rcs-by-county', notes: 'Your local Regional Center is the entry point for all DD services' },
    { id: 'ca_04', category: 'SSI', name: 'Social Security Administration', org: 'SSA', phone: '1-800-772-1213', web: 'https://www.ssa.gov', notes: 'Apply for SSI and disability benefits' },
    { id: 'ca_05', category: 'Autism Support', name: 'Autism Society of California', org: 'ASC', phone: '916-364-9999', web: 'https://www.autismsocietyca.org', notes: 'Statewide advocacy and family resources' }
  ],
  'Texas': [
    { id: 'tx_01', category: 'Medicaid', name: 'Texas Medicaid (TMHP)', org: 'HHSC', phone: '1-800-252-8263', web: 'https://www.tmhp.com', notes: 'Texas Medicaid and Healthcare Partnership' },
    { id: 'tx_02', category: 'Waivers', name: 'HCS Waiver', org: 'HHSC', phone: '512-438-3011', web: 'https://www.hhs.texas.gov/hcs', notes: 'Main DD waiver — apply through local LIDDA' },
    { id: 'tx_03', category: 'Waivers', name: 'Texas Home Living (TxHmL) Waiver', org: 'HHSC', phone: '512-438-3011', web: 'https://www.hhs.texas.gov/txhml', notes: 'For individuals living at home with family' },
    { id: 'tx_04', category: 'Disability', name: 'Local IDD Authority (LIDDA)', org: 'HHSC', phone: '512-438-5055', web: 'https://www.hhs.texas.gov/about-hhs/find-us/local-intellectual-developmental-disability-authorities', notes: 'Entry point for waiver applications in Texas' },
    { id: 'tx_05', category: 'SSI', name: 'Social Security Administration', org: 'SSA', phone: '1-800-772-1213', web: 'https://www.ssa.gov', notes: 'Apply for SSI and disability benefits' },
    { id: 'tx_06', category: 'Autism Support', name: 'Autism Society of Texas', org: 'AST', phone: '512-479-4199', web: 'https://www.autismsocietytx.org', notes: 'Statewide advocacy and family resources' }
  ],
  'Florida': [
    { id: 'fl_01', category: 'Medicaid', name: 'Florida Medicaid', org: 'AHCA', phone: '1-877-254-1055', web: 'https://ahca.myflorida.com', notes: 'Apply through ACCESS Florida' },
    { id: 'fl_02', category: 'Waivers', name: 'iBudget Waiver', org: 'APD', phone: '888-636-4273', web: 'https://apd.myflorida.com/waiver', notes: 'Main waiver for individuals with DD in FL' },
    { id: 'fl_03', category: 'Disability', name: 'Agency for Persons with Disabilities (APD)', org: 'APD', phone: '888-636-4273', web: 'https://apd.myflorida.com', notes: 'Main state agency — apply for waiver here' },
    { id: 'fl_04', category: 'SSI', name: 'Social Security Administration', org: 'SSA', phone: '1-800-772-1213', web: 'https://www.ssa.gov', notes: 'Apply for SSI and disability benefits' },
    { id: 'fl_05', category: 'Autism Support', name: 'Autism Society of Florida', org: 'ASF', phone: '904-723-0460', web: 'https://www.autismsocietyoffl.org', notes: 'Statewide advocacy and resources' }
  ],
  'default': [
    { id: 'def_01', category: 'Medicaid', name: 'Medicaid.gov — Find Your State', org: 'CMS', phone: '1-877-267-2323', web: 'https://www.medicaid.gov/about-us/contact-us/index.html', notes: 'Find your state Medicaid office' },
    { id: 'def_02', category: 'Waivers', name: 'HCBS Waivers — Find Your State', org: 'CMS', phone: '1-877-267-2323', web: 'https://www.medicaid.gov/medicaid/home-community-based-services/index.html', notes: 'Federal resource for all state HCBS waivers' },
    { id: 'def_03', category: 'SSI', name: 'Social Security Administration', org: 'SSA', phone: '1-800-772-1213', web: 'https://www.ssa.gov', notes: 'Apply for SSI and disability benefits' },
    { id: 'def_04', category: 'Autism Support', name: 'Autism Society of America', org: 'ASA', phone: '1-800-328-8476', web: 'https://www.autism-society.org', notes: 'Find your local chapter and statewide resources' },
    { id: 'def_05', category: 'Autism Support', name: 'Autism Speaks Resource Guide', org: 'Autism Speaks', phone: '888-288-4762', web: 'https://www.autismspeaks.org/resource-guide', notes: 'Search for state-specific services and providers' }
  ]
};

// ─── CORS / response helpers ──────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

function respond(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS, ...extraHeaders },
    body: JSON.stringify(body)
  };
}

function extractBearer(event) {
  const h = event.headers?.Authorization || event.headers?.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

// ─── Lambda handler ───────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const method = (event.httpMethod || event.requestContext?.http?.method || '').toUpperCase();
  const path   = (event.path || event.rawPath || '').replace(/\/+$/, '') || '/';
  console.log('PATH:', path, 'METHOD:', method);

  if (method === 'OPTIONS') return respond(200, {});

  // ── Auth: Login ─────────────────────────────────────────────────────────────
  if (path === '/api/auth/login' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { email, password } = body;
    if (!email || !password) return respond(400, { error: 'Email and password required.' });
    try {
      const result = await cognito.send(new InitiateAuthCommand({
        ClientId: '1pude0u2krj3qbt48ij0igooeb',
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: { USERNAME: email, PASSWORD: password }
      }));
      return respond(200, {
        token: result.AuthenticationResult.AccessToken,
        idToken: result.AuthenticationResult.IdToken,
        refreshToken: result.AuthenticationResult.RefreshToken
      });
    } catch(e) {
      console.error('Cognito auth error:', e);
      return respond(403, { error: 'Invalid email or password.' });
    }
  }

  // ── Auth: Me ─────────────────────────────────────────────────────────────────
  if (path === '/api/me' && method === 'GET') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'No token provided.' });
    let user;
    try { user = await cognitoGetUser(token); }
    catch(e) { return respond(401, { error: 'Invalid or expired token.' }); }

    let isPremium = false, premiumSince = null;
    try {
      let record = await getPremium(user.sub);
      if (record) {
        isPremium    = true;
        premiumSince = record.activatedAt?.S || null;
      } else {
        const pending = await getPremiumPending(user.email);
        if (pending) {
          await setPremium(user.sub, user.email, pending.source?.S || 'stripe', pending.activatedAt?.S || new Date().toISOString());
          await deletePending(user.email);
          isPremium    = true;
          premiumSince = pending.activatedAt?.S || null;
        }
      }
    } catch(e) { console.error('DB error in /api/me:', e); }

    return respond(200, { sub: user.sub, email: user.email, isPremium, premiumSince });
  }

  // ── Progress sync ─────────────────────────────────────────────────────────────
  if (path === '/api/sync-progress' && method === 'GET') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'No token.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    try { return respond(200, await getProgress(user.sub) || {}); }
    catch(e) { return respond(200, {}); }
  }

  if (path === '/api/sync-progress' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'No token.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    try {
      await setProgress(user.sub, JSON.parse(event.body || '{}'));
      return respond(200, { success: true });
    } catch(e) { return respond(500, { error: 'Could not save progress.' }); }
  }

  // ── Contacts ──────────────────────────────────────────────────────────────────
  if (path === '/api/contacts' && method === 'GET') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Unauthorized' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Unauthorized' }); }
    try { return respond(200, { contacts: await getContacts(user.sub) }); }
    catch(e) { return respond(200, { contacts: [] }); }
  }

  if (path === '/api/contacts' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Unauthorized' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Unauthorized' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    if (!Array.isArray(body.contacts)) return respond(400, { error: 'contacts must be an array' });
    if (body.contacts.length > 200) return respond(400, { error: 'Contact limit reached' });
    try {
      await setContacts(user.sub, body.contacts.map(sanitizeContact));
      return respond(200, { success: true });
    } catch(e) { return respond(500, { error: 'Could not save contacts.' }); }
  }

  // ── Agency contacts ───────────────────────────────────────────────────────────
  if (path === '/api/agency-contacts' && method === 'GET') {
    const state = (event.queryStringParameters?.state || '').trim();
    return respond(200, { state: state || 'General', agencies: AGENCY_DATA[state] || AGENCY_DATA['default'] });
  }

  // ── Document Vault: list documents ────────────────────────────────────────────
  // GET /api/documents
  // Returns the user's document metadata list (no file bytes, no S3 URLs yet)
  if (path === '/api/documents' && method === 'GET') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Unauthorized' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Unauthorized' }); }
    try {
      const documents = await getDocumentMeta(user.sub);
      return respond(200, { documents });
    } catch(e) {
      console.error('Error listing documents:', e);
      return respond(500, { error: 'Could not retrieve documents.' });
    }
  }

  // ── Document Vault: request upload URL ────────────────────────────────────────
  // POST /api/documents/upload-url
  // Body: { docId, fileName, mimeType, fileSize }
  // Returns: { uploadUrl, s3Key } — client uploads directly to S3 using uploadUrl (PUT)
  if (path === '/api/documents/upload-url' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Unauthorized' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Unauthorized' }); }

    // Premium check — document upload is a premium feature
    const premiumRecord = await getPremium(user.sub);
    if (!premiumRecord) return respond(403, { error: 'Premium required to upload documents.' });

    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }

    const { docId, fileName, mimeType, fileSize } = body;
    if (!docId || !fileName || !mimeType) return respond(400, { error: 'docId, fileName, and mimeType are required.' });
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) return respond(400, { error: 'File type not allowed.' });
    if (fileSize && fileSize > MAX_FILE_SIZE) return respond(400, { error: 'File exceeds 16 MB limit.' });

    // S3 key: scoped to user sub so users can only access their own files
    const s3Key = `documents/${user.sub}/${docId}/${encodeURIComponent(fileName)}`;

    try {
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: s3Key,
          ContentType: mimeType,
          // Server-side encryption enforced at bucket level, but set explicitly here too
          ServerSideEncryption: 'AES256',
          // Tag for HIPAA audit trail
          Tagging: `userId=${user.sub}&docId=${docId}`
        }),
        { expiresIn: 300 } // 5 minutes to complete the upload
      );

      // Save/update document metadata in DynamoDB
      const documents = await getDocumentMeta(user.sub);
      const existingIdx = documents.findIndex(d => d.docId === docId);
      const docMeta = {
        docId,
        s3Key,
        fileName,
        mimeType,
        fileSize: fileSize || null,
        uploadedAt: new Date().toISOString()
      };
      if (existingIdx >= 0) {
        documents[existingIdx] = docMeta;
      } else {
        documents.push(docMeta);
      }
      await setDocumentMeta(user.sub, documents);

      return respond(200, { uploadUrl, s3Key });
    } catch(e) {
      console.error('Error generating upload URL:', e);
      return respond(500, { error: 'Could not generate upload URL.' });
    }
  }

  // ── Document Vault: request download URL ──────────────────────────────────────
  // POST /api/documents/download-url
  // Body: { docId }
  // Returns: { downloadUrl } — pre-signed GET URL, expires in 15 minutes
  if (path === '/api/documents/download-url' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Unauthorized' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Unauthorized' }); }

    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { docId } = body;
    if (!docId) return respond(400, { error: 'docId is required.' });

    try {
      const documents = await getDocumentMeta(user.sub);
      const doc = documents.find(d => d.docId === docId);
      if (!doc) return respond(404, { error: 'Document not found.' });

      const downloadUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: BUCKET,
          Key: doc.s3Key,
          ResponseContentDisposition: `attachment; filename="${doc.fileName}"`
        }),
        { expiresIn: 900 } // 15 minutes
      );

      return respond(200, { downloadUrl, fileName: doc.fileName, mimeType: doc.mimeType });
    } catch(e) {
      console.error('Error generating download URL:', e);
      return respond(500, { error: 'Could not generate download URL.' });
    }
  }

  // ── Document Vault: delete document ──────────────────────────────────────────
  // DELETE /api/documents/:docId  (or POST /api/documents/delete with body { docId })
  if (path === '/api/documents/delete' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Unauthorized' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Unauthorized' }); }

    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { docId } = body;
    if (!docId) return respond(400, { error: 'docId is required.' });

    try {
      const documents = await getDocumentMeta(user.sub);
      const doc = documents.find(d => d.docId === docId);
      if (!doc) return respond(404, { error: 'Document not found.' });

      // Delete from S3
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: doc.s3Key }));

      // Remove from DynamoDB metadata
      const updated = documents.filter(d => d.docId !== docId);
      await setDocumentMeta(user.sub, updated);

      return respond(200, { success: true });
    } catch(e) {
      console.error('Error deleting document:', e);
      return respond(500, { error: 'Could not delete document.' });
    }
  }

  // ── Stripe webhook ────────────────────────────────────────────────────────────
  if (path === '/api/stripe-webhook' && method === 'POST') {
    const secrets = await getSecrets();
    const sig = event.headers?.['stripe-signature'] || event.headers?.['Stripe-Signature'];

    let stripeEvent;
    try {
      const stripe = require('/opt/nodejs/node_modules/stripe')(secrets.stripeSecret);
      stripeEvent = stripe.webhooks.constructEvent(
        Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'),
        sig,
        secrets.webhookSecret
      );
    } catch(e) {
      console.error('Stripe signature failed:', e.message);
      return respond(400, { error: e.message });
    }

    console.log('Stripe event type:', stripeEvent.type);

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      let email = (session.customer_details?.email || session.customer_email || '').toLowerCase().trim();
      if (!email && session.customer) {
        email = await stripeGetCustomerEmail(session.customer, secrets.stripeSecret);
      }
      if (email) {
        try { await setPremiumPending(email, session.id); }
        catch(e) { console.error('DB error in checkout webhook:', e); }
      }
    }

    if (stripeEvent.type === 'customer.subscription.created') {
      const sub = stripeEvent.data.object;
      let email = '';
      if (sub.customer) email = await stripeGetCustomerEmail(sub.customer, secrets.stripeSecret);
      if (email) {
        try { await setPremiumPending(email, sub.id); }
        catch(e) { console.error('DB error in subscription webhook:', e); }
      }
    }

    if (stripeEvent.type === 'invoice.payment_succeeded') {
      const invoice = stripeEvent.data.object;
      let email = (invoice.customer_email || '').toLowerCase().trim();
      if (!email && invoice.customer) email = await stripeGetCustomerEmail(invoice.customer, secrets.stripeSecret);
      if (email) {
        try { await setPremiumPending(email, invoice.id); }
        catch(e) { console.error('DB error in invoice webhook:', e); }
      }
    }

    return respond(200, { received: true });
  }

  // ── Community Forum ──────────────────────────────────────────────────────────
  // DynamoDB keys:
  //   forum_posts          → { posts: [PostDoc] }  (global feed, newest first)
  //   forum_comments:{id}  → { comments: [CommentDoc] }
  //   forum_reports        → { reports: [ReportDoc] }

  // GET /api/forum/posts  — public feed (no auth required)
  if (path === '/api/forum/posts' && method === 'GET') {
    try {
      const item = await dbGet('forum_posts');
      const data = dbParse(item);
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      return respond(200, { posts });
    } catch(e) {
      console.error('forum/posts GET error:', e);
      return respond(200, { posts: [] });
    }
  }

  // POST /api/forum/posts  — share a journal entry (auth required)
  // Body: { title, body, anonymous }
  if (path === '/api/forum/posts' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Sign in to share.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { title, body: postBody, anonymous } = body;
    if (!title || !postBody) return respond(400, { error: 'title and body are required.' });
    if (title.length > 200) return respond(400, { error: 'Title too long (max 200 chars).' });
    if (postBody.length > 5000) return respond(400, { error: 'Post too long (max 5000 chars).' });
    try {
      const item = await dbGet('forum_posts');
      const data = dbParse(item);
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      const newPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        body: postBody.trim(),
        authorSub: user.sub,
        authorDisplay: anonymous ? 'Anonymous' : user.email.split('@')[0],
        anonymous: !!anonymous,
        createdAt: new Date().toISOString(),
        commentCount: 0,
        heartCount: 0
      };
      posts.unshift(newPost); // newest first
      if (posts.length > 500) posts.splice(500); // cap at 500 posts
      await dbPut('forum_posts', { posts });
      return respond(201, { post: newPost });
    } catch(e) {
      console.error('forum/posts POST error:', e);
      return respond(500, { error: 'Could not save post.' });
    }
  }

  // DELETE /api/forum/posts  — delete own post
  // Body: { postId }
  if (path === '/api/forum/posts/delete' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Unauthorized' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Unauthorized' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { postId } = body;
    if (!postId) return respond(400, { error: 'postId required.' });
    try {
      const item = await dbGet('forum_posts');
      const data = dbParse(item);
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      const post = posts.find(p => p.id === postId);
      if (!post) return respond(404, { error: 'Post not found.' });
      if (post.authorSub !== user.sub) return respond(403, { error: 'Not your post.' });
      const updated = posts.filter(p => p.id !== postId);
      await dbPut('forum_posts', { posts: updated });
      await dbDelete(`forum_comments:${postId}`);
      return respond(200, { success: true });
    } catch(e) {
      return respond(500, { error: 'Could not delete post.' });
    }
  }

  // GET /api/forum/comments?postId=xxx  — get comments for a post
  if (path === '/api/forum/comments' && method === 'GET') {
    const postId = event.queryStringParameters?.postId;
    if (!postId) return respond(400, { error: 'postId required.' });
    try {
      const item = await dbGet(`forum_comments:${postId}`);
      const data = dbParse(item);
      return respond(200, { comments: Array.isArray(data?.comments) ? data.comments : [] });
    } catch(e) {
      return respond(200, { comments: [] });
    }
  }

  // POST /api/forum/comments  — add a comment or reply (auth required)
  // Body: { postId, body, parentId?, anonymous }
  if (path === '/api/forum/comments' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Sign in to comment.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { postId, body: commentBody, parentId, anonymous } = body;
    if (!postId || !commentBody) return respond(400, { error: 'postId and body required.' });
    if (commentBody.length > 1000) return respond(400, { error: 'Comment too long (max 1000 chars).' });
    try {
      const item = await dbGet(`forum_comments:${postId}`);
      const data = dbParse(item);
      const comments = Array.isArray(data?.comments) ? data.comments : [];
      const newComment = {
        id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        postId,
        parentId: parentId || null,
        body: commentBody.trim(),
        authorSub: user.sub,
        authorDisplay: anonymous ? 'Anonymous' : user.email.split('@')[0],
        anonymous: !!anonymous,
        createdAt: new Date().toISOString(),
        heartCount: 0
      };
      comments.push(newComment);
      await dbPut(`forum_comments:${postId}`, { comments });
      // Update comment count on the post
      const postsItem = await dbGet('forum_posts');
      const postsData = dbParse(postsItem);
      if (Array.isArray(postsData?.posts)) {
        const idx = postsData.posts.findIndex(p => p.id === postId);
        if (idx >= 0) {
          postsData.posts[idx].commentCount = comments.length;
          await dbPut('forum_posts', { posts: postsData.posts });
        }
      }
      return respond(201, { comment: newComment });
    } catch(e) {
      console.error('forum/comments POST error:', e);
      return respond(500, { error: 'Could not save comment.' });
    }
  }

  // POST /api/forum/heart  — toggle heart on a post or comment (auth required)
  // Body: { type: 'post'|'comment', id, postId? }
  if (path === '/api/forum/heart' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Sign in to heart.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { type, id, postId } = body;
    try {
      if (type === 'post') {
        const item = await dbGet('forum_posts');
        const data = dbParse(item);
        if (!Array.isArray(data?.posts)) return respond(404, { error: 'Not found.' });
        const heartsKey = `forum_hearts:post:${id}`;
        const heartsItem = await dbGet(heartsKey);
        const heartsData = dbParse(heartsItem) || { users: [] };
        const alreadyHearted = heartsData.users.includes(user.sub);
        if (alreadyHearted) {
          heartsData.users = heartsData.users.filter(u => u !== user.sub);
        } else {
          heartsData.users.push(user.sub);
        }
        await dbPut(heartsKey, heartsData);
        const idx = data.posts.findIndex(p => p.id === id);
        if (idx >= 0) {
          data.posts[idx].heartCount = heartsData.users.length;
          await dbPut('forum_posts', { posts: data.posts });
        }
        return respond(200, { hearted: !alreadyHearted, count: heartsData.users.length });
      }
      if (type === 'comment' && postId) {
        const item = await dbGet(`forum_comments:${postId}`);
        const data = dbParse(item);
        if (!Array.isArray(data?.comments)) return respond(404, { error: 'Not found.' });
        const heartsKey = `forum_hearts:comment:${id}`;
        const heartsItem = await dbGet(heartsKey);
        const heartsData = dbParse(heartsItem) || { users: [] };
        const alreadyHearted = heartsData.users.includes(user.sub);
        if (alreadyHearted) {
          heartsData.users = heartsData.users.filter(u => u !== user.sub);
        } else {
          heartsData.users.push(user.sub);
        }
        await dbPut(heartsKey, heartsData);
        const idx = data.comments.findIndex(c => c.id === id);
        if (idx >= 0) {
          data.comments[idx].heartCount = heartsData.users.length;
          await dbPut(`forum_comments:${postId}`, { comments: data.comments });
        }
        return respond(200, { hearted: !alreadyHearted, count: heartsData.users.length });
      }
      return respond(400, { error: 'Invalid type.' });
    } catch(e) {
      return respond(500, { error: 'Could not update heart.' });
    }
  }

  // POST /api/forum/report  — flag a post or comment for review
  // Body: { type: 'post'|'comment', id, reason }
  // Sends email to contact@autismpathways.app via SES
  if (path === '/api/forum/report' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Sign in to report.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { type, id, reason } = body;
    if (!type || !id) return respond(400, { error: 'type and id required.' });
    try {
      // Save report to DynamoDB
      const item = await dbGet('forum_reports');
      const data = dbParse(item) || { reports: [] };
      data.reports.unshift({
        id: `rpt_${Date.now()}`,
        type,
        contentId: id,
        reason: reason || 'No reason given',
        reportedBy: user.sub,
        reportedAt: new Date().toISOString()
      });
      if (data.reports.length > 1000) data.reports.splice(1000);
      await dbPut('forum_reports', data);

      // Send email notification via SES
      const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
      const ses = new SESClient({ region: 'us-east-1' });
      try {
        await ses.send(new SendEmailCommand({
          Source: 'contact@autismpathways.app',
          Destination: { ToAddresses: ['contact@autismpathways.app'] },
          Message: {
            Subject: { Data: `[AP Forum] Content Reported: ${type} ${id}` },
            Body: {
              Text: {
                Data: `A community forum ${type} has been reported.\n\nContent ID: ${id}\nType: ${type}\nReason: ${reason || 'None given'}\nReported by: ${user.sub}\nTime: ${new Date().toISOString()}\n\nPlease review at your earliest convenience.`
              }
            }
          }
        }));
      } catch(sesErr) {
        // Email failure is non-fatal — report is still saved
        console.error('[SES] send failed:', sesErr?.name, sesErr?.message, JSON.stringify(sesErr));
      }

      return respond(200, { success: true });
    } catch(e) {
      console.error('forum/report error:', e);
      return respond(500, { error: 'Could not submit report.' });
    }
  }

  // ── Phone OTP: Send ─────────────────────────────────────────────────────────
  // POST /api/auth/phone-otp/send
  // Body: { phone: '+15551234567' }
  // Sends a 6-digit OTP via Twilio and stores it in DynamoDB (TTL 10 min)
  if (path === '/api/auth/phone-otp/send' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { phone } = body;
    if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return respond(400, { error: 'A valid E.164 phone number is required (e.g. +15551234567).' });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    // Store OTP in DynamoDB
    try {
      await dynamo.send(new PutItemCommand({
        TableName: TABLE,
        Item: {
          pk:        { S: `phone_otp:${phone}` },
          otp:       { S: otp },
          expiresAt: { N: String(expiresAt) },
          attempts:  { N: '0' }
        }
      }));
    } catch(e) {
      console.error('DynamoDB OTP store error:', e);
      return respond(500, { error: 'Could not store OTP.' });
    }
    // Send SMS via Twilio REST API
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone  = process.env.TWILIO_PHONE_NUMBER;
    if (!accountSid || !authToken || !fromPhone) {
      return respond(500, { error: 'SMS service not configured.' });
    }
    const smsBody = `Your Autism Pathways code is: ${otp}. It expires in 10 minutes.`;
    const postData = new URLSearchParams({ To: phone, From: fromPhone, Body: smsBody }).toString();
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        }
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            console.error('Twilio error:', parsed);
            reject(new Error(parsed.message || 'Twilio error'));
          } else {
            resolve(parsed);
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    }).catch(e => {
      console.error('Twilio SMS send error:', e);
      return respond(500, { error: 'Could not send SMS. Please try again.' });
    });
    return respond(200, { success: true, message: 'OTP sent.' });
  }

  // ── Phone OTP: Verify ────────────────────────────────────────────────────────
  // POST /api/auth/phone-otp/verify
  // Body: { phone: '+15551234567', otp: '123456', firstName?: string, lastName?: string }
  // Verifies OTP, creates/finds Cognito user, returns tokens
  if (path === '/api/auth/phone-otp/verify' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { phone, otp, firstName, lastName } = body;
    if (!phone || !otp) return respond(400, { error: 'Phone and OTP are required.' });
    // Fetch stored OTP
    let stored;
    try {
      const res = await dynamo.send(new GetItemCommand({ TableName: TABLE, Key: { pk: { S: `phone_otp:${phone}` } } }));
      stored = res.Item;
    } catch(e) {
      return respond(500, { error: 'Could not verify OTP.' });
    }
    if (!stored) return respond(400, { error: 'No OTP found for this number. Please request a new code.' });
    if (Date.now() > Number(stored.expiresAt.N)) {
      return respond(400, { error: 'OTP has expired. Please request a new code.' });
    }
    const attempts = Number(stored.attempts?.N || '0');
    if (attempts >= 5) return respond(429, { error: 'Too many attempts. Please request a new code.' });
    if (stored.otp.S !== otp) {
      // Increment attempts
      await dynamo.send(new PutItemCommand({
        TableName: TABLE,
        Item: { ...stored, attempts: { N: String(attempts + 1) } }
      }));
      return respond(400, { error: 'Incorrect code. Please try again.' });
    }
    // OTP valid — delete it
    await dynamo.send(new DeleteItemCommand({ TableName: TABLE, Key: { pk: { S: `phone_otp:${phone}` } } }));
    // Find or create Cognito user by phone
    const { AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');
    const USER_POOL_ID = 'us-east-2_cRdQiPSDK';
    const CLIENT_ID    = '1pude0u2krj3qbt48ij0igooeb';
    // Use phone as username (strip + for Cognito username)
    const username = `phone_${phone.replace(/\+/g, '')}`;
    let userExists = false;
    try {
      const listRes = await cognito.send(new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `username = "${username}"`
      }));
      userExists = (listRes.Users || []).length > 0;
    } catch(e) { /* user not found */ }
    if (!userExists) {
      // Create new user
      const userAttrs = [
        { Name: 'phone_number', Value: phone },
        { Name: 'phone_number_verified', Value: 'true' },
        { Name: 'email_verified', Value: 'false' }
      ];
      if (firstName) userAttrs.push({ Name: 'given_name', Value: firstName });
      if (lastName)  userAttrs.push({ Name: 'family_name', Value: lastName });
      try {
        await cognito.send(new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          UserAttributes: userAttrs,
          MessageAction: 'SUPPRESS' // don't send welcome email
        }));
      } catch(e) {
        console.error('AdminCreateUser error:', e);
        return respond(500, { error: 'Could not create account.' });
      }
    }
    // Set a deterministic password so we can use USER_PASSWORD_AUTH
    const tempPassword = `Ap!${phone.slice(-6)}Otp#${otp}`;
    try {
      await cognito.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: tempPassword,
        Permanent: true
      }));
    } catch(e) {
      console.error('AdminSetUserPassword error:', e);
      return respond(500, { error: 'Could not authenticate.' });
    }
    // Sign in and return tokens
    try {
      const authRes = await cognito.send(new AdminInitiateAuthCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: { USERNAME: username, PASSWORD: tempPassword }
      }));
      return respond(200, {
        token:        authRes.AuthenticationResult.AccessToken,
        idToken:      authRes.AuthenticationResult.IdToken,
        refreshToken: authRes.AuthenticationResult.RefreshToken,
        isNewUser:    !userExists
      });
    } catch(e) {
      console.error('AdminInitiateAuth error:', e);
      return respond(500, { error: 'Authentication failed.' });
    }
  }

  // ── Auth: Apple Social Exchange ──────────────────────────────────────────────
  // POST /api/auth/apple-exchange
  // Body: { identityToken: string, email?: string, firstName?: string, lastName?: string }
  // Verifies Apple JWT, creates/finds Cognito user, returns Cognito tokens
  if (path === '/api/auth/apple-exchange' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { identityToken, email: appleEmail, firstName, lastName } = body;
    if (!identityToken) return respond(400, { error: 'identityToken is required.' });
    // Decode the Apple JWT payload (we trust Apple's token since it comes from the device)
    // For server-side verification we decode and use the sub as a stable identifier
    let appleSub, resolvedEmail;
    try {
      const parts = identityToken.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      appleSub = payload.sub;
      resolvedEmail = appleEmail || payload.email || `apple_${appleSub}@privaterelay.appleid.com`;
      // Basic sanity: must be issued by Apple
      if (payload.iss !== 'https://appleid.apple.com') throw new Error('Not an Apple token');
      // Must not be expired (with 5-min clock skew tolerance)
      if (payload.exp < Math.floor(Date.now() / 1000) - 300) throw new Error('Token expired');
    } catch(e) {
      return respond(401, { error: 'Invalid Apple identity token: ' + e.message });
    }
    const { AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');
    const USER_POOL_ID = 'us-east-2_cRdQiPSDK';
    const CLIENT_ID    = '1pude0u2krj3qbt48ij0igooeb';
    // Cognito pool requires email as username — use resolvedEmail as the username.
    // Store the Apple sub as a custom attribute so we can still look users up by sub.
    const username = resolvedEmail;
    let userExists = false;
    try {
      const listRes = await cognito.send(new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `email = "${resolvedEmail}"`
      }));
      userExists = (listRes.Users || []).length > 0;
    } catch(e) { /* user not found */ }
    if (!userExists) {
      const userAttrs = [
        { Name: 'email', Value: resolvedEmail },
        { Name: 'email_verified', Value: 'true' }
      ];
      if (firstName) userAttrs.push({ Name: 'given_name', Value: firstName });
      if (lastName)  userAttrs.push({ Name: 'family_name', Value: lastName });
      try {
        await cognito.send(new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          UserAttributes: userAttrs,
          MessageAction: 'SUPPRESS'
        }));
        console.log('[apple-exchange] Created new Cognito user:', username);
      } catch(e) {
        console.error('Apple AdminCreateUser error:', e);
        return respond(500, { error: 'Could not create account: ' + e.message });
      }
    } else {
      console.log('[apple-exchange] Existing Cognito user found:', username);
    }
    // Deterministic password tied to the stable Apple sub
    const tempPassword = `Ap!Apple${appleSub.slice(-8)}#Jwt`;
    try {
      await cognito.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: tempPassword,
        Permanent: true
      }));
    } catch(e) {
      console.error('Apple AdminSetUserPassword error:', e);
      return respond(500, { error: 'Could not authenticate: ' + e.message });
    }
    try {
      const authRes = await cognito.send(new AdminInitiateAuthCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: { USERNAME: username, PASSWORD: tempPassword }
      }));
      console.log('[apple-exchange] Auth success for:', username);
      return respond(200, {
        token:        authRes.AuthenticationResult.AccessToken,
        idToken:      authRes.AuthenticationResult.IdToken,
        refreshToken: authRes.AuthenticationResult.RefreshToken,
        isNewUser:    !userExists
      });
    } catch(e) {
      console.error('Apple AdminInitiateAuth error:', e);
      return respond(500, { error: 'Authentication failed: ' + e.message });
    }
  }

  // ── Auth: Google Social Exchange ──────────────────────────────────────────────
  // POST /api/auth/google-exchange
  // Body: { idToken: string, email?: string, firstName?: string, lastName?: string }
  // Verifies Google JWT payload, creates/finds Cognito user, returns Cognito tokens
  if (path === '/api/auth/google-exchange' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { idToken: googleIdToken, email: googleEmail, firstName, lastName } = body;
    if (!googleIdToken) return respond(400, { error: 'idToken is required.' });
    let googleSub, resolvedEmail;
    try {
      const parts = googleIdToken.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      googleSub = payload.sub;
      resolvedEmail = googleEmail || payload.email || `google_${googleSub}@gmail.com`;
      if (!payload.iss || (!payload.iss.includes('accounts.google.com') && !payload.iss.includes('cognito'))) {
        // Allow Cognito-issued tokens through (Google via Cognito Hosted UI)
        // If it's already a Cognito token, just use it directly
        if (payload.iss && payload.iss.includes('cognito')) {
          // Already a Cognito token — return it as-is
          return respond(200, { idToken: googleIdToken, token: googleIdToken, isNewUser: false });
        }
      }
      if (payload.exp < Math.floor(Date.now() / 1000) - 300) throw new Error('Token expired');
    } catch(e) {
      return respond(401, { error: 'Invalid Google identity token: ' + e.message });
    }
    const { AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');
    const USER_POOL_ID = 'us-east-2_cRdQiPSDK';
    const CLIENT_ID    = '1pude0u2krj3qbt48ij0igooeb';
    const username = `google_${googleSub}`;
    let userExists = false;
    try {
      const listRes = await cognito.send(new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `username = "${username}"`
      }));
      userExists = (listRes.Users || []).length > 0;
    } catch(e) { /* user not found */ }
    if (!userExists) {
      const userAttrs = [
        { Name: 'email', Value: resolvedEmail },
        { Name: 'email_verified', Value: 'true' }
      ];
      if (firstName) userAttrs.push({ Name: 'given_name', Value: firstName });
      if (lastName)  userAttrs.push({ Name: 'family_name', Value: lastName });
      try {
        await cognito.send(new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          UserAttributes: userAttrs,
          MessageAction: 'SUPPRESS'
        }));
      } catch(e) {
        console.error('Google AdminCreateUser error:', e);
        return respond(500, { error: 'Could not create account.' });
      }
    }
    const tempPassword = `Ap!Google${googleSub.slice(-8)}#Jwt`;
    try {
      await cognito.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: tempPassword,
        Permanent: true
      }));
    } catch(e) {
      console.error('Google AdminSetUserPassword error:', e);
      return respond(500, { error: 'Could not authenticate.' });
    }
    try {
      const authRes = await cognito.send(new AdminInitiateAuthCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: { USERNAME: username, PASSWORD: tempPassword }
      }));
      return respond(200, {
        token:        authRes.AuthenticationResult.AccessToken,
        idToken:      authRes.AuthenticationResult.IdToken,
        refreshToken: authRes.AuthenticationResult.RefreshToken,
        isNewUser:    !userExists
      });
    } catch(e) {
      console.error('Google AdminInitiateAuth error:', e);
      return respond(500, { error: 'Authentication failed.' });
    }
  }

  // ── Auth: Refresh Token ────────────────────────────────────────────────────
  // POST /api/auth/refresh
  // Body: { refreshToken }
  if (path === '/api/auth/refresh' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { refreshToken } = body;
    if (!refreshToken) return respond(400, { error: 'refreshToken required.' });
    try {
      const result = await cognito.send(new InitiateAuthCommand({
        ClientId: '1pude0u2krj3qbt48ij0igooeb',
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: { REFRESH_TOKEN: refreshToken }
      }));
      const auth = result.AuthenticationResult;
      if (!auth || !auth.AccessToken) return respond(401, { error: 'Token refresh failed.' });
      return respond(200, { token: auth.AccessToken, idToken: auth.IdToken || null });
    } catch(e) {
      console.error('Token refresh error:', e);
      const msg = (e.name === 'NotAuthorizedException') ? 'Invalid Refresh Token' : 'Token refresh failed.';
      return respond(401, { error: msg });
    }
  }

  // ── Admin helpers ────────────────────────────────────────────────────────────
  // Admin = token belongs to jessienrabe@gmail.com OR sub is registered in admin_config
  async function verifyAdmin(ev) {
    const tok = extractBearer(ev);
    if (!tok) return null;
    try {
      const u = await cognitoGetUser(tok);
      // Check email match (works for email/Google login)
      if (u.email && u.email.toLowerCase() === 'jessienrabe@gmail.com') return u;
      // Check against stored admin subs (works for Apple/phone login)
      const cfg = await dbGet('admin_config').catch(() => null);
      const adminData = cfg ? dbParse(cfg) : null;
      if (adminData && Array.isArray(adminData.adminSubs) && adminData.adminSubs.includes(u.sub)) return u;
      return null;
    } catch(e) { return null; }
  }

  // POST /api/admin/setup — call once while logged in to register your Cognito sub as admin
  if (path === '/api/admin/setup' && method === 'POST') {
    const tok = extractBearer(event);
    if (!tok) return respond(401, { error: 'No token.' });
    try {
      console.log('[admin/setup] token_prefix=' + (tok || '').slice(0,20));
      const u = await cognitoGetUser(tok);
      console.log('[admin/setup] user=' + JSON.stringify(u));
      const cfg = await dbGet('admin_config').catch(() => null);
      const adminData = cfg ? dbParse(cfg) : null;
      console.log('[admin/setup] adminData=' + JSON.stringify(adminData));
      const isEmailAdmin = u.email && u.email.toLowerCase() === 'jessienrabe@gmail.com';
      const isFirstSetup = !adminData || !adminData.adminSubs || adminData.adminSubs.length === 0;
      console.log('[admin/setup] isEmailAdmin=' + isEmailAdmin + ' isFirstSetup=' + isFirstSetup);
      if (!isEmailAdmin && !isFirstSetup) return respond(403, { error: 'Not authorized.' });
      const subs = adminData?.adminSubs || [];
      if (!subs.includes(u.sub)) subs.push(u.sub);
      await dbPut('admin_config', { adminSubs: subs, email: u.email, updatedAt: new Date().toISOString() });
      return respond(200, { success: true, sub: u.sub, email: u.email });
    } catch(e) { return respond(500, { error: 'Setup failed: ' + e.message }); }
  }

  // ── Admin: Provider Submissions ──────────────────────────────────────────────
  // GET /api/admin/submissions
  if (path === '/api/admin/submissions' && method === 'GET') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    try {
      const item = await dbGet('admin_provider_submissions');
      const data = dbParse(item) || { submissions: [] };
      return respond(200, { submissions: data.submissions || [] });
    } catch(e) { return respond(500, { error: 'Failed to fetch submissions.' }); }
  }

  // POST /api/admin/submissions  (public — called by caregivers on submit)
  if (path === '/api/admin/submissions' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    if (!body.providerName || !body.providerType || !body.specialty) {
      return respond(400, { error: 'providerName, providerType, and specialty are required.' });
    }
    try {
      const item = await dbGet('admin_provider_submissions');
      const data = dbParse(item) || { submissions: [] };
      const newSub = { ...body, id: `sub_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, status: 'pending_review', submittedAt: new Date().toISOString() };
      data.submissions.unshift(newSub);
      if (data.submissions.length > 2000) data.submissions.splice(2000);
      await dbPut('admin_provider_submissions', data);
      // Notify owner via SES
      try {
        const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
        const ses = new SESClient({ region: 'us-east-1' });
        await ses.send(new SendEmailCommand({
          Source: 'contact@autismpathways.app',
          Destination: { ToAddresses: ['contact@autismpathways.app'] },
          Message: {
            Subject: { Data: '🏥 New Provider Submission — Review Required' },
            Body: { Text: { Data: [
              'A new provider has been submitted for review.',
              '',
              `Provider: ${newSub.providerName}`,
              `Type: ${newSub.providerType}`,
              `Specialty: ${newSub.specialty}`,
              `State: ${newSub.state || 'Not provided'}`,
              `Submitted by: ${newSub.submittedBy || 'Anonymous'}`,
              `Time: ${newSub.submittedAt}`,
              '',
              'Open Admin Dashboard in the app to approve or decline.',
            ].join('\n') } }
          }
        }));
      } catch(sesErr) { console.error('[SES] submission notify failed:', sesErr?.name, sesErr?.message, JSON.stringify(sesErr)); }
      return respond(201, { submission: newSub });
    } catch(e) { return respond(500, { error: 'Failed to save submission.' }); }
  }

  // PUT /api/admin/submissions/:id  (admin only)
  if (path.startsWith('/api/admin/submissions/') && method === 'PUT') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    const subId = path.replace('/api/admin/submissions/', '');
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { status, adminNote } = body;
    if (!status || !['approved','declined'].includes(status)) return respond(400, { error: "status must be 'approved' or 'declined'" });
    try {
      const item = await dbGet('admin_provider_submissions');
      const data = dbParse(item) || { submissions: [] };
      const idx = data.submissions.findIndex(s => s.id === subId);
      if (idx === -1) return respond(404, { error: 'Submission not found.' });
      const updatedSub = { ...data.submissions[idx], status, adminNote: adminNote || null, reviewedAt: new Date().toISOString() };
      data.submissions[idx] = updatedSub;
      await dbPut('admin_provider_submissions', data);

      // If approved, add to the public provider directory
      if (status === 'approved') {
        try {
          const provItem = await dbGet('admin_registered_providers');
          const provData = dbParse(provItem) || { providers: [] };
          // Remove any existing entry for this submission to avoid duplicates
          provData.providers = provData.providers.filter(p => p.submissionId !== subId);
          provData.providers.unshift({
            id: `prov_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
            submissionId: subId,
            providerName: updatedSub.providerName,
            providerType: updatedSub.providerType || 'Provider',
            specialty: updatedSub.specialty,
            state: updatedSub.state || '',
            phone: updatedSub.phone || '',
            website: updatedSub.website || '',
            description: updatedSub.description || '',
            medicaidAccepted: updatedSub.medicaidAccepted || false,
            acceptingNew: updatedSub.acceptingPatients !== false,
            openToConnect: false, // provider must opt in via their own account
            tags: updatedSub.tags || [],
            approvedAt: new Date().toISOString(),
          });
          await dbPut('admin_registered_providers', provData);
          console.log('[admin/submissions] Approved and added to directory:', updatedSub.providerName);
        } catch(provErr) {
          console.error('[admin/submissions] Failed to add to directory:', provErr?.message);
          // Don't fail the whole request — submission status is already updated
        }
      }

      // If declined, remove from directory if it was previously approved
      if (status === 'declined') {
        try {
          const provItem = await dbGet('admin_registered_providers');
          const provData = dbParse(provItem) || { providers: [] };
          const before = provData.providers.length;
          provData.providers = provData.providers.filter(p => p.submissionId !== subId);
          if (provData.providers.length !== before) {
            await dbPut('admin_registered_providers', provData);
            console.log('[admin/submissions] Removed declined provider from directory:', subId);
          }
        } catch(provErr) {
          console.error('[admin/submissions] Failed to remove from directory:', provErr?.message);
        }
      }

      return respond(200, { success: true });
    } catch(e) { return respond(500, { error: 'Failed to update submission.' }); }
  }

  // ── Admin: Hardship Applications ─────────────────────────────────────────────
  // GET /api/admin/hardship
  if (path === '/api/admin/hardship' && method === 'GET') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    try {
      const item = await dbGet('admin_hardship_applications');
      const data = dbParse(item) || { applications: [] };
      return respond(200, { applications: data.applications || [] });
    } catch(e) { return respond(500, { error: 'Failed to fetch applications.' }); }
  }

  // POST /api/admin/hardship  (public — called by applicants on submit)
  if (path === '/api/admin/hardship' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    if (!body.email) return respond(400, { error: 'email is required.' });
    try {
      const item = await dbGet('admin_hardship_applications');
      const data = dbParse(item) || { applications: [] };
      const newApp = { ...body, id: `hrd_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, status: 'pending', submittedAt: new Date().toISOString() };
      data.applications.unshift(newApp);
      if (data.applications.length > 1000) data.applications.splice(1000);
      await dbPut('admin_hardship_applications', data);
      // Notify owner via SES
      try {
        const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
        const ses = new SESClient({ region: 'us-east-1' });
        await ses.send(new SendEmailCommand({
          Source: 'contact@autismpathways.app',
          Destination: { ToAddresses: ['contact@autismpathways.app'] },
          Message: {
            Subject: { Data: '💜 New Hardship Application — Review Required' },
            Body: { Text: { Data: [
              'A new hardship application has been submitted.',
              '',
              `Email: ${newApp.email}`,
              `Income: ${newApp.incomeLabel || newApp.income || 'Not provided'}`,
              `State: ${newApp.state || 'Not provided'}`,
              `Waiver Status: ${newApp.waiverStatus || 'Not provided'}`,
              `Time: ${newApp.submittedAt}`,
              '',
              'Open Admin Dashboard in the app to approve or decline.',
            ].join('\n') } }
          }
        }));
      } catch(sesErr) { console.error('[SES] hardship notify failed:', sesErr?.name, sesErr?.message, JSON.stringify(sesErr)); }
      return respond(201, { application: newApp });
    } catch(e) { return respond(500, { error: 'Failed to save application.' }); }
  }

  // PUT /api/admin/hardship/:id  (admin only)
  if (path.startsWith('/api/admin/hardship/') && method === 'PUT') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    const appId = path.replace('/api/admin/hardship/', '');
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { status, promoCode } = body;
    if (!status || !['approved','declined','pending'].includes(status)) return respond(400, { error: "status must be 'approved', 'declined', or 'pending'" });
    try {
      const item = await dbGet('admin_hardship_applications');
      const data = dbParse(item) || { applications: [] };
      const idx = data.applications.findIndex(a => a.id === appId);
      if (idx === -1) return respond(404, { error: 'Application not found.' });
      data.applications[idx] = { ...data.applications[idx], status, promoCode: promoCode || null, reviewedAt: new Date().toISOString() };
      await dbPut('admin_hardship_applications', data);
      return respond(200, { success: true });
    } catch(e) { return respond(500, { error: 'Failed to update application.' }); }
  }

  // ── Admin: Forum Reports ─────────────────────────────────────────────────────
  // GET /api/admin/forum-reports
  if (path === '/api/admin/forum-reports' && method === 'GET') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    try {
      const item = await dbGet('forum_reports');
      const data = dbParse(item) || { reports: [] };
      return respond(200, { reports: data.reports || [] });
    } catch(e) { return respond(500, { error: 'Failed to fetch reports.' }); }
  }

  // ── Admin: Forum Posts (all + admin delete) ──────────────────────────────────
  // GET /api/admin/forum-posts
  if (path === '/api/admin/forum-posts' && method === 'GET') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    try {
      const item = await dbGet('forum_posts');
      const data = dbParse(item);
      return respond(200, { posts: Array.isArray(data?.posts) ? data.posts : [] });
    } catch(e) { return respond(500, { error: 'Failed to fetch posts.' }); }
  }

  // DELETE /api/admin/forum-posts/:postId
  if (path.startsWith('/api/admin/forum-posts/') && method === 'DELETE') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    const postId = path.replace('/api/admin/forum-posts/', '');
    try {
      const item = await dbGet('forum_posts');
      const data = dbParse(item);
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      const updated = posts.filter(p => p.id !== postId);
      await dbPut('forum_posts', { posts: updated });
      try { await dbDelete(`forum_comments:${postId}`); } catch(_) {}
      return respond(200, { success: true, deleted: posts.length - updated.length });
    } catch(e) { return respond(500, { error: 'Failed to delete post.' }); }
  }

    // ── Admin: Self-registered Providers ────────────────────────────────────────
  // GET /api/admin/providers
  if (path === '/api/admin/providers' && method === 'GET') {
    const admin = await verifyAdmin(event);
    if (!admin) return respond(403, { error: 'Admin only.' });
    try {
      const item = await dbGet('admin_registered_providers');
      const data = dbParse(item) || { providers: [] };
      return respond(200, { providers: data.providers || [] });
    } catch(e) { return respond(500, { error: 'Failed to fetch providers.' }); }
  }

  // ── Cloud Sync (backup / restore) ─────────────────────────────────────────────
  // POST /api/sync/backup  — upserts a full AsyncStorage snapshot keyed by cognitoUserId
  if (path === '/api/sync/backup' && method === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { cognitoUserId, data } = body;
    if (!cognitoUserId || typeof data !== 'object' || data === null) {
      return respond(400, { error: 'cognitoUserId and data object are required.' });
    }
    const dataJson = JSON.stringify(data);
    if (Buffer.byteLength(dataJson, 'utf8') > 350000) {
      return respond(413, { error: 'Backup too large (max 350 KB for DynamoDB).' });
    }
    try {
      await dbPut(`sync:${cognitoUserId}`, { data, backedUpAt: new Date().toISOString() });
      return respond(200, { success: true, sizeBytes: Buffer.byteLength(dataJson, 'utf8') });
    } catch(e) { return respond(500, { error: 'Backup failed.' }); }
  }

  // GET /api/sync/restore?cognitoUserId=xxx
  if (path === '/api/sync/restore' && method === 'GET') {
    const qs = event.queryStringParameters || {};
    const cognitoUserId = qs.cognitoUserId;
    if (!cognitoUserId) return respond(400, { error: 'cognitoUserId is required.' });
    try {
      const item = await dbGet(`sync:${cognitoUserId}`);
      const stored = dbParse(item);
      if (!stored || !stored.data) return respond(200, { data: null });
      return respond(200, { data: stored.data, backedUpAt: stored.backedUpAt || null });
    } catch(e) { return respond(500, { error: 'Restore failed.' }); }
  }

  // ── Google Places Proxy ──────────────────────────────────────────────────
  const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

  // GET /api/places/autocomplete?input=...
  // Uses Places API (New) v1 — returns predictions in legacy-compatible format
  if (path === '/api/places/autocomplete' && method === 'GET') {
    const qs = event.queryStringParameters || {};
    const input = (qs.input || '').trim();
    if (!input || input.length < 2) return respond(200, { predictions: [] });
    if (!GMAPS_KEY) return respond(500, { error: 'Maps not configured.' });
    try {
      const reqBody = JSON.stringify({ input, includedRegionCodes: ['us'] });
      const data = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'places.googleapis.com',
          path: '/v1/places:autocomplete',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GMAPS_KEY,
            'Content-Length': Buffer.byteLength(reqBody),
          },
        }, res => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
        });
        req.on('error', reject);
        req.write(reqBody);
        req.end();
      });
      // Normalize to legacy predictions format for the app
      const predictions = (data.suggestions || []).map(s => {
        const p = s.placePrediction || {};
        return {
          place_id: p.placeId || '',
          description: p.text?.text || '',
          structured_formatting: {
            main_text: p.structuredFormat?.mainText?.text || '',
            secondary_text: p.structuredFormat?.secondaryText?.text || '',
          },
        };
      });
      return respond(200, { predictions, status: data.error ? 'ERROR' : 'OK' });
    } catch(e) { return respond(500, { error: 'Places autocomplete failed.' }); }
  }

  // GET /api/places/details?place_id=...
  // Uses Places API (New) v1 — returns result in legacy-compatible format
  if (path === '/api/places/details' && method === 'GET') {
    const qs = event.queryStringParameters || {};
    const placeId = qs.place_id || '';
    if (!placeId) return respond(400, { error: 'place_id required.' });
    if (!GMAPS_KEY) return respond(500, { error: 'Maps not configured.' });
    try {
      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=addressComponents,formattedAddress,location`;
      const data = await new Promise((resolve, reject) => {
        https.get(url, { headers: { 'X-Goog-Api-Key': GMAPS_KEY } }, res => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
        }).on('error', reject);
      });
      // Normalize to legacy address_components format
      const address_components = (data.addressComponents || []).map(c => ({
        long_name: c.longText || '',
        short_name: c.shortText || '',
        types: c.types || [],
      }));
      return respond(200, {
        result: {
          address_components,
          formatted_address: data.formattedAddress || '',
          geometry: data.location ? { location: { lat: data.location.latitude, lng: data.location.longitude } } : null,
        },
        status: data.error ? 'ERROR' : 'OK',
      });
    } catch(e) { return respond(500, { error: 'Places details failed.' }); }
  }

  // ── Provider Self-Registration ───────────────────────────────────────────────
  // POST /api/providers/register  (auth required)
  if (path === '/api/providers/register' && method === 'POST') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Sign in to register as a provider.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { deviceId, providerName, specialty, state, city, county, bio, medicaidAccepted, telehealth, acceptingNew, openToConnect, tags } = body;
    if (!providerName || !specialty) return respond(400, { error: 'providerName and specialty are required.' });
    try {
      const item = await dbGet('admin_registered_providers');
      const data = dbParse(item) || { providers: [] };
      const providers = Array.isArray(data.providers) ? data.providers : [];
      // Upsert by deviceId or userSub
      const idx = providers.findIndex(p => p.deviceId === deviceId || p.userSub === user.sub);
      const providerDoc = {
        id: idx >= 0 ? providers[idx].id : `prov_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
        deviceId: deviceId || null,
        userSub: user.sub,
        userEmail: user.email,
        providerName: providerName.trim(),
        specialty,
        state: state || null,
        city: city || null,
        county: county || null,
        bio: bio || null,
        medicaidAccepted: !!medicaidAccepted,
        telehealth: !!telehealth,
        acceptingNew: acceptingNew !== false,
        openToConnect: !!openToConnect,
        tags: Array.isArray(tags) ? tags : [],
        lastSeenAt: new Date().toISOString(),
        registeredAt: idx >= 0 ? providers[idx].registeredAt : new Date().toISOString(),
      };
      if (idx >= 0) providers[idx] = providerDoc;
      else providers.unshift(providerDoc);
      if (providers.length > 2000) providers.splice(2000);
      await dbPut('admin_registered_providers', { providers });
      // Notify owner via SES if openToConnect is true
      if (openToConnect) {
        try {
          const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
          const ses = new SESClient({ region: 'us-east-1' });
          await ses.send(new SendEmailCommand({
            Source: 'contact@autismpathways.app',
            Destination: { ToAddresses: ['contact@autismpathways.app'] },
            Message: {
              Subject: { Data: '🏥 New Provider Ready to Connect — Action Required' },
              Body: { Text: { Data: [
                'A provider has registered and is ready to connect with families.',
                '',
                `Name: ${providerName}`,
                `Specialty: ${specialty}`,
                `State: ${state || 'Not set'}`,
                `Email: ${user.email}`,
                `Medicaid: ${medicaidAccepted ? 'Yes' : 'No'}`,
                `Telehealth: ${telehealth ? 'Yes' : 'No'}`,
                `Accepting New: ${acceptingNew !== false ? 'Yes' : 'No'}`,
                '',
                'Review in Admin Dashboard → Settings → Admin → Admin Dashboard',
              ].join('\n') } }
            }
          }));
        } catch(sesErr) { console.error('[SES] send failed:', sesErr?.name, sesErr?.message, JSON.stringify(sesErr)); }
      }
      return respond(200, { success: true, provider: providerDoc });
    } catch(e) { return respond(500, { error: 'Could not save provider profile.' }); }
  }

  // PUT /api/providers/availability  (auth required)
  if (path === '/api/providers/availability' && method === 'PUT') {
    const token = extractBearer(event);
    if (!token) return respond(401, { error: 'Auth required.' });
    let user;
    try { user = await cognitoGetUser(token); } catch(e) { return respond(401, { error: 'Invalid token.' }); }
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch(e) { return respond(400, { error: 'Invalid JSON.' }); }
    const { deviceId, openToConnect } = body;
    try {
      const item = await dbGet('admin_registered_providers');
      const data = dbParse(item) || { providers: [] };
      const providers = Array.isArray(data.providers) ? data.providers : [];
      const idx = providers.findIndex(p => p.deviceId === deviceId || p.userSub === user.sub);
      if (idx < 0) return respond(404, { error: 'Provider not found.' });
      const wasOpen = providers[idx].openToConnect;
      providers[idx].openToConnect = !!openToConnect;
      providers[idx].lastSeenAt = new Date().toISOString();
      await dbPut('admin_registered_providers', { providers });
      // Notify owner when toggling TO open
      if (!wasOpen && openToConnect) {
        try {
          const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
          const ses = new SESClient({ region: 'us-east-1' });
          await ses.send(new SendEmailCommand({
            Source: 'contact@autismpathways.app',
            Destination: { ToAddresses: ['contact@autismpathways.app'] },
            Message: {
              Subject: { Data: '📡 Provider Now Open to Connect' },
              Body: { Text: { Data: `${providers[idx].providerName} (${providers[idx].userEmail}) has turned on Open to Connect.` } }
            }
          }));
        } catch(sesErr) { console.error('[SES] send failed:', sesErr?.name, sesErr?.message, JSON.stringify(sesErr)); }
      }
      return respond(200, { success: true });
    } catch(e) { return respond(500, { error: 'Could not update availability.' }); }
  }

  // GET /api/providers/available  — public directory
  if (path === '/api/providers/available' && method === 'GET') {
    try {
      const qs = event.queryStringParameters || {};
      const filterState = qs.state;
      const filterSpecialty = qs.specialty;

      // Self-registered providers who are open to connect
      const regItem = await dbGet('admin_registered_providers');
      const regData = dbParse(regItem) || { providers: [] };
      const selfRegistered = (Array.isArray(regData.providers) ? regData.providers : []).filter(p => p.openToConnect);

      // Admin-approved submissions (always shown in directory)
      const subItem = await dbGet('admin_provider_submissions');
      const subData = dbParse(subItem) || { submissions: [] };
      const approvedSubs = (Array.isArray(subData.submissions) ? subData.submissions : [])
        .filter(s => s.status === 'approved')
        .map(s => ({
          id: s.id,
          submissionId: s.id,
          providerName: s.providerName,
          providerType: s.providerType || 'Provider',
          specialty: s.specialty,
          state: s.state || '',
          phone: s.phone || '',
          website: s.website || '',
          description: s.description || '',
          medicaidAccepted: s.medicaidAccepted || false,
          acceptingNew: s.acceptingPatients !== false,
          openToConnect: false,
          tags: s.tags || [],
          approvedAt: s.reviewedAt || s.submittedAt,
          source: 'admin_approved',
        }));

      // Merge: approved submissions first, then self-registered open-to-connect
      // Deduplicate by submissionId to avoid double-listing
      const approvedIds = new Set(approvedSubs.map(s => s.submissionId));
      const filteredSelf = selfRegistered.filter(p => !approvedIds.has(p.submissionId));
      let providers = [...approvedSubs, ...filteredSelf];

      if (filterState) providers = providers.filter(p => p.state === filterState);
      if (filterSpecialty) providers = providers.filter(p => p.specialty === filterSpecialty);
      return respond(200, providers);
    } catch(e) { return respond(500, { error: 'Could not fetch providers.' }); }
  }

  return respond(404, { error: 'Not found.' });
};
