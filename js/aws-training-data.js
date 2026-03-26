const trainingPrograms = [
    {
        title: "AWS Cloud Practitioner Training",
        originalPrice: 2499,
        details: [
            "Introductory training on AWS Cloud concepts and services.",
            "Basic hands-on labs and demos on AWS tools and features.",
            "Mentorship via email support or live chat.",
            "Live sessions for 3 weeks by expert trainers."
        ]
    },
    {
        title: "AWS Solutions Architect Associate Training",
        originalPrice: 3999,
        details: [
            "Comprehensive training on AWS Solutions Architect Associate Certification topics.",
            "Hands-on labs and practical sessions on AWS services and solutions.",
            "Mentorship via email support or live chat.",
            "Live sessions for 3 weeks by expert trainers."
        ]
    },
    {
        title: "AWS Solutions Architect Professional Training",
        originalPrice: 5999,
        details: [
            "Advanced training on AWS Solutions Architect Professional Certification topics.",
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
    if (!container) return;
    container.innerHTML = "";

    trainingPrograms.forEach(program => {
        // Generate features list
        const featuresList = program.details.map(detail => `
      <li>
        <i class="fas fa-check-circle me-2 text-success"></i>
        ${detail}
      </li>
    `).join('');

        // Construct card HTML
        const cardHtml = `
      <div class="col-md-4 mb-4" data-aos="fade-up">
        <div class="card pricing-card h-100 border-0 shadow-sm position-relative overflow-hidden">
          
          <!-- Decorative Background Elements -->
          <div class="position-absolute top-0 end-0 mt-3 me-3 opacity-10">
            <i class="fab fa-aws fa-4x text-primary" style="transform: rotate(15deg);"></i>
          </div>
          <div class="position-absolute bottom-0 start-0 translate-middle rounded-circle bg-primary opacity-10" style="width: 150px; height: 150px; filter: blur(40px);"></div>

          <div class="card-body p-4 p-xl-5 d-flex flex-column position-relative z-index-2">
            
            <!-- Header section -->
            <div class="text-center border-bottom pb-4 mb-4">
              <div class="icon-wrapper bg-primary-subtle text-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 70px; height: 70px;">
                <i class="fas fa-certificate fa-2x"></i>
              </div>
              <h4 class="card-title fw-bold mb-3" style="min-height: 58px; display: flex; align-items: center; justify-content: center;">
                ${program.title}
              </h4>
              <div class="price-block mb-3">
                <span class="fs-5 text-muted align-top me-1">₹</span>
                <span class="display-4 fw-bold text-primary">${program.originalPrice}</span>
              </div>
              <p class="text-muted small mb-0">Includes 3 weeks of live sessions</p>
            </div>

            <!-- Features list -->
            <ul class="list-unstyled flex-grow-1 mb-4">
              ${featuresList}
            </ul>

            <!-- CTA Button -->
            <div class="mt-auto pt-4 text-center">
               <button class="btn btn-primary btn-lg w-100 rounded-pill fw-semibold shadow-sm hover-lift" data-bs-toggle="modal" data-bs-target="#trainingModal" onclick="checkSelectedTraining('${program.title}')">
                Enroll Now <i class="fas fa-arrow-right ms-2 fs-6"></i>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    `;

        container.innerHTML += cardHtml;
    });
}

// Ensure execution waits for DOM to be ready
document.addEventListener("DOMContentLoaded", renderTrainingPrograms);

// Store the selected training globally so the modal script can access it
let currentSelectedTraining = null;

function checkSelectedTraining(trainingName) {
    currentSelectedTraining = trainingName;
    updateModalTitle(trainingName);

    // Set certification path to AWS automatically based on file context
    setTimeout(() => {
        const certPathSelect = document.getElementById('certificationPath');
        if (certPathSelect) {
            certPathSelect.value = "AWS";

            const gcpField = document.getElementById('gcpCertificationField');
            if (gcpField) gcpField.style.display = 'none';

            const awsField = document.getElementById('awsCertificationField');
            if (awsField) awsField.style.display = 'block';
            awsField.setAttribute('required', 'required');

            certPathSelect.dispatchEvent(new Event('change'));
        }
    }, 100);
}

function updateModalTitle(trainingName) {
    const modalTitle = document.getElementById("trainingModalLabel");
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-graduation-cap me-2 text-primary"></i> Enroll: ${trainingName}`;
    }
}

// Function to submit training data
function submitTrainingConfig() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const experience = document.getElementById("experience").value;
    const linkedin = document.getElementById("linkedin").value.trim();
    const certificationPath = document.getElementById("certificationPath").value;
    const preferredCertification = document.getElementById("awsCertification").value;

    if (!fullName || !email || !phoneNumber || !experience || !linkedin || !certificationPath || !preferredCertification) {
        Swal.fire({
            icon: "error",
            title: "Missing Information",
            text: "Please fill in all mandatory fields before submitting.",
        });
        return;
    }

    // Define pricing based on selected training
    let trainingPrice = 0;
    let selectedTrainingTitle = currentSelectedTraining || "AWS Training Program";

    // Find price in mapping
    const foundProgram = trainingPrograms.find(p => p.title === selectedTrainingTitle);
    if (foundProgram) {
        trainingPrice = foundProgram.originalPrice;
    } else {
        // Default fallback values if not found (shouldn't happen with updated logic)
        if (selectedTrainingTitle.includes("Practitioner")) trainingPrice = 2499;
        else if (selectedTrainingTitle.includes("Associate")) trainingPrice = 3999;
        else if (selectedTrainingTitle.includes("Professional")) trainingPrice = 5999;
    }

    // Pre-fill the Razorpay estimate form behind the scenes
    const serviceConfigStr = JSON.stringify({
        service: "Cloud Training Solutions",
        name: selectedTrainingTitle,
        priceDetails: { Base: `₹${trainingPrice}`, Total: `₹${trainingPrice}` },
        currency: "INR",
        amount: trainingPrice * 100 // Razorpay takes amount in paise
    });

    const description = `Enrollment for ${selectedTrainingTitle}`;
    const additionalDetails = {
        "Full Name": fullName,
        "Email": email,
        "Phone Number": phoneNumber,
        "Experience Level": experience,
        "LinkedIn Profile": linkedin,
        "Certification Path": certificationPath,
        "Specific Certification": preferredCertification
    };

    startRazorpayPreFilled(serviceConfigStr, description, "IN", additionalDetails);

    // Close the modal and show a nice loading state
    const modalElement = document.getElementById('trainingModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
}

function startRazorpayPreFilled(serviceConfigStr, description, country, extraData) {
    // This depends on variables defined in pricing.html, usually currentEstimate, etc.
    // We'll trust pricing.html has defined these and the payNow function

    // Set global variables used by pricing.html's payNow() function
    window.currentEstimate = JSON.parse(serviceConfigStr).amount / 100; // in rupees
    window.currentCurrency = "INR";

    // Save additional data globally so our webhook can catch it
    window.trainingFormData = extraData;

    // We immediately call the payment gateway rather than going through the "Generate Estimate" UI
    payNow(description);
}

// Wait for Razorpay checkout, using a modified payNow to accept description
/* Important: This assumes a globally available payNow() exists which takes the training configuration, 
   but pricing.html might not have a modified payNow that supports this. 
   Assuming the main pricing.js/html handles regular payNow, our logic here tries to hook into it. */
