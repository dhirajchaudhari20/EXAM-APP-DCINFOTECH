// Updated student list
const nameInfoMapping = {
  "Vedansh Pandey": {
    "image": "https://i.ibb.co/ZpzmXTR7/This-Acknowledges-7.png",
    "email": "vedansh.pandey@example.com"
  },




  "Harinadh Patapanchula": {
    "image": "https://i.ibb.co/MxS5GQG9/This-Acknowledges.png",
    "email": "vedansh.pandey@example.com"
  },


  "Sudheer konduboina": {
    "image": "https://i.ibb.co/JRSRMh5J/This-Acknowledges-1.png",
    "email": "vedansh.pandey@example.com"
  },



  "Ajay Vitthal Guhade": {
    "image": "https://i.ibb.co/JWwTNMhW/This-Acknowledges-2.png",
    "email": "vedansh.pandey@example.com"
  },





  "Md khalid maqsood alam": {
    "image": "https://i.ibb.co/V0GHwtKD/Copy-of-This-Acknowledges.png",
    "email": "vedansh.pandey@example.com"
  },




  "Raja Chourashia": {
    "image": "https://i.ibb.co/Wvdy0PVx/Copy-of-This-Acknowledges-2.png",
    "email": "vedansh.pandey@example.com"
  },



  "Ayush Kumar Jha": {
    "image": "https://i.ibb.co/HDwMvsmp/Copy-of-This-Acknowledges-4.png",
    "email": "vedansh.pandey@example.com"
  },
  "Naina Ghosh": {
    "image": "https://i.ibb.co/PGLfxkG9/Copy-of-This-Acknowledges-5.png",
    "email": "vedansh.pandey@example.com"
  },




  //new students certificateds doest added yet 

  "DEVANG TYAGI": {
    "image": "https://i.ibb.co/RT2t62T8/b7769fd59c9c.png",
    "email": "devangtyagi@dcinfotech.org.in"
  },



  "Victor Jonathan": {
    "image": "https://i.ibb.co/PGLfxkG9/Copy-of-This-Acknowledges-5.png",
    "email": "vedansh.pandey@example.com"
  },




  "Adarsh Singh": {
    "image": "https://i.ibb.co/BHNSZ7QL/This-Acknowledges.png",
    "email": "vedansh.pandey@example.com"
  },

  "Rohan Rajak": {
    "image": "https://i.ibb.co/PGLfxkG9/Copy-of-This-Acknowledges-5.png",
    "email": "vedansh.pandey@example.com"
  },






















  "Ahmed Mohd Asif Ghare": {
    "image": "https://i.ibb.co/xt9vp3Qx/This-Acknowledges-1.png",
    "email": "vedansh.pandey@example.com"
  },



  "Aditya Gudla": {
    "image": "https://i.ibb.co/F9P0rvX/This-Acknowledges.png",
    "email": "adityagudla2005@gmail.com"
  },













  "Aditya Subhash Bansod": {
    "image": "https://i.ibb.co/xt1gK6kD/This-Acknowledges-1.png",
    "email": "vedansh.pandey@example.com"
  },


  "Vanshita Thakur": {
    "image": "https://i.ibb.co/mF64Rbbp/This-Acknowledges-2.png",
    "email": "vedansh.pandey@example.com"
  },













};


let userName = "";

// --- Check for URL parameters on page load ---
// --- Check for URL parameters on page load ---
document.addEventListener('DOMContentLoaded', () => {
  // Only run this logic if we are on the certificate portal page (check for specific elements)
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  if (!nameInput || !emailInput) return;

  const urlParams = new URLSearchParams(window.location.search);
  const nameFromUrl = urlParams.get('name');
  const emailFromUrl = urlParams.get('email');

  if (nameFromUrl && emailFromUrl) {
    nameInput.value = nameFromUrl;
    emailInput.value = emailFromUrl;
    // Automatically submit the form if data is from URL
    showLoading();
  }
});


function showLoading() {
  userName = document.getElementById("name").value;
  const e = document.getElementById("email").value;

  if (!userName || !e) {
    Notiflix.Notify.failure("Please enter both name and email.");
    return;
  }

  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("userEmail", e);

  // Show animated loading spinner with user greeting
  Notiflix.Loading.circle(`Loading your certificate, ${userName}...`);

  setTimeout(() => {
    Notiflix.Loading.remove();
    displayOfferLetters();
    showWelcomeMessage();
  }, 2000);
}

function displayOfferLetters() {
  const normalizedUserName = userName.trim().toLowerCase();
  const nameKey = Object.keys(nameInfoMapping).find(
    key => key.trim().toLowerCase() === normalizedUserName
  );

  const t = document.getElementById("offerLetterGrid");
  t.innerHTML = "";

  if (nameKey) {
    const { image: imageUrls } = nameInfoMapping[nameKey];
    const images = imageUrls && typeof imageUrls === 'string' ? imageUrls.split(',') : [];

    if (images.length > 0) {
      images.forEach((image, index) => {
        if (!image) return; // Skip if the image url is empty

        const fileCard = document.createElement("div");
        fileCard.classList.add("file-card");
        fileCard.style.animation = "fadeIn 0.5s ease-in-out";

        const img = document.createElement("img");
        img.src = image;
        img.alt = `${nameKey}'s Certificate ${index + 1}`;
        img.onclick = () => openModal(image);

        const downloadBtn = document.createElement("button");
        downloadBtn.classList.add("download-btn");
        downloadBtn.innerText = "Download PDF";
        downloadBtn.onclick = () => downloadAsPDF(image, `${nameKey}_Certificate_${index + 1}.pdf`);

        fileCard.appendChild(img);
        fileCard.appendChild(downloadBtn);
        t.appendChild(fileCard);
      });
    }

    t.style.display = "grid";
    document.getElementById("logout-btn").style.display = "block";
  } else {
    Notiflix.Notify.warning("No certificate found for this user.");
  }
}

/* ----------- FIXED PDF DOWNLOAD FUNCTION ----------- */
window.downloadAsPDF = async function (imageUrl, filename) {
  Notiflix.Loading.standard("Preparing PDF download...");

  try {
    if (typeof window.jspdf === "undefined") {
      Notiflix.Notify.failure("PDF library not loaded. Please refresh the page.");
      Notiflix.Loading.remove();
      return;
    }

    const { jsPDF } = window.jspdf;

    // Fetch image safely
    const response = await fetch(imageUrl + "?nocache=" + Date.now(), { mode: "cors" });
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();

    // Convert to Base64 for jsPDF
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    await new Promise(resolve => (reader.onload = resolve));
    const imageDataUrl = reader.result;

    // Load image to get dimensions
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageDataUrl;
    await new Promise(resolve => (img.onload = resolve));

    const imgWidth = img.width;
    const imgHeight = img.height;
    const orientation = imgWidth > imgHeight ? "l" : "p";

    const doc = new jsPDF({
      orientation,
      unit: "px",
      format: [imgWidth, imgHeight],
    });

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    const imgType = blob.type.includes("png") ? "PNG" : "JPEG";
    doc.addImage(imageDataUrl, imgType, 0, 0, pdfWidth, pdfHeight);

    doc.save(filename);
    Notiflix.Loading.remove();
    Notiflix.Notify.success("PDF downloaded successfully!");
  } catch (error) {
    console.error("PDF creation failed:", error);
    Notiflix.Loading.remove();
    Notiflix.Notify.failure("Failed to create PDF. Please try again later.");
  }
}

function showWelcomeMessage() {
  document.getElementById("personalGreeting").textContent = `Welcome, ${userName}!`;
  document.getElementById("personalGreeting").style.animation = "slideIn 1s ease";
}

function confirmLogout() {
  Notiflix.Confirm.show(
    "Logout Confirmation",
    "Are you sure you want to log out?",
    "Yes, Logout",
    "Cancel",
    () => {
      sessionStorage.clear();
      Notiflix.Notify.success(`Logged out successfully, ${userName}.`);
      setTimeout(() => location.reload(), 1000);
    }
  );
}

function openModal(imageSrc) {
  const modal = document.getElementById("modal");
  const modalImage = document.getElementById("modalImage");
  modalImage.src = imageSrc;
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

/* ----------- ANIMATIONS ----------- */
document.head.insertAdjacentHTML(
  "beforeend",
  `<style>
    @keyframes fadeIn { 0%{opacity:0;} 100%{opacity:1;} }
    @keyframes slideIn { 0%{transform:translateY(-20px);opacity:0;} 100%{transform:translateY(0);opacity:1;} }
  </style>`
);

/* ----------- SPEECH RECOGNITION ----------- */
document.addEventListener("DOMContentLoaded", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechSupported = SpeechRecognition;
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  if (!nameInput || !emailInput) return;

  function createVoiceButton() {
    const voiceBtn = document.createElement("button");
    voiceBtn.type = "button";
    voiceBtn.title = "Fill form with your voice";
    voiceBtn.innerHTML = "🎤";
    Object.assign(voiceBtn.style, {
      background: "#5a8dee",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: "38px",
      height: "38px",
      fontSize: "1.3em",
      marginLeft: "8px",
      cursor: "pointer",
      transition: "background 0.3s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    nameInput.parentNode.style.display = "flex";
    nameInput.parentNode.style.alignItems = "center";
    nameInput.parentNode.insertBefore(voiceBtn, nameInput.nextSibling);

    if (!isSpeechSupported) {
      voiceBtn.disabled = true;
      voiceBtn.title = "Voice input not supported in this browser.";
      voiceBtn.style.opacity = "0.5";
    }
    return voiceBtn;
  }

  function createHelpButton() {
    const helpBtn = document.createElement("button");
    helpBtn.type = "button";
    helpBtn.title = "How to use voice input";
    helpBtn.innerHTML = "❓";
    Object.assign(helpBtn.style, {
      background: "transparent",
      color: "#5a8dee",
      border: "none",
      fontSize: "1.5em",
      marginLeft: "4px",
      cursor: "pointer",
    });

    helpBtn.onclick = () => {
      Notiflix.Report.info(
        "How Voice Fill Works",
        `
          <div style="text-align:left;line-height:1.6;">
            <p>Follow these simple steps:</p>
            <ol>
              <li>Click 🎤 and say your full name</li>
              <li>Then say your email address</li>
              <li>The form will auto-fill and find your certificate</li>
            </ol>
            <p><b>Tips:</b></p>
            <ul>
              <li>"at" → @</li>
              <li>"dot" → .</li>
              <li>"underscore" → _</li>
              <li>"dash" → -</li>
            </ul>
          </div>`,
        "Got it"
      );
    };
    nameInput.parentNode.appendChild(helpBtn);
  }

  const voiceBtn = createVoiceButton();

  if (isSpeechSupported && voiceBtn) {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let step = null;

    voiceBtn.onclick = () => {
      step = "name";
      Notiflix.Notify.info("Please say your full name...", { timeout: 4000 });
      voiceBtn.style.background = "#2c8c47";
      voiceBtn.innerHTML = "🎙️";
      recognition.start();
    };

    recognition.onresult = e => {
      let transcript = e.results[0][0].transcript.trim();
      if (step === "name") {
        nameInput.value = transcript.replace(/\.$/, "");
      } else if (step === "email") {
        let email = transcript
          .toLowerCase()
          .replace(/ at the rate | at /g, "@")
          .replace(/ dot /g, ".")
          .replace(/ underscore /g, "_")
          .replace(/ dash | minus /g, "-")
          .replace(/\s/g, "")
          .replace(/attherate/g, "@");
        emailInput.value = email;
      }
    };

    recognition.onerror = e => {
      console.error("Speech recognition error:", e.error);
      Notiflix.Notify.failure("Couldn't recognize voice. Try again.");
      step = null;
    };

    recognition.onend = () => {
      if (step === "name") {
        step = "email";
        Notiflix.Notify.info("Now, please say your email...", { timeout: 4000 });
        recognition.start();
      } else if (step === "email") {
        voiceBtn.style.background = "#5a8dee";
        voiceBtn.innerHTML = "🎤";
        step = null;
        showLoading();
        setTimeout(() => {
          const downloadBtn = document.querySelector(".download-btn");
          if (downloadBtn) downloadBtn.click();
        }, 2500);
      }
    };
  }
  createHelpButton();
});
