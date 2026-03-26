
    // Extended and detailed services with maintenance time
    const services = [
      {
        name: "Main Website",
        desc: "Corporate homepage, landing pages, and blog.",
        type: "Web App",
        status: "up",
        details: "All systems operational",
        icon: "fa-globe"
      },
      {
        name: "Client Portal",
        desc: "Customer login, billing, ticketing, and support.",
        type: "SaaS App",
        status: "up",
        details: "No issues reported",
        icon: "fa-user-shield"
      },
      {
        name: "API Gateway",
        desc: "REST API for integrations, partners, and automation.",
        type: "API",
        status: "warning",
        details: "Minor latency detected",
        icon: "fa-plug"
      },
      {
        name: "Cloud Storage",
        desc: "File storage, backup, and secure document sharing.",
        type: "Cloud Service",
        status: "maintenance",
        details: "Scheduled maintenance (starts at 2:00 AM, lasts 1 hour)",
        icon: "fa-cloud",
        maintenanceStart: getNextMaintenanceDate("02:00"), // next 2:00 AM
        maintenanceDurationMinutes: 60
      },
      {
        name: "Email Service",
        desc: "Transactional, notification, and marketing emails.",
        type: "SaaS App",
        status: "down",
        details: "Service disruption, engineers investigating. Impact: Some users may not receive emails.",
        icon: "fa-envelope"
      },
      {
        name: "Learning Portal",
        desc: "Online training, certifications, quizzes, and resources. Tracks progress and issues certificates.",
        type: "Learning",
        status: "up",
        details: "All modules accessible. No reported issues.",
        icon: "fa-graduation-cap"
      },
      {
        name: "SAP Integration",
        desc: "SAP S/4HANA, ERP connectors, and real-time data sync.",
        type: "SAP App",
        status: "up",
        details: "Operational. All SAP jobs running on schedule.",
        icon: "fa-cubes"
      },
      {
        name: "Database Cluster",
        desc: "Managed PostgreSQL, MySQL, and MongoDB clusters. High availability and daily backups.",
        type: "Cloud DB",
        status: "up",
        details: "Healthy. No replication lag.",
        icon: "fa-database"
      },
      {
        name: "Mobile App",
        desc: "Android/iOS app for client access, notifications, and account management.",
        type: "Mobile",
        status: "up",
        details: "No issues. Push notifications working.",
        icon: "fa-mobile-alt"
      },
      {
        name: "Admin Dashboard",
        desc: "Internal admin, analytics, and monitoring tools.",
        type: "Internal",
        status: "up",
        details: "All features working. No alerts.",
        icon: "fa-chart-line"
      },
      {
        name: "Notification Service",
        desc: "Push/SMS/email notifications for users and admins.",
        type: "Service",
        status: "up",
        details: "Operational. All channels active.",
        icon: "fa-bell"
      },
      {
        name: "Backup Service",
        desc: "Automated daily and weekly backups for all critical data.",
        type: "Cloud Service",
        status: "up",
        details: "Last backup successful at 2:00 AM.",
        icon: "fa-hdd"
      },
      {
        name: "Payment Gateway",
        desc: "Online payments, invoicing, and refunds.",
        type: "API",
        status: "up",
        details: "All payment methods available. No failed transactions.",
        icon: "fa-credit-card"
      },
      {
        name: "Partner API",
        desc: "APIs for third-party partners and integrations.",
        type: "API",
        status: "up",
        details: "No issues. All endpoints responsive.",
        icon: "fa-handshake"
      },
          {
        name: "Cloud Storage",
        desc: "File storage, backup, and secure document sharing. Encrypted at rest.",
        type: "Cloud Service",
        status: "maintenance",
        details: "Scheduled maintenance (starts at 2:00 AM, lasts 1 hour)",
        icon: "fa-cloud",
        maintenanceStart: getNextMaintenanceDate("02:00"),
        maintenanceDurationMinutes: 60
      },
      {
        name: "Email Service",
        desc: "Transactional, notification, and marketing emails. DKIM/SPF enabled.",
        type: "SaaS App",
        status: "down",
        details: "Service disruption, engineers investigating. Impact: Some users may not receive emails.",
        icon: "fa-envelope"
      },
      {
        name: "Learning Portal",
        desc: "Online training, certifications, quizzes, and resources. Tracks progress and issues certificates.",
        type: "Learning",
        status: "up",
        details: "All modules accessible. No reported issues.",
        icon: "fa-graduation-cap"
      },
      {
        name: "SAP Integration",
        desc: "SAP S/4HANA, ERP connectors, and real-time data sync. Secure VPN.",
        type: "SAP App",
        status: "up",
        details: "Operational. All SAP jobs running on schedule.",
        icon: "fa-cubes"
      },
      {
        name: "Database Cluster",
        desc: "Managed PostgreSQL, MySQL, and MongoDB clusters. High availability and daily backups.",
        type: "Cloud DB",
        status: "up",
        details: "Healthy. No replication lag. Backups verified.",
        icon: "fa-database"
      },
      {
        name: "Mobile App",
        desc: "Android/iOS app for client access, notifications, and account management.",
        type: "Mobile",
        status: "up",
        details: "No issues. Push notifications working.",
        icon: "fa-mobile-alt"
      },
      {
        name: "Admin Dashboard",
        desc: "Internal admin, analytics, and monitoring tools. Access restricted.",
        type: "Internal",
        status: "up",
        details: "All features working. No alerts.",
        icon: "fa-chart-line"
      },
      {
        name: "Notification Service",
        desc: "Push/SMS/email notifications for users and admins. Multi-channel.",
        type: "Service",
        status: "up",
        details: "Operational. All channels active.",
        icon: "fa-bell"
      },
      {
        name: "Backup Service",
        desc: "Automated daily and weekly backups for all critical data. Geo-redundant.",
        type: "Cloud Service",
        status: "up",
        details: "Last backup successful at 2:00 AM.",
        icon: "fa-hdd"
      },
      {
        name: "Payment Gateway",
        desc: "Online payments, invoicing, and refunds. PCI DSS compliant.",
        type: "API",
        status: "up",
        details: "All payment methods available. No failed transactions.",
        icon: "fa-credit-card"
      },
      {
        name: "Partner API",
        desc: "APIs for third-party partners and integrations. OAuth2 secured.",
        type: "API",
        status: "up",
        details: "No issues. All endpoints responsive.",
        icon: "fa-handshake"
      },
      {
        name: "HR Portal",
        desc: "Employee self-service, leave, payroll, and onboarding.",
        type: "Internal",
        status: "up",
        details: "All HR features available.",
        icon: "fa-users"
      },
      {
        name: "Recruitment System",
        desc: "Job postings, candidate tracking, and interview scheduling.",
        type: "Internal",
        status: "up",
        details: "No issues. All workflows operational.",
        icon: "fa-user-tie"
      },
      {
        name: "Knowledge Base",
        desc: "Internal and public documentation, FAQs, and guides.",
        type: "Docs",
        status: "up",
        details: "Accessible. Last updated today.",
        icon: "fa-book"
      },
      {
        name: "Video Conferencing",
        desc: "Secure video meetings for staff and clients.",
        type: "Service",
        status: "up",
        details: "All bridges available. No outages.",
        icon: "fa-video"
      },
      {
        name: "Live Chat",
        desc: "Real-time chat support for clients and prospects.",
        type: "Support",
        status: "up",
        details: "Agents online. Avg. response < 1 min.",
        icon: "fa-comments"
      },
      {
        name: "File Transfer",
        desc: "Large file upload/download for clients and partners.",
        type: "Cloud Service",
        status: "up",
        details: "No issues. 2TB free space.",
        icon: "fa-file-upload"
      },
      {
        name: "Monitoring & Alerts",
        desc: "Automated monitoring, alerting, and incident response.",
        type: "Internal",
        status: "up",
        details: "All sensors green. No incidents.",
        icon: "fa-eye"
      },
      {
        name: "DevOps CI/CD",
        desc: "Continuous integration and deployment pipelines.",
        type: "Internal",
        status: "up",
        details: "All pipelines passing. Deployments on schedule.",
        icon: "fa-code-branch"
      },
      {
        name: "DNS Service",
        desc: "Managed DNS for all domains. Fast global propagation.",
        type: "Cloud Service",
        status: "up",
        details: "All records healthy.",
        icon: "fa-globe-asia"
      },
      {
        name: "Firewall & Security",
        desc: "Network firewall, DDoS protection, and threat monitoring.",
        type: "Security",
        status: "up",
        details: "No threats detected. All rules active.",
        icon: "fa-shield-alt"
      },
      {
        name: "Test Sandbox",
        desc: "Isolated environment for client and internal testing.",
        type: "Sandbox",
        status: "up",
        details: "Sandbox ready. Reset daily.",
        icon: "fa-flask"
      }
    ];

    // Helper: Get next maintenance date at a specific time (e.g., "02:00")
    function getNextMaintenanceDate(timeStr) {
      const [h, m] = timeStr.split(":").map(Number);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (now > next) next.setDate(next.getDate() + 1);
      return next;
    }

    // Render status table with maintenance timer
    function renderStatusTable(filter = '') {
      const tbody = document.querySelector("#statusTable tbody");
      tbody.innerHTML = "";
      services
        .filter(s => s.name.toLowerCase().includes(filter.toLowerCase()) || s.desc.toLowerCase().includes(filter.toLowerCase()))
        .forEach((s, idx) => {
          let maintenanceHtml = "";
          if (s.status === "maintenance" && s.maintenanceStart) {
            maintenanceHtml = `<div class="maintenance-timer" id="maintenance-timer-${idx}">
              <i class="fa-solid fa-clock"></i>
              Maintenance starts in <span class="timer-value">...</span>
            </div>`;
          }
          tbody.innerHTML += `
            <tr>
              <td>
                <span class="service-title">
                  <i class="fa ${s.icon}"></i>
                  ${s.name}
                  ${s.status === 'up' ? '<span class="live-dot"></span>' : ''}
                </span>
                <span class="service-desc">${s.desc}</span>
                ${maintenanceHtml}
              </td>
              <td>${s.type}</td>
              <td class="status">${statusIcon(s.status)}</td>
              <td>${s.details}</td>
            </tr>
          `;
        });
      updateMaintenanceTimers();
    }

    function statusIcon(status) {
      switch(status) {
        case "up": return '<i class="fa-solid fa-circle status-up"></i> <span class="status-up">Operational</span>';
        case "down": return '<i class="fa-solid fa-circle status-down"></i> <span class="status-down">Down</span>';
        case "warning": return '<i class="fa-solid fa-circle status-warning"></i> <span class="status-warning">Degraded</span>';
        case "maintenance": return '<i class="fa-solid fa-circle status-maintenance"></i> <span class="status-maintenance">Maintenance</span>';
        default: return '<i class="fa-solid fa-circle"></i> Unknown';
      }
    }

    function updateLastChecked() {
      document.getElementById('lastChecked').textContent = 'Last checked: ' + new Date().toLocaleString();
    }

    function filterServices(value) {
      renderStatusTable(value);
    }

    // Maintenance countdown timers
    function updateMaintenanceTimers() {
      services.forEach((s, idx) => {
        if (s.status === "maintenance" && s.maintenanceStart) {
          const el = document.querySelector(`#maintenance-timer-${idx} .timer-value`);
          if (el) {
            const now = new Date();
            let diff = s.maintenanceStart - now;
            if (diff < 0) diff = 0;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const sec = Math.floor((diff % (1000 * 60)) / 1000);
            el.textContent = `${h}h ${m}m ${sec}s`;
          }
        }
      });
      setTimeout(updateMaintenanceTimers, 1000);
    }

    renderStatusTable();
    updateLastChecked();
    setInterval(() => { renderStatusTable(); updateLastChecked(); }, 60000);

    // Optional: Dark mode toggle
    function toggleMode() {
      document.body.classList.toggle('dark');
    }
