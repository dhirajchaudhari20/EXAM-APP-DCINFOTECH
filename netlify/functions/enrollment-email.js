const emailjs = require('@emailjs/nodejs');

/**
 * Netlify Function: enrollment-email
 * Sends an automated enrollment confirmation email using EmailJS.
 * 
 * Expected payload:
 * {
 *   "first_name": "John",
 *   "to_email": "john.doe@example.com",
 *   "assigned_email": "john.doe@dcinfotech.org.in",
 *   "learning_path_link": "https://partner.cloudskillsboost.google/paths/11"
 * }
 */
exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { first_name, to_email, assigned_email, learning_path_link } = body;

        // Validate required fields
        if (!first_name || !to_email || !assigned_email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required fields: first_name, to_email, or assigned_email" })
            };
        }

        // Configuration from environment variables
        // These should be set in the Netlify UI or .env file
        const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_yploami';
        const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID_ONBOARDING || 'template_onboarding_gcp';
        const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'PuXMOkifk3kuFLkOI';
        const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

        if (!PRIVATE_KEY) {
            console.error("EMAILJS_PRIVATE_KEY is not set in environment variables.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Email service configuration error: Missing Private Key" })
            };
        }

        // Initialize EmailJS with Private Key
        emailjs.init({
            publicKey: PUBLIC_KEY,
            privateKey: PRIVATE_KEY,
        });

        const templateParams = {
            first_name: first_name,
            to_email: to_email,
            assigned_email: assigned_email,
            learning_path_link: learning_path_link || "https://partner.cloudskillsboost.google/paths/11",
            reply_to: "support@dcinfotech.org.in"
        };

        console.log(`Sending enrollment email to ${to_email}...`);

        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);

        if (response.status === 200) {
            console.log("SUCCESS! Enrollment email sent.");
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Enrollment email sent successfully", detail: response.text })
            };
        } else {
            console.error("FAILED to send enrollment email:", response.text);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Failed to send email", detail: response.text })
            };
        }

    } catch (error) {
        console.error("Enrollment email function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", detail: error.message })
        };
    }
};
