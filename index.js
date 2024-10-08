import { RestClientV5 } from 'bybit-api';
import readline from 'readline';
import { log } from 'util';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,  // Use the API key from .env
  secret: process.env.BYBIT_API_SECRET,  // Use the secret from .env
  testnet: true,  // Explicitly set to false for mainnet
});

// Set up readline interface for command-line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to check asset information
const checkAsset = (coin) => {
  client
    .getAssetInfo({ accountType: 'FUND', coin })
    .then((response) => {
      log(response)
      console.log(`Koin yang anda punya: ${coin}:, response)`);
    })
    .catch((error) => {
      console.log(error);
      
      console.error(`Error menerima info koin ${coin}:, error)`);
    });
};

// Function to display command options
const showCommands = () => {
  console.log("\nPerintah tersedia:");
  console.log("1. check asset <coin> - Check asset seputar coin anda (e.g., USDC)");
  console.log("2. exit - keluar aplikasi");
};

// Main function to handle user input
const main = () => {
  showCommands();

  rl.on('line', (input) => {
    const [command, ...args] = input.trim().split(' ');

    if (command === 'check' && args[0] === 'asset') {
      const coin = args[1];
      if (coin) {
        checkAsset(coin.toUpperCase()); // Convert coin to uppercase
      } else {
        console.log("Please specify a coin (e.g., USDC).");
      }
    } else if (command === 'exit') {
      console.log("Exiting...");
      rl.close();
    } else {
      console.log("Invalid command. Please try again.");
      showCommands();
    }
  });
};

// Start the application
main();