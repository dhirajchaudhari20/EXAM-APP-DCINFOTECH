
document.addEventListener('DOMContentLoaded', function () {
  const feedbackModal = document.getElementById('feedbackModal');
  const feedbackCloseBtn = document.getElementById('feedbackCloseBtn');
  const feedbackStars = document.getElementById('feedbackStars');
  const feedbackName = document.getElementById('feedbackName');
  const feedbackComment = document.getElementById('feedbackComment');
  const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
  const feedbackSubmitText = document.getElementById('feedbackSubmitText');
  const feedbackSpinner = document.getElementById('feedbackSpinner');
  const feedbackThanks = document.getElementById('feedbackThanks');
  const feedbackThanksName = document.getElementById('feedbackThanksName');
  const chatCloseBtn = document.querySelector('.codelab-closeBtn');
  const chatModal = document.getElementById('chatModal');

  let feedbackRating = 0;

  // Render stars
  if (feedbackStars) {
    feedbackStars.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.innerHTML = '★';
      star.style.fontSize = '1.7em';
      star.style.cursor = 'pointer';
      star.style.color = '#ccc';
      star.setAttribute('data-star', i);
      star.onmouseenter = () => highlightStars(i);
      star.onmouseleave = () => highlightStars(feedbackRating);
      star.onclick = () => {
        feedbackRating = i;
        highlightStars(i);
      };
      feedbackStars.appendChild(star);
    }
  }

  function highlightStars(n) {
    [...feedbackStars.children].forEach((star, idx) => {
      star.style.color = idx < n ? '#ffd700' : '#ccc';
    });
  }

  // Show feedback modal
  function showFeedbackModal() {
    // Check shared key
    if (localStorage.getItem('uiFeedbackSeen_v2') === 'true') {
      return;
    }
    feedbackModal.style.display = 'flex';
    feedbackRating = 0;
    feedbackComment.value = '';
    feedbackName.value = '';
    feedbackThanksName.textContent = '';
    feedbackThanks.style.display = 'none';
    feedbackSubmitBtn.disabled = false;
    feedbackSubmitText.style.display = '';
    feedbackSpinner.style.display = 'none';
    highlightStars(0);
  }

  // Hide feedback modal
  function hideFeedbackModal() {
    feedbackModal.style.display = 'none';
  }

  // Close button
  feedbackCloseBtn.onclick = hideFeedbackModal;

  // Submit feedback
  feedbackSubmitBtn.onclick = function () {
    if (feedbackRating === 0) {
      highlightStars(1);
      return;
    }

    const name = feedbackName.value.trim();
    const comment = feedbackComment.value.trim();
    const timestamp = new Date().toISOString();

    feedbackSubmitBtn.disabled = true;
    feedbackSubmitText.style.display = 'none';
    feedbackSpinner.style.display = '';

    const data = {
      timestamp: timestamp,
      rating: feedbackRating,
      name: name,
      comment: comment
    };

    fetch('https://sheetdb.io/api/v1/soxysbxvi5w71', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: data })
    })
      .then(() => {
        feedbackSpinner.style.display = 'none';
        feedbackThanksName.textContent = name || 'friend';
        feedbackThanks.style.display = '';
        localStorage.setItem('uiFeedbackSeen_v2', 'true'); // Set shared key
        setTimeout(hideFeedbackModal, 1500);
      })
      .catch((error) => {
        alert('Error submitting feedback.');
        feedbackSubmitBtn.disabled = false;
        feedbackSubmitText.style.display = '';
        feedbackSpinner.style.display = 'none';
      });
  };

  // Show feedback modal on chat close
  chatCloseBtn.addEventListener('click', () => {
    chatModal.style.display = 'none';
    if (typeof clearFileInput === 'function') clearFileInput();
    showFeedbackModal();
  });
});