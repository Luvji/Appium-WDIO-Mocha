import { closeSession, createSession } from "../../support/session.js";
// import { appCapabilities } from "../../config/android.js";
import { LoginPage } from "../../pages/login.page.js";
import { DashboardPage } from "../../pages/dashboard.page.js";
import { AuthFlow } from "../../flows/auth.flow.js";
import assert from "node:assert/strict";
import { selectedCapabilities, selectedServer } from "../../config/android.js";
import { getValidUser } from "../../data/users.data.js";
import { authData } from "../../data/auth.data.js";

describe("Login", function () {
  let driver;
  let loginPage;
  let dashboardPage;
  let authFlow;
  let validUser;

  beforeEach(async function () {
    driver = await createSession(selectedCapabilities, selectedServer);

    const source = await driver.getPageSource();

    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    authFlow = new AuthFlow(loginPage, dashboardPage,authenticationLabPage);
    validUser = getValidUser();
  });

  afterEach(async function () {
    await closeSession(driver);
  });

  it("accepts valid credentials", async function () {
    await authFlow.loginAs(validUser.username, validUser.password);

    assert.equal(await dashboardPage.isLoaded(), true);
  });

  it("rejects an incorrect password", async function () {

    await loginPage.login(validUser.username, authData.invalidCredentials.incorrectPassword);

    assert.equal(await loginPage.isInvalidPasswordMessageDisplayed(), true);
    assert.equal(await loginPage.invalidPasswordMessageText(), authData.invalidCredentials.expectedMessage);
    assert.equal(await loginPage.isWelcomeMessageDisplayed(), false);
  });
});
