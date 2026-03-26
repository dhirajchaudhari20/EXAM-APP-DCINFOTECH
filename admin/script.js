fetch('https://ipinfo.io/json?token=7eb14a8e8529ad')
    .then(response => response.json())
    .then(data => {
        const userIP = data.ip;
        const allowedIPs = [
            '103.38.68.90',
            '152.58.33.107',
            '152.58.17.116',
            '203.192.239.168',
            '45.118.107.127',
            '103.174.159.143',
            '203.192.239.255',
            '203.194.97.160',
            '103.51.136.139',
            '45.124.140.138' // Updated IP
        ];


        console.log("Fetched User IP:", userIP); // Log fetched IP
        console.log("Allowed IPs:", allowedIPs); // Log allowed IPs

        // Allow localhost testing or specific IPs
        if (allowedIPs.includes(userIP) || userIP === '127.0.0.1' || userIP === '::1' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log("Access granted."); // Log when access is granted
            document.getElementById('content').style.display = 'block';

            // Display user IP information
            let userInfoHtml = `
                        <h2>Your IP Information</h2>
                        <p><strong>IP Address:</strong> ${data.ip}</p>
                        <p><strong>Hostname:</strong> ${data.hostname || 'N/A'}</p>
                        <p><strong>City:</strong> ${data.city || 'N/A'}</p>
                        <p><strong>Region:</strong> ${data.region || 'N/A'}</p>
                        <p><strong>Country:</strong> ${data.country || 'N/A'}</p>
                        <p><strong>Location:</strong> ${data.loc || 'N/A'}</p>
                        <p><strong>Organization:</strong> ${data.org || 'N/A'}</p>
                        <p><strong>Postal Code:</strong> ${data.postal || 'N/A'}</p>
                        <p><strong>Timezone:</strong> ${data.timezone || 'N/A'}</p>
                    `;
            const userInfoEl = document.getElementById('user-info');
            if (userInfoEl) userInfoEl.innerHTML = userInfoHtml;
        } else {
            console.log("Access denied. User IP is not in the allowed list."); // Log when access is denied
            document.getElementById('access-denied').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error fetching IP:', error);
        document.getElementById('access-denied').style.display = 'block';
    });