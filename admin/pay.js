// Initialize variables
const totalAmount = 1050; // Total amount: ₹1050
let paymentAmount = 0;

// Get DOM elements
const loginForm = document.getElementById("loginForm");
const loginContainer = document.getElementById("loginContainer");
const fundTrackerContainer = document.getElementById("fundTrackerContainer");
const welcomeMessage = document.getElementById("welcomeMessage");
const statusText = document.getElementById("statusText");
const amountPaid = document.getElementById("amountPaid");
const amountRemaining = document.getElementById("amountRemaining");
const paymentHistory = document.getElementById("paymentHistory");

// If the user is already logged in, show the fund tracker
if (localStorage.getItem("loggedIn") === "true") {
  const userEmail = localStorage.getItem("email");
  showFundTracker(userEmail);
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  if (email === "admin@dcinfotech.me" && password === "admin") {
    // Display logging-in loading screen
    Notiflix.Loading.standard("Logging in...");
    
    setTimeout(() => {
      Notiflix.Loading.remove(); // Remove login loader
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("email", email);
      showFundTracker(email);
      Notiflix.Notify.success("Login successful!");
    }, 2000);
    
  } else {
    Notiflix.Notify.failure("Incorrect email or password.");
  }
});

function showFundTracker(userEmail) {
  // Hide login container and show fund tracker
  loginContainer.style.display = "none";
  fundTrackerContainer.style.display = "block";
  welcomeMessage.textContent = `Welcome, ${userEmail}`;
  
  // Start fetching payment data
  fetchPaymentData();
}

function fetchPaymentData() {
  // Display the loading screen for fetching payment data
  Notiflix.Loading.standard("Fetching payment data...");
  
  // Simulate a server delay of 2 seconds
  setTimeout(() => {
    // Reset and clear previous data
    paymentAmount = 0;
    paymentHistory.innerHTML = "";
    
    // Add transactions: one ₹50 and one ₹1000
    addTransaction(50);
    addTransaction(1000);
    
    // Update the UI with the latest payment data
    statusText.textContent = `Payment Progress: ₹${paymentAmount}`;
    amountPaid.textContent = `Current Balance: ₹${paymentAmount}`;
    amountRemaining.textContent = `Amount Remaining: ₹${totalAmount - paymentAmount}`;
    
    // Remove the loading screen after 2 seconds
    Notiflix.Loading.remove();
    Notiflix.Notify.success("Payment data loaded successfully!");
  }, 2000);
}

function addTransaction(amount) {
  paymentAmount += amount;
  const transactionId = generateTransactionId();
  const paymentItem = document.createElement("div");
  paymentItem.classList.add("payment-item");
  paymentItem.textContent = `UPI Transaction ID: ${transactionId}, Amount: ₹${amount}`;
  paymentHistory.appendChild(paymentItem);
}

function generateTransactionId() {
  // Generate a random 12-digit transaction ID
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}
