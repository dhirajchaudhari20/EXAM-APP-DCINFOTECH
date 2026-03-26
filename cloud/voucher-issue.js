const form = document.getElementById('voucherForm');
const spinner = document.getElementById('spinner');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  submitBtn.disabled = true;
  spinner.style.display = 'inline';

  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  const formData = new FormData(form);
  const dataObj = Object.fromEntries(formData.entries());
  const data = { data: dataObj };

  // Check if data already exists (by email or phone)
  try {
    // Change 'email' to the field you want to check for uniqueness
    const email = dataObj.email;
    const phone = dataObj.phone;
    // Query SheetDB for existing entry by email or phone
    let queryUrl = `https://sheetdb.io/api/v1/yx7af24jwexe0/search_or?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
    const checkRes = await fetch(queryUrl);
    const existing = await checkRes.json();

    if (existing && existing.length > 0) {
      spinner.style.display = 'none';
      submitBtn.disabled = false;
      Swal.fire({
        icon: 'warning',
        title: 'Already Submitted',
        text: 'A voucher request with this email or phone already exists.',
        confirmButtonColor: '#f59e42'
      });
      return;
    }
  } catch (err) {
    // If check fails, allow submission (or handle as needed)
    console.error('Check error:', err);
  }

  // Proceed to submit if not already present
  fetch('https://sheetdb.io/api/v1/yx7af24jwexe0', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => {
    spinner.style.display = 'none';
    submitBtn.disabled = false;
    form.reset();
    Swal.fire({
      icon: 'success',
      title: 'Submitted!',
      text: 'You will get your voucher within 7–8 days. Thank you for your patience!',
      confirmButtonColor: '#004aad'
    });
  })
  .catch(error => {
    spinner.style.display = 'none';
    submitBtn.disabled = false;
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: 'Please try again. Something went wrong!',
      confirmButtonColor: '#d33'
    });
    console.error('Error:', error);
  });
});