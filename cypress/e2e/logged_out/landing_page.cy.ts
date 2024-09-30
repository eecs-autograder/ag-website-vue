/// <reference types="cypress" />

describe('landing page as logged out user', () => {
  beforeEach(() => {
    cy.task('setup_db');
  })

  it('displays login button', () => {
    cy.visit('http://localhost:8080').get('[data-testid=login_button')
  })

  it('displays link to GitHub', () => {
    cy.visit('http://localhost:8080').get('[data-testid=github-icon]')
  })
})
