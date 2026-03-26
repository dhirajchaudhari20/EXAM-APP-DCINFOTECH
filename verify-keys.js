const Razorpay = require('razorpay');

const key_id = 'rzp_live_RkROfYAA7NzM3X';
const key_secret = 'Wt4g7dYT3zJxHx4z6l6UBei1';

console.log(`Testing Keys: ID=${key_id}, Secret=${key_secret}`);

const instance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});

async function verify() {
    try {
        const options = {
            amount: 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        const order = await instance.orders.create(options);
        console.log("SUCCESS! Order Created:", order);
    } catch (error) {
        console.error("FAILURE! Error:", error);
    }
}

verify();
