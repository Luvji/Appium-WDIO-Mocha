import { BasePage } from "./base.page.js";

export class LoginPage extends BasePage {
  get usernameSelector() {
    return "~startup_username";
  }

  get username() {
    return this.element(this.usernameSelector);
  }

  get passwordSelector() {
    return "~startup_password";
  }

  get loginButtonSelector() {
    return "~startup_login";
  }

  get welcomeMessageSelector() {
    return "~dashboard_hero";
  }

  get invalidPasswordMessageSelector() {
    return "~startup_login_result";
  }

  get invalidPasswordMessage() {
    return this.element(this.invalidPasswordMessageSelector);
  }

  async waitUntilLoaded() {
    await this.waitUntilDisplayed(this.usernameSelector, 20_000);
    await this.waitUntilDisplayed(this.passwordSelector, 20_000);
    await this.waitUntilDisplayed(this.loginButtonSelector, 20_000);
  }

  async isLoaded() {
    return this.isDisplayed(this.usernameSelector);
  }

  async login(username, password) {
    await this.waitUntilLoaded();
    await this.type(this.usernameSelector, username);
    await this.type(this.passwordSelector, password);
    await this.tap(this.loginButtonSelector);
  }

  async isWelcomeMessageDisplayed() {
    return (await this.element(this.welcomeMessageSelector)).isDisplayed();
  }

  async isInvalidPasswordMessageDisplayed() {
    return (await this.element(this.invalidPasswordMessageSelector)).isDisplayed();
  }

  async invalidPasswordMessageText() {
    const message = await this.waitUntilDisplayed(this.invalidPasswordMessageSelector);

    return message.getText();
  }
}
