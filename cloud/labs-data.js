const labData = [
  {
    month: "Month 1: Foundation & Website Deployment",
    labs: [
      {
        title: "Build a Website on Google Cloud",
        desc: "Deploy and manage a static or dynamic website on GCP.",
        link: "https://partner.cloudskillsboost.google/course_templates/638"
      },
      {
        title: "Develop Your GCP Network",
        desc: "Configure and secure a network using VPC and firewall rules.",
        link: "https://partner.cloudskillsboost.google/course_templates/625"
      },

    ]
  },
  {
    month: "Month 2: App Environment & Messaging",
    labs: [
      {
        title: "Set Up App Dev Environment",
        desc: "Set up a dev environment using Cloud Shell, Git, and Cloud Run.",
        link: "https://partner.cloudskillsboost.google/course_templates/637"
      },
      {
        title: "Implement Messaging with Pub/Sub",
        desc: "Develop a pub/sub model to send & receive messages.",
        link: "https://partner.cloudskillsboost.google/course_templates/728/labs/511432"
      },
      {
        title: "Deploy App using Cloud Run",
        desc: "Deploy a containerized app using Cloud Build & Cloud Run.",
        link: "https://partner.cloudskillsboost.google/focuses/60089?parent=catalog"
      }
    ]
  },
  {
    month: "Month 3: DevOps & Kubernetes",
    labs: [
      {
        title: "CI/CD DevOps Workflows",
        desc: "Build a CI/CD pipeline with Cloud Build and Source Repos.",
        link: "https://partner.cloudskillsboost.google/course_templates/716"
      },
      {
        title: "Build ML Pipeline on Vertex AI",
        desc: "Automate a basic ML pipeline using Vertex AI and BigQuery.",
        link: "https://partner.cloudskillsboost.google/focuses/41025?parent=catalog"
      },
      {
        title: "Create and Manage Cloud SQL for PostgreSQL Instances",
        desc: "Create and manage Cloud SQL instances for PostgreSQL.",
        link: "https://partner.cloudskillsboost.google/course_templates/652"
      },
      {
        title: "Build a Data Mesh with Dataplex",
        desc: "Implement a data mesh architecture using Dataplex.",
        link: "https://partner.cloudskillsboost.google/course_templates/681"
      }
    ]
  },
  {
    month: "Month 2: Machine Learning & Data Engineering",
    labs: [
      {
        title: "Prepare Data for ML APIs on Google Cloud",
        desc: "Prepare data for machine learning APIs on Google Cloud.",
        link: "https://partner.cloudskillsboost.google/course_templates/631"
      },
      {
        title: "Streaming Analytics into BigQuery",
        desc: "Stream data into BigQuery for real-time analytics.",
        link: "https://partner.cloudskillsboost.google/course_templates/752"
      },
      {
        title: "Automate Data Capture at Scale with Document AI",
        desc: "Use Document AI to automate data capture processes.",
        link: "https://partner.cloudskillsboost.google/course_templates/674"
      },
      {
        title: "Build a Data Warehouse with BigQuery",
        desc: "Design and implement a data warehouse using BigQuery.",
        link: "https://partner.cloudskillsboost.google/course_templates/624"
      }
    ]
  },
  {
    month: "Month 3: Advanced Cloud Architectures",
    labs: [
      {
        title: "Create and Manage Cloud Spanner Instances",
        desc: "Create and manage Cloud Spanner instances.",
        link: "https://partner.cloudskillsboost.google/course_templates/643"
      },
      {
        title: "Develop Serverless Apps with Firebase",
        desc: "Build serverless applications using Firebase.",
        link: "https://partner.cloudskillsboost.google/course_templates/649"
      },
      {
        title: "Use Functions, Formulas, and Charts in Google Sheets",
        desc: "Enhance your skills in Google Sheets.",
        link: "https://partner.cloudskillsboost.google/course_templates/776"
      },
      {
        title: "Get Started with API Gateway",
        desc: "Set up and manage APIs using API Gateway.",
        link: "https://partner.cloudskillsboost.google/course_templates/662"
      },
      {
        title: "Create a Secure Data Lake on Cloud Storage",
        desc: "Implement a secure data lake architecture on Cloud Storage.",
        link: "https://partner.cloudskillsboost.google/course_templates/704"
      }
    ]
  }
];

window.renderCatalog = function () {
  const container = document.getElementById("labs-container");
  if (!container) return;

  container.innerHTML = '';
  const completedLabs = JSON.parse(localStorage.getItem('completedLabs') || '{}');

  labData.forEach(monthBlock => {
    const monthDiv = document.createElement("div");
    monthDiv.classList.add("month");
    monthDiv.style.marginBottom = "32px";

    const heading = document.createElement("h3");
    heading.textContent = monthBlock.month;
    heading.style.color = "var(--text-secondary)";
    heading.style.fontSize = "14px";
    heading.style.textTransform = "uppercase";
    heading.style.letterSpacing = "1px";
    heading.style.marginBottom = "16px";
    heading.style.borderBottom = "1px solid var(--border-color)";
    heading.style.paddingBottom = "8px";
    monthDiv.appendChild(heading);

    const labContainer = document.createElement("div");
    labContainer.classList.add("lab-container");
    labContainer.style.display = "grid";
    labContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
    labContainer.style.gap = "24px";

    monthBlock.labs.forEach(lab => {
      const isCompleted = completedLabs[lab.title];
      const labCard = document.createElement("div");
      labCard.classList.add("lab-card");
      if (isCompleted) labCard.classList.add("completed");

      labCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <div class="course-tag" style="background:${isCompleted ? '#e6f4ea' : 'var(--bg-app)'}; color:${isCompleted ? 'var(--success)' : 'var(--text-secondary)'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
            ${isCompleted ? 'Completed' : 'Task'}
          </div>
          ${isCompleted ? '<span class="material-icons-round" style="color:var(--success);">check_circle</span>' : ''}
        </div>
        
        <h3 style="font-size:18px; font-weight:500; margin:0 0 8px; color:var(--text-primary); line-height:1.4;">${lab.title}</h3>
        <p style="font-size:14px; color:var(--text-secondary); margin:0 0 24px; line-height:1.5; flex:1;">${lab.desc}</p>
        
        <div style="display:flex; gap:12px; align-items:center; margin-top:auto; border-top:1px solid var(--border-color); padding-top:16px;">
          <a href="${lab.link}" target="_blank" style="text-decoration:none; color:var(--primary); font-weight:500; font-size:14px; display:flex; align-items:center; gap:4px;">
            Open <span class="material-icons-round" style="font-size:16px;">open_in_new</span>
          </a>
          
          <button onclick="openSubmissionModal('${lab.title}')" style="background:none; border:none; color:var(--text-secondary); font-weight:500; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:4px; padding:4px 8px; border-radius:4px; transition:background 0.2s;">
            <span class="material-icons-round" style="font-size:18px;">upload_file</span> Submit
          </button>

          <button onclick="toggleComplete('${lab.title}')" title="${isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}" 
            style="margin-left:auto; background:none; border:none; cursor:pointer; color:${isCompleted ? 'var(--success)' : 'var(--text-secondary)'}; padding:4px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background 0.2s;">
            <span class="material-icons-round" style="font-size:24px;">${isCompleted ? 'check_circle' : 'radio_button_unchecked'}</span>
          </button>
        </div>
      `;

      labContainer.appendChild(labCard);
    });

    monthDiv.appendChild(labContainer);
    container.appendChild(monthDiv);
  });
};

// Initial Render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.renderCatalog);
} else {
  window.renderCatalog();
}