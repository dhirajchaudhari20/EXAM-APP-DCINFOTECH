const https = require('https');

const DB_HOST = 'dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com';

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
    return new Promise((resolve) => {
        const req = https.request({
            hostname: DB_HOST,
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
                    console.error(`✘ ${batchName}:`, body.slice(0, 200));
                }
                resolve();
            });
        });
        req.on('error', e => { console.error(batchName, e.message); resolve(); });
        req.write(data);
        req.end();
    });
}

const updates = {
    ACE75: [
        {
            day: "Tue, March 24, 2026",
            time: "9:45 AM - 12:00 PM IST (GMT+5:30)",
            description: "Certification Exam Prep [CEP26090] - Associate Cloud Engineer",
            details: "The Certification Exam Prep workshop is a high-impact, two-hour technical review designed as the final check before sitting for a certification exam.",
            link: "Join button will appear 15 minutes before",
            recording: ""
        }
    ],
    DEFAULT: [
        { day: "Mon, March 3, 2025 (its recorded session)", time: "9:00 AM - 1:00 PM GMT+5:30", description: "Google Cloud Fundamentals: Core Infrastructure", details: "If you're facing difficulties in understanding the concepts, kindly watch this for a better understanding of the fundamentals.", recording: "https://www.youtube.com/playlist?list=PLoW9FRX7ypD63XAvW0xd6LtKSHtfQLJJ7" },
        { day: "Mon, March 3, 2025", time: "9:00 AM - 1:00 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 1", details: "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions.", link: "https://meet.google.com/zvx-aywk-kui", recording: "https://youtu.be/Vf_BvK13P9c" },
        { day: "Wed, March 5, 2025", time: "9:00 AM - 1:00 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 2", link: "https://meet.google.com/jgd-fujc-mbx", recording: "" },
        { day: "Mon, March 10, 2025", time: "9:00 AM - 1:00 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 3", link: "https://meet.google.com/ofc-irsg-fup?pli=1", recording: "https://youtu.be/amfLe2SKrts" },
        { day: "Wed, March 12, 2025", time: "9:00 AM - 1:00 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 4", link: "https://meet.google.com/vip-kuyw-hgj", recording: "https://youtu.be/vic0Pu6n7OE" },
        { day: "Mon, March 17, 2025", time: "9:00 AM - 1:00 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 5", link: "https://meet.google.com/xfz-nodk-yfu", recording: "https://www.youtube.com/live/eePyesuTB2Y?si=z4m1FC0BN7igfSFS" },
        { day: "Mon, March 17, 2025", time: "2:00 PM - 4:00 PM GMT+5:30", description: "Exam Readiness Workshop Associate Cloud Engineer", link: "https://meet.google.com/ckb-anew-prr", recording: "https://youtu.be/2mwT6h7pVRw" },
        { day: "Wed, March 19, 2025", time: "9:00 AM - 1:00 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 6", link: "https://meet.google.com/wxc-mpkx-tut", recording: "https://www.youtube.com/live/RolbPMrwKQ4?si=FxdxKQUBaXWVTK9j" },
        { day: "Thursday, March 27, 2025", time: "9:00 AM - 5:00 PM GMT+5:30", description: "Academy - Cloud Digital Leader Workshop", link: "https://meet.google.com/ton-fqac-nix", recording: "https://youtu.be/Pfc0zzBp0Ac" },
        { day: "Fri, April 11, 2025", time: "2:00 PM - 4:00 PM GMT+5:30", description: "Exam Readiness Workshop Associate Cloud Engineer", link: "https://meet.google.com/wmz-cfzt-ehe", recording: "https://youtu.be/2mwT6h7pVRw" }
    ],
    PDE01: [
        { day: "Thu, December 4, 2025", time: "8:30 PM - 11:30 PM GMT+5:30", description: "Academy - Professional Data Engineer workshop Module 1", details: "Agenda: delivered in English", link: "https://meet.google.com/zgf-djxy-wiy", recording: "" },
        { day: "Fri, December 5, 2025", time: "8:30 PM - 11:30 PM GMT+5:30", description: "Academy - Professional Data Engineer workshop Module 2", details: "Agenda: delivered in English", link: "https://meet.google.com/www-wfcg-ius", recording: "" },
        { day: "Mon, December 8, 2025", time: "8:30 PM - 11:30 PM GMT+5:30", description: "Academy - Professional Data Engineer workshop Module 3", details: "Agenda: delivered in English", link: "https://meet.google.com/gec-cjeh-xuw", recording: "" },
        { day: "Tue, December 9, 2025", time: "8:30 PM - 12:30 AM GMT+5:30", description: "Academy - Professional Data Engineer workshop Module 4", details: "Agenda: delivered in English", link: "https://meet.google.com/zgf-djxy-wiy", recording: "" },
        { day: "Fri, December 12, 2025", time: "8:30 PM - 12:30 AM GMT+5:30", description: "Academy - Professional Data Engineer workshop Module 5", details: "Agenda: delivered in English", link: "https://meet.google.com/tvr-wxkh-sdt", recording: "" },
        { day: "Mon, December 15, 2025", time: "8:30 PM - 12:30 AM GMT+5:30", description: "Academy - Professional Data Engineer workshop Module 6", details: "Agenda: delivered in English", link: "https://meet.google.com/tvr-wxkh-sdt", recording: "" },
        { day: "Tue, December 16, 2025", time: "8:30 PM - 12:30 AM GMT+5:30", description: "Academy - Professional Data Engineer workshop Module 7", details: "Agenda: delivered in English", link: "https://meet.google.com/edo-ahzw-kcx", recording: "" }
    ],
    ACE24: [
        { day: "Mon, December 1, 2025", time: "1:30 PM - 5:30 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 1", details: "Agenda: delivered in English over 2 weeks", link: "https://meet.google.com/eec-stho-fvt", recording: "https://youtube.com/live/GBqu-J6EQ2o?feature=share" },
        { day: "Wed, December 3, 2025", time: "1:30 PM - 5:30 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 2", details: "Agenda: delivered in English over 2 weeks", link: "https://meet.google.com/mmq-drza-iiz", recording: "https://youtube.com/live/v-r3yNkB_X8?feature=share" },
        { day: "Fri, December 5, 2025", time: "1:30 PM - 5:30 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 3", details: "Agenda: delivered in English over 2 weeks", link: "https://meet.google.com/xsu-mfsg-hhz", recording: "" },
        { day: "Mon, December 8, 2025", time: "1:30 PM - 5:30 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 4", details: "Agenda: delivered in English over 2 weeks", link: "https://meet.google.com/xnn-bsuh-bka", recording: "https://youtube.com/live/NP5gS3dd8hM?feature=share" },
        { day: "Wed, December 10, 2025", time: "1:30 PM - 5:30 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 5", details: "Agenda: delivered in English over 2 weeks", link: "https://meet.google.com/tfo-ewsh-otf", recording: "https://youtube.com/live/TGVV_dcl6iY?feature=share" },
        { day: "Fri, December 12, 2025", time: "1:30 PM - 5:30 PM GMT+5:30", description: "Academy - Associate Cloud Engineer workshop Module 6", details: "Agenda: delivered in English over 2 weeks", link: "https://meet.google.com/pwp-bvvw-roo", recording: "https://youtube.com/live/RolbPMrwKQ4?feature=share" }
    ]
};

(async () => {
    for (const [name, sessions] of Object.entries(updates)) {
        await put(name, sessions);
    }
    console.log('All updates done!');
})();
