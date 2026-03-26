/**
 * Activity Tracker - Real-time Activity Feed System
 * Tracks user activities and stores them in localStorage
 */

class ActivityTracker {
    constructor() {
        this.storageKey = 'userActivities';
        this.maxActivities = 50; // Keep last 50 activities
    }

    /**
     * Add a new activity to the feed
     * @param {string} type - Type of activity (session, quiz, certificate, milestone)
     * @param {string} title - Activity title
     * @param {string} description - Activity description
     * @param {string} icon - FontAwesome icon class
     */
    addActivity(type, title, description, icon = null) {
        const activities = this.getActivities();

        // Auto-assign icon based on type if not provided
        if (!icon) {
            const iconMap = {
                'session': 'fa-video',
                'quiz': 'fa-clipboard-check',
                'certificate': 'fa-certificate',
                'milestone': 'fa-trophy'
            };
            icon = iconMap[type] || 'fa-star';
        }

        const newActivity = {
            id: Date.now(),
            type: type,
            title: title,
            description: description,
            icon: icon,
            timestamp: new Date().toISOString(),
            time: this.getRelativeTime(new Date())
        };

        // Add to beginning of array (most recent first)
        activities.unshift(newActivity);

        // Keep only the most recent activities
        if (activities.length > this.maxActivities) {
            activities.splice(this.maxActivities);
        }

        // Save to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(activities));

        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('activityAdded', { detail: newActivity }));

        return newActivity;
    }

    /**
     * Get all activities from localStorage
     */
    getActivities() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading activities:', error);
            return [];
        }
    }

    /**
     * Get recent activities (default: 5)
     */
    getRecentActivities(count = 5) {
        const activities = this.getActivities();
        return activities.slice(0, count).map(activity => ({
            ...activity,
            time: this.getRelativeTime(new Date(activity.timestamp))
        }));
    }

    /**
     * Clear all activities
     */
    clearActivities() {
        localStorage.removeItem(this.storageKey);
        window.dispatchEvent(new CustomEvent('activitiesCleared'));
    }

    /**
     * Get relative time string (e.g., "2 hours ago")
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }

    /**
     * Track session view
     */
    trackSessionView(sessionTitle) {
        return this.addActivity(
            'session',
            'Watched Session',
            sessionTitle,
            'fa-video'
        );
    }

    /**
     * Track quiz completion
     */
    trackQuizCompletion(quizName, score) {
        return this.addActivity(
            'quiz',
            'Quiz Completed',
            `${quizName} - Score: ${score}%`,
            'fa-clipboard-check'
        );
    }

    /**
     * Track certificate earned
     */
    trackCertificate(certName) {
        return this.addActivity(
            'certificate',
            'Certificate Earned',
            `${certName} 🎓`,
            'fa-certificate'
        );
    }

    /**
     * Track milestone achievement
     */
    trackMilestone(description) {
        return this.addActivity(
            'milestone',
            'Milestone Achieved',
            `${description} 🎉`,
            'fa-trophy'
        );
    }

    /**
     * Auto-track milestones based on progress
     */
    checkMilestones() {
        const activities = this.getActivities();
        const sessionCount = activities.filter(a => a.type === 'session').length;
        const quizCount = activities.filter(a => a.type === 'quiz').length;

        // Check for session milestones
        if (sessionCount === 5 && !this.hasMilestone('Completed 5 sessions')) {
            this.trackMilestone('Completed 5 sessions');
        } else if (sessionCount === 10 && !this.hasMilestone('Completed 10 sessions')) {
            this.trackMilestone('Completed 10 sessions');
        } else if (sessionCount === 25 && !this.hasMilestone('Completed 25 sessions')) {
            this.trackMilestone('Completed 25 sessions');
        }

        // Check for quiz milestones
        if (quizCount === 5 && !this.hasMilestone('Completed 5 quizzes')) {
            this.trackMilestone('Completed 5 quizzes');
        } else if (quizCount === 10 && !this.hasMilestone('Completed 10 quizzes')) {
            this.trackMilestone('Completed 10 quizzes');
        }
    }

    /**
     * Check if milestone already exists
     */
    hasMilestone(description) {
        const activities = this.getActivities();
        return activities.some(a =>
            a.type === 'milestone' && a.description.includes(description)
        );
    }
}

// Create global instance
window.activityTracker = new ActivityTracker();

// Auto-check milestones on page load
document.addEventListener('DOMContentLoaded', () => {
    window.activityTracker.checkMilestones();
});
