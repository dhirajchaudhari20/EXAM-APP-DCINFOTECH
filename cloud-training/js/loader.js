(function () {
    // 1. Inject Loader HTML if not present
    if (!document.getElementById('page-transition-loader')) {
        const loaderHTML = `
            <div id="page-transition-loader" class="page-loader">
                <div class="loader-content">
                    <div class="spinner-circle"></div>
                    <div class="loader-text">Loading...</div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    const loader = document.getElementById('page-transition-loader');

    // 2. Show loader on page load (it should be visible by default via CSS, but ensure here)
    // Actually, we want it to be visible initially to cover the load, then fade out.

    // 3. Hide loader when page is fully loaded
    function hideLoader() {
        // Use requestAnimationFrame for smoother UI update
        requestAnimationFrame(() => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500); // 500ms delay for smoothness
        });
    }

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    // Fallback: Force hide after 5 seconds (in case load event hangs)
    setTimeout(hideLoader, 5000);

    // 4. Intercept Link Clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            const target = link.getAttribute('target');

            // Ignore if:
            // - No href
            // - Anchor link (#)
            // - Open in new tab (_blank)
            // - JavaScript link (javascript:)
            // - Mailto/Tel
            if (!href ||
                href.startsWith('#') ||
                target === '_blank' ||
                href.startsWith('javascript:') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')) {
                return;
            }

            // Prevent default navigation
            e.preventDefault();

            // Show loader
            loader.classList.remove('hidden');

            // Navigate after a short delay to allow loader to appear
            setTimeout(() => {
                window.location.href = href;
            }, 100);
        }
    });

    // Handle Browser Back/Forward Cache (BFCache)
    // If user hits back button, we need to hide loader again
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            loader.classList.add('hidden');
        }
    });

})();
