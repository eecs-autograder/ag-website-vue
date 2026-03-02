import { Course, Project } from "ag-client-typescript";
import { test as base, Page } from "playwright/test";
import { fake_login, make_course, unique_name } from "../utils";

const admin = "admin@local_test.autograder.io";

export const test = base.extend<{
  course: Course;
  project: Project;
  page: Page;
  save: () => Promise<void>;
}>({
  // eslint-disable-next-line no-empty-pattern
  course: async ({}, use) => {
    const course = await make_course();
    await course.add_admins([admin]);
    await use(course);
  },
  project: async ({ course }, use) => {
    const project = await Project.create(course.pk, {
      name: unique_name("Project"),
      timezone: "America/Detroit",
    });
    await use(project);
  },
  page: async ({ page, project }, use) => {
    await fake_login(page.context(), admin);
    await page.goto(`/web/project_admin/${project.pk}`);

    await use(page);
  },
  save: async ({ page }, use) => {
    const saveButton = page.getByRole("button", { name: /^save$/i });

    const save = async () => {
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.ok() &&
            r.request().method() === "PATCH" &&
            r.url().includes("/api/projects/"),
        ),
        saveButton.click(),
      ]);
    };

    await use(save);
  },
});
