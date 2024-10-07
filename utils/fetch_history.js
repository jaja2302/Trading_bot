async function fetchOHLCV() {
    const symbol = 'BTC/USDT';  // Trading pair
    const timeframe = '1h';  // 1-hour candles
    const limit = 100;  // Number of candles to fetch
  
    try {
      const ohlcv = await binance.fetchOHLCV(symbol, timeframe, undefined, limit);
      return ohlcv.map(candle => ({
        timestamp: new Date(candle[0]),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5]
      }));
    } catch (error) {
      console.error('Error fetching OHLCV:', error);
    }
  }

  module.exports =[
    fetchOHLCV
  ]