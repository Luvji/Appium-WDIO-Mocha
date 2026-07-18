import { BasePage } from "./base.page.js";

export class AuthenticationLabPage extends BasePage {
  get logoutButtonSelector() {
    return "~auth_logout";
  }

  get logoutButton() {
    return this.element(this.logoutButtonSelector);
  }

  get confirmLogoutButtonSelector() {
    if (this.driver.isAndroid) {
      return 'android=new UiSelector().text("LOG OUT")';
    }

    return '-ios predicate string:label == "Log Out"';
  }

  get confirmLogoutButton() {
    return this.element(this.confirmLogoutButtonSelector);
  }

  get logoutDialogTitleSelector() {
    if (this.driver.isAndroid) {
      return 'android=new UiSelector().resourceId("android:id/alertTitle")';
    }

    return '-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "Log out?"';
  }

  get logoutDialogTitle() {
    return this.element(this.logoutDialogTitleSelector);
  }

  get logoutDialogMessageSelector() {
    if (this.driver.isAndroid) {
      return 'android=new UiSelector().resourceId("android:id/message")';
    }
    return '-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "You will return to the sign-in screen."';
  }

  get logoutDialogMessage() {
    return this.element(this.logoutDialogMessageSelector);
  }

  get cancelLogoutButtonSelector() {
    if (this.driver.isAndroid) {
      return 'android=new UiSelector().resourceId("android:id/button2")';
    }

    return '-ios predicate string:label == "Cancel"';
  }

  get cancelLogoutButton() {
    return this.element(this.cancelLogoutButtonSelector);
  }

  get backButtonSelector() {
    return "~nav_back";
  }

  get homeNavigationSelector() {
    return "~bottom_home";
  }

  async returnToDashboardBackButton() {
    await this.tap(this.backButtonSelector);

  }

  async returnToDashboard() {
    await this.tap(this.homeNavigationSelector);

  }

  async waitUntilLoaded() {
    await this.waitUntilDisplayed(this.logoutButtonSelector, 20_000);
  }

  async clickCancelLogout() {
    const cancelButton = await this.cancelLogoutButton;

    await cancelButton.waitForDisplayed({
      timeout: 10_000,
    });

    await cancelButton.click();
  }

  async isLoaded() {
    return this.isDisplayed(this.logoutButtonSelector);
  }
  async tapLogout() {
    const logoutButton = await this.logoutButton;
    await logoutButton.click();
  }

  async clickConfirmLogout() {
    const confirmButton = await this.confirmLogoutButton;
    await confirmButton.waitForDisplayed({
      timeout: 10_000,
    });
    await confirmButton.click();
  }

  async logout() {
    await this.waitUntilLoaded();
    await this.tapLogout();
    await this.clickConfirmLogout();
  }
}
