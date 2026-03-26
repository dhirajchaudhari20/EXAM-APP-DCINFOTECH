window.allQuestions = {
    "Associate Cloud Engineer": [
        {
            "question": "Your company wants to deploy a stateless web application on Google Cloud. They require automatic scaling and want to pay only when the code is running. Which service is the most cost-effective choice?",
            "options": [
                "Compute Engine",
                "Google Kubernetes Engine (GKE)",
                "Cloud Functions",
                "App Engine Standard Environment"
            ],
            "answer": "f2f57c544fee19fd6f2097a8369ae518a37c67674ded4229e469a5734cd4be23"
        },
        {
            "question": "What is the primary purpose of a VPC (Virtual Private Cloud) in Google Cloud?",
            "options": [
                "To provide a physical server for dedicated hosting",
                "To isolate your cloud resources and define a private network",
                "To store large binary files like videos and images",
                "To run containerized applications with automatic orchestration"
            ],
            "answer": "b2941a283ac8048d1a5caa1e3bc712ef551cf33be81d29b6275116c0e90c202e"
        },
        {
            "question": "You need to grant a new contractor permission to only manage Compute Engine instances in a specific project. Which IAM principle of security should you follow?",
            "options": [
                "Separation of Duties",
                "Defense in Depth",
                "Principle of Least Privilege",
                "Auditability"
            ],
            "answer": "62db5ab96827492a4cd9d107d7dc213cfe19f1669bf39b75598770ae5f79e9de"
        },
        {
            "question": "Which service account is automatically created when you enable the Compute Engine API in a project, and is used by VMs for interactions with other GCP services?",
            "options": [
                "Google APIs Service Account",
                "Compute Engine Default Service Account",
                "Google-Managed Service Account",
                "User-Managed Service Account"
            ],
            "answer": "9515933fe52857369aa55e417abee481df74e2815842c10bd2f51b047e83508d"
        },
        {
            "question": "A finance team member needs to view billing statements across the entire organization. Which IAM role should you grant them at the organization level?",
            "options": [
                "Project Billing Manager",
                "Billing Account Administrator",
                "Billing Account User",
                "Billing Account Viewer"
            ],
            "answer": "5cc70f4c414e316ef229fa2665a1e8c763201be5968f03126278010fba4d1479"
        },
        {
            "question": "You are setting up a new GCP project. Which command-line tool is used to set the default project for all subsequent commands?",
            "options": [
                "gcloud projects set",
                "gcloud config set project",
                "gcloud init --project",
                "gcloud compute config set-project"
            ],
            "answer": "66777defb1ba436bbbe3b0f93c316582462609e00568dbf6bd55036721d2c3d8"
        },
        {
            "question": "How can you enforce that all new Compute Engine instances must use specific machine types across your organization?",
            "options": [
                "Use an IAM Condition",
                "Apply a Cloud Billing budget",
                "Implement an Organization Policy Constraint",
                "Configure a Shared VPC"
            ],
            "answer": "524fb820538048e6864af7416ef7e8c1713b0020eb80ff6d6152ed62d5f70517"
        },
        {
            "question": "What is the smallest resource container in the Google Cloud resource hierarchy that all other resources must belong to?",
            "options": [
                "Organization",
                "Folder",
                "Project",
                "Billing Account"
            ],
            "answer": "985959785319747668373cc6dee294b11db782b03cdd90a2851fbdc0637c6b7b"
        },
        {
            "question": "You want to audit who has been deleting Compute Engine instances. Which type of Cloud Logging log should you review?",
            "options": [
                "Data Access logs",
                "Admin Activity logs",
                "System Event logs",
                "Audit Access logs"
            ],
            "answer": "717da302c3255333a540ba90711e37349e161d47a003a7233b09add66cf2aec4"
        },
        {
            "question": "Your organization wants to centralize network management for multiple projects. Which networking feature is designed for this purpose?",
            "options": [
                "VPC Peering",
                "Shared VPC",
                "VPN Gateway",
                "Cloud Interconnect"
            ],
            "answer": "33947bc1e6084338e20a75ee9a5aff5046f2582122564df0f7b81df925c44d2b"
        },
        {
            "question": "Which command would you use to verify the IAM roles and members associated with a specific project?",
            "options": [
                "gcloud iam roles list --project",
                "gcloud projects get-iam-policy",
                "gcloud auth list",
                "gcloud compute instances list-iam-policy"
            ],
            "answer": "008748514fa72d822e752c47451b71bce000c462f9080b1fe761eae7279e88f6"
        },
        {
            "question": "Which tool allows you to interact with GCP services from your web browser, including a pre-installed `gcloud` CLI and persistent disk storage?",
            "options": [
                "Compute Engine serial console",
                "Cloud Code",
                "Cloud Shell",
                "Cloud Console Terminal"
            ],
            "answer": "d59bd749b0d123356ef6a4ca7b81a02c91ff029cf9c423ae52b19929c4ab1e1e"
        },
        {
            "question": "You need to deploy a batch processing job that can tolerate interruptions to minimize cost. Which Compute Engine option should you choose?",
            "options": [
                "Standard VM",
                "Preemptible VM",
                "Sole-tenant Node",
                "Custom Machine Type"
            ],
            "answer": "59e82369324fa35c4de52387bc7f7a3bbe4a88cc256a0c4ec38838e004b28899"
        },
        {
            "question": "Your team is running a web application on Compute Engine and needs to ensure that the server automatically restarts if it crashes. Which setting should you configure on the VM instance?",
            "options": [
                "Automatic scaling",
                "On-host maintenance",
                "Availability Policy: On-failure restart",
                "Live migration"
            ],
            "answer": "4d75fd66978bc6c26b00546becdf6283db457217a56f845114a4dc70075d987b"
        },
        {
            "question": "You are creating a Managed Instance Group (MIG) for a web application. What is the minimum element required to create a MIG?",
            "options": [
                "Load Balancer",
                "Autoscaler policy",
                "Instance Template",
                "Persistent Disk snapshot"
            ],
            "answer": "c22b669b58b8ba10ed4311d660480f516a71fef9adb55529427738306d9ab5cf"
        },
        {
            "question": "To manage a fleet of Linux Compute Engine VMs using a centralized user account system without managing SSH keys, which feature should you enable?",
            "options": [
                "Instance Metadata",
                "OS Login",
                "Shielded VMs",
                "Cloud VPN"
            ],
            "answer": "8ea3dd1a148c1414cab55624a9ffdac8a991b10abff486d3fdd3676f66e976b9"
        },
        {
            "question": "You need a Compute Engine VM with more RAM than the predefined machine types allow, but less than the maximum. What is the most cost-efficient solution?",
            "options": [
                "N2 Machine Type",
                "Custom Machine Type",
                "Sole-tenant Node",
                "M2 Machine Type"
            ],
            "answer": "fedde0d31056f9562882adeb9876694afd5d92c0e7cb562d79608c1b40949e2a"
        },
        {
            "question": "You have a single VM that needs to be accessible from the internet over HTTPS. Which type of load balancer is most appropriate and simplest to configure for this scenario?",
            "options": [
                "Internal TCP/UDP Load Balancer",
                "External HTTP(S) Load Balancer",
                "External Network TCP/UDP Load Balancer",
                "Regional Internal HTTP(S) Load Balancer"
            ],
            "answer": "6e6c6a66e7a60b5d48f98316cd0b938cee24011bf8c491f3c9aa85cdcd5cfd80"
        },
        {
            "question": "To perform an in-place upgrade of the operating system on a Compute Engine instance's boot disk, what is the best practice before starting the upgrade?",
            "options": [
                "Stop the instance",
                "Create a snapshot of the boot disk",
                "Change the machine type",
                "Detach the boot disk"
            ],
            "answer": "ed35a54cf14676915132999821d2892119c581fd5815f50e258c5a7aed22194a"
        },
        {
            "question": "When scaling a GKE cluster based on CPU utilization, what component is responsible for automatically adding or removing nodes?",
            "options": [
                "Horizontal Pod Autoscaler (HPA)",
                "Cluster Autoscaler",
                "Vertical Pod Autoscaler (VPA)",
                "Kube Scheduler"
            ],
            "answer": "8691c2e55c9230295ea785038393707af4b299bbd8fab0a1870ae67950451492"
        },
        {
            "question": "You want a highly available, multi-zone deployment of your containerized application that requires a stable IP address. Which GKE object should you use to expose your application?",
            "options": [
                "Deployment",
                "Pod",
                "Service (Type: LoadBalancer)",
                "ConfigMap"
            ],
            "answer": "acbd2538f497115b0aaa0b8c76e5dd80c4b2f7a4a9846bea3c49f88d7eebc31d"
        },
        {
            "question": "Your application is deployed on App Engine Standard. You need to ensure a minimum of 5 instances are always running for low-latency responses. Which scaling type and setting should you configure?",
            "options": [
                "Automatic Scaling, with min-instances set to 5",
                "Basic Scaling, with max-instances set to 5",
                "Manual Scaling, with instances set to 5",
                "Autoscaling, with target CPU utilization set to 50%"
            ],
            "answer": "0cfe320be3f75a497393010d3fb67e578488f0ca7c38924b5b2d29dcb5005b65"
        },
        {
            "question": "Your application generates terabytes of data daily that is rarely accessed after 90 days, but must be available for compliance. What is the most cost-effective Cloud Storage class for this data?",
            "options": [
                "Standard Storage",
                "Nearline Storage",
                "Coldline Storage",
                "Archive Storage"
            ],
            "answer": "866bbc07e4f3e5f275a495601c2383892237722c2b8953c0657569add4f14cd9"
        },
        {
            "question": "You need a highly available, relational database that can scale horizontally across multiple regions. Which GCP database service is the best fit?",
            "options": [
                "Cloud SQL",
                "Cloud Firestore",
                "BigQuery",
                "Cloud Spanner"
            ],
            "answer": "e4cc4fd25783cd653fde98e4505141f96f77443f87021d08b1f681efa9cec31c"
        },
        {
            "question": "You need to set up a new Cloud SQL instance (PostgreSQL) and require the ability to recover the database to a specific minute in the past. What feature must be enabled?",
            "options": [
                "Automated backups only",
                "Failover replica",
                "High availability mode",
                "Binary logging (Point-in-time recovery)"
            ],
            "answer": "9475ad0a35241ca1e2a6290910e61680ddc44f101cf0c1743da36a36011242d4"
        },
        {
            "question": "What is the recommended method for transferring a very large amount of data (Petabytes) from an on-premises data center to a Cloud Storage bucket, when network bandwidth is a bottleneck?",
            "options": [
                "gcloud storage cp command",
                "Storage Transfer Service",
                "Transfer Appliance",
                "VPN Tunnel"
            ],
            "answer": "e50061c1df4d2984259446cd0c17873fe82c5bedd08a6988592a245f508e4af9"
        },
        {
            "question": "What type of storage is best suited for the boot disk of a Compute Engine VM?",
            "options": [
                "Cloud Storage Standard",
                "Local SSD",
                "Persistent Disk",
                "Nearline Storage"
            ],
            "answer": "f1ec575ec347a168dce9002cf20e8116df42597326ba18ccfb5ea9fad0378d43"
        },
        {
            "question": "You need to store unstructured, non-relational data that requires low-latency read and write operations. Which database service should you choose?",
            "options": [
                "Cloud SQL",
                "BigQuery",
                "Cloud Firestore",
                "Cloud Spanner"
            ],
            "answer": "8bfd2203a4934c7f7dd50d5986347fa3f86411fe8e4abcfc68046377986af53d"
        },
        {
            "question": "Which feature of Cloud Storage can automatically transition objects between storage classes (e.g., from Standard to Nearline) after a specified period of time?",
            "options": [
                "Object Versioning",
                "Lifecycle Management",
                "Retention Policy",
                "Public Access Prevention"
            ],
            "answer": "165e7fe46578cb9919a3c48cde833547910995e668ee941c5c65f8b7a3a885da"
        },
        {
            "question": "You have a production Cloud SQL instance and want a separate instance for read-heavy reporting that doesn't impact the main instance's performance. What should you configure?",
            "options": [
                "A failover replica",
                "A read replica",
                "A clone instance",
                "An instance snapshot"
            ],
            "answer": "724d15777b5ad88b31163dc14ad75078774f5c99840dc32b9e4d6a423d84cc91"
        },
        {
            "question": "What is the primary function of BigQuery for data analysis?",
            "options": [
                "Online Transaction Processing (OLTP)",
                "Online Analytical Processing (OLAP)",
                "NoSQL Document Storage",
                "Object Storage"
            ],
            "answer": "ec8b2d813fb60a93abd7afba68ee1e9d6c0fbeadaa2da989994523a76fc30d5e"
        },
        {
            "question": "You are uploading a 10 GB file to Cloud Storage. The connection occasionally drops. Which command-line utility should you use to handle these intermittent failures automatically?",
            "options": [
                "gcloud compute scp",
                "gsutil cp",
                "gcloud storage cp",
                "gcloud data transfer"
            ],
            "answer": "b0f014309a3f96e39c03e125de4974009bbbe3ff4aad6e83a56c58a235520f01"
        },
        {
            "question": "You want to allow SSH access (TCP port 22) to all Compute Engine VMs in a specific network tag. Which resource should you configure?",
            "options": [
                "A Managed Instance Group",
                "A Network Load Balancer",
                "A VPC Firewall Rule",
                "A Subnet Access Control List"
            ],
            "answer": "199c0ba47aae570758757d0161ee8a759c9ed9149c5c4cb050fe88c4cbc44d34"
        },
        {
            "question": "What is the default behavior of egress traffic in a GCP VPC network?",
            "options": [
                "Egress is denied by default",
                "Egress is allowed to all destinations",
                "Egress is only allowed to other subnets",
                "Egress is denied to external IP addresses"
            ],
            "answer": "8a4d9c53ee48cd10f6cddafaf8557cebba89e2ae43d94f89ac6a38022f7ab40a"
        },
        {
            "question": "A VM in a private subnet needs to access external APIs on the internet without having a public IP address. What GCP service should you use?",
            "options": [
                "VPC Peering",
                "Cloud NAT (Network Address Translation)",
                "Cloud VPN",
                "Internal Load Balancer"
            ],
            "answer": "7026764507b1f63906f9e45f6ef756048d7338ab750b5024a2bb05615c37ca85"
        },
        {
            "question": "In a custom mode VPC network, how is the IP range of a subnet defined?",
            "options": [
                "It is automatically assigned by GCP.",
                "You must specify a non-overlapping CIDR range.",
                "It is set by the load balancer.",
                "It is inherited from the project's default range."
            ],
            "answer": "35c038ffe9f6554a9dd811b520dd5e157cf8e99d953aef2fab41a3215f4fc4b8"
        },
        {
            "question": "Which service provides a globally distributed, high-capacity layer 7 (HTTP/S) load balancing service with global external IP addresses?",
            "options": [
                "Internal TCP/UDP Load Balancer",
                "External HTTP(S) Load Balancer",
                "Network Load Balancer",
                "Cloud VPN Gateway"
            ],
            "answer": "c30655eba860c54f9d578579da13454a6d8cbe37a54103ac4fde7aa7d44fe2ab"
        },
        {
            "question": "You need to connect your on-premises data center to your GCP VPC network over a secure, encrypted tunnel using the public internet. Which service should you choose?",
            "options": [
                "Cloud Interconnect Dedicated",
                "Cloud Interconnect Partner",
                "Cloud VPN",
                "VPC Peering"
            ],
            "answer": "c83913a4c4cc86af6fb76362034c74dd15a8b297b7ee7f67e4e2bde264b22610"
        },
        {
            "question": "You have two VPC networks in the same project that need to communicate using internal IP addresses. What is the recommended way to connect them?",
            "options": [
                "Cloud VPN",
                "VPC Peering",
                "Shared VPC",
                "Use public IP addresses"
            ],
            "answer": "5dfdd5411730779bb2f0d790f4591d42a59f18a9c0c44806d4fd6fdca364af12"
        },
        {
            "question": "Which statement about GCP firewall rules is true?",
            "options": [
                "They are stateful, allowing return traffic automatically.",
                "They are stateless, requiring explicit rules for both directions.",
                "They can only be applied to a single VM instance.",
                "They are configured at the subnet level."
            ],
            "answer": "20dc6363d2f0a5b0f3d733458e06623f6202ef98f71d32f30bd4534be6701900"
        },
        {
            "question": "Which Compute Engine network tag applies to all VM instances by default?",
            "options": [
                "http-server",
                "default",
                "all",
                "network-wide"
            ],
            "answer": "71604076cde89575ddb846bef3255f506d4a532cdd4621ad03aae8f9a51eccf2"
        },
        {
            "question": "You notice that your internal application is responding slowly. Where is the first place you should check for network latency and error rates in your GCP environment?",
            "options": [
                "Cloud Billing Reports",
                "Cloud NAT logs",
                "VPC Flow Logs",
                "GKE Event Logs"
            ],
            "answer": "73d6ff64542b093c13ce2e8f010313fc58cbd989676f276212b733570833d033"
        },
        {
            "question": "You need to deploy a complex infrastructure using a declarative configuration file, allowing for repeatable deployments and dependency management. Which tool should you use?",
            "options": [
                "Cloud Functions",
                "Cloud SDK",
                "Deployment Manager",
                "Cloud Tasks"
            ],
            "answer": "4777bb3de05e6be91676200a0f949448a30f2d087c4590f0a7c61bbb7a0606d6"
        },
        {
            "question": "Which command is used to deploy an App Engine application from a configuration file?",
            "options": [
                "gcloud compute deploy",
                "gcloud app deploy",
                "gcloud functions deploy",
                "kubectl apply -f"
            ],
            "answer": "052355bae78c9957a78ebf6f2f448ec671bf30da4afcd3f8c7ca20b5c532fe3b"
        },
        {
            "question": "You are deploying a new version of your App Engine application and want to test it with a small group of users before rolling it out fully. What deployment feature should you use?",
            "options": [
                "Traffic Splitting/Migration",
                "Blue/Green Deployment",
                "A/B Testing",
                "Instance Capping"
            ],
            "answer": "bf8f86c037c1f53cf8e08cae370afd51ba2212b893c6c43dc3351dbc20ebd71a"
        },
        {
            "question": "How do you manage the underlying infrastructure (VMs) of a Cloud Run service?",
            "options": [
                "Directly via Compute Engine API",
                "Using the `gcloud compute` CLI",
                "Cloud Run is a fully managed service, and you cannot manage the infrastructure",
                "Through the GKE node pool configuration"
            ],
            "answer": "f4ab49b9dbe0ff039bf22b8abdfe263ac72ee6c01309b7f6df5391fb4e1edd0f"
        },
        {
            "question": "Before deploying a containerized application to GKE, where should you push the Docker image?",
            "options": [
                "Cloud Storage",
                "GitHub Container Registry",
                "Artifact Registry",
                "A Compute Engine boot disk"
            ],
            "answer": "f48b05f35be0d3cad269d43fe0b21e256fb8221a765f453ffa9270418eebed17"
        },
        {
            "question": "Which command is the standard Kubernetes CLI tool used to manage objects (like Deployments and Services) in a GKE cluster?",
            "options": [
                "gcloud container",
                "gkectl",
                "kubectl",
                "gcloud compute"
            ],
            "answer": "7a7f09de08e3dc01c5bbf90657ecc83d5c2da9f5791f1ebe84132b95422878dc"
        },
        {
            "question": "You are troubleshooting a VM that is not responding to SSH. What is the most immediate way to view the boot process and potential errors without connecting over SSH?",
            "options": [
                "Check Cloud Monitoring metrics",
                "View the VM's serial port output",
                "Check the VM's disk usage",
                "Review firewall rule logs"
            ],
            "answer": "ceadbf98879915fd76781d6c977430a422e801bb06353ef5166097a684875743"
        },
        {
            "question": "Which artifact management service is the recommended, modern replacement for Container Registry (GCR) in GCP?",
            "options": [
                "Cloud Storage",
                "Cloud Source Repositories",
                "Artifact Registry",
                "Deployment Manager"
            ],
            "answer": "f48b05f35be0d3cad269d43fe0b21e256fb8221a765f453ffa9270418eebed17"
        },
        {
            "question": "You need to run a cron job to process data nightly on a serverless platform. Which service is the best fit?",
            "options": [
                "Cloud Functions triggered by a Pub/Sub message via Cloud Scheduler",
                "App Engine Basic Scaling",
                "Compute Engine Preemptible VM",
                "Cloud Spanner"
            ],
            "answer": "9734ea9ca9d49bec938a7ccafdde2ff8df9fd2cfa719c70c282baf66f16f43b3"
        },
        {
            "question": "When using `gcloud compute instances create`, what must you specify to ensure the VM is created in the desired location?",
            "options": [
                "Region and Project",
                "Zone and Machine Type",
                "Zone and Disk Size",
                "Region and Network Name"
            ],
            "answer": "a7df420fbe602a99cc81595925378a13f110d464ff7cae26317090d4c6a4b36d"
        },
        {
            "question": "A Managed Instance Group (MIG) needs to ensure that instances are replaced if they fail their application-level check. What feature of the MIG configuration handles this?",
            "options": [
                "Autoscaling Policy",
                "Load Balancer Backend Service",
                "Autohealing Health Check",
                "Instance Template"
            ],
            "answer": "54d99a82e87320926fcc87a56c58a7eb899a3ae1834d0c4408ff00cbedf87324"
        },
        {
            "question": "You want to receive an email notification when the CPU utilization of your Compute Engine VMs exceeds 80% for more than 5 minutes. Which service should you configure?",
            "options": [
                "Cloud Logging",
                "Cloud Monitoring",
                "Cloud Trace",
                "Cloud Audit Logs"
            ],
            "answer": "74e6eed79c07a499fd1f954e50e0aca01e3fe33578c461c7502807dd683b253c"
        },
        {
            "question": "How can you centralize logs from all GCP services and resources in your project for analysis and long-term storage?",
            "options": [
                "Use the Cloud Shell console",
                "Use Cloud Logging (formerly Stackdriver Logging)",
                "Use Cloud Storage only",
                "Use Cloud Spanner"
            ],
            "answer": "b37ebd5f9587e5d6584437ea7eaebc6f930b4886ccab8a482c19e8f11be2870b"
        },
        {
            "question": "You need to transfer all logs from your GCP project to a BigQuery dataset for advanced analysis. What feature of Cloud Logging should you configure?",
            "options": [
                "A log sink (export)",
                "A log metric",
                "A log filter",
                "A log bucket"
            ],
            "answer": "f3f202cc98848dccb0661d6a4ef0919a0edccecb6bf616a55a913fc777e3eabd"
        },
        {
            "question": "Your application is deployed on App Engine. You notice intermittent application-level errors. Which monitoring tool provides detailed request tracing and latency information for application debugging?",
            "options": [
                "Cloud Monitoring",
                "Cloud Logging",
                "Cloud Trace",
                "Cloud Debugger"
            ],
            "answer": "426eae3116e7913dad13f99a93318cdcaf419af49b75f8e53d3f88d5cf47e656"
        },
        {
            "question": "To help minimize service disruption during maintenance, which feature allows Compute Engine to move a running VM to a different host without rebooting?",
            "options": [
                "Live Migration",
                "Host Maintenance Policy",
                "Preemptible VM",
                "Automatic Restart"
            ],
            "answer": "bc173bf423b33e39d0f478639c28dd8871f658f70814ad758a2b54ffae05687e"
        },
        {
            "question": "What is a common best practice to reduce the Mean Time to Recovery (MTTR) for a Compute Engine application deployment?",
            "options": [
                "Manually restart the VM",
                "Use a Managed Instance Group with an Autohealing policy",
                "Increase the size of the VM's Persistent Disk",
                "Enable billing alerts"
            ],
            "answer": "89eafea2e23371ac2e9e7339f49a2bb945ba101257c9403565f60b73c1b07bbd"
        },
        {
            "question": "Which factor primarily determines the regionality of a Persistent Disk?",
            "options": [
                "The region of the associated load balancer",
                "The zone in which the disk is created",
                "The machine type of the VM",
                "The project's default region"
            ],
            "answer": "a000ad1d95ca7a9e97ffe6d4754ffaae8d12528c5f240e5c64177c226be9fb17"
        },
        {
            "question": "You need to find a specific log entry related to a user's action in the Google Cloud Console. What is the most effective way to filter logs in Cloud Logging?",
            "options": [
                "Filter by severity level",
                "Filter by resource type and payload fields",
                "Filter by project ID only",
                "Filter by BigQuery table name"
            ],
            "answer": "142793f0db23bb8dbdaca20b31e22f71e5422234d3797c140e971ada5a562f56"
        },
        {
            "question": "What is the recommended tool for managing a large fleet of Compute Engine VMs, including applying OS patches and configuration changes?",
            "options": [
                "OS Login",
                "VM Manager",
                "Cloud Shell",
                "Cloud Run"
            ],
            "answer": "5f1eea931482a7385647bcffb3fc1bc9e9b0ea75ef8ff7758bc789dc6ff868ab"
        },
        {
            "question": "You want to create a service account that can only read data from a specific Cloud Storage bucket named `my-data-bucket`. What is the recommended approach for granting this granular access?",
            "options": [
                "Grant the Storage Object Viewer role at the Project level.",
                "Grant the Storage Object Viewer role on the `my-data-bucket` resource.",
                "Grant the Project Editor role on the Project.",
                "Grant the Project Viewer role on the Project."
            ],
            "answer": "a32f7b5200bc7bbf53a737681922835aaa72a99d7c18936fcfc3e723a4f5c0b0"
        },
        {
            "question": "What is the key difference between a Primitive Role (e.g., Owner, Editor, Viewer) and a Predefined Role (e.g., Compute Instance Admin) in IAM?",
            "options": [
                "Primitive roles can only be applied to service accounts.",
                "Predefined roles provide more granular permissions tailored to a specific service.",
                "Primitive roles can be customized with specific permissions.",
                "Predefined roles only work at the Folder level."
            ],
            "answer": "1cd612ca979a5d271800dfc971fb3787cb5f81a703d1ba9951e179f1d9192811"
        },
        {
            "question": "You need to securely provide the credentials for a Compute Engine VM to interact with a Cloud Storage bucket. What is the most secure method?",
            "options": [
                "Storing an API key in the VM's metadata.",
                "Generating a static SSH key pair.",
                "Assigning a Service Account to the VM and granting the necessary IAM roles.",
                "Using the VM's default network tag."
            ],
            "answer": "e8c12fc88b0d7fd1c26643d8e78a5eea838ffece8cbb3ea80734e6967da82928"
        },
        {
            "question": "Which feature of a Compute Engine VM's boot disk ensures that the operating system has not been tampered with since the last boot?",
            "options": [
                "Automatic Restart",
                "Live Migration",
                "Shielded VMs (Integrity Monitoring)",
                "Persistent Disk Encryption"
            ],
            "answer": "1951aaa5c13e7b1aeadfad93b903a7f6144f6b07833e2e0fe6060224d5b3bd7e"
        },
        {
            "question": "Your security team requires that all data stored in Cloud Storage be encrypted using a key that your organization manages. Which encryption option should you choose?",
            "options": [
                "Google-managed encryption keys",
                "Customer-supplied encryption keys (CSEK)",
                "Customer-managed encryption keys (CMEK) using Cloud KMS",
                "Default encryption"
            ],
            "answer": "0ec1162976368f20213b3530588362b18924c920ca685d76b538cfbc29db64d7"
        },
        {
            "question": "What is the most effective way to prevent a running Compute Engine instance from being accidentally deleted?",
            "options": [
                "Apply a restrictive firewall rule.",
                "Enable Deletion Protection on the instance.",
                "Use a Preemptible VM.",
                "Grant the Project Viewer IAM role."
            ],
            "answer": "d1ba1291637c2ef2a1f86ca06a4bd7721b85b41c55552109135aa0e3eb275371"
        },
        {
            "question": "When using OS Login, what is used to map an IAM user to a Linux user account on a Compute Engine VM?",
            "options": [
                "SSH keys stored in the metadata",
                "The user's Google Identity",
                "A local user account database",
                "A service account key"
            ],
            "answer": "d712882c9afcaf27b0cbef2e8ce7289d12e4bc4d2b1340cb672b1045eb5cfe6f"
        },
        {
            "question": "A developer is writing an application on a local machine that needs to call a GCP API. What command should they use to authenticate their local environment for `gcloud` and application calls?",
            "options": [
                "gcloud auth login",
                "gcloud auth activate-service-account",
                "gcloud init",
                "gcloud compute ssh"
            ],
            "answer": "9c9f67ea39848293d3f485f64c08e9767854fef9054f6736d9f2835c266d37ca"
        },
        {
            "question": "What is the purpose of a Custom IAM Role?",
            "options": [
                "To define a set of permissions that exactly meets your organization's needs, often to implement the Principle of Least Privilege.",
                "To replace all Predefined Roles with a single, comprehensive role.",
                "To allow users to create new GCP services.",
                "To grant project-level Owner permissions without auditability."
            ],
            "answer": "c41b655d40b29c1db2f7d5560aa99f32d1737a04c027fabbaa16595937f48332"
        },
        {
            "question": "What is the correct way to allow incoming traffic only from your office's IP address (e.g., 203.0.113.1) to your web servers on port 80?",
            "options": [
                "Create an ingress firewall rule with target tag 'web-server', protocol 'tcp', port '80', and source IP range '203.0.113.1/32'.",
                "Create an egress firewall rule with target tag 'web-server', protocol 'tcp', port '80', and source IP range '203.0.113.1/32'.",
                "Create a Cloud NAT configuration for this IP.",
                "Use the default 'allow-all' firewall rule."
            ],
            "answer": "e82f3644d7e57cf0c20aca86f3ec80654b8d6972c79c48d1bb4f86848e8642c1"
        }
    ],
    "Professional Data Engineer": [
        {
            "question": "You need to build a data pipeline to ingest streaming data from IoT devices and perform real-time analytics. Which combination of services is most suitable?",
            "options": [
                "Cloud Storage and BigQuery Batch Load",
                "Pub/Sub, Dataflow, and BigQuery",
                "Cloud SQL and Dataproc",
                "Cloud Functions and Cloud Spanner"
            ],
            "answer": "e1dcdf4beb8edb882d70f16059e3d92f631460c52ab91a4922114d866d08538c"
        },
        {
            "question": "What is the primary use case for Cloud Bigtable?",
            "options": [
                "Storing transactional relational data",
                "Running interactive SQL queries on large datasets",
                "Serving large-scale, low-latency analytical and operational workloads",
                "Hosting a small-scale MySQL database"
            ],
            "answer": "1e20fcf9f45b18756c93c3d1d6593725d5c207fc86202f687632e19255528630"
        },
        {
            "question": "You need to store data that is accessed once a month. Which Storage Class is cheapest?",
            "options": [
                "Standard",
                "Nearline",
                "Coldline",
                "Archive"
            ],
            "answer": "fc8660328171147108994d0d1438a9095150579d5112abf8a4ae6bba47bc3b55"
        },
        {
            "question": "You are designing a schema for BigQuery. How should you handle a one-to-many relationship (e.g., Order -> Items) to optimize performance?",
            "options": [
                "Use normalized tables with joins",
                "Use nested and repeated fields",
                "Use a JSON string",
                "Use separate databases"
            ],
            "answer": "20cea1759ba1023b1fc92a8660eacd91b4c638afe296f8c4af35711e92728218"
        },
        {
            "question": "Which service is a fully managed, serverless data warehouse?",
            "options": [
                "BigQuery",
                "Cloud SQL",
                "Dataproc",
                "Spanner"
            ],
            "answer": "0871a590f805e5cdce7e4dd64a8d3890dd807addffc45615fdcddd0cfe68f0bd"
        },
        {
            "question": "You need to migrate a Hadoop cluster to GCP. Which service is the most direct replacement?",
            "options": [
                "Dataflow",
                "Dataproc",
                "BigQuery",
                "Composer"
            ],
            "answer": "ec4a2ac6a7d20c65418a00eeb66b16ae21d4f1a2c917b643ace66a23647f9946"
        },
        {
            "question": "Which component of Dataflow handles the autoscaling of workers?",
            "options": [
                "Streaming Engine / Dataflow Service",
                "The SDK",
                "The user code",
                "Compute Engine Autoscaler"
            ],
            "answer": "ab3840349777d160541a2c2f05ed122f78a83a0a46f0f7d13675f06ebd9f757a"
        },
        {
            "question": "You want to reduce BigQuery costs. What should you do first?",
            "options": [
                "Use SELECT *",
                "Partition and Cluster tables",
                "Delete old data manually",
                "Use streaming inserts"
            ],
            "answer": "c1c7458cebfe3c17466f236988cf062feab8acb0b6cf31168a654bd73341521e"
        },
        {
            "question": "What is the best way to visualize BigQuery data effectively without coding?",
            "options": [
                "Looker Studio",
                "Dataflow",
                "Dataprep",
                "Cloud Shell"
            ],
            "answer": "c670d440b091fe324981a541db7fab3a302d39e6eaebf9387da46c602f0b0831"
        },
        {
            "question": "You need to orchestrate a complex workflow involving BigQuery, Dataflow, and on-prem systems. Which tool is best?",
            "options": [
                "Cloud Composer (Airflow)",
                "Cloud Scheduler",
                "Cron",
                "Pub/Sub"
            ],
            "answer": "6281e2cc4b5cdc1f633d7645d6d4681c17aac8fec42a29888a133e07b2c5dc58"
        },
        {
            "question": "Which database service allows for strictly consistent, global transactions?",
            "options": [
                "Cloud Spanner",
                "Bigtable",
                "Firestore",
                "Cloud SQL"
            ],
            "answer": "e4cc4fd25783cd653fde98e4505141f96f77443f87021d08b1f681efa9cec31c"
        },
        {
            "question": "You have a large amount of unstructured data (images, videos). Where should you store it?",
            "options": [
                "Cloud Storage",
                "BigQuery",
                "Cloud SQL",
                "Datastore"
            ],
            "answer": "2ec3eb563477a32a38bc370562367c43da359e75341ad9684f6004e3c904becb"
        },
        {
            "question": "You need to mask PII data (e.g., SSNs) in your data pipeline before it reaches BigQuery. Which service can help?",
            "options": [
                "Cloud DLP (Data Loss Prevention)",
                "IAM",
                "VPC Flow Logs",
                "Secret Manager"
            ],
            "answer": "9fd2ad015a0e12fb22d7f4cda003101954c36a43d3cf4e85aa1eb7d5830b1b7c"
        },
        {
            "question": "What is a 'Sink' in Cloud Logging used for in a data context?",
            "options": [
                "To drain water",
                "To export logs to BigQuery, Storage, or Pub/Sub",
                "To delete logs",
                "To filter logs"
            ],
            "answer": "68517a483d80ad264a3763dcf2de0d06e3459408c98e4131023dbc1de6b03fea"
        },
        {
            "question": "You want to run Apache Spark jobs on a serverless platform. What is a valid option?",
            "options": [
                "Dataproc Serverless",
                "Cloud Functions",
                "App Engine",
                "Compute Engine"
            ],
            "answer": "808a8e6d05ad0d7f7b74015b874befebb1d38d37e3217dd13b220e76da18d3f4"
        },
        {
            "question": "Which BigQuery feature allows you to query data directly in Cloud Storage without loading it?",
            "options": [
                "External Tables (Federated Queries)",
                "Materialized Views",
                "Cached Queries",
                "Authorized Views"
            ],
            "answer": "456b312e8553474dc5fa17e499be3ea64e224e3589564d9c8dd1ea1526c20a1f"
        },
        {
            "question": "You need to ingest millions of events per second asynchronously. Which service acts as the buffer?",
            "options": [
                "Pub/Sub",
                "Dataflow",
                "BigQuery",
                "Cloud Storage"
            ],
            "answer": "6859e7b3318a3ee764967db6b1591621939c6b297de0afd19efcfb9bba25fffd"
        },
        {
            "question": "How does BigQuery store data internally?",
            "options": [
                "Columnar format (Capacitor)",
                "Row-oriented",
                "JSON",
                "XML"
            ],
            "answer": "a2199e488f53a43503ed9995c31522e26f1233949afb10cb5acb4bc97fb78856"
        },
        {
            "question": "You need to perform ETL on raw data to prepare it for ML. The logic is complex and requires windowing. Which tool?",
            "options": [
                "Dataflow (Apache Beam)",
                "Cloud SQL",
                "Cloud Storage",
                "Dataprep"
            ],
            "answer": "03c6e2d24bece24fad702edba1d7b5b71432ff97f2cc2a6c3093d69031ee0edd"
        },
        {
            "question": "What is the difference between 'Batch' and 'Streaming' in Dataflow?",
            "options": [
                "Batch processes bounded data; Streaming processes unbounded data",
                "Streaming is slower",
                "Batch is deprecated",
                "No difference"
            ],
            "answer": "737741f533d9010153afdb5bfc768f036aa4b0628ae21d74bce72d1c0a5e6a33"
        },
        {
            "question": "You have a requirement to keep data in a specific geographic region. What should you configure?",
            "options": [
                "Resource Location / Dataset Location",
                "IAM roles",
                "Network tags",
                "VPC"
            ],
            "answer": "4eec9c022581bc67408fdb7260764e83ba32adf99ae52bef648315a37930f3d1"
        },
        {
            "question": "Which service enables visual data cleaning and preparation?",
            "options": [
                "Dataprep by Trifacta",
                "Dataflow",
                "BigQuery",
                "Data Catalog"
            ],
            "answer": "6278789cb34cb22b163e2e9ddf3382ff700b6d226f56b586ce0d1e73d8dbbb0b"
        },
        {
            "question": "You need to discover and tag sensitive data across your organization's datasets. Which tool helps?",
            "options": [
                "Data Catalog / Dataplex",
                "Cloud Build",
                "Artifact Registry",
                "Source Repositories"
            ],
            "answer": "e1fcabcc220904ec3be109db0a92388c98d59bca926f538fdc124556245784eb"
        },
        {
            "question": "What is the primary key design consideration for Cloud Bigtable?",
            "options": [
                "Avoid hotspots (distribute writes)",
                "Use sequential IDs",
                "Use timestamp first",
                "Keep keys short only"
            ],
            "answer": "4f031c7c03a5338dee8972e3ef00bdf19e6f344a9264a36fdf7c57d2845496f0"
        },
        {
            "question": "You want to train a custom ML model using SQL in BigQuery. What do you use?",
            "options": [
                "BigQuery ML (BQML)",
                "Vertex AI Workbench",
                "TensorFlow",
                "Dataflow"
            ],
            "answer": "ed22c2b549de3b2b8a0f5cc5d497f42be2000254c77b824b907fcb75f7174ed9"
        },
        {
            "question": "Which technique improves query performance in BigQuery by grouping data with similar values?",
            "options": [
                "Clustering",
                "Partitioning",
                "Sharding",
                "Indexing"
            ],
            "answer": "5ea655fb5364a7de3141cddea528b0eedd7779c675ece71c7e5e41c4958dd643"
        },
        {
            "question": "You migrated an on-premise data warehouse to BigQuery. How do you verify data integrity?",
            "options": [
                "Checksums / Row counts / Aggregations comparison",
                "Visual inspection",
                "Waiting typically works",
                "Dataflow"
            ],
            "answer": "5f2f699a515205aeb378e674dc49d51cffabb70561da374427adda473a7b10d8"
        },
        {
            "question": "What is the default isolation level for BigQuery transactions?",
            "options": [
                "Snapshot Isolation",
                "Read Uncommitted",
                "Serializable",
                "Read Committed"
            ],
            "answer": "6c6e8ac088fd9e0e3a1ead7148154e407c5cb426be0d97a9d5ddb5161db609d7"
        },
        {
            "question": "You need to move 500 TB of data from an on-premise datacenter to Google Cloud efficiently. Bandwidth is low.",
            "options": [
                "Transfer Appliance",
                "gsutil",
                "Storage Transfer Service",
                "VPN"
            ],
            "answer": "e50061c1df4d2984259446cd0c17873fe82c5bedd08a6988592a245f508e4af9"
        },
        {
            "question": "Which tool allows you to perform real-time lookup of key-value pairs with low latency?",
            "options": [
                "Cloud Bigtable",
                "BigQuery",
                "Cloud Storage",
                "Dataflow"
            ],
            "answer": "5521a117cff57294d9c0d7e8898eea362b1eee7e3cac290d5d4e1e4b68606060"
        },
        {
            "question": "You need to update a BigQuery table with new data from a CSV file every day. What is the most cost-effective automation?",
            "options": [
                "Cloud Scheduler + Cloud Functions (or BigQuery Data Transfer Service)",
                "Running a VM 24/7",
                "Manual upload",
                "Dataflow streaming"
            ],
            "answer": "68fcce983ad7a6adc32995e80f0745869f55312cb3593b795bd05242de9ba3b2"
        },
        {
            "question": "What is the purpose of 'Authorized Views' in BigQuery?",
            "options": [
                "To give users access to query results without giving access to underlying tables",
                "To speed up queries",
                "To visualize data",
                "To delete data"
            ],
            "answer": "43a5f73cd0a740c42cb80957782d999773ff54130c4d1fd285c527f4929f4516"
        },
        {
            "question": "Which service is best for lifting and shifting existing Spark/Hadoop jobs?",
            "options": [
                "Dataproc",
                "Dataflow",
                "BigQuery",
                "Compute Engine"
            ],
            "answer": "ec4a2ac6a7d20c65418a00eeb66b16ae21d4f1a2c917b643ace66a23647f9946"
        },
        {
            "question": "You want to share a dataset in BigQuery with an external partner without copying data. What do you use?",
            "options": [
                "Analytics Hub / Authorized Views",
                "Export to CSV",
                "Give them the password",
                "Print it"
            ],
            "answer": "72d0ae139f6862c9e2c27305a5a8a795f673a13569b1ced84012fdf688663bbc"
        },
        {
            "question": "What happens to the data in a 'Temporary Table' in BigQuery?",
            "options": [
                "It persists for the session (24h) and then is deleted",
                "It is permanent",
                "It is public",
                "It is stored in RAM only"
            ],
            "answer": "6a05806fd808e768c51e9f55af4f5e16ed99af1fc5db6c287e2427c9a085b329"
        },
        {
            "question": "Which format is efficient for reading large datasets in Cloud Storage from Spark?",
            "options": [
                "Parquet / Avro",
                "CSV",
                "JSON",
                "XML"
            ],
            "answer": "2e75c53da8256c4a25a1f22efac0587718760d33b7508ce918b89b8cb90fe154"
        },
        {
            "question": "You need to monitor the quality of data landing in your data lake. What tool helps?",
            "options": [
                "Dataplex (Data Quality tasks)",
                "Cloud Monitoring",
                "Cloud Logging",
                "IAM"
            ],
            "answer": "c3af1d0f4ed5b3bd3079f8596bdd910198bb0b709e1b863f901110faf22e3d59"
        },
        {
            "question": "How can you ensure that a BigQuery query does not consume excessive costs?",
            "options": [
                "Set 'Maximum bytes billed' in query settings or use Custom Quotas",
                "Monitor manually",
                "Use SELECT *",
                "Disable caching"
            ],
            "answer": "98bec3d1267c92be63afd95d2433cec0d65a99cac7238dbf512732d498ead9b9"
        },
        {
            "question": "You need to replicate data from an Oracle database to BigQuery in real-time.",
            "options": [
                "Datastream",
                "Batch export",
                "App Engine",
                "Cloud Functions"
            ],
            "answer": "4000942f3fbf7954b399680ef031ea220f19724985a4c434c5d081cfd75e1e2f"
        },
        {
            "question": "What is the purpose of 'Slot' in BigQuery?",
            "options": [
                "A unit of computational capacity",
                "storage unit",
                "A network port",
                "A time window"
            ],
            "answer": "3a5ceeea67e3f2b022b8a82c1a6f009683cc41e79f6f77b96fef4e32cb1b9666"
        },
        {
            "question": "You need to process data exactly once. Which systems support this?",
            "options": [
                "Pub/Sub (with Dataflow)",
                "Cloud Storage",
                "Cloud Logging",
                "Cloud Monitoring"
            ],
            "answer": "a6fbaed8d3e31e8879e84994e8d493194d3a7b37956f434337602fef2b279e59"
        },
        {
            "question": "Which windowing type in Dataflow groups data based on arrival time?",
            "options": [
                "Processing time",
                "Event time",
                "Session window",
                "Sliding window"
            ],
            "answer": "35916be9ec0c7b6d4b6747dac0c8edf21f2e07f8d3fd0a72622f4ffa5c51d93b"
        },
        {
            "question": "You need to store timeseries data and perform complex aggregations. TimescaleDB is not an option.",
            "options": [
                "Bigtable",
                "Firestore",
                "Cloud Storage",
                "Datastore"
            ],
            "answer": "c2dee5be8d33128b3e27d4e6d5000dd751572ba0fab42e61dccb27266113e0ab"
        },
        {
            "question": "You want to automate the deletion of Cloud Storage objects older than 30 days.",
            "options": [
                "Lifecycle Management Policy",
                "Cloud Function",
                "Cron job on VM",
                "Manual delete"
            ],
            "answer": "4e99485867fa359c4062106941a642be171977081a17b1948c514701f0e7ed3c"
        },
        {
            "question": "What is the recommended file format for loading data into BigQuery for best performance?",
            "options": [
                "Avro",
                "CSV",
                "JSON",
                "Text"
            ],
            "answer": "08834878988d9b2dadb0718cefb6d805518ce8439396a7ece1e35228e7bb0360"
        },
        {
            "question": "You need to access a Cloud SQL database from a Dataflow pipeline securely.",
            "options": [
                "Use the Cloud SQL Auth Proxy or Private IP",
                "Public IP",
                "Open firewall 0.0.0.0/0",
                "Copy data to text"
            ],
            "answer": "cbda45c23d53a6177952c3aef967bf9c916da14b23f0daaa8190e4acc9d56574"
        },
        {
            "question": "Which BigQuery function helps approximate count of distinct values on huge datasets quickly?",
            "options": [
                "APPROX_COUNT_DISTINCT",
                "COUNT(DISTINCT)",
                "SUM",
                "AVG"
            ],
            "answer": "8e312a83fc95158c9f8aa210415e8d8823e94ea8ca84eb42c16da59f8a5ecdc8"
        },
        {
            "question": "You need to backfill historical data in a Dataflow pipeline. What parameter do you verify?",
            "options": [
                "Watermarks and late data handling",
                "Machine type",
                "Region",
                "Disk size"
            ],
            "answer": "3091837ddc23a6388b45ceab3d213ab756fdb3ceff23231271ced0503415fc1d"
        },
        {
            "question": "Which service offers a managed graph database experience?",
            "options": [
                "Spanner Graph",
                "Use Neo4j on GKE/Marketplace",
                "BigQuery",
                "Bigtable"
            ],
            "answer": "8c7dbb2f6f9eba61ee75f7e501fa24b058803f4dd63e28208299ca8c5c149068"
        },
        {
            "question": "You want to control who can view specific columns in a BigQuery table.",
            "options": [
                "Policy Tags (Column-level security)",
                "Dataset permissions",
                "Table permissions",
                "Row-level security"
            ],
            "answer": "414eb5de26ea01d69e1d408a13d62a61de504bd311dd6c7f823674a9f6dfb2e6"
        },
        {
            "question": "What is 'Data Mesh'?",
            "options": [
                "A decentralized data architecture",
                "A database engine",
                "A network cable",
                "A VPN"
            ],
            "answer": "51624b2a066dc0648db194e53e186be383fbd1a63a077314bd39b4a6634eeeb7"
        },
        {
            "question": "You are building a recommendation engine. Where should you store user profile features for low-latency retrieval?",
            "options": [
                "Bigtable / Firestore",
                "BigQuery",
                "Cloud Storage",
                "Dataflow"
            ],
            "answer": "9d8cb851e046184b7a8417b10625e3e69e638a5a59b5aad75cc6786dfa8a02e7"
        },
        {
            "question": "Which tool allows you to schedule SQL queries in BigQuery?",
            "options": [
                "Scheduled Queries",
                "Cron",
                "Cloud Build",
                "Dataproc"
            ],
            "answer": "97a9414b18d4d808df03cbd1b2ee994e445110e413686f351e36d06c3d6e96c0"
        },
        {
            "question": "You need to transform JSON data in Pub/Sub before storing in BigQuery.",
            "options": [
                "Dataflow",
                "BigTable",
                "Cloud SQL",
                "Cloud Storage"
            ],
            "answer": "1b81c3984347d7bf348913b2472cc0bca525766f3a47009dbfafc90ae4124c48"
        },
        {
            "question": "What is a 'Flex Template' in Dataflow?",
            "options": [
                "A template that enables you to package the pipeline as a Docker image",
                "A flexible pricing model",
                "A UI component",
                "A monitoring tool"
            ],
            "answer": "4ccc5affa4619d3d0f4e216a932ece500a685ceb068bdcf80d521de141881cd7"
        },
        {
            "question": "You need to create a materialized view in BigQuery. Why?",
            "options": [
                "To improve performance of common aggregation queries",
                "To save storage",
                "To encrypt data",
                "To validating data"
            ],
            "answer": "97004290721f1ecafe03c39c3f2c2b0bef66784fd7754c5c6cfecc5f0c29b4ea"
        },
        {
            "question": "Which service enables you to manage metadata for all your Google Cloud data assets?",
            "options": [
                "Data Catalog",
                "Cloud Logging",
                "Cloud Trace",
                "Source Repositories"
            ],
            "answer": "93b87997cb65d057b418867b25b1e09e3a53287b5ace53a6cb527dc4e661e878"
        },
        {
            "question": "You have a star schema. Should you flatten it for BigQuery?",
            "options": [
                "Ideally yes (denormalize), to utilize nested/repeated fields and columnar swiftness",
                "No, joins are faster",
                "No, keep it 3NF",
                "Yes, to saving space"
            ],
            "answer": "40368ca3ce8c778757c579943a4ecd64e050ac667b86768351f3b229e231bf9f"
        },
        {
            "question": "How do you handle late-arriving data in streaming Dataflow?",
            "options": [
                "Allowed Lateness & Triggers",
                "Drop it",
                "Retry indefinitely",
                "Pause pipeline"
            ],
            "answer": "fa820760097ce56fb3a017cc3db57229ab94ac3a7759281cb6b7feb66639cb22"
        },
        {
            "question": "You want to analyze logs in real-time. Which sink for Cloud Logging is best?",
            "options": [
                "Pub/Sub -> Dataflow",
                "Cloud Storage",
                "BigQuery (Batch)",
                "Cloud SQL"
            ],
            "answer": "bda816f77c694b525e34887d9367e7d31a5a9e408c05bd5eea50f0c4ed6958e7"
        },
        {
            "question": "Which IAM role is needed to function as a Dataflow worker?",
            "options": [
                "Dataflow Worker",
                "Editor",
                "Viewer",
                "Owner"
            ],
            "answer": "5fc4a9cbc4b5a67cb8c44265169c1a4ba95298154371874a8e37796e83bf1aac"
        },
        {
            "question": "You need to reduce data egress costs from BigQuery.",
            "options": [
                "Avoid downloading large results; analyze in cloud or use same-region compute",
                "Use VPN",
                "Compress data manually",
                "Use HTTP"
            ],
            "answer": "fe8f6472b5152c5c269c71e9edeffe240b05eaf30f001d5387297f5e5725541c"
        },
        {
            "question": "What is the best way to copy a BigQuery dataset to another region?",
            "options": [
                "BigQuery Data Transfer Service (Dataset Copy)",
                "Export/Import",
                "Streaming",
                "Replication"
            ],
            "answer": "714e663cce3eac73d3e30c7bf3d65bc8eca083c157ae7264c5a3114530bbbf09"
        },
        {
            "question": "Which service can identify PII in Cloud Storage buckets automatically?",
            "options": [
                "Sensitive Data Protection (Cloud DLP)",
                "Cloud Armor",
                "Security Command Center",
                "IAM"
            ],
            "answer": "05e8987a82131b2cba720a510b31a49da230c7e9a5fc147d6691ce55ee432e24"
        },
        {
            "question": "You need to store raw IoT telemetry for 10 years for compliance. Low cost is key.",
            "options": [
                "Cloud Storage Archive Class",
                "BigQuery",
                "Bigtable",
                "Spanner"
            ],
            "answer": "4f49bb7c6a35227f28727def31bd5faad306eabad7bcbc3f02874fd770d4a813"
        },
        {
            "question": "How do you update a streaming Dataflow pipeline?",
            "options": [
                "Launch a replacement job with --update option and same jobName",
                "Stop and Start",
                "Edit code on server",
                "Cannot update"
            ],
            "answer": "44074b56597eda818041949f74578de48e4312d45f05d3243e7260d844a54908"
        },
        {
            "question": "Which BigQuery table type queries an existing Google Sheet?",
            "options": [
                "Federated/External Table",
                "Native Table",
                "View",
                "Snapshot"
            ],
            "answer": "98795582310f6f47a79c5fe3ae0a4ed99979081df19aec35d33ce851bcef354a"
        },
        {
            "question": "You need to implement row-level security in BigQuery.",
            "options": [
                "Create a Row Access Policy",
                "Create Authorized Views with filters",
                "Encryption",
                "IAM conditions"
            ],
            "answer": "edea5736a7361432d9e9b65bf94f94500148e6665c8f2cb34984a3027142aebc"
        },
        {
            "question": "What is the usage of 'reservations' in BigQuery?",
            "options": [
                "To purchase dedicated slots (flat-rate pricing)",
                "To book a meeting",
                "To reserve storage",
                "To schedule queries"
            ],
            "answer": "ae2607969959f09ca06df45de68736517bdbb36e22935681fcf681a572118c06"
        },
        {
            "question": "You need to export a specific subset of BigQuery data to specific users.",
            "options": [
                "Export to GCS and share bucket, or Authorized View",
                "Email CSV",
                "Print",
                "Screenshot"
            ],
            "answer": "f25b42172ff3a4641563e19348949511cb16b0e52d5ee831b21247b45d738391"
        },
        {
            "question": "Which machine learning model types are supported by BQML?",
            "options": [
                "Linear Reg, Logistic Reg, K-means, Matrix Factorization, DNN, etc.",
                "Only Linear Reg",
                "Only K-means",
                "None"
            ],
            "answer": "ba1183a23450831a504d4477d12a36e298811a2e5eb13ad82c39850854aeae93"
        },
        {
            "question": "How do you ensure idempotency in a data pipeline?",
            "options": [
                "Use unique IDs and deduplication logic",
                "Run once",
                "Hope",
                "Restart always"
            ],
            "answer": "8bb603aacb4b3cb2855dd129e8474543d14afa660d13672af3ab228b5c08c041"
        },
        {
            "question": "You need to optimize storage cost for a table partitioned by date in BigQuery.",
            "options": [
                "Configure partition expiration",
                "Delete table",
                "Archive",
                "Compress"
            ],
            "answer": "14031de1635bdb8049b9c8269b293ccb935b8755cf465c6c566ea0f7916e4aaa"
        },
        {
            "question": "Which file format supports schema evolution best?",
            "options": [
                "Avro",
                "CSV",
                "JSON",
                "Text"
            ],
            "answer": "08834878988d9b2dadb0718cefb6d805518ce8439396a7ece1e35228e7bb0360"
        },
        {
            "question": "You want to create a dashboard that updates automatically as data arrives in BigQuery.",
            "options": [
                "Looker Studio with BigQuery connector",
                "Excel",
                "Powerpoint",
                "Screenshot"
            ],
            "answer": "81cf5cf7448eb7fabdc5cbd25f2aacf48d3ec92f1489541ad78159e01c62cd41"
        },
        {
            "question": "What is the benefit of 'Query dry run'?",
            "options": [
                "Estimates cost (bytes processed) without charging",
                "Runs query faster",
                "Validates logic only",
                "Deletes data"
            ],
            "answer": "829d1558907f8220d5671ddee003bcde57218b681cdc4338fe5f5d508ab785c0"
        },
        {
            "question": "Which service integrates best with Vertex AI Feature Store?",
            "options": [
                "BigQuery",
                "Local disk",
                "USB drive",
                "FTP"
            ],
            "answer": "0871a590f805e5cdce7e4dd64a8d3890dd807addffc45615fdcddd0cfe68f0bd"
        },
        {
            "question": "You have a MySQL database. Which tool enables real-time analytics on it without ETL?",
            "options": [
                "Cloud SQL Federated Queries (from BigQuery)",
                "Read Replica",
                "Backup",
                "Dump"
            ],
            "answer": "b10d59cb588888fddd507ebaefd7a51bb36291db2832ccc88f5b0a1c21079e56"
        },
        {
            "question": "You need to enforce a schema on a Pub/Sub topic.",
            "options": [
                "Pub/Sub Schema",
                "Dataflow validation",
                "Code validation",
                "Impossible"
            ],
            "answer": "4f3bc89bbc283165bec82aa6c3922441aa46ab7077e5622b093b5a8652d74ca2"
        },
        {
            "question": "What is the primary role of a Data Engineer?",
            "options": [
                "Designing and maintaining data systems",
                "fixing printers",
                "writing web apps",
                "selling cloud"
            ],
            "answer": "caa606997f2abfcd081a155349a6ddefcf961d4c17582157ce58e5075e8930d8"
        }
    ],
    "Google Workspace Administrator": [
        {
            "question": "A user reports they cannot access a shared drive. You have confirmed they are in the correct group with 'Content manager' access. What is the most likely reason they still can't access it?",
            "options": [
                "The shared drive has reached its storage limit.",
                "The user's Google Workspace license does not support shared drives.",
                "There is a conflicting file-level permission overriding the group permission.",
                "The organization has a data loss prevention (DLP) rule blocking access."
            ],
            "answer": "e44ec607d1d5baace4ebd3110d037f0dbf8c54d380f683f6551dd0617f11ada6"
        },
        {
            "question": "Which tool in the Admin console would you use to investigate a user's recent login activity and security events?",
            "options": [
                "Reports",
                "Audit and investigation",
                "Security dashboard",
                "Alert center"
            ],
            "answer": "8d726ace8418bd359e9d501d6beb894f986fa14539f7c9d34f1fa35e031f61f9"
        },
        {
            "question": "You need to ensure that all mobile devices accessing corporate data have a screen lock enabled. What should you configure?",
            "options": [
                "Context-Aware Access",
                "Advanced Mobile Management with a Password Policy",
                "Basic Mobile Management",
                "Google Vault"
            ],
            "answer": "5438ad2d69c5787ea4fcf838d8d83e80be2c2cb5e552bbd8214d165d90b3b44a"
        },
        {
            "question": "A user has left the organization. You need to transfer their Drive files to a manager before deleting the account. What should you do?",
            "options": [
                "Transfer ownership in the Admin Console during the deletion flow or separately",
                "Download files and upload to manager",
                "Share files with manager",
                "Use Google Vault"
            ],
            "answer": "77cd7ba7fab308e94d031dff4592599cdf711c5bf6f3874dded346f972baa53c"
        },
        {
            "question": "You want to synchronize your on-premise Active Directory users and groups to Google Workspace. Which tool is officially supported?",
            "options": [
                "Google Cloud Directory Sync (GCDS)",
                "Google Workspace Migrate",
                "Admin SDK",
                "CSV Upload"
            ],
            "answer": "da1e7117366c97c51a3c5fe7342e9794ef0d5eed2985640cd8f337fc39529aa2"
        },
        {
            "question": "Which Google Workspace edition is required to use 'Data Regions' to pin data to a specific geographic location?",
            "options": [
                "Business Starter",
                "Business Standard",
                "Enterprise Standard/Plus",
                "Essentials"
            ],
            "answer": "ef593d72f0221aacb53c90a2708b4ae6179597a09574b127dcc7727c452e8fec"
        },
        {
            "question": "You need to retain all emails for 10 years for legal compliance, even if users delete them.",
            "options": [
                "Google Vault Retention Policy",
                "Admin Console Email Settings",
                "Google Takeout",
                "Archive User"
            ],
            "answer": "d54fa4f07536e10c6f373d6d6f000d28271beba581bc86489f94dc3c280ec93d"
        },
        {
            "question": "A user is receiving too many spam emails. You want to add an external blocklist.",
            "options": [
                "Content Compliance rule",
                "Blocked Senders setting in Gmail settings",
                "Spam filter",
                "Phishing protection"
            ],
            "answer": "cd91af8405402a30985e6e9e6c81e7010d339df7666ad0750552dbf0c1f14334"
        },
        {
            "question": "You need to create a group that automatically includes all users in the organization.",
            "options": [
                "Dynamic Group (based on query)",
                "Organization-wide Group (All users)",
                "Mailing List",
                "Security Group"
            ],
            "answer": "aec4a049ffda4899e488bf05ba537d2aac94a3a6cc0c12524c99cb8dded5bee1"
        },
        {
            "question": "How do you prevent users from sharing sensitive documents with external domains?",
            "options": [
                "Drive Sharing settings (whitelist domains or disable external sharing)",
                "DLP Rule",
                "Context-Aware Access",
                "Vault"
            ],
            "answer": "a7c2d48843ce32cb1010f1bc6c044b71bbf58b632481edde0ff399c7373adbcf"
        },
        {
            "question": "You want to configure Single Sign-On (SSO) with a third-party Identity Provider (IdP).",
            "options": [
                "Security > Authentication > SSO with third party IdP",
                "Directory Sync",
                "LDAP",
                "OAuth"
            ],
            "answer": "730cd120d4c958e9096b2abcb1f3fb83da447971c315445e0bd31b7314f6e0a9"
        },
        {
            "question": "Which record must be added to your DNS to verify domain ownership during setup?",
            "options": [
                "TXT or CNAME record",
                "A record",
                "MX record",
                "SRV record"
            ],
            "answer": "36a6e1744bd2cf01bae34bd64174fee029033351e722c05f418430846bccc307"
        },
        {
            "question": "What is the purpose of the SPF record?",
            "options": [
                "To authorize sending mail servers and prevent spoofing",
                "To encrypt email",
                "To verify domain ownership",
                "To sign emails"
            ],
            "answer": "5849996a0368baa864490385480106bce5e53b17704e153687d20e640a20e1a8"
        },
        {
            "question": "You need to whitelist an internal application's IP address to send emails without authentication via SMTP relay.",
            "options": [
                "Gmail > Routing > SMTP Relay service settings",
                "Firewall",
                "VPC",
                "Groups"
            ],
            "answer": "c7f52c91e784818b380af0adeaf6e8bb468bef0eee4fb2d265cda5ab7e83c29b"
        },
        {
            "question": "How can you restrict access to Google Workspace apps based on user IP address?",
            "options": [
                "Context-Aware Access (Zero Trust)",
                "Network masks",
                "Firewall rules",
                "VPN"
            ],
            "answer": "95e5f14a91f0d36fa71866057e788c9c8e6ec4ccc115d4876176e1e3945a608a"
        },
        {
            "question": "A user lost their 2FA phone. How can you help them login?",
            "options": [
                "Generate backup codes or temporarily turn off 2SV for the user",
                "Reset password",
                "Delete account",
                "Call Google Support"
            ],
            "answer": "dab739d7bc5b10ac8a98a351c29635c7a8e20e06c37dc1369ab63c5cee15219c"
        },
        {
            "question": "You want to brand the login page with your company logo.",
            "options": [
                "Account Settings > Personalization",
                "Gmail Settings",
                "Cannot be done",
                "Theme settings"
            ],
            "answer": "5d397e7bcb9890315d1a766efa577bd2ea6427e5bb01b6bd6b7c3afce8ed94b8"
        },
        {
            "question": "Which tool allows you to perform a bulk update of user profile create via CSV?",
            "options": [
                "Bulk update users in Admin Console",
                "GCDS",
                "API",
                "Mobile App"
            ],
            "answer": "6aa74cef0ab47355e6c251f20117c1644ba9edcce9efffd47518ae69cbbcafca"
        },
        {
            "question": "You need to create a custom admin role that can only reset passwords for the 'Sales' OU.",
            "options": [
                "Create Custom Role with 'Reset Password' privilege and assign to admin limited to 'Sales' OU",
                "Super Admin",
                "Delegated Admin",
                "Groups Admin"
            ],
            "answer": "dcc7bbb638666173f7076b63b32d3106a75d20e91f93d804943ab6856075dae6"
        },
        {
            "question": "What is the maximum number of users you can add to a Google Group?",
            "options": [
                "Unlimited (but limits apply to emailing)",
                "100",
                "5000",
                "1 million"
            ],
            "answer": "ae08382e85187a73ca615ba043ea1cf49402cffc1a6bcaf107f847f9af49645c"
        },
        {
            "question": "How do you investigate a phishing email reported by multiple users?",
            "options": [
                "Investigation Tool (Security Center)",
                "Audit Logs",
                "Vault",
                "Reports"
            ],
            "answer": "627b20b63cfd7b3449e21b1e91aebc027a97c68a4a5998dd8faf42656d980219"
        },
        {
            "question": "You want to ensure that Chrome extensions are installed automatically on managed browsers.",
            "options": [
                "Chrome Browser Cloud Management > Apps & Extensions > Force enable",
                "GPO",
                "Registry",
                "Script"
            ],
            "answer": "aac88a980cb0e1ef1ff03b0b245a56fc9d1ce19462f5bbae6a52966d680fbf23"
        },
        {
            "question": "Which DNS record enables DKIM signing?",
            "options": [
                "TXT record",
                "MX record",
                "A record",
                "CNAME"
            ],
            "answer": "4e646f1d44dd4da8a3f9da906d5aca479824912a8b65f056afe00bdd8cceee94"
        },
        {
            "question": "You need to migrate email data from an Exchange Server to Google Workspace.",
            "options": [
                "Google Workspace Migrate (GWM) or Data Migration Service (DMS)",
                "GCDS",
                "Vault",
                "Takeout"
            ],
            "answer": "40e25f33611845901de8ce5958e4501e710cc55b494005a51e89ae498bf14134"
        },
        {
            "question": "What is 'Secure LDAP' used for?",
            "options": [
                "To allow LDAP-based apps and appliances to authenticate users against Google Cloud Directory",
                "To sync users",
                "To login to Windows",
                "To encrypt email"
            ],
            "answer": "4a76b5a6ad2f0da52782b078b708fdaf123b394c5edbb3064c5b4a6dfd8d0a6e"
        },
        {
            "question": "You want to prevent users from installing specific mobile apps on corporate devices.",
            "options": [
                "App allowlist/blocklist in Mobile Management",
                "Context Aware Access",
                "Vault",
                "Audit"
            ],
            "answer": "8e6e7ead763411aeaa78e8d00a982461a2277f17827542380634140634fb4185"
        },
        {
            "question": "Which setting controls if users can create shared drives?",
            "options": [
                "Apps > Drive and Docs > Sharing settings > Shared drive creation",
                "Groups",
                "License",
                "Vault"
            ],
            "answer": "ecd9ddabd735e9ebd61abad29b263a1e6cbc1686436e50adc41ab8e6c7db02f0"
        },
        {
            "question": "You need to recover a user's deleted Drive file. How many days do you have?",
            "options": [
                "25 days from Trash (or admin restore window)",
                "30 days",
                "Unlimited",
                "90 days"
            ],
            "answer": "c79702f6a599278626a6b2bd925909749ec8fe44135b9a1b57c447cac61c9556"
        },
        {
            "question": "What is 'Client-side encryption' in Workspace?",
            "options": [
                "Encryption keys are managed by the customer, Google cannot access data",
                "TLS",
                "SSL",
                "VPN"
            ],
            "answer": "fee70aaba73ae52beea079260da431af572ddd064d3c2e751788933ac8a94f42"
        },
        {
            "question": "You want to set up a 'walled garden' where users can only email internal domains.",
            "options": [
                "Restrict delivery setting (Compliance rule)",
                "Group settings",
                "SPF",
                "DKIM"
            ],
            "answer": "c0d86063a0d7d2a5369e97e32fdc0a24e9bf2d9b572c098dd6df8a70ea410504"
        },
        {
            "question": "How do you enable 'Offline Mode' for Gmail for all users?",
            "options": [
                "Apps > Workspace > Gmail > User settings > Enable Gmail offline",
                "Individual user setting",
                "Chrome policy",
                "Device policy"
            ],
            "answer": "13ac6b4d155e18a6d52bd6dbfaa46614f9e98258f7f3cd777b5ffb55d277d0ff"
        },
        {
            "question": "You need to check how much storage a specific user is consuming.",
            "options": [
                "User list in Admin Console",
                "Billing",
                "Reports > Aggregate",
                "Vault"
            ],
            "answer": "712960ad4e3a2e3ab5e68a83d16485125dc95e1414c2b0666d653c26c4ef9985"
        },
        {
            "question": "Which report shows external sharing exposure?",
            "options": [
                "Data exposure report / Security Dashboard",
                "Login audit",
                "Admin audit",
                "Token audit"
            ],
            "answer": "9a610995c6c8d08175837c8e2ad2257737b98bda31103ebcf3e0c4f015261fce"
        },
        {
            "question": "You need to configure a catch-all address for misspelled emails.",
            "options": [
                "Gmail > Routing > Default routing (Catch-all)",
                "Groups",
                "Alias",
                "Forwarding"
            ],
            "answer": "2f80db3433886beb8f0940ba95a2714592b1589d0761d403c3f8ecb20268cd78"
        },
        {
            "question": "A user is suspended for 'spamming'. How do you reactivate them?",
            "options": [
                "Restore user in Admin Console (requires resolving issue)",
                "Reset password",
                "Delete account",
                "Wait 24h"
            ],
            "answer": "4767e3603a1a4fb0d7acab4d6b87f8e1e1744d9b156b1b7464fdb3cc90bc1719"
        },
        {
            "question": "You want to deploy a Wi-Fi configuration to managed Android devices.",
            "options": [
                "Devices > Networks > Wi-Fi",
                "Email password",
                "Manual setup",
                "Chrome policy"
            ],
            "answer": "e4704d464cc4bf872461b71e6b020baebc688b5102d8db11442ffdc990338ea7"
        },
        {
            "question": "What is the purpose of 'Target audiences'?",
            "options": [
                "To recommend content/files to specific groups of users in Drive/Docs",
                "To send marketing emails",
                "To limit access",
                "To audit"
            ],
            "answer": "0874fee426345a9cd8c673e08ed2184e28bbd4bb2665331741fda43d9e3fe8df"
        },
        {
            "question": "You need to conduct an eDiscovery search for a lawsuit.",
            "options": [
                "Google Vault > Matters",
                "Admin Console search",
                "Drive search",
                "Gmail search"
            ],
            "answer": "24d4d0a914fd66b1d8fb8abb3f0916c2c566b90774d0d167b1233bfae03ee2cb"
        },
        {
            "question": "Which setting forces users to change their password on next login?",
            "options": [
                "UserInfo > Reset Password > 'Ask for a password change at the next sign-in'",
                "Security settings",
                "Group settings",
                "GPO"
            ],
            "answer": "f981cd7451f01186ae703b82df44f9b4a59f813a3f87680ae505b334bf449c14"
        },
        {
            "question": "You want to use your own S/MIME certificates for email encryption.",
            "options": [
                "Gmail > User settings > S/MIME",
                "Vault",
                "DLP",
                "Compliance"
            ],
            "answer": "e1527c2cdf40115371e68332cb75afcb12feafe8bd7c1c72250c2b9dbdee5284"
        },
        {
            "question": "How do you manage Windows 10 devices with Google Workspace?",
            "options": [
                "Google Credential Provider for Windows (GCPW)",
                "Active Directory only",
                "Cannot be done",
                "ChromeOS"
            ],
            "answer": "69bcd9bed26c6f9de8ad6ab7c9c2e1598bbfceb2c9b4e8b80ec528ac2478fa3f"
        },
        {
            "question": "A suspended user's data will be deleted after how long?",
            "options": [
                "It is not deleted automatically until the admin deletes the account",
                "30 days",
                "1 year",
                "24 hours"
            ],
            "answer": "510c53d38ec3b27fecfba1064be6489d3caf1ca7b13ee2f0d3a62f8f59068133"
        },
        {
            "question": "You need to create a resource calendar for a conference room.",
            "options": [
                "Directory > Buildings and resources",
                "Calendar settings",
                "User calendar",
                "Group calendar"
            ],
            "answer": "43d2c425b180e86fa70a92fdb20cce83b14534a05e4dff146c7b4a84641c1812"
        },
        {
            "question": "What functionality does 'Endpoint Verification' provide?",
            "options": [
                "Collects inventory info of desktop devices accessing corporate data",
                "Antivirus",
                "VPN",
                "Firewall"
            ],
            "answer": "5143518e6df812904c398e329b1b51c19b0048a2c4c168576f79de3f6d96580b"
        },
        {
            "question": "How do you prevent users from creating public Google Sites?",
            "options": [
                "Sites > Sharing settings > Uncheck 'Allow users to publish Sites to the web'",
                "Disable Sites",
                "DLP",
                "Vault"
            ],
            "answer": "ae8710cf6d0ae79c393dcc0b55e339431b7b6beac7947ff17b8aca1373459df6"
        },
        {
            "question": "You want to configure a footer (legal disclaimer) for all outgoing emails.",
            "options": [
                "Gmail > Compliance > Append footer",
                "Signature",
                "Routing",
                "Theme"
            ],
            "answer": "095b729ce7f9819b3328d3dd208689e87054aeb742125a00382ef1c5f74f3824"
        },
        {
            "question": "Which privileges are required to create a new user?",
            "options": [
                "User Management Admin (or Super Admin)",
                "Help Desk",
                "Services Admin",
                "Report Admin"
            ],
            "answer": "358045267e0d544caca96b21e01578eb52b305331322969e00559dded78c7dde"
        },
        {
            "question": "You need to sync Calendar data with Outlook users.",
            "options": [
                "Google Calendar Interop",
                "GCDS",
                "CSV import",
                "Cannot be done"
            ],
            "answer": "a9b99f87786b60895fd12789691d6d77c7394ae78a323f0aab16bc9e8ab993a1"
        },
        {
            "question": "What is the result of 'Wiping' a device?",
            "options": [
                "Factory reset (if fully managed) or removing work data (account-only wipe)",
                "Locks device",
                "Deletes user",
                "Resets password"
            ],
            "answer": "7aefef83148a27bf8e8e17adec3b574cb2a19f6b0612a00a754ba0c6dcbb0721"
        },
        {
            "question": "You want to restrict which Google accounts can sign in to the Chrome browser on corporate devices.",
            "options": [
                "Chrome > User & Browser Settings > Sign-in restriction pattern",
                "Device settings",
                "Network firewall",
                "DNS"
            ],
            "answer": "e2c56ba08cf2b1a57c4ef5b363091042c6780773f7f9d23d902fac2c1858592f"
        },
        {
            "question": "Where do you manage billing and licenses?",
            "options": [
                "Billing > Subscriptions",
                "Dashboard",
                "Users",
                "Reports"
            ],
            "answer": "e0e4ad6ee0d06a0997421e9646dc3684d53c198e53e4056ecff1104af7f80c34"
        },
        {
            "question": "How can you bypass a blocked sender/spam filter for a specific partner domain?",
            "options": [
                "Add domain to an allowlist in Spam settings",
                "Disable spam filter",
                "Create a group",
                "Add to contacts"
            ],
            "answer": "9def0f0073cb093aeec68b821e9d3fa3fd089341f3179140a9e48c8c65c222bd"
        },
        {
            "question": "You need to grant an admin access to view all user's emails for auditing.",
            "options": [
                "Use Vault (Accessing directly is not standard admin privilege)",
                "Reset password",
                "Delegate access",
                "Super Admin"
            ],
            "answer": "da6233a6132bf07e8d97b6c490166087434af7c8b515de05afa2b9c3ea6197c2"
        },
        {
            "question": "What is 'Groups for Business' setting?",
            "options": [
                "Enables the user-facing Groups interface (groups.google.com)",
                "Admin groups",
                "Security groups",
                "API"
            ],
            "answer": "457170d688573eba0de65132562bf95ea38ac09de32f2628def70870b055762a"
        },
        {
            "question": "You want to prevent super admins from being locked out by Context-Aware Access policies.",
            "options": [
                "Best practice: exclude a break-glass account or ensure policy logic allows specific network/device",
                "Cannot prevent",
                "Disable CAA",
                "Use VPN"
            ],
            "answer": "4aa6579176139ad8efc99afc86becbfd318b8130c29727e2f9e2c88f490f7e9f"
        },
        {
            "question": "Which feature prevents spoofing of your domain?",
            "options": [
                "DMARC (with SPF/DKIM)",
                "TLS",
                "SSL",
                "HTTPS"
            ],
            "answer": "00a75f270b4f081461cbf9391bd0716cac1b567a753331675f855c309ab15cc9"
        },
        {
            "question": "Use need to transfer a user's calendar events to another user.",
            "options": [
                "Unsuspend user -> Transfer data (Calendar)",
                "Export/Import",
                "Share calendar",
                "Vault"
            ],
            "answer": "e43e2a746483d7482c4f94aacf1669c144f537db9ea330923a8f96942d08ddf1"
        },
        {
            "question": "What is the max attachment size in Gmail?",
            "options": [
                "25 MB",
                "10 MB",
                "50 MB",
                "100 MB"
            ],
            "answer": "4bb276352c81407081937846ae3424ac3cc443af1a2d8cd12d9c43647845f8e4"
        },
        {
            "question": "You want to allow users to use 'Sign in with Google' on third-party sites but control which apps.",
            "options": [
                "API Controls > Manage Third-Party App Access",
                "Disable SSO",
                "Block all apps",
                "Firewall"
            ],
            "answer": "e138fcf6fadc0e1f897cbd53c82291f73e40019ce03b8b940cfe1767837a7391"
        },
        {
            "question": "How do you enable 'confidential mode' for outgoing emails?",
            "options": [
                "Gmail > User settings > Confidential mode",
                "Compliance rule",
                "DLP",
                "Vault"
            ],
            "answer": "7e2c0fb556a14f4b79ddbde1761a401cdb7765fe66318238b1591806ad48de03"
        },
        {
            "question": "You need to see if a user is using 2-Step Verification.",
            "options": [
                "Users list > Security column or User details > Security",
                "Ask them",
                "Vault",
                "Billing"
            ],
            "answer": "b020c8db0e6349dd3445d5b3652d00b797114db729a60dfb267a8d6d4b27f19a"
        },
        {
            "question": "What is 'Directory' visibility?",
            "options": [
                "Controls which users/groups are visible in the global address list (autocomplete)",
                "Admin access",
                "Public access",
                "External sharing"
            ],
            "answer": "795f82c2ae7881a947ddd86ff259d774dc5bb2847fff9615fbc2376dfe2c8752"
        },
        {
            "question": "You want to restrict video calling in Google Chat.",
            "options": [
                "Apps > Google Chat > Settings",
                "Disable Camera",
                "Firewall",
                "Vault"
            ],
            "answer": "3c8d22e9e0a4183452ded12fc402431f17e65d4459a8cea4d9679928e0fc2cac"
        },
        {
            "question": "Which setting allows users to grant specific access to their Gmail mailbox to an assistant?",
            "options": [
                "Mail delegation",
                "Sharing",
                "Forwarding",
                "Group"
            ],
            "answer": "0c86d7ce6691bcf6186e4ac27d4df5f03853ecc1d40a60283fd53082884c1f90"
        },
        {
            "question": "You need to manage Apple iOS devices (ABM).",
            "options": [
                "Set up Apple Business Manager integration in Mobile Management",
                "Cannot be done",
                "Use manual profiles",
                "Use iTunes"
            ],
            "answer": "281e93540f87852a79fa4a2f2f46fe2bcbbdf62cb4baa0baec98ea01733d21ef"
        },
        {
            "question": "What happens if a user's license is removed?",
            "options": [
                "Services are suspended, data is retained for a grace period but inaccessible",
                "Data is deleted immediately",
                "User is deleted",
                "Nothing"
            ],
            "answer": "f3be46f94ec0f2ca939e3f3a6dea6357a2530c532f9d50c09782d510723c3651"
        },
        {
            "question": "How do you enforce a specific homepage in Chrome?",
            "options": [
                "Chrome > Managed Browsers > Startup pages",
                "GPO",
                "User setting",
                "DNS"
            ],
            "answer": "66114b8b200469c0a446800f0cdc249e0cf15dc56c47540bace7736d3c188e4d"
        },
        {
            "question": "You want to stop users from creating Google Classrooms.",
            "options": [
                "Education > Classroom > General settings > Teacher permissions",
                "Disable Classroom app",
                "Vault",
                "Groups"
            ],
            "answer": "17de4c7c2bf9c7c3e20baa06a25976ce2103409a2275b261bde5315746b27eb3"
        },
        {
            "question": "A user needs to send an email as a group address.",
            "options": [
                "Add group as an alias in Gmail 'Send mail as' settings (requires 'Post as group' permission)",
                "Login as group",
                "Delegate",
                "Forward"
            ],
            "answer": "86b5b756139587fe128617829fdc4ec210d1b5af7d504fc070f0b1022f9eeef0"
        },
        {
            "question": "You need to check the status of Google Workspace services.",
            "options": [
                "Google Workspace Status Dashboard",
                "Admin Console",
                "Twitter",
                "News"
            ],
            "answer": "b58f3abadf213c0f6b4ee4cc57f84fc86bd69909ba99b6ce2049241cb3f9ab7c"
        }
    ],
    "Professional Cloud Database Engineer": [
        {
            "question": "Which Google Cloud database service is best suited for a globally distributed, transactional workload requiring strong consistency and horizontal scalability?",
            "options": [
                "Cloud SQL (PostgreSQL)",
                "Cloud Bigtable",
                "Firestore",
                "Cloud Spanner"
            ],
            "answer": "e4cc4fd25783cd653fde98e4505141f96f77443f87021d08b1f681efa9cec31c"
        },
        {
            "question": "A company needs a fully managed PostgreSQL-compatible database with high availability and automated patching. Which service should they choose?",
            "options": [
                "Compute Engine with self-managed PostgreSQL",
                "Cloud SQL for PostgreSQL",
                "Cloud Bigtable",
                "Cloud Spanner"
            ],
            "answer": "d884f2b20cf942e5a49536ec6581012f550440542ba4b6258166fec421f23210"
        },
        {
            "question": "What is the primary goal of migrating a monolithic on-premise relational database to a sharded, scalable cloud solution like Cloud Spanner?",
            "options": [
                "To reduce networking latency",
                "To achieve high throughput and strong consistency at global scale",
                "To simplify backup procedures",
                "To use an open-source database engine"
            ],
            "answer": "17a590220d02f7106e4cd41c0346bf0f85481cb3c03147475767391274a60939"
        },
        {
            "question": "You need to store timeseries data with high write throughput. Which database is optimal?",
            "options": [
                "Cloud SQL",
                "Cloud Bigtable",
                "Firestore",
                "BigQuery"
            ],
            "answer": "5521a117cff57294d9c0d7e8898eea362b1eee7e3cac290d5d4e1e4b68606060"
        },
        {
            "question": "What is the recommended way to encrypt data in transit to Cloud SQL?",
            "options": [
                "SSL/TLS",
                "IPsec VPN",
                "SSH Tunnel",
                "Telnet"
            ],
            "answer": "0fb512e0efc5f0b1a1f38300dbfd36495820fffeee6eb93386a5c1de2480efb8"
        },
        {
            "question": "You need to migrate an Oracle database to GCP with minimal downtime. Which tool should you use?",
            "options": [
                "Database Migration Service",
                "BigQuery Data Transfer Service",
                "Storage Transfer Service",
                "Migrate for Compute Engine"
            ],
            "answer": "32d7fb6228655419b254a971dd49cb81d06fde2cf97621d94e03b5db38e051ca"
        },
        {
            "question": "Which Cloud SQL feature allows you to scale reads?",
            "options": [
                "Failover Replica",
                "Read Replica",
                "High Availability",
                "Vertical Scaling"
            ],
            "answer": "f6eab1d2ded3e82511772f2f9296e86e0bddd59f8188d3218cc0ea8b572bd6d0"
        },
        {
            "question": "What is the maximum storage capacity for a Cloud SQL for PostgreSQL instance?",
            "options": [
                "30 TB",
                "64 TB",
                "10 TB",
                "100 GB"
            ],
            "answer": "9127e5f3dcc93611e9bd68d6a763f74ec0d24eb7977d0c7c3cbb42f6ca591b2a"
        },
        {
            "question": "Which consistency model does Cloud Spanner use?",
            "options": [
                "Eventual Consistency",
                "Strong Consistency (External Consistency)",
                "Causal Consistency",
                "Read-your-writes"
            ],
            "answer": "22fab6e1ccf96eb8f8c1bfba7e842de97dfb0f4971bad1a506760d9e0d481864"
        },
        {
            "question": "You need to store JSON documents and require real-time synchronization to mobile devices. Which DB?",
            "options": [
                "Firestore",
                "Cloud SQL",
                "Cloud Spanner",
                "Bigtable"
            ],
            "answer": "074a14c7fc69187abf355ac7ac31e80c6d4fe098c5e6bda7637a17c17ea0ee94"
        },
        {
            "question": "How does Cloud Bigtable handle hot spots?",
            "options": [
                "Key Visualizer",
                "Automatic Sharding",
                "Manual Rebalancing",
                "It doesn't"
            ],
            "answer": "ecda2233e4ef454368d5bd0cbaba28d38bca9dc514e306e47215b33dfed3b554"
        },
        {
            "question": "What is the ideal row key design for Bigtable to avoid hotspots?",
            "options": [
                "Sequential IDs",
                "Timestamps",
                "Reverse domain names or hashed keys",
                "Random strings"
            ],
            "answer": "56e18439c01bd6e5832f16f533e9a989533170df18ba83c03d52ca859dba1d66"
        },
        {
            "question": "You need to run a Redis cluster. Which service is fully managed?",
            "options": [
                "Memorystore",
                "Cloud SQL",
                "Bigtable",
                "Spanner"
            ],
            "answer": "dc549ce452c397de3aaa8a2e60caeb343c19c633f1a25a5cca6605ff8a86ee94"
        },
        {
            "question": "Which database service allows you to query data in Cloud Storage directly using SQL?",
            "options": [
                "BigQuery (External Tables)",
                "Cloud SQL",
                "Firestore",
                "Spanner"
            ],
            "answer": "61e6fa9b0f9f61b49ffe17c3c35bf9e2521ac94cf869bbc04b5841e33fbfa321"
        },
        {
            "question": "You need point-in-time recovery for your database. Which service supports this out of the box?",
            "options": [
                "Cloud SQL",
                "Memorystore",
                "BigQuery",
                "Local SSD"
            ],
            "answer": "1097c59b4b0a48e7bcad9fa9a6c128ceaa3031242f2ca73f0931601f28152f76"
        },
        {
            "question": "What is the primary use of Datastream?",
            "options": [
                "Serverless Change Data Capture (CDC) and replication",
                "Batch processing",
                "Data visualization",
                "Query optimization"
            ],
            "answer": "1d40799b937a47d571afe070f84676be5059d23c2dba704dc26017594f381d8f"
        },
        {
            "question": "You have a MySQL database on-premise. You want a managed replacement. What is the best lift-and-shift target?",
            "options": [
                "Cloud SQL for MySQL",
                "BigQuery",
                "Firestore",
                "Spanner"
            ],
            "answer": "71a1335ed6df3c810dd27103e1494be2613e21564018da9f4bdb95564d169390"
        },
        {
            "question": "Which SQL dialect does Cloud Spanner support?",
            "options": [
                "Google Standard SQL & PostgreSQL",
                "T-SQL",
                "PL/SQL",
                "Cypher"
            ],
            "answer": "02c9108ed3e3af5412064c27dee969e574f1efb408c600dc5889e062f523a8c0"
        },
        {
            "question": "You need to perform ACID transactions across multiple documents in Firestore. Is this supported?",
            "options": [
                "Yes",
                "No",
                "Only in Datastore mode",
                "Only for single documents"
            ],
            "answer": "85a39ab345d672ff8ca9b9c6876f3adcacf45ee7c1e2dbd2408fd338bd55e07e"
        },
        {
            "question": "What is the default isolation level in Cloud SQL for PostgreSQL?",
            "options": [
                "Read Committed",
                "Serializable",
                "Repeatable Read",
                "Read Uncommitted"
            ],
            "answer": "d2f8c19496915e52cd6f5b3e8c8a3882ab6e5eefb997be2550ac3a3d3caf83e2"
        },
        {
            "question": "You are designing a schema for Spanner. What is a key best practice for primary keys?",
            "options": [
                "Use monotonically increasing integers",
                "Use UUIDv4 (random)",
                "Use timestamps",
                "Use nulls"
            ],
            "answer": "4e8e35d69ac9a83838dc83955901c32a5d4bcc779e456feca910032691c8fe41"
        },
        {
            "question": "Which tool helps assess the compatibility of your Oracle database with Cloud SQL for PostgreSQL?",
            "options": [
                "Database Migration Assessment Tool",
                "Cloud Shell",
                "gcloud sql check",
                "Ora2Pg"
            ],
            "answer": "cf85a7756f63fa4dcf3fdd663dc0b2dbe70c289364f8324f8647b59b0b3cddbe"
        },
        {
            "question": "You need to optimize a slow query in Cloud SQL. What tool should you use?",
            "options": [
                "Query Insights",
                "Cloud Trace",
                "Cloud Profiler",
                "Cloud Debugger"
            ],
            "answer": "4299ba9ac30ea843899ea01cc2f61689b9444e18b5869236c8c4a06e2e9d5469"
        },
        {
            "question": "How do you achieve cross-region high availability for Cloud SQL?",
            "options": [
                "It is not supported",
                "Create a read replica in another region and promote it manually/automatically",
                "It is automatic",
                "Use a multi-master setup"
            ],
            "answer": "98d1fe0585698ec1f686eb24ebbc00cffb97c9de56b82640ddc300667b0ebe8a"
        },
        {
            "question": "Which caching strategy is best for read-heavy workloads with infrequent updates?",
            "options": [
                "Write-through",
                "Look-aside (Lazy loading)",
                "Write-back",
                "Refresh-ahead"
            ],
            "answer": "2e05049bb41f0f8b775bfb1ccff76d2a2a3ad3cd44e08b8c8d0b5ac7f58e5dbb"
        },
        {
            "question": "You want to reduce the cost of Cloud SQL instances during development hours (nights/weekends). What can you do?",
            "options": [
                "Stop the instance",
                "Delete the instance",
                "Change machine type to shared core",
                "Use preemptible instances (not supported)"
            ],
            "answer": "22b794ffe84e82f2e2827e85ffc87a4b0c71ca6cab765b7a19d220a88bb098e8"
        },
        {
            "question": "What is the storage limit for Firestore in Native mode?",
            "options": [
                "1 TB",
                "Unlimited (scales automatically)",
                "10 GB",
                "100 TB"
            ],
            "answer": "086c5022419e5f4cbacdc7a118047a8d3585ed0c777cf1a319ead72e1e6b8d93"
        },
        {
            "question": "You need to export data from Cloud SQL to BigQuery. What is the most direct method?",
            "options": [
                "Export to CSV in Cloud Storage, then load to BigQuery",
                "Direct federation",
                "Datastream",
                "Pub/Sub"
            ],
            "answer": "010a19c12ed48cdf2969e4cd2c0a6900c57bcaded9f96885b43acc37f83fbf0c"
        },
        {
            "question": "Which database is a wide-column store?",
            "options": [
                "Bigtable",
                "Cloud SQL",
                "Spanner",
                "Firestore"
            ],
            "answer": "c2dee5be8d33128b3e27d4e6d5000dd751572ba0fab42e61dccb27266113e0ab"
        },
        {
            "question": "What is a 'Interleaved Table' in Spanner?",
            "options": [
                "A table physically co-located with its parent table rows",
                "A table in a different region",
                "A temporary table",
                "A virtual table"
            ],
            "answer": "ab8a700612c40ede01f5b10ec77e54ecf0bb6ce3926907c33d1989e5513bb805"
        },
        {
            "question": "You need to secure Cloud SQL connectivity from a GKE cluster. What is the recommended method?",
            "options": [
                "Cloud SQL Auth Proxy (sidecar)",
                "Public IP",
                "Whitelist Node IPs",
                "SSH Tunnel"
            ],
            "answer": "215fc3405c0a9eabe581c51c62cd6ac389366e4439d8227aca3245e6941af7e8"
        },
        {
            "question": "Which service is best for storing user session data?",
            "options": [
                "Memorystore for Redis",
                "BigQuery",
                "Cloud Storage",
                "Bigtable"
            ],
            "answer": "22ac903eec190fc9fc69b177b5d2e9bd43f4a8fe44546de77170aa57b6ab4c10"
        },
        {
            "question": "You need to audit all administrative actions on your Cloud SQL instance. Where do you look?",
            "options": [
                "Cloud Audit Logs (Admin Activity)",
                "VPC Flow Logs",
                "Error Logs",
                "Slow Query Logs"
            ],
            "answer": "bb6bd9cd716225709a2fb0126b28456fcfd33ae59cf0dff48d818c7574241661"
        },
        {
            "question": "What is the maximum number of read replicas for a Cloud SQL instance?",
            "options": [
                "5",
                "10",
                "Unlimited",
                "20"
            ],
            "answer": "4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5"
        },
        {
            "question": "You want to restrict Cloud SQL access to a specific VPC without using public IPs. What feature do you use?",
            "options": [
                "Private Service Access",
                "VPC Peering",
                "Cloud VPN",
                "Firewall Rules"
            ],
            "answer": "4955b3fb7d8e937dd3ab2e7d338bb2ab031b3ee5f1603ffebeaeabdd5683bf85"
        },
        {
            "question": "Which Spanner feature allows you to specify the geographic placement of data at the row level?",
            "options": [
                "Geo-partitioning",
                "Placement Policy",
                "Zone Awareness",
                "Region Tagging"
            ],
            "answer": "842b15d8638e5ba8168b35257807a00b152d603dcde189f5f2d50fb4d3a33c3e"
        },
        {
            "question": "How do you backup a Firestore database?",
            "options": [
                "gcloud firestore export",
                "Automatic snapshots",
                "Copy file",
                "SQL Dump"
            ],
            "answer": "27d2b2c87e570497dfdfeceac9054665808bffd3929d5e9ae5d7dc18836c759b"
        },
        {
            "question": "What happens to the Failover Replica when a Cloud SQL instance fails over?",
            "options": [
                "It becomes the Primary instance",
                "It remains a replica",
                "It is deleted",
                "It restarts"
            ],
            "answer": "a3758ace837716581442a5a80780aa78d43c117e3d8329fa682f3b209b679b20"
        },
        {
            "question": "You need to store graph data. Which service can execute graph queries?",
            "options": [
                "No native Graph DB, use Spanner Graph or 3rd party",
                "Cloud SQL",
                "Bigtable",
                "Firestore"
            ],
            "answer": "5205aa87bd8c98c8f89cc3ddb2ae8edd3d64b4d57dfaf3df0970f28e1c843140"
        },
        {
            "question": "What is the maintenance window in Cloud SQL?",
            "options": [
                "A designated time for system updates/patches",
                "Downtime time",
                "Backup time",
                "Scaling time"
            ],
            "answer": "dc7ab77905120235c0ceb7113c8bfb8a4eebbb6bd4a274d7f33cc0f36042d73b"
        },
        {
            "question": "Which metric best indicates CPU saturation in Cloud SQL?",
            "options": [
                "CPU Utilization",
                "Disk I/O",
                "Memory Usage",
                "Connection Count"
            ],
            "answer": "a87cac97f749709e5b284dad0186c6b6c896f8951c2331c4739b8729d1b3dc5a"
        },
        {
            "question": "You need to import a 500GB SQL dump into Cloud SQL. What should you do to speed it up?",
            "options": [
                "Disable automated backups and increase disk size (IOPS)",
                "Compress the file",
                "Use a smaller instance",
                "Split the file"
            ],
            "answer": "a84916256d56aa6863396a26df3da302232906375c8a23b9979460550e98601c"
        },
        {
            "question": "Which database service allows you to use `TTL` (Time To Live) to automatically delete old data?",
            "options": [
                "Firestore and Bigtable",
                "Cloud SQL",
                "Spanner",
                "Memorystore"
            ],
            "answer": "e91cd0dc88bf0a1e5784c2fd53b897fc5b198a9a4b0fbf6a835694e3bfd235f5"
        },
        {
            "question": "You need a fully managed MongoDB-compatible database. What is the Google Cloud offering?",
            "options": [
                "MongoDB Atlas (Partner) or DocumentDB (AWS)",
                "Actually rapid development on Firestore or partner service",
                "Cloud SQL",
                "Spanner"
            ],
            "answer": "8a95dd455e92e3c9dbdbae69c2d4753e8587905802d4936c04687af89a56ed2d"
        },
        {
            "question": "What functionality does `pgvector` extend to Cloud SQL for PostgreSQL?",
            "options": [
                "Vector similarity search (AI/ML)",
                "Graph processing",
                "Time series analysis",
                "Blockchain"
            ],
            "answer": "122c2510bae948f96b25bf8d5579afa57d9563b53d794c24f50d68c5a2a766f8"
        },
        {
            "question": "You need strict referential integrity. Which DBs support this?",
            "options": [
                "Cloud SQL and Spanner",
                "Bigtable",
                "Firestore",
                "Memorystore"
            ],
            "answer": "36f769b9aee3962380a649f01396252b04b3336471d06e6f8217cdc05b4cd5bc"
        },
        {
            "question": "What is the minimum storage size for Cloud SQL?",
            "options": [
                "10 GB",
                "100 GB",
                "1 GB",
                "No minimum"
            ],
            "answer": "daa020f4e4e8db4ce50b17dca2a93df11fab8bbff416f7c39815427b63e3f4bf"
        },
        {
            "question": "Which tool can generate synthetic data for database testing?",
            "options": [
                "Custom scripts / 3rd party",
                "Dataflow",
                "Cloud SQL Generator",
                "BigQuery"
            ],
            "answer": "20b0f5f2b3c6042d6e9519efabb31f82a363fcbc54687550dc36d5621a3a82bd"
        },
        {
            "question": "You want to clone a Cloud SQL instance for testing. What feature do you use?",
            "options": [
                "Clone",
                "Duplicate",
                "Copy",
                "Mirror"
            ],
            "answer": "5779f32fab00c2aae390fe9f63877444b90eb7c12cca5e8903f7c02d2759f9db"
        },
        {
            "question": "Does Cloud Spanner support secondary indexes?",
            "options": [
                "Yes",
                "No",
                "Only on primary keys",
                "Only in one region"
            ],
            "answer": "85a39ab345d672ff8ca9b9c6876f3adcacf45ee7c1e2dbd2408fd338bd55e07e"
        },
        {
            "question": "What is the maximum size of a single value in Bigtable?",
            "options": [
                "10 MB",
                "100 MB",
                "1 GB",
                "1 MB"
            ],
            "answer": "f7f52e59df1d40f9884fb5b9f191a3961813b527753515c55448acc2350dd33a"
        },
        {
            "question": "You need to protect your database from accidental deletion. What feature should you enable?",
            "options": [
                "Deletion Protection",
                "Locking",
                "Backup",
                "IAM"
            ],
            "answer": "0c7b0028e2097beef1eafa3f88640d50ade304266801e9375a4abf275b1683da"
        },
        {
            "question": "Which service offers in-memory caching for sub-millisecond latency?",
            "options": [
                "Memorystore",
                "Cloud SQL",
                "Spanner",
                "BigQuery"
            ],
            "answer": "dc549ce452c397de3aaa8a2e60caeb343c19c633f1a25a5cca6605ff8a86ee94"
        },
        {
            "question": "How do you rotate credentials for a Cloud SQL user securely?",
            "options": [
                "Use Secret Manager with rotation Cloud Functions",
                "Manually update",
                "Use IAM",
                "Put new password in code"
            ],
            "answer": "20da42033605d887db6f8882274e7711a8d609303a3df2221851c022d6955da3"
        },
        {
            "question": "Which DB is best for a massive-scale (PB) gaming leaderboard?",
            "options": [
                "Cloud Bigtable",
                "Cloud SQL",
                "Firestore",
                "BigQuery"
            ],
            "answer": "5521a117cff57294d9c0d7e8898eea362b1eee7e3cac290d5d4e1e4b68606060"
        },
        {
            "question": "Can you resize a Cloud SQL disk downwards?",
            "options": [
                "No, only up",
                "Yes, anytime",
                "Yes, with restart",
                "Only for SSD"
            ],
            "answer": "1c556b099e56de520da9449d4782445357adfccb974cd3ac0f061c74a0e3be7c"
        },
        {
            "question": "What is the primary interface for managing Bigtable?",
            "options": [
                "cbt CLI / HBase API",
                "SQL",
                "GUI only",
                "REST only"
            ],
            "answer": "5ecf49315fb140d5a456d35c932ae97357f14f657cceb35759a0e2b1727815fd"
        },
        {
            "question": "You need to reduce latency for a global web app reading from Cloud SQL. What do you deploy?",
            "options": [
                "Read replicas in local regions",
                "New master instances",
                "CDN",
                "VPN"
            ],
            "answer": "a5a54baf610839094e12115d1d94afd2d8511d5c0e35432fc55782521e80fdfa"
        },
        {
            "question": "What feature of Firestore allows offline data access for mobile apps?",
            "options": [
                "Offline Persistence",
                "Caching",
                "Local Storage",
                "Sync"
            ],
            "answer": "5342fac2cc2cfbb126b4fdbced8c7f2fec8cc7375d3feb42b43be42b34916a5d"
        },
        {
            "question": "You need to migrate from AWS RDS to Cloud SQL. What is the best service?",
            "options": [
                "Database Migration Service (DMS)",
                "Manual Dump/Restore",
                "Replication",
                "FTP"
            ],
            "answer": "593ad9087f8794484a03716351aa5c476243c9cbc2295bd539bcf086bda5d015"
        },
        {
            "question": "Which IAM role is required to connect to a Cloud SQL instance?",
            "options": [
                "Cloud SQL Client",
                "Cloud SQL Admin",
                "Viewer",
                "Editor"
            ],
            "answer": "134da499f1ef45a891545e141582d6ca875ea366f32289e22a92dc3a52246b5b"
        },
        {
            "question": "How does Spanner achieve 99.999% availability?",
            "options": [
                "TrueTime and synchronous replication (Paxos)",
                "Async replication",
                "Sharding",
                "Backups"
            ],
            "answer": "7a207303807cdfc9c7120fe33cbf07c80c4c6bfd87e964ef2c443d0af54a9ab1"
        },
        {
            "question": "You need to run complex analytical queries on your operational data in Cloud Spanner without impacting performance. What do you use?",
            "options": [
                "Data Boost",
                "Read Replica",
                "Backup",
                "Export"
            ],
            "answer": "36e994476c855b932dd1d1b609bc684a4e3652c6fe00b28846f34bf93c752bcd"
        },
        {
            "question": "Which database engine is NOT supported by Cloud SQL?",
            "options": [
                "Oracle",
                "MySQL",
                "PostgreSQL",
                "SQL Server"
            ],
            "answer": "dc7620ebfc35d54ef34e32b9eb6f69f1bfe93f294370c2798d91147e34e7ad56"
        },
        {
            "question": "What is the purpose of the 'postgres' user in Cloud SQL?",
            "options": [
                "Default administrative user",
                "Read-only user",
                "System user",
                "Backup user"
            ],
            "answer": "56bc5b2a7e857ad8c964d0fb36cf95e0fa843c71ab4074d6a347213cd10ddaf7"
        },
        {
            "question": "You have a high-velocity write workload. Which storage type is best for Cloud SQL?",
            "options": [
                "SSD",
                "HDD",
                "Tape",
                "Network"
            ],
            "answer": "38881cf745983ebbbd518031e64ea79c12c1b4b140ac8f21b3bfdc38308a5df5"
        },
        {
            "question": "Can Bigtable be used as a source for BigQuery?",
            "options": [
                "Yes, via External Tables or Dataflow",
                "No",
                "Only via CSV",
                "Only via SQL"
            ],
            "answer": "0a3a3bce6da1985ad385993bab0929f06a0d5b35800a2a8401d4ef2b18e428dc"
        },
        {
            "question": "What is the maximum transaction duration in Cloud Spanner?",
            "options": [
                "There is a limit (e.g., 20s for commit)",
                "Unlimited",
                "1 hour",
                "1 ms"
            ],
            "answer": "d957226a19b1ceb5c9b986017b1d4cab1d04243bbcc957e9cd3f2ae5674e9b1f"
        },
        {
            "question": "Which service automatically recommends database optimizations?",
            "options": [
                "Active Assist / Recommender",
                "Cloud Build",
                "Support",
                "Docs"
            ],
            "answer": "a4cfc2705594c242e2970c901f2a40045b4f45a6e3436b3f9bf69297a3ef7e58"
        },
        {
            "question": "You need to store hierarchical data structure. Which DB is good?",
            "options": [
                "Firestore",
                "Bigtable",
                "Cloud SQL",
                "Memorystore"
            ],
            "answer": "074a14c7fc69187abf355ac7ac31e80c6d4fe098c5e6bda7637a17c17ea0ee94"
        }
    ],
    "Professional Cloud DevOps Engineer": [
        {
            "question": "You are adopting Site Reliability Engineering (SRE) practices. What is the primary metric used to measure the reliability of a service as experienced by the user?",
            "options": [
                "Service Level Agreement (SLA)",
                "Service Level Objective (SLO)",
                "Service Level Indicator (SLI)",
                "Mean Time To Recovery (MTTR)"
            ],
            "answer": "131e4cbf4f76bf45c0e03edaea638b00148e4774fe7bef1e3b1daf1ebf829c0a"
        },
        {
            "question": "What is the error budget in SRE terms?",
            "options": [
                "The amount of money allocated for fixing bugs",
                "The 1 - SLO, representing the allowable unreliability",
                "The number of errors allowed before a rollback",
                "The budget for overtime pay during incidents"
            ],
            "answer": "d3f41b5a18ba2ade4cba298a0cfd5963a0970e7c486817c483e30e50d6824f40"
        },
        {
            "question": "Which SRE principle focuses on reducing manual, repetitive work?",
            "options": [
                "Eliminating Toil",
                "Monitoring Distributed Systems",
                "Embracing Risk",
                "Release Engineering"
            ],
            "answer": "feb19794f1f5a298d10fc8593afc1374515b59e6eebea9377369ca2a62766514"
        },
        {
            "question": "When an error budget is exhausted, what is the recommended course of action according to SRE practices?",
            "options": [
                "Halt feature launches and focus on reliability",
                "Hire more SREs",
                "Increase the error budget",
                "Ignore the budget and continue releases"
            ],
            "answer": "f35e61062d8f026e6bc498689bd6d23dfa9ca575c68ad2db88efc6f5a08d741e"
        },
        {
            "question": "What is the purpose of a Blameless Post-Mortem?",
            "options": [
                "To prevent the same incident from happening again by focusing on process and technology",
                "To identify the person responsible for the outage",
                "To punish the team for failing SLA",
                "To generate a report for the billing department"
            ],
            "answer": "7fab8ddde4343af6eb280c3b4e8bca815467c3508c9fd098eb40a03faa7213af"
        },
        {
            "question": "You are defining SLIs for a user-facing web service. Which metrics are most appropriate?",
            "options": [
                "Latency, Availability, and Error Rate",
                "CPU utilization and disk usage",
                "Network throughput and packet loss",
                "Developer commit frequency"
            ],
            "answer": "cc73dbbd32617b15d5e1eff15d4ba4c31d9649d09ea4bab94aa33539221aa3d5"
        },
        {
            "question": "Which deployment strategy allows you to gradually route traffic to a new version of your application to monitor for errors before full rollout?",
            "options": [
                "Canary Deployment",
                "Recreate Deployment",
                "Rolling Update",
                "Blue/Green Deployment"
            ],
            "answer": "2c84e7808165ed51324f8fe29cf1f6f8e7c44c94c247876fee40212d8316e14e"
        },
        {
            "question": "You need to reduce the Mean Time To Detect (MTTD) an incident. What should you improve?",
            "options": [
                "Monitoring and Alerting",
                "Automated testing",
                "Incident Response Playbooks",
                "Documentation"
            ],
            "answer": "c1ad8c5702f79dc67bf23335b5bf58c237cc94ebce97eb14dc900716c934829c"
        },
        {
            "question": "What is 'Toil' in the context of SRE?",
            "options": [
                "Manual, repetitive, automatable, tactical work",
                "Creating new features",
                "Designing system architecture",
                "attending team meetings"
            ],
            "answer": "739743570eed98b4cf99241623d42a655c710cdce1c19d9425b73479497f37dd"
        },
        {
            "question": "Which tool in Google Cloud is designed to help you track and manage incident response?",
            "options": [
                "Incident Management (part of Monitoring)",
                "Cloud Logging",
                "Cloud Build",
                "Cloud Run"
            ],
            "answer": "124c30cb9ef3e54fb005fa6f8490204d44024d052b082e9ccd3acf95df904acf"
        },
        {
            "question": "You are designing a CI/CD pipeline using Cloud Build. How should you securely enable the build to access a private repository in Cloud Source Repositories?",
            "options": [
                "Use the Cloud Build Service Account permissions",
                "Store SSH keys in the source code",
                "Pass credentials as environment variables",
                "Make the repository public"
            ],
            "answer": "9098699564a9b96563d277b662bdf86390b21db905026cc9ac69ad5106ea5031"
        },
        {
            "question": "Which GCP service provides a fully managed continuous integration, continuous delivery, and continuous deployment platform?",
            "options": [
                "Cloud Build",
                "Jenkins on Compute Engine",
                "Cloud Deploy",
                "Spinnaker"
            ],
            "answer": "fdd59b767c7fb342e5fc94afdedb6e54978a7c09144b0ee4fd49fd88e4f83532"
        },
        {
            "question": "You want to deploy containers to Google Kubernetes Engine (GKE) and want a managed CD service to handle the release pipeline, including canary deployments. Which service should you use?",
            "options": [
                "Cloud Deploy",
                "Cloud Build",
                "Cloud Functions",
                "App Engine"
            ],
            "answer": "d704e4ab6fbb0c39ae5fb631ddf2ca9857305b56c8d7b8facb493d820b39ad97"
        },
        {
            "question": "In a GitOps workflow, what is the single source of truth for your infrastructure and application configuration?",
            "options": [
                "The Git repository",
                "The running cluster state",
                "The CI server",
                "The Database"
            ],
            "answer": "4143aefb04bdbd63edaa147ad00126cd578bfc71b3f87106241e53e7e6dde275"
        },
        {
            "question": "You are using Binary Authorization to secure your GKE cluster. What does this service primarily ensure?",
            "options": [
                "That only trusted/signed container images are deployed",
                "That all network traffic is encrypted",
                "That users use MFA",
                "That pods scale automatically"
            ],
            "answer": "80f2fcbe06578caba0d31784cc298519bc9689e0922f5417de60960b33f7d214"
        },
        {
            "question": "Which tool allows you to define infrastructure as code (IaC) and is widely supported on GCP?",
            "options": [
                "Terraform",
                "Ansible",
                "Puppet",
                "Chef"
            ],
            "answer": "05b073bd5e46bbede792d1e77a68c71801b7bac2dd8e0236299dede9a3a1909d"
        },
        {
            "question": "You need to store Docker images for your organization securely. Which service replaces Container Registry and offers granular access control?",
            "options": [
                "Artifact Registry",
                "Cloud Storage",
                "Source Repositories",
                "Cloud Build"
            ],
            "answer": "f48b05f35be0d3cad269d43fe0b21e256fb8221a765f453ffa9270418eebed17"
        },
        {
            "question": "What is the best practice for managing secrets (API keys, passwords) in a Cloud Build pipeline?",
            "options": [
                "Use Secret Manager and access them via the build steps",
                "Commit them to the repo",
                "Pass them as command line arguments",
                "Store them in a text file on Cloud Storage"
            ],
            "answer": "17d4e309e021234feff77491b8bd6b1bd40867b61b1968dc945ab90a3b651cbd"
        },
        {
            "question": "How can you speed up Cloud Build builds that use large Docker images?",
            "options": [
                "Enable Kaniko cache",
                "Use a larger machine type for the build",
                "Store images in a public registry",
                "Skip unit tests"
            ],
            "answer": "e17e133cafe20e61634fd013b8dee8cc04d566bc6935c15521a83b4e9d4ba17c"
        },
        {
            "question": "You want to trigger a Cloud Build pipeline automatically whenever code is pushed to a specific branch in GitHub. What should you configure?",
            "options": [
                "A Cloud Build Trigger",
                "A Cloud Scheduler job",
                "A Pub/Sub topic",
                "A Cloud Function"
            ],
            "answer": "2488a74bd825194d23b9da1d05146ee3ff4782ab86bc7ec9e92de2f36dae2979"
        },
        {
            "question": "You need to view the latency of a request as it travels through multiple microservices in your architecture. Which tool should you use?",
            "options": [
                "Cloud Trace",
                "Cloud Monitoring",
                "Cloud Logging",
                "Cloud Profiler"
            ],
            "answer": "426eae3116e7913dad13f99a93318cdcaf419af49b75f8e53d3f88d5cf47e656"
        },
        {
            "question": "Which Cloud Monitoring concept represents a collection of time-series data?",
            "options": [
                "Metric",
                "Resource",
                "Group",
                "Workspace"
            ],
            "answer": "2d275a74912cca2e02e6d41f9cae3a75ceef3ed0ef734eff3710e10eb7112228"
        },
        {
            "question": "You want to investigate performance bottlenecks in your code (CPU/Memory usage) running in production with minimal overhead. Which tool should you use?",
            "options": [
                "Cloud Profiler",
                "Cloud Trace",
                "Cloud Debugger",
                "Cloud Logging"
            ],
            "answer": "f07fa4e55ed00e797cd0e640616156afbe71231f59aee721ca86d8cfad714c94"
        },
        {
            "question": "How long are Cloud Logging audit logs retained by default?",
            "options": [
                "400 days",
                "7 days",
                "30 days",
                "Indefinitely"
            ],
            "answer": "b384092d3dfc60de7df9ff4a065cd462a9b30287702c4d9066410ac75bfce5df"
        },
        {
            "question": "You need to export logs to BigQuery for long-term analytics. What do you create in Cloud Logging?",
            "options": [
                "Log Sink",
                "Log Bucket",
                "Log Metric",
                "Log View"
            ],
            "answer": "210077abb894b6c84902c7d13aa791c56aa65104ab302f3ffd323d778d13e573"
        },
        {
            "question": "Which language is used to query logs in the Logs Explorer?",
            "options": [
                "Logging Query Language (LQL/filtering syntax)",
                "SQL",
                "LogQL",
                "PromQL"
            ],
            "answer": "86bd2160a1e2286518fa6202a5de2f54f7df38f3e8d1124991818f0a6469b9e2"
        },
        {
            "question": "You want to create an alert based on a specific error message appearing in your logs. What should you do first?",
            "options": [
                "Create a log-based metric",
                "Create a dashboard",
                "Export to BigQuery",
                "Write a Cloud Function"
            ],
            "answer": "25e7d398b781dc1add124864d9cd46d74e70c5d6719a5b06a77385353c7e848f"
        },
        {
            "question": "What is the purpose of 'Uptime Checks' in Cloud Monitoring?",
            "options": [
                "To verify the availability of your public-facing services from locations around the world",
                "To check if your internal database is running",
                "To monitor CPU usage",
                "To audit IAM changes"
            ],
            "answer": "d539ad5c7e46c0f3356304e36c505933c107ee0caa4a987b62fa3821df45a216"
        },
        {
            "question": "You see a spike in 5xx errors on your load balancer. Which logs would generally be most useful to check first?",
            "options": [
                "Load Balancer Access Logs",
                "VPC Flow Logs",
                "Cloud Audit Logs",
                "System Event Logs"
            ],
            "answer": "2b2a00e0eb2c5c33c92a7f4e4215615bb5af3fb0d46b86673082b580dacf6d60"
        },
        {
            "question": "Your application running on GKE is crashing (OOM). Which metric should you inspect?",
            "options": [
                "Memory usage / Container memory limit",
                "CPU utilization",
                "Disk I/O",
                "Network packets"
            ],
            "answer": "de9cf40bdd0047983149b7f2761cf4661ed761b90348c4bed6b8c4c30b10f7e0"
        },
        {
            "question": "During an incident, who should be the single source of truth and command?",
            "options": [
                "The Incident Commander (IC)",
                "The CEO",
                "The Operations Lead",
                "The Communications Lead"
            ],
            "answer": "db09d3cf45493d28fb6172b5a92f4e7c3f171aa8cd12a6d754e41a8c8f5535f0"
        },
        {
            "question": "Which GCP service helps prevent sensitive data (like credit card numbers) from being logged inadvertently?",
            "options": [
                "Cloud DLP (Data Loss Prevention)",
                "Secret Manager",
                "IAM",
                "VPC Service Controls"
            ],
            "answer": "9fd2ad015a0e12fb22d7f4cda003101954c36a43d3cf4e85aa1eb7d5830b1b7c"
        },
        {
            "question": "You want to restrict which Google Cloud APIs can be called from within your VPC to prevent data exfiltration. What should you implementation?",
            "options": [
                "VPC Service Controls",
                "VPC Firewall Rules",
                "Cloud Armor",
                "Identity-Aware Proxy"
            ],
            "answer": "4242d3f4fc4203784cc01eb0336379a5275419ae51da617c6e0bd38741d60321"
        },
        {
            "question": "Which service protects your web applications from DDoS attacks and common web exploits (OWASP Top 10)?",
            "options": [
                "Cloud Armor",
                "Cloud CDN",
                "Cloud DNS",
                "Cloud NAT"
            ],
            "answer": "87ff2f70d08e2544811332694cc2fd25e7fc711d3c0e1e035fa173351987a4b5"
        },
        {
            "question": "You need to audit 'who did what, where, and when' in your GCP project. What is the primary source of this information?",
            "options": [
                "Cloud Audit Logs",
                "Cloud Monitoring",
                "VPC Flow Logs",
                "Billing Export"
            ],
            "answer": "0a14e72b095cab11331cd55188f830131474a2526c38cd36f3c62a1559bb1dfe"
        },
        {
            "question": "How do you securely manage access to a GKE cluster's control plane?",
            "options": [
                "Use Authorized Networks",
                "Expose it to the internet",
                "Use a strong password",
                "Disable the control plane"
            ],
            "answer": "56ff35dbe043f4856d22fd03c5c234fecc7d18c6ff471db085cc13f3e8881aa0"
        },
        {
            "question": "What is the purpose of 'Break-glass' access in IAM?",
            "options": [
                "Emergency access for highly privileged actions during critical incidents",
                "Permanent admin access",
                "Read-only access",
                "API access"
            ],
            "answer": "ea74b58632e5a2171f98ae4e8d128569f7adbcace12f2dd6e50094d9281e29f2"
        },
        {
            "question": "You are using Terraform. Where should you store the state file securely?",
            "options": [
                "Remote backend (e.g., Cloud Storage bucket with versioning and encryption)",
                "Local git repo",
                "Public S3 bucket",
                "Stick notes"
            ],
            "answer": "6caea36dee747c8f3cfb45466cfeabaa17f49e1e2ebe7f39322baf8e2a75326e"
        },
        {
            "question": "Which feature allows you to ensure that your GKE pods can only communicate with legitimate services?",
            "options": [
                "Network Policies",
                "Pod Security Policy",
                "Binary Authorization",
                "Shielded Nodes"
            ],
            "answer": "95f2b6322297883d4419ad89d7e55307ef596e8f3753725ec456a106d03019af"
        },
        {
            "question": "You discover a public bucket that should be private. What is the first step?",
            "options": [
                "Ideally, remove public access immediately (Public Access Prevention)",
                "Delete the bucket",
                "Checking logs",
                "Emailing the team"
            ],
            "answer": "387b6dd3973854a1fc1af0d70351bba28f07c1d1258d68dc730f98d7449f6def"
        },
        {
            "question": "You want to deploy a stateless containerized microservice that scales to zero when not in use. Which service is best?",
            "options": [
                "Cloud Run",
                "GKE Standard",
                "Compute Engine",
                "App Engine Flexible"
            ],
            "answer": "aa92dcab6bc705126d6d723acb9c8ba33d4e4a8e06b9e1b40dddcdb9748c538a"
        },
        {
            "question": "What is the main benefit of GKE Autopilot over GKE Standard?",
            "options": [
                "Google manages the node configuration and scaling; you focus on pods",
                "Less cost",
                "Full control over master node",
                "Faster network"
            ],
            "answer": "c9de43d979baefc5c1b62a789e47795c88a6c6b74210d03b61806ab87f232a4c"
        },
        {
            "question": "You need to split traffic 50/50 between two versions of an App Engine application. What is the easiest way?",
            "options": [
                "Use 'gcloud app services set-traffic'",
                "Deploy a load balancer",
                "Change DNS records",
                "Manual scaling"
            ],
            "answer": "6ee220a95618d8563f4e6adbda3ba4482b6da446c62a8d56341070439b1dbdf1"
        },
        {
            "question": "Which GKE feature allows you to run workloads on different machine types (e.g., GPU nodes vs Standard nodes)?",
            "options": [
                "Node Pools",
                "Namespaces",
                "Services",
                "ReplicaSets"
            ],
            "answer": "01ab7ce3eb4c4d4c683d887a5faf6706daf8f15ba4641bedebd7eef15b72e4e5"
        },
        {
            "question": "How do you ensure high availability for a Cloud Run service?",
            "options": [
                "Cloud Run is regional by default and automatically replicated across zones",
                "Deploy to multiple zones",
                "Use a larger instance",
                "Enable auto-restart"
            ],
            "answer": "a35400c047bde13909513f88eb28402e544132c3e8e7a6e3f787b3cceda7cd43"
        },
        {
            "question": "You need to persist data in a stateful GKE application. What Kubernetes resource should you use?",
            "options": [
                "PersistentVolumeClaim (PVC)",
                "ConfigMap",
                "Secret",
                "EmptyDir"
            ],
            "answer": "50f7bf2e2f36f9fe0fc49bdfd6c8c83bac45f4b379be01e3bc3d00c39a89a214"
        },
        {
            "question": "Which service allows you to run event-driven code without managing servers?",
            "options": [
                "Cloud Functions",
                "Compute Engine",
                "GKE",
                "Cloud Dataflow"
            ],
            "answer": "f2f57c544fee19fd6f2097a8369ae518a37c67674ded4229e469a5734cd4be23"
        },
        {
            "question": "What is the 'Sidecar' pattern in Kubernetes?",
            "options": [
                "A helper container running alongside the main application container in the same Pod",
                "A separate pod for logging",
                "A backup cluster",
                "A load balancer"
            ],
            "answer": "43b5e84020dc79ed777d34078a3c4074637f9e01581487937c5edf94f9a97535"
        },
        {
            "question": "You want to use Spot VMs in your GKE cluster to save costs. How should you configure your workloads to be resilient?",
            "options": [
                "Use Pod Disruption Budgets and handle termination gracefully",
                "Use stateful sets",
                "Disable autoscaling",
                "Use only one replica"
            ],
            "answer": "9e96d8dd0c6ecf873f5263d5434ad6024b3380b9c20977dc694b9031c754594d"
        },
        {
            "question": "Which mesh technology is managed by Google Cloud Service Mesh (formerly Anthos Service Mesh)?",
            "options": [
                "Istio",
                "Linkerd",
                "Consul",
                "Envoy"
            ],
            "answer": "0c16521ac7ae32cf5bd781122b689c39c3ad67da12da1acb831c7ecd3d5e0c67"
        },
        {
            "question": "What is the 'Immutable Infrastructure' pattern?",
            "options": [
                "Never changing infrastructure once deployed; replacing it with new instances instead",
                "Updating servers in place",
                "Hardening servers",
                "Using bare metal only"
            ],
            "answer": "5cd4b69dc7725c4315674dde34de331b7474a5fd1d9d07ca49182c0aaeb2c502"
        },
        {
            "question": "You need to ensure your infrastructure configuration does not drift over time. What should you do?",
            "options": [
                "Run IaC (Terraform) apply regularly / automated pipelines",
                "Manual audits",
                "Remove admin access",
                "Lock the console"
            ],
            "answer": "4a847c4f75d9e8ca12d5acc42be337902888e19d8af948c4984e6784e303c195"
        },
        {
            "question": "What is the purpose of a 'Health Check' in a Load Balancer?",
            "options": [
                "To determine if a backend instance is healthy and can receive traffic",
                "To bill the client",
                "To check the user's browser health",
                "To scan for viruses"
            ],
            "answer": "dac6d5338c2198e9298f4c69feec742048a755c49e00aa844ffc9e3bc6431034"
        },
        {
            "question": "Which strategy involves deploying the new version alongside the old version and switching traffic instantaneously (e.g., load balancer switch)?",
            "options": [
                "Blue/Green Deployment",
                "Canary",
                "Rolling Update",
                "Recreate"
            ],
            "answer": "a8a63d4ebb6815524794922bc471c3a8f6fee96946c8715f7864a5aebffd2b9b"
        },
        {
            "question": "You want to automate the creation of GCP projects with standard settings. What tool is best?",
            "options": [
                "Terraform / Cloud Foundation Toolkit",
                "Cloud Console",
                "Shell scripts",
                "Spreadsheets"
            ],
            "answer": "8de5e77d6ae17f9829a1643372bfd9e6c26a8b29f402c7e6c83ec7c6669c2600"
        },
        {
            "question": "How can you optimize the cost of a non-production GKE environment that is only used during business hours?",
            "options": [
                "Scale the cluster down to zero (or min nodes) at night using autoscaler or scheduler",
                "Use Commitments",
                "Delete the cluster daily",
                "Use HDD disks"
            ],
            "answer": "0251aed169cf134f85527abc53cbb66b514631d227894da1aec127a3eefb1727"
        },
        {
            "question": "What is 'Configuration as Code'?",
            "options": [
                "Managing configuration files (YAML/JSON) in version control",
                "Writing application code",
                "Configuring servers manually",
                "Using GUI tools"
            ],
            "answer": "85aaeb9c57fd0c91832913d3f10932410b805f9e340075924166edb25db37cf5"
        },
        {
            "question": "You need to reduce latency for global users accessing static assets. What should you enable?",
            "options": [
                "Cloud CDN",
                "Cloud VPN",
                "Cloud Interconnect",
                "Larger VMs"
            ],
            "answer": "69628b524aa9126c234f7293dfcfdd3566018c578eb230a8af0e5451ad24c95e"
        },
        {
            "question": "Which metrics are considered the 'Four Golden Signals' of monitoring?",
            "options": [
                "Latency, Traffic, Errors, Saturation",
                "CPU, RAM, Disk, Network",
                "Velocity, Quality, Cost, Time",
                "Uptime, Downtime, Ping, Jitter"
            ],
            "answer": "7a5b842c194348f844c0a225ce2d7b0d4af8cccc5ae6486385299d9843fa1d18"
        },
        {
            "question": "What is the main advantage of using 'managed services' (like Cloud SQL) over self-managed (PostgreSQL on VM)?",
            "options": [
                "Reduced operational overhead (patching, backups, HA)",
                "Lower licensing cost",
                "Full root access",
                "Custom kernel modules"
            ],
            "answer": "09c28ff8d69b224eb036051dacf18f03d3635e5f06d36cf308732894a394a6b5"
        },
        {
            "question": "You are planning a multi-region disaster recovery strategy. Which RTO/RPO values imply the highest cost?",
            "options": [
                "RTO=0, RPO=0 (Near zero)",
                "RTO=24h, RPO=24h",
                "RTO=1h, RPO=1h",
                "RTO=4h, RPO=4h"
            ],
            "answer": "d96961f3f1b1120b9483161ffc8852b0ac81195fbee5d2f3b332a43ec36ca947"
        },
        {
            "question": "Which feature ensures that a specific number of pods are always running in GKE, even during voluntary disruptions?",
            "options": [
                "Pod Disruption Budget",
                "ReplicaSet",
                "Deployment",
                "DaemonSet"
            ],
            "answer": "878993ab8d1e99b3510ec64ecc40206d9e9e3ed76dea7bcdbabfad3c4336812a"
        },
        {
            "question": "You need to run a legacy application that requires specific kernel modifications. Which compute option is most suitable?",
            "options": [
                "Compute Engine",
                "Cloud Run",
                "App Engine Standard",
                "Cloud Functions"
            ],
            "answer": "3b971cd8c30422abdb578907b18a89ae6b3e3bd53e540b3b06bf538d5a556ed4"
        },
        {
            "question": "How do you securely connect your VPC to an on-premises network with high throughput requirements (10Gbps+)?",
            "options": [
                "Dedicated Interconnect",
                "Cloud VPN",
                "Carrier Peering",
                "Internet"
            ],
            "answer": "2d84d868ce16509f5a985bc4b8558e16346303f56fcc83e69d835af15a32a1fb"
        },
        {
            "question": "What represents a 'Failure' in the context of an SLO?",
            "options": [
                "A request that is slower than the threshold or returns an error",
                "Any request",
                "A successful request",
                "A log entry"
            ],
            "answer": "fa061d7f04eaccf6ef74ffc3f834b74f0dea258ba31c526fb77137c324f450b2"
        },
        {
            "question": "Which tool allows you to visually orchestrate workflows involving multiple GCP services?",
            "options": [
                "Cloud Composer (Airflow)",
                "Cloud Scheduler",
                "Cloud Tasks",
                "Cron"
            ],
            "answer": "6281e2cc4b5cdc1f633d7645d6d4681c17aac8fec42a29888a133e07b2c5dc58"
        },
        {
            "question": "You want updates to your application to be applied one pod at a time to ensure zero downtime. What is this called?",
            "options": [
                "Rolling Update",
                "Recreate",
                "Big Bang",
                "Shutdown"
            ],
            "answer": "96c72b64703448ced99e8e040a395d80c20d258fde7d333d63203ae31681a16d"
        },
        {
            "question": "Which service monitors the health of your application endpoints from the 'outside'?",
            "options": [
                "Uptime Checks",
                "Health Checks",
                "Liveness Probes",
                "Readiness Probes"
            ],
            "answer": "87debefd69c8e66e99f9656f189881df6a1f2ee7600aad4f3fd3a643a923cd15"
        },
        {
            "question": "You need to store standard, structured log data. Which format is best for Cloud Logging?",
            "options": [
                "JSON",
                "Text",
                "XML",
                "Binary"
            ],
            "answer": "db1a21a0bc2ef8fbe13ac4cf044e8c9116d29137d5ed8b916ab63dcb2d4290df"
        },
        {
            "question": "How can you enforce that specific labels are present on all newly created VMs?",
            "options": [
                "Organization Policy",
                "IAM",
                "VPC Firewall",
                "Billing Budget"
            ],
            "answer": "b2ce2195fe2153db89a2474918749e0906d28c4e06f328431c75db21be0aed7a"
        }
    ],
    "default": [
        {
            "question": "What is the primary function of Google Cloud's IAM service?",
            "options": [
                "Infrastructure as Code",
                "Identity and Access Management",
                "Instance and Asset Monitoring",
                "Intrusion and Anomaly Mitigation"
            ],
            "answer": "bb133561f40b2cbc6282dd2e93289d786c5f367d9d3f49ca3dc5252d398f3ab4"
        },
        {
            "question": "Which Google Cloud service is designed for storing large binary objects like images and videos?",
            "options": [
                "Cloud SQL",
                "Cloud Storage",
                "BigQuery",
                "Firestore"
            ],
            "answer": "2ec3eb563477a32a38bc370562367c43da359e75341ad9684f6004e3c904becb"
        }
    ]
};