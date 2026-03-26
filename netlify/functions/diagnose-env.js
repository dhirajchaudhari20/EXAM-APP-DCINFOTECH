exports.handler = async (event) => {
    const diagnostic = {
        firebase_service_account_present: !!process.env.FIREBASE_SERVICE_ACCOUNT,
        firebase_project_id: process.env.FIREBASE_PROJECT_ID || "Not Set",
        firebase_private_key_present: !!process.env.FIREBASE_PRIVATE_KEY,
        node_env: process.env.NODE_ENV,
        method: event.httpMethod,
        timestamp: new Date().toISOString()
    };

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnostic, null, 2)
    };
};
