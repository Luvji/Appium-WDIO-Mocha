export class DashboardFlow {
  constructor(
    loginPage,
    dashboardPage,
    authenticationLabPage,
  ) {
    this.loginPage = loginPage;
    this.dashboardPage = dashboardPage;
    this.authenticationLabPage = authenticationLabPage;
    // this.controlsPage = controlsPage;
  }

  async reachDashboard() {
    if (await this.dashboardPage.isLoaded()) {
      return;
    }

    if (await this.authenticationLabPage.isLoaded()) {
      await this.authenticationLabPage.returnToDashboard();
      await this.dashboardPage.waitUntilLoaded();
      return;
    }

    // if (await this.controlsPage.isLoaded()) {
    //   await this.controlsPage.returnToDashboard();
    //   await this.dashboardPage.waitUntilLoaded();
    //   return;
    // }

    if (await this.loginPage.isLoaded()) {
      throw new Error(
        "Cannot reach Dashboard because the user is logged out"
      );
    }

    throw new Error(
      "Cannot reach Dashboard: current application page is unknown"
    );
  }
}