export class AuthFlow {
  constructor(loginPage, dashboardPage, authenticationLabPage, bottomNavigation) {
    this.loginPage = loginPage;
    this.dashboardPage = dashboardPage;
    this.authenticationLabPage = authenticationLabPage;
    this.bottomNavigation = bottomNavigation;
  }

  async loginAs(username, password) {
    // await this.loginPage.waitUntilLoaded();
    await this.loginPage.login(username, password);
    await this.dashboardPage.waitUntilLoaded();
  }
  async ensureLoggedOut() {
    if (await this.loginPage.isLoaded()) {
      return;
    }

    if (await this.authenticationLabPage.isLoaded()) {
      await this.authenticationLabPage.logout();
      await this.loginPage.waitUntilLoaded();
      return;
    }

    if (await this.dashboardPage.isLoaded()) {
      await this.dashboardPage.openAuthenticationLab();
      await this.authenticationLabPage.logout();
      await this.loginPage.waitUntilLoaded();
      return;
    }

    throw new Error("Unable to establish logged-out state: Login, Dashboard, and Authentication Lab were not detected");
  }

  async ensureLoggedIn(username, password) {
    if (await this.loginPage.isLoaded()) {
      await this.loginAs(username, password);
      return;
    }

    if ((await this.dashboardPage.isLoaded()) || (await this.bottomNavigation.isDisplayed())) {
      return;
    }

    throw new Error(
      "Unable to establish logged-in state: Login and authenticated application navigation were not detected",
    );
  }
}
