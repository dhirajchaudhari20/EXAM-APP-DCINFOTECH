const https = require('https');

/**
 * Secure Groq Proxy Function
 * Acts as a bridge between the frontend and Groq API to keep the API key secure.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    console.log(`[Groq Proxy] %SAME%Method: ${event.httpMethod}, Path: ${event.path}`);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        console.warn(`[Groq Proxy] %SAME%Method Not Allowed: ${event.httpMethod}`);
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: `Method ${event.httpMethod} not allowed. Please use POST.` })
        };
    }

    try {
        const API_KEY = process.env.GROQ_API_KEY;

        if (!API_KEY) {
            console.error("GROQ_API_KEY environment variable is not set.");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Internal Server Error: Missing GROQ_API_KEY in Netlify settings' })
            };
        }

        const groqPayload = event.body;

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Length': Buffer.byteLength(groqPayload)
            }
        };

        return new Promise((resolve) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers,
                        body: data
                    });
                });
            });

            req.on('error', (e) => {
                console.error("Groq Proxy Request Error:", e);
                resolve({
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Groq Proxy Request Failed: ' + e.message })
                });
            });

            req.write(groqPayload);
            req.end();
        });

    } catch (error) {
        console.error("Groq Proxy Critical Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error: ' + error.message })
        };
    }
};
