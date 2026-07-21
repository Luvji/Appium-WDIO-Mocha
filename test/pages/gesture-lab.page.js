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

  async swipe(direction) {
    const supportedDirections = ["left", "right", "up", "down"];

    if (!supportedDirections.includes(direction)) {
      throw new Error(`Unsupported swipe direction: ${direction}`);
    }

    const pad = await this.gesturePad;

    await this.driver.swipe({
      direction,
      duration: 600,
      percent: 0.7,
      scrollableElement: pad,
    });
  }

  async waitUntilLoaded() {
    await this.waitUntilDisplayed(this.gesturePadSelector, 20_000);
  }

  async isLoaded() {
    return this.isDisplayed(this.gesturePadSelector);
  }

  async swipeRight() {
    await this.swipe("right");
  }

  async swipeLeft() {
    await this.swipe("left");
  }

  async swipeUp() {
    await this.swipe("up");
  }

  async swipeDown() {
    await this.swipe("down");
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
