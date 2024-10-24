import { test } from "playwright/test";

// TODO: Add missing tests when we assess/update the landing page
// for accessibility.

test("login button in banner", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByText("sign in").click();
  await test.expect(page.getByText("not enrolled")).toBeVisible();
});

test("login button in body", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("main").getByText("sign in").click();
  await test.expect(page.getByText("not enrolled")).toBeVisible();
});

test.fixme("logout button", async ({page}) => {
  test.fail();
});

test.fixme("User's courses displayed", async () => {
  test.fail();
});

test.fixme("github link", async () => {
  test.fail();
});

test.fixme("docs link", async () => {
  test.fail();
});

test.fixme("superuser dashboard link displayed for superuser", async () => {
  test.fail();
});

test.fixme("superuser dashboard link hidden for non-superuser", async () => {
  test.fail();
});
