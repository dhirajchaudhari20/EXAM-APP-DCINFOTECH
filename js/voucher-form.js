function submitData() {
    const examName = "Google Cloud Exam";  // Pre-set exam name
    const voucherCode = document.getElementById("voucherCode").value.trim();
    const submitBtn = document.getElementById("submitBtn");
    const spinner = document.getElementById("spinner");

    if (!voucherCode) {
        Notiflix.Notify.failure("❌ Please enter a voucher code!");
        return;
    }

    // Disable button and show spinner
    submitBtn.disabled = true;
    spinner.style.display = "inline-block";

    const data = {
        "Exam Name": examName,
        "Voucher Code": voucherCode,
        "Timestamp": new Date().toLocaleString()
    };

    fetch("https://sheetdb.io/api/v1/ow7po6yh6855k", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.created) {
            Notiflix.Notify.success("✅ Voucher submitted successfully!");
            document.getElementById("voucherCode").value = ""; // Clear input
        } else {
            throw new Error("Submission failed");
        }
    })
    .catch(() => {
        Notiflix.Notify.failure("❌ Error submitting voucher. Try again.");
    })
    .finally(() => {
        submitBtn.disabled = false; // Enable button
        spinner.style.display = "none"; // Hide spinner
    });
}
