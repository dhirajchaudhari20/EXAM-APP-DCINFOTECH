// meeting.js - WebRTC & AI Logic

// 1. Firebase & Config Setup
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

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 2. DOM Elements
const localVideo = document.getElementById('localVideo');
const videoGrid = document.getElementById('videoGrid');
const aiContent = document.getElementById('aiContent');

// 3. WebRTC Config
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Public Google STUN server
    ]
};

let localStream;
let peerConnection;
let roomId;
let isAudioEnabled = true;
let isVideoEnabled = true;

// 4. Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Get Room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('room');

    if (!roomId) {
        alert("No Room ID specified. Redirecting to schedule.");
        window.location.href = 'schedule.html';
        return;
    }

    // Get User info (optional, for display)
    const user = JSON.parse(localStorage.getItem('cloudUser')) || { name: 'Guest' };

    await startLocalStream();
    initAI();

    // Initialize Firebase references
    // For simplicity in this demo, we'll implement a basic "join" logic
    // We would need a more robust signaling server for multi-party, 
    // but for 1:1 or small groups, RTDB works.

    // Using a simplistic presence check to decide if we are "offerer" or "answerer"
    // In a real app, use Cloud Functions or a dedicated signal server.
    const roomRef = firebase.database().ref(`rooms/${roomId}`);

    // Check if room exists
    roomRef.once('value', async (snapshot) => {
        if (snapshot.exists()) {
            console.log("Room exists, joining as answerer...");
            // If room exists, we are the second participant (simplified)
            createPeerConnection();
            // Listen for offer
            // In a real customized solution, we'd listen for 'participants' added
        } else {
            console.log("Creating room as offerer...");
            createPeerConnection();
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // Save offer to Firebase
            roomRef.set({
                offer: {
                    type: offer.type,
                    sdp: offer.sdp
                }
            });
        }
    });

    // Signaling Listeners (Simplified)
    // We need to listen for 'answer' if we are offerer
    // We need to listen for 'offer' if we are answerer
    // ICE candidates need to be exchanged
});

async function startLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        updateControlsUI();
    } catch (err) {
        console.error("Error accessing media devices:", err);
        Notiflix.Notify.failure("Could not access camera/microphone");
    }
}

function createPeerConnection() {
    peerConnection = new RTCPeerConnection(rtcConfig);

    // Add local tracks
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        console.log("Received remote track");
        // Check if remote video container exists
        let remoteVideo = document.getElementById('remoteVideo');
        if (!remoteVideo) {
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';
            wrapper.innerHTML = `
                <video id="remoteVideo" autoplay playsinline></video>
                <div class="participant-name">Peer</div>
            `;
            videoGrid.appendChild(wrapper);
            remoteVideo = document.getElementById('remoteVideo');
        }
        remoteVideo.srcObject = event.streams[0];
    };

    // ICE Candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // Send candidate to Firebase
            // firebase.database().ref(`rooms/${roomId}/candidates`).push(event.candidate.toJSON());
        }
    };
}

// 5. Controls Logic
function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    localStream.getAudioTracks()[0].enabled = isAudioEnabled;
    updateControlsUI();
}

function toggleVideo() {
    isVideoEnabled = !isVideoEnabled;
    localVideo.srcObject.getVideoTracks()[0].enabled = isVideoEnabled;
    updateControlsUI();
}

function updateControlsUI() {
    const btnAudio = document.getElementById('btnAudio');
    const btnVideo = document.getElementById('btnVideo');

    if (isAudioEnabled) {
        btnAudio.innerHTML = '<i class="fas fa-microphone"></i>';
        btnAudio.classList.remove('danger');
    } else {
        btnAudio.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        btnAudio.classList.add('danger');
    }

    if (isVideoEnabled) {
        btnVideo.innerHTML = '<i class="fas fa-video"></i>';
        btnVideo.classList.remove('danger');
    } else {
        btnVideo.innerHTML = '<i class="fas fa-video-slash"></i>';
        btnVideo.classList.add('danger');
    }
}

function endCall() {
    window.location.href = 'schedule.html';
}

function shareScreen() {
    // Basic screen share implementation
    navigator.mediaDevices.getDisplayMedia({ video: true }).then(stream => {
        const screenTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(screenTrack);

        screenTrack.onended = () => {
            sender.replaceTrack(localStream.getVideoTracks()[0]);
        };
    }).catch(err => console.log("Screen share cancelled", err));
}


// 6. AI Assistant Logic (Speech to Text)
function initAI() {
    if (!('webkitSpeechRecognition' in window)) {
        console.log("Web Speech API not supported");
        addAINote("System", "AI Assistant not supported in this browser (Use Chrome).");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        document.getElementById('recordingStatus').style.display = 'flex';
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript) {
            processTranscript(finalTranscript);
        }
    };

    recognition.onerror = (event) => {
        console.error("AI Speech Error", event.error);
    };

    recognition.onend = () => {
        // Auto-restart if it stops unexpectedly
        recognition.start();
    };

    recognition.start();
}

function processTranscript(text) {
    // 1. Display raw text (optional, or just log)
    // console.log("Transcript:", text);

    // 2. Analyze for actionable keywords
    const keywords = ["i will", "we need to", "action item", "follow up", "next step", "schedule", "deadline", "remind me"];
    const lowerText = text.toLowerCase();

    const isActionItem = keywords.some(kw => lowerText.includes(kw));

    if (isActionItem) {
        // Identify speaker (mock for now, would be based on audio stream source in future)
        const speaker = "Speaker";

        // Save to UI
        addAINote(speaker, text);

        // Save to Firebase
        saveToFirebase(text);
    }
}

function addAINote(speaker, text) {
    const div = document.createElement('div');
    div.className = 'ai-note';
    div.innerHTML = `<strong>${speaker}</strong> ${text}`;
    aiContent.appendChild(div);
    aiContent.scrollTop = aiContent.scrollHeight; // Auto-scroll
}

function saveToFirebase(note) {
    const notesRef = firebase.database().ref(`meeting_notes/${roomId}`);
    notesRef.push({
        text: note,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        author: "Detected by AI"
    });
}
