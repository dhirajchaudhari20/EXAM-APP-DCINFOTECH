const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const allQuestions = require(path.join(__dirname, 'full_questions_temp.js'));

function hashAnswer(answer) {
    if (typeof answer !== 'string') return answer;
    return crypto.createHash('sha256').update(answer).digest('hex');
}

function processQuestions(data) {
    const processed = {};
    for (const examName in data) {
        if (Array.isArray(data[examName])) {
            processed[examName] = data[examName].map(q => {
                if (typeof q === 'object' && q.answer) {
                    return {
                        question: q.question,
                        options: q.options,
                        answer: hashAnswer(q.answer)
                    };
                }
                return q;
            });
        } else {
            // Preserve non-array properties (like "default" or metadata)
            processed[examName] = data[examName];
        }
    }
    return processed;
}

const secureQuestions = processQuestions(allQuestions);
const outputContent = `window.allQuestions = ${JSON.stringify(secureQuestions, null, 4)};`;

fs.writeFileSync(path.join(__dirname, 'questions.js'), outputContent);
console.log('Successfully created js/questions.js with hashed answers for all exams.');
console.log('Exams found:', Object.keys(secureQuestions).join(', '));
