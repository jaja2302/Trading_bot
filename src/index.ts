import { RestClientV5 } from 'bybit-api';
import readline from 'readline';
import { log } from 'util';
import dotenv from 'dotenv';
import { fetchCryptocurrencyListings } from '../utils/analytic/CoinMarketCap/latest_coin';

dotenv.config();

// Initialize the API client
const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: true,
});

// Set up readline interface for command-line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to check asset information
const checkAsset = (coin: any) => {
  client
    .getAssetInfo({ accountType: 'FUND', coin })
    .then((response) => {
      // log(response);
      console.log(`Coin you have: ${coin}:`, response);
    })
    .catch((error) => {
      console.error(`Error fetching coin info for ${coin}:`, error);
    });
};

// Function to evaluate coins' potential based on certain criteria
const evaluateCoinPotential = (coins: any) => {
  // console.log(coins);

  // Check if coins is an array
  if (!Array.isArray(coins)) {
    console.error('Expected an array of coins but received:', coins);
    return []; // Return an empty array or handle it as appropriate
  }

  return coins
    .filter((coin) => coin.circulating_supply) // Ensure circulating supply exists
    .map((coin) => {
      const supplyPercentage = coin.max_supply
        ? (coin.circulating_supply / coin.max_supply) * 100
        : null; // Calculate supply percentage only if max supply is available

      // Safely access USD quote
      const volume_24h = coin.quote?.USD?.volume_24h || 0;

      return {
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.cmc_rank,
        volume_24h, // Safe access of volume_24h
        supplyPercentage,
        marketPairs: coin.num_market_pairs,
      };
    })
    .sort((a, b) => a.rank - b.rank) // Sort by rank (lower is better)
    .slice(0, 5); // Return the top 5 coins
};

// Function to display command options
const showCommands = () => {
  console.log('\nAvailable commands:');
  console.log('check asset <coin> - Check asset info for a coin (e.g., USDC)');
  console.log('check potential - Evaluate potential of the latest coins');
  console.log('exit - Exit the application');
};

// Main function to handle user input
const main = () => {
  showCommands();

  rl.on('line', async (input) => {
    const [command, ...args] = input.trim().split(' ');

    if (command === 'check' && args[0]?.toLowerCase() === 'asset') {
      const coin = args[1];
      if (coin) {
        checkAsset(coin.toUpperCase()); // Convert coin to uppercase
      } else {
        console.log('Please specify a coin (e.g., USDC).');
      }
    } else if (command === 'check' && args[0]?.toLowerCase() === 'potential') {
      try {
        const latestCoins = await fetchCryptocurrencyListings();
        const coinsData = (latestCoins as any)?.data?.data || []; // Access the coins array with `any`

        // Check if coinsData is an array
        const topCoins = evaluateCoinPotential(coinsData); // Pass the correct array
        console.log('Top 5 coins based on potential:', topCoins);
      } catch (error) {
        console.error('Error evaluating coin potential:', error);
      }
    } else if (command === 'exit') {
      rl.close();
    } else {
      console.log('Unknown command.');
    }
  });
};

main();
