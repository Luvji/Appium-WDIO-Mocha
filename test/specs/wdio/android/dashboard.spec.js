import { LoginPage } from "../../../pages/login.page.js";
import { DashboardPage } from "../../../pages/dashboard.page.js";
import { AuthenticationLabPage } from "../../../pages/authentication-lab.page.js";
import { AuthFlow } from "../../../flows/auth.flow.js";
import { DashboardFlow } from "../../../flows/dashboard.flow.js";
import { getValidUser } from "../../../data/users.data.js";
import { dashboardData } from "../../../data/dashboard.data.js";
import { BottomNavigation } from "../../../components/bottom-navigation.component.js";

describe("Dashboard", () => {
  let loginPage;
  let dashboardPage;
  let authenticationLabPage;
  let authFlow;
  let dashboardFlow;
  let bottomNavigation;

  const user = getValidUser();

  before(() => {
    loginPage = new LoginPage(browser);
    dashboardPage = new DashboardPage(browser);
    authenticationLabPage = new AuthenticationLabPage(browser);
    bottomNavigation = new BottomNavigation(browser);

    authFlow = new AuthFlow(loginPage, dashboardPage, authenticationLabPage, bottomNavigation);

    dashboardFlow = new DashboardFlow(loginPage, dashboardPage, bottomNavigation);
  });

  beforeEach(async () => {
    await authFlow.ensureLoggedIn(user.username, user.password);

    await dashboardFlow.reachDashboard();
    await dashboardPage.waitUntilLoaded();
  });

  it("shows the Controls Lab card", async () => {
    await expect(dashboardPage.hero).toBeDisplayed();

    await expect(dashboardPage.controlsLabTitle).toHaveText(dashboardData.cards.controlsLabTitle);
  });

  it("shows the Tap Lab card", async () => {
    await expect(dashboardPage.hero).toBeDisplayed();

    await expect(dashboardPage.tapLabTitle).toHaveText(dashboardData.cards.tapLabTitle);
  });
});
