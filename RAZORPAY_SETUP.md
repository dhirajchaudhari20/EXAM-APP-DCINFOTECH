# Razorpay Orders API Integration Setup

## Overview
This implementation uses Razorpay's Orders API to prevent automatic payment refunds. The Orders API ensures proper payment capture by creating an order before initiating payment.

## What Was Changed

### 1. Serverless Functions Created
- **`netlify/functions/razorpay-create-order.js`**: Creates a Razorpay order before payment
- **`netlify/functions/razorpay-verify-payment.js`**: Verifies payment signature after successful payment

### 2. Frontend Updated
- **`dc-infotech-launchpad-form/index-2.html`**: Updated payment flow to use Orders API

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd /Users/dhirajchaudhari/Downloads/DC Cloud Solutions-office
npm install razorpay
```

### Step 2: Configure Environment Variables

#### For Local Development:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Razorpay credentials to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_Rh9DT3zh89pYq8
   RAZORPAY_KEY_SECRET=your_secret_key_here
   ```

#### For Netlify Production:
1. Go to your Netlify dashboard
2. Navigate to: Site Settings → Environment Variables
3. Add the following variables:
   - `RAZORPAY_KEY_ID` = `rzp_live_Rh9DT3zh89pYq8`
   - `RAZORPAY_KEY_SECRET` = Your Razorpay secret key

### Step 3: Update Auto-Capture Settings (Optional)

As per Razorpay support, you can also configure auto-capture settings:

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to: Account & Settings → Capture and Refund Settings
3. Click "Change" next to Automatic Capture
4. Select your desired capture time (e.g., 3 days)
5. Choose Capture Speed option (e.g., Normal Speed)
6. Click Save

## How It Works

### New Payment Flow:
1. **User submits form** → Frontend validates input
2. **Create Order** → Call `/.netlify/functions/razorpay-create-order` to create a Razorpay order
3. **Open Razorpay Checkout** → Pass `order_id` to Razorpay checkout
4. **User completes payment** → Razorpay processes payment
5. **Verify Payment** → Call `/.netlify/functions/razorpay-verify-payment` to verify signature
6. **Save Data** → Only after verification, save form data to SheetDB

### Key Improvements:
- ✅ **Prevents auto-refunds**: Orders API ensures proper payment capture
- ✅ **Payment verification**: Server-side signature verification prevents fraud
- ✅ **Better error handling**: Clear error messages at each step
- ✅ **Data integrity**: Form data only saved after payment verification

## Testing

### Local Testing:
```bash
netlify dev
```

Then open: `http://localhost:8888/dc-infotech-launchpad-form/index-2.html`

### Production Testing:
After deploying to Netlify, test with a small amount to verify the complete flow.

## Troubleshooting

### Issue: "Failed to create order"
- Check that environment variables are set correctly in Netlify
- Verify Razorpay API credentials are correct
- Check Netlify function logs for detailed errors

### Issue: "Payment verification failed"
- Ensure `RAZORPAY_KEY_SECRET` is correctly set
- Check that the payment was actually successful in Razorpay dashboard

### Issue: Payment still getting refunded
- Verify that the `order_id` is being passed to Razorpay checkout
- Check Razorpay dashboard to confirm order was created before payment
- Review auto-capture settings in Razorpay dashboard

## References
- [Razorpay Orders API Documentation](https://razorpay.com/docs/api/orders/)
- [Auto-Capture Flow Guide](https://razorpay.com/docs/payments/payments/capture-settings/auto/)
