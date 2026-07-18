export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  element(selector) {
    return this.driver.$(selector);
  }

  async waitUntilDisplayed(selector, timeout = 10_000) {
    const element = await this.element(selector);
    await element.waitForDisplayed({ timeout, interval: 1000, timeoutMsg: `Element was not displayed: ${selector}` });
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

  async isDisplayed(selector) {
    try {
      const element = await this.element(selector);

      return await element.isDisplayed();
    } catch {
      return false;
    }
  }
}
