import { LoginPage } from "../../../pages/login.page.js";
import { DashboardPage } from "../../../pages/dashboard.page.js";
import { AuthenticationLabPage } from "../../../pages/authentication-lab.page.js";
import { WebViewLabPage } from "../../../pages/webview-lab.page.js";
import { BottomNavigation } from "../../../components/bottom-navigation.component.js";
import { AuthFlow } from "../../../flows/auth.flow.js";
import { DashboardFlow } from "../../../flows/dashboard.flow.js";
import { getValidUser } from "../../../data/users.data.js";
import { webViewData } from "../../../data/webview.data.js";

describe("WebView Lab", () => {
  let loginPage;
  let dashboardPage;
  let authenticationLabPage;
  let webViewLabPage;
  let bottomNavigation;
  let authFlow;
  let dashboardFlow;

  const user = getValidUser();

  before(() => {
    loginPage = new LoginPage(browser);
    dashboardPage = new DashboardPage(browser);

    authenticationLabPage = new AuthenticationLabPage(browser);

    webViewLabPage = new WebViewLabPage(browser);

    bottomNavigation = new BottomNavigation(browser);

    authFlow = new AuthFlow(loginPage, dashboardPage, authenticationLabPage, bottomNavigation);

    dashboardFlow = new DashboardFlow(loginPage, dashboardPage, bottomNavigation);
  });

  before(async () => {
    await authFlow.ensureLoggedIn(user.username, user.password);

    await dashboardFlow.reachDashboard();
    await dashboardPage.openWebViewLab();
    await webViewLabPage.waitUntilLoaded();
  });

  // beforeEach(async () => {
  //   await authFlow.ensureLoggedIn(user.username, user.password);

  //   await dashboardFlow.reachDashboard();
  //   await dashboardPage.openWebViewLab();
  //   await webViewLabPage.waitUntilLoaded();
  // });

  afterEach(async () => {
    await webViewLabPage.switchToNative();
  });

  it("displays the WebView title", async () => {
    await webViewLabPage.switchToWebView();
    await expect(webViewLabPage.webTitle).toHaveText(webViewData.title);
  });

  it("greets the submitted tester", async () => {
    await webViewLabPage.switchToWebView();

    await expect(webViewLabPage.result).toHaveText(webViewData.form.initialResult);
    await webViewLabPage.enterName(webViewData.form.name);
    await webViewLabPage.submit();
    await expect(webViewLabPage.result).toHaveText(webViewData.form.expectedGreeting);
  });
});
