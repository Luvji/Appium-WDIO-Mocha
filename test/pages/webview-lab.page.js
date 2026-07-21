import { BasePage } from "./base.page.js";

export class WebViewLabPage extends BasePage {
  get backButtonSelector() {
    return "~nav_back";
  }

  get webTitleSelector() {
    return "#web-title";
  }

  get nameInputSelector() {
    return "#web-name";
  }

  get submitButtonSelector() {
    return "#web-submit";
  }

  get resultSelector() {
    return "#result";
  }

  get webTitle() {
    return this.element(this.webTitleSelector);
  }

  get nameInput() {
    return this.element(this.nameInputSelector);
  }

  get submitButton() {
    return this.element(this.submitButtonSelector);
  }

  get result() {
    return this.element(this.resultSelector);
  }

  async waitUntilLoaded() {
    // This runs while the session is still in NATIVE_APP.
    await this.waitUntilDisplayed(
      this.backButtonSelector,
      20_000
    );

    await this.waitForWebViewContext();
  }

  async waitForWebViewContext() {
    let webViewContext;

    await this.driver.waitUntil(
      async () => {
        const contexts =
          await this.driver.getContexts();

        webViewContext = contexts.find(
          context =>
            context.startsWith("WEBVIEW")
        );

        return Boolean(webViewContext);
      },
      {
        timeout: 20_000,
        interval: 1_000,
        timeoutMsg:
          "WebView context did not become available",
      }
    );

    return webViewContext;
  }

  async switchToWebView() {
    const webViewContext =
      await this.waitForWebViewContext();

    await this.driver.switchContext(
      webViewContext
    );

    await this.waitUntilDisplayed(
      this.webTitleSelector,
      20_000
    );
  }

  async switchToNative() {
    const currentContext =
      await this.driver.getContext();

    if (currentContext !== "NATIVE_APP") {
      await this.driver.switchContext(
        "NATIVE_APP"
      );
    }
  }

  async enterName(name) {
    await this.type(
      this.nameInputSelector,
      name
    );
  }

  async submit() {
    await this.tap(
      this.submitButtonSelector
    );
  }
}