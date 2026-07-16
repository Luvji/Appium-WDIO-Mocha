import {
  selectedCapabilities,
  selectedServer,
} from './test/config/android.js';

export const config = {
  runner: 'local',

  ...selectedServer,

  specs: [
    './test/specs/android/**/*.spec.js',
  ],

  exclude: [],

  maxInstances: 1,

  capabilities: [
    selectedCapabilities,
  ],

  logLevel: 'info',

  bail: 0,

  waitforTimeout: 10_000,

  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  framework: 'mocha',

  reporters: [
    'spec',
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120_000,
  },
};