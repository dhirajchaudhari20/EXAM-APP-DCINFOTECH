(function () {
  function initFinalTimer() {
    const timerDisplay = document.getElementById("final-timer");
    const finalMessage = document.getElementById("final-message");

    // Exit if elements don't exist
    if (!timerDisplay || !finalMessage) {
      console.warn("Final timer elements not found");
      return;
    }

    function getISTDate() {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;
      return new Date(utc + IST_OFFSET);
    }

    function updateFinalTimer() {
      const now = getISTDate();
      const target = new Date(Date.UTC(2025, 15, 7, 14, 30)); // 8:00 PM IST = 14:30 UTC

      if (now >= target) {
        timerDisplay.innerHTML = "";
        finalMessage.innerHTML = "⏰ Timer complete! Event has started.";
        clearInterval(timerInterval);
        return;
      }

      const diff = target - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      timerDisplay.innerHTML = `🕒 Countdown to 7 June 2025, 8:00 PM IST: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    const timerInterval = setInterval(updateFinalTimer, 1000);
    updateFinalTimer(); // initial call
  }

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFinalTimer);
  } else {
    // DOM is already loaded
    initFinalTimer();
  }
})();