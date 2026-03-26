const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body);

    const merchantTransactionId = "TXN" + Date.now();
    const merchantId = "SU2508261900236701786125"; // ✅ Production Merchant ID
    const clientSecret = "71fc181e-ce3b-46e3-9592-71d80b8cd4a4"; // ✅ Production Client Secret
    const saltKeyIndex = "1"; // from PhonePe dashboard

    // Convert rupees → paise (₹1000 => 100000)
    const totalAmount = amount * 100;

    // Build request payload
    const payload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: "USER" + Date.now(),
      amount: totalAmount,
      redirectUrl: "https://dcinfotech.org.in/payment-status?txnId=" + merchantTransactionId,
      redirectMode: "POST",
      callbackUrl: "https://dcinfotech.org.in/payment-status?txnId=" + merchantTransactionId,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // Encode to base64
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    // ✅ Sign using `/pg/v1/pay` + secret
    const checksum = crypto
      .createHash("sha256")
      .update(base64Payload + "/pg/v1/pay" + clientSecret)
      .digest("hex");

    const xVerify = checksum + "###" + saltKeyIndex;

    // Call PhonePe production endpoint
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

    // Return result to frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: result.success,
        data: result.data,
        merchantTransactionId
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
