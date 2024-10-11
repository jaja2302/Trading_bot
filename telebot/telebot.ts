import puppeteer from 'puppeteer';
import fs from 'fs';

const SESSION_FILE_PATH = './telegram_session.json';

async function saveSession(page: puppeteer.Page) {
  const cookies = await page.cookies();
  const localStorageData = await page.evaluate(() => {
    const data: { [key: string]: string } = {};
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

async function loadSession(page: puppeteer.Page) {
  if (fs.existsSync(SESSION_FILE_PATH)) {
    const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf-8'));

    await page.setCookie(...sessionData.cookies);

    await page.evaluateOnNewDocument((session: any) => {
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
// Delay function for waiting
function delay(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginAndClaimReward() {
  // Launch Chrome with notifications disabled
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want to run in headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-notifications', // This disables notification prompts
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

  // Wait for the specific text "What can this bot do?" to show up
  console.log('Waiting for the bot information text to appear...');
  await page.waitForSelector('div.lbMO1XqP > p.ELYpyMpR', {
    visible: true,
    timeout: 60000, // Wait up to 60 seconds for the element
  });

  console.log(
    'Bot information text appeared, now searching for the "Start" button.',
  );

  // Try clicking the "Start" button up to 3 times
  let modalAppeared = false;
  let clickCount = 0;

  while (clickCount < 3 && !modalAppeared) {
    console.log(
      `Attempting to click "Start" button (Attempt ${clickCount + 1})`,
    );

    // Use a more specific selector for the "Start" button
    const startButtonSelector =
      'button.bot-menu.open.default.translucent.round span.bot-menu-text';

    try {
      // Wait for the "Start" button to be visible
      await page.waitForSelector(startButtonSelector, {
        visible: true,
        timeout: 5000,
      });
      // Click the "Start" button
      await page.click(startButtonSelector);
      console.log(`Clicked the "Start" button (Attempt ${clickCount + 1}).`);

      // Adding a short delay after the click
      await delay(2000); // Wait for 2 seconds before checking for the modal

      // Check if the modal appeared
      try {
        await page.waitForSelector('.modal-content.custom-scroll', {
          visible: true,
          timeout: 5000,
        });
        console.log('Modal appeared!');
        modalAppeared = true;
      } catch (error) {
        console.log('Modal did not appear, trying again...');
      }
    } catch (error) {
      console.log(
        `Could not find the "Start" button (Attempt ${clickCount + 1}).`,
      );
    }

    clickCount++;
    await delay(2000); // Wait for 2 seconds before trying again
  }

  if (modalAppeared) {
    // Try clicking the "Confirm" button up to 3 times
    let confirmClicked = false;
    let confirmAttemptCount = 0;

    while (confirmAttemptCount < 3 && !confirmClicked) {
      console.log(
        `Attempting to click "Confirm" button (Attempt ${confirmAttemptCount + 1})`,
      );

      // Use the selector for the "Confirm" button
      const confirmButtonSelector =
        'button.confirm-dialog-button.default.primary.text';

      try {
        // Wait for the "Confirm" button to be visible
        await page.waitForSelector(confirmButtonSelector, {
          visible: true,
          timeout: 5000,
        });
        // Click the "Confirm" button
        await page.click(confirmButtonSelector);
        console.log(
          `Clicked the "Confirm" button (Attempt ${confirmAttemptCount + 1}).`,
        );

        // Adding a short delay after the click
        await delay(2000); // Wait for 2 seconds before checking the next attempt

        confirmClicked = true; // Successfully clicked
      } catch (error) {
        console.log(
          `Could not find the "Confirm" button (Attempt ${confirmAttemptCount + 1}).`,
        );
      }

      confirmAttemptCount++;
      await delay(2000); // Wait for 2 seconds before trying again
    }

    if (confirmClicked) {
      console.log('Successfully clicked the "Confirm" button.');

      try {
        // Wait for the iframe to load
        const iframeSelector = 'iframe.OmY14FFl'; // Adjust this selector as necessary
        await page.waitForSelector(iframeSelector, {
          visible: true,
          timeout: 10000,
        });

        // Get the iframe element
        const frameHandle = await page.$(iframeSelector);

        // Get the content frame
        const frame = await frameHandle.contentFrame();

        // Log frame detection
        console.log('Iframe detected successfully.');

        // Wait for the modal to appear within the iframe context
        const modalSelector = 'div._button_container_1drph_81';

        try {
          await frame.waitForSelector(modalSelector, {
            visible: true,
            timeout: 10000,
          });

          // Log the inner HTML of the modal for debugging
          const modalContent = await frame.$eval(
            modalSelector,
            (modal) => modal.innerHTML,
          );
          console.log('Modal content:', modalContent);
        } catch (modalError) {
          console.log(
            'Modal did not appear within the timeout period:',
            modalError.message,
          );
          return; // Exit the function early if the modal is not found
        }

        // Now check for the button
        const buttonSelector = 'button._button_1drph_81';
        let goButtonAttemptCount = 0;
        let goButtonClicked = false;

        while (goButtonAttemptCount < 3 && !goButtonClicked) {
          console.log(
            `Attempting to click "Let’s Gooooooo!" button (Attempt ${goButtonAttemptCount + 1})`,
          );

          try {
            // Wait for the button to appear and be visible
            await frame.waitForSelector(buttonSelector, {
              visible: true,
              timeout: 5000,
            });

            const button = await frame.$(buttonSelector); // Get the button

            if (button) {
              await button.click();
              console.log(
                `Clicked the "Let’s Gooooooo!" button (Attempt ${goButtonAttemptCount + 1}).`,
              );
              goButtonClicked = true; // Successfully clicked
            } else {
              throw new Error('Button not found');
            }
          } catch (error) {
            console.log(
              `Could not find the "Let’s Gooooooo!" button (Attempt ${goButtonAttemptCount + 1}). Error: ${error.message}`,
            );
          }

          goButtonAttemptCount++;
          await delay(2000); // Wait for 2 seconds before trying again
        }

        if (goButtonClicked) {
          console.log('Successfully clicked the "Let’s Gooooooo!" button.');
        } else {
          console.log(
            'Failed to click the "Let’s Gooooooo!" button after 3 attempts.',
          );
        }
      } catch (error) {
        console.log('Error while trying to click the button:', error);
      }
    } else {
      console.log('Failed to click the "Confirm" button after 3 attempts.');
    }
  } else {
    console.log('The modal did not appear after 3 attempts.');
  }

  // Close the browser (optional)
  // await browser.close();
}

// Start the bot
loginAndClaimReward().catch(console.error);
