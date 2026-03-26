const https = require('https');
const fs = require('fs');
const path = require('path');

const agendaPath = path.join(__dirname, '../js/agenda.js');
const content = fs.readFileSync(agendaPath, 'utf8');

// Parse all schedule arrays
const regex = /(?:const|let|var)\s+schedule([a-zA-Z0-9_]*)\s*=\s*(\[[\s\S]*?\])\s*;/g;
let match;
const batches = {};

while ((match = regex.exec(content)) !== null) {
    let name = match[1] || 'DEFAULT';
    name = name.toUpperCase();
    try {
        const arr = (new Function(`return ${match[2]}`))();
        if (Array.isArray(arr) && arr.length > 0) {
            batches[name] = arr;
        }
    } catch (e) {
        console.error('Skip', name, e.message);
    }
}

console.log(`Parsed ${Object.keys(batches).length} batches: ${Object.keys(batches).join(', ')}`);

async function upload(batchName, sessions) {
    const obj = {};
    sessions.forEach((s, i) => {
        obj['sess_' + i] = {
            day: s.day || '',
            time: s.time || '',
            description: s.description || '',
            details: s.details || '',
            link: s.link || '',
            recording: s.recording || ''
        };
    });
    const data = JSON.stringify(obj);
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com',
            port: 443,
            path: `/agendas/${encodeURIComponent(batchName)}.json`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✔ ${batchName} (${sessions.length} sessions)`);
                } else {
                    console.error(`✘ ${batchName}:`, body.slice(0, 100));
                }
                resolve();
            });
        });
        req.on('error', e => { console.error(batchName, e.message); resolve(); });
        req.write(data);
        req.end();
    });
}

(async () => {
    for (const [name, sessions] of Object.entries(batches)) {
        await upload(name, sessions);
    }
    console.log('Done!');
})();
