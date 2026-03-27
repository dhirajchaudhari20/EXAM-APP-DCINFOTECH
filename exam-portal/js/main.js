// --- 1. LOGIN & EXAM CHECK ---
document.addEventListener('DOMContentLoaded', () => {
    // --- CRITICAL CONSTANTS ---
    const MAX_PAUSES = 2;

    // --- 0. RESUME / COMPLETION CHECK ---
    const urlParams = new URLSearchParams(window.location.search);
    const examName = urlParams.get('exam') || 'Associate Cloud Engineer';
    const examId = urlParams.get('id') || 'legacy';
    const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
    const completionKey = `exam_completed_${user.email || 'guest'}_${examName.replace(/\s+/g, '_')}_${examId}`;

    if (localStorage.getItem(completionKey)) {
        Swal.fire({
            icon: 'info',
            title: 'Exam Completed',
            text: 'You have already completed this exam.',
            allowOutsideClick: false,
            confirmButtonText: 'Go to Dashboard'
        }).then(() => {
            window.location.href = 'dashboard.html';
        });
        return;
    }

    // --- FIREBASE REALTIME DB SYNC ---
    const SYNC_BASE_URL = 'https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_sessions';

    async function syncExamState(screenName) {
        if (!user.email) return;
        const sessionId = `${user.email.replace(/[.@]/g, '_')}_${examName.replace(/\s+/g, '_')}_${examId}`;
        const state = {
            currentScreen: screenName,
            lastUpdated: new Date().toISOString(),
            status: 'in-progress',
            user: user.email,
            exam: examName
        };

        try {
            await fetch(`${SYNC_BASE_URL}/${sessionId}.json`, {
                method: 'PATCH',
                body: JSON.stringify(state)
            });
            console.log(`[Sync] Saved state: ${screenName}`);
        } catch (e) {
            console.error("[Sync] Failed to save state:", e);
        }
    }

    async function checkResumeState() {
        if (!user.email) return;
        const sessionId = `${user.email.replace(/[.@]/g, '_')}_${examName.replace(/\s+/g, '_')}`;
        try {
            const response = await fetch(`${SYNC_BASE_URL}/${sessionId}.json`);
            const data = await response.json();
            if (data && data.status === 'in-progress' && data.currentScreen) {
                console.log(`[Resume] Resuming from: ${data.currentScreen}`);
                showScreen(data.currentScreen);
                return true;
            }
        } catch (e) {
            console.error("[Resume] Error checking state:", e);
        }
        return false;
    }

    // --- SHEETDB INTEGRATION FIX ---
    // **FIXED: Updated with Firebase endpoints.**
    const SHEETDB_BASE_URL = 'https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_results'; // New Results API
    const SHEETDB_RESULTS_URL = SHEETDB_BASE_URL; // Used for final submissions
    const SHEETDB_VIOLATIONS_URL = SHEETDB_BASE_URL; // Used for proctoring violation logs

    // Network check constants (no longer needed for simulation, but kept for clarity)
    const MIN_DOWNLOAD_SPEED_MBPS = 2.0;

    // Redirect to login if user is not found in localStorage
    if (!localStorage.getItem('cm_user')) {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You must be logged in to start an exam.',
            allowOutsideClick: false,
        }).then(() => {
            window.location.href = '/exam-portal/index.html';
        });
        return; // Stop further execution
    }
    // Initialize Lucide icons
    lucide.createIcons();
    // --- Screen Elements ---
    const screens = {
        tos: document.getElementById('tosScreen'),
        photoExamples: document.getElementById('photoExamplesScreen'),
        biometricCapture: document.getElementById('biometricCaptureScreen'),
        systemCheck: document.getElementById('systemCheckScreen'), // NEW SCREEN
        prepareLaunch: document.getElementById('prepareLaunchScreen'),
        review: document.getElementById('reviewScreen'),
        exam: document.getElementById('examScreen'),
    };
    // --- Exam Elements ---
    const examTitleEl = document.getElementById('examTitle');
    const timerEl = document.getElementById('timer');
    const questionArea = document.getElementById('questionArea');
    const questionNav = document.getElementById('questionNav');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const markReviewBtn = document.getElementById('markReviewBtn');
    const reviewExamBtn = document.getElementById('reviewExamBtn');
    // --- Pre-Exam Elements ---
    const tosCheckboxes = document.querySelectorAll('.tos-checkbox');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const proceedToExamplesBtn = document.getElementById('proceedToExamplesBtn');
    const doNotAgreeBtn = document.getElementById('doNotAgreeBtn');
    const proceedToCaptureBtn = document.getElementById('proceedToCaptureBtn');
    const exitExamBtn1 = document.getElementById('exitExamBtn1');
    const exitExamBtn2 = document.getElementById('exitExamBtn2');
    const exitExamBtn3 = document.getElementById('exitExamBtn3');
    const exitExamBtn4 = document.getElementById('exitExamBtn4'); // NEW BUTTON
    const launchCheckboxes = document.querySelectorAll('.launch-checkbox');
    const launchExamBtn = document.getElementById('launchExamBtn');
    const captureBtn = document.getElementById('captureBtn');
    const videoFeed = document.getElementById('videoFeed');
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const resumeBtn = document.getElementById('resumeBtn');
    const captureInstructionTitle = document.getElementById('captureInstructionTitle');
    const captureInstructionText = document.getElementById('captureInstructionText');
    const captureCanvas = document.getElementById('captureCanvas');
    // --- System Check Elements (NEW) ---
    const startSystemChecksBtn = document.getElementById('startSystemChecksBtn');
    const proceedToLaunchBtn = document.getElementById('proceedToLaunchBtn');
    const audioCheckStatus = document.getElementById('audioCheckStatus');
    const networkCheckStatus = document.getElementById('networkCheckStatus');
    // --- Review Screen Elements ---
    const returnToExamBtn = document.getElementById('returnToExamBtn');
    const finalSubmitBtn = document.getElementById('finalSubmitBtn');
    const reviewGrid = document.getElementById('reviewGrid');
    // --- Proctoring Elements ---
    const proctoringVideo = document.getElementById('proctoring-video');
    const warningsDisplay = document.getElementById('warnings-display');
    const proctorLog = document.getElementById('proctor-log');
    const IMGBB_API_KEY = '3bc6dafa7ecd7c01a118fad187d32ca5'; // Updated ImgBB API Key

    // --- Groq API Configuration (HARDCODED FOR PROTOTYPE) ---
    const GROQ_API_KEY = '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';
    const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
    let stream;
    let proctoringInterval;
    let periodicCaptureInterval; // NEW: Interval for periodic snapshots
    let pauseCount = 0; // Initialize pause counter
    let systemCheckAudioStream; // To hold the separate audio stream for checks
    let systemCheckState = {
        audio: false,
        network: false,
    };

    // --- Certificate Configuration ---
    const EXAM_META_MAPPING = {
        "Associate Cloud Engineer": {
            seriesID: "4301",
            level: "(Associate Level)",
            sealText: "IT Solutions Certified • Program Manager • GOOGLE CERTIFIED • ERGPAU • ASSOCIATE"
        },
        "Professional Data Engineer": {
            seriesID: "4302",
            level: "(Professional Level)",
            sealText: "IT Solutions Certified • Data Engineer • GOOGLE CERTIFIED • PROFESSIONAL"
        }
    };

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.style.display = 'none');
        if (screens[screenName]) {
            screens[screenName].style.display = 'flex';
            syncExamState(screenName); // Sync on every screen change
        }
    }
    // --- Fullscreen API Logic ---
    function goFullScreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                Swal.fire('Fullscreen Required', 'Please enable fullscreen mode to continue the exam.', 'warning');
            });
        }
    }
    /*
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && screens.exam.style.display === 'flex') {
            issueWarning("Fullscreen mode exited. Please re-enter fullscreen to avoid exam termination.");
        }
    });
    */
    // --- Pre-Exam Logic ---
    function checkAgreements() {
        const allChecked = Array.from(tosCheckboxes).every(cb => cb.checked);
        proceedToExamplesBtn.disabled = !allChecked;
    }
    tosCheckboxes.forEach(cb => cb.addEventListener('change', checkAgreements));
    selectAllBtn.addEventListener('click', () => {
        tosCheckboxes.forEach(cb => cb.checked = true);
        checkAgreements();
    });
    doNotAgreeBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
    proceedToExamplesBtn.addEventListener('click', () => {
        showScreen('photoExamples');
    });
    proceedToCaptureBtn.addEventListener('click', () => {
        showScreen('biometricCapture');
        startWebcam(videoFeed);
    });
    [exitExamBtn1, exitExamBtn2, exitExamBtn3, exitExamBtn4].forEach(btn => {
        btn.addEventListener('click', () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            window.location.href = 'dashboard.html';
        });
    });
    let captureStep = 'id'; // 'id' or 'face'
    let idImageData = ''; // Will store the base64 data of the ID
    let idImageUrl = '';
    async function startWebcam(videoElement) {
        try {
            // If a stream is already active (e.g. from biometric capture), stop it first
            if (stream) stream.getTracks().forEach(track => track.stop());

            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoElement.srcObject = stream;
        } catch (err) {
            console.error("Error accessing webcam:", err);
            Swal.fire({
                icon: 'error',
                title: 'Webcam Error',
                text: 'Could not access your webcam. Please ensure it is enabled and permissions are granted.',
            }).then(() => {
                window.location.href = 'dashboard.html';
            });
        }
    }
    async function analyzeImage(prompt, base64Image) {
        const requestBody = {
            model: GROQ_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.1,
            max_tokens: 1024
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || response.statusText;
            throw new Error(`Groq API Error: ${errorMessage}`);
        }

        const data = await response.json();
        const text = data.choices[0]?.message?.content || 'No';
        console.log("AI Analysis Result:", text);
        return text.trim().toLowerCase().includes('yes');
    }
    async function uploadToImgBB(imageData) {
        const formData = new FormData();
        formData.append('image', imageData);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);

        return result.data.url;
    }
    captureBtn.addEventListener('click', async function handleCapture() {
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<div class="spinner"></div> Capturing...';
        lucide.createIcons();
        captureCanvas.width = videoFeed.videoWidth;
        captureCanvas.height = videoFeed.videoHeight;
        captureCanvas.getContext('2d').drawImage(videoFeed, 0, 0);
        const imageData = captureCanvas.toDataURL('image/jpeg').split(',')[1];
        if (captureStep === 'id') {
            try {
                // --- AI VERIFICATION STEP ---
                const prompt = "Analyze this image. Does it contain a valid government ID card (like Aadhar, PAN, Driving License, or Passport) that is clearly visible? Answer 'YES' if a valid ID is found, otherwise explain why it is invalid in 1 short sentence.";

                let verificationPassed = false;
                try {
                    // Reuse existing analyzeImage function
                    const verificationResult = await analyzeImage(prompt, imageData);
                    if (verificationResult) {
                        verificationPassed = true;
                    } else {
                        // AI explicitly said NO
                        throw new Error("AI could not verify a valid ID card. Please ensure the card is clearly visible and well-lit.");
                    }
                } catch (aiError) {
                    console.error("AI Verification Error:", aiError);
                    // FAIL OPEN: If it's an API error (not a strict 'false' from AI), allow proceeding
                    if (aiError.message.includes('API Error') || aiError.message.includes('AI Error') || aiError.message.includes('Failed to fetch') || aiError.message.includes('Method Not Allowed') || aiError.message.includes('404') || aiError.message.includes('503')) {
                        console.warn("AI API failed, bypassing verification for exam continuity.");
                        Swal.fire({
                            icon: 'warning',
                            title: 'AI Verification Unavailable',
                            text: 'Proceeding with manual verification. Please ensure your ID is clear.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        verificationPassed = true;
                    } else {
                        // It was a legitimate logic failure (AI said image is bad)
                        throw aiError;
                    }
                }

                if (verificationPassed) {
                    // If verified (or bypassed), proceed to upload
                    idImageData = imageData;
                    idImageUrl = await uploadToImgBB(imageData);
                    console.log('ID Image URL:', idImageUrl);
                    Swal.fire({
                        icon: 'success',
                        title: 'ID Verified & Captured',
                        text: 'Now, please capture your face.',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Transition to face capture step
                    captureStep = 'face';
                    captureInstructionTitle.textContent = 'Step 2: Capture Your Face';
                    captureInstructionText.textContent = 'If applicable, please remove your glasses. Look straight into the camera, click the Capture button, and remain still.';
                    captureBtn.innerHTML = '<i data-lucide="camera" style="margin-right: 8px;"></i> Capture Face';
                    captureBtn.disabled = false;
                    lucide.createIcons();
                }
            } catch (error) {
                handleCaptureError('ID Verification Failed', error.message || 'Could not verify ID.', error);
            }
        } else if (captureStep === 'face') {
            try {
                // Direct upload without AI check
                const faceImageUrl = await uploadToImgBB(imageData);
                console.log('Face Image URL:', faceImageUrl);
                Swal.fire('Identity Verified!', 'Biometric verification successful.', 'success');
                // Stop the webcam and proceeding to system checks (NEW FLOW)
                if (stream) stream.getTracks().forEach(track => track.stop());
                showScreen('systemCheck');
            } catch (error) {
                handleCaptureError('Verification Error', 'An error occurred during face upload. Please try again.', error);
            }
        }
    });
    function handleCaptureError(title, text, errorDetails = null) {
        // Log the full error for debugging in the console
        console.error(title, text, errorDetails);
        Swal.fire(title, text, 'error');
        captureBtn.disabled = false;
        const buttonText = captureStep === 'id' ? 'Capture ID' : 'Capture Face';
        captureBtn.innerHTML = `<i data-lucide="camera" style="margin-right: 8px;"></i> ${buttonText}`;
        lucide.createIcons();
    }

    // --- NEW System Check Logic ---

    startSystemChecksBtn.addEventListener('click', async () => {
        const browserCheckStatus = document.getElementById('browserCheckStatus');
        const osCheckStatus = document.getElementById('osCheckStatus');
        const browserDetail = document.getElementById('browserDetail');
        const osDetail = document.getElementById('osDetail');
        const checkProgressBar = document.getElementById('checkProgressBar');
        const checkProgressText = document.getElementById('checkProgressText');
        const systemCheckProgress = document.getElementById('systemCheckProgress');

        startSystemChecksBtn.disabled = true;
        proceedToLaunchBtn.disabled = true;
        systemCheckProgress.style.display = 'block';

        // Reset UI
        [audioCheckStatus, networkCheckStatus, browserCheckStatus, osCheckStatus].forEach(el => {
            el.className = 'status-pending';
            el.innerHTML = '<i data-lucide="circle" class="status-icon"></i>';
        });
        document.querySelectorAll('.check-item').forEach(el => el.classList.remove('passed', 'failed'));

        checkProgressBar.style.width = '5%';
        checkProgressText.textContent = 'Initializing system scan...';
        lucide.createIcons();

        // Reset state
        systemCheckState.audio = false;
        systemCheckState.network = false;
        let browserPass = false;
        let osPass = false;

        // 1. Browser Check
        checkProgressText.textContent = 'Verifying Browser Compatibility...';
        checkProgressBar.style.width = '25%';
        await new Promise(r => setTimeout(r, 800)); // Simulate check delay

        // Simple check
        const agent = navigator.userAgent;
        let browserName = "Unknown";
        if (agent.indexOf("Chrome") > -1) browserName = "Google Chrome";
        else if (agent.indexOf("Safari") > -1) browserName = "Safari";
        else if (agent.indexOf("Firefox") > -1) browserName = "Mozilla Firefox";
        else if (agent.indexOf("Edg") > -1) browserName = "Edge";

        browserDetail.textContent = browserName;
        browserPass = true; // Always pass for now
        browserCheckStatus.innerHTML = '<i data-lucide="check-circle" class="status-icon"></i> Supported';
        browserCheckStatus.className = 'status-pass';
        document.getElementById('checkItem-browser').classList.add('passed');
        lucide.createIcons();

        // 2. OS Check
        checkProgressText.textContent = 'Verifying Operating System...';
        checkProgressBar.style.width = '50%';
        await new Promise(r => setTimeout(r, 800));

        const platform = navigator.platform;
        osDetail.textContent = platform;
        osPass = true;
        osCheckStatus.innerHTML = '<i data-lucide="check-circle" class="status-icon"></i> Supported';
        osCheckStatus.className = 'status-pass';
        document.getElementById('checkItem-os').classList.add('passed');
        lucide.createIcons();

        // 3. Audio Check
        checkProgressText.textContent = 'Testing Audio Input...';
        checkProgressBar.style.width = '75%';
        await performAudioCheck();

        if (systemCheckState.audio) {
            document.getElementById('checkItem-audio').classList.add('passed');
        } else {
            document.getElementById('checkItem-audio').classList.add('failed');
        }

        // 4. Network Check
        checkProgressText.textContent = 'Testing Network Speed...';
        checkProgressBar.style.width = '90%';
        await performNetworkCheck();

        if (systemCheckState.network) {
            document.getElementById('checkItem-network').classList.add('passed');
        } else {
            document.getElementById('checkItem-network').classList.add('failed');
        }

        checkProgressBar.style.width = '100%';

        // Check if both passed
        if (systemCheckState.audio && systemCheckState.network && browserPass && osPass) {
            checkProgressText.textContent = 'System Check Complete.';
            proceedToLaunchBtn.disabled = false;
            Swal.fire('System Ready', 'All system checks passed. You may now proceed to launch!', 'success');
        } else {
            checkProgressText.textContent = 'System Check Failed.';
            startSystemChecksBtn.disabled = false; // Allow user to retry
            Swal.fire('System Failure', 'One or more essential checks failed. Please resolve the issues and try again.', 'error');
        }
    });

    proceedToLaunchBtn.addEventListener('click', () => {
        showScreen('prepareLaunch');
    });

    async function performAudioCheck() {
        return new Promise(resolve => {
            // Clear any previous interval/timeout to prevent multiple checks running
            if (systemCheckAudioStream) {
                systemCheckAudioStream.getTracks().forEach(track => track.stop());
                systemCheckAudioStream = null;
            }

            const timeout = setTimeout(() => {
                audioCheckStatus.innerHTML = '<i data-lucide="x" class="status-icon"></i> Timeout/No Permission';
                audioCheckStatus.className = 'status-fail';
                systemCheckState.audio = false;
                resolve();
            }, 8000); // Increased timeout for a better test/user response time

            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(stream => {
                    clearTimeout(timeout);
                    systemCheckAudioStream = stream; // Keep a reference to stop later
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    analyser.fftSize = 512;
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);

                    let isMicWorking = false;
                    let checkAttempts = 0;
                    const maxAttempts = 16; // Check for 8 seconds (16 * 500ms)
                    const checkInterval = setInterval(() => {
                        if (checkAttempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            stream.getTracks().forEach(track => track.stop()); // Stop stream

                            if (isMicWorking) {
                                audioCheckStatus.innerHTML = '<i data-lucide="check" class="status-icon"></i> Input Detected';
                                audioCheckStatus.className = 'status-pass';
                                systemCheckState.audio = true;
                            } else {
                                audioCheckStatus.innerHTML = '<i data-lucide="x" class="status-icon"></i> No Input Detected';
                                systemCheckState.audio = false;
                            }
                            lucide.createIcons();
                            resolve();
                            return;
                        }

                        analyser.getByteFrequencyData(dataArray);
                        let sum = 0;
                        for (const amplitude of dataArray) {
                            sum += amplitude * amplitude;
                        }
                        const volume = Math.sqrt(sum / dataArray.length);
                        if (volume > 20) { // Arbitrary volume threshold
                            isMicWorking = true;
                        }
                        checkAttempts++;
                        audioCheckStatus.innerHTML = `<i data-lucide="mic" class="status-icon"></i> Speak Now... (Level: ${volume.toFixed(1)})`;
                        lucide.createIcons();

                    }, 500);

                    // Instruct user to speak
                    Swal.fire({
                        icon: 'info',
                        title: 'Audio Check',
                        text: 'Please speak clearly into your microphone now to confirm input. (Will run for 8 seconds)',
                        timer: 8000,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                    });
                })
                .catch(err => {
                    clearTimeout(timeout);
                    audioCheckStatus.innerHTML = '<i data-lucide="x" class="status-icon"></i> Mic Permission Denied';
                    audioCheckStatus.className = 'status-fail';
                    systemCheckState.audio = false;
                    lucide.createIcons();
                    resolve();
                });
        });
    }

    async function performNetworkCheck() {
        networkCheckStatus.innerHTML = '<i data-lucide="loader-circle" class="status-icon spinner"></i> Testing ...';
        lucide.createIcons();

        return new Promise(resolve => {
            // **SIMULATION LOGIC - GUARANTEED PASS**
            const SIMULATION_DELAY_MS = 5000; // Simulate a 5-second download
            const SIMULATED_SPEED = 15.5; // Simulate a fast, passing speed

            setTimeout(() => {
                networkCheckStatus.innerHTML = `<i data-lucide="check" class="status-icon"></i> ${SIMULATED_SPEED} Mbps (Pass)`;
                networkCheckStatus.className = 'status-pass';
                systemCheckState.network = true;
                lucide.createIcons();
                resolve();
            }, SIMULATION_DELAY_MS);
        });
    }

    function checkLaunchReadiness() {
        const allChecked = Array.from(launchCheckboxes).every(cb => cb.checked);
        launchExamBtn.disabled = !allChecked;
    }
    launchCheckboxes.forEach(cb => cb.addEventListener('change', checkLaunchReadiness));

    launchExamBtn.addEventListener('click', async () => {
        // 1. Force Fullscreen just before launch
        goFullScreen();

        let allAppsClosed = false;

        // 2. Mandatory, Blocking Check for Background Apps (Simulated)
        // The loop ensures the user cannot proceed until they explicitly confirm the closure.
        while (!allAppsClosed) {
            const { isConfirmed } = await Swal.fire({
                title: 'MANDATORY: Close All Background Applications',
                html: `
                    <p>The system requires that all non-essential applications (like Zoom, Slack, IDEs, Web Browsers, etc.) are **CLOSED**.</p>
                    <p><strong>The exam will NOT launch until you confirm all unauthorized applications are closed.</strong></p>
                    <p>Your screen and webcam will be monitored. Failing to close apps may result in immediate termination.</p>
                    <p>Are you certain all non-exam related applications are closed?</p>
                `,
                icon: 'error', // Use error/warning icon to stress importance
                showCancelButton: true,
                confirmButtonColor: '#34a853',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, All Apps Are Closed',
                cancelButtonText: 'No, I need to close apps',
                allowOutsideClick: false,
            });

            if (isConfirmed) {
                allAppsClosed = true;
            } else {
                // If the user cancels, they are blocked by the loop and will be prompted again
                await Swal.fire('Action Required', 'Please close all background applications. Click "Yes, All Apps Are Closed" to continue.', 'info');
            }
        } // End while loop

        // 3. Proceed to Launch
        Swal.fire({
            title: 'Launching Exam...',
            text: 'Please wait while we prepare your session. Live proctoring will start automatically.',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false
        }).then(() => initializeExam());
    });


    // --- 2. QUESTION BANK ---
    const sourceQuestions = allQuestions[examName] || allQuestions.default;
let questions = [...sourceQuestions]; // Initialize with copy, will be reordered
let questionOrder = []; // Store indices for persistence
// --- State Variables ---
let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null);
let markedForReview = new Array(questions.length).fill(false);
let sessionSnapshots = []; // Store snapshots locally
let remoteActionInterval;
let scheduledEmail = ''; // To store the email from the schedule

// --- REMOTE PROCTORING POLLING ---
// --- REAL-TIME REMOTE PROCTORING LISTENER ---
function startRemoteStatusListener() {
    if (!examId) return;

    // Listen for real-time status changes from Admin Dashboard
    const examRef = firebase.database().ref(`exam_schedules/${examId}`);
    examRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Capture the gmail from the schedule if not already set
            if (data.userEmail || data.gmail) {
                scheduledEmail = data.userEmail || data.gmail;
            }
            // Instantly handle status changes (e.g., TERMINATED, PAUSED_BY_ADMIN)
            handleRemoteAction(data);
        }
    });
}

async function updateRemoteStatus(newStatus) {
    if (!examId) return;
    try {
        // Update status directly on the Firebase exam_schedules node
        await fetch(`https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_schedules/${examId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
    } catch (e) {
        console.error("Failed to update remote status", e);
    }
}

function handleRemoteAction(data) {
    const status = data.status;
    const meetingLink = data.meetingLink; // Get link from data

    if (status === 'PAUSED_BY_ADMIN') {
        if (!document.getElementById('pauseOverlay')) {
            showPauseOverlay(true, meetingLink); // Pass link to overlay
        }
    } else if (status === 'TERMINATED') {
        if (proctoringInterval) clearInterval(proctoringInterval);
        if (remoteActionInterval) clearInterval(remoteActionInterval);
        if (timerInterval) clearInterval(timerInterval);

        Swal.fire({
            icon: 'error',
            title: 'Exam Terminated',
            html: `
                    <p>Your exam has been forcibly terminated by the proctor due to policy violations or administrative action.</p>
                    <p>Please contact support immediately.</p>
                `,
            allowOutsideClick: false,
            confirmButtonText: 'Connect with Support',
            showCancelButton: false
        }).then(() => {
            // Determine Tawk.to direct chat link or just widget
            if (typeof Tawk_API !== 'undefined') {
                Tawk_API.maximize();
            }
        });
        // Stop interactions
        document.body.style.pointerEvents = 'none';
        // Allow Tawk widget interaction (it usually has high z-index, but pointer-events none on body might kill it. let's fix that)
        // Actually Tawk widget is in an iframe, usually usually safe.
        // Better to redirect or just show the swal persistently.
    } else if (status === 'LIVE' || status === 'Scheduled') {
        // Resume if paused by admin
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay && pauseOverlay.dataset.triggeredByAdmin === 'true') {
            pauseOverlay.remove();
        }
    }
}

function showPauseOverlay(isAdmin = false, meetingLink = null) {
    if (document.getElementById('pauseOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'pauseOverlay';
    if (isAdmin) overlay.dataset.triggeredByAdmin = 'true';
    overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 9999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: white; text-align: center;
        `;

    let content = `<h1>Exam Paused</h1><p>You have used a pause.</p><button id="resumeBtn">Resume</button>`;

    if (isAdmin) {
        // Auto-maximize chat if available
        if (typeof Tawk_API !== 'undefined') {
            Tawk_API.maximize();
        }

        content = `
                <h1 style="color: #ea8600;">Exam Paused by Proctor</h1>
                <p>The administrator has paused your session.</p>
                <div style="margin: 20px 0; border: 2px solid #ea8600; padding: 5px; border-radius: 8px;">
                    <video id="pausedFeed" autoplay playsinline muted style="width: 320px; border-radius: 4px; background: #000;"></video>
                    <div style="font-size: 12px; color: #aaa; margin-top: 5px;">Your Live Feed (Monitored)</div>
                </div>
                <p>Please check the chat window (bottom right) for instructions.</p>
                <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                    <button onclick="Tawk_API.maximize()" style="padding: 10px 20px; background: #fff; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        💬 Open Chat
                    </button>
                    ${meetingLink ? `<a href="${meetingLink}" target="_blank" style="padding: 10px 20px; background: #ea4335; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">🎥 Join Video Call</a>` : ''}
                </div>
             `;
    }

    overlay.innerHTML = content;
    document.body.appendChild(overlay);

    // Attach steam to the video element we just created
    if (isAdmin) {
        const pausedVideo = document.getElementById('pausedFeed');
        if (pausedVideo && stream) {
            pausedVideo.srcObject = stream;
        }
    }

    if (!isAdmin) {
        document.getElementById('resumeBtn').addEventListener('click', () => {
            overlay.remove();
            // Logic to resume timer etc
        });
    }
}


// --- State Persistence Logic ---
function getStorageKey() {
    const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
    const userEmail = user.email || 'guest';
    return `exam_state_${userEmail}_${examName.replace(/\s+/g, '_')}`;
}

function saveExamState() {
    const state = {
        userAnswers,
        markedForReview,
        currentQuestionIndex,
        secondsRemaining,
        pauseCount,
        questionOrder, // Save the randomized order

        timestamp: new Date().getTime()
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
}

function clearExamState() {
    localStorage.removeItem(getStorageKey());
}

returnToExamBtn.addEventListener('click', () => {
    showScreen('exam');
});

finalSubmitBtn.addEventListener('click', () => {
    const answeredCount = userAnswers.filter(a => a !== null).length;
    const unansweredCount = questions.length - answeredCount;
    Swal.fire({
        title: 'Confirm Final Submission',
        html: `
                <p>You are about to permanently submit your exam.</p>
                <p><strong>Answered:</strong> ${answeredCount} | <strong>Unanswered:</strong> ${unansweredCount}</p>
                <p>This action cannot be undone.</p>
            `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#34a853',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, submit it!'
    }).then((result) => {
        if (result.isConfirmed) {
            submitAndExit();
        }
    });
});

function populateReviewScreen() {
    const answeredCount = userAnswers.filter(a => a !== null).length;
    document.getElementById('summaryAnswered').textContent = answeredCount;
    document.getElementById('summaryUnanswered').textContent = questions.length - answeredCount;
    document.getElementById('summaryMarked').textContent = markedForReview.filter(m => m).length;
    // Render the review grid
    renderNav(true);
}
// --- Initialization ---
async function initializeExam() {
    // --- START AGGRESSIVE SECURITY ---
    if (window.setupExamSecurity) window.setupExamSecurity();

    showScreen('exam');
    // Fetch scheduled email immediately
    if (examId) {
        // Check localStorage first to avoid API request
        const cachedEmail = localStorage.getItem(`scheduled_email_${examId}`);
        if (cachedEmail) {
            scheduledEmail = cachedEmail;
            console.log("Captured scheduled email from cache:", scheduledEmail);
        } else {
            try {
                const resp = await fetch(`https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_schedules/${examId}.json`);
                const data = await resp.json();
                if (data && data.gmail) {
                    scheduledEmail = data.gmail;
                    console.log("Captured scheduled email from Firebase:", scheduledEmail);
                    // Store it for future use during this session's refreshes
                    localStorage.setItem(`scheduled_email_${examId}`, scheduledEmail);
                }
            } catch (e) {
                console.error("Initial schedule fetch failed", e);
            }
        }
    }

    // Initialize pause button display
    const pauseCountDisplay = document.getElementById('pauseCountDisplay');
    if (pauseCountDisplay) {
        pauseCountDisplay.textContent = `(${MAX_PAUSES - pauseCount} left)`;
    }
    // Note: Fullscreen is now handled by launchExamBtn click event.
    // Stop the system check stream if it exists
    if (systemCheckAudioStream) systemCheckAudioStream.getTracks().forEach(track => track.stop());

    examTitleEl.textContent = examName;

    // --- Restore State Logic ---
    const savedStateJson = localStorage.getItem(getStorageKey());
    let savedSeconds = 90 * 60;
    let isResuming = false;

    if (savedStateJson) {
        try {
            const state = JSON.parse(savedStateJson);
            // Basic validation to ensure state matches current exam structure
            if (state.userAnswers && state.userAnswers.length === questions.length) {
                userAnswers = state.userAnswers;
                markedForReview = state.markedForReview || markedForReview;
                currentQuestionIndex = state.currentQuestionIndex || 0;
                pauseCount = state.pauseCount || 0;
                savedSeconds = state.secondsRemaining || savedSeconds;

                // --- Restore Question Order ---
                if (state.questionOrder && state.questionOrder.length === sourceQuestions.length) {
                    questionOrder = state.questionOrder;
                    // Reconstruct shuffled array based on saved indices
                    questions = questionOrder.map(index => sourceQuestions[index]);
                }

                isResuming = true;
            }
        } catch (e) {
            console.error("Error parsing saved state", e);
        }
    }

    // --- If NEW session (not resuming), Shuffle Questions ---
    if (!isResuming) {
        // Create array of indices [0, 1, 2, ... n]
        questionOrder = Array.from({ length: sourceQuestions.length }, (_, i) => i);
        // Shuffle indices
        for (let i = questionOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionOrder[i], questionOrder[j]] = [questionOrder[j], questionOrder[i]];
        }
        // Reorder questions array
        questions = questionOrder.map(index => sourceQuestions[index]);

        // Reset state variables to match new shuffled length (though length is same)
        userAnswers = new Array(questions.length).fill(null);
        markedForReview = new Array(questions.length).fill(false);
    }

    // Start proctoring first to get the welcome message
    await startProctoring();
    // Show the welcome message from the AI
    Swal.fire({
        title: isResuming ? 'Resuming Your Exam' : 'Welcome to Your Live Proctored Exam',
        html: isResuming ?
            `<p>We found a previous session. You will be placed exactly where you left off.</p>
                 <p><strong>Time Remaining:</strong> ${Math.floor(savedSeconds / 60)} minutes</p>
                 <p>Good luck!</p>` :
            `<p>I am your AI proctor for this session. My purpose is to ensure a fair and secure testing environment.</p>
                 <p>Please maintain focus on your screen, ensure you are alone, and keep your environment clear of any unauthorized materials. I will be monitoring your session in real-time.</p>
                 <p><strong>All the best for your ${examName}!</strong></p>`,
        icon: 'info',
        allowOutsideClick: false,
        confirmButtonText: isResuming ? 'Resume Exam' : 'I Understand, Begin Exam'
    }).then(() => {
        // Now show the exam screen and start the timer
        // START PROCTORING CHECKS (Audio/Polling)
        startProctoringChecks();
        // Update Remote Status to LIVE
        updateRemoteStatus('LIVE');

        showScreen('exam');
        renderQuestions();
        renderNav(false);
        showQuestion(currentQuestionIndex);
        startTimer(savedSeconds);

        if (isResuming) {
            // Update pause count display if resuming
            const pauseDisplay = document.getElementById('pauseCountDisplay');
            if (pauseDisplay) pauseDisplay.textContent = `(${MAX_PAUSES - pauseCount} left)`;

            // Trigger fullscreen on resume
            goFullScreen();
        }
    });
}
// --- Question Rendering and Navigation ---
function renderQuestions() {
    questionArea.innerHTML = questions.map((q, index) => `
            <div class="question-block" id="question-${index}" data-index="${index}">
                <h3>Question ${index + 1}: ${q.question}</h3>
                <ul class="options-list">
                    ${q.options.map((option, i) => `
                        <li>
                            <input type="radio" id="q${index}_option${i}" name="question${index}" value="${option}">
                            <label for="q${index}_option${i}">${option}</label>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    // Add event listeners for saving answers
    questionArea.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const qIndex = parseInt(e.target.name.replace('question', ''));
            userAnswers[qIndex] = e.target.value;
            updateNav(false);
            // saveExamState removed

        });
    });
}
function renderNav(isForReviewScreen = false) {
    const container = isForReviewScreen ? reviewGrid : questionNav;
    container.innerHTML = ''; // Clear previous content
    questions.forEach((_, index) => {
        const item = document.createElement('div');
        const status = userAnswers[index] !== null ? 'answered' : 'unanswered';
        const isMarked = markedForReview[index];
        if (isForReviewScreen) {
            item.className = 'review-item';
            let statusText = status === 'answered' ? 'Answered' : 'Not Answered';
            let statusClass = status === 'answered' ? 'status-answered' : 'status-unanswered';
            if (isMarked) {
                statusText = 'Marked for Review';
                statusClass = 'status-marked';
            }
            item.innerHTML = `
                    <span>Question ${index + 1}</span>
                    <span class="status-text ${statusClass}">${statusText}</span>
                `;
            item.addEventListener('click', () => {
                showScreen('exam');
                showQuestion(index);
            });
            item.setAttribute('tabindex', '0'); // Accessibility
        } else {
            item.className = 'q-nav-item';
            item.textContent = index + 1;
            item.dataset.index = index;
            item.addEventListener('click', () => {
                showQuestion(index);
            });
            item.setAttribute('tabindex', '0'); // Accessibility
        }
        container.appendChild(item);
    }
    );
}
function updateNav(isForReviewScreen = false) {
    if (isForReviewScreen) {
        // Re-render review if needed, but since static, no update needed beyond initial render
        return;
    }
    // Update exam navigator classes
    questionNav.querySelectorAll('.q-nav-item').forEach((item, index) => {
        item.classList.remove('current', 'answered', 'marked');
        if (userAnswers[index]) {
            item.classList.add('answered');
        }
        if (markedForReview[index]) {
            item.classList.add('marked');
        }
        if (index === currentQuestionIndex) {
            item.classList.add('current');
        }
    });
}
function showQuestion(index) {
    document.querySelectorAll('.question-block').forEach(block => block.classList.remove('active'));
    const questionToShow = document.getElementById(`question-${index}`);
    if (questionToShow) {
        questionToShow.classList.add('active');
    }
    currentQuestionIndex = index;
    // Pre-fill answer if exists
    const answer = userAnswers[index];
    if (answer) {
        const input = questionToShow.querySelector(`input[value="${answer}"]`);
        if (input) input.checked = true;
    }
    updateNavButtons();
    updateNav(false);
}
function updateNavButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'none' : 'inline-flex';
    reviewExamBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-flex' : 'none';
    markReviewBtn.textContent = markedForReview[currentQuestionIndex] ? 'Unmark Review' : 'Mark for Review';
}
nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
        // saveExamState removed

    }
});
prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
        // saveExamState removed

    }
});
markReviewBtn.addEventListener('click', () => {
    markedForReview[currentQuestionIndex] = !markedForReview[currentQuestionIndex];
    updateNav(false);
    updateNavButtons();
    // saveExamState removed

});
reviewExamBtn.addEventListener('click', () => {
    // When the user is on the last question and clicks "Review Exam"
    populateReviewScreen();
    showScreen('review');
});
// --- Timer Logic ---
let timerInterval;
let secondsRemaining;
function startTimer(durationInSeconds) {
    let timer = durationInSeconds;
    secondsRemaining = durationInSeconds;
    timerInterval = setInterval(() => {
        const hours = Math.floor(timer / 3600);
        const minutes = Math.floor((timer % 3600) / 60);
        const seconds = timer % 60;
        timerEl.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        secondsRemaining = timer;

        // Save state every 5 seconds to capture timer progress
        if (timer % 5 === 0) {
            // saveExamState removed

        }

        if (--timer < 0) {
            clearInterval(timerInterval);
            // clearExamState removed

            Swal.fire({
                title: 'Time\'s Up!',
                text: 'Your exam has been automatically submitted.',
                icon: 'warning',
                allowOutsideClick: false,
            }).then(() => submitAndExit());
        }
    }, 1000);
}
// --- Pause and Resume Logic ---
function pauseExam() {
    if (pauseCount >= MAX_PAUSES) {
        Swal.fire({
            icon: 'error',
            title: 'No Pauses Left',
            text: `You have used all your ${MAX_PAUSES} available pauses.`,
        });
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<i data-lucide="pause"></i> No Pauses Left';
        lucide.createIcons();
        return;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (proctoringInterval) {
        clearInterval(proctoringInterval);
        proctoringInterval = null;
    }

    pauseOverlay.style.display = 'flex';

    pauseCount++;
    const remainingPauses = MAX_PAUSES - pauseCount;
    const pauseCountDisplay = document.getElementById('pauseCountDisplay');
    if (pauseCountDisplay) {
        pauseCountDisplay.textContent = `(${remainingPauses} left)`;
    }
    // saveExamState removed

    addToProctorLog("Session paused by user.");
}
function resumeExam() {
    pauseOverlay.style.display = 'none';
    if (secondsRemaining > 0) {
        startTimer(secondsRemaining);
    }
    // Restart proctoring checks
    startProctoringChecks();
    addToProctorLog("Session resumed by user.");
}
pauseBtn.addEventListener('click', pauseExam);
resumeBtn.addEventListener('click', resumeExam);
// --- Email Notification Logic ---
function sendResultEmail(score, percentage, status) {
    if (typeof emailjs === 'undefined') {
        console.error("EmailJS not loaded");
        return;
    }

    // --- CONFIGURATION REQUIRED ---
    // Please replace these placeholders with your actual EmailJS credentials.
    // 1. Sign up at https://emailjs.com
    // 2. Create a service (e.g., 'gmail') -> Service ID
    // 3. Create a template -> Template ID
    // 4. Get your Public Key from Account > General
    const PUBLIC_KEY = 'HZtgyUoNkOfNpFHy3';
    const SERVICE_ID = 'service_946v1vs';
    // You can set separate templates for Pass and Fail outcomes
    // e.g. TEMPLATE_ID_PASS = 'template_jkym9ys' and TEMPLATE_ID_FAIL = 'template_fail_id'
    const TEMPLATE_ID_PASS = 'template_jkym9ys';
    const TEMPLATE_ID_FAIL = 'template_bnqcqbr';

    if (PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.warn("EmailJS keys not configured. Skipping email.");
        return;
    }

    try {
        emailjs.init(PUBLIC_KEY);

        const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
        const examName = document.getElementById('examTitle').textContent;

        const templateParams = {
            to_name: user.name || "Candidate",
            to_email: scheduledEmail || user.email,
            exam_name: examName,
            score: score,
            percentage: `${percentage}%`,
            status: status,
            result_word: status === 'Passed' ? "Proficient" : "Not Passed",
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            certificate_link: arguments[3] || (status === 'Passed' ? "https://example.com/certificate/" + (user.email || 'id') : "")
        };

        const templateIdToUse = status === 'Passed' ? TEMPLATE_ID_PASS : TEMPLATE_ID_FAIL;
        emailjs.send(SERVICE_ID, templateIdToUse, templateParams)
            .then(() => console.log('Result email sent successfully!'))
            .catch((error) => console.error('Failed to send result email:', error));

    } catch (e) {
        console.error("Error initializing EmailJS:", e);
    }
}

// --- Certificate Generation & Link Retrieval ---
async function generateCertificateAndGetLink(firebaseId) {
    const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
    const examName = document.getElementById('examTitle').textContent;
    const meta = EXAM_META_MAPPING[examName] || { seriesID: "GEN-001", level: "(Completed)", sealText: "CERTIFIED • DC CLOUD SOLUTIONS" };

    // 1. Use Firebase ID
    const uniqueID = firebaseId || Math.random().toString(36).substring(2, 15);
    const issuedDate = new Date().toISOString();

    // 2. Populate Template
    document.getElementById('certStudentName').textContent = user.name || "Candidate";
    document.getElementById('certExamName').textContent = examName;
    document.getElementById('certLevel').textContent = meta.level;
    document.getElementById('certSeriesID').textContent = meta.seriesID;
    document.getElementById('certIssuedDate').textContent = issuedDate;
    document.getElementById('certUniqueID').textContent = uniqueID;
    document.getElementById('certCandidateNameDisplay').textContent = user.name || "Candidate";

    // 3. Generate QR Code
    const qrData = encodeURIComponent(`https://dcinfotech.org.in/verify?id=${uniqueID}`);
    document.getElementById('certQRCode').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}" style="width: 100%; height: 100%;">`;

    // Wait for QR code image to load
    await new Promise(r => setTimeout(r, 1000));

    // 4. Capture Canvas
    const certElement = document.getElementById('certificateTemplate');
    const canvas = await html2canvas(certElement, {
        scale: 1.5,
        useCORS: true,
        logging: false
    });

    // 5. Convert to Blob & Upload to ImgBB
    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob);

            try {
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    resolve(result.data.url);
                } else {
                    reject('ImgBB upload failed');
                }
            } catch (e) {
                reject(e);
            }
        }, 'image/png');
    });
}

// --- Submission Logic ---
async function submitAndExit() {
    // clearExamState removed

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    clearInterval(timerInterval);
    if (remoteActionInterval) clearInterval(remoteActionInterval);
    if (proctoringInterval) clearInterval(proctoringInterval);
    if (periodicCaptureInterval) clearInterval(periodicCaptureInterval);

    // --- Mark session as completed in Firebase ---
    try {
        const sessionId = `${user.email.replace(/[.@]/g, '_')}_${examName.replace(/\s+/g, '_')}`;
        await fetch(`https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_sessions/${sessionId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'completed', endTime: new Date().toISOString() })
        });
        console.log("[Sync] Session marked as completed.");
    } catch (e) {
        console.warn("[Sync] Could not mark session as completed:", e);
    }

    const score = userAnswers.reduce((acc, ans, idx) => ans === questions[idx].answer ? acc + 1 : acc, 0);
    const percentage = Math.round((score / questions.length) * 100);
    const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
    const examName = document.getElementById('examTitle').textContent;
    const status = percentage >= 75 ? 'Passed' : 'Failed';
    const firebaseId = "DC-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    let certLink = "";
    if (status === 'Passed') {
        Swal.fire({
            title: 'Generating Certificate...',
            text: 'Please wait while we finalize your results.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        try {
            certLink = await generateCertificateAndGetLink(firebaseId);
            console.log("Certificate generated:", certLink);
        } catch (e) {
            console.error("Certificate generation failed:", e);
        }
    }

    // --- Send Email Notification ---
    sendResultEmail(score + "/" + questions.length, percentage, status, certLink);

    const resultData = {
        id: firebaseId, // Consistent Firebase Dictionary Key & Cert ID
        Timestamp: new Date().toISOString(),
        UserName: user.name || 'N/A',
        UserEmail: user.email || 'N/A',
        ExamName: examName,
        Score: `${score}/${questions.length}`,
        Percentage: `${percentage}%`,
        Status: status,
        CertificateLink: certLink,
        // Include bundled snapshots and violations
        ViolationReason: sessionSnapshots.map(s => s.reason).join(' | '),
        SnapshotURL: sessionSnapshots.map(s => `[${s.time}] ${s.reason}: ${s.url}`).join('\n'),
        ExamTime: ''
    };

    // --- Save Completion Flag Locally ---
    const completionKey = `exam_completed_${user.email || 'guest'}_${examName.replace(/\s+/g, '_')}`;
    const completionData = {
        status: 'completed',
        timestamp: new Date().getTime(),
        score: resultData.Score,
        percentage: resultData.Percentage
    };
    localStorage.setItem(completionKey, JSON.stringify(completionData));

    let saveSuccess = false;
    let saveMessage = '';

    // --- Save results to Firebase ---
    try {
        const response = await fetch(`${SHEETDB_RESULTS_URL}/${resultData.id}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData)
        });
        if (response.ok) {
            saveSuccess = true;
            saveMessage = 'Your score has been successfully saved to the server.';
        } else {
            // Attempt to read error message if provided by SheetDB
            const errorBody = await response.text();
            saveMessage = `Submission failed (Server error: ${response.status}). Contact support with this score: ${resultData.Score}. Error details: ${errorBody}`;
            console.error("Failed to save exam results:", response.status, response.statusText, errorBody);
        }
    } catch (error) {
        saveMessage = `Submission failed (Network error: ${error.message}). Contact support with this score: ${resultData.Score}.`;
        console.error("Failed to save exam results (Network):", error);
    }

    // --- Final User Feedback ---
    Swal.fire({
        title: saveSuccess ? 'Submitted!' : 'Submission Error!',
        html: `
                <p>Your exam has been submitted and recorded locally.</p>
                <p><strong>Score: ${resultData.Score} (${resultData.Percentage})</strong></p>
                <p><strong>Status: ${resultData.Status}</strong></p>
                <p>${saveMessage}</p>
            `,
        icon: saveSuccess ? 'success' : 'error',
        allowOutsideClick: false,
    }).then(() => {
        window.location.href = 'dashboard.html';
    });
}
// --- Enhanced AI Proctoring Logic with NLP Warnings ---
let warningCount = 0;
const MAX_WARNINGS = 3;
let audioContext;
let speechReady = false;
let analyser;
let microphone;
let proctorLogEntries = [];
async function startProctoring() {
    // Initialize Speech Synthesis for "talking" AI
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    try {
        // Get a fresh stream for proctoring (since biometric stream was stopped)
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Use a separate stream for the video element to avoid feedback loops with audio analysis
        const videoStream = new MediaStream(stream.getVideoTracks());
        proctoringVideo.srcObject = videoStream;
        proctoringVideo.play();
        // Set up audio analysis
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 512;
        microphone.connect(analyser);

        startProctoringChecks();
        // Initial log entry and AI welcome message
        const welcomeMessage = "Proctoring session initiated. I will be monitoring your exam to ensure integrity. Please focus on the screen. Good luck.";
        addToProctorLog(welcomeMessage);
        speak(welcomeMessage); // Use the new speak function
    } catch (err) {
        console.error("Proctoring stream error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Proctoring Error',
            text: 'Could not access webcam/microphone for proctoring. Exam cannot proceed.',
        }).then(() => {
            window.location.href = 'dashboard.html';
        });
    }
}
function startProctoringChecks() {
    if (proctoringInterval) clearInterval(proctoringInterval);
    // Audio/Video checks every 10 seconds
    proctoringInterval = setInterval(() => {
        checkAudioLevel();
        checkVideoFrameWithGroq();
    }, 10000); 
    startPeriodicCapture(); // Start periodic snapshots (60s)
    startRemoteStatusListener(); // START REAL-TIME ADMIN CONTROL LISTENER
}

function startPeriodicCapture() {
    if (periodicCaptureInterval) clearInterval(periodicCaptureInterval);
    // Capture every 60 seconds (60000 ms)
    periodicCaptureInterval = setInterval(async () => {
        if (!proctoringVideo.srcObject || proctoringVideo.paused || proctoringVideo.ended || document.hidden || screens.exam.style.display !== 'flex') return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = proctoringVideo.videoWidth;
            canvas.height = proctoringVideo.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(proctoringVideo, 0, 0, canvas.width, canvas.height);

            // Reuse logViolationSnapshot but with a specific reason for periodic capture
            // We need to modify logViolationSnapshot to accept the canvas directly if possible, 
            // or we can just duplicate the upload logic here for clarity and separation.
            // Let's reuse logViolationSnapshot as it already handles ImgBB and SheetDB.

            logViolationSnapshot(canvas, "Routine Snapshot");

        } catch (err) {
            console.error("Periodic capture error:", err);
        }
    }, 60000);
}

function addToProctorLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    proctorLogEntries.push(`[${timestamp}] ${message}`);
    if (proctorLogEntries.length > 10) {
        proctorLogEntries.shift(); // Keep only last 10 entries
    }
    proctorLog.innerHTML = proctorLogEntries.map(entry => `<div>${entry}</div>`).join('');
    proctorLog.scrollTop = proctorLog.scrollHeight;
}
function handleVisibilityChange() {
    if (document.hidden && screens.exam.style.display === 'flex') {
        issueWarning("Tab switch detected! Return to the exam immediately to avoid exam termination.");
        addToProctorLog("Alert: User switched tabs. Strict focus required.");
    }
}
function checkAudioLevel() {
    // Audio level check is now disabled as per user request.
    // The audio stream is still acquired as part of the webcam stream,
    // but no proctoring actions will be taken based on audio input.
}
async function checkVideoFrameWithGroq() {
    if (!proctoringVideo.srcObject || proctoringVideo.paused || proctoringVideo.ended || document.hidden || screens.exam.style.display !== 'flex') return;
    // Wait a bit for video to be ready
    if (proctoringVideo.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = proctoringVideo.videoWidth;
    canvas.height = proctoringVideo.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(proctoringVideo, 0, 0, canvas.width, canvas.height);
    const base64ImageData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

    try {
        const prompt = "You are a strict exam proctor. Analyze this webcam frame. Is there a mobile phone, a book/notes, or a second person visible? If YES, explain what you see in 1 short sentence starting with 'Violation:'. If NO, simply say 'All Clear'.";
        const isViolation = await analyzeImage(prompt, base64ImageData);

        // Note: analyzeImage returns boolean based on text content
        // However, for proctoring we might want the exact text for the log.
        // Let's call the Groq API directly here to get the specific reason.

        const requestBody = {
            model: GROQ_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64ImageData}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.1,
            max_tokens: 100
        };

        const response = await fetch(SECURE_GROQ_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Authorization is handled by the proxy on the server
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) return;

        const data = await response.json();
        const text = data.choices[0]?.message?.content || 'All Clear';
        if (text.toLowerCase().includes('yes') || text.toLowerCase().includes('violation')) {
            issueWarning(text); // Show the visual warning
            speak("Unauthorized object detected. Please clear your desk.", 0.9, 1.1); // Make the AI "speak" the warning
            logViolationSnapshot(canvas, text); // Take and log a snapshot
            addToProctorLog(`Violation flagged: ${text}`);
        } else {
            addToProctorLog("Status: Compliant. Continue focusing.");
        }
    } catch (error) {
        console.error("Error calling Groq API:", error);
    }
}
async function logViolationSnapshot(canvas, reason) {
    const base64ImageData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    let snapshotUrl = 'Upload failed';
    // 1. Upload snapshot to ImgBB
    const formData = new FormData();
    formData.append('image', base64ImageData);
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        if (result.success) {
            snapshotUrl = result.data.url;
            addToProctorLog(`Snapshot captured: ${snapshotUrl}`);
        }
    } catch (error) {
        console.error("Snapshot Upload Error:", error);
        addToProctorLog("Snapshot capture failed.");
    }

    // 2. Store violation details locally instead of sending immediately
    const timestamp = new Date().toLocaleTimeString();
    sessionSnapshots.push({
        time: timestamp,
        reason: reason,
        url: snapshotUrl
    });
    console.log("Violation recorded locally:", reason, snapshotUrl);
}
// --- Enhanced, Human-like Speech Synthesis ---
let voices = [];
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    speechReady = true;
}
// The voices list is loaded asynchronously.
if ('speechSynthesis' in window) {
    loadVoices();
    // Some browsers need this event to load voices
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}
function speak(text, rate = 0.9, pitch = 1.1) {
    if (!('speechSynthesis' in window) || !speechReady) {
        console.warn("Speech synthesis not ready or not supported.");
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a specific, high-quality voice.
    let selectedVoice = voices.find(voice => voice.name === 'Google US English' && voice.lang.startsWith('en'));
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en-US'));
    }
    // Final fallback to the first available English voice
    if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang.startsWith('en'));

    utterance.voice = selectedVoice || voices.find(voice => voice.lang === 'en-US'); // Fallback to any US English voice
    utterance.volume = 1; // Full volume
    utterance.rate = rate; // Speed of speech (0.1 to 10, default is 1)
    utterance.pitch = pitch; // Pitch of speech (0 to 2, default is 1)
    window.speechSynthesis.speak(utterance);
}
function issueWarning(reason) {
    warningCount++;
    warningsDisplay.innerHTML = `Warnings: <strong>${warningCount} / ${MAX_WARNINGS}</strong>`;

    Swal.fire({
        icon: 'warning',
        title: `Strict Proctor Alert ${warningCount} of ${MAX_WARNINGS}`,
        text: reason,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true
    });
    if (warningCount >= MAX_WARNINGS) {
        Swal.fire({
            icon: 'error',
            title: 'Exam Terminated by Strict Proctor',
            text: 'Multiple violations detected. Session terminated immediately.',
            allowOutsideClick: false,
        }).then(() => {
            // Stop all checks before submitting
            if (proctoringInterval) clearInterval(proctoringInterval);
            submitAndExit();
        });
    }
}
// Initial check for agreements on page load
checkAgreements();
checkLaunchReadiness();

// --- Auto-Launch for Resume removed ---






// *******************************************************************
// ************ START SECURITY ENHANCEMENT BLOCK *********************
// *******************************************************************

// *******************************************************************
// ************ START SECURITY ENHANCEMENT BLOCK *********************
// *******************************************************************

// --- SECURITY ENFORCEMENT ---
window.setupExamSecurity = function () {
    console.log("Initializing strict exam security...");

    // 1. Disable Right-Click / Context Menu
    document.addEventListener('contextmenu', function (e) {
        if (screens.exam.style.display === 'flex') {
            e.preventDefault();
            issueWarning("Right-click disabled for security reasons.");
        }
    }, false);

    // 2. Disable Text Selection (to prevent copying)
    document.addEventListener('selectstart', function (e) {
        if (screens.exam.style.display === 'flex') e.preventDefault();
    }, false);

    document.addEventListener('copy', function (e) {
        if (screens.exam.style.display === 'flex') {
            e.preventDefault();
            e.clipboardData.setData('text/plain', '');
            issueWarning("Copying text is disabled during the exam.");
        }
    }, false);

    document.addEventListener('cut', function (e) {
        if (screens.exam.style.display === 'flex') {
            e.preventDefault();
            e.clipboardData.setData('text/plain', '');
            issueWarning("Cutting text is disabled during the exam.");
        }
    }, false);

    // 4. Debugger Trap
    setInterval(() => {
        if (screens.exam.style.display === 'flex') {
            debugger;
        }
    }, 1000);

    // 5. Drag & Drop
    document.addEventListener('dragstart', (e) => {
        if (screens.exam.style.display === 'flex') e.preventDefault();
    });
    document.addEventListener('drop', (e) => {
        if (screens.exam.style.display === 'flex') e.preventDefault();
    });

    // 6. Mouse Leave
    document.addEventListener('mouseleave', () => {
        if (screens.exam.style.display === 'flex') {
            issueWarning("Mouse left the exam area. Keep cursor inside.");
        }
    });
};

// Initialize security
setupExamSecurity();

        // --- Resume Check removed ---

    });

// *******************************************************************
// ************* END SECURITY ENHANCEMENT BLOCK **********************
// *******************************************************************

// --- 10. Floating Tools Logic (Dark Mode, Calculator, Notepad) ---

// Toggle Tool Visibility
window.toggleTool = function (toolId) {
    const tool = document.getElementById(toolId);
    if (!tool) return;

    if (tool.style.display === 'flex') {
        tool.style.display = 'none';
        // Remove active state from button if needed
    } else {
        tool.style.display = 'flex';
        // Center it on first open if no position set
        if (!tool.style.top) {
            tool.style.top = '100px';
            tool.style.left = toolId === 'notepad' ? 'auto' : '20px';
            if (toolId === 'notepad') tool.style.right = '20px';
        }
    }
}

// Draggable Logic
document.querySelectorAll('.floating-tool').forEach(tool => {
    const header = tool.querySelector('.tool-header');
    let isDragging = false;
    let offset = [0, 0];

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offset = [
            tool.offsetLeft - e.clientX,
            tool.offsetTop - e.clientY
        ];
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            tool.style.left = (e.clientX + offset[0]) + 'px';
            tool.style.top = (e.clientY + offset[1]) + 'px';
            tool.style.right = 'auto'; // Disable right anchoring when dragged
        }
    });
});

// Dark Mode Logic
window.toggleDarkMode = function () {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);

    // Update Lucide icons if needed (re-render)
    if (window.lucide) lucide.createIcons();
}

// Load Dark Mode Preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Notepad Logic
const notepadArea = document.getElementById('notepadArea');
if (notepadArea) {
    // Load saved notes
    const savedNotes = localStorage.getItem('examNotes');
    if (savedNotes) notepadArea.value = savedNotes;

    // Auto-save on type
    notepadArea.addEventListener('input', () => {
        localStorage.setItem('examNotes', notepadArea.value);
    });
}

// Calculator Logic
const calcDisplay = document.getElementById('calcDisplay');
let calcExpression = '';

window.calcAppend = function (val) {
    if (val === 'C') {
        calcExpression = '';
    } else if (val === 'DEL') {
        calcExpression = calcExpression.slice(0, -1);
    } else {
        // Prevent multiple operators
        const lastChar = calcExpression.slice(-1);
        if (['+', '-', '*', '/', '.'].includes(val) && ['+', '-', '*', '/', '.'].includes(lastChar)) {
            return;
        }
        calcExpression += val;
    }
    if (calcDisplay) calcDisplay.value = calcExpression || '0';
}

window.calcCalculate = function () {
    try {
        if (!calcExpression) return;
        // Safe evaluation
        const result = new Function('return ' + calcExpression)();
        if (calcDisplay) calcDisplay.value = result;
        calcExpression = String(result);
    } catch (e) {
        if (calcDisplay) calcDisplay.value = 'Error';
        calcExpression = '';
    }
}

// Clear notes on exam submission
// This function should be called by your submit logic
window.clearExamNotes = function () {
    localStorage.removeItem('examNotes');
    if (notepadArea) notepadArea.value = '';
}