/**
 * benefits.js
 * Handles dynamic rendering of benefits based on user certification progress.
 * Fetches real data from SheetDB to count passed exams.
 */

(function () {
    'use strict';

    const SHEETDB_RESULTS_URL = 'https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com/exam_results';

    // Benefit Tiers Configuration (2 to 14 Certs)
    // Distributed ~70 items across 13 tiers
    const TIERS = [
        {
            level: 1,
            requiredCerts: 2,
            title: 'Keychains & Badges',
            description: 'Start your collection with these exclusive DC Cloud Solutions & Google Cloud accessories.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Loop_Keychain_-_Grey_11555005202412.png',
            items: [
                'Loop Keychain', 'Divagate Keychain', 'Vintage Keychain',
                'Pulse Keychain', 'Glimmer Keychain', 'Hut Keychain',
                'Acrylic Keychain', 'Round Badges'
            ]
        },
        {
            level: 2,
            requiredCerts: 3,
            title: 'Magnets & Coasters',
            description: 'Decorate your workspace and fridge with these cool items.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Coaster_Circle_11392505202412.png',
            items: [
                'Canvas Fridge Magnet', 'Acrylic Fridge Magnet',
                'Acrylic Coasters', 'Mobile Pop Socket',
                'Laptop Sleeve'
            ]
        },
        {
            level: 3,
            requiredCerts: 4,
            title: 'Stationery Essentials',
            description: 'High-quality stationery for your daily notes and ideas.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Wiro_Bind_-_300gsm_Cover_Laminated_-_A5_80_Pages_-_Blank_Inner_Pages_04173117202412.png',
            items: [
                'Soft WiroBind Notebook', 'Soft PerfectBind Notebook',
                'Grassetto Diary', 'Inspiracion Diary', 'Corporate Wiro Diary',
                'Ballpoint Pen', 'Gilt Rollerball Pen', 'Mini Wallet'
            ]
        },
        {
            level: 4,
            requiredCerts: 5,
            title: 'Mugs & Jars',
            description: 'Enjoy your favorite beverages in style.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Endear_spill_black_mug_10270105202412.png',
            items: [
                'Endear Spill-Free Mug', 'Rockstar Spill-Free Mug', 'Svelte Spill-Free Mug',
                'Inner Coloured Coffee Mug', 'Mini Coffee Mug', 'Magic Coffee Mug',
                'Caffe Tazza Mug', 'Beer Mug', 'Mason Jar'
            ]
        },
        {
            level: 5,
            requiredCerts: 6,
            title: 'Sippers & Travel Mugs',
            description: 'Stay hydrated on the move with these durable sippers.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Sublime-Black-Sipper_04561405202412.png',
            items: [
                'Curvy Hot&Cold Sipper', 'Rocker Travel Mug', 'Sublime Sipper',
                'Prime Sipper', 'Lissom Sipper', 'Switch Sipper', 'Zen Sipper',
                'Elite Sipper', 'Spout Sipper'
            ]
        },
        {
            level: 6,
            requiredCerts: 7,
            title: 'Premium Bottles',
            description: 'Top-tier spill-free and insulated bottles.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Glaze-Spill-White_10484505202412.png',
            items: [
                'Glaze Hot&Cold Spill-Free Bottle', 'Pristine Spill-Free Bottle',
                'Lanky Hot & Cold Sipper', 'Vega SS Bottle',
                'Arctix Insulated Bottle', 'Freo Insulated Bottle'
            ]
        },
        {
            level: 7,
            requiredCerts: 8,
            title: 'Premium Diaries (Set A)',
            description: 'Elegant diaries for the professional.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/A5_-_Denim_Blue_12111205202412.png',
            items: [
                'Plum Purple Diary', 'Denim Blue Diary', 'Denim Black Diary',
                'Matt PU Blue Diary', 'Matt PU Black Diary'
            ]
        },
        {
            level: 8,
            requiredCerts: 9,
            title: 'Premium Diaries (Set B)',
            description: 'Luxurious suede and softbound diaries.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/A5_-_Suede_Blue_12083205202412.png',
            items: [
                'Matt PU Stone Black Diary', 'Suede Blue Diary', 'Suede Turquoise Diary',
                'Suede Grey Diary', 'Suede Olive Diary', 'Softbound Black Diary'
            ]
        },
        {
            level: 9,
            requiredCerts: 10,
            title: 'Apparel Collection',
            description: 'Wear your achievements with pride.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Premium_Cotton_Polo_Regular_T-shirt_230_gsm_-_Black_-_Rare_Rabbit_Polo_T-shirt.png',
            items: [
                'Rare Rabbit Polo T-shirt', 'Premium Polo T-shirt',
                'Regular Polo T-shirt', 'Regular Round Neck T-shirt',
                'Canvas Totebag'
            ]
        },
        {
            level: 10,
            requiredCerts: 11,
            title: 'Organizers & Accessories',
            description: 'Keep your professional life organized.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/A5_-_Retro_Tan_Organiser_01133705202412.png',
            items: [
                'Retro Tan Organizer', 'Matt PU Stone Black Organizer',
                'Matt PU Stone Blue Organizer', 'PU Grey Organizer',
                'Acrylic Luggage Tag'
            ]
        },
        {
            level: 11,
            requiredCerts: 12,
            title: 'Professional Laptop Bags',
            description: 'High-quality bags for your tech gear.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Supreme_Laptop_Bag.png',
            items: [
                'SupremePro Laptop Bag', 'NobleCore Laptop Bag',
                'GlaringEdge Laptop Bag', 'ApexEdge Laptop Bag'
            ]
        },
        {
            level: 12,
            requiredCerts: 13,
            title: 'Elite Laptop Bags',
            description: 'Premium protection and style for your laptop.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Sigma_Laptop_Bag.png',
            items: [
                'SigmaCore Laptop Bag', 'EminentPro Laptop Bag',
                'AirTrack Elite Laptop Bag'
            ]
        },
        {
            level: 13,
            requiredCerts: 14,
            title: 'The Ultimate Collection',
            description: 'The absolute best for the Cloud Master.',
            image: 'https://d3pyarv4eotqu4.cloudfront.net/printoonp/images/product/Plus_Laptop_Bag.png',
            items: [
                'PlusPrime Laptop Bag', 'BoldPower Laptop Bag',
                'The Ultimate Cloud Master Trophy'
            ]
        }
    ];

    function getUserEmail() {
        if (window.DASHBOARD_USER && window.DASHBOARD_USER.email) {
            return window.DASHBOARD_USER.email.toLowerCase();
        }
        try {
            const stored = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('cm_user'));
            if (stored && stored.email) {
                return stored.email.toLowerCase();
            }
        } catch (e) {
            console.warn("Could not read user from storage", e);
        }
        return null;
    }

    async function getCertCount(userEmail) {
        if (!userEmail) return 0;
        const CACHE_KEY = `cert_count_${userEmail}`;
        const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

        try {
            const cachedItem = localStorage.getItem(CACHE_KEY);
            if (cachedItem) {
                const { timestamp, count } = JSON.parse(cachedItem);
                if (Date.now() - timestamp < CACHE_DURATION_MS) {
                    console.log("Loading cert count from cache:", count);
                    return count;
                }
            }

            console.log("Fetching fresh cert count from Firebase API...");
            const response = await fetch(`${SHEETDB_RESULTS_URL}.json`);
            if (!response.ok) return 0;
            const allData = await response.json();
            const dataArray = allData ? Object.values(allData) : [];
            const data = dataArray.filter(record => record.UserEmail && record.UserEmail.toLowerCase() === userEmail.toLowerCase());
            // Filter for "Passed" status
            const count = data.filter(record => record.Status === 'Passed').length;

            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                count: count
            }));

            return count;
        } catch (error) {
            console.error("Failed to fetch cert count:", error);
            return 0;
        }
    }

    async function renderBenefits() {
        const container = document.getElementById('benefits-container');
        const progressContainer = document.getElementById('progress-container');
        if (!container || !progressContainer) return;

        const userEmail = getUserEmail();

        if (!userEmail) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Please Log In</h3>
                    <p>You need to be logged in to view your benefits progress.</p>
                </div>
            `;
            return;
        }

        // Show loading state
        progressContainer.innerHTML = '<p class="text-center">Loading progress...</p>';

        const certCount = await getCertCount(userEmail);

        // Render Progress Section
        const maxCerts = 14;
        const nextTier = TIERS.find(t => t.requiredCerts > certCount) || TIERS[TIERS.length - 1];
        const progressPercent = Math.min((certCount / maxCerts) * 100, 100);

        progressContainer.innerHTML = `
            <div class="progress-card">
                <div class="progress-header">
                    <div>
                        <h2>Your Progress</h2>
                        <p>You have earned <strong>${certCount}</strong> certification${certCount !== 1 ? 's' : ''}.</p>
                    </div>
                    <div class="badge-count">${certCount} / ${maxCerts}</div>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
                <p class="progress-footer">
                    ${certCount >= maxCerts
                ? "You've unlocked the ultimate reward! You are a Cloud Master!"
                : `${nextTier.requiredCerts - certCount} more certification${(nextTier.requiredCerts - certCount) !== 1 ? 's' : ''} to unlock the <strong>${nextTier.title}</strong>.`}
                </p>
            </div>
        `;

        // Render Tiers
        container.innerHTML = TIERS.map(tier => {
            const isUnlocked = certCount >= tier.requiredCerts;
            return `
                <div class="benefit-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="card-image">
                        <img src="${tier.image}" alt="${tier.title}" style="${!isUnlocked ? 'filter: blur(5px);' : ''}">
                        ${!isUnlocked ? '<div class="lock-overlay"><i data-lucide="lock"></i></div>' : ''}
                    </div>
                    <div class="card-content">
                        <div class="tier-badge">Tier ${tier.level}</div>
                        <h3>${tier.title}</h3>
                        <p>${tier.description}</p>
                        <p class="text-sm font-medium text-gray-600 mt-2 mb-1">Select 1 of the following:</p>
                        <ul class="item-list">
                            ${tier.items.map(item => `<li><i data-lucide="check" style="width:14px; height:14px; margin-right:6px;"></i> ${item}</li>`).join('')}
                        </ul>
                        <button class="btn ${isUnlocked ? 'btn-primary' : 'btn-disabled'}" 
                            ${isUnlocked ? `onclick="claimReward(${tier.level}, '${tier.title}', ${JSON.stringify(tier.items).replace(/"/g, '&quot;')})"` : 'disabled'}>
                            ${isUnlocked ? 'Claim Reward' : `Requires ${tier.requiredCerts} Certs`}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    // Claim function
    function claimReward(level, title, items) {
        const modal = document.getElementById('claimModal');
        const tierInput = document.getElementById('claimTier');
        const tierNameInput = document.getElementById('claimTierName');
        const itemSelect = document.getElementById('claimItemSelect');

        // Set hidden fields
        tierInput.value = level;
        tierNameInput.value = title;

        // Populate dropdown
        itemSelect.innerHTML = '<option value="">-- Select an Item --</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            itemSelect.appendChild(option);
        });

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeClaimModal() {
        const modal = document.getElementById('claimModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // Close modal when clicking outside
    document.getElementById('claimModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeClaimModal();
        }
    });

    // Expose render function
    window.renderBenefits = renderBenefits;

    // Auto-render
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderBenefits);
    } else {
        renderBenefits();
    }

})();
