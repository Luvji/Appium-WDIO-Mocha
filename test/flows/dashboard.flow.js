export class DashboardFlow {
  constructor(loginPage, dashboardPage, bottomNavigation) {
    this.loginPage = loginPage;
    this.dashboardPage = dashboardPage;
    this.bottomNavigation = bottomNavigation;
  }

  async reachDashboard() {
    if (await this.dashboardPage.isLoaded()) {
      return;
    }

    if (await this.loginPage.isLoaded()) {
      throw new Error("Cannot reach Dashboard because the user is logged out");
    }

    if (await this.bottomNavigation.isDisplayed()) {
      await this.bottomNavigation.goToDashboard();
      await this.dashboardPage.waitUntilLoaded();
      return;
    }

    throw new Error("Cannot reach Dashboard: current application page is unknown");
  }
}
