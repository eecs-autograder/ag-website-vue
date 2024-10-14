// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import {
  AGTestCase,
  AGTestSuite,
  Course,
  NewAGTestCaseData,
  NewAGTestSuiteData,
  NewCourseData,
  NewProjectData,
  Semester,
  Project,
} from "ag-client-typescript";

import "./commands";

const { superuser, admin, staff, student } = Cypress.env();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Cypress {
      env(key: "superuser" | "admin" | "staff" | "student"): string
    }

    interface Chainable {
      validate_checkbox_bindings(...testids: string[]): Chainable;

      /**
       * Create a course by making a POST request to the API. Yields the primary
       * key of the new course.
       * @param {string} course_name The name of the course to be made
       */
      create_course(course_name: string): Chainable;

      /**
       * Create a project by making a POST request to the API. Yields the primary
       * key of the new project.
       * @param {number} course_pk The primary key of the course to make the project under
       * @param {string} project_name The name of the project to be made
       */
      create_project(course_pk: number, project_name: string): Chainable;

      /**
       * Create a test suite by making a POST request to the API. Yields the primary
       * key of the new test suite.
       * @param {number} course_pk The primary key of the course to make the project under
       * @param {string} test_suite_name The name of the project to be made
       */
      create_test_suite(course_pk: number, test_suite_name: string): Chainable;

      /**
       * Create a test case by making a POST request to the API. Yields the primary
       * key of the new test suite.
       * @param {number} test_suite_pk The primary key of the course to make the project under
       * @param {string} test_case_name The name of the project to be made
       */
      create_test_case(
        test_suite_pk: number,
        test_case_name: string,
      ): Chainable;

      /**
       * Log a user in by setting the necessary session cookies.
       * This command assumes the backend is running with "fake" auth
       * @param {string} username the username of the user to be logged in
       */
      fake_login(username: string): Chainable;

      /**
       * Log the current user out by clearing session cookies.
       */
      logout(): Chainable;

      /**
       * Save the current page.
       */
      save(): Chainable;

      /**
       * Save the current page and refresh. Fails if there are any API errors
       * on the page (data-testid=api-error) after saving or after reloading.
       */
      save_and_reload(): Chainable;

      /**
       * Yield all API errors that are rendered on the page (data-testid=api-error).
       */
      get_api_errors(): Chainable;
    }
  }
}

beforeEach(() => {
  cy.task("setup_db");
});

Cypress.Commands.add("validate_checkbox_bindings", (...testids) => {

})

Cypress.Commands.add("get_api_errors", () => {
  cy.get_by_testid("api-error");
});

Cypress.Commands.add("save", () => {
  cy.get_by_testid("save-button").click();
});

Cypress.Commands.add("save_and_reload", () => {
  cy.save()
    .get_api_errors()
    .should("have.length", 0)
    .reload()
    .get_api_errors()
    .should("have.length", 0);
});

Cypress.Commands.add("fake_login", (username) => {
  cy.setCookie("token", "foo").setCookie("username", username);
});

Cypress.Commands.add("logout", () => {
  cy.clearAllCookies();
});

Cypress.Commands.add("create_course", (course_name) => {
  // We need to use Cypress promises to be sure this works with the command queue.
  // See https://docs.cypress.io/api/utilities/promise#Waiting-for-Promises
  cy.fake_login(superuser)
    .then(() => {
      return new Cypress.Promise<Course>(async (resolve, _) => {
        const course = await Course.create(
          new NewCourseData({
            name: course_name,
            semester: Semester.winter,
            year: 2024,
            subtitle: "This is a course",
            num_late_days: 1,
          }),
        );
        resolve(course);
      });
    })
    .then((course) => {
      return new Cypress.Promise<Course>(async (resolve, _) => {
        await course.add_admins([admin]);
        resolve(course);
      });
    })
    .then((course) => {
      return new Cypress.Promise<Course>(async (resolve, _) => {
        await course.add_staff([staff]);
        resolve(course);
      });
    })
    .then((course) => {
      return new Cypress.Promise<Course>(async (resolve, _) => {
        await course.add_students([student]);
        resolve(course);
      });
    })
    .then((course) => {
      return cy.wrap(course.pk);
    });
});

Cypress.Commands.add("create_project", (course_pk, project_name) => {
  // We need to use Cypress promises to be sure this works with the command queue.
  // See https://docs.cypress.io/api/utilities/promise#Waiting-for-Promises
  cy.fake_login(admin)
    .then(() => {
      return new Cypress.Promise<Project>(async (resolve, _) => {
        const project = await Project.create(
          course_pk,
          new NewProjectData({
            name: project_name,
          }),
        );
        resolve(project);
      });
    })
    .then((project) => {
      return cy.wrap(project.pk);
    });
});

Cypress.Commands.add("create_test_suite", (project_pk, test_suite_name) => {
  cy.fake_login(admin)
    .then(() => {
      return new Cypress.Promise<AGTestSuite>(async (resolve, _) => {
        const suite = await AGTestSuite.create(
          project_pk,
          new NewAGTestSuiteData({
            name: test_suite_name,
          }),
        );
        resolve(suite);
      });
    })
    .then((suite) => {
      return cy.wrap(suite.pk);
    });
});

Cypress.Commands.add("create_test_case", (test_suite_pk, test_case_name) => {
  cy.fake_login(admin)
    .then(() => {
      return new Cypress.Promise<AGTestCase>(async (resolve, _) => {
        const test_case = await AGTestCase.create(
          test_suite_pk,
          new NewAGTestCaseData({
            name: test_case_name,
          }),
        );
        resolve(test_case);
      });
    })
    .then((test_case) => {
      return cy.wrap(test_case.pk);
    });
});


