import { test } from "./base_fixture";

test("updated soft deadline persists after reload", async ({ page, save }) => {
  const soft_deadline = page.getByRole("textbox", { name: "Soft Deadline" });

  const value = "2028-04-30T10:42";

  await soft_deadline.fill(value);
  await test.expect(soft_deadline).toHaveValue(value);
  await save();

  await page.reload();
  await test.expect(soft_deadline).toHaveValue(value);
});

test("updated hard deadline persists after reload", async ({ page, save }) => {
  const hard_deadline = page.getByRole("textbox", { name: "Hard Deadline" });

  const value = "2028-04-30T10:42";

  await hard_deadline.fill(value);
  await save();
  await test.expect(hard_deadline).toHaveValue(value);

  await page.reload();
  await test.expect(hard_deadline).toHaveValue(value);
});

test("updating timezone persists after reload and doesn't affect wall time shown for deadlines", async ({
  page,
  save,
}) => {
  const soft_deadline = page.getByRole("textbox", { name: "Soft Deadline" });
  const hard_deadline = page.getByRole("textbox", { name: "Hard Deadline" });
  const timezone = page.getByLabel("Timezone");

  const time_value = "2028-04-30T10:42";
  const timezone_value = "America/Chicago";

  await soft_deadline.fill(time_value);
  await hard_deadline.fill(time_value);
  await save();

  await test
    .expect(timezone.locator(`option[value="${timezone_value}"]`))
    .toHaveCount(1);
  await timezone.selectOption(timezone_value);
  await test.expect(timezone).toHaveValue(timezone_value);
  await save();

  await page.reload();
  await test.expect(soft_deadline).toHaveValue(time_value);
  await test.expect(hard_deadline).toHaveValue(time_value);
  await test.expect(timezone).toHaveValue(timezone_value);
});
