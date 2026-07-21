import { selectedCapabilities, selectedServer } from "./test/config/android.js";
import { retryPolicy } from "./test/config/retry.js";
import { rmSync } from "node:fs";

export const config = {
  runner: "local",

  ...selectedServer,

  specs: [
    // './test/specs/android/**/*.spec.js',
    // specs: [
    // "./test/specs/wdio/android/dragDrop-lab.spec.js"
    "./test/specs/wdio/android/**/*.spec.js",
    // ],
  ],

  exclude: [],
  maxInstances: 1,
  capabilities: [selectedCapabilities],
  logLevel: "info",
  bail: 0,

  waitforTimeout: 10_000,
  waitforInterval: 1000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  specFileRetries: retryPolicy.specRetries, //Number of additional full-spec executions.
  specFileRetriesDelay: 5, //Wait two seconds before rerunning the failed spec.
  specFileRetriesDeferred: false, //Retry the failed spec immediately instead of putting it at the end of the execution queue.

  framework: "mocha",
  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "./reports/allure-results",
        disableWebdriverStepsReporting: true, //shows findElement,isDisplayed,click,getText etc
        disableWebdriverScreenshotsReporting: false,
        addConsoleLogs: true,
        reportedEnvironmentVars: {
          EXECUTION_TARGET: process.env.EXECUTION_TARGET ?? "local",
          PLATFORM: selectedCapabilities.platformName,
        },
      },
    ],
  ],
  mochaOpts: {
    ui: "bdd",
    timeout: 120_000,
    retries: retryPolicy.testRetries,
  },

  onPrepare() {
    rmSync("./reports/allure-results", {
      recursive: true,
      force: true,
    });
  },

  afterTest: async function (test, context, { passed }) {
    if (passed) {
      return;
    }

    try {
      const currentContext = await browser.getContext();

      if (currentContext !== "NATIVE_APP") {
        await browser.switchContext("NATIVE_APP");
      }

      await browser.takeScreenshot();
    } catch (error) {
      console.warn(`Could not capture failure screenshot: ${error.message}`);
    }
  },
};
