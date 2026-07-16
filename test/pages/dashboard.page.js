import { BasePage } from './base.page.js';

export class DashboardPage extends BasePage {
  get heroSelector() {
    return '~dashboard_hero';
  }

  get controlsLabCardSelector() {
    return '~home_lab_1';
  }

  async waitUntilLoaded() {
    await this.waitUntilDisplayed(this.heroSelector, 20_000);
  }

  async isLoaded() {
    const hero = await this.element(this.heroSelector);
    return hero.isDisplayed();
  }

  async isControlsLabCardDisplayed() {
    const card = await this.waitUntilDisplayed(
      this.controlsLabCardSelector,
    );

    return card.isDisplayed();
  }
}


