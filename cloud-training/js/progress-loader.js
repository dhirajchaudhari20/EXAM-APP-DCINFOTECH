/**
 * Dynamic Progress Dashboard Loader
 * Uses ProgressTracker to display real-time data
 */

// Wait for page to load
document.addEventListener('DOMContentLoaded', function () {
    loadProgressData();
});

function loadProgressData() {
    // Make sure progressTracker is available
    if (typeof progressTracker === 'undefined') {
        console.error('Progress Tracker not loaded!');
        return;
    }

    // Get progress data
    const progress = progressTracker.getProgress();
    const overallProgress = progressTracker.calculateOverallProgress();
    const attendanceRate = progressTracker.getAttendanceRate();
    const studyHours = progressTracker.getStudyHours();
    const streak = progressTracker.updateStreak();

    // Update Overall Progress Card
    const progressCircle = document.querySelector('.circular-progress');
    if (progressCircle) {
        progressCircle.style.setProperty('--progress', overallProgress);
        progressCircle.setAttribute('data-progress', overallProgress);
    }

    // Update Sessions Attended
    const sessionsValue = document.querySelector('.progress-card:nth-child(2) .progress-card-value');
    if (sessionsValue) {
        sessionsValue.innerHTML = `${progress.sessionsAttended} <span style="font-size: 1.2rem; color: var(--text-medium);">/ ${progress.totalSessions}</span>`;
    }
    const attendanceSubtitle = document.querySelector('.progress-card:nth-child(2) .progress-card-subtitle');
    if (attendanceSubtitle) {
        attendanceSubtitle.textContent = `${attendanceRate}% attendance rate`;
    }

    // Update DC Points
    const pointsValue = document.querySelector('.progress-card:nth-child(3) .progress-card-value');
    if (pointsValue) {
        pointsValue.textContent = progress.dcPoints.toLocaleString();
    }

    // Get rank asynchronously
    progressTracker.getRank().then(rank => {
        const rankSubtitle = document.querySelector('.progress-card:nth-child(3) .progress-card-subtitle');
        if (rankSubtitle) {
            rankSubtitle.textContent = `Rank #${rank} in batch`;
        }
    });

    // Update Study Time
    const studyTimeValue = document.querySelector('.progress-card:nth-child(4) .progress-card-value');
    if (studyTimeValue) {
        studyTimeValue.innerHTML = `${studyHours}<span style="font-size: 1.2rem; color: var(--text-medium);">h</span>`;
    }

    // Update Streak
    const streakNumber = document.querySelector('.streak-number');
    if (streakNumber) {
        streakNumber.textContent = `🔥 ${streak}`;
    }

    // Update Module Progress
    updateModuleProgress(progress.modules);

    // Update Weekly Activity Chart
    updateActivityChart(progress.weeklyActivity);

    // Update Badges
    updateBadges(progress.badges);
}

function updateModuleProgress(modules) {
    const moduleMap = {
        'cloud-fundamentals': 0,
        'networking-security': 1,
        'storage-databases': 2,
        'compute-services': 3
    };

    Object.keys(modules).forEach(moduleId => {
        const module = modules[moduleId];
        const index = moduleMap[moduleId];
        const moduleItem = document.querySelectorAll('.module-item')[index];

        if (moduleItem) {
            const stats = moduleItem.querySelector('.module-stats');
            const progressBar = moduleItem.querySelector('.module-progress-bar');

            if (stats) {
                const remaining = module.total - module.completed;
                const remainingTime = remaining * 1.5; // Assume 1.5hrs per lesson

                if (module.completed === module.total) {
                    stats.textContent = `${module.total}/${module.total} lessons completed`;
                } else {
                    stats.textContent = `${module.completed}/${module.total} lessons completed • ${remainingTime}hrs remaining`;
                }
            }

            if (progressBar) {
                const percentage = (module.completed / module.total) * 100;
                progressBar.style.width = `${percentage}%`;
            }
        }
    });
}

function updateActivityChart(weeklyActivity) {
    // Get canvas element
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;

    // Prepare data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const studyHours = days.map(day => weeklyActivity[day].study || 0);
    const attendance = days.map(day => weeklyActivity[day].attended || 0);

    // Create new chart (Chart.js should already be loaded)
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Study Hours',
                    data: studyHours,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Attendance',
                    data: attendance,
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        max: 1,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
}

function updateBadges(earnedBadges) {
    const badgeElements = document.querySelectorAll('.badge-item');

    const badgeMap = {
        '7-day-streak': 0,
        'top-20': 1,
        'first-module': 2,
        'perfect-score': 3,
        'top-10': 4,
        'speed-runner': 5  // Custom badge
    };

    // Unlock earned badges
    earnedBadges.forEach(badgeId => {
        const index = badgeMap[badgeId];
        if (index !== undefined && badgeElements[index]) {
            badgeElements[index].classList.remove('locked');
        }
    });
}

// Refresh progress every 30 seconds
setInterval(loadProgressData, 30000);
