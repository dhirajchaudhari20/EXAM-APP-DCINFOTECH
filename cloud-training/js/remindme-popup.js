function showRemindMePopup() {
  Swal.fire({
    title: "New Feature: Remind Me! 📅",
    html: `
      <p>We are excited to introduce the <b>Remind Me</b> feature!</p>
      <p>Now, you can set reminders for your live sessions directly in your Google Calendar.</p>
      <p>Simply click the <b>Remind Me</b> button next to any session to create a calendar event.</p>
      <p>Don't forget to check your email for login credentials to join the session!</p>
    `,
    icon: "info",
    confirmButtonText: "Got it!",
    footer: `<a href="#" id="learnMoreLink">Learn more about this feature</a>`,
    didOpen: () => {
      const link = document.getElementById("learnMoreLink");
      if (link) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          Swal.fire({
            title: "How Remind Me Works",
            html: `
              <img src="https://i.ibb.co/dXZ0sXx/Untitled-video-Made-with-Clipchamp.gif" 
                   alt="Demo GIF" style="max-width:100%; border-radius: 8px;" />
              <p style="margin-top: 15px;">With just one click, the <b>Remind Me</b> button will add the session to your Google Calendar with all the important details!</p>
            `,
            confirmButtonText: "Close",
            width: 600,
          });
        });
      }
    },
  });
}

// 📌 Trigger popup manuddddally
document.getElementById("newFeatureBtn").addEventListener("click", showRemindMePopup);
