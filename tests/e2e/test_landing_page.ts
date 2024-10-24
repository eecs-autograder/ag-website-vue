import { test } from "playwright/test";

// TODO: Add missing tests when we assess/update the landing page
// for accessibility.

test("login button in banner", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByText("sign in").click();
  await page.getByText("not enrolled");
});

test("login button in body", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("main").getByText("sign in").click();
  await page.getByText("not enrolled");
});

test.fixme("logout button", async ({page}) => {
  fail();
});

test.fixme("User's courses displayed", async () => {
  fail();
});

test.fixme("github link", async () => {
  fail();
});

test.fixme("docs link", async () => {
  fail();
});

test.fixme("superuser dashboard link displayed for superuser", async () => {
  fail();
});

test.fixme("superuser dashboard link hidden for non-superuser", async () => {
  fail();
});
