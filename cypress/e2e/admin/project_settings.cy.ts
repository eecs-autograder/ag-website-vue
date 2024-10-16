/// <reference types="cypress" />

const username = Cypress.env("admin");
const course_name = "Nerdy Algos";
const project_name = "TSP";

const build_full_url = (uri: string): string => {
  return Cypress.config().baseUrl + uri;
};

describe("project settings page as admin", () => {
  function set_up() {
    return cy
      .fake_login(username)
      .create_course(course_name)
      .then((course) => {
        return cy.create_project(course.pk, project_name).then((project) => {
          return {
            course: course,
            project: project,
            page_uri: `/web/project_admin/${project.pk}`,
          };
        });
      });
  }

  it("allows user to navigate to navigate to project submission page", () => {
    set_up().then(({ project, page_uri }) => {
      const submission_uri = `/web/project/${project.pk}`;
      cy.visit(page_uri)
        .get(`a[href="${submission_uri}"]`)
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(submission_uri));
    });
  });

  it("allows user to navigate to course page", () => {
    set_up().then(({ course, page_uri }) => {
      const course_uri = `/web/course/${course.pk}`;
      cy.visit(page_uri)
        .get(`a[href="${course_uri}"]`)
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(course_uri));
    });
  });

  it("allows user to navigate to course admin page", () => {
    set_up().then(({ course, page_uri }) => {
      const course_admin_uri = `/web/course_admin/${course.pk}`;
      cy.visit(page_uri)
        .get(`a[href="${course_admin_uri}"]`)
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(course_admin_uri));
    });
  });

  it("allows user to navigate to home page", () => {
    const home_page_uri = "/";
    cy.visit(home_page_uri)
      .get(`a[href="${home_page_uri}"]`)
      .should("be.visible")
      .click()
      .url()
      .should("eq", build_full_url(home_page_uri));
  });

  it("has functioning navbar tabs", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("settings-tab")
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(`${page_uri}?current_tab=settings`));

      cy.visit(page_uri)
        .get_by_testid("instructor-files-tab")
        .should("be.visible")
        .click()
        .url()
        .should(
          "eq",
          build_full_url(`${page_uri}?current_tab=instructor_files`),
        );

      cy.visit(page_uri)
        .get_by_testid("instructor-files-tab")
        .should("be.visible")
        .click()
        .url()
        .should(
          "eq",
          build_full_url(`${page_uri}?current_tab=instructor_files`),
        );

      cy.visit(page_uri)
        .get_by_testid("student-files-tab")
        .should("be.visible")
        .click()
        .url()
        .should(
          "eq",
          build_full_url(`${page_uri}?current_tab=expected_student_files`),
        );

      cy.visit(page_uri)
        .get_by_testid("test-cases-tab")
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(`${page_uri}?current_tab=test_cases`));

      cy.visit(page_uri)
        .get_by_testid("mutation-testing-tab")
        .should("be.visible")
        .click()
        .url()
        .should(
          "eq",
          build_full_url(`${page_uri}?current_tab=mutation_testing`),
        );

      cy.visit(page_uri)
        .get_by_testid("edit-groups-tab")
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(`${page_uri}?current_tab=edit_groups`));

      cy.visit(page_uri)
        .get_by_testid("download-grades-tab")
        .should("be.visible")
        .click()
        .url()
        .should(
          "eq",
          build_full_url(`${page_uri}?current_tab=download_grades`),
        );

      cy.visit(page_uri)
        .get_by_testid("rerun-tests-tab")
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(`${page_uri}?current_tab=rerun_tests`));

      cy.visit(page_uri)
        .get_by_testid("handgrading-tab")
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(`${page_uri}?current_tab=handgrading`));

      cy.visit(page_uri)
        .get_by_testid("stats-tab")
        .should("be.visible")
        .click()
        .url()
        .should("eq", build_full_url(`${page_uri}?current_tab=stats`));
    });
  });

  it("does not show elements that should be hidden on first load", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("hour-input")
        .should("not.exist")
        .get_by_testid("minute-input")
        .should("not.exist")
        .get(".calendar")
        .should("not.exist");
    });
  });

  it("allows user to set and delete soft deadline", () => {
    // April 3, 2024 12:01 PM
    const now = new Date(2024, 3, 14, 12, 1);
    cy.clock(now);

    const new_date = "15";

    // input should ignore non-numeric characters
    const new_hours = "2abc";
    const new_minutes = "30abc";

    // See FIXME below...
    const new_datetime_str = "April 15, 2024, 02:30 PM PDT";

    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("soft-deadline-input")
        .should("be.visible")
        .click();

      cy.get_by_testid("soft-deadline-picker")
        .should("be.visible")
        .find(".available-day")
        .contains(new_date)
        .should("be.visible")
        .click();

      // FIXME?: It feels weird that the period automatically switches to AM when typing a new value
      // even without clicking here the period would switch after typing the new hours below
      cy.get_by_testid("period-input")
        .should("be.visible")
        .should("have.value", "PM")
        .click()
        .should("have.value", "AM");

      cy.get_by_testid("hour-input")
        .should("be.visible")
        .should("have.value", "12")
        .type(new_hours);

      cy.get_by_testid("minute-input")
        .should("be.visible")
        .should("have.value", "01")
        .type(new_minutes);

      // TZ environment variable is set within the npm script
      cy.get_by_testid("timezone-select").should(
        "have.value",
        "America/Los_Angeles",
      );

      cy.get_by_testid("period-input")
        .should("be.visible")
        .should("have.value", "AM")
        .click()
        .should("have.value", "PM");

      // check date has been updated on page
      cy.get_by_testid("soft-deadline-input").should(
        "contain.text",
        new_datetime_str,
      );

      // save and check that new data is loaded on refresh
      cy.save_and_reload()
        .get_by_testid("soft-deadline-input")
        .should("contain.text", new_datetime_str);

      // check that soft deadline can be deleted
      cy.get_by_testid("clear-soft-deadline").should("be.visible").click();
      cy.get_by_testid("soft-deadline-input").should(
        "not.contain.text",
        new_datetime_str,
      );

      cy.save_and_reload()
        .get_by_testid("soft-deadline-input")
        .should("not.contain.text", new_datetime_str);
    });
  });

  it("allows user to set and delete hard deadline", () => {
    // April 3, 2024 12:01 PM
    const now = new Date(2024, 3, 14, 12, 1);
    cy.clock(now);

    const new_date = "15";

    // input should ignore non-numeric characters
    const new_hours = "2abc";
    const new_minutes = "30abc";

    // See FIXME below...
    const new_datetime_str = "April 15, 2024, 02:30 PM PDT";

    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("hard-deadline-input")
        .should("be.visible")
        .click();

      cy.get_by_testid("hard-deadline-picker")
        .should("be.visible")
        .find(".available-day")
        .contains(new_date)
        .should("be.visible")
        .click();

      // FIXME?: It feels weird that the period automatically switches to AM when typing a new value
      // even without clicking here the period would switch after typing the new hours below
      cy.get_by_testid("period-input")
        .should("be.visible")
        .should("have.value", "PM")
        .click()
        .should("have.value", "AM");

      cy.get_by_testid("hour-input")
        .should("be.visible")
        .should("have.value", "12")
        .type(new_hours);

      cy.get_by_testid("minute-input")
        .should("be.visible")
        .should("have.value", "01")
        .type(new_minutes);

      // TZ environment variable is set within the npm script
      cy.get_by_testid("timezone-select").should(
        "have.value",
        "America/Los_Angeles",
      );

      cy.get_by_testid("period-input")
        .should("be.visible")
        .should("have.value", "AM")
        .click()
        .should("have.value", "PM");

      // check date has been updated on page
      cy.get_by_testid("hard-deadline-input").should(
        "contain.text",
        new_datetime_str,
      );

      // save amd check that new data is loaded on refresh
      cy.save_and_reload()
        .get_by_testid("hard-deadline-input")
        .should("contain.text", new_datetime_str);

      // check that hard deadline can be deleted
      cy.get_by_testid("clear-hard-deadline").should("be.visible").click();
      cy.get_by_testid("hard-deadline-input").should(
        "not.contain.text",
        new_datetime_str,
      );

      cy.save_and_reload()
        .get_by_testid("hard-deadline-input")
        .should("not.contain.text", new_datetime_str);
    });
  });

  it("shows deadline related API errors", () => {
    const now = new Date(2024, 3, 14, 12, 1);
    cy.clock(now);
    const invalid_soft_deadline = "17";
    const valid_soft_deadline = "15";
    const hard_deadline = "16";
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("soft-deadline-input")
        .should("be.visible")
        .click()
        .get_by_testid("soft-deadline-picker")
        .should("be.visible")
        .find(".available-day")
        .contains(invalid_soft_deadline)
        .should("be.visible")
        .click()
        .get_by_testid("hard-deadline-input")
        .should("be.visible")
        .click()
        .get_by_testid("hard-deadline-picker")
        .should("be.visible")
        .find(".available-day")
        .contains(hard_deadline)
        .should("be.visible")
        .click();

      cy.save()
        .get_api_errors()
        .should("have.length", 1)
        .first()
        .should("contain.text", "closing time");

      // make sure error goes away after valid request
      cy.get_by_testid("soft-deadline-picker")
        .should("be.visible")
        .find(".available-day")
        .contains(valid_soft_deadline)
        .should("be.visible")
        .click()
        .save_and_reload();
    });
  });

  it("allows user to update project access", () => {
    enum CheckboxId {
      visible_to_students = "visible-to-students",
      guests_can_submit = "guests-can-submit",
      disallow_student_submissions = "disallow-student-submissions",
      publish_final_grades = "publish-final-grades",
    }

    const assert_checkbox_values = (...args: CheckboxId[]) => {
      const all_boxes = [
        CheckboxId.visible_to_students,
        CheckboxId.guests_can_submit,
        CheckboxId.disallow_student_submissions,
        CheckboxId.publish_final_grades,
      ];
      all_boxes.map((box_id) => {
        if (args.includes(box_id)) {
          cy.get_by_testid(box_id).should("be.checked");
        } else {
          cy.get_by_testid(box_id).should("not.be.checked");
        }
      });
    };

    set_up().then(({ page_uri }) => {
      cy.visit(page_uri);
      assert_checkbox_values();

      cy.get_by_testid(CheckboxId.visible_to_students).check();
      assert_checkbox_values(CheckboxId.visible_to_students);
      cy.save_and_reload();
      assert_checkbox_values(CheckboxId.visible_to_students);

      cy.get_by_testid(CheckboxId.guests_can_submit).check();
      assert_checkbox_values(
        CheckboxId.visible_to_students,
        CheckboxId.guests_can_submit,
      );
      cy.save_and_reload();
      assert_checkbox_values(
        CheckboxId.visible_to_students,
        CheckboxId.guests_can_submit,
      );

      cy.get_by_testid(CheckboxId.visible_to_students).uncheck();
      assert_checkbox_values(CheckboxId.guests_can_submit);
      cy.save_and_reload();
      assert_checkbox_values(CheckboxId.guests_can_submit);

      cy.get_by_testid(CheckboxId.disallow_student_submissions).check();
      assert_checkbox_values(
        CheckboxId.disallow_student_submissions,
        CheckboxId.guests_can_submit,
      );
      cy.save_and_reload();
      assert_checkbox_values(
        CheckboxId.disallow_student_submissions,
        CheckboxId.guests_can_submit,
      );

      cy.get_by_testid(CheckboxId.guests_can_submit).uncheck();
      assert_checkbox_values(CheckboxId.disallow_student_submissions);
      cy.save_and_reload();
      assert_checkbox_values(CheckboxId.disallow_student_submissions);

      cy.get_by_testid(CheckboxId.publish_final_grades).check();
      assert_checkbox_values(
        CheckboxId.disallow_student_submissions,
        CheckboxId.publish_final_grades,
      );
      cy.save_and_reload();
      assert_checkbox_values(
        CheckboxId.disallow_student_submissions,
        CheckboxId.publish_final_grades,
      );

      cy.get_by_testid(CheckboxId.disallow_student_submissions).uncheck();
      assert_checkbox_values(CheckboxId.publish_final_grades);
      cy.save_and_reload();
      assert_checkbox_values(CheckboxId.publish_final_grades);

      cy.get_by_testid(CheckboxId.publish_final_grades).uncheck();
      assert_checkbox_values();
      cy.save_and_reload();
      assert_checkbox_values();
    });
  });

  it.only("allows user to update group settings with valid values", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri);
      cy.get_by_testid("min-group-size")
        .should("be.visible")
        .should("have.value", 1);
      cy.get_by_testid("max-group-size")
        .should("be.visible")
        .should("have.value", 1);

      cy.do_multiple_input_binding_test([
        { "min-group-size": 2, "max-group-size": 3 },
        { "min-group-size": 1, "max-group-size": 4 },
        { "min-group-size": 4, "max-group-size": 4 },
        { "min-group-size": 1, "max-group-size": 1 },
      ]);
    });
  });

  it("shows group settings related API errors", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("min-group-size")
        .type("{backspace}22")
        .save()
        .get_api_errors()
        .should("have.length", 1)
        .should("contain.text", "group size");

      // make sure error goes away after valid request
      cy.get_by_testid("max-group-size")
        .type("{backspace}33")
        .save_and_reload();
    });
  });

  it("does not allow the user to update group settings with invalid values", () => {
    enum ElementId {
      min = "min-group-size",
      min_err = "min-group-size-error",
      max = "max-group-size",
      max_err = "max-group-size-error",
      disallow = "disallow-group-registration",
      save = "save-button",
    }

    set_up().then(({ page_uri }) => {
      cy.visit(page_uri);

      cy.get_by_testid(ElementId.min)
        .should("be.visible")
        .type("10a")
        .get_by_testid(ElementId.min_err)
        .should("contain.text", "integer")
        .get_by_testid(ElementId.save)
        .should("be.disabled")
        .click({ force: true })
        .get_by_testid(ElementId.max)
        .should("be.visible")
        .type("b0")
        .get_by_testid(ElementId.max_err)
        .should("contain.text", "integer")
        .get_by_testid(ElementId.save)
        .should("be.disabled")
        .click({ force: true })
        .reload()
        .get_by_testid(ElementId.min)
        .should("have.value", 1)
        .get_by_testid(ElementId.max)
        .should("have.value", 1);

      cy.get_by_testid(ElementId.min)
        .should("be.visible")
        .type(".1")
        .get_by_testid(ElementId.min_err)
        .should("contain.text", "integer")
        .get_by_testid(ElementId.save)
        .should("be.disabled")
        .click({ force: true })
        .get_by_testid(ElementId.max)
        .should("be.visible")
        .type(".2")
        .get_by_testid(ElementId.max_err)
        .should("contain.text", "integer")
        .get_by_testid(ElementId.save)
        .should("be.disabled")
        .click({ force: true })
        .reload()
        .get_by_testid(ElementId.min)
        .should("have.value", 1)
        .get_by_testid(ElementId.max)
        .should("have.value", 1);

      cy.get_by_testid(ElementId.min)
        .should("be.visible")
        .type("{backspace}-1")
        .get_by_testid(ElementId.min_err)
        .should("contain.text", ">= 1")
        .get_by_testid(ElementId.save)
        .should("be.disabled")
        .click({ force: true })
        .get_by_testid(ElementId.max)
        .should("be.visible")
        .type("{backspace}0")
        .get_by_testid(ElementId.max_err)
        .should("contain.text", ">= 1")
        .get_by_testid(ElementId.save)
        .should("be.disabled")
        .click({ force: true })
        .reload()
        .get_by_testid(ElementId.min)
        .should("have.value", 1)
        .get_by_testid(ElementId.max)
        .should("have.value", 1);
    });
  });

  it("lets user enable or disable group registration", () => {
    fail();
  });

  it("allows user to update the grading policy", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("ultimate-submission-policy")
        .should("be.visible")
        .select("best")
        .save_and_reload()
        .get_by_testid("ultimate-submission-policy")
        .should("have.value", "best");

      cy.get_by_testid("ultimate-submission-policy")
        .should("be.visible")
        .select("most_recent")
        .save_and_reload()
        .get_by_testid("ultimate-submission-policy")
        .should("have.value", "most_recent");
    });
  });

  it("allows user to update submission limits", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("submission-limit-per-day")
        .should("be.visible")
        .type("3")
        .should("have.value", "3")
        .save_and_reload()
        .get_by_testid("submission-limit-per-day")
        .should("have.value", "3");

      cy.get_by_testid("allow-submissions-past-limit")
        .should("be.visible")
        .should("be.checked")
        .uncheck()
        .should("not.be.checked")
        .get_by_testid("submission-limit-per-day")
        .type("{backspace}1")
        .save_and_reload()
        .get_by_testid("allow-submissions-past-limit")
        .should("not.be.checked")
        .get_by_testid("submission-limit-per-day")
        .should("have.value", "1");

      cy.get_by_testid("reset-time-input")
        .should("contain.text", "12:00 AM")
        .click()
        .get_by_testid("hour-input")
        .should("have.value", "12")
        .type("11")
        .should("have.value", "11")
        .get_by_testid("minute-input")
        .should("have.value", "00")
        .type("11")
        .should("have.value", "11")
        .get_by_testid("period-input")
        .should("have.value", "AM")
        .click()
        .should("have.value", "PM")
        .get_by_testid("reset-time-input")
        .should("contain.text", "11:11 PM")
        .get_by_testid("allow-submissions-past-limit")
        .should("not.be.checked")
        .check()
        .should("be.checked")
        .save_and_reload()
        .get_by_testid("reset-time-input")
        .should("contain.text", "11:11 PM");

      cy.get_by_testid("groups-combine-daily-submissions")
        .should("be.disabled")
        .should("not.be.checked")
        .get_by_testid("max-group-size")
        .type("{backspace}2") // needed to enable the checkbox
        .get_by_testid("groups-combine-daily-submissions")
        .check()
        .should("be.checked")
        .get_by_testid("submission-limit-reset-timezone")
        .select("America/Chicago")
        .should("have.value", "America/Chicago")
        .save_and_reload()
        .get_by_testid("groups-combine-daily-submissions")
        .check()
        .should("be.checked")
        .get_by_testid("submission-limit-reset-timezone")
        .should("have.value", "America/Chicago");

      cy.get_by_testid("bonus-submissions-input")
        .should("have.value", 0)
        .type("{backspace}2")
        .should("have.value", 2)
        .get_by_testid("groups-combine-daily-submissions")
        .uncheck()
        .should("not.be.checked")
        .save_and_reload()
        .get_by_testid("bonus-submissions-input")
        .should("have.value", 2)
        .get_by_testid("groups-combine-daily-submissions")
        .should("not.be.checked");

      cy.get_by_testid("allow-late-days")
        .should("not.be.checked")
        .check()
        .should("be.checked")
        .get_by_testid("bonus-submissions-input")
        .type("{backspace}12")
        .should("have.value", 12)
        .save_and_reload()
        .get_by_testid("allow-late-days")
        .should("be.checked")
        .get_by_testid("bonus-submissions-input")
        .should("have.value", 12);

      cy.get_by_testid("total-submission-limit")
        .should("have.value", "")
        .type("20")
        .should("have.value", 20)
        .get_by_testid("bonus-submissions-input")
        .type("{backspace}{backspace}21")
        .should("have.value", 21)
        .save_and_reload()
        .get_by_testid("total-submission-limit")
        .should("have.value", 20)
        .get_by_testid("bonus-submissions-input")
        .should("have.value", 21);

      cy.get_by_testid("max-group-size")
        .type("{backspace}1") // should disable the checkbox
        .get_by_testid("groups-combine-daily-submissions")
        .should("not.be.checked")
        .should("be.disabled")
        .save_and_reload()
        .get_by_testid("groups-combine-daily-submissions")
        .should("not.be.checked")
        .should("be.disabled");
    });
  });

  it("allows user to update email settings", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("send-email-on-submission-received")
        .should("not.be.checked")
        .check()
        .should("be.checked")
        .get_by_testid("send-email-on-non-deferred-tests-finished")
        .should("not.be.checked")
        .check()
        .should("be.checked")
        .save_and_reload()
        .get_by_testid("send-email-on-submission-received")
        .should("be.checked")
        .get_by_testid("send-email-on-non-deferred-tests-finished")
        .should("be.checked");
    });
  });

  it("allows user to update honor pedge settings", () => {
    set_up().then(({ page_uri }) => {
      cy.visit(page_uri)
        .get_by_testid("use-honor-pledge")
        .should("not.be.checked")
        .check()
        .should("be.checked")
        .save_and_reload()
        .get_by_testid("use-honor-pledge")
        .should("be.checked");
    });
  });

  it("allows user to delete the project", () => {
    set_up().then(({ page_uri, course }) => {
      const projects_tab_url = build_full_url(
        `/web/course_admin/${course.pk}?current_tab=projects`,
      );
      cy.visit(page_uri)
        .get_by_testid("show-delete-project-modal-button")
        .click()
        .get_by_testid("delete-project-button")
        .click()
        .url()
        .should("eq", projects_tab_url);
    });
  });

  it("shows project deletion related API errors", () => {
    set_up().then(({ page_uri, project }) => {
      cy.create_test_suite(project.pk, "Sweet suite")
        .visit(page_uri)
        .get_by_testid("show-delete-project-modal-button")
        .click()
        .get_by_testid("delete-project-button")
        .click()
        .get_api_errors()
        .first()
        .should("contain.text", "test case")
        .get_by_testid("cancel-delete-project-button")
        .click()
        .save_and_reload();
    });
  });
});
