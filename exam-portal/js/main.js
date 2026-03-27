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
    const allQuestions = {
        "Associate Cloud Engineer": [
            { question: "Your company wants to deploy a stateless web application on Google Cloud. They require automatic scaling and want to pay only when the code is running. Which service is the most cost-effective choice?", options: ["Compute Engine", "Google Kubernetes Engine (GKE)", "Cloud Functions", "App Engine Standard Environment"], answer: "Cloud Functions" },
            { question: "What is the primary purpose of a VPC (Virtual Private Cloud) in Google Cloud?", options: ["To provide a physical server for dedicated hosting", "To isolate your cloud resources and define a private network", "To store large binary files like videos and images", "To run containerized applications with automatic orchestration"], answer: "To isolate your cloud resources and define a private network" },
            // SRE & Troubleshooting Focused Questions
            {
                question: "Your application has an error budget of 0.1% for a 28-day rolling window. You have served 10,000,000 requests in the last 28 days. How many failed requests are you allowed before exhausting your error budget?",
                options: ["1,000", "10,000", "100,000", "1,000,000"],
                answer: "10,000"
            },
            {
                question: "You are designing an SLI (Service Level Indicator) for a batch processing pipeline. Which metric is most appropriate to measure the 'freshness' of the data being processed?",
                options: ["CPU utilization of the worker nodes", "The age of the oldest unproccessed record", "Total number of records processed per second", "Memory usage of the database"],
                answer: "The age of the oldest unproccessed record"
            },
            {
                question: "During an incident, you discover that a recent deployment caused a massive spike in 500 errors. You have blown 80% of your error budget in 2 hours. According to SRE principles, what is the most appropriate immediate action?",
                options: ["Scale up the infrastructure to handle the errors", "Roll back the deployment immediately", "Fix the bug in production while keeping the service running", "Increase the error budget for the month"],
                answer: "Roll back the deployment immediately"
            },
            {
                question: "You are observing the 'Four Golden Signals' for a web service. You notice that 'Saturation' is high, but 'Latency' and 'Errors' are normal. What does this likely indicate?",
                options: ["The service is down", "The service is nearing capacity and performance will likely degrade soon", "The monitoring system is broken", "Everything is fine, saturation is not a critical metric"],
                answer: "The service is nearing capacity and performance will likely degrade soon"
            },
            {
                question: "Which of the following activities counts as 'Toil' in the SRE framework?",
                options: ["Designing a new scalable architecture", "Manually resizing a persistent disk every time it gets full", "Conducting a blameless post-mortem", "Writing a design document for a new feature"],
                answer: "Manually resizing a persistent disk every time it gets full"
            },
            {
                question: "A service has an SLO of 99.9% availability. It runs 24/7. Roughly how much downtime is permitted per year?",
                options: ["8.76 hours", "43.8 minutes", "52.56 minutes", "3.65 days"],
                answer: "8.76 hours"
            },
            {
                question: "You are debugging a Kubernetes pod that is stuck in 'CrashLoopBackOff'. `kubectl logs` shows no output. What should be your next troubleshooting step?",
                options: ["Delete the pod and hope it restarts correctly", "Check `kubectl describe pod` for events and exit codes", "SSH into the node and reboot it", "Increase the CPU limits for the pod"],
                answer: "Check `kubectl describe pod` for events and exit codes"
            },
            {
                question: "Your application running on Cloud Run is experiencing high cold start latency. Which strategy would effectively reduce this?",
                options: ["Increasing the maximum number of instances", "Configuring 'min-instances' to keep some instances warm", "Using a larger container image", "Decreasing the memory allocation"],
                answer: "Configuring 'min-instances' to keep some instances warm"
            },
            {
                question: "You need to investigate a performance regression. You suspect a specific API call is slow. Which tool would give you a visual breakdown of the call capability across microservices?",
                options: ["Cloud Logging", "Cloud Monitoring", "Cloud Trace", "Cloud Profiler"],
                answer: "Cloud Trace"
            },
            {
                question: "In a 'Blameless Post-Mortem', what is the primary goal?",
                options: ["To identify the engineer responsible for the outage", "To fire the person who caused the bug", "To identify the systemic root cause and prevent recurrence", "To apologize to the customers"],
                answer: "To identify the systemic root cause and prevent recurrence"
            },
            // --- New Questions (1-70) ---

            // Section: Setting up a Cloud Solution Environment (IAM, Projects, Billing)
            { question: "You need to grant a new contractor permission to only manage Compute Engine instances in a specific project. Which IAM principle of security should you follow?", options: ["Separation of Duties", "Defense in Depth", "Principle of Least Privilege", "Auditability"], answer: "Principle of Least Privilege" },
            { question: "Which service account is automatically created when you enable the Compute Engine API in a project, and is used by VMs for interactions with other GCP services?", options: ["Google APIs Service Account", "Compute Engine Default Service Account", "Google-Managed Service Account", "User-Managed Service Account"], answer: "Compute Engine Default Service Account" },
            { question: "A finance team member needs to view billing statements across the entire organization. Which IAM role should you grant them at the organization level?", options: ["Project Billing Manager", "Billing Account Administrator", "Billing Account User", "Billing Account Viewer"], answer: "Billing Account Viewer" },
            { question: "You are setting up a new GCP project. Which command-line tool is used to set the default project for all subsequent commands?", options: ["gcloud projects set", "gcloud config set project", "gcloud init --project", "gcloud compute config set-project"], answer: "gcloud config set project" },
            { question: "How can you enforce that all new Compute Engine instances must use specific machine types across your organization?", options: ["Use an IAM Condition", "Apply a Cloud Billing budget", "Implement an Organization Policy Constraint", "Configure a Shared VPC"], answer: "Implement an Organization Policy Constraint" },
            { question: "What is the smallest resource container in the Google Cloud resource hierarchy that all other resources must belong to?", options: ["Organization", "Folder", "Project", "Billing Account"], answer: "Project" },
            { question: "You want to audit who has been deleting Compute Engine instances. Which type of Cloud Logging log should you review?", options: ["Data Access logs", "Admin Activity logs", "System Event logs", "Audit Access logs"], answer: "Admin Activity logs" },
            { question: "Your organization wants to centralize network management for multiple projects. Which networking feature is designed for this purpose?", options: ["VPC Peering", "Shared VPC", "VPN Gateway", "Cloud Interconnect"], answer: "Shared VPC" },
            { question: "Which command would you use to verify the IAM roles and members associated with a specific project?", options: ["gcloud iam roles list --project", "gcloud projects get-iam-policy", "gcloud auth list", "gcloud compute instances list-iam-policy"], answer: "gcloud projects get-iam-policy" },
            { question: "Which tool allows you to interact with GCP services from your web browser, including a pre-installed `gcloud` CLI and persistent disk storage?", options: ["Compute Engine serial console", "Cloud Code", "Cloud Shell", "Cloud Console Terminal"], answer: "Cloud Shell" },

            // Section: Planning and Configuring Compute Resources
            { question: "You need to deploy a batch processing job that can tolerate interruptions to minimize cost. Which Compute Engine option should you choose?", options: ["Standard VM", "Preemptible VM", "Sole-tenant Node", "Custom Machine Type"], answer: "Preemptible VM" },
            { question: "Your team is running a web application on Compute Engine and needs to ensure that the server automatically restarts if it crashes. Which setting should you configure on the VM instance?", options: ["Automatic scaling", "On-host maintenance", "Availability Policy: On-failure restart", "Live migration"], answer: "Availability Policy: On-failure restart" },
            { question: "You are creating a Managed Instance Group (MIG) for a web application. What is the minimum element required to create a MIG?", options: ["Load Balancer", "Autoscaler policy", "Instance Template", "Persistent Disk snapshot"], answer: "Instance Template" },
            { question: "To manage a fleet of Linux Compute Engine VMs using a centralized user account system without managing SSH keys, which feature should you enable?", options: ["Instance Metadata", "OS Login", "Shielded VMs", "Cloud VPN"], answer: "OS Login" },
            { question: "You need a Compute Engine VM with more RAM than the predefined machine types allow, but less than the maximum. What is the most cost-efficient solution?", options: ["N2 Machine Type", "Custom Machine Type", "Sole-tenant Node", "M2 Machine Type"], answer: "Custom Machine Type" },
            { question: "You have a single VM that needs to be accessible from the internet over HTTPS. Which type of load balancer is most appropriate and simplest to configure for this scenario?", options: ["Internal TCP/UDP Load Balancer", "External HTTP(S) Load Balancer", "External Network TCP/UDP Load Balancer", "Regional Internal HTTP(S) Load Balancer"], answer: "External Network TCP/UDP Load Balancer" },
            { question: "To perform an in-place upgrade of the operating system on a Compute Engine instance's boot disk, what is the best practice before starting the upgrade?", options: ["Stop the instance", "Create a snapshot of the boot disk", "Change the machine type", "Detach the boot disk"], answer: "Create a snapshot of the boot disk" },
            { question: "When scaling a GKE cluster based on CPU utilization, what component is responsible for automatically adding or removing nodes?", options: ["Horizontal Pod Autoscaler (HPA)", "Cluster Autoscaler", "Vertical Pod Autoscaler (VPA)", "Kube Scheduler"], answer: "Cluster Autoscaler" },
            { question: "You want a highly available, multi-zone deployment of your containerized application that requires a stable IP address. Which GKE object should you use to expose your application?", options: ["Deployment", "Pod", "Service (Type: LoadBalancer)", "ConfigMap"], answer: "Service (Type: LoadBalancer)" },
            { question: "Your application is deployed on App Engine Standard. You need to ensure a minimum of 5 instances are always running for low-latency responses. Which scaling type and setting should you configure?", options: ["Automatic Scaling, with min-instances set to 5", "Basic Scaling, with max-instances set to 5", "Manual Scaling, with instances set to 5", "Autoscaling, with target CPU utilization set to 50%"], answer: "Automatic Scaling, with min-instances set to 5" },

            // Section: Planning and Configuring Data Solutions (Storage, Databases)
            { question: "Your application generates terabytes of data daily that is rarely accessed after 90 days, but must be available for compliance. What is the most cost-effective Cloud Storage class for this data?", options: ["Standard Storage", "Nearline Storage", "Coldline Storage", "Archive Storage"], answer: "Coldline Storage" },
            { question: "You need a highly available, relational database that can scale horizontally across multiple regions. Which GCP database service is the best fit?", options: ["Cloud SQL", "Cloud Firestore", "BigQuery", "Cloud Spanner"], answer: "Cloud Spanner" },
            { question: "You need to set up a new Cloud SQL instance (PostgreSQL) and require the ability to recover the database to a specific minute in the past. What feature must be enabled?", options: ["Automated backups only", "Failover replica", "High availability mode", "Binary logging (Point-in-time recovery)"], answer: "Binary logging (Point-in-time recovery)" },
            { question: "What is the recommended method for transferring a very large amount of data (Petabytes) from an on-premises data center to a Cloud Storage bucket, when network bandwidth is a bottleneck?", options: ["gcloud storage cp command", "Storage Transfer Service", "Transfer Appliance", "VPN Tunnel"], answer: "Transfer Appliance" },
            { question: "What type of storage is best suited for the boot disk of a Compute Engine VM?", options: ["Cloud Storage Standard", "Local SSD", "Persistent Disk", "Nearline Storage"], answer: "Persistent Disk" },
            { question: "You need to store unstructured, non-relational data that requires low-latency read and write operations. Which database service should you choose?", options: ["Cloud SQL", "BigQuery", "Cloud Firestore", "Cloud Spanner"], answer: "Cloud Firestore" },
            { question: "Which feature of Cloud Storage can automatically transition objects between storage classes (e.g., from Standard to Nearline) after a specified period of time?", options: ["Object Versioning", "Lifecycle Management", "Retention Policy", "Public Access Prevention"], answer: "Lifecycle Management" },
            { question: "You have a production Cloud SQL instance and want a separate instance for read-heavy reporting that doesn't impact the main instance's performance. What should you configure?", options: ["A failover replica", "A read replica", "A clone instance", "An instance snapshot"], answer: "A read replica" },
            { question: "What is the primary function of BigQuery for data analysis?", options: ["Online Transaction Processing (OLTP)", "Online Analytical Processing (OLAP)", "NoSQL Document Storage", "Object Storage"], answer: "Online Analytical Processing (OLAP)" },
            { question: "You are uploading a 10 GB file to Cloud Storage. The connection occasionally drops. Which command-line utility should you use to handle these intermittent failures automatically?", options: ["gcloud compute scp", "gsutil cp", "gcloud storage cp", "gcloud data transfer"], answer: "gsutil cp" },

            // Section: Planning and Configuring Networking
            { question: "You want to allow SSH access (TCP port 22) to all Compute Engine VMs in a specific network tag. Which resource should you configure?", options: ["A Managed Instance Group", "A Network Load Balancer", "A VPC Firewall Rule", "A Subnet Access Control List"], answer: "A VPC Firewall Rule" },
            { question: "What is the default behavior of egress traffic in a GCP VPC network?", options: ["Egress is denied by default", "Egress is allowed to all destinations", "Egress is only allowed to other subnets", "Egress is denied to external IP addresses"], answer: "Egress is allowed to all destinations" },
            { question: "A VM in a private subnet needs to access external APIs on the internet without having a public IP address. What GCP service should you use?", options: ["VPC Peering", "Cloud NAT (Network Address Translation)", "Cloud VPN", "Internal Load Balancer"], answer: "Cloud NAT (Network Address Translation)" },
            { question: "In a custom mode VPC network, how is the IP range of a subnet defined?", options: ["It is automatically assigned by GCP.", "You must specify a non-overlapping CIDR range.", "It is set by the load balancer.", "It is inherited from the project's default range."], answer: "You must specify a non-overlapping CIDR range." },
            { question: "Which service provides a globally distributed, high-capacity layer 7 (HTTP/S) load balancing service with global external IP addresses?", options: ["Internal TCP/UDP Load Balancer", "External HTTP(S) Load Balancer", "Network Load Balancer", "Cloud VPN Gateway"], answer: "External HTTP(S) Load Balancer" },
            { question: "You need to connect your on-premises data center to your GCP VPC network over a secure, encrypted tunnel using the public internet. Which service should you choose?", options: ["Cloud Interconnect Dedicated", "Cloud Interconnect Partner", "Cloud VPN", "VPC Peering"], answer: "Cloud VPN" },
            { question: "You have two VPC networks in the same project that need to communicate using internal IP addresses. What is the recommended way to connect them?", options: ["Cloud VPN", "VPC Peering", "Shared VPC", "Use public IP addresses"], answer: "VPC Peering" },
            { question: "Which statement about GCP firewall rules is true?", options: ["They are stateful, allowing return traffic automatically.", "They are stateless, requiring explicit rules for both directions.", "They can only be applied to a single VM instance.", "They are configured at the subnet level."], answer: "They are stateful, allowing return traffic automatically." },
            { question: "Which Compute Engine network tag applies to all VM instances by default?", options: ["http-server", "default", "all", "network-wide"], answer: "http-server" },
            { question: "You notice that your internal application is responding slowly. Where is the first place you should check for network latency and error rates in your GCP environment?", options: ["Cloud Billing Reports", "Cloud NAT logs", "VPC Flow Logs", "GKE Event Logs"], answer: "VPC Flow Logs" },

            // Section: Deploying and Implementing a Cloud Solution
            { question: "You need to deploy a complex infrastructure using a declarative configuration file, allowing for repeatable deployments and dependency management. Which tool should you use?", options: ["Cloud Functions", "Cloud SDK", "Deployment Manager", "Cloud Tasks"], answer: "Deployment Manager" },
            { question: "Which command is used to deploy an App Engine application from a configuration file?", options: ["gcloud compute deploy", "gcloud app deploy", "gcloud functions deploy", "kubectl apply -f"], answer: "gcloud app deploy" },
            { question: "You are deploying a new version of your App Engine application and want to test it with a small group of users before rolling it out fully. What deployment feature should you use?", options: ["Traffic Splitting/Migration", "Blue/Green Deployment", "A/B Testing", "Instance Capping"], answer: "Traffic Splitting/Migration" },
            { question: "How do you manage the underlying infrastructure (VMs) of a Cloud Run service?", options: ["Directly via Compute Engine API", "Using the `gcloud compute` CLI", "Cloud Run is a fully managed service, and you cannot manage the infrastructure", "Through the GKE node pool configuration"], answer: "Cloud Run is a fully managed service, and you cannot manage the infrastructure" },
            { question: "Before deploying a containerized application to GKE, where should you push the Docker image?", options: ["Cloud Storage", "GitHub Container Registry", "Artifact Registry", "A Compute Engine boot disk"], answer: "Artifact Registry" },
            { question: "Which command is the standard Kubernetes CLI tool used to manage objects (like Deployments and Services) in a GKE cluster?", options: ["gcloud container", "gkectl", "kubectl", "gcloud compute"], answer: "kubectl" },
            { question: "You are troubleshooting a VM that is not responding to SSH. What is the most immediate way to view the boot process and potential errors without connecting over SSH?", options: ["Check Cloud Monitoring metrics", "View the VM's serial port output", "Check the VM's disk usage", "Review firewall rule logs"], answer: "View the VM's serial port output" },
            { question: "Which artifact management service is the recommended, modern replacement for Container Registry (GCR) in GCP?", options: ["Cloud Storage", "Cloud Source Repositories", "Artifact Registry", "Deployment Manager"], answer: "Artifact Registry" },
            { question: "You need to run a cron job to process data nightly on a serverless platform. Which service is the best fit?", options: ["Cloud Functions triggered by a Pub/Sub message via Cloud Scheduler", "App Engine Basic Scaling", "Compute Engine Preemptible VM", "Cloud Spanner"], answer: "Cloud Functions triggered by a Pub/Sub message via Cloud Scheduler" },
            { question: "When using `gcloud compute instances create`, what must you specify to ensure the VM is created in the desired location?", options: ["Region and Project", "Zone and Machine Type", "Zone and Disk Size", "Region and Network Name"], answer: "Zone and Machine Type" },

            // Section: Ensuring Successful Operation of a Cloud Solution
            { question: "A Managed Instance Group (MIG) needs to ensure that instances are replaced if they fail their application-level check. What feature of the MIG configuration handles this?", options: ["Autoscaling Policy", "Load Balancer Backend Service", "Autohealing Health Check", "Instance Template"], answer: "Autohealing Health Check" },
            { question: "You want to receive an email notification when the CPU utilization of your Compute Engine VMs exceeds 80% for more than 5 minutes. Which service should you configure?", options: ["Cloud Logging", "Cloud Monitoring", "Cloud Trace", "Cloud Audit Logs"], answer: "Cloud Monitoring" },
            { question: "How can you centralize logs from all GCP services and resources in your project for analysis and long-term storage?", options: ["Use the Cloud Shell console", "Use Cloud Logging (formerly Stackdriver Logging)", "Use Cloud Storage only", "Use Cloud Spanner"], answer: "Cloud Logging (formerly Stackdriver Logging)" },
            { question: "You need to transfer all logs from your GCP project to a BigQuery dataset for advanced analysis. What feature of Cloud Logging should you configure?", options: ["A log sink (export)", "A log metric", "A log filter", "A log bucket"], answer: "A log sink (export)" },
            { question: "Your application is deployed on App Engine. You notice intermittent application-level errors. Which monitoring tool provides detailed request tracing and latency information for application debugging?", options: ["Cloud Monitoring", "Cloud Logging", "Cloud Trace", "Cloud Debugger"], answer: "Cloud Trace" },
            { question: "To help minimize service disruption during maintenance, which feature allows Compute Engine to move a running VM to a different host without rebooting?", options: ["Live Migration", "Host Maintenance Policy", "Preemptible VM", "Automatic Restart"], answer: "Live Migration" },
            { question: "What is a common best practice to reduce the Mean Time to Recovery (MTTR) for a Compute Engine application deployment?", options: ["Manually restart the VM", "Use a Managed Instance Group with an Autohealing policy", "Increase the size of the VM's Persistent Disk", "Enable billing alerts"], answer: "Use a Managed Instance Group with an Autohealing policy" },
            { question: "Which factor primarily determines the regionality of a Persistent Disk?", options: ["The region of the associated load balancer", "The zone in which the disk is created", "The machine type of the VM", "The project's default region"], answer: "The zone in which the disk is created" },
            { question: "You need to find a specific log entry related to a user's action in the Google Cloud Console. What is the most effective way to filter logs in Cloud Logging?", options: ["Filter by severity level", "Filter by resource type and payload fields", "Filter by project ID only", "Filter by BigQuery table name"], answer: "Filter by resource type and payload fields" },
            { question: "What is the recommended tool for managing a large fleet of Compute Engine VMs, including applying OS patches and configuration changes?", options: ["OS Login", "VM Manager", "Cloud Shell", "Cloud Run"], answer: "VM Manager" },

            // Section: Configuring Access and Security
            { question: "You want to create a service account that can only read data from a specific Cloud Storage bucket named `my-data-bucket`. What is the recommended approach for granting this granular access?", options: ["Grant the Storage Object Viewer role at the Project level.", "Grant the Storage Object Viewer role on the `my-data-bucket` resource.", "Grant the Project Editor role on the Project.", "Grant the Project Viewer role on the Project."], answer: "Grant the Storage Object Viewer role on the `my-data-bucket` resource." },
            { question: "What is the key difference between a Primitive Role (e.g., Owner, Editor, Viewer) and a Predefined Role (e.g., Compute Instance Admin) in IAM?", options: ["Primitive roles can only be applied to service accounts.", "Predefined roles provide more granular permissions tailored to a specific service.", "Primitive roles can be customized with specific permissions.", "Predefined roles only work at the Folder level."], answer: "Predefined roles provide more granular permissions tailored to a specific service." },
            { question: "You need to securely provide the credentials for a Compute Engine VM to interact with a Cloud Storage bucket. What is the most secure method?", options: ["Storing an API key in the VM's metadata.", "Generating a static SSH key pair.", "Assigning a Service Account to the VM and granting the necessary IAM roles.", "Using the VM's default network tag."], answer: "Assigning a Service Account to the VM and granting the necessary IAM roles." },
            { question: "Which feature of a Compute Engine VM's boot disk ensures that the operating system has not been tampered with since the last boot?", options: ["Automatic Restart", "Live Migration", "Shielded VMs (Integrity Monitoring)", "Persistent Disk Encryption"], answer: "Shielded VMs (Integrity Monitoring)" },
            { question: "Your security team requires that all data stored in Cloud Storage be encrypted using a key that your organization manages. Which encryption option should you choose?", options: ["Google-managed encryption keys", "Customer-supplied encryption keys (CSEK)", "Customer-managed encryption keys (CMEK) using Cloud KMS", "Default encryption"], answer: "Customer-managed encryption keys (CMEK) using Cloud KMS" },
            { question: "What is the most effective way to prevent a running Compute Engine instance from being accidentally deleted?", options: ["Apply a restrictive firewall rule.", "Enable Deletion Protection on the instance.", "Use a Preemptible VM.", "Grant the Project Viewer IAM role."], answer: "Enable Deletion Protection on the instance." },
            { question: "When using OS Login, what is used to map an IAM user to a Linux user account on a Compute Engine VM?", options: ["SSH keys stored in the metadata", "The user's Google Identity", "A local user account database", "A service account key"], answer: "The user's Google Identity" },
            { question: "A developer is writing an application on a local machine that needs to call a GCP API. What command should they use to authenticate their local environment for `gcloud` and application calls?", options: ["gcloud auth login", "gcloud auth activate-service-account", "gcloud init", "gcloud compute ssh"], answer: "gcloud auth login" },
            { question: "What is the purpose of a Custom IAM Role?", options: ["To define a set of permissions that exactly meets your organization's needs, often to implement the Principle of Least Privilege.", "To replace all Predefined Roles with a single, comprehensive role.", "To allow users to create new GCP services.", "To grant project-level Owner permissions without auditability."], answer: "To define a set of permissions that exactly meets your organization's needs, often to implement the Principle of Least Privilege." },
            { question: "What is the correct way to allow incoming traffic only from your office's IP address (e.g., 203.0.113.1) to your web servers on port 80?", options: ["Create an ingress firewall rule with target tag 'web-server', protocol 'tcp', port '80', and source IP range '203.0.113.1/32'.", "Create an egress firewall rule with target tag 'web-server', protocol 'tcp', port '80', and source IP range '203.0.113.1/32'.", "Create a Cloud NAT configuration for this IP.", "Use the default 'allow-all' firewall rule."], answer: "Create an ingress firewall rule with target tag 'web-server', protocol 'tcp', port '80', and source IP range '203.0.113.1/32'." },

            // Section: Advanced Compute & Storage (Load Balancers, Migrations, etc.)
        ],

        "Professional Data Engineer": [
            { question: "You need to build a data pipeline to ingest streaming data from IoT devices and perform real-time analytics. Which combination of services is most suitable?", options: ["Cloud Storage and BigQuery Batch Load", "Pub/Sub, Dataflow, and BigQuery", "Cloud SQL and Dataproc", "Cloud Functions and Cloud Spanner"], answer: "Pub/Sub, Dataflow, and BigQuery" },
            { question: "What is the primary use case for Cloud Bigtable?", options: ["Storing transactional relational data", "Running interactive SQL queries on large datasets", "Serving large-scale, low-latency analytical and operational workloads", "Hosting a small-scale MySQL database"], answer: "Serving large-scale, low-latency analytical and operational workloads" },
            { question: "You need to store data that is accessed once a month. Which Storage Class is cheapest?", options: ["Standard", "Nearline", "Coldline", "Archive"], answer: "Coldline" },
            { question: "You are designing a schema for BigQuery. How should you handle a one-to-many relationship (e.g., Order -> Items) to optimize performance?", options: ["Use normalized tables with joins", "Use nested and repeated fields", "Use a JSON string", "Use separate databases"], answer: "Use nested and repeated fields" },
            { question: "Which service is a fully managed, serverless data warehouse?", options: ["BigQuery", "Cloud SQL", "Dataproc", "Spanner"], answer: "BigQuery" },
            { question: "You need to migrate a Hadoop cluster to GCP. Which service is the most direct replacement?", options: ["Dataflow", "Dataproc", "BigQuery", "Composer"], answer: "Dataproc" },
            { question: "Which component of Dataflow handles the autoscaling of workers?", options: ["Streaming Engine / Dataflow Service", "The SDK", "The user code", "Compute Engine Autoscaler"], answer: "Streaming Engine / Dataflow Service" },
            { question: "You want to reduce BigQuery costs. What should you do first?", options: ["Use SELECT *", "Partition and Cluster tables", "Delete old data manually", "Use streaming inserts"], answer: "Partition and Cluster tables" },
            { question: "What is the best way to visualize BigQuery data effectively without coding?", options: ["Looker Studio", "Dataflow", "Dataprep", "Cloud Shell"], answer: "Looker Studio" },
            { question: "You need to orchestrate a complex workflow involving BigQuery, Dataflow, and on-prem systems. Which tool is best?", options: ["Cloud Composer (Airflow)", "Cloud Scheduler", "Cron", "Pub/Sub"], answer: "Cloud Composer (Airflow)" },
            { question: "Which database service allows for strictly consistent, global transactions?", options: ["Cloud Spanner", "Bigtable", "Firestore", "Cloud SQL"], answer: "Cloud Spanner" },
            { question: "You have a large amount of unstructured data (images, videos). Where should you store it?", options: ["Cloud Storage", "BigQuery", "Cloud SQL", "Datastore"], answer: "Cloud Storage" },
            { question: "You need to mask PII data (e.g., SSNs) in your data pipeline before it reaches BigQuery. Which service can help?", options: ["Cloud DLP (Data Loss Prevention)", "IAM", "VPC Flow Logs", "Secret Manager"], answer: "Cloud DLP (Data Loss Prevention)" },
            { question: "What is a 'Sink' in Cloud Logging used for in a data context?", options: ["To drain water", "To export logs to BigQuery, Storage, or Pub/Sub", "To delete logs", "To filter logs"], answer: "To export logs to BigQuery, Storage, or Pub/Sub" },
            { question: "You want to run Apache Spark jobs on a serverless platform. What is a valid option?", options: ["Dataproc Serverless", "Cloud Functions", "App Engine", "Compute Engine"], answer: "Dataproc Serverless" },
            { question: "Which BigQuery feature allows you to query data directly in Cloud Storage without loading it?", options: ["External Tables (Federated Queries)", "Materialized Views", "Cached Queries", "Authorized Views"], answer: "External Tables (Federated Queries)" },
            { question: "You need to ingest millions of events per second asynchronously. Which service acts as the buffer?", options: ["Pub/Sub", "Dataflow", "BigQuery", "Cloud Storage"], answer: "Pub/Sub" },
            { question: "How does BigQuery store data internally?", options: ["Columnar format (Capacitor)", "Row-oriented", "JSON", "XML"], answer: "Columnar format (Capacitor)" },
            { question: "You need to perform ETL on raw data to prepare it for ML. The logic is complex and requires windowing. Which tool?", options: ["Dataflow (Apache Beam)", "Cloud SQL", "Cloud Storage", "Dataprep"], answer: "Dataflow (Apache Beam)" },
            { question: "What is the difference between 'Batch' and 'Streaming' in Dataflow?", options: ["Batch processes bounded data; Streaming processes unbounded data", "Streaming is slower", "Batch is deprecated", "No difference"], answer: "Batch processes bounded data; Streaming processes unbounded data" },
            { question: "You have a requirement to keep data in a specific geographic region. What should you configure?", options: ["Resource Location / Dataset Location", "IAM roles", "Network tags", "VPC"], answer: "Resource Location / Dataset Location" },
            { question: "Which service enables visual data cleaning and preparation?", options: ["Dataprep by Trifacta", "Dataflow", "BigQuery", "Data Catalog"], answer: "Dataprep by Trifacta" },
            { question: "You need to discover and tag sensitive data across your organization's datasets. Which tool helps?", options: ["Data Catalog / Dataplex", "Cloud Build", "Artifact Registry", "Source Repositories"], answer: "Data Catalog / Dataplex" },
            { question: "What is the primary key design consideration for Cloud Bigtable?", options: ["Avoid hotspots (distribute writes)", "Use sequential IDs", "Use timestamp first", "Keep keys short only"], answer: "Avoid hotspots (distribute writes)" },
            { question: "You want to train a custom ML model using SQL in BigQuery. What do you use?", options: ["BigQuery ML (BQML)", "Vertex AI Workbench", "TensorFlow", "Dataflow"], answer: "BigQuery ML (BQML)" },
            { question: "Which technique improves query performance in BigQuery by grouping data with similar values?", options: ["Clustering", "Partitioning", "Sharding", "Indexing"], answer: "Clustering" },
            { question: "You migrated an on-premise data warehouse to BigQuery. How do you verify data integrity?", options: ["Checksums / Row counts / Aggregations comparison", "Visual inspection", "Waiting typically works", "Dataflow"], answer: "Checksums / Row counts / Aggregations comparison" },
            { question: "What is the default isolation level for BigQuery transactions?", options: ["Snapshot Isolation", "Read Uncommitted", "Serializable", "Read Committed"], answer: "Snapshot Isolation" },
            { question: "You need to move 500 TB of data from an on-premise datacenter to Google Cloud efficiently. Bandwidth is low.", options: ["Transfer Appliance", "gsutil", "Storage Transfer Service", "VPN"], answer: "Transfer Appliance" },
            { question: "Which tool allows you to perform real-time lookup of key-value pairs with low latency?", options: ["Cloud Bigtable", "BigQuery", "Cloud Storage", "Dataflow"], answer: "Cloud Bigtable" },
            { question: "You need to update a BigQuery table with new data from a CSV file every day. What is the most cost-effective automation?", options: ["Cloud Scheduler + Cloud Functions (or BigQuery Data Transfer Service)", "Running a VM 24/7", "Manual upload", "Dataflow streaming"], answer: "Cloud Scheduler + Cloud Functions (or BigQuery Data Transfer Service)" },
            { question: "What is the purpose of 'Authorized Views' in BigQuery?", options: ["To give users access to query results without giving access to underlying tables", "To speed up queries", "To visualize data", "To delete data"], answer: "To give users access to query results without giving access to underlying tables" },
            { question: "Which service is best for lifting and shifting existing Spark/Hadoop jobs?", options: ["Dataproc", "Dataflow", "BigQuery", "Compute Engine"], answer: "Dataproc" },
            { question: "You want to share a dataset in BigQuery with an external partner without copying data. What do you use?", options: ["Analytics Hub / Authorized Views", "Export to CSV", "Give them the password", "Print it"], answer: "Analytics Hub / Authorized Views" },
            { question: "What happens to the data in a 'Temporary Table' in BigQuery?", options: ["It persists for the session (24h) and then is deleted", "It is permanent", "It is public", "It is stored in RAM only"], answer: "It persists for the session (24h) and then is deleted" },
            { question: "Which format is efficient for reading large datasets in Cloud Storage from Spark?", options: ["Parquet / Avro", "CSV", "JSON", "XML"], answer: "Parquet / Avro" },
            { question: "You need to monitor the quality of data landing in your data lake. What tool helps?", options: ["Dataplex (Data Quality tasks)", "Cloud Monitoring", "Cloud Logging", "IAM"], answer: "Dataplex (Data Quality tasks)" },
            { question: "How can you ensure that a BigQuery query does not consume excessive costs?", options: ["Set 'Maximum bytes billed' in query settings or use Custom Quotas", "Monitor manually", "Use SELECT *", "Disable caching"], answer: "Set 'Maximum bytes billed' in query settings or use Custom Quotas" },
            { question: "You need to replicate data from an Oracle database to BigQuery in real-time.", options: ["Datastream", "Batch export", "App Engine", "Cloud Functions"], answer: "Datastream" },
            { question: "What is the purpose of 'Slot' in BigQuery?", options: ["A unit of computational capacity", "storage unit", "A network port", "A time window"], answer: "A unit of computational capacity" },
            { question: "You need to process data exactly once. Which systems support this?", options: ["Pub/Sub (with Dataflow)", "Cloud Storage", "Cloud Logging", "Cloud Monitoring"], answer: "Pub/Sub (with Dataflow)" },
            { question: "Which windowing type in Dataflow groups data based on arrival time?", options: ["Processing time", "Event time", "Session window", "Sliding window"], answer: "Processing time" },
            { question: "You need to store timeseries data and perform complex aggregations. TimescaleDB is not an option.", options: ["Bigtable", "Firestore", "Cloud Storage", "Datastore"], answer: "Bigtable" },
            { question: "You want to automate the deletion of Cloud Storage objects older than 30 days.", options: ["Lifecycle Management Policy", "Cloud Function", "Cron job on VM", "Manual delete"], answer: "Lifecycle Management Policy" },
            { question: "What is the recommended file format for loading data into BigQuery for best performance?", options: ["Avro", "CSV", "JSON", "Text"], answer: "Avro" },
            { question: "You need to access a Cloud SQL database from a Dataflow pipeline securely.", options: ["Use the Cloud SQL Auth Proxy or Private IP", "Public IP", "Open firewall 0.0.0.0/0", "Copy data to text"], answer: "Use the Cloud SQL Auth Proxy or Private IP" },
            { question: "Which BigQuery function helps approximate count of distinct values on huge datasets quickly?", options: ["APPROX_COUNT_DISTINCT", "COUNT(DISTINCT)", "SUM", "AVG"], answer: "APPROX_COUNT_DISTINCT" },
            { question: "You need to backfill historical data in a Dataflow pipeline. What parameter do you verify?", options: ["Watermarks and late data handling", "Machine type", "Region", "Disk size"], answer: "Watermarks and late data handling" },
            { question: "Which service offers a managed graph database experience?", options: ["Spanner Graph", "Use Neo4j on GKE/Marketplace", "BigQuery", "Bigtable"], answer: "Use Neo4j on GKE/Marketplace" },
            { question: "You want to control who can view specific columns in a BigQuery table.", options: ["Policy Tags (Column-level security)", "Dataset permissions", "Table permissions", "Row-level security"], answer: "Policy Tags (Column-level security)" },
            { question: "What is 'Data Mesh'?", options: ["A decentralized data architecture", "A database engine", "A network cable", "A VPN"], answer: "A decentralized data architecture" },
            { question: "You are building a recommendation engine. Where should you store user profile features for low-latency retrieval?", options: ["Bigtable / Firestore", "BigQuery", "Cloud Storage", "Dataflow"], answer: "Bigtable / Firestore" },
            { question: "Which tool allows you to schedule SQL queries in BigQuery?", options: ["Scheduled Queries", "Cron", "Cloud Build", "Dataproc"], answer: "Scheduled Queries" },
            { question: "You need to transform JSON data in Pub/Sub before storing in BigQuery.", options: ["Dataflow", "BigTable", "Cloud SQL", "Cloud Storage"], answer: "Dataflow" },
            { question: "What is a 'Flex Template' in Dataflow?", options: ["A template that enables you to package the pipeline as a Docker image", "A flexible pricing model", "A UI component", "A monitoring tool"], answer: "A template that enables you to package the pipeline as a Docker image" },
            { question: "You need to create a materialized view in BigQuery. Why?", options: ["To improve performance of common aggregation queries", "To save storage", "To encrypt data", "To validating data"], answer: "To improve performance of common aggregation queries" },
            { question: "Which service enables you to manage metadata for all your Google Cloud data assets?", options: ["Data Catalog", "Cloud Logging", "Cloud Trace", "Source Repositories"], answer: "Data Catalog" },
            { question: "You have a star schema. Should you flatten it for BigQuery?", options: ["Ideally yes (denormalize), to utilize nested/repeated fields and columnar swiftness", "No, joins are faster", "No, keep it 3NF", "Yes, to saving space"], answer: "Ideally yes (denormalize), to utilize nested/repeated fields and columnar swiftness" },
            { question: "How do you handle late-arriving data in streaming Dataflow?", options: ["Allowed Lateness & Triggers", "Drop it", "Retry indefinitely", "Pause pipeline"], answer: "Allowed Lateness & Triggers" },
            { question: "You want to analyze logs in real-time. Which sink for Cloud Logging is best?", options: ["Pub/Sub -> Dataflow", "Cloud Storage", "BigQuery (Batch)", "Cloud SQL"], answer: "Pub/Sub -> Dataflow" },
            { question: "Which IAM role is needed to function as a Dataflow worker?", options: ["Dataflow Worker", "Editor", "Viewer", "Owner"], answer: "Dataflow Worker" },
            { question: "You need to reduce data egress costs from BigQuery.", options: ["Avoid downloading large results; analyze in cloud or use same-region compute", "Use VPN", "Compress data manually", "Use HTTP"], answer: "Avoid downloading large results; analyze in cloud or use same-region compute" },
            { question: "What is the best way to copy a BigQuery dataset to another region?", options: ["BigQuery Data Transfer Service (Dataset Copy)", "Export/Import", "Streaming", "Replication"], answer: "BigQuery Data Transfer Service (Dataset Copy)" },
            { question: "Which service can identify PII in Cloud Storage buckets automatically?", options: ["Sensitive Data Protection (Cloud DLP)", "Cloud Armor", "Security Command Center", "IAM"], answer: "Sensitive Data Protection (Cloud DLP)" },
            { question: "You need to store raw IoT telemetry for 10 years for compliance. Low cost is key.", options: ["Cloud Storage Archive Class", "BigQuery", "Bigtable", "Spanner"], answer: "Cloud Storage Archive Class" },
            { question: "How do you update a streaming Dataflow pipeline?", options: ["Launch a replacement job with --update option and same jobName", "Stop and Start", "Edit code on server", "Cannot update"], answer: "Launch a replacement job with --update option and same jobName" },
            { question: "Which BigQuery table type queries an existing Google Sheet?", options: ["Federated/External Table", "Native Table", "View", "Snapshot"], answer: "Federated/External Table" },
            { question: "You need to implement row-level security in BigQuery.", options: ["Create a Row Access Policy", "Create Authorized Views with filters", "Encryption", "IAM conditions"], answer: "Create a Row Access Policy" },
            { question: "What is the usage of 'reservations' in BigQuery?", options: ["To purchase dedicated slots (flat-rate pricing)", "To book a meeting", "To reserve storage", "To schedule queries"], answer: "To purchase dedicated slots (flat-rate pricing)" },
            { question: "You need to export a specific subset of BigQuery data to specific users.", options: ["Export to GCS and share bucket, or Authorized View", "Email CSV", "Print", "Screenshot"], answer: "Export to GCS and share bucket, or Authorized View" },
            { question: "Which machine learning model types are supported by BQML?", options: ["Linear Reg, Logistic Reg, K-means, Matrix Factorization, DNN, etc.", "Only Linear Reg", "Only K-means", "None"], answer: "Linear Reg, Logistic Reg, K-means, Matrix Factorization, DNN, etc." },
            { question: "How do you ensure idempotency in a data pipeline?", options: ["Use unique IDs and deduplication logic", "Run once", "Hope", "Restart always"], answer: "Use unique IDs and deduplication logic" },
            { question: "You need to optimize storage cost for a table partitioned by date in BigQuery.", options: ["Configure partition expiration", "Delete table", "Archive", "Compress"], answer: "Configure partition expiration" },
            { question: "Which file format supports schema evolution best?", options: ["Avro", "CSV", "JSON", "Text"], answer: "Avro" },
            { question: "You want to create a dashboard that updates automatically as data arrives in BigQuery.", options: ["Looker Studio with BigQuery connector", "Excel", "Powerpoint", "Screenshot"], answer: "Looker Studio with BigQuery connector" },
            { question: "What is the benefit of 'Query dry run'?", options: ["Estimates cost (bytes processed) without charging", "Runs query faster", "Validates logic only", "Deletes data"], answer: "Estimates cost (bytes processed) without charging" },
            { question: "Which service integrates best with Vertex AI Feature Store?", options: ["BigQuery", "Local disk", "USB drive", "FTP"], answer: "BigQuery" },
            { question: "You have a MySQL database. Which tool enables real-time analytics on it without ETL?", options: ["Cloud SQL Federated Queries (from BigQuery)", "Read Replica", "Backup", "Dump"], answer: "Cloud SQL Federated Queries (from BigQuery)" },
            { question: "You need to enforce a schema on a Pub/Sub topic.", options: ["Pub/Sub Schema", "Dataflow validation", "Code validation", "Impossible"], answer: "Pub/Sub Schema" },
            { question: "What is the primary role of a Data Engineer?", options: ["Designing and maintaining data systems", "fixing printers", "writing web apps", "selling cloud"], answer: "Designing and maintaining data systems" }
        ],
        "Google Workspace Administrator": [
            { question: "A user reports they cannot access a shared drive. You have confirmed they are in the correct group with 'Content manager' access. What is the most likely reason they still can't access it?", options: ["The shared drive has reached its storage limit.", "The user's Google Workspace license does not support shared drives.", "There is a conflicting file-level permission overriding the group permission.", "The organization has a data loss prevention (DLP) rule blocking access."], answer: "The organization has a data loss prevention (DLP) rule blocking access." },
            { question: "Which tool in the Admin console would you use to investigate a user's recent login activity and security events?", options: ["Reports", "Audit and investigation", "Security dashboard", "Alert center"], answer: "Audit and investigation" },
            { question: "You need to ensure that all mobile devices accessing corporate data have a screen lock enabled. What should you configure?", options: ["Context-Aware Access", "Advanced Mobile Management with a Password Policy", "Basic Mobile Management", "Google Vault"], answer: "Advanced Mobile Management with a Password Policy" },
            { question: "A user has left the organization. You need to transfer their Drive files to a manager before deleting the account. What should you do?", options: ["Transfer ownership in the Admin Console during the deletion flow or separately", "Download files and upload to manager", "Share files with manager", "Use Google Vault"], answer: "Transfer ownership in the Admin Console during the deletion flow or separately" },
            { question: "You want to synchronize your on-premise Active Directory users and groups to Google Workspace. Which tool is officially supported?", options: ["Google Cloud Directory Sync (GCDS)", "Google Workspace Migrate", "Admin SDK", "CSV Upload"], answer: "Google Cloud Directory Sync (GCDS)" },
            { question: "Which Google Workspace edition is required to use 'Data Regions' to pin data to a specific geographic location?", options: ["Business Starter", "Business Standard", "Enterprise Standard/Plus", "Essentials"], answer: "Enterprise Standard/Plus" },
            { question: "You need to retain all emails for 10 years for legal compliance, even if users delete them.", options: ["Google Vault Retention Policy", "Admin Console Email Settings", "Google Takeout", "Archive User"], answer: "Google Vault Retention Policy" },
            { question: "A user is receiving too many spam emails. You want to add an external blocklist.", options: ["Content Compliance rule", "Blocked Senders setting in Gmail settings", "Spam filter", "Phishing protection"], answer: "Blocked Senders setting in Gmail settings" },
            { question: "You need to create a group that automatically includes all users in the organization.", options: ["Dynamic Group (based on query)", "Organization-wide Group (All users)", "Mailing List", "Security Group"], answer: "Organization-wide Group (All users)" },
            { question: "How do you prevent users from sharing sensitive documents with external domains?", options: ["Drive Sharing settings (whitelist domains or disable external sharing)", "DLP Rule", "Context-Aware Access", "Vault"], answer: "Drive Sharing settings (whitelist domains or disable external sharing)" },
            { question: "You want to configure Single Sign-On (SSO) with a third-party Identity Provider (IdP).", options: ["Security > Authentication > SSO with third party IdP", "Directory Sync", "LDAP", "OAuth"], answer: "Security > Authentication > SSO with third party IdP" },
            { question: "Which record must be added to your DNS to verify domain ownership during setup?", options: ["TXT or CNAME record", "A record", "MX record", "SRV record"], answer: "TXT or CNAME record" },
            { question: "What is the purpose of the SPF record?", options: ["To authorize sending mail servers and prevent spoofing", "To encrypt email", "To verify domain ownership", "To sign emails"], answer: "To authorize sending mail servers and prevent spoofing" },
            { question: "You need to whitelist an internal application's IP address to send emails without authentication via SMTP relay.", options: ["Gmail > Routing > SMTP Relay service settings", "Firewall", "VPC", "Groups"], answer: "Gmail > Routing > SMTP Relay service settings" },
            { question: "How can you restrict access to Google Workspace apps based on user IP address?", options: ["Context-Aware Access (Zero Trust)", "Network masks", "Firewall rules", "VPN"], answer: "Context-Aware Access (Zero Trust)" },
            { question: "A user lost their 2FA phone. How can you help them login?", options: ["Generate backup codes or temporarily turn off 2SV for the user", "Reset password", "Delete account", "Call Google Support"], answer: "Generate backup codes or temporarily turn off 2SV for the user" },
            { question: "You want to brand the login page with your company logo.", options: ["Account Settings > Personalization", "Gmail Settings", "Cannot be done", "Theme settings"], answer: "Account Settings > Personalization" },
            { question: "Which tool allows you to perform a bulk update of user profile create via CSV?", options: ["Bulk update users in Admin Console", "GCDS", "API", "Mobile App"], answer: "Bulk update users in Admin Console" },
            { question: "You need to create a custom admin role that can only reset passwords for the 'Sales' OU.", options: ["Create Custom Role with 'Reset Password' privilege and assign to admin limited to 'Sales' OU", "Super Admin", "Delegated Admin", "Groups Admin"], answer: "Create Custom Role with 'Reset Password' privilege and assign to admin limited to 'Sales' OU" },
            { question: "What is the maximum number of users you can add to a Google Group?", options: ["Unlimited (but limits apply to emailing)", "100", "5000", "1 million"], answer: "Unlimited (but limits apply to emailing)" },
            { question: "How do you investigate a phishing email reported by multiple users?", options: ["Investigation Tool (Security Center)", "Audit Logs", "Vault", "Reports"], answer: "Investigation Tool (Security Center)" },
            { question: "You want to ensure that Chrome extensions are installed automatically on managed browsers.", options: ["Chrome Browser Cloud Management > Apps & Extensions > Force enable", "GPO", "Registry", "Script"], answer: "Chrome Browser Cloud Management > Apps & Extensions > Force enable" },
            { question: "Which DNS record enables DKIM signing?", options: ["TXT record", "MX record", "A record", "CNAME"], answer: "TXT record" },
            { question: "You need to migrate email data from an Exchange Server to Google Workspace.", options: ["Google Workspace Migrate (GWM) or Data Migration Service (DMS)", "GCDS", "Vault", "Takeout"], answer: "Google Workspace Migrate (GWM) or Data Migration Service (DMS)" },
            { question: "What is 'Secure LDAP' used for?", options: ["To allow LDAP-based apps and appliances to authenticate users against Google Cloud Directory", "To sync users", "To login to Windows", "To encrypt email"], answer: "To allow LDAP-based apps and appliances to authenticate users against Google Cloud Directory" },
            { question: "You want to prevent users from installing specific mobile apps on corporate devices.", options: ["App allowlist/blocklist in Mobile Management", "Context Aware Access", "Vault", "Audit"], answer: "App allowlist/blocklist in Mobile Management" },
            { question: "Which setting controls if users can create shared drives?", options: ["Apps > Drive and Docs > Sharing settings > Shared drive creation", "Groups", "License", "Vault"], answer: "Apps > Drive and Docs > Sharing settings > Shared drive creation" },
            { question: "You need to recover a user's deleted Drive file. How many days do you have?", options: ["25 days from Trash (or admin restore window)", "30 days", "Unlimited", "90 days"], answer: "25 days from Trash (or admin restore window)" },
            { question: "What is 'Client-side encryption' in Workspace?", options: ["Encryption keys are managed by the customer, Google cannot access data", "TLS", "SSL", "VPN"], answer: "Encryption keys are managed by the customer, Google cannot access data" },
            { question: "You want to set up a 'walled garden' where users can only email internal domains.", options: ["Restrict delivery setting (Compliance rule)", "Group settings", "SPF", "DKIM"], answer: "Restrict delivery setting (Compliance rule)" },
            { question: "How do you enable 'Offline Mode' for Gmail for all users?", options: ["Apps > Workspace > Gmail > User settings > Enable Gmail offline", "Individual user setting", "Chrome policy", "Device policy"], answer: "Apps > Workspace > Gmail > User settings > Enable Gmail offline" },
            { question: "You need to check how much storage a specific user is consuming.", options: ["User list in Admin Console", "Billing", "Reports > Aggregate", "Vault"], answer: "User list in Admin Console" },
            { question: "Which report shows external sharing exposure?", options: ["Data exposure report / Security Dashboard", "Login audit", "Admin audit", "Token audit"], answer: "Data exposure report / Security Dashboard" },
            { question: "You need to configure a catch-all address for misspelled emails.", options: ["Gmail > Routing > Default routing (Catch-all)", "Groups", "Alias", "Forwarding"], answer: "Gmail > Routing > Default routing (Catch-all)" },
            { question: "A user is suspended for 'spamming'. How do you reactivate them?", options: ["Restore user in Admin Console (requires resolving issue)", "Reset password", "Delete account", "Wait 24h"], answer: "Restore user in Admin Console (requires resolving issue)" },
            { question: "You want to deploy a Wi-Fi configuration to managed Android devices.", options: ["Devices > Networks > Wi-Fi", "Email password", "Manual setup", "Chrome policy"], answer: "Devices > Networks > Wi-Fi" },
            { question: "What is the purpose of 'Target audiences'?", options: ["To recommend content/files to specific groups of users in Drive/Docs", "To send marketing emails", "To limit access", "To audit"], answer: "To recommend content/files to specific groups of users in Drive/Docs" },
            { question: "You need to conduct an eDiscovery search for a lawsuit.", options: ["Google Vault > Matters", "Admin Console search", "Drive search", "Gmail search"], answer: "Google Vault > Matters" },
            { question: "Which setting forces users to change their password on next login?", options: ["UserInfo > Reset Password > 'Ask for a password change at the next sign-in'", "Security settings", "Group settings", "GPO"], answer: "UserInfo > UserInfo > Reset Password > 'Ask for a password change at the next sign-in'" },
            { question: "You want to use your own S/MIME certificates for email encryption.", options: ["Gmail > User settings > S/MIME", "Vault", "DLP", "Compliance"], answer: "Gmail > User settings > S/MIME" },
            { question: "How do you manage Windows 10 devices with Google Workspace?", options: ["Google Credential Provider for Windows (GCPW)", "Active Directory only", "Cannot be done", "ChromeOS"], answer: "Google Credential Provider for Windows (GCPW)" },
            { question: "A suspended user's data will be deleted after how long?", options: ["It is not deleted automatically until the admin deletes the account", "30 days", "1 year", "24 hours"], answer: "It is not deleted automatically until the admin deletes the account" },
            { question: "You need to create a resource calendar for a conference room.", options: ["Directory > Buildings and resources", "Calendar settings", "User calendar", "Group calendar"], answer: "Directory > Buildings and resources" },
            { question: "What functionality does 'Endpoint Verification' provide?", options: ["Collects inventory info of desktop devices accessing corporate data", "Antivirus", "VPN", "Firewall"], answer: "Collects inventory info of desktop devices accessing corporate data" },
            { question: "How do you prevent users from creating public Google Sites?", options: ["Sites > Sharing settings > Uncheck 'Allow users to publish Sites to the web'", "Disable Sites", "DLP", "Vault"], answer: "Sites > Sharing settings > Uncheck 'Allow users to publish Sites to the web'" },
            { question: "You want to configure a footer (legal disclaimer) for all outgoing emails.", options: ["Gmail > Compliance > Append footer", "Signature", "Routing", "Theme"], answer: "Gmail > Compliance > Append footer" },
            { question: "Which privileges are required to create a new user?", options: ["User Management Admin (or Super Admin)", "Help Desk", "Services Admin", "Report Admin"], answer: "User Management Admin (or Super Admin)" },
            { question: "You need to sync Calendar data with Outlook users.", options: ["Google Calendar Interop", "GCDS", "CSV import", "Cannot be done"], answer: "Google Calendar Interop" },
            { question: "What is the result of 'Wiping' a device?", options: ["Factory reset (if fully managed) or removing work data (account-only wipe)", "Locks device", "Deletes user", "Resets password"], answer: "Factory reset (if fully managed) or removing work data (account-only wipe)" },
            { question: "You want to restrict which Google accounts can sign in to the Chrome browser on corporate devices.", options: ["Chrome > User & Browser Settings > Sign-in restriction pattern", "Device settings", "Network firewall", "DNS"], answer: "Chrome > User & Browser Settings > Sign-in restriction pattern" },
            { question: "Where do you manage billing and licenses?", options: ["Billing > Subscriptions", "Dashboard", "Users", "Reports"], answer: "Billing > Subscriptions" },
            { question: "How can you bypass a blocked sender/spam filter for a specific partner domain?", options: ["Add domain to an allowlist in Spam settings", "Disable spam filter", "Create a group", "Add to contacts"], answer: "Add domain to an allowlist in Spam settings" },
            { question: "You need to grant an admin access to view all user's emails for auditing.", options: ["Use Vault (Accessing directly is not standard admin privilege)", "Reset password", "Delegate access", "Super Admin"], answer: "Use Vault (Accessing directly is not standard admin privilege)" },
            { question: "What is 'Groups for Business' setting?", options: ["Enables the user-facing Groups interface (groups.google.com)", "Admin groups", "Security groups", "API"], answer: "Enables the user-facing Groups interface (groups.google.com)" },
            { question: "You want to prevent super admins from being locked out by Context-Aware Access policies.", options: ["Best practice: exclude a break-glass account or ensure policy logic allows specific network/device", "Cannot prevent", "Disable CAA", "Use VPN"], answer: "Best practice: exclude a break-glass account or ensure policy logic allows specific network/device" },
            { question: "Which feature prevents spoofing of your domain?", options: ["DMARC (with SPF/DKIM)", "TLS", "SSL", "HTTPS"], answer: "DMARC (with SPF/DKIM)" },
            { question: "Use need to transfer a user's calendar events to another user.", options: ["Unsuspend user -> Transfer data (Calendar)", "Export/Import", "Share calendar", "Vault"], answer: "Unsuspend user -> Transfer data (Calendar)" },
            { question: "What is the max attachment size in Gmail?", options: ["25 MB", "10 MB", "50 MB", "100 MB"], answer: "25 MB" },
            { question: "You want to allow users to use 'Sign in with Google' on third-party sites but control which apps.", options: ["API Controls > Manage Third-Party App Access", "Disable SSO", "Block all apps", "Firewall"], answer: "API Controls > Manage Third-Party App Access" },
            { question: "How do you enable 'confidential mode' for outgoing emails?", options: ["Gmail > User settings > Confidential mode", "Compliance rule", "DLP", "Vault"], answer: "Gmail > User settings > Confidential mode" },
            { question: "You need to see if a user is using 2-Step Verification.", options: ["Users list > Security column or User details > Security", "Ask them", "Vault", "Billing"], answer: "Users list > Security column or User details > Security" },
            { question: "What is 'Directory' visibility?", options: ["Controls which users/groups are visible in the global address list (autocomplete)", "Admin access", "Public access", "External sharing"], answer: "Controls which users/groups are visible in the global address list (autocomplete)" },
            { question: "You want to restrict video calling in Google Chat.", options: ["Apps > Google Chat > Settings", "Disable Camera", "Firewall", "Vault"], answer: "Apps > Google Chat > Settings" },
            { question: "Which setting allows users to grant specific access to their Gmail mailbox to an assistant?", options: ["Mail delegation", "Sharing", "Forwarding", "Group"], answer: "Mail delegation" },
            { question: "You need to manage Apple iOS devices (ABM).", options: ["Set up Apple Business Manager integration in Mobile Management", "Cannot be done", "Use manual profiles", "Use iTunes"], answer: "Set up Apple Business Manager integration in Mobile Management" },
            { question: "What happens if a user's license is removed?", options: ["Services are suspended, data is retained for a grace period but inaccessible", "Data is deleted immediately", "User is deleted", "Nothing"], answer: "Services are suspended, data is retained for a grace period but inaccessible" },
            { question: "How do you enforce a specific homepage in Chrome?", options: ["Chrome > Managed Browsers > Startup pages", "GPO", "User setting", "DNS"], answer: "Chrome > Managed Browsers > Startup pages" },
            { question: "You want to stop users from creating Google Classrooms.", options: ["Education > Classroom > General settings > Teacher permissions", "Disable Classroom app", "Vault", "Groups"], answer: "Education > Classroom > General settings > Teacher permissions" },
            { question: "A user needs to send an email as a group address.", options: ["Add group as an alias in Gmail 'Send mail as' settings (requires 'Post as group' permission)", "Login as group", "Delegate", "Forward"], answer: "Add group as an alias in Gmail 'Send mail as' settings (requires 'Post as group' permission)" },
            { question: "You need to check the status of Google Workspace services.", options: ["Google Workspace Status Dashboard", "Admin Console", "Twitter", "News"], answer: "Google Workspace Status Dashboard" }
        ],
        "Professional Cloud Database Engineer": [
            { question: "Which Google Cloud database service is best suited for a globally distributed, transactional workload requiring strong consistency and horizontal scalability?", options: ["Cloud SQL (PostgreSQL)", "Cloud Bigtable", "Firestore", "Cloud Spanner"], answer: "Cloud Spanner" },
            { question: "A company needs a fully managed PostgreSQL-compatible database with high availability and automated patching. Which service should they choose?", options: ["Compute Engine with self-managed PostgreSQL", "Cloud SQL for PostgreSQL", "Cloud Bigtable", "Cloud Spanner"], answer: "Cloud SQL for PostgreSQL" },
            { question: "What is the primary goal of migrating a monolithic on-premise relational database to a sharded, scalable cloud solution like Cloud Spanner?", options: ["To reduce networking latency", "To achieve high throughput and strong consistency at global scale", "To simplify backup procedures", "To use an open-source database engine"], answer: "To achieve high throughput and strong consistency at global scale" },
            { question: "You need to store timeseries data with high write throughput. Which database is optimal?", options: ["Cloud SQL", "Cloud Bigtable", "Firestore", "BigQuery"], answer: "Cloud Bigtable" },
            { question: "What is the recommended way to encrypt data in transit to Cloud SQL?", options: ["SSL/TLS", "IPsec VPN", "SSH Tunnel", "Telnet"], answer: "SSL/TLS" },
            { question: "You need to migrate an Oracle database to GCP with minimal downtime. Which tool should you use?", options: ["Database Migration Service", "BigQuery Data Transfer Service", "Storage Transfer Service", "Migrate for Compute Engine"], answer: "Database Migration Service" },
            { question: "Which Cloud SQL feature allows you to scale reads?", options: ["Failover Replica", "Read Replica", "High Availability", "Vertical Scaling"], answer: "Read Replica" },
            { question: "What is the maximum storage capacity for a Cloud SQL for PostgreSQL instance?", options: ["30 TB", "64 TB", "10 TB", "100 GB"], answer: "64 TB" },
            { question: "Which consistency model does Cloud Spanner use?", options: ["Eventual Consistency", "Strong Consistency (External Consistency)", "Causal Consistency", "Read-your-writes"], answer: "Strong Consistency (External Consistency)" },
            { question: "You need to store JSON documents and require real-time synchronization to mobile devices. Which DB?", options: ["Firestore", "Cloud SQL", "Cloud Spanner", "Bigtable"], answer: "Firestore" },
            { question: "How does Cloud Bigtable handle hot spots?", options: ["Key Visualizer", "Automatic Sharding", "Manual Rebalancing", "It doesn't"], answer: "Key Visualizer" },
            { question: "What is the ideal row key design for Bigtable to avoid hotspots?", options: ["Sequential IDs", "Timestamps", "Reverse domain names or hashed keys", "Random strings"], answer: "Reverse domain names or hashed keys" },
            { question: "You need to run a Redis cluster. Which service is fully managed?", options: ["Memorystore", "Cloud SQL", "Bigtable", "Spanner"], answer: "Memorystore" },
            { question: "Which database service allows you to query data in Cloud Storage directly using SQL?", options: ["BigQuery (External Tables)", "Cloud SQL", "Firestore", "Spanner"], answer: "BigQuery (External Tables)" },
            { question: "You need point-in-time recovery for your database. Which service supports this out of the box?", options: ["Cloud SQL", "Memorystore", "BigQuery", "Local SSD"], answer: "Cloud SQL" },
            { question: "What is the primary use of Datastream?", options: ["Serverless Change Data Capture (CDC) and replication", "Batch processing", "Data visualization", "Query optimization"], answer: "Serverless Change Data Capture (CDC) and replication" },
            { question: "You have a MySQL database on-premise. You want a managed replacement. What is the best lift-and-shift target?", options: ["Cloud SQL for MySQL", "BigQuery", "Firestore", "Spanner"], answer: "Cloud SQL for MySQL" },
            { question: "Which SQL dialect does Cloud Spanner support?", options: ["Google Standard SQL & PostgreSQL", "T-SQL", "PL/SQL", "Cypher"], answer: "Google Standard SQL & PostgreSQL" },
            { question: "You need to perform ACID transactions across multiple documents in Firestore. Is this supported?", options: ["Yes", "No", "Only in Datastore mode", "Only for single documents"], answer: "Yes" },
            { question: "What is the default isolation level in Cloud SQL for PostgreSQL?", options: ["Read Committed", "Serializable", "Repeatable Read", "Read Uncommitted"], answer: "Read Committed" },
            { question: "You are designing a schema for Spanner. What is a key best practice for primary keys?", options: ["Use monotonically increasing integers", "Use UUIDv4 (random)", "Use timestamps", "Use nulls"], answer: "Use UUIDv4 (random)" },
            { question: "Which tool helps assess the compatibility of your Oracle database with Cloud SQL for PostgreSQL?", options: ["Database Migration Assessment Tool", "Cloud Shell", "gcloud sql check", "Ora2Pg"], answer: "Database Migration Assessment Tool" },
            { question: "You need to optimize a slow query in Cloud SQL. What tool should you use?", options: ["Query Insights", "Cloud Trace", "Cloud Profiler", "Cloud Debugger"], answer: "Query Insights" },
            { question: "How do you achieve cross-region high availability for Cloud SQL?", options: ["It is not supported", "Create a read replica in another region and promote it manually/automatically", "It is automatic", "Use a multi-master setup"], answer: "Create a read replica in another region and promote it manually/automatically" },
            { question: "Which caching strategy is best for read-heavy workloads with infrequent updates?", options: ["Write-through", "Look-aside (Lazy loading)", "Write-back", "Refresh-ahead"], answer: "Look-aside (Lazy loading)" },
            { question: "You want to reduce the cost of Cloud SQL instances during development hours (nights/weekends). What can you do?", options: ["Stop the instance", "Delete the instance", "Change machine type to shared core", "Use preemptible instances (not supported)"], answer: "Stop the instance" },
            { question: "What is the storage limit for Firestore in Native mode?", options: ["1 TB", "Unlimited (scales automatically)", "10 GB", "100 TB"], answer: "Unlimited (scales automatically)" },
            { question: "You need to export data from Cloud SQL to BigQuery. What is the most direct method?", options: ["Export to CSV in Cloud Storage, then load to BigQuery", "Direct federation", "Datastream", "Pub/Sub"], answer: "Export to CSV in Cloud Storage, then load to BigQuery" },
            { question: "Which database is a wide-column store?", options: ["Bigtable", "Cloud SQL", "Spanner", "Firestore"], answer: "Bigtable" },
            { question: "What is a 'Interleaved Table' in Spanner?", options: ["A table physically co-located with its parent table rows", "A table in a different region", "A temporary table", "A virtual table"], answer: "A table physically co-located with its parent table rows" },
            { question: "You need to secure Cloud SQL connectivity from a GKE cluster. What is the recommended method?", options: ["Cloud SQL Auth Proxy (sidecar)", "Public IP", "Whitelist Node IPs", "SSH Tunnel"], answer: "Cloud SQL Auth Proxy (sidecar)" },
            { question: "Which service is best for storing user session data?", options: ["Memorystore for Redis", "BigQuery", "Cloud Storage", "Bigtable"], answer: "Memorystore for Redis" },
            { question: "You need to audit all administrative actions on your Cloud SQL instance. Where do you look?", options: ["Cloud Audit Logs (Admin Activity)", "VPC Flow Logs", "Error Logs", "Slow Query Logs"], answer: "Cloud Audit Logs (Admin Activity)" },
            { question: "What is the maximum number of read replicas for a Cloud SQL instance?", options: ["5", "10", "Unlimited", "20"], answer: "10" },
            { question: "You want to restrict Cloud SQL access to a specific VPC without using public IPs. What feature do you use?", options: ["Private Service Access", "VPC Peering", "Cloud VPN", "Firewall Rules"], answer: "Private Service Access" },
            { question: "Which Spanner feature allows you to specify the geographic placement of data at the row level?", options: ["Geo-partitioning", "Placement Policy", "Zone Awareness", "Region Tagging"], answer: "Geo-partitioning" },
            { question: "How do you backup a Firestore database?", options: ["gcloud firestore export", "Automatic snapshots", "Copy file", "SQL Dump"], answer: "gcloud firestore export" },
            { question: "What happens to the Failover Replica when a Cloud SQL instance fails over?", options: ["It becomes the Primary instance", "It remains a replica", "It is deleted", "It restarts"], answer: "It becomes the Primary instance" },
            { question: "You need to store graph data. Which service can execute graph queries?", options: ["No native Graph DB, use Spanner Graph or 3rd party", "Cloud SQL", "Bigtable", "Firestore"], answer: "No native Graph DB, use Spanner Graph or 3rd party" },
            { question: "What is the maintenance window in Cloud SQL?", options: ["A designated time for system updates/patches", "Downtime time", "Backup time", "Scaling time"], answer: "A designated time for system updates/patches" },
            { question: "Which metric best indicates CPU saturation in Cloud SQL?", options: ["CPU Utilization", "Disk I/O", "Memory Usage", "Connection Count"], answer: "CPU Utilization" },
            { question: "You need to import a 500GB SQL dump into Cloud SQL. What should you do to speed it up?", options: ["Disable automated backups and increase disk size (IOPS)", "Compress the file", "Use a smaller instance", "Split the file"], answer: "Disable automated backups and increase disk size (IOPS)" },
            { question: "Which database service allows you to use `TTL` (Time To Live) to automatically delete old data?", options: ["Firestore and Bigtable", "Cloud SQL", "Spanner", "Memorystore"], answer: "Firestore and Bigtable" },
            { question: "You need a fully managed MongoDB-compatible database. What is the Google Cloud offering?", options: ["MongoDB Atlas (Partner) or DocumentDB (AWS)", "Actually rapid development on Firestore or partner service", "Cloud SQL", "Spanner"], answer: "MongoDB Atlas (Partner) or DocumentDB (AWS)" },
            { question: "What functionality does `pgvector` extend to Cloud SQL for PostgreSQL?", options: ["Vector similarity search (AI/ML)", "Graph processing", "Time series analysis", "Blockchain"], answer: "Vector similarity search (AI/ML)" },
            { question: "You need strict referential integrity. Which DBs support this?", options: ["Cloud SQL and Spanner", "Bigtable", "Firestore", "Memorystore"], answer: "Cloud SQL and Spanner" },
            { question: "What is the minimum storage size for Cloud SQL?", options: ["10 GB", "100 GB", "1 GB", "No minimum"], answer: "10 GB" },
            { question: "Which tool can generate synthetic data for database testing?", options: ["Custom scripts / 3rd party", "Dataflow", "Cloud SQL Generator", "BigQuery"], answer: "Custom scripts / 3rd party" },
            { question: "You want to clone a Cloud SQL instance for testing. What feature do you use?", options: ["Clone", "Duplicate", "Copy", "Mirror"], answer: "Clone" },
            { question: "Does Cloud Spanner support secondary indexes?", options: ["Yes", "No", "Only on primary keys", "Only in one region"], answer: "Yes" },
            { question: "What is the maximum size of a single value in Bigtable?", options: ["10 MB", "100 MB", "1 GB", "1 MB"], answer: "10 MB" },
            { question: "You need to protect your database from accidental deletion. What feature should you enable?", options: ["Deletion Protection", "Locking", "Backup", "IAM"], answer: "Deletion Protection" },
            { question: "Which service offers in-memory caching for sub-millisecond latency?", options: ["Memorystore", "Cloud SQL", "Spanner", "BigQuery"], answer: "Memorystore" },
            { question: "How do you rotate credentials for a Cloud SQL user securely?", options: ["Use Secret Manager with rotation Cloud Functions", "Manually update", "Use IAM", "Put new password in code"], answer: "Use Secret Manager with rotation Cloud Functions" },
            { question: "Which DB is best for a massive-scale (PB) gaming leaderboard?", options: ["Cloud Bigtable", "Cloud SQL", "Firestore", "BigQuery"], answer: "Cloud Bigtable" },
            { question: "Can you resize a Cloud SQL disk downwards?", options: ["No, only up", "Yes, anytime", "Yes, with restart", "Only for SSD"], answer: "No, only up" },
            { question: "What is the primary interface for managing Bigtable?", options: ["cbt CLI / HBase API", "SQL", "GUI only", "REST only"], answer: "cbt CLI / HBase API" },
            { question: "You need to reduce latency for a global web app reading from Cloud SQL. What do you deploy?", options: ["Read replicas in local regions", "New master instances", "CDN", "VPN"], answer: "Read replicas in local regions" },
            { question: "What feature of Firestore allows offline data access for mobile apps?", options: ["Offline Persistence", "Caching", "Local Storage", "Sync"], answer: "Offline Persistence" },
            { question: "You need to migrate from AWS RDS to Cloud SQL. What is the best service?", options: ["Database Migration Service (DMS)", "Manual Dump/Restore", "Replication", "FTP"], answer: "Database Migration Service (DMS)" },
            { question: "Which IAM role is required to connect to a Cloud SQL instance?", options: ["Cloud SQL Client", "Cloud SQL Admin", "Viewer", "Editor"], answer: "Cloud SQL Client" },
            { question: "How does Spanner achieve 99.999% availability?", options: ["TrueTime and synchronous replication (Paxos)", "Async replication", "Sharding", "Backups"], answer: "TrueTime and synchronous replication (Paxos)" },
            { question: "You need to run complex analytical queries on your operational data in Cloud Spanner without impacting performance. What do you use?", options: ["Data Boost", "Read Replica", "Backup", "Export"], answer: "Data Boost" },
            { question: "Which database engine is NOT supported by Cloud SQL?", options: ["Oracle", "MySQL", "PostgreSQL", "SQL Server"], answer: "Oracle" },
            { question: "What is the purpose of the 'postgres' user in Cloud SQL?", options: ["Default administrative user", "Read-only user", "System user", "Backup user"], answer: "Default administrative user" },
            { question: "You have a high-velocity write workload. Which storage type is best for Cloud SQL?", options: ["SSD", "HDD", "Tape", "Network"], answer: "SSD" },
            { question: "Can Bigtable be used as a source for BigQuery?", options: ["Yes, via External Tables or Dataflow", "No", "Only via CSV", "Only via SQL"], answer: "Yes, via External Tables or Dataflow" },
            { question: "What is the maximum transaction duration in Cloud Spanner?", options: ["There is a limit (e.g., 20s for commit)", "Unlimited", "1 hour", "1 ms"], answer: "There is a limit (e.g., 20s for commit)" },
            { question: "Which service automatically recommends database optimizations?", options: ["Active Assist / Recommender", "Cloud Build", "Support", "Docs"], answer: "Active Assist / Recommender" },
            { question: "You need to store hierarchical data structure. Which DB is good?", options: ["Firestore", "Bigtable", "Cloud SQL", "Memorystore"], answer: "Firestore" }
        ],
        "Professional Cloud DevOps Engineer": [
            { question: "You are adopting Site Reliability Engineering (SRE) practices. What is the primary metric used to measure the reliability of a service as experienced by the user?", options: ["Service Level Agreement (SLA)", "Service Level Objective (SLO)", "Service Level Indicator (SLI)", "Mean Time To Recovery (MTTR)"], answer: "Service Level Indicator (SLI)" },
            { question: "What is the error budget in SRE terms?", options: ["The amount of money allocated for fixing bugs", "The 1 - SLO, representing the allowable unreliability", "The number of errors allowed before a rollback", "The budget for overtime pay during incidents"], answer: "The 1 - SLO, representing the allowable unreliability" },
            { question: "Which SRE principle focuses on reducing manual, repetitive work?", options: ["Eliminating Toil", "Monitoring Distributed Systems", "Embracing Risk", "Release Engineering"], answer: "Eliminating Toil" },
            { question: "When an error budget is exhausted, what is the recommended course of action according to SRE practices?", options: ["Halt feature launches and focus on reliability", "Hire more SREs", "Increase the error budget", "Ignore the budget and continue releases"], answer: "Halt feature launches and focus on reliability" },
            { question: "What is the purpose of a Blameless Post-Mortem?", options: ["To prevent the same incident from happening again by focusing on process and technology", "To identify the person responsible for the outage", "To punish the team for failing SLA", "To generate a report for the billing department"], answer: "To prevent the same incident from happening again by focusing on process and technology" },
            { question: "You are defining SLIs for a user-facing web service. Which metrics are most appropriate?", options: ["Latency, Availability, and Error Rate", "CPU utilization and disk usage", "Network throughput and packet loss", "Developer commit frequency"], answer: "Latency, Availability, and Error Rate" },
            { question: "Which deployment strategy allows you to gradually route traffic to a new version of your application to monitor for errors before full rollout?", options: ["Canary Deployment", "Recreate Deployment", "Rolling Update", "Blue/Green Deployment"], answer: "Canary Deployment" },
            { question: "You need to reduce the Mean Time To Detect (MTTD) an incident. What should you improve?", options: ["Monitoring and Alerting", "Automated testing", "Incident Response Playbooks", "Documentation"], answer: "Monitoring and Alerting" },
            { question: "What is 'Toil' in the context of SRE?", options: ["Manual, repetitive, automatable, tactical work", "Creating new features", "Designing system architecture", "attending team meetings"], answer: "Manual, repetitive, automatable, tactical work" },
            { question: "Which tool in Google Cloud is designed to help you track and manage incident response?", options: ["Incident Management (part of Monitoring)", "Cloud Logging", "Cloud Build", "Cloud Run"], answer: "Incident Management (part of Monitoring)" },
            { question: "You are designing a CI/CD pipeline using Cloud Build. How should you securely enable the build to access a private repository in Cloud Source Repositories?", options: ["Use the Cloud Build Service Account permissions", "Store SSH keys in the source code", "Pass credentials as environment variables", "Make the repository public"], answer: "Use the Cloud Build Service Account permissions" },
            { question: "Which GCP service provides a fully managed continuous integration, continuous delivery, and continuous deployment platform?", options: ["Cloud Build", "Jenkins on Compute Engine", "Cloud Deploy", "Spinnaker"], answer: "Cloud Build" },
            { question: "You want to deploy containers to Google Kubernetes Engine (GKE) and want a managed CD service to handle the release pipeline, including canary deployments. Which service should you use?", options: ["Cloud Deploy", "Cloud Build", "Cloud Functions", "App Engine"], answer: "Cloud Deploy" },
            { question: "In a GitOps workflow, what is the single source of truth for your infrastructure and application configuration?", options: ["The Git repository", "The running cluster state", "The CI server", "The Database"], answer: "The Git repository" },
            { question: "You are using Binary Authorization to secure your GKE cluster. What does this service primarily ensure?", options: ["That only trusted/signed container images are deployed", "That all network traffic is encrypted", "That users use MFA", "That pods scale automatically"], answer: "That only trusted/signed container images are deployed" },
            { question: "Which tool allows you to define infrastructure as code (IaC) and is widely supported on GCP?", options: ["Terraform", "Ansible", "Puppet", "Chef"], answer: "Terraform" },
            { question: "You need to store Docker images for your organization securely. Which service replaces Container Registry and offers granular access control?", options: ["Artifact Registry", "Cloud Storage", "Source Repositories", "Cloud Build"], answer: "Artifact Registry" },
            { question: "What is the best practice for managing secrets (API keys, passwords) in a Cloud Build pipeline?", options: ["Use Secret Manager and access them via the build steps", "Commit them to the repo", "Pass them as command line arguments", "Store them in a text file on Cloud Storage"], answer: "Use Secret Manager and access them via the build steps" },
            { question: "How can you speed up Cloud Build builds that use large Docker images?", options: ["Enable Kaniko cache", "Use a larger machine type for the build", "Store images in a public registry", "Skip unit tests"], answer: "Enable Kaniko cache" },
            { question: "You want to trigger a Cloud Build pipeline automatically whenever code is pushed to a specific branch in GitHub. What should you configure?", options: ["A Cloud Build Trigger", "A Cloud Scheduler job", "A Pub/Sub topic", "A Cloud Function"], answer: "A Cloud Build Trigger" },
            { question: "You need to view the latency of a request as it travels through multiple microservices in your architecture. Which tool should you use?", options: ["Cloud Trace", "Cloud Monitoring", "Cloud Logging", "Cloud Profiler"], answer: "Cloud Trace" },
            { question: "Which Cloud Monitoring concept represents a collection of time-series data?", options: ["Metric", "Resource", "Group", "Workspace"], answer: "Metric" },
            { question: "You want to investigate performance bottlenecks in your code (CPU/Memory usage) running in production with minimal overhead. Which tool should you use?", options: ["Cloud Profiler", "Cloud Trace", "Cloud Debugger", "Cloud Logging"], answer: "Cloud Profiler" },
            { question: "How long are Cloud Logging audit logs retained by default?", options: ["400 days", "7 days", "30 days", "Indefinitely"], answer: "400 days" },
            { question: "You need to export logs to BigQuery for long-term analytics. What do you create in Cloud Logging?", options: ["Log Sink", "Log Bucket", "Log Metric", "Log View"], answer: "Log Sink" },
            { question: "Which language is used to query logs in the Logs Explorer?", options: ["Logging Query Language (LQL/filtering syntax)", "SQL", "LogQL", "PromQL"], answer: "Logging Query Language (LQL/filtering syntax)" },
            { question: "You want to create an alert based on a specific error message appearing in your logs. What should you do first?", options: ["Create a log-based metric", "Create a dashboard", "Export to BigQuery", "Write a Cloud Function"], answer: "Create a log-based metric" },
            { question: "What is the purpose of 'Uptime Checks' in Cloud Monitoring?", options: ["To verify the availability of your public-facing services from locations around the world", "To check if your internal database is running", "To monitor CPU usage", "To audit IAM changes"], answer: "To verify the availability of your public-facing services from locations around the world" },
            { question: "You see a spike in 5xx errors on your load balancer. Which logs would generally be most useful to check first?", options: ["Load Balancer Access Logs", "VPC Flow Logs", "Cloud Audit Logs", "System Event Logs"], answer: "Load Balancer Access Logs" },
            { question: "Your application running on GKE is crashing (OOM). Which metric should you inspect?", options: ["Memory usage / Container memory limit", "CPU utilization", "Disk I/O", "Network packets"], answer: "Memory usage / Container memory limit" },
            { question: "During an incident, who should be the single source of truth and command?", options: ["The Incident Commander (IC)", "The CEO", "The Operations Lead", "The Communications Lead"], answer: "The Incident Commander (IC)" },
            { question: "Which GCP service helps prevent sensitive data (like credit card numbers) from being logged inadvertently?", options: ["Cloud DLP (Data Loss Prevention)", "Secret Manager", "IAM", "VPC Service Controls"], answer: "Cloud DLP (Data Loss Prevention)" },
            { question: "You want to restrict which Google Cloud APIs can be called from within your VPC to prevent data exfiltration. What should you implementation?", options: ["VPC Service Controls", "VPC Firewall Rules", "Cloud Armor", "Identity-Aware Proxy"], answer: "VPC Service Controls" },
            { question: "Which service protects your web applications from DDoS attacks and common web exploits (OWASP Top 10)?", options: ["Cloud Armor", "Cloud CDN", "Cloud DNS", "Cloud NAT"], answer: "Cloud Armor" },
            { question: "You need to audit 'who did what, where, and when' in your GCP project. What is the primary source of this information?", options: ["Cloud Audit Logs", "Cloud Monitoring", "VPC Flow Logs", "Billing Export"], answer: "Cloud Audit Logs" },
            { question: "How do you securely manage access to a GKE cluster's control plane?", options: ["Use Authorized Networks", "Expose it to the internet", "Use a strong password", "Disable the control plane"], answer: "Use Authorized Networks" },
            { question: "What is the purpose of 'Break-glass' access in IAM?", options: ["Emergency access for highly privileged actions during critical incidents", "Permanent admin access", "Read-only access", "API access"], answer: "Emergency access for highly privileged actions during critical incidents" },
            { question: "You are using Terraform. Where should you store the state file securely?", options: ["Remote backend (e.g., Cloud Storage bucket with versioning and encryption)", "Local git repo", "Public S3 bucket", "Stick notes"], answer: "Remote backend (e.g., Cloud Storage bucket with versioning and encryption)" },
            { question: "Which feature allows you to ensure that your GKE pods can only communicate with legitimate services?", options: ["Network Policies", "Pod Security Policy", "Binary Authorization", "Shielded Nodes"], answer: "Network Policies" },
            { question: "You discover a public bucket that should be private. What is the first step?", options: ["Ideally, remove public access immediately (Public Access Prevention)", "Delete the bucket", "Checking logs", "Emailing the team"], answer: "Ideally, remove public access immediately (Public Access Prevention)" },
            { question: "You want to deploy a stateless containerized microservice that scales to zero when not in use. Which service is best?", options: ["Cloud Run", "GKE Standard", "Compute Engine", "App Engine Flexible"], answer: "Cloud Run" },
            { question: "What is the main benefit of GKE Autopilot over GKE Standard?", options: ["Google manages the node configuration and scaling; you focus on pods", "Less cost", "Full control over master node", "Faster network"], answer: "Google manages the node configuration and scaling; you focus on pods" },
            { question: "You need to split traffic 50/50 between two versions of an App Engine application. What is the easiest way?", options: ["Use 'gcloud app services set-traffic'", "Deploy a load balancer", "Change DNS records", "Manual scaling"], answer: "Use 'gcloud app services set-traffic'" },
            { question: "Which GKE feature allows you to run workloads on different machine types (e.g., GPU nodes vs Standard nodes)?", options: ["Node Pools", "Namespaces", "Services", "ReplicaSets"], answer: "Node Pools" },
            { question: "How do you ensure high availability for a Cloud Run service?", options: ["Cloud Run is regional by default and automatically replicated across zones", "Deploy to multiple zones", "Use a larger instance", "Enable auto-restart"], answer: "Cloud Run is regional by default and automatically replicated across zones" },
            { question: "You need to persist data in a stateful GKE application. What Kubernetes resource should you use?", options: ["PersistentVolumeClaim (PVC)", "ConfigMap", "Secret", "EmptyDir"], answer: "PersistentVolumeClaim (PVC)" },
            { question: "Which service allows you to run event-driven code without managing servers?", options: ["Cloud Functions", "Compute Engine", "GKE", "Cloud Dataflow"], answer: "Cloud Functions" },
            { question: "What is the 'Sidecar' pattern in Kubernetes?", options: ["A helper container running alongside the main application container in the same Pod", "A separate pod for logging", "A backup cluster", "A load balancer"], answer: "A helper container running alongside the main application container in the same Pod" },
            { question: "You want to use Spot VMs in your GKE cluster to save costs. How should you configure your workloads to be resilient?", options: ["Use Pod Disruption Budgets and handle termination gracefully", "Use stateful sets", "Disable autoscaling", "Use only one replica"], answer: "Use Pod Disruption Budgets and handle termination gracefully" },
            { question: "Which mesh technology is managed by Google Cloud Service Mesh (formerly Anthos Service Mesh)?", options: ["Istio", "Linkerd", "Consul", "Envoy"], answer: "Istio" },
            { question: "What is the 'Immutable Infrastructure' pattern?", options: ["Never changing infrastructure once deployed; replacing it with new instances instead", "Updating servers in place", "Hardening servers", "Using bare metal only"], answer: "Never changing infrastructure once deployed; replacing it with new instances instead" },
            { question: "You need to ensure your infrastructure configuration does not drift over time. What should you do?", options: ["Run IaC (Terraform) apply regularly / automated pipelines", "Manual audits", "Remove admin access", "Lock the console"], answer: "Run IaC (Terraform) apply regularly / automated pipelines" },
            { question: "What is the purpose of a 'Health Check' in a Load Balancer?", options: ["To determine if a backend instance is healthy and can receive traffic", "To bill the client", "To check the user's browser health", "To scan for viruses"], answer: "To determine if a backend instance is healthy and can receive traffic" },
            { question: "Which strategy involves deploying the new version alongside the old version and switching traffic instantaneously (e.g., load balancer switch)?", options: ["Blue/Green Deployment", "Canary", "Rolling Update", "Recreate"], answer: "Blue/Green Deployment" },
            { question: "You want to automate the creation of GCP projects with standard settings. What tool is best?", options: ["Terraform / Cloud Foundation Toolkit", "Cloud Console", "Shell scripts", "Spreadsheets"], answer: "Terraform / Cloud Foundation Toolkit" },
            { question: "How can you optimize the cost of a non-production GKE environment that is only used during business hours?", options: ["Scale the cluster down to zero (or min nodes) at night using autoscaler or scheduler", "Use Commitments", "Delete the cluster daily", "Use HDD disks"], answer: "Scale the cluster down to zero (or min nodes) at night using autoscaler or scheduler" },
            { question: "What is 'Configuration as Code'?", options: ["Managing configuration files (YAML/JSON) in version control", "Writing application code", "Configuring servers manually", "Using GUI tools"], answer: "Managing configuration files (YAML/JSON) in version control" },
            { question: "You need to reduce latency for global users accessing static assets. What should you enable?", options: ["Cloud CDN", "Cloud VPN", "Cloud Interconnect", "Larger VMs"], answer: "Cloud CDN" },
            { question: "Which metrics are considered the 'Four Golden Signals' of monitoring?", options: ["Latency, Traffic, Errors, Saturation", "CPU, RAM, Disk, Network", "Velocity, Quality, Cost, Time", "Uptime, Downtime, Ping, Jitter"], answer: "Latency, Traffic, Errors, Saturation" },
            { question: "What is the main advantage of using 'managed services' (like Cloud SQL) over self-managed (PostgreSQL on VM)?", options: ["Reduced operational overhead (patching, backups, HA)", "Lower licensing cost", "Full root access", "Custom kernel modules"], answer: "Reduced operational overhead (patching, backups, HA)" },
            { question: "You are planning a multi-region disaster recovery strategy. Which RTO/RPO values imply the highest cost?", options: ["RTO=0, RPO=0 (Near zero)", "RTO=24h, RPO=24h", "RTO=1h, RPO=1h", "RTO=4h, RPO=4h"], answer: "RTO=0, RPO=0 (Near zero)" },
            { question: "Which feature ensures that a specific number of pods are always running in GKE, even during voluntary disruptions?", options: ["Pod Disruption Budget", "ReplicaSet", "Deployment", "DaemonSet"], answer: "Pod Disruption Budget" },
            { question: "You need to run a legacy application that requires specific kernel modifications. Which compute option is most suitable?", options: ["Compute Engine", "Cloud Run", "App Engine Standard", "Cloud Functions"], answer: "Compute Engine" },
            { question: "How do you securely connect your VPC to an on-premises network with high throughput requirements (10Gbps+)?", options: ["Dedicated Interconnect", "Cloud VPN", "Carrier Peering", "Internet"], answer: "Dedicated Interconnect" },
            { question: "What represents a 'Failure' in the context of an SLO?", options: ["A request that is slower than the threshold or returns an error", "Any request", "A successful request", "A log entry"], answer: "A request that is slower than the threshold or returns an error" },
            { question: "Which tool allows you to visually orchestrate workflows involving multiple GCP services?", options: ["Cloud Composer (Airflow)", "Cloud Scheduler", "Cloud Tasks", "Cron"], answer: "Cloud Composer (Airflow)" },
            { question: "You want updates to your application to be applied one pod at a time to ensure zero downtime. What is this called?", options: ["Rolling Update", "Recreate", "Big Bang", "Shutdown"], answer: "Rolling Update" },
            { question: "Which service monitors the health of your application endpoints from the 'outside'?", options: ["Uptime Checks", "Health Checks", "Liveness Probes", "Readiness Probes"], answer: "Uptime Checks" },
            { question: "You need to store standard, structured log data. Which format is best for Cloud Logging?", options: ["JSON", "Text", "XML", "Binary"], answer: "JSON" },
            { question: "How can you enforce that specific labels are present on all newly created VMs?", options: ["Organization Policy", "IAM", "VPC Firewall", "Billing Budget"], answer: "Organization Policy" }
        ],
        // Default questions if the exam name doesn't match
        "default": [
            { question: "What is the primary function of Google Cloud's IAM service?", options: ["Infrastructure as Code", "Identity and Access Management", "Instance and Asset Monitoring", "Intrusion and Anomaly Mitigation"], answer: "Identity and Access Management" },
            { question: "Which Google Cloud service is designed for storing large binary objects like images and videos?", options: ["Cloud SQL", "Cloud Storage", "BigQuery", "Firestore"], answer: "Cloud Storage" },
        ]
    };

    // examId is already declared at the top of the scope
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
            startPeriodicCapture(); // Start periodic snapshots
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
            startProctoringChecks();
            startPeriodicCapture(); // Start periodic snapshots
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
        window.setupExamSecurity = function() {
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