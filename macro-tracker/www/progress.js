
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, get, serverTimestamp, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Config ---
const firebaseConfig = {
    apiKey: "AIzaSyCohKlqNu0I1sXcLW4D_fv-OEw9x0S50q8", // Standard Key
    authDomain: "dc-infotechpvt-1-d1a4b.firebaseapp.com",
    databaseURL: "https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com",
    projectId: "dc-infotechpvt-1-d1a4b",
    storageBucket: "dc-infotechpvt-1-d1a4b.firebasestorage.app",
    messagingSenderId: "330752838328",
    appId: "1:330752838328:web:1fe0ca04953934d4638703"
};

const GEMINI_URL = '/.netlify/functions/gemini-proxy';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let currentUser = null;

// --- DOM ---
const progressGrid = document.getElementById('progressGrid');
const addCheckinBtn = document.getElementById('addCheckinBtn');
const uploadModal = document.getElementById('uploadModal');
const closeModalBtn = document.getElementById('closeUploadModalBtn');
const saveCheckinBtn = document.getElementById('saveCheckinBtn');
const photoInputFront = document.getElementById('checkinPhotoFront');
const photoInputBack = document.getElementById('checkinPhotoBack');
const photoInputSide = document.getElementById('checkinPhotoSide');

const previewFront = document.getElementById('photoPreviewFront');
const previewBack = document.getElementById('photoPreviewBack');
const previewSide = document.getElementById('photoPreviewSide');

const dateInput = document.getElementById('checkinDate');
const weightInput = document.getElementById('checkinWeight');
const armsInput = document.getElementById('checkinArms');
const chestInput = document.getElementById('checkinChest');
const waistInput = document.getElementById('checkinWaist');
const absInput = document.getElementById('checkinAbs');
const notesInput = document.getElementById('checkinNotes');
const checkinWeekLabel = document.getElementById('checkinWeekLabel');

const comparisonBar = document.getElementById('comparisonBar');
const selectedCountEl = document.getElementById('selectedCount');
const compareBtn = document.getElementById('compareBtn');
const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');
const analysisResult = document.getElementById('analysisResult');
const analysisText = document.getElementById('analysisText');

// --- Details Modal DOM (Goal 33) ---
const checkinDetailsModal = document.getElementById('checkinDetailsModal');
const closeCheckinDetailsBtn = document.getElementById('closeCheckinDetailsBtn');
const detWeight = document.getElementById('detWeight');
const detChest = document.getElementById('detChest');
const detArms = document.getElementById('detArms');
const detWaist = document.getElementById('detWaist');
const detAbs = document.getElementById('detAbs');
const detNotes = document.getElementById('detNotes');
const detFront = document.getElementById('detailsFront');
const detBack = document.getElementById('detailsBack');
const detSide = document.getElementById('detailsSide');
const deleteCheckinBtn = document.getElementById('deleteCheckinBtn');
const selectForCompareBtn = document.getElementById('selectForCompareBtn');

// --- State ---
let selectedCheckIns = []; // Array of {id, image, date, ...}
let allCheckIns = []; // Array of all data
let allWorkouts = []; // Array of all workouts

// --- Workout DOM ---
const addWorkoutBtn = document.getElementById('addWorkoutBtn');
const workoutModal = document.getElementById('workoutModal');
const closeWorkoutModalBtn = document.getElementById('closeWorkoutModalBtn');
const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
const workoutDateInput = document.getElementById('workoutDate');
const workoutNotesInput = document.getElementById('workoutNotes');
const workoutStatusText = document.getElementById('workoutStatusText');
const workoutList = document.getElementById('workoutList');

// --- AI Routine DOM (Goal 17) ---
const generateRoutineBtn = document.getElementById('generateRoutineBtn');
const generateRoutineModal = document.getElementById('generateRoutineModal');
const closeRoutineModalBtn = document.getElementById('closeRoutineModalBtn');
const buildRoutineActionBtn = document.getElementById('buildRoutineActionBtn');
const routineEquipment = document.getElementById('routineEquipment');
const routineMuscle = document.getElementById('routineMuscle');
const routineLoader = document.getElementById('routineLoader');
const routineResultContent = document.getElementById('routineResultContent');

// --- Auth ---
const localUserStr = localStorage.getItem('macro_user');
if (localUserStr) {
    currentUser = JSON.parse(localUserStr);
    loadCheckIns();
    loadWorkouts();
} else {
    window.location.href = "index.html";
}

// --- Event Listeners ---
addCheckinBtn.addEventListener('click', () => {
    dateInput.valueAsDate = new Date();

    // Goal 32: Intelligent Progress Prompting
    if (allCheckIns.length === 0) {
        checkinWeekLabel.textContent = "Day 1 Entry";
    } else {
        // Find the earliest entry to calculate weeks from
        const firstEntry = [...allCheckIns].sort((a, b) => new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp))[0];
        const firstDate = new Date(firstEntry.date || firstEntry.timestamp);
        const today = new Date();
        const diffDays = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
        const weekNum = Math.floor(diffDays / 7) + 1;

        checkinWeekLabel.textContent = `Week ${weekNum} Check-in`;

        // Bonus: If already checked in this week, change button text
        const hasCheckedInThisWeek = allCheckIns.some(c => {
            const cDate = new Date(c.date || c.timestamp);
            const daysSinceFirst = Math.floor((cDate - firstDate) / (1000 * 60 * 60 * 24));
            return Math.floor(daysSinceFirst / 7) + 1 === weekNum;
        });

        if (hasCheckedInThisWeek) {
            saveCheckinBtn.textContent = "Update Week " + weekNum;
        } else {
            saveCheckinBtn.textContent = "Save Check-in";
        }
    }

    uploadModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => uploadModal.classList.add('hidden'));

function handleImagePreview(inputElement, previewElement) {
    if (!inputElement || !previewElement) return;

    inputElement.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                previewElement.style.backgroundImage = `url(${ev.target.result})`;
                previewElement.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

handleImagePreview(photoInputFront, previewFront);
handleImagePreview(photoInputBack, previewBack);
handleImagePreview(photoInputSide, previewSide);

saveCheckinBtn.addEventListener('click', async () => {
    if (!photoInputFront || !photoInputFront.files[0]) {
        alert("Please provide at least a front photo.");
        return;
    }

    saveCheckinBtn.disabled = true;
    saveCheckinBtn.textContent = "Compressing & Uploading...";

    try {
        const frontBase64 = await compressImage(photoInputFront.files[0]);
        let backBase64 = null;
        let sideBase64 = null;

        if (photoInputBack && photoInputBack.files[0]) {
            backBase64 = await compressImage(photoInputBack.files[0]);
        }
        if (photoInputSide && photoInputSide.files[0]) {
            sideBase64 = await compressImage(photoInputSide.files[0]);
        }

        const checkinData = {
            userId: currentUser.uid,
            timestamp: serverTimestamp(),
            date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
            measurements: {
                weight: weightInput && weightInput.value ? weightInput.value : 0,
                arms: armsInput && armsInput.value ? armsInput.value : 0,
                chest: chestInput && chestInput.value ? chestInput.value : 0,
                waist: waistInput && waistInput.value ? waistInput.value : 0,
                abs: absInput && absInput.value ? absInput.value : 0
            },
            notes: notesInput ? notesInput.value : '',
            images: {
                front: frontBase64,
                back: backBase64,
                side: sideBase64
            },
            photos: { // Goal 23: Standardized key for trainer visibility
                front: frontBase64,
                back: backBase64,
                side: sideBase64
            }
        };

        // Goal 26: Standardized path
        await push(ref(db, `users/${currentUser.uid}/progress`), checkinData);

        // Reset and close
        [photoInputFront, photoInputBack, photoInputSide].forEach(input => { if (input) input.value = ''; });
        [previewFront, previewBack, previewSide].forEach(prev => { if (prev) { prev.style.display = 'none'; prev.style.backgroundImage = 'none'; } });
        [weightInput, armsInput, chestInput, waistInput, absInput, notesInput].forEach(inp => { if (inp) inp.value = ''; });

        uploadModal.classList.add('hidden');
        saveCheckinBtn.disabled = false;
        saveCheckinBtn.textContent = "Save Check-in";
        loadCheckIns(); // Refresh

    } catch (e) {
        console.error("Upload error", e);
        alert("Error saving check-in: " + e.message);
        saveCheckinBtn.disabled = false;
        saveCheckinBtn.textContent = "Save Check-in";
    }
});

cancelSelectionBtn.addEventListener('click', () => {
    selectedCheckIns = [];
    renderGrid();
    updateComparisonBar();
});

compareBtn.addEventListener('click', () => {
    if (selectedCheckIns.length !== 2) return;
    performAnalysis(selectedCheckIns);
});

// --- Workout Event Listeners ---
addWorkoutBtn.addEventListener('click', () => {
    workoutDateInput.valueAsDate = new Date();
    workoutNotesInput.value = '';
    workoutStatusText.textContent = '';
    workoutModal.classList.remove('hidden');
});

closeWorkoutModalBtn.addEventListener('click', () => {
    workoutModal.classList.add('hidden');
});

saveWorkoutBtn.addEventListener('click', async () => {
    const notes = workoutNotesInput.value.trim();
    if (!notes) {
        workoutStatusText.textContent = "Please enter some workout details.";
        return;
    }

    saveWorkoutBtn.disabled = true;
    workoutStatusText.textContent = "Formatting workout with AI...";

    // Process with Gemini to make it look clean
    let formattedWorkout = notes;
    try {
        const prompt = `Format this messy workout note into a clean, concise, bulleted HTML string. Only return the HTML, no markdown code blocks. Keep it simple. Note: "${notes}"`;
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            formattedWorkout = data.candidates[0].content.parts[0].text.replace(/```html/gi, '').replace(/```/g, '').trim();
        }
    } catch (e) {
        console.error("Gemini workout error", e);
    }

    workoutStatusText.textContent = "Saving...";

    const workoutData = {
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        date: workoutDateInput.value,
        originalNotes: notes,
        formattedHtml: formattedWorkout
    };

    try {
        // Goal 26: Standardized path
        await push(ref(db, `users/${currentUser.uid}/workouts`), workoutData);
        workoutModal.classList.add('hidden');
        saveWorkoutBtn.disabled = false;
        loadWorkouts();
    } catch (e) {
        console.error("Error saving workout", e);
        workoutStatusText.textContent = "Error saving. Try again.";
        saveWorkoutBtn.disabled = false;
    }
});

// --- Functions ---

async function loadCheckIns() {
    progressGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const { get } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

        // Goal 26 & 28: Fetch from new standardized path AND legacy path
        const newPathRef = ref(db, `users/${currentUser.uid}/progress`);
        const oldPathRef = ref(db, `checkins/${currentUser.uid}`);

        const [newSnap, oldSnap] = await Promise.all([
            get(newPathRef),
            get(oldPathRef)
        ]);

        allCheckIns = [];
        const processSnap = (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    allCheckIns.push({ id: child.key, ...child.val() });
                });
            }
        };

        processSnap(newSnap);
        processSnap(oldSnap);

        // Deduplicate by ID just in case
        const seen = new Set();
        allCheckIns = allCheckIns.filter(c => {
            const duplicate = seen.has(c.id);
            seen.add(c.id);
            return !duplicate;
        });

        // Sort by date descending in JS
        allCheckIns.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

        renderGrid();
        renderWeightChart(); // Goal 31

    } catch (e) {
        console.error("Load error", e);
        progressGrid.innerHTML = `<p>Error loading photos.</p>`;
    }
}

function renderGrid() {
    progressGrid.innerHTML = '';

    if (allCheckIns.length === 0) {
        progressGrid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center;">No photos yet. Add your first check-in!</p>';
        return;
    }

    allCheckIns.forEach(checkin => {
        const isSelected = selectedCheckIns.find(s => s.id === checkin.id);

        let displayImage = '';
        const photos = checkin.photos || checkin.images || {};
        if (typeof photos === 'object' && photos.front) {
            displayImage = photos.front;
        } else if (checkin.image) {
            displayImage = checkin.image;
        } else if (checkin.photoURL) {
            displayImage = checkin.photoURL;
        } else {
            displayImage = 'https://via.placeholder.com/300x400?text=No+Photo';
        }

        const card = document.createElement('div');
        card.className = `checkin-card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => openCheckinDetails(checkin);

        const dateVal = checkin.date || checkin.timestamp;
        const formattedDate = dateVal ? new Date(dateVal).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date';

        card.innerHTML = `
            <img src="${displayImage}" class="checkin-img" alt="Check-in Front" onerror="this.src='https://via.placeholder.com/300x400?text=Image+Error'">
            <div class="checkin-info">
                <div class="checkin-date">${formattedDate}</div>
                <div class="checkin-weight">${checkin.measurements?.weight || checkin.weight || '--'} kg</div>
                <div style="font-size:0.65rem; color:var(--text-muted); margin-top:4px; display:flex; gap:4px; flex-wrap: wrap;">
                    <span>A: ${checkin.measurements?.arms || checkin.arms || '-'}</span> | 
                    <span>C: ${checkin.measurements?.chest || checkin.chest || '-'}</span> | 
                    <span>W: ${checkin.measurements?.waist || checkin.waist || '-'}</span> | 
                    <span>B: ${checkin.measurements?.abs || checkin.abs || '-'}</span>
                </div>
            </div>
            ${isSelected ? '<div style="position:absolute; top:8px; right:8px; background:var(--primary); color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fas fa-check"></i></div>' : ''}
        `;
        progressGrid.appendChild(card);
    });
}

// Goal 31: Weight Trend Chart
let weightChartInstance = null;
function renderWeightChart() {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    // Filter and sort for chronological order (Oldest First)
    const weightData = allCheckIns
        .filter(c => (c.measurements && c.measurements.weight) || c.weight)
        .map(c => ({
            x: new Date(c.date || c.timestamp),
            y: parseFloat(c.measurements?.weight || c.weight)
        }))
        .sort((a, b) => a.x - b.x);

    if (weightData.length === 0) {
        ctx.parentElement.style.display = 'none';
        return;
    }
    ctx.parentElement.style.display = 'block';

    if (weightChartInstance) {
        weightChartInstance.destroy();
    }

    // @ts-ignore (Chart is global from script tag)
    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weightData.map(d => d.x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Weight (kg)',
                data: weightData.map(d => d.y),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// --- Workout Functions ---
async function loadWorkouts() {
    workoutList.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const { get } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

        // Goal 28: Fetch from new standardized path AND legacy path
        const newRef = ref(db, `users/${currentUser.uid}/workouts`);
        const oldRef = ref(db, `workouts/${currentUser.uid}`);

        const [newSnap, oldSnap] = await Promise.all([
            get(newRef),
            get(oldRef)
        ]);

        allWorkouts = [];
        if (newSnap.exists()) {
            newSnap.forEach(snap => allWorkouts.push({ id: snap.key, ...snap.val() }));
        }
        if (oldSnap.exists()) {
            oldSnap.forEach(snap => allWorkouts.push({ id: snap.key, ...snap.val() }));
        }

        // Sort by date descending
        allWorkouts.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
        renderWorkouts();
    } catch (e) {
        console.error("Workout load error", e);
        workoutList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ef4444;">Failed to load workouts.</div>';
    }
}

// Goal 28: Export to global window for SPA navigation access
window.loadCheckIns = loadCheckIns;
window.loadWorkouts = loadWorkouts;

function renderWorkouts() {
    workoutList.innerHTML = '';
    if (allWorkouts.length === 0) {
        workoutList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No workouts logged yet.</div>';
        return;
    }

    allWorkouts.forEach(workout => {
        const wCard = document.createElement('div');
        wCard.className = 'history-item';
        wCard.style.cssText = 'background: var(--card-bg); border: 1px solid rgba(0,0,0,0.05); padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); margin-bottom: 1rem;';

        const dateStr = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        wCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;"><i class="fas fa-calendar-alt" style="color:var(--primary); margin-right:5px;"></i> ${dateStr}</span>
                <span style="padding: 4px 10px; background: #eff6ff; color: #3b82f6; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Workout</span>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-main); line-height: 1.5; padding: 10px; background: #f9fafb; border-radius: 12px; border: 1px solid #f3f4f6;">
                ${workout.formattedHtml || workout.originalNotes}
            </div>
        `;
        workoutList.appendChild(wCard);
    });
}

function toggleSelection(checkin) {
    const customCheckin = {
        id: checkin.id,
        image: checkin.images ? checkin.images.front : (checkin.photos ? checkin.photos.front : checkin.image),
        measurements: checkin.measurements || { weight: checkin.weight },
        date: checkin.date
    };
    const index = selectedCheckIns.findIndex(s => s.id === checkin.id);

    if (index > -1) {
        selectedCheckIns.splice(index, 1);
    } else {
        if (selectedCheckIns.length >= 4) {
            selectedCheckIns.shift();
        }
        selectedCheckIns.push(customCheckin);
    }

    selectedCheckIns.sort((a, b) => new Date(a.date) - new Date(b.date));

    renderGrid();
    updateComparisonBar();
}

// --- Goal 33: Details & Delete Logic ---
function openCheckinDetails(checkin) {
    const photos = checkin.photos || checkin.images || {};

    // Set photos
    const setPhoto = (el, src) => {
        if (src) {
            el.style.backgroundImage = `url(${src})`;
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    };

    setPhoto(detFront, photos.front || checkin.image || checkin.photoURL);
    setPhoto(detBack, photos.back);
    setPhoto(detSide, photos.side);

    // Set stats
    detWeight.textContent = checkin.measurements?.weight || checkin.weight || '--';
    detChest.textContent = checkin.measurements?.chest || '-';
    detArms.textContent = checkin.measurements?.arms || '-';
    detWaist.textContent = checkin.measurements?.waist || '-';
    detAbs.textContent = checkin.measurements?.abs || '-';
    detNotes.textContent = checkin.notes || 'None';

    // Check if selected
    const isSelected = selectedCheckIns.some(s => s.id === checkin.id);
    selectForCompareBtn.innerHTML = isSelected ?
        '<i class="fas fa-minus-circle"></i> Remove from Compare' :
        '<i class="fas fa-plus-circle"></i> Add to Compare';
    selectForCompareBtn.style.background = isSelected ? '#64748b' : 'var(--primary)';

    // Button actions
    selectForCompareBtn.onclick = () => {
        toggleSelection(checkin);
        checkinDetailsModal.classList.add('hidden');
    };

    deleteCheckinBtn.onclick = () => deleteCheckin(checkin.id);

    checkinDetailsModal.classList.remove('hidden');
}

if (closeCheckinDetailsBtn) {
    closeCheckinDetailsBtn.onclick = () => checkinDetailsModal.classList.add('hidden');
}

async function deleteCheckin(checkinId) {
    if (!confirm("Are you sure you want to delete this check-in? This cannot be undone.")) return;

    try {
        deleteCheckinBtn.disabled = true;
        deleteCheckinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

        // Try both new and legacy paths
        const newRef = ref(db, `users/${currentUser.uid}/progress/${checkinId}`);
        const oldRef = ref(db, `checkins/${currentUser.uid}/${checkinId}`);

        await Promise.all([
            remove(newRef),
            remove(oldRef)
        ]);

        checkinDetailsModal.classList.add('hidden');
        deleteCheckinBtn.disabled = false;
        deleteCheckinBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Entry';

        // Remove from selection if it was there
        selectedCheckIns = selectedCheckIns.filter(s => s.id !== checkinId);
        updateComparisonBar();

        loadCheckIns(); // Refresh grid
    } catch (e) {
        console.error("Delete error", e);
        alert("Failed to delete check-in.");
        deleteCheckinBtn.disabled = false;
        deleteCheckinBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Entry';
    }
}

function updateComparisonBar() {
    selectedCountEl.textContent = selectedCheckIns.length;
    if (selectedCheckIns.length > 0) {
        comparisonBar.classList.remove('hidden');
    } else {
        comparisonBar.classList.add('hidden');
    }

    compareBtn.disabled = selectedCheckIns.length < 2;
    compareBtn.style.opacity = selectedCheckIns.length >= 2 ? '1' : '0.5';
    compareBtn.textContent = selectedCheckIns.length > 2 ? "Analyze Journey" : "Compare with AI";
}

// --- Image Compression ---
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Resize logic: Max width 800px
                const maxWidth = 800;
                const scaleSize = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Compress to JPEG 0.7 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// --- AI Analysis ---
compareBtn.addEventListener('click', () => {
    if (selectedCheckIns.length < 2) return;
    performAnalysis(selectedCheckIns);
});

async function performAnalysis(timelineItems) {
    analysisResult.classList.remove('hidden');
    analysisText.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Analyzing your progress journey across ${timelineItems.length} check-ins...`;

    let measurementsPrompt = "Timeline Measurements:\n";
    let imageParts = [];

    timelineItems.forEach((item, index) => {
        measurementsPrompt += `Entry ${index + 1} (${item.date}): Weight: ${item.measurements.weight}, Arms: ${item.measurements.arms}, Chest: ${item.measurements.chest}, Waist: ${item.measurements.waist}, Abs: ${item.measurements.abs}\n`;
        const base64 = item.image.split(',')[1];
        imageParts.push({ inlineData: { mimeType: "image/jpeg", data: base64 } });
    });

    const prompt = `
        You are an expert fitness coach and body composition analyst. You are evaluating a chronological timeline of ${timelineItems.length} progress photos of the same person.
        
        Here is the measurement data for each entry in chronological order:
        ${measurementsPrompt}

        Analyze the numerical progress AND the visual physical changes over time (muscle definition, fat loss, posture). 
        Correlate the visual changes observed in the photo timeline with the numerical changes if possible.
        Conclude with an encouraging summary of their overall progress. Use bullet points and focus on concrete changes.
    `;

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        ...imageParts
                    ]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API responded with error:', data.error);
            analysisText.textContent = "API Error: " + (data.error.message || "Unknown error");
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const result = data.candidates[0].content.parts[0].text;
            // Format markdown to HTML simple
            const html = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            analysisText.innerHTML = html;
        } else {
            console.error('Invalid response from Gemini:', data);
            analysisText.textContent = "Could not generate analysis. Try again.";
        }

    } catch (e) {
        console.error("AI Error", e);
        analysisText.textContent = "Error connecting to AI service.";
    }
}

// --- Goal 17: AI Routine Generator ---
if (generateRoutineBtn && generateRoutineModal) {
    generateRoutineBtn.addEventListener('click', () => {
        generateRoutineModal.classList.remove('hidden');
        routineResultContent.style.display = 'none';
        buildRoutineActionBtn.classList.remove('hidden');
        buildRoutineActionBtn.innerHTML = 'Generate';
    });

    closeRoutineModalBtn.addEventListener('click', () => {
        generateRoutineModal.classList.add('hidden');
    });

    buildRoutineActionBtn.addEventListener('click', async () => {
        const equip = routineEquipment.value;
        const target = routineMuscle.value;

        buildRoutineActionBtn.classList.add('hidden');
        routineResultContent.style.display = 'none';
        routineLoader.classList.remove('hidden');

        // Note: userProfile is accessed from localStorage as it is updated actively
        const userProfileStr = localStorage.getItem('macro_user_profile');
        const userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
        const goalStr = userProfile.goal ? `They are currently trying to ${userProfile.goal === 'lose' ? 'lose weight' : (userProfile.goal === 'gain' ? 'build muscle mass' : 'maintain weight')}.` : '';

        const prompt = `You are an expert personal trainer. Create a highly effective workout routine for the user based on these parameters:
- Equipment Available: ${equip}
- Target Muscle Group: ${target}
${goalStr}

Provide a structured routine with 4-5 exercises. For each exercise, specify Sets, Reps, and a very brief tip. 
Format the response using clean HTML (e.g. <strong>, <ul>, <li>, <br>). Make it punchy and motivational. Do not use Markdown backticks.`;

        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            let htmlText = data.candidates[0].content.parts[0].text;
            htmlText = htmlText.replace(/```html/g, '').replace(/```/g, '');

            routineLoader.classList.add('hidden');
            routineResultContent.innerHTML = htmlText;
            routineResultContent.style.display = 'block';

            buildRoutineActionBtn.innerHTML = "Regenerate";
            buildRoutineActionBtn.classList.remove('hidden');

        } catch (e) {
            console.error("AI Routine Error", e);
            routineLoader.classList.add('hidden');
            routineResultContent.innerHTML = '<span style="color: #ef4444;">Failed to generate routine. Try again.</span>';
            routineResultContent.style.display = 'block';
            buildRoutineActionBtn.classList.remove('hidden');
        }
    });
}

// Goal 20: Display version
const versionEl = document.getElementById('app-version-display');
if (versionEl) versionEl.textContent = 'v1.0.0';
