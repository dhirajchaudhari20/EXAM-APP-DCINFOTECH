document.getElementById("contactForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let submitBtn = document.getElementById("submitBtn");
    let spinner = document.getElementById("spinner");

    // Hide submit button, show spinner
    submitBtn.style.display = "none";
    spinner.style.display = "inline-block";

    const formData = new FormData(event.target);
    const data = {
      Name: formData.get("name"),
      Email: formData.get("email"),
      Phone: formData.get("phone"),
      Subject: formData.get("subject"),
      Message: formData.get("message"),
    };

    try {
      const response = await fetch("https://sheetdb.io/api/v1/vifj4c1nut5nf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Notiflix.Notify.success("Your message has been sent successfully!");
        document.getElementById("contactForm").reset();
      } else {
        Notiflix.Notify.failure("There was an issue submitting your form.");
      }
    } catch (error) {
      Notiflix.Notify.failure("There was an issue submitting your form.");
    } finally {
      // Restore submit button and hide spinner
      submitBtn.style.display = "inline-block";
      spinner.style.display = "none";
    }
  });