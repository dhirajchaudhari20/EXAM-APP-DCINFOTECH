// Function to update the PDF viewer and active state in the sidebar
function loadPDF(element, pdfFile) {
  // Update active class on sidebar items
  var items = document.querySelectorAll('#pdfList li');
  items.forEach(function (item) {
    item.classList.remove('active');
  });
  element.classList.add('active');

  // Recreate the PDF viewer element to force reload on mobile
  var contentDiv = document.getElementById('pdfContent');
  var objectHtml = '<object id="pdfViewer" class="pdf-viewer" data="pdf/' + pdfFile + '" type="application/pdf">' +
    '<p>Your browser does not support PDFs. please try using a PC OR ' +
    '<a href="pdf/' + pdfFile + '" target="_blank">Click here to view/download the PDF.</a></p></object>';
  contentDiv.innerHTML = objectHtml;
}

// Function for Go Back button
function goBack() {
  window.history.back();
}

// Updated Logout function with SweetAlert2 confirmation
function logout() {
  Swal.fire({
    title: 'Are you sure you want to log out?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, log out!',
    cancelButtonText: 'Cancel',

    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      // 1. Clear all session data
      localStorage.removeItem('cloudUser');
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('loggedInUser');

      // 2. Double check clearing
      localStorage.clear();
      sessionStorage.clear();

      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Redirect to Learn Portal
        window.location.href = 'https://learn.dcinfotech.org.in';
      });
    }
  });
}