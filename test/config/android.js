import { requiredEnvironmentVariable } from "./environment.js";

const optionalCapability = (name, capabilityName) => (process.env[name] ? { [capabilityName]: process.env[name] } : {});

const executionTarget = process.env.EXECUTION_TARGET ?? "local";

const supportedTargets = ["local", "lambdatest"];

if (!supportedTargets.includes(executionTarget)) {
  throw new Error(`Unsupported EXECUTION_TARGET: ${executionTarget}`);
}
const isLambdaTest = executionTarget === "lambdatest";

export const server = {
  protocol: process.env.APPIUM_PROTOCOL ?? "http",
  hostname: process.env.APPIUM_HOST ?? "127.0.0.1",
  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: process.env.APPIUM_PATH ?? "/",
};

const commonCapabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": process.env.ANDROID_DEVICE_NAME ?? "Android Emulator",
  ...optionalCapability("ANDROID_UDID", "appium:udid"),
  ...optionalCapability("ANDROID_PLATFORM_VERSION", "appium:platformVersion"),
};

function createLocalCapabilities() {
  return {
    ...commonCapabilities,

    "appium:appPackage": requiredEnvironmentVariable("ANDROID_APP_PACKAGE"),

    "appium:appActivity": requiredEnvironmentVariable("ANDROID_APP_ACTIVITY"),

    "appium:noReset": false,
    "appium:forceAppLaunch": true,
    "appium:shouldTerminateApp": true,

    "appium:appWaitActivity": process.env.ANDROID_APP_WAIT_ACTIVITY ?? "*",
  };
}

function createLambdaTestServer() {
  return {
    protocol: "https",
    hostname: "mobile-hub.lambdatest.com",
    port: 443,
    path: "/wd/hub",

    user: requiredEnvironmentVariable("LT_USERNAME"),

    key: requiredEnvironmentVariable("LT_ACCESS_KEY"),
  };
}

function createLambdaTestCapabilities() {
  return {
    platformName: "Android",

    "appium:automationName": "UiAutomator2",

    "lt:options": {
      w3c: true,

      deviceName: requiredEnvironmentVariable("LT_DEVICE_NAME"),

      platformVersion: requiredEnvironmentVariable("LT_PLATFORM_VERSION"),

      app: requiredEnvironmentVariable("LT_APP_ID"),

      isRealMobile: true,

      build: process.env.LT_BUILD_NAME ?? "Appium Playground",

      name: "Android smoke test",

      video: true,
      visual: true,
      devicelog: true,
      autoGrantPermissions: true,
    },
  };
}

export const selectedServer = isLambdaTest ? createLambdaTestServer() : server;

export const selectedCapabilities = isLambdaTest ? createLambdaTestCapabilities() : createLocalCapabilities();
