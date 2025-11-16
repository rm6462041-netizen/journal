// api-import.js - Simple Working Version with Mock Data

const BROKER_CONFIG = {
    'binance': { name: 'Binance', type: 'crypto' }
};

// Simple API Simulation
class BinanceAPISimulator {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.isConnected = false;
    }

    async testConnection() {
        // Simulate API connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (this.apiKey && this.apiSecret) {
            this.isConnected = true;
            return { success: true, message: '✅ Binance connected successfully' };
        } else {
            return { success: false, message: '❌ Invalid API credentials' };
        }
    }

    async getTradeHistory(limit = 50) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Realistic mock trades
        return this.generateMockTrades(limit);
    }

    generateMockTrades(limit) {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'BNBUSDT'];
        const trades = [];
        
        for (let i = 0; i < limit; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const isBuy = Math.random() > 0.5;
            const quantity = (Math.random() * 2 + 0.1).toFixed(4);
            const price = (Math.random() * 50000 + 1000).toFixed(2);
            const commission = (Math.random() * 5).toFixed(4);
            
            trades.push({
                id: Date.now() + i,
                symbol: symbol,
                isBuyer: isBuy,
                qty: quantity,
                price: price,
                quoteQty: (quantity * price).toFixed(2),
                commission: commission,
                commissionAsset: 'USDT',
                time: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 // Random time in last 30 days
            });
        }
        
        return trades.sort((a, b) => b.time - a.time);
    }

    formatTrades(binanceTrades) {
        return binanceTrades.map(trade => ({
            method: 'api',
            broker: 'binance',
            symbol: trade.symbol,
            tradeType: trade.isBuyer ? 'buy' : 'sell',
            category: 'crypto',
            quantity: parseFloat(trade.qty),
            entryPrice: parseFloat(trade.price),
            exitPrice: parseFloat(trade.price),
            investment: parseFloat(trade.quoteQty),
            pnl: this.calculateTradePnL(trade),
            tradeDate: new Date(trade.time).toISOString().split('T')[0],
            tradeTime: new Date(trade.time).toTimeString().substring(0, 5),
            strategy: 'Binance Import',
            notes: `Imported from Binance | Commission: ${trade.commission} ${trade.commissionAsset}`,
            timestamp: new Date().toISOString(),
            apiImported: true,
            binanceTradeId: trade.id
        }));
    }

    calculateTradePnL(trade) {
        const quantity = parseFloat(trade.qty);
        const price = parseFloat(trade.price);
        const commission = parseFloat(trade.commission);
        
        if (trade.isBuyer) {
            return -commission;
        } else {
            // Simulate profit/loss
            const profit = (Math.random() * 100 - 20).toFixed(2);
            return parseFloat(profit);
        }
    }
}

// Global instance
window.binanceAPI = null;

// Initialize API
async function initializeBinanceAPI(apiKey, apiSecret) {
    window.binanceAPI = new BinanceAPISimulator(apiKey, apiSecret);
    const result = await window.binanceAPI.testConnection();
    return result.success;
}

// Get trade history
async function getBinanceTradeHistory(limit = 50) {
    if (!window.binanceAPI) {
        throw new Error('API not connected');
    }
    const trades = await window.binanceAPI.getTradeHistory(limit);
    return window.binanceAPI.formatTrades(trades);
}

// API Connection
async function connectAPI() {
    const broker = document.getElementById('brokerSelect').value;
    const apiKey = document.getElementById('apiKey').value.trim();
    const apiSecret = document.getElementById('apiSecret').value.trim();
    
    if (!broker || !apiKey || !apiSecret) {
        alert('Please enter both API Key and Secret!');
        return;
    }
    
    try {
        updateAPIStatus('connecting', broker);
        
        const success = await initializeBinanceAPI(apiKey, apiSecret);
        
        if (success) {
            updateAPIStatus('connected', broker);
            document.getElementById('importBtn').disabled = false;
            showNotification('✅ Binance connected successfully!', 'success');
        } else {
            throw new Error('Connection failed');
        }
        
    } catch (error) {
        updateAPIStatus('disconnected', broker);
        showNotification('❌ Connection failed. Using demo mode.', 'error');
    }
}

// Import Trades
async function importTrades() {
    const tradeLimit = parseInt(document.getElementById('tradeLimit').value) || 50;
    
    try {
        document.getElementById('importBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
        document.getElementById('importBtn').disabled = true;
        
        const importedTrades = await getBinanceTradeHistory(tradeLimit);
        saveImportedTrades(importedTrades);
        showImportResults(importedTrades);
        
        document.getElementById('importBtn').innerHTML = '<i class="fas fa-download"></i> Import Trades';
        document.getElementById('importBtn').disabled = false;
        
        showNotification(`✅ Successfully imported ${importedTrades.length} trades!`, 'success');
        
    } catch (error) {
        document.getElementById('importBtn').innerHTML = '<i class="fas fa-download"></i> Import Trades';
        document.getElementById('importBtn').disabled = false;
        showNotification(`❌ Import failed: ${error.message}`, 'error');
    }
}

// Helper functions
function saveImportedTrades(trades) {
    let existingTrades = JSON.parse(localStorage.getItem('trades')) || [];
    const allTrades = [...existingTrades, ...trades];
    const uniqueTrades = allTrades.filter((trade, index, self) => 
        index === self.findIndex(t => t.binanceTradeId === trade.binanceTradeId)
    );
    localStorage.setItem('trades', JSON.stringify(uniqueTrades));
    return uniqueTrades.length - existingTrades.length;
}

function showImportResults(trades) {
    const resultsContent = document.getElementById('resultsContent');
    const newTradesCount = saveImportedTrades(trades);
    
    resultsContent.innerHTML = `
        <div style="color: #333;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span><strong>Trades Generated:</strong></span>
                <span style="color: #667eea; font-weight: bold;">${trades.length} trades</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span><strong>New Trades Added:</strong></span>
                <span style="color: #10b981; font-weight: bold;">${newTradesCount} trades</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <span><strong>Total P&L:</strong></span>
                <span style="color: ${trades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">
                    $${trades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)}
                </span>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Sample Trades:</div>
                ${trades.slice(0, 5).map(trade => `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e1e5e9; font-size: 12px;">
                        <span>${trade.symbol} ${trade.tradeType.toUpperCase()}</span>
                        <span style="color: ${trade.pnl >= 0 ? '#10b981' : '#ef4444'}">
                            $${trade.pnl.toFixed(2)}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('importResults').style.display = 'block';
}

function updateAPIStatus(status, broker) {
    const statusElement = document.querySelector('.api-status');
    
    switch(status) {
        case 'connecting':
            statusElement.innerHTML = `
                <i class="fas fa-sync fa-spin status-icon" style="color: #f59e0b;"></i>
                <span>Connecting to Binance...</span>
            `;
            break;
        case 'connected':
            statusElement.innerHTML = `
                <i class="fas fa-circle status-icon status-connected"></i>
                <span>Connected to Binance</span>
            `;
            break;
        case 'disconnected':
            statusElement.innerHTML = `
                <i class="fas fa-circle status-icon status-disconnected"></i>
                <span>Not Connected</span>
            `;
            break;
    }
}

function showNotification(message, type) {
    alert(message);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Binance API Simulator loaded');
});