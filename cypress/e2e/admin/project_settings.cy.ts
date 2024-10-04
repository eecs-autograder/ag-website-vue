/// <reference types="cypress" />

const username = Cypress.env('admin')
const course_name = 'Nerdy Algos'
const project_name = 'TSP'

const build_full_url = (uri: string): string => {
  return Cypress.config().baseUrl + uri
}

describe('project settings page as admin', () => {
  beforeEach(() => {
    cy.create_course(course_name).as('course_pk', { type: 'static' });

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

    // FIXME?: It feels weird that the period automatically switches to AM when typing a new value
    // even without clicking here the period would switch after typing the new hours below
    cy.get_by_testid('period-input').should('be.visible').should('have.value', 'PM')
      .click().should('have.value', 'AM');

    cy.get_by_testid('hour-input').should('be.visible').should('have.value', '12')
      .type(new_hours);

    cy.get_by_testid('minute-input').should('be.visible').should('have.value', '01')
      .type(new_minutes);

    // TZ environment variable is set within the npm script
    cy.get_by_testid('timezone-select').should('have.value', 'America/Los_Angeles');

    cy.get_by_testid('period-input').should('be.visible').should('have.value', 'AM')
      .click().should('have.value', 'PM');

    // check date has been updated on page
    cy.get_by_testid('soft-deadline-input').should('contain.text', new_datetime_str)

    // save and check that new data is loaded on refresh
    cy.save_and_reload().get_by_testid('soft-deadline-input')
      .should('contain.text', new_datetime_str)

    // check that soft deadline can be deleted
    cy.get_by_testid('clear-soft-deadline').should('be.visible').click()
    cy.get_by_testid('soft-deadline-input').should('not.contain.text', new_datetime_str)

    cy.save_and_reload().get_by_testid('soft-deadline-input')
      .should('not.contain.text', new_datetime_str)
  })

  it('allows user to set and delete hard deadline', function() {
    // April 3, 2024 12:01 PM
    const now = new Date(2024, 3, 14, 12, 1)
    cy.clock(now)

    const new_date = '15'
    const new_hours = '2'
    const new_minutes = '30'

    // See FIXME below...
    const new_datetime_str = 'April 15, 2024, 02:30 PM PDT'

    cy.visit(this.page_uri)
      .get_by_testid('hard-deadline-input').should('be.visible').click();

    cy.get_by_testid('hard-deadline-picker').should('be.visible').find('.available-day')
      .contains(new_date).should('be.visible').click();

    // FIXME?: It feels weird that the period automatically switches to AM when typing a new value
    // even without clicking here the period would switch after typing the new hours below
    cy.get_by_testid('period-input').should('be.visible').should('have.value', 'PM')
      .click().should('have.value', 'AM');

    cy.get_by_testid('hour-input').should('be.visible').should('have.value', '12')
      .type(new_hours);

    cy.get_by_testid('minute-input').should('be.visible').should('have.value', '01')
      .type(new_minutes);

    // TZ environment variable is set within the npm script
    cy.get_by_testid('timezone-select').should('have.value', 'America/Los_Angeles');

    cy.get_by_testid('period-input').should('be.visible').should('have.value', 'AM')
      .click().should('have.value', 'PM');

    // check date has been updated on page
    cy.get_by_testid('hard-deadline-input').should('contain.text', new_datetime_str);

    // save amd check that new data is loaded on refresh
    cy.save_and_reload().get_by_testid('hard-deadline-input')
      .should('contain.text', new_datetime_str);

    // check that hard deadline can be deleted
    cy.get_by_testid('clear-hard-deadline').should('be.visible').click()
    cy.get_by_testid('hard-deadline-input').should('not.contain.text', new_datetime_str);

    cy.save_and_reload().get_by_testid('hard-deadline-input')
      .should('not.contain.text', new_datetime_str);
  })

  it('shows deadline related API errors', function() {
    const now = new Date(2024, 3, 14, 12, 1)
    cy.clock(now)
    const invalid_soft_deadline = '17';
    const valid_soft_deadline = '15';
    const hard_deadline = '16';

    cy.visit(this.page_uri)
      .get_by_testid('soft-deadline-input').should('be.visible').click()
      .get_by_testid('soft-deadline-picker').should('be.visible').find('.available-day')
      .contains(invalid_soft_deadline).should('be.visible').click()
      .get_by_testid('hard-deadline-input').should('be.visible').click()
      .get_by_testid('hard-deadline-picker').should('be.visible').find('.available-day')
      .contains(hard_deadline).should('be.visible').click();

    cy.save().get_api_errors().should('have.length', 1).first().should('contain.text', 'closing time');

    // make sure error goes away after valid request
    cy.get_by_testid('soft-deadline-picker').should('be.visible').find('.available-day')
      .contains(valid_soft_deadline).should('be.visible').click()
      .save_and_reload();
  })

  it('allows user to update project access', function() {
    enum CheckboxId {
      visible_to_students = 'visible-to-students',
      guests_can_submit = 'guests-can-submit',
      disallow_student_submissions = 'disallow-student-submissions',
      publish_final_grades = 'publish-final-grades'
    }

    const assert_checkbox_values = (...args: CheckboxId[]) => {
      const all_boxes = [
        CheckboxId.visible_to_students, CheckboxId.guests_can_submit,
        CheckboxId.disallow_student_submissions, CheckboxId.publish_final_grades
      ];
      all_boxes.map(box_id => {
        if (args.includes(box_id)) {
          cy.get_by_testid(box_id).should('be.checked');
        }
        else {
          cy.get_by_testid(box_id).should('not.be.checked');
        }
      });
    }

    cy.visit(this.page_uri);
    assert_checkbox_values();

    cy.get_by_testid(CheckboxId.visible_to_students).check();
    assert_checkbox_values(CheckboxId.visible_to_students);
    cy.save_and_reload();
    assert_checkbox_values(CheckboxId.visible_to_students);

    cy.get_by_testid(CheckboxId.guests_can_submit).check()
    assert_checkbox_values(CheckboxId.visible_to_students, CheckboxId.guests_can_submit);
    cy.save_and_reload();
    assert_checkbox_values(CheckboxId.visible_to_students, CheckboxId.guests_can_submit);


    cy.get_by_testid(CheckboxId.visible_to_students).uncheck();
    assert_checkbox_values(CheckboxId.guests_can_submit);
    cy.save_and_reload();
    assert_checkbox_values(CheckboxId.guests_can_submit);

    cy.get_by_testid(CheckboxId.disallow_student_submissions).check()
    assert_checkbox_values(CheckboxId.disallow_student_submissions, CheckboxId.guests_can_submit);
    cy.save_and_reload();
    assert_checkbox_values(CheckboxId.disallow_student_submissions, CheckboxId.guests_can_submit);

    cy.get_by_testid(CheckboxId.guests_can_submit).uncheck();
    assert_checkbox_values(CheckboxId.disallow_student_submissions);
    cy.save_and_reload();
    assert_checkbox_values(CheckboxId.disallow_student_submissions);

    cy.get_by_testid(CheckboxId.publish_final_grades).check()
    assert_checkbox_values(CheckboxId.disallow_student_submissions, CheckboxId.publish_final_grades);
    cy.save_and_reload();
    assert_checkbox_values(CheckboxId.disallow_student_submissions, CheckboxId.publish_final_grades);

    cy.get_by_testid(CheckboxId.disallow_student_submissions).uncheck();
    assert_checkbox_values(CheckboxId.publish_final_grades);
    cy.save_and_reload();
    assert_checkbox_values(CheckboxId.publish_final_grades);

    cy.get_by_testid(CheckboxId.publish_final_grades).uncheck();
    assert_checkbox_values();
    cy.save_and_reload();
    assert_checkbox_values();
  })

  it('allows user to update group settings with valid values', function() {
    enum ElementId {
      min = 'min-group-size',
      max = 'max-group-size',
      disallow = 'disallow-group-registration'
    }

    const assert_correct_values = (min: number, max: number, disallow: boolean) => {
      cy.get_by_testid(ElementId.min).should('have.value', min)
        .get_by_testid(ElementId.max).should('have.value', max);

      if (disallow) {
        cy.get_by_testid(ElementId.disallow).should('be.checked');
      }
      else {
        cy.get_by_testid(ElementId.disallow).should('not.be.checked');
      }
    }

    cy.visit(this.page_uri);
    assert_correct_values(1, 1, false);

    cy.get_by_testid(ElementId.max).should('be.visible').type('{moveToEnd}{backspace}12');
    assert_correct_values(1, 12, false);
    cy.save_and_reload()
    assert_correct_values(1, 12, false);

    cy.get_by_testid(ElementId.min).should('be.visible').type('{moveToEnd}{backspace}2');
    assert_correct_values(2, 12, false);
    cy.save_and_reload()
    assert_correct_values(2, 12, false);

    cy.get_by_testid(ElementId.disallow).should('be.visible').check();
    assert_correct_values(2, 12, true);
    cy.save_and_reload()
    assert_correct_values(2, 12, true);

    cy.get_by_testid(ElementId.max).should('be.visible').type('{moveToEnd}{backspace}{backspace}9');
    assert_correct_values(2, 9, true);
    cy.save_and_reload()
    assert_correct_values(2, 9, true);

    cy.get_by_testid(ElementId.min).should('be.visible').type('{moveToEnd}{backspace}3');
    assert_correct_values(3, 9, true);
    cy.save_and_reload()
    assert_correct_values(3, 9, true);

    cy.get_by_testid(ElementId.disallow).should('be.visible').uncheck();
    assert_correct_values(3, 9, false);
    cy.save_and_reload()
    assert_correct_values(3, 9, false);
  })

  it('shows group settings related API errors', function() {
    cy.visit(this.page_uri).get_by_testid('min-group-size').type('{backspace}22')
      .save().get_api_errors().should('have.length', 1).should('contain.text', 'group size');

    // make sure error goes away after valid request
    cy.get_by_testid('max-group-size').type('{backspace}33').save_and_reload();
  })

  it('does not allow the user to update group settings with invalid values', function() {
    enum ElementId {
      min = 'min-group-size',
      min_err = 'min-group-size-error',
      max = 'max-group-size',
      max_err = 'max-group-size-error',
      disallow = 'disallow-group-registration',
      save = 'save-button'
    }
    cy.visit(this.page_uri);

    cy.get_by_testid(ElementId.min).should('be.visible').type('10a')
      .get_by_testid(ElementId.min_err).should('contain.text', 'integer')
      .get_by_testid(ElementId.save).should('be.disabled').click({force: true})
      .get_by_testid(ElementId.max).should('be.visible').type('b0')
      .get_by_testid(ElementId.max_err).should('contain.text', 'integer')
      .get_by_testid(ElementId.save).should('be.disabled').click({force: true})
      .reload()
      .get_by_testid(ElementId.min).should('have.value', 1)
      .get_by_testid(ElementId.max).should('have.value', 1);

    cy.get_by_testid(ElementId.min).should('be.visible').type('.1')
      .get_by_testid(ElementId.min_err).should('contain.text', 'integer')
      .get_by_testid(ElementId.save).should('be.disabled').click({force: true})
      .get_by_testid(ElementId.max).should('be.visible').type('.2')
      .get_by_testid(ElementId.max_err).should('contain.text', 'integer')
      .get_by_testid(ElementId.save).should('be.disabled').click({force: true})
      .reload()
      .get_by_testid(ElementId.min).should('have.value', 1)
      .get_by_testid(ElementId.max).should('have.value', 1);

    cy.get_by_testid(ElementId.min).should('be.visible').type('{backspace}-1')
      .get_by_testid(ElementId.min_err).should('contain.text', '>= 1')
      .get_by_testid(ElementId.save).should('be.disabled').click({force: true})
      .get_by_testid(ElementId.max).should('be.visible').type('{backspace}0')
      .get_by_testid(ElementId.max_err).should('contain.text', '>= 1')
      .get_by_testid(ElementId.save).should('be.disabled').click({force: true})
      .reload()
      .get_by_testid(ElementId.min).should('have.value', 1)
      .get_by_testid(ElementId.max).should('have.value', 1);
  })

  it('allows the user to update the grading policy', function() {
    cy.visit(this.page_uri).get_by_testid('ultimate-submission-policy')
      .should('be.visible').select('best').save_and_reload()
      .get_by_testid('ultimate-submission-policy').should('have.value', 'best');

    cy.get_by_testid('ultimate-submission-policy')
      .should('be.visible').select('most_recent').save_and_reload()
      .get_by_testid('ultimate-submission-policy').should('have.value', 'most_recent');
  })

  it('allows the user to update submission limits', function() {
    cy.visit(this.page_uri)
  })
})
