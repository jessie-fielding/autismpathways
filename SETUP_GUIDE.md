# Autism Pathways — Auth Setup Guide

This guide walks you through activating **real AWS Cognito authentication** and **Google Sign-In** in the app. Your Cognito User Pool is already created — you just need to configure a few settings in the AWS and Google consoles.

Estimated time: **20–30 minutes**

---

## Part 1 — Google Cloud Console (10 minutes)

You need a Google OAuth 2.0 client ID so Cognito can authenticate users via Google.

### Step 1.1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `AutismPathways` → **Create**

### Step 1.2 — Configure the OAuth Consent Screen

1. In the left sidebar → **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - **App name:** `Autism Pathways`
   - **User support email:** your email
   - **Developer contact email:** your email
4. Click **Save and Continue** through all steps (no scopes needed yet)
5. On the Summary page → **Back to Dashboard**

### Step 1.3 — Create OAuth Credentials

1. In the left sidebar → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `AutismPathways Cognito`
5. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR-DOMAIN.auth.us-east-2.amazoncognito.com/oauth2/idpresponse
   ```
   *(You'll get the actual domain in Part 2 — come back and add it then)*
6. Click **Create**
7. **Copy and save** the **Client ID** and **Client Secret** — you'll need them in Part 2

---

## Part 2 — AWS Cognito Console (15 minutes)

### Step 2.1 — Add Google as an Identity Provider

1. Go to [console.aws.amazon.com/cognito](https://console.aws.amazon.com/cognito)
2. Click **User pools** → select `us-east-2_cRdQiPSDK`
3. Click the **Sign-in experience** tab
4. Scroll to **Federated identity provider sign-in** → **Add an identity provider**
5. Select **Google**
6. Enter:
   - **Google client ID:** *(paste from Step 1.3)*
   - **Google client secret:** *(paste from Step 1.3)*
   - **Authorized scopes:** `email openid profile`
7. Under **Map attributes**, add:
   - Google attribute: `email` → User pool attribute: `email`
   - Google attribute: `given_name` → User pool attribute: `given_name`
   - Google attribute: `family_name` → User pool attribute: `family_name`
8. Click **Add identity provider**

### Step 2.2 — Set Up the Hosted UI Domain

1. Still in your User Pool, click the **App integration** tab
2. Scroll to **Domain** → **Actions** → **Create Cognito domain**
3. Enter a prefix, e.g. `autismpathways-auth`
4. Click **Create Cognito domain**
5. Your domain will be:
   ```
   autismpathways-auth.auth.us-east-2.amazoncognito.com
   ```
   *(Use whatever prefix you chose)*

### Step 2.3 — Update the App Client

1. Still on the **App integration** tab, scroll to **App clients and analytics**
2. Click on your app client (named something like `AutismPathways`)
3. Click **Edit** on the **Hosted UI** section
4. Under **Allowed callback URLs**, add:
   ```
   autismpathways://
   ```
5. Under **Allowed sign-out URLs**, add:
   ```
   autismpathways://
   ```
6. Under **Identity providers**, check **Google** (and **Cognito User Pool** for email/password)
7. Under **OAuth 2.0 grant types**, check **Authorization code grant**
8. Under **OpenID Connect scopes**, check **email**, **openid**, **profile**
9. Click **Save changes**

### Step 2.4 — Go back to Google and add the redirect URI

1. Return to [Google Cloud Console](https://console.cloud.google.com) → **Credentials** → your OAuth client
2. Under **Authorized redirect URIs**, add:
   ```
   https://autismpathways-auth.auth.us-east-2.amazoncognito.com/oauth2/idpresponse
   ```
   *(Replace `autismpathways-auth` with your actual domain prefix)*
3. Click **Save**

---

## Part 3 — Update the App Config (2 minutes)

Open `aws-config.ts` in your project and fill in the `hostedUiDomain` field:

```typescript
export const awsConfig = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_cRdQiPSDK',
  userPoolWebClientId: '1pude0u2krj3qbt48ij0igooeb',
  apiUrl: 'https://9bda3bhhmd.execute-api.us-east-2.amazonaws.com',
  hostedUiDomain: 'autismpathways-auth.auth.us-east-2.amazoncognito.com', // ← your domain
};
```

Then run:
```bash
cd /Users/jessiefielding/AutismPathways
npx expo start --clear
```

---

## Testing

1. Open the app → tap **Sign in with Google** on the sign-in screen
2. A browser window will open to Google's sign-in page
3. Sign in with a Google account
4. You'll be redirected back to the app and signed in automatically

---

## Compliance Notes

- **AWS Cognito** is eligible for HIPAA compliance when used with a signed AWS Business Associate Agreement (BAA)
- To activate the BAA: AWS Console → **Account** → **AWS Artifact** → **Agreements** → sign the HIPAA BAA
- Cognito stores credentials encrypted at rest and in transit
- User passwords are never stored in the app — only short-lived JWT tokens
- Google Sign-In tokens are exchanged server-side by Cognito — the app never sees the Google password

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Google sign-in is not configured yet" | `hostedUiDomain` in `aws-config.ts` is empty — complete Part 3 |
| "No authorization code received" | Check that `autismpathways://` is in Cognito App Client callback URLs |
| "redirect_uri_mismatch" from Google | Add the Cognito `/oauth2/idpresponse` URL to Google's Authorized redirect URIs |
| Email/password sign-in fails | Check that the email is verified in Cognito User Pool → Users tab |
| User created but can't sign in | User may be in UNCONFIRMED state — check Cognito console and confirm manually if needed |
