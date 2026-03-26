(function () {
    // Fix Dashboard Layout (Force Flexbox)
    const dashboard = document.getElementById('dashboardContainer');

    function enforceLayout() {
        if (dashboard && dashboard.style.display === 'block') {
            dashboard.style.display = 'flex';
            console.log('Fixed dashboard layout to flex');
        }

        // Ensure body background is clean
        if (document.body.style.backgroundImage) {
            document.body.style.backgroundImage = 'none';
        }
    }

    if (dashboard) {
        // Observe for style changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    enforceLayout();
                }
            });
        });

        observer.observe(dashboard, { attributes: true });

        // Also check periodically in case of other scripts
        setInterval(enforceLayout, 500);
    }

    // Remove any legacy video containers if they appear
    const removeLegacyElements = () => {
        const videoBg = document.querySelector('.video-background-container');
        if (videoBg) videoBg.remove();

        const oldSpinner = document.querySelector('.spinner');
        // Don't remove all spinners, just specific ones if needed
    };

    window.addEventListener('load', () => {
        enforceLayout();
        removeLegacyElements();
    });
})();
