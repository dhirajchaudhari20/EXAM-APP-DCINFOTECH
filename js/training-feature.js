// features.js

const features = [
    {
      icon: "fas fa-calendar-alt text-primary",
      title: "Course Duration:",
      description: "10 Weeks",
      additionalInfo: "Hands-on Sessions: Included\nStudy Parameters with Questions: Practice sessions provided with tailored questions"
    },
    {
      icon: "fas fa-laptop text-info",
      title: "Full Day Lab Access",
      description: "Google Cloud Labs Training:",
      additionalInfo: "Participants will get their unique Google Cloud Lab ID and account, enabling them to solve problems and perform real-time tasks and projects in the labs."
    },
    {
      icon: "fas fa-certificate text-warning",
      title: "Certification",
      description: "Earn a certification voucher upon completing the course.",
      additionalInfo: "The voucher is provided as part of the course and is not for sale."
    },
    {
      icon: "fas fa-chalkboard-teacher text-primary",
      title: "Live Instructor-Led Session",
      description: "By Google Cloud Authorized Trainer & Question Practice (if requested)",
      additionalInfo: ""
    },
    {
      icon: "fas fa-vote-yea text-success",
      title: "Certification Voucher:",
      description: "If you fail, we will retrain you and provide a new voucher to help you pass.",
      additionalInfo: ""
    },
    {
      icon: "fas fa-users text-danger",
      title: "Special Offer:",
      description: "Enroll with a friend, and you'll get a 50% discount on your next certification course.",
      additionalInfo: ""
    }
  ];
  
  function renderFeatures() {
    const container = document.querySelector("#features-container");
    container.innerHTML = features.map((feature, index) => `
      <div class="col" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="card text-center">
          <div class="card-body">
            <i class="${feature.icon} fa-3x mb-3"></i>
            <p><strong>${feature.title}</strong> ${feature.description}</p>
            ${feature.additionalInfo ? `<p class="text-muted">${feature.additionalInfo}</p>` : ""}
          </div>
        </div>
      </div>
    `).join("");
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    renderFeatures();
    AOS.init({ duration: 1000, once: true });
  });
  