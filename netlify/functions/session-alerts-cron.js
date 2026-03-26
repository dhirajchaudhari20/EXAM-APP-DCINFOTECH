const { schedule } = require('@netlify/functions');
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

async function handler(event, context) {
    if (!db) {
        db = initializeFirebase();
    }
    console.log(`[Scheduled Alert] Checking sessions at ${new Date().toISOString()}`);

    try {
        const now = new Date();
        
        // 1. Fetch Recipients
        const recipientsSnapshot = await db.ref('settings/alert_emails').once('value');
        const recipientsData = recipientsSnapshot.val() || {};

        let activeRecipients = Object.values(recipientsData)
            .filter(r => r.active)
            .map(r => r.email);

        // Goal: Ensure support gets the emails regardless of dashboard config
        if (!activeRecipients.includes('support@dcinfotech.org.in')) {
            activeRecipients.push('support@dcinfotech.org.in');
        }

        if (activeRecipients.length === 0) return { statusCode: 200 };

        // 2. Fetch Agendas
        const agendasSnapshot = await db.ref('agendas').once('value');
        const agendasData = agendasSnapshot.val();
        if (!agendasData) return { statusCode: 200 };

        // 3. Process Sessions
        for (const batchId of Object.keys(agendasData)) {
            const sessions = agendasData[batchId] ? Object.values(agendasData[batchId]) : [];
            
            for (const session of sessions) {
                if (!session.time || session.time === 'TBA') continue;

                try {
                    const [startStrRaw] = session.time.split(' - ');
                    const startStr = startStrRaw.trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
                    const sessionStart = new Date(`${session.day} ${startStr}`);

                    if (isNaN(sessionStart)) continue;

                    const timeDiffMinutes = Math.floor((sessionStart - now) / (1000 * 60));
                    
                    // Goal: Improved window check (15 to 25 mins ahead) to avoid missing slots due to cron jitter.
                    // The 'session_notifications' check below already prevents double-sending.
                    if (timeDiffMinutes >= 15 && timeDiffMinutes <= 25) {
                        const sessionId = Buffer.from(`${session.day}_${session.time}_${session.description}`).toString('base64').replace(/[=/+]/g, '');
                        const interval = 15; // Log as the 15m reminder even if captured at 17m

                        // Check if alert already sent
                        const sentSnap = await db.ref(`session_notifications/${sessionId}/${interval}`).once('value');
                        
                        if (!sentSnap.exists()) {
                            // Mark as sent
                            await db.ref(`session_notifications/${sessionId}/${interval}`).set({
                                sentAt: admin.database.ServerValue.TIMESTAMP,
                                sessionTitle: session.description,
                                sentBy: 'Netlify Cron'
                            });

                            // Send Bulk Emails
                            await sendBulkEmail(session, activeRecipients, interval);
                            console.log(`✅ Sent ${interval}m bulk alert for ${session.description}`);
                        }
                    }
                } catch (e) {
                    console.error(`Error processing session ${session.description}:`, e);
                }
            }
        }

        return { statusCode: 200 };
    } catch (err) {
        console.error("Cron Error:", err);
        return { statusCode: 500, body: err.message };
    }
}

async function sendBulkEmail(session, recipients, minutesLeft) {
    if (!FIREBASE_FUNCTION_URL) {
        console.warn("Missing FIREBASE_FUNCTION_URL environment variable");
        return;
    }

    const emailPayload = {
        session_title: session.description,
        session_date: session.day,
        session_time: session.time,
        meeting_link: session.link || 'https://dcinfotech.org.in/cloud-training/',
        recipients: recipients,
        minutes_until: minutesLeft,
        type: 'scheduled_reminder'
    };

    try {
        const fetch = require('node-fetch');
        const result = await fetch(FIREBASE_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload)
        });

        if (result.ok) {
            console.log(`✅ [Cron] Firebase Function trigger successful for ${session.description}`);
        } else {
            const errorText = await result.text().catch(() => 'Unable to read error text');
            console.error(`❌ [Cron] Firebase Function Error (${result.status}):`, errorText);
        }
    } catch (err) {
        console.error(`❌ [Cron] Failed to trigger Firebase alert:`, err);
    }
}

// Every minute scheduling
exports.handler = schedule("* * * * *", handler);
