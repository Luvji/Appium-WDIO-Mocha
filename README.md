# Appium + Mocha: minimal Android setup

This project deliberately starts with Android's built-in **Settings** app. You do
not need an APK yet, so each failure belongs to the automation setup rather than
to app installation.

## 1. Understand the layers

The command travels through these layers:

```text
Mocha test
  -> WebdriverIO client
    -> Appium server
      -> UiAutomator2 driver
        -> Android emulator/device
          -> Settings app
```

- **Mocha** discovers tests and supplies `describe`, `it`, setup, teardown, and
  timeouts. It does not control phones.
- **WebdriverIO** is the JavaScript WebDriver client. Calls such as `$()` are
  translated into WebDriver HTTP requests.
- **Appium** is the server and common protocol layer. It accepts those requests
  and routes them to a platform driver.
- **UiAutomator2** is the Android-specific Appium driver. It translates generic
  Appium commands into Android automation actions.
- **Capabilities** describe the session you want: platform, driver, device, and
  app. They are data, not test steps.

Keeping these layers separate helps diagnose failures: Mocha assertion failures,
client/server connection failures, driver failures, and device failures each
point to a different layer.

## 2. Install the JavaScript dependencies

Requires Node.js 20.19 or newer (this project uses Appium 3).

```bash
npm install
```

Why: `package.json` records the tools and `package-lock.json` pins the complete
dependency tree, so another machine can reproduce it with `npm ci`.

## 3. Install the Android platform driver

```bash
npm run driver:android:install
npm run driver:list
npm run doctor:android
```

Why: Appium's server is platform-neutral; UiAutomator2 is installed separately.
This project uses `.appium/` as a local Appium home so drivers do not depend on a
user's global setup. The doctor command checks Android SDK and Java prerequisites.

## 4. Start a device

Create and boot an Android Virtual Device in Android Studio, or connect a physical
device with USB debugging enabled. Verify it before involving Appium:

```bash
adb devices -l
```

You need exactly one line whose state is `device`. `offline` means it has not
finished connecting; `unauthorized` means the physical phone still needs approval.

## 5. Start Appium

In terminal 1:

```bash
npm run appium
```

Leave it running. Appium listens on `http://127.0.0.1:4723` by default. Keeping
the server in its own terminal makes its request and driver logs visible.

## 6. Run the test

In terminal 2:

```bash
npm run test:android
```

The test creates a session in `before`, verifies both the active Android package
and a visible UI element, then closes the session in `after`. Teardown matters:
abandoned sessions consume server/device resources and make later tests confusing.

The first useful test has two checks on purpose:

1. `getCurrentPackage()` checks application state without relying on the screen.
2. The `UiSelector` checks something a user can see.

The selector assumes an English-language emulator. On another language, replace
`Settings` with the displayed localized title. In your own app, prefer stable
accessibility IDs over visible text because text is more likely to change.

## Configuration without editing the test

The defaults work when one emulator is attached. Environment variables let the
same test target another device or Appium server:

```bash
ANDROID_UDID=emulator-5554 npm run test:android
```

Available variables are `ANDROID_UDID`, `ANDROID_DEVICE_NAME`,
`ANDROID_PLATFORM_VERSION`, `APPIUM_HOST`, `APPIUM_PORT`, `APPIUM_PROTOCOL`, and
`APPIUM_PATH`. Avoid specifying optional capabilities until you need them: every
extra constraint is another way session creation can fail.

## What each file owns

```text
package.json                         commands and tool versions
test/config/android.js               server address and Android capabilities
test/pages/base.page.js              small reusable UI interaction helpers
test/pages/*.page.js                 selectors and actions for one screen
test/support/session.js              WebDriver session creation and cleanup
test/specs/android/settings.spec.js  behavior and assertions
.appium/                             local installed drivers (generated)
```

The configuration is outside the spec so future specs reuse one session recipe.
The spec still owns its session lifecycle, which keeps this first setup explicit.

## Moving to your own APK

Replace `appium:appPackage` and `appium:appActivity` with an `appium:app` path:

```js
'appium:app': '/absolute/path/to/app-debug.apk',
```

Appium then installs the build when creating the session. Later, put this value in
an environment variable or CI secret/config rather than committing a machine-
specific absolute path.

## How iOS fits later

The test runner and WebdriverIO client stay the same. Add an iOS config using:

```js
platformName: 'iOS',
'appium:automationName': 'XCUITest'
```

Then install Appium's XCUITest driver. iOS execution requires macOS, Xcode, and an
iOS Simulator; real devices also require Apple signing. Keep Android and iOS
capabilities separate, while sharing page objects and behavioral tests once your
app exposes the same accessibility IDs on both platforms.

Do not abstract both platforms on day one. First make one Android test reliable;
extract shared helpers only after a second test reveals actual repetition.

## Page Object Model used here

The page-object boundary is intentionally strict:

- A **page object** owns selectors and user actions such as `login()`.
- A **spec** owns the scenario, test data, and assertions.
- The **session helper** owns connection and cleanup mechanics.
- The **configuration** owns which app and device Appium should start.

This keeps selectors out of specs without turning page objects into a second test
framework. Do not put `describe`, `it`, or assertions inside a page class.

The login example is skipped until a real application is configured. Start an
installed app with:

```bash
ANDROID_APP_PACKAGE=com.example.app \
ANDROID_APP_ACTIVITY=.MainActivity \
npm run test:android
```

Or ask Appium to install an APK:

```bash
ANDROID_APP=/absolute/path/to/app-debug.apk npm run test:android
```

The selectors in `login.page.js` are example accessibility IDs. Replace them with
the IDs exposed by your application.

The app-under-test capabilities use `noReset: false` and `forceAppLaunch: true`.
On Android this stops the app, clears its local data, and launches its configured
activity for each new session. This makes a logged-out login screen the expected
starting state. If your clean install first displays onboarding or permissions,
handle those screens in the suite setup before waiting for the login page.
