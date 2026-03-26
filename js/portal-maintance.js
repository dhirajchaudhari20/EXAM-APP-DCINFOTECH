(function () {
  function initPortalStatus() {
    const statusMessage = document.getElementById("status-message");
    const countdown = document.getElementById("countdown");

    // Exit if elements don't exist yet
    if (!statusMessage || !countdown) {
      console.warn("Portal status elements not found");
      return;
    }

    function getISTDate() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5:30
      return new Date(utc + istOffset);
    }

    function updatePortalStatus() {
      const now = getISTDate();

      // Maintenance ended on 23 July 2025 at 7:33 AM IST (2:03 AM UTC)
      const maintenanceEnd = new Date(Date.UTC(2025, 6, 23, 2, 3, 0)); // July = 6

      if (now <= maintenanceEnd) {
        const timeDiff = maintenanceEnd - now;
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);

        statusMessage.innerHTML = `
          <strong>Scheduled Maintenance in Progress</strong><br>
          The portal is currently undergoing scheduled maintenance and quality testing.<br>
          Access will be restored by <strong>23 July, 7:33 AM IST</strong>. Thank you for your understanding.`;
        countdown.innerHTML = `Time remaining: <strong>${hours}h ${minutes}m ${seconds}s</strong>`;
      } else {
        statusMessage.innerHTML = `
          <strong>Maintenance Completed</strong><br>
          The portal is now fully operational. All systems are functioning normally.<br>
          If you experience any issues, please reach out through live chat for assistance.`;
        countdown.innerHTML = "";
      }
    }

    setInterval(updatePortalStatus, 1000);
    updatePortalStatus(); // Initial call
  }

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortalStatus);
  } else {
    // DOM is already loaded
    initPortalStatus();
  }
})();
