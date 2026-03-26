import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase configuration (same project used across the portal)
const firebaseConfig = {
    apiKey: "AIzaSyCohKlqNu0I1sXcLW4D_fv-OEw9x0S50q8",
    authDomain: "dc-infotechpvt-1-d1a4b.firebaseapp.com",
    databaseURL: "https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com",
    projectId: "dc-infotechpvt-1-d1a4b",
    storageBucket: "dc-infotechpvt-1-d1a4b.firebasestorage.app",
    messagingSenderId: "622552457680",
    appId: "1:622552457680:web:4b80e21e14e2b8266f19d5",
    measurementId: "G-ZXPZGMNR44"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const scoresRef = ref(db, "dist-quiz-scores");

const QUIZ_DATA = [
{
    question: "Which layer is responsible for communication in distributed systems?",
    options: ["Application Layer", "Transport Layer", "Middleware Layer", "Physical Layer"],
    correct: 2,
    meme: "https://media.giphy.com/media/l0MYEqEzwMWFCg89i/giphy.gif"
},
{
    question: "Which consistency model ensures all nodes see the same data at the same time?",
    options: ["Eventual Consistency", "Strong Consistency", "Weak Consistency", "Causal Consistency"],
    correct: 1,
    meme: "https://media.giphy.com/media/3o7TKDkDbIDJieKbVm/giphy.gif"
},
{
    question: "What does 'Scalability' mean in distributed systems?",
    options: ["Reducing data", "Handling growth efficiently", "Increasing latency", "Limiting nodes"],
    correct: 1,
    meme: "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif"
},
{
    question: "Which protocol is commonly used for remote procedure calls?",
    options: ["HTTP", "RPC", "FTP", "SMTP"],
    correct: 1,
    meme: "https://media.giphy.com/media/3o7TKWhNqA94N9L6qA/giphy.gif"
},
{
    question: "What is 'Eventual Consistency'?",
    options: ["Data is always consistent", "Data becomes consistent over time", "No consistency", "Instant updates"],
    correct: 1,
    meme: "https://media.giphy.com/media/o75ajIFH0STC8/giphy.gif"
},
{
    question: "Which algorithm is used for mutual exclusion in distributed systems?",
    options: ["Lamport's Algorithm", "Binary Search", "Quick Sort", "DFS"],
    correct: 0,
    meme: "https://media.giphy.com/media/26ufdipLchak97wY0/giphy.gif"
},
{
    question: "What is a 'Deadlock'?",
    options: ["System crash", "Infinite loop", "Processes waiting forever", "Network failure"],
    correct: 2,
    meme: "https://media.giphy.com/media/H5C8CevNMbpBqUeHCn/giphy.gif"
},
{
    question: "Who teaches us Distributed Computing (DC) at SJCEM?",
    options: ["Prithwish Shaw", "Ajay Sir", "Other Faculty", "Guest Lecturer"],
    correct: 1,
    meme: "https://media.giphy.com/media/3o7TKDkDbIDJieKbVm/giphy.gif"
},
{
    question: "Which technique improves fault tolerance?",
    options: ["Replication", "Deletion", "Compression", "Encryption"],
    correct: 0,
    meme: "https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif"
},
{
    question: "What is 'Latency'?",
    options: ["Speed of CPU", "Delay in communication", "Storage size", "Bandwidth"],
    correct: 1,
    meme: "https://media.giphy.com/media/l41lTf62d854N3oVq/giphy.gif"
},
{
    question: "Which architecture uses multiple servers working together?",
    options: ["Standalone System", "Centralized System", "Distributed System", "Embedded System"],
    correct: 2,
    meme: "https://media.giphy.com/media/3o7TKDkDbIDJieKbVm/giphy.gif"
},
{
    question: "What does the 'C' in CAP Theorem stand for?",
    options: ["Consistency", "Caching", "Complexity", "Concurrency"],
    correct: 0,
    meme: "https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif"
},
{
    question: "Which algorithm is commonly used for logical clock synchronization?",
    options: ["Dijkstra's Algorithm", "Lamport's Algorithm", "Binary Search", "Quick Sort"],
    correct: 1,
    meme: "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif"
},
{
    question: "In the Bully Algorithm, which process becomes the coordinator?",
    options: ["Smallest ID", "Random ID", "Highest ID", "Fastest Process"],
    correct: 2,
    meme: "https://media.giphy.com/media/3o7TKWhNqA94N9L6qA/giphy.gif"
},
{
    question: "What is the primary purpose of 'Middleware' in distributed systems?",
    options: ["Gaming", "Hardware control", "Connecting disparate applications", "Database storage"],
    correct: 2,
    meme: "https://media.giphy.com/media/l0MYEqEzwMWFCg89i/giphy.gif"
},
{
    question: "Which transparency hides that a resource may be moved to another location while in use?",
    options: ["Relocation Transparency", "Migration Transparency", "Location Transparency", "Access Transparency"],
    correct: 1,
    meme: "https://media.giphy.com/media/26ufdipLchak97wY0/giphy.gif"
},
{
    question: "Raft and Paxos are examples of what type of algorithms?",
    options: ["Sorting", "Compression", "Consensus", "Search"],
    correct: 2,
    meme: "https://media.giphy.com/media/3o7TKDkDbIDJieKbVm/giphy.gif"
},
{
    question: "Which clock synchronization algorithm uses a 'Time Server'?",
    options: ["Ricart-Agrawala", "Cristian's Algorithm", "Maekawa", "Raymond's Tree"],
    correct: 1,
    meme: "https://media.giphy.com/media/l41lTf62d854N3oVq/giphy.gif"
},
{
    question: "What is a 'Byzantine Failure'?",
    options: ["System crash", "Network lag", "Arbitrary/Malicious behavior", "Disk full"],
    correct: 2,
    meme: "https://media.giphy.com/media/H5C8CevNMbpBqUeHCn/giphy.gif"
},
{
    question: "If process A sends a message to B, then time(A) < time(B) is which property?",
    options: ["Monotonicity", "Causality", "Concurrency", "Synchronization"],
    correct: 1,
    meme: "https://media.giphy.com/media/o75ajIFH0STC8/giphy.gif"
},
{
    question: "A group of recursive servers is often called a?",
    options: ["Cluster", "Pod", "Legion", "Server Farm"],
    correct: 3,
    meme: "https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif"
}
];

let currentQuestion = 0;
let score = 0;
let quizActive = false;
let playerName = "";
let selectedQuestions = [];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const optionsGrid = document.getElementById('options-grid');
const progressBar = document.getElementById('progress-bar');
const scoreEl = document.getElementById('score');
const memeOverlay = document.getElementById('meme-overlay');
const memeImg = document.getElementById('meme-img');

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function initQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedQuestions = shuffleArray(QUIZ_DATA).slice(0, 10);
    showScreen('start-screen');
}

function startQuiz() {
    const nameInput = document.getElementById('player-name');
    const nameError = document.getElementById('name-error');
    const name = nameInput.value.trim();

    if (!name) {
        nameError.textContent = "Please enter your name to start!";
        nameInput.focus();
        return;
    }
    if (name.length < 2) {
        nameError.textContent = "Name must be at least 2 characters.";
        nameInput.focus();
        return;
    }

    nameError.textContent = "";
    playerName = name;

    const nameDisplay = document.getElementById('player-name-display');
    if (nameDisplay) nameDisplay.textContent = playerName;

    quizActive = true;
    showScreen('quiz-screen');
    loadQuestion();
    updateStats();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function loadQuestion() {
    const q = selectedQuestions[currentQuestion];
    questionText.innerText = q.question;
    optionsGrid.innerHTML = '';

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(i);
        optionsGrid.appendChild(btn);
    });

    const progress = (currentQuestion / selectedQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function handleAnswer(index) {
    if (!quizActive) return;

    const correct = selectedQuestions[currentQuestion].correct;
    const btns = optionsGrid.children;

    for (let btn of btns) btn.disabled = true;

    if (index === correct) {
        btns[index].classList.add('correct');
        score += 100;
        showMeme(true);
    } else {
        btns[index].classList.add('wrong');
        btns[correct].classList.add('correct');
        showMeme(false);
    }

    updateStats();

    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= selectedQuestions.length) {
        endQuiz("Quiz Completed! \uD83C\uDF89");
    } else {
        loadQuestion();
    }
}

function updateStats() {
    scoreEl.innerText = `Score: ${score}`;
}

function showMeme(isCorrect) {
    const memes = {
        correct: [
            "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif",
            "https://media.giphy.com/media/3o7TKWhNqA94N9L6qA/giphy.gif"
        ],
        wrong: [
            "https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif",
            "https://media.giphy.com/media/3o7TKDkDbIDJieKbVm/giphy.gif"
        ]
    };

    const arr = isCorrect ? memes.correct : memes.wrong;
    memeImg.src = arr[Math.floor(Math.random() * arr.length)];
    memeOverlay.classList.add('show');

    setTimeout(() => {
        memeOverlay.classList.remove('show');
    }, 1500);
}

let myScoreKey = null;

async function endQuiz(msg) {
    quizActive = false;
    showScreen('result-screen');
    document.getElementById('result-message').innerText = msg;
    document.getElementById('final-score').innerText = score;

    // Save score to Firebase Realtime Database
    try {
        const newRef = await push(scoresRef, {
            name: playerName,
            score: score,
            totalQuestions: selectedQuestions.length,
            timestamp: Date.now()
        });
        myScoreKey = newRef.key;
    } catch (err) {
        console.error("Failed to save score:", err);
    }

    // Load and render the leaderboard
    loadLeaderboard();
}

function loadLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    const q = query(scoresRef, orderByChild('score'));

    onValue(q, (snapshot) => {
        const data = snapshot.val();
        listEl.innerHTML = "";

        if (!data) {
            listEl.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
            return;
        }

        // Collect entries with their keys and sort descending by score
        const entries = Object.entries(data)
            .map(([key, val]) => ({ key, ...val }))
            .sort((a, b) => b.score - a.score);

        entries.forEach((entry, idx) => {
            const isYou = myScoreKey && entry.key === myScoreKey;
            const row = document.createElement('div');
            row.className = 'leaderboard-row' + (isYou ? ' leaderboard-row--you' : '');

            let medal = '';
            if (idx === 0) medal = '\uD83E\uDD47';
            else if (idx === 1) medal = '\uD83E\uDD48';
            else if (idx === 2) medal = '\uD83E\uDD49';
            else medal = `#${idx + 1}`;

            row.innerHTML = `
                <span class="lb-rank">${medal}</span>
                <span class="lb-name">${escapeHtml(entry.name)}${isYou ? ' <span class="lb-you-tag">You</span>' : ''}</span>
                <span class="lb-score">${entry.score} pts</span>
            `;
            listEl.appendChild(row);
        });
    }, { onlyOnce: true });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
    initQuiz();

    const nameInput = document.getElementById('player-name');
    if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') startQuiz();
        });
    }
});

// Expose startQuiz to inline onclick handler
window.startQuiz = startQuiz;
