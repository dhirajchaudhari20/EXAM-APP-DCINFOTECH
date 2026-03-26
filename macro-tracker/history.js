import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, query, orderByChild, limitToLast, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCohKlqNu0I1sXcLW4D_fv-OEw9x0S50q8", // Standard Key
    authDomain: "dc-infotechpvt-1-d1a4b.firebaseapp.com",
    databaseURL: "https://dc-infotechpvt-1-d1a4b-default-rtdb.firebaseio.com",
    projectId: "dc-infotechpvt-1-d1a4b",
    storageBucket: "dc-infotechpvt-1-d1a4b.firebasestorage.app",
    messagingSenderId: "330752838328",
    appId: "1:330752838328:web:1fe0ca04953934d4638703"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function initHistoryView() {
    const historyList = document.getElementById('historyList');
    const loading = document.getElementById('loading');

    // Goal 20: Display version
    const versionEl = document.getElementById('app-version-display');
    if (versionEl) versionEl.textContent = 'v1.0.0';

    // Safety check
    if (!historyList) return;

    if (loading) loading.style.display = 'block';

    const savedUserStr = localStorage.getItem('macro_user');
    if (!savedUserStr) {
        historyList.innerHTML = '<p style="text-align:center; color:var(--text-muted)">Please log in to view history.</p>';
        if (loading) loading.style.display = 'none';
        return;
    }

    const savedUser = JSON.parse(savedUserStr);
    const mealsRef = ref(db, `users/${savedUser.uid}/meals`);
    const q = query(mealsRef, limitToLast(30));

    // Wait for data load
    get(q).then((snapshot) => {
        let html = '';

        if (snapshot.exists()) {
            let meals = [];
            snapshot.forEach((child) => {
                meals.push({ key: child.key, ...child.val() });
            });
            meals.reverse(); // Show newest first

            meals.forEach((data) => {
                const date = data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown Date';
                // Handle potential undefined foodItems
                const foodItemsStr = Array.isArray(data.foodItems) ? data.foodItems.join(', ') : (data.foodItems || 'No items');

                const imgThumb = data.imageStr ?
                    `<img src="${data.imageStr}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; flex-shrink: 0; align-self: center;">` :
                    `<div style="width: 50px; height: 50px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; flex-shrink: 0; align-self: center;"><i class="fas fa-utensils"></i></div>`;

                // Goal 25: Ingredient Breakdown
                let breakdownHtml = '';
                if (data.ingredients && data.ingredients.length > 0) {
                    breakdownHtml = `
                        <div style="margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
                            <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 5px; font-weight: 600;">Breakdown:</div>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                ${data.ingredients.map(ing => `
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-main);">
                                        <span>${ing.name} <span style="font-size: 0.7rem; color: #94a3b8;">(${ing.amount})</span></span>
                                        <span style="color: #64748b;">${ing.calories} Cal</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                html += `
                <div class="history-item" style="background: var(--card-bg); border: 1px solid rgba(0,0,0,0.05); padding: 1.25rem; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 1rem;">
                    <div class="history-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <span style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">${date}</span>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span style="padding: 4px 10px; background: #fff7ed; color: var(--primary); border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Meal Log</span>
                            <button onclick="window.openEditMealModal('${data.key}')" style="background:none; border:none; color:#3b82f6; cursor:pointer; font-size: 1.1rem;" title="Edit Meal"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteMeal('${data.key}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size: 1.1rem;" title="Delete Meal"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 15px; margin-bottom: 1rem;">
                        ${imgThumb}
                        <div class="history-details" style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); line-height: 1.4; flex: 1; align-self: center;">
                            ${foodItemsStr}
                        </div>
                    </div>
                    ${breakdownHtml}
                    <div class="history-macros" style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f3f4f6; margin-top: 10px;">
                        <div style="display: flex; gap: 8px; font-size: 0.75rem; font-weight: 600;">
                            <span style="background: #fff7ed; color: var(--protein-color); padding: 4px 8px; border-radius: 6px;">${Math.round(data.macros?.protein || 0)}g P</span>
                            <span style="background: #ecfdf5; color: var(--carbs-color); padding: 4px 8px; border-radius: 6px;">${Math.round(data.macros?.carbs || 0)}g C</span>
                            <span style="background: #fef2f2; color: var(--fats-color); padding: 4px 8px; border-radius: 6px;">${Math.round(data.macros?.fats || 0)}g F</span>
                        </div>
                        <div style="font-weight: 800; color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 4px;">
                            ${Math.round(data.macros?.calories || 0)} <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">kcal</span>
                        </div>
                    </div>
                </div>
                `;
            });
        } else {
            html = '<p style="text-align:center; color:var(--text-muted); margin-top: 2rem;">No meals logged yet.</p>';
        }

        historyList.innerHTML = html;
        if (loading) loading.style.display = 'none';

    }).catch(e => {
        console.error("Error loading history:", e);
        historyList.innerHTML = `<p style="color:red; text-align:center; margin-top:2rem;">Error loading details: ${e.message}</p>`;
        if (loading) loading.style.display = 'none';
    });
}
