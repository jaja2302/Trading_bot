const { SMA } = require('technicalindicators');

function calculateMA(values, period) {
  return SMA.calculate({ period: period, values: values });
}

async function runStrategy() {
  const data = await fetchOHLCV();
  const closes = data.map(candle => candle.close);

  // Calculate 50-period and 200-period Moving Averages
  const shortMA = calculateMA(closes, 50);
  const longMA = calculateMA(closes, 200);

  const lastShortMA = shortMA[shortMA.length - 1];
  const lastLongMA = longMA[longMA.length - 1];

  // Buy when shortMA crosses above longMA, sell when it crosses below
  if (lastShortMA > lastLongMA) {
    console.log('Buy Signal!');
    // Add logic to place a buy order
  } else if (lastShortMA < lastLongMA) {
    console.log('Sell Signal!');
    // Add logic to place a sell order
  }
}

runStrategy();
