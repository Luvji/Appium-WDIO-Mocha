import { selectedCapabilities, selectedServer } from "./test/config/android.js";
import { retryPolicy } from "./test/config/retry.js";

export const config = {
  runner: "local",

  ...selectedServer,

  specs: [
    // './test/specs/android/**/*.spec.js',
    // specs: [
    // "./test/specs/wdio/android/authentication-lab.spec.js"
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
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 120_000,
    retries: retryPolicy.testRetries,
  },
};
