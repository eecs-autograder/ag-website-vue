import { test as setup } from "@playwright/test";
import { reset_db } from "./utils";

setup("Global Setup", () => {
  reset_db();
});
