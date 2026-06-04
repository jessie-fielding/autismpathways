import React, { useState, useMemo } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';

type AcceptanceLevel = 'accepted' | 'case-by-case' | 'not-accepted' | 'unknown';

type StatePolicy = {
  state: string;
  code: string;
  acceptance: AcceptanceLevel;
  policyNote: string;
  advocacyTip: string;
  legalBasis: string;
  ptaContact: string | null;
  ptaUrl: string | null;
  seaUrl: string | null;
};

const TELEHEALTH_POLICIES: StatePolicy[] = [
  { state: 'Alabama', code: 'AL', acceptance: 'case-by-case', policyNote: 'Alabama does not have a statewide mandate. Districts may accept or reject telehealth evaluations at their discretion. Urban districts (Jefferson, Madison) tend to be more accepting than rural ones.', advocacyTip: 'Request the district\'s written policy on IEE (Independent Educational Evaluation) and ask specifically whether telehealth evaluations from licensed psychologists qualify. If denied, cite IDEA §300.502.', legalBasis: 'IDEA §300.502 — IEE rights. Alabama Admin. Code r. 290-8-9-.05.', ptaContact: 'Alabama Parent Education Center', ptaUrl: 'https://www.alabamaparentcenter.com', seaUrl: 'https://www.alsde.edu/sec/ses' },
  { state: 'Alaska', code: 'AK', acceptance: 'accepted', policyNote: 'Alaska actively encourages telehealth evaluations given the state\'s geography. The Alaska Department of Education has issued guidance supporting telehealth-based evaluations for IEP eligibility, especially for rural and remote communities.', advocacyTip: 'Reference the Alaska DOE telehealth guidance document when submitting your evaluation. Most districts will accept without pushback.', legalBasis: 'Alaska Admin. Code 4 AAC 52.540. AK DOE Telehealth Guidance (2021).', ptaContact: 'PARENTS Inc.', ptaUrl: 'https://www.parentsinc.org', seaUrl: 'https://education.alaska.gov/sped' },
  { state: 'Arizona', code: 'AZ', acceptance: 'accepted', policyNote: 'Arizona has strong telehealth infrastructure and most districts accept telehealth evaluations. The AZ Dept of Education supports telehealth as an equivalent evaluation method when conducted by licensed professionals.', advocacyTip: 'Ensure your evaluator is AZ-licensed. Attach a copy of their license to the evaluation report when submitting to the district.', legalBasis: 'ARS §15-766. AZ State Board of Psychologist Examiners telehealth rules.', ptaContact: 'Raising Special Kids', ptaUrl: 'https://raisingspecialkids.org', seaUrl: 'https://www.azed.gov/specialeducation' },
  { state: 'Arkansas', code: 'AR', acceptance: 'case-by-case', policyNote: 'Arkansas has no statewide telehealth evaluation policy for IEP purposes. Acceptance varies significantly by district. Larger districts (Little Rock, Fayetteville) are generally more accepting.', advocacyTip: 'Ask the district\'s special ed director in writing whether they accept telehealth IEEs. If they say no, request the specific legal basis for the rejection — they must provide one under IDEA.', legalBasis: 'IDEA §300.502. AR Special Education Rules, Section 5.', ptaContact: 'Arkansas PANDA', ptaUrl: 'https://www.arkansaspanda.org', seaUrl: 'https://dese.ade.arkansas.gov/Offices/special-education' },
  { state: 'California', code: 'CA', acceptance: 'accepted', policyNote: 'California is one of the most telehealth-friendly states for IEP evaluations. The CA Dept of Education issued explicit guidance during COVID that telehealth evaluations are valid and this has become standard practice. Most districts accept without question.', advocacyTip: 'California parents have strong IEP rights. If a district pushes back, contact your local SELPA (Special Education Local Plan Area) directly.', legalBasis: 'CA Ed. Code §56320. CDE Guidance on Telehealth Assessments (2020, extended 2023).', ptaContact: 'DREDF / Matrix Parent Network', ptaUrl: 'https://www.matrixparents.org', seaUrl: 'https://www.cde.ca.gov/sp/se' },
  { state: 'Colorado', code: 'CO', acceptance: 'accepted', policyNote: 'Colorado supports telehealth evaluations for IEP eligibility. The CO Dept of Education has guidance supporting remote assessments by licensed professionals. Most districts in the Denver metro and Front Range accept readily.', advocacyTip: 'Colorado has a strong parent advocacy network. PEAK Parent Center can help if your district is resistant.', legalBasis: 'C.R.S. §22-20-108. CDE Special Education Guidance.', ptaContact: 'PEAK Parent Center', ptaUrl: 'https://www.peakparent.org', seaUrl: 'https://www.cde.state.co.us/cdesped' },
  { state: 'Connecticut', code: 'CT', acceptance: 'accepted', policyNote: 'Connecticut has strong telehealth laws and most districts accept telehealth evaluations. The CT State Dept of Education supports remote evaluations by licensed professionals.', advocacyTip: 'CT parents have robust procedural safeguards. SERC (Special Education Resource Center) is an excellent free resource.', legalBasis: 'CGS §10-76d. CT SDE Special Education Guidance.', ptaContact: 'CT Parent Advocacy Center (CPAC)', ptaUrl: 'https://www.cpacinc.org', seaUrl: 'https://portal.ct.gov/SDE/Special-Education' },
  { state: 'Delaware', code: 'DE', acceptance: 'case-by-case', policyNote: 'Delaware is a small state with relatively centralized special education administration. Telehealth acceptance varies by district. The DE DOE has not issued a blanket policy.', advocacyTip: 'Contact the DE DOE\'s Exceptional Children & Early Childhood Education office directly to ask about district-specific policies before scheduling an evaluation.', legalBasis: 'DE Admin. Code 14-922. IDEA §300.502.', ptaContact: 'Parent Information Center of Delaware (PIC)', ptaUrl: 'https://www.picofdel.org', seaUrl: 'https://www.doe.k12.de.us/domain/390' },
  { state: 'Florida', code: 'FL', acceptance: 'case-by-case', policyNote: 'Florida has a patchwork of district policies. Larger districts (Miami-Dade, Broward, Palm Beach, Hillsborough) generally accept telehealth evaluations. Smaller rural districts are more variable. Florida does not have a statewide mandate.', advocacyTip: 'Florida has a strong IEE process. If denied, immediately request an IEE at public expense and ensure the evaluator is FL-licensed. The FL DOE has an ombudsman for disputes.', legalBasis: 'FAC 6A-6.0331. IDEA §300.502. FL Statute §1003.57.', ptaContact: 'Family Network on Disabilities', ptaUrl: 'https://www.fndfl.org', seaUrl: 'https://www.fldoe.org/academics/exceptional-student-edu' },
  { state: 'Georgia', code: 'GA', acceptance: 'case-by-case', policyNote: 'Georgia does not have a statewide telehealth evaluation policy for IEP purposes. District acceptance varies widely. Metro Atlanta districts tend to be more accepting than rural districts.', advocacyTip: 'Georgia Parents\' Educational Advocacy Center (GPAC) is a great resource. Always get district responses in writing.', legalBasis: 'GA Rule 160-4-7-.05. IDEA §300.502.', ptaContact: 'Georgia Parent Mentor Partnership', ptaUrl: 'https://www.parentmentors.org', seaUrl: 'https://www.gadoe.org/Curriculum-Instruction-and-Assessment/Special-Education-Services' },
  { state: 'Hawaii', code: 'HI', acceptance: 'accepted', policyNote: 'Hawaii has a single statewide school district (unique in the US) and has embraced telehealth evaluations, particularly for neighbor island families who would otherwise travel to Oahu. The HI DOE actively supports telehealth assessments.', advocacyTip: 'Hawaii has a consent decree (Felix Consent Decree) that gives parents strong rights. The Hawaii Disability Rights Center can assist with any disputes.', legalBasis: 'HAR §8-60. Hawaii DOE Special Education Policy.', ptaContact: 'Hawaii Disability Rights Center', ptaUrl: 'https://www.hawaiidisabilityrights.org', seaUrl: 'https://www.hawaiipublicschools.org/TeachingAndLearning/SpecialEducation' },
  { state: 'Idaho', code: 'ID', acceptance: 'case-by-case', policyNote: 'Idaho has no statewide telehealth evaluation policy. Rural districts often struggle with access to evaluators, making telehealth practically necessary, but formal acceptance policies are inconsistent.', advocacyTip: 'Idaho Parents Unlimited (IPUL) can help navigate district resistance. Emphasize access barriers when advocating for telehealth acceptance.', legalBasis: 'IDAPA 08.02.03.096. IDEA §300.502.', ptaContact: 'Idaho Parents Unlimited (IPUL)', ptaUrl: 'https://www.ipulidaho.org', seaUrl: 'https://www.sde.idaho.gov/sped' },
  { state: 'Illinois', code: 'IL', acceptance: 'accepted', policyNote: 'Illinois has strong telehealth laws and most districts accept telehealth evaluations. The IL State Board of Education has issued guidance supporting remote assessments. Chicago and suburban districts are very accepting.', advocacyTip: 'Equip for Equality is Illinois\'s protection & advocacy organization and can assist with IEP disputes.', legalBasis: '105 ILCS 5/14-8.02. ISBE Special Education Guidance.', ptaContact: 'Designs for Change / Equip for Equality', ptaUrl: 'https://www.equipforequality.org', seaUrl: 'https://www.isbe.net/Pages/Special-Education.aspx' },
  { state: 'Indiana', code: 'IN', acceptance: 'case-by-case', policyNote: 'Indiana does not have a statewide telehealth evaluation mandate for IEP purposes. Acceptance varies by district. Indianapolis metro districts tend to be more accepting.', advocacyTip: 'IN*SOURCE (Indiana Resource Center for Families with Special Needs) is an excellent free advocacy resource.', legalBasis: '511 IAC 7-40-4. IDEA §300.502.', ptaContact: 'IN*SOURCE', ptaUrl: 'https://www.insource.org', seaUrl: 'https://www.doe.in.gov/specialed' },
  { state: 'Iowa', code: 'IA', acceptance: 'accepted', policyNote: 'Iowa has embraced telehealth evaluations, particularly for rural families. The Iowa DOE supports telehealth as an equivalent evaluation method and most AEAs (Area Education Agencies) accept telehealth reports.', advocacyTip: 'Iowa\'s AEA system is unique — your AEA is often the first point of contact, not the district. Contact your regional AEA for guidance.', legalBasis: 'Iowa Code §256B. Iowa DOE Special Education Guidance.', ptaContact: 'Iowa Compass / RISP', ptaUrl: 'https://iowacompass.org', seaUrl: 'https://educateiowa.gov/pk-12/special-education' },
  { state: 'Kansas', code: 'KS', acceptance: 'case-by-case', policyNote: 'Kansas has no statewide telehealth evaluation policy. District acceptance is inconsistent. Wichita and Johnson County districts are generally more accepting.', advocacyTip: 'Families Together (Kansas PTI) is a strong advocacy resource. Always request the district\'s written evaluation procedures before scheduling.', legalBasis: 'K.A.R. 91-40-1. IDEA §300.502.', ptaContact: 'Families Together', ptaUrl: 'https://familiestogetherinc.org', seaUrl: 'https://www.ksde.org/Agency/Division-of-Learning-Services/Special-Education-and-Title-Services' },
  { state: 'Kentucky', code: 'KY', acceptance: 'case-by-case', policyNote: 'Kentucky does not have a statewide telehealth evaluation mandate. Rural districts, which make up a large portion of Kentucky, often struggle with evaluator access but formal telehealth policies are inconsistent.', advocacyTip: 'Kentucky SPIN (Special Parent Involvement Network) can help advocate for telehealth acceptance, especially in rural districts.', legalBasis: '707 KAR 1:340. IDEA §300.502.', ptaContact: 'Kentucky SPIN', ptaUrl: 'https://www.kyspin.com', seaUrl: 'https://education.ky.gov/specialed' },
  { state: 'Louisiana', code: 'LA', acceptance: 'case-by-case', policyNote: 'Louisiana has no statewide telehealth evaluation policy for IEP purposes. New Orleans and Baton Rouge districts tend to be more accepting. Rural parishes are more variable.', advocacyTip: 'Families Helping Families of Louisiana is a statewide network with regional centers that can assist with district advocacy.', legalBasis: 'LAC 28:XLIII.507. IDEA §300.502.', ptaContact: 'Families Helping Families of Louisiana', ptaUrl: 'https://www.fhflouisiana.org', seaUrl: 'https://www.louisianabelieves.com/schools/special-populations' },
  { state: 'Maine', code: 'ME', acceptance: 'accepted', policyNote: 'Maine actively supports telehealth evaluations, especially for rural communities. The Maine DOE has issued guidance supporting remote assessments and most districts accept without issue.', advocacyTip: 'Maine Parent Federation is a strong resource. Maine\'s rural geography makes telehealth particularly important and districts generally understand this.', legalBasis: 'Me. Code R. 05-071 Ch. 101. Maine DOE Telehealth Guidance.', ptaContact: 'Maine Parent Federation', ptaUrl: 'https://www.mpf.org', seaUrl: 'https://www.maine.gov/doe/learning/specialed' },
  { state: 'Maryland', code: 'MD', acceptance: 'accepted', policyNote: 'Maryland has strong telehealth laws and most districts accept telehealth evaluations. The MD State Dept of Education supports remote assessments. Montgomery and Prince George\'s counties are particularly accepting.', advocacyTip: 'The Maryland Disability Law Center and The Parents\' Place of Maryland are excellent resources for IEP disputes.', legalBasis: 'COMAR 13A.05.01. MD MSDE Special Education Guidance.', ptaContact: 'The Parents\' Place of Maryland', ptaUrl: 'https://www.ppmd.org', seaUrl: 'https://marylandpublicschools.org/programs/Pages/Special-Education' },
  { state: 'Massachusetts', code: 'MA', acceptance: 'accepted', policyNote: 'Massachusetts has some of the strongest special education laws in the country (Chapter 766) and most districts accept telehealth evaluations. The MA DESE has issued explicit guidance supporting remote assessments.', advocacyTip: 'FCSN (Federation for Children with Special Needs) is an outstanding resource. MA parents have 3-year evaluation cycles and strong IEE rights.', legalBasis: 'M.G.L. c. 71B. 603 CMR 28.00. MA DESE Telehealth Guidance.', ptaContact: 'Federation for Children with Special Needs (FCSN)', ptaUrl: 'https://fcsn.org', seaUrl: 'https://www.doe.mass.edu/sped' },
  { state: 'Michigan', code: 'MI', acceptance: 'case-by-case', policyNote: 'Michigan does not have a statewide telehealth evaluation mandate. Acceptance varies by district. Detroit metro and Grand Rapids districts tend to be more accepting. Rural UP districts are more variable.', advocacyTip: 'CAUSE (Citizens Alliance to Uphold Special Education) is Michigan\'s PTI and can help with district advocacy.', legalBasis: 'Mich. Admin. Code R. 340.1721. IDEA §300.502.', ptaContact: 'CAUSE Michigan', ptaUrl: 'https://causeonline.org', seaUrl: 'https://www.michigan.gov/mde/services/specialed' },
  { state: 'Minnesota', code: 'MN', acceptance: 'accepted', policyNote: 'Minnesota has strong telehealth infrastructure and most districts accept telehealth evaluations. The MN DOE supports remote assessments, particularly for Greater Minnesota families.', advocacyTip: 'PACER Center (based in Minneapolis) is one of the nation\'s leading parent advocacy organizations and is an excellent resource.', legalBasis: 'Minn. Stat. §125A.56. MDE Special Education Guidance.', ptaContact: 'PACER Center', ptaUrl: 'https://www.pacer.org', seaUrl: 'https://education.mn.gov/MDE/dse/sped' },
  { state: 'Mississippi', code: 'MS', acceptance: 'case-by-case', policyNote: 'Mississippi has limited telehealth infrastructure and no statewide IEP evaluation telehealth policy. District acceptance is inconsistent. Jackson and Hattiesburg districts are more accepting than rural districts.', advocacyTip: 'Mississippi Parent Training and Information Center (MPTIC) can assist with advocacy. Emphasize IDEA\'s requirement that evaluations be conducted in a timely manner regardless of method.', legalBasis: 'MS Spec. Ed. Regulations Part 3. IDEA §300.502.', ptaContact: 'Mississippi Parent Training and Information Center', ptaUrl: 'https://www.mptic.org', seaUrl: 'https://www.mdek12.org/OSE' },
  { state: 'Missouri', code: 'MO', acceptance: 'case-by-case', policyNote: 'Missouri has no statewide telehealth evaluation policy. Kansas City and St. Louis metro districts are generally more accepting. Rural districts are more variable.', advocacyTip: 'Missouri Parents Act (MPACT) is the state PTI and can help navigate district resistance.', legalBasis: '5 CSR 20-100.210. IDEA §300.502.', ptaContact: 'Missouri Parents Act (MPACT)', ptaUrl: 'https://www.ptimpact.org', seaUrl: 'https://dese.mo.gov/special-education' },
  { state: 'Montana', code: 'MT', acceptance: 'accepted', policyNote: 'Montana actively supports telehealth evaluations given the state\'s rural geography. The Montana OPI (Office of Public Instruction) supports remote assessments and most districts accept, recognizing the practical necessity.', advocacyTip: 'Montana has a strong rural advocacy network. Parents Let\'s Unite for Kids (PLUK) is the state PTI.', legalBasis: 'ARM 10.16.3346. Montana OPI Special Education Guidance.', ptaContact: 'Parents Let\'s Unite for Kids (PLUK)', ptaUrl: 'https://www.pluk.org', seaUrl: 'https://opi.mt.gov/Educators/Teaching-Learning/Special-Education' },
  { state: 'Nebraska', code: 'NE', acceptance: 'case-by-case', policyNote: 'Nebraska has no statewide telehealth evaluation mandate. Omaha and Lincoln districts are generally accepting. Rural districts are more variable.', advocacyTip: 'Nebraska PTI (PTI Nebraska) can help with advocacy. Nebraska has a strong mediation program for IEP disputes.', legalBasis: 'Nebraska Spec. Ed. Regulations 92 NAC 51. IDEA §300.502.', ptaContact: 'PTI Nebraska', ptaUrl: 'https://www.pti-nebraska.org', seaUrl: 'https://www.education.ne.gov/sped' },
  { state: 'Nevada', code: 'NV', acceptance: 'accepted', policyNote: 'Nevada has strong telehealth laws and most districts accept telehealth evaluations. Clark County (Las Vegas) and Washoe County (Reno) are both generally accepting. Nevada DOE supports remote assessments.', advocacyTip: 'Nevada PEP (Parent Education Program) is the state PTI and a strong resource.', legalBasis: 'NAC 388.330. Nevada DOE Special Education Guidance.', ptaContact: 'Nevada PEP', ptaUrl: 'https://www.nvpep.org', seaUrl: 'https://doe.nv.gov/Students_Families/Special_Education' },
  { state: 'New Hampshire', code: 'NH', acceptance: 'accepted', policyNote: 'New Hampshire supports telehealth evaluations and most districts accept remote assessments. The NH DOE has issued guidance supporting telehealth as an equivalent evaluation method.', advocacyTip: 'Parent Information Center (PIC NH) is the state PTI and an excellent resource for IEP advocacy.', legalBasis: 'N.H. Code Admin. R. Ed 1109. NH DOE Special Education Guidance.', ptaContact: 'Parent Information Center (PIC NH)', ptaUrl: 'https://www.picnh.org', seaUrl: 'https://www.education.nh.gov/instruction/special-ed' },
  { state: 'New Jersey', code: 'NJ', acceptance: 'accepted', policyNote: 'New Jersey has strong telehealth laws and most districts accept telehealth evaluations. The NJ DOE has issued explicit guidance supporting remote assessments. NJ has some of the most robust special education regulations in the country.', advocacyTip: 'SPAN (Statewide Parent Advocacy Network) is one of the nation\'s strongest PTIs and an outstanding resource.', legalBasis: 'N.J.A.C. 6A:14-3.4. NJ DOE Telehealth Guidance.', ptaContact: 'SPAN (Statewide Parent Advocacy Network)', ptaUrl: 'https://spanadvocacy.org', seaUrl: 'https://www.nj.gov/education/specialed' },
  { state: 'New Mexico', code: 'NM', acceptance: 'accepted', policyNote: 'New Mexico actively supports telehealth evaluations, especially for rural and tribal communities. The NM PED (Public Education Department) supports remote assessments and most districts accept.', advocacyTip: 'EPICS (Education for Parents of Indian Children with Special Needs) serves tribal communities. Parents Reaching Out (PRO) is the general state PTI.', legalBasis: 'NMAC 6.31.2. NM PED Special Education Guidance.', ptaContact: 'Parents Reaching Out (PRO)', ptaUrl: 'https://www.parentsreachingout.org', seaUrl: 'https://webnew.ped.state.nm.us/bureaus/special-education' },
  { state: 'New York', code: 'NY', acceptance: 'accepted', policyNote: 'New York has strong telehealth laws and most districts accept telehealth evaluations. The NYSED has issued explicit guidance supporting remote assessments. NYC and suburban districts are very accepting.', advocacyTip: 'Advocates for Children of New York is an outstanding resource, especially for NYC families. INCLUDEnyc serves NYC families specifically.', legalBasis: '8 NYCRR Part 200. NYSED Telehealth Guidance.', ptaContact: 'Advocates for Children of New York', ptaUrl: 'https://www.advocatesforchildren.org', seaUrl: 'http://www.p12.nysed.gov/specialed' },
  { state: 'North Carolina', code: 'NC', acceptance: 'case-by-case', policyNote: 'North Carolina has no statewide telehealth evaluation mandate for IEP purposes. Charlotte-Mecklenburg, Wake County, and Guilford County tend to be more accepting. Rural districts are more variable.', advocacyTip: 'Exceptional Children\'s Assistance Center (ECAC) is the NC PTI and an excellent resource.', legalBasis: '16 NCAC 6D .0503. IDEA §300.502.', ptaContact: 'Exceptional Children\'s Assistance Center (ECAC)', ptaUrl: 'https://www.ecacmail.org', seaUrl: 'https://www.dpi.nc.gov/students-families/exceptional-children' },
  { state: 'North Dakota', code: 'ND', acceptance: 'accepted', policyNote: 'North Dakota actively supports telehealth evaluations given the state\'s rural geography. The ND DOE supports remote assessments and most districts accept, recognizing the practical necessity for rural families.', advocacyTip: 'Pathfinder Services of ND is the state PTI. North Dakota\'s rural nature means districts are generally pragmatic about telehealth.', legalBasis: 'N.D. Admin. Code 67.1-02-01. ND DOE Special Education Guidance.', ptaContact: 'Pathfinder Services of ND', ptaUrl: 'https://www.pathfinder-nd.org', seaUrl: 'https://www.nd.gov/dpi/families/special-education' },
  { state: 'Ohio', code: 'OH', acceptance: 'case-by-case', policyNote: 'Ohio has no statewide telehealth evaluation mandate. Columbus, Cleveland, and Cincinnati metro districts tend to be more accepting. Rural districts are more variable. Ohio has a strong IEE process.', advocacyTip: 'Ohio Coalition for the Education of Children with Disabilities (OCECD) is the state PTI and an excellent resource.', legalBasis: 'OAC 3301-51-05. IDEA §300.502.', ptaContact: 'Ohio Coalition for the Education of Children with Disabilities (OCECD)', ptaUrl: 'https://www.ocecd.org', seaUrl: 'https://education.ohio.gov/Topics/Special-Education' },
  { state: 'Oklahoma', code: 'OK', acceptance: 'case-by-case', policyNote: 'Oklahoma has no statewide telehealth evaluation policy for IEP purposes. Oklahoma City and Tulsa metro districts are more accepting. Rural districts are more variable.', advocacyTip: 'Oklahoma Parents Center (OPC) is the state PTI. Oklahoma has a strong mediation program for IEP disputes.', legalBasis: 'OAC 210:10-13-3. IDEA §300.502.', ptaContact: 'Oklahoma Parents Center (OPC)', ptaUrl: 'https://www.oklahomaparentscenter.org', seaUrl: 'https://sde.ok.gov/special-education' },
  { state: 'Oregon', code: 'OR', acceptance: 'accepted', policyNote: 'Oregon has strong telehealth laws and most districts accept telehealth evaluations. The Oregon DOE has issued guidance supporting remote assessments. Portland metro and Eugene districts are very accepting.', advocacyTip: 'Oregon Developmental Disabilities Coalition and Oregon SPED Advocacy are strong resources. Oregon has robust procedural safeguards.', legalBasis: 'OAR 581-015-2000. Oregon DOE Special Education Guidance.', ptaContact: 'Oregon Family Support Network', ptaUrl: 'https://www.ofsn.org', seaUrl: 'https://www.oregon.gov/ode/students-and-family/specialeducation' },
  { state: 'Pennsylvania', code: 'PA', acceptance: 'case-by-case', policyNote: 'Pennsylvania has no statewide telehealth evaluation mandate. Philadelphia and Pittsburgh metro districts tend to be more accepting. Rural districts are more variable. PA has a strong IEE process.', advocacyTip: 'PEAL Center is the Pittsburgh-area PTI; HUNE serves Philadelphia. Both are excellent resources for IEP advocacy.', legalBasis: '22 Pa. Code §14.123. IDEA §300.502.', ptaContact: 'PEAL Center', ptaUrl: 'https://www.pealcenter.org', seaUrl: 'https://www.education.pa.gov/K-12/Special%20Education' },
  { state: 'Rhode Island', code: 'RI', acceptance: 'accepted', policyNote: 'Rhode Island is a small, urban state with strong telehealth laws. Most districts accept telehealth evaluations. The RI DOE supports remote assessments.', advocacyTip: 'Rhode Island Parent Information Network (RIPIN) is the state PTI and an excellent resource.', legalBasis: 'R.I. Gen. Laws §16-24-1. RI DOE Special Education Guidance.', ptaContact: 'Rhode Island Parent Information Network (RIPIN)', ptaUrl: 'https://ripin.org', seaUrl: 'https://www.ride.ri.gov/StudentsFamilies/SpecialEducation' },
  { state: 'South Carolina', code: 'SC', acceptance: 'case-by-case', policyNote: 'South Carolina has no statewide telehealth evaluation mandate. Charleston, Columbia, and Greenville districts tend to be more accepting. Rural districts are more variable.', advocacyTip: 'PRO-Parents of South Carolina is the state PTI. SC has a strong dispute resolution process.', legalBasis: 'S.C. Code Regs. 43-243. IDEA §300.502.', ptaContact: 'PRO-Parents of South Carolina', ptaUrl: 'https://www.proparents.org', seaUrl: 'https://ed.sc.gov/districts-schools/special-education-services' },
  { state: 'South Dakota', code: 'SD', acceptance: 'accepted', policyNote: 'South Dakota supports telehealth evaluations given the state\'s rural geography and large tribal land areas. The SD DOE supports remote assessments and most districts accept.', advocacyTip: 'South Dakota Parent Connection is the state PTI. SD\'s rural nature means districts are generally pragmatic about telehealth.', legalBasis: 'ARSD 24:05:27:01. SD DOE Special Education Guidance.', ptaContact: 'South Dakota Parent Connection', ptaUrl: 'https://www.sdparent.org', seaUrl: 'https://doe.sd.gov/specialed' },
  { state: 'Tennessee', code: 'TN', acceptance: 'case-by-case', policyNote: 'Tennessee has no statewide telehealth evaluation mandate. Nashville, Memphis, and Knoxville metro districts tend to be more accepting. Rural districts are more variable.', advocacyTip: 'Support and Training for Exceptional Parents (STEP) is the TN PTI and an excellent resource.', legalBasis: 'Tenn. Comp. R. & Regs. 0520-01-09-.05. IDEA §300.502.', ptaContact: 'Support and Training for Exceptional Parents (STEP)', ptaUrl: 'https://www.tnstep.org', seaUrl: 'https://www.tn.gov/education/student-support/special-education.html' },
  { state: 'Texas', code: 'TX', acceptance: 'case-by-case', policyNote: 'Texas has no statewide telehealth evaluation mandate for IEP purposes. Houston, Dallas, Austin, and San Antonio metro districts tend to be more accepting. Rural districts are more variable. Texas has a complex special education landscape.', advocacyTip: 'Partners Resource Network (PRN) is the TX PTI network with multiple regional centers. Texas has a strong complaint process through TEA.', legalBasis: '19 TAC §89.1040. IDEA §300.502.', ptaContact: 'Partners Resource Network (PRN)', ptaUrl: 'https://www.partnerstx.org', seaUrl: 'https://tea.texas.gov/academics/special-student-populations/special-education' },
  { state: 'Utah', code: 'UT', acceptance: 'case-by-case', policyNote: 'Utah has no statewide telehealth evaluation mandate. Salt Lake City and Wasatch Front districts tend to be more accepting. Rural districts are more variable.', advocacyTip: 'Utah Parent Center is the state PTI and an excellent resource.', legalBasis: 'Utah Admin. Code R277-750. IDEA §300.502.', ptaContact: 'Utah Parent Center', ptaUrl: 'https://www.utahparentcenter.org', seaUrl: 'https://www.schools.utah.gov/specialeducation' },
  { state: 'Vermont', code: 'VT', acceptance: 'accepted', policyNote: 'Vermont actively supports telehealth evaluations. The VT Agency of Education supports remote assessments and most supervisory unions accept. Vermont\'s rural nature makes telehealth particularly important.', advocacyTip: 'Vermont Family Network is the state PTI. Vermont has a collaborative special education culture.', legalBasis: 'Vermont Spec. Ed. Regulations 2362.1. VT AOE Special Education Guidance.', ptaContact: 'Vermont Family Network', ptaUrl: 'https://www.vermontfamilynetwork.org', seaUrl: 'https://education.vermont.gov/student-support/vermont-special-education' },
  { state: 'Virginia', code: 'VA', acceptance: 'case-by-case', policyNote: 'Virginia has no statewide telehealth evaluation mandate. Northern Virginia, Richmond, and Hampton Roads metro districts tend to be more accepting. Rural districts are more variable.', advocacyTip: 'Parent Educational Advocacy Training Center (PEATC) is the VA PTI and an outstanding resource.', legalBasis: '8 VAC 20-81-110. IDEA §300.502.', ptaContact: 'Parent Educational Advocacy Training Center (PEATC)', ptaUrl: 'https://www.peatc.org', seaUrl: 'https://www.doe.virginia.gov/special_ed' },
  { state: 'Washington', code: 'WA', acceptance: 'accepted', policyNote: 'Washington has strong telehealth laws and most districts accept telehealth evaluations. The OSPI (Office of Superintendent of Public Instruction) supports remote assessments. Seattle, Bellevue, and Spokane districts are very accepting.', advocacyTip: 'Washington PAVE is the state PTI and an excellent resource. Washington has robust procedural safeguards.', legalBasis: 'WAC 392-172A-03005. OSPI Special Education Guidance.', ptaContact: 'Washington PAVE', ptaUrl: 'https://wapave.org', seaUrl: 'https://www.k12.wa.us/student-success/special-education' },
  { state: 'West Virginia', code: 'WV', acceptance: 'case-by-case', policyNote: 'West Virginia has no statewide telehealth evaluation mandate. Charleston and Huntington metro districts tend to be more accepting. Rural districts, which make up most of the state, are more variable.', advocacyTip: 'WV Parent Training and Information (WVPTI) is the state PTI. WV has a strong mediation program.', legalBasis: 'W. Va. Code R. §126-16-1. IDEA §300.502.', ptaContact: 'WV Parent Training and Information (WVPTI)', ptaUrl: 'https://www.wvpti.org', seaUrl: 'https://wvde.us/special-education' },
  { state: 'Wisconsin', code: 'WI', acceptance: 'accepted', policyNote: 'Wisconsin has strong telehealth infrastructure and most districts accept telehealth evaluations. The Wisconsin DPI supports remote assessments. Milwaukee, Madison, and Green Bay districts are very accepting.', advocacyTip: 'Wisconsin Family Assistance Center for Education, Training and Support (WI FACETS) is the state PTI.', legalBasis: 'Wis. Admin. Code PI 11.36. Wisconsin DPI Special Education Guidance.', ptaContact: 'WI FACETS', ptaUrl: 'https://www.wifacets.org', seaUrl: 'https://dpi.wi.gov/sped' },
  { state: 'Wyoming', code: 'WY', acceptance: 'accepted', policyNote: 'Wyoming actively supports telehealth evaluations given the state\'s rural geography. The Wyoming DOE supports remote assessments and most districts accept, recognizing the practical necessity.', advocacyTip: 'WPIC (Wyoming Parent Information Center) is the state PTI. Wyoming\'s rural nature means districts are generally pragmatic about telehealth.', legalBasis: 'Wyoming Spec. Ed. Rules Chapter 7. WY DOE Special Education Guidance.', ptaContact: 'Wyoming Parent Information Center (WPIC)', ptaUrl: 'https://wpic.org', seaUrl: 'https://edu.wyoming.gov/educators/special-education' },
  { state: 'Washington DC', code: 'DC', acceptance: 'accepted', policyNote: 'DC has strong telehealth laws and DCPS (DC Public Schools) accepts telehealth evaluations. The Office of the State Superintendent of Education (OSSE) supports remote assessments.', advocacyTip: 'Advocates for Justice and Education (AJE) is the DC PTI and specializes in DC special education law.', legalBasis: 'DC Mun. Regs. Title 5-E §3002. IDEA §300.502.', ptaContact: 'Advocates for Justice and Education (AJE)', ptaUrl: 'https://www.aje-dc.org', seaUrl: 'https://osse.dc.gov/page/special-education' },
];

const ACCEPTANCE_CONFIG: Record<AcceptanceLevel, { label: string; color: string; bg: string; icon: string }> = {
  accepted: { label: 'Generally Accepted', color: COLORS.successText, bg: COLORS.successBg, icon: '✅' },
  'case-by-case': { label: 'Case-by-Case', color: COLORS.warningText, bg: COLORS.warningBg, icon: '⚠️' },
  'not-accepted': { label: 'Not Accepted', color: COLORS.errorText, bg: COLORS.errorBg, icon: '❌' },
  unknown: { label: 'Unknown', color: COLORS.textLight, bg: COLORS.border, icon: '❓' },
};

export default function TelehealthLookupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<StatePolicy | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return TELEHEALTH_POLICIES;
    const q = query.toLowerCase();
    return TELEHEALTH_POLICIES.filter(
      (s) => s.state.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [query]);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  const handleShare = async (policy: StatePolicy) => {
    const cfg = ACCEPTANCE_CONFIG[policy.acceptance];
    await Share.share({
      message: `Telehealth IEP Evaluation Policy — ${policy.state}\n\n${cfg.icon} ${cfg.label}\n\n${policy.policyNote}\n\nAdvocacy Tip: ${policy.advocacyTip}\n\nLegal Basis: ${policy.legalBasis}\n\nParent Advocacy: ${policy.ptaContact || 'See state PTI'}\n\nGenerated by Autism Pathways`,
    });
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Telehealth Acceptance</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={s.homeBtn}>
          <Text style={s.homeText}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Intro Banner */}
      <View style={s.introBanner}>
        <Text style={s.introTitle}>📡 Does Your State Accept Telehealth IEP Evaluations?</Text>
        <Text style={s.introSub}>Search your state to see the policy, advocacy tips, and your legal rights.</Text>
      </View>

      {/* Legend */}
      <View style={s.legend}>
        {(Object.entries(ACCEPTANCE_CONFIG) as [AcceptanceLevel, typeof ACCEPTANCE_CONFIG[AcceptanceLevel]][])
          .filter(([k]) => k !== 'unknown')
          .map(([key, cfg]) => (
            <View key={key} style={[s.legendChip, { backgroundColor: cfg.bg }]}>
              <Text style={[s.legendText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
            </View>
          ))}
      </View>

      {/* Near Me + Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: SPACING.md, marginBottom: 4 }}>
        <NearMeButton onStateDetected={(code) => setQuery(code)} />
        <Text style={{ fontSize: 12, color: COLORS.textLight, fontStyle: 'italic' }}>or search below</Text>
      </View>
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search state name or abbreviation..."
          placeholderTextColor={COLORS.textLight}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {filtered.map((policy) => {
          const cfg = ACCEPTANCE_CONFIG[policy.acceptance];
          const isOpen = expanded === policy.code;
          return (
            <View key={policy.code} style={s.stateCard}>
              <TouchableOpacity style={s.stateHeader} onPress={() => toggle(policy.code)}>
                <View style={[s.badge, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
                </View>
                <View style={s.stateNameRow}>
                  <Text style={s.stateName}>{policy.state}</Text>
                  <Text style={s.stateCode}>{policy.code}</Text>
                </View>
                <Text style={s.chevron}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={s.stateBody}>
                  {/* Policy Note */}
                  <View style={[s.section, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
                    <Text style={s.sectionLabel}>POLICY OVERVIEW</Text>
                    <Text style={[s.sectionText, { color: cfg.color }]}>{policy.policyNote}</Text>
                  </View>

                  {/* Advocacy Tip */}
                  <View style={[s.section, { backgroundColor: COLORS.infoBg, borderColor: COLORS.infoBorder }]}>
                    <Text style={s.sectionLabel}>💡 ADVOCACY TIP</Text>
                    <Text style={[s.sectionText, { color: COLORS.infoText }]}>{policy.advocacyTip}</Text>
                  </View>

                  {/* Legal Basis */}
                  <View style={[s.section, { backgroundColor: COLORS.lavender, borderColor: COLORS.lavenderAccent }]}>
                    <Text style={s.sectionLabel}>⚖️ LEGAL BASIS</Text>
                    <Text style={[s.sectionText, { color: COLORS.purple }]}>{policy.legalBasis}</Text>
                  </View>

                  {/* PTI Contact */}
                  {policy.ptaContact && (
                    <View style={s.contactRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.contactLabel}>PARENT ADVOCACY CENTER</Text>
                        <Text style={s.contactName}>{policy.ptaContact}</Text>
                      </View>
                      <View style={s.contactBtns}>
                        {policy.ptaUrl && (
                          <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL(policy.ptaUrl!)}>
                            <Text style={s.contactBtnText}>🌐 Website</Text>
                          </TouchableOpacity>
                        )}
                        {policy.seaUrl && (
                          <TouchableOpacity style={[s.contactBtn, s.contactBtnSecondary]} onPress={() => Linking.openURL(policy.seaUrl!)}>
                            <Text style={s.contactBtnText}>🏛 State DOE</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Share */}
                  <TouchableOpacity style={s.shareBtn} onPress={() => handleShare(policy)}>
                    <Text style={s.shareBtnText}>📤 Share This Info</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.sm },
  backText: { color: COLORS.purple, fontWeight: '600', fontSize: FONT_SIZES.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text },
  homeBtn: { padding: SPACING.sm },
  homeText: { fontSize: 22 },
  introBanner: { backgroundColor: COLORS.purpleDark, padding: SPACING.md, margin: SPACING.md, borderRadius: RADIUS.lg },
  introTitle: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md, marginBottom: 4 },
  introSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZES.sm },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  legendChip: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.pill },
  legendText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  searchInput: { backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, ...SHADOWS.sm },
  list: { flex: 1, paddingHorizontal: SPACING.md },
  stateCard: { backgroundColor: 'white', borderRadius: RADIUS.lg, marginBottom: SPACING.sm, ...SHADOWS.sm, overflow: 'hidden' },
  stateHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.pill },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  stateNameRow: { flex: 1 },
  stateName: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text },
  stateCode: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  chevron: { fontSize: 12, color: COLORS.textLight },
  stateBody: { padding: SPACING.md, paddingTop: 0, gap: SPACING.sm },
  section: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: SPACING.sm },
  sectionText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  contactRow: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm },
  contactLabel: { fontSize: FONT_SIZES.xs, fontWeight: 'bold', color: COLORS.textMid, letterSpacing: 0.5 },
  contactName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  contactBtns: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  contactBtn: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  contactBtnSecondary: { backgroundColor: COLORS.purpleDark },
  contactBtnText: { color: 'white', fontWeight: '600', fontSize: FONT_SIZES.sm },
  shareBtn: { backgroundColor: COLORS.lavender, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  shareBtnText: { color: COLORS.purple, fontWeight: 'bold', fontSize: FONT_SIZES.md },
});
