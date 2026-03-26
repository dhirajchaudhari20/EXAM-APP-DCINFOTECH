const https = require('https');

const DB_HOST = 'dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com';

const scheduleAll = [
    {
        day: "Mon, 9 March 2026",
        time: "1:30 PM - 9:30 PM GMT+5:30",
        description: "Manage Scalable Workloads in GKE - 1",
        details: "Agenda: Discover how to modernize, manage, and observe applications at scale using Google Kubernetes Engine Enterprise."
    },
    {
        day: "Tue, 10 March 2026",
        time: "1:30 PM - 9:30 PM GMT+5:30",
        description: "Manage Scalable Workloads in GKE - 2",
        details: "Agenda: Discover how to modernize, manage, and observe applications at scale using Google Kubernetes Engine Enterprise."
    },
    {
        day: "Wed, 11 March 2026",
        time: "1:30 PM - 9:30 PM GMT+5:30",
        description: "Manage Scalable Workloads in GKE - 3",
        details: "Agenda: Discover how to modernize, manage, and observe applications at scale using Google Kubernetes Engine Enterprise."
    }
];

async function put(batchName, sessions) {
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
    const options = {
        hostname: DB_HOST,
        port: 443,
        path: `/agendas/${batchName}.json`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ Uploaded ${batchName} (${sessions.length} sessions)`);
                    resolve();
                } else {
                    reject(new Error(`Failed to upload ${batchName}: ${res.statusCode} ${responseBody}`));
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    try {
        await put('SCHEDULEALL', scheduleAll);
        console.log('🚀 All global sessions uploaded successfully!');
    } catch (error) {
        console.error('❌ Error uploading global sessions:', error);
    }
}

main();
