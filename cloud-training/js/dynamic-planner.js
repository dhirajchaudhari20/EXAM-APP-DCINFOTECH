/**
 * Dynamic Planner Data Fetcher
 * Fetches real sessions from agenda.js for the logged-in user
 * Integrates with Gemini API for AI study suggestions
 */

class DynamicPlannerEngine {
    constructor() {
        this.user = this.getLoggedInUser();
        this.sessions = [];
        this.aiSuggestions = [];
        this.geminiApiKey = null; // No longer needed
        this.geminiEndpoint = '/.netlify/functions/gemini-proxy';
    }

    // Get logged-in user from session
    getLoggedInUser() {
        let user = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (!user) {
            user = JSON.parse(localStorage.getItem('cloudUser'));
        }
        return user;
    }

    // Fetch user's schedule from agenda.js
    async fetchUserSchedule() {
        if (!this.user) {
            console.error('No user logged in');
            return [];
        }

        const batch = this.user.batch ? this.user.batch.toUpperCase() : '';

        // Map batch to schedule variable (from agenda.js)
        let userSchedule = [];

        if (typeof window !== 'undefined') {
            if (batch === 'ML' && typeof scheduleML !== 'undefined') {
                userSchedule = scheduleML;
            } else if (batch === '1APRIL' && typeof schedule1April !== 'undefined') {
                userSchedule = schedule1April;
            } else if (batch === '2APRIL' && typeof schedule2April !== 'undefined') {
                userSchedule = schedule2April;
            } else if (batch === 'DEVOPSAPRIL' && typeof scheduleDevOpsApril !== 'undefined') {
                userSchedule = scheduleDevOpsApril;
            } else if (batch === 'CLOUDARCHITECTAPRIL' && typeof scheduleCloudArchitectApril !== 'undefined') {
                userSchedule = scheduleCloudArchitectApril;
            } else if (batch === 'ACE20' && typeof scheduleACE20 !== 'undefined') {
                userSchedule = scheduleACE20;
            } else if (batch === 'ACE21' && typeof scheduleACE21 !== 'undefined') {
                userSchedule = scheduleACE21;
            } else if (batch === 'ACE22' && typeof scheduleACE22 !== 'undefined') {
                userSchedule = scheduleACE22;
            } else if (batch === 'ACE23' && typeof scheduleACE23 !== 'undefined') {
                userSchedule = scheduleACE23;
            } else if (batch === 'ACE24' && typeof scheduleACE24 !== 'undefined') {
                userSchedule = scheduleACE24;
            } else if (batch === 'ACE' && typeof scheduleACE !== 'undefined') {
                userSchedule = scheduleACE;
            } else if (typeof schedule !== 'undefined') {
                userSchedule = schedule; // Default schedule
            }
        }

        this.sessions = this.parseScheduleToTasks(userSchedule);
        return this.sessions;
    }

    // Parse schedule data to weekly tasks
    parseScheduleToTasks(schedule) {
        const tasks = [];
        const today = new Date();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        schedule.forEach(session => {
            // Parse the day string to get actual date
            const dateMatch = session.day.match(/\w+, (\w+) (\d+), (\d+)/);
            if (dateMatch) {
                const [, monthStr, day, year] = dateMatch;
                const sessionDate = new Date(`${monthStr} ${day}, ${year}`);

                // Only include upcoming sessions (within next 7 days)
                const daysDiff = Math.floor((sessionDate - today) / (1000 * 60 * 60 * 24));
                if (daysDiff >= -1 && daysDiff <= 7) {
                    const dayOfWeek = daysOfWeek[sessionDate.getDay()];

                    tasks.push({
                        day: dayOfWeek,
                        time: this.extractTime(session.time),
                        title: this.shortenTitle(session.description),
                        duration: this.calculateDuration(session.time),
                        type: 'session',
                        fullData: session
                    });
                }
            }
        });

        return tasks;
    }

    // Extract start time from time range
    extractTime(timeStr) {
        const match = timeStr.match(/(\d+:\d+\s?[AP]M)/i);
        return match ? match[1] : '9:00 AM';
    }

    // Calculate duration from time range
    calculateDuration(timeStr) {
        const matches = timeStr.match(/(\d+):(\d+)\s?([AP]M)/gi);
        if (matches && matches.length >= 2) {
            const start = this.parseTime(matches[0]);
            const end = this.parseTime(matches[1]);
            const hours = Math.abs(end - start);
            return hours >= 1 ? `${hours}hrs` : `${hours * 60}min`;
        }
        return '2hrs';
    }

    parseTime(timeStr) {
        const match = timeStr.match(/(\d+):(\d+)\s?([AP]M)/i);
        if (match) {
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const period = match[3].toUpperCase();

            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            return hours + minutes / 60;
        }
        return 9;
    }

    // Shorten long titles
    shortenTitle(title) {
        const shortTitle = title
            .replace('Academy - ', '')
            .replace('Associate Cloud Engineer workshop ', 'ACE ')
            .replace('Professional Cloud ', '')
            .replace('Module ', 'Mod ');
        return shortTitle.length > 35 ? shortTitle.substring(0, 35) + '...' : shortTitle;
    }

    // Generate AI suggestions using Proxy
    async generateAISuggestions() {
        try {
            const upcomingSessions = this.sessions.slice(0, 5);
            const prompt = `You are an AI study advisor for Google Cloud certification students.

Based on these upcoming sessions:
${upcomingSessions.map(s => `- ${s.title} on ${s.day}`).join('\n')}

Generate 3 personalized study suggestions in JSON format:
[
  {
    "title": "Brief actionable title",
    "description": "One sentence explaining why this helps",
    "estimatedTime": "1-2hrs or similar",
    "priority": "high/medium/low"
  }
]

Focus on: review before sessions, practice labs, quiz preparation, and optimal study timing.
Keep titles under 40 characters. Keep descriptions under 100 characters.`;

            const response = await fetch(this.geminiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();
            const textResponse = data.candidates[0]?.content?.parts[0]?.text || '';

            // Extract JSON from response
            const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                this.aiSuggestions = JSON.parse(jsonMatch[0]);
                return this.aiSuggestions;
            }

            return this.getFallbackSuggestions();
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
            return this.getFallbackSuggestions();
        }
    }

    // Fallback suggestions if Gemini API fails
    getFallbackSuggestions() {
        return [
            {
                title: "Review concepts before next session",
                description: "Spend 1-2 hours reviewing previous module topics to prepare for upcoming session",
                estimatedTime: "1-2hrs",
                priority: "high"
            },
            {
                title: "Complete practice labs",
                description: "Hands-on practice reinforces learning - aim for 2-3 Qwiklabs this week",
                estimatedTime: "2-3hrs",
                priority: "medium"
            },
            {
                title: "Weekend deep study session",
                description: "Block 3-4 hours on weekend for focused study when you're most productive",
                estimatedTime: "3-4hrs",
                priority: "medium"
            }
        ];
    }

    // Calculate statistics
    getStats() {
        const totalHours = this.sessions.reduce((sum, task) => {
            const hours = parseFloat(task.duration) || 2;
            return sum + hours;
        }, 0);

        const completedTasks = parseInt(localStorage.getItem('completedTasksCount') || '0');
        const totalTasks = this.sessions.length + 5; // Sessions + personal tasks
        const completionRate = Math.round((completedTasks / totalTasks) * 100);

        return {
            totalHours: Math.round(totalHours),
            sessionsCount: this.sessions.length,
            completionRate: completionRate || 85,
            aiSuggestionsCount: this.aiSuggestions.length
        };
    }

    // Convert suggestions to tasks
    suggestionToTask(suggestion, dayPreference = 'Sat') {
        return {
            day: dayPreference,
            time: '10:00 AM',
            title: suggestion.title,
            duration: suggestion.estimatedTime,
            type: 'ai-suggested'
        };
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.dynamicPlannerEngine = new DynamicPlannerEngine();
}
