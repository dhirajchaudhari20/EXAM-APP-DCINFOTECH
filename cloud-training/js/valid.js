function login() {
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value.trim();
    var errorMessage = document.getElementById("errorMessage");

    errorMessage.innerText = ""; // Clear previous errors

    if (email === "" || password === "") {
        errorMessage.innerText = "Both fields are required.";
        return;
    }

    // Email validation (checks for valid email format)
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorMessage.innerText = "Please enter a valid email address.";
        return;
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
        errorMessage.innerText = "Password must be at least 6 characters.";
        return;
    }

    // Remember Me Logic
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe && rememberMe.checked) {
        localStorage.setItem('savedEmail', email);
    } else {
        localStorage.removeItem('savedEmail');
    }

    // Save session
    if (window.saveSession) {
        window.saveSession(email, email); // Use email as name for now
    }

    // Simulate API call/Loading
    const btn = document.getElementById('loginButton');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');

    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    btn.disabled = true;

    setTimeout(() => {
        // Hide Login, Show Dashboard
        document.getElementById('loginContainer').style.display = 'none';
        const dashboard = document.getElementById('dashboardContainer');
        dashboard.style.display = 'flex'; // SaaS layout uses flex

        // Trigger data load
        if (typeof loadPage === 'function') {
            loadPage();
        }

        // Reset button
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        btn.disabled = false;
    }, 1000);
}

function forgotPassword() {
    Notiflix.Confirm.prompt(
        'Reset Password',
        'Enter your professional email address',
        '',
        'Send Password',
        'Cancel',
        (clientEmail) => {
            if (!clientEmail || clientEmail.trim() === '') {
                Notiflix.Report.failure('Error', 'Email is required!', 'Okay');
                return;
            }

            Notiflix.Loading.standard('Sending secure email...');

            // Use EmailJS to send the password
            emailjs.send("service_2l1j8ph", "template_0w8x4ho", {
                to_name: "Staff Member",
                to_email: clientEmail,
                course_name: "Internal Access Recovery",
                transaction_id: "intern@123" // The requested password
            })
                .then(() => {
                    Notiflix.Loading.remove();
                    Notiflix.Report.success(
                        'Access Credentials Sent',
                        `Your login credentials have been sent to ${clientEmail}. Please check your inbox immediately.`,
                        'Okay'
                    );
                })
                .catch((error) => {
                    Notiflix.Loading.remove();
                    console.error("EmailJS Error:", error);
                    Notiflix.Report.failure(
                        'Transmission Failed',
                        'Unable to send credentials. Please contact IT support directly.',
                        'Close'
                    );
                });
        },
        () => {
            // Cancel callback - do nothing
        },
        {
            width: '320px',
            borderRadius: '8px',
            titleColor: '#1e293b',
            okButtonBackground: '#4f46e5',
            cancelButtonBackground: '#cbd5e1',
        }
    );
}

// Initialize Remember Me on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('savedEmail');
    const emailInput = document.getElementById('email');
    const rememberMe = document.getElementById('rememberMe');

    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        if (rememberMe) rememberMe.checked = true;
    }
});