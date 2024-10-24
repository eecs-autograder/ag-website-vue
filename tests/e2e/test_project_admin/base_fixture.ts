import { Course, Project } from "ag-client-typescript";
import { test as base, Page } from "playwright/test";
import { fake_login, make_course, unique_name } from "../utils";

const admin = 'admin@local_test.autograder.io';

export const test = base.extend<{course: Course, project: Project, page: Page }>({
  // eslint-disable-next-line no-empty-pattern
  course: async ({}, use) => {
    const course = await make_course();
    await course.add_admins([admin]);
    await use(course);
  },
  project: async ({course}, use) => {
    const project = await Project.create(course.pk, {
      name: unique_name("Project"),
    });
    await use(project);
  },
  page: async ({page, project}, use) => {
    await fake_login(page.context(), admin);
    await page.goto(`/web/project_admin/${project.pk}`);

    await use(page);
  },
});
