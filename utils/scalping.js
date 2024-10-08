const performScalping = async (coin, interval) => {
    try {
      // Fetch the latest market data (candlestick)
      const klineData = await client.getKline({
        category: 'spot',
        symbol: coin,
        interval: interval,
        limit: 5,  // Get the last 5 intervals
      });
  
      const closingPrices = klineData.result.map((kline) => parseFloat(kline.close));
      
      // Example: Simple moving average for a basic scalping strategy
      const sma = closingPrices.reduce((sum, price) => sum + price, 0) / closingPrices.length;
  
      const latestPrice = closingPrices[closingPrices.length - 1];
  
      if (latestPrice > sma) {
        console.log(`Uptrend detected, placing BUY order for ${coin}`);
        // Call API to place a BUY order
        await client.createOrder({
          category: 'spot',
          symbol: coin,
          side: 'Buy',
          orderType: 'Market',
          qty: '0.01',  // Example amount
        });
      } else {
        console.log(`Downtrend detected, placing SELL order for ${coin}`);
        // Call API to place a SELL order
        await client.createOrder({
          category: 'spot',
          symbol: coin,
          side: 'Sell',
          orderType: 'Market',
          qty: '0.01',  // Example amount
        });
      }
    } catch (error) {
      console.error(`Error performing scalping on ${coin}:`, error);
    }
  };
  
  export performScalping