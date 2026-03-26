/**
 * session-progress.js
 * Adds a progress bar to active sessions based on current time.
 */

(function () {
    function initSessionProgress() {
        const scheduleContainer = document.getElementById('schedule');
        if (!scheduleContainer) return;

        // Function to parse date from H4 header
        function getSessionDate(sessionEl) {
            const h4 = sessionEl.querySelector('h4');
            if (!h4) return null;
            // Get text from the first text node (ignoring countdown badge)
            const textNode = Array.from(h4.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            return textNode ? textNode.textContent.trim() : h4.textContent.trim();
        }

        // Function to parse time string "10:00 AM - 6:00 PM GMT+5:30" WITH Date
        function parseSessionTime(timeStr, dateStr) {
            try {
                // Remove timezone
                const timePart = timeStr.split('GMT')[0].trim();
                const [startStr, endStr] = timePart.split('-').map(s => s.trim());

                if (!startStr || !endStr) return null;
                if (!dateStr) return null;

                // Create base date from the header string
                // e.g. "Wed, December 10, 2025"
                // We use the dateStr to initialize the Date object
                const baseDate = new Date(dateStr);

                if (isNaN(baseDate.getTime())) {
                    console.warn("Invalid date parsed:", dateStr);
                    return null;
                }

                // Helper to set time on the base date
                const setTime = (dateObj, timeString) => {
                    const d = new Date(dateObj); // Clone
                    const [time, modifier] = timeString.split(' ');
                    let [hours, minutes] = time.split(':');

                    if (hours === '12') hours = '00';
                    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

                    d.setHours(parseInt(hours, 10));
                    d.setMinutes(parseInt(minutes, 10));
                    d.setSeconds(0);
                    return d;
                };

                const startTime = setTime(baseDate, startStr);
                const endTime = setTime(baseDate, endStr);

                // Handle overnight sessions (if end time is before start time)
                if (endTime < startTime) {
                    endTime.setDate(endTime.getDate() + 1);
                }

                return { start: startTime, end: endTime };

            } catch (e) {
                console.error("Error parsing time:", timeStr, e);
                return null;
            }
        }

        function updateProgress(sessionEl) {
            const timeEl = Array.from(sessionEl.querySelectorAll('*')).find(el =>
                el.children.length > 0 && el.querySelector('.live-badge') || // Already has badge
                (el.children.length === 0 &&
                    el.textContent.includes('AM') &&
                    el.textContent.includes('PM') &&
                    el.textContent.includes('-'))
            );

            if (!timeEl) return;

            // Clean time text (remove badge text if present for parsing)
            let timeText = timeEl.childNodes[0].textContent;
            if (timeEl.querySelector('.live-badge')) {
                // If badge exists, the time text is likely the first child node
                timeText = timeEl.firstChild.textContent;
            }

            const dateStr = getSessionDate(sessionEl);
            const timeRange = parseSessionTime(timeText, dateStr);

            if (!timeRange) return;

            const now = new Date();
            const { start, end } = timeRange;
            const totalDuration = end - start;
            const elapsed = now - start;

            let percentage = 0;
            let isActive = false;

            if (elapsed > 0 && elapsed < totalDuration) {
                percentage = (elapsed / totalDuration) * 100;
                isActive = true;
            } else if (elapsed >= totalDuration) {
                percentage = 100;
            }

            // Check if progress bar already exists
            let progressBar = sessionEl.querySelector('.session-progress');

            if (isActive) {
                if (!progressBar) {
                    progressBar = document.createElement('div');
                    progressBar.className = 'session-progress';
                    progressBar.innerHTML = '<div class="progress-fill"></div>';
                    // Insert after the time element or at the bottom of the card
                    timeEl.parentNode.insertBefore(progressBar, timeEl.nextSibling);
                }

                const fill = progressBar.querySelector('.progress-fill');
                if (fill) fill.style.width = `${percentage}%`;

                // Add active class to session for styling
                sessionEl.classList.add('session-active');

                // Add "Live" badge if not present
                if (!sessionEl.querySelector('.live-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'live-badge';
                    badge.textContent = 'LIVE';
                    timeEl.appendChild(badge);
                }

            } else {
                // Remove if exists and not active
                if (progressBar) {
                    progressBar.remove();
                }
                sessionEl.classList.remove('session-active');
                const badge = sessionEl.querySelector('.live-badge');
                if (badge) badge.remove();
            }
        }

        // Observer to handle dynamically added sessions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    // Slight delay to ensure DOM is fully populated (e.g. h4 text)
                    setTimeout(() => {
                        const sessions = scheduleContainer.querySelectorAll('.session');
                        sessions.forEach(updateProgress);
                    }, 100);
                }
            });
        });

        observer.observe(scheduleContainer, { childList: true, subtree: true });

        // Initial check
        setTimeout(() => {
            const sessions = scheduleContainer.querySelectorAll('.session');
            sessions.forEach(updateProgress);
        }, 500);

        // Update every minute (and clear invalid badges)
        setInterval(() => {
            const sessions = scheduleContainer.querySelectorAll('.session');
            sessions.forEach(updateProgress);
        }, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSessionProgress);
    } else {
        initSessionProgress();
    }
})();
