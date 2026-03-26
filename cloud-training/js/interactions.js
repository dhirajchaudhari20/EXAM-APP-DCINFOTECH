document.addEventListener('DOMContentLoaded', () => {
    // 1. Notification Bell Logic
    // 1. Notification Bell Logic
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
    }

    // 2. Important Notices Dropdown Logic
    const noticeBtn = document.getElementById('openNoticeModal');
    const noticeDropdown = document.getElementById('noticeDropdown');

    if (noticeBtn && noticeDropdown) {
        noticeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            if (newFeatureDropdown) newFeatureDropdown.classList.remove('show');
            noticeDropdown.classList.toggle('show');
        });

        window.addEventListener('click', (e) => {
            if (!noticeDropdown.contains(e.target) && !noticeBtn.contains(e.target)) {
                noticeDropdown.classList.remove('show');
            }
        });
    }

    // 2.1 New Feature Dropdown Logic
    const newFeatureBtn = document.getElementById('newFeatureBtn');
    const newFeatureDropdown = document.getElementById('newFeatureDropdown');

    if (newFeatureBtn && newFeatureDropdown) {
        newFeatureBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            if (noticeDropdown) noticeDropdown.classList.remove('show');
            newFeatureDropdown.classList.toggle('show');
        });

        window.addEventListener('click', (e) => {
            if (!newFeatureDropdown.contains(e.target) && !newFeatureBtn.contains(e.target)) {
                newFeatureDropdown.classList.remove('show');
            }
        });
    }


    // 3. Search Functionality with Loader and No Results Message
    const searchInput = document.getElementById('searchInput');
    const scheduleContainer = document.getElementById('schedule');

    if (searchInput && scheduleContainer) {
        let searchTimeout;

        // Create and inject no results message element (if not exists)
        let noResultsEl = document.getElementById('noSearchResults');
        if (!noResultsEl) {
            noResultsEl = document.createElement('div');
            noResultsEl.id = 'noSearchResults';
            noResultsEl.className = 'no-results-message';
            noResultsEl.style.display = 'none';
            noResultsEl.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-medium);">
                    <img src="https://cdn.dribbble.com/userupload/23883877/file/original-a0c22084deb68c372afe229976272d52.gif" 
                         alt="No results" 
                         style="width: 200px; height: auto; margin-bottom: 16px; opacity: 0.8;">
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 500;">No Results Found</h3>
                    <p style="margin: 0; opacity: 0.7;">Try adjusting your search term</p>
                </div>
            `;
            scheduleContainer.parentNode.insertBefore(noResultsEl, scheduleContainer.nextSibling);
        }

        // Create and inject search loader (if not exists)
        let searchLoader = document.getElementById('searchLoader');
        if (!searchLoader) {
            searchLoader = document.createElement('div');
            searchLoader.id = 'searchLoader';
            searchLoader.className = 'search-loader';
            searchLoader.style.display = 'none';
            searchLoader.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="spinner-circle" style="width: 40px; height: 40px; margin: 0 auto;"></div>
                    <p style="margin-top: 16px; color: var(--text-medium);">Searching...</p>
                </div>
            `;
            scheduleContainer.parentNode.insertBefore(searchLoader, scheduleContainer);
        }

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            // Clear previous timeout
            clearTimeout(searchTimeout);

            // Show loader immediately when typing
            if (searchTerm.length > 0) {
                scheduleContainer.style.display = 'none';
                searchLoader.style.display = 'block';
                noResultsEl.style.display = 'none';
            }

            // Debounce search (wait 300ms after user stops typing)
            searchTimeout = setTimeout(() => {
                const sessions = scheduleContainer.getElementsByClassName('session');
                let visibleCount = 0;

                Array.from(sessions).forEach(session => {
                    const title = session.querySelector('h4')?.textContent.toLowerCase() || '';
                    const desc = session.querySelector('p')?.textContent.toLowerCase() || '';
                    const isVisible = title.includes(searchTerm) || desc.includes(searchTerm);

                    session.style.display = isVisible ? 'block' : 'none';
                    if (isVisible) visibleCount++;
                });

                // Hide loader after search completes
                searchLoader.style.display = 'none';

                // Show/hide schedule container and no results message
                if (searchTerm.length === 0) {
                    scheduleContainer.style.display = '';
                    noResultsEl.style.display = 'none';
                } else if (visibleCount === 0) {
                    scheduleContainer.style.display = 'none';
                    noResultsEl.style.display = 'block';
                } else {
                    scheduleContainer.style.display = '';
                    noResultsEl.style.display = 'none';
                }
            }, 300);
        });
    }

    // 4. Filter Tabs Logic
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length > 0 && scheduleContainer) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 1. Update Active State
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // 2. Filter Sessions
                const filter = tab.textContent.trim().toLowerCase(); // 'all', 'upcoming', 'completed'
                const sessions = scheduleContainer.getElementsByClassName('session');
                const now = new Date();

                Array.from(sessions).forEach(session => {
                    // Extract date text
                    // Handle ranges like "Mon, Dec 8, 2025 - Tue, Dec 9, 2025"
                    // We take the first part (start date)
                    let rawDate = session.querySelector('h4')?.textContent || '';
                    if (rawDate.includes('-')) {
                        rawDate = rawDate.split('-')[0].trim();
                    }

                    // Remove Day Name (e.g., "Mon, ") to get "December 8, 2025"
                    const dateParts = rawDate.split(',');
                    const dateText = dateParts.length > 1 ? dateParts.slice(1).join(',').trim() : rawDate;

                    if (!dateText) return; // Skip if no date found

                    const sessionDate = new Date(dateText);
                    let shouldShow = false;

                    if (filter === 'all') {
                        shouldShow = true;
                    } else if (filter === 'upcoming') {
                        shouldShow = sessionDate >= now;
                    } else if (filter === 'completed') {
                        shouldShow = sessionDate < now;
                    }

                    session.style.display = shouldShow ? 'block' : 'none';
                });
            });
        });
    }

    // 5. Dark Mode Logic
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const icon = darkModeToggle?.querySelector('i');

    console.log('Dark Mode Init:', { toggle: darkModeToggle, saved: localStorage.getItem('darkMode') });

    // Check saved preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            console.log('Dark Mode Toggled');
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');

            // Update Icon
            if (icon) {
                if (isDark) {
                    icon.classList.replace('fa-moon', 'fa-sun');
                } else {
                    icon.classList.replace('fa-sun', 'fa-moon');
                }
            }

            // Save Preference
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        });
    }

    // 6. Feedback Modal Logic (One-time popup)
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedbackBtn = document.getElementById('closeFeedbackModal');
    const feedbackForm = document.getElementById('uiFeedbackForm');

    // Check if feedback already given or modal closed previously
    // Using v2 key to reset for all users as per update
    // Using v2 key to reset for all users as per update
    const FEEDBACK_KEY = 'uiFeedbackSeen_v2';

    // Helper to set cookie
    const setCookie = (name, value, days) => {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    };

    // Helper to get cookie
    const getCookie = (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    const hasSeenFeedback = localStorage.getItem(FEEDBACK_KEY) || getCookie(FEEDBACK_KEY);

    // KILL SWITCH: Prevent modal from showing if user is annoyed
    // Setting this to true effectively disables the auto-popup
    const KILL_SWITCH = true;

    if (!KILL_SWITCH && !hasSeenFeedback && feedbackModal) {
        // Show after 20 seconds (as requested)
        setTimeout(() => {
            // Re-check in case user navigated away or it was set in another tab
            if (!localStorage.getItem(FEEDBACK_KEY) && !getCookie(FEEDBACK_KEY)) {
                feedbackModal.style.display = 'flex';
                localStorage.setItem(FEEDBACK_KEY, 'true'); // Mark as seen immediately when shown
                setCookie(FEEDBACK_KEY, 'true', 365); // Set cookie for 1 year
            }
        }, 20000);
    }

    if (closeFeedbackBtn && feedbackModal) {
        closeFeedbackBtn.addEventListener('click', () => {
            feedbackModal.style.display = 'none';
            // Mark as seen so it doesn't show again
            localStorage.setItem(FEEDBACK_KEY, 'true');
            setCookie(FEEDBACK_KEY, 'true', 365);
        });
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop redirect

            const formData = new FormData(feedbackForm);
            const userName = formData.get('name') || 'User'; // Get name
            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Mark as seen immediately upon submission attempt
            try {
                localStorage.setItem(FEEDBACK_KEY, 'true');
                sessionStorage.setItem(FEEDBACK_KEY, 'true'); // Backup
                setCookie(FEEDBACK_KEY, 'true', 365); // Cookie Backup
            } catch (e) {
                console.warn('Storage failed', e);
            }

            fetch(feedbackForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        return response.json(); // Try to parse JSON
                    }
                    throw new Error('Network response was not ok');
                })
                .then(data => {
                    // Success - Use Notiflix
                    if (typeof Notiflix !== 'undefined') {
                        Notiflix.Report.success(
                            `Thank You, ${userName}!`,
                            'Your feedback has been submitted successfully.',
                            'Close'
                        );
                    } else if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: `Thank You, ${userName}!`,
                            text: 'Your feedback has been submitted successfully.',
                            icon: 'success',
                            confirmButtonColor: '#1a73e8'
                        });
                    } else {
                        alert(`Thank You, ${userName}! Feedback Submitted.`);
                    }

                    feedbackModal.style.display = 'none';
                    // localStorage.setItem(FEEDBACK_KEY, 'true'); // Already set on submit
                    feedbackForm.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Fallback success for user experience (as per previous instruction)
                    if (typeof Notiflix !== 'undefined') {
                        Notiflix.Report.success(
                            `Thank You, ${userName}!`,
                            'Your feedback has been submitted.',
                            'Close'
                        );
                    } else {
                        alert(`Thank You, ${userName}! Feedback Submitted.`);
                    }
                    feedbackModal.style.display = 'none';
                    // localStorage.setItem(FEEDBACK_KEY, 'true'); // Already set on submit
                    feedbackForm.reset();
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Close on outside click (shared with notice modal logic or separate)
    window.addEventListener('click', (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
            localStorage.setItem(FEEDBACK_KEY, 'true');
            setCookie(FEEDBACK_KEY, 'true', 365);
        }
    });

    // 7. Mobile Sidebar Toggle Logic
    // Moved to js/sidebar.js to support centralized sidebar injection
});
