(function bustCacheOnce() {
  if (!sessionStorage.getItem("hardReloadDone")) {
    sessionStorage.setItem("hardReloadDone", "1");
    // window.location.reload(true) hint—modern browsers ignore the boolean,
    // but this still forces a reload from server
    window.location.reload(true);
  }
})();

// Show spinner in place of the login button text
function showSpinner() {
  document.getElementById("btnText").style.display = "none";
  document.getElementById("spinner").style.display = "inline-block";
}
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("btnText").style.display = "inline";
}

// Helper to open notes with spinner effect
window.openSessionNotes = function (btn, url) {
  const btnText = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.spinner-circle');

  if (btnText) btnText.style.display = 'none';
  if (spinner) spinner.style.display = 'inline-block';

  setTimeout(() => {
    window.location.href = url;
    // No need to reset button state as we are navigating away
  }, 800);
};

// Auto-refresh logic
function startAutoRefresh() {
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  console.log(`Auto-refresh scheduled in ${REFRESH_INTERVAL / 1000} seconds.`);

  setTimeout(() => {
    console.log("Auto-refreshing page...");
    window.location.reload();
  }, REFRESH_INTERVAL);
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validate that both fields are filled
  if (email.trim() === "" || password.trim() === "") {
    Notiflix.Notify.failure("Please enter both email and password!");
    return;
  }

  // Find the matching user
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    Notiflix.Notify.failure("Invalid credentials!");
    return;
  }

  // Show spinner
  showSpinner();

  setTimeout(() => {
    hideSpinner();
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("cloudUser", JSON.stringify(user)); // Persist for cross-tab/window

    Notiflix.Notify.success(
      `Login successful!<br>Welcome, ${user.name}!<br>Loading dashboard...`,
      {
        timeout: 2500,
        useIcon: true,
        plainText: false,
      }
    );
    // Show loading animation/message
    Notiflix.Loading.standard("Loading your dashboard...");

    // Force hard reload (like Ctrl+Shift+R)
    setTimeout(() => {
      location.reload(true); // true = force reload from server
    }, 1500);
  }, 2000);
}

// Confirm logout with SweetAlert
function confirmLogout() {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, logout",
  }).then((result) => {
    if (result.isConfirmed) {
      logout();
    }
  });
}
function loadPage() {
  // Try sessionStorage first, then localStorage (for cross-page persistence)
  let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!user) {
    user = JSON.parse(localStorage.getItem("cloudUser"));
  }

  const loginContainer = document.getElementById("loginContainer");
  const dashboardContainer = document.getElementById("dashboardContainer");
  const userNameEl = document.getElementById("userName");

  if (!user) {
    if (loginContainer) loginContainer.style.display = "block";
    if (dashboardContainer) dashboardContainer.style.display = "none";

    // If on schedule.html and no user, redirect to login
    if (!loginContainer && dashboardContainer) {
      // We are likely on schedule.html or a protected page without a login form
      window.location.href = "index.html";
      return;
    }
  } else {
    if (userNameEl) userNameEl.innerText = user.name;
    if (loginContainer) loginContainer.style.display = "none";
    if (dashboardContainer) dashboardContainer.style.display = "block";

    setInterval(() => {
      const timeEl = document.getElementById("currentTime");
      if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();
    }, 1000);

    // Start auto-refresh timer
    startAutoRefresh();

    // Load the schedule based on user batch
    // Normalize batch to uppercase for comparison
    const batch = user.batch ? user.batch.toUpperCase() : "";

    if (batch === "ML") {
      loadSchedule(scheduleML);
    } else if (batch === "1APRIL") {
      loadSchedule(schedule1April);
    } else if (batch === "2APRIL") {
      loadSchedule(schedule2April);
    } else if (batch === "DEVOPSAPRIL") {
      loadSchedule(scheduleDevOpsApril);
    } else if (batch === "CLOUDARCHITECTAPRIL") {
      loadSchedule(scheduleCloudArchitectApril);
    } else if (batch === "CLOUDARCHITECTJULY") {
      loadSchedule(schedulecloudarchitectjuly);
    } else if (batch === "ACE20") {
      loadSchedule(scheduleACE20);
    } else if (batch === "ACE21") {
      loadSchedule(scheduleACE21);
    } else if (batch === "ACE22") {
      loadSchedule(scheduleACE22);
    } else if (batch === "ACE23") {
      loadSchedule(scheduleACE23);
    } else if (batch === "ACE24") {
      loadSchedule(scheduleACE24);
    } else if (batch === "ACE75") {
      loadSchedule(scheduleACE75);
    } else if (batch === "ACE4AUGUST") {
      loadSchedule(scheduleACE4AUGUST);
    } else if (batch === "CLOUDDEVOPSAUGUST") {
      loadSchedule(scheduleclouddevopsaugust);
    } else if (batch === "ACEJULY") {
      loadSchedule(scheduleACEjuly);
    } else if (batch === "ACE") {
      loadSchedule(scheduleACE);
    } else if (batch === "GENAI") {
      loadSchedule(scheduleGenAI);
    } else if (batch === "GENAI101") {
      loadSchedule(scheduleGenAI101);
    } else if (batch === "ACE35") {
      loadSchedule(scheduleACE35);
    } else {
      // Default fallback
      loadSchedule(schedule);
    }
  }
}

// Logout function with Notiflix notification
function logout() {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (user) {
    Notiflix.Notify.info(`Goodbye, ${user.name}.`);
  }

  // 1. Clear all session data
  localStorage.removeItem('cloudUser');
  localStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('loggedInUser');

  // 2. Double check clearing
  localStorage.clear();
  sessionStorage.clear();

  // 3. Redirect to Learn Portal
  setTimeout(() => {
    window.location.href = 'https://learn.dcinfotech.org.in';
  }, 1000);
}
// Default schedule data (for non-ML batches)
const schedule = [
  {
    day: "Mon, March 3, 2025 (its recorded session)",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Google Cloud Fundamentals: Core Infrastructure",
    details:
      "If you're facing difficulties in understanding the concepts, kindly watch this for a better understanding of the fundamentals.",
    recording:
      "https://www.youtube.com/playlist?list=PLoW9FRX7ypD63XAvW0xd6LtKSHtfQLJJ7",
  },
  {
    day: "Mon, March 3, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details:
      "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and the command-line interface to perform common tasks.",
    link: "https://meet.google.com/zvx-aywk-kui",
    recording: "https://youtu.be/Vf_BvK13P9c",
  },
  {
    day: "Wed, March 5, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details:
      "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
    link: "https://meet.google.com/jgd-fujc-mbx",
    recording: "",
  },
  {
    day: "Mon, March 10, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details:
      "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
    link: "https://meet.google.com/ofc-irsg-fup?pli=1",
    recording: "https://youtu.be/amfLe2SKrts",
  },
  {
    day: "Wed, March 12, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details:
      "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
    link: "https://meet.google.com/vip-kuyw-hgj",
    recording: "https://youtu.be/vic0Pu6n7OE",
  },
  {
    day: "Mon, March 17, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details:
      "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
    link: "https://meet.google.com/xfz-nodk-yfu",
    recording: "https://www.youtube.com/live/eePyesuTB2Y?si=z4m1FC0BN7igfSFS",
  },

  {
    day: "Mon, March 17, 2025",
    time: "2:00 PM - 4:00 PM GMT+5:30",
    description:
      "Exam Readiness Workshop Associate Cloud Engineer (Those who are interested can attend the workshop We Will Arrange One More When Training is Done)",
    details:
      "This workshop is designed to help you understand the exam structure, review the types of questions you will encounter, and build a strategy for success.",
    link: "https://meet.google.com/ckb-anew-prr",
    recording: "https://youtu.be/2mwT6h7pVRw",
  },
  {
    day: "Wed, March 19, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details:
      "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
    link: "https://meet.google.com/wxc-mpkx-tut",
    recording: "https://www.youtube.com/live/RolbPMrwKQ4?si=FxdxKQUBaXWVTK9j",
  },

  {
    day: "Thursday, March 27, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description:
      "Academy - Cloud Digital Leader Workshop (Two training sessions available, join as per your preferred time).",
    details:
      "A comprehensive workshop covering cloud fundamentals, digital transformation, and Google Cloud solutions. Interns can join either of the two available sessions based on their convenience.",
    link: "https://meet.google.com/ton-fqac-nix",
    recording: "https://youtu.be/Pfc0zzBp0Ac",
  },

  {
    day: "Fri, April 11, 2025",
    time: "2:00 PM - 4:00 PM GMT+5:30",
    description: "Exam Readiness Workshop Associate Cloud Engineer ",
    details:
      "This workshop is designed to help you understand the exam structure, review the types of questions you will encounter, and build a strategy for success.",
    link: "https://meet.google.com/wmz-cfzt-ehe",
    recording: "https://youtu.be/2mwT6h7pVRw",
  },
];
const scheduleACE20 = [
  {
    day: "Wed, August 20, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/cqd-exhd-zvg",
    recording: "https://www.youtube.com/live/FZvkM-Q0RpQ?si=WD42TJ2fLoiMUBzf",
  },
  {
    day: "Thu, August 21, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/cqd-exhd-zvg",
    recording: "https://www.youtube.com/live/v-r3yNkB_X8?si=-5teOlNa8Oef7hoI",
  },
  {
    day: "Wed, August 27, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/cqd-exhd-zvg",
    recording: "https://youtu.be/amfLe2SKrts",
  },
  {
    day: "Thu, August 28, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/cqd-exhd-zvg",
    recording: "https://youtu.be/NP5gS3dd8hM",
  },
  {
    day: "Wed, September 3, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/cqd-exhd-zvg",
    recording: "https://youtu.be/TGVV_dcl6iY",
  },
  {
    day: "Thu, September 4, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/cqd-exhd-zvg",
    recording: "https://www.youtube.com/live/ksw7CxBvjGw?si=knrdmhfty71Wy9Sm",
  },
];
const schedule1April = [
  {
    day: "Thursday, March 27, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Academy - Cloud Digital Leader Workshop ",
    details:
      "A comprehensive workshop covering cloud fundamentals, digital transformation, and Google Cloud solutions. Interns can join either of the two available sessions based on their convenience.",
    link: "https://meet.google.com/ton-fqac-nix",
    recording: "https://youtu.be/Pfc0zzBp0Ac",
  },

  {
    day: "Thu, April 3, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/bni-bvby-dun",
    recording: "https://youtu.be/FnmVMpaaj8I",
  },
  {
    day: "Fri, April 4, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/bni-bvby-dun",
    recording: "https://www.youtube.com/live/lPYyXBCbmHQ",
  },
  {
    day: "Thu, April 10, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/bni-bvby-dun",
    recording: "https://youtu.be/dXHwQn4NVT4",
  },
  {
    day: "Fri, April 11, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/bni-bvby-dun",
    recording: "https://www.youtube.com/live/GqoUpUa6T34?si=lNzK85h0mXMBqFds",
  },
  {
    day: "Mon, April 14, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/bni-bvby-dun",
    recording: "https://www.youtube.com/live/eePyesuTB2Y",
  },
  {
    day: "Tue, April 15, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/bni-bvby-dun",
    recording: "https://www.youtube.com/live/ksw7CxBvjGw?si=knrdmhfty71Wy9Sm",
  },
];
const schedule2April = [
  {
    day: "Mon, July 21, 2025",
    time: "9:00 PM - 11:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/wch-sgev-gxm",
    recording: "https://youtube.com/live/bi4Ap169s6Y?feature=share",
  },
  {
    day: "Tue, April 15, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/jmv-xezh-prf",
    recording: "https://youtu.be/h7UBr_YLA-g",
  },
  {
    day: "Mon, April 21, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/sfn-jdzz-pae",
    recording: "https://youtu.be/5bCRY_uN3PQ",
  },
  {
    day: "Tue, April 22, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/cue-mdet-vws",
    recording: "https://youtu.be/pW01YHFrJgU",
  },
  {
    day: "Mon, April 28, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/wch-sgev-gxm",
    recording: "",
  },
  {
    day: "Tue, April 29, 2025",
    time: "9:00 AM - 1:00 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/wch-sgev-gxm",
    recording: "",
  },
];

const scheduleDevOpsApril = [
  {
    day: "Thu, April 3, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 1",
    details: "Agenda: Delivered in English over 3 weeks.",
    link: "https://meet.google.com/fnp-fusk-sic",
  },
  {
    day: "Fri, April 4, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 2",
    details: "Agenda: Delivered in English over 3 weeks.",
    link: "https://meet.google.com/yyx-gvsm-hfa",
  },
  {
    day: "Thu, April 10, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 3",
    details: "Agenda: Delivered in English over 3 weeks.",
    link: "https://meet.google.com/chh-zxvg-gbn",
  },
  {
    day: "Fri, April 11, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 4",
    details: "Agenda: Delivered in English over 3 weeks.",
    link: "https://meet.google.com/bms-xrra-cqx",
  },
  {
    day: "Wed, April 16, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 5",
    details: "Agenda: Delivered in English over 3 weeks.",
    link: "https://meet.google.com/hyh-fvik-mti",
  },
  {
    day: "Thu, April 17, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 6",
    details: "Agenda: Delivered in English over 3 weeks.",
    link: "https://meet.google.com/msa-tnmd-yuj",
  },
];

const scheduleCloudArchitectApril = [

  // -------------------------------
  // December Schedule (Added Below)
  // -------------------------------

  {
    day: "Thu, December 4, 2025 - Fri, December 5, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Cloud Architect workshop Module 1",
    details: "Agenda: delivered in English",
    link: "",
  },
  {
    day: "Fri, December 5, 2025 - Sat, December 6, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Cloud Architect workshop Module 2",
    details: "Agenda: delivered in English",
    link: "",
  },
  {
    day: "Wed, December 10, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Cloud Architect workshop Module 3",
    details: "Agenda: delivered in English",
    link: "",
  },
  {
    day: "Thu, December 11, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Cloud Architect workshop Module 4",
    details: "Agenda: delivered in English",
    link: "",
  },
  {
    day: "Mon, December 15 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Cloud Architect workshop Module 5",
    details: "Agenda: delivered in English",
    link: "",
  },
  {
    day: "Tue, December 16, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Cloud Architect workshop Module 6",
    details: "Agenda: delivered in English",
    link: "",
  }];
const scheduleAll = [
  {
    day: "Mon, September 22, 2025",
    time: "12:30 PM - 8:30 PM GMT+5:30",
    description: "GenAI25235 Deploy Multi-Agent Systems with Agent Dev Kit and Agent Engine",
    details: "Agenda: Build multi-agent systems using Agent Development Kit, deploy and manage agent flows in Agent Engine",
    link: "https://meet.google.com/vuc-fymj-ksy"
  },

  {
    day: "Tue, November 11, 2025",
    time: "1:30 PM - 3:30 PM GMT+5:30",
    description: "Exam Readyness Workshop For ACE ",
    details: "",
    link: "https://meet.google.com/sva-ncpr-hgo"
  },

  {
    day: "Mon, September 22, 2025",
    time: "12:45 PM - 3:30 PM GMT+5:30",
    description: "GenAI25328 Build with Vertex AI – Technical Expert Badge (Day 1)",
    details: "Agenda: Extend Gemini with controlled generation and tool use",
    link: "https://meet.google.com/zze-qujk-xai"
  },
  {
    day: "Mon, September 23, 2025",
    time: "1:05 PM - 3:30 PM GMT+5:30",
    description: "GenAI25328 Build with Vertex AI – Technical Expert Badge (Day 2)",
    details: "Agenda: Extend Gemini with controlled generation and tool use",
    link: "https://meet.google.com/ubu-waad-bxn"
  },
  {
    day: "Mon, September 22, 2025",
    time: "1:45 PM - 5:00 PM GMT+5:30",
    description: "GenAI25327 Customer Engagement Suite with Google AI – Technical Expert Badge (Day 1)",
    details: "Agenda: Build conversational agents with Playbooks and Flows",
    link: "https://meet.google.com/moq-obxz-oyd"
  },
  {
    day: "Tue, September 23, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "GenAI25236 Accelerate Knowledge Exchange with Google Agentspace",
    details: "Agenda: Use Agentspace dashboards, build search agents, connect data stores, accelerate collaboration",
    link: "https://meet.google.com/hve-hwif-pks"
  },
  {
    day: "Fri, October 3, 2025",
    time: "12:15 PM - 8:30 PM GMT+5:30",
    description: "GenAI25594 Build Vertex AI Search and Google Agentspace Apps",
    details: "Agenda: Create and configure Vertex AI Search and Google Agentspace apps, deploy recommendation engines",
    link: "https://meet.google.com/qpq-ggsm-kyy",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Mon, October 13, 2025",
    time: "1:15 PM - 4:30 PM GMT+5:30",
    description: "GenAI25597 Introduction to Google Agentspace",
    details: "Agenda: Agentspace overview, architecture, enterprise use cases",
    link: "https://meet.google.com/ydg-souq-eii",
    recording: "https://youtube.com/live/Fs_H_I0F_OI?feature=share"


  },

  // ---------------- New Agendas Added ----------------
  {
    day: "Sat, November 22, 2025",
    time: "12:40 AM - 5:00 PM GMT+5:30",
    description: "Demo session for testing ",
    details: "Agenda: delivered in English",
  },

  {
    day: "Mon, November 24, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Data Warehousing",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/pyg-utgs-iig",
    recording: "https://youtube.com/live/Fs_H_I0F_OI?feature=share"
  },
  {
    day: "Tue, November 25, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Data Warehousing",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/qpq-udzj-jwm",
    recording: "https://youtube.com/live/Fs_H_I0F_OI?feature=share"


  },
  {
    day: "Wed, November 26, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Data Warehousing",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/agv-eguy-cff",
    recording: "https://youtube.com/live/Fs_H_I0F_OI?feature=share"
  },
  {
    day: "Thu, November 27, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Data Warehousing",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/jdo-moyf-kic",
    recording: "https://youtube.com/live/Fs_H_I0F_OI?feature=share"
  },
  {
    day: "Mon, December 1, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Design and Manage Oracle Workloads on Google Cloud",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/qjz-hykn-hsa",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Wed, November 12, 2025",
    time: "2:30 PM - 10:30 PM GMT+5:30",
    description: "Enterprise Database Migration",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rea-vuyj-zpn",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Thu, November 13, 2025",
    time: "2:30 PM - 10:30 PM GMT+5:30",
    description: "Enterprise Database Migration",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/pai-msqi-oqh",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Fri, November 14, 2025",
    time: "2:30 PM - 10:30 PM GMT+5:30",
    description: "Enterprise Database Migration",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/hzg-zwqy-rpq",
    recording: "https://youtu.be/7njG8Yh0xEA"
  }, {
    day: "Mon, December 1, 2025",
    time: "7:30 AM - 3:30 PM GMT+5:30",
    description: "Google Workspace - Work Transformation",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tsj-ionk-jpu",
    recording: "https://youtu.be/7njG8Yh0xEA"

  },
  {
    day: "Tue, December 2, 2025",
    time: "7:30 AM - 3:30 PM GMT+5:30",
    description: "Google Workspace - Work Transformation",
    details: "Agenda: delivered in English",
  }, {
    day: "Mon, December 15, 2025",
    time: "1:30 PM - 9:30 PM GMT+5:30",
    description: "Implement and Migrate Google Cloud VMware Engine Day-1",
    details: "Agenda: delivered in English",
  },
  {
    day: "Tue, December 16, 2025",
    time: "1:30 PM - 9:30 PM GMT+5:30",
    description: "Implement and Migrate Google Cloud VMware Engine Day-2",
    details: "Agenda: delivered in English",
  },
  {
    day: "Wed, December 17, 2025",
    time: "1:30 PM - 9:30 PM GMT+5:30",
    description: "Implement and Migrate Google Cloud VMware Engine Day-3",
    details: "Agenda: delivered in English",
  },
  {
    day: "Thu, December 18, 2025",
    time: "1:30 PM - 9:30 PM GMT+5:30",
    description: "Implement and Migrate Google Cloud VMware Engine Day-4",
    details: "Agenda: delivered in English",
  }, {
    day: "Mon, December 15, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Manage Scalable Workloads in GKE Enterprise",
    details: "Agenda: delivered in English",
  },
  {
    day: "Tue, December 16, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Manage Scalable Workloads in GKE Enterprise",
    details: "Agenda: delivered in English",
  },
  {
    day: "Wed, December 17, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Manage Scalable Workloads in GKE Enterprise",
    details: "Agenda: delivered in English",
  }, {
    day: "Mon, December 8, 2025",
    time: "7:30 AM - 3:30 PM GMT+5:30",
    description: "Managing Change for Google Workspace",
    details: "Agenda: delivered in English",
  },
  {
    day: "Tue, December 9, 2025",
    time: "7:30 AM - 3:30 PM GMT+5:30",
    description: "Managing Change for Google Workspace",
    details: "Agenda: delivered in English",
  }, {
    day: "Mon, November 17, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Migrating Virtual Machines to Google Cloud",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tvf-fvcs-yvc",
    recording: "https://youtu.be/7njG8Yh0xEA"

  },
  {
    day: "Tue, November 18, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Migrating Virtual Machines to Google Cloud",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/pbk-udzy-aoc",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Wed, November 19, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Migrating Virtual Machines to Google Cloud",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/mgv-biap-bhc",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Thu, November 20, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Migrating Virtual Machines to Google Cloud",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/fyr-qujf-ugg",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },






















  {
    day: "Fri, November 14, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Application Development with LLMs on Google Cloud",
    details: "Agenda: Learn to design and deploy large language model applications on Google Cloud.",
    link: "https://meet.google.com/ncp-apfn-ihv",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Mon, November 19, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Developing Data Models with LookML",
    details: "Agenda: Learn to design LookML models for data analytics.",
    link: "https://meet.google.com/pty-qudo-ixo",
    recording: "https://youtu.be/7njG8Yh0xEA"
  },
  {
    day: "Mon, November 24, 2025",
    time: "10:00 AM - 6:00 PM GMT+5:30",
    description: "Developing APIs with Google Cloud's Apigee API Platform (Day 1)",
    details: "Agenda: Build, secure, and manage APIs using Apigee.",
    link: "https://meet.google.com/nhk-wmnt-bgi",
    recording: ""

  },
  {
    day: "Tue, November 25, 2025",
    time: "10:00 AM - 6:00 PM GMT+5:30",
    description: "Developing APIs with Google Cloud's Apigee API Platform (Day 2)",
    details: "Agenda: Continue exploring Apigee API development and deployment.",
    link: "https://meet.google.com/nhk-wmnt-bgi",
    recording: ""
  },
  {
    day: "Wed, November 26, 2025",
    time: "10:00 AM - 6:00 PM GMT+5:30",
    description: "Developing APIs with Google Cloud's Apigee API Platform (Day 3)",
    details: "Agenda: Production readiness, troubleshooting, and monitoring.",
    link: "https://meet.google.com/nhk-wmnt-bgi",
    recording: ""
  },
  {
    day: "Thu, November 27, 2025",
    time: "6:30 PM - 9:30 PM GMT+5:30",
    description: "Deploy a RAG application with vector search in Firestore",
    details: "Agenda: Learn to build no-code business apps using Google AppSheet.",
    link: "https://meet.google.com/rxh-gewd-yjz",
    recording: ""
  },
  {
    day: "Mon, December 1, 2025",
    time: "10:00 AM - 6:00 PM GMT+5:30",
    description: "Managing Google Cloud’s Apigee API Platform for Hybrid Cloud (Day 1)",
    details: "Agenda: Manage Apigee API Platform across hybrid environments.",
    link: "https://meet.google.com/aam-zffi-isa",
    recording: ""

  },
  {
    day: "Tue, December 2, 2025",
    time: "10:00 AM - 6:00 PM GMT+5:30",
    description: "Managing Google Cloud’s Apigee API Platform for Hybrid Cloud (Day 2)",
    details: "Agenda: API monitoring, hybrid deployment strategies."
  },
  {
    day: "Wed, December 3, 2025",
    time: "10:00 AM - 6:00 PM GMT+5:30",
    description: "Managing Google Cloud’s Apigee API Platform for Hybrid Cloud (Day 3)",
    details: "Agenda: Advanced configurations and automation."
  },
  {
    day: "Mon, December 1, 2025",
    time: "1:30 PM - 9:30 PM GMT+5:30",
    description: "Deploy Multi-Agent Systems with Agent Development Kit and Agent Engine",
    details: "Agenda: Learn to build, train, and deploy multi-agent systems using ADK and Agent Engine.",
    link: "https://meet.google.com/fna-qcou-vvq",
    recording: ""
  },
  {
    day: "Tue, December 2, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Accelerate Knowledge Exchange with Gemini Enterprise",
    details: "Agenda: Explore Gemini Enterprise for data insights and collaboration."
  },
  {
    day: "Mon, December 1, 2025",
    time: "8:30 PM - 11:30 PM GMT+5:30",
    description: "Introduction to Gemini Enterprise",
    details: "Agenda: Overview of Gemini Enterprise, capabilities, and setup.",
    link: "https://meet.google.com/fna-qcou-vvq",
    recording: ""
  },
  {
    day: "Wed, December 17, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Architecting with Google Kubernetes Engine (Day 1)",
    details: "Agenda: Explore Kubernetes architecture, GKE components, and deployments."
  },
  {
    day: "Thu, December 18, 2025",
    time: "9:00 AM - 5:00 PM GMT+5:30",
    description: "Architecting with Google Kubernetes Engine (Day 2)",
    details: "Agenda: Advanced Kubernetes features, autoscaling, and production design."
  },
  {
    day: "Mon, December 1, 2025",
    time: "1:15 PM - 9:30 PM GMT+5:30",
    description: "Develop Apps with Conversational Agents [GenAI25224]",
    details: "Agenda: Build conversational AI apps with stateful agents and best practices.",
    link: "https://meet.google.com/sqe-mzfa-qqp",
    recording: ""
  }
];


// Associate Cloud Engineer (ACE) schedule data for July 2025
// This schedule includes the training sessions for the Associate Cloud Engineer workshop in July and August 202

// Associate Cloud Engineer (ACE) schedule data for July 2025 scheduleclouddevopsaugust

const scheduleclouddevopsaugust = [
  {
    day: "Mon, August 18, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 1",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/frm-gxok-pmt",
  },
  {
    day: "Tue, August 19, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 2",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/frm-gxok-pmt",
  },
  {
    day: "Mon, August 25, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 3",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/frm-gxok-pmt",
  },
  {
    day: "Tue, August 26, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 4",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/frm-gxok-pmt",
  },
  {
    day: "Mon, September 1, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 5",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/frm-gxok-pmt",
  },
  {
    day: "Tue, September 2, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud DevOps Engineer workshop Module 6",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/frm-gxok-pmt",
  },
];

const scheduleACEjuly = [
  {
    day: "Tue, July 1, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/gfe-gqtc-vac",
  },
  {
    day: "Thu, July 3, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ukw-yyox-chf",
  },
  {
    day: "Tue, July 8, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/vvb-vqae-cug",
  },
  {
    day: "Thu, July 10, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/jgm-oodu-wac",
  },
  {
    day: "Tue, July 15, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
  },
  {
    day: "Thu, July 17, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/vgr-mnzj-jqo",
  },
];

const scheduleACE = [
  {
    day: "Wed, June 25, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
    recording: "https://www.youtube.com/live/FZvkM-Q0RpQ?si=WD42TJ2fLoiMUBzf",
  },
  {
    day: "Wed, July 2, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
    recording: "https://www.youtube.com/live/v-r3yNkB_X8?si=-5teOlNa8Oef7hoI",
  },
  {
    day: "Thu, July 3, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
    recording: "https://youtu.be/amfLe2SKrts",
  },
  {
    day: "Wed, July 9, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
    recording: "https://youtu.be/NP5gS3dd8hM",
  },
  {
    day: "Thu, July 10, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
    recording: "https://youtu.be/TGVV_dcl6iY",
  },
  {
    day: "Mon, July 14, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
  },
]; // Generative AI Leader + Cloud Security Engineer schedule data
const scheduleGenAI = [
  {
    day: "Mon, June 23, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Security Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ghk-sybw-hrw", // Add meet link here if available
  },

  {
    day: "Tue, June 24, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Security Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ghk-sybw-hrw", // Add meet link here if available
  },
  {
    day: "Mon, June 30, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Security Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ghk-sybw-hrw", // Add meet link here if available
  },
  {
    day: "Tue, July 1, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Security Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ghk-sybw-hrw", // Add meet link here if available
  },
  {
    day: "Mon, July 7, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Security Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ghk-sybw-harw", // Add meet link here if available
  },
  {
    day: "Tue, July 8, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Security Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ghk-sybw-hrw", // Add meet link here if available
  },
];

const scheduleGenAI101 = [
  {
    day: "Tue, August 5, 2025",
    time: "7:30 PM - 3:30 AM GMT+5:30",
    description: "Academy - Generative AI Leader workshop",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ghk-sybw-hrw", // Add meet link here if available
  },

  {
    day: "Thu, September 4, 2025",
    time: "2:00 PM - 4:00 PM GMT+5:30",
    description: "Exam Readiness Workshop Associate Cloud Engineer",
    details: `Agenda: delivered in English over 1 day
Thu, September 4, 2025 - Thu, September 4, 2025
2:00 PM - 4:00 PM GMT+5:30
Exam Readiness Workshop Associate Cloud Engineer
A "join" button that will appear in the agenda 15 minutes before the meeting. Refresh the page and if the button does not appear, open the page in an incognito window and sign in.`,
    link: "https://meet.google.com/xna-xasz-ukt",
  },
  {
    day: "Thu, September 4, 2025",
    time: "6:30 PM - 9:00 PM GMT+5:30",
    description: "Google Agents - Deep Dive",
    details: `Agenda: delivered in English over 1 day
Thu, September 4, 2025 - Thu, September 4, 2025
6:30 PM - 9:00 PM GMT+5:30
Google Agents - Deep Dive
Speakers: Alan Blount, Elia Secchi, Heiko Hotz, Sokratis Kartakis, Gabriela Hernandez Larios, Ivan Nardini

This 2.5 h workshop will provide a comprehensive technical overview of building and evaluating AI agents on Google Cloud. It will deep-dive into the Agent Development Kit (ADK), highlighting the Agent2Agent (A2A) protocol for multi-agent communication and the Model Context Protocol (MCP) for tool integration. 

The session will also introduce the Agent Starter Pack, providing tooling and infrastructure to accelerate agent deployment and integrate GenAIOps principles. Attendees will gain critical insights into agent architectures, memory management, and robust evaluation and observability methods within Vertex AI, enabling them to efficiently build, debug, and optimize scalable agentic systems for their customers. (L200 with reference to Colabs, repos and Skillsboost Labs).

A "join" button will appear in the agenda 15 minutes before the meeting. Refresh the page and if the button does not appear, open the page in an incognito window and sign in.`,
    link: "https://meet.google.com/aid-yfik-dkv",
    recording:
      "https://drive.google.com/file/d/1lufO3VaftM7W31LT1Is8HLxl1nsYdLZN/view",
  },

  {
    day: "Fri, August 8, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description:
      "Accelerate knowledge exchange with Google Agentspace [GenAI25255] (Open to all, RE holders can attend the workshop)",
    details: `Welcome to the Google Cloud Gen AI program! 
We're excited to have you on board for the technical product training.
Add the live training to your calendar and join to accelerate your knowledge exchange with Google Agentspace.`,
    link: "https://meet.google.com/vxq-mtxm-mho", // Add the meeting link if available
    recording: "",
    isNew: true,
  },
  {
    day: "Fri, August 29, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description:
      "Deploy Multi-Agent Systems with Agent Development Kit and Agent Engine",
    details: `Create your account!
This session will guide you through deploying multi-agent systems using the Agent Development Kit and Agent Engine. 
Don't forget to add it to your calendar.`,
    link: "https://meet.google.com/apq-xcod-gzk", // Add the meeting link if available
    recording: "",
    isNew: true,
  },

  // === New Sessions from DSMA & Vertex AI TEB ===

  {
    day: "Wed, September 3, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description:
      "Develop apps with Conversational Agents Session 1 [GenAI25261]",
    details: `Welcome to Develop apps with Conversational Agents [GenAI25261] technical product training!
We're excited to help you gain a thorough understanding of your chosen Google Cloud product. 
Add the live training to your calendar and prepare for a hands-on learning experience.`,
    link: "https://meet.google.com/mcp-ucjs-ziu", // Add the calendar or meeting link if available
    recording: "",
    isNew: true,
  },
  {
    day: "Thu, September 4, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description:
      "Develop apps with Conversational Agents Session 2 [GenAI25261]",
    details: `This is the second session of Develop apps with Conversational Agents [GenAI25261].
Make sure you've completed the first session. Prepare your environment and join for an in-depth discussion and exercises.`,
    link: "https://meet.google.com/dwm-fgbw-mef", // Add the calendar or meeting link if available
    recording: "https://youtu.be/Fs_H_I0F_OI",
    isNew: true,
  },
  {
    day: "Tue, September 9, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description:
      "Extend Gemini with controlled generation and tool use [GenAI25338]",
    details: `Welcome to Build with Vertex AI TEB [GenAI25338]!
This session focuses on using Gemini with advanced generation controls and integrating external tools.`,
    link: "https://meet.google.com/hdg-uqqt-rmc", // Add the calendar or meeting link if available
    recording: "https://youtube.com/live/olMMMDYgPko?feature=share",
    isNew: true,
  },
  {
    day: "Wed, September 10, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description:
      "Build gen AI solutions using Model Garden models and APIs [GenAI25338]",
    details: `In this session of Build with Vertex AI TEB, you'll learn to leverage Google's Model Garden models and APIs for scalable gen AI solutions.`,
    link: "https://meet.google.com/kao-fwud-hpr", // Add the calendar or meeting link if available
    recording: "",
    isNew: true,
  },
  {
    day: "Thu, September 11, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description: "Edit images with Imagen [GenAI25338]",
    details: `Explore the power of Imagen in this hands-on workshop. 
Learn to edit and manipulate images using GenAI tools from the Google Cloud suite.`,
    link: "https://meet.google.com/iaq-iskx-hbi", // Add the calendar or meeting link if available
    recording: "",
    isNew: true,
  },
  {
    day: "Fri, September 12, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description:
      "Deploy a RAG application with vector search in Firestore [GenAI25338]",
    details: `In this session, dive into Retrieval-Augmented Generation (RAG) with Firestore vector search. 
You'll deploy a functional RAG app using Vertex AI components.`,
    link: "https://meet.google.com/ubj-zbax-hqq", // Add the calendar or meeting link if available
    recording: "",
    isNew: true,
  },
  {
    day: "Mon, September 15, 2025",
    time: "9:00 AM - 11:00 AM GMT+5:30",
    description: "Evaluate gen AI model and agent performance [GenAI25338]",
    details: `Wrap up your Vertex AI TEB journey by learning how to evaluate the performance of your gen AI models and agents with real metrics and best practices.`,
    link: "https://meet.google.com/dxq-tsrk-nqb", // Add the calendar or meeting link if available
    recording: "",
    isNew: true,
  },




];

const scheduleACE4AUGUST = [
  {
    day: "Mon, August 4, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/xni-ycdy-wzu",
    recording: "https://www.youtube.com/live/FZvkM-Q0RpQ?si=WD42TJ2fLoiMUBzf",
  },
  {
    day: "Wed, August 6, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/bte-rspz-cze",
    recording: "https://www.youtube.com/live/v-r3yNkB_X8?si=-5teOlNa8Oef7hoI",
  },
  {
    day: "Mon, August 11, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/suf-gpqe-xvk",
    recording: "https://youtu.be/amfLe2SKrts",
  },
  {
    day: "Wed, August 13, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/dju-bxrm-qko",
    recording: "https://youtu.be/NP5gS3dd8hM",
  },
  {
    day: "Mon, August 18, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/dfp-ogrs-qoe",
    recording: "https://youtu.be/TGVV_dcl6iY",
  },
  {
    day: "Wed, August 20, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/tks-hvio-xhg",
    recording: "https://www.youtube.com/live/ksw7CxBvjGw?si=knrdmhfty71Wy9Sm",
  },
];
const scheduleACE21 = [
  {
    day: "Mon, September 1, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/eeq-pevo-crw",
    recording: "https://www.youtube.com/live/FZvkM-Q0RpQ?si=WD42TJ2fLoiMUBzf",
  },
  {
    day: "Wed, September 3, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/pga-zzjz-mmf",
    recording: "https://www.youtube.com/live/v-r3yNkB_X8?si=-5teOlNa8Oef7hoI",
  },
  {
    day: "Mon, September 8, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/iap-niqc-qvx",
    recording: "https://youtu.be/amfLe2SKrts",
  },
  {
    day: "Wed, September 10, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/fox-vxta-cwz",
    recording: "https://youtu.be/NP5gS3dd8hM",
  },
  {
    day: "Mon, September 15, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/ihh-qosn-uux",
    recording: "https://youtu.be/TGVV_dcl6iY",
  },
  {
    day: "Wed, September 17, 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/wkj-vtme-gso",
    recording: "https://www.youtube.com/live/ksw7CxBvjGw?si=knrdmhfty71Wy9Sm",
  },
];

const scheduleACE35 = [
  {
    day: "Fri, August 29, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/uba-jegf-xqb",
    recording: "",
  },
  {
    day: "Thu, September 4, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/uba-jegf-xqb",
    recording: "",
  },
  {
    day: "Fri, September 5, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/zex-jnam-sac",
    recording: "",
  },
  {
    day: "Thu, September 11, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/uba-jegf-xqb",
    recording: "",
  },
  {
    day: "Fri, September 12, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/uba-jegf-xqb",
    recording: "",
  },
  {
    day: "Thu, September 18, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/uba-jegf-xqb",
    recording: "",
  },
  {
    day: "Fri, September 19, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 7",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/uba-jegf-xqb",
    recording: "",
  },
];

const scheduleACE22 = [
  {
    day: "Mon, September 15, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Gen AI Basics Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/skm-jnqm-hkh",
    recording: "https://youtube.com/live/02j6O0K6J-Q?feature=share",
  },
  {
    day: "Wed, October 15, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/rfn-wnjd-cor",
    recording: "https://youtube.com/live/GBqu-J6EQ2o?feature=share",
  },
  {
    day: "Thu, October 16, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/wmb-udrv-whf",
    recording: "https://youtube.com/live/v-r3yNkB_X8?feature=share",
  },
  {
    day: "Wed, October 22, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/bsn-qqvh-jxv",
    recording: "",
  },
  {
    day: "Thu, October 23, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/fvg-xrpa-eus",
    recording: "https://youtube.com/live/NP5gS3dd8hM?feature=share",
  },
  {
    day: "Wed, October 29, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tiw-ishi-fps",
    recording: "https://youtube.com/live/TGVV_dcl6iY?feature=share",
  },
  {
    day: "Thu, October 30, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/hya-brcr-fza",
    recording: "https://youtube.com/live/RolbPMrwKQ4?feature=share",
  }
];






const scheduleACE23 = [

  {
    day: "Mon, November 3, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    link: "https://meet.google.com/ift-uvov-gvy",
    recording: "https://youtube.com/live/GBqu-J6EQ2o?feature=share",
  },
  {
    day: "Wed, November 5, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    link: "https://meet.google.com/yjn-tvqs-asg",
    recording: "",
  },
  {
    day: "Mon, November 10, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    link: "",
    recording: "",
  },
  {
    day: "Wed, November 12, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    link: "https://meet.google.com/afu-awsu-cyf",
    recording: "",
  },
  {
    day: "Mon, November 17, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    link: "https://meet.google.com/izb-tbhi-tha",
    recording: "",
  },
  {
    day: "Wed, November 19, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    link: "https://meet.google.com/qmu-phhp-rvv",
    recording: "",
  },
];






const scheduleACE24 = [
  {
    day: "Mon, December 1, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English over 2 weeks",
    link: "https://meet.google.com/eec-stho-fvt",
    recording: "https://youtube.com/live/GBqu-J6EQ2o?feature=share",
  },
  {
    day: "Wed, December 3, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English over 2 weeks",
    link: "",
    recording: "https://youtube.com/live/v-r3yNkB_X8?feature=share",
  },
  {
    day: "Fri, December 5, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English over 2 weeks",
    link: "",
    recording: "",
  },
  {
    day: "Mon, December 8, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English over 2 weeks",
    link: "",
    recording: "https://youtube.com/live/NP5gS3dd8hM?feature=share",
  },
  {
    day: "Wed, December 10, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English over 2 weeks",
    link: "",
    recording: "https://youtube.com/live/TGVV_dcl6iY?feature=share",
  },
  {
    day: "Fri, December 12, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English over 2 weeks",
    link: "",
    recording: "https://youtube.com/live/RolbPMrwKQ4?feature=share",
  },
];









const scheduleACE75 = [

  // --- Associate Cloud Engineer Workshop ---
  {
    day: "Mon, December 8, 2025",
    time: "20:30 - 00:30 GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "",
    recording: "",
  },
  {
    day: "Tue, December 9, 2025",
    time: "20:30 - 00:30 GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "",
    recording: "",
  },
  {
    day: "Wed, December 10, 2025 ",
    time: "20:30 - 00:30 GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "",
    recording: "",
  },
  {
    day: "Mon, December 15, 2025 ",
    time: "20:30 - 00:30 GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "",
    recording: "",
  },
  {
    day: "Tue, December 16, 2025 ",
    time: "20:30 - 00:30 GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "",
    recording: "",
  },
  {
    day: "Wed, December 17, 2025 ",
    time: "20:30 - 00:30 GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "",
    recording: "",
  },
];
// Cloud Developer schedule data
const scheduleclouddeveloper = [
  {
    day: "Thu, August 7, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Cloud Developer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/yzz-hpfa-ekm",
  },
  {
    day: "Fri, August 8, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Cloud Developer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/yzz-hpfa-ekm",
  },
  {
    day: "Thu, August 14, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Cloud Developer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/yzz-hpfa-ekm",
  },
  {
    day: "Fri, August 15, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Cloud Developer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/yzz-hpfa-ekm",
  },
  {
    day: "Thu, August 21, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Cloud Developer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/yzz-hpfa-ekm",
  },
  {
    day: "Fri, August 22, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Professional Cloud Developer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/yzz-hpfa-ekm",
  },
];

// Machine Learning (ML) schedule data
const scheduleML = [
  {
    day: "Mon, October 6, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 1",
    details: "Agenda: delivered in English",
    link: "",
  },
  {
    day: "Tue, October 7, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 2",
    details: "Agenda: delivered in English",
    link: "",
  },
  {
    day: "Mon, October 13, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 3",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tct-uozr-pnz",
  },
  {
    day: "Tue, October 14, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 4",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tct-uozr-pnz",
  },
  {
    day: "Mon, October 20, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 5",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tct-uozr-pnz",
  },
  {
    day: "Tue, October 21, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 6",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tct-uozr-pnz",
  },
  {
    day: "Mon, October 27, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 7",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tct-uozr-pnz",
  },
  {
    day: "Tue, October 28, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 8",
    details: "Agenda: delivered in English",
    link: "https://meet.google.com/tct-uozr-pnz",
  },

  {
    day: "Thu, November 6, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 1",
    details: "Agenda: delivered in English over 4 weeks",
    link: "https://meet.google.com/aga-zeno-hzb",
  },
  {
    day: "Fri, November 7, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 2",
    details: "Agenda: delivered in English over 4 weeks",
    link: "https://meet.google.com/msk-aayx-kor",
  },
  {
    day: "Thu, November 13, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 3",
    details: "Agenda: delivered in English over 4 weeks",
    link: "https://meet.google.com/bxz-azqw-jai",
  },
  {
    day: "Fri, November 14, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 4",
    details: "Agenda: delivered in English over 4 weeks",
    link: "https://meet.google.com/guo-czqq-ftp",
  },
  {
    day: "Thu, November 20, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 5",
    details: "Agenda: delivered in English over 4 weeks",
    link: "",
  },
  {
    day: "Fri, November 21, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 6",
    details: "Agenda: delivered in English over 4 weeks",
    link: "",
  },
  {
    day: "Thu, November 27, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 7",
    details: "Agenda: delivered in English over 4 weeks",
    link: "https://meet.google.com/zva-ehhh-brz",
  },
  {
    day: "Fri, November 28, 2025",
    time: "1:30 PM - 5:30 PM GMT+5:30",
    description:
      "Academy - Professional Machine Learning Engineer workshop Module 8",
    details: "Agenda: delivered in English over 4 weeks",
    link: "",
  },
];

//21 july 2025 schedule for Associate Cloud Engineer workshop
// This schedule includes the training sessions for the Associate Cloud Engineer workshop in July and August 202
const scheduleAceJuly2025 = [
  {
    day: "Mon, July 21, 2025",
    time: "7:30 PM - 11:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 1",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/xaa-ewvx-bts",
    recording: "",
  },
  {
    day: "Tue, July 22, 2025",
    time: "7:30 PM - 10:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 2",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/xaa-ewvx-bts",
    recording: "",
  },
  {
    day: "Mon, July 28, 2025",
    time: "7:30 PM - 10:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 3",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/xaa-ewvx-bts",
    recording: "",
  },
  {
    day: "Tue, July 29, 2025",
    time: "7:30 PM - 10:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 4",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/xaa-ewvx-bts",
    recording: "",
  },
  {
    day: "Mon, August 4, 2025",
    time: "7:30 PM - 10:30 PM GMT+5:30",

    description: "Academy - Associate Cloud Engineer workshop Module 5",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/xaa-ewvx-bts",
    recording: "",
  },
  {
    day: "Tue, August 5, 2025",
    time: "7:30 PM - 10:30 PM GMT+5:30",
    description: "Academy - Associate Cloud Engineer workshop Module 6",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/xaa-ewvx-bts",
    recording: "",
  },
];
const scheduleNetworkAugust2025 = [
  {
    day: "Mon, 4 August 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Network Engineer workshop Module 1",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/dmb-fodn-fxc", // As per the note in the image
    recording: "",
  },
  {
    day: "Wed, 6 August 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Network Engineer workshop Module 2",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/mim-drvd-bmf",
    recording: "",
  },
  {
    day: "Mon, 11 August 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Network Engineer workshop Module 3",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/suf-gpqe-xvk",
    recording: "",
  },
  {
    day: "Wed, 13 August 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Network Engineer workshop Module 4",
    details: "Agenda: delivered in English over 3 weeks",
    link: "Join button will appear 15 minutes before",
    recording: "https://meet.google.com/yjg-bdgv-gho",
  },
  {
    day: "Mon, 18 August 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Network Engineer workshop Module 5",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/sjn-kkry-ymg",
    recording: "",
  },
  {
    day: "Wed, 20 August 2025",
    time: "12:30 PM - 4:30 PM GMT+5:30",
    description:
      "Academy - Professional Cloud Network Engineer workshop Module 6",
    details: "Agenda: delivered in English over 3 weeks",
    link: "https://meet.google.com/qgk-czun-bgb",
    recording: "",
  },
];


const schedulePDE01 = [
  {
    day: "Thu, December 4, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 1",
    details: "Agenda: delivered in English",
  },
  {
    day: "Fri, December 5, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 2",
    details: "Agenda: delivered in English",
  },
  {
    day: "Mon, December 8, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 3",
    details: "Agenda: delivered in English",
  },
  {
    day: "Tue, December 9, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 4",
    details: "Agenda: delivered in English",
  },
  {
    day: "Fri, December 12, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 5",
    details: "Agenda: delivered in English",
  },
  {
    day: "Mon, December 15, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 6",
    details: "Agenda: delivered in English",
  },
  {
    day: "Tue, December 16, 2025",
    time: "8:30 PM - 12:30 AM GMT+5:30",
    description: "Academy - Professional Data Engineer workshop Module 7",
    details: "Agenda: delivered in English",
  },
];


///

function loadSchedule(selectedSchedule) {
  console.log("loadSchedule called with:", selectedSchedule ? selectedSchedule.length : "undefined", "items");
  const sessions = [...(selectedSchedule || schedule), ...scheduleAll];
  console.log("Total sessions to process:", sessions.length);
  const container = document.getElementById("schedule");
  if (!container) {
    console.log("No schedule container found, skipping render.");
    return;
  }
  container.innerHTML = "";

  const now = new Date();
  console.log("Now:", now.toString());

  const ongoing = [],
    upcoming = [],
    past = [];

  sessions.forEach((sess) => {
    try {
      if (sess.time === "TBA") return upcoming.push(sess);

      const [startStrRaw, endStrRaw] = sess.time.split(" - ");
      const startStr =
        startStrRaw.trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
      const endStr = endStrRaw
        ? endStrRaw.trim().replace(/\s+GMT.*$/, "") + " GMT+0530"
        : null;

      const start = new Date(`${sess.day} ${startStr}`);
      const end = endStr ? new Date(`${sess.day} ${endStr}`) : null;

      if (isNaN(start)) {
        console.warn("Invalid start date", sess);
        return upcoming.push(sess); // fallbackdd
      }

      if (end && now > end) past.push(sess);
      else if (now >= start) ongoing.push(sess);
      else upcoming.push(sess);
    } catch (err) {
      console.error("Date parsing error:", sess, err);
    }
  });

  // 1. Calculate Progress
  const totalSessions = sessions.length;
  // Count watched sessions from localStorage
  const watchedSessions = JSON.parse(localStorage.getItem('watched_sessions') || '[]');
  // A session is completed if it's in the past OR marked as watched
  const completedCount = sessions.filter(s => {
    const isPast = new Date(s.day + ' ' + s.time.split(' - ')[0].replace(/\s+GMT.*$/, "") + " GMT+0530") < new Date();
    const isWatched = watchedSessions.includes(s.day + s.time);
    return isPast || isWatched;
  }).length;

  const progressPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // 2. Inject Progress Bar
  const progressHTML = `
    <div class="progress-container">
      <div class="progress-header">
        <span>Course Progress</span>
        <span>${progressPercent}% Completed</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
      </div>
    </div>
  `;

  function render(title, list) {
    if (!list.length) return;
    const grp = document.createElement("div");
    grp.innerHTML = `<h3>${title}</h3>`;
    list.forEach((s) => grp.appendChild(createSessionElement(s)));
    container.appendChild(grp);
  }

  // Inject Progress Bar before sessions
  container.innerHTML = progressHTML;

  render("Ongoing Sessions", ongoing);
  render("Upcoming Sessions", upcoming);
  render("Past Sessions", past);

  // 3. Start Countdown for Next Session
  if (upcoming.length > 0) {
    // Sort upcoming by date to find the true next session
    upcoming.sort((a, b) => {
      const dateA = new Date(a.day + ' ' + a.time.split(' - ')[0].replace(/\s+GMT.*$/, "") + " GMT+0530");
      const dateB = new Date(b.day + ' ' + b.time.split(' - ')[0].replace(/\s+GMT.*$/, "") + " GMT+0530");
      return dateA - dateB;
    });

    const nextSession = upcoming[0];
    // We need a way to identify this specific element to update its badge
    // Let's add a special ID or class to it in createSessionElement, 
    // but since we render them in a loop, we can just find it by content or add logic in createSessionElement.
    // Better approach: Pass a flag to createSessionElement
  }

  // Re-render to pass 'isNext' flag
  container.innerHTML = progressHTML; // Reset

  const renderWithNext = (title, list) => {
    if (!list.length) return;
    const grp = document.createElement("div");
    grp.innerHTML = `<h3>${title}</h3>`;
    list.forEach((s, index) => {
      const isNext = (title === "Upcoming Sessions" && index === 0);
      grp.appendChild(createSessionElement(s, isNext));
    });
    container.appendChild(grp);
  };

  renderWithNext("Ongoing Sessions", ongoing);
  renderWithNext("Upcoming Sessions", upcoming);
  renderWithNext("Past Sessions", past);

  // Start Countdown Timer
  if (upcoming.length > 0) {
    startCountdown(upcoming[0]);
  }

  setTimeout(() => loadSchedule(selectedSchedule), 60000);
}

let countdownInterval;
function startCountdown(session) {
  clearInterval(countdownInterval);
  const badge = document.getElementById('countdown-badge');
  if (!badge) return;

  const startStr = session.time.split(" - ")[0].trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
  const targetDate = new Date(`${session.day} ${startStr}`).getTime();

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      badge.innerHTML = "Starting Now";
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    badge.innerHTML = `<i class="fas fa-clock"></i> Starts in: ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}

function createSessionElement(session, isNext = false) {
  try {
    if (!session.time) {
      console.warn("Session missing time:", session);
      return document.createComment("Invalid session: missing time");
    }

    const now = new Date();
    const parts = session.time.split(" - ");
    const startStrRaw = parts[0];
    const endStrRaw = parts[1]; // might be undefined

    const startStr = startStrRaw.trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
    const endStr = endStrRaw
      ? endStrRaw.trim().replace(/\s+GMT.*$/, "") + " GMT+0530"
      : null;

    const start = new Date(`${session.day} ${startStr}`);
    const end = endStr ? new Date(`${session.day} ${endStr}`) : null;

    // Timezone Conversion Logic
    let displayTime = session.time;
    if (typeof useLocalTime !== 'undefined' && useLocalTime) {
      const options = { hour: 'numeric', minute: 'numeric', hour12: true };
      const localStart = start.toLocaleTimeString([], options);
      const localEnd = end ? end.toLocaleTimeString([], options) : '';
      displayTime = `${localStart} - ${localEnd} (Local)`;
    }

    if (isNaN(start)) {
      console.warn("Invalid date in session:", session);
      return document.createComment("Invalid session: invalid date");
    }

    const openAt = new Date(start.getTime() - 10 * 60 * 1000);
    const hasEnded = end && now > end;
    const isOngoing = now >= start && (!end || now <= end);
    const canJoin = now >= openAt && (!end || now <= end);

    const liveBadge = isOngoing
      ? `<span class="status-badge live"><i class="fas fa-circle"></i> Live</span>`
      : hasEnded
        ? `<span class="status-badge completed"><i class="fas fa-check-circle"></i> Completed</span>`
        : `<span class="status-badge upcoming"><i class="fas fa-calendar"></i> Upcoming</span>`;

    const countdownBadge = isNext
      ? `<div id="countdown-badge" class="countdown-badge"><i class="fas fa-clock"></i> Starts in: --h --m --s</div>`
      : "";

    // Add to Calendar Logic
    let addToCalendarBtn = "";
    if (canJoin || (!hasEnded && !isOngoing)) {
      const startISO = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const endISO = end ? end.toISOString().replace(/-|:|\.\d\d\d/g, "") : startISO;
      const details = encodeURIComponent(session.description + " - " + session.details);
      const location = encodeURIComponent(session.link || "Online");
      const title = encodeURIComponent(session.description);

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}&location=${location}`;

      addToCalendarBtn = `
            <a href="${calendarUrl}" target="_blank" class="add-calendar-btn" title="Add to Google Calendar">
                <i class="far fa-calendar-plus"></i> Add to Calendar
            </a>
        `;
    }

    const btnHTML = hasEnded
      ? session.recording
        ? `<button disabled>Session Ended</button>
            <a href="${session.recording}" target="_blank"><button>View Recording</button></a>`
        : `<button disabled>Session Ended</button>
            <a href="javascript:void(0)" onclick="alert('Recording not available for this session. Please contact support@dcinfotech.org.in for more info.');">
            <button>View Recording</button>
            </a>`
      : canJoin
        ? `<a href="${session.link}" target="_blank"><button>Join</button></a>`
        : `<button disabled>Join</button>`;

    const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || JSON.parse(localStorage.getItem("cloudUser")) || {};
    const batch = user.batch ? user.batch.toUpperCase() : "ACE";
    const notesLink = batchToNotes[batch] || "notes.html?track=ace";

    const el = document.createElement("div");
    el.className = "session";

    // Instructor Profile
    const instructorHTML = `
        <div class="instructor-profile">
            <img src="https://ui-avatars.com/api/?name=Dhiraj+Chaudhari&background=0b57d0&color=fff" class="instructor-avatar" alt="Instructor">
            <div class="instructor-info">
                <span class="instructor-name">Instr. Dhiraj</span>
                <a href="https://www.linkedin.com/in/dhirajchaudhari/" target="_blank" class="instructor-link">Connect on LinkedIn</a>
            </div>
        </div>
    `;

    // Resources Dropdown
    const resourcesHTML = `
        <div class="resources-dropdown">
            <button class="resources-btn"><i class="fas fa-folder-open"></i> Resources <i class="fas fa-chevron-down"></i></button>
            <div class="resources-menu">
                <a href="#" class="resource-item"><i class="fas fa-file-powerpoint"></i> Slide Deck</a>
                <a href="https://github.com/dhirajchaudhari" target="_blank" class="resource-item"><i class="fab fa-github"></i> Code Samples</a>
                <a href="https://cloud.google.com/docs" target="_blank" class="resource-item"><i class="fas fa-book"></i> Reference Docs</a>
            </div>
        </div>
    `;

    // QR Code
    const qrCodeHTML = canJoin ? `
        <div class="qr-code-wrapper" title="Scan to join on mobile">
            <i class="fas fa-qrcode"></i>
            <div class="qr-code-popup">
                <img src="https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(session.link)}" class="qr-code-img" alt="QR Code">
                <div style="text-align:center; font-size:0.7rem; margin-top:4px;">Scan to Join</div>
            </div>
        </div>
    ` : '';

    // Watched Checkbox
    const isWatched = (JSON.parse(localStorage.getItem('watched_sessions') || '[]')).includes(session.day + session.time);
    const watchedHTML = hasEnded ? `
        <div class="watched-wrapper">
            <label class="watched-label">
                <input type="checkbox" class="watched-checkbox" ${isWatched ? 'checked' : ''} 
                       onchange="toggleWatched('${session.day + session.time}', this)">
                Mark as Watched / Attended
            </label>
        </div>
    ` : '';

    // Rate Session Button
    const rateBtnHTML = hasEnded ? `
        <button class="btn-secondary" style="font-size:0.8rem; padding:4px 12px; margin-top:8px;" onclick="document.getElementById('feedbackModal').style.display='flex'">
            <i class="far fa-star"></i> Rate Session
        </button>
    ` : '';

    el.innerHTML = `
        ${instructorHTML}
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h4>${session.day} ${countdownBadge}</h4>
            <div style="display:flex; align-items:center; gap:8px;">
                ${liveBadge}
                ${qrCodeHTML}
            </div>
        </div>
        <p>${displayTime}</p>
        <p>${session.description}</p>
        
        <div class="session-details">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:12px;">
                <p style="margin:0;">Meeting Link:</p>
                <div style="display:flex; gap:8px;">
                    ${resourcesHTML}
                    ${addToCalendarBtn}
                </div>
            </div>
            ${btnHTML}
            ${rateBtnHTML}
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
            <button class="remind-me-btn"
            onclick="sendReminder('${session.day}', '${session.time}', '${session.description}', '${session.link}')">
            Remind Me</button>
        </div>
        ${watchedHTML}
        
        <p style="margin-top:12px; font-size:0.85rem; color:var(--text-medium);">
            For support: <a href="https://dcinfotech.org.in/live-chat">Live Chat</a>
        </p>

    <p>If you can't see the trainer’s lecture notes,
    <button class="lecture-notes-btn" onclick="openSessionNotes(this, 'notes/${notesLink}')">
        <span class="btn-text">Click here</span>
        <div class="spinner-circle" style="display: none; width: 16px; height: 16px; border-width: 2px; vertical-align: middle;"></div>
    </button>
    </p>

    `;
    return el;
  } catch (err) {
    console.error("Error creating session element:", session, err);
    const errEl = document.createElement("div");
    errEl.style.color = "red";
    errEl.innerText = "Error loading session details.";
    return errEl;
  }
}

const batchToNotes = {
  ACE: "notes.html?track=ace",
  ACEJULY: "notes.html?track=ace",
  ACEJULY2025: "notes.html?track=ace",
  ACE4AUGUST: "notes.html?track=ace",
  DEVOPS: "notes.html?track=devops",
  CLOUDARCHITECT: "notes.html?track=pca",
  CLOUDARCHITECTJULY: "notes.html?track=pca",
  CLOUDDEVELOPER: "notes.html?track=developer",
  CLOUDDEVOPSAUGUST: "notes.html?track=devops",
  GENAI: "notes.html?track=gen-ai",
  ML: "notes.html?track=ml-engineer",
  SECURITY: "notes.html?track=security",
  PCA: "notes.html?track=pca",
  DIGITALLEADER: "notes.html?track=digital-leader",
  NETWORKAUGUST2025: "notes.html?track=network",
  ACE20: "notes.html?track=ace",
  ACE21: "notes.html?track=ace",
  ACE22: "notes.html?track=ace",
  ACE23: "notes.html?track=ace",
  ACE24: "notes.html?track=ace",

  ACE75: "notes.html?track=ace",


  PDE01: "notes.html?track=data-engineer",




  ACE35: "notes.html?track=data-engineer",
};

const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
let notesLink = "index.html"; // defaultfgg
if (user && user.batch) {
  const batches = Array.isArray(user.batch) ? user.batch : [user.batch];
  for (const b of batches) {
    const upper = b.toUpperCase();
    if (batchToNotes[upper]) {
      notesLink = batchToNotes[upper];
      break;
    }
  }
}
// -------------------------
// Page Loader by batch
// -------------------------
function loadPage() {
  try {
    // Try sessionStorage first, then localStorage (for cross-page persistence)
    let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) {
      user = JSON.parse(localStorage.getItem("cloudUser"));
    }

    const loginContainer = document.getElementById("loginContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    const userNameEl = document.getElementById("userName");
    const timeEl = document.getElementById("currentTime");

    if (!user) {
      if (loginContainer) loginContainer.style.display = "block";
      if (dashboardContainer) dashboardContainer.style.display = "none";

      // If on schedule.html and no user, redirect to login
      if (!loginContainer && dashboardContainer) {
        window.location.href = "index.html";
        return;
      }
      return;
    }

    if (userNameEl) userNameEl.innerText = user.name;
    if (loginContainer) loginContainer.style.display = "none";
    if (dashboardContainer) dashboardContainer.style.display = "block";

    setInterval(() => {
      if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();
    }, 1000);

    const batches = Array.isArray(user.batch)
      ? user.batch.map((b) => b.toUpperCase())
      : [user.batch.toUpperCase()];

    if (batches.includes("ML")) loadSchedule(scheduleML);
    else if (batches.includes("1APRIL")) loadSchedule(schedule1April);
    else if (batches.includes("DEVOPS")) loadSchedule(scheduleDevOpsApril);
    else if (batches.includes("CLOUDARCHITECT"))
      loadSchedule(scheduleCloudArchitectApril);
    else if (batches.includes("2APRIL")) loadSchedule(schedule2April);
    else if (batches.includes("ACEJULY")) loadSchedule(scheduleACEjuly);
    else if (batches.includes("ACE")) loadSchedule(scheduleACE);
    else if (batches.includes("GENAI")) loadSchedule(scheduleGenAI);
    else if (batches.includes("ACEJULY2025")) loadSchedule(scheduleAceJuly2025);
    else if (batches.includes("CLOUDDEVELOPER"))
      loadSchedule(scheduleclouddeveloper);
    else if (batches.includes("CLOUDARCHITECTJULY"))
      loadSchedule(schedulecloudarchitectjuly);
    else if (batches.includes("CLOUDDEVOPSAUGUST"))
      loadSchedule(scheduleclouddevopsaugust);
    else if (batches.includes("GENAI101")) loadSchedule(scheduleGenAI101);
    else if (batches.includes("ACE4AUGUST")) loadSchedule(scheduleACE4AUGUST);
    else if (batches.includes("ACE20")) loadSchedule(scheduleACE20);
    else if (batches.includes("ACE21")) loadSchedule(scheduleACE21);
    else if (batches.includes("PCA25")) loadSchedule(schedulePCA25);
    else if (batches.includes("ACE75")) loadSchedule(scheduleACE75);
    else if (batches.includes("ACE22")) loadSchedule(scheduleACE22);
    else if (batches.includes("PDE01")) loadSchedule(schedulePDE01);
    else if (batches.includes("ACE23")) loadSchedule(scheduleACE23);
    else if (batches.includes("ACE24")) loadSchedule(scheduleACE24);

    else if (batches.includes("ACE35")) loadSchedule(scheduleACE35);
    else if (batches.includes("NETWORKAUGUST2025"))
      loadSchedule(scheduleNetworkAugust2025);
    else {
      console.log("No matching batch found, loading default schedule");
      loadSchedule(schedule);
    }
  } catch (e) {
    console.error("Error in loadPage:", e);
    const loginContainer = document.getElementById("loginContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    if (loginContainer) loginContainer.style.display = "block";
    if (dashboardContainer) dashboardContainer.style.display = "none";
  }
}

// -------------------------
// Reminder helper
// -------------------------
function sendReminder(day, time, description, link) {
  // Check both sessionStorage and localStorage
  const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || JSON.parse(localStorage.getItem("cloudUser"));

  if (!user || !user.email) {
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please log in to set a reminder.',
      confirmButtonColor: '#1a73e8'
    });
    return;
  }

  try {
    const [sRaw, eRaw] = time.split(" - ");
    // Clean up time strings
    const cleanStart = sRaw.trim().replace(/ GMT.*$/, "");
    const cleanEnd = eRaw ? eRaw.trim().replace(/ GMT.*$/, "") : "";

    const start = new Date(`${day} ${cleanStart} GMT+0530`);
    const end = eRaw ? new Date(`${day} ${cleanEnd} GMT+0530`) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour if no end time

    if (isNaN(start.getTime())) {
      console.error("Invalid date parsed:", `${day} ${cleanStart}`);
      throw new Error("Invalid date format");
    }

    const details = [
      `Dear Learner,`,
      ``,
      `Event: ${description}`,
      `Join here: ${link || "Link will be available on the portal"}`,
      ``,
      `Thanks!`,
    ].join("\n");

    const formatDate = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const dates = `${formatDate(start)}/${formatDate(end)}`;

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(description) +
      "&dates=" +
      dates +
      "&details=" +
      encodeURIComponent(details) +
      "&location=" +
      encodeURIComponent("https://dcinfotech.org.in/cloud-training/");

    window.open(url, "_blank");
  } catch (error) {
    console.error("Reminder Error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to create reminder. Please try again.',
      confirmButtonColor: '#d93025'
    });
  }
}

// -------------------------
// Boot
// -------------------------
document.addEventListener("DOMContentLoaded", loadPage);

// Hide loader when page is fully loaded
window.addEventListener("load", function () {
  setTimeout(hideLoader, 500); // Faster hide
});

// Fallback in case window.load fired before script ran
setTimeout(hideLoader, 2000);

function hideLoader() {
  const loader = document.getElementById("root-loader");
  if (loader) {
    loader.classList.add("hidden");
    loader.style.display = "none"; // Force hide
  }
  // Also ensure dashboard is visible if it was hidden by CSS
  const dashboard = document.getElementById("dashboardContainer");
  const login = document.getElementById("loginContainer");

  // Only show dashboard if we are logged in OR if there is no login container (meaning we are on a protected page like schedule.html)
  if (dashboard && (sessionStorage.getItem("loggedInUser") || !login)) {
    dashboard.style.display = "block";
  }
}

function downloadPDF() {
  const element = document.getElementById("schedule");
  const opt = {
    margin: 1,
    filename: "my-schedule.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  // Use html2pdf to save the file
  html2pdf().set(opt).from(element).save();
}

// Helper to get the correct schedule array for the logged-in user
// Used by my-learning.html to show recordings
function getScheduleForUser() {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || JSON.parse(localStorage.getItem("cloudUser"));
  if (!user) return [];

  const batch = user.batch ? user.batch.toUpperCase() : "";

  if (batch === "ML") return scheduleML;
  if (batch === "1APRIL") return schedule1April;
  if (batch === "2APRIL") return schedule2April;
  if (batch === "DEVOPSAPRIL") return scheduleDevOpsApril;
  if (batch === "CLOUDARCHITECTAPRIL") return scheduleCloudArchitectApril;
  if (batch === "CLOUDARCHITECTJULY") return schedulecloudarchitectjuly;
  if (batch === "ACE20") return scheduleACE20;
  if (batch === "ACE21") return scheduleACE21;
  if (batch === "ACE22") return scheduleACE22;
  if (batch === "ACE23") return scheduleACE23;
  if (batch === "ACE24") return scheduleACE24;
  if (batch === "ACE75") return scheduleACE75;
  if (batch === "ACE4AUGUST") return scheduleACE4AUGUST;
  if (batch === "CLOUDDEVOPSAUGUST") return scheduleclouddevopsaugust;
  if (batch === "ACEJULY") return scheduleACEjuly;
  if (batch === "ACE") return scheduleACE;
  if (batch === "GENAI") return scheduleGenAI;
  if (batch === "GENAI101") return scheduleGenAI101;
  if (batch === "ACE35") return scheduleACE35;

  return schedule; // Default
}

const users = [
  // 3 March batch
  {
    email: "ashishaswal003@gmail.com",
    password: "intern@123",
    name: "Ashish Aswal",
    phone: "7055164392",
    batch: "3MARCH",
  },
  {
    email: "krishna.sandeepkaruturi@dcinfotech.me",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "8722889994",
    batch: "3MARCH",
  },
  {
    email: "sandeepkk1938@gmail.com",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "8722889994",
    batch: "3MARCH",
  },
  {
    email: "preetha.elangovan2318@gmail.com",
    password: "intern@123",
    name: "Preetha Elangovan",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "preetha.elangovan@dcinfotech.me",
    password: "intern@123",
    name: "Preetha Elangovan",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "atharvakumbhar669@gmail.com",
    password: "intern@123",
    name: "Atharva Kishor Kumbhar",
    phone: "8108741281",
    batch: "3MARCH",
  },
  {
    email: "ky964257@gmail.com",
    password: "intern@123",
    name: "Krishna Yadav",
    phone: "06386052158",
    batch: "3MARCH",
  },
  {
    email: "prathameshpathak7@gmail.com",
    password: "intern@123",
    name: "Prathamesh Satish Pathak",
    phone: "8698662408",
    batch: "3MARCH",
  },
  {
    email: "sahilbhosale1309@gmail.com",
    password: "intern@123",
    name: "Sahil Bhosale",
    phone: "9326251178",
    batch: "3MARCH",
  },
  {
    email: "dinesh.borase70@gmail.com",
    password: "intern@123",
    name: "Dinesh Prakash Borase",
    phone: "8308110391",
    batch: "3MARCH",
  },
  {
    email: "prasadramesh963@gmail.com",
    password: "intern@123",
    name: "Ramesh Prasad",
    phone: "9561480153",
    batch: "3MARCH",
  },
  {
    email: "satishtempwork@gmail.com",
    password: "intern@123",
    name: "Satish Kumar Janapureddi",
    phone: "7095885568",
    batch: "3MARCH",
  },

  {
    email: "dhirajchaudhari@dcinfotech.org.in",
    password: "intern@123",
    name: "Dhiraj Chaudhari",
    phone: "N/A",
    batch: "ACE24",
  },


  {
    email: "saadahmedm@dcinfotech.org.in",
    password: "intern@123",
    name: "Saad Ahmed Mohammed	",
    phone: "N/A",
    batch: "ACE75",
  },




  {
    email: "Manith@dcinfotech.org.in",
    password: "intern@123",
    name: "Manith Kumar",
    phone: "N/A",
    batch: "ACE75",
  },




  {
    email: "semileniola@dcinfotech.org.in",
    password: "intern@123",
    name: "Semileniola Salako	",
    phone: "N/A",
    batch: "ACE75",
  },


  {
    email: "vishnu@dcinfotech.org.in",
    password: "intern@123",
    name: "Vishnu Charan Kollapuram Gandla	",
    phone: "N/A",
    batch: "ACE75",
  },





  {
    email: "david@dcinfotech.org.in",
    password: "intern@123",
    name: "David Roper	",
    phone: "N/A",
    batch: "ACE75",
  },


  {
    email: "dominic@dcinfotech.org.in",
    password: "intern@123",
    name: "Dominic Wilson	",
    phone: "N/A",
    batch: "ACE75",
  },





  {
    email: "kunj@dcinfotech.org.in",
    password: "intern@123",
    name: "Kunj Patel",
    phone: "N/A",
    batch: "ACE24",
  },















  {
    email: "nishchalkumargarg@dcinfotech.org.in",
    password: "intern@123",
    name: "Nishchal Kumar Garg",
    phone: "N/A",
    batch: "ACE24",
  },





  {
    email: "vijaypratapsinghhada@dcinfotech.org.in",
    password: "intern@123",
    name: "Vijay Pratap Singh Hada ",
    phone: "N/A",
    batch: "ACE24",
  },




  {
    email: "saisaranruppa@dcinfotech.org.in",
    password: "intern@123",
    name: "Sai Saran Ruppa	 ",
    phone: "N/A",
    batch: "ACE24",
  },



  {
    email: "somepallyvinaysai@dcinfotech.org.in",
    password: "intern@123",
    name: "SOMEPALLY VINAY SAI	 ",
    phone: "N/A",
    batch: "ACE24",
  },







  {
    email: "devendarcharkajithender@dcinfotech.org.in",
    password: "intern@123",
    name: "Devendar Charka Jithender",
    phone: "N/A",
    batch: "ACE24",
  },
  {
    email: "rohiniswethapenmetsa@dcinfotech.org.in",
    password: "intern@123",
    name: "Rohini Swetha Penmetsa",
    phone: "N/A",
    batch: "ACE24",
  },








  {
    email: "dhananjeyangopal@dcinfotech.org.in",
    password: "intern@123",
    name: "DHANANJEYAN GOPAL",
    phone: "N/A",
    batch: "ACE24",
  },







  {
    email: "bhavanak@dcinfotech.org.in",
    password: "intern@123",
    name: "Bhavana K",
    phone: "N/A",
    batch: "ACE24",
  },




  {
    email: "krishnasandeepkaruturi@dcinfotech.org.in",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "N/A",
    batch: "ACE24",
  },




  {
    email: "viveksantoshohal@dcinfotech.org.in",
    password: "intern@123",
    name: "Vivek Santosh Ohal",
    phone: "N/A",
    batch: "ACE24",
  },



























  {
    email: "aishwaryaburud@dcinfotech.org.in",
    password: "intern@123",
    name: "Aishwarya Burud ",
    phone: "N/A",
    batch: "ACE23",
  },

  {
    email: "devasanirajeshwar@dcinfotech.org.in",
    password: "intern@123",
    name: "DEVASANI RAJESHWAR",
    phone: "N/A",
    batch: "ACE23",
  },


  {
    email: "sudheer@dcinfotech.org.in",
    password: "intern@123",
    name: "Sudheer konduboina ",
    phone: "N/A",
    batch: "ACE21",
  },









  {
    email: "bhavesh@dcinfotech.org.in",
    password: "intern@123",
    name: "Bhavesh patidar",
    phone: "N/A",
    batch: "ACE21",
  },

  {
    email: "victor@dcinfotech.org.in",
    password: "intern@123",
    name: "Victor Jonathan",
    phone: "N/A",
    batch: "ACE21",
  },

  {
    email: "arya@dcinfotech.org.in",
    password: "intern@123",
    name: "Arya Wade",
    phone: "N/A",
    batch: "ACE22",
  },



  {
    email: "mitush@dcinfotech.org.in",
    password: "intern@123",
    name: "mitush",
    phone: "N/A",
    batch: "ACE23",
  },





  {
    email: "devangtyagi@dcinfotech.org.in",
    password: "intern@123",
    name: "DEVANG TYAGI ",
    phone: "N/A",
    batch: "ACE23",
  },










  {
    email: "karthikumarbharatmoorthy@dcinfotech.org.in",
    password: "intern@123",
    name: "Karthikumar Bharatmoorthy ",
    phone: "N/A",
    batch: "ML",
  },














  {
    email: "adityagudla@dcinfotech.org.in",
    password: "intern@123",
    name: "Aditya Gudla ",
    phone: "N/A",
    batch: "ACE23",
  },




  {
    email: "rhuturajrameshrogye@dcinfotech.org.in",
    password: "intern@123",
    name: "Rhuturaj Ramesh Rogye",
    phone: "N/A",
    batch: "ACE23",
  },



  {
    email: "iralegurudattavijay@dcinfotech.org.in",
    password: "intern@123",
    name: "Irale Gurudatta Vijay",
    phone: "N/A",
    batch: "ACE23",
  },








  {
    email: "nirmandjoshi@dcinfotech.org.in",
    password: "intern@123",
    name: "Nirman D Joshi",
    phone: "N/A",
    batch: "ACE23",
  },



  {
    email: "mogullaanirudhreddy@dcinfotech.org.in",
    password: "intern@123",
    name: "Mogulla Anirudh Reddy ",
    phone: "N/A",
    batch: "ACE23",
  },

  {
    email: "sripadavenkatasivakanth@dcinfotech.org.in",
    password: "intern@123",
    name: "Sripada Venkata Sivakanth",
    phone: "N/A",
    batch: "ACE23",
  },




  {
    email: "shreejeetpurwar@dcinfotech.org.in",
    password: "intern@123",
    name: "Shreejeet Purwar",
    phone: "N/A",
    batch: "ACE23",
  },









  {
    email: "dampanaboyinavinay@dcinfotech.org.in",
    password: "intern@123",
    name: "DAMPANABOYINA VINAY",
    phone: "N/A",
    batch: "ACE23",
  },



  {
    email: "chinthasaimadhuri@dcinfotech.org.in",
    password: "intern@123",
    name: "Chintha Sai Madhuri",
    phone: "N/A",
    batch: "ACE22",
  },





  {
    email: "vedbapardekar@dcinfotech.org.in",
    password: "intern@123",
    name: "Ved Bapardekar",
    phone: "N/A",
    batch: "ACE22",
  },



















  {
    email: "abdulquddus@dcinfotech.org.in",
    password: "intern@123",
    name: "Abdul Quddus",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ayanroy@dcinfotech.org.in",
    password: "intern@123",
    name: "Ayan Roy",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "devireddyvenkatasaikiranreddy@dcinfotech.org.in",
    password: "intern@123",
    name: "DEVIREDDY VENKATA SAI KIRAN REDDY ",
    phone: "N/A",
    batch: "ACE22",
  },



















  {
    email: "aadityaabhijitsurve@dcinfotech.org.in",
    password: "intern@123",
    name: "Aaditya Abhijit Surve ",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ahmedmohdasifghare@dcinfotech.org.in",
    password: "intern@123",
    name: "Ahmed Mohd Asif Ghare",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "mayursakharamchikane@dcinfotech.org.in",
    password: "intern@123",
    name: "Mayur Sakharam Chikane",
    phone: "N/A",
    batch: "ACE22",
  },



















  {
    email: "lakshyajoshi@dcinfotech.org.in",
    password: "intern@123",
    name: "Lakshya Joshi",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "bhagavath@dcinfotech.org.in",
    password: "intern@123",
    name: "BHAGAVATH B",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "satya@dcinfotech.org.in",
    password: "intern@123",
    name: "Satya Prakash",
    phone: "N/A",
    batch: "ACE22",
  },






  {
    email: "ayesha@dcinfotech.org.in",
    password: "intern@123",
    name: "Ayesha Khan",
    phone: "N/A",
    batch: "ACE22",
  },



  {
    email: "govind@dcinfotech.org.in",
    password: "intern@123",
    name: "Govind Awad",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "raj@dcinfotech.org.in",
    password: "intern@123",
    name: "Raj Joshi",
    phone: "N/A",
    batch: "ACE22",
  },


















  {
    email: "adnan@dcinfotech.org.in",
    password: "intern@123",
    name: "Adnan Chapalgaonkar",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "abhishek@dcinfotech.org.in",
    password: "intern@123",
    name: "Abhishek Singh",
    phone: "N/A",
    batch: "ACE22",
  },
















  {
    email: "ananya@dcinfotech.org.in",
    password: "intern@123",
    name: "Ananya Sharma",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "prachi@dcinfotech.org.in",
    password: "intern@123",
    name: "Prachi Kadu",
    phone: "N/A",
    batch: "ACE22",
  },





  {
    email: "a",
    password: "a",
    name: "Admin",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "nikitha@dcinfotech.org.in",
    password: "intern@123",
    name: "NIKITHA J",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "vedant@dcinfotech.org.in",
    password: "intern@123",
    name: "Vedant Patil",
    phone: "N/A",
    batch: "ACE22",
  },












  {
    email: "sham@dcinfotech.org.in",
    password: "intern@123",
    name: "Sham Patil",
    phone: "N/A",
    batch: "ACE22",
  },



  {
    email: "raja@dcinfotech.org.in",
    password: "intern@123",
    name: "Raja Chourashia",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "mdkhalimaqsood@dcinfotech.org.in",
    password: "intern@123",
    name: "Md khalid maqsood alam",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "hifzurrehman@dcinfotech.org.in",
    password: "intern@123",
    name: "Hifzur Rehman Ansari",
    phone: "N/A",
    batch: "ACE22",
  },


  {
    email: "gurram@dcinfotech.org.in",
    password: "intern@123",
    name: "GURRAM CHENNAIAH",
    phone: "N/A",
    batch: "ACE22",
  },










  {
    email: "mrunal@dcinfotech.org.in",
    password: "intern@123",
    name: "Mrunal Joshi",
    phone: "N/A",
    batch: "ACE22",
  },















  {
    email: "Adarsh@dcinfotech.org.in",
    password: "intern@123",
    name: "Adarsh Singh",
    phone: "N/A",
    batch: "ACE23",
  },

  {
    email: "nikhil@dcinfotech.org.in",
    password: "intern@123",
    name: "Nikhil namaji",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ebin@dcinfotech.org.in",
    password: "intern@123",
    name: "Ebin Alex",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "ayushkumar@dcinfotech.org.in",
    password: "intern@123",
    name: "Ayush Kumar Jha",
    phone: "N/A",
    batch: "ACE22",
  },






























  {
    email: "khurshid@dcinfotech.org.in",
    password: "intern@123",
    name: "Khurshid warsi",
    phone: "N/A",
    batch: "ACE22",
  },




  {
    email: "prakhar@dcinfotech.org.in",
    password: "intern@123",
    name: "Prakhar Sharma",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "sneha@dcinfotech.org.in",
    password: "intern@123",
    name: "Sneha Pasam",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "maheer@dcinfotech.org.in",
    password: "intern@123",
    name: "Maheer khan",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "aarti@dcinfotech.org.in",
    password: "intern@123",
    name: "Aarti Vinkar",
    phone: "N/A",
    batch: "ACE22",
  },
  {
    email: "vedansh@dcinfotech.org.in",
    password: "intern@123",
    name: "Vedansh Pandey",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "siddhi@dcinfotech.org.in",
    password: "intern@123",
    name: "Siddhi Akre",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "harinadh@dcinfotech.org.in",
    password: "intern@123",
    name: "Harinadh Patapanchula",
    phone: "N/A",
    batch: "ACE21",
  },

  {
    email: "ankan@dcinfotech.org.in",
    password: "intern@123",
    name: "Ankan Dhang",
    phone: "N/A",
    batch: "ACE22",
  },

  {
    email: "adamshafi@dcinfotech.org.in",
    password: "intern@123",
    name: "Adamshafi Shaik",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "nisha@dcinfotech.org.in",
    password: "intern@123",
    name: "Nisha Prajapati",
    phone: "N/A",
    batch: "ACE20",
  },


  {
    email: "abdul@dcinfotech.org.in",
    password: "intern@123",
    name: "Abdul Basit",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "shilpa@dcinfotech.org.in",
    password: "intern@123",
    name: "Shilpa Patil",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "muvvala@dcinfotech.org.in",
    password: "intern@123",
    name: "Muvvala Donald ",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "harshavardhana@dcinfotech.org.in",
    password: "intern@123",
    name: "Harshavardhana A C ",
    phone: "N/A",
    batch: "ACE20",
  },

  {
    email: "ujwal@dcinfotech.me",
    password: "intern@123",
    name: "UJWAL P SHETTY ",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "rohan@dcinfotech.me",
    password: "intern@123",
    name: "Rohan Rajak",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "anand@dcinfotech.me",
    password: "intern@123",
    name: "ANAND Gokul ",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "prathmesh@dcinfotech.me",
    password: "intern@123",
    name: "Prathmesh",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "vaibhav@dcinfotech.org.in",
    password: "intern@123",
    name: "vaibhav gulge",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "sreejakalwa@dcinfotech.org.in",
    password: "intern@123",
    name: "Sreeja Kalwa",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "ahmed@dcinfotech.org.in",
    password: "intern@123",
    name: "Ahmed Hussain",
    phone: "N/A",
    batch: "ACE35",
  },

  {
    email: "surajnashine@dcinfotech.org.in",
    password: "intern@123",
    name: "Suraj Nashine",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "prajwal@dcinfotech.org.in",
    password: "intern@123",
    name: "Prajwal Shetty",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "hansika@dcinfotech.org.in",
    password: "intern@123",
    name: "Hansika Mahajan",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "sudarsan@dcinfotech.org.in",
    password: "intern@123",
    name: "SUDARSAN R",
    phone: "N/A",
    batch: "ACE4AUGUST",
  },

  {
    email: "alexguria@dcinfotech.me",
    password: "intern@123",
    name: "Alex ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "dwaitchiranvaidya@dcinfotech.me",
    password: "intern@123",
    name: "Alex ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "abhirajarya@dcinfotech.me",
    password: "intern@123",
    name: "Abhiraj Arya",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "aniketsawant@dcinfotech.me",
    password: "intern@123",
    name: "Aniket Dilip Sawant",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "rohitanand@dcinfotech.me",
    password: "intern@123",
    name: "Rohit Anand ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "baibhavsagar@dcinfotech.me",
    password: "intern@123",
    name: "Baibhav Sagar",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "vijaybairwa@dcinfotech.me",
    password: "intern@123",
    name: "Vijay Bairwa ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "vallamkonduvignesh@dcinfotech.me",
    password: "intern@123",
    name: "Vallamkondu Vignesh",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "suhailasasan@dcinfotech.me",
    password: "intern@123",
    name: "Suhaila Sasan",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "sriramgajula@dcinfotech.me",
    password: "intern@123",
    name: "Sriram Gajula ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "sriramgajula@dcinfotech.me",
    password: "intern@123",
    name: "Sriram Gajula ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "neerajpandey@dcinfotech.me",
    password: "intern@123",
    name: "NEERAJ PANDEY  ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "danishhajiameen@dcinfotech.me",
    password: "intern@123",
    name: "Danish Haji Ameen",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "pushpendumukherjee@dcinfotech.me",
    password: "intern@123",
    name: "Pushpendu Mukherjee",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "prathameshvyawhare@dcinfotech.me",
    password: "intern@123",
    name: "Prathamesh Diliprao vyawhare",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "manyamchandrasekhar@dcinfotech.me",
    password: "intern@123",
    name: "Manyam Chandrasekhar ",
    phone: "N/A",
    batch: "clouddeveloper",
  },

  {
    email: "poonammahalley@dcinfotech.me",
    password: "intern@123",
    name: "Poonam Sureshrao Mahalley ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "shreyashpisal@dcinfotech.me",
    password: "intern@123",
    name: "Shreyash Bharat Pisal ",
    phone: "Shreyash Bharat Pisal",
    batch: "ACEJULY2025",
  },

  {
    email: "vanshitathakur@dcinfotech.me",
    password: "intern@123",
    name: "Vanshita Thakur",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "mihirrauniyar@dcinfotech.me",
    password: "intern@123",
    name: "Mihir Rauniyar",
    phone: "N/A",
    batch: "",
  },
  {
    email: "vnandakishore@dcinfotech.me",
    password: "intern@123",
    name: "V Nandakishore ",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "anuragkamdi@dcinfotech.me",
    password: "intern@123",
    name: "Anurag Yashawant Kamdi",
    phone: "N/A",
    batch: "ACEJULY2025",
  },
  {
    email: "adityakumar@dcinfotech.me",
    password: "intern@123",
    name: "Aditya kumar",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "aryaligde@dcinfotech.me",
    password: "intern@123",
    name: "Arya Ligde",
    phone: "N/A",
    batch: "ACEJULY2025",
  },

  {
    email: "pardeshinikhil@dcinfotech.me",
    password: "intern@123",
    name: "Nikhil Pardeshi",
    phone: "1234567890",
    batch: "ACE",
  },
  {
    email: "rohandesai@dcinfotech.me",
    password: "intern@123",
    name: "Rohan Desai",
    phone: "1234567890",
    batch: "ACE",
  },

  {
    email: "chandrashekarv@dcinfotech.me",
    password: "intern@123",
    name: "Chandra ShekarV",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "tejachintapalli@dcinfotech.me",
    password: "intern@123",
    name: "Teja Chintapalli",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "chinmayrahangdale@dcinfotech.me",
    password: "intern@123",
    name: "Chinmay Rahangdale",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "ASHIQUEANTONY@dcinfotech.me",
    password: "intern@123",
    name: "ASHIQUE ANTONY",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "rahmanchoudhary@dcinfotech.me",
    password: "intern@123",
    name: "Rahman Choudhary",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "nainaghosh@dcinfotech.me",
    password: "intern@123",
    name: "Naina Ghosh",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "ASHIQUEANTONY@dcinfotech.me",
    password: "intern@123",
    name: "ASHIQUE ANTONY",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "ramgandam@dcinfotech.me",
    password: "intern@123",
    name: "SAIRAM GANDAM",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "sapnamohanta@dcinfotech.me",
    password: "intern@123",
    name: "Sapna Mohanta",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "dineshvadlaputi@dcinfotech.me",
    password: "intern@123",
    name: "DINESH VADLAPUTI",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "sivanikhil.maradan@dcinfotech.me",
    password: "intern@123",
    name: "Sivanikhil Maradani",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "sushantjamdade@dcinfotech.me",
    password: "intern@123",
    name: "Sushant Anna Jamdade",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "nainaghosh@dcinfotech.me",
    password: "intern@123",
    name: "Naina Ghosh",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "avinashsaxena@dcinfotech.me",
    password: "intern@123",
    name: "Avinash Saxena",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "mounicareddy@dcinfotech.me",
    password: "intern@123",
    name: "Ch Mounica Reddy",
    phone: "",
    batch: "ACE",
  },

  {
    email: "shashankkale@dcinfotech.me",
    password: "intern@123",
    name: "Shashank Kale",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "bhawanaverma@dcinfotech.me",
    password: "intern@123",
    name: "Bhawana Verma",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "saikrishna@dcinfotech.me",
    password: "intern@123",
    name: "Sai Krishna",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "shashankshambharkar@dcinfotech.me",
    password: "intern@123",
    name: "Shashank Shambharkar",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "karunyamarri@dcinfotech.me",
    password: "intern@123",
    name: "Karunya Marri",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "vadlamani.akshaykumar@dcinfotech.me",
    password: "intern@123",
    name: "Akshay Vadlamani",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "nadipallidurgaprasad@dcinfotech.me",
    password: "intern@123",
    name: "Nadipalli Durgaprasad",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "rakeshkamat@dcinfotech.me",
    password: "intern@123",
    name: "Rakesh Kamat",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "namandhariwal@dcinfotech.me",
    password: "intern@123",
    name: "Naman Dhariwal",
    phone: "N/A",
    batch: "GENAI",
  },

  {
    email: "janvisen@dcinfotech.me",
    password: "intern@123",
    name: "Janvi Sen",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "pavankumarkodag@dcinfotech.me",
    password: "intern@123",
    name: "Pavankumar Kodag",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "chinthalapatishivanagarjuna@dcinfotech.me",
    password: "intern@123",
    name: "Chinthalapati Shiva Nagarjuna ",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "sadaf.perveen@dcinfotech.me",
    password: "intern@123",
    name: "SADAF",
    phone: "N/A",
    batch: "ACE75",
  },
  {
    email: "bevinmosess@dcinfotech.me",
    password: "intern@123",
    name: "Bevin",
    phone: "N/A",
    batch: "3MARCH",
  },
  {
    email: "krishna.sandeepkaruturi@dcinfotech.me",
    password: "intern@123",
    name: "KRISHNA SANDEEP KARUTURI",
    phone: "8722889994",
    batch: "3MARCH",
  },
  {
    email: "sahilbhosale@dcinfotech.me",
    password: "intern@123",
    name: "Sahil Bhosale",
    phone: "9326251178",
    batch: "3MARCH",
  },
  {
    email: "prathamesh.pathak@dcinfotech.me",
    password: "intern@123",
    name: "Prathamesh Satish Pathak",
    phone: "8698662408",
    batch: "3MARCH",
  },
  {
    email: "krishnayadav@dcinfotech.me",
    password: "intern@123",
    name: "Krishna Yadav",
    phone: "06386052158",
    batch: "3MARCH",
  },
  {
    email: "atharva.kumbhar@dcinfotech.me",
    password: "intern@123",
    name: "Atharva Kishor Kumbhar",
    phone: "8108741281",
    batch: "3MARCH",
  },
  {
    email: "preetha.elangovan@dcinfotech.me",
    password: "intern@123",
    name: "Preetha Elangovan",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "pranjalpagaria20@gmail.com",
    password: "intern@123",
    name: "Pranjalpagaria",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "ruturaj.sonone@dcinfotech.me",
    password: "intern@123",
    name: "Ruturaj Sonone",
    phone: "8657465111",
    batch: "3MARCH",
  },
  {
    email: "sharankumar@dcinfotech.me",
    password: "sharan@123",
    name: "Sharan Kumar",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "sharankumar@dcinfotech.me",
    password: "intern@123",
    name: "Sharan Kumar",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "shardul.tiwari@dcinfotech.me",
    password: "intern@123",
    name: "Shardul Tiwari",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "m.anand@dcinfotech.me",
    password: "intern@123",
    name: "M Anand",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "shardul.tiwari@dcinfotech.me",
    password: "intern@123",
    name: "Shardul Tiwari",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "bevinmosess@dcinfotech.me",
    password: "bevin@69",
    name: "Bevin Mosess",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "mandar.nareshbodane@dcinfotech.me",
    password: "mandar@123",
    name: "Mandar Naresh Bodane",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "saloni.dhall@dcinfotech.me",
    password: "intern@123",
    name: "Saloni Dhall",
    phone: "",
    batch: "ACEjuly",
  },
  {
    email: "rethessh.ed@dcinfotech.me",
    password: "intern@123",
    name: "Rethessh Ed",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "nikhil.kamode@dcinfotech.me",
    password: "intern@123",
    name: "Nikhil Kamode",
    phone: "",
    batch: "3MARCH",
  },
  {
    email: "atharva.kumbhar@dcinfotech.me",
    password: "intern@123",
    name: "Atharva Kumbhar",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "dinesh.borase@dcinfotech.me",
    password: "intern@123",
    name: "Dinesh Borase",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "rameshprasad@dcinfotech.me",
    password: "intern@123",
    name: "Ramesh Prasad",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "satishkumarjanapureddi@dcinfotech.me",
    password: "intern@123",
    name: "Satish Kumar Janapureddi",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "pratikshagupta@dcinfotech.me",
    password: "intern@123",
    name: "pratikshagupta",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "vishwakkotha@dcinfotech.me",
    password: "intern@123",
    name: "vishwakkotha",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },
  {
    email: "vinodb@dcinfotech.me",
    password: "intern@123",
    name: "vinod B",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "3MARCH",
  },

  // 1 April batch
  {
    email: "sppranam@dcinfotech.me",
    password: "intern@123",
    name: "SP Pranam",
    phone: "1234567890",
    batch: "ACE",
  },

  {
    email: "priyanshukhandelwal@dcinfotech.me",
    password: "intern@123",
    name: "priyanshukhandelwal",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "nandinimatapodu@dcinfotech.me",
    password: "intern@123",
    name: "nandinimatapodu",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },

  {
    email: "pittasaideep@dcinfotech.me",
    password: "intern@123",
    name: "PITTA SAIDEEP",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "mayureshpatil@dcinfotech.me",
    password: "intern@123",
    name: "mayureshpatil",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "kandikondagurusai@dcinfotech.me",
    password: "intern@123",
    name: "kandikondagurusai",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "princepansuriya@dcinfotech.me",
    password: "intern@123",
    name: "Prince Pansuriya",
    phone: "",
    note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },
  {
    email: "adarshdogra@dcinfotech.me",
    password: "intern@123",
    name: "Adarsh Dogra",
    phone: "",
    note: "Live sessidons schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },

  {
    email: "adarshdogra@dcinfotech.me",
    password: "intern@123",
    name: "Adarsh Dogra",
    phone: "",
    note: "Live sessidons schedule will be sent via mail. It will start from 3rd March for 3 weeks.",
    batch: "1APRIL",
  },

  {
    email: "dharanilingasamy@dcinfotech.me",
    password: "intern@123",
    name: "Dharani Lingasamy",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "adityasingh@dcinfotech.me",
    password: "intern@123",
    name: "Aditya Singh",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "varshithpasupunuri@dcinfotech.me",
    password: "intern@123",
    name: "Varshith Pasupunuri",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "bhagwatibashyal@dcinfotech.me",
    password: "intern@123",
    name: "Bhagwati Bhimdev Bashyal",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "ajaykumar@dcinfotech.me",
    password: "intern@123",
    name: "Ajay Kumar",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "mahmadirfan@dcinfotech.me",
    password: "intern@123",
    name: "Mahmad Irfan",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "vedantpatil@dcinfotech.me",
    password: "intern@123",
    name: "Vedant Patil",
    phone: "",
    batch: "ACE4AUGUST",
  },
  {
    email: "gudarurajkumar@dcinfotech.me",
    password: "intern@123",
    name: "Gudaru Rajkumar",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "shanmukatrived@dcinfotech.me",
    password: "intern@123",
    name: "Penukonda Shanmuka Trived",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "sutharisaimanikantavivek@dcinfotech.me",
    password: "intern@123",
    name: "Suthari Sai manikanta vivek",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "omkardhananjaywagh@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Dhananjay Wagh",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "anjalipathak@dcinfotech.me",
    password: "intern@123",
    name: "Anjali Pathak",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "omkarwagh@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Dhananjay Wagh",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "rogyeabhijeet@dcinfotech.me",
    password: "intern@123",
    name: "Abhijeet Rogye",
    phone: "",
    batch: "GENAI",
  },
  {
    email: "shashankrai@dcinfotech.me",
    password: "intern@123",
    name: "Shashank Rai",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "pargichandana@dcinfotech.me",
    password: "intern@123",
    name: "Pargi Chandana",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "c.mahesh@dcinfotech.me",
    password: "intern@123",
    name: "Mahesh C",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "aniketprakashpawar@dcinfotech.me",
    password: "intern@123",
    name: "Aniket Prakash Pawar",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "vishalsunilghorse@dcinfotech.me",
    password: "intern@123",
    name: "Vishal Sunil Ghorse",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "piyushmujmule@dcinfotech.me",
    password: "intern@123",
    name: "Piyush Mujmule",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "nidhikrishnagangurde@dcinfotech.me",
    password: "intern@123",
    name: "nidhikrishnagangurde",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "gauravsingh@dcinfotech.me",
    password: "intern@123",
    name: "gauravsingh",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "jedlaritishkrishna@dcinfotech.me",
    password: "intern@123",
    name: "JEDLA RITISH KRISHNA",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "soumyaranjanmohanty@dcinfotech.me",
    password: "intern@123",
    name: "JEDLA RITISH KRISHNA",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "tejasbhaskartadka@dcinfotech.me",
    password: "intern@123",
    name: "Tejas Bhaskar Tadka",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "shirisha@dcinfotech.org.in",
    password: "intern@123",
    name: "shirshathakur",
    phone: "",
    batch: "PDE01",
  },

  //new entery
  {
    email: "sreedharchalumuri@dcinfotech.me",
    password: "intern@123",
    name: "SREEDHAR CHALUMURI",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "meetsathavara@dcinfotech.me",
    password: "intern@123",
    name: "Sathavara Meet Kaushikkumar",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "payalsonkusare@dcinfotech.me",
    password: "intern@123",
    name: "PAYAL RAMBHAROS SONKUSARE",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "najanayogivamsikrishna@dcinfotech.me",
    password: "intern@123",
    name: "Najana Yogi Vamsi Krishna",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "shubhamahire@dcinfotech.me",
    password: "intern@123",
    name: "Shubham Ahire",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "gurdeepsinghrayat@dcinfotech.me",
    password: "intern@123",
    name: "Gurdeep Singh Rayat",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "mohammadabdullahshareef@dcinfotech.me",
    password: "intern@123",
    name: "Mohammad Abdullah Shareef",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "saivardhiniravada@dcinfotech.me",
    password: "intern@123",
    name: "Sai Vardhini Ravada",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "akshaygoudpulloori@dcinfotech.me",
    password: "intern@123",
    name: "Akshay Goud Pulloori",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "sachin23maurya@gmail.com",
    password: "intern@123",
    name: "sachin23maurya",
    phone: "",
    batch: "GENAI101",
  },

  {
    email: "aaryakrup@dcinfotech.org.in",
    password: "intern@123",
    name: "aaryakrup",
    phone: "",
    batch: "GENAI101",
  },

  {
    email: "ramangajananlolure@dcinfotech.me",
    password: "intern@123",
    name: "Raman Gajanan Lolure",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "mustafaalimiyaji@dcinfotech.me",
    password: "intern@123",
    name: "Mustafa Ali Miyaji",
    phone: "",
    batch: "1APRIL",
  },

  {
    email: "sachinrao@dcinfotech.me",
    password: "intern@123",
    name: "Sachin Rao",
    phone: "",
    batch: "1APRIL",
  },
  {
    email: "prithvirajbarodiya@dcinfotech.me",
    password: "intern@123",
    name: "Prithviraj Barodiya Mukesh ",
    phone: "",
    batch: "1APRIL",
  },

  //2 april
  {
    email: "siddapureddysaisivasankarreddy@dcinfotech.me",
    password: "intern@123",
    name: "Siddapureddy Sai Siva Sankar Reddy ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "bonulagunavijayanand@dcinfotech.me",
    password: "intern@123",
    name: "Bonula Guna Vijay Anand",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "mdganim@dcinfotech.me",
    password: "intern@123",
    name: "Md Ganim ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "atharvrajendraborate@dcinfotech.me",
    password: "intern@123",
    name: "Atharv Rajendra Borate ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "hidhaafsalkhan@dcinfotech.me",
    password: "intern@123",
    name: "Hidha Afsalkhan ",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "syedmohamedsarjoon@dcinfotech.me",
    password: "intern@123",
    name: "Syed Mohamed Sarjoon ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "mayank.sunvaiya@dcinfotech.me",
    password: "intern@123",
    name: "Mayank Sunvaiya",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "akashkoche@dcinfotech.me",
    password: "intern@123",
    name: "AKASH KOCHE ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "sandhyarammurtivarma@dcinfotech.me",
    password: "intern@123",
    name: "SANDHYA RAMMURTI VARMA",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "pratikshivajipatil@dcinfotech.me",
    password: "intern@123",
    name: "PRATIK SHIVAJI PATIL",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "pankajkumar@dcinfotech.me",
    password: "intern@123",
    name: "PANKAJ KUMAR",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "maheshkumarsingh@dcinfotech.me",
    password: "intern@123",
    name: "Mahesh Kumar Singh P S ",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "amitshinde@dcinfotech.me",
    password: "intern@123",
    name: "Amit Shinde",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "rajanikurapati@dcinfotech.me",
    password: "intern@123",
    name: "Rajani Kurapati V",
    phone: "",
    batch: "2APRIL",
  },
  {
    email: "vaibhavgaikwad@dcinfotech.me",
    password: "intern@123",
    name: " vaibhavgaikwad",
    phone: "",
    batch: "2APRIL",
  },

  // new

  {
    email: "smitpatil@dcinfotech.me",
    password: "intern@123",
    name: "Smit Patil",
    phone: "",
    batch: "2APRIL",
  },

  {
    email: "utkarshpatil@dcinfotech.me",
    password: "intern@123",
    name: "Utkarsh Patil",
    phone: "",
    batch: "ACE",
  },

  // ...existing users...
  {
    email: "shrutinanaveer@dcinfotech.me",
    password: "intern@123",
    name: "Shruti Nana Veer",
    phone: "",
    batch: "ACE",
  },
  {
    email: "hrishitghildiyal@dcinfotech.me",
    password: "intern@123",
    name: "Hrishit ghildiyal",
    phone: "",
    batch: "ACE",
  },
  {
    email: "stanleyraj@dcinfotech.me",
    password: "intern@123",
    name: "STANLEY RAJ KUMAR",
    phone: "",
    batch: "ACE",
  },
  {
    email: "gaurav@dcinfotech.me",
    password: "intern@123",
    name: "GAURAV",
    phone: "",
    batch: "ACE",
  },
  {
    email: "pratyakshbansal@dcinfotech.me",
    password: "intern@123",
    name: "Pratyaksh Bansal",
    phone: "",
    batch: "ACE",
  },
  {
    email: "surajkumar@dcinfotech.me",
    password: "intern@123",
    name: "Surajkumar Srinivasan Idiga",
    phone: "",
    batch: "ACE",
  },
  {
    email: "rohittiwari@dcinfotech.me",
    password: "intern@123",
    name: "Rohit Tiwari",
    phone: "",
    batch: "ACE",
  },
  {
    email: "adithyarao@dcinfotech.me",
    password: "intern@123",
    name: "Adithya Rao",
    phone: "",
    batch: "ACE",
  },
  {
    email: "himanshupatil@dcinfotech.me",
    password: "intern@123",
    name: "Himanshu Patil",
    phone: "",
    batch: "ACE",
  },
  {
    email: "rahulkore@dcinfotech.me",
    password: "intern@123",
    name: "Kore Rahul Sai",
    phone: "",
    batch: "ACE",
  },
  {
    email: "sudheersahu@dcinfotech.me",
    password: "intern@123",
    name: "Sudheer Sahu",
    phone: "",
    batch: "ACE",
  },
  {
    email: "supriyomukherjee@dcinfotech.me",
    password: "intern@123",
    name: "Supriyo Mukherjee",
    phone: "",
    batch: "ACE",
  },
  {
    email: "sachdevparihar@dcinfotech.me",
    password: "intern@123",
    name: "Sachdev Parihar",
    phone: "",
    batch: "ACE",
  },
  {
    email: "shubhamlagad@dcinfotech.me",
    password: "intern@123",
    name: "Shubham Sanjay Lagad",
    phone: "",
    batch: "ACE",
  },

  {
    email: "tarundhauta@dcinfotech.me",
    password: "intern@123",
    name: "Tarun Dhauta",
    phone: "",
    batch: "ACE",
  },

  {
    email: "ajay.guhade@dcinfotech.me",
    password: "intern@123",
    name: "Ajay Vitthal Guhade",
    phone: "",
    batch: "clouddevopsaugust",
  },

  {
    email: "pethanidaksh@dcinfotech.me",
    password: "intern@123",
    name: "Pethani Daksh",
    phone: "",
    batch: "ACE",
  },

  {
    email: "smohammadsameer@dcinfotech.me",
    password: "intern@123",
    name: "S Mohammad Sameer ",
    phone: "",
    batch: "ACE",
  },

  {
    email: "piyushsinghrawat@dcinfotech.me",
    password: "intern@123",
    name: "  Piyush Singh Rawat ",
    phone: "",
    batch: "ACE",
  },

  {
    email: "aslamck@dcinfotech.me",
    password: "intern@123",
    name: "Aslam ck",
    phone: "",
    batch: "ACE",
  },
  // ...existing users...
  {
    email: "apekshitkadam@dcinfotech.me",
    password: "intern@123",
    name: "Apekshit Kadam",
    phone: "",
    batch: "ACE",
  },

  {
    email: "ronaksingh@dcinfotech.me",
    password: "intern@123",
    name: "Ronak Singh",
    phone: "",
    batch: "ACE",
  },
  {
    email: "hirenchaudhari@dcinfotech.me",
    password: "intern@123",
    name: "hiren chaudhari",
    phone: "",
    batch: "ACEjuly",
  },

  {
    email: "devanshsen@dcinfotech.me",
    password: "intern@123",
    name: "Devansh sen ",
    phone: "",
    batch: "ACEjuly",
  },
  {
    email: "ashutoshashokkumar@dcinfotech.me",
    password: "intern@123",
    name: "Ashutosh Ashok Kumar ",
    phone: "",
    batch: "ACE",
  },
  {
    email: "rahmanchoudhary@dcinfotech.me ",
    password: "intern@123",
    name: "Rahman Choudhary  ",
    phone: "",
    batch: "ACE",
  },

  {
    email: "aslamck@dcinfotech.me",
    password: "intern@123",
    name: "Aslam ck",
    phone: "",
    batch: "ACE",
  },


  {
    email: "bhargavbalajinaidu@dcinfotech.me",
    password: "intern@123",
    name: "Bhargav Balaji Naidu ",
    phone: "",
    batch: "ACE",
  },

  // ML batch
  {
    email: "saif.nandyal@dcinfotech.me",
    password: "intern@123",
    name: "Saif Nandyal",
    phone: "",
    batch: "ACE",
  },
  {
    email: "aadarshputtamaneni@dcinfotech.me",
    password: "intern@123",
    name: "Aadarsh Puttamaneni",
    phone: "",
    batch: "ACE",
  },

  {
    email: "omkarshinde@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Shinde",
    phone: "",
    batch: "ACE",
  },

  //DEVOPS BATCH

  {
    email: "shan.muganandam@dcinfotech.me",
    password: "intern@123",
    name: " K.shanmuganandam",
    phone: "",
    batch: "DEVOPS",
  },
  {
    email: "gauravbhatt@dcinfotech.me",
    password: "intern@123",
    name: "GAURAV BHATT",
    phone: "",
    batch: "DEVOPS",
  },
  {
    email: "advik.dhanorkar@dcinfotech.me",
    password: "intern@123",
    name: "advik.dhanorkar",
    phone: "",
    batch: "DEVOPS",
  },
  {
    email: "varunesh2509@gmail.com",
    password: "intern@123",
    name: "LASHKAR VARUNESH",
    phone: "",
    batch: "DEVOPS",
  },
  //new devops SELECT * FROM `qwiklabs-gcp-00-1d4b7c3eb1a2.cluster_dataset.usage_metering_cost_breakdown`
  {
    email: "anantchandola@dcinfotech.me",
    password: "intern@123",
    name: "ANANT CHANDOLA",
    phone: "",
    batch: "CLOUDDEVOPSAUGUST",
  },

  //architect batch  cloudarchitectjuly

  {
    email: "nishigandhajagadale@dcinfotech.me",
    password: "intern@123",
    name: "Nishigandha Jagadale ",
    phone: "",
    batch: "CLOUDARCHITECT",
  },

  {
    email: "siyaldhande@dcinfotech.me",
    password: "intern@123",
    name: "Siyal Dhande ",
    phone: "",
    batch: "cloudarchitectjuly",
  },

  {
    email: "atharvalavangare@dcinfotech.me",
    password: "intern@123",
    name: "Atharva Lavangare",
    phone: "N/A",
    batch: "ACE",
  },

  //    NEW ONE FROM 25 JUNE ACE

  {
    email: "subirnathbhowmik@dcinfotech.me",
    password: "intern@123",
    name: "SUBIR NATH BHOWMIK",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "shivamraj@dcinfotech.me",
    password: "intern@123",
    name: "Shivam Raj",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "shaliniamarnathsharma@dcinfotech.me",
    password: "intern@123",
    name: "Shalini Amarnath Sharma ",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "omkarsbarbade@dcinfotech.me",
    password: "intern@123",
    name: "Omkar Barbade",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "krishnamarappan@dcinfotech.me",
    password: "intern@123",
    name: "Krishna Marappan",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "trahulprabhu@dcinfotech.me",
    password: "intern@123",
    name: "TRahul Prabhu",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "thilakchandar@dcinfotech.me",
    password: "intern@123",
    name: "Thilak ChandarR",
    phone: "N/A",
    batch: "ACE",
  },
  {
    email: "gummidijagadeesh@dcinfotech.me",
    password: "intern@123",
    name: "JAGADEESH GUMMIDI",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "prem.sai@dcinfotech.me",
    password: "intern@123",
    name: "PremSai Mashetti",
    phone: "N/A",
    batch: "ACE",
  },

  {
    email: "pranavshashikantshimpi@dcinfotech.org.in",
    password: "intern@123",
    name: "Pranav Shimpi",
    phone: "N/A",
    batch: "ACE",
  },


  // 1 july new batch

  {
    email: "kunaldange@dcinfotech.me",
    password: "intern@123",
    name: "Kunal Dange",
    phone: "",
    batch: "ACEjuly",
  },

  {
    email: "siddharth@dcinfotech.org.in",
    password: "intern@123",
    name: "Siddharth Joshi",
    phone: "",
    batch: "ML",
  },
];
// js/agenda.js

// Disable right-click context menu
// Disable right-click context menu
// document.addEventListener("contextmenu", function (e) {
//   e.preventDefault();
// });

// Disable specific key combinations
document.addEventListener("keydown", function (e) {
  // F12
  if (e.key === "F12") {
    e.preventDefault();
  }
  // Ctrl + Shift + I/J/C/K/U
  if (
    e.ctrlKey &&
    e.shiftKey &&
    ["I", "J", "C", "K"].includes(e.key.toUpperCase())
  ) {
    e.preventDefault();
  }
  // Ctrl + U (View Source)
  if (e.ctrlKey && e.key.toUpperCase() === "U") {
    e.preventDefault();
  }
  // Ctrl + S (Save page)
  if (e.ctrlKey && e.key.toUpperCase() === "S") {
    e.preventDefault();
  }
  // Ctrl + P (Print)
  if (e.ctrlKey && e.key.toUpperCase() === "P") {
    e.preventDefault();
  }
});

// Optional: Detect and close developer tools by checking for debugger
// Anti-debugging disabled for maintenance
// setInterval(function () {
//   const before = performance.now();
//   debugger;
//   const after = performance.now();
//   if (after - before > 100) {
//     alert("Dev tools are not allowed!");
//     window.location.reload();
//   }
// }, 1000);

// Removed invalid test code
// document.body.appendChild(createSessionElement(session1, "ML")); 
// document.body.appendChild(createSessionElement(session1, "other")); 
// document.getElementById("userName").textContent = userData.name;
// document.getElementById("userEmail").textContent = userData.email;

document.addEventListener("DOMContentLoaded", loadPage);

// Browser Notification Logic
function sendReminder(day, time, desc, link) {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    scheduleNotification(day, time, desc, link);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        scheduleNotification(day, time, desc, link);
      }
    });
  }
}

function scheduleNotification(day, time, desc, link) {
  const startStr = time.split(" - ")[0].trim().replace(/\s+GMT.*$/, "") + " GMT+0530";
  const targetDate = new Date(`${day} ${startStr}`).getTime();
  const now = new Date().getTime();
  const timeToSession = targetDate - now;
  const tenMinutes = 10 * 60 * 1000;

  // Calculate delay: 10 mins before session, or immediately if less than 10 mins left
  let delay = timeToSession - tenMinutes;
  if (delay < 0) delay = 0; // Notify immediately if within 10 mins

  if (timeToSession < 0) {
    Notiflix.Notify.warning("This session has already started or ended.");
    return;
  }

  Notiflix.Notify.success("Reminder set! You'll be notified 10 minutes before class.");

  setTimeout(() => {
    const notification = new Notification("Session Starting Soon!", {
      body: `Your session "${desc}" is starting in 10 minutes. Click to join!`,
      icon: "https://dcinfotech.org.in/images/logo.png"
    });

    notification.onclick = function () {
      window.open(link, "_blank");
    };
  }, delay);
}

// --- Advanced Features Helper Functions ---

// 1. Toggle Watched Status
function toggleWatched(id, checkbox) {
  let watched = JSON.parse(localStorage.getItem('watched_sessions') || '[]');
  if (checkbox.checked) {
    if (!watched.includes(id)) watched.push(id);
    Notiflix.Notify.success('Marked as watched!');
  } else {
    watched = watched.filter(item => item !== id);
    Notiflix.Notify.info('Marked as unwatched.');
  }
  localStorage.setItem('watched_sessions', JSON.stringify(watched));

  // Refresh to update progress bar
  // We can just reload the schedule logic, but a full reload is safer for now to update progress bar
  setTimeout(() => loadSchedule(), 500);
}

// 2. Export Schedule to CSV
function exportScheduleCSV() {
  const sessions = [...schedule, ...scheduleAll];
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Date,Time,Description,Link\n";

  sessions.forEach(function (rowArray) {
    let row = `"${rowArray.day}","${rowArray.time}","${rowArray.description}","${rowArray.link}"`;
    csvContent += row + "\r\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_schedule.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 3. Toggle Grid View
function toggleGridView() {
  const container = document.getElementById('schedule');
  container.classList.toggle('schedule-grid');
  const btn = document.getElementById('gridViewBtn');
  if (container.classList.contains('schedule-grid')) {
    if (btn) btn.innerHTML = '<i class="fas fa-list"></i> List View';
    localStorage.setItem('viewMode', 'grid');
  } else {
    if (btn) btn.innerHTML = '<i class="fas fa-th-large"></i> Grid View';
    localStorage.setItem('viewMode', 'list');
  }
}

// 4. Toggle Timezone (Simple Implementation)
let useLocalTime = false;
function toggleTimezone() {
  useLocalTime = !useLocalTime;
  const btn = document.getElementById('timezoneBtn');
  if (useLocalTime) {
    if (btn) btn.innerHTML = '<i class="fas fa-globe"></i> Show IST';
    Notiflix.Notify.info('Switched to Local Time');
  } else {
    if (btn) btn.innerHTML = '<i class="fas fa-clock"></i> Show Local Time';
    Notiflix.Notify.info('Switched to IST');
  }
  // Re-render needed. For now, just reload page or call loadSchedule if we updated the logic to support this flag.
  // Since loadSchedule logic needs deep changes for timezone, we will just notify for now as per plan "Simple Toggle".
  // To fully implement, we would need to parse dates in createSessionElement using this flag.
  loadSchedule();
}

// Initialize View Mode
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('viewMode') === 'grid') {
    const container = document.getElementById('schedule');
    if (container) container.classList.add('schedule-grid');
    const btn = document.getElementById('gridViewBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-list"></i> List View';
  }

  // Inject Toolbar if not exists
  const header = document.querySelector('.section-header');
  if (header && !document.getElementById('agendaToolbar')) {
    const toolbar = document.createElement('div');
    toolbar.id = 'agendaToolbar';
    toolbar.className = 'toolbar-actions';
    toolbar.innerHTML = `
            <button id="timezoneBtn" class="toolbar-btn" onclick="toggleTimezone()"><i class="fas fa-clock"></i> Show Local Time</button>
            <button id="gridViewBtn" class="toolbar-btn" onclick="toggleGridView()"><i class="fas fa-th-large"></i> Grid View</button>
            <button class="toolbar-btn" onclick="exportScheduleCSV()"><i class="fas fa-file-csv"></i> Export CSV</button>
        `;
    header.appendChild(toolbar);
  }
});