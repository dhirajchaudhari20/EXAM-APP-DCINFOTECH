const reports = []; // In-memory storage (volatile)

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const { message, internData, step } = body;

        // Simple State Machine for the "AI" Agent
        let reply = "";
        let nextStep = step;
        let complete = false;

        // Mock "AI" Logic
        switch (step) {
            case 0:
                reply = "That's great! Can you tell me a bit more about what you worked on specifically?";
                nextStep = 1;
                break;
            case 1:
                reply = "Interesting! Did you face any technical challenges or blockers while working on that?";
                nextStep = 2;
                break;
            case 2:
                reply = "I see. And on a scale of 1 to 5, how satisfied are you with your progress this week?";
                nextStep = 3;
                break;
            case 3:
                reply = "Thanks for the feedback! Your report has been submitted successfully. Have a great weekend!";
                nextStep = 4;
                complete = true;

                // Store the "report" (simulated persistence)
                // In a real app, save to Database (Firebase/Mongo) here.
                console.log("Saving Report:", { internData, message });

                // We'll push to a global mock storage which might persist if the container is hot
                // But for reliable storage, need a DB.
                require('./store').addReport({
                    timestamp: new Date().toISOString(),
                    internName: internData.name,
                    internEmail: internData.email,
                    summary: message, // Simplification: using the last message as summary
                    conversation: [] // detailed conversation could be passed
                });
                break;
            default:
                reply = "Feedback already submitted.";
                complete = true;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply, nextStep, complete }),
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
