/**
 * dashboard-chart.js
 * Renders the Skill Radar Chart on the dashboard.
 */

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('skillRadarChart');
    if (!ctx) return;

    // Mock data - in a real app, this would come from the backend/localStorage
    const data = {
        labels: [
            'Networking',
            'Security',
            'Compute',
            'Storage',
            'Databases',
            'DevOps'
        ],
        datasets: [{
            label: 'Your Skill Level',
            data: [85, 65, 90, 75, 60, 80],
            fill: true,
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            borderColor: '#4f46e5',
            pointBackgroundColor: '#4f46e5',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#4f46e5'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            family: "'Inter', sans-serif"
                        },
                        color: '#6b7280' // var(--text-medium)
                    },
                    ticks: {
                        backdropColor: 'transparent'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    };

    // Dark mode adjustment
    function updateChartTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        const textColor = isDark ? '#e5e7eb' : '#6b7280';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        myChart.options.scales.r.pointLabels.color = textColor;
        myChart.options.scales.r.grid.color = gridColor;
        myChart.options.scales.r.angleLines.color = gridColor;
        myChart.update();
    }

    const myChart = new Chart(ctx, config);

    // Watch for dark mode changes
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
                updateChartTheme();
            }
        });
    });

    observer.observe(document.body, {
        attributes: true
    });

    // Initial check
    if (document.body.classList.contains('dark-mode')) {
        updateChartTheme();
    }
});
