export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  element(selector) {
    return this.driver.$(selector);
  }

  async waitUntilDisplayed(selector, timeout = 10_000) {
    const element = await this.element(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  async type(selector, value) {
    const element = await this.waitUntilDisplayed(selector);
    await element.setValue(value);
  }

  async tap(selector) {
    const element = await this.waitUntilDisplayed(selector);
    await element.click();
  }
}
