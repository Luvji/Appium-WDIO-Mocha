import { LoginPage } from "../../../pages/login.page.js";
import { DashboardPage } from "../../../pages/dashboard.page.js";
import { AuthenticationLabPage } from "../../../pages/authentication-lab.page.js";
import { GestureLabPage } from "../../../pages/gesture-lab.page.js";
import { BottomNavigation } from "../../../components/bottom-navigation.component.js";
import { AuthFlow } from "../../../flows/auth.flow.js";
import { DashboardFlow } from "../../../flows/dashboard.flow.js";
import { getValidUser } from "../../../data/users.data.js";
import { gestureData } from "../../../data/gesture.data.js";

describe("Gesture Lab", () => {
  let loginPage;
  let dashboardPage;
  let authenticationLabPage;
  let gestureLabPage;
  let bottomNavigation;
  let authFlow;
  let dashboardFlow;

  const user = getValidUser();

  before(() => {
    loginPage = new LoginPage(browser);
    dashboardPage = new DashboardPage(browser);

    authenticationLabPage = new AuthenticationLabPage(browser);

    gestureLabPage = new GestureLabPage(browser);
    bottomNavigation = new BottomNavigation(browser);

    authFlow = new AuthFlow(loginPage, dashboardPage, authenticationLabPage, bottomNavigation);

    dashboardFlow = new DashboardFlow(loginPage, dashboardPage, bottomNavigation);
  });

  beforeEach(async () => {
    await authFlow.ensureLoggedIn(user.username, user.password);

    await dashboardFlow.reachDashboard();
    await dashboardPage.openGestureLab();
    await gestureLabPage.waitUntilLoaded();

    await expect(gestureLabPage.gesturePad).toHaveText(gestureData.initialResult);
  });

  it("recognizes a right swipe", async () => {
    await gestureLabPage.swipeRight();
    await expect(gestureLabPage.gesturePad).toHaveText(gestureData.swipeRightResult);
  });

  it("recognizes a left swipe", async () => {
    await gestureLabPage.swipeLeft();
    await expect(gestureLabPage.gesturePad).toHaveText(gestureData.swipeLeftResult);
  });

  it("recognizes an upward swipe", async () => {
    await gestureLabPage.swipeUp();
    await expect(gestureLabPage.gesturePad).toHaveText(gestureData.swipeUpResult);
  });

  it("recognizes a downward swipe", async () => {
    await gestureLabPage.swipeDown();
    await expect(gestureLabPage.gesturePad).toHaveText(gestureData.swipeDownResult);
  });

  it("recognizes a two-finger pinch", async () => {
    await gestureLabPage.pinch();
    await expect(gestureLabPage.gesturePad).toHaveText(gestureData.pinchResult);
  });
});
