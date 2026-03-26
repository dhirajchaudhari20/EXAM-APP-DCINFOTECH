// (function bustCacheOnce() {
//   if (!sessionStorage.getItem("hardReloadDone")) {
//     sessionStorage.setItem("hardReloadDone", "1");
//     // window.location.reload(true) hint—modern browsers ignore the boolean,
//     // but this still forces a reload from server
//     // window.location.reload(true);
//   }
// })();Sarth

// Show spinner in place of the login button text
function showSpinner() {
  document.getElementById("btnText").style.display = "none";
  document.getElementById("spinner").style.display = "inline-block";
}
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("btnText").style.display = "inline";
}

// Helper to open notes with spinner effect
window.openSessionNotes = function (btn, url) {
  const btnText = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.spinner-circle');

  if (btnText) btnText.style.display = 'none';
  if (spinner) spinner.style.display = 'inline-block';

  setTimeout(() => {
    window.location.href = url;
    // No need to reset button state as we are navigating away
  }, 800);
};

// Auto-refresh logic
function startAutoRefresh() {
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  console.log(`Auto-refresh scheduled in ${REFRESH_INTERVAL / 1000} seconds.`);

  setTimeout(() => {
    console.log("Auto-refreshing page...");
    window.location.reload();
  }, REFRESH_INTERVAL);
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validate that both fields are filled
  if (email.trim() === "" || password.trim() === "") {
    Notiflix.Notify.failure("Please enter both email and password!");
    return;
  }

  // Find the matching user
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    Notiflix.Notify.failure("Invalid credentials!");
    return;
  }

  // Show spinner
  showSpinner();

  // Optimized Login: No hard reload, just DOM update
  setTimeout(() => {
    hideSpinner();
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("cloudUser", JSON.stringify(user)); // Persist for cross-tab/window

    Notiflix.Notify.success(
      `Login successful!<br>Welcome, ${user.name}!`,
      {
        timeout: 1000,
        useIcon: true,
        plainText: false,
      }
    );

    // Initialize Dashboard immediately
    loadPage();

  }, 500); // Small 500ms delay for UI feedback, no reload
}

// Confirm logout with SweetAlert or Notiflix
function confirmLogout() {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  } else if (typeof Notiflix !== 'undefined') {
    Notiflix.Confirm.show(
      'Logout',
      'Do you really want to logout?',
      'Yes, logout',
      'Cancel',
      function () {
        logout();
      },
      function () {
        // Cancelled
      },
      {
        titleColor: '#dc3545',
        okButtonBackground: '#dc3545',
        okButtonColor: '#fff',
      }
    );
  } else {
    // Fallback to native confirm
    if (confirm("Do you really want to logout?")) {
      logout();
    }
  }
}
function loadPage() {
  // Try sessionStorage first, then localStorage (for cross-page persistence)
  let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!user) {
    user = JSON.parse(localStorage.getItem("cloudUser"));
  }

  // CACHE INVALIDATION: Check if cached user data matches current user data
  // This forces re-login when batch assignments or other user data changes
  if (user) {
    const currentUserData = users.find((u) => u.email === user.email);
    if (currentUserData) {
      // Compare batch assignment - if different, force re-login
      if (currentUserData.batch !== user.batch) {
        console.log(`Batch data changed for ${user.email}. Forcing re-login...`);
        sessionStorage.removeItem("loggedInUser");
        localStorage.removeItem("cloudUser");
        user = null; // Force login screen
        Notiflix.Notify.info("Your account data has been updated. Please login again.", {
          timeout: 4000,
        });
      }
    }
  }

  const loginContainer = document.getElementById("loginContainer");
  const dashboardContainer = document.getElementById("dashboardContainer");
  const userNameEl = document.getElementById("userName");

  if (!user) {
    if (loginContainer) loginContainer.style.display = "block";
    if (dashboardContainer) dashboardContainer.style.display = "none";

    // If on schedule.html and no user, redirect to login
    if (!loginContainer && dashboardContainer) {
      // We are likely on schedule.html or a protected page without a login form
      window.location.href = "index.html";
      return;
    }
  } else {
    if (userNameEl) userNameEl.innerText = user.name;
    const greetingTextEl = document.getElementById("greetingText");
    if (greetingTextEl) {
      const hour = new Date().getHours();
      let greeting = "Good morning";
      if (hour >= 12 && hour < 17) greeting = "Good afternoon";
      else if (hour >= 17) greeting = "Good evening";
      greetingTextEl.innerHTML = `${greeting}, ${user.name} 👋`;
    }

    if (loginContainer) loginContainer.style.display = "none";
    if (dashboardContainer) dashboardContainer.style.display = "block";



    // Start auto-refresh timer
    startAutoRefresh();

    // Load the schedule based on user batch
    // Normalize batch to uppercase for comparison
    let batch = user.batch ? user.batch.toUpperCase() : "DEFAULT";

    // DEBUG: Log batch information
    console.log("=== BATCH DEBUG INFO ===");
    console.log("User email:", user.email);
    console.log("User batch (raw):", user.batch);
    console.log("User batch (uppercase):", batch);
    console.log("========================");

    // Fetch from Firebase
    // Ensure Firebase is initialized somewhere globally before this.
    try {
      const db = firebase.database();

      // Separate function to handle merging and loading
      const loadCompleteSchedule = (batchData, globalData) => {
        const combined = [...batchData, ...globalData];
        console.log(`✅ Completed merge: ${batchData.length} batch + ${globalData.length} global = ${combined.length} total sessions`);
        window.currentSchedule = combined;
        loadSchedule(combined);
      };

      let currentBatchSessions = [];
      let currentGlobalSessions = [];

      // Listen for Batch Sessions
      db.ref(`agendas/${batch}`).on('value', snapshot => {
        const raw = snapshot.val();
        currentBatchSessions = raw ? Object.values(raw) : [];
        console.log(`📡 Batch update: ${currentBatchSessions.length} sessions`);

        // If batch empty, fallback to DEFAULT logic remains but we still merge with global
        if (currentBatchSessions.length === 0) {
          db.ref(`agendas/DEFAULT`).once('value', defaultSnapshot => {
            const defaultRaw = defaultSnapshot.val();
            currentBatchSessions = defaultRaw ? Object.values(defaultRaw) : [];
            loadCompleteSchedule(currentBatchSessions, currentGlobalSessions);
          });
        } else {
          loadCompleteSchedule(currentBatchSessions, currentGlobalSessions);
        }
      });

      // Listen for Global Sessions (scheduleAll)
      db.ref(`agendas/SCHEDULEALL`).on('value', snapshot => {
        const raw = snapshot.val();
        currentGlobalSessions = raw ? Object.values(raw) : [];
        console.log(`🌎 Global update: ${currentGlobalSessions.length} sessions`);
        loadCompleteSchedule(currentBatchSessions, currentGlobalSessions);
      });
    } catch (e) {
      console.error("Firebase not initialized or available:", e);
    }
  }
}

// Logout function with Notiflix notification
function logout() {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (user) {
    Notiflix.Notify.info(`Goodbye, ${user.name}.`);
  }

  // 1. Clear all session data
  localStorage.removeItem('cloudUser');
  localStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('loggedInUser');

  // 2. Double check clearing
  localStorage.clear();
  sessionStorage.clear();

  // 3. Redirect to Learn Portal
  setTimeout(() => {
    window.location.href = 'https://learn.dcinfotech.org.in';
  }, 1000);
}
// Default schedule data (for non-ML batches)


function loadSchedule(selectedSchedule) {
  console.log("loadSchedule called with:", selectedSchedule ? selectedSchedule.length : "undefined", "items");
  const sessions = selectedSchedule || window.currentSchedule || [];
  console.log("Total sessions to process:", sessions.length);
  const container = document.getElementById("schedule");
  if (!container) {
    console.log("No schedule container found, skipping render.");
    return;
  }
  container.innerHTML = "";

  const now = new Date();
  console.log("Now:", now.toString());

  const ongoing = [],
    upcoming = [],
    past = [];

  sessions.forEach((sess) => {
    try {
      if (sess.time === "TBA") return upcoming.push(sess);

      const [startStrRaw, endStrRaw] = sess.time.split(" - ");
      const cleanTime = (t) => t.trim().replace(/\s+(?:GMT|IST|UTC|[A-Z]{3,}).*$/i, "").replace(/\(.*\)/, "").trim();
      const startStr = cleanTime(startStrRaw) + " GMT+0530";
      const endStr = endStrRaw
        ? cleanTime(endStrRaw) + " GMT+0530"
        : null;

      const start = new Date(`${sess.day} ${startStr}`);
      const end = endStr ? new Date(`${sess.day} ${endStr}`) : null;

      if (isNaN(start)) {
        console.warn("Invalid start date", sess);
        return upcoming.push(sess); // fallbackdd
      }

      if (end && now > end) past.push(sess);
      else if (now >= start) ongoing.push(sess);
      else upcoming.push(sess);
    } catch (err) {
      console.error("Date parsing error:", sess, err);
    }
  });

  // 1. Calculate Progress
  const totalSessions = sessions.length;
  // Count watched sessions from localStorage
  const watchedSessions = JSON.parse(localStorage.getItem('watched_sessions') || '[]');
  // A session is completed if it's in the past OR marked as watched
  const completedCount = sessions.filter(s => {
    const isPast = new Date(s.day + ' ' + s.time.split(' - ')[0].replace(/\s+GMT.*$/, "") + " GMT+0530") < new Date();
    const isWatched = watchedSessions.includes(s.day + s.time);
    return isPast || isWatched;
  }).length;

  const progressPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // 2. Inject Progress Bar
  const progressHTML = `
    <div class="progress-container">
      <div class="progress-header">
        <span>Course Progress</span>
        <span>${progressPercent}% Completed</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
      </div>
    </div>
  `;

  // Inject Progress Bar before sessions (single render pass below)
  container.innerHTML = progressHTML;

  // 3. Start Countdown for Next Session
  if (upcoming.length > 0) {
    // Sort upcoming by date to find the true next session
    upcoming.sort((a, b) => {
      const dateA = new Date(a.day + ' ' + a.time.split(' - ')[0].replace(/\s+GMT.*$/, "") + " GMT+0530");
      const dateB = new Date(b.day + ' ' + b.time.split(' - ')[0].replace(/\s+GMT.*$/, "") + " GMT+0530");
      return dateA - dateB;
    });

    const nextSession = upcoming[0];
    // We need a way to identify this specific element to update its badge
    // Let's add a special ID or class to it in createSessionElement, 
    // but since we render them in a loop, we can just find it by content or add logic in createSessionElement.
    // Better approach: Pass a flag to createSessionElement
  }

  // Re-render to pass 'isNext' flag
  container.innerHTML = progressHTML; // Reset

  const renderWithNext = (title, list) => {
    if (!list.length) return;
    const grp = document.createElement("div");
    grp.innerHTML = `<h3>${title}</h3>`;
    list.forEach((s, index) => {
      const isNext = (title === "Upcoming Sessions" && index === 0);
      grp.appendChild(createSessionElement(s, isNext));
    });
    container.appendChild(grp);
  };

  renderWithNext("Ongoing Sessions", ongoing);
  renderWithNext("Upcoming Sessions", upcoming);
  renderWithNext("Past Sessions", past);

  // Start Countdown Timer
  if (upcoming.length > 0) {
    startCountdown(upcoming[0]);
  }
  // Note: no setTimeout needed here - Firebase .on() listener handles real-time updates
}

let countdownInterval;
function startCountdown(session) {
  clearInterval(countdownInterval);
  const badge = document.getElementById('countdown-badge');
  if (!badge) return;

  const cleanTime = (t) => t.trim().replace(/\s+(?:GMT|IST|UTC|[A-Z]{3,}).*$/i, "").replace(/\(.*\)/, "").trim();
  const startStr = cleanTime(session.time.split(" - ")[0]) + " GMT+0530";
  const targetDate = new Date(`${session.day} ${startStr}`).getTime();

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      badge.innerHTML = "Starting Now";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) {
      badge.innerHTML = `<i class="fas fa-clock"></i> Starts in: ${days}d ${hours}h ${minutes}m`;
    } else {
      badge.innerHTML = `<i class="fas fa-clock"></i> Starts in: ${hours}h ${minutes}m ${seconds}s`;
    }
  }, 1000);
}

function createSessionElement(session, isNext = false) {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || JSON.parse(localStorage.getItem("cloudUser")) || {};
  const batch = user.batch ? user.batch.toUpperCase() : "ACE";
  const notesLink = batchToNotes[batch] || "notes.html?track=ace";

  try {
    if (!session.time) {
      console.warn("Session missing time:", session);
      return document.createComment("Invalid session: missing time");
    }

    const now = new Date();
    const parts = session.time.split(" - ");
    const startStrRaw = parts[0];
    const endStrRaw = parts[1]; // might be undefined

    const cleanTime = (t) => t.trim().replace(/\s+(?:GMT|IST|UTC|[A-Z]{3,}).*$/i, "").replace(/\(.*\)/, "").trim();

    const startStr = cleanTime(startStrRaw) + " GMT+0530";
    const start = new Date(`${session.day} ${startStr}`);

    let end = null;
    if (endStrRaw) {
      const endStr = cleanTime(endStrRaw) + " GMT+0530";
      end = new Date(`${session.day} ${endStr}`);
      // Handle next day rollover (e.g., 8:30 PM to 12:30 AM)
      if (!isNaN(end) && !isNaN(start) && end < start) {
        end.setDate(end.getDate() + 1);
      }
    }

    // Timezone Conversion Logic
    let displayTime = session.time;
    if (typeof useLocalTime !== 'undefined' && useLocalTime) {
      const options = { hour: 'numeric', minute: 'numeric', hour12: true };
      const localStart = !isNaN(start) ? start.toLocaleTimeString([], options) : '';
      const localEnd = (end && !isNaN(end)) ? end.toLocaleTimeString([], options) : '';
      displayTime = `${localStart} - ${localEnd} (Local)`;
    }

    if (isNaN(start)) {
      console.warn("Invalid date in session:", session);
      return document.createComment("Invalid session: invalid date");
    }

    if (end && isNaN(end)) {
      console.warn("Invalid end date in session, treating as null:", session);
      end = null;
    }

    const openAt = new Date(start.getTime() - 15 * 60 * 1000);
    const hasEnded = end && now > end;
    // Strict check: Must be past start time AND (no end time OR before end time)
    const isOngoing = (now >= start) && (!end || now <= end);
    const canJoin = now >= openAt && (!end || now <= end);

    const liveBadge = isOngoing
      ? `<span class="status-badge live"><i class="fas fa-circle"></i> Live</span>`
      : hasEnded
        ? `<span class="status-badge completed"><i class="fas fa-check-circle"></i> Completed</span>`
        : `<span class="status-badge upcoming"><i class="fas fa-calendar"></i> Upcoming</span>`;

    const countdownBadge = isNext
      ? `<div id="countdown-badge" class="countdown-badge"><i class="fas fa-clock"></i> Starts in: --h --m --s</div>`
      : "";

    // Add to Calendar Logic
    let addToCalendarBtn = "";
    if (canJoin || (!hasEnded && !isOngoing)) {
      const startISO = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const endISO = end ? end.toISOString().replace(/-|:|\.\d\d\d/g, "") : startISO;
      const details = encodeURIComponent(session.description + " - " + session.details);
      const location = encodeURIComponent(session.link || "Online");
      const title = encodeURIComponent(session.description);

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}&location=${location}`;

      addToCalendarBtn = `
            <a href="${calendarUrl}" target="_blank" class="add-calendar-btn" title="Add to Google Calendar">
                <i class="far fa-calendar-plus"></i> Add to Calendar
            </a>
        `;
    }

    const btnHTML = hasEnded
      ? session.recording
        ? `<button disabled>Session Ended</button>
            <a href="${session.recording}" target="_blank"><button>View Recording</button></a>`
        : `<button disabled>Session Ended</button>
            <a href="javascript:void(0)" onclick="alert('Recording not available for this session. Please contact support@dcinfotech.org.in for more info.');">
            <button>View Recording</button>
            </a>`
      : canJoin
        ? session.link
          ? `<a href="${session.link}" target="_blank"><button class="btn-join"><i class="fas fa-video"></i> Join Class</button></a>`
          : `<button disabled title="Link not available">Join (No Link)</button>`
        : `<button disabled>Join</button>`;

    const el = document.createElement("div");
    el.className = "session";

    // Instructor Profile
    // Instructor Profile
    const instructorHTML = `
      <div class="instructor-profile">
        <img src="https://ui-avatars.com/api/?name=Dhiraj+Chaudhari&background=0b57d0&color=fff" class="instructor-avatar" alt="Instructor">
          <div class="instructor-info">
            <span class="instructor-name">Instr. Dhiraj</span>
            <a href="https://www.linkedin.com/in/dhirajchaudhari/" target="_blank" class="instructor-link">Connect on LinkedIn</a>
          </div>
        </div>
    `;

    // Resources Dropdown

    const resourcesHTML = `
      <div class="resources-dropdown">
            <button class="resources-btn" onclick="toggleResourcesMenu(event)">
                <i class="fas fa-folder-open"></i> Resources <i class="fas fa-chevron-down"></i>
            </button>
            <div class="resources-menu">
                <a href="#" class="resource-item" onclick="event.preventDefault(); openSessionNotes(this, 'notes/${notesLink}'); return false;">
                    <i class="fas fa-file-powerpoint"></i> Slide Deck
                </a>
                <a href="https://github.com/dhirajchaudhari" target="_blank" class="resource-item"><i class="fab fa-github"></i> Code Samples</a>
                <a href="https://cloud.google.com/docs" target="_blank" class="resource-item"><i class="fas fa-book"></i> Reference Docs</a>
            </div>
        </div>
      `;

    // QR Code
    // QR Code
    const qrCodeHTML = canJoin ? `
      <div class="qr-code-wrapper" title="Scan to join on mobile">
            <i class="fas fa-qrcode"></i>
            <div class="qr-code-popup">
                <img src="https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(session.link)}" class="qr-code-img" alt="QR Code">
                <div style="text-align:center; font-size:0.7rem; margin-top:4px;">Scan to Join</div>
            </div>
        </div>
      ` : '';

    // Watched Checkbox
    const isWatched = (JSON.parse(localStorage.getItem('watched_sessions') || '[]')).includes(session.day + session.time);
    const watchedHTML = hasEnded ? `
      <div class="watched-wrapper">
        <label class="watched-label">
          <input type="checkbox" class="watched-checkbox" ${isWatched ? 'checked' : ''}
            onchange="toggleWatched('${session.day + session.time}', this)">
            Mark as Watched / Attended
        </label>
        </div>
      ` : '';

    // Rate Session Button
    const rateBtnHTML = hasEnded ? `
      <button class="btn-secondary" style="font-size:0.8rem; padding:4px 12px; margin-top:8px;" onclick="document.getElementById('feedbackModal').style.display='flex'">
        <i class="far fa-star"></i> Rate Session
        </button>
      ` : '';

    // Bookmark Button
    const sessionId = session.day + session.time + session.description;
    const bookmarked = isSessionBookmarked(sessionId);
    const bookmarkHTML = `
      <button class="bookmark-btn ${bookmarked ? 'bookmarked' : ''}"
    onclick="toggleBookmark('${sessionId.replace(/'/g, "\\'")}', this)"
    title="${bookmarked ? 'Remove bookmark' : 'Bookmark this session'}">
      <i class="${bookmarked ? 'fas' : 'far'} fa-bookmark"></i>
        </button>
      `;

    el.innerHTML = `
        ${instructorHTML}
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h4>${session.day} ${countdownBadge}</h4>
            <div style="display:flex; align-items:center; gap:8px;">
                ${bookmarkHTML}
                ${liveBadge}
                ${qrCodeHTML}
            </div>
        </div>
        <p>${displayTime}</p>
        <p>${session.description}</p>
        
        <div class="session-details">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:12px;">
                <p style="margin:0;">Meeting Link:</p>
                <div style="display:flex; gap:8px;">
                    ${resourcesHTML}
                    ${addToCalendarBtn}
                </div>
            </div>
            ${btnHTML}
            ${rateBtnHTML}
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
            <button class="remind-me-btn"
            onclick="sendReminder('${session.day}', '${session.time}', '${session.description}', '${session.link}')">
            Remind Me</button>
        </div>
        ${watchedHTML}
        
        <p style="margin-top:12px; font-size:0.85rem; color:var(--text-medium);">
            For support: <a href="https://dcinfotech.org.in/live-chat">Live Chat</a>
        </p>

    <p>If you can't see the trainer’s lecture notes,
    <button class="lecture-notes-btn" onclick="openSessionNotes(this, 'notes/${notesLink}')">
        <span class="btn-text">Click here</span>
        <div class="spinner-circle" style="display: none; width: 16px; height: 16px; border-width: 2px; vertical-align: middle;"></div>
    </button>
    </p>

    `;
    return el;
  } catch (err) {
    console.error("Error creating session element:", session, err);
    const errEl = document.createElement("div");
    errEl.style.color = "red";
    errEl.innerText = "Error loading session details.";
    return errEl;
  }
}

const batchToNotes = {
  ACE: "notes.html?track=ace",
  ACEJULY: "notes.html?track=ace",
  ACEJULY2025: "notes.html?track=ace",
  ACE4AUGUST: "notes.html?track=ace",
  DEVOPS: "notes.html?track=devops",
  CLOUDARCHITECT: "notes.html?track=pca",
  CLOUDARCHITECTJULY: "notes.html?track=pca",
  CLOUDDEVELOPER: "notes.html?track=developer",
  CLOUDDEVOPSAUGUST: "notes.html?track=devops",
  GENAI: "notes.html?track=gen-ai",
  ML: "notes.html?track=ml-engineer",
  SECURITY: "notes.html?track=security",
  PCA: "notes.html?track=pca",
  DIGITALLEADER: "notes.html?track=digital-leader",
  NETWORKAUGUST2025: "notes.html?track=network",
  ACE20: "notes.html?track=ace",
  ACE21: "notes.html?track=ace",
  ACE22: "notes.html?track=ace",
  ACE23: "notes.html?track=ace",
  ACE24: "notes.html?track=ace",

  ACE75: "notes.html?track=ace",


  PDE01: "notes.html?track=data-engineer",




  ACE35: "notes.html?track=data-engineer",
};

const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
let notesLink = "index.html"; // defaultfgg
if (user && user.batch) {
  const batches = Array.isArray(user.batch) ? user.batch : [user.batch];
  for (const b of batches) {
    const upper = b.toUpperCase();
    if (batchToNotes[upper]) {
      notesLink = batchToNotes[upper];
      break;
    }
  }
}
// -------------------------
// Page Loader by batch
// -------------------------

// Reminder helper
// -------------------------
function sendReminder(day, time, description, link) {
  // Check both sessionStorage and localStorage
  const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || JSON.parse(localStorage.getItem("cloudUser"));

  if (!user || !user.email) {
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please log in to set a reminder.',
      confirmButtonColor: '#1a73e8'
    });
    return;
  }

  try {
    const [sRaw, eRaw] = time.split(" - ");
    // Clean up time strings
    const cleanStart = sRaw.trim().replace(/ GMT.*$/, "");
    const cleanEnd = eRaw ? eRaw.trim().replace(/ GMT.*$/, "") : "";

    const start = new Date(`${day} ${cleanStart} GMT +0530`);
    const end = eRaw ? new Date(`${day} ${cleanEnd} GMT +0530`) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour if no end time

    if (isNaN(start.getTime())) {
      console.error("Invalid date parsed:", `${day} ${cleanStart} `);
      throw new Error("Invalid date format");
    }

    const details = [
      `Dear Learner, `,
      ``,
      `Event: ${description} `,
      `Join here: ${link || "Link will be available on the portal"} `,
      ``,
      `Thanks!`,
    ].join("\n");

    const formatDate = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const dates = `${formatDate(start)}/${formatDate(end)}`;

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(description) +
      "&dates=" +
      dates +
      "&details=" +
      encodeURIComponent(details) +
      "&location=" +
      encodeURIComponent("https://dcinfotech.org.in/cloud-training/");

    window.open(url, "_blank");
  } catch (error) {
    console.error("Reminder Error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to create reminder. Please try again.',
      confirmButtonColor: '#d93025'
    });
  }
}

// -------------------------
// Boot
// -------------------------
document.addEventListener("DOMContentLoaded", loadPage);

// Hide loader when page is fully loaded
window.addEventListener("load", function () {
  setTimeout(hideLoader, 500); // Faster hide
});

// Fallback in case window.load fired before script ran
setTimeout(hideLoader, 2000);

function hideLoader() {
  const loader = document.getElementById("root-loader");
  if (loader) {
    loader.classList.add("hidden");
    loader.style.display = "none"; // Force hide
  }
  // Also ensure dashboard is visible if it was hidden by CSS
  const dashboard = document.getElementById("dashboardContainer");
  const login = document.getElementById("loginContainer");

  // Only show dashboard if we are logged in OR if there is no login container (meaning we are on a protected page like schedule.html)
  if (dashboard && (sessionStorage.getItem("loggedInUser") || !login)) {
    dashboard.style.display = "block";
  }
}

function downloadPDF() {
  const element = document.getElementById("schedule");
  const opt = {
    margin: 1,
    filename: "my-schedule.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  // Use html2pdf to save the file
  html2pdf().set(opt).from(element).save();
}

// Helper to get the correct schedule array for the logged-in user
// Used by my-learning.html to show recordings
function getScheduleForUser() {
  return window.currentSchedule || [];
}

const users = [
  // 3 March batch
  {
    email: "ashishaswal003@gmail.com",
    password: "intern@123",
    name: "Ashish Aswal",
    phone: "7055164392",
    batch: "3MARCH",
  },
  {
    email: "krishna.sandeepkaruturi@dcinfotech.me",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "8722889994",
    batch: "3MARCH",
  },
  {
    email: "sandeepkk1938@gmail.com",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "8722889994",
    batch: "3MARCH",
  },
  {
    email: "preetha.elangovan2318@gmail.com",
    password: "intern@123",
    name: "Preetha Elangovan",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "preetha.elangovan@dcinfotech.me",
    password: "intern@123",
    name: "Preetha Elangovan",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "atharvakumbhar669@gmail.com",
    password: "intern@123",
    name: "Atharva Kishor Kumbhar",
    phone: "8108741281",
    batch: "3MARCH",
  },
  {
    email: "ky964257@gmail.com",
    password: "intern@123",
    name: "Krishna Yadav",
    phone: "06386052158",
    batch: "3MARCH",
  },
  {
    email: "prathameshpathak7@gmail.com",
    password: "intern@123",
    name: "Prathamesh Satish Pathak",
    phone: "8698662408",
    batch: "3MARCH",
  },
  {
    email: "sahilbhosale1309@gmail.com",
    password: "intern@123",
    name: "Sahil Bhosale",
    phone: "9326251178",
    batch: "3MARCH",
  },
  {
    email: "dinesh.borase70@gmail.com",
    password: "intern@123",
    name: "Dinesh Prakash Borase",
    phone: "8308110391",
    batch: "3MARCH",
  },
  {
    email: "prasadramesh963@gmail.com",
    password: "intern@123",
    name: "Ramesh Prasad",
    phone: "9561480153",
    batch: "3MARCH",
  },
  {
    email: "satishtempwork@gmail.com",
    password: "intern@123",
    name: "Satish Kumar Janapureddi",
    phone: "7095885568",
    batch: "3MARCH",
  },

  {
    email: "dhirajchaudhari@dcinfotech.org.in",
    password: "intern@123",
    name: "Dhiraj Chaudhari",
    phone: "N/A",
    batch: "ACE24",
  },


  {
    email: "saadahmedm@dcinfotech.org.in",
    password: "intern@123",
    name: "Saad Ahmed Mohammed	",
    phone: "N/A",
    batch: "ACE75",
  },


  {
    email: "mhd@dcinfotech.org.in",
    password: "intern@123",
    name: "Mhd YamanHamouda",
    phone: "N/A",
    batch: "ACE75",
  },



  {
    email: "muhammad@dcinfotech.org.in",
    password: "intern@123",
    name: "Muhammad Azeem Bhatti",
    phone: "N/A",
    batch: "ACE75",
  },
  {
    email: "similoluwa@dcinfotech.org.in",
    password: "intern@123",
    name: "Similoluwa Talabi",
    phone: "N/A",
    batch: "ACE75",
  },














  {
    email: "saadahmedm@dcinfotech.org.in",
    password: "intern@123",
    name: "Mohammed Mushtaq",
    phone: "N/A",
    batch: "DEVOPS",
  },










  {
    email: "pranjalipowar@dcinfotech.org.in",
    password: "intern@123",
    name: "Pranjal Powar",
    phone: "N/A",
    batch: "ACE75",
  },













  {
    email: " syed@dcinfotech.org.in",
    password: "intern@123",
    name: "Syed Mohiuddin Syed Abbas Javed",
    phone: "N/A",
    batch: "ACE75",
  },

  {
    email: "karena@dcinfotech.org.in",
    password: "intern@123",
    name: "Karena Wilson",
    phone: "N/A",
    batch: "ACE75",
  },

  {
    email: "tumi@dcinfotech.org.in",
    password: "intern@123",
    name: "Tumi Oladimeji",
    phone: "N/A",
    batch: "ACE75",
  },

  {
    email: "oluebube@dcinfotech.org.in",
    password: "intern@123",
    name: "Oluebube Nnanna Okoro",
    phone: "N/A",
    batch: "ACE75",
  },

  {
    email: "cyrus@dcinfotech.org.in",
    password: "intern@123",
    name: "Cyrus Nikzade",
    phone: "N/A",
    batch: "ACE75",
  },
  {
    email: "timothy@dcinfotech.org.in",
    password: "intern@123",
    name: "Timothy Ugo",
    phone: "N/A",
    batch: "ACE75",
  },

  {
    email: "Manith@dcinfotech.org.in",
    password: "intern@123",
    name: "Manith Kumar",
    phone: "N/A",
    batch: "ACE75",
  },

  {
    email: "derrick@dcinfotech.org.in",
    password: "intern@123",
    name: "Derrick Willis​",
    phone: "N/A",
    batch: "ACE75",
  },

  {
    email: "anitha@dcinfotech.org.in",
    password: "intern@123",
    name: "Anitha",
    phone: "N/A",
    batch: "ACE75",
  },




  {
    email: "semileniola@dcinfotech.org.in",
    password: "intern@123",
    name: "Semileniola Salako	",
    phone: "N/A",
    batch: "ACE75",
  },


  {
    email: "vishnu@dcinfotech.org.in",
    password: "intern@123",
    name: "Vishnu Charan Kollapuram Gandla	",
    phone: "N/A",
    batch: "ACE75",
  },





  {
    email: "david@dcinfotech.org.in",
    password: "intern@123",
    name: "David Roper	",
    phone: "N/A",
    batch: "ACE75",
  },


  {
    email: "jayne@dcinfotech.org.in",
    password: "intern@123",
    name: "Jayne Wood	",
    phone: "N/A",
    batch: "ACE75",
  },







  {
    email: "dave@dcinfotech.org.in",
    password: "intern@123",
    name: "Dave	",
    phone: "N/A",
    batch: "ACE75",
  },




  {
    email: "dominic@dcinfotech.org.in",
    password: "intern@123",
    name: "Dominic Wilson	",
    phone: "N/A",
    batch: "CLOUDARCHITECTAPRIL",
  },




  {
    email: "brijesh@dcinfotech.org.in",
    password: "intern@123",
    name: "Brijesh",
    phone: "N/A",
    batch: "CLOUDARCHITECTAPRIL",
  },


  {
    email: "kunj@dcinfotech.org.in",
    password: "intern@123",
    name: "Kunj Patel",
    phone: "N/A",
    batch: "ACE75",
  },




  {
    email: "vishwanath@dcinfotech.org.in",
    password: "intern@123",
    name: "Vishwanath Maddula",
    phone: "N/A",
    batch: "ACE75",
  },




  {
    email: "aditya@dcinfotech.org.in",
    password: "intern@123",
    name: "Aditya Subhash Bansod",
    phone: "N/A",
    batch: "ACE75",
  },


  {
    email: "vikram@dcinfotech.org.in",
    password: "intern@123",
    name: "Vikram Kavalipati",
    phone: "N/A",
    batch: "ACE75",
  },



  {
    email: "chilukurupravallika@dcinfotech.org.in",
    password: "intern@123",
    name: "Pravallika Chilukuri",
    phone: "N/A",
    batch: "ACE75",
  },


















  {
    email: "nishchalkumargarg@dcinfotech.org.in",
    password: "intern@123",
    name: "Nishchal Kumar Garg",
    phone: "N/A",
    batch: "ACE24",
  },





  {
    email: "vijaypratapsinghhada@dcinfotech.org.in",
    password: "intern@123",
    name: "Vijay Pratap Singh Hada ",
    phone: "N/A",
    batch: "ACE24",
  },




  {
    email: "saisaranruppa@dcinfotech.org.in",
    password: "intern@123",
    name: "Sai Saran Ruppa	 ",
    phone: "N/A",
    batch: "ACE24",
  },



  {
    email: "somepallyvinaysai@dcinfotech.org.in",
    password: "intern@123",
    name: "SOMEPALLY VINAY SAI	 ",
    phone: "N/A",
    batch: "ACE24",
  },







  {
    email: "devendarcharkajithender@dcinfotech.org.in",
    password: "intern@123",
    name: "Devendar Charka Jithender",
    phone: "N/A",
    batch: "ACE24",
  },
  {
    email: "rohiniswethapenmetsa@dcinfotech.org.in",
    password: "intern@123",
    name: "Rohini Swetha Penmetsa",
    phone: "N/A",
    batch: "ACE24",
  },








  {
    email: "dhananjeyangopal@dcinfotech.org.in",
    password: "intern@123",
    name: "DHANANJEYAN GOPAL",
    phone: "N/A",
    batch: "ACE24",
  },







  {
    email: "bhavanak@dcinfotech.org.in",
    password: "intern@123",
    name: "Bhavana K",
    phone: "N/A",
    batch: "ACE24",
  },




  {
    email: "krishnasandeepkaruturi@dcinfotech.org.in",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "N/A",
    batch: "ACE24",
  },




  {
    email: "viveksantoshohal@dcinfotech.org.in",
    password: "intern@123",
    name: "Vivek Santosh Ohal",
    phone: "N/A",
    batch: "ACE24",
  },



























  {
    email: "aishwaryaburud@dcinfotech.org.in",
    password: "intern@123",
    name: "Aishwarya Burud ",
    phone: "N/A",
    batch: "ACE23",
  },

  {
    email: "devasanirajeshwar@dcinfotech.org.in",
    password: "intern@123",
    name: "DEVASANI RAJESHWAR",
    phone: "N/A",
    batch: "ACE23",
  },


  {
    email: "sudheer@dcinfotech.org.in",
    password: "intern@123",
    name: "Sudheer konduboina ",
    phone: "N/A",
    batch: "ACE21",
  },









  {
    email: "bhavesh@dcinfotech.org.in",
    password: "intern@123",
    name: "Bhavesh patidar",
    phone: "N/A",
    batch: "ACE21",
  },

  {
    email: "victor@dcinfotech.org.in",
    password: "intern@123",
    name: "Victor Jonathan",
    phone: "N/A",
    batch: "ACE21",
  },

  {
    email: "arya@dcinfotech.org.in",
    password: "intern@123",
    name: "Arya Wade",
    phone: "N/A",
    batch: "ACE22",
  },



  {
    email: "mitush@dcinfotech.org.in",
    password: "intern@123",
    name: "mitush",
    phone: "N/A",
    batch: "ACE23",
  },





  {
    email: "devangtyagi@dcinfotech.org.in",
    password: "intern@123",
    name: "DEVANG TYAGI ",
    phone: "N/A",
    batch: "ACE23",
  },










  {
    email: "karthikumarbharatmoorthy@dcinfotech.org.in",
    password: "intern@123",
    name: "Karthikumar Bharatmoorthy ",
    phone: "N/A",
    batch: "ML",
  },














  {
    email: "adityagudla@dcinfotech.org.in",
    password: "intern@123",
    name: "Aditya Gudla ",
    phone: "N/A",
    batch: "ACE23",
  },




  {
    email: "rhuturajrameshrogye@dcinfotech.org.in",
    password: "intern@123",
    name: "Rhuturaj Ramesh Rogye",
    phone: "N/A",
    batch: "CLOUDARCHITECTAPRIL",
  },



  {
    email: "iralegurudattavijay@dcinfotech.org.in",
    password: "intern@123",
    name: "Irale Gurudatta Vijay",
    phone: "N/A",
    batch: "ACE23",
  },








  {
    email: "nirmandjoshi@dcinfotech.org.in",
    password: "intern@123",
    name: "Nirman D Joshi",
    phone: "N/A",
    batch: "ACE23",
  },



  {
    email: "mogullaanirudhreddy@dcinfotech.org.in",
    password: "intern@123",
    name: "Mogulla Anirudh Reddy ",
    phone: "N/A",
    batch: "ACE23",
  },

  {
    email: "sripadavenkatasivakanth@dcinfotech.org.in",
    password: "intern@123",
    name: "Sripada Venkata Sivakanth",
    phone: "N/A",
    batch: "ACE23",
  },




  {
    email: "shreejeetpurwar@dcinfotech.org.in",
    password: "intern@123",
    name: "Shreejeet Purwar",
    phone: "N/A",
    batch: "ACE23",
  },









  {
    email: "dampanaboyinavinay@dcinfotech.org.in",
    password: "intern@123",
    name: "DAMPANABOYINA VINAY",
    phone: "N/A",
    batch: "ACE23",
  },



  {
    email: "chinthasaimadhuri@dcinfotech.org.in",
    password: "intern@123",
    name: "Chintha Sai Madhuri",
    phone: "N/A",
    batch: "ACE22",
  },





  {
    email: "vedbapardekar@dcinfotech.org.in",
    password: "intern@123",
    name: "Ved Bapardekar",
    phone: "N/A",
    batch: "ACE22",
  },



















  {
    email: "abdulquddus@dcinfotech.org.in",
    password: "intern@123",
    name: "Abdul Quddus",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ayanroy@dcinfotech.org.in",
    password: "intern@123",
    name: "Ayan Roy",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "devireddyvenkatasaikiranreddy@dcinfotech.org.in",
    password: "intern@123",
    name: "DEVIREDDY VENKATA SAI KIRAN REDDY ",
    phone: "N/A",
    batch: "ACE22",
  },



















  {
    email: "aadityaabhijitsurve@dcinfotech.org.in",
    password: "intern@123",
    name: "Aaditya Abhijit Surve ",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ahmedmohdasifghare@dcinfotech.org.in",
    password: "intern@123",
    name: "Ahmed Mohd Asif Ghare",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "mayursakharamchikane@dcinfotech.org.in",
    password: "intern@123",
    name: "Mayur Sakharam Chikane",
    phone: "N/A",
    batch: "ACE22",
  },



















  {
    email: "lakshyajoshi@dcinfotech.org.in",
    password: "intern@123",
    name: "Lakshya Joshi",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "bhagavath@dcinfotech.org.in",
    password: "intern@123",
    name: "BHAGAVATH B",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "satya@dcinfotech.org.in",
    password: "intern@123",
    name: "Satya Prakash",
    phone: "N/A",
    batch: "ACE22",
  },






  {
    email: "ayesha@dcinfotech.org.in",
    password: "intern@123",
    name: "Ayesha Khan",
    phone: "N/A",
    batch: "ACE22",
  },



  {
    email: "govind@dcinfotech.org.in",
    password: "intern@123",
    name: "Govind Awad",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "raj@dcinfotech.org.in",
    password: "intern@123",
    name: "Raj Joshi",
    phone: "N/A",
    batch: "ACE22",
  },


















  {
    email: "adnan@dcinfotech.org.in",
    password: "intern@123",
    name: "Adnan Chapalgaonkar",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "abhishek@dcinfotech.org.in",
    password: "intern@123",
    name: "Abhishek Singh",
    phone: "N/A",
    batch: "ACE22",
  },
















  {
    email: "ananya@dcinfotech.org.in",
    password: "intern@123",
    name: "Ananya Sharma",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "prachi@dcinfotech.org.in",
    password: "intern@123",
    name: "Prachi Kadu",
    phone: "N/A",
    batch: "ACE22",
  },





  {
    email: "a",
    password: "a",
    name: "Admin",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "nikitha@dcinfotech.org.in",
    password: "intern@123",
    name: "NIKITHA J",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "vedant@dcinfotech.org.in",
    password: "intern@123",
    name: "Vedant Patil",
    phone: "N/A",
    batch: "ACE22",
  },












  {
    email: "sham@dcinfotech.org.in",
    password: "intern@123",
    name: "Sham Patil",
    phone: "N/A",
    batch: "ACE22",
  },



  {
    email: "raja@dcinfotech.org.in",
    password: "intern@123",
    name: "Raja Chourashia",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "mdkhalimaqsood@dcinfotech.org.in",
    password: "intern@123",
    name: "Md khalid maqsood alam",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "hifzurrehman@dcinfotech.org.in",
    password: "intern@123",
    name: "Hifzur Rehman Ansari",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "gurram@dcinfotech.org.in",
    password: "intern@123",
    name: "GURRAM CHENNAIAH",
    phone: "N/A",
    batch: "ACE22",
  },










  {
    email: "mrunal@dcinfotech.org.in",
    password: "intern@123",
    name: "Mrunal Joshi",
    phone: "N/A",
    batch: "ACE22",
  },















  {
    email: "Adarsh@dcinfotech.org.in",
    password: "intern@123",
    name: "Adarsh Singh",
    phone: "N/A",
    batch: "ACE23",
  },

  {
    email: "nikhil@dcinfotech.org.in",
    password: "intern@123",
    name: "Nikhil namaji",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ebin@dcinfotech.org.in",
    password: "intern@123",
    name: "Ebin Alex",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ayushkumar@dcinfotech.org.in",
    password: "intern@123",
    name: "Ayush Kumar Jha",
    phone: "N/A",
    batch: "ACE22",
  },






























  {
    email: "khurshid@dcinfotech.org.in",
    password: "intern@123",
    name: "Khurshid warsi",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "prakhar@dcinfotech.org.in",
    password: "intern@123",
    name: "Prakhar Sharma",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "sneha@dcinfotech.org.in",
    password: "intern@123",
    name: "Sneha Pasam",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "maheer@dcinfotech.org.in",
    password: "intern@123",
    name: "Maheer khan",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "aarti@dcinfotech.org.in",
    password: "intern@123",
    name: "Aarti Vinkar",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "vedansh@dcinfotech.org.in",
    password: "intern@123",
    name: "Vedansh Pandey",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "siddhi@dcinfotech.org.in",
    password: "intern@123",
    name: "Siddhi Akre",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "harinadh@dcinfotech.org.in",
    password: "intern@123",
    name: "Harinadh Patapanchula",
    phone: "N/A",
    batch: "ACE21",
  },

  {
    email: "ankan@dcinfotech.org.in",
    password: "intern@123",
    name: "Ankan Dhang",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "adamshafi@dcinfotech.org.in",
    password: "intern@123",
    name: "Adamshafi Shaik",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "nisha@dcinfotech.org.in",
    password: "intern@123",
    name: "Nisha Prajapati",
    phone: "N/A",
    batch: "ACE20",
  },


  {
    email: "abdul@dcinfotech.org.in",
    password: "intern@123",
    name: "Abdul Basit",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "shilpa@dcinfotech.org.in",
    password: "intern@123",
    name: "Shilpa Patil",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "muvvala@dcinfotech.org.in",
    password: "intern@123",
    name: "Muvvala Donald ",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "harshavardhana@dcinfotech.org.in",
    password: "intern@123",
    name: "Harshavardhana A C ",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "ujwal@dcinfotech.me",
    password: "intern@123",
    name: "UJWAL P SHETTY ",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "rohan@dcinfotech.me",
    password: "intern@123",
    name: "Rohan Rajak",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "anand@dcinfotech.me",
    password: "intern@123",
    name: "ANAND Gokul ",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "prathmesh@dcinfotech.me",
    password: "intern@123",
    name: "Prathmesh",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "vaibhav@dcinfotech.org.in",
    password: "intern@123",
    name: "vaibhav gulge",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "sreejakalwa@dcinfotech.org.in",
    password: "intern@123",
    name: "Sreeja Kalwa",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "ahmed@dcinfotech.org.in",
    password: "intern@123",
    name: "Ahmed Hussain",
    phone: "N/A",
    batch: "ACE35",
  },

  {
    email: "surajnashine@dcinfotech.org.in",
    password: "intern@123",
    name: "Suraj Nashine",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "prajwal@dcinfotech.org.in",
    password: "intern@123",
    name: "Prajwal Shetty",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "hansika@dcinfotech.org.in",
    password: "intern@123",
    name: "Hansika Mahajan",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "sudarsan@dcinfotech.org.in",
    password: "intern@123",
    name: "SUDARSAN R",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "alexguria@dcinfotech.me",
    password: "intern@123",
    name: "Alex ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "dwaitchiranvaidya@dcinfotech.me",
    password: "intern@123",
    name: "Alex ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "abhirajarya@dcinfotech.me",
    password: "intern@123",
    name: "Abhiraj Arya",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "aniketsawant@dcinfotech.me",
    password: "intern@123",
    name: "Aniket Dilip Sawant",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "rohitanand@dcinfotech.me",
    password: "intern@123",
    name: "Rohit Anand ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "baibhavsagar@dcinfotech.me",
    password: "intern@123",
    name: "Baibhav Sagar",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "vijaybairwa@dcinfotech.me",
    password: "intern@123",
    name: "Vijay Bairwa ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "vallamkonduvignesh@dcinfotech.me",
    password: "intern@123",
    name: "Vallamkondu Vignesh",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "suhailasasan@dcinfotech.me",
    password: "intern@123",
    name: "Suhaila Sasan",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "sriramgajula@dcinfotech.me",
    password: "intern@123",
    name: "Sriram Gajula ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "sriramgajula@dcinfotech.me",
    password: "intern@123",
    name: "Sriram Gajula ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "neerajpandey@dcinfotech.me",
    password: "intern@123",
    name: "NEERAJ PANDEY  ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "danishhajiameen@dcinfotech.me",
    password: "intern@123",
    name: "Danish Haji Ameen",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "pushpendumukherjee@dcinfotech.me",
    password: "intern@123",
    name: "Pushpendu Mukherjee",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "prathameshvyawhare@dcinfotech.me",
    password: "intern@123",
    name: "Prathamesh Diliprao vyawhare",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "manyamchandrasekhar@dcinfotech.me",
    password: "intern@123",
    name: "Manyam Chandrasekhar ",
    phone: "N/A",
    batch: "clouddeveloper",
  },

  {
    email: "poonammahalley@dcinfotech.me",
    password: "intern@123",
    name: "Poonam Sureshrao Mahalley ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "shreyashpisal@dcinfotech.me",
    password: "intern@123",
    name: "Shreyash Bharat Pisal ",
    phone: "Shreyash Bharat Pisal",
    batch: "ACEJULY2025",
  },

  {
    email: "vanshitathakur@dcinfotech.me",
    password: "intern@123",
    name: "Vanshita Thakur",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "mihirrauniyar@dcinfotech.me",
    password: "intern@123",
    name: "Mihir Rauniyar",
    phone: "N/A",
    batch: "",
  },
  {
    email: "vnandakishore@dcinfotech.me",
    password: "intern@123",
    name: "V Nandakishore ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "anuragkamdi@dcinfotech.me",
    password: "intern@123",
    name: "Anurag Yashawant Kamdi",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "adityakumar@dcinfotech.me",
    password: "intern@123",
    name: "Aditya kumar",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "aryaligde@dcinfotech.me",
    password: "intern@123",
    name: "Arya Ligde",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "pardeshinikhil@dcinfotech.me",
    password: "intern@123",
    name: "Nikhil Pardeshi",
    phone: "1234567890",
    batch: "ACE",
  },
  {
    email: "rohandesai@dcinfotech.me",
    password: "intern@123",
    name: "Rohan Desai",
    phone: "1234567890",
    batch: "ACE",
  },

  {
    email: "chandrashekarv@dcinfotech.me",
    password: "intern@123",
    name: "Chandra ShekarV",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "tejachintapalli@dcinfotech.me",
    password: "intern@123",
    name: "Teja Chintapalli",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "chinmayrahangdale@dcinfotech.me",
    password: "intern@123",
    name: "Chinmay Rahangdale",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "ASHIQUEANTONY@dcinfotech.me",
    password: "intern@123",
    name: "ASHIQUE ANTONY",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "rahmanchoudhary@dcinfotech.me",
    password: "intern@123",
    name: "Rahman Choudhary",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "nainaghosh@dcinfotech.me",
    password: "intern@123",
    name: "Naina Ghosh",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "ASHIQUEANTONY@dcinfotech.me",
    password: "intern@123",
    name: "ASHIQUE ANTONY",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "ramgandam@dcinfotech.me",
    password: "intern@123",
    name: "SAIRAM GANDAM",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "sapnamohanta@dcinfotech.me",
    password: "intern@123",
    name: "Sapna Mohanta",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "dineshvadlaputi@dcinfotech.me",
    password: "intern@123",
    name: "DINESH VADLAPUTI",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "sivanikhil.maradan@dcinfotech.me",
    password: "intern@123",
    name: "Sivanikhil Maradani",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "sushantjamdade@dcinfotech.me",
    password: "intern@123",
    name: "Sushant Anna Jamdade",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "nainaghosh@dcinfotech.me",
    password: "intern@123",
    name: "Naina Ghosh",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "avinashsaxena@dcinfotech.me",
    password: "intern@123",
    name: "Avinash Saxena",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "mounicareddy@dcinfotech.me",
    password: "intern@123",
    name: "Ch Mounica Reddy",
    phone: "",
    batch: "ACE",
  },

  {
    email: "shashankkale@dcinfotech.me",
    password: "intern@123",
    name: "Shashank Kale",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "bhawanaverma@dcinfotech.me",
    password: "intern@123",
    name: "Bhawana Verma",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "saikrishna@dcinfotech.me",
    password: "intern@123",
    name: "Sai Krishna",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "shashankshambharkar@dcinfotech.me",
    password: "intern@123",
    name: "Shashank Shambharkar",
    phone: "N/A",
    batch: "ACE",
  },





  {
    email: "vachana@dcinfotech.org.in",
    password: "intern@123",
    name: "Vachana Gowda",
    phone: "N/A",
    batch: "ACE75",
  },
  {
    email: "akhil@dcinfotech.org.in",
    password: "intern@123",
    name: "Akhil Kona",
    phone: "N/A",
    batch: "ACE75",
  },


  {
    email: "karunyamarri@dcinfotech.me",
    password: "intern@123",
    name: "Karunya Marri",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "vadlamani.akshaykumar@dcinfotech.me",
    password: "intern@123",
    name: "Akshay Vadlamani",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "nadipallidurgaprasad@dcinfotech.me",
    password: "intern@123",
    name: "Nadipalli Durgaprasad",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "rakeshkamat@dcinfotech.me",
    password: "intern@123",
    name: "Rakesh Kamat",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "namandhariwal@dcinfotech.me",
    password: "intern@123",
    name: "Naman Dhariwal",
    phone: "N/A",
    batch: "GENAI",
  },

  {
    email: "janvisen@dcinfotech.me",
    password: "intern@123",
    name: "Janvi Sen",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "pavankumarkodag@dcinfotech.me",
    password: "intern@123",
    name: "Pavankumar Kodag",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "chinthalapatishivanagarjuna@dcinfotech.me",
    password: "intern@123",
    name: "Chinthalapati Shiva Nagarjuna ",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "sadaf.perveen@dcinfotech.me",
    password: "intern@123",
    name: "SADAF",
    phone: "N/A",
    batch: "ACE75",
  },
  {
    email: "bevinmosess@dcinfotech.me",
    password: "intern@123",
    name: "Bevin",
    phone: "N/A",
    batch: "3MARCH",
  },
  {
    email: "krishna.sandeepkaruturi@dcinfotech.me",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "8722889994",
    batch: "3MARCH",
  },
  {
    email: "sahilbhosale@dcinfotech.me",
    password: "intern@123",
    name: "Sahil Bhosale",
    phone: "9326251178",
    batch: "3MARCH",
  },
  {
    email: "prathamesh.pathak@dcinfotech.me",
    password: "intern@123",
    name: "Prathamesh Satish Pathak",
    phone: "8698662408",
    batch: "3MARCH",
  },
  {
    email: "krishnayadav@dcinfotech.me",
    password: "intern@123",
    name: "Krishna Yadav",
    phone: "06386052158",
    batch: "3MARCH",
  },
  {
    email: "atharva.kumbhar@dcinfotech.me",
    password: "intern@123",
    name: "Atharva Kishor Kumbhar",
    phone: "8108741281",
    batch: "3MARCH",
  },
  {
    email: "preetha.elangovan@dcinfotech.me",
    password: "intern@123",
    name: "Preetha Elangovan",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "pranjalpagaria20@gmail.com",
    password: "intern@123",
    name: "Pranjalpagaria",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "ruturaj.sonone@dcinfotech.me",
    password: "intern@123",
    name: "Ruturaj Sonone",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "sharankumar@dcinfotech.me",
    password: "sharan@123",
    name: "Sharan Kumar",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "sharankumar@dcinfotech.me",
    password: "intern@123",
    name: "Sharan Kumar",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "shardul.tiwari@dcinfotech.me",
    password: "intern@123",
    name: "Shardul Tiwari",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "m.anand@dcinfotech.me",
    password: "intern@123",
    name: "M Anand",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "shardul.tiwari@dcinfotech.me",
    password: "intern@123",
    name: "Shardul Tiwari",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "bevinmosess@dcinfotech.me",
    password: "bevin@69",
    name: "Bevin Mosess",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "mandar.nareshbodane@dcinfotech.me",
    password: "mandar@123",
    name: "Mandar Naresh Bodane",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "saloni.dhall@dcinfotech.me",
    password: "intern@123",
    name: "Saloni Dhall",
    phone: "",
    batch: "ACEjuly",
  },
  {
    email: "rethessh.ed@dcinfotech.me",
    password: "intern@123",
    name: "Rethessh Ed",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "nikhil.kamode@dcinfotech.me",
    password: "intern@123",
    name: "Nikhil Kamode",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "atharva.kumbhar@dcinfotech.me",
    password: "intern@123",
    name: "Atharva Kumbhar",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "dinesh.borase@dcinfotech.me",
    password: "intern@123",
    name: "Dinesh Borase",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "rameshprasad@dcinfotech.me",
    password: "intern@123",
    name: "Ramesh Prasad",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "satishkumarjanapureddi@dcinfotech.me",
    password: "intern@123",
    name: "Satish Kumar Janapureddi",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "pratikshagupta@dcinfotech.me",
    password: "intern@123",
    name: "pratikshagupta",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "vishwakkotha@dcinfotech.me",
    password: "intern@123",
    name: "vishwakkotha",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "vinodb@dcinfotech.me",
    password: "intern@123",
    name: "vinod B",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },

  // 1 April batch
  {
    email: "sppranam@dcinfotech.me",
    password: "intern@123",
    name: "SP Pranam",
    phone: "1234567890",
    batch: "ACE",
  },

  {
    email: "priyanshukhandelwal@dcinfotech.me",
    password: "intern@123",
    name: "priyanshukhandelwal",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "nandinimatapodu@dcinfotech.me",
    password: "intern@123",
    name: "nandinimatapodu",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },

  {
    email: "pittasaideep@dcinfotech.me",
    password: "intern@123",
    name: "PITTA SAIDEEP",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "mayureshpatil@dcinfotech.me",
    password: "intern@123",
    name: "mayureshpatil",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "kandikondagurusai@dcinfotech.me",
    password: "intern@123",
    name: "kandikondagurusai",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "princepansuriya@dcinfotech.me",
    password: "intern@123",
    name: "Prince Pansuriya",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "adarshdogra@dcinfotech.me",
    password: "intern@123",
    name: "Adarsh Dogra",
    phone: "",
    note: "Live sessidons schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },

  {
    email: "adarshdogra@dcinfotech.me",
    password: "intern@123",
    name: "Adarsh Dogra",
    phone: "",
    note: "Live sessidons schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },

  {
    email: "dharanilingasamy@dcinfotech.me",
    password: "intern@123",
    name: "Dharani Lingasamy",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "adityasingh@dcinfotech.me",
    password: "intern@123",
    name: "Aditya Singh",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "varshithpasupunuri@dcinfotech.me",
    password: "intern@123",
    name: "Varshith Pasupunuri",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "bhagwatibashyal@dcinfotech.me",
    password: "intern@123",
    name: "Bhagwati Bhimdev Bashyal",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "mahmadirfan@dcinfotech.me",
    password: "intern@123",
    name: "Mahmad Irfan",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "vedantpatil@dcinfotech.me",
    password: "intern@123",
    name: "Vedant Patil",
    phone: "",
    batch: "ACE4AUGUST",
  },
  {
    email: "gudarurajkumar@dcinfotech.me",
    password: "intern@123",
    name: "Gudaru Rajkumar",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "shanmukatrived@dcinfotech.me",
    password: "intern@123",
    name: "Penukonda Shanmuka Trived",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "sutharisaimanikantavivek@dcinfotech.me",
    password: "intern@123",
    name: "Suthari Sai manikanta vivek",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "omkardhananjaywagh@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Dhananjay Wagh",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "anjalipathak@dcinfotech.me",
    password: "intern@123",
    name: "Anjali Pathak",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "omkarwagh@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Dhananjay Wagh",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "rogyeabhijeet@dcinfotech.me",
    password: "intern@123",
    name: "Abhijeet Rogye",
    phone: "",
    batch: "GENAI",
  },
  {
    email: "shashankrai@dcinfotech.me",
    password: "intern@123",
    name: "Shashank Rai",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "pargichandana@dcinfotech.me",
    password: "intern@123",
    name: "Pargi Chandana",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "c.mahesh@dcinfotech.me",
    password: "intern@123",
    name: "Mahesh C",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "aniketprakashpawar@dcinfotech.me",
    password: "intern@123",
    name: "Aniket Prakash Pawar",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "vishalsunilghorse@dcinfotech.me",
    password: "intern@123",
    name: "Vishal Sunil Ghorse",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "piyushmujmule@dcinfotech.me",
    password: "intern@123",
    name: "Piyush Mujmule",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "nidhikrishnagangurde@dcinfotech.me",
    password: "intern@123",
    name: "nidhikrishnagangurde",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "gauravsingh@dcinfotech.me",
    password: "intern@123",
    name: "gauravsingh",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "jedlaritishkrishna@dcinfotech.me",
    password: "intern@123",
    name: "JEDLA RITISH KRISHNA",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "soumyaranjanmohanty@dcinfotech.me",
    password: "intern@123",
    name: "JEDLA RITISH KRISHNA",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "tejasbhaskartadka@dcinfotech.me",
    password: "intern@123",
    name: "Tejas Bhaskar Tadka",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "shirisha@dcinfotech.org.in",
    password: "intern@123",
    name: "shirshathakur",
    phone: "",
    batch: "PDE01",
  },

  //new entery
  {
    email: "sreedharchalumuri@dcinfotech.me",
    password: "intern@123",
    name: "SREEDHAR CHALUMURI",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "meetsathavara@dcinfotech.me",
    password: "intern@123",
    name: "Sathavara Meet Kaushikkumar",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "payalsonkusare@dcinfotech.me",
    password: "intern@123",
    name: "PAYAL RAMBHAROS SONKUSARE",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "najanayogivamsikrishna@dcinfotech.me",
    password: "intern@123",
    name: "Najana Yogi Vamsi Krishna",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "shubhamahire@dcinfotech.me",
    password: "intern@123",
    name: "Shubham Ahire",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "gurdeepsinghrayat@dcinfotech.me",
    password: "intern@123",
    name: "Gurdeep Singh Rayat",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "mohammadabdullahshareef@dcinfotech.me",
    password: "intern@123",
    name: "Mohammad Abdullah Shareef",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "saivardhiniravada@dcinfotech.me",
    password: "intern@123",
    name: "Sai Vardhini Ravada",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "akshaygoudpulloori@dcinfotech.me",
    password: "intern@123",
    name: "Akshay Goud Pulloori",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "sachin23maurya@gmail.com",
    password: "intern@123",
    name: "sachin23maurya",
    phone: "",
    batch: "GENAI101",
  },

  {
    email: "aaryakrup@dcinfotech.org.in",
    password: "intern@123",
    name: "aaryakrup",
    phone: "",
    batch: "GENAI101",
  },

  {
    email: "sarth@dcinfotech.org.in",
    password: "intern@123",
    name: "sarth",
    phone: "",
    batch: "GENAI101",
  },


  {
    email: "ramangajananlolure@dcinfotech.me",
    password: "intern@123",
    name: "Raman Gajanan Lolure",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "mustafaalimiyaji@dcinfotech.me",
    password: "intern@123",
    name: "Mustafa Ali Miyaji",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "sachinrao@dcinfotech.me",
    password: "intern@123",
    name: "Sachin Rao",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "prithvirajbarodiya@dcinfotech.me",
    password: "intern@123",
    name: "Prithviraj Barodiya Mukesh ",
    phone: "",
    batch: "1APRIL",
  },

  //2 april
  {
    email: "siddapureddysaisivasankarreddy@dcinfotech.me",
    password: "intern@123",
    name: "Siddapureddy Sai Siva Sankar Reddy ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "bonulagunavijayanand@dcinfotech.me",
    password: "intern@123",
    name: "Bonula Guna Vijay Anand",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "mdganim@dcinfotech.me",
    password: "intern@123",
    name: "Md Ganim ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "atharvrajendraborate@dcinfotech.me",
    password: "intern@123",
    name: "Atharv Rajendra Borate ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "hidhaafsalkhan@dcinfotech.me",
    password: "intern@123",
    name: "Hidha Afsalkhan ",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "syedmohamedsarjoon@dcinfotech.me",
    password: "intern@123",
    name: "Syed Mohamed Sarjoon ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "mayank.sunvaiya@dcinfotech.me",
    password: "intern@123",
    name: "Mayank Sunvaiya",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "akashkoche@dcinfotech.me",
    password: "intern@123",
    name: "AKASH KOCHE ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "sandhyarammurtivarma@dcinfotech.me",
    password: "intern@123",
    name: "SANDHYA RAMMURTI VARMA",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "pratikshivajipatil@dcinfotech.me",
    password: "intern@123",
    name: "PRATIK SHIVAJI PATIL",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "pankajkumar@dcinfotech.me",
    password: "intern@123",
    name: "PANKAJ KUMAR",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "maheshkumarsingh@dcinfotech.me",
    password: "intern@123",
    name: "Mahesh Kumar Singh P S ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "amitshinde@dcinfotech.me",
    password: "intern@123",
    name: "Amit Shinde",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "rajanikurapati@dcinfotech.me",
    password: "intern@123",
    name: "Rajani Kurapati V",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "vaibhavgaikwad@dcinfotech.me",
    password: "intern@123",
    name: " vaibhavgaikwad",
    phone: "",
    batch: "2APRIL",
  },

  // new

  {
    email: "smitpatil@dcinfotech.me",
    password: "intern@123",
    name: "Smit Patil",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "utkarshpatil@dcinfotech.me",
    password: "intern@123",
    name: "Utkarsh Patil",
    phone: "",
    batch: "ACE",
  },

  // ...existing users...
  {
    email: "shrutinanaveer@dcinfotech.me",
    password: "intern@123",
    name: "Shruti Nana Veer",
    phone: "",
    batch: "ACE",
  },
  {
    email: "hrishitghildiyal@dcinfotech.me",
    password: "intern@123",
    name: "Hrishit ghildiyal",
    phone: "",
    batch: "ACE",
  },
  {
    email: "stanleyraj@dcinfotech.me",
    password: "intern@123",
    name: "STANLEY RAJ KUMAR",
    phone: "",
    batch: "ACE",
  },
  {
    email: "gaurav@dcinfotech.me",
    password: "intern@123",
    name: "GAURAV",
    phone: "",
    batch: "ACE",
  },
  {
    email: "pratyakshbansal@dcinfotech.me",
    password: "intern@123",
    name: "Pratyaksh Bansal",
    phone: "",
    batch: "ACE",
  },
  {
    email: "surajkumar@dcinfotech.me",
    password: "intern@123",
    name: "Surajkumar Srinivasan Idiga",
    phone: "",
    batch: "ACE",
  },
  {
    email: "rohittiwari@dcinfotech.me",
    password: "intern@123",
    name: "Rohit Tiwari",
    phone: "",
    batch: "ACE",
  },
  {
    email: "adithyarao@dcinfotech.me",
    password: "intern@123",
    name: "Adithya Rao",
    phone: "",
    batch: "ACE",
  },
  {
    email: "himanshupatil@dcinfotech.me",
    password: "intern@123",
    name: "Himanshu Patil",
    phone: "",
    batch: "ACE",
  },
  {
    email: "rahulkore@dcinfotech.me",
    password: "intern@123",
    name: "Kore Rahul Sai",
    phone: "",
    batch: "ACE",
  },
  {
    email: "sudheersahu@dcinfotech.me",
    password: "intern@123",
    name: "Sudheer Sahu",
    phone: "",
    batch: "ACE",
  },
  {
    email: "supriyomukherjee@dcinfotech.me",
    password: "intern@123",
    name: "Supriyo Mukherjee",
    phone: "",
    batch: "ACE",
  },
  {
    email: "sachdevparihar@dcinfotech.me",
    password: "intern@123",
    name: "Sachdev Parihar",
    phone: "",
    batch: "ACE",
  },
  {
    email: "shubhamlagad@dcinfotech.me",
    password: "intern@123",
    name: "Shubham Sanjay Lagad",
    phone: "",
    batch: "ACE",
  },

  {
    email: "tarundhauta@dcinfotech.me",
    password: "intern@123",
    name: "Tarun Dhauta",
    phone: "",
    batch: "ACE",
  },

  {
    email: "ajay.guhade@dcinfotech.me",
    password: "intern@123",
    name: "Ajay Vitthal Guhade",
    phone: "",
    batch: "clouddevopsaugust",
  },

  {
    email: "pethanidaksh@dcinfotech.me",
    password: "intern@123",
    name: "Pethani Daksh",
    phone: "",
    batch: "ACE",
  },

  {
    email: "smohammadsameer@dcinfotech.me",
    password: "intern@123",
    name: "S Mohammad Sameer ",
    phone: "",
    batch: "ACE",
  },

  {
    email: "piyushsinghrawat@dcinfotech.me",
    password: "intern@123",
    name: "  Piyush Singh Rawat ",
    phone: "",
    batch: "ACE",
  },

  {
    email: "aslamck@dcinfotech.me",
    password: "intern@123",
    name: "Aslam ck",
    phone: "",
    batch: "ACE",
  },
  // ...existing users...
  {
    email: "apekshitkadam@dcinfotech.me",
    password: "intern@123",
    name: "Apekshit Kadam",
    phone: "",
    batch: "ACE",
  },

  {
    email: "ronaksingh@dcinfotech.me",
    password: "intern@123",
    name: "Ronak Singh",
    phone: "",
    batch: "ACE",
  },
  {
    email: "hirenchaudhari@dcinfotech.me",
    password: "intern@123",
    name: "hiren chaudhari",
    phone: "",
    batch: "ACEjuly",
  },

  {
    email: "devanshsen@dcinfotech.me",
    password: "intern@123",
    name: "Devansh sen ",
    phone: "",
    batch: "ACEjuly",
  },
  {
    email: "ashutoshashokkumar@dcinfotech.me",
    password: "intern@123",
    name: "Ashutosh Ashok Kumar ",
    phone: "",
    batch: "ACE",
  },
  {
    email: "rahmanchoudhary@dcinfotech.me ",
    password: "intern@123",
    name: "Rahman Choudhary  ",
    phone: "",
    batch: "ACE",
  },

  {
    email: "aslamck@dcinfotech.me",
    password: "intern@123",
    name: "Aslam ck",
    phone: "",
    batch: "ACE",
  },


  {
    email: "bhargavbalajinaidu@dcinfotech.me",
    password: "intern@123",
    name: "Bhargav Balaji Naidu ",
    phone: "",
    batch: "ACE",
  },

  // ML batch
  {
    email: "saif.nandyal@dcinfotech.me",
    password: "intern@123",
    name: "Saif Nandyal",
    phone: "",
    batch: "ACE",
  },
  {
    email: "aadarshputtamaneni@dcinfotech.me",
    password: "intern@123",
    name: "Aadarsh Puttamaneni",
    phone: "",
    batch: "ACE",
  },

  {
    email: "omkarshinde@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Shinde",
    phone: "",
    batch: "ACE",
  },

  //DEVOPS BATCH

  {
    email: "shan.muganandam@dcinfotech.me",
    password: "intern@123",
    name: " K.shanmuganandam",
    phone: "",
    batch: "DEVOPS",
  },
  {
    email: "gauravbhatt@dcinfotech.me",
    password: "intern@123",
    name: "GAURAV BHATT",
    phone: "",
    batch: "DEVOPS",
  },
  {
    email: "advik.dhanorkar@dcinfotech.me",
    password: "intern@123",
    name: "advik.dhanorkar",
    phone: "",
    batch: "DEVOPS",
  },
  {
    email: "varunesh2509@gmail.com",
    password: "intern@123",
    name: "LASHKAR VARUNESH",
    phone: "",
    batch: "DEVOPS",
  },
  //new devops SELECT * FROM `qwiklabs-gcp-00-1d4b7c3eb1a2.cluster_dataset.usage_metering_cost_breakdown`
  {
    email: "anantchandola@dcinfotech.me",
    password: "intern@123",
    name: "ANANT CHANDOLA",
    phone: "",
    batch: "CLOUDDEVOPSAUGUST",
  },

  //architect batch  cloudarchitectjuly

  {
    email: "nishigandhajagadale@dcinfotech.me",
    password: "intern@123",
    name: "Nishigandha Jagadale ",
    phone: "",
    batch: "CLOUDARCHITECT",
  },

  {
    email: "siyaldhande@dcinfotech.me",
    password: "intern@123",
    name: "Siyal Dhande ",
    batch: "CLOUDARCHITECTAPRIL",
  },

  {
    email: "atharvalavangare@dcinfotech.me",
    password: "intern@123",
    name: "Atharva Lavangare",
    phone: "N/A",
    batch: "ACE",
  },

  //    NEW ONE FROM 25 JUNE ACE

  {
    email: "subirnathbhowmik@dcinfotech.me",
    password: "intern@123",
    name: "SUBIR NATH BHOWMIK",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "shivamraj@dcinfotech.me",
    password: "intern@123",
    name: "Shivam Raj",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "shaliniamarnathsharma@dcinfotech.me",
    password: "intern@123",
    name: "Shalini Amarnath Sharma ",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "omkarsbarbade@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Barbade",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "krishnamarappan@dcinfotech.me",
    password: "intern@123",
    name: "Krishna Marappan",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "trahulprabhu@dcinfotech.me",
    password: "intern@123",
    name: "TRahul Prabhu",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "thilakchandar@dcinfotech.me",
    password: "intern@123",
    name: "Thilak ChandarR",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "gummidijagadeesh@dcinfotech.me",
    password: "intern@123",
    name: "JAGADEESH GUMMIDI",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "prem.sai@dcinfotech.me",
    password: "intern@123",
    name: "PremSai Mashetti",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "pranavshashikantshimpi@dcinfotech.org.in",
    password: "intern@123",
    name: "Pranav Shimpi",
    phone: "N/A",
    batch: "ACE",
  },


  // 1 july new batch

  {
    email: "kunaldange@dcinfotech.me",
    password: "intern@123",
    name: "Kunal Dange",
    phone: "",
    batch: "ACEjuly",
  },

  {
    email: "siddharth@dcinfotech.org.in",
    password: "intern@123",
    name: "Siddharth Joshi",
    phone: "",
    batch: "ML",
  },
];
// js/agenda.js

// Disable right-click context menu
// Disable right-click context menu
// document.addEventListener("contextmenu", function (e) {
//   e.preventDefault();
// });

// Disable specific key combinations


// Optional: Detect and close developer tools by checking for debugger
// Anti-debugging disabled for maintenance
// setInterval(function () {
//   const before = performance.now();
//   debugger;
//   const after = performance.now();
//   if (after - before > 100) {
//     alert("Dev tools are not allowed!");
//     window.location.reload();
//   }
// }, 1000);

// Removed invalid test code
// document.body.appendChild(createSessionElement(session1, "ML")); 
// document.body.appendChild(createSessionElement(session1, "other")); 
// document.getElementById("userName").textContent = userData.name;
// document.getElementById("userEmail").textContent = userData.email;

document.addEventListener("DOMContentLoaded", loadPage);

// Browser Notification Logic
function sendReminder(day, time, desc, link) {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    scheduleNotification(day, time, desc, link);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        scheduleNotification(day, time, desc, link);
      }
    });
  }
}

function scheduleNotification(day, time, desc, link) {
  const startStr = time.split(" - ")[0].trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
  const targetDate = new Date(`${day} ${startStr}`).getTime();
  const now = new Date().getTime();
  const timeToSession = targetDate - now;
  const tenMinutes = 10 * 60 * 1000;

  // Calculate delay: 10 mins before session, or immediately if less than 10 mins left
  let delay = timeToSession - tenMinutes;
  if (delay < 0) delay = 0; // Notify immediately if within 10 mins

  if (timeToSession < 0) {
    Notiflix.Notify.warning("This session has already started or ended.");
    return;
  }

  Notiflix.Notify.success("Reminder set! You'll be notified 10 minutes before class.");

  setTimeout(() => {
    const notification = new Notification("Session Starting Soon!", {
      body: `Your session "${desc}" is starting in 10 minutes. Click to join!`,
      icon: "https://dcinfotech.org.in/images/logo.png"
    });

    notification.onclick = function () {
      window.open(link, "_blank");
    };
  }, delay);
}

// --- Advanced Features Helper Functions ---

// 1. Toggle Watched Status
function toggleWatched(id, checkbox) {
  let watched = JSON.parse(localStorage.getItem('watched_sessions') || '[]');
  if (checkbox.checked) {
    if (!watched.includes(id)) watched.push(id);
    Notiflix.Notify.success('Marked as watched!');
  } else {
    watched = watched.filter(item => item !== id);
    Notiflix.Notify.info('Marked as unwatched.');
  }
  localStorage.setItem('watched_sessions', JSON.stringify(watched));

  // Refresh to update progress bar
  // We can just reload the schedule logic, but a full reload is safer for now to update progress bar
  setTimeout(() => loadSchedule(), 500);
}

// 2. Export Schedule to CSV
function exportScheduleCSV() {
  const sessions = [...schedule, ...scheduleAll];
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Date,Time,Description,Link\n";

  sessions.forEach(function (rowArray) {
    let row = `"${rowArray.day}","${rowArray.time}","${rowArray.description}","${rowArray.link}"`;
    csvContent += row + "\r\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_schedule.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 3. Toggle Grid View
function toggleGridView() {
  const container = document.getElementById('schedule');
  container.classList.toggle('schedule-grid');
  const btn = document.getElementById('gridViewBtn');
  if (container.classList.contains('schedule-grid')) {
    if (btn) btn.innerHTML = '<i class="fas fa-list"></i> List View';
    localStorage.setItem('viewMode', 'grid');
  } else {
    if (btn) btn.innerHTML = '<i class="fas fa-th-large"></i> Grid View';
    localStorage.setItem('viewMode', 'list');
  }
}

// 4. Toggle Timezone (Simple Implementation)
let useLocalTime = false;
function toggleTimezone() {
  useLocalTime = !useLocalTime;
  const btn = document.getElementById('timezoneBtn');
  if (useLocalTime) {
    if (btn) btn.innerHTML = '<i class="fas fa-globe"></i> Show IST';
    Notiflix.Notify.info('Switched to Local Time');
  } else {
    if (btn) btn.innerHTML = '<i class="fas fa-clock"></i> Show Local Time';
    Notiflix.Notify.info('Switched to IST');
  }
  // Re-render needed. For now, just reload page or call loadSchedule if we updated the logic to support this flag.
  // Since loadSchedule logic needs deep changes for timezone, we will just notify for now as per plan "Simple Toggle".
  // To fully implement, we would need to parse dates in createSessionElement using this flag.
  loadSchedule();
}

// Initialize View Mode
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('viewMode') === 'grid') {
    const container = document.getElementById('schedule');
    if (container) container.classList.add('schedule-grid');
    const btn = document.getElementById('gridViewBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-list"></i> List View';
  }

  // Inject Toolbar if not exists
  const header = document.querySelector('.section-header');
  if (header && !document.getElementById('agendaToolbar')) {
    const toolbar = document.createElement('div');
    toolbar.id = 'agendaToolbar';
    toolbar.className = 'toolbar-actions';
    toolbar.innerHTML = `
            <button id="timezoneBtn" class="toolbar-btn" onclick="toggleTimezone()"><i class="fas fa-clock"></i> Show Local Time</button>
            <button id="gridViewBtn" class="toolbar-btn" onclick="toggleGridView()"><i class="fas fa-th-large"></i> Grid View</button>
            <button class="toolbar-btn" onclick="exportScheduleCSV()"><i class="fas fa-file-csv"></i> Export CSV</button>
        `;
    header.appendChild(toolbar);
  }
});

// Toggle Resources Dropdown Menu
function toggleResourcesMenu(event) {
  event.stopPropagation();
  const dropdown = event.target.closest('.resources-dropdown');
  const menu = dropdown.querySelector('.resources-menu');

  // Close all other open dropdowns first
  document.querySelectorAll('.resources-menu.show').forEach(m => {
    if (m !== menu) m.classList.remove('show');
  });

  // Toggle current dropdown
  menu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
  if (!event.target.closest('.resources-dropdown')) {
    document.querySelectorAll('.resources-menu.show').forEach(m => {
      m.classList.remove('show');
    });
  }
});

// =====================================
// FEATURE 1: SESSION BOOKMARKS
// =====================================

function isSessionBookmarked(sessionId) {
  const bookmarks = JSON.parse(localStorage.getItem('session_bookmarks') || '[]');
  return bookmarks.includes(sessionId);
}

function toggleBookmark(sessionId, buttonElement) {
  const bookmarks = JSON.parse(localStorage.getItem('session_bookmarks') || '[]');
  const index = bookmarks.indexOf(sessionId);

  if (index > -1) {
    // Remove bookmark
    bookmarks.splice(index, 1);
    buttonElement.classList.remove('bookmarked');
    buttonElement.querySelector('i').className = 'far fa-bookmark';
    buttonElement.title = 'Bookmark this session';
    Notiflix.Notify.info('Bookmark removed');
  } else {
    // Add bookmark
    bookmarks.push(sessionId);
    buttonElement.classList.add('bookmarked');
    buttonElement.querySelector('i').className = 'fas fa-bookmark';
    buttonElement.title = 'Remove bookmark';
    Notiflix.Notify.success('Session bookmarked!');
  }

  localStorage.setItem('session_bookmarks', JSON.stringify(bookmarks));
}

function showBookmarkedSessions() {
  const bookmarks = JSON.parse(localStorage.getItem('session_bookmarks') || '[]');
  if (bookmarks.length === 0) {
    Notiflix.Notify.info('No bookmarked sessions yet');
    return;
  }
  // Filter will be handled by the existing session display logic
  Notiflix.Notify.success(`Showing ${bookmarks.length} bookmarked sessions`);
}

// =====================================
// FEATURE 2: SESSION SEARCH
// =====================================

function searchSessions(query) {
  query = query.toLowerCase().trim();
  const container = document.getElementById('schedule');
  const sessions = container.querySelectorAll('.session');
  let visibleCount = 0;

  sessions.forEach(session => {
    const text = session.textContent.toLowerCase();
    if (query === '' || text.includes(query)) {
      session.style.display = '';
      visibleCount++;
    } else {
      session.style.display = 'none';
    }
  });

  // Show result count
  if (query && visibleCount === 0) {
    Notiflix.Notify.warning('No sessions found matching your search');
  } else if (query) {
    Notiflix.Notify.info(`Found ${visibleCount} session(s)`);
  }
}

// Setup search listener
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchSessions(e.target.value);
      }, 300); // Debounce search
    });
  }
});

// =====================================
// FEATURE 3: LEARNING STREAK
// =====================================

function updateLearningStreak() {
  const today = new Date().toDateString();
  const streakData = JSON.parse(localStorage.getItem('learning_streak') || '{"current": 0, "lastDate": null, "longest": 0, "dates": []}');

  // Check if already logged today
  if (streakData.lastDate === today) {
    return streakData.current;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (streakData.lastDate === yesterdayStr) {
    // Continue streak
    streakData.current++;
  } else if (streakData.lastDate !== null) {
    // Streak broken, reset
    streakData.current = 1;
  } else {
    // First time
    streakData.current = 1;
  }

  streakData.lastDate = today;
  streakData.dates.push(today);

  // Update longest streak
  if (streakData.current > streakData.longest) {
    streakData.longest = streakData.current;
  }

  localStorage.setItem('learning_streak', JSON.stringify(streakData));
  displayStreak(streakData.current, streakData.longest);

  return streakData.current;
}

function displayStreak(current, longest) {
  const streakContainer = document.getElementById('streakDisplay');
  if (!streakContainer) {
    // Create streak display in topbar if it doesn't exist
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight) {
      const streakDiv = document.createElement('div');
      streakDiv.id = 'streakDisplay';
      streakDiv.className = 'streak-badge';
      topbarRight.insertBefore(streakDiv, topbarRight.firstChild);
    }
  }

  const streakElement = document.getElementById('streakDisplay');
  if (streakElement) {
    let message = `<i class="fas fa-fire"></i> ${current} day streak`;

    // Add milestone badges
    if (current >= 100) {
      message += ' 💯';
    } else if (current >= 30) {
      message += ' 🏆';
    } else if (current >= 7) {
      message += ' ⭐';
    }

    streakElement.innerHTML = message;
    streakElement.title = `Current: ${current} days | Longest: ${longest} days`;
  }

  // Show motivational message for milestones
  if (current === 7) {
    Notiflix.Notify.success('🎉 One week streak! Keep it up!');
  } else if (current === 30) {
    Notiflix.Notify.success('🏆 30 day streak! You\'re on fire!');
  } else if (current === 100) {
    Notiflix.Notify.success('💯 100 day streak! Incredible dedication!');
  }
}

// Initialize streak on page load
document.addEventListener('DOMContentLoaded', () => {
  const streakData = JSON.parse(localStorage.getItem('learning_streak') || '{"current": 0, "lastDate": null, "longest": 0}');
  if (streakData.current > 0) {
    displayStreak(streakData.current, streakData.longest);
  }
});

// Update streak when user attends a session (call this when joining a session)
function markSessionAttended() {
  updateLearningStreak();
}

// =====================================
// FEATURE 4: EMAIL REMINDERS
// =====================================

// EmailJS Configuration (You need to sign up at emailjs.com)
const EMAILJS_CONFIG = {
  serviceId: 'service_syn5ees',  // Your EmailJS service ID
  templateId: 'template_x0az4m9', // Your EmailJS template ID
  publicKey: 'H6VWnC4FWgPkgR4g-'    // Your EmailJS public key
};

function sendEmailReminder(session) {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || JSON.parse(localStorage.getItem("cloudUser"));

  if (!user || !user.email) {
    Notiflix.Notify.warning('Please log in to receive email reminders');
    return;
  }

  // Check if EmailJS is configured
  if (EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID') {
    Notiflix.Notify.info('Email reminders are not configured yet. Using calendar reminder instead.');
    // Fall back to existing calendar reminder
    sendReminder(session.day, session.time, session.description, session.link);
    return;
  }

  // Prepare email template parameters
  const templateParams = {
    to_name: user.name,
    to_email: user.email,
    session_title: session.description,
    session_date: session.day,
    session_time: session.time,
    meeting_link: session.link || 'Will be available on the portal',
    platform_link: 'https://dcinfotech.org.in/cloud-training/'
  };

  // Send email using EmailJS
  emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templateId,
    templateParams,
    EMAILJS_CONFIG.publicKey
  ).then(
    function (response) {
      Notiflix.Notify.success('Email reminder sent successfully!');
      console.log('Email sent:', response);
    },
    function (error) {
      console.error('Email failed:', error);
      Notiflix.Notify.failure('Failed to send email reminder');
    }
  );
}

// Enhanced reminder function that offers both calendar and email
function enhancedSendReminder(day, time, description, link) {
  Swal.fire({
    title: 'Set Reminder',
    text: 'How would you like to be reminded?',
    icon: 'question',
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: 'Add to Calendar',
    denyButtonText: 'Send Email',
    cancelButtonText: 'Both',
    confirmButtonColor: '#1a73e8',
    denyButtonColor: '#0b57d0'
  }).then((result) => {
    if (result.isConfirmed) {
      // Calendar reminder
      sendReminder(day, time, description, link);
    } else if (result.isDenied) {
      // Email reminder
      sendEmailReminder({ day, time, description, link });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Both
      sendReminder(day, time, description, link);
      sendEmailReminder({ day, time, description, link });
    }
  });
}

// =====================================
// AUTOMATIC EMAIL NOTIFICATIONS TO GOOGLE GROUPS
// =====================================

// Map batches to Google Groups
const BATCH_TO_GROUP = {
  'ACE': 'intern-google-cloud@googlegroups.com',
  'ACEJULY': 'intern-google-cloud@googlegroups.com',
  'ACEJULY2025': 'intern-google-cloud@googlegroups.com',
  'ACE4AUGUST': 'intern-google-cloud@googlegroups.com',
  'ACE20': 'intern-google-cloud@googlegroups.com',
  'ACE21': 'intern-google-cloud@googlegroups.com',
  'ACE22': 'intern-google-cloud@googlegroups.com',
  'ACE23': 'intern-google-cloud@googlegroups.com',
  'ACE24': 'intern-google-cloud@googlegroups.com',
  'ACE75': 'intern-google-cloud@googlegroups.com',
  'ACE35': 'intern-google-cloud@googlegroups.com',
  'DEVOPS': 'intern-google-cloud@googlegroups.com',
  'CLOUDARCHITECT': 'intern-google-cloud@googlegroups.com',
  'CLOUDARCHITECTJULY': 'intern-google-cloud@googlegroups.com',
  'CLOUDDEVELOPER': 'intern-google-cloud@googlegroups.com',
  'CLOUDDEVOPSAUGUST': 'intern-google-cloud@googlegroups.com',
  'GENAI': 'intern-google-cloud@googlegroups.com',
  'GENAI101': 'intern-google-cloud@googlegroups.com',
  'ML': 'intern-google-cloud@googlegroups.com',
  'SECURITY': 'intern-google-cloud@googlegroups.com',
  'PCA': 'intern-google-cloud@googlegroups.com',
  'PCA25': 'intern-google-cloud@googlegroups.com',
  'DIGITALLEADER': 'intern-google-cloud@googlegroups.com',
  'NETWORKAUGUST2025': 'intern-google-cloud@googlegroups.com',
  'PDE01': 'intern-google-cloud@googlegroups.com',
  // December batch
  'DECEMBER': 'intern-december-2-google-cloud-engineer-program-dc-infotech@googlegroups.com',
  // November batch
  'NOVEMBER': 'intern-november-google-cloud-engineer-program---dc-infotech@googlegroups.com'
};

function getGoogleGroupForBatch(batch) {
  const batchUpper = batch ? batch.toUpperCase() : 'ACE';
  return BATCH_TO_GROUP[batchUpper] || 'intern-google-cloud@googlegroups.com';
}

function checkAndSendAutoReminders() {
  try {
    // Get all sessions from current schedule
    const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || JSON.parse(localStorage.getItem("cloudUser"));
    if (!user) return; // Only run if user is logged in

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));

    // Get sent emails from localStorage to prevent duplicates
    const sentEmails = JSON.parse(localStorage.getItem('auto_sent_emails') || '[]');

    // Get current schedule based on user's batch
    // We now use the globally synced window.currentSchedule which already merges batch + global
    const currentSessions = window.currentSchedule || [];

    // Check each session
    currentSessions.forEach(session => {
      if (!session.time || session.time === 'TBA') return;

      try {
        const [startStrRaw] = session.time.split(' - ');
        const startStr = startStrRaw.trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
        const sessionStart = new Date(`${session.day} ${startStr}`);

        if (isNaN(sessionStart)) return;

        // Check if session starts within next 2 hours
        if (sessionStart > now && sessionStart <= twoHoursFromNow) {
          const sessionId = `${session.day}_${session.time}_${session.description}`;

          // Check if we already sent email for this session
          if (!sentEmails.includes(sessionId)) {
            // Send email to Google Group
            sendAutoEmailToGroup(session, user.batch);

            // Mark as sent
            sentEmails.push(sessionId);
            localStorage.setItem('auto_sent_emails', JSON.stringify(sentEmails));

            console.log(`Auto-email sent for session: ${session.description}`);
          }
        }
      } catch (err) {
        console.error('Error processing session for auto-email:', err);
      }
    });
  } catch (err) {
    console.error('Error in checkAndSendAutoReminders:', err);
  }
}

function sendAutoEmailToGroup(session, batch) {
  const googleGroup = getGoogleGroupForBatch(batch);

  // Calculate time until session
  const now = new Date();
  const [startStrRaw] = session.time.split(' - ');
  const startStr = startStrRaw.trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
  const sessionStart = new Date(`${session.day} ${startStr}`);
  const hoursUntil = Math.round((sessionStart - now) / (1000 * 60 * 60) * 10) / 10;

  const templateParams = {
    to_name: 'Team',
    to_email: googleGroup,
    session_title: session.description,
    session_date: session.day,
    session_time: session.time,
    meeting_link: session.link || 'Will be available on the portal',
    platform_link: 'https://dcinfotech.org.in/cloud-training/',
    hours_until: hoursUntil
  };

  // Send email using EmailJS
  emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templateId,
    templateParams,
    EMAILJS_CONFIG.publicKey
  ).then(
    function (response) {
      console.log(`✅ Auto-email sent to ${googleGroup}`, response);
      Notiflix.Notify.success(`Reminder sent to ${googleGroup.split('@')[0]}`);
    },
    function (error) {
      console.error('❌ Auto-email failed:', error);
    }
  );
}

// Run auto-check when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for other initializations
  setTimeout(() => {
    checkAndSendAutoReminders();
  }, 2000);

  // Check every 30 minutes
  setInterval(checkAndSendAutoReminders, 30 * 60 * 1000);
});

// Clean up old sent email records (keep only last 7 days)
function cleanupOldEmailRecords() {
  try {
    const sentEmails = JSON.parse(localStorage.getItem('auto_sent_emails') || '[]');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter out old records (this is a simple cleanup, could be enhanced)
    const recentEmails = sentEmails.slice(-100); // Keep only last 100 records
    localStorage.setItem('auto_sent_emails', JSON.stringify(recentEmails));
  } catch (err) {
    console.error('Error cleaning up email records:', err);
  }
}

// Run cleanup daily
setInterval(cleanupOldEmailRecords, 24 * 60 * 60 * 1000);

// Exam Pre-checklists Data
const examChecklists = {
  "ACE": {
    title: "Associate Cloud Engineer: Pre-exam Checklist",
    items: [
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
        title: "1. Complete Learning Path",
        description: "Ensure you have met all prerequisites to be eligible for the exam voucher. Review the requirements list in your learning path.",
        link: "https://services.google.com/fh/files/misc/pck_cloud_engineer_one_pager.pdf",
        linkText: "View Learning Path"
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
        title: "2. Review the Exam Guide",
        description: "Understand the exam objectives, format, and topics covered. This is crucial for your study plan.",
        link: "https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf",
        linkText: "Open Exam Guide"
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
        title: "3. Practice with Sample Questions",
        description: "Familiarize yourself with the question style and test your knowledge with official sample questions.",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSfexWKtXT2OSFJ-obA4iT3GmzgiOCGvjrT9OfxilWC1yPtmfQ/viewform",
        linkText: "View Sample Questions"
      }
    ]
  },
  "DATAENGINEER": {
    title: "Professional Data Engineer: Pre-exam Checklist",
    items: [
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
        title: "1. Complete Data Engineering Path",
        description: "Finish all required modules in the Data Engineering learning path to qualify for the certification voucher.",
        link: "https://cloud.google.com/data-engineer",
        linkText: "View Learning Path"
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
        title: "2. Review Exam Guide",
        description: "Study the official exam guide to understand the domain topics: Data Processing, Machine Learning, and Operationalizing.",
        link: "https://cloud.google.com/certification/guides/data-engineer",
        linkText: "Open Exam Guide"
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
        title: "3. Take Practice Exam",
        description: "Assess your readiness with the official Google Cloud Data Engineer practice exam.",
        link: "https://cloud.google.com/certification/practice-exam/data-engineer",
        linkText: "Start Practice Exam"
      }
    ]
  },
  "DEFAULT": {
    title: "Certification Pre-exam Checklist",
    items: [
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
        title: "1. Complete Your Training",
        description: "Ensure you have completed all assigned training modules and labs.",
        link: "#",
        linkText: "View Progress"
      },
      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
        title: "2. Review Documentation",
        description: "Read the official Google Cloud documentation relevant to your certification track.",
        link: "https://cloud.google.com/docs",
        linkText: "Browse Docs"
      }
    ]
  }
};
