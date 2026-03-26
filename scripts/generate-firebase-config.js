const fs = require('fs');
const path = require('path');

console.log('[Build Step] Generating Firebase configuration...');

const outputPath = path.join(__dirname, '..', 'netlify', 'functions', 'firebase-config.json');

// Check for the env var using either name
const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_CONFIG || '';

if (!rawEnv) {
    // Check for individual variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        console.log('[Build Step] Found individual Firebase environment variables. Building config...');
        const sa = {
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY,
            client_email: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-xxxxx@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`
        };
        // Sanitize and write
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        fs.writeFileSync(outputPath, JSON.stringify(sa, null, 2));
        console.log('✅ [Build Step] SUCCESS: firebase-config.json generated from individual variables for project:', sa.project_id);
        process.exit(0);
    }

    console.warn('[Build Step] WARNING: No Firebase credentials found in environment. Keeping placeholder.');
    process.exit(0); // Exit 0 = don't fail the build
}

try {
    // Try to decode as Base64 first
    let jsonString;
    try {
        jsonString = Buffer.from(rawEnv.trim(), 'base64').toString('utf-8');
        // Validate it decoded properly by checking for { 
        if (!jsonString.includes('{')) throw new Error('Not valid base64 JSON');
    } catch (e) {
        // Fallback: treat as raw JSON string
        jsonString = rawEnv.trim();
    }

    const sa = JSON.parse(jsonString);

    if (!sa.project_id || !sa.private_key || !sa.client_email) {
        const missing = [];
        if (!sa.project_id) missing.push('project_id');
        if (!sa.private_key) missing.push('private_key');
        if (!sa.client_email) missing.push('client_email');
        throw new Error(`Service account is missing required fields: ${missing.join(', ')}`);
    }

    // The CRITICAL fix: ensure newlines in private key are real \n characters
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');

    // Write the properly formatted config
    fs.writeFileSync(outputPath, JSON.stringify(sa, null, 2));
    console.log('✅ [Build Step] SUCCESS: firebase-config.json generated for project:', sa.project_id);

} catch (e) {
    console.error('❌ [Build Step] ERROR generating config:', e.message);
    console.warn('⚠️ [Build Step] Using placeholder config. Functions will require runtime environment variables.');
}
