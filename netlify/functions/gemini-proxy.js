const fetch = require('node-fetch');

/**
 * Gemini AI Proxy Function
 * Handles the logic for communicating with Google's Gemini API securely.
 */
exports.handler = async function (event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: "Method Not Allowed" }) 
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("[Gemini Proxy] Missing GEMINI_API_KEY in environment");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Gemini API key not configured on server" })
        };
    }

    try {
        const body = JSON.parse(event.body);
        console.log(`[Gemini Proxy] Processing request: ${JSON.stringify(body).substring(0, 100)}...`);

        // Default to gemini-1.5-flash if not specified, or allow override
        const model = body.model || "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Forward the request to Gemini
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: body.contents,
                generationConfig: body.generationConfig || {}
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Gemini Proxy] API Error:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify(data)
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Enable CORS if needed
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("[Gemini Proxy] Internal Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process AI request", details: error.message })
        };
    }
};
