async function placeOrder(symbol, side, amount) {
    try {
      const order = await binance.createMarketOrder(symbol, side, amount);
      console.log(`Order placed: ${side} ${amount} ${symbol}`);
      console.log(order);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  }
  
  async function runStrategy() {
    const data = await fetchOHLCV();
    const closes = data.map(candle => candle.close);
  
    // Calculate 50-period and 200-period Moving Averages
    const shortMA = calculateMA(closes, 50);
    const longMA = calculateMA(closes, 200);
  
    const lastShortMA = shortMA[shortMA.length - 1];
    const lastLongMA = longMA[longMA.length - 1];
  
    const symbol = 'BTC/USDT';
    const tradeAmount = 0.001;  // Example trade amount
  
    if (lastShortMA > lastLongMA) {
      console.log('Buy Signal!');
      await placeOrder(symbol, 'buy', tradeAmount);
    } else if (lastShortMA < lastLongMA) {
      console.log('Sell Signal!');
      await placeOrder(symbol, 'sell', tradeAmount);
    }
  }
  
  runStrategy();
  