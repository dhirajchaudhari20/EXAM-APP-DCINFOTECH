const axios = require('axios');
const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');
const fs = require('fs');

// Dialogflow Client Setup
const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'dc-info-tech-490912';
const sessionId = 'whatsapp-session-' + Date.now();
const languageCode = 'en-US';

// Check for service account key file
const keyFilePath = path.join(process.cwd(), 'dialogflow-key.json');
let sessionClient;

try {
  if (fs.existsSync(keyFilePath)) {
    sessionClient = new dialogflow.SessionsClient({
      keyFilename: keyFilePath,
    });
  } else if (process.env.DIALOGFLOW_PRIVATE_KEY) {
    // Alternatively, load from environment variables if the file is not present
    sessionClient = new dialogflow.SessionsClient({
      credentials: {
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  } else {
    console.warn('Dialogflow session client not initialized: Missing key file or environment variables.');
  }
} catch (error) {
  console.error('Error initializing Dialogflow client:', error);
}

exports.handler = async (event, context) => {
  // Webhook verification (GET request from Meta)
  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters['hub.mode'];
    const token = event.queryStringParameters['hub.verify_token'];
    const challenge = event.queryStringParameters['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK_VERIFIED');
        return {
          statusCode: 200,
          body: challenge,
        };
      } else {
        return {
          statusCode: 403,
          body: 'Verification failed',
        };
      }
    }
  }

  // Handle incoming messages (POST request from Meta)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);

      // Log the incoming message for debugging
      console.log('Incoming WhatsApp message:', JSON.stringify(body, null, 2));

      // Check if it's a message from WhatsApp
      const changes = body.entry?.[0]?.changes?.[0]?.value;
      if (body.object === 'whatsapp_business_account' && changes?.messages?.[0]) {
        const message = changes.messages[0];
        const from = message.from; // Sender's phone number
        const text = message.text?.body; // Message content
        const phoneId = changes.metadata.phone_number_id;

        if (text && sessionClient) {
          console.log(`Message from ${from}: ${text}`);

          // 1. Send to Dialogflow
          const sessionPath = sessionClient.projectAgentSessionPath(projectId, from); // Use sender phone as session ID
          const request = {
            session: sessionPath,
            queryInput: {
              text: {
                text: text,
                languageCode: languageCode,
              },
            },
          };

          const responses = await sessionClient.detectIntent(request);
          const result = responses[0].queryResult;
          const fulfillmentText = result.fulfillmentText;

          console.log(`Dialogflow response: ${fulfillmentText}`);

          // 2. Send back to WhatsApp
          const whatsappToken = process.env.WHATSAPP_TOKEN;
          if (whatsappToken && phoneId) {
            await axios({
              method: 'POST',
              url: `https://graph.facebook.com/v17.0/${phoneId}/messages`,
              data: {
                messaging_product: 'whatsapp',
                to: from,
                text: { body: fulfillmentText },
              },
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${whatsappToken}`,
              },
            });
            console.log('Message sent back to WhatsApp');
          } else {
            console.error('WHATSAPP_TOKEN or phone_number_id is missing');
          }
        } else if (!sessionClient) {
          console.error('Dialogflow session client not initialized');
        }
      }

      return {
        statusCode: 200,
        body: 'SUCCESS',
      };
    } catch (error) {
      console.error('Error handling WhatsApp message:', error.response?.data || error.message);
      return {
        statusCode: 200, // Always return 200 to WhatsApp to avoid retries, but log the error
        body: 'Handled with Error',
      };
    }
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
