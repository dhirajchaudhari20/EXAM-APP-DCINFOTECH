/**
 * interview.js
 * Handles the AI Mock Interviewer chat logic.
 */

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const typingIndicator = document.getElementById('typingIndicator');

// Mock Interview Questions Database
const questions = {
    'engineer': [
        "Great! Let's start with Associate Cloud Engineer questions. Can you explain the difference between a Zone and a Region in Google Cloud?",
        "Good. Now, how would you choose between Google Compute Engine and Google Kubernetes Engine for a microservices application?",
        "What is the purpose of an IAM Service Account?",
        "Explain the difference between Standard and Nearline Storage classes in Cloud Storage."
    ],
    'architect': [
        "Excellent. For a Professional Cloud Architect, tell me: How do you design for high availability in a multi-region deployment?",
        "What are the key considerations when migrating a legacy monolithic application to the cloud?",
        "Explain the concept of 'Least Privilege' in IAM and how you implement it.",
        "Compare Cloud Spanner and Cloud SQL. When would you use one over the other?"
    ],
    'devops': [
        "Awesome. DevOps focus. What is the difference between Terraform and Deployment Manager?",
        "How do you implement a CI/CD pipeline using Cloud Build?",
        "Explain the concept of 'Immutable Infrastructure'.",
        "How do you monitor and log applications in GKE?"
    ],
    'default': [
        "I can ask you general cloud questions. What is Cloud Computing?",
        "What are the three main service models in cloud computing?",
        "Explain the shared responsibility model."
    ]
};

let currentRole = null;
let questionIndex = 0;
let isInterviewActive = false;

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    userInput.value = '';

    // Simulate AI Response
    showTyping();

    setTimeout(() => {
        hideTyping();
        processUserResponse(text);
    }, 1500);
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

function processUserResponse(text) {
    const lowerText = text.toLowerCase();

    if (!isInterviewActive) {
        // Role Selection Phase
        if (lowerText.includes('engineer') || lowerText.includes('ace')) {
            currentRole = 'engineer';
            isInterviewActive = true;
            addMessage(questions[currentRole][0], 'ai');
        } else if (lowerText.includes('architect') || lowerText.includes('pca')) {
            currentRole = 'architect';
            isInterviewActive = true;
            addMessage(questions[currentRole][0], 'ai');
        } else if (lowerText.includes('devops')) {
            currentRole = 'devops';
            isInterviewActive = true;
            addMessage(questions[currentRole][0], 'ai');
        } else {
            addMessage("I didn't catch that role. Please choose: Cloud Engineer, Architect, or DevOps.", 'ai');
        }
    } else {
        // Interview Phase
        // Simple feedback simulation
        const feedback = generateFeedback(text);
        addMessage(feedback, 'ai');

        // Next Question
        questionIndex++;
        if (currentRole && questions[currentRole][questionIndex]) {
            setTimeout(() => {
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    addMessage(questions[currentRole][questionIndex], 'ai');
                }, 1000);
            }, 1000);
        } else {
            setTimeout(() => {
                addMessage("That concludes our mock interview session! You did great. Keep practicing!", 'ai');
                isInterviewActive = false;
                questionIndex = 0;
                currentRole = null;
            }, 1000);
        }
    }
}

function generateFeedback(text) {
    const positivePhrases = [
        "That's a solid answer.",
        "Good point.",
        "You're on the right track.",
        "Correct.",
        "Excellent explanation."
    ];

    const constructivePhrases = [
        "Interesting perspective. Also consider...",
        "Make sure to mention...",
        "Don't forget about...",
        "You could also add..."
    ];

    // Randomly choose feedback type
    const isPositive = Math.random() > 0.3;
    const phrase = isPositive
        ? positivePhrases[Math.floor(Math.random() * positivePhrases.length)]
        : constructivePhrases[Math.floor(Math.random() * constructivePhrases.length)];

    return phrase;
}
