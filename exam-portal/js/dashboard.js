// Rewritten dashboard loader: exposes user synchronously and wires topbar dropdown + logout reliably
(function () {
  'use strict';

  function safeParse(raw) { try { return JSON.parse(raw); } catch (e) { return null; } }

  function getStoredUser() {
    const raw = localStorage.getItem('cm_user') || localStorage.getItem('currentUser') || localStorage.getItem('cmUser');
    if (!raw) return null;
    return safeParse(raw) || { email: String(raw) };
  }

  function getNumericUserId(userEmail) {
    if (!userEmail) return 'GUEST';
    const storageKey = `numeric_user_id_${userEmail}`;
    let numericId = localStorage.getItem(storageKey);
    if (!numericId) {
      // Generate a random 8-digit number
      numericId = Math.floor(10000000 + Math.random() * 90000000).toString();
      try { localStorage.setItem(storageKey, numericId); } catch (e) { }
    }
    return `GGLE${numericId}`;
  }

  function normalizeDisplay(userObj) {
    const displayName = userObj?.name || userObj?.displayName || userObj?.fullName || (userObj?.email ? userObj.email.split('@')[0] : '');
    const username = getNumericUserId(userObj?.email);
    return { displayName, username, email: userObj?.email || '' };
  }

  // expose synchronously so inline code can see user immediately
  (function earlyExpose() {
    const stored = getStoredUser();
    if (!stored) return;
    let merged = Object.assign({}, stored);
    if (Array.isArray(window.USERS) && stored.email) {
      const profile = window.USERS.find(u => u.email && u.email.toLowerCase() === String(stored.email).toLowerCase());
      if (profile) merged = Object.assign({}, merged, profile);
    }
    const n = normalizeDisplay(merged);
    const obj = { displayName: n.displayName, username: n.username, email: n.email, raw: merged };
    // Ensure DASHBOARD_USER is set and localStorage is updated.
    if (Object.keys(obj.raw).length > 0) {
      window.DASHBOARD_USER = obj;
      try { localStorage.setItem('currentUser', JSON.stringify(obj)); } catch (e) { }
    }
    // --- Certificate Demo Logic ---
    window.showDemoCertificate = async function () {
      const user = JSON.parse(localStorage.getItem('cm_user') || '{}');
      const examName = "Associate Cloud Engineer"; // Demo default
      const seriesID = "4301";
      const uniqueID = "DEMO-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const issuedDate = new Date().toISOString();

      // Show Loading
      Swal.fire({
        title: 'Generating Demo...',
        text: 'Preparing your high-fidelity certificate preview...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        // 1. Populate Template
        document.getElementById('certStudentName').textContent = user.name || "Demo Candidate";
        document.getElementById('certExamName').textContent = examName;
        document.getElementById('certLevel').textContent = "(Associate Level)";
        document.getElementById('certSeriesID').textContent = seriesID;
        document.getElementById('certIssuedDate').textContent = issuedDate;
        document.getElementById('certUniqueID').textContent = uniqueID;
        document.getElementById('certCandidateNameDisplay').textContent = user.name || "Demo Candidate";

        // 2. Clear and Generate QR Code
        const qrContent = document.getElementById('certQRCode');
        qrContent.innerHTML = '';
        const qrData = encodeURIComponent(`https://dcinfotech.org.in/verify?id=${uniqueID}`);
        const qrImg = new Image();
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
        qrImg.style.width = '100%';
        qrImg.style.height = '100%';
        qrContent.appendChild(qrImg);

        // 3. Wait for ALL images (logo + QR) to be ready
        const template = document.getElementById('certificateTemplate');
        const images = Array.from(template.getElementsByTagName('img'));

        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
          });
        }));

        // Additional small buffer for rendering
        await new Promise(r => setTimeout(r, 800));

        // 4. Capture with optimal settings
        const canvas = await html2canvas(template, {
          scale: 2, // Higher scale for sharpness
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png', 1.0);

        // 5. Show in Swal
        Swal.fire({
          title: 'Certificate Preview (V9)',
          html: `<div style="overflow:auto; max-height:70vh;"><img src="${imgData}" style="width: 100%; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"></div>`,
          width: '950px',
          confirmButtonText: 'Perfect!',
          showCancelButton: true,
          cancelButtonText: 'Download PNG',
          buttonsStyling: true,
          customClass: {
            confirmButton: 'swal2-confirm-google',
            cancelButton: 'swal2-cancel-google'
          }
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            const link = document.createElement('a');
            link.download = `DC_Certificate_${(user.name || 'Demo').replace(/\s+/g, '_')}.png`;
            link.href = imgData;
            link.click();
          }
        });

      } catch (e) {
        console.error("Demo generation failed:", e);
        Swal.fire('Preview Error', 'We encountered an issue generating the high-fidelity preview. Please try again.', 'error');
      }
    };

  })();

  function applyToDom(obj) {
    const displayName = obj?.displayName || '';
    const username = obj?.username || '';
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.textContent = `Welcome back, ${displayName}!`;
    const userNameSmall = document.getElementById('user-name');
    if (userNameSmall) userNameSmall.textContent = displayName;
    const topName = document.getElementById('userName');
    const topId = document.getElementById('userId');
    if (topName) topName.textContent = (displayName || 'GUEST').toUpperCase();
    if (topId) topId.textContent = username ? String(username).split('@')[0].toUpperCase() + ' ▾' : '';
  }

  function wireTopbarDropdown() {
    const userMeta = document.getElementById('userMeta');
    const userDropdown = document.getElementById('userDropdown');
    if (!userMeta || !userDropdown) return;

    function closeDrop() {
      if (!userDropdown.classList.contains('open')) return;
      userDropdown.classList.remove('open');
      userDropdown.setAttribute('aria-hidden', 'true');
      userMeta.setAttribute('aria-expanded', 'false');
    }

    // toggle on click (stopPropagation to avoid global document click)
    userMeta.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = userDropdown.classList.toggle('open'); // Toggle returns true if class is now present
      userDropdown.setAttribute('aria-hidden', String(!open));
      userMeta.setAttribute('aria-expanded', String(open));
    });

    // keyboard accessible (Enter / Space)
    userMeta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        userMeta.click();
      }
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMeta.contains(e.target) && !userDropdown.contains(e.target)) {
        closeDrop();
      }
    });

    // close on Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrop(); });
  }

  function wireTopbar() {
    wireTopbarDropdown();
  }

  function wireSidebar() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const appShell = document.getElementById('appShell');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (!sidebar || !hamburger || !appShell || !mobileOverlay) {
      console.error("Sidebar elements not found.");
      return;
    }

    function isMobileView() {
      return window.innerWidth <= 1200;
    }

    function openSidebarMobile() {
      appShell.classList.add('sidebar-open');
      sidebar.classList.add('open'); // This class makes the sidebar visible
      mobileOverlay.classList.add('show');
      sidebar.setAttribute('aria-hidden', 'false');
    }

    function closeSidebarMobile() {
      appShell.classList.remove('sidebar-open');
      sidebar.classList.remove('open'); // This class hides the sidebar
      mobileOverlay.classList.remove('show');
      sidebar.setAttribute('aria-hidden', 'true');
    }

    hamburger.addEventListener('click', () => {
      if (isMobileView()) {
        // Check the correct element for the 'open' class
        if (sidebar.classList.contains('open')) {
          closeSidebarMobile();
        } else {
          openSidebarMobile();
        }
      } else {
        // --- DESKTOP BEHAVIOR ---
        appShell.classList.toggle('sidebar-collapsed');
        sidebar.classList.toggle('collapsed');
      }
    });

    mobileOverlay.addEventListener('click', closeSidebarMobile);

    // This resize handler is now smarter. It only closes the mobile overlay
    // if the screen becomes larger than the mobile view, preventing the layout bug.
    window.addEventListener('resize', () => {
      if (!isMobileView() && sidebar.classList.contains('open')) {
        closeSidebarMobile();
      }
    });
  }

  function wireCookieNotice() {
    const cookieNotice = document.getElementById('cookieNotice');
    const cookieOk = document.getElementById('cookieOk');

    if (!cookieNotice || !cookieOk) {
      return;
    }

    function updateNotice() {
      const accepted = localStorage.getItem('cookieAccepted') === '1';
      cookieNotice.style.display = accepted ? 'none' : 'flex';
    }

    cookieOk.addEventListener('click', () => {
      try {
        localStorage.setItem('cookieAccepted', '1');
        updateNotice();
      } catch (e) {
        console.error("Could not save cookie preference:", e);
      }
    });
    updateNotice(); // Call once on init to set the initial state
  }

  function wireSignOut(doLogout) {
    const signOut = document.getElementById('signOut');
    if (signOut) {
      signOut.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) doLogout();
      });
    }
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) doLogout();
      });
    }
  }

  function doLogout(redirect = 'https://dcinfotech.org.in/exam-portal/') {
    try {
      localStorage.removeItem('cm_user');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('AUTH_TOKEN');
    } catch (e) { }
    window.location.href = redirect;
  }

  async function init() {
    let countdownInterval; // To hold the timer

    // ensure we have user info
    let stored = window.DASHBOARD_USER?.raw || getStoredUser();
    if (!stored) {
      // no user -> redirect to login
      console.warn('No authenticated user found — redirecting to login');
      window.location.href = 'https://dcinfotech.org.in/exam-portal/';
      return;
    }

    // merge with USERS list if any
    let profile = null;
    if (Array.isArray(window.USERS) && stored.email) {
      profile = window.USERS.find(u => u.email && u.email.toLowerCase() === String(stored.email).toLowerCase()) || null;
    }
    const merged = Object.assign({}, stored, profile || {});
    const normalized = normalizeDisplay(merged);
    const DASHBOARD_USER = { displayName: normalized.displayName, username: normalized.username, email: normalized.email, raw: merged };
    // Set user object on window and in localStorage
    if (Object.keys(DASHBOARD_USER.raw).length > 0) {
      window.DASHBOARD_USER = DASHBOARD_USER;
      try { localStorage.setItem('currentUser', JSON.stringify(DASHBOARD_USER)); } catch (e) { }
    }

    // update UI and wire interactions
    applyToDom(DASHBOARD_USER);

    // --- New code to handle dynamic content loading ---
    const mainContent = document.querySelector('.content');
    const pageTitle = document.getElementById('pageTitle');
    const pageLoader = document.getElementById('pageLoader'); // Get the loader element
    const initialContent = mainContent.innerHTML; // Store initial dashboard content

    // --- New Routing Logic ---
    // On initial page load, check for a 'page' parameter and load content if it exists.
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
      // Find the link element to get the title
      const link = document.querySelector(`[data-link="${page}"]`);
      const title = link ? link.textContent.trim() : 'Page';
      loadContent(page, title);
    } else {
      // Ensure the initial state is clean
      history.replaceState({ path: 'dashboard.html', title: 'Home' }, 'Home', 'dashboard.html');
    }

    // --- New code to render upcoming exams on the dashboard ---
    async function renderUpcomingExamsOnDashboard(forceRefresh = false) {
      const container = document.getElementById('dashboard-upcoming-exams');
      if (!container) return;

      const user = window.DASHBOARD_USER;
      if (!user || !user.email) {
        container.innerHTML = `<div class="activity__none">Please log in to see your exams.</div>`;
        return;
      }

      if (forceRefresh) {
        container.innerHTML = `<div class="activity__none">Refreshing exams...</div>`;
      } else {
        container.innerHTML = `
          <div class="history-grid">
            <div class="history-card skeleton skeleton-card"></div>
            <div class="history-card skeleton skeleton-card"></div>
            <div class="history-card skeleton skeleton-card"></div>
          </div>
        `;
      }

      let userExams = [];
      try {
        const SHEETDB_API_URL = 'https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_schedules'; // New Schedule API
        const cacheKey = `cached_exams_${user.email}`;

        if (forceRefresh) {
          localStorage.removeItem(cacheKey);
        }

        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          console.log('Loading exams from cache');
          userExams = JSON.parse(cachedData);
        } else {
          console.log('Fetching exams from Firebase API');
          const response = await fetch(`${SHEETDB_API_URL}.json`);
          if (!response.ok) throw new Error('Failed to fetch exams');
          const allData = await response.json();
          const examsArray = allData ? Object.values(allData) : [];
          userExams = examsArray.filter(exam => exam.userEmail === user.email);
          localStorage.setItem(cacheKey, JSON.stringify(userExams));
        }
      } catch (error) {
        console.error("Dashboard Error: Could not fetch exams.", error);
        container.innerHTML = `<div class="activity__none" style="color: red;">Could not load your exams.</div>`;
        return;
      }

      if (userExams.length === 0) {
        container.innerHTML = `<div class="activity__none">You have no exams scheduled. <a href="#" data-link="exam-schedule.html" class="dynamic-link">Schedule one now</a>.</div>`;
        return;
      }

      // Sort exams by date, soonest first
      userExams.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

      container.innerHTML = ''; // Clear previous content
      const grid = document.createElement('div');
      grid.className = 'history-grid'; // Using a class from exam_history for consistency

      userExams.forEach((exam, index) => {
        const card = document.createElement('div');
        card.className = 'history-card animate-fade-up'; // Using a class from exam_history for consistency
        // Add stagger delay based on index
        const delay = (index % 5 + 1) * 100;
        card.style.animationDelay = `${delay}ms`;

        const examDate = new Date(exam.dateTime);
        const formattedDate = examDate.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        });

        // --- Check for saved state (Remote Session) ---
        const sessionId = `${user.email.replace(/[.@]/g, '_')}_${exam.name.replace(/\s+/g, '_')}`;
        const SYNC_BASE_URL = 'https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_sessions';

        async function getExamAction() {
            if (isCompleted) {
                return `
                    <button class="btn" disabled style="background-color: #9aa0a6; color: white; border: none; font-weight: 700; cursor: not-allowed; margin-bottom: 8px; display: block; width: 100%;">Exam Ended</button>
                `;
            }

            try {
                const response = await fetch(`${SYNC_BASE_URL}/${sessionId}.json`);
                const sessionData = await response.json();

                if (sessionData && sessionData.status === 'in-progress') {
                    return `
                        <a href="exam-session.html?exam=${encodeURIComponent(exam.name)}&resume=true" class="btn" style="background-color: #ea4335; color: white; border: none; font-weight: 700; text-align: center; text-decoration: none; margin-bottom: 8px; display: block;">Resume Exam</a>
                    `;
                }
            } catch (e) {
                console.warn("[Dashboard] Could not check remote session state:", e);
            }

            if (now < windowStart) {
                // Too early
                return `<button class="btn" disabled style="background-color: #9aa0a6; color: white; border: none; font-weight: 700; cursor: not-allowed; margin-bottom: 8px; display: block; width: 100%;">Starts Soon</button>`;
            } else if (now > windowEnd) {
                // Too late / Expired
                return `<button class="btn" disabled style="background-color: #9aa0a6; color: white; border: none; font-weight: 700; cursor: not-allowed; margin-bottom: 8px; display: block; width: 100%;">Late / Expired</button>`;
            } else {
                return `<a href="exam-session.html?exam=${encodeURIComponent(exam.name)}" class="btn" style="background-color: #34a853; color: white; border: none; font-weight: 700; text-align: center; text-decoration: none; margin-bottom: 8px; display: block;">Start Exam</a>`;
            }
        }

        // We use a placeholder and then update it once the async check finishes
        const actionPlaceholderId = `action-btns-${sessionId.replace(/[^a-zA-Z0-9]/g, '-')}`;
        getExamAction().then(html => {
          const el = document.getElementById(actionPlaceholderId);
          if (el) el.innerHTML = html;
        });

        card.innerHTML = `
          <div>
            <h4 style="margin-bottom: 0.5rem;">${exam.name}</h4>
            <p style="font-size: 0.9rem; color: #495057; margin-bottom: 1rem;">Scheduled for: ${formattedDate}</p>
            <div class="countdown-timer" data-exam-time="${exam.dateTime}" style="font-weight: 700; font-size: 1.1rem; color: #1a73e8;">
              Loading countdown...
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div id="${actionPlaceholderId}">
                <button class="btn" disabled style="background-color: #e9ecef;">Checking...</button>
            </div>
            <button class="btn details-btn" data-exam-id="${exam.id}" style="background-color: #fbbc05; color: #202124; border: none; font-weight: 700;">View Details</button>
            <a href="#" data-link="exam-schedule.html" class="btn dynamic-link" style="background-color: #1a73e8; color: white;">Manage</a>
          </div>
        `;
        grid.appendChild(card);
      });

      container.appendChild(grid);
      startCountdownTimers(); // Start the countdowns after rendering

      // --- New: Add event listener for "View Details" buttons ---
      container.addEventListener('click', function (event) {
        const target = event.target.closest('.details-btn');
        if (!target) return;

        const examId = target.dataset.examId;
        const exam = userExams.find(e => e.id == examId);

        if (exam && typeof Swal !== 'undefined') {
          const scheduledAtDate = exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleString() : 'N/A';
          Swal.fire({
            title: `<strong>Details for ${exam.name}</strong>`,
            icon: 'info',
            html: `
              <div style="text-align: left; padding: 0 1rem;">
                <p><strong>Scheduled Date:</strong><br>${new Date(exam.dateTime).toLocaleString()}</p>
                <p><strong>Attendee Email:</strong><br>${exam.gmail}</p>
                <p><strong>Voucher Code Used:</strong><br><code>${exam.voucherCode}</code></p>
                <p><strong>Status:</strong><br>${exam.status}</p>
                <p><strong>Scheduled On:</strong><br>${scheduledAtDate}</p>
              </div>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: 'Great!',
            confirmButtonAriaLabel: 'Close',
          });
        } else {
          console.error('Exam details not found or Swal is not defined.');
        }
      });
    }

    // Wire up the refresh button
    const refreshBtn = document.getElementById('refresh-exams-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('svg');
        if (icon) icon.classList.add('spin-anim'); // Add spin class if you have one, or just manual rotation

        // Manually animate for a bit
        let rotation = 0;
        const interval = setInterval(() => {
          rotation += 10;
          if (icon) icon.style.transform = `rotate(${rotation}deg)`;
        }, 20);

        renderUpcomingExamsOnDashboard(true).then(() => {
          clearInterval(interval);
          if (icon) icon.style.transform = 'none';
        });
      });
    }

    // --- New code for countdown timers ---
    function startCountdownTimers() {
      // Clear any existing interval to prevent duplicates
      if (countdownInterval) clearInterval(countdownInterval);

      const countdownElements = document.querySelectorAll('.countdown-timer');
      if (countdownElements.length === 0) return;

      function updateTimers() {
        countdownElements.forEach(el => {
          const examTime = new Date(el.getAttribute('data-exam-time')).getTime();
          const now = new Date().getTime();
          const distance = examTime - now;

          // --- New: Change color if less than an hour remains ---
          if (distance > 0 && distance < 3600 * 1000) {
            el.style.color = '#ea4335'; // Red color for urgency
          } else {
            el.style.color = '#1a73e8'; // Revert to default blue
          }

          // Check for expiration in countdown as well
          const fifteenMinsMs = 15 * 60 * 1000;
          if (now > (examTime + fifteenMinsMs)) {
            el.innerHTML = `<span style="color: #5f6368;">Late / Expired</span>`;
            return;
          }

          if (distance < 0) {
            // Exam has started but is within the 15 min window
            el.innerHTML = `<span style="color: #34a853;">Exam Active!</span>`;
            return;
          }

          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          let countdownText = '';
          if (days > 0) countdownText += `${days}d `;
          if (hours > 0 || days > 0) countdownText += `${hours}h `;
          if (minutes > 0 || hours > 0 || days > 0) countdownText += `${minutes}m `;
          countdownText += `${seconds}s`;

          el.textContent = `Starts in: ${countdownText}`;
        });
      }

      updateTimers(); // Initial call
      countdownInterval = setInterval(updateTimers, 1000);
    }

    // Listen for storage changes to re-render exams
    window.addEventListener('storage', renderUpcomingExamsOnDashboard);

    function restoreInitialContent() {
      mainContent.innerHTML = initialContent;
      setupAnnouncements(); // Re-initialize slider
    }

    function setActiveLink(path) {
      document.querySelectorAll('.nav-item[data-link]').forEach(nav => {
        nav.classList.remove('active');
      });
      const activeLink = document.querySelector(`.nav-item[data-link="${path}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
    function populateProfileData() {
      const user = window.DASHBOARD_USER;
      if (!user) return;

      const nameField = document.getElementById('profile-name');
      const emailField = document.getElementById('profile-email');
      const batchField = document.getElementById('profile-batch');

      const nameParts = (user.displayName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // These IDs are from profile.html
      const legalFirstNameEl = document.getElementById('legalFirstName');
      const legalLastNameEl = document.getElementById('legalLastName');
      const emailAddrEl = document.getElementById('emailAddr');
      const preferredNameFirstEl = document.getElementById('preferredNameFirst');
      const preferredNameLastEl = document.getElementById('preferredNameLast');
      const dobField = document.getElementById('dateOfBirth');

      if (legalFirstNameEl) legalFirstNameEl.value = firstName;
      if (legalLastNameEl) legalLastNameEl.value = lastName;

      // Load editable fields from localStorage, with fallbacks to the main user object
      if (emailAddrEl) emailAddrEl.value = localStorage.getItem(`email_${user.email}`) || user.email || '';
      if (preferredNameFirstEl) preferredNameFirstEl.value = localStorage.getItem(`preferredFirstName_${user.email}`) || firstName;
      if (preferredNameLastEl) preferredNameLastEl.value = localStorage.getItem(`preferredLastName_${user.email}`) || lastName;
      if (dobField) dobField.value = localStorage.getItem(`dob_${user.email}`) || '';
      if (batchField && user.raw) batchField.value = user.raw.batch || 'N/A';
    }

    async function loadContent(path, title, isPopState = false) {
      if (!mainContent) return;

      // Clear the countdown interval when navigating away from the dashboard
      if (countdownInterval) clearInterval(countdownInterval);

      if (path === 'dashboard.html') {
        restoreInitialContent();
        if (pageTitle) pageTitle.textContent = 'Home';
        setActiveLink(path);
        if (!isPopState) {
          const newUrl = 'dashboard.html';
          history.pushState({ path: path, title: 'Home' }, 'Home', newUrl);
        }
        return;
      }

      console.log('loadContent called for:', path, 'with title:', title);
      if (pageLoader) pageLoader.style.display = 'flex'; // Show loader

      try {
        const response = await fetch(path);
        if (!response.ok) {
          mainContent.innerHTML = `<p style="text-align:center; color:red;">Sorry, the page '${path}' could not be found.</p>`;
          if (pageTitle) pageTitle.textContent = 'Error';
          throw new Error(`Failed to load ${path}`);
        }
        const html = await response.text();

        // --- New Parsing Logic ---
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 1. Inject Styles
        const styles = doc.querySelectorAll('style');
        styles.forEach(style => {
          const newStyle = document.createElement('style');
          newStyle.textContent = style.textContent;
          document.head.appendChild(newStyle);
        });

        // 2. Inject Body Content
        // We use the body content if available, otherwise the whole html
        const content = doc.body ? doc.body.innerHTML : html;
        mainContent.innerHTML = content;

        if (pageTitle && title) {
          pageTitle.textContent = title;
        }
        setActiveLink(path);

        // Update URL with a query parameter instead of changing the path
        if (!isPopState) {
          const newUrl = `dashboard.html?page=${path}`;
          history.pushState({ path: path, title: title }, title, newUrl);
        }

        console.log('Content loaded, checking path:', path);
        if (path === 'profile.html') {
          populateProfileData();
        }

        // 3. Execute Scripts
        // We need to re-create script tags for them to execute
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(oldScript => {
          // Check if it's an external script or inline
          const newScript = document.createElement('script');
          if (oldScript.src) {
            // Skip libraries that are already loaded in dashboard.html to avoid conflicts/race conditions
            if (oldScript.src.includes('email') ||
              oldScript.src.includes('notiflix') ||
              oldScript.src.includes('sweetalert2')) {
              console.log('Skipping duplicate library load:', oldScript.src);
              return;
            }
            newScript.src = oldScript.src;
            newScript.async = false; // Execute in order
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript);
          // Optional: Remove after execution to keep DOM clean? 
          // Keeping them might be safer for some libraries.
        });

        console.log('Scripts re-executed for:', path);
      } catch (error) {
        console.error('Error loading content:', error);
        mainContent.innerHTML = `<p style="text-align:center; color:red;">Sorry, could not load the page. Contact Admin @ support@dcinfotech.org.in to report this issue </p>`;
      } finally {
        if (pageLoader) pageLoader.style.display = 'none'; // Hide loader
      }
    }
    // --- End of new code ---

    // Handle browser back/forward button clicks
    window.addEventListener('popstate', function (event) {
      console.log('popstate event fired. State:', event.state);
      if (event.state && event.state.path) {
        // A specific page state exists, load it
        loadContent(event.state.path, event.state.title, true);
      } else {
        // This handles going back to the initial dashboard state (no query parameter)
        // We can simply reload or restore initial content. Reload is simpler.
        window.location.href = 'dashboard.html';
      }
    });


    console.log('Adding click listener to body');

    // expose setter for login flow
    wireTopbarDropdown();
    wireSignOut(doLogout);
    wireSidebar();
    wireCookieNotice();
    setupAnnouncements();
    renderUpcomingExamsOnDashboard(); // Render exams on initial load
    window.__setDashboardUser = function (userObj) {
      if (!userObj) return;
      const n = normalizeDisplay(userObj);
      const obj = { displayName: n.displayName, username: n.username, email: n.email, raw: userObj };
      try {
        window.DASHBOARD_USER = obj;
        localStorage.setItem('cm_user', JSON.stringify(userObj));
        localStorage.setItem('currentUser', JSON.stringify(obj));
      } catch (e) { }
      applyToDom(obj);
    };

    // Add event listener for all dynamic links
    document.body.addEventListener('click', function (event) {
      const link = event.target.closest('a.dynamic-link, .nav-item[data-link], .tile[data-link]');
      console.log('Click event detected. Closest link:', link);

      // Only proceed if a valid link was clicked. This prevents this listener
      // from interfering with other click events, like the user dropdown menu.
      if (link) {
        event.preventDefault();
        const path = link.getAttribute('data-link');
        // Correctly get the title from either a tile or a nav item
        const title = (link.querySelector('.tile-title') || link).textContent.trim();
        if (path) loadContent(path, title);
      }

      // Handle profile form submission for saving Date of Birth
      const form = event.target.closest('.cp-form');
      const submitButton = event.target.closest('button[type="submit"]');

      if (form && mainContent.contains(form) && submitButton) {
        event.preventDefault();

        const user = window.DASHBOARD_USER;
        if (!user || !user.email) return;

        // Get all editable fields
        const dobField = form.querySelector('#dateOfBirth');
        const emailField = form.querySelector('#emailAddr');
        const preferredFirstNameField = form.querySelector('#preferredNameFirst');
        const preferredLastNameField = form.querySelector('#preferredNameLast');

        // --- Validation ---
        const selectedDate = new Date(dobField.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only

        if (dobField.value && selectedDate > today) {
          alert("You cannot select a future date for your birthday.");
          return;
        }

        // --- Save Data to localStorage ---
        if (dobField.value) {
          localStorage.setItem(`dob_${user.email}`, dobField.value);
        }
        if (emailField.value) localStorage.setItem(`email_${user.email}`, emailField.value);
        if (preferredFirstNameField.value) localStorage.setItem(`preferredFirstName_${user.email}`, preferredFirstNameField.value);
        if (preferredLastNameField.value) localStorage.setItem(`preferredLastName_${user.email}`, preferredLastNameField.value);

        // --- Provide UI Feedback ---
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        // Since saving to localStorage is very fast, we use a short timeout to show "Saving..."
        // then show "Saved!" for confirmation before reverting the button.
        setTimeout(() => {
          submitButton.textContent = 'Saved!';
          setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
          }, 2000); // Keep "Saved!" for 2 seconds
        }, 500); // Show "Saving..." for 0.5 seconds
      }
    });
  }

  function setupAnnouncements() {
    const grid = document.getElementById('announcements-grid');
    const nextBtn = document.getElementById('announcement-next');
    const prevBtn = document.getElementById('announcement-prev');
    const container = document.querySelector('.news-articles-slider'); // Get container for hover events

    if (!grid || !nextBtn || !prevBtn) {
      console.log("Announcement slider elements not found.");
      return;
    }

    let currentIndex = 0;
    let itemsPerPage = 3;
    let totalItems = 0;
    let autoSlideInterval;

    function updateItemsPerPage() {
      if (window.innerWidth <= 768) { // Mobile
        itemsPerPage = 1;
      } else if (window.innerWidth <= 1200) { // Tablet
        itemsPerPage = 2;
      } else { // Desktop
        itemsPerPage = 3;
      }
    }

    function updateSlider() {
      const offset = -currentIndex * (100 / itemsPerPage); // Calculate the offset
      grid.style.transform = `translateX(${offset}%)`;

      // Update button states (optional for auto-slide, but good for manual interaction)
      prevBtn.disabled = currentIndex === 0;
      // We don't disable next button in auto-slide mode usually, but if we want to keep manual logic consistent:
      nextBtn.disabled = false; // Always enable next for looping or just keep it simple
      if (currentIndex >= totalItems - itemsPerPage) {
        // If at end, maybe disable next? But for auto-slide loop, we want it to go back.
        // Let's keep the visual indication but allow the logic to handle the loop.
        nextBtn.disabled = true;
      }
    }

    function nextSlide() {
      if (currentIndex < totalItems - itemsPerPage) {
        currentIndex++;
      } else {
        currentIndex = 0; // Loop back to start
      }
      updateSlider();
    }

    function startAutoSlide() {
      stopAutoSlide(); // Clear existing to be safe
      autoSlideInterval = setInterval(nextSlide, 5000); // 5 seconds
    }

    function stopAutoSlide() {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    }

    fetch('js/announcements.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        totalItems = data.length;
        grid.innerHTML = data.map(item => `
          <div class="news-articles__item">
            <article class="news-article-card">
              <img alt="${item.title}" class="news-image" src="${item.image || 'https://dcinfotech.org.in/images/dc-logo.gif'}">
              <div class="news-article-card__main">
                <div class="news-article-card__preheader">${item.date}</div>
                <h3 class="news-article-card__title">${item.title}</h3>
                <div class="news-article-card__subtitle">${item.subtitle}</div>
              </div>
              <div class="news-article-card__footer">
                <a href="#" class="news-article-card__cta">View more →</a>
              </div>
            </article>
          </div>
        `).join('');

        updateItemsPerPage();
        updateSlider();
        startAutoSlide(); // Start auto-sliding
      })
      .catch(error => {
        console.error('Error fetching or rendering announcements:', error);
        grid.innerHTML = '<p>Could not load announcements.</p>';
      });

    nextBtn.addEventListener('click', () => {
      stopAutoSlide(); // Pause on interaction
      if (currentIndex < totalItems - itemsPerPage) {
        currentIndex++;
        updateSlider();
      }
      startAutoSlide(); // Restart
    });

    prevBtn.addEventListener('click', () => {
      stopAutoSlide(); // Pause on interaction
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
      startAutoSlide(); // Restart
    });

    // Pause on hover
    if (container) {
      container.addEventListener('mouseenter', stopAutoSlide);
      container.addEventListener('mouseleave', startAutoSlide);
    } else {
      // Fallback to grid if container not found (though container is better)
      grid.addEventListener('mouseenter', stopAutoSlide);
      grid.addEventListener('mouseleave', startAutoSlide);
    }

    window.addEventListener('resize', () => {
      updateItemsPerPage();
      // Adjust currentIndex if it's out of bounds after resize
      if (currentIndex > totalItems - itemsPerPage) {
        currentIndex = Math.max(0, totalItems - itemsPerPage);
      }
      updateSlider();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();