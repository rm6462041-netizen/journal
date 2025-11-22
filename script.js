// script.js
document.addEventListener("DOMContentLoaded", function () {
    // Add reports navigation
document.getElementById('reports-link')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'reports.html';
});
    // -------------------
    // Charts - Empty initialization
    // -------------------
    const performanceChart = new Chart(document.getElementById("performanceChart"), {
        type: "line",
        data: { 
            labels: [], 
            datasets: [{ 
                label: "Portfolio Value", 
                data: [], 
                borderColor: "#3b82f6", 
                backgroundColor: "rgba(59, 130, 246, 0.1)", 
                borderWidth: 2, 
                fill: true, 
                tension: 0.4 
            }] 
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const activityChart = new Chart(document.getElementById("activityChart"), {
        type: "bar",
        data: { 
            labels: [], 
            datasets: [{ 
                label: "Trades", 
                data: [], 
                backgroundColor: "rgba(59,130,246,0.7)" 
            }] 
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    const portfolioChart = new Chart(document.getElementById("portfolioChart"), {
        type: "doughnut",
        data: { 
            labels: [], 
            datasets: [{ 
                data: [], 
                backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"] 
            }] 
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // -------------------
    // Settings toggle
    // -------------------
    document.getElementById('settings-toggle')?.addEventListener('click', function (e) {
        e.preventDefault();
        const submenu = document.getElementById('settings-submenu');
        const arrow = this.querySelector('.dropdown-arrow');
        if (submenu && arrow) {
            submenu.classList.toggle('active');
            arrow.classList.toggle('rotate');
        }
    });

    // -------------------
    // Theme toggle
    // -------------------
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function () {
            document.body.classList.toggle('dark-mode');
            document.querySelector('.dashboard')?.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', this.checked);
            updateChartsTheme();
        });
    }

    // -------------------
    // Notifications toggle
    // -------------------
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', function () {
            localStorage.setItem('notifications', this.checked);
            showNotification('Notifications ' + (this.checked ? 'enabled' : 'disabled'));
        });
    }

    // -------------------
    // Update charts for dark/light theme
    // -------------------
    function updateChartsTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#ffffff' : '#333333';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        // Update all charts
        [performanceChart, activityChart, portfolioChart].forEach(chart => {
            if (chart) {
                if (chart.options.plugins?.legend?.labels) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                chart.options.scales = {
                    ...chart.options.scales,
                    x: {
                        ...chart.options.scales?.x,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        ...chart.options.scales?.y,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    }
                };
                chart.update();
            }
        });
    }

    // -------------------
    // Notification system
    // -------------------
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    background: #10b981;
                    color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                .notification.error { background: #ef4444; }
                .notification.warning { background: #f59e0b; }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // -------------------
    // Load saved preferences
    // -------------------
    function loadSavedPreferences() {
        // Dark mode
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkModeToggle) darkModeToggle.checked = darkMode;
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('.dashboard')?.classList.add('dark-mode');
        }
        
        // Notifications
        const notifications = localStorage.getItem('notifications') !== 'false';
        if (notificationsToggle) notificationsToggle.checked = notifications;
        
        // Update charts theme
        setTimeout(updateChartsTheme, 100);
    }

    // -------------------
    // Enhanced trades loader
    // -------------------
    function loadTrades() {
        try {
            const trades = JSON.parse(localStorage.getItem('trades')) || [];
            
            // If no trades, show empty state
            if (trades.length === 0) {
                showEmptyState();
                return;
            }

            let totalPortfolioValue = 0;
            let profitTrades = 0;
            let totalPnL = 0;
            let activeTrades = trades.length;

            // Process trades - calculate REAL portfolio value and stats
            trades.forEach(trade => {
                const pnl = parseFloat(trade.pnl) || 0;
                const investment = parseFloat(trade.investment) || 0;
                
                if (!isNaN(pnl)) {
                    totalPnL += pnl;
                    if (pnl > 0) profitTrades++;
                }
                
                // Calculate actual portfolio value (investment + PnL)
                if (!isNaN(investment)) {
                    totalPortfolioValue += investment + pnl;
                }
            });

            // Calculate win rate safely
            const winRate = activeTrades > 0 ? 
                Math.min(100, ((profitTrades / activeTrades) * 100)).toFixed(1) : "0.0";

            // Calculate average PnL
            const avgPnL = activeTrades > 0 ? (totalPnL / activeTrades).toFixed(2) : "0.00";

            // Update stats cards
            updateStatsCards(totalPortfolioValue, winRate, avgPnL, activeTrades);
            
            // Update recent activity
            updateRecentActivity(trades);
            
            // Update charts with real data
            updateChartsWithTradeData(trades);
            
            // Update PnL calendar
            updatePnLCalendar(trades);

        } catch (error) {
            console.error('Error loading trades:', error);
            showNotification('Error loading trade data', 'error');
        }
    }

    // -------------------
    // Show empty state
    // -------------------
    function showEmptyState() {
        document.querySelector('.stats-cards .stat-card:nth-child(1) .stat-value').textContent = '$0.00';
        document.querySelector('.stats-cards .stat-card:nth-child(2) .stat-value').textContent = '0.0%';
        document.querySelector('.stats-cards .stat-card:nth-child(3) .stat-value').textContent = '$0.00';
        document.querySelector('.stats-cards .stat-card:nth-child(4) .stat-value').textContent = '0';
        
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = `
                <div class="activity-item empty-state">
                    <div class="activity-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="activity-details">
                        <div class="activity-title">No trades yet</div>
                        <div class="activity-time">Start adding trades to see your activity</div>
                    </div>
                </div>
            `;
        }

        // Clear charts when no data
        performanceChart.data.labels = [];
        performanceChart.data.datasets[0].data = [];
        performanceChart.update();

        activityChart.data.labels = [];
        activityChart.data.datasets[0].data = [];
        activityChart.update();

        portfolioChart.data.labels = [];
        portfolioChart.data.datasets[0].data = [];
        portfolioChart.update();
    }

    // -------------------
    // Update stats cards
    // -------------------
    function updateStatsCards(portfolioValue, winRate, avgPnL, activeTrades) {
        const statCards = document.querySelectorAll('.stats-cards .stat-card');
        
        if (statCards[0]) {
            statCards[0].querySelector('.stat-value').textContent = `$${portfolioValue.toFixed(2)}`;
            const changeElement = statCards[0].querySelector('.stat-change');
            if (changeElement) {
                changeElement.textContent = portfolioValue >= 0 ? '+ Positive' : '- Negative';
                changeElement.className = `stat-change ${portfolioValue >= 0 ? 'positive' : 'negative'}`;
            }
        }
        
        if (statCards[1]) {
            statCards[1].querySelector('.stat-value').textContent = `${winRate}%`;
        }
        
        if (statCards[2]) {
            statCards[2].querySelector('.stat-value').textContent = `$${avgPnL}`;
            const changeElement = statCards[2].querySelector('.stat-change');
            if (changeElement) {
                const isPositive = parseFloat(avgPnL) >= 0;
                changeElement.textContent = isPositive ? '+ Positive' : '- Negative';
                changeElement.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
            }
        }
        
        if (statCards[3]) {
            statCards[3].querySelector('.stat-value').textContent = activeTrades;
        }
    }

    // -------------------
    // Update recent activity
    // -------------------
    function updateRecentActivity(trades) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        const recentTrades = trades
            .slice(-5)
            .reverse()
            .filter(trade => trade && trade.symbol);

        if (recentTrades.length === 0) {
            showEmptyState();
            return;
        }

        activityList.innerHTML = recentTrades.map(trade => {
            const pnl = parseFloat(trade.pnl) || 0;
            const pnlFormatted = !isNaN(pnl) ? `$${Math.abs(pnl).toFixed(2)}` : '-';
            const pnlClass = pnl >= 0 ? 'positive' : 'negative';
            const directionIcon = trade.tradeType === 'buy' ? 'up' : 'down';
            const symbol = trade.symbol || 'Unknown';
            const tradeType = (trade.tradeType || '').toUpperCase();
            const tradeDate = trade.tradeDate || '';
            const tradeTime = trade.tradeTime || '';
            
            return `
                <div class="activity-item">
                    <div class="activity-icon ${trade.tradeType}">
                        <i class="fas fa-arrow-${directionIcon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${symbol} ${tradeType}</div>
                        <div class="activity-time">${tradeDate} ${tradeTime}</div>
                    </div>
                    <div class="activity-amount ${pnlClass}">
                        ${pnl >= 0 ? '+' : '-'}${pnlFormatted}
                    </div>
                </div>
            `;
        }).join('');
    }

    // -------------------
    // Update charts with real trade data
    // -------------------
    function updateChartsWithTradeData(trades) {
        // Update performance chart with actual data
        const performanceData = calculatePerformanceData(trades);
        if (performanceChart) {
            performanceChart.data.labels = performanceData.labels;
            performanceChart.data.datasets[0].data = performanceData.values;
            performanceChart.update();
        }

        // Update activity chart with actual data
        const activityData = calculateActivityData(trades);
        if (activityChart) {
            activityChart.data.labels = activityData.labels;
            activityChart.data.datasets[0].data = activityData.counts;
            activityChart.update();
        }

        // Update portfolio chart with actual data
        const portfolioData = calculatePortfolioAllocation(trades);
        if (portfolioChart) {
            portfolioChart.data.labels = portfolioData.labels;
            portfolioChart.data.datasets[0].data = portfolioData.values;
            portfolioChart.data.datasets[0].backgroundColor = portfolioData.colors;
            portfolioChart.update();
        }
    }

    // -------------------
    // Calculate performance data (last 7 days)
    // -------------------
    function calculatePerformanceData(trades) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const dailyPnL = {};
        last7Days.forEach(date => {
            dailyPnL[date] = 0;
        });

        trades.forEach(trade => {
            if (trade.tradeDate) {
                const tradeDate = trade.tradeDate;
                if (last7Days.includes(tradeDate)) {
                    const pnl = parseFloat(trade.pnl) || 0;
                    dailyPnL[tradeDate] += pnl;
                }
            }
        });

        // Calculate cumulative values
        let cumulative = 0;
        const cumulativeValues = last7Days.map(date => {
            cumulative += dailyPnL[date];
            return cumulative;
        });

        const labels = last7Days.map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        return { labels, values: cumulativeValues };
    }

    // -------------------
    // Calculate activity data (last 7 days)
    // -------------------
    function calculateActivityData(trades) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const dailyCounts = {};
        last7Days.forEach(date => {
            dailyCounts[date] = 0;
        });

        trades.forEach(trade => {
            if (trade.tradeDate && last7Days.includes(trade.tradeDate)) {
                dailyCounts[trade.tradeDate]++;
            }
        });

        const labels = last7Days.map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        const counts = last7Days.map(date => dailyCounts[date]);

        return { labels, counts };
    }

    // -------------------
    // Calculate portfolio allocation
    // -------------------
    function calculatePortfolioAllocation(trades) {
        const categories = {};
        const colorPalette = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
        
        trades.forEach(trade => {
            const category = trade.category || 'Other';
            const investment = parseFloat(trade.investment) || 0;
            const pnl = parseFloat(trade.pnl) || 0;
            const totalValue = investment + pnl;
            
            if (totalValue > 0) {
                if (!categories[category]) {
                    categories[category] = 0;
                }
                categories[category] += totalValue;
            }
        });

        const labels = Object.keys(categories);
        const values = Object.values(categories);
        const colors = labels.map((_, index) => colorPalette[index % colorPalette.length]);

        // If no categories found, show empty
        if (labels.length === 0) {
            return { labels: ['No Data'], values: [1], colors: ['#6b7280'] };
        }

        return { labels, values, colors };
    }

    // -------------------
// Update PnL Calendar - FIXED VERSION
// -------------------
function updatePnLCalendar(trades) {
    try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        
        // Process trade data for the calendar
        const calendarData = processTradeDataForCalendar(trades, year, month);
        
        // Update the analytics calendar with real data
        if (typeof createAnalytics === 'function') {
            createAnalytics('analytics-container', { 
                year: year, 
                month: month, 
                data: calendarData 
            });
        }
    } catch (error) {
        console.error('Error updating PnL calendar:', error);
    }
}

// -------------------
// Process trade data for calendar - NEW FUNCTION
// -------------------
function processTradeDataForCalendar(trades, year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let dailyData = [];
    
    // Initialize all days with zero values
    for (let day = 0; day < daysInMonth; day++) {
        dailyData.push({
            value: 0,
            color: 'gray'
        });
    }
    
    // Process each trade and add to the corresponding day
    trades.forEach(trade => {
        if (trade.tradeDate) {
            try {
                const tradeDate = new Date(trade.tradeDate);
                if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
                    const dayIndex = tradeDate.getDate() - 1;
                    const pnl = parseFloat(trade.pnl) || 0;
                    
                    if (dayIndex >= 0 && dayIndex < daysInMonth) {
                        dailyData[dayIndex].value += pnl;
                        
                        // Update color based on PnL
                        if (dailyData[dayIndex].value > 0) {
                            dailyData[dayIndex].color = 'green';
                        } else if (dailyData[dayIndex].value < 0) {
                            dailyData[dayIndex].color = 'red';
                        } else {
                            dailyData[dayIndex].color = 'gray';
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing trade date:', error);
            }
        }
    });
    
    return dailyData;
}

    // -------------------
    // Export data functionality
    // -------------------
    function setupExportButton() {
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                const trades = JSON.parse(localStorage.getItem('trades')) || [];
                if (trades.length === 0) {
                    showNotification('No data to export', 'warning');
                    return;
                }
                
                const dataStr = JSON.stringify(trades, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `trades-export-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                
                showNotification('Data exported successfully');
            });
        }
    }

    // -------------------
    // Initialize
    // -------------------
    function init() {
        loadSavedPreferences();
        loadTrades();
        setupExportButton();
        
        // Add export button if not exists
        if (!document.getElementById('export-data')) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'export-data';
            exportBtn.className = 'btn btn-secondary';
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Data';
            document.querySelector('.header-actions')?.appendChild(exportBtn);
            setupExportButton();
        }

        // Refresh data every minute
        setInterval(loadTrades, 60000);
    }

    init();
});

// Display current user - ADD THIS TO script.js
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userNameElement = document.querySelector('.user-name');
    const userAvatarElement = document.querySelector('.user-avatar');
    
    if (currentUser && userNameElement) {
        // Update user name
        userNameElement.textContent = currentUser.firstName + ' ' + currentUser.lastName;
        
        // Update avatar initials
        const initials = (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
        userAvatarElement.textContent = initials;
    }
});