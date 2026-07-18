import { BasePage } from "./base.page.js";

export class GestureLabPage extends BasePage {
  get gesturePadSelector() {
    return "~gesture_pad";
  }

  get gesturePad() {
    return this.element(this.gesturePadSelector);
  }

  get homeNavigationSelector() {
    return "~bottom_home";
  }

  async waitUntilLoaded() {
    await this.waitUntilDisplayed(
      this.gesturePadSelector,
      20_000
    );
  }

  async isLoaded() {
    return this.isDisplayed(this.gesturePadSelector);
  }

  async swipeRight() {
    const pad = await this.gesturePad;

    await this.driver.swipe({
      direction: "right",
      duration: 600,
      percent: 0.7,
      scrollableElement: pad,
    });
  }

  async swipeLeft() {
    const pad = await this.gesturePad;

    await this.driver.swipe({
      direction: "left",
      duration: 600,
      percent: 0.7,
      scrollableElement: pad,
    });
  }

  async pinch() {
    const pad = await this.gesturePad;

    await pad.pinch({
      duration: 1_000,
      scale: 0.6,
    });
  }

  async returnToDashboard() {
    await this.tap(this.homeNavigationSelector);
  }
}