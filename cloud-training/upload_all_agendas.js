const fs = require('fs');
const path = require('path');
const https = require('https');

// --- READ BACKUP FILE ---
const backupPath = path.join(__dirname, '../js/back-up.js');
const content = fs.readFileSync(backupPath, 'utf8');

// --- PARSE ARRAYS ---
const regex = /(?:const|let|var)\s+schedule([a-zA-Z0-9_]*)\s*=\s*(\[[\s\S]*?\])\s*;/g;

let match;
const batches = {};

while ((match = regex.exec(content)) !== null) {
    let batchName = match[1];
    const arrayString = match[2];

    if (batchName === '') batchName = 'DEFAULT';
    batchName = batchName.toUpperCase();

    try {
        const arr = (new Function(`return ${arrayString}`))();
        if (Array.isArray(arr)) {
            batches[batchName] = arr;
        }
    } catch (e) {
        console.error("Failed to parse schedule" + batchName + ":", e.message);
    }
}

console.log(`Successfully parsed ${Object.keys(batches).length} batches from back-up.js`);
console.log(Object.keys(batches).join(", "));

// --- FIREBASE UPLOAD ---

async function uploadAll() {
    let successCount = 0;

    for (const [batchName, sessions] of Object.entries(batches)) {
        const objToUpload = {};
        sessions.forEach((session, idx) => {
            const id = "sess_" + Date.now() + "_" + idx;

            const cleanSession = {
                day: session.day || "",
                time: session.time || "",
                description: session.description || "",
                details: session.details || "",
                link: session.link || "",
                recording: session.recording || "",
            };

            objToUpload[id] = cleanSession;
        });

        try {
            const postData = JSON.stringify(objToUpload);
            const url = `https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/agendas/${encodeURIComponent(batchName)}.json`;

            await new Promise((resolve, reject) => {
                const req = https.request(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            successCount++;
                            console.log(`Uploaded batch: ${batchName} (${sessions.length} sessions)`);
                            resolve();
                        } else {
                            console.error(`Error uploading ${batchName}:`, data);
                            resolve();
                        }
                    });
                });

                req.on('error', (e) => reject(e));
                req.write(postData);
                req.end();
            });
        } catch (e) {
            console.error(`Request failed for ${batchName}`, e);
        }
    }

    console.log(`Upload complete. Successfully uploaded ${successCount} batches.`);
}

uploadAll();
