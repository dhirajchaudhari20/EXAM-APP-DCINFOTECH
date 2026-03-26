import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, push, set, serverTimestamp, limitToLast, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- Configuration ---
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

let app, db, auth, trainerUser;
let currentClientData = { meals: [], workouts: [], progress: [], profile: {} };

app = initializeApp(firebaseConfig);
db = getDatabase(app);
auth = getAuth(app);

// --- Auth & Init ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        trainerUser = user;
        initTrainerDashboard();
    } else {
        const localUserStr = localStorage.getItem('macro_user');
        if (localUserStr) {
            trainerUser = JSON.parse(localUserStr);
            initTrainerDashboard();
        } else {
            alert("No session found. Please log in first.");
            window.location.href = "index.html";
        }
    }
});

async function initTrainerDashboard() {
    // Goal 20: Display version
    const versionEl = document.getElementById('app-version-display');
    if (versionEl) versionEl.textContent = 'v1.0.0';

    document.getElementById('loadingOverlay').classList.add('hidden');
    const dropdown = document.getElementById('clientDropdown');

    // Fetch clients linked to this trainer (Goal 11)
    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        dropdown.innerHTML = '';
        let hasClients = false;

        if (snapshot.exists()) {
            const allUsers = snapshot.val();
            for (const [uid, userData] of Object.entries(allUsers)) {
                if (userData.profile && userData.profile.trainerId === trainerUser.uid) {
                    hasClients = true;
                    const name = userData.profile.displayName || userData.profile.email || `Client (${uid.substring(0, 4)})`;
                    dropdown.innerHTML += `<option value="${uid}">${name}</option>`;
                }
            }
        }

        if (!hasClients) {
            dropdown.innerHTML = `<option value="">No clients assigned yet. Share your Code: ${trainerUser.uid}</option>`;
        } else {
            dropdown.addEventListener('change', (e) => loadClientData(e.target.value));
            // Load first default
            if (dropdown.value) loadClientData(dropdown.value);
        }

    } catch (e) {
        console.error("Error fetching clients", e);
        dropdown.innerHTML = `<option value="">Error loading clients</option>`;
    }

    // AI Analysis Trigger
    document.getElementById('runAiAnalysisBtn').addEventListener('click', generateAiCoachingReport);
    document.getElementById('runAiAnalysisBtnPhotos').addEventListener('click', () => {
        // Scroll to top where the report container is
        window.scrollTo({ top: 0, behavior: 'smooth' });
        generateAiCoachingReport();
    });

    // Save Feedback Trigger
    document.getElementById('saveFeedbackBtn').addEventListener('click', saveTrainerFeedback);

    // Optional UI: Show Trainer Code
    const headerP = document.querySelector('header p');
    if (headerP) {
        headerP.innerHTML += `<br><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: #333; margin-top: 5px; display: inline-block;">Your Trainer Code: <b>${trainerUser.uid}</b></span>`;
    }
}

// --- Data Fetching ---
async function loadClientData(clientId) {
    if (!clientId) return;
    document.getElementById('trainerDashboard').classList.remove('hidden');

    try {
        currentClientData = { meals: [], workouts: [], progress: [], profile: {} };

        // Goal 23: Fetch profile from Firebase instead of LocalStorage
        const profileRef = ref(db, `users/${clientId}/profile`);
        const profileSnap = await get(profileRef);
        if (profileSnap.exists()) {
            currentClientData.profile = profileSnap.val();
            renderProfileStats(currentClientData.profile);
            renderAiBodyAnalysis(currentClientData.profile.aiInsights);
        }

        const mealsRef = ref(db, `users/${clientId}/meals`);
        const workoutsRef = ref(db, `users/${clientId}/workouts`);
        const progressRef = ref(db, `users/${clientId}/progress`);

        // Legacy Refs
        const oldWorkoutsRef = ref(db, `workouts/${clientId}`);
        const oldProgressRef = ref(db, `checkins/${clientId}`);

        // Use onValue for Real-time Updates (Goal 7)
        const { onValue } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

        // Helper to merge and render
        const mergeAndRender = (newList, oldList, renderFn, storageKey) => {
            const merged = [...newList, ...oldList];
            // Deduplicate
            const seen = new Set();
            const unique = merged.filter(item => {
                const id = item.id || item.timestamp;
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            });
            unique.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
            currentClientData[storageKey] = unique;
            renderFn(unique);
        };

        let mealsData = [], workoutsData = [], oldWorkoutsData = [], progressData = [], oldProgressData = [];

        onValue(mealsRef, (snapshot) => {
            mealsData = [];
            if (snapshot.exists()) snapshot.forEach(c => mealsData.push({ id: c.key, ...c.val() }));
            renderMeals(mealsData);
        });

        onValue(workoutsRef, (snapshot) => {
            workoutsData = [];
            if (snapshot.exists()) snapshot.forEach(c => workoutsData.push({ id: c.key, ...c.val() }));
            mergeAndRender(workoutsData, oldWorkoutsData, renderWorkouts, 'workouts');
        });
        onValue(oldWorkoutsRef, (snapshot) => {
            oldWorkoutsData = [];
            if (snapshot.exists()) snapshot.forEach(c => oldWorkoutsData.push({ id: c.key, ...c.val() }));
            mergeAndRender(workoutsData, oldWorkoutsData, renderWorkouts, 'workouts');
        });

        onValue(progressRef, (snapshot) => {
            progressData = [];
            if (snapshot.exists()) snapshot.forEach(c => progressData.push({ id: c.key, ...c.val() }));
            mergeAndRender(progressData, oldProgressData, renderPhotos, 'progress');
        });
        onValue(oldProgressRef, (snapshot) => {
            oldProgressData = [];
            if (snapshot.exists()) snapshot.forEach(c => oldProgressData.push({ id: c.key, ...c.val() }));
            mergeAndRender(progressData, oldProgressData, renderPhotos, 'progress');
        });

        // Goal 27: Chat History
        const feedbackRef = query(ref(db, `users/${clientId}/trainer_feedback`), limitToLast(50));
        onValue(feedbackRef, (snapshot) => {
            const messages = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => { messages.push({ id: c.key, ...c.val() }); });
            }
            renderChatHistory(messages);
        });

    } catch (e) {
        console.error("Error loading client data", e);
        alert("Failed to setup real-time client data.");
    }
}

// --- Rendering ---
function renderProfileStats(profile) {
    const el = document.getElementById('clientProfileStats');
    el.innerHTML = `
        <div class="data-item"><strong>Goal:</strong> <span style="text-transform: capitalize;">${profile.goal || 'Not set'}</span></div>
        <div class="data-item"><strong>Weight:</strong> ${profile.weight || '--'} kg</div>
        <div class="data-item"><strong>Height:</strong> ${profile.height || '--'} cm</div>
        <div class="data-item"><strong>Age:</strong> ${profile.age || '--'} yrs</div>
        <div class="data-item"><strong>Target:</strong> ${profile.goalCalories || '0'} kcal</div>
        <div class="data-item"><strong>Protein:</strong> ${profile.goalProtein || '0'}g</div>
    `;
}

// Goal 23: Render AI Body Analysis results
function renderAiBodyAnalysis(insights) {
    const container = document.getElementById('aiBodyInsightContainer');
    const photo = document.getElementById('aiBodyPhoto');
    const text = document.getElementById('aiBodyText');

    if (!insights) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    if (insights.image) photo.src = `data:image/jpeg;base64,${insights.image}`;

    text.innerHTML = `
        <div><strong>Est. Body Fat:</strong> ${insights.bodyFat || 'N/A'}</div>
        <div><strong>Est. Age:</strong> ${insights.age || 'N/A'}</div>
        <div><strong>Activity Level:</strong> ${insights.activity || 'N/A'}</div>
        <div><strong>Visual Recommendation:</strong> ${insights.goal || 'N/A'}</div>
        <div style="margin-top: 5px; font-style: italic; font-size: 0.75rem; color: #94a3b8;">* AI estimates based on user upload</div>
    `;
}

function renderMeals(meals) {
    const el = document.getElementById('clientMealsList');
    if (!meals.length) {
        el.innerHTML = '<div style="text-align:center; padding: 2rem; color: #9ca3af;">No recent meals found.</div>';
        return;
    }

    // Reverse for UI so newest is top
    const displayMeals = [...meals].reverse().slice(0, 10);

    el.innerHTML = displayMeals.map(m => {
        let breakdown = '';
        if (m.ingredients && m.ingredients.length > 0) {
            breakdown = `
                <div style="margin-top: 5px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; color: #475569;">
                    <div style="font-weight: 700; margin-bottom: 3px; font-size: 0.7rem;">Breakdown:</div>
                    ${m.ingredients.map(ing => `
                        <div style="display: flex; justify-content: space-between;">
                            <span>• ${ing.name} (${ing.amount})</span>
                            <span style="font-weight: 600;">${ing.calories} Cal</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div style="border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.9rem; color: #1e293b;">${m.dateString || 'Date Unknown'} - ${m.mealCategory || 'Meal'}</div>
                        <div style="font-size: 0.8rem; color: #64748b;">${m.foodItems ? m.foodItems.join(', ') : 'Custom Entry'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 800; color: #f59e0b; font-size: 1rem;">${m.macros?.calories || 0} kcal</div>
                        <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">P: ${m.macros?.protein || 0}g | C: ${m.macros?.carbs || 0}g | F: ${m.macros?.fats || 0}g</div>
                    </div>
                </div>
                ${breakdown}
            </div>
        `;
    }).join('');
}

function renderWorkouts(workouts) {
    const el = document.getElementById('clientWorkoutsList');
    if (!workouts.length) {
        el.innerHTML = '<div style="text-align:center; padding: 2rem; color: #9ca3af;">No recent workouts found.</div>';
        return;
    }

    const displayW = [...workouts].reverse().slice(0, 10);
    el.innerHTML = displayW.map(w => `
        <div style="border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
            <div style="font-weight: 700; font-size: 0.9rem; color: #1e293b; margin-bottom: 5px;">${w.date || 'Date Unknown'}</div>
            <div style="font-size: 0.85rem; color: #475569; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #f1f5f9;">
                ${w.formattedHtml || w.originalNotes || 'No description'}
            </div>
        </div>
    `).join('');
}

function renderPhotos(progressArr) {
    const el = document.getElementById('clientPhotosGrid');
    if (!el) return;

    if (!progressArr || progressArr.length === 0) {
        el.innerHTML = '<div style="text-align:center; padding: 2rem; color: #9ca3af; grid-column: 1/-1;">No progress photos found.</div>';
        return;
    }

    el.innerHTML = '';
    const sorted = [...progressArr].sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

    sorted.forEach(p => {
        const photoData = p.photos || p.images || {};
        const dateStr = p.date || p.dateString || (p.timestamp ? new Date(p.timestamp).toDateString() : 'Unknown Date');

        // Measurements (Goal 30)
        const m = p.measurements || {};
        const mHtml = `
            <div style="padding: 10px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 0.75rem; color: #475569;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-weight: 600;">
                    <span>Weight: ${m.weight || p.weight || '--'} kg</span>
                    <span>Arms: ${m.arms || p.arms || '--'}</span>
                    <span>Chest: ${m.chest || p.chest || '--'}</span>
                    <span>Waist: ${m.waist || p.waist || '--'}</span>
                    <span>Abs: ${m.abs || p.abs || '--'}</span>
                    <span style="color: var(--primary);">BFP: ${m.bfp || '--'}%</span>
                </div>
            </div>
        `;

        if (typeof photoData === 'object' && (photoData.front || photoData.side || photoData.back)) {
            if (photoData.front) appendPhoto(el, photoData.front, `Front - ${dateStr}`, mHtml);
            if (photoData.side) appendPhoto(el, photoData.side, `Side - ${dateStr}`);
            if (photoData.back) appendPhoto(el, photoData.back, `Back - ${dateStr}`);
        } else if (p.image) {
            appendPhoto(el, p.image, `Combined - ${dateStr}`, mHtml);
        } else if (p.photoURL) {
            appendPhoto(el, p.photoURL, `Photo - ${dateStr}`, mHtml);
        }
    });

    if (el.innerHTML === '') {
        el.innerHTML = '<div style="text-align:center; padding: 2rem; color: #9ca3af; grid-column: 1/-1;">No photos in these entries.</div>';
    }
}

function appendPhoto(container, src, title, extraHtml = '') {
    const div = document.createElement('div');
    div.style.cssText = 'background: white; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 2px 5px rgba(0,0,0,0.02); display: flex; flex-direction: column;';
    div.innerHTML = `
        <img src="${src}" style="width: 100%; height: 200px; object-fit: cover; cursor: pointer;" onclick="window.open(this.src)">
        <div style="padding: 8px; font-size: 0.75rem; font-weight: 600; color: #64748b; text-align: center;">${title}</div>
        ${extraHtml}
    `;
    container.appendChild(div);
}

function renderChatHistory(messages) {
    const el = document.getElementById('trainerChatHistory');
    if (!el) return;

    if (!messages.length) {
        el.innerHTML = '<div style="text-align:center; padding: 2rem; color: #9ca3af;">No messages yet. Start the conversation!</div>';
        return;
    }

    el.innerHTML = messages.map(m => {
        const isTrainer = m.sender === 'trainer' || (!m.sender && m.trainerId); // Legacy fallback
        const align = isTrainer ? 'flex-end' : 'flex-start';
        const bg = isTrainer ? 'var(--primary)' : '#e2e8f0';
        const color = isTrainer ? 'white' : '#1e293b';
        const radius = isTrainer ? '16px 16px 2px 16px' : '16px 16px 16px 2px';

        let content = '';
        if (m.type === 'audio' || m.audioData) {
            content = `<audio src="${m.audioData}" controls style="max-width: 200px; height: 36px;"></audio>`;
        } else if (m.type === 'image' || m.imageData) {
            content = `<img src="${m.imageData}" style="max-width: 100%; border-radius: 12px; cursor: pointer;" onclick="window.open(this.src)">`;
            if (m.text) content += `<p style="margin-top: 5px;">${m.text}</p>`;
        } else {
            content = `<p style="margin: 0; white-space: pre-wrap;">${m.text}</p>`;
        }

        return `
            <div style="align-self: ${align}; max-width: 80%; padding: 12px 16px; border-radius: ${radius}; background: ${bg}; color: ${color}; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-size: 0.7rem; opacity: 0.8; margin-bottom: 5px; display: flex; justify-content: space-between; gap: 10px;">
                    <strong>${isTrainer ? 'You' : 'Client'}</strong>
                    <span>${m.dateString || 'Today'}</span>
                </div>
                ${content}
            </div>
        `;
    }).join('');

    // Scroll to bottom
    el.scrollTop = el.scrollHeight;
}

// --- AI Analysis ---
async function generateAiCoachingReport() {
    const btn = document.getElementById('runAiAnalysisBtn');
    const container = document.getElementById('aiReportContainer');
    const textArea = document.getElementById('aiReportText');

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    container.classList.remove('hidden');
    textArea.textContent = "Analyzing client's nutritional data and workouts...";

    // Build Context String (Goal 29: Enhanced telemetry)
    const mealContext = currentClientData.meals.slice(-14).map(m => `${m.dateString} (${m.mealCategory}): ${m.macros?.calories || 0} kcal. Foods: ${m.foodItems?.join(', ')}`).join('\n');
    const workoutContext = currentClientData.workouts.slice(-7).map(w => `${w.dateString}: ${w.notes}`).join('\n');

    // Weight history
    const allWeights = currentClientData.progress
        .filter(p => p.measurements?.weight || p.weight)
        .map(p => ({ date: p.date || p.timestamp, weight: p.measurements?.weight || p.weight }));

    const weightSummary = allWeights.length > 0
        ? `Initial: ${allWeights[0].weight}kg, Current: ${allWeights[allWeights.length - 1].weight}kg. History: ${allWeights.map(w => w.weight).join(' -> ')} kg.`
        : "No weight history found.";

    // Measurements history (Goal 30)
    const allMeasurements = currentClientData.progress
        .filter(p => p.measurements)
        .map(p => p.measurements);

    const measurementSummary = allMeasurements.length > 0
        ? `Trend (latest 3): ${allMeasurements.slice(-3).map(m => `Arms: ${m.arms}, Chest: ${m.chest}, Waist: ${m.waist}, Abs: ${m.abs}`).join(' | ')}`
        : "No detailed measurements found.";

    const photoFrequency = currentClientData.progress.length;

    const prompt = `
    You are an expert personal trainer and master nutritionist AI performing a deep-dive analysis.
    
    Client Profile:
    Goal: ${currentClientData.profile?.goal || 'General Health'}
    Current Weight: ${currentClientData.profile?.weight}kg
    Weight History: ${weightSummary}
    Measurement History: ${measurementSummary}
    Progress Photo Entries: ${photoFrequency} entries logged.

    Recent Nutrition (Last 14 meals):
    ${mealContext || "None logged"}
    
    Recent Training (Last 7 days):
    ${workoutContext || "None logged"}
    
    TASK:
    1. PROGRESS HIGHLIGHTS: Identify 2 specific wins or positive trends from their recent data.
    2. CONSTRUCTIVE CRITIQUE: Analyze their macro adherence and workout consistency relative to their goal.
    3. NEXT MEASURES: Provide 3 DEFINITIVE, ACTIONABLE targets for the client for the upcoming week (e.g., "Increase daily protein by 15g", "Add one 20-min cardio session").

    Keep the tone professional, blunt but encouraging, and extremely personalized. 
    Format: Use clear section labels (PROGRESS HIGHLIGHTS, ANALYSIS, ACTION PLAN). Use line breaks between sections. No markdown bolding/headers.
    `;

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const resultText = data.candidates[0].content.parts[0].text;
        textArea.textContent = resultText;

        // Auto-fill a suggested starting point for manual feedback
        document.getElementById('trainerFeedbackNotes').value = "Great job logging your items this week! I've reviewed your macros and... ";

    } catch (e) {
        console.error(e);
        textArea.textContent = "Error generating report: " + e.message;
    } finally {
        btn.innerHTML = '<i class="fas fa-bolt"></i> Generate Full Report';
    }
}

// --- Trainer Feedback ---
let currentPendingImageBase64 = null;

document.getElementById('trainerImageUploadBtn').addEventListener('click', () => {
    document.getElementById('trainerChatImageInput').click();
});

document.getElementById('trainerChatImageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
        currentPendingImageBase64 = re.target.result;
        document.getElementById('trainerImageUploadBtn').style.background = '#10b981';
        document.getElementById('trainerImageUploadBtn').innerHTML = '<i class="fas fa-check"></i>';
    };
    reader.readAsDataURL(file);
});

async function saveTrainerFeedback() {
    const clientId = document.getElementById('clientDropdown').value;
    const text = document.getElementById('trainerFeedbackNotes').value;
    const btn = document.getElementById('saveFeedbackBtn');

    if (!text.trim() && !currentPendingImageBase64) {
        alert("Please enter a message or upload an image.");
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        const fbRef = push(ref(db, `users/${clientId}/trainer_feedback`));
        const payload = {
            sender: 'trainer',
            text: text,
            trainerId: trainerUser.uid,
            timestamp: serverTimestamp(),
            dateString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toDateString()
        };

        if (currentPendingImageBase64) {
            payload.type = 'image';
            payload.imageData = currentPendingImageBase64;
        }

        await set(fbRef, payload);

        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            document.getElementById('trainerFeedbackNotes').value = '';
            currentPendingImageBase64 = null;
            document.getElementById('trainerImageUploadBtn').style.background = '#64748b';
            document.getElementById('trainerImageUploadBtn').innerHTML = '<i class="fas fa-image"></i>';
        }, 2000);

    } catch (e) {
        console.error(e);
        alert("Failed to send feedback.");
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
}

// --- Voice Note Recording (Goal 9) ---
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

document.getElementById('recordVoiceNoteBtn').addEventListener('click', async () => {
    const btn = document.getElementById('recordVoiceNoteBtn');
    const status = document.getElementById('voiceNoteStatus');

    if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        isRecording = false;
        btn.innerHTML = '<i class="fas fa-microphone"></i> Record Audio Note';
        status.classList.add('hidden');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            status.classList.remove('hidden');

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;
                const clientId = document.getElementById('clientDropdown').value;
                if (!clientId) return;

                try {
                    const fbRef = push(ref(db, `users/${clientId}/trainer_feedback`));
                    await set(fbRef, {
                        sender: 'trainer',
                        type: 'audio',
                        audioData: base64Audio,
                        trainerId: trainerUser.uid,
                        timestamp: serverTimestamp(),
                        dateString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toDateString()
                    });
                    status.innerHTML = '<i class="fas fa-check"></i> Sent!';
                    setTimeout(() => status.classList.add('hidden'), 3000);
                } catch (e) {
                    console.error("Audio Upload Error:", e);
                    status.innerHTML = '<i class="fas fa-times"></i> Failed';
                }
            };
        });

        mediaRecorder.start();
        isRecording = true;
        btn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        status.innerHTML = '<i class="fas fa-circle blob" style="color: #ef4444;"></i> Recording... Click to Stop';
        status.classList.remove('hidden');

    } catch (e) {
        console.error("Microphone access denied:", e);
        alert("Microphone access is required to send voice notes.");
    }
});
