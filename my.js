const fs = require('fs');
const content = fs.readFileSync('/Users/dhirajchaudhari/Downloads/dcinfotech-office/exam-portal/js/main.js', 'utf8');
const search = 'SHEETDB_RESULTS_URL';
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
   if(lines[i].includes('submit')) console.log(i + ': ' + lines[i].trim());
}
