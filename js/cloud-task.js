function openModal(labName) {
  document.getElementById('submissionModal').style.display = 'block';
  document.getElementById('submitForm').dataset.lab = labName;
}

function closeModal() {
  document.getElementById('submissionModal').style.display = 'none';
}

document.getElementById('submitForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="margin-right:8px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; width: 16px; height: 16px; display: inline-block; animation: google-spin 1s linear infinite;"></span>Submitting...`;

  const formData = {
    "Full Name": document.getElementById("name").value,
    "SkillBoost Profile URL": document.getElementById("skillboost").value,
    "Lab Name": e.target.dataset.lab,
    "Submission Type": document.getElementById("pdfLink").value ? "PDF" : "Video",
    "PDF File Link": document.getElementById("pdfLink").value,
    "Video URL": document.getElementById("videoURL").value,
    "Submission Date": new Date().toISOString().split('T')[0],
    "Status": "Submitted",
    "Remarks": ""
  };

  try {
    const res = await fetch("https://sheetdb.io/api/v1/8i0tiy8shvld7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: [formData] })
    });

    if (!res.ok) throw new Error("Failed to submit");

    const userName = document.getElementById("name").value.split(' ')[0]; // Get first name
    Swal.fire({
      icon: 'success',
      title: `Thank You, ${userName}!`,
      text: 'Your lab has been submitted successfully.'
    });

    // Mark as completed in local storage
    const labName = e.target.dataset.lab;
    if (labName) {
      const completedLabs = JSON.parse(localStorage.getItem('completedLabs') || '{}');
      completedLabs[labName] = true;
      localStorage.setItem('completedLabs', JSON.stringify(completedLabs));

      // Try to refresh dashboard if function exists
      if (typeof window.initDashboard === 'function') {
        window.initDashboard();
      }
    }

    closeModal();
    e.target.reset();
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Something went wrong during submission!'
    });
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
});

const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
document.head.appendChild(style);