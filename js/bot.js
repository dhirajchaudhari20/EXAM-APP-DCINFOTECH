(() => {
  // --- CONFIG ---
  const AI_ENDPOINT = "/.netlify/functions/gemini-proxy";
  const BRAND_NAME = "CodeLab AI by DC Cloud Solutions";

  // --- DOM ---
  const chatbotBtn = document.getElementById("chatbotBtn");
  const chatModal = document.getElementById("chatModal");
  const chatCloseBtn = chatModal.querySelector(".codelab-closeBtn");
  const minimizeBtn = document.getElementById("minimizeBtn");
  const userFormSection = document.getElementById("userFormSection");
  const chatSection = document.getElementById("chatSection");
  const userForm = document.getElementById("userForm");
  const chatBody = document.getElementById("chatBody");
  const userInput = document.getElementById("userInput");
  const fileInput = document.getElementById("fileInput");
  const loadingStatus = document.getElementById("loadingStatus");
  const sendBtn = document.getElementById("sendBtn");
  const liveChatBtn = document.getElementById("liveChatBtn");
  // 1. Add this after your DOM queries:
  // ...existing code...

  // Spinner HTML
  const spinnerHTML = `<div id="chatSpinner" style="display:flex;justify-content:center;align-items:center;height:38px;">
  <div style="border:4px solid #e0e7ff;border-top:4px solid #5a8dee;border-radius:50%;width:28px;height:28px;animation:spin 1s linear infinite;"></div>
</div>
<style>
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
</style>`;

  // Find the Start Chat button
  const startChatBtn = document.querySelector(
    '#userFormSection button[type="submit"]'
  );

  // Replace Start Chat button with spinner on click
  if (startChatBtn) {
    startChatBtn.addEventListener("click", function (e) {
      // Prevent double submit
      if (document.getElementById("chatSpinner")) return;
      // Hide button and show spinner
      startChatBtn.style.display = "none";
      startChatBtn.insertAdjacentHTML("afterend", spinnerHTML);

      // Let the form submit after a short delay (simulate loading)
      setTimeout(() => {
        // Remove spinner
        const spinner = document.getElementById("chatSpinner");
        if (spinner) spinner.remove();
        // Show chat window (the form submit will trigger your existing logic)
        startChatBtn.style.display = "";
        // Optionally, you can trigger form submission here if not already handled
        // startChatBtn.form.submit();
      }, 1000); // 1 second loading
    });
  }

  // ...existing code...
  const clearChatBtn = document.getElementById("clearChatBtn");
  // ...existing code...

  // Add after DOM queries
  const voiceBtn = document.createElement("button");
  voiceBtn.id = "voiceBtn";
  voiceBtn.title = "Speak";
  voiceBtn.innerHTML = "🎤";
  voiceBtn.style.background = "#5a8dee";
  voiceBtn.style.color = "#fff";
  voiceBtn.style.border = "none";
  voiceBtn.style.borderRadius = "50%";
  voiceBtn.style.width = "38px";
  voiceBtn.style.height = "38px";
  voiceBtn.style.fontSize = "1.3em";
  voiceBtn.style.marginLeft = "4px";
  voiceBtn.style.cursor = "pointer";
  voiceBtn.style.transition = "background 0.3s";
  voiceBtn.style.display = "flex";
  voiceBtn.style.alignItems = "center";
  voiceBtn.style.justifyContent = "center";

  // Insert voice button next to sendBtn
  sendBtn.parentNode.insertBefore(voiceBtn, sendBtn);

  // Voice recognition logic
  let recognition;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.onclick = () => {
      voiceBtn.style.background = "#2c8c47";
      voiceBtn.innerHTML = "🎙️";
      recognition.start();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
      voiceBtn.style.background = "#5a8dee";
      voiceBtn.innerHTML = "🎤";
      sendMessage();
    };

    recognition.onerror = () => {
      voiceBtn.style.background = "#5a8dee";
      voiceBtn.innerHTML = "🎤";
      alert("Sorry, could not recognize your voice. Please try again.");
    };

    recognition.onend = () => {
      voiceBtn.style.background = "#5a8dee";
      voiceBtn.innerHTML = "🎤";
    };
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice input not supported in this browser";
  }
  // ...existing code...

  // Detect iOS device
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  if (isIOS()) {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice input is not supported on iOS browsers.";
    voiceBtn.style.opacity = "0.5";
  } else if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
  ) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.onclick = () => {
      voiceBtn.style.background = "#2c8c47";
      voiceBtn.innerHTML = "🎙️";
      recognition.start();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
      voiceBtn.style.background = "#5a8dee";
      voiceBtn.innerHTML = "🎤";
      sendMessage();
    };

    recognition.onerror = () => {
      voiceBtn.style.background = "#5a8dee";
      voiceBtn.innerHTML = "🎤";
      alert("Sorry, could not recognize your voice. Please try again.");
    };

    recognition.onend = () => {
      voiceBtn.style.background = "#5a8dee";
      voiceBtn.innerHTML = "🎤";
    };
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice input not supported in this browser";
    voiceBtn.style.opacity = "0.5";
  }

  // ...existing code...
  // ...existing code...
  clearChatBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to clear the chat history? This cannot be undone."
      )
    ) {
      localStorage.removeItem(getSessionKey());
      localStorage.removeItem("codelabUserInfo"); // Remove user info
      sessionStorage.removeItem("codelabSessionStarted"); // Reset session
      chatBody.innerHTML = "";
      userFormSection.style.display = "block"; // Show form
      chatSection.style.display = "none"; // Hide chat
    }
  });

  // --- STATE ---
  let userInfo = null;

  // --- SESSION LOGIC ---
  function isNewSession() {
    return !sessionStorage.getItem("codelabSessionStarted");
  }
  function startSession() {
    sessionStorage.setItem("codelabSessionStarted", "1");
  }

  function getSessionKey() {
    if (userInfo && userInfo.email) {
      return "codelabChat_" + userInfo.email;
    }
    return "codelabChat_guest";
  }

  function saveConversation() {
    localStorage.setItem(getSessionKey(), chatBody.innerHTML);
  }
  function loadConversation() {
    const html = localStorage.getItem(getSessionKey());
    if (html) chatBody.innerHTML = html;
  }

  // --- UI LOGIC ---
  chatModal.style.display = "none";

  chatbotBtn.addEventListener("click", () => {
    chatModal.style.display = "flex";
    if (isNewSession()) {
      userFormSection.style.display = "block";
      chatSection.style.display = "none";
    } else {
      userInfo = JSON.parse(localStorage.getItem("codelabUserInfo") || "null");
      if (userInfo) {
        userFormSection.style.display = "none";
        chatSection.style.display = "flex";
        loadConversation();
        setTimeout(() => userInput.focus(), 200);
      } else {
        userFormSection.style.display = "block";
        chatSection.style.display = "none";
      }
    }
  });

  minimizeBtn.addEventListener("click", () => {
    chatModal.style.display = "none";
  });

  chatCloseBtn.addEventListener("click", () => {
    chatModal.style.display = "none";
    clearFileInput();
  });

  window.addEventListener("click", (e) => {
    if (e.target === chatModal) {
      chatModal.style.display = "none";
      clearFileInput();
    }
  });

  // ...existing code...
  // ...existing code...

  userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const startChatBtn = userForm.querySelector('button[type="submit"]');
    let originalBtnHTML;
    if (startChatBtn) {
      originalBtnHTML = startChatBtn.innerHTML;
      startChatBtn.innerHTML = `<span style="display:inline-block;vertical-align:middle;">
      <span style="display:inline-block;width:22px;height:22px;border:3px solid #e0e7ff;border-top:3px solid #5a8dee;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;"></span>
    </span>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
    </style>`;
      startChatBtn.disabled = true;
    }

    setTimeout(() => {
      if (startChatBtn) {
        startChatBtn.innerHTML = originalBtnHTML;
        startChatBtn.disabled = false;
      }

      // Now process the form as before
      userInfo = {
        name: document.getElementById("userName").value.trim(),
        email: document.getElementById("userEmail").value.trim(),
        codelab: document.getElementById("userCodeLab").value.trim(),
      };
      localStorage.setItem("codelabUserInfo", JSON.stringify(userInfo));
      userFormSection.style.display = "none";
      chatSection.style.display = "flex";
      startSession();
      loadConversation();
      showWelcome();
      setTimeout(() => userInput.focus(), 200);
    }, 1000); // 1 second loading
  });

  // ...existing code...
  // ...existing code...

  sendBtn.addEventListener("click", sendMessage);

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        appendMessage(
          `<div>📎 Image uploaded: ${file.name}</div>`,
          "user",
          true
        );
      };
      reader.readAsDataURL(file);

    } else if (file) {
      appendMessage(`📎 File uploaded: ${file.name}`, "user");
    }
  });

  async function sendMessage() {
    const text = userInput.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    if (text) appendMessage(text, "user");
    userInput.value = "";
    // Add "Thinking..." bubble and keep a reference to it
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "codelab-chat-message bot";
    chatBody.appendChild(thinkingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Typewriter animation for "Working..."
    const workingText = "Working...";
    let wi = 0;
    function typeWorking() {
      if (wi <= workingText.length) {
        thinkingDiv.innerHTML = `<i>${workingText.substring(
          0,
          wi
        )}</i><span class="codelab-cursor">|</span>`;
        chatBody.scrollTop = chatBody.scrollHeight;
        wi++;
        setTimeout(typeWorking, 60); // Adjust speed as needed
      } else {
        thinkingDiv.innerHTML = `<i>${workingText}</i>`;
      }
    }
    typeWorking();

    // Custom response for "how are you"
    if (
      text.toLowerCase().includes("who created you") ||
      text.toLowerCase().includes("who built you") ||
      text.toLowerCase().includes("who developed you") ||
      text.toLowerCase().includes("your creator") ||
      text.toLowerCase().includes("who is your creator") ||
      text.toLowerCase().includes("who made you") ||
      text.toLowerCase().includes("who made this") ||
      text.toLowerCase().includes("who is your developer")
    ) {
      setTimeout(() => {
        thinkingDiv.innerHTML =
          "I'm <b>CodeLab Assistant</b>, created by DC Cloud Solutions engineers to help you with your labs and questions! How can I assist you today?";
        saveConversation();
        clearFileInput();
      }, 600);
      return;
    }

    try {
      let payload = { contents: [{ parts: [] }] };

      if (userInfo && userInfo.codelab) {
        payload.contents[0].parts.push({
          text: `CodeLab Link: ${userInfo.codelab}`,
        });
      }
      if (text) payload.contents[0].parts.push({ text });

      if (file && file.type.startsWith("image/")) {
        const base64 = await fileToBase64(file);
        payload.contents[0].parts.push({
          inline_data: {
            mime_type: file.type,
            data: base64.split(",")[1],
          },
        });
      }

      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      let reply = "⚠️ No response from AI Assistant.";
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = result.candidates[0].content.parts[0].text;
      } else if (result.error?.message) {
        reply = `❌ AI Error: ${result.error.message}`;
      }
      // Replace "Thinking..." with the real reply
      thinkingDiv.innerHTML = marked.parse(reply);
      // (Optional) Add code block copy buttons if needed, as in your appendMessage
      thinkingDiv.querySelectorAll("pre > code").forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        pre.style.position = "relative";
        pre.style.background = "#22223b";
        pre.style.color = "#f8f8f2";
        pre.style.borderRadius = "8px";
        pre.style.padding = "16px";
        pre.style.marginTop = "10px";
        pre.style.overflowX = "auto";
        codeBlock.style.fontSize = "1em";
        codeBlock.style.fontFamily =
          "Fira Mono, Menlo, Monaco, Consolas, monospace";
        const copyBtn = document.createElement("button");
        copyBtn.innerText = "Copy";
        copyBtn.style.position = "absolute";
        copyBtn.style.top = "8px";
        copyBtn.style.right = "12px";
        copyBtn.style.background = "#5a8dee";
        copyBtn.style.color = "#fff";
        copyBtn.style.border = "none";
        copyBtn.style.borderRadius = "5px";
        copyBtn.style.padding = "4px 10px";
        copyBtn.style.fontSize = "0.9em";
        copyBtn.style.cursor = "pointer";
        copyBtn.style.zIndex = "2";
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(codeBlock.innerText);
          copyBtn.innerText = "Copied!";
          setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
        };
        pre.appendChild(copyBtn);
      });
      saveConversation();
    } catch (err) {
      thinkingDiv.innerHTML = "❌ Network error. Please try again later.";
      console.error("Fetch Error:", err);
      saveConversation();
    } finally {
      clearFileInput();
    }
  }
  function appendMessage(msg, sender = "bot", isHTML = false) {
    const div = document.createElement("div");
    div.className = `codelab-chat-message ${sender}`;

    // For user messages and HTML messages, keep as before
    if (sender === "user" && userInfo && userInfo.name) {
      div.innerHTML = `<div style="font-size:0.92em;color:#5a8dee;font-weight:600;margin-bottom:2px;">${userInfo.name}</div>`;
      if (isHTML) {
        div.innerHTML += msg;
      } else {
        div.innerHTML += `<div>${msg}</div>`;
      }
      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
      saveConversation();
      return;
    } else if (isHTML) {
      div.innerHTML = msg;
      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
      saveConversation();
      return;
    }

    // --- Typewriter effect for bot messages ---
    // Convert markdown to HTML, then to plain text for typing
    const html = marked.parse(msg);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.innerText || tempDiv.textContent || "";

    div.innerHTML = ""; // Start empty for typewriter
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;

    let i = 0;
    function typeWriter() {
      if (i <= text.length) {
        // Show typed text with a blinking cursor
        div.innerHTML = `<span>${text.substring(
          0,
          i
        )}</span><span class="codelab-cursor">|</span>`;
        chatBody.scrollTop = chatBody.scrollHeight;
        i++;
        setTimeout(typeWriter, 12); // Speed: lower is faster
      } else {
        // After typing, show full HTML (with code blocks, links, etc.)
        div.innerHTML = html;
        // Add code copy buttons as before
        div.querySelectorAll("pre > code").forEach((codeBlock) => {
          const pre = codeBlock.parentElement;
          pre.style.position = "relative";
          pre.style.background = "#22223b";
          pre.style.color = "#f8f8f2";
          pre.style.borderRadius = "8px";
          pre.style.padding = "16px";
          pre.style.marginTop = "10px";
          pre.style.overflowX = "auto";
          codeBlock.style.fontSize = "1em";
          codeBlock.style.fontFamily =
            "Fira Mono, Menlo, Monaco, Consolas, monospace";
          const copyBtn = document.createElement("button");
          copyBtn.innerText = "Copy";
          copyBtn.style.position = "absolute";
          copyBtn.style.top = "8px";
          copyBtn.style.right = "12px";
          copyBtn.style.background = "#5a8dee";
          copyBtn.style.color = "#fff";
          copyBtn.style.border = "none";
          copyBtn.style.borderRadius = "5px";
          copyBtn.style.padding = "4px 10px";
          copyBtn.style.fontSize = "0.9em";
          copyBtn.style.cursor = "pointer";
          copyBtn.style.zIndex = "2";
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(codeBlock.innerText);
            copyBtn.innerText = "Copied!";
            setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
          };
          pre.appendChild(copyBtn);
        });
        saveConversation();
      }
    }
    typeWriter();
  }

  // Add this CSS for the blinking cursor (add to your main CSS file or inject via JS)
  const style = document.createElement("style");
  style.innerHTML = `
.codelab-cursor {
  display: inline-block;
  width: 1ch;
  color: #5a8dee;
  animation: codelab-blink 1s steps(1) infinite;
}
@keyframes codelab-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
`;
  document.head.appendChild(style);
  function showWelcome() {
    let previous = localStorage.getItem(getSessionKey());
    chatBody.innerHTML = "";

    // Build welcome message
    let codelabLink = "";
    let codelabSummary = "";
    if (userInfo && userInfo.codelab) {
      codelabLink = `
      <div style="margin-top:8px;">
        <span style="font-size:0.97em;">Your CodeLab:&nbsp;
          <a href="${userInfo.codelab}" target="_blank" style="color:#5a8dee;text-decoration:underline;">
            ${userInfo.codelab}
          </a>
        </span>
      </div>
    `;
      // You can customize this summary or fetch it dynamically if you want
      codelabSummary = `
      <div style="margin:18px 0 0 0;font-size:1em;">
        <b>Lab detected:</b> <a href="${userInfo.codelab}" target="_blank" style="color:#4285f4;">${userInfo.codelab}</a><br>
        <span style="color:#444;">
          I can help you with any step of this lab—explain concepts, debug errors, or guide you through the process.<br>
          <ul style="margin:8px 0 0 18px;padding:0 0 0 0.5em;font-size:0.98em;">
            <li>Stuck on a step? Tell me which one and what’s happening.</li>
            <li>Getting an error? Paste the error or upload a screenshot.</li>
            <li>Want to understand something better? Just ask!</li>
          </ul>
        </span>
      </div>
    `;
    }

    appendMessage(
      `<div style="display:flex;align-items:flex-start;gap:14px;">
      <img src="https://i.giphy.com/9KNNKJ3u8QjCOatFWe.webp" alt="AI" style="width:44px;height:44px;border-radius:50%;box-shadow:0 2px 8px #5a8dee33;">
      <div>
        <b style="font-size:1.08em;">👋 Welcome to <span style="color:#5a8dee;">CodeLab AI by DC Cloud Solutions</span>!</b>
        <div style="margin:7px 0 0 0;font-size:1em;">
          I'm your AI assistant for CodeLab tasks.<br>
          <ul style="margin:8px 0 0 18px;padding:0 0 0 0.5em;font-size:0.98em;">
            <li>Ask me any question about your internship or labs</li>
            <li>Upload an image if you're facing an error or issue</li>
            <li>Get step-by-step help, explanations, or troubleshooting</li>
            <li>I'm always here to assist you—just type your question below!</li>
          </ul>
          ${codelabLink}
        </div>
        <div style="margin-top:8px;color:#2c8c47;font-weight:600;">
          😊 happy learning!<br>
          <span style="color:#888;font-weight:400;">(You can continue your previous chat below.)</span>
        </div>
        ${codelabSummary}
        <div style="margin-top:14px;color:#444;">
          <b>How can I help you today?</b> Type your question, or upload an image if you’re facing an issue.
        </div>
      </div>
    </div>`,
      "bot",
      true
    );

    // Restore previous conversation (if any)
    if (previous) {
      chatBody.innerHTML += previous;
    }
  }
  function clearFileInput() {
    fileInput.value = "";
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  liveChatBtn.onclick = () => {
    window.open(
      "https://tawk.to/chat/673b87e22480f5b4f59ffc23/1id08lk55",
      "_blank"
    );
  };
})();
