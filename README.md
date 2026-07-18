# Appium Playground automation

This project is a learning-oriented mobile automation framework for Android,
using Appium, WebdriverIO, and Mocha. It currently supports:

- Local Android emulators through a project-local Appium server
- LambdaTest Android devices
- Page objects, flows, and feature-scoped test data
- Direct Mocha execution with standalone WebdriverIO
- An incremental migration to the WDIO runner

iOS support is planned. Shared test data, flows, and accessibility identifiers
should remain platform-neutral so that adding XCUITest does not require a
framework redesign.

## Architecture

### Current standalone suite

```text
Mocha runner
  -> test hooks call WebdriverIO remote()
    -> local Appium or LambdaTest
      -> UiAutomator2
        -> Android app
```

Mocha discovers specs and runs `describe`, `it`, and hooks. The project session
helper creates and deletes WebDriver sessions. WebdriverIO acts as the client
that converts page-object commands into WebDriver requests.

Run this architecture with:

```bash
npm run test:android
```

### WDIO migration smoke suite

```text
WDIO runner
  -> creates a worker and Appium session
    -> starts Mocha inside the worker
      -> Mocha runs the spec
        -> page objects use WDIO's managed browser/driver
```

WDIO owns session and worker orchestration, while Mocha remains the test
framework. The current migration smoke test runs with:

```bash
npm run test:android:wdio
```

The standalone command remains available until all specs have migrated.

## Responsibilities

```text
test/config/       environment, execution target, servers, and capabilities
test/data/         fixed feature inputs and expected UI values
test/factories/    fresh generated entities, when future tests require them
test/pages/        selectors and operations for one screen
test/flows/        multi-page business or state transitions
test/specs/        scenarios and assertions
test/support/      standalone session lifecycle helpers
wdio.android.conf.js
                   WDIO runner and Mocha adapter configuration
```

The main boundaries are:

- Page objects return application state and perform screen actions.
- Flows coordinate multiple pages, such as login followed by dashboard loading.
- Specs own assertions and decide which test data is correct.
- Static data modules must not contain selectors, driver objects, or mutable
  runtime state.
- Secrets and environment-specific accounts remain in `.env`.

## Installation

Requires Node.js 20.19 or newer.

```bash
npm install
npm run driver:android:install
npm run driver:list
npm run doctor:android
```

Appium and UiAutomator2 use the project-local `.appium/` directory. This avoids
depending on a user's global Appium driver installation.

## Environment configuration

Create `.env` from `.env.example`. Do not commit real credentials.

Local Android requires:

```env
EXECUTION_TARGET=local
ANDROID_APP_PACKAGE=com.example.appiumplayground
ANDROID_APP_ACTIVITY=.MainActivity
TEST_USERNAME=
TEST_PASSWORD=
```

Optional local device selection:

```env
ANDROID_UDID=emulator-5554
ANDROID_DEVICE_NAME=Android Emulator
ANDROID_PLATFORM_VERSION=
```

`ANDROID_APP_WAIT_ACTIVITY` is optional. `appActivity` tells Appium which
activity to start; `appWaitActivity` is only needed when startup redirects
through another Android activity, such as a splash or login activity.

LambdaTest requires:

```env
EXECUTION_TARGET=lambdatest
LT_USERNAME=
LT_ACCESS_KEY=
LT_APP_ID=lt://APP...
LT_DEVICE_NAME=Galaxy S23
LT_PLATFORM_VERSION=13
LT_BUILD_NAME=Appium Playground
TEST_USERNAME=
TEST_PASSWORD=
```

The uploaded `LT_APP_ID` must refer to the same APK build whose accessibility
identifiers the tests expect.

## Running locally

Boot an emulator and verify it:

```bash
adb devices -l
```

Start Appium in terminal 1:

```bash
npm run appium
```

Run the established standalone suite in terminal 2:

```bash
npm run test:android
```

Run the WDIO migration smoke suite:

```bash
npm run test:android:wdio
```

## Running on LambdaTest

Set `EXECUTION_TARGET=lambdatest` and the LambdaTest variables in `.env`.
LambdaTest provides the Appium server and device, so the local Appium command is
not required.

```bash
npm run test:android:wdio
```

The WDIO runner still uses:

```js
runner: 'local'
```

This means the Node worker runs on the current machine. The configured hostname
determines whether that worker connects to local Appium or LambdaTest.

## Page Object Model

A page object owns selectors and screen-level actions:

```js
export class LoginPage extends BasePage {
  async login(username, password) {
    await this.type(this.usernameSelector, username);
    await this.type(this.passwordSelector, password);
    await this.tap(this.loginButtonSelector);
  }
}
```

A flow coordinates pages:

```js
await authFlow.loginAs(
  validUser.username,
  validUser.password,
);
```

State-recovery flows establish a known starting screen without restarting the
Appium session. `DashboardFlow.reachDashboard()` first checks whether the
dashboard is already loaded, then delegates navigation to the recognized active
page and verifies that the dashboard loaded. At runtime only one screen is
active; support for additional screens is added through shared navigation (for
example, a Home tab) or a deterministic page-specific `returnToDashboard()`
operation. Login remains an authentication concern and is handled by
`AuthFlow`, not silently by `DashboardFlow`.

A spec owns expected behavior:

```js
await expect(
  dashboardPage.hero,
).toBeDisplayed();
```

Prefer shared accessibility identifiers for Android and iOS. Android-only XPath
such as `//android.widget.TextView[...]` should eventually be replaced or hidden
behind platform-specific page-object locator selection.

## Test data

Use feature-scoped modules:

```text
test/data/auth.data.js
test/data/dashboard.data.js
test/data/users.data.js
```

- Fixed invalid inputs and expected messages belong to feature data files.
- Existing environment accounts are read lazily through helpers such as
  `getValidUser()`.
- Fresh users or orders should later come from factories.
- Generated runtime values stay in the current test or suite scope rather than
  global variables or the WebDriver object.

`Object.freeze()` may be used for static shared data to prevent accidental
mutation. It is a safeguard, not a performance requirement.

## Waiting, polling, and repeated log entries

These are different concepts:

```text
Timeout
  -> maximum total duration to wait

Polling interval
  -> delay between condition checks during that wait

Test retry
  -> rerun the complete failed test
```

The base page currently uses:

```js
await element.waitForDisplayed({ timeout });
```

WebdriverIO repeatedly issues `findElement` requests until the element becomes
displayed or the timeout expires. Its default wait polling interval is short
(commonly 100 ms), so a 20-second failed wait can produce many terminal and
Appium log entries. This behavior occurs even when no Mocha/WDIO test retry is
configured.

For mobile and cloud execution, use a deliberate polling interval such as
500 ms:

```js
await element.waitForDisplayed({
  timeout,
  interval: 500,
  timeoutMsg:
    `Element was not displayed: ${selector}`,
});
```

Alternatively, define the WDIO runner default:

```js
waitforTimeout: 10_000,
waitforInterval: 500,
```

Explicit method options override the runner defaults. Standalone WebdriverIO
does not automatically read `wdio.android.conf.js`, so shared wait constants or
explicit options are needed while both architectures coexist.

Do not solve normal rendering delays with fixed pauses such as:

```js
await browser.pause(2000);
```

A fixed pause always consumes the full delay, even when the element becomes
ready immediately. Conditional waits finish as soon as the expected state is
reached.

WebdriverIO also automatically waits before direct interaction commands such as
`click` and `setValue`. Keep explicit `waitForDisplayed` when visibility itself
is part of the page readiness contract, but avoid stacking redundant waits.

## Retry policy

The project defines a runner-independent retry policy in:

```text
test/config/retry.js
```

Environment controls:

```env
TEST_RETRIES=0
SPEC_RETRIES=0
```

The retry types are:

```text
TEST_RETRIES
  -> Mocha retries the failed `it()` inside the current WDIO worker/session

SPEC_RETRIES
  -> WDIO reruns the complete spec file with a new browser/session instance
```

Defining a value in `retry.js` does not activate it automatically. The WDIO
configuration must connect the policy:

```js
import {
  retryPolicy,
} from './test/config/retry.js';

export const config = {
  specFileRetries:
    retryPolicy.specRetries,

  specFileRetriesDelay: 2,
  specFileRetriesDeferred: false,

  mochaOpts: {
    ui: 'bdd',
    timeout: 120_000,
    retries: retryPolicy.testRetries,
  },
};
```

When both values are enabled, Mocha first exhausts the test retries. WDIO retries
the complete spec only if the spec still finishes as failed. With one test in
one spec, both mechanisms can therefore apply, but they operate at different
boundaries and are not triggered simultaneously.

For example:

```text
TEST_RETRIES=1
SPEC_RETRIES=1

Spec attempt 1:
  test attempt 1 fails
  test attempt 2 fails

Spec attempt 2 (new WDIO session):
  test attempt 1 fails
  test attempt 2 fails
```

This can produce up to four executions of the same test, so do not normally
enable both while diagnosing retry behavior.

The recommended initial policy is:

```env
TEST_RETRIES=1
SPEC_RETRIES=0
```

Use spec retries later for infrastructure or session-level instability where a
fresh worker/session can recover. Test retries should only be used for isolated,
idempotent scenarios whose starting state is restored before every attempt.

The central retry count can be overridden for an exceptional Mocha test:

```js
it('does not retry this destructive scenario', async function () {
  this.retries(0);

  // Test steps
});
```

Use a regular `function` callback when accessing Mocha's `this` context. An arrow
function does not provide the Mocha test context:

```js
it('incorrect override example', async () => {
  this.retries(0);
});
```

Per-test overrides should remain exceptional. The default retry policy belongs
in the WDIO configuration so it is visible and consistent across the suite.

### Retry setup must restore application state

Mocha test retries run inside the current WDIO worker/session. A retry does not
automatically create a fresh application session. Each suite must therefore
restore the state required by the test in `beforeEach()`.

For authentication tests:

```text
beforeEach()
  -> ensure the app is logged out and Login is visible
```

For authenticated feature tests:

```text
before()
  -> login once

beforeEach()
  -> ensure Dashboard/Home is visible
```

Avoid `browser.reloadSession()` before every test as the normal solution. It
recreates the complete Appium session and is especially expensive on cloud
devices. Reserve session reload/spec retry for broken Appium, device, or worker
state that application-level recovery cannot repair.

Retries should default to zero locally and be enabled deliberately. A test that
only passes after repeated retries remains flaky and should be investigated.

## Planned next steps

Completed migration foundations:

- WDIO runner and Mocha adapter are installed and configured.
- The WDIO Login spec passes with WDIO-managed sessions and assertions.
- Test-level and spec-file retry policies are configurable and verified.
- Wait polling has a less noisy interval.

Current transition state:

- The Login WDIO spec still uses `browser.reloadSession()` in `beforeEach()`.
- `AuthFlow.ensureLoggedOut()` has been started but is not usable yet because a
  real UI logout operation and bounded recovery flow have not been implemented.
- Keep the working session reload temporarily while state recovery is developed
  and verified in small steps.

Next steps:

1. Add quick, non-throwing page-state checks to `BasePage`, `LoginPage`, and
   `DashboardPage`.
2. Model the application's real Profile/Logout controls in page objects.
3. Complete `AuthFlow.logout()` and `ensureLoggedOut()`.
4. Replace Login's per-test `reloadSession()` with `ensureLoggedOut()`.
5. Add bounded Dashboard recovery for authenticated feature suites.
6. Migrate Dashboard and lab specs to WDIO-managed sessions.
7. Add a runner-independent TestRail API client and WDIO reporter adapter.
8. Add iOS capabilities using XCUITest and shared accessibility identifiers.
