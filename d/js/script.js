import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =======================
   Firebase Configuration
======================= */
const firebaseConfig = {
    apiKey: "AIzaSyCohKlqNu0I1sXcLW4D_fv-OEw9x0S50q8",
    authDomain: "dc-infotechpvt-1-d1a4b.firebaseapp.com",
    projectId: "dc-infotechpvt-1-d1a4b",
    storageBucket: "dc-infotechpvt-1-d1a4b.firebasestorage.app",
    messagingSenderId: "622552457680",
    appId: "1:622552457680:web:4b80e21e14e2bB266f19d5",
    measurementId: "G-ZXPZGMNR44",
    databaseURL: "https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =======================
   Constants & State
======================= */
const JUDGES = ["Dhiraj Chaudhari", "Judge 2", "Judge 3"];

let isAuthenticated = false;

let scores = {
    innovation: 0,
    implementation: 0,
    functionality: 0,
    pitching: 0
};

/* =======================
   DOM Elements
======================= */
const authContainer = document.getElementById('auth-container');
const mainPanel = document.getElementById('main-panel');
const passcodeInput = document.getElementById('passcode-input');
const loginBtn = document.getElementById('login-btn');
const judgeNameSelect = document.getElementById('judge-name');
const teamNameInput = document.getElementById('team-name');
const slidersContainer = document.getElementById('score-sliders');
const totalScoreDisplay = document.getElementById('total-score-display');
const statusDisplay = document.getElementById('status-display');
const submitScoreBtn = document.getElementById('submit-score-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const resetDataBtn = document.getElementById('reset-data-btn');
const leaderboardBody = document.getElementById('leaderboard-body');

/* =======================
   Authentication
======================= */
const handleLogin = () => {
    if (passcodeInput.value === "judge2025") {
        isAuthenticated = true;
        authContainer.classList.add('hidden');
        mainPanel.classList.remove('hidden');
        initLeaderboardListener();
    } else {
        alert("Invalid Passcode");
    }
};

loginBtn.addEventListener('click', handleLogin);
passcodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});

/* =======================
   Score Sliders
======================= */
const criteria = [
    { id: 'innovation', label: 'Innovation' },
    { id: 'implementation', label: 'Problem Implementation' },
    { id: 'functionality', label: 'Functionality and Usability' },
    { id: 'pitching', label: 'Pitching' }
];

const updateScores = () => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    totalScoreDisplay.innerText = total;
};

criteria.forEach(item => {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'hackathon-field';

    fieldDiv.innerHTML = `
        <label>
            ${item.label}
            <span class="hackathon-value" id="val-${item.id}">0</span>/10
        </label>
        <input
            type="range"
            class="hackathon-range"
            min="0"
            max="10"
            value="0"
            id="range-${item.id}"
        />
    `;

    slidersContainer.appendChild(fieldDiv);

    const rangeInput = fieldDiv.querySelector('input');
    const valueSpan = fieldDiv.querySelector('span');

    rangeInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        scores[item.id] = val;
        valueSpan.innerText = val;
        updateScores();
    });
});

/* =======================
   Firebase Leaderboard
======================= */
const initLeaderboardListener = () => {
    const scoresRef = ref(db, 'hackathon/scores');
    statusDisplay.innerText = "Status: Connecting to Firebase...";

    onValue(scoresRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            leaderboardBody.innerHTML = '';
            statusDisplay.innerText = "Status: Live (No Data)";
            statusDisplay.style.color = "green";
            return;
        }

        const tempScores = {};

        Object.values(data).forEach(record => {
            const team = record.team.toUpperCase();
            const judge = record.judge;
            const total = record.total;

            if (!tempScores[team]) tempScores[team] = {};
            tempScores[team][judge] = total;
        });

        const ranking = Object.keys(tempScores).map(team => {
            const teamScores = tempScores[team];

            let sum = 0;
            let count = 0;

            JUDGES.forEach(judge => {
                if (teamScores[judge] !== undefined) {
                    sum += teamScores[judge];
                    count++;
                }
            });

            const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;

            return {
                team,
                scores: teamScores,
                avg
            };
        });

        ranking.sort((a, b) => b.avg - a.avg);
        renderLeaderboard(ranking);

        statusDisplay.innerText = "Status: Live (Firebase)";
        statusDisplay.style.color = "green";
    }, () => {
        statusDisplay.innerText = "Status: Firebase Error";
        statusDisplay.style.color = "red";
    });
};

/* =======================
   Render Leaderboard
======================= */
const renderLeaderboard = (ranking) => {
    leaderboardBody.innerHTML = '';

    ranking.forEach((item, index) => {
        const isWinner = index === 0 && item.avg > 0;

        const score1 = item.scores["Dhiraj Chaudhari"] ?? '-';
        const score2 = item.scores["Judge 2"] ?? '-';
        const score3 = item.scores["Judge 3"] ?? '-';

        const tr = document.createElement('tr');
        if (isWinner) tr.className = "winner-row";

        tr.innerHTML = `
            <td>${index + 1} ${isWinner ? '👑' : ''}</td>
            <td>${item.team}</td>
            <td>${score1}</td>
            <td>${score2}</td>
            <td>${score3}</td>
            <td><strong>${item.avg}</strong></td>
        `;

        leaderboardBody.appendChild(tr);
    });
};

/* =======================
   Save Score
======================= */
submitScoreBtn.addEventListener('click', () => {
    const teamName = teamNameInput.value.trim();
    const judgeName = judgeNameSelect.value;
    const totalScore = parseInt(totalScoreDisplay.innerText);

    if (!teamName) {
        alert("Please enter a team name!");
        return;
    }

    const payload = {
        timestamp: new Date().toISOString(),
        team: teamName.toUpperCase(),
        judge: judgeName,
        ...scores,
        total: totalScore
    };

    const key = `${payload.team.replace(/[^a-zA-Z0-9]/g, '_')}_${judgeName.replace(/\s/g, '_')}`;
    const recordRef = ref(db, `hackathon/scores/${key}`);

    statusDisplay.innerText = "Status: Saving...";

    set(recordRef, payload)
        .then(() => {
            alert(`Score saved for ${payload.team} by ${judgeName}`);

            criteria.forEach(item => {
                scores[item.id] = 0;
                document.getElementById(`range-${item.id}`).value = 0;
                document.getElementById(`val-${item.id}`).innerText = 0;
            });

            updateScores();
            statusDisplay.innerText = "Status: Live (Firebase)";
        })
        .catch(err => {
            alert("Firebase Error: " + err.message);
            statusDisplay.innerText = "Status: Error Saving";
            statusDisplay.style.color = "red";
        });
});

/* =======================
   Export PDF
======================= */
exportPdfBtn.addEventListener('click', () => {
    const element = document.getElementById("reportCard");

    html2pdf().set({
        margin: 0.5,
        filename: 'Hackathon_Results.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
});

/* =======================
   Reset Placeholder
======================= */
resetDataBtn.addEventListener('click', () => {
    alert("For safety, please delete the 'hackathon' node manually from Firebase Console.");
});