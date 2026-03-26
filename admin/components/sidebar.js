document.addEventListener("DOMContentLoaded", () => {
  // Determine if we need to auto-redirect unauthenticated users
  // (We check if 'dc_admin_logged' is in sessionStorage and we are NOT on index.html)
  const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/');
  const isLogged = sessionStorage.getItem('dc_admin_logged') === '1';

  // If not logged in and trying to access a restricted page, redirect to index
  if (!isLogged && !isIndex) {
    window.location.href = 'index.html'; // Adjust path if needed based on real folder structure
    return;
  }

  // Inject Sidebar and Header HTML if we are logged in, AND we are inside .admin-main
  if (isLogged) {
    const adminMain = document.querySelector('.admin-main');
    if (adminMain) {
      // Create Sidebar
      const sidebar = document.createElement('aside');
      sidebar.className = 'admin-sidebar';

      const currentPath = window.location.pathname;

      // Define navigation items
      const navItems = [
        { name: 'Dashboard Home', url: 'index.html' },
        { name: 'Manage Users', url: 'manage-users.html' },
        { name: 'Manage Schedules', url: 'manage-schedules.html' },
        { name: 'Session Alerts', url: 'session-alerts.html' },
        { name: 'Master Exam Data', url: 'master-data.html' },
        { name: 'Exam Register Data', url: 'exam-register-data.html' },
        { name: 'Internship Submissions', url: 'internship-comp-submission-data.html' },
        { name: 'Class Feedback', url: 'program-feedback-view.html' },
        { name: 'Contact Forms', url: 'contact-submissions.html' },
        { name: 'Careers Applications', url: 'careers-form-data.html' },
        { name: 'Launch Program Data', url: 'program-register-submission.html' },
        { name: 'Google Groups Tools', url: 'google_groups_emails.html' }
      ];

      // Generate navigation HTML with icons and spans
      const navHtml = navItems.map(item => {
        let icon = '●'; // Default icon
        if (item.name.includes('Home')) icon = '🏠';
        if (item.name.includes('Users')) icon = '👥';
        if (item.name.includes('Schedules')) icon = '📅';
        if (item.name.includes('Alerts')) icon = '🔔';
        if (item.name.includes('Exam Data')) icon = '📊';
        if (item.name.includes('Register')) icon = '📝';
        if (item.name.includes('Internship')) icon = '🎓';
        if (item.name.includes('Feedback')) icon = '⭐';
        if (item.name.includes('Contact')) icon = '📧';
        if (item.name.includes('Careers')) icon = '💼';
        if (item.name.includes('Launch')) icon = '🚀';
        if (item.name.includes('Groups')) icon = '🛠️';

        return `<li>
            <a href="${item.url}" class="${currentPath.includes(item.url) ? 'active' : ''}" title="${item.name}">
                <span class="nav-icon">${icon}</span>
                <span class="nav-text">${item.name}</span>
            </a>
        </li>`;
      }).join('');

      sidebar.innerHTML = `
        <div class="admin-sidebar-header">
          <span class="nav-text">DC Cloud Admin</span>
          <button class="sidebar-toggle" id="sidebar-toggle-btn" title="Toggle Sidebar">❮</button>
        </div>
        <ul class="admin-nav">
          ${navHtml}
          <li style="margin-top: 2rem;">
            <a href="#" id="admin-logout-btn" style="color: #f87171;" title="Logout">
                <span class="nav-icon">🚪</span>
                <span class="nav-text">Logout</span>
            </a>
          </li>
        </ul>
      `;

      // Prepend to body
      document.body.insertBefore(sidebar, document.body.firstChild);

      // Handle logout
      document.getElementById('admin-logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('dc_admin_logged');
        window.location.href = 'index.html';
      });

      // Handle Sidebar Toggle
      const toggleBtn = document.getElementById('sidebar-toggle-btn');
      const mainContent = document.querySelector('.admin-main');
      
      const setSidebarState = (isCollapsed) => {
        if (isCollapsed) {
          sidebar.classList.add('collapsed');
          if (mainContent) mainContent.classList.add('collapsed');
          toggleBtn.innerText = '❯';
          localStorage.setItem('admin_sidebar_collapsed', 'true');
        } else {
          sidebar.classList.remove('collapsed');
          if (mainContent) mainContent.classList.remove('collapsed');
          toggleBtn.innerText = '❮';
          localStorage.setItem('admin_sidebar_collapsed', 'false');
        }
      };

      // Initialize state from localStorage
      const isCollapsed = localStorage.getItem('admin_sidebar_collapsed') === 'true';
      setSidebarState(isCollapsed);

      toggleBtn.addEventListener('click', () => {
        const currentlyCollapsed = sidebar.classList.contains('collapsed');
        setSidebarState(!currentlyCollapsed);
      });
    }
  }
});
