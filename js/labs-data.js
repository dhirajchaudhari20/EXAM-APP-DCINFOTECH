window.labsTimeline = [
  {
    month: "Month 1: Cloud Foundation & App Development",
    labs: [
      {
        id: "lab1_1",
        title: "Build a Website on Google Cloud",
        desc: "Deploy and manage a static or dynamic website on GCP.",
        link: "https://partner.cloudskillsboost.google/course_templates/638"
      },
      {
        id: "lab1_2",
        title: "Develop Your GCP Network",
        desc: "Configure and secure a network using VPC and firewall rules.",
        link: "https://partner.cloudskillsboost.google/course_templates/625"
      },
      {
        id: "lab2_1",
        title: "Set Up App Dev Environment",
        desc: "Set up a dev environment using Cloud Shell, Git, and Cloud Run.",
        link: "https://partner.cloudskillsboost.google/course_templates/637"
      },
      {
        id: "lab2_2",
        title: "Implement Messaging with Pub/Sub",
        desc: "Develop a pub/sub model to send & receive messages.",
        link: "https://partner.cloudskillsboost.google/course_templates/728/labs/511432"
      },
      {
        id: "lab2_3",
        title: "Deploy App using Cloud Run",
        desc: "Deploy a containerized app using Cloud Build & Cloud Run.",
        link: "https://partner.cloudskillsboost.google/catalog_lab/6132"
      }
    ]
  },
  {
    month: "Month 2: DevOps, Kubernetes & Data Engineering",
    labs: [
      {
        id: "lab3_1",
        title: "CI/CD DevOps Workflows",
        desc: "Build a CI/CD pipeline with Cloud Build and Source Repos.",
        link: "https://partner.cloudskillsboost.google/course_templates/716"
      },
      {
        id: "lab3_2",
        title: "Create and Manage Cloud SQL for PostgreSQL Instances",
        desc: "Learn to create and manage Cloud SQL instances for PostgreSQL.",
        link: "https://partner.cloudskillsboost.google/course_templates/652"
      },
      {
        id: "lab3_3",
        title: "Build a Data Mesh with Dataplex",
        desc: "Implement a data mesh architecture using Dataplex.",
        link: "https://partner.cloudskillsboost.google/course_templates/681"
      },
      {
        id: "lab4_1",
        title: "Prepare Data for ML APIs on Google Cloud",
        desc: "Prepare data for machine learning APIs on Google Cloud.",
        link: "https://partner.cloudskillsboost.google/course_templates/631"
      },
      {
        id: "lab4_2",
        title: "Streaming Analytics into BigQuery",
        desc: "Stream data into BigQuery for real-time analytics.",
        link: "https://partner.cloudskillsboost.google/course_templates/752"
      },
      {
        id: "lab4_3",
        title: "Automate Data Capture at Scale with Document AI",
        desc: "Use Document AI to automate data capture processes.",
        link: "https://partner.cloudskillsboost.google/course_templates/674"
      },
      {
        id: "lab4_4",
        title: "Build a Data Warehouse with BigQuery",
        desc: "Design and implement a data warehouse using BigQuery.",
        link: "https://partner.cloudskillsboost.google/course_templates/624"
      }
    ]
  },
  {
    month: "Month 3: Advanced Cloud Architectures & Serverless",
    labs: [
      {
        id: "lab5_1",
        title: "Create and Manage Cloud Spanner Instances",
        desc: "Learn to create and manage Cloud Spanner instances.",
        link: "https://partner.cloudskillsboost.google/course_templates/643"
      },
      {
        id: "lab5_2",
        title: "Develop Serverless Apps with Firebase",
        desc: "Build serverless applications using Firebase.",
        link: "https://partner.cloudskillsboost.google/course_templates/649"
      },
      {
        id: "lab5_3",
        title: "Use Functions, Formulas, and Charts in Google Sheets",
        desc: "Enhance your skills in using functions, formulas, and charts in Google Sheets.",
        link: "https://partner.cloudskillsboost.google/course_templates/776"
      },
      {
        id: "lab5_4",
        title: "Get Started with API Gateway",
        desc: "Learn to set up and manage APIs using API Gateway.",
        link: "https://partner.cloudskillsboost.google/course_templates/662"
      },
      {
        id: "lab5_5",
        title: "Create a Secure Data Lake on Cloud Storage",
        desc: "Implement a secure data lake architecture on Cloud Storage.",
        link: "https://partner.cloudskillsboost.google/course_templates/704"
      }
    ]
  }
];

// Local Storage for completion status
function getCompletedLabs() {
  return JSON.parse(localStorage.getItem('completedLabs') || '{}');
}

function setCompletedLabs(completedLabs) {
  try {
    localStorage.setItem('completedLabs', JSON.stringify(completedLabs));
  } catch (e) {
    console.error('Failed to save to cloud sql storage:', e);
    alert('Error saving completion status. Please try again.');
  }
}

// Update progress bar with 3D animation and random motivation
function updateProgress() {
  const completedLabs = getCompletedLabs();
  const totalLabs = window.labsTimeline.reduce((sum, month) => sum + month.labs.length, 0);
  const completedCount = Object.keys(completedLabs).length;
  const progressPercentage = (completedCount / totalLabs) * 100;
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressStats');
  const motivationText = document.getElementById('motivationText');
  if (progressFill && progressText && motivationText) {
    // Trigger 3D flip animation
    const progressBar = document.querySelector('.progress-bar');
    progressBar.classList.add('flip-animation');
    setTimeout(() => progressBar.classList.remove('flip-animation'), 1000); // Match animation duration

    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `Progress: ${Math.round(progressPercentage)}% (${completedCount}/${totalLabs} labs)`;
    progressFill.style.transition = 'width 0.5s ease-in-out'; // Smooth width transition

    // Google Cloud–style motivational messages
    const motivations = [
      "Keep building on the cloud!",
      "You’re scaling like GCP!",
      "BigQuery-level progress!",
      "You deploy like a pro!",
      "Cloud skills unlocked!",
      "One step closer to certification!",
      "Kubernetes has nothing on you!",
      "You’re serverless and unstoppable!",
      "Stackdriver would be proud!",
      "Innovation mode: ON!",
      "Cloud Run, and you’re running ahead!",
      "Compute Engine vibes—powerful!",
      "Storage unlimited, just like your potential!",
      "AI/ML ready—keep training yourself!",
      "Your journey is as reliable as Cloud SQL!",
      "Resilient, just like GCP regions!",
      "Scaling globally like Cloud CDN!",
      "You’re mastering the cloud, one lab at a time!",
      "IAM: I Am Motivated!",
      "Future Cloud Architect in the making!"
    ];

    motivationText.textContent = motivations[Math.floor(Math.random() * motivations.length)];
  }
}

// Function to create confetti animation
function createConfetti(element) {
  const confettiCount = 50;
  const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    element.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
  }
}

// Render timeline with Mark as Completed, Submit, and View Lab buttons
function renderTimeline() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  timeline.innerHTML = ''; // Clear existing content
  const completedLabs = getCompletedLabs();

  window.labsTimeline.forEach(monthData => {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';
    monthDiv.innerHTML = `<h2>${monthData.month}</h2>`;
    const labContainer = document.createElement('div');
    labContainer.className = 'lab-container';

    monthData.labs.forEach(lab => {
      const isCompleted = completedLabs[lab.id];
      const labCard = document.createElement('div');
      labCard.className = `lab-card ${isCompleted ? 'completed' : ''}`;
      labCard.innerHTML = `
        <h3>${lab.title}</h3>
        <p>${lab.desc}</p>
        <a href="${lab.link}" target="_blank">Start Lab</a>
        <button class="submit-btn" data-lab-id="${lab.id}">Submit</button>
        <button class="mark-complete-btn ${isCompleted ? 'completed' : ''}" data-lab-id="${lab.id}">
          ${isCompleted ? 'Completed' : 'Mark as Completed'}
        </button>
      `;
      labContainer.appendChild(labCard);
    });

    monthDiv.appendChild(labContainer);
    timeline.appendChild(monthDiv);
  });

  // Event delegation for all buttons
  timeline.addEventListener('click', (e) => {
    const submitBtn = e.target.closest('.submit-btn');
    const markBtn = e.target.closest('.mark-complete-btn');

    if (submitBtn) {
      const labId = submitBtn.getAttribute('data-lab-id');
      document.getElementById('submissionModal').style.display = 'block';
      // Optional: Prefill form with labId if needed
    }

    if (markBtn) {
      const labId = markBtn.getAttribute('data-lab-id');
      const completedLabs = getCompletedLabs();
      if (!completedLabs[labId]) {
        markBtn.disabled = true; // Prevent multiple clicks
        completedLabs[labId] = true;
        setCompletedLabs(completedLabs);

        // Add sexy animation
        markBtn.classList.add('marking-animation');
        const labCard = markBtn.closest('.lab-card');
        labCard.classList.add('complete-animation');

        // Trigger confetti
        createConfetti(labCard);

        // Update after animation
        setTimeout(() => {
          markBtn.classList.remove('marking-animation');
          markBtn.classList.add('completed');
          markBtn.textContent = 'Completed';
          labCard.classList.remove('complete-animation');
          labCard.classList.add('completed');
          updateProgress();

          // ✅ Use Notiflix instead of alert
          Notiflix.Notify.success('Lab marked as completed and saved! 🎉', {
            position: 'right-bottom',
            timeout: 3000,  // 3 seconds
            cssAnimationStyle: 'zoom',
            showOnlyTheLastOne: true
          });

          markBtn.disabled = false; // Re-enable after save
        }, 1000); // Match animation duration

      }
    }
  });

  updateProgress();
}

// Initialize timeline on page load
document.addEventListener('DOMContentLoaded', renderTimeline);

// Enhanced close modal function with debug
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    console.log(`Closed modal: ${modalId}`);
  } else {
    console.error(`Modal with ID ${modalId} not found`);
  }
}

// Add event listeners for close buttons after DOM load
document.addEventListener('DOMContentLoaded', () => {
  const closeButtons = document.querySelectorAll('.modal .close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      closeModal(button.closest('.modal').id);
    });
  });
});