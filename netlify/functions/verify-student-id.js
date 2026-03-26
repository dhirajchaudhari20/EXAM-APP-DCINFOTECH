const https = require('https');

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { image, mimeType } = JSON.parse(event.body);

        if (!image || !mimeType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Image data and mimeType are required' })
            };
        }

        // Using the Netlify AI Proxy (Groq)

        const postData = JSON.stringify({
            contents: [{
                parts: [
                    {
                        text: `Analyze this student ID card image. 
                        1. Is it a valid Student ID? 
                        2. Extract the Student Name.
                        3. Extract the University/College Name.
                        4. If it's not a valid ID, explain why.

                        Return the response in strictly valid JSON format with no markdown formatting (no \`\`\`json or \`\`\`).
                        Structure:
                        {
                          "isValid": boolean,
                          "studentName": "string or null",
                          "university": "string or null",
                          "reason": "string (if invalid) or 'Valid ID' (if valid)"
                        }`
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: image
                        }
                    }
                ]
            }]
        });

        // Use the Netlify AI Proxy
        const AI_PROXY_URL = 'https://dcinfotech.org.in/.netlify/functions/gemini-proxy';

        return new Promise((resolve) => {
            const req = https.request(AI_PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(data);

                        if (res.statusCode !== 200) {
                            resolve({
                                statusCode: res.statusCode,
                                body: JSON.stringify({ error: parsedData.error || 'Proxy error' })
                            });
                            return;
                        }

                        if (!parsedData.candidates || parsedData.candidates.length === 0) {
                            resolve({
                                statusCode: 500,
                                body: JSON.stringify({ error: 'No candidates returned from AI Proxy' })
                            });
                            return;
                        }

                        const textResponse = parsedData.candidates[0].content.parts[0].text;
                        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                        const result = JSON.parse(jsonString);

                        resolve({
                            statusCode: 200,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(result)
                        });
                    } catch (e) {
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify({ error: 'Failed to parse AI response: ' + e.message })
                        });
                    }
                });
            });

            req.on('error', (e) => {
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: e.message })
                });
            });

            req.write(postData);
            req.end();
        });

    } catch (error) {
        console.error('Error verifying student ID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
