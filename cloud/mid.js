const form = document.getElementById('internshipForm');

form.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const fullName = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const linkedin = document.getElementById('linkedin').value.trim();
    const preference = document.getElementById('preference').value;

    // Validate the required fields
    if (!fullName || !email || !phone || !linkedin || !preference) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill out all required fields!'
        });
        return;
    }

    // Prepare data for submission
    const formData = {
        "Full Name": fullName,
        "Email Address": email,
        "Phone Number": phone,
        "LinkedIn Account": linkedin,
        "Preference": preference
    };

    try {
        const response = await fetch("https://sheetdb.io/api/v1/vlmiwn3cv2fog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([formData])
        });

        if (!response.ok) {
            throw new Error(`Server returned status code ${response.status}`);
        }

        const data = await response.json();
        if (data.created > 0) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Application submitted successfully! Check your email for an instant response.',
                footer: '<a href="https://chat.whatsapp.com/EmcwMIEOGF6E4Adk1blxUa" target="_blank">Join our WhatsApp group for updates. Only join if genuinely interested.</a>'
            });
            form.reset();
        } else {
            throw new Error("Submission failed. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Error submitting application: ${error.message}`
        });
    }
});