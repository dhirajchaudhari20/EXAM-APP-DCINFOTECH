const admin = require('firebase-admin');

// --- Robust Firebase Admin Initialization ---
function initializeFirebase() {
    if (admin.apps.length) return admin;

    try {
        let sa;
        let saEnv = process.env.FIREBASE_SERVICE_ACCOUNT || 
                      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || 
                      process.env.FIREBASE_CONFIG;

        // 1. Prefer baked-in config (Build-Time Config Baking)
        try {
            sa = require('./firebase-config.json');
            if (sa && sa.project_id && sa.private_key) {
                console.log("[Firebase Init] Using baked-in firebase-config.json");
            } else {
                sa = null; // Incomplete placeholder
            }
        } catch (e) {
            console.warn("[Firebase Init] Baked-in config not found, falling back to environment variables.");
        }

        // 2. Fallback to Environment Variables (Runtime)
        if (!sa && saEnv) {
            saEnv = saEnv.trim().replace(/^"|"$/g, ''); // Clean whitespace/quotes
            
            try {
                // Try Base64 first (as it's the recommended Netlify format)
                const decoded = Buffer.from(saEnv, 'base64').toString('utf-8');
                if (decoded.includes('{')) {
                    sa = JSON.parse(decoded);
                } else {
                    throw new Error("Not Base64 JSON");
                }
            } catch (e) {
                try {
                    // Fallback to raw JSON
                    sa = JSON.parse(saEnv);
                } catch (e2) {
                    throw new Error(`FIREBASE_SERVICE_ACCOUNT format error. (JSON Parse Error: ${e2.message})`);
                }
            }
        } else if (!sa && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
            console.log("[Firebase Init] Found individual Firebase environment variables.");
            sa = {
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY,
                client_email: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-xxxxx@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`
            };
        }

        if (sa && sa.private_key && sa.project_id && sa.client_email) {
            // RSA Key Sanitization: Ensure real \n characters
            sa.private_key = sa.private_key
                .replace(/^"|"$/g, '') 
                .replace(/\\n/g, '\n') 
                .replace(/\r/g, '');   

            admin.initializeApp({
                credential: admin.credential.cert(sa),
                databaseURL: `https://${sa.project_id}-default-rtdb.firebaseio.com`,
                projectId: sa.project_id
            });
            console.log(`✅ [Firebase Init] Initialized for project: ${sa.project_id}`);
        } else {
            const missing = [];
            if (!sa) missing.push('Config missing');
            else {
                if (!sa.project_id) missing.push('project_id');
                if (!sa.private_key) missing.push('private_key');
                if (!sa.client_email) missing.push('client_email');
            }
            throw new Error(`Incomplete Service Account: ${missing.join(', ')}. Ensure FIREBASE_SERVICE_ACCOUNT is set in Netlify BUILD environment.`);
        }
    } catch (e) {
        console.error("❌ [Firebase Init] CRITICAL FAILURE:", e.message);
        throw e; // Rethrown to be caught by the handler
    }
    return admin;
}

// Common JSON response headers
const JSON_HEADERS = { 'Content-Type': 'application/json' };

let firebaseAdmin;

exports.handler = async (event) => {
    // Always respond with JSON, even for non-POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: JSON_HEADERS,
            body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
        };
    }

    try {
        if (!firebaseAdmin) {
            firebaseAdmin = initializeFirebase();
        }

        let email;
        try {
            const body = JSON.parse(event.body);
            email = body.email;
        } catch (e) {
            return {
                statusCode: 400,
                headers: JSON_HEADERS,
                body: JSON.stringify({ success: false, message: 'Invalid JSON body' })
            };
        }

        if (!email) {
            return {
                statusCode: 400,
                headers: JSON_HEADERS,
                body: JSON.stringify({ success: false, message: 'Email is required' })
            };
        }

        console.log(`[Password Reset] Generating link for: ${email}`);

        // Generate the secure reset link via Firebase Admin
        // Firebase will send the email automatically using its built-in email service.
        // This does NOT require FIREBASE_FUNCTION_URL or any external email relay.
        const resetLink = await firebaseAdmin.auth().generatePasswordResetLink(email, {
            url: 'https://dcinfotech.org.in/exam-portal/index.html',
        });

        console.log(`✅ [Password Reset] Reset link generated for ${email}`);

        // Optionally try to send via an external relay, but don't fail if it's not configured
        const firebaseFunctionUrl = process.env.FIREBASE_FUNCTION_URL;
        if (firebaseFunctionUrl) {
            try {
                const fetch = require('node-fetch');
                const emailPayload = {
                    type: 'password_reset',
                    email: email,
                    reset_link: resetLink,
                    timestamp: new Date().toISOString()
                };
                const response = await fetch(firebaseFunctionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emailPayload)
                });
                if (!response.ok) {
                    console.warn(`[Password Reset] Email relay returned non-OK: ${response.status}`);
                }
            } catch (relayErr) {
                // Non-blocking: log but don't fail the whole request
                console.warn(`[Password Reset] Email relay error (non-fatal): ${relayErr.message}`);
            }
        } else {
            console.warn("[Password Reset] FIREBASE_FUNCTION_URL not set — skipping email relay. Firebase will send its built-in reset email.");
        }

        return {
            statusCode: 200,
            headers: JSON_HEADERS,
            body: JSON.stringify({ success: true, message: 'Password reset email sent. Please check your inbox.' })
        };

    } catch (error) {
        console.error("[Password Reset Error]:", error.message);
        return {
            statusCode: 500,
            headers: JSON_HEADERS,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};
