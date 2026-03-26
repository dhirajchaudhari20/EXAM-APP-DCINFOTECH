const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    console.log("👉 RAW event.body:", event.body);

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Missing request body" })
      };
    }

    const { amount } = JSON.parse(event.body);

    const merchantTransactionId = "TXN" + Date.now();
    const merchantId = "SU2508261900236701786125"; // Production Merchant ID
    const clientSecret = "71fc181e-ce3b-46e3-9592-71d80b8cd4a4"; // Production Secret
    const saltKeyIndex = "1"; // from dashboard

    const payload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: "USER" + Date.now(),
      amount: amount * 100, // paise
      redirectUrl: "https://dcinfotech.org.in/payment-status",
      redirectMode: "POST",
      callbackUrl: "https://dcinfotech.org.in/payment-status",
      paymentInstrument: { type: "PAY_PAGE" }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    const checksum = crypto
      .createHash("sha256")
      .update(base64Payload + "/pg/v1/pay" + clientSecret)
      .digest("hex");

    const xVerify = checksum + "###" + saltKeyIndex;

    const response = await fetch("https://api.phonepe.com/apis/pg/v1/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantId
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
