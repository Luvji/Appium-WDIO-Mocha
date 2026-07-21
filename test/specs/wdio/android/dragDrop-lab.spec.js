import { LoginPage } from "../../../pages/login.page.js";
import { DashboardPage } from "../../../pages/dashboard.page.js";
import { DragDropLabPage } from "../../../pages/dragDrop-lab.page.js";
import { AuthenticationLabPage } from "../../../pages/authentication-lab.page.js";
import { AuthFlow } from "../../../flows/auth.flow.js";
import { getValidUser } from "../../../data/users.data.js";
// import { authData } from "../../../data/auth.data.js";
import { DashboardFlow } from "../../../flows/dashboard.flow.js";
import { dragDropData } from "../../../data/dragDrop.data.js";
import { BottomNavigation } from "../../../components/bottom-navigation.component.js";

describe("Drag drop Lab", () => {
  let loginPage;
  let dashboardPage;
  let authenticationLabPage;
  let authFlow;
  let dashboardFlow;
  let dragDropLabPage;
  let bottomNavigation;
  const user = getValidUser();

  before(async () => {
    loginPage = new LoginPage(browser);
    dashboardPage = new DashboardPage(browser);
    authenticationLabPage = new AuthenticationLabPage(browser);
    dragDropLabPage = new DragDropLabPage(browser);
    bottomNavigation = new BottomNavigation(browser);

    dashboardFlow = new DashboardFlow(loginPage, dashboardPage, bottomNavigation);
    authFlow = new AuthFlow(loginPage, dashboardPage, authenticationLabPage, bottomNavigation);
  });

  beforeEach(async () => {
    await authFlow.ensureLoggedIn(user.username, user.password);
    await dashboardFlow.reachDashboard();

    await dashboardPage.openDragDropLab();

    await dragDropLabPage.waitUntilLoaded();
    await expect(dragDropLabPage.dragDropTitle).toBeDisplayed();
    await expect(dragDropLabPage.dragDropTitle).toHaveText(dragDropData.dragDropTitle);
  });

  it("drags and drop element successfully", async function () {
    await dragDropLabPage.tapAccessibleTab();
    await expect(dragDropLabPage.accessibleDragBoard).toBeDisplayed();
    await expect(dragDropLabPage.accessibleDragBoardResult).toHaveText(dragDropData.initialResult);
    await dragDropLabPage.dragSourceToTarget();

    await expect(dragDropLabPage.accessibleDragBoardResult).toHaveText(dragDropData.dragDropSuccessText);
  });
});
