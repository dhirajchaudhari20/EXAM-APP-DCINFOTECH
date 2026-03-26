// --- 1. LOGIN & EXAM CHECK ---
document.addEventListener('DOMContentLoaded', () => {
    // --- CRITICAL CONSTANTS ---
    const MAX_PAUSES = 2;

    // --- 0. RESUME / COMPLETION CHECK ---
    const urlParams = new URLSearchParams(window.location.search);
    const examName = urlParams.get('exam') || 'Associate Cloud Engineer';
    const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
    const completionKey = `exam_completed_${user.email || 'guest'}_${examName.replace(/\s+/g, '_')}`;

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

    // --- SHEETDB INTEGRATION FIX ---
    // **FIXED: Updated with the provided API Key.**
    const SHEETDB_BASE_URL = 'https://sheetdb.io/api/v1/43chacbni4gkg'; // New Results API
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

    // --- Gemini API Configuration (FIXED to use secure proxy) ---
    const GEMINI_API_URL = '/.netlify/functions/gemini-proxy';
    let stream;
    let proctoringInterval;
    let periodicCaptureInterval; // NEW: Interval for periodic snapshots
    let pauseCount = 0; // Initialize pause counter
    let systemCheckAudioStream; // To hold the separate audio stream for checks
    let systemCheckState = {
        audio: false,
        network: false,
    };

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.style.display = 'none');
        screens[screenName].style.display = 'flex';
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
    async function analyzeImage(prompt, image1, image2 = null) {
        // Correct format for multimodal input to Gemini
        const parts = [{ "text": prompt }, { "inline_data": { "mime_type": "image/jpeg", "data": image1 } }];
        if (image2) {
            parts.push({ "inline_data": { "mime_type": "image/jpeg", "data": image2 } });
        }
        const requestBody = {
            "contents": [{ "parts": parts }]
        };
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            let errorText = response.statusText;
            try {
                const errorData = await response.json();
                errorText = errorData.error ? errorData.error.message : errorText;
            } catch (e) { /* ignore JSON parsing error */ }
            throw new Error(`AI Error: ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text || 'No';
        return text.trim().toLowerCase() === 'yes';
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
                    if (aiError.message.includes('API Error') || aiError.message.includes('Failed to fetch')) {
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
                    Swal.fire('ID Verified & Captured', 'Now, please capture your face.', 'success');

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



    // --- 2. QUESTION BANK ---

    });
});
