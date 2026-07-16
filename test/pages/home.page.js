// test/pages/home.page.js
import { BasePage } from './base.page.js';

export class HomePage extends BasePage {

  get welcomeHeroCard(){
    return '~dashboard_hero';
  }

  get tapLabCardSelector() {
    return '//android.widget.TextView[@text="Tap Lab"]';
  }

  get controlsLabTitleSelector() {
    return '//android.widget.TextView[@text="Controls Lab"]';
  }

  async waitForWelcomeHeroCard() {
    return this.waitUntilDisplayed(this.welcomeHeroCard);
  }

  async waitForControlsLabCard() {
    return this.waitUntilDisplayed(this.controlsLabCardSelector);
  }

  async controlsLabTitle() {
    const title = await this.waitUntilDisplayed(
      this.controlsLabTitleSelector,
    );

    return title.getText();
  }

    async TapLabTitle() {
    const title = await this.waitUntilDisplayed(
      this.tapLabCardSelector,
    );

    return title.getText();
  }
}