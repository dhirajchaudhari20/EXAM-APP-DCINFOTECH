const demoUser = { email: "ADMIN", password: "12345" };
const validCoupon = "CAT2025";
/* -------------------- 100 ACE-style Question Bank --------------------
   Each entry: { q: "question", opts: [...4 options...], a: correctIndex }
   (We will shuffle options & update 'a' automatically at exam start)
*/
const questions = [
  { q: "You need to deploy a containerized app to GCP with minimal management overhead. Which service should you choose?", opts:["GKE Autopilot","Compute Engine","App Engine Standard","Cloud Run"], a:3 },
  { q: "Which IAM role grants read-only access across an entire project?", opts:["roles/viewer","roles/editor","roles/owner","roles/browser"], a:0 },
  { q: "Which storage class provides lowest latency for frequently accessed objects?", opts:["Nearline","Coldline","Standard","Archive"], a:2 },
  { q: "You need to run a managed, serverless container service — choose the service.", opts:["Cloud Run","Cloud Functions","App Engine Flexible","Compute Engine"], a:0 },
  { q: "Which service is best for ad-hoc SQL queries over petabytes of data?", opts:["BigQuery","Cloud SQL","Bigtable","Dataproc"], a:0 },
  { q: "Which command authenticates gcloud CLI to a Google account?", opts:["gcloud auth login","gcloud init","gcloud config set-auth","gcloud accounts login"], a:0 },
  { q: "Which load balancer type provides global HTTP(S) load balancing?", opts:["Network LB","Internal LB","HTTP(S) Global LB","TCP Proxy LB"], a:2 },
  { q: "To store relational data with managed MySQL, choose:", opts:["BigQuery","Cloud Spanner","Cloud SQL","Firestore"], a:2 },
  { q: "Which product is a managed wide-column NoSQL database?", opts:["Cloud SQL","Cloud Bigtable","Firestore","Firehose"], a:1 },
  { q: "You need a private, high-bandwidth connection from on-prem to GCP: choose:", opts:["Cloud VPN","Cloud Interconnect (Dedicated)","VPC Peering","Cloud Router"], a:1 },
  { q: "Which service provides fully-managed CI/CD on GCP?", opts:["Cloud Build","Cloud Deploy","Cloud Composer","Cloud Scheduler"], a:0 },
  { q: "To encrypt data at rest with your own key stored in KMS, use:", opts:["Google-managed key","CMEK (Customer-Managed Encryption Key)","CSEK (Customer-Supplied Encryption Key)","No encryption"], a:1 },
  { q: "Which service is best for real-time messaging between services?", opts:["Pub/Sub","Cloud Tasks","Cloud Scheduler","Cloud Functions"], a:0 },
  { q: "A microservice needs low-latency in-memory data store — choose:", opts:["Cloud SQL","Cloud Storage","MemoryStore (Redis)","BigQuery"], a:2 },
  { q: "Which is true about VPCs in GCP by default?", opts:["Each project has no VPC","Projects share a global VPC","There is an auto-created default VPC","VPCs are region-scoped only"], a:2 },
  { q: "Which service would you use to run batch processing with Hadoop/Spark?", opts:["Dataproc","Dataflow","BigQuery","Cloud Functions"], a:0 },
  { q: "Which tool helps define infrastructure as code for GCP?", opts:["gcloud CLI","Terraform","kubectl","Cloud Console"], a:1 },
  { q: "You must rotate an encryption key regularly: which service manages rotation?", opts:["Cloud KMS","Cloud IAM","Cloud HSM only","Cloud Identity"], a:0 },
  { q: "To analyze logs and build dashboards, which service is used?", opts:["Cloud Logging + Cloud Monitoring","Cloud Trace","Cloud Debugger","Cloud IAM"], a:0 },
  { q: "Which service is regional and used for fully-managed file shares?", opts:["Filestore","Persistent Disk","Cloud Storage","Cloud SQL"], a:0 },
  { q: "Which BigQuery feature supports partitioned tables for cost and performance?", opts:["Clustering","Partitioning","Sharding","Replication"], a:1 },
  { q: "To automatically scale stateless containers based on HTTP traffic, use:", opts:["GKE Node Pools","Cloud Run","Compute Engine Autoscaler","Cloud SQL"], a:1 },
  { q: "Which service helps orchestrate ETL pipelines with serverless data processing?", opts:["Dataflow","Dataproc","BigQuery","Cloud Composer"], a:0 },
  { q: "Which network component advertises routes to on-prem via Interconnect or VPN?", opts:["Cloud Router","Cloud NAT","Subnet Route","Firewall Rule"], a:0 },
  { q: "Which storage option allows POSIX-like file system access?", opts:["Cloud Storage","Filestore","Persistent Disk","Bigtable"], a:1 },
  { q: "Which role gives permission to create and manage VM instances?", opts:["roles/compute.viewer","roles/compute.admin","roles/editor","roles/owner"], a:1 },
  { q: "Which product is best for transactional, strongly consistent, horizontally scalable relational DB?", opts:["Cloud SQL","Cloud Bigtable","Spanner","Firestore"], a:2 },
  { q: "Which service will reduce load on backends via edge caching?", opts:["Cloud CDN","Cloud Storage","Cloud Armor","Cloud Router"], a:0 },
  { q: "Which tool is primarily used to manage Kubernetes clusters?", opts:["kubectl","gcloud sql","gcloud compute","terraform"], a:0 },
  { q: "For serverless scheduled tasks, which service should you use?", opts:["Cloud Scheduler","Cloud Tasks","Cloud Functions","Cloud Composer"], a:0 },
  { q: "Which product is a horizontally scalable document database on GCP?", opts:["Firestore","Cloud SQL","BigQuery","Bigtable"], a:0 },
  { q: "Which method should you use to allow a service account to access a resource?", opts:["Share its credentials file","Grant IAM role to service account","Copy user credentials","Use OAuth on behalf"], a:1 },
  { q: "Which tool shows quota and usage metrics across a project?", opts:["Cloud Monitoring","Cloud Logging","Stackdriver Debugger","Cloud Trace"], a:0 },
  { q: "Which load balancer works at L4 and supports TCP/UDP?", opts:["HTTP(S) LB","SSL Proxy LB","Network LB","Internal HTTP LB"], a:2 },
  { q: "You want each microservice to have its own isolated network: use:", opts:["Multiple subnets in one VPC","Multiple VPCs (Shared VPC) with service projects","Single subnet for all","No VPC"], a:1 },
  { q: "What is the primary use case for Cloud Bigtable?", opts:["OLTP transactional DB","Real-time analytics and time-series at scale","Cloud storage of files","Managed SQL"], a:1 },
  { q: "Which GCP mechanism provides fine-grained permissions?", opts:["Predefined roles only","Custom IAM roles","Owner role only","Project viewer"], a:1 },
  { q: "Which service should you choose for long-term, infrequently accessed backups?", opts:["Standard Storage","Nearline","Coldline","Archive"], a:3 },
  { q: "Which API or tool is best to automate GCP resource creation in CI/CD?", opts:["gcloud CLI inside pipeline","Manual Cloud Console clicks","Cloud Console templates","Cloud Shell only"], a:0 },
  { q: "How do you limit who can create BigQuery datasets in a project?", opts:["Firewall rules","IAM roles & permissions","VPC Service Controls","Cloud Armor"], a:1 },
  { q: "To prevent data exfiltration of services, use:", opts:["Cloud Armor","VPC Service Controls","Cloud CDN","Cloud NAT"], a:1 },
  { q: "Which service is used for distributed tracing of requests across services?", opts:["Cloud Trace","Cloud Logging","Cloud Monitoring","Cloud Debugger"], a:0 },
  { q: "Which product would you use for building a data lake of objects?", opts:["Cloud Storage","Firestore","Cloud SQL","Cloud Bigtable"], a:0 },
  { q: "Which GKE mode handles cluster control plane for you?", opts:["GKE Standard","GKE Autopilot","GKE On-Prem","GKE BYO"], a:1 },
  { q: "Which command lists available GKE clusters in a project?", opts:["gcloud container clusters list","gcloud compute instances list","kubectl get clusters","gcloud container clusters describe"], a:0 },
  { q: "To limit egress to the internet from VMs use:", opts:["Firewall rules + Private Google Access","Cloud Armor only","VPC Service Controls","Cloud CDN"], a:0 },
  { q: "Which option provides IAM binding at organization level?", opts:["Project-level IAM only","Organization policy","Organization-level IAM binding","No organization level"], a:2 },
  { q: "Which product is fully managed, serverless data integration supporting SQL and pipelines?", opts:["Cloud Composer","Dataflow","Data Fusion","Dataproc"], a:2 },
  { q: "How to centrally manage logs across projects and export them?", opts:["Enable Logging only","Use Logging sinks to export to a central project","Use BigQuery only","Use Cloud Storage only"], a:1 },
  { q: "Which solution offers multi-region strongly consistent relational DB on GCP?", opts:["Cloud SQL","Cloud Spanner","Firestore in Datastore mode","Bigtable"], a:1 },
  { q: "To prevent accidental deletion of project resources, enable:", opts:["Folder policies","Resource Locking (no such in GCP)","Organization Policy constraints & IAM","Cloud Armor"], a:2 },
  { q: "Which service helps transform messages and orchestrate streaming pipelines?", opts:["Pub/Sub + Dataflow","Pub/Sub + BigQuery","Cloud Tasks + Cloud Functions","Cloud Storage + BigQuery"], a:0 },
  { q: "Which is the primary way to delegate admin tasks without sharing user password?", opts:["Share user password","Service accounts","IAM roles assigned to users","Add users to owner group"], a:2 },
  { q: "Which command deploys Cloud Run service from local source?", opts:["gcloud run deploy SERVICE --source .","gcloud run services create","kubectl run","gcloud app deploy"], a:0 },
  { q: "Which feature in BigQuery reduces costs for scanning large datasets?", opts:["Clustering & Partitioning","Replication","Streaming inserts only","Caching only"], a:0 },
  { q: "To automate key rotation in KMS you should:", opts:["Manually rotate keys only","Use KMS key versioning and rotation policies","Disable rotation","Store rotation in Cloud SQL"], a:1 },
  { q: "Which GCP product helps you detect threats and secure workloads at edge?", opts:["Cloud Armor","Security Command Center","Cloud IDS","Cloud NAT"], a:1 },
  { q: "Which storage gives object immutability (WORM) capabilities?", opts:["Persistent Disk","Filestore","Cloud Storage Object Hold / Retention Policy","Cloud SQL"], a:2 },
  { q: "Which GCP capability controls access to APIs by IP range and identity?", opts:["Cloud Armor","VPC Service Controls","Organization Policy","IAM Conditions"], a:3 },
  { q: "Which service would you choose for time-series metrics storage and alerting?", opts:["Cloud Logging","Cloud Monitoring","Cloud Trace","Cloud Debugger"], a:1 },
  { q: "Which network feature provides NAT for private VMs to reach internet?", opts:["Cloud Router","Cloud NAT","Firewall Rule","Cloud Interconnect"], a:1 },
  { q: "Which is suitable for realtime stream analytics with autoscaling?", opts:["Dataproc","Dataflow","BigQuery","Cloud Functions"], a:1 },
  { q: "Which GCP service is best for hosting a static website with global edge caching?", opts:["Cloud Storage + Cloud CDN","Filestore","App Engine Standard","Compute Engine"], a:0 },
  { q: "Which policy enforces constraints like allowed machine types at org level?", opts:["IAM Role policies","Organization Policy","Firewall rules","VPC Service Controls"], a:1 },
  { q: "Which command shows current project configured in gcloud?", opts:["gcloud config get-value project","gcloud projects describe","gcloud info","gcloud projects list"], a:0 },
  { q: "Which service provides serverless workflows for event-driven sequences?", opts:["Cloud Functions","Workflows","Cloud Tasks","Cloud Composer"], a:1 },
  { q: "Which mechanism lets you grant temporary access to Cloud Storage objects?", opts:["Pre-signed URLs (signed URLs)","IAM only","ACLs only","Bucket policies only"], a:0 },
  { q: "For high availability multi-zone VMs, you should use:", opts:["Single zone instance","Managed instance group across zones","Standalone VM copies manually","Regional persistent disk only"], a:1 },
  { q: "Which product stores structured metadata and supports ACID transactions in GCP?", opts:["Firestore in Native mode","Cloud SQL","Cloud Bigtable","Cloud Storage"], a:0 },
  { q: "Which GCP feature secures communications between services using mTLS in service mesh?", opts:["Cloud Armor","Anthos Service Mesh","VPC Service Controls","Firewall"], a:1 },
  { q: "Which tool provides vulnerability scanning for container images in GCR/Artifact Registry?", opts:["Container Analysis (Container Scanning)","Cloud Armor","Binary Authorization","Cloud Security Scanner"], a:0 },
  { q: "Which service provides managed PostgreSQL with read replicas?", opts:["BigQuery","Cloud SQL","Spanner","Bigtable"], a:1 },
  { q: "To achieve least privilege access, you should:", opts:["Grant owner to all devs","Use predefined roles only","Use principle of least privilege with custom roles when needed","Grant editor role"], a:2 },
  { q: "Which service provides a shared VPC host project to centralize networking?", opts:["VPC Peering","Shared VPC","Cloud Router","Organizational VPC"], a:1 },
  { q: "Which product helps centrally enforce DLP and discovery across Cloud Storage and BigQuery?", opts:["Cloud Data Loss Prevention (DLP)","Cloud Armor","Cloud Identity","Cloud KMS"], a:0 },
  { q: "To minimize IAM sprawl, prefer:", opts:["Granting roles at project level to many users","Granting roles to groups and service accounts","Granting owner role widely","Not using IAM"], a:1 },
  { q: "Which GCP service helps you manage secrets like DB passwords?", opts:["Secret Manager","Cloud KMS","Cloud SQL","Cloud Storage"], a:0 },
  { q: "Which feature of Cloud Storage reduces cost for infrequent access but keeps single API?", opts:["Multi-regional","Nearline/Coldline","Bucket sharding","Object versioning"], a:1 },
  { q: "Which approach is best when designing fault-tolerant apps across regions?", opts:["Use single region only","Deploy stateless services across multiple regions and use global LB","Use single zone with backups","Use one region and manual failover"], a:1 },
  { q: "Which tool gives infrastructure drift detection and change history for GCP resources?", opts:["Cloud Audit Logs + Config Connector / Terraform state","Cloud Logging only","Cloud Console only","Cloud Monitoring"], a:0 },
  { q: "Which is best for short-lived compute tasks triggered by events?", opts:["Compute Engine instances","Cloud Run or Cloud Functions","GKE long-lived pods","App Engine Flexible"], a:1 },
  { q: "Which GCP offering is best for running VM-optimized workloads with sustained use discounts?", opts:["App Engine","Compute Engine with sustained discounts","Cloud Run","Cloud Functions"], a:1 },
  { q: "To centralize billing and set budgets, use:", opts:["Billing accounts + Budgets & Alerts","Project quotas only","IAM roles","Organization policy"], a:0 },
  { q: "Which GCP service provides fully-managed Spark clusters with autoscaling?", opts:["Dataproc","Dataflow","BigQuery","Compute Engine"], a:0 },
  { q: "Which service to use for consistent global configuration and constraints across resources?", opts:["Cloud IAM only","Organization Policy","Resource Manager only","Cloud Permissions"], a:1 },
  { q: "For cross-project logging export and retention, export logs to:", opts:["Another project or BigQuery or Cloud Storage via Logging sinks","Same project only","Only Cloud Storage","Only BigQuery"], a:0 },
  { q: "Which is the correct approach to provide GKE nodes with service account access to GCP APIs?", opts:["Use user credentials on node","Use Workload Identity or node service account properly scoped","Embed keys in images","Use root account"], a:1 },
  { q: "Which service is intended for OLAP analytics with ANSI SQL?", opts:["Cloud SQL","BigQuery","Cloud Spanner","Firestore"], a:1 },
  { q: "Which technique helps prevent data exfiltration from BigQuery?", opts:["IAM & authorized views, column-level policies, VPC Service Controls","Only firewall rules","Only logging","Only encryption"], a:0 },
  { q: "Which service would you choose to provide a managed message queue for async tasks?", opts:["Cloud Tasks","Cloud Scheduler","Pub/Sub","Cloud Functions"], a:2 },
  { q: "Which mechanism issues short-lived credentials to a Google Cloud resource to access other services?", opts:["Long-lived keys","Workload Identity / OAuth tokens","Manual user keys","Service account keys in code"], a:1 },
  { q: "Which service allows you to centrally run and manage VMs at scale with automatic upgrades?", opts:["Managed Instance Groups","Standalone VM","GKE","Compute Engine unmanaged instance"], a:0 },
  { q: "Which product provides managed container image registry with vulnerability scanning?", opts:["Container Registry / Artifact Registry with Container Analysis","Cloud Storage","Cloud Build only","GCR only"], a:0 },
  { q: "Which choice reduces latency and cost by caching responses at edge locations?", opts:["Cloud CDN","Cloud Router","Cloud NAT","Cloud Armor"], a:0 },
  { q: "Which network security product helps mitigate DDoS attacks at the edge?", opts:["Cloud NAT","Cloud Armor","VPC Service Controls","Firewall"], a:1 },
  { q: "Which storage solution supports block storage attached to VMs?", opts:["Cloud Storage","Persistent Disk","Filestore","Bigtable"], a:1 },
  { q: "Which method ensures minimal blast radius for service account credentials?", opts:["Give broad roles to service accounts","Use per-service accounts with least privilege & Workload Identity","Share one account across many services","Embed keys in source code"], a:1 },
  { q: "Which service is best for streaming data ingestion for near real-time analytics?", opts:["Cloud Storage","Pub/Sub","BigQuery batch only","Cloud SQL"], a:1 },
  { q: "Which CLI command deploys an App Engine app?", opts:["gcloud app deploy","gcloud run deploy","gcloud compute instances create","kubectl apply"], a:0 },
  { q: "Which feature provides a virtual private network across projects or organizations?", opts:["VPC Peering","Shared VPC","Cloud Router only","Cloud Interconnect"], a:1 },
  { q: "Which GCP offering supports multi-cloud or hybrid Kubernetes deployments and policy enforcement?", opts:["GKE Autopilot","Anthos","Cloud Run","App Engine"], a:1 },
  { q: "Which approach gives you a single control plane to enforce security across services?", opts:["Per-VM firewalls only","Service mesh (Anthos Service Mesh)","VPC only","Cloud CDN"], a:1 },
  { q: "Which service is used to run stateful MySQL with high availability and backups?", opts:["Cloud SQL","Cloud Spanner","Firestore","BigQuery"], a:0 },
  { q: "Which way is recommended to provide least-privilege for a CI/CD pipeline to deploy infra?", opts:["Use static user credentials","Use short-lived service account tokens / Workload Identity and minimal roles","Use owner account","Use root credentials"], a:1 },
  { q: "Which component controls ingress/firewall behavior for GKE workloads?", opts:["Cloud Armor & Ingress controllers with firewall rules","Cloud SQL","Cloud Run only","Cloud Functions"], a:0 },
  { q: "Which approach helps secure data when using external collaborators?", opts:["Grant owner role","Use IAM conditions, VPC Service Controls, and least privilege","Share keys via email","Copy data to personal accounts"], a:1 },
  { q: "Which method to manage secrets in CI/CD pipelines securely?", opts:["Store secrets in plain YAML","Use Secret Manager and grant ephemeral access","Hardcode secrets","Use Cloud Storage without IAM"], a:1 },
  { q: "Which GCP product helps orchestrate Apache Airflow workflows?", opts:["Cloud Composer","Dataflow","Data Fusion","Workflows"], a:0 }
]; /* <-- end questions (100 entries) */


let current = 0;
let answers = Array(questions.length).fill(null);
let visited = Array(questions.length).fill(false);
let review = Array(questions.length).fill(false);
let quizStarted = false;
let quizCompleted = false;
let timerInterval = null;
let timeLeftSecs = 2 * 60 * 60;
let candidateEmail = "";

/* Prevent copy, cut, paste, and right-click context menu */
document.addEventListener("copy", e => e.preventDefault());
document.addEventListener("cut", e => e.preventDefault());
document.addEventListener("paste", e => e.preventDefault());
document.addEventListener("contextmenu", e => e.preventDefault());

/* ============ Login / Coupon / Camera Flow ============= */
function handleLogin(){
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const err = document.getElementById("loginError");
  if(email===demoUser.email && pass===demoUser.password){
    err.style.display = "none";
    candidateEmail = email;
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("couponOverlay").style.display = "flex";
  } else {
    err.style.display = "block";
  }
}

function handleCoupon(){
  const code = document.getElementById("couponInput").value.trim();
  const err = document.getElementById("couponError");
  if(code === validCoupon){
    err.style.display = "none";
    document.getElementById("couponOverlay").style.display = "none";
    document.getElementById("cameraOverlay").style.display = "flex";
  } else {
    err.style.display = "block";
  }
}

let cameraStream = null;
async function startCamera(){
  try{
    cameraStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
    const vid = document.getElementById("cameraVideo");
    vid.srcObject = cameraStream;
    setTimeout(() => {
      document.getElementById("cameraOverlay").style.display = "none";
      stopCamera();
      initExam();
    }, 1200);
  }catch(e){
    alert("Camera access required. Allow camera and try again.");
  }
}
function stopCamera(){
  if(cameraStream){
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}
function cancelCamera(){
  stopCamera();
  document.getElementById("cameraOverlay").style.display = "none";
  document.getElementById("couponOverlay").style.display = "flex";
}

/* ============ Sidebar Camera ============ */
function startSidebarCamera() {
  const video = document.getElementById("liveCameraVideo");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(function(stream) {
        video.srcObject = stream;
        window._sidebarCameraStream = stream;
      })
      .catch(function(err) {
        video.style.display = "none";
      });
  } else {
    video.style.display = "none";
  }
}
function stopSidebarCamera() {
  if (window._sidebarCameraStream) {
    window._sidebarCameraStream.getTracks().forEach(track => track.stop());
    window._sidebarCameraStream = null;
  }
}

/* ============ Exam initialization ============ */
function initExam(){
  document.getElementById("mainPage").style.display = "grid";
  quizStarted = true;
  visited[current] = true;
  renderQuestion(current);
  renderPalette();
  updateCounters();
  startTimer();
  attachProctoring();
  startSidebarCamera();
}

/* ============ Render question & options ============ */
function renderQuestion(idx){
  current = idx;
  document.getElementById("qTitle").innerText = `Quant - Question ${idx+1}`;
  document.getElementById("qText").innerText = questions[idx].q;
  const wrap = document.getElementById("optionsWrap");
  wrap.innerHTML = "";
  questions[idx].opts.forEach((opt, i) => {
    const label = document.createElement("label");
    label.className = "option" + (answers[idx]===i ? " active" : "");
    label.innerHTML = `<input type="radio" name="opt" value="${i}" ${answers[idx]===i?'checked':''} /> <span>${String.fromCharCode(65+i)}. ${opt}</span>`;
    label.onclick = () => {
      answers[idx] = i;
      visited[idx] = true;
      review[idx] = false;
      renderQuestion(idx);
      renderPalette();
      updateCounters();
    };
    wrap.appendChild(label);
  });
  document.getElementById("prevBtn").disabled = idx===0;
  document.getElementById("nextBtn").style.display = (idx === questions.length-1) ? "none" : "inline-block";
  visited[idx] = true;
  renderPalette();
  updateCounters();
}

/* ============ Palette (sidebar) ============ */
function renderPalette(){
  const grid = document.getElementById("paletteGrid");
  grid.innerHTML = "";
  let answeredCount = 0;
  questions.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "palbox";
    if(idx === current){
      div.classList.add("current");
      div.innerText = idx+1;
    } else if(review[idx]){
      div.classList.add("review");
      div.innerText = idx+1;
    } else if(answers[idx] != null){
      div.classList.add("answered");
      div.innerText = idx+1;
      answeredCount++;
    } else if(visited[idx]){
      div.classList.add("not-answered");
      div.innerText = idx+1;
    } else {
      div.classList.add("not-attempted");
      div.innerText = idx+1;
    }
    div.onclick = () => {
      renderQuestion(idx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    grid.appendChild(div);
  });
  document.getElementById("paletteInfo").innerText = `Answered: ${answeredCount} | Remaining: ${questions.length - answeredCount}`;
}

/* ============ Navigation ============ */
function nextQuestion(){
  if(current < questions.length -1) renderQuestion(current+1);
}
function prevQuestion(){
  if(current > 0) renderQuestion(current-1);
}
function toggleReview(){
  review[current] = !review[current];
  renderPalette();
  updateCounters();
}

/* ============ Counters ============ */
function updateCounters(){
  const answered = answers.filter(a => a!=null).length;
  const remaining = questions.length - answered;
  document.getElementById("statusCounter").innerText = `Answered: ${answered} | Remaining: ${remaining}`;
  document.getElementById("paletteInfo").innerText = `Answered: ${answered} | Remaining: ${remaining}`;
}

/* ============ Timer (2 hours) ============ */
function formatHMS(totalSecs){
  const h = String(Math.floor(totalSecs/3600)).padStart(2,'0');
  const m = String(Math.floor((totalSecs%3600)/60)).padStart(2,'0');
  const s = String(totalSecs%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}
function startTimer(){
  timeLeftSecs = 2 * 60 * 60;
  updateTimerDisplay();
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeftSecs--;
    if(timeLeftSecs < 0){
      clearInterval(timerInterval);
      autoSubmit();
      return;
    }
    updateTimerDisplay();
  },1000);
}
function updateTimerDisplay(){
  document.getElementById("timerDisplay").innerText = formatHMS(timeLeftSecs);
  const h = Math.floor(timeLeftSecs/3600);
  const m = Math.floor((timeLeftSecs%3600)/60);
  const s = timeLeftSecs%60;
  document.getElementById("timerSmall").innerText = `${String(h).padStart(2,'0')} hours \u00A0 ${String(m).padStart(2,'0')} minutes \u00A0 ${String(s).padStart(2,'0')} seconds`;
  document.getElementById("topTimer").innerText = formatHMS(timeLeftSecs);
}

/* ============ Submit / results ============ */
function submitTest(){
  if(confirm("Are you sure you want to submit the test? This action cannot be undone.")){
    finishAndShowResults();
  }
}
function autoSubmit(){
  alert("Time finished. Auto-submitting.");
  finishAndShowResults();
}
function finishAndShowResults(){
  quizCompleted = true;
  clearInterval(timerInterval);
  stopSidebarCamera();
  let score = 0;
  answers.forEach((a,i)=>{
    if(a != null && questions[i].a === a) score++;
  });
  const percent = Math.round((score / questions.length) * 100);
  document.getElementById("resultsOverlay").style.display = "flex";
  document.getElementById("resultText").innerHTML = `<p class="small">Score: <strong>${score}</strong> / ${questions.length} (${percent}%)</p><p class="small">Name / Email: ${candidateEmail || 'N/A'}</p>`;
  recordScoreToSheetDB(candidateEmail || "unknown", score);
  document.getElementById("mainPage").style.display = "none";
}

/* ============ Save result helper (SheetDB) ============ */
function recordScoreToSheetDB(name, score){
  const url = "https://sheetdb.io/api/v1/kdhnv1qwbzxqr";
  fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ data: [{ name, score }] })
  }).then(r => {
    console.log("Recorded:", name, score);
  }).catch(e => console.warn("Record failed:", e));
}

/* ============ Proctoring (basic) ============ */
function attachProctoring(){
  document.addEventListener("visibilitychange", () => {
    if(quizStarted && !quizCompleted && document.visibilityState === "hidden"){
      blockTest("Tab switch detected");
    }
  });
  window.addEventListener("blur", () => {
    if(quizStarted && !quizCompleted) blockTest("Window lost focus");
  });
  document.addEventListener("keydown", e => {
    if(quizStarted && !quizCompleted && e.key === "Escape"){
      e.preventDefault();
      blockTest("Escape key detected");
    }
    if(e.ctrlKey && ["c","x","v"].includes(e.key.toLowerCase())){
      e.preventDefault();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if(quizStarted && !document.fullscreenElement){
      blockTest("Fullscreen exit detected");
    }
  });
}
function blockTest(reason){
  quizStarted = false;
  clearInterval(timerInterval);
  stopSidebarCamera();
  alert("Test Blocked: " + reason + "\nContact proctor.");
  document.getElementById("resultsOverlay").style.display = "flex";
  document.getElementById("resultText").innerHTML = `<p class="small">Test Blocked: ${reason}</p>`;
  document.getElementById("mainPage").style.display = "none";
}
function closeResults(){
  document.getElementById("resultsOverlay").style.display = "none";
}
document.addEventListener("keydown", (e)=>{
  if(e.key === "ArrowRight") nextQuestion();
  if(e.key === "ArrowLeft") prevQuestion();
});