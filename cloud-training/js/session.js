/**
 * session.js
 * Handles user session persistence and UI updates across pages.
 */

(function () {
    // Check if we are on the login page (index.html and login container is visible)
    // Or if we are on a protected page (schedule.html)

    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path.endsWith('/');
    const isSchedule = path.endsWith('schedule.html');

    function loadSession() {
        let user = JSON.parse(localStorage.getItem('cloudUser'));
        if (!user) {
            user = JSON.parse(sessionStorage.getItem('loggedInUser'));
            if (user) {
                localStorage.setItem('cloudUser', JSON.stringify(user));
            }
        }

        if (user) {
            // Update UI with user info
            const nameElements = document.querySelectorAll('.user-name');
            const roleElements = document.querySelectorAll('.user-role');
            const emailInput = document.getElementById('userEmail');
            const profileImg = document.querySelector('.profile-photo-container img');

            nameElements.forEach(el => el.textContent = user.name || 'User');
            roleElements.forEach(el => el.textContent = user.role || 'Intern');

            if (emailInput) {
                emailInput.value = user.email || 'user@example.com';
            }

            if (profileImg && user.name) {
                profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
            }

            // If on index.html, ensure dashboard is shown if logged in
            if (isIndex) {
                const loginContainer = document.getElementById('loginContainer');
                const dashboardContainer = document.getElementById('dashboardContainer');
                if (loginContainer && dashboardContainer) {
                    loginContainer.style.display = 'none';
                    dashboardContainer.style.display = 'flex';
                }
            }
        } else {
            // No user found
            if (isSchedule) {
                // agenda.js handles the redirect/protection now.
                // We do nothing here to avoid conflicts/popups.
                console.log('No session found in session.js, letting agenda.js handle it.');
            }
        }
    }

    // Expose login function wrapper to save session
    window.saveSession = function (email, name = 'User') {
        const user = {
            email: email,
            name: name.split('@')[0], // Simple name extraction
            role: 'Intern'
        };
        localStorage.setItem('cloudUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
    };

    // Run on load
    window.addEventListener('DOMContentLoaded', loadSession);
})();
