import { RestClientV5 } from 'bybit-api';
import readline from 'readline';
import { log } from 'util';
import dotenv from 'dotenv';
import { fetchCryptocurrencyListings } from '../utils/analytic/CoinMarketCap/latest_coin';

// Call the function

dotenv.config(); // Load environment variables from .env file

// Define the structure for the API client configuration
interface BybitClientConfig {
  key: string | undefined;
  secret: string | undefined;
  testnet: boolean;
}

// Initialize the API client with the types defined
const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: true,
} as BybitClientConfig);

// Set up readline interface for command-line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to check asset information with defined response type
const checkAsset = (coin: string): void => {
  client
    .getAssetInfo({ accountType: 'FUND', coin })
    .then((response: any) => {
      // Replace `any` with the appropriate type based on the API response
      log(response);
      console.log(`Koin yang anda punya: ${coin}:`, response);
    })
    .catch((error: any) => {
      console.log(error);
      console.error(`Error menerima info koin ${coin}:`, error);
    });
};

// Function to display command options
const showCommands = (): void => {
  console.log('\nPerintah tersedia:');
  console.log(
    'check asset <coin> - Check asset seputar coin anda (e.g., USDC)',
  );
  console.log('check latest - Check Latest Coin');
  console.log('exit - keluar aplikasi');
};

// Main function to handle user input
const main = (): void => {
  showCommands();

  rl.on('line', (input: string) => {
    const [command, ...args] = input.trim().split(' ');

    if (command === 'check' && args[0] === 'asset') {
      const coin = args[1];
      if (coin) {
        checkAsset(coin.toUpperCase()); // Convert coin to uppercase
      } else {
        console.log('Please specify a coin (e.g., USDC).');
      }
    } else if (command === 'check' && args[0] === 'Latest') {
      fetchCryptocurrencyListings().then((data) => {
        if (data) {
          console.log(data);
        }
      });
    } else if (command === 'exit') {
      console.log('Exiting...');
      rl.close();
    } else {
      console.log('Invalid command. Please try again.');
      showCommands();
    }
  });
};

// Start the application
main();
