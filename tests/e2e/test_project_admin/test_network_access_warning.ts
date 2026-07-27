import { Page } from "playwright/test";
import { test } from "./base_fixture";
import { unique_name } from "../utils";

// Directory where evidence screenshots are written, one subdir per browser.
const EVIDENCE_DIR =
  process.env.E2E_EVIDENCE_DIR ?? "test-results/network-access-evidence";

test.use({ video: "on" });

async function open_new_suite_settings(page: Page): Promise<string> {
  const suite_name = unique_name("Suite");

  await page.getByText("Test Cases", { exact: true }).click();
  await page.locator("#add-ag-test-suite-button").click();

  const new_suite_modal = page.getByRole("dialog", { name: "New suite" });
  await new_suite_modal.locator("#new-ag-test-suite-name").fill(suite_name);
  await new_suite_modal.getByRole("button", { name: "Add Suite" }).click();
  await test.expect(new_suite_modal).toBeHidden();

  // Open the newly created suite's settings pane.
  await page.getByRole("button", { name: suite_name }).click();
  return suite_name;
}

function evidence(browser: string, filename: string) {
  return `${EVIDENCE_DIR}/${browser}/${filename}`;
}

test("enabling network access requires confirming the warning modal, cancel keeps it disabled, and the confirmed value persists", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const browser = testInfo.project.name;
  const suite_name = await open_new_suite_settings(page);

  const checkbox = page.getByRole("checkbox", { name: "Allow network access" });
  const modal = page.getByRole("dialog", {
    name: "Confirm network access modal",
  });
  const warning_triangle = page.locator(".warning-tip");

  // Initial state: network access disabled, no modal, no warning triangle.
  await test.expect(checkbox).not.toBeChecked();
  await test.expect(modal).toBeHidden();
  await test.expect(warning_triangle).toBeHidden();
  await page.screenshot({
    path: evidence(browser, "1-initial-disabled.png"),
    fullPage: true,
  });

  // Checking the box opens the confirmation modal; the checkbox itself
  // reverts to unchecked until the user confirms.
  await checkbox.click();
  await test.expect(modal).toBeVisible();
  await test
    .expect(modal.getByRole("button", { name: "Allow network access" }))
    .toBeVisible();
  await test.expect(checkbox).not.toBeChecked();
  await page.screenshot({
    path: evidence(browser, "2-confirmation-modal.png"),
    fullPage: true,
  });

  // Cancelling leaves network access disabled.
  await modal.getByRole("button", { name: "Cancel" }).click();
  await test.expect(modal).toBeHidden();
  await test.expect(checkbox).not.toBeChecked();
  await test.expect(warning_triangle).toBeHidden();
  await page.screenshot({
    path: evidence(browser, "3-after-cancel-still-disabled.png"),
    fullPage: true,
  });

  // Confirming enables network access and shows the warning triangle.
  await checkbox.click();
  await test.expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Allow network access" }).click();
  await test.expect(modal).toBeHidden();
  await test.expect(checkbox).toBeChecked();
  await test.expect(warning_triangle).toBeVisible();
  await page.screenshot({
    path: evidence(browser, "4-enabled-with-warning.png"),
    fullPage: true,
  });

  // Save and make sure the setting persists across a reload.
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.ok() &&
        r.request().method() === "PATCH" &&
        r.url().includes("/api/ag_test_suites/"),
    ),
    // The hidden Project Settings tab also contains a .save-button, so
    // restrict to the one currently displayed.
    page.locator("button.save-button:visible").click(),
  ]);

  await page.reload();
  await page.getByRole("button", { name: suite_name }).click();
  await test.expect(checkbox).toBeChecked();
  await test.expect(warning_triangle).toBeVisible();
  await page.screenshot({
    path: evidence(browser, "5-persisted-after-reload.png"),
    fullPage: true,
  });
});

test("disabling network access does not show the confirmation modal", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const browser = testInfo.project.name;
  await open_new_suite_settings(page);

  const checkbox = page.getByRole("checkbox", { name: "Allow network access" });
  const modal = page.getByRole("dialog", {
    name: "Confirm network access modal",
  });
  const warning_triangle = page.locator(".warning-tip");

  // Enable network access (via the modal).
  await checkbox.click();
  await modal.getByRole("button", { name: "Allow network access" }).click();
  await test.expect(checkbox).toBeChecked();
  await test.expect(warning_triangle).toBeVisible();

  // Disabling flips the value immediately: no modal, triangle disappears.
  await checkbox.click();
  await test.expect(modal).toBeHidden();
  await test.expect(checkbox).not.toBeChecked();
  await test.expect(warning_triangle).toBeHidden();
  await page.screenshot({
    path: evidence(browser, "6-disable-without-modal.png"),
    fullPage: true,
  });
});
