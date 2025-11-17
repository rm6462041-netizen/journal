// Analytics.js - FIXED VERSION
import './Analytics.css';

export function createAnalytics(containerId, options = {}) {
    const {
        year = new Date().getFullYear(),
        month = new Date().getMonth(),
        data = []
    } = options;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }

    container.innerHTML = `
        <div class="analytics-header">
            <h3>PnL Calendar</h3>
            <div class="month-navigation">
                <button class="nav-btn prev-month">←</button>
                <span class="current-month">${getMonthName(month)} ${year}</span>
                <button class="nav-btn next-month">→</button>
            </div>
        </div>
        <div class="calendar-container">
            <table class="analytics-calendar">
                <thead>
                    <tr>
                        <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
                        <th>Thu</th><th>Fri</th><th>Sat</th>
                    </tr>
                </thead>
                <tbody id="analytics-body"></tbody>
            </table>
        </div>
        <div class="analytics-summary">
            <div class="summary-item">
                <span class="label">Profitable Days:</span>
                <span class="value" id="positive-days">0</span>
            </div>
            <div class="summary-item">
                <span class="label">Loss Days:</span>
                <span class="value" id="negative-days">0</span>
            </div>
            <div class="summary-item">
                <span class="label">Trading Days:</span>
                <span class="value" id="total-days">0</span>
            </div>
        </div>
    `;

    renderCalendar(year, month, data);
    setupEventListeners(containerId, year, month);
}

function renderCalendar(year, month, data) {
    const calendarBody = document.getElementById('analytics-body');
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let dayCount = 1;
    let rows = [];
    let positiveDays = 0;
    let negativeDays = 0;
    let tradingDays = 0;

    console.log('Rendering calendar for:', getMonthName(month), year);
    console.log('Calendar data received:', data);

    for (let i = 0; dayCount <= daysInMonth; i++) {
        let cells = [];
        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < firstDay) || dayCount > daysInMonth) {
                cells.push('<td class="empty"></td>');
            } else {
                const dayIndex = dayCount - 1;
                const dayData = data[dayIndex];
                const pnlValue = dayData ? dayData.value : 0;
                
                let cls = 'no-data';
                let tooltip = `${getMonthName(month)} ${dayCount}, ${year}: No trades`;
                
                if (pnlValue !== 0) {
                    tradingDays++;
                    if (pnlValue > 0) {
                        cls = 'positive';
                        positiveDays++;
                        tooltip = `${getMonthName(month)} ${dayCount}, ${year}: +$${Math.abs(pnlValue).toFixed(2)} Profit`;
                    } else if (pnlValue < 0) {
                        cls = 'negative';
                        negativeDays++;
                        tooltip = `${getMonthName(month)} ${dayCount}, ${year}: -$${Math.abs(pnlValue).toFixed(2)} Loss`;
                    }
                }
                
                const isToday = isCurrentDay(year, month, dayCount);
                if (isToday) cls += ' today';
                
                cells.push(`<td class="${cls}" data-tooltip="${tooltip}">${dayCount}</td>`);
                dayCount++;
            }
        }
        rows.push(`<tr>${cells.join('')}</tr>`);
    }

    calendarBody.innerHTML = rows.join('');

    // Update summary
    document.getElementById('positive-days').textContent = positiveDays;
    document.getElementById('negative-days').textContent = negativeDays;
    document.getElementById('total-days').textContent = tradingDays;

    // Fixed colors
    document.getElementById('positive-days').style.color = "#10b981";
    document.getElementById('negative-days').style.color = "#ef4444";
    document.getElementById('total-days').style.color = "#6b7280";

    // Update month display
    const monthDisplay = document.querySelector('.current-month');
    if (monthDisplay) {
        monthDisplay.textContent = `${getMonthName(month)} ${year}`;
    }
}

function setupEventListeners(containerId, currentYear, currentMonth) {
    let year = currentYear;
    let month = currentMonth;
    
    const container = document.getElementById(containerId);
    
    const prevBtn = container.querySelector('.prev-month');
    const nextBtn = container.querySelector('.next-month');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }
            // Load fresh data for the new month
            loadCalendarData(year, month, containerId);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }
            // Load fresh data for the new month
            loadCalendarData(year, month, containerId);
        });
    }
}

function loadCalendarData(year, month, containerId) {
    // Get trades from localStorage
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    const data = processTradeData(trades, year, month);
    
    // Re-render calendar with new data
    renderCalendar(year, month, data);
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

function isCurrentDay(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
}

// Process trade data for calendar
export function processTradeData(trades, year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let dailyData = [];
    
    // Initialize all days
    for (let day = 0; day < daysInMonth; day++) {
        dailyData.push({
            value: 0,
            color: 'gray'
        });
    }
    
    // Process trades
    trades.forEach(trade => {
        if (trade.tradeDate && trade.pnl !== undefined) {
            try {
                const tradeDate = new Date(trade.tradeDate);
                if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
                    const dayIndex = tradeDate.getDate() - 1;
                    const pnl = parseFloat(trade.pnl) || 0;
                    
                    if (dayIndex >= 0 && dayIndex < daysInMonth) {
                        dailyData[dayIndex].value += pnl;
                    }
                }
            } catch (error) {
                console.error('Error processing trade date:', error);
            }
        }
    });
    
    return dailyData;
}

// Refresh calendar function
export function refreshCalendar() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    const data = processTradeData(trades, year, month);
    
    renderCalendar(year, month, data);
}