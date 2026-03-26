const admin = require('firebase-admin');
const fs = require('fs');

// Load .env
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function checkConfig() {
  console.log("Checking Firestore collections for config...");
  const collections = await db.listCollections();
  for (const collection of collections) {
    console.log(`- Collection: ${collection.id}`);
    if (collection.id.toLowerCase().includes('config') || collection.id.toLowerCase().includes('key') || collection.id.toLowerCase().includes('bot')) {
      const docs = await collection.limit(5).get();
      docs.forEach(doc => {
        console.log(`  - Doc ID: ${doc.id}`);
        console.log(`    Data: ${JSON.stringify(doc.data(), null, 2)}`);
      });
    }
  }
}

checkConfig().catch(console.error);
