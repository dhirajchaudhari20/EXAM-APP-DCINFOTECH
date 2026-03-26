document.addEventListener("DOMContentLoaded", () => {
  // Create modal instead of inline banner
  const modalHTML = `
    <div id="migrationModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; overflow-y: auto; padding: 40px 20px;">
      <div style="max-width: 1000px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); position: relative;">
        <button onclick="closeMigrationModal()" style="position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border: none; background: #f1f3f4; border-radius: 50%; cursor: pointer; font-size: 1.25rem; color: #5f6368; transition: all 0.2s;">
          ✕
        </button>
        
        <div style="padding: 32px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif; line-height: 1.7; color: #333;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #fff; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; text-align: center; font-weight: 600; font-size: 1rem; box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);">
            🎉 DOMAIN MIGRATION COMPLETED — Welcome to <code style="background: rgba(255,255,255,0.9); color: #28a745; padding: 3px 8px; border-radius: 4px; font-weight: 700;">dcinfotech.org.in</code> ✅
          </div>

          <h2 style="color: #d58512; margin: 0 0 16px 0; font-size: 1.5rem; font-weight: 600;">📢 Final Domain Migration Bulletin</h2>
          <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px; font-weight: 500;">Completion Report - As of 9 August 2025</p>

          <p style="font-size: 0.95rem; line-height: 1.8; margin-bottom: 20px; color: #444;">
            <strong>DC Cloud Solutions</strong> has <strong>100% completed</strong> its domain migration project, transitioning all systems to:
            <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; color: #d63384; font-weight: 600;">dcinfotech.org.in</code>
          </p>

          <h3 style="color: #3c763d; font-size: 1.2rem; margin: 24px 0 12px 0; font-weight: 600;">✅ Final Migration Status</h3>
          <ul style="margin: 0 0 20px 24px; line-height: 1.9;">
            <li><strong>Web Portals:</strong> All environments updated & live</li>
            <li><strong>APIs:</strong> Backward-compatible redirects until Sept 30, 2025</li>
            <li><strong>Email:</strong> SPF/DKIM/DMARC hardened; 100% delivery success</li>
            <li><strong>SSO:</strong> MFA enforced for all staff</li>
            <li><strong>DNS:</strong> Propagation complete; Anycast routing active</li>
            <li><strong>CDN:</strong> 42% faster asset delivery</li>
          </ul>

          <div style="background: #fff9f2; border-left: 4px solid #ff8c00; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #d9534f; font-size: 1.1rem; margin: 0 0 12px 0; font-weight: 600;">⚠️ Recent Incident (Nov 18)</h4>
            <p style="margin: 0 0 8px 0; line-height: 1.8;"><strong>Major Cloudflare Outage:</strong> Exam Portal database and APIs affected.</p>
            <p style="color: green; margin: 0; line-height: 1.8;">🛠 <strong>Resolved:</strong> All services restored. Evaluating multi-cloud redundancy.</p>
          </div>

          <h4 style="color: #3c763d; font-size: 1.1rem; margin: 20px 0 12px 0; font-weight: 600;">📊 Performance Gains</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; border-left: 3px solid #1a73e8;">
              <strong style="color: #1a73e8;">📈 18%</strong> faster API response
            </div>
            <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; border-left: 3px solid #16a34a;">
              <strong style="color: #16a34a;">99.98%</strong> uptime
            </div>
            <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 3px solid #f59e0b;">
              <strong style="color: #f59e0b;">94%</strong> CDN cache hit
            </div>
            <div style="background: #fce7f3; padding: 12px; border-radius: 6px; border-left: 3px solid #ec4899;">
              <strong style="color: #ec4899;">1.6s</strong> avg page load
            </div>
          </div>

          <p style="color: #d9534f; font-weight: 600; padding: 16px; background: #fee; border-radius: 6px; margin: 20px 0;">
            🔒 All services locked to <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">dcinfotech.org.in</code>. Legacy URLs return error 410 after Aug 15.
          </p>

          <h4 style="color: #444; font-size: 1.1rem; margin: 20px 0 12px 0; font-weight: 600;">📮 Contact & Support</h4>
          <p style="line-height: 1.9;">
            Primary: <a href="mailto:support@dcinfotech.org.in" style="color: #1a73e8; text-decoration: none; font-weight: 500;">support@dcinfotech.org.in</a><br>
            Infra Ops: <a href="mailto:infra@dcinfotech.org.in" style="color: #1a73e8; text-decoration: none; font-weight: 500;">infra@dcinfotech.org.in</a><br>
            Uptime: <a href="https://server.dcinfotech.org.in" target="_blank" style="color: #1a73e8; text-decoration: none; font-weight: 500;">server.dcinfotech.org.in</a>
          </p>

          <p style="font-weight: 600; color: #444; margin-top: 24px; padding-top: 24px; border-top: 1px solid #ddd;">
            Thank you to every department, partner, and user who contributed to this seamless transition.
          </p>
          <p style="font-weight: 500; color: #666; font-style: italic;">
            — Infrastructure & Platform Engineering, DC Cloud Solutions
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add global functions
  window.openMigrationModal = function () {
    document.getElementById('migrationModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  window.closeMigrationModal = function () {
    document.getElementById('migrationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
  };

  // Close on outside click
  document.getElementById('migrationModal').addEventListener('click', function (e) {
    if (e.target === this) {
      closeMigrationModal();
    }
  });
});