import { test } from "playwright/test";
import { fake_login, make_course, SUPERUSER_NAME } from "./utils";

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

test("logout button", async ({ context, page }) => {
  await fake_login(context, "user@user.com");
  await page.goto("/");
  await test.expect(page.getByText("not enrolled")).toBeVisible();

  await page.getByLabel("Current User").hover();
  await page.getByRole("button").getByText("sign out").click();
  await test.expect(page.getByRole("main").getByText("sign in")).toBeVisible();
});

test("superuser dashboard link displayed for superuser", async ({
  context,
  page,
}) => {
  await fake_login(context, SUPERUSER_NAME);
  await page.goto("/");

  await page.getByLabel("Current User").hover();
  await test.expect(page.getByText("superuser dashboard")).toBeVisible();
});

test("superuser dashboard link hidden for non-superuser", async ({
  page,
  context,
}) => {
  await fake_login(context, "user@user.com");
  await page.goto("/");

  await page.getByLabel("Current User").hover();
  await test.expect(page.getByText("signed in ")).toBeVisible();
  await test.expect(page.getByText("superuser dashboard")).not.toBeVisible();
});

test("User's courses displayed", async ({ context, page }, testInfo) => {
  const username = "batman@umich.edu";

  const staff_course = await make_course();
  await staff_course.add_staff([username]);

  const admin_course = await make_course();
  await admin_course.add_admins([username]);

  const student_course = await make_course();
  await student_course.add_students([username]);

  const handgrader_course = await make_course();
  await handgrader_course.add_handgraders([username]);

  await fake_login(context, username);
  await page.goto("/");

  const course_panels = page.getByLabel("course");
  await test.expect(course_panels.getByText(staff_course.name)).toBeVisible();
  await test.expect(course_panels.getByText(admin_course.name)).toBeVisible();
  await test.expect(course_panels.getByText(student_course.name)).toBeVisible();
  await test
    .expect(course_panels.getByText(handgrader_course.name))
    .toBeVisible();
});

test("github link", async ({ page }) => {
  await page.goto("/");
  await test
    .expect(page.getByRole("banner").getByLabel("github"))
    .toBeVisible();
});

test("docs link", async ({ page }) => {
  await page.goto("/");
  await test
    .expect(page.getByRole("banner").getByLabel("documentation"))
    .toBeVisible();
});
