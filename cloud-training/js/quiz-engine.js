/**
 * Quiz Engine for Cloud Training Platform
 * Manages quiz questions, timer, scoring, and progress tracking
 */

class QuizEngine {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.timerInterval = null;
        this.timeLimit = 7200; // 2 hours in seconds (for mock exams)
    }

    // Question Bank (ACE Sample Questions)
    questionBank = {
        'ace-fundamentals': [
            {
                id: 'q1',
                question: 'Which Google Cloud service provides a fully managed, serverless platform for deploying containerized applications?',
                options: [
                    'Google Compute Engine',
                    'Google Kubernetes Engine',
                    'Cloud Run',
                    'App Engine'
                ],
                correct: 2,
                explanation: 'Cloud Run is a fully managed serverless platform that automatically scales your stateless containers. It abstracts away all infrastructure management.',
                topic: 'Compute'
            },
            {
                id: 'q2',
                question: 'What is the default network type created when you create a new Google Cloud project?',
                options: [
                    'Legacy network',
                    'Auto mode VPC network',
                    'Custom mode VPC network',
                    'No network is created by default'
                ],
                correct: 1,
                explanation: 'By default, Google Cloud creates an auto mode VPC network with subnets in each region when you create a new project.',
                topic: 'Networking'
            },
            {
                id: 'q3',
                question: 'Which IAM role allows a user to view resources but not make any changes?',
                options: [
                    'roles/owner',
                    'roles/editor',
                    'roles/viewer',
                    'roles/browser'
                ],
                correct: 2,
                explanation: 'The Viewer role (roles/viewer) provides read-only access to resources. It allows viewing but not modifying resources.',
                topic: 'Security'
            },
            {
                id: 'q4',
                question: 'Which storage class is best for data accessed less than once a year?',
                options: [
                    'Standard',
                    'Nearline',
                    'Coldline',
                    'Archive'
                ],
                correct: 3,
                explanation: 'Archive storage is designed for data accessed less than once a year. It has the lowest storage cost but higher retrieval costs.',
                topic: 'Storage'
            },
            {
                id: 'q5',
                question: 'What command lists all Compute Engine instances in the current project?',
                options: [
                    'gcloud compute instances show',
                    'gcloud compute instances list',
                    'gcloud list instances',
                    'gcloud instances list all'
                ],
                correct: 1,
                explanation: 'The correct command is "gcloud compute instances list" which lists all VM instances in the current project.',
                topic: 'CLI'
            },
            {
                id: 'q6',
                question: 'Which database service is best for OLTP workloads requiring horizontal scalability?',
                options: [
                    'Cloud SQL',
                    'Cloud Spanner',
                    'BigQuery',
                    'Firestore'
                ],
                correct: 1,
                explanation: 'Cloud Spanner is a fully managed, horizontally scalable relational database service ideal for OLTP workloads.',
                topic: 'Databases'
            },
            {
                id: 'q7',
                question: 'What is the maximum number of regions a Google Cloud Storage bucket can span?',
                options: [
                    '1 region',
                    '2 regions (dual-region)',
                    'All regions (multi-region)',
                    'Unlimited'
                ],
                correct: 2,
                explanation: 'Multi-region buckets can span all regions within a geographic area (like US, EU, or ASIA) for highest availability.',
                topic: 'Storage'
            },
            {
                id: 'q8',
                question: 'Which Google Cloud service is used for real-time stream processing?',
                options: [
                    'Cloud Functions',
                    'Cloud Dataflow',
                    'Cloud Composer',
                    'Cloud Scheduler'
                ],
                correct: 1,
                explanation: 'Cloud Dataflow is a fully managed service for stream and batch data processing, based on Apache Beam.',
                topic: 'Data Processing'
            },
            {
                id: 'q9',
                question: 'What is the minimum billing increment for Cloud Functions execution time?',
                options: [
                    '1 millisecond',
                    '100 milliseconds',
                    '1 second',
                    '1 minute'
                ],
                correct: 1,
                explanation: 'Cloud Functions bills in 100ms increments. If your function runs for 250ms, you are billed for 300ms.',
                topic: 'Serverless'
            },
            {
                id: 'q10',
                question: 'Which tool enables you to deploy and manage applications on Kubernetes?',
                options: [
                    'gcloud',
                    'kubectl',
                    'gsutil',
                    'bq'
                ],
                correct: 1,
                explanation: 'kubectl is the command-line tool for interacting with Kubernetes clusters, including GKE.',
                topic: 'Kubernetes'
            }
        ]
    };

    // Start a new quiz
    startQuiz(quizCategory, timeLimit = null) {
        this.currentQuiz = {
            category: quizCategory,
            questions: this.getQuestions(quizCategory),
            totalQuestions: this.questionBank[quizCategory].length
        };
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = new Date();

        if (timeLimit) {
            this.timeLimit = timeLimit;
            this.startTimer();
        }

        return this.currentQuiz;
    }

    // Get questions for a category
    getQuestions(category) {
        return this.questionBank[category] || [];
    }

    // Get current question
    getCurrentQuestion() {
        if (!this.currentQuiz) return null;
        return this.currentQuiz.questions[this.currentQuestionIndex];
    }

    // Submit answer for current question
    submitAnswer(answerIndex) {
        if (!this.currentQuiz) return false;

        const question = this.getCurrentQuestion();
        this.userAnswers.push({
            questionId: question.id,
            selected: answerIndex,
            correct: question.correct,
            isCorrect: answerIndex === question.correct
        });

        return this.userAnswers[this.userAnswers.length - 1];
    }

    // Move to next question
    nextQuestion() {
        if (!this.currentQuiz) return false;

        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }

    // Move to previous question
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }

    // Calculate final score
    calculateScore() {
        if (!this.userAnswers.length) return { score: 0, percentage: 0, passed: false };

        const correctAnswers = this.userAnswers.filter(a => a.isCorrect).length;
        const percentage = Math.round((correctAnswers / this.userAnswers.length) * 100);
        const timeSpent = Math.floor((new Date() - this.startTime) / 1000); // in seconds

        const result = {
            score: correctAnswers,
            total: this.userAnswers.length,
            percentage: percentage,
            passed: percentage >= 60,
            timeSpent: timeSpent,
            breakdown: this.getTopicBreakdown()
        };

        // Save to progress tracker
        if (typeof progressTracker !== 'undefined') {
            progressTracker.trackQuizScore(
                `quiz-${this.currentQuiz.category}-${Date.now()}`,
                correctAnswers,
                this.userAnswers.length
            );
        }

        // Track activity
        if (typeof activityTracker !== 'undefined') {
            activityTracker.trackQuizCompletion(
                this.currentQuiz.category.toUpperCase() + ' Quiz',
                percentage
            );
        }

        return result;
    }

    // Get topic-wise breakdown
    getTopicBreakdown() {
        const topics = {};

        this.currentQuiz.questions.forEach((q, index) => {
            if (!topics[q.topic]) {
                topics[q.topic] = { correct: 0, total: 0 };
            }
            topics[q.topic].total++;
            if (this.userAnswers[index] && this.userAnswers[index].isCorrect) {
                topics[q.topic].correct++;
            }
        });

        return Object.keys(topics).map(topic => ({
            topic: topic,
            correct: topics[topic].correct,
            total: topics[topic].total,
            percentage: Math.round((topics[topic].correct / topics[topic].total) * 100)
        }));
    }

    // Timer functions
    startTimer() {
        let timeRemaining = this.timeLimit;

        this.timerInterval = setInterval(() => {
            timeRemaining--;

            // Update timer display
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const seconds = timeRemaining % 60;

            const timerElement = document.getElementById('quizTimer');
            if (timerElement) {
                timerElement.textContent =
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            if (timeRemaining <= 0) {
                this.stopTimer();
                this.autoSubmitQuiz();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    autoSubmitQuiz() {
        if (typeof Notiflix !== 'undefined') {
            Notiflix.Notify.warning('Time is up! Quiz submitted automatically.');
        }
        // Trigger quiz submission
        const event = new CustomEvent('quizTimeUp');
        window.dispatchEvent(event);
    }

    // Get progress (for progress bar)
    getProgress() {
        if (!this.currentQuiz) return 0;
        return Math.round(((this.currentQuestionIndex + 1) / this.currentQuiz.totalQuestions) * 100);
    }

    // Reset quiz
    reset() {
        this.stopTimer();
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
    }
}

// Initialize global instance
const quizEngine = new QuizEngine();

if (typeof window !== 'undefined') {
    window.quizEngine = quizEngine;
}
