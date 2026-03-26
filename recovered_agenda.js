
  // Show spinner in place of the login button text
  function showSpinner() {
    document.getElementById("btnText").style.display = "none";
    document.getElementById("spinner").style.display = "inline-block";
  }
  function hideSpinner() {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("btnText").style.display = "inline";
  }
  
  // Login function with data validation and spinner display
  function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    // Validate that both fields are filled
    if (email.trim() === "" || password.trim() === "") {
      Notiflix.Notify.failure("Please enter both email and password!");
      return;
    }
  
    // Check if the provided credentials match any user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      Notiflix.Notify.failure("Invalid credentials!");
      return;
    }
  
    // Show the spinner on the login button
    showSpinner();
    setTimeout(() => {
      hideSpinner();
      sessionStorage.setItem("loggedInUser", JSON.stringify(user));
      Notiflix.Notify.success("Login successful! Welcome back, " + user.name + "!");
      loadPage();
    }, 2000);
  }
  
  // Confirm logout with SweetAlert
  function confirmLogout() {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to logout?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  }
  function loadPage() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) {
      document.getElementById("loginContainer").style.display = "block";
      document.getElementById("dashboardContainer").style.display = "none";
    } else {
      document.getElementById("userName").innerText = user.name;
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("dashboardContainer").style.display = "block";
      setInterval(() => {
        document.getElementById("currentTime").innerText = new Date().toLocaleTimeString();
      }, 1000);
      
      // Load the schedule based on user batch
      if (user.batch && user.batch.toUpperCase() === "ML") {
        loadSchedule(scheduleML);
      } else if (user.batch && user.batch.toUpperCase() === "1APRIL") {
        loadSchedule(schedule1April);
      } else {
        loadSchedule(schedule);
      }
    }
  }
  
  
  // Logout function with Notiflix notification
  function logout() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (user) {
      Notiflix.Notify.info(`Goodbye, ${user.name}. These are results!`);
    }
    sessionStorage.removeItem("loggedInUser");
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
  
  // Default schedule data (for non-ML batches)
  const schedule = [
    {
      day: "Mon, March 3, 2025 (its recorded session)",
      time: "9:00 AM - 1:00 PM GMT+5:30",
      description: "Google Cloud Fundamentals: Core Infrastructure",
      details: "If you're facing difficulties in understanding the concepts, kindly watch this for a better understanding of the fundamentals.",
      recording: "https://www.youtube.com/playlist?list=PLoW9FRX7ypD63XAvW0xd6LtKSHtfQLJJ7"
    },
    {
      day: "Mon, March 3, 2025",
      time: "9:00 AM - 1:00 PM GMT+5:30",
      description: "Academy - Associate Cloud Engineer workshop Module 1",
      details: "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and the command-line interface to perform common tasks.",
      link: "https://meet.google.com/zvx-aywk-kui",
      recording: "https://youtu.be/Vf_BvK13P9c"
    },
    {
      day: "Wed, March 5, 2025",
      time: "9:00 AM - 1:00 PM GMT+5:30",
      description: "Academy - Associate Cloud Engineer workshop Module 2",
      details: "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
      link: "https://meet.google.com/jgd-fujc-mbx",
      recording: ""
    },
    {
      day: "Mon, March 10, 2025",
      time: "9:00 AM - 1:00 PM GMT+5:30",
      description: "Academy - Associate Cloud Engineer workshop Module 3",
      details: "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
      link: "https://meet.google.com/ofc-irsg-fup?pli=1",
      recording: "https://youtu.be/amfLe2SKrts"
    },
    {
      day: "Wed, March 12, 2025",
      time: "9:00 AM - 1:00 PM GMT+5:30",
      description: "Academy - Associate Cloud Engineer workshop Module 4",
      details: "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
      link: "https://meet.google.com/vip-kuyw-hgj",
      recording: "https://youtu.be/vic0Pu6n7OE"
    },
    {
      day: "Mon, March 17, 2025",
      time: "9:00 AM - 1:00 PM GMT+5:30",
      description: "Academy - Associate Cloud Engineer workshop Module 5",
      details: "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
      link: "https://meet.google.com/xfz-nodk-yfu",
      recording: "https://www.youtube.com/live/eePyesuTB2Y?si=z4m1FC0BN7igfSFS"

    },

        {
      day: "Mon, March 17, 2025",
      time: "2:00 PM - 4:00 PM GMT+5:30",
      description: "Exam Readiness Workshop Associate Cloud Engineer (Those who are interested can attend the workshop We Will Arrange One More When Training is Done)",
      details: "This workshop is designed to help you understand the exam structure, review the types of questions you will encounter, and build a strategy for success.",
      link: "https://meet.google.com/ckb-anew-prr",
        recording: "https://youtu.be/2mwT6h7pVRw"
    },
    {
      day: "Wed, March 19, 2025",
      time: "9:00 AM - 1:00 PM GMT+5:30",
      description: "Academy - Associate Cloud Engineer workshop Module 6",
      details: "Associate Cloud Engineers deploy applications, monitor operations, and manage enterprise solutions. They use Google Cloud Console and CLI for common tasks.",
      link: "https://meet.google.com/wxc-mpkx-tut",
      recording: "https://www.youtube.com/live/RolbPMrwKQ4?si=FxdxKQUBaXWVTK9j"
    },
 
    {
      "day": "Thursday, March 27, 2025",
      "time": "9:00 AM - 5:00 PM GMT+5:30",
      "description": "Academy - Cloud Digital Leader Workshop (Two training sessions available, join as per your preferred time).",
      "details": "A comprehensive workshop covering cloud fundamentals, digital transformation, and Google Cloud solutions. Interns can join either of the two available sessions based on their convenience.",
      "link": "https://meet.google.com/example",
      "recording": ""
    },

    {
      day: "Fri, April 11, 2025",
      time: "2:00 PM - 4:00 PM GMT+5:30",
      description: "Exam Readiness Workshop Associate Cloud Engineer ",
      details: "This workshop is designed to help you understand the exam structure, review the types of questions you will encounter, and build a strategy for success.",
      link: "https://meet.google.com/ckb-anew-prr",
        recording: "https://youtu.be/2mwT6h7pVRw"
    },


  ];
  
  // Machine Learning (ML) schedule data
  const scheduleML = [
   
    {
      day: "Tue, March 25, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 1",
      details: "Agenda: delivered in English",
      link: "https://meet.google.com/xna-xasz-ukt"
    },
    {
      day: "Wed, March 26, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 2",
      details: "Agenda: delivered in English",
      link: ""
    },
    {
      "day": "Thursday, March 27, 2025",
      "time": "9:00 AM - 5:00 PM GMT+5:30",
      "description": "Academy - Cloud Digital Leader Workshop (Two training sessions available, join as per your preferred time).",
      "details": "A comprehensive workshop covering cloud fundamentals, digital transformation, and Google Cloud solutions. Interns can join either of the two available sessions based on their convenience.",
      "link": "https://meet.google.com/example",
      "recording": ""
    },
    {
      day: "Mon, March 31, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 3",
      details: "Agenda: delivered in English",
      link: ""
    },
    {
      day: "Tue, April 1, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 4",
      details: "Agenda: delivered in English",
      link: ""
    },
    {
      day: "Wed, April 2, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 5",
      details: "Agenda: delivered in English",
      link: ""
    },
    {
      day: "Mon, April 7, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 6",
      details: "Agenda: delivered in English",
      link: ""
    },
    {
      day: "Tue, April 8, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 7",
      details: "Agenda: delivered in English",
      link: ""
    },
    {
      day: "Wed, April 9, 2025",
      time: "7:30 PM - 11:30 PM GMT+5:30",
      description: "Academy - Professional Machine Learning Engineer workshop Module 8",
      details: "Agenda: delivered in English",
      link: ""
    }
  ];
  const schedule1April = [
    {
      "day": "Thursday, March 27, 2025",
      "time": "9:00 AM - 5:00 PM GMT+5:30",
      "description": "Academy - Cloud Digital Leader Workshop ",
      "details": "A comprehensive workshop covering cloud fundamentals, digital transformation, and Google Cloud solutions. Interns can join either of the two available sessions based on their convenience.",
      "link": "https://meet.google.com/example",
      "recording": ""
    },
    

    {
      "day": "Thu, April 3, 2025",
      "time": "7:30 PM - 11:30 PM GMT+5:30",
      "description": "Academy - Associate Cloud Engineer workshop Module 1",
      "details": "Agenda: delivered in English over 3 weeks",
      "link": "https://meet.google.com/example",
      "recording": ""
      
    },
    {
      "day": "Fri, April 4, 2025",
      "time": "7:30 PM - 11:30 PM GMT+5:30",
      "description": "Academy - Associate Cloud Engineer workshop Module 2",
      "details": "Agenda: delivered in English over 3 weeks"
    },
    {
      "day": "Thu, April 10, 2025",
      "time": "7:30 PM - 11:30 PM GMT+5:30",
      "description": "Academy - Associate Cloud Engineer workshop Module 3",
      "details": "Agenda: delivered in English over 3 weeks"
    },
    {
      "day": "Fri, April 11, 2025",
      "time": "7:30 PM - 11:30 PM GMT+5:30",
      "description": "Academy - Associate Cloud Engineer workshop Module 4",
      "details": "Agenda: delivered in English over 3 weeks"
    },
    {
      "day": "Mon, April 14, 2025",
      "time": "7:30 PM - 11:30 PM GMT+5:30",
      "description": "Academy - Associate Cloud Engineer workshop Module 5",
      "details": "Agenda: delivered in English over 3 weeks"
    },
    {
      "day": "Tue, April 15, 2025",
      "time": "7:30 PM - 11:30 PM GMT+5:30",
      "description": "Academy - Associate Cloud Engineer workshop Module 6",
      "details": "Agenda: delivered in English over 3 weeks"
    }
  ];
  
  const scheduleDevOpsApril = [
    {
        "day": "Thu, April 3, 2025",
        "time": "12:30 PM - 4:30 PM GMT+5:30",
        "description": "Academy - Professional Cloud DevOps Engineer workshop Module 1",
        "details": "Agenda: Delivered in English over 3 weeks."
        
    },
    {
        "day": "Fri, April 4, 2025",
        "time": "12:30 PM - 4:30 PM GMT+5:30",
        "description": "Academy - Professional Cloud DevOps Engineer workshop Module 2",
        "details": "Agenda: Delivered in English over 3 weeks."
    },
    {
        "day": "Thu, April 10, 2025",
        "time": "12:30 PM - 4:30 PM GMT+5:30",
        "description": "Academy - Professional Cloud DevOps Engineer workshop Module 3",
        "details": "Agenda: Delivered in English over 3 weeks."
    },
    {
        "day": "Fri, April 11, 2025",
        "time": "12:30 PM - 4:30 PM GMT+5:30",
        "description": "Academy - Professional Cloud DevOps Engineer workshop Module 4",
        "details": "Agenda: Delivered in English over 3 weeks."
    },
    {
        "day": "Wed, April 16, 2025",
        "time": "12:30 PM - 4:30 PM GMT+5:30",
        "description": "Academy - Professional Cloud DevOps Engineer workshop Module 5",
        "details": "Agenda: Delivered in English over 3 weeks."
    },
    {
        "day": "Thu, April 17, 2025",
        "time": "12:30 PM - 4:30 PM GMT+5:30",
        "description": "Academy - Professional Cloud DevOps Engineer workshop Module 6",
        "details": "Agenda: Delivered in English over 3 weeks."
    }
];


const scheduleCloudArchitectApril = [
  {
    "day": "Thursday, March 27, 2025",
    "time": "9:00 AM - 5:00 PM GMT+5:30",
    "description": "Academy - Cloud Digital Leader Workshop ",
    "details": "A comprehensive workshop covering cloud fundamentals, digital transformation, and Google Cloud solutions. Interns can join either of the two available sessions based on their convenience.",
    "link": "https://meet.google.com/example",
    "recording": ""
  },
  {
      "day": "Wed, April 2, 2025",
      "time": "12:30 PM - 4:30 PM GMT+5:30",
      "description": "Academy - Professional Cloud Architect workshop Module 1",
      "details": "Agenda: Delivered in English over 3 weeks."
  },
  {
      "day": "Fri, April 4, 2025",
      "time": "12:30 PM - 4:30 PM GMT+5:30",
      "description": "Academy - Professional Cloud Architect workshop Module 2",
      "details": "Agenda: Delivered in English over 3 weeks."
  },
  {
      "day": "Wed, April 9, 2025",
      "time": "12:30 PM - 4:30 PM GMT+5:30",
      "description": "Academy - Professional Cloud Architect workshop Module 3",
      "details": "Agenda: Delivered in English over 3 weeks."
  },
  {
      "day": "Fri, April 11, 2025",
      "time": "12:30 PM - 4:30 PM GMT+5:30",
      "description": "Academy - Professional Cloud Architect workshop Module 4",
      "details": "Agenda: Delivered in English over 3 weeks."
  },
  {
      "day": "Mon, April 14, 2025",
      "time": "12:30 PM - 4:30 PM GMT+5:30",
      "description": "Academy - Professional Cloud Architect workshop Module 5",
      "details": "Agenda: Delivered in English over 3 weeks."
  },
  {
      "day": "Wed, April 16, 2025",
      "time": "12:30 PM - 4:30 PM GMT+5:30",
      "description": "Academy - Professional Cloud Architect workshop Module 6",
      "details": "Agenda: Delivered in English over 3 weeks."
  }
];


  
  // -------------------------
// Schedule Loader
// -------------------------
function loadSchedule(selectedSchedule) {
  // Use the provided schedule or default schedule array
  const sessions = selectedSchedule || schedule;
  const scheduleContainer = document.getElementById("schedule");
  scheduleContainer.innerHTML = "";

  // Fetch reliable time from worldtimeapi.org for Asia/Kolkata (GMT+5:30)
  fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata")
    .then(response => response.json())
    .then(data => {
      // Use the API returned time instead of client local time
      const now = new Date(data.datetime);
      console.log("Current reliable time:", now);

      let ongoingSessions = [];
      let upcomingSessions = [];
      let pastSessions = [];

      // Categorize sessions using the reliable time (now)
      sessions.forEach(session => {
        if (session.time === "TBA") {
          upcomingSessions.push(session);
          return;
        }
        const timeParts = session.time.split(" - ");
        const startTimeStr = timeParts[0];
        const endTimeStr = timeParts[1] ? timeParts[1].replace("GMT+5:30", "").trim() : null;
        const sessionStartTime = new Date(`${session.day} ${startTimeStr} GMT+5:30`);
        const sessionEndTime = endTimeStr ? new Date(`${session.day} ${endTimeStr} GMT+5:30`) : null;

        if (sessionEndTime && now > sessionEndTime) {
          pastSessions.push(session);
        } else if (now >= sessionStartTime) {
          ongoingSessions.push(session);
        } else {
          upcomingSessions.push(session);
        }
      });

      // Create session elements using the same "now" value
      function createSessionElement(session, userBatch) {
        let buttonHTML = "";
        let isJoinAvailable = false;
        let sessionEnded = false;

        // Do not create a new "now"; use the one from the outer scope
        if (session.time === "TBA") {
          isJoinAvailable = true;
        } else {
          const timeParts = session.time.split(" - ");
          const startTimeStr = timeParts[0];
          const endTimeStr = timeParts[1] ? timeParts[1].replace("GMT+5:30", "").trim() : null;
          const sessionStartTime = new Date(`${session.day} ${startTimeStr} GMT+5:30`);
          const sessionEndTime = endTimeStr ? new Date(`${session.day} ${endTimeStr} GMT+5:30`) : null;
          const joinActivationTime = new Date(sessionStartTime.getTime() - 10 * 60 * 1000);

          isJoinAvailable = now >= joinActivationTime && (!sessionEndTime || now <= sessionEndTime);

          if (sessionEndTime && now > sessionEndTime) {
            sessionEnded = true;
          }
        }

        if (sessionEnded) {
          buttonHTML = `
              <button disabled>Session Ended</button>
              <a href="${session.recording || 'https://youtu.be/Vf_BvK13P9c'}" target="_blank">
                  <button>View Recording</button>
              </a>`;
        } else if (isJoinAvailable) {
          buttonHTML = `<a href="${session.link}" target="_blank"><button>Join</button></a>`;
        } else {
          buttonHTML = `<button disabled>Join</button>`;
        }

        // Determine the correct notes file
        let notesFile = "notes/ace-notes"; // Default notes
        console.log("User Batch:", userBatch);
        console.log("Session Description:", session.description);

        if (userBatch && typeof userBatch === "string") {
          let batchLower = userBatch.trim().toLowerCase();
          if (batchLower === "ml") {
            notesFile = "notes/ml-notes";
          } else if (batchLower === "professional machine learning") {
            notesFile = "notes/ml-engineer-notes";
          }
        }

        if (session.description && typeof session.description === "string") {
          let descriptionLower = session.description.trim().toLowerCase();
          if (descriptionLower.includes("cloud digital leader")) {
            notesFile = "notes/digital-leader-notes";
          } else if (descriptionLower.includes("professional machine learning engineer")) {
            notesFile = "notes/ml-engineer-notes";
          }
        }

        if (session.description.includes("Exam Readiness Workshop Associate Cloud Engineer")) {
          notesFile = "notes/exam-ready-ness";
        }

        console.log("Selected Notes File:", notesFile);

        const sessionElement = document.createElement("div");
        sessionElement.className = "session";
        sessionElement.innerHTML = `
          <h4>${session.day}</h4>
          <p>${session.time}</p>
          <p>${session.description}</p>
          <div class="session-details">
              <p>Meeting Link:</p>
              ${buttonHTML}
          </div>
          <p>A "Join" button will activate 10 minutes before the meeting. Refresh the page if the button does not get active.<br>
          For any issues, start a live chat with our team. 
          <a href="https://dcinfo.tech/live-chat">Click here</a> for instant support.</p>
          <p>Our expert team is available to assist you with just one click.</p>
          <p>If you can't see the lecture notes provided by the trainer, just 
              <a href="${notesFile}" target="_blank">
                  <button class="lecture-notes-btn">Click here</button>
              </a> to view the lecture notes.
          </p>
        `;
        return sessionElement;
      } // end createSessionElement

      // Update the DOM with the grouped sessions
      if (ongoingSessions.length > 0) {
        const ongoingContainer = document.createElement("div");
        ongoingContainer.id = "ongoingSessions";
        ongoingContainer.innerHTML = "<h3>Ongoing Sessions</h3>";
        ongoingSessions.forEach(session => {
          ongoingContainer.appendChild(createSessionElement(session));
        });
        scheduleContainer.appendChild(ongoingContainer);
      }

      if (upcomingSessions.length > 0) {
        const upcomingContainer = document.createElement("div");
        upcomingContainer.id = "upcomingSessions";
        upcomingContainer.innerHTML = "<h3>Upcoming Sessions</h3>";
        upcomingSessions.forEach(session => {
          upcomingContainer.appendChild(createSessionElement(session));
        });
        scheduleContainer.appendChild(upcomingContainer);
      }

      if (pastSessions.length > 0) {
        const pastContainer = document.createElement("div");
        pastContainer.id = "pastSessions";
        pastContainer.innerHTML = "<h3>Past Sessions</h3>";
        pastSessions.forEach(session => {
          pastContainer.appendChild(createSessionElement(session));
        });
        scheduleContainer.appendChild(pastContainer);
      }

      // Refresh every minute to update the join/recording button status.
      setTimeout(() => loadSchedule(selectedSchedule), 60000);
    })
    .catch(error => {
      console.error("Error fetching time from API. Falling back to local time.", error);
      const now = new Date();
      console.log("Current local time:", now);

      let ongoingSessions = [];
      let upcomingSessions = [];
      let pastSessions = [];

      sessions.forEach(session => {
        if (session.time === "TBA") {
          upcomingSessions.push(session);
          return;
        }
        const timeParts = session.time.split(" - ");
        const startTimeStr = timeParts[0];
        const endTimeStr = timeParts[1] ? timeParts[1].replace("GMT+5:30", "").trim() : null;
        const sessionStartTime = new Date(`${session.day} ${startTimeStr} GMT+5:30`);
        const sessionEndTime = endTimeStr ? new Date(`${session.day} ${endTimeStr} GMT+5:30`) : null;

        if (sessionEndTime && now > sessionEndTime) {
          pastSessions.push(session);
        } else if (now >= sessionStartTime) {
          ongoingSessions.push(session);
        } else {
          upcomingSessions.push(session);
        }
      });

      function createSessionElement(session, userBatch) {
        let buttonHTML = "";
        let isJoinAvailable = false;
        let sessionEnded = false;

        if (session.time === "TBA") {
          isJoinAvailable = true;
        } else {
          const timeParts = session.time.split(" - ");
          const startTimeStr = timeParts[0];
          const endTimeStr = timeParts[1] ? timeParts[1].replace("GMT+5:30", "").trim() : null;
          const sessionStartTime = new Date(`${session.day} ${startTimeStr} GMT+5:30`);
          const sessionEndTime = endTimeStr ? new Date(`${session.day} ${endTimeStr} GMT+5:30`) : null;
          const joinActivationTime = new Date(sessionStartTime.getTime() - 10 * 60 * 1000);

          isJoinAvailable = now >= joinActivationTime && (!sessionEndTime || now <= sessionEndTime);

          if (sessionEndTime && now > sessionEndTime) {
            sessionEnded = true;
          }
        }

        if (sessionEnded) {
          buttonHTML = `
              <button disabled>Session Ended</button>
              <a href="${session.recording || 'https://youtu.be/Vf_BvK13P9c'}" target="_blank">
                  <button>View Recording</button>
              </a>`;
        } else if (isJoinAvailable) {
          buttonHTML = `<a href="${session.link}" target="_blank"><button>Join</button></a>`;
        } else {
          buttonHTML = `<button disabled>Join</button>`;
        }

        let notesFile = "notes/ace-notes";
        console.log("User Batch:", userBatch);
        console.log("Session Description:", session.description);

        if (userBatch && typeof userBatch === "string") {
          let batchLower = userBatch.trim().toLowerCase();
          if (batchLower === "ml") {
            notesFile = "notes/ml-notes";
          } else if (batchLower === "professional machine learning") {
            notesFile = "notes/ml-engineer-notes";
          }
        }

        if (session.description && typeof session.description === "string") {
          let descriptionLower = session.description.trim().toLowerCase();
          if (descriptionLower.includes("cloud digital leader")) {
            notesFile = "notes/digital-leader-notes";
          } else if (descriptionLower.includes("professional machine learning engineer")) {
            notesFile = "notes/ml-engineer-notes";
          }
        }

        if (session.description.includes("Exam Readiness Workshop Associate Cloud Engineer")) {
          notesFile = "notes/exam-ready-ness";
        }

        if (session.description.includes("Academy - Professional Cloud DevOps Engineer workshop ")) {
          notesFile = "notes/devops-notes";
        }
        if (session.description.includes("Academy - Professional Cloud Architect workshop Module")) {
          notesFile = "notes/pca-notes";
        }

 
 
        console.log("Selected Notes File:", notesFile);

        const sessionElement = document.createElement("div");
        sessionElement.className = "session";
        sessionElement.innerHTML = `
          <h4>${session.day}</h4>
          <p>${session.time}</p>
          <p>${session.description}</p>
          <div class="session-details">
              <p>Meeting Link:</p>
              ${buttonHTML}
          </div>
          <p>A "Join" button will activate 10 minutes before the meeting. Refresh the page if the button does not get active.<br>
          For any issues, start a live chat with our team. 
          <a href="https://dcinfo.tech/live-chat">Click here</a> for instant support.</p>
          <p>Our expert team is available to assist you with just one click.</p>
          <p>If you can't see the lecture notes provided by the trainer, just 
              <a href="${notesFile}" target="_blank">
                  <button class="lecture-notes-btn">Click here</button>
              </a> to view the lecture notes.
          </p>
        `;
        return sessionElement;
      }

      if (ongoingSessions.length > 0) {
        const ongoingContainer = document.createElement("div");
        ongoingContainer.id = "ongoingSessions";
        ongoingContainer.innerHTML = "<h3>Ongoing Sessions</h3>";
        ongoingSessions.forEach(session => {
          ongoingContainer.appendChild(createSessionElement(session));
        });
        scheduleContainer.appendChild(ongoingContainer);
      }

      if (upcomingSessions.length > 0) {
        const upcomingContainer = document.createElement("div");
        upcomingContainer.id = "upcomingSessions";
        upcomingContainer.innerHTML = "<h3>Upcoming Sessions</h3>";
        upcomingSessions.forEach(session => {
          upcomingContainer.appendChild(createSessionElement(session));
        });
        scheduleContainer.appendChild(upcomingContainer);
      }

      if (pastSessions.length > 0) {
        const pastContainer = document.createElement("div");
        pastContainer.id = "pastSessions";
        pastContainer.innerHTML = "<h3>Past Sessions</h3>";
        pastSessions.forEach(session => {
          pastContainer.appendChild(createSessionElement(session));
        });
        scheduleContainer.appendChild(pastContainer);
      }

      setTimeout(() => loadSchedule(selectedSchedule), 60000);
    });
}

// -------------------------
// Batch-based Page Loader
// -------------------------
function loadPage() {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  console.log("User data from sessionStorage:", user);

  if (!user) {
    console.log("No user found. Showing login container.");
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("dashboardContainer").style.display = "none";
  } else {
    console.log("User found:", user);
    document.getElementById("userName").innerText = user.name;
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("dashboardContainer").style.display = "block";

    setInterval(() => {
      document.getElementById("currentTime").innerText = new Date().toLocaleTimeString();
    }, 1000);

    console.log("User batch:", user.batch);
    if (user.batch && user.batch.toUpperCase() === "ML") {
      console.log("Loading ML schedule");
      loadSchedule(scheduleML);
    } else if (user.batch && user.batch.toUpperCase() === "1APRIL") {
      console.log("Loading 1APRIL schedule");
      loadSchedule(schedule1April);
    } else if (user.batch && user.batch.toUpperCase() === "DEVOPS") {
      console.log("Loading DEVOPS schedule");
      loadSchedule(scheduleDevOpsApril);
    } else if (user.batch && user.batch.toUpperCase() === "CLOUDARCHITECT") {
      console.log("Loading CLOUDARCHITECT schedule");
      loadSchedule(scheduleCloudArchitectApril);
    } else {
      console.log("Loading default schedule");
      loadSchedule(schedule);
    }
  }
}
  
  const users = [
    // 3 March batch
    { email: "ashishaswal003@gmail.com", password: "intern@123", name: "Ashish Aswal", phone: "7055164392", batch: "3MARCH" },
    { email: "krishna.sandeepkaruturi@dcinfotech.me", password: "intern@123", name: "KRISHNA SANDEEP KARUTURI", phone: "8722889994", batch: "3MARCH" },
    { email: "sandeepkk1938@gmail.com", password: "intern@123", name: "KRISHNA SANDEEP KARUTURI", phone: "8722889994", batch: "3MARCH" },
    { email: "preetha.elangovan2318@gmail.com", password: "intern@123", name: "Preetha Elangovan", phone: "8657465111", batch: "3MARCH" },
    { email: "preetha.elangovan@dcinfotech.me", password: "intern@123", name: "Preetha Elangovan", phone: "8657465111", batch: "3MARCH" },
    { email: "atharvakumbhar669@gmail.com", password: "intern@123", name: "Atharva Kishor Kumbhar", phone: "8108741281", batch: "3MARCH" },
    { email: "ky964257@gmail.com", password: "intern@123", name: "Krishna Yadav", phone: "06386052158", batch: "3MARCH" },
    { email: "prathameshpathak7@gmail.com", password: "intern@123", name: "Prathamesh Satish Pathak", phone: "8698662408", batch: "3MARCH" },
    { email: "sahilbhosale1309@gmail.com", password: "intern@123", name: "Sahil Bhosale", phone: "9326251178", batch: "3MARCH" },
    { email: "dinesh.borase70@gmail.com", password: "intern@123", name: "Dinesh Prakash Borase", phone: "8308110391", batch: "3MARCH" },
    { email: "prasadramesh963@gmail.com", password: "intern@123", name: "Ramesh Prasad", phone: "9561480153", batch: "3MARCH" },
    { email: "satishtempwork@gmail.com", password: "intern@123", name: "Satish Kumar Janapureddi", phone: "7095885568", batch: "3MARCH" },
    { email: "pragatibavaskar@dcinfotech.me", password: "intern@123", name: "Pragati Bavaskar", phone: "1234567890", batch: "3MARCH" },
    { email: "dhirajchaudhari@dcinfotech.me", password: "intern@123", name: "Dhiraj Chaudhari", phone: "N/A", batch: "3MARCH" },
    { email: "jamalsadaf3@gmail.com", password: "intern@123", name: "Bevin", phone: "N/A", batch: "3MARCH" },
    { email: "bevinmosess@dcinfotech.me", password: "intern@123", name: "Bevin", phone: "N/A", batch: "3MARCH" },
    { email: "krishna.sandeepkaruturi@dcinfotech.me", password: "intern@123", name: "KRISHNA SANDEEP KARUTURI", phone: "8722889994", batch: "3MARCH" },
    { email: "sahilbhosale@dcinfotech.me", password: "intern@123", name: "Sahil Bhosale", phone: "9326251178", batch: "3MARCH" },
    { email: "prathamesh.pathak@dcinfotech.me", password: "intern@123", name: "Prathamesh Satish Pathak", phone: "8698662408", batch: "3MARCH" },
    { email: "krishnayadav@dcinfotech.me", password: "intern@123", name: "Krishna Yadav", phone: "06386052158", batch: "3MARCH" },
    { email: "atharva.kumbhar@dcinfotech.me", password: "intern@123", name: "Atharva Kishor Kumbhar", phone: "8108741281", batch: "3MARCH" },
    { email: "preetha.elangovan@dcinfotech.me", password: "intern@123", name: "Preetha Elangovan", phone: "8657465111", batch: "3MARCH" },
    { email: "pranjalpagaria20@gmail.com", password: "intern@123", name: "Pranjalpagaria", phone: "8657465111", batch: "3MARCH" },
    { email: "ruturaj.sonone@dcinfotech.me", password: "intern@123", name: "Ruturaj Sonone", phone: "8657465111", batch: "3MARCH" },
    { email: "sharankumar@dcinfotech.me", password: "sharan@123", name: "Sharan Kumar", phone: "", batch: "3MARCH" },
    { email: "sharankumar@dcinfotech.me", password: "intern@123", name: "Sharan Kumar", phone: "", batch: "3MARCH" },
    { email: "shardul.tiwari@dcinfotech.me", password: "intern@123", name: "Shardul Tiwari", phone: "", batch: "3MARCH" },
    { email: "m.anand@dcinfotech.me", password: "intern@123", name: "M Anand", phone: "", batch: "3MARCH" },
    { email: "shardul.tiwari@dcinfotech.me", password: "intern@123", name: "Shardul Tiwari", phone: "", batch: "3MARCH" },
    { email: "bevinmosess@dcinfotech.me", password: "bevin@69", name: "Bevin Mosess", phone: "", batch: "3MARCH" },
    { email: "mandar.nareshbodane@dcinfotech.me", password: "mandar@123", name: "Mandar Naresh Bodane", phone: "", batch: "3MARCH" },
    { email: "saloni.dhall@dcinfotech.me", password: "intern@123", name: "Saloni Dhall", phone: "", batch: "3MARCH" },
    { email: "rethessh.ed@dcinfotech.me", password: "intern@123", name: "Rethessh Ed", phone: "", batch: "3MARCH" },
    { email: "nikhil.kamode@dcinfotech.me", password: "intern@123", name: "Nikhil Kamode", phone: "", batch: "3MARCH" },
    { email: "atharva.kumbhar@dcinfotech.me", password: "intern@123", name: "Atharva Kumbhar", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "3MARCH" },
    { email: "dinesh.borase@dcinfotech.me", password: "intern@123", name: "Dinesh Borase", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "3MARCH" },
    { email: "rameshprasad@dcinfotech.me", password: "intern@123", name: "Ramesh Prasad", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "3MARCH" },
    { email: "satishkumarjanapureddi@dcinfotech.me", password: "intern@123", name: "Satish Kumar Janapureddi", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "3MARCH" },
      { email: "pratikshagupta@dcinfotech.me", password: "intern@123", name: "pratikshagupta", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "3MARCH" },
      { email: "vishwakkotha@dcinfotech.me", password: "intern@123", name: "vishwakkotha", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "3MARCH" },
      { email: "vinodb@dcinfotech.me", password: "intern@123", name: "vinod B", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "3MARCH" },

      // 1 April batch
   
    { email: "priyanshukhandelwal@dcinfotech.me", password: "intern@123", name: "priyanshukhandelwal", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "1APRIL" },
    { email: "nandinimatapodu@dcinfotech.me", password: "intern@123", name: "nandinimatapodu", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "1APRIL" },
  
    { email: "pittasaideep@dcinfotech.me", password: "intern@123", name: "PITTA SAIDEEP", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "1APRIL" },
    { email: "mayureshpatil@dcinfotech.me", password: "intern@123", name: "mayureshpatil", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "1APRIL" },
    { email: "kandikondagurusai@dcinfotech.me", password: "intern@123", name: "kandikondagurusai", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "1APRIL" },
    { email: "princepansuriya@dcinfotech.me", password: "intern@123", name: "Prince Pansuriya", phone: "", note: "Live sessions schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "1APRIL" },
   
    { email: "adarshdogra@dcinfotech.me", password: "intern@123", name: "Adarsh Dogra", phone: "", note: "Live sessidons schedule will be sent via mail. It will start from 3rd March for 3 weeks.", batch: "1APRIL" },

    { email: "dharanilingasamy@dcinfotech.me", password: "intern@123", name: "Dharani Lingasamy", phone: "", batch: "1APRIL" },
    { email: "adityasingh@dcinfotech.me", password: "intern@123", name: "Aditya Singh", phone: "", batch: "1APRIL" },
    { email: "varshithpasupunuri@dcinfotech.me", password: "intern@123", name: "Varshith Pasupunuri", phone: "", batch: "1APRIL" },
    { email: "dhiraj", password: "dhiraj", name: "Varshith Pasupunuri", phone: "", batch: "1APRIL" },
    { email: "bhagwatibashyal@dcinfotech.me", password: "intern@123", name: "Bhagwati Bhimdev Bashyal", phone: "", batch: "1APRIL" },
    { email: "ajaykumar@dcinfotech.me", password: "intern@123", name: "Ajay Kumar", phone: "", batch: "1APRIL" },
    { email: "mahmadirfan@dcinfotech.me", password: "intern@123", name: "Mahmad Irfan", phone: "", batch: "1APRIL" },
    { email: "vedantpatil@dcinfotech.me", password: "intern@123", name: "Vedant Patil", phone: "", batch: "1APRIL" },
    { email: "gudarurajkumar@dcinfotech.me", password: "intern@123", name: "Gudaru Rajkumar", phone: "", batch: "1APRIL" },
    { email: "shanmukatrived@dcinfotech.me", password: "intern@123", name: "Penukonda Shanmuka Trived", phone: "", batch: "1APRIL" },
    { email: "sutharisaimanikantavivek@dcinfotech.me", password: "intern@123", name: "Suthari Sai manikanta vivek", phone: "", batch: "1APRIL" },
    { email: "omkardhananjaywagh@dcinfotech.me", password: "intern@123", name: "Omkar Dhananjay Wagh", phone: "", batch: "1APRIL" },
    { email: "anjalipathak@dcinfotech.me", password: "intern@123", name: "Anjali Pathak", phone: "", batch: "1APRIL" },
    { email: "abhi", password: "abhi", name: "Anjali Pathak", phone: "", batch: "1APRIL" },
    { email: "omkarwagh@dcinfotech.me", password: "intern@123", name: "Omkar Dhananjay Wagh", phone: "", batch: "1APRIL" },


    { "email": "shashankrai@dcinfotech.me", "password": "intern@123", "name": "Shashank Rai", "phone": "", "batch": "1APRIL" },
    { "email": "pargichandana@dcinfotech.me", "password": "intern@123", "name": "Pargi Chandana", "phone": "", "batch": "1APRIL" },
    { "email": "c.mahesh@dcinfotech.me", "password": "intern@123", "name": "Mahesh C", "phone": "", "batch": "1APRIL" },
    { "email": "aniketprakashpawar@dcinfotech.me", "password": "intern@123", "name": "Aniket Prakash Pawar", "phone": "", "batch": "1APRIL" },

    { "email": "vishalsunilghorse@dcinfotech.me", "password": "intern@123", "name": "Vishal Sunil Ghorse", "phone": "", "batch": "1APRIL" },

    { "email": "piyushmujmule@dcinfotech.me", "password": "intern@123", "name": "Piyush Mujmule", "phone": "", "batch": "1APRIL" },

    { "email": "nidhikrishnagangurde@dcinfotech.me", "password": "intern@123", "name": "nidhikrishnagangurde", "phone": "", "batch": "1APRIL" },
    { "email": "gauravsingh@dcinfotech.me", "password": "intern@123", "name": "gauravsingh", "phone": "", "batch": "1APRIL" },

    { "email": "jedlaritishkrishna@dcinfotech.me", "password": "intern@123", "name": "JEDLA RITISH KRISHNA", "phone": "", "batch": "1APRIL" },
    { "email": "soumyaranjanmohanty@dcinfotech.me", "password": "intern@123", "name": "JEDLA RITISH KRISHNA", "phone": "", "batch": "1APRIL" },
  
    { "email": "tejasbhaskartadka@dcinfotech.me", "password": "intern@123", "name": "Tejas Bhaskar Tadka", "phone": "", "batch": "1APRIL" },


    //new entery 
    { "email": "sreedharchalumuri@dcinfotech.me", "password": "intern@123", "name": "SREEDHAR CHALUMURI", "phone": "", "batch": "1APRIL" },
    { "email": "meetsathavara@dcinfotech.me", "password": "intern@123", "name": "Sathavara Meet Kaushikkumar", "phone": "", "batch": "1APRIL" },

    { "email": "payalsonkusare@dcinfotech.me", "password": "intern@123", "name": "PAYAL RAMBHAROS SONKUSARE", "phone": "", "batch": "1APRIL" },


    { "email": "najanayogivamsikrishna@dcinfotech.me", "password": "intern@123", "name": "Najana Yogi Vamsi Krishna", "phone": "", "batch": "1APRIL" },



    // ML batch
    { email: "pulagamravikiranreddy@dcinfotech.me", password: "intern@123", name: "pulagamravikiranreddy", phone: "", batch: "ML" },



    //DEVOPS BATCH 

    { email: "shan.muganandam@dcinfotech.me", password: "intern@123", name: " K.shanmuganandam", phone: "", batch: "DEVOPS" },
    { email: "gauravbhatt@dcinfotech.me", password: "intern@123", name: "GAURAV BHATT", phone: "", batch: "DEVOPS" },


    //architect batch

    
    { "email": "nishigandhajagadale@dcinfotech.me", "password": "intern@123", "name": "Nishigandha Jagadale ", "phone": "", "batch": "CLOUDARCHITECT" },


  ];

  
  document.body.appendChild(createSessionElement(session1, "ML")); // Loads ML Notes
  document.body.appendChild(createSessionElement(session1, "other")); // Loads Default Notes
  // Call loadPage on DOMContentLoaded


  // Insert user data into the HTML
  document.getElementById('userName').textContent = userData.name;
  document.getElementById('userEmail').textContent = userData.email;

  document.addEventListener("DOMContentLoaded", loadPage);