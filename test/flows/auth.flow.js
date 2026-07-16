export class AuthFlow {
  constructor(loginPage, dashboardPage) {
    this.loginPage = loginPage;
    this.dashboardPage = dashboardPage;
  }

  async loginAs(username, password) {
    // await this.loginPage.waitUntilLoaded();
    await this.loginPage.login(username, password);
    await this.dashboardPage.waitUntilLoaded();
  }
}