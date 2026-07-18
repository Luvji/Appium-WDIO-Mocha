import { browser, expect } from "@wdio/globals";
import { LoginPage } from "../../../pages/login.page.js";
import { DashboardPage } from "../../../pages/dashboard.page.js";
import { AuthFlow } from "../../../flows/auth.flow.js";
import { getValidUser } from "../../../data/users.data.js";
import { authData } from "../../../data/auth.data.js";
import { AuthenticationLabPage } from "../../../pages/authentication-lab.page.js";

describe("WDIO Login Smoke", function () {
  let loginPage;
  let dashboardPage;
  let authFlow;
  let validUser;
  let authenticationLabPage;

  beforeEach(async function () {
      await browser.reloadSession();

    loginPage = new LoginPage(browser);
    dashboardPage = new DashboardPage(browser);
    authenticationLabPage = new AuthenticationLabPage(browser);

    authFlow = new AuthFlow(loginPage, dashboardPage,authenticationLabPage);

    validUser = getValidUser();
  });

  it("accepts valid credentials", async function () {
    await authFlow.loginAs(validUser.username, validUser.password);

    await expect(dashboardPage.hero).toBeDisplayed();
  });

  it('rejects an incorrect password', async function () {
    await loginPage.login( validUser.username,
      authData.invalidCredentials.incorrectPassword,);

    await expect( loginPage.invalidPasswordMessage, ).toBeDisplayed();
    await expect( loginPage.invalidPasswordMessage,).toHaveText( authData.invalidCredentials.expectedMessage,
    );
    await expect( dashboardPage.hero,).not.toBeDisplayed();
  });
});

