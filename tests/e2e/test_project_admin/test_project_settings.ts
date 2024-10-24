import { Page } from "playwright/test";
import { test } from "./base_fixture";
import { fake_login } from "../utils";

async function save_and_refresh(page: Page) {
  await page.getByRole("button").getByText("save").click();
  return page.reload();
}

async function expect_checkboxes_not_checked(page: Page, labels: string[]) {
  for (const label of labels) {
    test.expect(await page.getByLabel(label).isChecked()).toBe(false);
  }
}

// test.beforeEach(async ({context, page, url}) => {
  // await page.goto('/');
  // console.log(url);
    // await page.goto(`/web/project_admin/${project.pk}`);
// });

// The way we set deadlines is going to change in the near future.
// TODO: Add e2e tests for the new deadline settings.
// Should include:
// - setting and clearing deadline options
// - UI errors shown
// - API errors shown
test.fixme("deadline settings", async () => {
  test.fail();
});

test("publish project checkbox", async ({ page }) => {
  const checkbox = page.getByLabel("publish project");
  test.expect(await checkbox.isChecked()).toBe(false);

  await checkbox.click();
  test.expect(await checkbox.isChecked()).toBe(true);
  await save_and_refresh(page);

  test.expect(await checkbox.isChecked()).toBe(true);
  await expect_checkboxes_not_checked(page, [
    "anyone with the link",
    "disable submitting",
    "publish final grades",
  ]);
});

test('"anyone with the link can submit" checkbox', async ({ page }) => {
  test.fail();
});

test('"temporarily disable submissions" checkbox', async ({ page }) => {
  test.fail();
});

test("publish grades checkbox", async ({ page }) => {
  test.fail();
});

[
  { min_group_size: 1, max_group_size: 1 },
  { min_group_size: 1, max_group_size: 2 },
  { min_group_size: 3, max_group_size: 5 },
  { min_group_size: 4, max_group_size: 4 },
].forEach(({ min_group_size, max_group_size }) => {
  test(`valid group size: min=${min_group_size}, max=${max_group_size}: `, async ({
    page,
  }) => {
    test.fail();
  });
});

test("API error when min group size > max group size", async ({ page }) => {
  test.fail();
});

test("form error when min group size blank", async ({ page }) => {
  test.fail();
});

test("form error when min group size 0", async ({ page }) => {
  test.fail();
});

test("form error when max group size blank", async ({ page }) => {
  test.fail();
});

test('"disable group registration" checkbox', async ({ page }) => {
  test.fail();
});

test("final graded submission policy", async ({ page }) => {
  test.fail();
});

test("daily submission limit", async ({ page }) => {
  test.fail();
});

test("email receipt options", async ({ page }) => {
  test.fail();
});

test("honor pledge options", async ({ page }) => {
  test.fail();
});

test("delete project", async ({ page }) => {
  test.fail();
});

test("API error deleting project that has tests", async ({ page }) => {
  test.fail();
});
