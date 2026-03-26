(function () {
  // Use local agenda.js instead of remote URL to improve load time and reliability
  const scriptUrl = 'js/agenda.js';

  function loadScript(url, callback) {
    // Check if script is already added
    if (document.querySelector(`script[src="${url}"]`)) {
      console.warn("Script already loaded:", url);
      if (typeof callback === "function") callback();
      return;
    }

    const s = document.createElement('script');
    // Add cache busting
    const separator = url.includes('?') ? '&' : '?';
    s.src = `${url}${separator}v=${new Date().getTime()}`;
    s.async = true;

    s.onload = function () {
      console.log("Script loaded successfully:", url);
      if (typeof callback === "function") callback();
    };

    s.onerror = function () {
      console.error("Failed to load script:", url);
      // Fallback to remote if local fails
      if (url === '../js/agenda.js') {
        console.log("Attempting fallback to remote agenda.js...");
        loadScript('https://dcinfotech.org.in/js/agenda.js', callback);
      }
    };

    document.head.appendChild(s);
  }

  // Load script and initialize page
  loadScript(scriptUrl, function () {
    // Ensure loadPage is called once script is ready
    // This is critical because window.onload might fire before agenda.js is loaded
    if (typeof loadPage === 'function') {
      // Check if we need to wait for DOMContentLoaded?
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPage);
      } else {
        loadPage();
      }
    }

    // Hide the loader immediately after script determines content readiness
    const loader = document.getElementById("page-transition-loader");
    if (loader) {
      // Use a short delay to ensure rendering has caught up, but not 5 seconds!
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.classList.add('hidden');
        }, 500); // Wait for CSS transition
      }, 300);
    }
  });
})();