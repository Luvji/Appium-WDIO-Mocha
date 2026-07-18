export const authData = Object.freeze({
  invalidCredentials: Object.freeze({
    incorrectPassword: "incorrect-password",
    expectedMessage: "Authentication failed: Incorrect username or password. Please try again.",
  }),

  emptyUsername: Object.freeze({
    username: "",
    expectedMessage: "Username is required.",
  }),

  emptyPassword: Object.freeze({
    password: "",
    expectedMessage: "Password is required.",
  }),

  lockedAccount: Object.freeze({
    expectedMessage: "Your account has been locked.",
  }),

  logoutConfirmation: Object.freeze({
    title: "Log out?",
    message: "You will return to the sign-in screen.",
  }),
});
