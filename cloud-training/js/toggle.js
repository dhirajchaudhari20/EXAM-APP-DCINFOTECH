function togglePassword() {
  var passwordInput = document.getElementById("password");
  var eyeIcon = document.querySelector(".toggle-password");

  // Animate the eye icon with a smooth rotation and scale effect
  eyeIcon.classList.add("rotate-scale");
  setTimeout(function () {
    eyeIcon.classList.remove("rotate-scale");
  }, 400);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.textContent = "🙈"; // Closed-eye icon
  } else {
    passwordInput.type = "password";
    eyeIcon.textContent = "👁️"; // Open-eye icon
  }
}

// Add this CSS to your stylesheet for the animation:
/*

*/