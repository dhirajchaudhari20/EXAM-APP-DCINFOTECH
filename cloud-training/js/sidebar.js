// Global function for Coming Soon - Define EARLY
window.showComingSoon = function (e) {
    e.preventDefault();
    if (typeof Notiflix !== 'undefined') {
        Notiflix.Notify.info('Coming Soon! 🚧');
    } else {
        alert('Coming Soon! 🚧');
    }
};

// Global function for Logout - Define EARLY
// Global function for Logout - Define EARLY
window.confirmLogout = function () {
    console.log('[LOGOUT] confirmLogout called');

    // 1. Try Notiflix (Primary)
    if (typeof Notiflix !== 'undefined') {
        Notiflix.Confirm.show(
            'Logout',
            'Are you sure you want to logout?',
            'Yes, Logout',
            'Cancel',
            function () { // Ok Callback
                console.log('[LOGOUT] User confirmed logout via Notiflix');
                performLogout();
            },
            function () { // Cancel Callback
                console.log('[LOGOUT] User cancelled logout');
            },
            {
                // Optional: Custom functionality if needed
                titleColor: '#d33',
                okButtonBackground: '#d33',
                okButtonColor: '#fff',
            }
        );
        return;
    }

    // 2. Native Confirm (Fallback)
    console.warn('[LOGOUT] Notiflix not defined! Using native confirm.');
    if (confirm('Are you sure you want to logout?')) {
        console.log('[LOGOUT] User confirmed logout via native confirm');
        performLogout();
    } else {
        console.log('[LOGOUT] User cancelled logout');
    }
};

// Separate function to perform the actual logout
function performLogout() {
    console.log('[LOGOUT] Performing logout...');

    try {
        // 1. Clear all session data
        localStorage.removeItem('cloudUser');
        localStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('loggedInUser');

        console.log('[LOGOUT] Removed specific items from storage');

        // 2. Double check clearing
        localStorage.clear();
        sessionStorage.clear();

        console.log('[LOGOUT] Cleared all storage');

        // 3. Show notification if Notiflix is available
        if (typeof Notiflix !== 'undefined') {
            Notiflix.Notify.info('Logging out...');
        }

        // 4. Redirect to Learn Portal
        console.log('[LOGOUT] Redirecting to learn.dcinfotech.org.in');
        window.location.href = 'https://learn.dcinfotech.org.in';
    } catch (error) {
        console.error('[LOGOUT] Error during logout:', error);
        // Force redirect even if there's an error
        window.location.href = 'https://learn.dcinfotech.org.in';
    }
}

// Sidebar initialization function
function initSidebar() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (!dashboardContainer) return;

    // 1. Define Sidebar HTML
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-area">
                    <img src="https://dcinfotech.org.in/images/dcintro.gif" alt="DC Cloud Solutions" class="brand-logo">
                    <div class="brand-text">
                        <span class="brand-name">Cloud Training</span>
                        <span class="brand-subtitle">Live Training Portal</span>
                    </div>
                </div>
            </div>

            <nav class="sidebar-nav">
                <a href="index.html" class="nav-item" data-page="index.html">
                    <i class="fas fa-th-large"></i>
                    <span>Dashboard</span>
                </a>
                <a href="my-learning.html" class="nav-item" data-page="my-learning.html">
                    <i class="fas fa-book-open"></i>
                    <span>My Learning</span>
                </a>
                <a href="schedule.html" class="nav-item" data-page="schedule.html">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Schedule</span>
                </a>
                <a href="progress.html" class="nav-item" data-page="progress.html">
                    <i class="fas fa-chart-line"></i>
                    <span>My Progress</span>
                </a>
                <a href="quiz.html" class="nav-item" data-page="quiz.html">
                    <i class="fas fa-clipboard-question"></i>
                    <span>Practice Quiz</span>
                </a>
                <a href="planner.html" class="nav-item" data-page="planner.html">
                    <i class="fas fa-calendar-check"></i>
                    <span>Study Planner</span>
                </a>
                <a href="interview.html" class="nav-item" data-page="interview.html">
                    <i class="fas fa-robot"></i>
                    <span>AI Interviewer</span>
                </a>

                <div class="nav-divider"></div>
                
                <a href="resources.html" class="nav-item" data-page="resources.html">
                    <i class="fas fa-book-open-reader"></i>
                    <span>Resources</span>
                </a>
                <a href="forum.html" class="nav-item" data-page="forum.html">
                    <i class="fas fa-comments"></i>
                    <span>Discussion Forum</span>
                </a>

                <div class="nav-divider"></div>

                <a href="https://dcinfotech.org.in/exam-portal" target="_blank" class="nav-item">
                    <i class="fas fa-laptop-code"></i>
                    <span>Exam Portal</span>
                </a>
                <a href="feedback.html" class="nav-item" data-page="feedback.html">
                    <i class="fas fa-comment-alt"></i>
                    <span>Feedback</span>
                </a>
                <a href="support.html" class="nav-item" data-page="support.html">
                    <i class="fas fa-headset"></i>
                    <span>Support</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="user-mini-profile">
                    <div class="profile-photo-container" id="dashboardPhotoContainer">
                         <!-- Added ID for index.html compatibility, though input might need re-binding -->
                        <label for="dashboardProfilePhotoInput" style="cursor: pointer">
                            <img id="dashboardProfilePhoto" src="https://ui-avatars.com/api/?name=User" alt="Profile" />
                            <input type="file" id="dashboardProfilePhotoInput" accept="image/*" style="display: none" />
                        </label>
                    </div>
                    <div class="user-info">
                        <span id="userName" class="user-name">User</span>
                        <span class="user-role">Intern</span>
                    </div>
                    <button id="logoutBtnSide" class="logout-icon-btn" title="Logout">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </aside>
    `;

    // 2. Inject Sidebar
    // Check if sidebar already exists (to avoid duplicates if hardcoded)
    if (!dashboardContainer.querySelector('.sidebar')) {
        dashboardContainer.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    // 2.1 Attach Logout Listener (Robustness Fix)
    const logoutBtn = document.getElementById('logoutBtnSide');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[LOGOUT] Button clicked via listener');
            if (window.confirmLogout) {
                window.confirmLogout();
            } else {
                console.error('[LOGOUT] window.confirmLogout is missing!');
                // Emergency Fallback
                if (confirm('Logout?')) {
                    window.location.href = 'https://learn.dcinfotech.org.in';
                }
            }
        });
    }

    // 3. Highlight Active Link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 4. Inject Hamburger Menu (Mobile)
    const topbarLeft = document.querySelector('.topbar-left');
    if (topbarLeft && !document.getElementById('sidebarToggle')) {
        // Create wrapper if not exists
        let wrapper = topbarLeft.parentNode.querySelector('.topbar-start');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'topbar-start';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '12px';

            // Move topbarLeft inside wrapper
            topbarLeft.parentNode.insertBefore(wrapper, topbarLeft);
            wrapper.appendChild(topbarLeft);
        }

        // Create Button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'sidebarToggle';
        toggleBtn.className = 'icon-btn sidebar-toggle';
        toggleBtn.style.display = 'none'; // CSS will handle visibility
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';

        wrapper.insertBefore(toggleBtn, wrapper.firstChild);
    }

    // 5. Mobile Sidebar Toggle Logic
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        // Create Overlay
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        function toggleSidebar() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });

        overlay.addEventListener('click', () => {
            toggleSidebar();
        });

        // Close sidebar when clicking a nav item on mobile
        const mobileNavItems = sidebar.querySelectorAll('.nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    toggleSidebar();
                }
            });
        });
    }
}

// Music Player Initialization
function initMusicPlayer() {
    // 1. Inject Player Container
    if (!document.getElementById('music-player')) {
        const playerDiv = document.createElement('div');
        playerDiv.id = 'music-player';
        document.body.appendChild(playerDiv);
    }

    // 2. Inject Controls (Button + Volume)
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight && !document.getElementById('musicBtn')) {
        // Create Container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'music-controls';

        // Create Volume Slider Container
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'volume-slider-container';

        // Create Volume Slider
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '50'; // Default volume
        volumeSlider.className = 'volume-slider';
        volumeSlider.id = 'musicVolume';
        volumeSlider.title = 'Volume';

        // Add listener
        volumeSlider.addEventListener('input', (e) => {
            if (musicPlayer && typeof musicPlayer.setVolume === 'function') {
                musicPlayer.setVolume(e.target.value);
            }
        });

        volumeContainer.appendChild(volumeSlider);

        // Create Button
        const btn = document.createElement('button');
        btn.id = 'musicBtn';
        btn.className = 'icon-btn';
        btn.title = 'Play Music';
        btn.onclick = window.toggleMusic;
        btn.innerHTML = '<i class="fas fa-music"></i>';

        // Assemble
        controlsContainer.appendChild(volumeContainer);
        controlsContainer.appendChild(btn);

        // Insert as first item
        topbarRight.insertBefore(controlsContainer, topbarRight.firstChild);
    }

    // 3. Load YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

// Global Music Functions
let musicPlayer;
window.onYouTubeIframeAPIReady = function () {
    musicPlayer = new YT.Player('music-player', {
        height: '0',
        width: '0',
        videoId: 'ahSMyLJcp48',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
};

function onPlayerReady(event) {
    // Player ready
    if (musicPlayer && typeof musicPlayer.setVolume === 'function') {
        musicPlayer.setVolume(50); // Set initial volume
    }
}

window.toggleMusic = function () {
    const btn = document.getElementById('musicBtn');
    if (!btn) return;
    const icon = btn.querySelector('i');

    if (musicPlayer && typeof musicPlayer.getPlayerState === 'function' && musicPlayer.getPlayerState() === 1) {
        musicPlayer.pauseVideo();
        if (icon) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-music');
        }
        btn.style.color = '';
    } else if (musicPlayer && typeof musicPlayer.playVideo === 'function') {
        musicPlayer.playVideo();
        if (icon) {
            icon.classList.remove('fa-music');
            icon.classList.add('fa-pause');
        }
        btn.style.color = '#4f46e5'; // Primary color
    }
};

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSidebar();
        initMusicPlayer();
    });
} else {
    // DOM is already loaded
    initSidebar();
    initMusicPlayer();
}
