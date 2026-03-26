
function renderTimeline() {
  const timelineDiv = document.querySelector('.timeline');
  timelineDiv.innerHTML = '';
  window.labsTimeline.forEach(monthObj => {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';
    if (monthObj.month) {
      monthDiv.innerHTML = `<h2>${monthObj.month}</h2>`;
    }
    const labContainer = document.createElement('div');
    labContainer.className = 'lab-container';
    monthObj.labs.forEach(lab => {
      const labCard = document.createElement('div');
      labCard.className = 'lab-card';
      labCard.innerHTML = `
        <h3>${lab.title}</h3>
        <p>${lab.desc}</p>
        <a href="${lab.link}" target="_blank">View Lab</a>
        <button onclick="openModal('${lab.title.replace(/'/g, "\\'")}')">Submit</button>
      `;
      labContainer.appendChild(labCard);
    });
    monthDiv.appendChild(labContainer);
    timelineDiv.appendChild(monthDiv);
  });
}
renderTimeline();