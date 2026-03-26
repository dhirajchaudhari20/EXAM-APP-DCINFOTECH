document.getElementById('internship-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Show the loading overlay with Notiflix
    Notiflix.Loading.standard('Submitting your form...');

    const fullName = document.getElementById('fullName').value;

    const formData = {
        "data": [{
            "Full Name": fullName,
            "Email Address": document.getElementById('email').value,
            "Mobile Number": document.getElementById('mobileNumber').value,
            "College Name": document.getElementById('collegeName').value,
            "Education Qualification": document.getElementById('education').value,
            "Source of Information": document.getElementById('source').value
        }]
    };

    fetch('https://sheetdb.io/api/v1/xms6r1lnky4n9', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        // Hide the loading overlay with Notiflix
        Notiflix.Loading.remove();

        // Show SweetAlert Success Message
        Swal.fire({
            title: `Thank you, ${fullName}!`,
            text: 'Your form has been submitted. We will reach out to you shortly. If we don’t, please send a follow-up message within 24 hours on the official LinkedIn page.',
            icon: 'success',
            confirmButtonText: 'OK'
        });

        // Reset form after submission
        document.getElementById('internship-form').reset();
    })
    .catch((error) => {
        // Hide the loading overlay with Notiflix
        Notiflix.Loading.remove();

        Swal.fire({
            title: 'Oops!',
            text: 'There was an error submitting the form. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        console.error('Error:', error);
    });
});
