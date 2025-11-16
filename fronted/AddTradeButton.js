// AddTradeButton.js - Updated with proper imports

export function handleAddTrade(event) {
    event.preventDefault();
    console.log('Add Trade clicked! Redirecting to trade page...');
    
    // Simple redirect to add-trade page
    window.location.href = 'add-trade.html';
}
// In your AddTradeButton.js, after saving the trade, add:
if (window.refreshCalendar) {
    window.refreshCalendar();
}