# Google Meet AI Agent

This directory contains the code for a Headless AI Agent that can join Google Meet calls, listen to audio, and speak response.

## Prerequisites
- Docker (for deployment)
- Node.js (for local testing)
- Google Cloud Project with Speech-to-Text and Text-to-Speech APIs enabled.
- Service Account Key (JSON) for GCP.

## Setup
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file:
    ```env
    GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
    OPENAI_API_KEY=your_key (optional if using OpenAI)
    MEET_URL=https://meet.google.com/abc-defg-hij
    ```

## Running Locally (Testing)
To run without Docker (requires Chrome installed):
```bash
HEADLESS=false node bot.js "https://meet.google.com/abc-defg-hij"
```

## Running on Google Cloud (Docker)
1.  **Build the Image**:
    ```bash
    docker build -t meet-agent .
    ```
2.  **Run Container**:
    ```bash
    docker run -e MEET_URL="https://meet.google.com/abc-defg-hij" meet-agent
    ```

## Troubleshooting
-   **Join Issues**: If the bot gets stuck at "Ask to join", it might be blocked by Google's anti-bot detection. Try logging in with a cookie file (advanced).
-   **Audio**: If the bot is silent, check PulseAudio configuration in the Dockerfile.
