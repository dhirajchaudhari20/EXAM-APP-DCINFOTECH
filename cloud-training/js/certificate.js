/**
 * certificate.js
 * Handles certificate generation and PDF download.
 */

const canvas = document.getElementById('certCanvas');
const ctx = canvas.getContext('2d');
const studentNameInput = document.getElementById('studentName');
const courseNameInput = document.getElementById('courseName');

// Placeholder Certificate Template URL
// In a real app, this would be a local path like 'images/certificate-template.png'
const templateSrc = 'https://i.ibb.co/m6yTNSM/Certificate-of-Appreciation-Web-Development-1.png'; // Using one from your existing code as placeholder

const image = new Image();
image.crossOrigin = "Anonymous";
image.src = templateSrc;

image.onload = function () {
    // Set canvas dimensions to match image
    canvas.width = image.width;
    canvas.height = image.height;
    drawCertificate();
};

function drawCertificate() {
    // 1. Draw Template
    ctx.drawImage(image, 0, 0);

    // 2. Configure Text Style
    ctx.font = 'bold 60px "Inter", sans-serif'; // Adjust size based on template resolution
    ctx.fillStyle = '#1f2937'; // Dark gray
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3. Draw Name
    const name = studentNameInput.value;
    // Adjust these coordinates (x, y) based on where the name line is on your specific template
    // For this placeholder, I'm guessing a central position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 20; // Slightly below center

    ctx.fillText(name, centerX, centerY);

    // 4. Draw Date (Optional)
    ctx.font = '24px "Inter", sans-serif';
    ctx.fillStyle = '#6b7280';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`Issued on: ${date}`, centerX, centerY + 100);
}

function generatePreview() {
    drawCertificate();
    Notiflix.Notify.success('Preview updated!');
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;

    // Create PDF with orientation based on image aspect ratio
    const orientation = canvas.width > canvas.height ? 'l' : 'p';
    const pdf = new jsPDF(orientation, 'px', [canvas.width, canvas.height]);

    // Add Canvas as Image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    // Save
    pdf.save(`${studentNameInput.value.replace(/\s+/g, '_')}_Certificate.pdf`);
    Notiflix.Notify.success('Certificate downloaded!');
}
