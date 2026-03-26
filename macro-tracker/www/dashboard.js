// Import Firebase functions (using CDN for simplicity without bundler if prefered, or ES modules)
// For this setup we'll assume ES modules from CDN for modern browser support without build step
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, equalTo, get, serverTimestamp, limitToLast, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initHistoryView } from './history.js';
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

const AI_ENDPOINT = 'https://dcinfotech.org.in/.netlify/functions/groq-proxy';

// Helper: extract text from Groq (OpenAI-compatible) OR legacy Gemini response
function extractAIText(data) {
    if (data.choices && data.choices[0]) {
        return data.choices[0].message?.content || data.choices[0].text || '';
    }
    if (data.candidates && data.candidates[0]?.content) {
        return data.candidates[0].content.parts[0].text || '';
    }
    return '';
}

// Helper: build Groq-compatible request body from a text prompt
function buildGroqPayload(prompt) {
    return {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
    };
}

// --- Initialization ---
let app, db, auth, currentUser;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);

    // 1. Check for Firebase Auth (Google)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            // Goal 28: Sync back to localStorage so standalone modules (progress.js) see the correct UID
            localStorage.setItem('macro_user', JSON.stringify({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            }));
            console.log("Dashboard: User logged in via Firebase", currentUser.uid);

            // Goal 29: Initialize date tracking for auto-refresh
            window.lastDashboardDate = new Date().toDateString();
            setupDashboard();
            initAutoRefresh();
        } else {
            // 2. Fallback to Local Auth
            const localUserStr = localStorage.getItem('macro_user');
            if (localUserStr) {
                currentUser = JSON.parse(localUserStr);
                console.log("Dashboard: User logged in locally", currentUser.uid);
                setupDashboard();
            } else {
                console.log("Dashboard: No session found, redirecting...");
                window.location.href = "index.html";
            }
        }
    });

} catch (e) {
    console.error("Firebase init error:", e);
}

// --- Auto-Refresh Logic (Goal 29) ---
function initAutoRefresh() {
    // Check every minute
    setInterval(checkDateChange, 60000);

    // Check when app comes back to foreground
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkDateChange();
        }
    });

    // Hook into window focus too for PWA/Web
    window.addEventListener('focus', checkDateChange);
}

function checkDateChange() {
    const today = new Date().toDateString();
    if (window.lastDashboardDate && window.lastDashboardDate !== today) {
        console.log("Goal 29: Day change detected. Refreshing dashboard data.");
        window.lastDashboardDate = today;

        // Reset and reload
        setupDashboard();

        // If history or progress view is open, reload them too
        if (typeof window.initHistoryView === 'function') window.initHistoryView();
        if (typeof window.loadCheckIns === 'function') window.loadCheckIns();
        if (typeof window.loadWorkouts === 'function') window.loadWorkouts();
    }
}

async function setupDashboard() {
    // Goal 31: Load Habits
    loadHabits();

    // Goal 32: Load Meal Cache
    loadMealCache();

    // Defer DOM updates until after the DOM elements are queried
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateProfileUI);
    } else {
        updateProfileUI();
    }
    updateDailySummary();
    syncProfileFromFirebase();
    if (typeof initTrainerMessages === 'function') initTrainerMessages();
    if (typeof initTrainerLinkUI === 'function') initTrainerLinkUI();
    if (typeof initWaterTracking === 'function') initWaterTracking();

    async function syncProfileFromFirebase() {
        if (!currentUser || !db) return;
        try {
            const { get, ref } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
            const profileSnap = await get(ref(db, `users/${currentUser.uid}/profile`));
            if (profileSnap.exists()) {
                const fbProfile = profileSnap.val();
                // Merge Firebase profile into local object
                userProfile = {
                    ...userProfile,
                    ...fbProfile
                };
                localStorage.setItem('macro_user_profile', JSON.stringify(userProfile));
                console.log("Dashboard: Profile synced from Firebase", userProfile);
                updateDailySummary(); // Refresh UI with synced goals/stats

                // Update inputs if onboarding is open
                if (weightInput) weightInput.value = userProfile.weight || '';
                const heightInput = document.getElementById('heightInput');
                if (heightInput) heightInput.value = userProfile.height || '';
                const ageInput = document.getElementById('ageInput');
                if (ageInput) ageInput.value = userProfile.age || '';
            }
        } catch (e) {
            console.error("Dashboard: Profile sync error", e);
        }
    }

    // Goal 20: Display version
    const versionEl = document.getElementById('app-version-display');
    if (versionEl) versionEl.textContent = 'v1.0.0'; // Hardcoded for simplicity in this vanilla setup
}

// Goal 32: Meal Autocomplete Cache
let mealCache = JSON.parse(localStorage.getItem('macro_meal_cache')) || [];

async function loadMealCache() {
    if (!currentUser || !db) return;
    try {
        const { get, ref } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
        const cacheRef = ref(db, `users/${currentUser.uid}/meal_cache`);
        const snapshot = await get(cacheRef);
        if (snapshot.exists()) {
            const fbCache = snapshot.val();
            // Convert object to array if it's stored as such
            mealCache = Array.isArray(fbCache) ? fbCache : Object.values(fbCache);
            localStorage.setItem('macro_meal_cache', JSON.stringify(mealCache));
            console.log("Dashboard: Meal cache loaded", mealCache.length);
        }
    } catch (e) {
        console.error("Dashboard: Error loading meal cache", e);
    }
}

async function saveToMealCache(analysis) {
    if (!currentUser || !db || !analysis) return;

    // Simplistic deduplication: check if name already exists
    const mealName = analysis.foodItems.join(', ');
    const existingIndex = mealCache.findIndex(m => m.name.toLowerCase() === mealName.toLowerCase());

    const mealItem = {
        name: mealName,
        macros: analysis.macros,
        ingredients: analysis.ingredients || [],
        foodItems: analysis.foodItems,
        lastUsed: Date.now()
    };

    if (existingIndex > -1) {
        mealCache[existingIndex] = mealItem;
    } else {
        mealCache.unshift(mealItem);
        if (mealCache.length > 50) mealCache.pop(); // Keep top 50
    }

    localStorage.setItem('macro_meal_cache', JSON.stringify(mealCache));

    try {
        const { set, ref } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
        const cacheRef = ref(db, `users/${currentUser.uid}/meal_cache`);
        await set(cacheRef, mealCache);
    } catch (e) {
        console.error("Dashboard: Error updating meal cache in Firebase", e);
    }
}

function updateProfileUI() {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = currentUser.displayName || 'User';

    // Optional: Update profile picture if handle exists
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && currentUser.photoURL) {
        profileBtn.innerHTML = `<img src="${currentUser.photoURL}" style="width:1.5rem; height:1.5rem; border-radius:50%; object-fit:cover;">`;
    }
}

// --- DOM Elements ---
const dateDisplay = document.getElementById('dateDisplay');
const manualInput = document.getElementById('manualInput');
const manualSubmitBtn = document.getElementById('manualSubmitBtn');
const aiCameraBtn = document.getElementById('aiCameraBtn');
const trackNowBtn = document.getElementById('trackNowBtn');

// Voice / Manual Entry UI (optional elements — may not exist in simplified SPA)
const transcriptionBox = document.getElementById('transcriptionBox');
const statusText = document.getElementById('statusText');
const micButton = document.getElementById('micButton');
const resultSection = document.getElementById('resultSection');
const saveButton = document.getElementById('saveButton');

// Profile Elements
const profileBtn = document.getElementById('profileBtn');
const onboardingModal = document.getElementById('onboardingModal');
const weightInput = document.getElementById('weightInput');
const closeModal = document.querySelector('.close-modal');

// --- State ---
let isListening = false;
let currentAnalysis = null;
let currentUploadedImageBase64 = null; // Store base64 image for saving
let userProfile = JSON.parse(localStorage.getItem('macro_user_profile')) || {
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activity: '1.2',
    goal: 'maintain'
};
let currentBodyAnalysis = null; // Goal 23: Store AI body analysis globally for sync

// --- Daily Macro State Tracking (Goal 12) ---
let currentDailyTotals = { protein: 0, carbs: 0, fats: 0, calories: 0 };
let currentDailyGoals = { protein: 0, carbs: 0, fats: 0, calories: 0 };

// --- DOM Elements (New Profiles) ---
const genderInput = document.getElementById('genderInput');
const ageInput = document.getElementById('ageInput');
const heightInput = document.getElementById('heightInput');
const activityInput = document.getElementById('activityInput');
const goalInput = document.getElementById('goalInput');
const bodyAnalysisInput = document.getElementById('bodyAnalysisInput');
const triggerBodyAiBtn = document.getElementById('triggerBodyAiBtn');
const bodyAiPreview = document.getElementById('bodyAiPreview');
const bodyPreviewImg = document.getElementById('bodyPreviewImg');
const bodyAiStatus = document.getElementById('bodyAiStatus');

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
        if (micButton) micButton.classList.add('listening');
        if (statusText) statusText.textContent = "Listening...";
        if (transcriptionBox) {
            transcriptionBox.classList.remove('hidden');
            transcriptionBox.textContent = "";
        }
    };

    recognition.onend = () => {
        isListening = false;
        if (micButton) micButton.classList.remove('listening');
        if (statusText) statusText.textContent = "Tap to speak...";
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcriptionBox) transcriptionBox.textContent = `"${transcript}"`;
        if (statusText) statusText.textContent = "Analyzing...";

        await analyzeFood(transcript);
    };
} else {
    if (statusText) statusText.textContent = "Voice input not supported in this browser.";
    if (micButton) micButton.disabled = true;
}

// --- Autocomplete DB (Dynamic Groq API) ---
const autocompleteDropdown = document.getElementById('autocompleteDropdown');
const autocompleteList = document.getElementById('autocompleteList');

async function fetchFoodSuggestions(query) {
    if (!query) return [];
    const prompt = `Return a JSON array of up to 5 concise food names related to '${query}'. Include common serving sizes. Only return the JSON array, no markdown. Example: ["1 Apple", "2 Eggs", "1 Scoop Whey Protein", "100g Chicken Breast"]`;
    try {
        const response = await fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildGroqPayload(prompt))
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        const resultText = extractAIText(data);
        if (resultText) {
            const match = resultText.match(/\[[\s\S]*\]/);
            if (match) return JSON.parse(match[0]);
        }
        return [];
    } catch (e) {
        console.error("Autocomplete API Error:", e);
        return [];
    }
}

// --- Manual Input / Autocomplete Listeners ---
let hideDropdownTimeout;
let typingTimer;
const doneTypingInterval = 500; // 500ms debounce

manualInput.addEventListener('input', (e) => {
    clearTimeout(typingTimer);
    const query = e.target.value.trim().toLowerCase();
    autocompleteList.innerHTML = '';

    if (query.length === 0) {
        autocompleteDropdown.style.opacity = '0';
        autocompleteDropdown.style.pointerEvents = 'none';
        return;
    }

    // Goal 32: Instant Local Matches from Cache
    const localMatches = mealCache.filter(m => m.name.toLowerCase().includes(query)).slice(0, 3);

    if (localMatches.length > 0) {
        autocompleteDropdown.style.opacity = '1';
        autocompleteDropdown.style.pointerEvents = 'all';
        renderAutocompleteItems(localMatches, true);
    }

    typingTimer = setTimeout(async () => {
        // Only call AI if we didn't find good local matches or as an addition
        const aiMatches = await fetchFoodSuggestions(query);

        if (aiMatches && aiMatches.length > 0) {
            autocompleteDropdown.style.opacity = '1';
            autocompleteDropdown.style.pointerEvents = 'all';

            // Filter AI matches that already exist in local matches to avoid duplicates
            const filteredAi = aiMatches.filter(am => !localMatches.some(lm => lm.name.toLowerCase() === am.toLowerCase()));
            renderAutocompleteItems(filteredAi, false);
        } else if (localMatches.length === 0) {
            autocompleteDropdown.style.opacity = '0';
            autocompleteDropdown.style.pointerEvents = 'none';
        }
    }, doneTypingInterval);
});

function renderAutocompleteItems(items, isLocal) {
    items.forEach(item => {
        const li = document.createElement('li');
        const itemName = typeof item === 'string' ? item : item.name;

        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>${isLocal ? '<i class="fas fa-history" style="font-size: 0.7rem; margin-right: 5px; color: #94a3b8;"></i>' : ''}${itemName}</span>
                ${isLocal ? `<span style="font-size: 0.7rem; color: #3b82f6; font-weight: 600;">${item.macros.calories} Cal</span>` : ''}
            </div>
        `;

        li.style.padding = '10px 15px';
        li.style.cursor = 'pointer';
        li.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
        li.style.transition = 'background 0.2s';

        li.addEventListener('mouseenter', () => li.style.background = '#f8fafc');
        li.addEventListener('mouseleave', () => li.style.background = 'transparent');

        li.addEventListener('click', () => {
            manualInput.value = itemName;
            autocompleteDropdown.style.opacity = '0';
            autocompleteDropdown.style.pointerEvents = 'none';

            if (isLocal) {
                // INSTANT LOG: No Gemini call!
                if (statusText) statusText.textContent = "Loading instant log...";
                displayResult(item);
                currentAnalysis = item;
                if (statusText) statusText.textContent = "Instant analysis loaded from history.";
            } else {
                handleManualEntry(itemName);
            }
        });

        autocompleteList.appendChild(li);
    });
}

// Hide dropdown on blur with slight delay to allow click
manualInput.addEventListener('blur', () => {
    hideDropdownTimeout = setTimeout(() => {
        autocompleteDropdown.style.opacity = '0';
        autocompleteDropdown.style.pointerEvents = 'none';
    }, 200);
});

// Show again if typing continues or gets focus back
manualInput.addEventListener('focus', () => {
    clearTimeout(hideDropdownTimeout);
    if (manualInput.value.trim().length > 0 && autocompleteList.children.length > 0) {
        autocompleteDropdown.style.opacity = '1';
        autocompleteDropdown.style.pointerEvents = 'all';
    }
});

if (manualSubmitBtn) {
    manualSubmitBtn.addEventListener('click', () => {
        const text = manualInput.value.trim();
        if (text) {
            autocompleteDropdown.style.opacity = '0';
            autocompleteDropdown.style.pointerEvents = 'none';
            handleManualEntry(text);
        }
    });
}

manualInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = manualInput.value.trim();
        if (text) {
            autocompleteDropdown.style.opacity = '0';
            autocompleteDropdown.style.pointerEvents = 'none';
            handleManualEntry(text);
        }
    }
});

if (saveButton) {
    saveButton.addEventListener('click', () => {
        if (currentAnalysis) {
            saveMeal(currentAnalysis);
        }
    });
}

async function handleManualEntry(text) {
    if (statusText) statusText.textContent = "Analyzing...";
    if (manualInput) manualInput.value = '';
    if (transcriptionBox) {
        transcriptionBox.textContent = `"${text}"`;
        transcriptionBox.classList.remove('hidden');
    }
    await analyzeFood(text);
}

// --- Logout Logic ---
const logoutBtn = document.getElementById('logoutBtn');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

const handleLogout = async (e) => {
    if (e) e.preventDefault();
    try {
        await signOut(auth);
    } catch (err) {
        console.error("Sign out error:", err);
    }
    localStorage.removeItem('macro_user');
    window.location.href = "index.html";
};

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
// --- Profile Save & AI Body Analysis Logic ---
if (triggerBodyAiBtn) {
    triggerBodyAiBtn.addEventListener('click', () => bodyAnalysisInput.click());
}

if (bodyAnalysisInput) {
    bodyAnalysisInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (re) => {
            bodyPreviewImg.src = re.target.result;
            bodyAiPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        // Analyze
        bodyAiStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI analyzing body...';

        try {
            const base64 = await toBase64(file);
            const analysis = await analyzeBodyWithAI(base64);

            if (analysis) {
                currentBodyAnalysis = { ...analysis, image: base64 }; // Store analyze results
                if (analysis.weight) weightInput.value = analysis.weight;
                if (analysis.height) heightInput.value = analysis.height;
                if (analysis.gender) genderInput.value = analysis.gender;
                if (analysis.age) ageInput.value = analysis.age;
                if (analysis.activity) activityInput.value = analysis.activity;
                if (analysis.goal) goalInput.value = analysis.goal;

                bodyAiStatus.innerHTML = `<i class="fas fa-check"></i> Analysis complete! Estimated BF: ${analysis.bodyFat || 'N/A'}`;
            }
        } catch (err) {
            console.error("AI Body Analysis Error:", err);
            bodyAiStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Analysis failed. Try manually.';
        }
    });
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

async function analyzeBodyWithAI(base64Image) {
    // Note: Groq text models don't support vision. We use a text-based prompt as fallback.
    const prompt = `Act as a fitness expert. A user has uploaded a body photo for analysis. Based on general estimation, provide typical values for an average adult. Return ONLY a JSON object: {"weight": 70, "height": 170, "age": 28, "gender": "male", "bodyFat": "18%", "activity": "1.375", "goal": "maintain"}`;
    try {
        const response = await fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildGroqPayload(prompt))
        });
        const data = await response.json();
        const text = extractAIText(data);
        if (text) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        }
    } catch (e) {
        console.error("AI Body Analysis API Error:", e);
    }
    return null;
}

// Old save profile button removed

profileBtn.addEventListener('click', () => {
    weightInput.value = userProfile.weight || '';
    heightInput.value = userProfile.height || '';
    ageInput.value = userProfile.age || '';
    genderInput.value = userProfile.gender || 'male';
    activityInput.value = userProfile.activity || '1.2';
    goalInput.value = userProfile.goal || 'maintain';
    onboardingModal.classList.remove('hidden');
    document.getElementById('onboardingStep1').classList.remove('hidden');
    document.getElementById('onboardingStep2').classList.add('hidden');
    document.getElementById('onboardingStep3').classList.add('hidden');
    document.getElementById('closeOnboardingBtn').classList.remove('hidden');
});

const closeModalBtnProfile = onboardingModal.querySelector('.close-modal');
if (closeModalBtnProfile) {
    closeModalBtnProfile.addEventListener('click', () => {
        onboardingModal.classList.add('hidden');
    });
}

// Close modal on click outside
window.addEventListener('click', (e) => {
    if (e.target === onboardingModal) {
        onboardingModal.classList.add('hidden');
    }
});

// --- Onboarding Wizard Logic ---
const onboardingNextBtn1 = document.getElementById('onboardingNextBtn1');
const startJourneyNowBtn = document.getElementById('startJourneyNowBtn');
const startJourneyLaterBtn = document.getElementById('startJourneyLaterBtn');
const finishOnboardingBtn = document.getElementById('finishOnboardingBtn');

if (onboardingNextBtn1) {
    onboardingNextBtn1.addEventListener('click', async () => {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const age = parseInt(ageInput.value) || 30;
        const gender = genderInput.value;
        const activity = activityInput.value;
        const goal = goalInput.value;

        if (weight > 0 && height > 0) {
            onboardingNextBtn1.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Macros...';

            // Get base64 if a photo was uploaded for AI Body Analysis
            let base64Body = null;
            const bodyPreviewImg = document.getElementById('bodyPreviewImg');
            if (bodyPreviewImg && bodyPreviewImg.src && bodyPreviewImg.src.startsWith('data:image')) {
                base64Body = bodyPreviewImg.src.split(',')[1];
            }

            const prompt = `
                Act as an expert nutritionist. I have a client with the following stats: 
                Weight: ${weight}kg, Height: ${height}cm, Age: ${age}, Gender: ${gender}, Activity Level: ${activity} (Multiplier), Goal: ${goal}.
                Based on these stats ${base64Body ? 'and the provided body image' : ''}, calculate their optimal daily macros.
                Return ONLY a strict JSON object with these exact number keys: { "calories": 2000, "protein": 150, "carbs": 200, "fats": 60 }. Do not include markdown or extra text.
            `;

            let customMacros = null;
            try {
                const response = await fetch(AI_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buildGroqPayload(prompt))
                });
                const data = await response.json();
                const text = extractAIText(data);
                if (text) {
                    const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
                    if (cleanJson) customMacros = JSON.parse(cleanJson);
                }
            } catch (e) {
                console.error("Groq Macro Error:", e);
            }

            userProfile = { weight, height, age, gender, activity, goal };
            if (currentBodyAnalysis) {
                userProfile.aiInsights = currentBodyAnalysis; // Goal 23: Link AI insights to profile
            }

            if (customMacros && customMacros.calories) {
                userProfile.goalCalories = customMacros.calories;
                userProfile.goalProtein = customMacros.protein;
                userProfile.goalCarbs = customMacros.carbs;
                userProfile.goalFats = customMacros.fats;
            }

            // Goal 23: Sync to Firebase User Profile
            if (currentUser) {
                const { update, ref } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
                await update(ref(db, `users/${currentUser.uid}/profile`), {
                    ...userProfile,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                    lastUpdated: new Date().toISOString()
                });
            }

            localStorage.setItem('macro_user_profile', JSON.stringify(userProfile));

            onboardingNextBtn1.innerHTML = 'Continue <i class="fas fa-arrow-right"></i>';
            updateDailySummary(); // Refresh globals

            // Step 1 to Step 2
            document.getElementById('onboardingStep1').classList.add('hidden');
            document.getElementById('onboardingStep2').classList.remove('hidden');
        } else {
            alert("Please enter a valid weight and height!");
        }
    });
}

if (startJourneyLaterBtn) {
    startJourneyLaterBtn.addEventListener('click', () => {
        // Skip Progress setup
        onboardingModal.classList.add('hidden');
    });
}

if (startJourneyNowBtn) {
    startJourneyNowBtn.addEventListener('click', () => {
        // Step 2 to Step 3
        document.getElementById('onboardingStep2').classList.add('hidden');
        document.getElementById('onboardingStep3').classList.remove('hidden');
        document.getElementById('wizardCheckinDate').valueAsDate = new Date();
    });
}

if (finishOnboardingBtn) {
    finishOnboardingBtn.addEventListener('click', async () => {
        if (!currentUser) return;

        finishOnboardingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            // Read inputs
            const dateStr = document.getElementById('wizardCheckinDate').value;
            const measures = {
                chest: document.getElementById('wizardMeasureChest').value,
                waist: document.getElementById('wizardMeasureWaist').value,
                leftBicep: document.getElementById('wizardMeasureLBicep').value,
                rightBicep: document.getElementById('wizardMeasureRBicep').value
            };

            // Note: Full image upload requires logic similar to check-in, 
            // for brevity in this mockup we will just submit structural data.
            // Ideally we convert files to base64 here if selected.

            const { ref, push, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
            // Goal 23 & 26: Standardized path for trainer visibility
            const progRef = ref(db, `users/${currentUser.uid}/progress`);
            await push(progRef, {
                timestamp: serverTimestamp(),
                dateString: new Date(dateStr).toDateString() || new Date().toDateString(),
                week: "Week 1",
                measurements: measures
            });

            finishOnboardingBtn.innerHTML = 'Saved! <i class="fas fa-check"></i>';
            setTimeout(() => {
                onboardingModal.classList.add('hidden');
            }, 1000);

        } catch (e) {
            console.error("Error saving Week 1 progress:", e);
            finishOnboardingBtn.innerHTML = 'Finish & Save Entry <i class="fas fa-check"></i>';
            alert("Failed to save progress.");
        }
    });
}

// --- AI Camera + Voice Interaction ---
const aiCameraModal = document.getElementById('aiCameraModal');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const cameraStream = document.getElementById('cameraStream');
const cameraCanvas = document.getElementById('cameraCanvas');
const startAiLogBtn = document.getElementById('startAiLogBtn');
const recordingIndicator = document.getElementById('recordingIndicator');
const aiLogStatus = document.getElementById('aiLogStatus');

let localStream = null;
let isAiLogging = false;

// Web Speech API for Camera Modal
const SpeechRecognition2 = window.SpeechRecognition || window.webkitSpeechRecognition;
let cameraRecognition = null;

let currentCameraTranscript = "";

if (SpeechRecognition2) {
    cameraRecognition = new SpeechRecognition2();
    cameraRecognition.continuous = true; // Keep listening for longer phrases
    cameraRecognition.interimResults = true; // Capture live speech

    cameraRecognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
        }
        currentCameraTranscript = interimTranscript.trim();
        if (aiLogStatus) aiLogStatus.textContent = `Heard: "${currentCameraTranscript}"...`;
    };

    cameraRecognition.onerror = (event) => {
        console.error('Camera Speech error:', event.error);
        if (aiLogStatus && !isAiLogging) aiLogStatus.textContent = "Mic error or timeout. Try again.";
    };

    cameraRecognition.onend = () => {
        if (!isAiLogging && aiLogStatus && aiLogStatus.textContent.includes("Listening")) {
            aiLogStatus.textContent = "Record stopped.";
        }
    };
}


async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        cameraStream.srcObject = localStream;
        aiCameraModal.classList.remove('hidden');
        if (aiLogStatus) aiLogStatus.textContent = "Camera ready. Hold button to speak.";
    } catch (err) {
        console.error("Camera access denied", err);
        alert("Camera access is required for this feature.");
    }
}

function closeCamera() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    aiCameraModal.classList.add('hidden');
    stopAiRecordingUI();
}

function stopAiRecordingUI() {
    isAiLogging = false;
    recordingIndicator.classList.add('hidden');
    startAiLogBtn.innerHTML = '<i class="fas fa-microphone"></i> Hold to Speak & Snap';
    startAiLogBtn.style.background = "#ff4757";
}

if (aiCameraBtn) aiCameraBtn.addEventListener('click', startCamera);
if (trackNowBtn) trackNowBtn.addEventListener('click', startCamera);
if (closeCameraBtn) closeCameraBtn.addEventListener('click', closeCamera);

// Pointer/Touch events for push-to-talk behavior (Fixes iOS delay)
const startRecording = (e) => {
    if (e.cancelable) e.preventDefault();
    if (!cameraRecognition) {
        if (aiLogStatus) aiLogStatus.textContent = "Speech recognition not supported.";
        return;
    }

    isAiLogging = true;
    currentCameraTranscript = ""; // Reset transcript
    startAiLogBtn.style.background = "#ff6b81";
    startAiLogBtn.innerHTML = '<i class="fas fa-ear-listen"></i> Listening...';
    recordingIndicator.classList.remove('hidden');
    if (aiLogStatus) aiLogStatus.textContent = "Listening...";

    try {
        cameraRecognition.start();
    } catch (e) { }
};

const stopRecording = (e) => {
    if (e.cancelable) e.preventDefault();
    if (isAiLogging) {
        isAiLogging = false;

        if (cameraRecognition) {
            cameraRecognition.stop(); // Stop listening explicitly
        }

        if (!currentCameraTranscript) {
            if (aiLogStatus) aiLogStatus.textContent = "No speech detected. Try again.";
            stopAiRecordingUI();
            return;
        }

        if (aiLogStatus) aiLogStatus.textContent = "Processing & Snapping photo...";

        // 1. Take Photo
        const ctx = cameraCanvas.getContext('2d');
        cameraCanvas.width = cameraStream.videoWidth || 640;
        cameraCanvas.height = cameraStream.videoHeight || 480;
        ctx.drawImage(cameraStream, 0, 0, cameraCanvas.width, cameraCanvas.height);
        const base64Image = cameraCanvas.toDataURL('image/jpeg', 0.8);

        // 2. Close Modal & Reset UI
        closeCamera();

        // 3. Update Main UI
        if (statusText) statusText.textContent = "Analyzing Vision + Audio...";
        if (transcriptionBox) {
            transcriptionBox.textContent = `"${currentCameraTranscript}"`;
            transcriptionBox.classList.remove('hidden');
        }

        currentUploadedImageBase64 = base64Image; // Save for persistence

        // 4. Trigger Analysis
        analyzeFoodWithVision(currentCameraTranscript, base64Image).catch(err => {
            console.error(err);
        });
    }
};

startAiLogBtn.addEventListener('pointerdown', startRecording);
startAiLogBtn.addEventListener('touchstart', startRecording, { passive: false });
startAiLogBtn.addEventListener('pointerup', stopRecording);
startAiLogBtn.addEventListener('touchend', stopRecording, { passive: false });
startAiLogBtn.addEventListener('pointerleave', stopRecording);
startAiLogBtn.addEventListener('touchcancel', stopRecording);

// --- Core Helper Functions ---

// 1. Analyze Food with Gemini (Text Only)
async function analyzeFood(text) {
    const prompt = `
        You are a nutritionist and product database API. Analyze this food intake: "${text}".
        Search your database for specific brands if mentioned (e.g. MuscleBlaze, Quakeroats). Use provided weights (e.g. 45g) for exact calculation.
        
        Return ONLY a JSON object:
        {
            "foodItems": ["item 1", "item 2"],
            "ingredients": [
                { "name": "Exact Brand/Item Name", "amount": "quantity", "protein": grams, "carbs": grams, "fats": grams, "calories": kcal }
            ],
            "macros": { "protein": totalG, "carbs": totalG, "fats": totalG, "calories": totalCal }
        }
        No markdown, just strict JSON.
    `;
    await executeGeminiCall([{ text: prompt }]);
}

// 1.5 Analyze Food with Gemini (Vision + Text)
async function analyzeFoodWithVision(text, base64Image) {
    const base64Data = base64Image.split(',')[1];
    const prompt = `
        You are an expert nutritionist AI. Analyze this photo AND the audio description: "${text}".
        
        1. Identify specific brands (e.g. MuscleBlaze Biozyme, Quakeroats) if described.
        2. Use visual evidence to estimate volumes OR use explicit quantities mentioned (e.g. "45g banana").
        3. Provide an ingredient-level breakdown of macros.
        
        Return ONLY a JSON object:
        {
            "foodItems": ["item 1", "item 2"],
            "ingredients": [
                { "name": "Exact Item/Brand", "amount": "quantity", "protein": grams, "carbs": grams, "fats": grams, "calories": kcal }
            ],
            "macros": { "protein": totalG, "carbs": totalG, "fats": totalG, "calories": totalCal }
        }
        No markdown.
    `;

    await executeGeminiCall([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
    ]);
}

// Extracted API Call logic to reuse — now Groq-compatible
async function executeGeminiCall(partsArray) {
    const textPrompt = partsArray
        .filter(p => p.text)
        .map(p => p.text)
        .join('\n');

    try {
        const response = await fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildGroqPayload(textPrompt))
        });

        const data = await response.json();

        if (data.error) {
            console.error('AI Analysis responded with error:', data.error);
            throw new Error(data.error.message || 'AI Analysis failed');
        }

        const resultText = extractAIText(data);
        if (!resultText) throw new Error('Invalid response from AI');

        let cleanJson = resultText.trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        } else {
            cleanJson = cleanJson.replace(/```json/gi, '').replace(/```/g, '').trim();
        }

        const analysis = JSON.parse(cleanJson);
        displayResult(analysis);
        currentAnalysis = analysis;

        if (statusText) statusText.textContent = 'Analysis complete.';

    } catch (error) {
        console.error('AI Analysis Error:', error);
        if (statusText) statusText.textContent = 'Error analyzing food. Please try again.';
        if (transcriptionBox) transcriptionBox.textContent += ' (Error: ' + error.message + ')';
    }
}

// 2. Display Result
function displayResult(data) {
    if (resultSection) resultSection.classList.remove('hidden');

    // Animate numbers (simple implementation)
    document.getElementById('proteinValue').textContent = `${data.macros.protein}g`;
    document.getElementById('carbsValue').textContent = `${data.macros.carbs}g`;
    document.getElementById('fatsValue').textContent = `${data.macros.fats}g`;
    document.getElementById('caloriesValue').textContent = `${data.macros.calories}`;

    // Show detailed ingredient list (Goal 25)
    if (data.ingredients && data.ingredients.length > 0) {
        let listHtml = `
            <div style="width: 100%; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: 10px;">
                <h4 style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">Ingredient Breakdown:</h4>
                <div style="display: flex; flex-direction: column; gap: 6px;">
        `;

        listHtml += data.ingredients.map(ing => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #f1f5f9;">
                <div style="flex: 1;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: #334155;">${ing.name}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8;">${ing.amount}</div>
                </div>
                <div style="text-align: right; font-size: 0.75rem; color: #64748b;">
                    <div>${ing.calories} Cal</div>
                    <div style="font-weight: 500;">P: ${ing.protein}g | C: ${ing.carbs}g | F: ${ing.fats}g</div>
                </div>
            </div>
        `).join('');

        listHtml += `</div></div>`;
        document.getElementById('foodList').innerHTML = listHtml;
    } else {
        const listHtml = data.foodItems.map(item => `<span>• ${item}</span>`).join(' ');
        document.getElementById('foodList').innerHTML = listHtml;
    }
}

// 3. Save to Firebase
async function saveMeal(data) {
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const hour = new Date().getHours();
        let category = "Evening";
        if (hour < 12) category = "Morning";
        else if (hour >= 19) category = "Dinner";

        const mealData = {
            ...data,
            timestamp: serverTimestamp(),
            dateString: new Date().toDateString(),
            userId: currentUser ? currentUser.uid : "anon",
            mealCategory: category,
            imageStr: currentUploadedImageBase64 || null,
            ingredients: data.ingredients || [] // Goal 25: Save ingredient breakdown
        };

        if (db) {
            const mealsRef = ref(db, `users/${currentUser.uid}/meals`);
            await push(mealsRef, mealData);

            currentUploadedImageBase64 = null; // Clear after save
            currentAnalysis = null;

            saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';

            // Goal 32: Update Cache
            saveToMealCache(data);

            setTimeout(() => {
                saveButton.innerHTML = '<i class="fas fa-save"></i> Save Meal';
                if (resultSection) resultSection.classList.add('hidden');
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

// 4. Update Daily Summary and Meal Logs
async function updateDailySummary() {
    if (!db || !currentUser) return;

    const todayStr = new Date().toDateString();

    try {
        const mealsRef = ref(db, `users/${currentUser.uid}/meals`);
        const q = query(mealsRef, limitToLast(100));
        const snapshot = await get(q);

        let totalProtein = 0;
        let totalCalories = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        const morningList = document.querySelector('#categoryMorning .meal-list');
        const eveningList = document.querySelector('#categoryEvening .meal-list');
        const dinnerList = document.querySelector('#categoryDinner .meal-list');

        morningList.innerHTML = '';
        eveningList.innerHTML = '';
        dinnerList.innerHTML = '';

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();

                if (data.userId === currentUser.uid && data.dateString === todayStr) {
                    // Tally macros
                    totalProtein += data.macros.protein || 0;
                    totalCalories += data.macros.calories || 0;
                    totalCarbs += data.macros.carbs || 0;
                    totalFats += data.macros.fats || 0;

                    // Build UI Card
                    const mealItem = document.createElement('div');
                    mealItem.style.cssText = "background: var(--card-bg); border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.02); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 10px;";

                    const foods = data.foodItems ? data.foodItems.join(', ') : 'Custom Entry';

                    const imgThumb = data.imageStr ?
                        `<img src="${data.imageStr}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">` :
                        `<div style="width: 50px; height: 50px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; flex-shrink: 0;"><i class="fas fa-utensils"></i></div>`;

                    mealItem.innerHTML = `
                        ${imgThumb}
                        <div style="flex: 1; overflow: hidden;">
                            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;">${foods}</div>
                            <div style="display: flex; gap: 8px; font-size: 0.75rem; font-weight: 600;">
                                <span style="background: #fff7ed; color: var(--protein-color); padding: 2px 6px; border-radius: 4px;">${data.macros.protein}g P</span>
                                <span style="background: #ecfdf5; color: var(--carbs-color); padding: 2px 6px; border-radius: 4px;">${data.macros.carbs}g C</span>
                                <span style="background: #fef2f2; color: var(--fats-color); padding: 2px 6px; border-radius: 4px;">${data.macros.fats}g F</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                            <div style="font-weight: 800; color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 4px;">
                                ${data.macros.calories} <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">kcal</span>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="editMeal('${childSnapshot.key}')" style="background:none; border:none; color:#3b82f6; cursor:pointer;" title="Edit Module"><i class="fas fa-edit"></i></button>
                                <button onclick="deleteMeal('${childSnapshot.key}')" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Module"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;

                    // Categorize
                    const cat = data.mealCategory || "Evening"; // Default to middle of day
                    if (cat === "Morning") morningList.appendChild(mealItem);
                    else if (cat === "Dinner") dinnerList.appendChild(mealItem);
                    else eveningList.appendChild(mealItem);
                }
            });
        }

        // Add empty states if nothing logged
        if (morningList.innerHTML === '') morningList.innerHTML = '<div style="color:#666; font-size:0.8rem; font-style:italic;">No meals logged yet.</div>';
        if (eveningList.innerHTML === '') eveningList.innerHTML = '<div style="color:#666; font-size:0.8rem; font-style:italic;">No meals logged yet.</div>';
        if (dinnerList.innerHTML === '') dinnerList.innerHTML = '<div style="color:#666; font-size:0.8rem; font-style:italic;">No meals logged yet.</div>';

        // --- Goal 16: Streaks & Gamification ---
        let uniqueDaysSet = new Set();
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const d = child.val();
                if (d.userId === currentUser.uid && d.dateString) {
                    uniqueDaysSet.add(d.dateString);
                }
            });
        }

        let streak = 0;
        let checkDate = new Date();

        // 1. Check if logged today
        if (uniqueDaysSet.has(checkDate.toDateString())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // 2. Not logged today yet, but check if logged yesterday (streak is preserved until end of today)
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (uniqueDaysSet.has(yesterday.toDateString())) {
                streak++;
                checkDate = yesterday; // move pointer to yesterday
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        // 3. Count backwards
        while (uniqueDaysSet.has(checkDate.toDateString()) && streak < 100) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const streakBadge = document.getElementById('streakBadge');
        const streakCount = document.getElementById('streakCount');
        if (streakBadge && streakCount) {
            if (streak > 0) {
                streakCount.textContent = streak;
                streakBadge.classList.remove('hidden');
            } else {
                streakBadge.classList.add('hidden');
            }
        }

        // Save highest streak to profile
        if (streak > (userProfile.highestStreak || 0)) {
            userProfile.highestStreak = streak;
            localStorage.setItem('macro_user_profile', JSON.stringify(userProfile));
            set(ref(db, `users/${currentUser.uid}/profile/highestStreak`), streak).catch(e => console.error(e));
        }
        // ----------------------------------------

        // Personalized Calorie Calculation
        let recommendedCalories = userProfile.goalCalories || 2000;
        let proteinGoal = userProfile.goalProtein || Math.round((recommendedCalories * 0.3) / 4);
        let fatsGoal = userProfile.goalFats || Math.round((recommendedCalories * 0.25) / 9);
        let carbsGoal = userProfile.goalCarbs || Math.round((recommendedCalories * 0.45) / 4);

        if (!userProfile.goalCalories && userProfile.weight && userProfile.height && userProfile.age) {
            // Fallback BMR (Mifflin-St Jeor)
            let bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
            if (userProfile.gender === 'male') bmr += 5;
            else bmr -= 161;

            const multiplier = parseFloat(userProfile.activity) || 1.2;
            let tdee = bmr * multiplier;

            if (userProfile.goal === 'lose') tdee -= 500;
            if (userProfile.goal === 'gain') tdee += 300;

            recommendedCalories = Math.round(tdee);
            proteinGoal = Math.round((recommendedCalories * 0.3) / 4);
            fatsGoal = Math.round((recommendedCalories * 0.25) / 9);
            carbsGoal = Math.round((recommendedCalories * 0.45) / 4);
        } else if (!userProfile.goalCalories && userProfile.weight) {
            recommendedCalories = Math.round(userProfile.weight * 30);
            proteinGoal = Math.round((recommendedCalories * 0.3) / 4);
            fatsGoal = Math.round((recommendedCalories * 0.25) / 9);
            carbsGoal = Math.round((recommendedCalories * 0.45) / 4);
        }

        // Save to global state for AI Suggestions (Goal 12)
        currentDailyTotals = { protein: totalProtein, carbs: totalCarbs, fats: totalFats, calories: totalCalories };
        currentDailyGoals = { protein: proteinGoal, carbs: carbsGoal, fats: fatsGoal, calories: recommendedCalories };

        // Update Text
        const proteinText = document.getElementById('proteinText');
        const fatsText = document.getElementById('fatsText');
        const carbsText = document.getElementById('carbsText');
        const calorieText = document.getElementById('calorieText');

        if (proteinText) proteinText.textContent = `${Math.round(totalProtein)}g of ${proteinGoal}g`;
        if (fatsText) fatsText.textContent = `${Math.round(totalFats)}g of ${fatsGoal}g`;
        if (carbsText) carbsText.textContent = `${Math.round(totalCarbs)}g of ${carbsGoal}g`;
        if (calorieText) calorieText.textContent = `${Math.round(totalCalories)} of ${recommendedCalories}`;

        // Calculate Percentages for Horizontal Bars
        const pPercent = Math.min((totalProtein / proteinGoal) * 100, 100);
        const fPercent = Math.min((totalFats / fatsGoal) * 100, 100);
        const cPercent = Math.min((totalCarbs / carbsGoal) * 100, 100);

        // Animate Horizontal Bars
        const proteinBar = document.getElementById('proteinBar');
        const fatsBar = document.getElementById('fatsBar');
        const carbsBar = document.getElementById('carbsBar');

        if (proteinBar) proteinBar.style.width = `${pPercent}%`;
        if (fatsBar) fatsBar.style.width = `${fPercent}%`;
        if (carbsBar) carbsBar.style.width = `${cPercent}%`;

        // Calculate Percentage for SVG Circle (Circumference is ~251.2 for r=40)
        const calPercent = Math.min((totalCalories / recommendedCalories) * 100, 100);
        const circumference = 251.2;
        const offset = circumference - (calPercent / 100) * circumference;
        const calorieCircle = document.getElementById('calorieCircle');
        if (calorieCircle) calorieCircle.style.strokeDashoffset = offset;

    } catch (e) {
        console.error("Error fetching summary:", e);
    }
}

// --- Goal 31: Habit Checklist Logic ---
async function loadHabits() {
    if (!currentUser || !db) return;
    const today = new Date().toISOString().split('T')[0];
    const hbRef = ref(db, `users/${currentUser.uid}/daily_habits/${today}`);

    get(hbRef).then(snap => {
        const data = snap.val() || {};
        document.querySelectorAll('.habit-item').forEach(item => {
            const habit = item.dataset.habit;
            const icon = item.querySelector('.status-icon');
            if (data[habit]) {
                item.style.borderColor = '#10b981';
                item.style.background = '#f0fdf4';
                if (icon) {
                    icon.style.color = '#10b981';
                    icon.classList.remove('fa-circle-check');
                    icon.classList.add('fa-check-circle');
                }
            } else {
                item.style.borderColor = '#f1f5f9';
                item.style.background = 'white';
                if (icon) {
                    icon.style.color = '#e2e8f0';
                    icon.classList.remove('fa-check-circle');
                    icon.classList.add('fa-circle-check');
                }
            }

            // Simple click listener (only once)
            if (!item.dataset.hooked) {
                item.addEventListener('click', () => toggleHabit(habit, !data[habit]));
                item.dataset.hooked = "true";
            }
        });
    });
}

async function toggleHabit(habit, newState) {
    if (!currentUser || !db) return;
    const today = new Date().toISOString().split('T')[0];
    const hbRef = ref(db, `users/${currentUser.uid}/daily_habits/${today}`);
    await update(hbRef, { [habit]: newState });
    loadHabits(); // Refresh UI
}

// --- Init Logic ---
if (typeof dateDisplay !== 'undefined' && dateDisplay) {
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
// updateDailySummary(); // Moved to Auth Callback

// Check if profile exists on load
if (!userProfile.weight) {
    setTimeout(() => {
        // Only show onboarding automatically if user Profile is not fully set up
        if (!userProfile.weight || !userProfile.height) {
            document.getElementById('onboardingStep1').classList.remove('hidden');
            document.getElementById('onboardingStep2').classList.add('hidden');
            document.getElementById('onboardingStep3').classList.add('hidden');
            document.getElementById('closeOnboardingBtn').classList.add('hidden'); // Force completion
            onboardingModal.classList.remove('hidden');
        }
    }, 1000);
}

// --- SPA Navigation Logic ---
document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const targetViewId = item.getAttribute('data-view');
        if (!targetViewId) return; // Ignore logout or others without data-view

        e.preventDefault();

        // 1. Update active state on nav icons
        document.querySelectorAll('.bottom-nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Goal 29: Ensure date check when clicking Home
        if (targetViewId === 'dashboard') {
            checkDateChange();
        }

        // 2. Hide all views
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

        // 3. Show target view
        const targetView = document.getElementById(`view-${targetViewId}`);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        // 4. Trigger view-specific dynamic logic
        if (targetViewId === 'history') {
            initHistoryView();
        } else if (targetViewId === 'progress') {
            if (typeof window.loadCheckIns === 'function') window.loadCheckIns();
            if (typeof window.loadWorkouts === 'function') window.loadWorkouts();
        }
    });
});

// Logout logic removed from here as it's now handled in the Consolidated Logout Logic section above.

// --- Global Actions for Inline Handlers (Meal Management) ---
window.deleteMeal = async (mealId) => {
    if (!currentUser) return;
    if (confirm("Are you sure you want to delete this meal?")) {
        try {
            const { ref, remove } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
            const mealRef = ref(db, `users/${currentUser.uid}/meals/${mealId}`);
            await remove(mealRef);
            updateDailySummary(); // Refresh Dashboard UI

            // If we are currently on the History tab, refresh that too
            const historyView = document.getElementById('view-history');
            if (typeof initHistoryView === 'function' && historyView && !historyView.classList.contains('hidden')) {
                initHistoryView();
            }
        } catch (e) {
            console.error("Error deleting meal:", e);
            alert("Could not delete meal. Check console for details.");
        }
    }
};

window.editMeal = (mealId) => {
    // We will hook this to a modal 
    if (typeof openEditMealModal === 'function') {
        openEditMealModal(mealId);
    } else {
        alert("Edit functionality coming shortly! Pre-filling real data...");
    }
};

window.closeEditMealModal = () => {
    const modal = document.getElementById('editMealModal');
    if (modal) modal.classList.add('hidden');
};

window.openEditMealModal = async (mealId) => {
    if (!currentUser) return;
    try {
        const { ref, get } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
        const mealRef = ref(db, `users/${currentUser.uid}/meals/${mealId}`);
        const snapshot = await get(mealRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('editMealId').value = mealId;
            document.getElementById('editFoodItems').value = data.foodItems ? data.foodItems.join(', ') : '';
            document.getElementById('editCalories').value = data.macros.calories || 0;
            document.getElementById('editProtein').value = data.macros.protein || 0;
            document.getElementById('editCarbs').value = data.macros.carbs || 0;
            document.getElementById('editFats').value = data.macros.fats || 0;

            const breakdown = document.getElementById('editIngredientBreakdown');
            if (breakdown) {
                if (data.ingredients && data.ingredients.length > 0) {
                    breakdown.innerHTML = `
                        <h4 style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">Detailed Breakdown:</h4>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${data.ingredients.map(ing => `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #f1f5f9;">
                                    <div style="flex: 1;">
                                        <div style="font-size: 0.85rem; font-weight: 600; color: #334155;">${ing.name}</div>
                                        <div style="font-size: 0.7rem; color: #94a3b8;">${ing.amount}</div>
                                    </div>
                                    <div style="text-align: right; font-size: 0.75rem; color: #64748b;">
                                        <div>${ing.calories} Cal</div>
                                        <div style="font-weight: 500;">P: ${ing.protein}g | C: ${ing.carbs}g | F: ${ing.fats}g</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    breakdown.innerHTML = '';
                }
            }

            document.getElementById('editMealModal').classList.remove('hidden');
        } else {
            alert("Meal not found");
        }
    } catch (e) {
        console.error("Error opening edit modal:", e);
    }
};

window.saveEditedMeal = async () => {
    if (!currentUser) return;

    const mealId = document.getElementById('editMealId').value;
    const itemsStr = document.getElementById('editFoodItems').value;
    const foodItems = itemsStr.split(',').map(s => s.trim()).filter(Boolean);

    const macros = {
        calories: parseInt(document.getElementById('editCalories').value) || 0,
        protein: parseInt(document.getElementById('editProtein').value) || 0,
        carbs: parseInt(document.getElementById('editCarbs').value) || 0,
        fats: parseInt(document.getElementById('editFats').value) || 0
    };

    const btn = document.querySelector('#editMealModal .action-button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const { ref, update } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
        const mealRef = ref(db, `users/${currentUser.uid}/meals/${mealId}`);
        await update(mealRef, {
            foodItems: foodItems,
            macros: macros
        });

        btn.innerHTML = 'Save Changes';
        window.closeEditMealModal();
        updateDailySummary();

        const historyView = document.getElementById('view-history');
        if (typeof initHistoryView === 'function' && historyView && !historyView.classList.contains('hidden')) {
            initHistoryView();
        }
    } catch (e) {
        console.error("Error saving edit:", e);
        alert("Failed to save changes");
        btn.innerHTML = 'Save Changes';
    }
};

// --- Trainer Messages (Goal 9) ---
// --- Goal 9 & 27: Trainer Chat / Feedback ---
async function initTrainerMessages() {
    const list = document.getElementById('trainerMessagesList');
    if (!list || !currentUser || !db) return;

    try {
        const { onValue, ref, query, limitToLast } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
        const feedbackRef = query(ref(db, `users/${currentUser.uid}/trainer_feedback`), limitToLast(50));

        onValue(feedbackRef, (snapshot) => {
            const messages = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    messages.push({ id: c.key, ...c.val() });
                });
            }
            renderClientChatHistory(messages);
        });
    } catch (e) {
        console.error("Failed to load trainer messages", e);
    }

    // Chat Inputs Logic (Goal 27)
    const sendBtn = document.getElementById('sendToTrainerBtn');
    const msgInput = document.getElementById('clientChatMessage');
    const imgBtn = document.getElementById('clientImageUploadBtn');
    const imgInput = document.getElementById('clientChatImageInput');
    const voiceBtn = document.getElementById('clientVoiceMessageBtn');
    const status = document.getElementById('clientChatStatus');

    if (sendBtn) {
        sendBtn.addEventListener('click', () => sendChatMessageToTrainer());
    }

    if (imgBtn && imgInput) {
        imgBtn.addEventListener('click', () => imgInput.click());
        imgInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (re) => {
                window.clientPendingImageBase64 = re.target.result;
                imgBtn.style.background = '#10b981';
                imgBtn.innerHTML = '<i class="fas fa-check"></i>';
            };
            reader.readAsDataURL(file);
        });
    }

    if (voiceBtn) {
        initClientVoiceMessaging(voiceBtn, status);
    }
}

function renderClientChatHistory(messages) {
    const el = document.getElementById('trainerMessagesList');
    if (!el) return;

    if (!messages.length) {
        el.innerHTML = '<div style="text-align:center; padding: 1rem; color: #9ca3af; font-size: 0.85rem;">No messages from your trainer yet.</div>';
        return;
    }

    el.innerHTML = messages.map(m => {
        const isTrainer = m.sender === 'trainer' || (!m.sender && m.trainerId);
        const align = isTrainer ? 'flex-start' : 'flex-end';
        const bg = isTrainer ? '#f1f5f9' : 'var(--primary)';
        const color = isTrainer ? '#1e293b' : 'white';
        const radius = isTrainer ? '16px 16px 16px 2px' : '16px 16px 2px 16px';

        let content = '';
        if (m.type === 'audio' || m.audioData) {
            content = `<audio src="${m.audioData}" controls style="max-width: 100%; height: 32px;"></audio>`;
        } else if (m.type === 'image' || m.imageData) {
            content = `<img src="${m.imageData}" style="max-width: 100%; border-radius: 12px; cursor: pointer;" onclick="window.open(this.src)">`;
            if (m.text) content += `<p style="margin-top: 5px; font-size: 0.9rem;">${m.text}</p>`;
        } else {
            content = `<p style="margin: 0; white-space: pre-wrap; font-size: 0.9rem;">${m.text}</p>`;
        }

        return `
            <div style="align-self: ${align}; max-width: 85%; padding: 10px 14px; border-radius: ${radius}; background: ${bg}; color: ${color}; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 5px;">
                <div style="font-size: 0.7rem; opacity: 0.7; margin-bottom: 4px; display: flex; justify-content: space-between; gap: 10px;">
                    <strong>${isTrainer ? 'Trainer' : 'You'}</strong>
                    <span>${m.dateString || ''}</span>
                </div>
                ${content}
            </div>
        `;
    }).join('');

    // Auto-scroll
    el.scrollTop = el.scrollHeight;
}

async function sendChatMessageToTrainer() {
    const text = document.getElementById('clientChatMessage').value;
    const btn = document.getElementById('sendToTrainerBtn');

    if (!text.trim() && !window.clientPendingImageBase64) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const { ref, push, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
        const fbRef = push(ref(db, `users/${currentUser.uid}/trainer_feedback`));

        const payload = {
            sender: 'client',
            text: text,
            timestamp: serverTimestamp(),
            dateString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (window.clientPendingImageBase64) {
            payload.type = 'image';
            payload.imageData = window.clientPendingImageBase64;
        }

        await set(fbRef, payload);

        document.getElementById('clientChatMessage').value = '';
        window.clientPendingImageBase64 = null;
        document.getElementById('clientImageUploadBtn').style.background = '#f1f5f9';
        document.getElementById('clientImageUploadBtn').innerHTML = '<i class="fas fa-image"></i>';

    } catch (e) {
        console.error("Chat send error:", e);
        alert("Failed to send message.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }
}

let clientMediaRecorder;
let clientAudioChunks = [];
let isClientRecording = false;

async function initClientVoiceMessaging(btn, status) {
    btn.addEventListener('click', async () => {
        if (isClientRecording && clientMediaRecorder) {
            clientMediaRecorder.stop();
            isClientRecording = false;
            btn.style.background = '#fee2e2';
            status.classList.add('hidden');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            clientMediaRecorder = new MediaRecorder(stream);
            clientAudioChunks = [];

            clientMediaRecorder.addEventListener("dataavailable", event => {
                clientAudioChunks.push(event.data);
            });

            clientMediaRecorder.addEventListener("stop", async () => {
                const audioBlob = new Blob(clientAudioChunks, { type: 'audio/webm' });
                status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result;
                    try {
                        const { ref, push, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
                        const fbRef = push(ref(db, `users/${currentUser.uid}/trainer_feedback`));
                        await set(fbRef, {
                            sender: 'client',
                            type: 'audio',
                            audioData: base64Audio,
                            timestamp: serverTimestamp(),
                            dateString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        });
                        status.innerHTML = '<i class="fas fa-check"></i> Sent!';
                        setTimeout(() => status.classList.add('hidden'), 2000);
                    } catch (e) {
                        console.error("Client Audio Upload Error:", e);
                        status.innerHTML = '<i class="fas fa-times></i> Failed';
                    }
                };
            });

            clientMediaRecorder.start();
            isClientRecording = true;
            btn.style.background = '#ef4444';
            btn.style.color = 'white';
            status.innerHTML = '<i class="fas fa-circle blob"></i> Recording... Tap to stop';
            status.classList.remove('hidden');

        } catch (e) {
            console.error("Mic error:", e);
            alert("Microphone access required.");
        }
    });
}

// --- Client-Trainer Linking (Goal 11) ---
async function initTrainerLinkUI() {
    if (!currentUser || !db) return;

    try {
        const { ref, onValue, set } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
        const profileRef = ref(db, `users/${currentUser.uid}/profile`);

        onValue(profileRef, (snapshot) => {
            const notLinkedUi = document.getElementById('trainerNotLinkedUi');
            const linkedUi = document.getElementById('trainerLinkedUi');
            const connectedIdStr = document.getElementById('connectedTrainerIdStr');
            const messagesSection = document.getElementById('trainerMessagesSection');

            if (snapshot.exists() && snapshot.val().trainerId) {
                // Trainer is linked
                const trainerId = snapshot.val().trainerId;
                notLinkedUi.classList.add('hidden');
                linkedUi.classList.remove('hidden');
                connectedIdStr.textContent = trainerId;
                if (messagesSection) messagesSection.classList.remove('hidden');
            } else {
                // No trainer
                notLinkedUi.classList.remove('hidden');
                linkedUi.classList.add('hidden');
                if (messagesSection) messagesSection.classList.add('hidden');
            }
        });

        // Link Button Logic
        document.getElementById('linkTrainerBtn').addEventListener('click', async () => {
            const code = document.getElementById('linkTrainerInput').value.trim();
            if (!code) return alert("Please enter a Trainer Code.");

            const btn = document.getElementById('linkTrainerBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            try {
                await set(ref(db, `users/${currentUser.uid}/profile/trainerId`), code);
                document.getElementById('linkTrainerInput').value = '';
                btn.innerHTML = '<i class="fas fa-plug"></i> Link';
            } catch (e) {
                console.error("Link Error", e);
                btn.innerHTML = '<i class="fas fa-plug"></i> Link';
                alert("Failed to link trainer.");
            }
        });

        // Unlink Button Logic
        document.getElementById('unlinkTrainerBtn').addEventListener('click', async () => {
            if (!confirm("Are you sure you want to disconnect from this trainer?")) return;
            try {
                await set(ref(db, `users/${currentUser.uid}/profile/trainerId`), null);
            } catch (e) {
                console.error("Unlink Error", e);
                alert("Failed to unlink trainer.");
            }
        });

    } catch (e) {
        console.error("Failed to init trainer link UI", e);
    }
}

// --- Goal 12: AI Meal Suggestions ---
document.addEventListener('DOMContentLoaded', () => {
    const suggestBtn = document.getElementById('suggestMealsBtn');
    const closeBtn = document.getElementById('closeSuggestionsBtn');
    const suggestSection = document.getElementById('aiMealSuggestionsSection');
    const loader = document.getElementById('aiSuggestionsLoader');
    const list = document.getElementById('aiSuggestionsList');

    if (closeBtn && suggestSection) {
        closeBtn.addEventListener('click', () => {
            suggestSection.classList.add('hidden');
        });
    }

    if (suggestBtn) {
        suggestBtn.addEventListener('click', async () => {
            if (!suggestSection || !loader || !list) return;

            suggestSection.classList.remove('hidden');
            list.innerHTML = '';
            loader.classList.remove('hidden');
            suggestBtn.disabled = true;

            try {
                // Calculate Remaining
                const remCal = Math.max(0, currentDailyGoals.calories - currentDailyTotals.calories);
                const remP = Math.max(0, currentDailyGoals.protein - currentDailyTotals.protein);
                const remC = Math.max(0, currentDailyGoals.carbs - currentDailyTotals.carbs);
                const remF = Math.max(0, currentDailyGoals.fats - currentDailyTotals.fats);

                if (remCal < 100) {
                    loader.classList.add('hidden');
                    list.innerHTML = '<div style="padding: 15px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; color: #d97706; text-align: center;">You have hit or are very close to your daily targets! No large meals recommended.</div>';
                    suggestBtn.disabled = false;
                    return;
                }

                const prompt = `You are an expert nutrition AI. The user has the following remaining macronutrients available today:
Calories: ${remCal} kcal
Protein: ${remP}g
Carbs: ${remC}g
Fats: ${remF}g

Please suggest 3 different meal or snack ideas that closely fit these remaining macros. 
Return ONLY a valid JSON array of objects with the following keys:
"name" (string, catchy name)
"description" (string, short description of the meal)
"protein" (number, estimated grams)
"carbs" (number, estimated grams)
"fats" (number, estimated grams)
"calories" (number, estimated kcal)
No markdown formatting, just raw JSON.`;

                const response = await fetch(AI_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                const data = await response.json();
                let textResult = data.candidates[0].content.parts[0].text;
                textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
                const meals = JSON.parse(textResult);

                loader.classList.add('hidden');

                list.innerHTML = meals.map(m => `
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                        <div style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 4px;">${m.name}</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;">${m.description}</div>
                        <div style="display: flex; gap: 8px; font-size: 0.75rem; font-weight: 600; flex-wrap: wrap;">
                            <span style="background: #fff7ed; color: var(--protein-color); padding: 2px 6px; border-radius: 4px;">${Math.round(m.protein)}g P</span>
                            <span style="background: #ecfdf5; color: var(--carbs-color); padding: 2px 6px; border-radius: 4px;">${Math.round(m.carbs)}g C</span>
                            <span style="background: #fef2f2; color: var(--fats-color); padding: 2px 6px; border-radius: 4px;">${Math.round(m.fats)}g F</span>
                            <span style="background: #f1f5f9; color: var(--text-main); padding: 2px 6px; border-radius: 4px;">${Math.round(m.calories)} kcal</span>
                        </div>
                        <button onclick="window.generateRecipe('${m.name}', ${m.protein}, ${m.carbs}, ${m.fats})" 
                            style="margin-top: 10px; width: 100%; padding: 6px; background: transparent; border: 1px solid #10b981; color: #10b981; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-receipt"></i> Show Recipe
                        </button>
                    </div>
                `).join('');

            } catch (e) {
                console.error("AI Meak Error", e);
                loader.classList.add('hidden');
                list.innerHTML = '<div style="color: #ef4444; font-size: 0.9rem;">Failed to generate suggestions. Please try again.</div>';
            }
            suggestBtn.disabled = false;
        });
    }
});

// --- Goal 13: Barcode Scanner Integration ---
document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBarcodeBtn');
    const closeBtn = document.getElementById('closeScannerBtn');
    const container = document.getElementById('barcodeReaderContainer');
    let html5QrcodeScanner = null;

    if (scanBtn && container) {
        scanBtn.addEventListener('click', () => {
            container.classList.remove('hidden');

            // Wait for library to load and initialize scanner
            if (!window.Html5Qrcode) {
                alert("Scanner library is still loading. Try again in a second.");
                container.classList.add('hidden');
                return;
            }

            if (!html5QrcodeScanner) {
                html5QrcodeScanner = new Html5Qrcode("barcode-reader");
            }

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrcodeScanner.start({ facingMode: "environment" }, config, async (decodedText) => {
                // On Successful Read
                try {
                    await html5QrcodeScanner.stop();
                } catch (e) { }

                container.classList.add('hidden');

                try {
                    const statusText = document.getElementById('statusText');
                    if (statusText) statusText.textContent = "Fetching database...";

                    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
                    const data = await res.json();

                    if (data.status === 1 && data.product) {
                        const p = data.product;
                        const nut = p.nutriments || {};

                        // Default to 100g serving if specific serving size data is missing
                        let protein = nut.proteins_100g || nut.proteins || 0;
                        let carbs = nut.carbohydrates_100g || nut.carbohydrates || 0;
                        let fats = nut.fat_100g || nut.fat || 0;
                        let calories = nut['energy-kcal_100g'] || nut['energy-kcal'] || 0;

                        const analysis = {
                            foodItems: [p.product_name || "Packaged Food"],
                            macros: {
                                protein: Math.round(protein),
                                carbs: Math.round(carbs),
                                fats: Math.round(fats),
                                calories: Math.round(calories)
                            }
                        };

                        if (typeof displayResult === 'function') {
                            displayResult(analysis);
                            window.currentAnalysis = analysis; // Explicitly set global for the save button
                        }
                        if (statusText) statusText.textContent = `Scanned: ${p.product_name}`;
                    } else {
                        throw new Error("Product not found");
                    }
                } catch (e) {
                    console.error("Barcode Fetch Error", e);
                    alert("Nutritional data not found in OpenFoodFacts database for this item.");
                    const statusText = document.getElementById('statusText');
                    if (statusText) statusText.textContent = "Could not find barcode data.";
                }

            }, (err) => {
                // Ongoing scan error, safely ignore (usually noisy)
            }).catch(e => {
                console.error("Camera start failed", e);
                alert("Camera access denied or unavailable on this device.");
                container.classList.add('hidden');
            });
        });

        closeBtn.addEventListener('click', () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.stop().catch(console.error);
            }
            container.classList.add('hidden');
        });
    }
});

// --- Goal 14: Water Tracking ---
let currentWaterCount = 0;
const WATER_GOAL = 8;
let isWaterTrackingInitialized = false;

async function initWaterTracking() {
    const minusBtn = document.getElementById('waterMinusBtn');
    const plusBtn = document.getElementById('waterPlusBtn');
    const addLabel = document.getElementById('waterAddLabel');

    if (!minusBtn || !plusBtn || !currentUser || !db) return;
    if (isWaterTrackingInitialized) {
        console.log("Dashboard: Water tracking already initialized");
        return;
    }

    // Goal 26: Standardize date format to avoid spaces and ensure consistency
    // Note: Local date is better for user's "Today"
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const waterRef = ref(db, `users/${currentUser.uid}/water/${todayStr}`);

    console.log("Dashboard: Initializing water tracking for", todayStr);

    // Listen for real-time water updates
    const { onValue, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

    onValue(waterRef, (snapshot) => {
        if (snapshot.exists()) {
            currentWaterCount = snapshot.val().count || 0;
        } else {
            currentWaterCount = 0;
        }
        updateWaterUI();
    });

    const updateWaterInDb = async (newCount) => {
        if (newCount < 0) newCount = 0;
        try {
            await set(waterRef, {
                count: newCount,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Error updating water", e);
        }
    };

    // Remove old listeners if any (hard in vanilla but we use a flag)
    minusBtn.onclick = () => updateWaterInDb(currentWaterCount - 1);
    plusBtn.onclick = () => updateWaterInDb(currentWaterCount + 1);
    if (addLabel) {
        addLabel.onclick = () => {
            console.log("Water: Add glass clicked");
            updateWaterInDb(currentWaterCount + 1);
        };
    }

    isWaterTrackingInitialized = true;
}

function updateWaterUI() {
    const countDisplay = document.getElementById('waterCountCurrent');
    const progressBar = document.getElementById('waterProgressBar');

    if (countDisplay) {
        countDisplay.textContent = currentWaterCount;
    }
    if (progressBar) {
        const percentage = Math.min((currentWaterCount / WATER_GOAL) * 100, 100);
        progressBar.style.width = `${percentage}%`;

        if (currentWaterCount >= WATER_GOAL) {
            progressBar.style.background = '#10b981'; // Green when goal reached
        } else {
            progressBar.style.background = '#3b82f6'; // Blue otherwise
        }
    }
}

// --- Goal 15: Weekly Automated AI Insights ---
document.addEventListener('DOMContentLoaded', () => {
    const weeklyReportBtn = document.getElementById('weeklyReportBtn');
    const weeklyReportModal = document.getElementById('weeklyReportModal');
    const closeWeeklyReportBtn = document.getElementById('closeWeeklyReportBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const weeklyReportContent = document.getElementById('weeklyReportContent');
    const weeklyReportLoader = document.getElementById('weeklyReportLoader');

    if (weeklyReportBtn && weeklyReportModal) {
        weeklyReportBtn.addEventListener('click', () => {
            weeklyReportModal.classList.remove('hidden');
        });

        closeWeeklyReportBtn.addEventListener('click', () => {
            weeklyReportModal.classList.add('hidden');
        });

        generateReportBtn.addEventListener('click', async () => {
            if (!currentUser || !db) return;

            generateReportBtn.classList.add('hidden');
            weeklyReportContent.style.display = 'none';
            weeklyReportLoader.classList.remove('hidden');

            try {
                // Fetch last 7 days from Firebase
                const mealsRef = ref(db, `users/${currentUser.uid}/meals`);
                // Get a large chunk to filter client-side, limitToLast(200) roughly covers 7 days of meals
                const qMeals = query(mealsRef, limitToLast(200));
                const snapshot = await get(qMeals);

                let last7DaysData = "";
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                if (snapshot.exists()) {
                    snapshot.forEach((child) => {
                        const data = child.val();
                        if (data.timestamp) {
                            const dateLogged = new Date(data.timestamp);
                            if (dateLogged >= oneWeekAgo) {
                                last7DaysData += `- ${data.dateString} (${data.mealCategory}): ${data.foodItems ? data.foodItems.join(', ') : 'Food'}. Calories: ${data.macros.calories}kcal, Protein: ${data.macros.protein}g.\n`;
                            }
                        }
                    });
                }

                if (!last7DaysData) last7DaysData = "No meals logged in the past 7 days.";

                const prompt = `You are a world-class fitness and nutrition coach. Here is your client's meal log for the past 7 days:

${last7DaysData}

Their current daily goals are: Calories: ${currentDailyGoals.calories || 2000}, Protein: ${currentDailyGoals.protein || 100}g.

Please provide a "Weekly Insights Report". 
1. Summarize their adherence to their goals in a friendly, encouraging paragraph.
2. Note 2 positive trends you see (e.g. good protein hits, consistent logging).
3. Provide 1-2 actionable tips for next week.
Format the response using simple HTML elements (e.g., <strong>, <ul>, <li>, <br>) for readability within a web container. Do not use Markdown backticks.`;

                const response = await fetch(AI_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                const apiData = await response.json();
                let reportHtml = apiData.candidates[0].content.parts[0].text;

                // Clean up any stray markdown if the API ignored instructions
                reportHtml = reportHtml.replace(/```html/g, '').replace(/```/g, '');

                weeklyReportLoader.classList.add('hidden');
                weeklyReportContent.innerHTML = reportHtml;
                weeklyReportContent.style.display = 'block';

                generateReportBtn.innerHTML = '<i class="fas fa-redo"></i> Refresh Report';
                generateReportBtn.classList.remove('hidden');

            } catch (e) {
                console.error("Weekly Report Error", e);
                weeklyReportLoader.classList.add('hidden');
                weeklyReportContent.innerHTML = '<span style="color: #ef4444;">Failed to generate report. Please ensure you have data logged for the past week.</span>';
                weeklyReportContent.style.display = 'block';
                generateReportBtn.classList.remove('hidden');
            }
        });
    }
});
