/**
 * Progress Tracker System for Cloud Training Platform
 * Tracks and calculates real-time student progress
 */

class ProgressTracker {
    constructor() {
        this.storageKey = 'cloudTrainingProgress';
        this.userEmail = this.getUserEmail();
        this.initializeProgress();
    }

    // Get current user email
    getUserEmail() {
        const userData = JSON.parse(localStorage.getItem('cloudUser') || '{}');
        return userData.email || 'guest@example.com';
    }

    // Initialize progress data structure
    initializeProgress() {
        const existingData = localStorage.getItem(this.storageKey);
        if (!existingData) {
            const defaultProgress = {
                sessionsAttended: 0,
                totalSessions: 36,
                dcPoints: 0,
                studyMinutes: 0,
                lastVisit: new Date().toISOString(),
                streak: 0,
                modules: {
                    'cloud-fundamentals': { completed: 0, total: 10, timeSpent: 0 },
                    'networking-security': { completed: 0, total: 12, timeSpent: 0 },
                    'storage-databases': { completed: 0, total: 10, timeSpent: 0 },
                    'compute-services': { completed: 0, total: 8, timeSpent: 0 }
                },
                quizScores: [],
                badges: [],
                weeklyActivity: {
                    Mon: { study: 0, attended: 0 },
                    Tue: { study: 0, attended: 0 },
                    Wed: { study: 0, attended: 0 },
                    Thu: { study: 0, attended: 0 },
                    Fri: { study: 0, attended: 0 },
                    Sat: { study: 0, attended: 0 },
                    Sun: { study: 0, attended: 0 }
                }
            };
            localStorage.setItem(this.storageKey, JSON.stringify(defaultProgress));
        }
    }

    // Get all progress data
    getProgress() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    }

    // Save progress data
    saveProgress(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Calculate overall progress percentage
    calculateOverallProgress() {
        const data = this.getProgress();
        const moduleProgress = Object.values(data.modules);
        const totalCompleted = moduleProgress.reduce((sum, m) => sum + m.completed, 0);
        const totalLessons = moduleProgress.reduce((sum, m) => sum + m.total, 0);
        return Math.round((totalCompleted / totalLessons) * 100);
    }

    // Get attendance rate
    getAttendanceRate() {
        const data = this.getProgress();
        if (data.totalSessions === 0) return 0;
        return Math.round((data.sessionsAttended / data.totalSessions) * 100);
    }

    // Get study hours this month
    getStudyHours() {
        const data = this.getProgress();
        return Math.round(data.studyMinutes / 60);
    }

    // Update streak
    updateStreak() {
        const data = this.getProgress();
        const today = new Date().toDateString();
        const lastVisit = new Date(data.lastVisit).toDateString();

        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastVisit === yesterdayStr) {
                // Consecutive day - increment streak
                data.streak++;
                this.checkStreakBadges(data.streak);
            } else if (lastVisit !== today) {
                // Streak broken
                data.streak = 1;
            }

            data.lastVisit = new Date().toISOString();
            this.saveProgress(data);
        }

        return data.streak;
    }

    // Check and award streak badges
    checkStreakBadges(streak) {
        const data = this.getProgress();
        const badges = {
            3: '3-day-streak',
            7: '7-day-streak',
            14: '2-week-streak',
            30: '1-month-streak'
        };

        if (badges[streak] && !data.badges.includes(badges[streak])) {
            data.badges.push(badges[streak]);
            this.awardPoints(50, `${streak}-Day Streak Achieved!`);
            this.saveProgress(data);
            this.showBadgeNotification(badges[streak]);
        }
    }

    // Track session attendance
    trackSessionAttendance(sessionId) {
        const data = this.getProgress();
        data.sessionsAttended++;

        // Award points for attendance
        this.awardPoints(50, 'Session Attendance');

        // Update weekly activity
        const dayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        if (data.weeklyActivity[dayName]) {
            data.weeklyActivity[dayName].attended = 1;
        }

        this.saveProgress(data);
        this.updateStreak();
    }

    // Track study time (call this periodically)
    trackStudyTime(minutes = 1) {
        const data = this.getProgress();
        data.studyMinutes += minutes;

        // Update weekly activity
        const dayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        if (data.weeklyActivity[dayName]) {
            data.weeklyActivity[dayName].study += (minutes / 60);
        }

        this.saveProgress(data);

        // Award badges for milestones
        if (data.studyMinutes === 600) { // 10 hours
            this.awardBadge('10-hour-learner');
        } else if (data.studyMinutes === 3000) { // 50 hours
            this.awardBadge('50-hour-master');
        }
    }

    // Track module completion
    updateModuleProgress(moduleId, lessonsCompleted) {
        const data = this.getProgress();
        if (data.modules[moduleId]) {
            const oldCompleted = data.modules[moduleId].completed;
            data.modules[moduleId].completed = lessonsCompleted;

            // Award points for new completions
            const newCompletions = lessonsCompleted - oldCompleted;
            if (newCompletions > 0) {
                this.awardPoints(newCompletions * 20, 'Lesson Completion');
            }

            // Check if module is fully completed
            if (lessonsCompleted === data.modules[moduleId].total) {
                this.awardPoints(100, 'Module Completed!');
                this.awardBadge(`module-${moduleId}`);
            }

            this.saveProgress(data);
        }
    }

    // Award DC Points
    awardPoints(points, reason = '') {
        const data = this.getProgress();
        data.dcPoints += points;
        this.saveProgress(data);

        // Show notification
        if (typeof Notiflix !== 'undefined') {
            Notiflix.Notify.success(`+${points} DC Points ${reason ? '- ' + reason : ''}`, {
                timeout: 3000,
                position: 'right-bottom'
            });
        }
    }

    // Award badge
    awardBadge(badgeId) {
        const data = this.getProgress();
        if (!data.badges.includes(badgeId)) {
            data.badges.push(badgeId);
            this.saveProgress(data);
            this.showBadgeNotification(badgeId);
        }
    }

    // Show badge notification
    showBadgeNotification(badgeId) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '🏆 New Badge Unlocked!',
                text: this.getBadgeName(badgeId),
                confirmButtonText: 'Awesome!',
                timer: 5000
            });
        }
    }

    // Get badge display name
    getBadgeName(badgeId) {
        const badgeNames = {
            '3-day-streak': '3-Day Streak Master',
            '7-day-streak': '7-Day Streak Champion',
            '14-day-streak': '2-Week Dedication',
            '30-day-streak': '1-Month Consistency King',
            '10-hour-learner': '10-Hour Learning Journey',
            '50-hour-master': '50-Hour Cloud Master',
            'module-cloud-fundamentals': 'Cloud Fundamentals Expert',
            'module-networking-security': 'Security Specialist',
            'module-storage-databases': 'Data Storage Pro',
            'module-compute-services': 'Compute Services Expert',
            'top-10': 'Top 10 Achiever',
            'top-20': 'Top 20 Performer',
            'perfect-score': 'Perfect Quiz Score',
            'first-module': 'First Module Completed'
        };
        return badgeNames[badgeId] || badgeId;
    }

    // Track quiz completion
    trackQuizScore(quizId, score, maxScore) {
        const data = this.getProgress();
        data.quizScores.push({
            id: quizId,
            score: score,
            maxScore: maxScore,
            percentage: Math.round((score / maxScore) * 100),
            date: new Date().toISOString()
        });

        // Award points based on score
        const percentage = (score / maxScore) * 100;
        if (percentage === 100) {
            this.awardPoints(100, 'Perfect Quiz Score!');
            this.awardBadge('perfect-score');
        } else if (percentage >= 80) {
            this.awardPoints(50, 'Great Quiz Score!');
        } else if (percentage >= 60) {
            this.awardPoints(25, 'Quiz Completed');
        }

        this.saveProgress(data);
    }

    // Get rank in leaderboard (this would need backend API)
    async getRank() {
        // In production, this would call your backend API
        // For now, return mock rank based on points
        const data = this.getProgress();
        // Simulate rank calculation
        if (data.dcPoints > 3000) return 1;
        if (data.dcPoints > 2500) return 5;
        if (data.dcPoints > 2000) return 10;
        if (data.dcPoints > 1500) return 15;
        return Math.floor(50 - (data.dcPoints / 100));
    }

    // Get all badges
    getBadges() {
        const data = this.getProgress();
        return data.badges;
    }

    // Check if badge is unlocked
    hasBadge(badgeId) {
        const data = this.getProgress();
        return data.badges.includes(badgeId);
    }
}

// Initialize global instance
const progressTracker = new ProgressTracker();

// Start tracking study time (1 minute intervals)
let studyTimeInterval = null;

function startStudyTimeTracking() {
    if (studyTimeInterval) return; // Already running

    studyTimeInterval = setInterval(() => {
        progressTracker.trackStudyTime(1);
    }, 60000); // Every minute
}

function stopStudyTimeTracking() {
    if (studyTimeInterval) {
        clearInterval(studyTimeInterval);
        studyTimeInterval = null;
    }
}

// Auto-start tracking when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startStudyTimeTracking);
} else {
    startStudyTimeTracking();
}

// Stop tracking when page unloads
window.addEventListener('beforeunload', stopStudyTimeTracking);

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.progressTracker = progressTracker;
}
