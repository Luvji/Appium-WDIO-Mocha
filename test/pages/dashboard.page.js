import { BasePage } from "./base.page.js";

export class DashboardPage extends BasePage {
  get heroSelector() {
    return "~dashboard_hero";
  }

  get hero() {
    return this.element(this.heroSelector);
  }

  get controlsLabCardSelector() {
    return "~home_lab_1";
  }

  get authenticationLabCardSelector() {
    return "~home_lab_12";
  }

  get dragDropLabCardSelector() {
    return "~home_lab_5";
  }

  get dragDropLabCard() {
    return this.element(this.dragDropLabCardSelector);
  }

  get authenticationLabCard() {
    return this.element(this.authenticationLabCardSelector);
  }

  get screenScrollContainerSelector() {
    return "~screen_scroll";
  }

  get scrollContainer() {
    return this.element(this.screenScrollContainerSelector);
  }

  get controlsLabTitleSelector() {
    if (this.driver.isAndroid) {
      return 'android=new UiSelector().text("Controls Lab")';
    }

    return '-ios predicate string:label == "Controls Lab"';
  }

  get controlsLabTitle() {
    return this.element(this.controlsLabTitleSelector);
  }

  get tapLabTitleSelector() {
    if (this.driver.isAndroid) {
      return 'android=new UiSelector().text("Tap Lab")';
    }
    return '-ios predicate string:label == "Tap Lab"';
  }

  get tapLabTitle() {
    return this.element(this.tapLabTitleSelector);
  }

  get gestureLabCardSelector() {
    return "~home_lab_3";
  }

  get gestureLabCard() {
    return this.element(this.gestureLabCardSelector);
  }

  async openGestureLab() {
    const scrollContainer = await this.scrollContainer;
    const card = await this.gestureLabCard;

    await card.scrollIntoView({
      direction: "down",
      maxScrolls: 6,
      percent: 0.8,
      duration: 600,
      scrollableElement: scrollContainer,
    });

    await card.waitForDisplayed({
      timeout: 10_000,
    });

    await card.click();
  }

  async openAuthenticationLab() {
    const scrollContainer = await this.scrollContainer;
    const card = await this.authenticationLabCard;

    await card.scrollIntoView({
      direction: "up",
      maxScrolls: 6,
      percent: 0.8,
      duration: 600,
      scrollableElement: scrollContainer,
    });

    await card.waitForDisplayed({ timeout: 10_000 });
    await card.click();
  }

  get webViewLabCardSelector() {
    return "~home_lab_6";
  }

  get webViewLabCard() {
    return this.element(this.webViewLabCardSelector);
  }

  async openWebViewLab() {
    const scrollContainer = await this.scrollContainer;
    const card = await this.webViewLabCard;

    await card.scrollIntoView({
      direction: "down",
      maxScrolls: 6,
      percent: 0.8,
      duration: 600,
      scrollableElement: scrollContainer,
    });

    await card.waitForDisplayed({
      timeout: 10_000,
    });

    await card.click();
  }

  async waitUntilLoaded() {
    await this.waitUntilDisplayed(this.heroSelector, 20_000);
  }

  async openDragDropLab() {
    const scrollContainer = await this.scrollContainer;
    const card = await this.dragDropLabCard;

    await card.scrollIntoView({
      direction: "down",
      maxScrolls: 6,
      percent: 0.8,
      duration: 600,
      scrollableElement: scrollContainer,
    });

    await card.waitForDisplayed({
      timeout: 10_000,
    });

    await card.click();
  }

  async isLoaded() {
    return this.isDisplayed(this.heroSelector);
  }

  async isControlsLabCardDisplayed() {
    const card = await this.waitUntilDisplayed(this.controlsLabCardSelector);

    return card.isDisplayed();
  }
}
