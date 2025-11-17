// reports.js - Advanced Trading Analytics System - COMPLETE FIXED VERSION
let currentPeriod = 'monthly';
let currentAnalysisTab = 'winRate';
let chartInstances = {};

// DEBUG FUNCTION - Data consistency check
function debugDataConsistency(trades, section) {
    console.log(`=== ${section} DEBUG ===`);
    console.log('Total trades:', trades.length);
    
    // Check P&L consistency
    const totalPnL = trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
    console.log('Total P&L:', totalPnL);
    
    // Check dates
    const dates = [...new Set(trades.map(t => t.tradeDate))].sort();
    console.log('Unique dates:', dates);
    
    return totalPnL;
}

// COMMON FILTERING FUNCTION - Yeh sab jagah use hoga
function getFilteredTrades() {
    const allTrades = loadTradesData();
    
    // Same filters for all sections
    const dateRange = document.getElementById('dateRange')?.value || 'all';
    const tradeType = document.getElementById('tradeTypeFilter')?.value || 'all';
    const symbol = document.getElementById('symbolFilter')?.value || 'all';
    
    let filtered = [...allTrades];
    
    // Date filter - SAME LOGIC EVERYWHERE
    if (dateRange !== 'all') {
        filtered = filterByDateRange(filtered, dateRange);
    }
    
    // Trade type filter - SAME LOGIC EVERYWHERE
    if (tradeType !== 'all') {
        filtered = filtered.filter(trade => trade.tradeType === tradeType);
    }
    
    // Symbol filter - SAME LOGIC EVERYWHERE
    if (symbol !== 'all') {
        filtered = filtered.filter(trade => trade.symbol === symbol);
    }
    
    console.log(`🔍 FILTERED: ${filtered.length} trades (from ${allTrades.length} total)`);
    return filtered;
}

// Theme adaptation function
function updateChartTheme(chart, isDark) {
    if (chart && chart.options) {
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const textColor = isDark ? '#cbd5e1' : '#475569';
        
        if (chart.options.scales) {
            Object.values(chart.options.scales).forEach(scale => {
                if (scale.grid) scale.grid.color = gridColor;
                if (scale.ticks) scale.ticks.color = textColor;
            });
        }
        
        if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        
        chart.update('none');
    }
}

// Initialize reports with advanced features
document.addEventListener('DOMContentLoaded', function() {
    console.log("📊 REPORTS SYSTEM INITIALIZED");
    initializeTheme();
    populateSymbolFilter();
    updateReports(); // Single source of truth
    initializeAdvancedCharts();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
    
    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances = {};
    updateReports();
}

function updateThemeButton(theme) {
    const button = document.querySelector('.theme-toggle');
    if (button) {
        const icon = button.querySelector('i');
        const text = theme === 'light' ? 'Dark Mode' : 'Light Mode';
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        button.innerHTML = `<i class="${icon.className}"></i> ${text}`;
    }
}

// Period Switching
function switchPeriod(period) {
    currentPeriod = period;
    
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateReports();
}

// Analysis Tab Switching
function switchAnalysisTab(tab) {
    currentAnalysisTab = tab;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateAdvancedAnalysis();
}

// Load trades from localStorage with validation
function loadTradesData() {
    try {
        const trades = JSON.parse(localStorage.getItem('trades')) || [];
        console.log(`📁 LOADED ${trades.length} TRADES FROM STORAGE`);
        
        return trades.map(trade => ({
            ...trade,
            pnl: parseFloat(trade.pnl) || 0,
            quantity: parseInt(trade.quantity) || 0,
            entryPrice: parseFloat(trade.entryPrice) || 0,
            exitPrice: parseFloat(trade.exitPrice) || 0
        }));
    } catch (error) {
        console.error('Error loading trades:', error);
        return [];
    }
}

// Update all reports based on filters and period - SINGLE SOURCE OF TRUTH
function updateReports() {
    console.log("🔄 UPDATING ALL REPORTS");
    
    const filteredTrades = getFilteredTrades(); // COMMON FILTERING
    
    debugDataConsistency(filteredTrades, 'MAIN REPORTS');
    
    if (filteredTrades.length === 0) {
        showEmptyState();
        return;
    }
    
    // Update all sections with SAME DATA
    updatePerformanceSummary(filteredTrades);
    updateWinLossAnalysis(filteredTrades);  // Yehi ek call karo - win loss distribution bhi isi mein hai
    updateMonthlyPerformance(filteredTrades);
    updateRecentTrades(filteredTrades);
    updateStrategyPerformance(filteredTrades);
    updateTimeAnalysis(filteredTrades);
    updateDayOfWeekAnalysis(filteredTrades);
    updateBestWorstDays(filteredTrades);
    updateSymbolPerformance(filteredTrades);
    updateBehaviorAnalysis(filteredTrades);
    updateAdvancedAnalysis();
    
    console.log("✅ ALL REPORTS UPDATED SUCCESSFULLY");
}

// Filter trades based on current selections
function filterTrades(trades) {
    let filtered = [...trades];
    
    const dateRange = document.getElementById('dateRange').value;
    if (dateRange !== 'all') {
        filtered = filterByDateRange(filtered, dateRange);
    }
    
    const tradeType = document.getElementById('tradeTypeFilter').value;
    if (tradeType !== 'all') {
        filtered = filtered.filter(trade => trade.tradeType === tradeType);
    }
    
    const symbol = document.getElementById('symbolFilter').value;
    if (symbol !== 'all') {
        filtered = filtered.filter(trade => trade.symbol === symbol);
    }
    
    return filtered;
}

// Date range filtering - FIXED VERSION
function filterByDateRange(trades, range) {
    const now = new Date();
    let startDate, endDate;
    
    switch(range) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = new Date();
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
            break;
        case 'quarter':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            endDate = new Date();
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date();
            break;
        default:
            return trades;
    }
    
    return trades.filter(trade => {
        const tradeDate = new Date(trade.tradeDate + 'T00:00:00');
        return tradeDate >= startDate && tradeDate <= endDate;
    });
}

// Populate symbol filter dropdown
function populateSymbolFilter() {
    const trades = loadTradesData();
    const symbols = [...new Set(trades.map(trade => trade.symbol).filter(Boolean))];
    const select = document.getElementById('symbolFilter');
    
    if (select) {
        select.innerHTML = '<option value="all">All Symbols</option>';
        
        symbols.forEach(symbol => {
            const option = document.createElement('option');
            option.value = symbol;
            option.textContent = symbol;
            select.appendChild(option);
        });
    }
}

// Update Performance Summary with Advanced Metrics
function updatePerformanceSummary(trades) {
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const losingTrades = trades.filter(trade => trade.pnl < 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length * 100) : 0;
    const avgTrade = trades.length > 0 ? (totalPnL / trades.length) : 0;
    
    const riskReward = calculateRiskRewardRatio(trades);
    const sharpeRatio = calculateSharpeRatio(trades);
    
    // Update DOM elements safely
    const elements = {
        totalPnL: document.getElementById('totalPnL'),
        winRate: document.getElementById('winRate'),
        avgTrade: document.getElementById('avgTrade'),
        totalTrades: document.getElementById('totalTrades'),
        riskReward: document.getElementById('riskReward'),
        sharpeRatio: document.getElementById('sharpeRatio')
    };
    
    if (elements.totalPnL) {
        elements.totalPnL.textContent = `$${totalPnL.toFixed(2)}`;
        elements.totalPnL.className = `metric-value ${totalPnL >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (elements.winRate) elements.winRate.textContent = `${winRate.toFixed(1)}%`;
    if (elements.avgTrade) elements.avgTrade.textContent = `$${avgTrade.toFixed(2)}`;
    if (elements.totalTrades) elements.totalTrades.textContent = trades.length;
    if (elements.riskReward) elements.riskReward.textContent = riskReward;
    if (elements.sharpeRatio) elements.sharpeRatio.textContent = sharpeRatio;
    
    updatePerformanceChart(trades);
}

// Advanced Metrics Calculations
function calculateRiskRewardRatio(trades) {
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    const avgWin = winningTrades.length ? 
        winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length ? 
        Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0)) / losingTrades.length : 0;
    
    return avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A';
}

function calculateSharpeRatio(trades) {
    if (trades.length === 0) return '0.00';
    
    const returns = trades.map(t => t.pnl);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : '0.00';
}

// Update Performance Chart
function updatePerformanceChart(trades) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    if (chartInstances.performanceChart) {
        chartInstances.performanceChart.destroy();
    }

    const sortedTrades = [...trades].sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
    let runningTotal = 0;
    const cumulativeData = sortedTrades.map(trade => {
        runningTotal += trade.pnl;
        return {
            x: trade.tradeDate,
            y: runningTotal
        };
    });

    const isDark = document.body.getAttribute('data-theme') === 'dark';

    chartInstances.performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Cumulative P&L',
                data: cumulativeData,
                borderColor: '#3b82f6',
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                }
            }
        }
    });
    updateChartTheme(chartInstances.performanceChart, isDark);
}

// Update Win Loss Distribution Chart - FIXED VERSION
function updateWinLossDistribution(trades) {
    const ctx = document.getElementById('winLossChart');
    if (!ctx) {
        console.error("❌ winLossChart element not found!");
        return;
    }
    
    if (chartInstances.winLossChart) {
        chartInstances.winLossChart.destroy();
    }

    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const losingTrades = trades.filter(trade => trade.pnl < 0);
    const breakEvenTrades = trades.filter(trade => trade.pnl === 0);

    // Update metric cards
    const winningTradesElement = document.getElementById('winningTrades');
    const losingTradesElement = document.getElementById('losingTrades');
    
    if (winningTradesElement) winningTradesElement.textContent = winningTrades.length;
    if (losingTradesElement) losingTradesElement.textContent = losingTrades.length;

    const isDark = document.body.getAttribute('data-theme') === 'dark';

    chartInstances.winLossChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Winning Trades', 'Losing Trades', 'Break-even Trades'],
            datasets: [{
                data: [winningTrades.length, losingTrades.length, breakEvenTrades.length],
                backgroundColor: [
                    '#10b981',  // Green for wins
                    '#ef4444',  // Red for losses
                    '#6b7280'   // Gray for break-even
                ],
                borderColor: isDark ? '#1e293b' : '#ffffff',
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#cbd5e1' : '#475569',
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });

    updateChartTheme(chartInstances.winLossChart, isDark);
}

// Enhanced Win Loss Analysis with more details - FIXED VERSION
function updateWinLossAnalysis(trades) {
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const losingTrades = trades.filter(trade => trade.pnl < 0);
    const breakEvenTrades = trades.filter(trade => trade.pnl === 0);
    
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length * 100) : 0;
    
    // Calculate average win/loss
    const avgWin = winningTrades.length > 0 ? 
        winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? 
        Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0)) / losingTrades.length : 0;
    
    // Largest win/loss
    const largestWin = winningTrades.length > 0 ? 
        Math.max(...winningTrades.map(trade => trade.pnl)) : 0;
    const largestLoss = losingTrades.length > 0 ? 
        Math.min(...losingTrades.map(trade => trade.pnl)) : 0;

    console.log(`📈 Win/Loss Analysis: ${winningTrades.length} wins, ${losingTrades.length} losses, ${breakEvenTrades.length} break-even`);
    
    // Update win loss analysis section - if you have a separate element for detailed stats
    const winLossElement = document.getElementById('winLossAnalysis');
    if (winLossElement) {
        winLossElement.innerHTML = `
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
                <div><strong>Win Rate:</strong> ${winRate.toFixed(1)}%</div>
                <div><strong>Break-even:</strong> ${breakEvenTrades.length}</div>
                <div><strong>Avg Win:</strong> $${avgWin.toFixed(2)}</div>
                <div><strong>Avg Loss:</strong> $${avgLoss.toFixed(2)}</div>
                <div><strong>Largest Win:</strong> $${largestWin.toFixed(2)}</div>
                <div><strong>Largest Loss:</strong> $${largestLoss.toFixed(2)}</div>
            </div>
        `;
    }

    // Update the distribution chart
    updateWinLossDistribution(trades);
}

// Update Monthly Performance with Heatmap Style
function updateMonthlyPerformance(trades) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    
    if (chartInstances.monthlyChart) {
        chartInstances.monthlyChart.destroy();
    }
    
    const monthlyData = {};
    trades.forEach(trade => {
        const date = new Date(trade.tradeDate);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += trade.pnl;
    });
    
    const months = Object.keys(monthlyData).sort();
    const pnlValues = months.map(month => monthlyData[month]);
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    chartInstances.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(month => {
                const [year, monthNum] = month.split('-');
                return new Date(year, monthNum - 1).toLocaleDateString('en', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Monthly P&L',
                data: pnlValues,
                backgroundColor: pnlValues.map(value => value >= 0 ? '#10b981' : '#ef4444'),
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                }
            }
        }
    });
    
    updateChartTheme(chartInstances.monthlyChart, isDark);
}

// Update Recent Trades List
function updateRecentTrades(trades) {
    const container = document.getElementById('recentTradesList');
    if (!container) return;
    
    const recentTrades = trades.slice(-10).reverse();
    
    container.innerHTML = recentTrades.map(trade => `
        <div class="trade-item">
            <div>
                <div class="trade-symbol">${trade.symbol || 'Unknown'}</div>
                <div style="font-size: 12px; color: var(--text-muted);">
                    ${trade.tradeDate} • ${trade.tradeType?.toUpperCase()}
                </div>
            </div>
            <div class="trade-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}">
                ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Update Strategy Performance
function updateStrategyPerformance(trades) {
    const ctx = document.getElementById('strategyChart');
    if (!ctx) return;
    
    if (chartInstances.strategyChart) {
        chartInstances.strategyChart.destroy();
    }
    
    const strategyData = {};
    trades.forEach(trade => {
        const strategy = trade.strategy || 'No Strategy';
        if (!strategyData[strategy]) {
            strategyData[strategy] = { pnl: 0, count: 0, wins: 0 };
        }
        strategyData[strategy].pnl += trade.pnl;
        strategyData[strategy].count++;
        if (trade.pnl > 0) strategyData[strategy].wins++;
    });
    
    const strategies = Object.keys(strategyData);
    const pnlValues = strategies.map(strategy => strategyData[strategy].pnl);
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    chartInstances.strategyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: strategies,
            datasets: [{
                label: 'Strategy P&L',
                data: pnlValues,
                backgroundColor: pnlValues.map(value => value >= 0 ? '#10b981' : '#ef4444'),
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                }
            }
        }
    });
    
    const bestStrategy = strategies.reduce((best, current) => 
        strategyData[current].pnl > strategyData[best].pnl ? current : best, strategies[0]);
    
    const strategyDetails = document.getElementById('strategyDetails');
    if (bestStrategy && strategyDetails) {
        const stats = strategyData[bestStrategy];
        const winRate = ((stats.wins / stats.count) * 100).toFixed(1);
        strategyDetails.innerHTML = `
            <div style="font-size: 12px; color: var(--text-muted);">
                Best Strategy: <strong>${bestStrategy}</strong><br>
                Win Rate: ${winRate}% | Trades: ${stats.count}
            </div>
        `;
    }
    
    updateChartTheme(chartInstances.strategyChart, isDark);
}

// Time-based Analysis
function updateTimeAnalysis(trades) {
    const ctx = document.getElementById('timeAnalysisChart');
    if (!ctx) return;
    
    if (chartInstances.timeAnalysisChart) {
        chartInstances.timeAnalysisChart.destroy();
    }
    
    const timeSlots = {
        '9-11 AM': { pnl: 0, trades: 0 },
        '11-2 PM': { pnl: 0, trades: 0 },
        '2-4 PM': { pnl: 0, trades: 0 },
        'Other': { pnl: 0, trades: 0 }
    };
    
    trades.forEach(trade => {
        const entryTime = trade.entryTime || '12:00';
        const hour = parseInt(entryTime.split(':')[0]);
        
        let slot;
        if (hour >= 9 && hour < 11) slot = '9-11 AM';
        else if (hour >= 11 && hour < 14) slot = '11-2 PM';
        else if (hour >= 14 && hour < 16) slot = '2-4 PM';
        else slot = 'Other';
        
        timeSlots[slot].pnl += trade.pnl;
        timeSlots[slot].trades++;
    });
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    chartInstances.timeAnalysisChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(timeSlots),
            datasets: [{
                label: 'P&L by Time Slot',
                data: Object.values(timeSlots).map(slot => slot.pnl),
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#6b7280'],
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                }
            }
        }
    });
    
    updateChartTheme(chartInstances.timeAnalysisChart, isDark);
}

// Day of Week Analysis
function updateDayOfWeekAnalysis(trades) {
    const ctx = document.getElementById('dayOfWeekChart');
    if (!ctx) return;
    
    if (chartInstances.dayOfWeekChart) {
        chartInstances.dayOfWeekChart.destroy();
    }
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = days.reduce((acc, day) => {
        acc[day] = { pnl: 0, trades: 0 };
        return acc;
    }, {});
    
    trades.forEach(trade => {
        const date = new Date(trade.tradeDate);
        const dayName = days[date.getDay()];
        dayData[dayName].pnl += trade.pnl;
        dayData[dayName].trades++;
    });
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    chartInstances.dayOfWeekChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'P&L by Day',
                data: days.map(day => dayData[day].pnl),
                backgroundColor: days.map((_, index) => 
                    ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'][index]
                ),
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                }
            }
        }
    });
    
    updateChartTheme(chartInstances.dayOfWeekChart, isDark);
}

// Best/Worst Days Analysis - FIXED VERSION
function updateBestWorstDays(trades) {
    const dailyPerformance = {};
    
    trades.forEach(trade => {
        const date = trade.tradeDate;
        if (!dailyPerformance[date]) {
            dailyPerformance[date] = { pnl: 0, trades: 0, date: date };
        }
        dailyPerformance[date].pnl += trade.pnl;
        dailyPerformance[date].trades++;
    });
    
    const days = Object.values(dailyPerformance);
    
    // Debug daily performance
    console.log("📅 DAILY PERFORMANCE:", dailyPerformance);
    
    const bestDay = days.length > 0 ? days.sort((a, b) => b.pnl - a.pnl)[0] : null;
    const worstDay = days.length > 0 ? days.sort((a, b) => a.pnl - b.pnl)[0] : null;
    
    const container = document.getElementById('bestWorstDays');
    if (container) {
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="font-size: 14px; color: var(--success); font-weight: 600;">
                    <i class="fas fa-trophy"></i> Best Day: ${bestDay ? `$${bestDay.pnl.toFixed(2)} on ${bestDay.date}` : 'N/A'}
                </div>
                <div style="font-size: 11px; color: var(--text-muted);">
                    ${bestDay ? `${bestDay.trades} trades` : ''}
                </div>
            </div>
            <div>
                <div style="font-size: 14px; color: var(--danger); font-weight: 600;">
                    <i class="fas fa-skull-crossbones"></i> Worst Day: ${worstDay ? `$${worstDay.pnl.toFixed(2)} on ${worstDay.date}` : 'N/A'}
                </div>
                <div style="font-size: 11px; color: var(--text-muted);">
                    ${worstDay ? `${worstDay.trades} trades` : ''}
                </div>
            </div>
        `;
    }
}

// Symbol Performance
function updateSymbolPerformance(trades) {
    const symbolStats = {};
    
    trades.forEach(trade => {
        const symbol = trade.symbol || 'Unknown';
        if (!symbolStats[symbol]) {
            symbolStats[symbol] = {
                totalPnL: 0,
                trades: 0,
                wins: 0
            };
        }
        
        symbolStats[symbol].totalPnL += trade.pnl;
        symbolStats[symbol].trades++;
        if (trade.pnl > 0) symbolStats[symbol].wins++;
    });
    
    const topSymbols = Object.entries(symbolStats)
        .map(([symbol, stats]) => ({
            symbol,
            totalPnL: stats.totalPnL,
            trades: stats.trades,
            winRate: ((stats.wins / stats.trades) * 100).toFixed(1)
        }))
        .sort((a, b) => b.totalPnL - a.totalPnL)
        .slice(0, 8);
    
    const container = document.getElementById('symbolPerformanceList');
    if (container) {
        container.innerHTML = topSymbols.map(symbol => `
            <div class="trade-item">
                <div>
                    <div class="trade-symbol">${symbol.symbol}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">
                        ${symbol.trades} trades • ${symbol.winRate}% win rate
                    </div>
                </div>
                <div class="trade-pnl ${symbol.totalPnL >= 0 ? 'positive' : 'negative'}">
                    $${symbol.totalPnL.toFixed(2)}
                </div>
            </div>
        `).join('');
    }
}

// Behavior Analysis
function updateBehaviorAnalysis(trades) {
    const behavior = {
        avgTradesPerDay: calculateAvgTradesPerDay(trades),
        mostTradedSymbol: findMostTradedSymbol(trades),
        tradingConsistency: calculateTradingConsistency(trades),
        riskAppetite: calculateRiskAppetite(trades)
    };
    
    const container = document.getElementById('behaviorAnalysis');
    if (container) {
        container.innerHTML = `
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
                <div><strong>Avg Trades/Day:</strong> ${behavior.avgTradesPerDay}</div>
                <div><strong>Most Traded:</strong> ${behavior.mostTradedSymbol}</div>
                <div><strong>Consistency:</strong> ${behavior.tradingConsistency}%</div>
                <div><strong>Risk Level:</strong> ${behavior.riskAppetite}</div>
            </div>
        `;
    }
}

function calculateAvgTradesPerDay(trades) {
    const tradingDays = new Set(trades.map(t => t.tradeDate)).size;
    return tradingDays > 0 ? (trades.length / tradingDays).toFixed(1) : '0';
}

function findMostTradedSymbol(trades) {
    const symbolCount = {};
    trades.forEach(trade => {
        symbolCount[trade.symbol] = (symbolCount[trade.symbol] || 0) + 1;
    });
    
    return Object.entries(symbolCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}

function calculateTradingConsistency(trades) {
    const tradingDays = new Set(trades.map(t => t.tradeDate)).size;
    const totalDays = 30;
    return ((tradingDays / totalDays) * 100).toFixed(1);
}

function calculateRiskAppetite(trades) {
    if (trades.length === 0) return 'Low';
    const avgPositionSize = trades.reduce((sum, t) => sum + (t.quantity * t.entryPrice), 0) / trades.length;
    if (avgPositionSize > 10000) return 'High';
    if (avgPositionSize > 5000) return 'Medium';
    return 'Low';
}

// Advanced Analysis
function updateAdvancedAnalysis() {
    const trades = getFilteredTrades(); // COMMON FILTERING
    const ctx = document.getElementById('advancedAnalysisChart');
    
    if (!ctx) return;
    
    if (chartInstances.advancedAnalysisChart) {
        chartInstances.advancedAnalysisChart.destroy();
    }
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    switch(currentAnalysisTab) {
        case 'winRate':
            const winRateData = calculateWinRateTrends(trades);
            chartInstances.advancedAnalysisChart = createWinRateTrendChart(ctx, winRateData, isDark);
            break;
            
        case 'distribution':
            const distributionData = calculateProfitDistribution(trades);
            chartInstances.advancedAnalysisChart = createDistributionChart(ctx, distributionData, isDark);
            break;
            
        case 'correlation':
            const correlationData = calculateCorrelations(trades);
            chartInstances.advancedAnalysisChart = createCorrelationChart(ctx, correlationData, isDark);
            break;
    }
    
    updateChartTheme(chartInstances.advancedAnalysisChart, isDark);
}

function calculateWinRateTrends(trades) {
    let wins = 0;
    
    const labels = [];
    const data = [];

    trades.forEach((trade, index) => {
        if (trade.pnl > 0) wins++;

        const currentWinRate = (wins / (index + 1)) * 100;

        // label can be trade number or date
        labels.push(trade.tradeDate || `Trade ${index + 1}`);
        data.push(currentWinRate);
    });

    return {
        labels: labels,  // curve x-axis
        data: data       // cumulative overall win-rate curve
    };
}

function calculateProfitDistribution(trades) {
    const pnls = trades.map(t => t.pnl);
    const min = Math.min(...pnls);
    const max = Math.max(...pnls);
    const range = max - min;
    const binSize = range / 10;
    
    const bins = Array(10).fill(0);
    pnls.forEach(pnl => {
        const binIndex = Math.min(9, Math.floor((pnl - min) / binSize));
        bins[binIndex]++;
    });
    
    return {
        labels: Array(10).fill(0).map((_, i) => {
            const start = min + (i * binSize);
            const end = min + ((i + 1) * binSize);
            return `${start.toFixed(0)} to ${end.toFixed(0)}`;
        }),
        data: bins
    };
}

function calculateCorrelations(trades) {
    return trades.map(trade => ({
        x: trade.quantity * trade.entryPrice,
        y: trade.pnl
    }));
}

function createWinRateTrendChart(ctx, data, isDark) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Win Rate %',
                data: data.data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function createDistributionChart(ctx, data, isDark) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Number of Trades',
                data: data.data,
                backgroundColor: '#06b6d4',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createCorrelationChart(ctx, data, isDark) {
    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Position Size vs P&L',
                data: data,
                backgroundColor: '#3b82f6',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Position Size'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'P&L'
                    }
                }
            }
        }
    });
}

// Initialize Advanced Charts
function initializeAdvancedCharts() {
    // Additional initialization if needed
}

// Empty State
function showEmptyState() {
    const containers = [
        'recentTradesList', 'symbolPerformanceList', 'bestWorstDays', 
        'strategyDetails', 'behaviorAnalysis', 'winLossAnalysis',
        'winningTrades', 'losingTrades'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            if (containerId === 'winningTrades' || containerId === 'losingTrades') {
                container.textContent = '0';
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fas fa-chart-bar" style="font-size: 24px; margin-bottom: 8px;"></i>
                        <div style="font-size: 12px;">No data available</div>
                    </div>
                `;
            }
        }
    });
    
    // Clear all charts
    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances = {};
}

// Export Functions
function exportToCSV() {
    const trades = loadTradesData();
    const headers = ['Date', 'Symbol', 'Type', 'Quantity', 'Entry Price', 'Exit Price', 'P&L', 'Strategy'];
    
    const csvContent = [
        headers.join(','),
        ...trades.map(trade => [
            trade.tradeDate,
            `"${trade.symbol}"`,
            trade.tradeType,
            trade.quantity,
            trade.entryPrice,
            trade.exitPrice || '',
            trade.pnl,
            `"${trade.strategy || ''}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function generatePDFReport() {
    alert('Advanced PDF report generation would be implemented here with comprehensive analytics');
}

// Add this to your main script.js to handle navigation
document.getElementById('reports-link')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'reports.html';
});

// DATA CONSISTENCY VALIDATION
function validateDataConsistency() {
    const allTrades = loadTradesData();
    const filteredTrades = getFilteredTrades();
    
    console.log("🎯 DATA CONSISTENCY VALIDATION:");
    console.log("All trades:", allTrades.length);
    console.log("Filtered trades:", filteredTrades.length);
    
    const totalPnLAll = allTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalPnLFiltered = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    
    console.log("Total P&L - All:", totalPnLAll);
    console.log("Total P&L - Filtered:", totalPnLFiltered);
    
    if (totalPnLAll !== totalPnLFiltered) {
        console.warn("⚠️ P&L MISMATCH DETECTED!");
    } else {
        console.log("✅ Data consistency: PERFECT!");
    }
}

// Auto-validate on load
setTimeout(validateDataConsistency, 2000);