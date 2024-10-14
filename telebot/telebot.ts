import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SESSION_FILE_PATH = './telegram_session.json';

async function saveSession(page) {
  const cookies = await page.cookies();
  const localStorageData = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    return data;
  });

  const sessionData = {
    cookies: cookies,
    localStorage: localStorageData,
  };
  fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessionData));
  console.log('Session has been saved.');
}

async function loadSession(page) {
  if (fs.existsSync(SESSION_FILE_PATH)) {
    const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf-8'));

    await page.setCookie(...sessionData.cookies);

    await page.evaluateOnNewDocument((session) => {
      localStorage.clear();
      for (const key in session) {
        localStorage.setItem(key, session[key]);
      }
    }, sessionData.localStorage);

    console.log('Session has been loaded.');
    return true;
  }
  return false;
}
async function tryClickButton(page, selector, buttonName, maxAttempts = 3) {
  let clickCount = 0;
  let clicked = false;

  while (clickCount < maxAttempts && !clicked) {
    try {
      // Wait for the button to be visible
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      // Click the button
      await page.click(selector);
      console.log(`Clicked the ${buttonName} button (Attempt ${clickCount + 1}).`);
      clicked = true;
    } catch (error) {
      console.log(`Could not find the ${buttonName} button (Attempt ${clickCount + 1}).`);
    }
    clickCount++;
    await delay(2000); // Wait for 2 seconds before retrying
  }

  if (!clicked) {
    console.log(`Failed to click the ${buttonName} button after ${maxAttempts} attempts.`);
  }
}

async function loginAndClaimReward() {
  // Launch Chrome with notifications disabled
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want to run in headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-notifications', // Disable notification prompts
    ],
  });
  const page = await browser.newPage();

  const sessionLoaded = await loadSession(page);

  if (!sessionLoaded) {
    await page.goto('https://web.telegram.org/');
    console.log('Please log in manually...');
    await delay(5000); // 5 seconds for manual login
    await saveSession(page);
  }

  // Go to the specific Telegram channel or conversation
  const specificUrl = 'https://web.telegram.org/a/#7249432100'; // Replace with the specific link
  await page.goto(specificUrl);

  // Wait for the specific bot information text to appear
  console.log('Waiting for the bot information text to appear...');
  await page.waitForSelector('div.lbMO1XqP > p.ELYpyMpR', {
    visible: true,
    timeout: 60000, // Wait up to 60 seconds for the element
  });

  console.log('Bot information text appeared, now searching for the "Start" button.');

  // Try clicking the "Start" button
  const startButtonSelector = 'button.bot-menu.open.default.translucent.round span.bot-menu-text';
  await tryClickButton(page, startButtonSelector, '"Start"');

  // Try clicking the "Confirm" button
  const confirmButtonSelector = 'button.confirm-dialog-button.default.primary.text';
  await tryClickButton(page, confirmButtonSelector, '"Confirm"');

  // Handling iframe and the "Let’s Gooooooo!" button
  const iframeSelector = 'iframe.OmY14FFl'; // Adjust this selector as necessary
  delay(2000)
  const frameHandle = await page.$(iframeSelector);
  if (!frameHandle) {
    console.log('Iframe not found. Exiting...');
    return;
  }
  const frame = await frameHandle.contentFrame();
  
  console.log('Iframe detected successfully.');

  // Wait for the modal selector after getting the frame
  await delay(3000); // Wait for 3 seconds after getting the frame

  // Check for the modal in iframe
  const modalSelector = 'div._button_container_1drph_81';
  await frame.waitForSelector(modalSelector, {
      visible: true,
      timeout: 30000, // Increase to 30 seconds
  });

  // Now click the "Let’s Gooooooo!" button
  const goButtonSelector = 'button._button_1drph_81';
  await tryClickButton(frame, goButtonSelector, '"Let’s Gooooooo!"', 3);
  const buttonSelector = 'button._button_hqiqj_147';
   // Coordinates to click
   const x = 221;
   const y = 225;

   // Simulate a click at the specified coordinates in the iframe
  await frame.click('body', { offset: { x, y } });

  await checkAndClickPaintButton(frame);
}
async function checkAndClickPaintButton(frame) {
  const buttonSelector = 'button._button_hqiqj_147';
  const checkInterval = 540000; // Check every 9 minutes (9 * 60 * 1000 ms)
  const clickDelay = 2000; // Delay between clicks (2 seconds)
  
  // Function to get the value from the button
  async function getValue() {
      try {
          // Select the counter element
          const counterElement = await frame.$('div._counter_oxfjd_32');

          if (!counterElement) {
              console.log(`Counter element not found.`);
              return 0; // Return 0 if the element is not found
          }

          // Get the value text from the second span inside the counter
          const valueText = await counterElement.$eval('span:nth-of-type(2)', el => el.textContent.trim());
          
          const value = parseInt(valueText, 10) || 0; // Convert to integer, defaulting to 0 if NaN
          console.log(`Current value: ${value}`); // Log the current value for debugging
          return value;
      } catch (error) {
          console.error(`Error retrieving value: ${error.message}`);
          return 0; // Return 0 in case of any error
      }
  }

  while (true) {
      const value = await getValue();
      console.log(`Current value: ${value}`);

      if (value > 0) {
          console.log('Clicking the Paint button...');
          await frame.click(buttonSelector); // Click the button
          await delay(clickDelay); // Wait for 2 seconds before the next click
      } 
      
      if (value === 0) {
          console.log('Value is 0, waiting for 9 minutes to check again...');
          await delay(checkInterval); // Wait dfor 9 minutes
      }
  }
}

// Utility function to introduce a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let claimTimeout = 0;

const promptUser = () => {
  rl.question('1. Run bot\n2. Set timeout (minutes)\n3. Check coin balance\nChoose an option: ', async (option) => {
    switch (option) {
      case '1':
        if (claimTimeout > 0) {
          console.log(`Claiming rewards every ${claimTimeout} minutes...`);
          // Run the bot repeatedly based on the timeout
          while (true) {
            await loginAndClaimReward(claimTimeout * 60 * 1000);
            await delay(claimTimeout * 60 * 1000); // Wait for the next run
          }
        } else {
          await loginAndClaimReward();
        }
        break;

      case '2':
        rl.question('Set timeout for claim (in minutes): ', (minutes) => {
          claimTimeout = parseInt(minutes, 10);
          console.log(`Timeout set to ${claimTimeout} minutes.`);
          promptUser(); // Prompt again
        });
        break;

      case '3':
        // Replace with actual implementation for checking balance
        console.log('Checking coin balance... (implement this)');
        promptUser(); // Prompt again
        break;

      default:
        console.log('Invalid option. Please choose again.');
        promptUser(); // Prompt again
        break;
    }
  });
};

promptUser();
