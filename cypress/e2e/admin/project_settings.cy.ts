const username = Cypress.env('admin')
const course_name = 'Nerdy Algos'
const project_name = 'TSP'

const build_full_url = (uri: string): string => {
  return Cypress.config().baseUrl + uri
}

describe('project settings page as admin', () => {
  beforeEach(() => {
    cy.task('setup_db')
      .create_course(course_name)
      .as('course_pk', { type: 'static' });

    cy.fake_login(username)
      .get('@course_pk').then((course_pk) => {
        cy.create_project(Number(course_pk), project_name).as('project_pk', { type: 'static' });
      });

    cy.get('@project_pk').then(pk => {
      cy.wrap(`/web/project_admin/${pk}`).as('page_uri')
    });
  })

  it('has functioning navbar tabs', function() {
    cy.visit(this.page_uri)
      .get_by_testid('settings-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=settings`))

    cy.visit(this.page_uri)
      .get_by_testid('instructor-files-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=instructor_files`))

    cy.visit(this.page_uri)
      .get_by_testid('instructor-files-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=instructor_files`))

    cy.visit(this.page_uri)
      .get_by_testid('student-files-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=expected_student_files`))

    cy.visit(this.page_uri)
      .get_by_testid('test-cases-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=test_cases`))

    cy.visit(this.page_uri)
      .get_by_testid('mutation-testing-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=mutation_testing`))

    cy.visit(this.page_uri)
      .get_by_testid('edit-groups-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=edit_groups`))

    cy.visit(this.page_uri)
      .get_by_testid('download-grades-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=download_grades`))

    cy.visit(this.page_uri)
      .get_by_testid('rerun-tests-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=rerun_tests`))

    cy.visit(this.page_uri)
      .get_by_testid('handgrading-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=handgrading`))

    cy.visit(this.page_uri)
      .get_by_testid('stats-tab')
      .should('be.visible').click()
      .url().should('eq', build_full_url(`${this.page_uri}?current_tab=stats`))
  });

  it('allows user to set and delete soft deadline', function() {
    // April 3, 2024 12:01 PM
    const now = new Date(2024, 3, 14, 12, 1)
    cy.clock(now)

    const new_date = '15'
    const new_hours = '2'
    const new_minutes = '30'

    // See FIXME below...
    const new_datetime_str = 'April 15, 2024, 02:30 PM PDT'

    cy.visit(this.page_uri)
      .get_by_testid('soft-deadline-input').should('be.visible').click();

    cy.get_by_testid('soft-deadline-picker').should('be.visible').find('.available-day')
      .contains(new_date).should('be.visible').click();

    cy.get_by_testid('period-input').should('be.visible').should('have.value', 'PM').click();

    cy.get_by_testid('hour-input').should('be.visible').should('have.value', '12')
      .type(new_hours);

    cy.get_by_testid('minute-input').should('be.visible').should('have.value', '01')
      .type(new_minutes);

    // TZ environment variable is set within the npm script
    cy.get_by_testid('timezone-select').should('have.value', 'America/Los_Angeles');

    // FIXME?: It feels weird that the period automatically switches to AM when typing a new value
    cy.get_by_testid('period-input').should('be.visible').should('have.value', 'AM').click();

    // check date has been updated on page
    cy.get_by_testid('soft-deadline-input').should('contain.text', new_datetime_str)

    // save amd check that new data is loaded on refresh
    cy.get_by_testid('save-button').should('be.visible').click()

    cy.reload().get_by_testid('soft-deadline-input').should('contain.text', new_datetime_str)
  })
})
