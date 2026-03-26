const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function triggerTestAlert() {
    const url = process.env.FIREBASE_FUNCTION_URL;
    console.log(`Triggering Alert at: ${url}`);

    if (!url) {
        console.error("❌ FIREBASE_FUNCTION_URL is not set in .env");
        return;
    }

    const payload = {
        session_title: "TEST: Firebase V1 Fix Verification",
        session_date: new Date().toLocaleDateString(),
        session_time: new Date().toLocaleTimeString(),
        meeting_link: "https://dcinfotech.org.in/",
        recipients: [process.env.SMTP_USER], // Send to self
        type: 'test_verification'
    };

    try {
        console.log("--------------------------------------------------");
        console.log("📡 Sending POST request to Firebase Function...");
        console.log("--------------------------------------------------");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
        const result = await response.json().catch(() => ({ message: 'Could not parse JSON response from server' }));
        console.log(`📡 Response Body:`, JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log("\n✅ SUCCESS: Alert triggered successfully!");
            console.log(`📧 Check your inbox (${process.env.SMTP_USER}) for the test email.`);
            console.log("Note: If you don't receive it, check the Zoho/SMTP logs for any output errors.");
        } else {
            console.log("\n❌ ERROR: Failed to trigger alert.");
            if (result.code === 'EAUTH') {
                console.log("🔑 AUTHENTICATION FAILED: Check your SMTP_USER and SMTP_PASS.");
                console.log("   Note: Zoho often requires an 'App Password'.");
            } else if (result.code === 'ETIMEDOUT') {
                console.log("⌛ CONNECTION TIMEOUT: Firebase might be having trouble reaching the SMTP server.");
            }
            console.log(`\nTechnical Tip: ${result.tip || 'Check Firebase Function logs for details.'}`);
        }
    } catch (error) {
        console.error("\n❌ CRITICAL ERROR during fetch:");
        console.error(error.message);
    }
}

triggerTestAlert();
