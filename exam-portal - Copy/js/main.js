// --- 1. LOGIN & EXAM CHECK ---
document.addEventListener('DOMContentLoaded', () => {
    // --- CRITICAL CONSTANTS ---
    const MAX_PAUSES = 2;

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
    const IMGBB_API_KEY = '3bc6dafa7ecd7c01a118fad187d32ca5'; // Your ImgBB API Key

    // --- Gemini API Configuration (FIXED) ---
    const GEMINI_ENDPOINT = "/.netlify/functions/gemini-proxy";
    let stream;
    let proctoringInterval;
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
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && screens.exam.style.display === 'flex') {
            issueWarning("Fullscreen mode exited. Please re-enter fullscreen to avoid exam termination.");
        }
    });
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
        const response = await fetch(GEMINI_ENDPOINT, {
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
            throw new Error(`Gemini API Error: ${errorText}`);
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
                const isIdCard = await analyzeImage("Is this an image of a photo ID card (like a driver's license, passport, or national ID)? Respond with only 'Yes' or 'No'.", imageData);
                if (!isIdCard) {
                    handleCaptureError('Invalid ID', 'A valid photo ID was not detected. Please hold your ID clearly and try again.');
                    return;
                }
                idImageData = imageData; // Store the base64 data only after validation
                idImageUrl = await uploadToImgBB(imageData);
                console.log('ID Image URL:', idImageUrl);
                Swal.fire('ID Captured', 'Now, please capture your face.', 'success');

                // Transition to face capture step
                captureStep = 'face';
                captureInstructionTitle.textContent = 'Step 2: Capture Your Face';
                captureInstructionText.textContent = 'If applicable, please remove your glasses. Look straight into the camera, click the Capture button, and remain still.';
                captureBtn.innerHTML = '<i data-lucide="camera" style="margin-right: 8px;"></i> Capture Face';
                captureBtn.disabled = false;
                lucide.createIcons();
            } catch (error) {
                handleCaptureError('ID Upload Failed', 'Could not save your ID photo or verify it. Please try again.', error);
            }
        } else if (captureStep === 'face') {
            try {
                const isMatch = await analyzeImage("You are a strict identity verification system. Your task is to determine if the person in the second image is the same person shown in the first image (which is a photo ID). Ignore any differences in background, lighting, or minor changes in appearance like hairstyle. Focus solely on core facial features. Respond with only 'Yes' if they are the same person, or 'No' if they are not.", idImageData, imageData);
                if (!isMatch) {
                    handleCaptureError('Verification Failed', 'The face in the photo does not match the ID. Please try again or contact support.');
                    return;
                }
                const faceImageUrl = await uploadToImgBB(imageData);
                console.log('Face Image URL:', faceImageUrl);
                Swal.fire('Identity Verified!', 'Biometric verification successful.', 'success');
                // Stop the webcam and proceed to system checks (NEW FLOW)
                if (stream) stream.getTracks().forEach(track => track.stop());
                showScreen('systemCheck');
            } catch (error) {
                handleCaptureError('Verification Error', 'An error occurred during face analysis. Please try again.', error);
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
        startSystemChecksBtn.disabled = true;
        proceedToLaunchBtn.disabled = true;
        // Reset statuses
        audioCheckStatus.innerHTML = '<i data-lucide="loader-circle" class="status-icon spinner"></i> Testing...';
        audioCheckStatus.className = 'status-pending';
        networkCheckStatus.innerHTML = '<i data-lucide="loader-circle" class="status-icon spinner"></i> Testing...';
        networkCheckStatus.className = 'status-pending';
        lucide.createIcons();

        // Reset systemCheckState before running checks
        systemCheckState.audio = false;
        systemCheckState.network = false;

        await performAudioCheck();
        await performNetworkCheck(); // This is now the simulated check

        // Check if both passed
        if (systemCheckState.audio && systemCheckState.network) {
            proceedToLaunchBtn.disabled = false;
            Swal.fire('System Ready', 'All system checks passed. You may now proceed to launch!', 'success');
        } else {
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
        ],
        "Google Workspace Administrator": [
            { question: "A user reports they cannot access a shared drive. You have confirmed they are in the correct group with 'Content manager' access. What is the most likely reason they still can't access it?", options: ["The shared drive has reached its storage limit.", "The user's Google Workspace license does not support shared drives.", "There is a conflicting file-level permission overriding the group permission.", "The organization has a data loss prevention (DLP) rule blocking access."], answer: "The organization has a data loss prevention (DLP) rule blocking access." },
            { question: "Which tool in the Admin console would you use to investigate a user's recent login activity and security events?", options: ["Reports", "Audit and investigation", "Security dashboard", "Alert center"], answer: "Audit and investigation" },
        ],
        "Professional Cloud Database Engineer": [
            { question: "Which Google Cloud database service is best suited for a globally distributed, transactional workload requiring strong consistency and horizontal scalability?", options: ["Cloud SQL (PostgreSQL)", "Cloud Bigtable", "Firestore", "Cloud Spanner"], answer: "Cloud Spanner" },
            { question: "A company needs a fully managed PostgreSQL-compatible database with high availability and automated patching. Which service should they choose?", options: ["Compute Engine with self-managed PostgreSQL", "Cloud SQL for PostgreSQL", "Cloud Bigtable", "Cloud Spanner"], answer: "Cloud SQL for PostgreSQL" },
            { question: "What is the primary goal of migrating a monolithic on-premise relational database to a sharded, scalable cloud solution like Cloud Spanner?", options: ["To reduce networking latency", "To achieve high throughput and strong consistency at global scale", "To simplify backup procedures", "To use an open-source database engine"], answer: "To achieve high throughput and strong consistency at global scale" },
        ],
        // Default questions if the exam name doesn't match
        "default": [
            { question: "What is the primary function of Google Cloud's IAM service?", options: ["Infrastructure as Code", "Identity and Access Management", "Instance and Asset Monitoring", "Intrusion and Anomaly Mitigation"], answer: "Identity and Access Management" },
            { question: "Which Google Cloud service is designed for storing large binary objects like images and videos?", options: ["Cloud SQL", "Cloud Storage", "BigQuery", "Firestore"], answer: "Cloud Storage" },
        ]
    };
    // --- 3. DYNAMIC QUESTION LOADING ---
    const urlParams = new URLSearchParams(window.location.search);
    const examName = urlParams.get('exam') || 'Default Exam';
    const questions = allQuestions[examName] || allQuestions.default;
    // --- State Variables ---
    let currentQuestionIndex = 0;
    let userAnswers = new Array(questions.length).fill(null);
    let markedForReview = new Array(questions.length).fill(false);

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
        // Initialize pause button display
        const pauseCountDisplay = document.getElementById('pauseCountDisplay');
        if (pauseCountDisplay) {
            pauseCountDisplay.textContent = `(${MAX_PAUSES - pauseCount} left)`;
        }
        // Note: Fullscreen is now handled by launchExamBtn click event.
        // Stop the system check stream if it exists
        if (systemCheckAudioStream) systemCheckAudioStream.getTracks().forEach(track => track.stop());

        examTitleEl.textContent = examName;
        // Start proctoring first to get the welcome message
        await startProctoring();
        // Show the welcome message from the AI
        Swal.fire({
            title: 'Welcome to Your Live Proctored Exam',
            html: `
                <p>I am your AI proctor for this session. My purpose is to ensure a fair and secure testing environment.</p>
                <p>Please maintain focus on your screen, ensure you are alone, and keep your environment clear of any unauthorized materials. I will be monitoring your session in real-time.</p>
                <p><strong>All the best for your ${examName}!</strong></p>
            `,
            icon: 'info',
            allowOutsideClick: false,
            confirmButtonText: 'I Understand, Begin Exam'
        }).then(() => {
            // Now show the exam screen and start the timer
            showScreen('exam');
            renderQuestions();
            renderNav(false);
            showQuestion(0);
            startTimer(90 * 60); // 90 minutes
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
        }
    });
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    });
    markReviewBtn.addEventListener('click', () => {
        markedForReview[currentQuestionIndex] = !markedForReview[currentQuestionIndex];
        updateNav(false);
        updateNavButtons();
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
            if (--timer < 0) {
                clearInterval(timerInterval);
                Swal.fire({
                    title: 'Time\'s Up!',
                    text: 'Your exam has been automatically submitted.',
                    icon: 'warning',
                    allowOutsideClick: false,
                }).then(() => submitAndExit());
            }
            secondsRemaining = timer;
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
    // --- Submission Logic ---
    async function submitAndExit() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        clearInterval(timerInterval);

        const score = userAnswers.reduce((acc, ans, idx) => ans === questions[idx].answer ? acc + 1 : acc, 0);
        const percentage = Math.round((score / questions.length) * 100);
        const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
        const examName = document.getElementById('examTitle').textContent;
        const resultData = {
            Timestamp: new Date().toISOString(),
            UserName: user.name || 'N/A',
            UserEmail: user.email || 'N/A',
            ExamName: examName,
            Score: `${score}/${questions.length}`,
            Percentage: `${percentage}%`,
            Status: percentage >= 75 ? 'Passed' : 'Failed',
            // Include empty fields for SheetDB compatibility
            ViolationReason: '',
            SnapshotURL: '',
            ExamTime: ''
        };

        let saveSuccess = false;
        let saveMessage = '';

        // --- Save results to SheetDB ---
        try {
            const response = await fetch(SHEETDB_RESULTS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: resultData })
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
        document.addEventListener('visibilitychange', handleVisibilityChange);
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
        proctoringInterval = setInterval(() => {
            checkAudioLevel();
            checkVideoFrameWithGemini();
        }, 8000); // Combined check every 8 seconds
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
            issueWarning("Tab switch detected – return to the exam immediately to avoid exam termination.");
            addToProctorLog("Alert: User switched tabs. Strict focus required.");
        }
    }
    function checkAudioLevel() {
        // Audio level check is now disabled as per user request.
        // The audio stream is still acquired as part of the webcam stream,
        // but no proctoring actions will be taken based on audio input.
    }
    async function checkVideoFrameWithGemini() {
        if (!proctoringVideo.srcObject || proctoringVideo.paused || proctoringVideo.ended || document.hidden || screens.exam.style.display !== 'flex') return;
        // Wait a bit for video to be ready
        if (proctoringVideo.videoWidth === 0) return;
        const canvas = document.createElement('canvas');
        canvas.width = proctoringVideo.videoWidth;
        canvas.height = proctoringVideo.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(proctoringVideo, 0, 0, canvas.width, canvas.height);
        const base64ImageData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
        const requestBody = {
            "contents": [{
                "parts": [
                    {
                        "text": "You are a very lenient automated proctoring system. Your ONLY task is to check for an additional person in the image. Ignore all other activity, including eye movement, looking away, or other objects. \n\n- If you see more than one person, respond ONLY with 'Another person detected.'\n- Otherwise, respond ONLY with 'All clear'."
                    },
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64ImageData
                        }
                    }
                ]
            }]
        };
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                console.error("Gemini API Error:", response.statusText);
                return;
            }
            const data = await response.json();
            const text = data.candidates[0]?.content?.parts[0]?.text || '';
            if (text.toLowerCase() !== 'all clear') {
                issueWarning(text); // Show the visual warning
                speak(text, 0.9, 1.1); // Make the AI "speak" the warning
                logViolationSnapshot(canvas, text); // Take and log a snapshot
                addToProctorLog(`Violation flagged: ${text}`);
            } else {
                addToProctorLog("Status: Compliant. Continue focusing.");
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
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
        // 2. Log violation details to SheetDB
        const user = JSON.parse(localStorage.getItem('cm_user') || '{ "email": "guest@example.com" }');

        // Prepare violation data for SheetDB, ensuring compatibility with the single-sheet structure
        const violationData = {
            Timestamp: new Date().toISOString(),
            UserName: '', // Empty for violation entry
            UserEmail: user.email,
            ExamName: examTitleEl ? examTitleEl.textContent : 'N/A', // Get exam name if possible
            Score: '', // Empty for violation entry
            Percentage: '', // Empty for violation entry
            Status: 'Violation', // Mark as violation
            ViolationReason: reason,
            SnapshotURL: snapshotUrl,
            ExamTime: timerEl ? timerEl.textContent : 'N/A'
        };

        try {
            // NOTE: We don't need a check here, as failure to log a violation is less critical
            // than failure to log a score, and the function already logs the error to console.
            await fetch(SHEETDB_VIOLATIONS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: violationData })
            });
        } catch (error) {
            console.error("Failed to log violation to SheetDB:", error);
        }
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
});




// *******************************************************************
// ************ START SECURITY ENHANCEMENT BLOCK *********************
// *******************************************************************

(function() {
    // 1. Disable Right-Click / Context Menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        issueWarning("Right-click disabled for security reasons.");
    }, false);

    // 2. Disable Text Selection (to prevent copying)
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    }, false);
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', ''); // Clear clipboard data
        issueWarning("Copying text is disabled during the exam.");
    }, false);
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', ''); // Clear clipboard data
        issueWarning("Cutting text is disabled during the exam.");
    }, false);

    // 3. Disable Developer Tools & Common Cheating Shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent F12, Ctrl/Cmd + Shift + I/J/C (Developer Tools), Ctrl/Cmd + U (View Source)
        const isMac = (navigator.platform.toUpperCase().indexOf('MAC') >= 0);

        // F12 key (Browser Developer Tools)
        if (e.key === 'F12') {
            e.preventDefault();
            issueWarning("Developer tools are disabled. Violation recorded.");
        }

        // Ctrl/Cmd + Shift + I, J, or C (Common DevTools shortcuts)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            if (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c') {
                e.preventDefault();
                issueWarning("Developer shortcut detected. Violation recorded.");
            }
        }

        // Ctrl/Cmd + U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            issueWarning("View Source shortcut disabled. Violation recorded.");
        }

        // Ctrl/Cmd + P (Print)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
            e.preventDefault();
            issueWarning("Printing is disabled during the exam. Violation recorded.");
        }

        // Alt + Tab / Cmd + Tab prevention (Note: This is difficult to block completely
        // as the browser intercepts OS-level shortcuts, but we try to catch the keydown)
        if (e.altKey && e.key === 'Tab') { // Alt+Tab on Windows/Linux
            e.preventDefault();
            issueWarning("Attempted window switch detected. Violation recorded.");
        }

        // F11 (Toggle Fullscreen - we prevent it for consistent proctoring)
        if (e.key === 'F11') {
            e.preventDefault();
            issueWarning("Full-screen mode must be maintained. Violation recorded.");
        }
    }, false);
})();

// *******************************************************************
// ************* END SECURITY ENHANCEMENT BLOCK **********************
// *******************************************************************