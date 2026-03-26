const admin = require('firebase-admin');

// --- Robust Firebase Admin Initialization ---
function initializeFirebase() {
    if (admin.apps.length) return admin.database();

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
                // Try Base64 first
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
                databaseURL: `https://${sa.project_id}-default-rtdb.firebaseio.com`
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
        throw e;
    }
    return admin.database();
}

let db;

/**
 * Netlify Background Function
 * Named with -background.js to allow up to 15 mins execution.
 * Returns 202 Accepted immediately to the caller.
 */
exports.handler = async (event) => {
    // Background functions are triggered and then they run.
    // They are usually called via POST.
    
    if (!db) {
        db = initializeFirebase();
    }

    try {
        const payload = JSON.parse(event.body);
        const { session, batch } = payload;
        
        if (!session) {
            console.error("No session data in background task.");
            return;
        }

        console.log(`[Background Alert] Started for: ${session.description}`);
        console.log(`[Background Alert] Batch filter: ${batch || 'All'}`);

        // 1. Fetch active recipients
        const snapshot = await db.ref('settings/alert_emails').once('value');
        const recipientsData = snapshot.val();
        
        if (!recipientsData) {
            console.warn("[Background] No recipients found in settings/alert_emails.");
            return;
        }

        const activeRecipients = Object.values(recipientsData)
            .filter(r => r.active)
            .map(r => r.email);

        console.log(`[Background] Found ${activeRecipients.length} active recipients.`);

        if (activeRecipients.length === 0) {
            console.warn("[Background] No active recipients to notify.");
            return;
        }

        // 2. Trigger Firebase Cloud Function
        const firebaseFunctionUrl = process.env.FIREBASE_FUNCTION_URL;
        
        if (!firebaseFunctionUrl) {
            console.error("[Background] CRITICAL: FIREBASE_FUNCTION_URL is not set in Netlify environment variables.");
            return;
        }

        const emailPayload = {
            session_title: session.description || "Upcoming Session",
            session_date: session.day || "Today",
            session_time: session.time || "TBA",
            meeting_link: session.link || 'https://dcinfotech.org.in/cloud-training/',
            recipients: activeRecipients,
            type: 'manual_reminder'
        };

        console.log(`[Background] Triggering Firebase Function for ${activeRecipients.length} students.`);
        console.log(`[Background] Target URL: ${firebaseFunctionUrl}`);

        try {
            const fetch = require('node-fetch');
            const result = await fetch(firebaseFunctionUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailPayload)
            });

            const responseText = await result.text();
            if (result.ok) {
                console.log(`✅ [Background] Firebase Function trigger successful for ${session.description}`);
                console.log(`[Background] Response: ${responseText}`);
            } else {
                console.error(`❌ [Background] Firebase Function Error (${result.status}): ${responseText}`);
            }
        } catch (err) {
            console.error(`❌ [Background] Failed to trigger Firebase alert:`, err);
        }

        console.log(`[Background Alert] Finished processing.`);

        // Even though it's a background function, explicitly returning 
        // can help some local development environments.
        return {
            statusCode: 202,
            body: JSON.stringify({ message: "Background task initiated" })
        };

    } catch (error) {
        console.error("[Background Alert Critical Error]:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
