import { requiredEnvironmentVariable } from "../config/environment.js";

export function getValidUser() {
  return {
    username: requiredEnvironmentVariable("TEST_USERNAME"),
    password: requiredEnvironmentVariable("TEST_PASSWORD"),
  };
}

// function requiredEnvironmentVariable(name) {
//   const value = process.env[name];

//   if (!value) {
//     throw new Error(`Missing required environment variable: ${name}`);
//   }

//   return value;
// }

// export const users = {
//   valid: {
//     username: requiredEnvironmentVariable("TEST_USERNAME"),

//     password: requiredEnvironmentVariable("TEST_PASSWORD"),
//   },
//   invalid: {
//     username: "TEST_INVALID_USERNAME",

//     password: "TEST_INVALID_PASSWORD",
//   },
// };
