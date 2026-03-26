const notices = [
    {
      title: "⚠️ Important Notice",
      content: `
        ⚠️ <strong>Domain Notice:</strong> This domain <strong>dcinfotech.org.in</strong> will be <strong>deactivated soon</strong>. 
        All future communication will take place via <strong>dcinfotech.org.in</strong> only. You can still access this website and its features during the transition period. 
        Also, you will get mail from <strong>@dcinfotech.me</strong> domain until the full transition is complete.<br><br>
        All official communication from DC Cloud Solutions will be sent only through email addresses ending in 
        <strong>@dcinfotech.me</strong> or <strong>@dcinfotech.org.in</strong>. If you receive any messages from other domains or sources claiming to represent DC Cloud Solutions, 
        do <strong>NOT</strong> respond or share any personal, financial, or confidential information. DC Cloud Solutions will not be responsible for any loss, damage, or consequences 
        arising from such unauthorized communication.<br><br>
        <strong>Important:</strong> For detailed service updates and server logs, please visit: 
        <a href="https://dcinfotech.org.in/cloud/server-status" target="_blank">dcinfotech.org.in/cloud/server-status</a>
      `,
      style: {
        background: "#fff3cd",
        borderLeft: "6px solid #ffeeba",
        padding: "15px",
        borderRadius: "6px",
        color: "#856404"
      }
    },
    {
      title: "📢 Notice 2",
      content: `
        As per Google’s updated partner security policy, 
        <strong>session recording from 14th July 2025 onwards</strong> will no longer be available.<br><br>
        If you have a valid reason and need access to these session details, you may request it for special consideration.<br><br>
        Please contact us via 
        <a href="mailto:support@dcinfotech.org.in">support@dcinfotech.org.in</a> or use our 
        <a href="https://dcinfotech.org.in/live-chat" target="_blank">Live Chat</a>.
      `,
      style: {
        fontSize: "16px",
        lineHeight: "1.5",
        marginTop: "20px"
      }
    },
        {
      title: "📢 Notice 3",
      content: `
          🛠️ <strong>Login Troubleshooting:</strong> If you're facing login issues, try pressing <strong>Ctrl + Shift + R</strong> to hard refresh the page and clear old cache. 
    Alternatively, try opening the site in an <strong>Incognito/Private</strong> window.<br><br>
      `,
      style: {
        fontSize: "16px",
        lineHeight: "1.5",
        marginTop: "20px"
      }
    }
  
  ];

  const container = document.getElementById("noticeContainer");

  notices.forEach((notice) => {
    const wrapper = document.createElement("div");

    // Add Title
    const h2 = document.createElement("h2");
    h2.innerHTML = notice.title;
    wrapper.appendChild(h2);

    // Add Content
    const p = document.createElement("p");
    p.innerHTML = notice.content;

    // Apply inline styles
    for (const [key, value] of Object.entries(notice.style)) {
      p.style[key] = value;
    }

    wrapper.appendChild(p);
    container.appendChild(wrapper);
  });