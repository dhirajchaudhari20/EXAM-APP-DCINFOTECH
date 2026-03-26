// What's New Walkthrough Logic

let currentSlide = 1;

function initWhatsNew() {
  // Check if already seen (v3 for the new 4-slide version)
  if (localStorage.getItem('whatsNewSeen_v3') !== 'true') {
    const modal = document.getElementById('whatsNewModal');
    if (modal) {
      modal.style.display = 'flex';
      currentSlide = 1;
      showSlide(1);
    }
  }
}

function nextSlide() {
  currentSlide++;
  if (currentSlide > 4) return; // Safety
  showSlide(currentSlide);
}

function showSlide(n) {
  // Hide all slides
  for (let i = 1; i <= 4; i++) {
    const slide = document.getElementById(`slide${i}`);
    const dot = document.getElementById(`dot${i}`);
    if (slide) slide.style.display = 'none';
    if (dot) dot.style.background = '#ddd';
  }

  // Show current slide
  const current = document.getElementById(`slide${n}`);
  const currentDot = document.getElementById(`dot${n}`);

  if (current) current.style.display = 'block';
  if (currentDot) currentDot.style.background = 'var(--primary)';

  // Button Logic
  const nextBtn = document.getElementById('nextBtn');
  const finishBtn = document.getElementById('finishBtn');

  if (n === 4) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (finishBtn) finishBtn.style.display = 'block';
  } else {
    if (nextBtn) nextBtn.style.display = 'block';
    if (finishBtn) finishBtn.style.display = 'none';
  }
}

function closeWhatsNew() {
  const modal = document.getElementById('whatsNewModal');
  if (modal) modal.style.display = 'none';
  localStorage.setItem('whatsNewSeen_v3', 'true');

  // Trigger Rocket Launch
  const rocket = document.getElementById('rocket-container');
  if (rocket) {
    rocket.style.bottom = '120vh'; // Fly off screen

    // Add smoke effect
    const smoke = document.querySelector('.rocket-smoke');
    if (smoke) smoke.style.animation = 'smoke 1s infinite';

    // Reset after animation
    setTimeout(() => {
      rocket.style.transition = 'none';
      rocket.style.bottom = '-100px';
      if (smoke) smoke.style.animation = 'none';
      setTimeout(() => { rocket.style.transition = 'bottom 1.5s ease-in'; }, 100);

      // Open Profile Setup
      if (typeof openProfileModal === 'function') {
        openProfileModal();
        Notiflix.Notify.info('Let\'s set up your profile!');
      }
    }, 1600);
  }

  // Optional: Confetti for extra pop
  if (window.confetti) {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.8 }
    });
  }
}

// Expose functions to global scope for HTML onclick attributes
window.nextSlide = nextSlide;
window.closeWhatsNew = closeWhatsNew;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure DOM is fully ready
  setTimeout(initWhatsNew, 500);
});