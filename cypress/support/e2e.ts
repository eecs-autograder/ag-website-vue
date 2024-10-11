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
      create_course(course_name: string): Chainable
      create_project(course_pk: number, project_name: string): Chainable
      fake_login(username: string): Chainable
      logout(): Chainable
    }
  }
}

Cypress.Commands.add('fake_login', username => {
  cy.setCookie('token', 'foo').setCookie('username', username)
})

Cypress.Commands.add('logout', () => {
  cy.clearAllCookies()
})

/*
  * Create a course by making a POST request to the API and yield the pk
  */
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

/*
  * Create a project by making a POST request to the API and yield the pk
  */
Cypress.Commands.add('create_project', (course_pk, project_name) => {
  cy.request('POST', `/api/courses/${course_pk}/projects/`, {
    'name': project_name
  }).then((res) => cy.wrap(res.body.pk))
})
