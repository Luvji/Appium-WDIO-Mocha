import { LoginPage } from "../../../pages/login.page.js";
import { DashboardPage } from "../../../pages/dashboard.page.js";
import { AuthenticationLabPage } from "../../../pages/authentication-lab.page.js";
import { AuthFlow } from "../../../flows/auth.flow.js";
import { getValidUser } from "../../../data/users.data.js";
import { authData } from "../../../data/auth.data.js";
import { DashboardFlow } from "../../../flows/dashboard.flow.js";
import { BottomNavigation } from "../../../components/bottom-navigation.component.js";

describe("Authentication Lab", () => {
  let loginPage;
  let dashboardPage;
  let authenticationLabPage;
  let authFlow;
  let dashboardFlow;
  let bottomNavigation;
  const user = getValidUser();

  before(async () => {
    loginPage = new LoginPage(browser);
    dashboardPage = new DashboardPage(browser);
    authenticationLabPage = new AuthenticationLabPage(browser);
    bottomNavigation = new BottomNavigation(browser);

    dashboardFlow = new DashboardFlow(loginPage, dashboardPage, bottomNavigation);
    authFlow = new AuthFlow(loginPage, dashboardPage, authenticationLabPage, bottomNavigation);
  });

  beforeEach(async () => {
    await authFlow.ensureLoggedIn(user.username, user.password);
    await dashboardFlow.reachDashboard();

    if (await dashboardPage.isLoaded()) {
      await dashboardPage.openAuthenticationLab();
    }
    await authenticationLabPage.waitUntilLoaded();
  });

  it("logs out the current user", async () => {
    await authenticationLabPage.tapLogout();

    await expect(authenticationLabPage.logoutDialogTitle).toBeDisplayed();
    await expect(authenticationLabPage.logoutDialogTitle).toHaveText(authData.logoutConfirmation.title);
    await expect(authenticationLabPage.logoutDialogMessage).toHaveText(authData.logoutConfirmation.message);

    await authenticationLabPage.clickConfirmLogout();

    await expect(loginPage.username).toBeDisplayed();
    await expect(dashboardPage.hero).not.toBeDisplayed();
  });

  it("keeps the user logged in when logout is cancelled", async () => {
    await authenticationLabPage.tapLogout();

    await expect(authenticationLabPage.logoutDialogTitle).toBeDisplayed();
    await authenticationLabPage.clickCancelLogout();
    await expect(authenticationLabPage.logoutButton).toBeDisplayed();
    await expect(loginPage.username).not.toBeDisplayed();
  });
});
