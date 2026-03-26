

document.getElementById('internshipForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const certificationPath = document.getElementById('certificationPath').value;
  const trainingCompleted = document.getElementById('trainingCompleted').value;
  const linkedin = document.getElementById('linkedin').value;
  const comments = document.getElementById('comments').value;

  // Show loading spinner while form is submitting
  document.querySelector('.loading-spinner').style.display = 'block';

  // Prepare data for SheetDB API
  const formData = {
    "Name": name,
    "Email": email,
    "Certification Path": certificationPath,
    "Training Completed": trainingCompleted,
    "LinkedIn Profile": linkedin,
    "Comments": comments
  };

  fetch("https://sheetdb.io/api/v1/xy77v77zclba9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify([formData])
  })
    .then(response => {
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      return response.json();
    })
    .then(data => {
      // Hide the loading spinner
      document.querySelector('.loading-spinner').style.display = 'none';

      // Display success message
      Swal.fire({
        icon: 'success',
        title: `Thank you, ${name}!`,
        text: 'Your form has been successfully submitted. We will contact you soon! If you do not receive the voucher within 5 working days and internship offer letter , kindly raise a ticket through our support system.',
        confirmButtonColor: '#3085d6',
        footer: '<a href="https://dcinfotech.org.in
/live-chat.html" target="_blank">Click here to raise a ticket</a>'
      }).then(() => {
        // Reload the page after clicking OK
        location.reload();
      });
      
      // Reset the form after submission
      document.getElementById('internshipForm').reset();
    })
    .catch(error => {
      // Hide the loading spinner
      document.querySelector('.loading-spinner').style.display = 'none';

      // Display error message
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: `Something went wrong: ${error.message}`,
      });
    });
});

  