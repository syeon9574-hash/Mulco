import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Helper to sign JWT using Node.js built-in crypto module (No external dependencies)
function signJWT(clientEmail: string, privateKey: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const claim = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, // 1 hour expiration
    iat: now
  })).toString('base64url');
  
  const signatureInput = `${header}.${claim}`;
  
  // Format the key to ensure correct line breaks for Node crypto
  const formattedKey = privateKey.replace(/\\n/g, '\n');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(formattedKey, 'base64url');
  
  return `${signatureInput}.${signature}`;
}

// Fetch Google OAuth2 Access Token using signed JWT assertion
async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const assertion = signJWT(clientEmail, privateKey);
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    }).toString()
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth2 Token Exchange failed: ${res.status} - ${errText}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token, title, body, dataPayload } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Missing required parameters: token, title, body' });
  }

  // Retrieve Firebase Service Account from environment variables
  // The service account JSON should be set as FIREBASE_SERVICE_ACCOUNT environment variable on Vercel
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    console.error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
    return res.status(500).json({
      error: 'Server is missing Firebase credentials. Please configure FIREBASE_SERVICE_ACCOUNT environment variable.'
    });
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const projectId = serviceAccount.project_id;
    const clientEmail = serviceAccount.client_email;
    const privateKey = serviceAccount.private_key;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Invalid service account schema. Missing project_id, client_email or private_key.');
    }

    // 1. Get Access Token
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);

    // 2. Call Google FCM HTTP v1 endpoint to send the push message
    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const fcmMessage = {
      message: {
        token,
        notification: {
          title,
          body
        },
        data: dataPayload || {}
      }
    };

    const fcmRes = await fetch(fcmEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fcmMessage)
    });

    if (!fcmRes.ok) {
      const errText = await fcmRes.text();
      return res.status(fcmRes.status).json({
        error: `FCM Server rejected message: ${fcmRes.status} - ${errText}`
      });
    }

    const fcmData = await fcmRes.json();
    return res.status(200).json({ success: true, messageId: fcmData.name });

  } catch (err: any) {
    console.error('Push notification handler failed:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
