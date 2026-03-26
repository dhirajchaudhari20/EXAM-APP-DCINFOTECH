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

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validate that both fields are filled
  if (email.trim() === "" || password.trim() === "") {
    Notiflix.Notify.failure("Please enter both email and password!");
    return;
  }

  showSpinner();

  try {
    const encodedEmail = email.trim().replace(/\./g, ',');
    const snapshot = await firebase.database().ref(`users/${encodedEmail}`).once('value');
    const user = snapshot.val();

    if (!user || user.password !== password) {
      hideSpinner();
      Notiflix.Notify.failure("Invalid credentials!");
      return;
    }

    // Login successful
    hideSpinner();
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("cloudUser", JSON.stringify(user)); // Persist for cross-tab/window

    Notiflix.Notify.success(
      `Login successful!<br>Welcome, ${user.name || user.email}!`,
      {
        timeout: 1000,
        useIcon: true,
        plainText: false,
      }
    );

    // Initialize Dashboard immediately
    loadPage();
  } catch (error) {
    console.error("Login verification failed:", error);
    hideSpinner();
    Notiflix.Notify.failure("Login error! Please try again later.");
  }
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

  // SILENT REAL-TIME SYNC: Async check if cached user data matches current Firebase user data
  // If batch assignment has been changed in the admin panel, quietly update the local cache
  // and re-render the learning portal without logging the user out.
  if (user && user.email) {
    try {
      const encodedEmail = user.email.replace(/\./g, ',');
      firebase.database().ref(`users/${encodedEmail}`).on('value', snap => {
        const currentUserData = snap.val();
        // If the user was completely deleted from Firebase, log them out
        if (!currentUserData) {
          sessionStorage.removeItem("loggedInUser");
          localStorage.removeItem("cloudUser");
          window.location.reload();
          return;
        }

        // If the batch changed, silently update and re-render
        if (currentUserData.batch !== user.batch) {
          console.log(`Batch data changed for ${user.email}. Silently syncing new batch: ${currentUserData.batch}`);
          user.batch = currentUserData.batch; // Update local memory reference
          sessionStorage.setItem("loggedInUser", JSON.stringify(user));
          localStorage.setItem("cloudUser", JSON.stringify(user));

          // Re-render the user interface to reflect the new batch access
          if (document.getElementById("dashboardContainer") && document.getElementById("dashboardContainer").style.display !== "none") {
            // Re-run the schedule fetching logic
            if (typeof renderSchedule === "function") {
              // Trigger a small notification if the user is actively staring at the schedule
              if (window.location.pathname.includes('schedule.html') || window.location.pathname.includes('my-learning.html')) {
                if (typeof Notiflix !== 'undefined') {
                  Notiflix.Notify.info("Your batch assignment was just updated by an administrator.");
                }
              }
              // Force schedule re-render by calling loadPage's downstream functions again
              setTimeout(() => {
                const updatedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
                // This simulates the behavior at the bottom of loadPage
                if (window.location.pathname.includes("schedule.html") && typeof updateScheduleUI === "function") {
                  firebase.database().ref(`agendas/${updatedUser.batch}`).once('value').then(s => {
                    window.currentSchedule = s.val() ? Object.values(s.val()) : [];
                    updateScheduleUI(window.currentSchedule);
                  });
                }
              }, 500);
            }
          }
        }
      });
    } catch (err) {
      console.error("Real-time sync check failed", err);
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

// Automated alerts have been moved to the background service: scripts/alert-service.js
// This ensures alerts are sent even when students/admins are not logged in.

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
