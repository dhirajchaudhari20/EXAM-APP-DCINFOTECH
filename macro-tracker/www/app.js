// Import Firebase functions (using CDN for simplicity without bundler if prefered, or ES modules)
// For this setup we'll assume ES modules from CDN for modern browser support without build step
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, equalTo, get, serverTimestamp, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Configuration ---
// TODO: Replace with actual keys
const firebaseConfig = {
    apiKey: "AIzaSyCohKlqNu0I1sXcLW4D_fv-OEw9x0S50q8",
    authDomain: "dc-infotechpvt-1-d1a4b.firebaseapp.com",
    databaseURL: "https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com",
    projectId: "dc-infotechpvt-1-d1a4b",
    storageBucket: "dc-infotechpvt-1-d1a4b.firebasestorage.app",
    messagingSenderId: "330752838328",
    appId: "1:330752838328:web:1fe0ca04953934d4638703"
};

const GEMINI_URL = '/.netlify/functions/gemini-proxy';

// --- Initialization ---
let app, db, analytics;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    // analytics = getAnalytics(app); // Optional
    console.log("Firebase initialized");
} catch (e) {
    console.error("Firebase init error (expected if keys are missing):", e);
}

// --- DOM Elements ---
const micButton = document.getElementById('micButton');
const statusText = document.getElementById('statusText');
const transcriptionBox = document.getElementById('transcription');
const resultSection = document.getElementById('resultSection');
const saveButton = document.getElementById('saveButton');
const dateDisplay = document.getElementById('dateDisplay');
const manualInput = document.getElementById('manualInput');
const manualSubmitBtn = document.getElementById('manualSubmitBtn');

// Profile Elements
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const weightInput = document.getElementById('weightInput');
const closeModal = document.querySelector('.close-modal');

// --- State ---
let isListening = false;
let currentAnalysis = null;
let userProfile = JSON.parse(localStorage.getItem('macro_user_profile')) || { weight: 0 };

// --- Voice Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        micButton.classList.add('listening');
        statusText.textContent = "Listening...";
        transcriptionBox.classList.remove('hidden');
        transcriptionBox.textContent = "";
    };

    recognition.onend = () => {
        isListening = false;
        micButton.classList.remove('listening');
        statusText.textContent = "Tap to speak...";
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptionBox.textContent = `"${transcript}"`;
        statusText.textContent = "Analyzing...";

        await analyzeFood(transcript);
    };
} else {
    statusText.textContent = "Voice input not supported in this browser.";
    micButton.disabled = true;
}

// --- Event Listeners ---
micButton.addEventListener('click', () => {
    if (!recognition) return;
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

saveButton.addEventListener('click', async () => {
    if (!currentAnalysis) return;
    await saveMeal(currentAnalysis);
});

// --- Manual Input Listeners ---
manualSubmitBtn.addEventListener('click', () => {
    const text = manualInput.value.trim();
    if (text) {
        handleManualEntry(text);
    }
});

manualInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = manualInput.value.trim();
        if (text) {
            handleManualEntry(text);
        }
    }
});

async function handleManualEntry(text) {
    statusText.textContent = "Analyzing...";
    manualInput.value = ''; // Clear input
    transcriptionBox.textContent = `"${text}"`;
    transcriptionBox.classList.remove('hidden');
    await analyzeFood(text);
}

// --- Profile Event Listeners ---
profileBtn.addEventListener('click', () => {
    weightInput.value = userProfile.weight || '';
    profileModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    profileModal.classList.add('hidden');
});

saveProfileBtn.addEventListener('click', () => {
    const weight = parseFloat(weightInput.value);
    if (weight > 0) {
        userProfile.weight = weight;
        localStorage.setItem('macro_user_profile', JSON.stringify(userProfile));
        profileModal.classList.add('hidden');
        alert('Profile saved!');
        // Update recommended calories based on weight (Simple formula for MVP)
        updateDailySummary();
    } else {
        alert('Please enter a valid weight.');
    }
});

// Close modal on click outside
window.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.classList.add('hidden');
    }
});

// --- Core Helper Functions ---

// 1. Analyze Food with Groq (Llama 3)
async function analyzeFood(text) {
    const GROQ_URL = '/.netlify/functions/groq-proxy'; 
    const prompt = `
        You are a highly accurate Nutritional Expert API. 
        TASK: Analyze the food intake description: "${text}".
        
        GUIDELINES:
        1. If amounts are vague (handful, some, bowl), assume standard portions (30g nuts, 150g rice, 100g protein).
        2. Break down the calculation for each item internally.
        3. Return ONLY a JSON object with this structure:
        {
            "foodItems": ["Item details..."],
            "macros": { "protein": g, "carbs": g, "fats": g, "calories": kcal }
        }
    `;

    try {
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Groq API responded with error:', data.error);
            throw new Error(data.error.message || "Groq API failed");
        }

        if (data.choices && data.choices[0].message) {
            const resultText = data.choices[0].message.content;
            // parse the guaranteed JSON
            const analysis = JSON.parse(resultText.replace(/```json/gi, '').replace(/```/g, '').trim());

            displayResult(analysis);
            currentAnalysis = analysis; // Store for saving
        } else {
            throw new Error("Invalid response structure from Groq");
        }

        statusText.textContent = "Analysis complete.";

    } catch (error) {
        console.error('AI Error:', error);
        statusText.textContent = "Error analyzing food. Please try again.";
        transcriptionBox.textContent += " (Error: " + error.message + ")";
    }
}

// 2. Display Result
function displayResult(data) {
    resultSection.classList.remove('hidden');

    // Animate numbers (simple implementation)
    document.getElementById('proteinValue').textContent = `${data.macros.protein}g`;
    document.getElementById('carbsValue').textContent = `${data.macros.carbs}g`;
    document.getElementById('fatsValue').textContent = `${data.macros.fats}g`;
    document.getElementById('caloriesValue').textContent = `${data.macros.calories}`;

    // Show food list
    const listHtml = data.foodItems.map(item => `<span>• ${item}</span>`).join(' ');
    document.getElementById('foodList').innerHTML = listHtml;
}

// 3. Save to Firebase
async function saveMeal(data) {
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const localUserStr = localStorage.getItem('macro_user');
        const user = localUserStr ? JSON.parse(localUserStr) : { uid: "anon" };

        // Add timestamp
        const mealData = {
            ...data,
            timestamp: serverTimestamp(),
            dateString: new Date().toDateString(),
            userId: user.uid
        };

        if (db) {
            const mealsRef = ref(db, 'meals');
            await push(mealsRef, mealData);
            saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                saveButton.innerHTML = '<i class="fas fa-save"></i> Save Meal';
                resultSection.classList.add('hidden'); // correct flow? maybe keep it open
                updateDailySummary(); // Refresh summary
            }, 2000);
        } else {
            alert("Database not connected (check config)");
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Meal';
        }

    } catch (e) {
        console.error("Error adding document: ", e);
        saveButton.innerHTML = 'Error Saving';
    }
}

// 4. Update Daily Summary
async function updateDailySummary() {
    if (!db) return;

    const todayStr = new Date().toDateString();

    try {
        // Fix for "Index not defined" error: Fetch recent meals and filter in JS
        const mealsRef = ref(db, 'meals');
        // Get last 50 items
        const q = query(mealsRef, limitToLast(50));
        const snapshot = await get(q);

        let totalProtein = 0;
        let totalCalories = 0;
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                // Client-side filtering
                if (data.dateString === todayStr) {
                    totalProtein += data.macros.protein || 0;
                    totalCalories += data.macros.calories || 0;
                }
            });
        }

        // Calculate BMR / TDEE approximation (Mifflin-St Jeor rough estimate)
        // Default to 2500 if no weight, else roughly weight * 30 (very rough maintenance)
        const recommendedCalories = userProfile.weight ? Math.round(userProfile.weight * 30) : 2500;

        // Update UI
        document.getElementById('dailyProtein').textContent = `${Math.round(totalProtein)}g`;
        document.getElementById('dailyCalories').textContent = `${Math.round(totalCalories)} / ${recommendedCalories}`;

        // Update bars
        const calPercent = Math.min((totalCalories / recommendedCalories) * 100, 100);
        document.querySelector('.calories-fill').style.width = `${calPercent}%`;

        // Protein goal separate? Let's generic for now
        // document.querySelector('.protein-fill').style.width = ...

    } catch (e) {
        console.error("Error fetching summary:", e);
    }
}

// --- Init Logic ---
dateDisplay.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
updateDailySummary();

// Check if profile exists on load
if (!userProfile.weight) {
    setTimeout(() => {
        profileModal.classList.remove('hidden');
    }, 1000);
}
