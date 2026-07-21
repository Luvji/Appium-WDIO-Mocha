# Appium + WDIO problem and solution guide

This guide records failures encountered while building this project. Use the
diagnostic order in each section before adding retries or fixed pauses.

## Diagnostic order

1. Read the first error, not the last retry message.
2. Check JavaScript syntax with `node --check path/to/spec.js`.
3. Confirm the spec matches the WDIO `specs` glob.
4. Run one spec with `--spec` to isolate it.
5. Identify whether the failure occurred during file loading, a hook, a test,
   an assertion, or session cleanup.
6. Confirm the current application screen and context.
7. Confirm the locator exists in the current accessibility/DOM hierarchy.
8. Add a conditional wait for observable state; do not immediately add a
   fixed pause or retry.

## App opens only when it was opened manually

**Problem**

The dashboard test passed when the app was already open on Dashboard but failed
with `no such element` after the app was closed.

**Cause**

The test assumed Dashboard was its starting state. It did not establish the
authentication state or navigate there. Appium locating an element does not
prepare the application for the test.

**Solution**

- Configure `appPackage` and `appActivity` so Appium launches the app.
- Model Login and Dashboard as separate page objects.
- Establish state in hooks with flows such as `ensureLoggedIn()` and
  `reachDashboard()`.
- Wait for a page-specific readiness element before testing it.

```js
await authFlow.ensureLoggedIn(user.username, user.password);
await dashboardFlow.reachDashboard();
await dashboardPage.waitUntilLoaded();
```

## Correct capabilities but the wrong application UI appears

**Problem**

LambdaTest created a session, but expected elements could not be found.

**Cause**

The uploaded APK was a different build from the one inspected locally. The
test expected accessibility identifiers that did not exist in that APK.

**Solution**

Confirm that `LT_APP_ID` points to the exact tested build before investigating
drivers, activities, waits, or locators.

## `appWaitActivity` confusion

**Problem**

It appeared that `ANDROID_APP_WAIT_ACTIVITY` was required to open the app.

**Cause**

`appActivity` tells Appium what to start. `appWaitActivity` tells UiAutomator2
which activity is acceptable after startup. It is only important when startup
temporarily or permanently redirects to another activity.

**Solution**

Use the actual startup activity when known. Keep a wildcard only when the app's
startup routing requires it, and do not use it to hide a wrong package, wrong
APK, or incorrect state assumption.

## Duplicate `deleteSession()` and failing cleanup hook

**Problem**

Tests passed, but the `afterEach` hook failed while deleting an already ended
session.

**Cause**

Two owners attempted to terminate the same session. A session lifecycle must
have one orchestrator.

**Solution**

- In standalone Mocha, the project session helper creates and closes sessions.
- With the WDIO runner, WDIO creates and closes sessions.
- Do not call a standalone `closeSession()` from a WDIO-managed spec.

## Mocha, WDIO and runner terminology

**Problem**

The project appeared to use both Mocha and WDIO, making ownership unclear.

**Cause**

They perform different jobs. Mocha supplies `describe`, `it`, hooks and test
retries. The WDIO runner discovers specs, starts workers, manages sessions and
invokes the Mocha adapter. WebdriverIO commands communicate with Appium.

**Solution**

Use this model:

```text
WDIO runner -> worker/session orchestration
Mocha adapter -> suites, tests and hooks
WebdriverIO client -> commands and assertions
Appium driver -> device automation
```

## A test is reported as pending

**Problem**

Mocha reported a test or suite as pending even though the app was configured.

**Cause**

`describe.skip()` or `it.skip()` explicitly tells Mocha not to execute it.
Pending is a test-definition state, not an Appium capability diagnosis.

**Solution**

Remove `.skip` when the scenario is ready and verify that the body actually
runs.

## Repeated `findElement` log entries before retries

**Problem**

One missing element produced many Appium requests even before test retry was
enabled.

**Cause**

Conditional waits poll until their timeout. Polling is different from rerunning
the test.

**Solution**

Set an intentional wait interval and useful timeout message.

```js
await element.waitForDisplayed({
  timeout: 10_000,
  interval: 1_000,
  timeoutMsg: `Element was not displayed: ${selector}`,
});
```

## Test retry works but spec retry appears not to work

**Problem**

Changing `TEST_RETRIES` visibly reran the test, while `SPEC_RETRIES` behaved
differently.

**Cause**

Mocha test retries rerun a failed `it()` in the current worker/session. WDIO
spec retries rerun the complete spec at the runner boundary, normally with a
new worker/session. With both enabled, test retries are exhausted first.

**Solution**

Use test retry for a narrowly transient scenario and spec retry for a failed
spec/worker boundary. Keep both at zero while diagnosing deterministic bugs.

```js
it("exceptional scenario", async function () {
  this.retries(0);
});
```

Use a regular function when accessing Mocha's `this` context.

## Expensive session reset before every test

**Problem**

`browser.reloadSession()` made tests independent but slow, especially on cloud
devices.

**Cause**

It recreates the Appium session and often relaunches/reinstalls application
state instead of navigating within the existing session.

**Solution**

Use page-state checks and deterministic flows for normal recovery. Reserve
session reload for a broken session or tests that genuinely require a clean
installation boundary.

## A previous test leaves the next test on the wrong page

**Problem**

Confirming logout ends on Login, while cancelling logout ends inside
Authentication Lab. Later tests could not assume one starting screen.

**Cause**

Tests shared a session without restoring their preconditions.

**Solution**

- Page objects know how to leave their own screens.
- A flow detects recognized state and establishes the required destination.
- Specs call the flow in `beforeEach()`.

For many authenticated screens, prefer shared Home/bottom navigation over an
ever-growing list of page-specific branches. Keep page-specific recovery for
dialogs, WebViews or screens without common navigation.

## Inspector does not show a new dialog until refresh

**Problem**

The emulator showed a logout dialog, but Inspector still displayed the prior
screen until Refresh was pressed.

**Cause**

Inspector's screenshot and XML are snapshots. Interaction outside Inspector
does not automatically refresh them.

**Solution**

Refresh Inspector during development. In tests, locate the live dialog and use
`waitForDisplayed()`; no Inspector refresh command belongs in the test.

## Scroll moves in the wrong direction

**Problem**

The dashboard moved, but the lower card was not revealed.

**Cause**

WDIO gesture direction describes physical finger movement. To reveal content
lower on a page, the finger normally swipes upward.

**Solution**

```js
await card.scrollIntoView({
  direction: "up",
  maxScrolls: 6,
  percent: 0.8,
  scrollableElement: scrollContainer,
});
```

Use `scrollIntoView()` when searching for a known destination. Use `swipe()`
when the gesture itself is the behavior under test.

## `scrollableElements` appears to work

**Problem**

Copilot suggested `scrollableElements`, and scrolling still worked.

**Cause**

The supported WDIO option is singular: `scrollableElement`. The unknown plural
option was ignored, and WDIO happened to find the correct default ScrollView.

**Solution**

```js
scrollableElement: scrollContainer
```

Autocomplete verifies plausible syntax, not the runtime API contract. Confirm
library option names in official documentation.

## A class method is defined twice

**Problem**

`returnToDashboard()` was implemented once with Home and once with Back.

**Cause**

In a JavaScript class, the later method definition replaces the earlier one.
Both are not executed.

**Solution**

Give distinct actions distinct names, or keep only the intended implementation.

```js
async returnToDashboard() { /* common route */ }
async returnWithBackButton() { /* explicit alternative */ }
```

## Wrong page object construction order

**Problem**

`AuthFlow` received `undefined` for `authenticationLabPage`.

**Cause**

The flow was constructed before the page object was assigned.

**Solution**

Construct all dependencies first, then construct the flow.

```js
authenticationLabPage = new AuthenticationLabPage(browser);
authFlow = new AuthFlow(loginPage, dashboardPage, authenticationLabPage);
```

## Spec matches the glob but appears omitted

**Problem**

`**/*.spec.js` appeared to skip the new Drag & Drop spec, while selecting it
directly produced a failure.

**Cause**

The spec had a JavaScript syntax error: `describe()` closed before `it()`, and
`await` was used inside a non-async function. The module failed before Mocha
could register its test, so the reporter had no suite/test title to show.

**Solution**

```bash
node --check test/specs/wdio/android/dragDrop-lab.spec.js
npm run test:android:wdio -- --spec ./test/specs/wdio/android/dragDrop-lab.spec.js
```

Keep `it()` inside `describe()` and mark callbacks using `await` as `async`.

## Method exists but JavaScript says it is not a function

**Problem**

The page defined `tapAccessibleTab()` while the spec called
`tapAccessibletab()`.

**Cause**

JavaScript identifiers are case-sensitive.

**Solution**

Use consistent lower-camel-case names and rename both definition and callers
together.

## Calling a matcher directly on an element

**Problem**

The spec called `element.toHaveText(...)`.

**Cause**

`toHaveText()` is a WDIO `expect` matcher, not an element command.

**Solution**

```js
await expect(page.result).toHaveText(expectedText);
```

## `Spread syntax requires ...iterable[Symbol.iterator]`

**Problem**

`waitUntilLoaded()` produced an unrelated-looking spread/iterator error.

**Cause**

`BasePage.waitUntilDisplayed()` accepts a selector and internally calls
`driver.$(selector)`. The page passed an existing WDIO element instead, causing
WDIO to process an element object as selector input.

**Solution**

```js
// BasePage helper: pass a selector
await this.waitUntilDisplayed(this.dragDropTitleSelector);

// WDIO assertion: pass an element
await expect(this.dragDropTitle).toBeDisplayed();
```

Remember:

```text
BasePage helper -> selector
WDIO expect -> element
Element command -> call on element
```

## Page readiness waits for a dashboard card

**Problem**

Drag & Drop Lab attempted to identify itself with `home_lab_5`.

**Cause**

`home_lab_5` belongs to Dashboard and disappears after navigation.

**Solution**

Use a stable element inside the destination screen, such as its title or tab,
for `waitUntilLoaded()` and `isLoaded()`.

## Canvas children cannot be selected in Inspector

**Problem**

The blue draggable tile and green target were visible but Inspector exposed
only `drag_drop_board`. XML before and after success was identical.

**Cause**

The application custom-drew the tiles and result inside one View. Appium sees
the platform accessibility hierarchy, not arbitrary pixels.

**Solution**

Preferred application change:

```text
accessible_drag_source
accessible_drop_target
accessible_drag_result
```

Keep the Canvas version to demonstrate board-relative coordinates/image
matching, and add an Accessible version with separate native accessibility
nodes for stable element-to-element drag-and-drop.

## Pinch fails once in Inspector but saved replay works

**Problem**

Inspector returned `Unable to perform W3C actions`, while replaying the saved
two-pointer gesture succeeded.

**Cause**

The direct builder submission produced an invalid/transient action chain, but
the serialized action sequence was valid. Multi-pointer tick synchronization is
more sensitive than a one-pointer swipe.

**Solution**

Prefer WDIO's supported high-level native command in the automation suite:

```js
await gesturePad.pinch({ duration: 1_000, scale: 0.6 });
```

Use low-level W3C actions when learning or when the high-level command cannot
express the required gesture.

## Visible gesture result versus accessible result

**Problem**

It was unclear whether `GESTURE AREA\nResult: ...` could be asserted.

**Cause**

Visible text may be custom-drawn and absent from accessibility, as happened in
the Canvas Drag & Drop board.

**Solution**

Inspect attributes. `gesture_pad` is an `android.widget.TextView` whose `text`
attribute changes, so WDIO can assert it:

```js
await expect(gestureLabPage.gesturePad).toHaveText(expectedResult);
```

Use `JSON.stringify(await element.getText())` once if newline escaping is
unclear.

## Environment target still resolves to local Appium

**Problem**

LambdaTest was intended, but the loaded configuration showed hostname
`127.0.0.1`.

**Cause**

The environment variable name/value was malformed or not loaded by the Node
process. Shell text such as `envEXECUTION_TARGET=lambdatest` does not define the
expected `EXECUTION_TARGET` key.

**Solution**

Use:

```env
EXECUTION_TARGET=lambdatest
```

Run through the npm script that loads `.env`, and print only non-secret selected
configuration values when diagnosing.

## Final rule: retry is not a repair mechanism

## WebView context is visible but switching reports no compatible ChromeDriver

**Problem**

Inspector or WDIO listed a WebView context, but switching to it failed with:

```text
No Chromedriver found that can automate Chrome '150.0.7871'
```

The Inspector consequently continued showing native Android XML instead of an
HTML DOM.

**Cause**

UiAutomator2 discovers Android WebViews in native mode, but it delegates HTML
automation to ChromeDriver. The available ChromeDriver binaries did not support
the WebView engine's Chrome major version. Discovering a context and starting a
ChromeDriver session for it are separate operations.

**Solution**

For a trusted local development server, start Appium with only the scoped
automatic-download feature enabled:

```bash
appium --allow-insecure=uiautomator2:chromedriver_autodownload
```

Restart Appium and create a new Inspector/WDIO session. The first context switch
may download a matching binary and therefore needs network access. Do not use
global relaxed security merely to enable this one feature.

For controlled CI, manually provision and cache a compatible ChromeDriver and
provide its server-side path with `appium:chromedriverExecutable` or its folder
with `appium:chromedriverExecutableDir`. Cloud providers manage server binaries
on their own infrastructure, so a local filesystem path must not be sent to a
cloud session.

After switching succeeds, Inspector's context selector changes from
`NATIVE_APP` to `WEBVIEW_...`, and its source changes from Android XML to HTML.

## Allure Java fails with a Snap `libpthread` symbol error

**Problem**

Generating or opening Allure produced:

```text
java: symbol lookup error:
/snap/core20/current/lib/x86_64-linux-gnu/libpthread.so.0:
undefined symbol: __libc_pthread_init, version GLIBC_PRIVATE
```

**Cause**

The host OpenJDK executable loaded `libpthread` from a Snap `core20` runtime.
That library was built for a different glibc runtime and cannot be safely mixed
with the host JVM. This is process-environment/library-loader contamination,
not an Allure result-format error or necessarily a broken JDK.

If `allure generate` works but `allure open` and `allure serve` fail, Java and
the report generator are healthy. Generation is headless. The viewing commands
start an HTTP server and use desktop/browser integration; a Snap-installed VS
Code can export `GTK_PATH`, `GTK_EXE_PREFIX`, `GIO_MODULE_DIR`, `GTK_MODULES`
and related variables that cause host Java desktop integration to load Snap
libraries.

The project may also have both a global Allure installation and the npm-local
`node_modules/.bin/allure`. Direct `allure` commands can select the global
binary, while npm scripts prepend `node_modules/.bin` and select the project
version.

**Solution**

First prove whether loader variables are responsible in the failing terminal:

```bash
printf '%s\n' "$LD_LIBRARY_PATH"
printf '%s\n' "$LD_PRELOAD"
type -a allure
```

Then run the project-local binary with inherited loader overrides removed:

```bash
env -u LD_LIBRARY_PATH -u LD_PRELOAD \
  ./node_modules/.bin/allure --version
```

If that succeeds, run report commands through the npm scripts and, on Linux,
prefix their Allure command with `env -u LD_LIBRARY_PATH -u LD_PRELOAD` when the
Snap-installed editor's integrated terminal contaminates the loader path.
Opening a fresh non-Snap system terminal is another useful confirmation.

If generation works and only viewing fails, serve the already generated static
report without Allure's Java desktop integration:

```bash
python3 -m http.server 5050 --directory reports/allure-report
```

Then open `http://127.0.0.1:5050` manually. Alternatively, run the Allure
viewing command from a non-Snap terminal or unset the inherited Snap GTK/GIO
variables for that command.

Do not add `/snap/core20/...` to `LD_LIBRARY_PATH`, and do not reinstall Java
until the same Java executable also fails in a clean environment.

Retries are appropriate for known, bounded infrastructure instability. They do
not fix syntax errors, wrong application builds, wrong selectors, undefined
dependencies, inaccessible canvas content, or missing state preparation. A
deterministic failure should fail once and be corrected at its cause.

## A second WebView test fails with `target window already closed`

**Problem**

The first test switched to `WEBVIEW_...` and passed. Before the second test,
the suite navigated to another native screen and then reopened the WebView.
The next HTML lookup failed with:

```text
no such window: target window already closed
from unknown error: web view not found
```

The failure-screenshot hook then reported the same error while taking a
screenshot.

**Cause**

Leaving the screen destroyed its underlying Chromium window. Reopening the
screen exposed an Appium context with the same `WEBVIEW_...` name, but the
ChromeDriver connection could still refer to the destroyed browser window.
An Appium context name and a Chromium window are related but are not the same
lifecycle object.

The screenshot error was secondary: the failure hook attempted a WebDriver
screenshot while the session was still attached to the invalid WebView.

**Solution**

Do not unnecessarily leave and reopen the WebView between tests in the same
session. Establish login and open WebView Lab once in the suite's `before`
hook, return to `NATIVE_APP` after each test, and switch back to the existing
WebView at the beginning of each test. Reset only the form state that a test
changes.

Make failure evidence collection defensive. Before taking an Appium screenshot,
attempt to switch to `NATIVE_APP`; wrap evidence collection in `try/catch` so a
screenshot failure is logged but does not replace or obscure the test's real
error. If the application intentionally recreates WebViews as part of the
scenario, a fresh Appium session is the safest isolation boundary.
