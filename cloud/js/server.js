// Extended and detailed services
let services = []; // Will hold the processed data with status

// Simulate fetching data from a server api
// Simulate fetching and checking status
async function fetchServices() {
  try {
    const response = await fetch('data/services.json');
    if (!response.ok) throw new Error("Failed to load services");
    const servicesList = await response.json();

    // Check status for each service with a URL
    const statusPromises = servicesList.map(async (service) => {
      // If no URL (or internal only), mimic "Up" or random state as placeholder
      if (!service.url) {
        return {
          ...service,
          status: "up",
          details: "Internal service operational",
          ...(Math.random() > 0.99 ? { status: "warning", details: "High load detected" } : {})
        };
      }

      // If URL exists, try to fetch it (PING)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const start = Date.now();
        // mode: 'no-cors' allows us to send request to other domains. 
        // We can't read content/status code (it returns opaque), but if it doesn't throw, it's reachable.
        await fetch(service.url, {
          mode: 'no-cors',
          signal: controller.signal,
          cache: 'no-store'
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - start;

        return {
          ...service,
          status: "up",
          details: `Real-time check: OK (${duration}ms)`,
          responseTime: duration
        };

      } catch (err) {
        return {
          ...service,
          status: "down",
          details: "Connection timed out or refused."
        };
      }
    });

    return await Promise.all(statusPromises);

  } catch (error) {
    console.error("Error in fetchServices:", error);
    return [];
  }
}



function renderLoading() {
  const tbody = document.querySelector("#statusTable tbody");
  if (!tbody) return;

  // Create skeletal loading rows
  let skeletonHtml = "";
  for (let i = 0; i < 5; i++) {
    skeletonHtml += `
  < tr class="skeleton-row" >
    <td colspan="4">
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="width:24px; height:24px; background:#e0e0e0; border-radius:50%; animation: pulse 1.5s infinite;"></div>
        <div style="flex:1;">
          <div style="height:14px; width:150px; background:#e0e0e0; border-radius:4px; margin-bottom:8px; animation: pulse 1.5s infinite;"></div>
          <div style="height:12px; width:250px; background:#f0f0f0; border-radius:4px; animation: pulse 1.5s infinite;"></div>
        </div>
      </div>
    </td>
      </tr >
  `;
  }
  tbody.innerHTML = skeletonHtml;

  // Add pulse animation style if not present
  if (!document.getElementById('skeleton-style')) {
    const style = document.createElement('style');
    style.id = 'skeleton-style';
    style.innerHTML = `
@keyframes pulse {
  0 % { opacity: 0.5; }
  50 % { opacity: 1; }
  100 % { opacity: 0.5; }
}
`;
    document.head.appendChild(style);
  }
}

async function initializeStatus() {
  renderLoading();
  // Clear any old warning
  const warning = document.getElementById("statusWarning");
  if (warning) warning.style.display = "none";

  services = await fetchServices();
  renderStatusTable();
  updateLastChecked();
}

// Update status and warning on load and every minute (simulating poll)
initializeStatus();
setInterval(() => {
  // Optional: show small loading indicator somewhere else on refresh, 
  // or just silently update. For "real time" feel, silent update is better usually,
  // but let's just re-run the full cycle to show off the "fetching"
  // or better, just silent background update to avoid layout shift.
  // user asked for "look like data is being fetched dynamically". loading bars are good for that.
  initializeStatus();
}, 60000);

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
  if (!tbody) return;

  tbody.innerHTML = "";
  services
    .filter(s => s.name.toLowerCase().includes(filter.toLowerCase()) || s.desc.toLowerCase().includes(filter.toLowerCase()))
    .forEach((s, idx) => {
      let maintenanceHtml = "";
      if (s.status === "maintenance" && s.maintenanceStart) {
        maintenanceHtml = `< div class="maintenance-timer" id = "maintenance-timer-${idx}" >
  <i class="fa-solid fa-clock"></i>
              Maintenance starts in <span class="timer-value">...</span>
            </div > `;
      }
      tbody.innerHTML += `
  < tr >
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
            </tr >
  `;
    });
  updateMaintenanceTimers();
}

function statusIcon(status) {
  switch (status) {
    case "up": return '<i class="fa-solid fa-circle status-up"></i> <span class="status-up">Operational</span>';
    case "down": return '<i class="fa-solid fa-circle status-down"></i> <span class="status-down">Down</span>';
    case "warning": return '<i class="fa-solid fa-circle status-warning"></i> <span class="status-warning">Degraded</span>';
    case "maintenance": return '<i class="fa-solid fa-circle status-maintenance"></i> <span class="status-maintenance">Maintenance</span>';
    default: return '<i class="fa-solid fa-circle"></i> Unknown';
  }
}

function updateLastChecked() {
  const el = document.getElementById('lastChecked');
  if (el) el.textContent = 'Last checked: ' + new Date().toLocaleTimeString();
}

function filterServices(value) {
  renderStatusTable(value);
}

// Maintenance countdown timers
function updateMaintenanceTimers() {
  services.forEach((s, idx) => {
    if (s.status === "maintenance" && s.maintenanceStart) {
      const el = document.querySelector(`#maintenance - timer - ${idx} .timer - value`);
      if (el) {
        const now = new Date();
        let diff = s.maintenanceStart - now;
        if (diff < 0) diff = 0;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const sec = Math.floor((diff % (1000 * 60)) / 1000);
        el.textContent = `${h}h ${m}m ${sec} s`;
      }
    }
  });
  setTimeout(updateMaintenanceTimers, 1000);
}

// Optional: Dark mode toggle
function toggleMode() {
  document.body.classList.toggle('dark');
}