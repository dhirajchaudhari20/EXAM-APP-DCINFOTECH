// ace-schedule.js

// =====================
//  Workshop Data Store
// =====================
// You can edit only this section easily.
// Each cohort has its own details & modules.

const WORKSHOP_DATA = {
  cohortA: {
    name: "Cohort A — 3-week hybrid (English)",
    format: "Hybrid",
    language: "English",
    duration: "3 weeks",
    note: "All sessions 1:30 PM - 5:30 PM GMT+5:30 unless noted.",
    schedule: [
      { session: "Module 1", date: "Mon, November 3, 2025", day: "Mon", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 1" },
      { session: "Module 2", date: "Wed, November 5, 2025", day: "Wed", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 2" },
      { session: "Module 3", date: "Mon, November 10, 2025", day: "Mon", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 3" },
      { session: "Module 4", date: "Wed, November 12, 2025", day: "Wed", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 4" },
      { session: "Module 5", date: "Mon, November 17, 2025", day: "Mon", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 5" },
      { session: "Module 6", date: "Wed, November 19, 2025", day: "Wed", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 6" }
    ]
  },
  cohortB: {
    name: "Cohort B — Evening schedule",
    format: "Hybrid",
    timezone: "GMT+5:30",
    note: "Times shown as 8:30 PM - 11:30 PM GMT+5:30 (some entries show midnight ranges).",
    contact: "heraba@megahack.in",
    rsvp: "https://rsvp.withgoogle.com/events/partnerca-ace_pca25522",
    schedule: [
      { session: "Module 1", date: "Mon, November 24, 2025", time: "8:30 PM - 11:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 1" },
      { session: "Module 2", date: "Tue, November 25, 2025", time: "8:30 PM - 11:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 2" },
      { session: "Module 3", date: "Mon, December 1, 2025", time: "8:30 PM - 11:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 3" },
      { session: "Module 4", date: "Tue, December 2, 2025", time: "8:30 PM - 12:30 AM", topic: "Academy - Associate Cloud Engineer workshop Module 4" },
      { session: "Module 5", date: "Mon, December 8, 2025", time: "8:30 PM - 12:30 AM", topic: "Academy - Associate Cloud Engineer workshop Module 5" },
      { session: "Module 6", date: "Tue, December 9, 2025", time: "8:30 PM - 12:30 AM", topic: "Academy - Associate Cloud Engineer workshop Module 6" }
    ]
  },
  cohortC: {
    name: "Cohort C — 2-week intensive (English)",
    format: "Hybrid",
    duration: "2 weeks",
    note: "All sessions 1:30 PM - 5:30 PM GMT+5:30.",
    schedule: [
      { session: "Module 1", date: "Mon, December 1, 2025", day: "Mon", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 1" },
      { session: "Module 2", date: "Wed, December 3, 2025", day: "Wed", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 2" },
      { session: "Module 3", date: "Fri, December 5, 2025", day: "Fri", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 3" },
      { session: "Module 4", date: "Mon, December 8, 2025", day: "Mon", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 4" },
      { session: "Module 5", date: "Wed, December 10, 2025", day: "Wed", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 5" },
      { session: "Module 6", date: "Fri, December 12, 2025", day: "Fri", time: "1:30 PM - 5:30 PM", topic: "Academy - Associate Cloud Engineer workshop Module 6" }
    ]
  }
};

// =====================
//  Render Logic
// =====================
function renderSchedule() {
  const container = document.getElementById('cohortContainer');
  if (!container) return;

  container.innerHTML = Object.keys(WORKSHOP_DATA).map(key => {
    const data = WORKSHOP_DATA[key];
    const hasDay = data.schedule.some(s => s.day);

    // Create badges for meta info
    const badges = [];
    if (data.format) badges.push(data.format);
    if (data.language) badges.push(data.language);
    if (data.duration) badges.push(data.duration);
    if (data.timezone) badges.push(data.timezone);

    const badgesHtml = badges.map(b => `<span class="badge">${b}</span>`).join('');

    // Create action buttons if links exist
    let actionsHtml = '';
    if (data.rsvp) {
      actionsHtml += `<a href="${data.rsvp}" class="btn" target="_blank">RSVP Now</a> `;
    }
    if (data.contact) {
      actionsHtml += `<div style="margin-top:8px;font-size:0.9rem;color:var(--muted)">Contact: <a href="mailto:${data.contact}" style="color:var(--accent)">${data.contact}</a></div>`;
    }

    // Note section
    const noteHtml = data.note ? `<div class="note">${data.note}</div>` : '';

    // Build Table Rows
    const rows = data.schedule.map(item => {
      const dayCell = hasDay ? `<td>${item.day || ''}</td>` : '';
      return `
          <tr>
            <td>${item.session}</td>
            <td>${item.date}</td>
            ${dayCell}
            <td>${item.time}</td>
            <td>${item.topic}</td>
          </tr>
        `;
    }).join('');

    // Determine Table Headers
    const dayHeader = hasDay ? '<th>Day</th>' : '';

    // Construct the Card HTML
    return `
      <div class="card" id="${key}">
        <h2 style="margin-top:0;font-size:1.4rem">${data.name}</h2>
        <div class="meta">
          ${badgesHtml}
        </div>
        ${noteHtml}
        ${actionsHtml ? `<div style="margin-top:12px">${actionsHtml}</div>` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>Date</th>
              ${dayHeader}
              <th>Time</th>
              <th>Topic</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

// Render on page load
document.addEventListener('DOMContentLoaded', renderSchedule);

// Optional: Expose globally
window.WORKSHOP_DATA = WORKSHOP_DATA;
