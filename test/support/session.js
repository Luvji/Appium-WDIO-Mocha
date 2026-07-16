import { remote } from "webdriverio";
import { server } from "../config/android.js";

export function createSession(capabilities, connection = server) {
  return remote({
    ...connection,
    capabilities,
  });
}

export async function closeSession(driver) {
  if (driver?.sessionId) await driver.deleteSession();
}
