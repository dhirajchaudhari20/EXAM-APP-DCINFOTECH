/**
 * credentials.js
 * Handles dynamic rendering of user credentials based on the logged-in user.
 * Fetches real data from SheetDB.
 */

(function () {
    'use strict';

    const SHEETDB_RESULTS_URL = 'https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_results';

    function getUserEmail() {
        // 1. Try to get the user from the global DASHBOARD_USER object
        if (window.DASHBOARD_USER && window.DASHBOARD_USER.email) {
            return window.DASHBOARD_USER.email.toLowerCase();
        }
        // 2. Fallback: Try reading from localStorage directly
        try {
            const stored = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('cm_user'));
            if (stored && stored.email) {
                return stored.email.toLowerCase();
            }
        } catch (e) {
            console.warn("Could not read user from storage", e);
        }
        return null;
    }

    async function fetchCredentials(userEmail) {
        if (!userEmail) return [];
        const CACHE_KEY = `credentials_${userEmail}`;
        const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

        try {
            const cachedItem = localStorage.getItem(CACHE_KEY);
            if (cachedItem) {
                const { timestamp, credentials } = JSON.parse(cachedItem);
                if (Date.now() - timestamp < CACHE_DURATION_MS) {
                    console.log("Loading credentials from cache.");
                    return credentials;
                }
            }

            console.log("Fetching fresh credentials from Firebase API...");
            const response = await fetch(`${SHEETDB_RESULTS_URL}.json`);
            if (!response.ok) throw new Error('Network response was not ok');

            const allData = await response.json();
            const dataArray = allData ? Object.values(allData) : [];
            const data = dataArray.filter(record => record.UserEmail && record.UserEmail.toLowerCase() === userEmail.toLowerCase());

            // Filter for "Passed" status
            const credentials = data.filter(record => record.Status === 'Passed').map(record => {
                // Calculate expiration (Issue Date + 2 Years)
                const issueDate = new Date(record.Timestamp || Date.now());
                const expirationDate = new Date(issueDate);
                expirationDate.setFullYear(issueDate.getFullYear() + 2);

                // Generate a simple hash for ID if not present
                const certId = record.Timestamp ? 'CRT-' + Math.abs(record.Timestamp.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) : 'N/A';

                return {
                    id: certId,
                    title: record.ExamName || 'Unknown Certification',
                    status: 'Active',
                    issueDate: issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    expirationDate: expirationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    image: 'https://www.gstatic.com/images/branding/product/2x/google_cloud_64dp.png',
                    color: '#34a853',
                    bgColor: '#e6f4ea',
                    textColor: '#34a853'
                };
            });

            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                credentials: credentials
            }));

            return credentials;

        } catch (error) {
            console.error("Failed to fetch credentials:", error);
            return [];
        }
    }

    async function renderCredentials() {
        const container = document.getElementById('credentials-container');
        if (!container) return;

        const userEmail = getUserEmail();

        if (!userEmail) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Please Log In</h3>
                    <p>You need to be logged in to view your credentials.</p>
                </div>
            `;
            return;
        }

        // Show loading state
        container.innerHTML = `
            <div class="empty-state">
                <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p>Loading your credentials...</p>
            </div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;

        const credentials = await fetchCredentials(userEmail);

        if (credentials.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Active Credentials</h3>
                    <p>You haven't earned any certifications yet. Visit the <a href="exam-schedule.html">Exam Schedule</a> page to get started.</p>
                    <button onclick="window.showDemoCertificate()" class="btn btn-primary" style="margin-top: 1.5rem; max-width: 250px;">View Demo Certificate</button>
                </div>
            `;
            return;
        }

        container.innerHTML = credentials.map(cert => `
            <div class="credential-card" style="border-top-color: ${cert.color};">
                <span class="status-badge" style="background-color: ${cert.bgColor}; color: ${cert.textColor};">
                    ${cert.status}
                </span>
                <img src="${cert.image}" alt="${cert.title}" class="badge-icon">
                <h3>${cert.title}</h3>
                
                <div class="credential-meta">
                    <div class="meta-row">
                        <span>Issue Date:</span>
                        <strong>${cert.issueDate}</strong>
                    </div>
                    <div class="meta-row">
                        <span>Expiration:</span>
                        <strong>${cert.expirationDate}</strong>
                    </div>
                    <div class="meta-row">
                        <span>Credential ID:</span>
                        <strong>${cert.id}</strong>
                    </div>
                </div>

                <div class="btn-group">
                    <button onclick="alert('Sharing functionality coming soon!')" class="btn btn-outline">Share</button>
                    <button onclick="alert('Downloading PDF...')" class="btn btn-primary">Download PDF</button>
                </div>
            </div>
        `).join('');
    }

    // Expose render function globally
    window.renderCredentials = renderCredentials;

    // Auto-render if the DOM is already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCredentials);
    } else {
        renderCredentials();
    }

})();
