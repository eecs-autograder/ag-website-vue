import { Project } from "ag-client-typescript";
import { test as base } from "playwright/test";
import { fake_login, make_course, unique_name } from "../utils";

const admin = 'admin@local_test.autograder.io';

export const test = base.extend<{ project: Project }>({
  project: async ({}, use) => {
    const course = await make_course();
    await course.add_admins([admin]);
    const project = await Project.create(course.pk, {
      name: unique_name("Project"),
    });

    await use(project);
  },
});

test.beforeEach(async ({context, page, project}) => {
  await fake_login(context, admin);
  await page.goto(`/web/project_admin/${project.pk}`);
});
