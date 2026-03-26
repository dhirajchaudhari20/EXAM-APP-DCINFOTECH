const audioManager = require('./audio-manager');

// Simple State Machine for the conversation
class Brain {
    constructor() {
        this.step = 0;
        this.interns = {}; // Track interns seen

        // Listen to audio events
        audioManager.onSpeechDetected = (text) => this.handleSpeech(text);
    }

    async handleSpeech(text) {
        console.log(`[Brain] Heard: "${text}"`);

        // Simple keyword matching for demo
        if (text.toLowerCase().includes("updated") || text.toLowerCase().includes("completed")) {
            await audioManager.speak("That sounds great. Did you face any challenges?");
        } else if (text.toLowerCase().includes("challenge") || text.toLowerCase().includes("blocker")) {
            await audioManager.speak("I see. Do you need any help from the seniors?");
        } else {
            // Generic acknowledgment
            await audioManager.speak("Got it. Please continue.");
        }
    }

    // Function to trigger the agent to introduce itself
    async introduce() {
        await audioManager.speak("Hello everyone. I am the AI Agent. I am here to collect your weekly updates. Who wants to go first?");
    }
}

module.exports = new Brain();
