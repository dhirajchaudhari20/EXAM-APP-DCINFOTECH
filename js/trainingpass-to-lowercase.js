// ...existing code...

// Force password input to lowercase as user types
document.addEventListener('DOMContentLoaded', function () {
  var pwd = document.getElementById('password');
  if (pwd) {
    pwd.addEventListener('input', function () {
      this.value = this.value.toLowerCase();
    });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const photoInput = document.getElementById('profilePhotoInput');
  const photoImg = document.getElementById('profilePhoto');

  // Load saved photo if present
  const savedPhoto = localStorage.getItem('profilePhoto');
  if (savedPhoto && photoImg) {
    photoImg.src = savedPhoto;
  }

  // When user selects a photo
  if (photoInput && photoImg) {
    photoInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (evt) {
        photoImg.src = evt.target.result;
        localStorage.setItem('profilePhoto', evt.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
});// This script handles profile photo upload and display in the dashboard with cross-device support
document.addEventListener('DOMContentLoaded', function () {
  const photoInput = document.getElementById('dashboardProfilePhotoInput');
  const photoImg = document.getElementById('dashboardProfilePhoto');
  const photoStatus = document.getElementById('dashboardPhotoStatus');
  const photoSpinner = document.getElementById('dashboardPhotoSpinner');

  const user = JSON.parse(localStorage.getItem('loggedInUser'));

  // ✅ Load saved photo from loggedInUser, or fallback to localStorage, or default
  if (photoImg) {
    if (user && user.profilePhoto) {
      photoImg.src = user.profilePhoto;
    } else {
      const savedPhoto = localStorage.getItem('profilePhoto');
      if (savedPhoto) {
        photoImg.src = savedPhoto;
      } else {
        const defaultAvatar = `https://media.lordicon.com/icons/wired/gradient/21-avatar.gif`;
        photoImg.src = defaultAvatar;
      }
    }
  }

  // 📤 Handle photo upload
  if (photoInput) {
    photoInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      photoSpinner.style.display = 'block';
      photoStatus.textContent = 'Uploading...';

      const reader = new FileReader();
      reader.onloadend = function () {
        const base64Image = reader.result.split(',')[1];
        const imgbbApiKey = "c099937b22400aea1cfddcbb023f020c";

        fetch("https://api.imgbb.com/1/upload?key=" + imgbbApiKey, {
          method: "POST",
          body: new URLSearchParams({
            image: base64Image
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const imageUrl = data.data.url;
              photoImg.src = imageUrl;
              localStorage.setItem('profilePhoto', imageUrl);

              // ✅ Save to user object (cross-device support)
              const user = JSON.parse(localStorage.getItem('loggedInUser'));
              if (user) {
                user.profilePhoto = imageUrl;
                localStorage.setItem('loggedInUser', JSON.stringify(user));
              }

              photoSpinner.style.display = 'none';
              photoStatus.textContent = 'Upload complete!';
              setTimeout(() => {
                photoStatus.textContent = 'Click to change photo';
              }, 1500);
            } else {
              throw new Error("Upload failed. " + data.error.message);
            }
          })
          .catch(err => {
            console.error("Upload error:", err);
            photoStatus.textContent = 'Upload failed!';
            photoSpinner.style.display = 'none';
          });
      };

      reader.readAsDataURL(file);
    });
  }
});










// This script handles the feedback modal functionality, including star rating and text input.
let selectedRating = 0;

function showFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

document.querySelectorAll('#starRating span').forEach(star => {
  star.addEventListener('click', function () {
    selectedRating = parseInt(this.dataset.value);
    updateStars(selectedRating);
  });
});

function updateStars(rating) {
  const stars = document.querySelectorAll('#starRating span');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

function submitFeedback() {
  const feedbackText = document.getElementById('feedbackText').value;

  if (selectedRating === 0) {
    if (typeof Swal !== 'undefined') {
      Swal.fire("Oops!", "Please select a rating before submitting.", "warning");
    } else if (typeof Notiflix !== 'undefined') {
      Notiflix.Report.warning("Oops!", "Please select a rating before submitting.", "Okay");
    } else {
      alert("Please select a rating before submitting.");
    }
    return;
  }

  // Store or send feedback
  console.log("Rating:", selectedRating, "Text:", feedbackText);

  if (typeof Swal !== 'undefined') {
    Swal.fire("Thank you!", "Your feedback has been submitted.", "success");
  } else if (typeof Notiflix !== 'undefined') {
    Notiflix.Report.success("Thank you!", "Your feedback has been submitted.", "Okay");
  } else {
    alert("Thank you! Your feedback has been submitted.");
  }

  // Reset modal
  document.getElementById('feedbackText').value = '';
  selectedRating = 0;
  updateStars(0);
  closeFeedbackModal();
}

// Optional: Auto-show modal after session
window.addEventListener('load', () => {
  setTimeout(showFeedbackModal, 5000); // Show after 5 seconds
});

