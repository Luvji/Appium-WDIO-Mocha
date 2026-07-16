import assert from "node:assert/strict";
import { HomePage } from "../../pages/home.page.js";
import { LoginPage } from "../../../test/pages/login.page.js";
import { DashboardPage } from "../../../test/pages/dashboard.page.js";
import { AuthFlow } from "../../../test/flows/auth.flow.js";
// import { appCapabilities } from "../../config/android.js";
import { closeSession, createSession } from "../../support/session.js";
import { selectedCapabilities, selectedServer } from "../../config/android.js";
import { getValidUser } from "../../data/users.data.js";
import { dashboardData } from "../../data/dashboard.data.js";

describe("Home or Dashboard scenarios", function () {
  let driver;
  let homePage;
  let dashboard;
  let loginPage;
  let dashboardPage;
  let validUser;
  let authFlow;

  beforeEach(async () => {
    driver = await createSession(selectedCapabilities, selectedServer);

    const source = await driver.getPageSource();

    homePage = new HomePage(driver);
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);

    validUser = getValidUser();
    const authFlow = new AuthFlow(loginPage, dashboardPage);
    await authFlow.loginAs(validUser.username, validUser.password);
    dashboard = await homePage.waitForWelcomeHeroCard();
  });

  afterEach(async function () {
    await closeSession(driver);
  });

  // after(async function () {
  //   await closeSession(driver);
  // });

  it("shows the Controls Lab card", async function () {
    assert.equal(await dashboard.isDisplayed(), true);
    assert.equal(await homePage.controlsLabTitle(), dashboardData.cards.controlsLabTitle);
  });

  it("shows the Tap Lab card", async function () {
    assert.equal(await dashboard.isDisplayed(), true);
    assert.equal(await homePage.TapLabTitle(), dashboardData.cards.tapLabTitle);
  });
});
