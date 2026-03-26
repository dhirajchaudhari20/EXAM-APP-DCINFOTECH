# Netlify Deployment Guide - DC Cloud Solutions

## ✅ Your Site is Ready for Deployment!

Your HTML/CSS/JS website is now fully configured for Netlify with Razorpay Orders API integration.

---

## 📋 Pre-Deployment Checklist

All code changes have been pushed to the `main` branch:
- ✅ Razorpay serverless functions created
- ✅ Payment flow updated to use Orders API
- ✅ Netlify configuration optimized
- ✅ Dependencies installed
- ✅ Security headers configured

---

## 🚀 Deployment Steps

### Step 1: Configure Environment Variables in Netlify

**This is CRITICAL - the payment system won't work without these!**

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (dcinfotech.org.in)
3. Navigate to: **Site Settings** → **Environment Variables**
4. Click **Add a variable** and add these two:

   **Variable 1:**
   - Key: `RAZORPAY_KEY_ID`
   - Value: `rzp_live_Rh9DT3zh89pYq8`
   - Scopes: Select "All scopes" or "Functions"

   **Variable 2:**
   - Key: `RAZORPAY_KEY_SECRET`
   - Value: `[Your Razorpay Secret Key from Dashboard]`
   - Scopes: Select "All scopes" or "Functions"

5. Click **Save**

**Where to find your Razorpay Secret Key:**
- Login to https://dashboard.razorpay.com
- Go to Settings → API Keys
- Copy your "Key Secret" (starts with something like `rzp_live_...`)

### Step 2: Deploy Your Site

Netlify will automatically deploy when you push to `main` branch (already done!).

**To manually trigger a deploy:**
1. In Netlify dashboard, go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

### Step 3: Verify Deployment

Once deployed, check:

1. **Functions are deployed:**
   - Go to **Functions** tab in Netlify
   - You should see:
     - `razorpay-create-order`
     - `razorpay-verify-payment`

2. **Test the payment flow:**
   - Visit: https://dcinfotech.org.in/dc-infotech-launchpad-form/index-2.html
   - Fill out the registration form
   - Try a test payment (use a small amount first)
   - Verify the flow works: Form → Order Creation → Payment → Verification → Data Saved

3. **Check Razorpay Dashboard:**
   - Login to https://dashboard.razorpay.com
   - Go to **Transactions** → **Orders**
   - You should see orders being created
   - Payments should be captured (not refunded)

---

## 🔍 Troubleshooting

### Issue: "Failed to create order"
**Solution:**
- Check that environment variables are set correctly in Netlify
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- Check Netlify function logs: **Functions** tab → Click on function → **Function log**

### Issue: "Payment verification failed"
**Solution:**
- Ensure `RAZORPAY_KEY_SECRET` is correctly set
- Check that the payment was successful in Razorpay dashboard
- Review function logs in Netlify

### Issue: Payment still getting refunded
**Solution:**
- Verify that orders are being created in Razorpay dashboard
- Check that `order_id` is being passed to Razorpay checkout
- Review auto-capture settings in Razorpay dashboard

### How to view Function Logs:
1. Netlify Dashboard → **Functions** tab
2. Click on the function name
3. Click **Function log** to see real-time logs
4. Look for errors or console.log outputs

---

## 📊 Monitoring

### After Deployment, Monitor:

1. **Netlify Function Logs:**
   - Check for any errors in function execution
   - Monitor response times

2. **Razorpay Dashboard:**
   - Orders → Verify orders are being created
   - Payments → Confirm payments are captured
   - Settlements → Check settlement schedule

3. **SheetDB:**
   - Verify form data is being saved correctly
   - Check that payment IDs are recorded

---

## 🔐 Security Notes

Your site now has:
- ✅ HTTPS redirect (HTTP → HTTPS)
- ✅ Security headers (X-Frame-Options, XSS Protection, etc.)
- ✅ Server-side payment verification
- ✅ Environment variables secured in Netlify

---

## 📞 Support

If you encounter issues:
1. Check Netlify function logs
2. Review Razorpay dashboard for payment status
3. Refer to `RAZORPAY_SETUP.md` for detailed documentation

---

## 🎉 You're All Set!

Once you've configured the environment variables in Netlify, your payment system will be fully functional and will prevent the auto-refund issue you were experiencing.
