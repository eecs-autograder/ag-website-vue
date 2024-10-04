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

import './commands'

const { superuser, admin, staff, student } = Cypress.env()

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a course by making a POST request to the API. Yields the primary
       * key of the new course.
       * @param {string} course_name The name of the course to be made
       */
      create_course(course_name: string): Chainable

      /**
       * Create a project by making a POST request to the API. Yields the primary
       * key of the new project.
       * @param {number} course_pk The primary key of the course to make the project under
       * @param {string} project_name The name of the project to be made
       */
      create_project(course_pk: number, project_name: string): Chainable

      /**
       * Log a user in by setting the necessary session cookies.
       * This command assumes the backend is running with "fake" auth
       * @param {string} username the username of the user to be logged in
       */
      fake_login(username: string): Chainable

      /**
       * Log the current user out by clearing session cookies.
       */
      logout(): Chainable

      /**
       * Save the current page.
       */
      save(): Chainable

      /**
       * Save the current page and refresh. Fails if there are any API errors
       * on the page (data-testid=api-error)
       */
      save_and_reload(): Chainable

      /**
       * Yield all API errors that are rendered on the page (data-testid=api-error).
       */
      get_api_errors(): Chainable
    }
  }
}

beforeEach(() => {
  cy.task('setup_db');
})

Cypress.Commands.add('get_api_errors', () => {
  cy.get_by_testid('api-error')
})

Cypress.Commands.add('save', () => {
  cy.get_by_testid('save-button').click()
})

Cypress.Commands.add('save_and_reload', () => {
  cy.save().get_api_errors().should('have.length', 0).reload();
})

Cypress.Commands.add('fake_login', username => {
  cy.setCookie('token', 'foo').setCookie('username', username)
})

Cypress.Commands.add('logout', () => {
  cy.clearAllCookies()
})

Cypress.Commands.add('create_course', course_name => {
  cy.fake_login(superuser)

  cy.request('POST', '/api/courses/', {
    'name': course_name,
    'semester': 'Fall',
    'year': 2024,
    'subtitle': 'This is a subtitle',
    'num_late_days': 0,
    'allowed_guest_domain': 'autograder.io'
  })
  .then((res) => cy.wrap(res.body.pk))
  .then((pk) => {
    cy.request('POST', `/api/courses/${pk}/admins/`, {
      'new_admins': [ admin ]
    });
    return cy.wrap(pk);
  })
  .then((pk) => {
    cy.request('POST', `/api/courses/${pk}/staff/`, {
      'new_staff': [ staff ]
    });
    return cy.wrap(pk);
  })
  .then((pk) => {
    cy.request('POST', `/api/courses/${pk}/students/`, {
      'new_students': [ student ]
    });
    cy.logout();
    return cy.wrap(pk);
  })
})

Cypress.Commands.add('create_project', (course_pk, project_name) => {
  cy.request('POST', `/api/courses/${course_pk}/projects/`, {
    'name': project_name
  }).then((res) => cy.wrap(res.body.pk))
})
