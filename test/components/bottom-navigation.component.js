import { BasePage } from "../pages/base.page.js";

export class BottomNavigation extends BasePage {
  get homeSelector() {
    return "~bottom_home";
  }

  get home() {
    return this.element(this.homeSelector);
  }

  async isDisplayed() {
    return super.isDisplayed(this.homeSelector);
  }

  async goToDashboard() {
    await this.tap(this.homeSelector);
  }
}