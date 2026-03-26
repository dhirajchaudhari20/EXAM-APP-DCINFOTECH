// Quiz Data for Cloud Training
// Categories: ACE (Associate Cloud Engineer), PCA (Professional Cloud Architect), DEVOPS (Pro DevOps Engineer)

const quizData = {
    ace: {
        title: "Associate Cloud Engineer",
        description: "Validate your ability to deploy and maintain cloud projects.",
        totalQuestions: 10,
        timeLimit: 7200, // 2 hours in seconds
        questions: [
            {
                id: 1,
                question: "You want to create a guaranteed 100% SLA for your service running on Compute Engine. What should you do?",
                options: [
                    "Deploy the service in a single zone.",
                    "Deploy the service across multiple regions.",
                    "Google Cloud does not offer a 100% SLA for Compute Engine.",
                    "Use a Preemptible VM instance."
                ],
                correct: 2,
                explanation: "Google Cloud typically offers 99.5% to 99.99% SLAs for Compute Engine depending on the configuration (single zone vs multi-zone). Use of '100%' is generally not promised in standard SLAs."
            },
            {
                id: 2,
                question: "Which command would you use to list all active Google Cloud projects using the Cloud SDK?",
                options: [
                    "gcloud projects list",
                    "gcloud config list",
                    "gcloud components list",
                    "gcloud service-management list"
                ],
                correct: 0,
                explanation: "'gcloud projects list' lists all the projects you have access to."
            },
            {
                id: 3,
                question: "You need to store unstructured data that can be accessed globally with low latency. Which storage option should you choose?",
                options: [
                    "Cloud SQL",
                    "Cloud Spanner",
                    "Cloud Storage",
                    "Bigtable"
                ],
                correct: 2,
                explanation: "Cloud Storage is an object storage service that is globally accessible and suitable for unstructured data."
            },
            {
                id: 4,
                question: "Your application needs to handle a sudden spike in traffic. You are using a Managed Instance Group (MIG). What feature should you enable?",
                options: [
                    "Autohealing",
                    "Autoscaling",
                    "Load Balancing",
                    "Rolling Updates"
                ],
                correct: 1,
                explanation: "Autoscaling allows the MIG to automatically add or remove instances based on load metrics like CPU utilization."
            },
            {
                id: 5,
                question: "You need to assign a role to a new team member that allows them to view resources but not modify them. Which role is most appropriate?",
                options: [
                    "Editor",
                    "Owner",
                    "Viewer",
                    "Browser"
                ],
                correct: 2,
                explanation: "The Viewer role provides read-only access to resources."
            }
            // Add more questions as needed
        ]
    },
    pca: {
        title: "Professional Cloud Architect",
        description: "Design and manage robust, secure, and scalable cloud solutions.",
        totalQuestions: 10,
        timeLimit: 7200,
        questions: [
            {
                id: 1,
                question: "A client requires a database solution that supports ACID transactions and horizontal scaling globally. What is the best choice?",
                options: [
                    "Cloud SQL",
                    "Cloud Spanner",
                    "Cloud Bigtable",
                    "Firestore"
                ],
                correct: 1,
                explanation: "Cloud Spanner is the only fully managed relational database service that offers strong consistency, ACID transactions, and global horizontal scaling."
            },
            {
                id: 2,
                question: "You are designing a hybrid connectivity solution. You need dedicated bandwidth of 10 Gbps and high security. What should you recommend?",
                options: [
                    "Cloud VPN",
                    "Dedicated Interconnect",
                    "Partner Interconnect",
                    "Peering"
                ],
                correct: 1,
                explanation: "Dedicated Interconnect provides direct physical connections between your on-premises network and Google's network, offering high bandwidth and security."
            }
        ]
    },
    devops: {
        title: "Professional Cloud DevOps Engineer",
        description: "Optimize service performance and reliability using SRE practices.",
        totalQuestions: 10,
        timeLimit: 7200,
        questions: [
            {
                id: 1,
                question: "Which SLI is most relevant for a batch processing pipeline?",
                options: [
                    "Latency",
                    "Availability",
                    "Freshness",
                    "Throughput"
                ],
                correct: 3,
                explanation: "For batch processing, Throughput (volume of data processed per unit of time) is often a key indicator of performance."
            },
            {
                id: 2,
                question: "You want to automate the deployment of your infrastructure using code. Which Google Cloud native tool serves this purpose?",
                options: [
                    "Terraform",
                    "Ansible",
                    "Deployment Manager",
                    "Cloud Build"
                ],
                correct: 2,
                explanation: "Google Cloud Deployment Manager is an infrastructure deployment service that automates the creation and management of Google Cloud resources."
            }
        ]
    }
};

// Expose to global scope
window.quizData = quizData;
