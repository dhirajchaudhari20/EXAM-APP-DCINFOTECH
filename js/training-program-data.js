const trainingPrograms = [
  {
    title: "Foundational Certification Training",
    originalPrice: 2499,
    details: [
      "Introductory training on Google Cloud concepts and services.",
      "Basic hands-on labs and demos on GCP tools and features.",
      "Mentorship via email support or live chat.",
      "Live sessions for 3 weeks by expert trainers."
    ]
  },
  {
    title: "Associate Certification Training",
    originalPrice: 3999,
    details: [
      "Comprehensive training on Google Cloud Associate Certification topics.",
      "Hands-on labs and practical sessions on GCP services and solutions.",
      "Mentorship via email support or live chat.",
      "Live sessions for 3 weeks by expert trainers."
    ]
  },
  {
    title: "Professional Certification Training",
    originalPrice: 5999,
    details: [
      "Advanced training on Google Cloud Professional Certification topics.",
      "In-depth labs, case studies, and real-world scenarios for implementation.",
      "Mentorship via email support or live chat.",
      "Internship Opportunity: High performers can apply for an internship as Cloud Engineer Interns.",
      "Live sessions for 3 weeks by expert trainers."
    ]
  }
];
console.log(trainingPrograms);

function renderTrainingPrograms() {
  const container = document.getElementById('pricing-cards');
  container.innerHTML = "";

  trainingPrograms.forEach(program => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';
    colDiv.setAttribute('data-aos', 'fade-up');

    const cardDiv = document.createElement('div');
    cardDiv.className = 'pricing-card';

    const titleEl = document.createElement('h4');
    titleEl.textContent = program.title;
    cardDiv.appendChild(titleEl);

    const priceEl = document.createElement('p');
    priceEl.className = 'price';
    priceEl.innerHTML = `<strong>₹${program.originalPrice}</strong>`;
    cardDiv.appendChild(priceEl);

    const ulEl = document.createElement('ul');
    program.details.forEach(detail => {
      const liEl = document.createElement('li');
      liEl.textContent = detail;
      ulEl.appendChild(liEl);
    });
    cardDiv.appendChild(ulEl);

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary apply-btn';
    btn.textContent = 'Register';
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#trainingModal');
    cardDiv.appendChild(btn);

    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
  });
}

document.addEventListener('DOMContentLoaded', renderTrainingPrograms);


// Modal form submission code
document.getElementById('applyTrainingButton').addEventListener('click', function () {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  const experience = document.getElementById('experience').value.trim();
  const linkedin = document.getElementById('linkedin').value.trim();
  const certificationPath = document.getElementById('certificationPath').value.trim();

  if (!fullName || !email || !phoneNumber || !experience || !certificationPath) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please fill in all required fields.'
    });
    return;
  }

  document.getElementById('loadingSpinner').style.display = 'block';

  // Data payload matching your Google Sheet columns exactly
  const data = {
    "data": [
      {
        "Enter your full name": fullName,
        "Enter your email address": email,
        "Enter your phone number": phoneNumber,
        "Select experience level": experience,
        "Enter your LinkedIn profile URL": linkedin,
        "Certification Path (GCP/AWS)": certificationPath

      }
    ]
  };

  fetch('https://sheetdb.io/api/v1/vq29nr78085m9', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => {
      document.getElementById('loadingSpinner').style.display = 'none';
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Thank you for registering ${fullName}! Our team will contact you soon.! `
        });
        document.getElementById('trainingApplicationForm').reset();
      } else {
        response.json().then(err => {
          console.error('Response Error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Failed to submit application. ${err.error || 'Please try again.'}`
          });
        });
      }
    })
    .catch(error => {
      document.getElementById('loadingSpinner').style.display = 'none';
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred. Please try again.'
      });
    });
});