document.addEventListener("DOMContentLoaded", function () {
      const dcPointsSection = document.getElementById("dcPointsSection");
      dcPointsSection.innerHTML = `
        <button id="dcPointsBtn" class="animated-btn purple-btn">🏓 Play Ping Pong & Collect DC Points</button>
        <div style="margin-top: 8px;">
          <strong>Your DC Points:</strong> <span id="dcPointsScore">0</span>
        </div>
        <div style="margin-top: 10px; color: #444; font-size: 15px;">
          Click the button above to play and earn DC Points!<br>
          <button id="dcPointsInfoBtn" class="animated-btn purple-btn small-btn" style="margin-top:10px;">
            Learn More About DC Points
          </button>
        </div>
        <div id="dcPointsInfoModal" class="dc-modal" style="display:none;">
          <div class="dc-modal-content">
            <button id="closeDcPointsInfo" class="dc-modal-close">×</button>
            <h3 style="color:#5f2ded;">What are DC Points?</h3>
            <p style="color:#333; font-size:16px; margin:18px 0 0 0;">
              DC Points are your reward for being active on the portal!<br><br>
              <b>How to earn?</b><br>
              - Play games like Ping Pong<br>
              - Complete quizzes and activities<br><br>
              <b>Why collect DC Points?</b><br>
              - Unlock your next certification track and training with us<br>
              - Get free training and exclusive rewards from DC Cloud Solutions!<br><br>
              <span style="color:#5f2ded;">Once you reach the required DC Points for a particular certification, it will be unlocked for you.<br><br>
              <b>Next Steps:</b><br>
              Please contact us through <a href="https://dcinfotech.org.in
/live-chat" target="_blank" style="color:#5f2ded;text-decoration:underline;">live chat</a> for your next steps and to claim your certification or training access.</span>
              <br><br>
              <span style="color:#5f2ded;">Keep playing, keep learning, and level up your cloud career!</span>
              <br><b>DC Cloud Solutions Cloud Training Campaign</b><br>
              <span style="color:#222;">
              <b>Duration:</b> 22 July – 15 August<br>
              <b>How it works:</b> Play games, complete training, and earn DC Points.<br>
              <a href="https://dcinfotech.org.in
/cloud-training/dc-points" target="_blank" style="color:#5f2ded;text-decoration:underline;">More details here</a>
              </span>
            </p>
          </div>
        </div>

        <div id="dcGameModal" class="dc-modal" style="display:none;">
          <div class="dc-modal-content" style="max-width:400px;">
            <button id="closeDcGame" class="dc-modal-close">×</button>
            <h3 class="animated-title">🏓 DC Ping Pong Game</h3>

            <div id="gameSetupSection">
              <input type="email" id="userEmail" placeholder="Enter your email" style="width:100%; padding:6px; margin-bottom:10px;" required>
              <button id="startGameBtn" class="animated-btn purple-btn"><span id="startGameText">Start Game</span></button>
              <div id="countdown" style="margin-top:8px; font-size:16px; color:#5f2ded;"></div>
            </div>

        
            <canvas id="pongCanvas" width="350" height="250" style="background:#f7f7ff; border-radius:10px; display:none;"></canvas>
            <div id="pongScore" style="margin:10px 0; font-weight:bold;"></div>
            <button id="pongRetryBtn" class="animated-btn purple-btn" style="display:none;">🔄 Retry</button>
            <div style="font-size:13px; color:#1d0202;">Move your mouse up/down to control the paddle.<br>Score points by bouncing the ball!</div>
            <div style="font-size:13px; color:#1d0202; line-height:1.5; margin-top:10px;">
              🎮 <strong>Game Instructions:</strong><br>
              ➤ Enter your email above and click <strong>Start Game</strong>.<br>
              ➤ Wait until the game starts — do not refresh or leave the page.<br>
              ➤ Move your mouse up/down to control the paddle.<br>
              ➤ Score points by bouncing the ball and collect <strong>DC Points</strong>.<br>
              ⚠️ <strong>Important:</strong> Your score will be saved when you confirm closing the game modal.<br>
              ➤ Your score data will be sent to our server when you confirm closing the modal.<br>
            </div>

            <div id="gameLoader" style="display:none;margin-top:12px;">⏳ Saving your score, please wait...</div>
            <audio id="pongHitSound" src="https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c82.mp3" preload="auto"></audio>
            <audio id="pongGameOverSound" src="https://cdn.pixabay.com/audio/2023/03/29/audio_d3932a9f99.mp3" preload="auto" loop></audio>

            <!-- Leaderboard Section -->
            <div id="leaderboard" style="margin-top: 25px;">
              <h4 style="color: #5f2ded;">🏆 DC Points Leaderboard</h4>
              <ul id="leaderboardList" style="list-style:none;padding:0;color:#222;font-size:15px;"></ul>
            </div>
          </div>
        </div>
      `;

      // Fetch leaderboard data
      fetch("https://sheetdb.io/api/v1/75ods1lwe2pbh")
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch leaderboard");
          return res.json();
        })
        .then(data => {
          const uniqueScores = {};
          data.forEach(entry => {
            const email = entry.useremail;
            const score = parseInt(entry.score);
            if (!email || isNaN(score)) return;
            uniqueScores[email] = (uniqueScores[email] || 0) + score; // Add scores for the same email
          });

          const sortedPlayers = Object.entries(uniqueScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

          const leaderboardList = document.getElementById("leaderboardList");
          leaderboardList.innerHTML = sortedPlayers.length > 0
            ? sortedPlayers.map(([email, score], index) => `
                <li><strong>#${index + 1}</strong> ${email} — ${score} pts</li>
              `).join("")
            : "<li>The challenge will start on 22 July.</li><br><li>No scores are available yet.</li>";
        })
        .catch(err => {
          document.getElementById("leaderboardList").innerHTML = "<li style='color:red;'>Failed to load leaderboard.</li>";
          console.error("Error loading leaderboard:", err);
        });

      // DC Points management
      function getDcPoints() {
        const val = localStorage.getItem("dcPoints") || "0";
        const num = parseInt(val, 10);
        return isNaN(num) ? 0 : num;
      }

      function setDcPoints(points) {
        const safePoints = isNaN(points) ? 0 : Math.max(0, points);
        localStorage.setItem("dcPoints", safePoints);
        document.getElementById("dcPointsScore").textContent = safePoints;
      }

      let lastScore = 0;
      let pongGame = null;
      let pongMuted = true;
      let gameStarted = false;
      const pongHitSound = document.getElementById("pongHitSound");
      const pongGameOverSound = document.getElementById("pongGameOverSound");

      // Event listeners
      document.getElementById("dcPointsBtn").onclick = () => {
        document.getElementById("dcGameModal").style.display = "flex";
        document.getElementById("pongCanvas").style.display = "none";
        document.getElementById("gameSetupSection").style.display = "block";
        document.getElementById("userEmail").value = "";
        document.getElementById("countdown").textContent = "";
        document.getElementById("pongScore").innerHTML = "";
        document.getElementById("pongRetryBtn").style.display = "none";
        lastScore = 0;
        gameStarted = false;
      };

      document.getElementById("startGameBtn").onclick = () => {
        const email = document.getElementById("userEmail").value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.fire("⚠️ Invalid Email", "Please enter a valid email address (e.g., user@example.com).", "warning");
          return;
        }

        let counter = 3;
        const countdownEl = document.getElementById("countdown");
        countdownEl.textContent = `⏳ Starting in ${counter}...`;

        const countdown = setInterval(() => {
          counter--;
          countdownEl.textContent = counter > 0 ? `⏳ Starting in ${counter}...` : "🎮 Go!";
          if (counter === 0) {
            clearInterval(countdown);
            setTimeout(() => {
              countdownEl.textContent = "";
              document.getElementById("gameSetupSection").style.display = "none";
              document.getElementById("pongCanvas").style.display = "block";
              gameStarted = true;
              openDcGame();
            }, 500);
          }
        }, 1000);
      };

      document.getElementById("pongRetryBtn").onclick = () => {
        document.getElementById("pongRetryBtn").style.display = "none";
        startPongGame();
      };

      document.getElementById("pongMuteBtn").onclick = function () {
        pongMuted = !pongMuted;
        this.innerText = pongMuted ? "🔇" : "🔊";
        if (!pongMuted && pongGame) pongGameOverSound.play();
        else pongGameOverSound.pause();
      };

      document.getElementById("closeDcGame").onclick = async () => {
        if (gameStarted && lastScore > 0) {
          const confirmation = await Swal.fire({
            title: "Save Your Score?",
            text: `You have scored ${lastScore} DC Points. Do you want to send this score to the server?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, send it!",
            cancelButtonText: "No, discard it",
          });

          if (confirmation.isConfirmed) {
            document.getElementById("gameLoader").style.display = "block";
            const email = document.getElementById("userEmail")?.value.trim() || "anonymous@dcinfotech.org.in
";
            const timestamp = new Date().toISOString();
            console.log("Attempting to send score:", { useremail: email, score: lastScore, timestamp });

            try {
              // Fetch the latest record for the email
              const response = await fetch(`https://sheetdb.io/api/v1/75ods1lwe2pbh/search?useremail=${encodeURIComponent(email)}`, {
                headers: { "Content-Type": "application/json" }
              });
              if (!response.ok) throw new Error(`Failed to check existing record: ${response.status}`);
              const data = await response.json();

              let totalScore = lastScore;
              let recordToDelete = null;
              if (data.length > 0) {
                // Use the latest record (assuming sorted by timestamp or ID if available)
                const latestEntry = data.reduce((latest, current) => {
                  const currentTime = new Date(current.timestamp || "1970-01-01").getTime();
                  const latestTime = new Date(latest.timestamp || "1970-01-01").getTime();
                  return currentTime > latestTime ? current : latest;
                }, data[0]);
                totalScore += parseInt(latestEntry.score || 0);
                recordToDelete = latestEntry.id;
              }

              // Delete the existing record if it exists
              if (recordToDelete) {
                const deleteResponse = await fetch(`https://sheetdb.io/api/v1/75ods1lwe2pbh/id/${recordToDelete}`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" }
                });
                if (!deleteResponse.ok) console.warn(`Failed to delete record ID ${recordToDelete}: ${deleteResponse.status}`);
              }

              // Send the updated total score
              const sendResponse = await fetch("https://sheetdb.io/api/v1/75ods1lwe2pbh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: [{ useremail: email, score: totalScore, timestamp: timestamp }] })
              });
              if (!sendResponse.ok) throw new Error(`Failed to send score: ${sendResponse.status}`);
              console.log("Score updated successfully:", totalScore);
              Swal.fire("Success!", `Your total score of ${totalScore} DC Points has been saved.`, "success");
            } catch (err) {
              console.error("Error sending score:", err.message);
              // Fallback: send current score without overwriting
              try {
                const fallbackResponse = await fetch("https://sheetdb.io/api/v1/75ods1lwe2pbh", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ data: [{ useremail: email, score: lastScore, timestamp: timestamp }] })
                });
                if (!fallbackResponse.ok) throw new Error(`Fallback send failed: ${fallbackResponse.status}`);
                console.log("Fallback score sent:", lastScore);
                Swal.fire("Success!", `Your score of ${lastScore} DC Points has been saved (fallback).`, "success");
              } catch (fallbackErr) {
                console.error("Fallback send error:", fallbackErr.message);
                Swal.fire("Error", "Failed to save your score. Please contact support.", "error");
              }
            }
            document.getElementById("gameLoader").style.display = "none";
          }
        }

        // Close modal and reset game
        document.getElementById("dcGameModal").style.display = "none";
        if (pongGame?.stop) pongGame.stop();
        document.getElementById("pongRetryBtn").style.display = "none";
        document.getElementById("pongGameOverSound").pause();
        if (lastScore > 0) {
          setDcPoints(getDcPoints() + lastScore);
          lastScore = 0;
        }
      };

      document.getElementById("dcPointsInfoBtn").onclick = () => {
        document.getElementById("dcPointsInfoModal").style.display = "flex";
      };

      document.getElementById("closeDcPointsInfo").onclick = () => {
        document.getElementById("dcPointsInfoModal").style.display = "none";
      };

      function openDcGame() {
        pongHitSound.volume = 0.6;
        pongGameOverSound.volume = 0.8;
        pongMuted = true;
        document.getElementById("pongMuteBtn").innerText = "🔇";
        pongGameOverSound.loop = true;
        pongGameOverSound.pause();
        document.getElementById("pongScore").innerHTML = "";
        startPongGame();
      }

      function startPongGame() {
        const canvas = document.getElementById("pongCanvas");
        const ctx = canvas.getContext("2d");
        const paddleHeight = 22, paddleWidth = 8;
        let paddleY = (canvas.height - paddleHeight) / 2;
        let ballRadius = 7, x = canvas.width / 2, y = canvas.height / 2;
        let dx = 5.5, dy = 4.5, score = 0, running = true;
        const maxSpeed = 10;

        // Clear any existing listeners
        canvas.onmousemove = null;

        canvas.onmousemove = function (e) {
          const rect = canvas.getBoundingClientRect();
          paddleY = e.clientY - rect.top - paddleHeight / 2;
          if (paddleY < 0) paddleY = 0;
          if (paddleY > canvas.height - paddleHeight) paddleY = canvas.height - paddleHeight;
        };

        function draw() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#5f2ded";
          ctx.fillRect(10, paddleY, paddleWidth, paddleHeight);
          ctx.beginPath();
          ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#222";
          ctx.fill();
          ctx.closePath();
          document.getElementById("pongScore").innerHTML = "Score: " + score;

          x += dx;
          y += dy;

          // Wall collision
          if (y + dy < ballRadius || y + dy > canvas.height - ballRadius) {
            dy = -dy;
          }

          // Paddle collision
          if (x - ballRadius < 10 + paddleWidth && y > paddleY && y < paddleY + paddleHeight) {
            dx = Math.min(-dx * 1.08, maxSpeed);
            dy = Math.min(Math.max(dy + (Math.random() - 0.5) * 2.5, -maxSpeed), maxSpeed);
            score += 10;
            if (!pongMuted) {
              pongHitSound.currentTime = 0;
              pongHitSound.play().catch(err => console.error("Audio play error:", err));
            }
          }

          // Game over
          if (x - ballRadius < 0) {
            running = false;
            document.getElementById("pongScore").innerHTML = `<span class='animated-title' style='color:red;'>🛑 Game Over! You scored: ${score} DC Points</span>`;
            lastScore = score;
            document.getElementById("pongRetryBtn").style.display = "inline-block";
            if (!pongMuted) {
              pongGameOverSound.play().catch(err => console.error("Audio play error:", err));
            }
            return;
          }

          // Right wall collision
          if (x + ballRadius > canvas.width) {
            dx = -dx;
          }

          if (running) {
            requestAnimationFrame(draw);
          }
        }

        function stop() {
          running = false;
          canvas.onmousemove = null;
        }

        pongGame = { stop };
        draw();
      }

      // Initialize DC Points
      setDcPoints(getDcPoints());
    });