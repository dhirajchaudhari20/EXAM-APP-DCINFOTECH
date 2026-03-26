
// Job data array
const jobs = [
  {
    title: "GCP Cloud Engineer Intern",
    description: "Design and deploy scalable cloud-based solutions using Google Cloud Platform (GCP).",
    location: "Mumbai, Maharashtra",
    type: "Internship",
    shareUrl: "hiring/index.html"
  },
  {
    title: "Web Developer Intern",
    description: "Develop and maintain responsive websites and web applications.",
    location: "Mumbai, Maharashtra",
    type: "Internship",
    shareUrl: "hiring/webdev.html"
  },
  {
    title: "Backend Developer",
    description: "Build and optimize server-side logic, databases, and integrations for web and mobile applications.",
    location: "Mumbai, Maharashtra",
    type: "Full-Time",
    shareUrl: "hiring/backend.html"
  },
  {
    title: "Cloud Engineer",
    description: "Design and deploy scalable cloud-based solutions using Google Cloud Platform (GCP).",
    location: "Mumbai, Maharashtra",
    type: "Full-Time",
    shareUrl: "hiring/cloud.html"
  },
  {
    title: "Full Stack Developer",
    description: "Develop both frontend and backend systems. Expertise in JavaScript frameworks and APIs is required.",
    location: "Mumbai, Maharashtra",
    type: "Full-Time",
    shareUrl: "hiring/fullstack.html"
  }
];

// Render jobs
function renderJobs(filter = "") {
  const jobsList = document.getElementById('jobs-list');
  const noResults = document.getElementById('no-results');
  let filtered = jobs.filter(job =>
    job.title.toLowerCase().includes(filter) ||
    job.description.toLowerCase().includes(filter) ||
    job.location.toLowerCase().includes(filter) ||
    job.type.toLowerCase().includes(filter)
  );
  if (filtered.length === 0) {
    jobsList.innerHTML = "";
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";
  jobsList.innerHTML = filtered.map(job => `
        <div class="col d-flex">
          <div class="career-card w-100 d-flex flex-column">
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <ul>
              <li><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${job.location}</li>
              <li><i class="fas fa-briefcase"></i> <strong>Type:</strong> ${job.type}</li>
            </ul>
            <div class="mt-auto">
              <button class="btn btn-outline-secondary mb-2 me-2" onclick="openSharePopup('${encodeURIComponent(job.title)}','${encodeURIComponent(job.description)}','${encodeURIComponent(job.shareUrl)}')"><i class="fas fa-share"></i> Share</button>
              <button class="btn btn-gradient mb-2" onclick="openApplyModal('${job.title}')"><i class="fas fa-paper-plane"></i> Apply for this Job</button>
            </div>
          </div>
        </div>
      `).join('');
}
renderJobs();

// Search functionality
document.getElementById('search-button').addEventListener('click', function () {
  const searchTerm = document.getElementById('job-search-input').value.trim().toLowerCase();
  renderJobs(searchTerm);
});
document.getElementById('job-search-input').addEventListener('keyup', function (e) {
  if (e.key === "Enter") {
    document.getElementById('search-button').click();
  }
});

// Share popup logic
function openSharePopup(title, description, url) {
  title = decodeURIComponent(title);
  description = decodeURIComponent(description);
  url = decodeURIComponent(url);
  const fullUrl = `https://dcinfotech.org.in
/${url}`;
  document.getElementById("whatsappShare").href = `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%0A${encodeURIComponent(description)}%0AApply here: ${encodeURIComponent(fullUrl)}`;
  document.getElementById("facebookShare").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  document.getElementById("twitterShare").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}%20-%20${encodeURIComponent(description)}%20Apply%20here:%20${encodeURIComponent(fullUrl)}`;
  document.getElementById("instagramShare").onclick = function () {
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert("URL copied to clipboard! You can paste it in your Instagram bio or story.");
    });
  };
  document.getElementById("sharePopup").style.display = "flex";
}
function closeSharePopup() {
  document.getElementById("sharePopup").style.display = "none";
}

// Apply modal logic
function openApplyModal(jobTitle) {
  document.getElementById('jobModalLabel').innerText = `Apply for ${jobTitle}`;
  // Reset form
  document.getElementById('jobApplicationForm').reset();
  // Show modal
  var jobModal = new bootstrap.Modal(document.getElementById('jobModal'));
  jobModal.show();
}

// Handle application form submit
document.getElementById('jobApplicationForm').addEventListener('submit', function (e) {
  e.preventDefault();
  // You can add AJAX here to send data to your backend
  alert("Application submitted! Thank you.");
  var jobModal = bootstrap.Modal.getInstance(document.getElementById('jobModal'));
  jobModal.hide();
});
