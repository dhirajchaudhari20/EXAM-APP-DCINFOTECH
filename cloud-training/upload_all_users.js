const https = require('https');
const fs = require('fs');

const DB_HOST = 'dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com';

// 1. Read agenda.js file
const agendaPath = './js/agenda.js';
let agendaContent = '';
try {
    agendaContent = fs.readFileSync(agendaPath, 'utf8');
} catch (e) {
    console.error("Error reading agenda.js:", e);
    process.exit(1);
}

// 2. Extract the users array via regex/eval trick
// This requires finding 'const users = [' and grabbing the array.
const startStr = 'const users = [';
const startIndex = agendaContent.indexOf(startStr);
if (startIndex === -1) {
    console.error("Could not find 'const users = [' in agenda.js");
    process.exit(1);
}

// Simple brace matching to extract the array definition
let braceCount = 0;
let arrayEndIndex = -1;
let index = agendaContent.indexOf('[', startIndex);

for (let i = index; i < agendaContent.length; i++) {
    if (agendaContent[i] === '[') braceCount++;
    if (agendaContent[i] === ']') braceCount--;
    if (braceCount === 0) {
        arrayEndIndex = i + 1;
        break;
    }
}

if (arrayEndIndex === -1) {
    console.error("Failed to extract array.");
    process.exit(1);
}

const arrayStr = agendaContent.substring(index, arrayEndIndex);

// Evaluate the string into a JS array
let usersArray = [];
try {
    usersArray = eval('(' + arrayStr + ')');
} catch(e) {
    console.error("Failed to parse the users array string:", e);
    process.exit(1);
}

console.log(`Found ${usersArray.length} users in agenda.js`);

// 3. Format object for Firebase
// We'll use encoded emails as keys because Firebase keys can't contain '.', '#', '$', '[', or ']'
function encodeEmail(email) {
    return email.replace(/\./g, ',');
}

const usersObj = {};
usersArray.forEach(user => {
    if(user.email) {
        usersObj[encodeEmail(user.email.trim())] = {
            email: user.email.trim(),
            name: user.name || '',
            password: user.password || '',
            phone: user.phone || '',
            batch: user.batch || ''
        };
    }
});

const data = JSON.stringify(usersObj);
console.log(`Prepared payload of ${Object.keys(usersObj).length} unique email records for Firebase.`);

const options = {
    hostname: DB_HOST,
    port: 443,
    path: `/users.json`,
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(options, res => {
    let responseBody = '';
    res.on('data', chunk => responseBody += chunk);
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Successfully uploaded ${Object.keys(usersObj).length} users to Firebase.`);
        } else {
            console.error(`❌ Failed to upload: ${res.statusCode} ${responseBody}`);
        }
    });
});

req.on('error', e => {
    console.error(`❌ Request error:`, e);
});

req.write(data);
req.end();
