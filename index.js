const ccxt = require('ccxt');

// Configure Binance testnet API
const binance = new ccxt.binance({
  apiKey: ENV.apikey,
  secret: ENV.secret,
  enableRateLimit: true,
});

// Enable testnet/sandbox mode
binance.setSandboxMode(true);

// Fetch demo balance
async function fetchBalance() {
  try {
    const balance = await binance.fetchBalance();
    console.log('Balance:', balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

fetchBalance();
