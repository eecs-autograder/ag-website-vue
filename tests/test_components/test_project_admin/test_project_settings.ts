import { Wrapper } from "@vue/test-utils";

import {
  HttpError,
  Project,
  UltimateSubmissionPolicy,
} from "ag-client-typescript";
import * as sinon from "sinon";
import moment from "moment-timezone";

import ProjectSettings from "@/components/project_admin/project_settings.vue";
import { assert_not_null } from "@/utils";

import * as data_ut from "@/tests/data_utils";
import { managed_mount } from "@/tests/setup";
import {
  api_error_count,
  checkbox_is_checked,
  expect_html_element_has_value,
  get_validated_input_text,
  set_validated_input_text,
  wait_until,
} from "@/tests/utils";

let wrapper: Wrapper<ProjectSettings>;
let project: Project;
let router_push_stub: sinon.SinonStub;

beforeEach(() => {
  project = data_ut.make_project(data_ut.make_course().pk);
  router_push_stub = sinon.stub();

  wrapper = managed_mount(ProjectSettings, {
    propsData: {
      project: project,
    },
    mocks: {
      $router: {
        push: router_push_stub,
      },
    },
  });
});

describe("ProjectSettings tests", () => {
  test("soft_closing_time clear button sets field to null", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.soft_closing_time = moment().format();
    await wrapper.vm.$nextTick();

    let button = wrapper.find("[data-testid=clear_soft_closing_time]");
    expect(button.element).not.toBeDisabled();

    await button.trigger("click");

    expect(wrapper.vm.state.project?.soft_closing_time).toBeNull();
    expect(button.element).toBeDisabled();
  });

  test("closing_time clear button sets field to null", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.closing_time = moment().format();
    await wrapper.vm.$nextTick();

    let button = wrapper.find("[data-testid=clear_closing_time]");
    expect(button.element).not.toBeDisabled();

    await button.trigger("click");

    expect(wrapper.vm.state.project?.closing_time).toBeNull();
    expect(button.element).toBeDisabled();
  });

  test("visible_to_students binding", async () => {
    let checkbox = wrapper.find("[data-testid=visible_to_students]");

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.visible_to_students).toEqual(true);

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.visible_to_students).toEqual(false);

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.visible_to_students).toEqual(true);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.visible_to_students = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.visible_to_students = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("guests_can_submit binding", async () => {
    let checkbox = wrapper.find("[data-testid=guests_can_submit]");

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.guests_can_submit).toEqual(true);

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.guests_can_submit).toEqual(false);

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.guests_can_submit).toEqual(true);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.guests_can_submit = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.guests_can_submit = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("disallow_student_submissions binding", async () => {
    let checkbox = wrapper.find("[data-testid=disallow_student_submissions]");

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.disallow_student_submissions).toEqual(
      true,
    );

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.disallow_student_submissions).toEqual(
      false,
    );

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.disallow_student_submissions).toEqual(
      true,
    );

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.disallow_student_submissions = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.disallow_student_submissions = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("disallow_group_registration binding", async () => {
    let checkbox = wrapper.find("[data-testid=disallow_group_registration]");

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.disallow_group_registration).toEqual(true);

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.disallow_group_registration).toEqual(
      false,
    );

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.disallow_group_registration).toEqual(true);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.disallow_group_registration = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.disallow_group_registration = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("min and max group size binding", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.min_group_size = 4;
    wrapper.vm.state.project.max_group_size = 5;
    await wrapper.vm.$nextTick();

    let min_group_size_input = wrapper.find("#min-group-size");
    let max_group_size_input = wrapper.find("#max-group-size");

    expect(get_validated_input_text(min_group_size_input)).toEqual("4");
    expect(get_validated_input_text(max_group_size_input)).toEqual("5");

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    await set_validated_input_text(min_group_size_input, "1");
    await set_validated_input_text(max_group_size_input, "3");

    expect(wrapper.vm.state.project?.min_group_size).toEqual(1);
    expect(wrapper.vm.state.project?.max_group_size).toEqual(3);

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);
  });

  test("Publish final grades binding", async () => {
    let publish_grades = wrapper.find("[data-testid=publish_final_grades]");

    await publish_grades.setChecked(true);
    expect(wrapper.vm.state.project?.hide_ultimate_submission_fdbk).toEqual(
      false,
    );

    await publish_grades.setChecked(false);
    expect(wrapper.vm.state.project?.hide_ultimate_submission_fdbk).toEqual(
      true,
    );

    await publish_grades.setChecked(true);
    expect(wrapper.vm.state.project?.hide_ultimate_submission_fdbk).toEqual(
      false,
    );

    expect(checkbox_is_checked(publish_grades)).toEqual(true);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.hide_ultimate_submission_fdbk = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(publish_grades)).toEqual(false);

    wrapper.vm.state.project.hide_ultimate_submission_fdbk = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(publish_grades)).toEqual(true);
  });

  test("ultimate_submission_policy binding", async () => {
    let ultimate_submission_policy_input = wrapper.find(
      "#ultimate-submission-policy",
    );

    await ultimate_submission_policy_input.setValue(
      UltimateSubmissionPolicy.most_recent,
    );
    expect(wrapper.vm.state.project?.ultimate_submission_policy).toEqual(
      UltimateSubmissionPolicy.most_recent,
    );

    await ultimate_submission_policy_input.setValue(
      UltimateSubmissionPolicy.best,
    );
    expect(wrapper.vm.state.project?.ultimate_submission_policy).toEqual(
      UltimateSubmissionPolicy.best,
    );

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.ultimate_submission_policy =
      UltimateSubmissionPolicy.most_recent;
    await wrapper.vm.$nextTick();
    expect_html_element_has_value(
      ultimate_submission_policy_input,
      UltimateSubmissionPolicy.most_recent,
    );

    wrapper.vm.state.project.ultimate_submission_policy =
      UltimateSubmissionPolicy.best;
    await wrapper.vm.$nextTick();
    expect_html_element_has_value(
      ultimate_submission_policy_input,
      UltimateSubmissionPolicy.best,
    );
  });

  test("Best submission with normal feedback disabled, only visible if in use", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.ultimate_submission_policy =
      UltimateSubmissionPolicy.best_with_normal_fdbk;
    await wrapper.vm.$nextTick();

    let ultimate_submission_policy_input = wrapper.find(
      "#ultimate-submission-policy",
    );

    expect(
      ultimate_submission_policy_input.findAll("option").at(2).element,
    ).toBeDisabled();
    expect_html_element_has_value(
      ultimate_submission_policy_input,
      UltimateSubmissionPolicy.best_with_normal_fdbk,
    );

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.ultimate_submission_policy =
      UltimateSubmissionPolicy.best;
    await wrapper.vm.$nextTick();

    let option_tags = wrapper
      .find("#ultimate-submission-policy")
      .findAll("option");
    expect(option_tags.length).toEqual(2);

    expect_html_element_has_value(
      option_tags.at(0),
      UltimateSubmissionPolicy.most_recent,
    );
    expect_html_element_has_value(
      option_tags.at(1),
      UltimateSubmissionPolicy.best,
    );
  });

  test("state.project.submission_limit_per_day nullable form input", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.submission_limit_per_day = 42;
    await wrapper.vm.$nextTick();
    let daily_submission_limit_input = wrapper.find(
      "#submission-limit-per-day",
    );
    expect(get_validated_input_text(daily_submission_limit_input)).toEqual(
      "42",
    );

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    wrapper.vm.state.project.submission_limit_per_day = null;
    await wrapper.vm.$nextTick();
    expect(get_validated_input_text(daily_submission_limit_input)).toEqual("");

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    set_validated_input_text(daily_submission_limit_input, "7");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.state.project?.submission_limit_per_day).toEqual(7);

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    set_validated_input_text(daily_submission_limit_input, "");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.state.project?.submission_limit_per_day).toEqual(null);

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);
  });

  test("allow_submissions_past_limit checkbox disabled when submission_limit_per_day is null", async () => {
    let allow_past_limit_checkbox = wrapper.find(
      "[data-testid=allow_submissions_past_limit]",
    );
    expect(wrapper.vm.state.project?.submission_limit_per_day).toBeNull();
    expect(allow_past_limit_checkbox.element).toBeDisabled();

    set_validated_input_text(wrapper.find("#submission-limit-per-day"), "7");

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.state.project?.submission_limit_per_day).not.toBeNull();
    expect(allow_past_limit_checkbox.element).not.toBeDisabled();
  });

  test("Submission limit reset time binding", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.d_show_reset_time_picker = true;
    await wrapper.vm.$nextTick();

    let time = wrapper.find({
      ref: "submission_limit_reset_time_picker",
    });

    wrapper.vm.state.project.submission_limit_reset_time = "08:00:00";
    await wrapper.vm.$nextTick();
    expect((time.element as HTMLInputElement).value).toEqual("08:00:00");

    await time.setValue("08:01:00");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.state.project?.submission_limit_reset_time).toEqual(
      "08:01:00",
    );
  });

  test("Timezone binding", async () => {
    assert_not_null(wrapper.vm.state.project);
    let timezone_input = wrapper.find("#timezone");

    await timezone_input.setValue("US/Mountain");
    expect(wrapper.vm.state.project?.timezone).toEqual("US/Mountain");

    await timezone_input.setValue("US/Eastern");
    expect(wrapper.vm.state.project?.timezone).toEqual("US/Eastern");

    wrapper.vm.state.project.timezone = "UTC";
    await wrapper.vm.$nextTick();
    expect_html_element_has_value(timezone_input, "UTC");

    wrapper.vm.state.project.timezone = "US/Pacific";
    await wrapper.vm.$nextTick();
    expect_html_element_has_value(timezone_input, "US/Pacific");
  });

  test("Timezone binding with closing_time ISO strings", async () => {
    assert_not_null(wrapper.vm.state.project);

    const old_soft_closing_time_iso = "2028-04-30T10:42:00Z";
    const old_closing_time_iso = "2028-04-30T23:15:00Z";

    wrapper.vm.state.project.soft_closing_time = moment
      .parseZone(old_soft_closing_time_iso)
      .format();
    wrapper.vm.state.project.closing_time = moment
      .parseZone(old_closing_time_iso)
      .format();
    wrapper.vm.state.project.timezone = "UTC";

    const timezone_input = wrapper.find("#timezone");

    const dt_local_fmt = "YYYY-MM-DD[T]HH:mm";

    // compute what the old iso string should change to after changing
    // the timezone. The wall time should remain the same, with only
    // the offset changing.
    const expected_after_change = (
      old_iso: string,
      old_zone: string,
      new_zone: string,
    ) => {
      const wall = moment.parseZone(old_iso).tz(old_zone).format(dt_local_fmt);
      return moment.tz(wall, dt_local_fmt, new_zone).format();
    };

    await timezone_input.setValue("US/Mountain");

    expect(wrapper.vm.state.project.timezone).toEqual("US/Mountain");
    expect(wrapper.vm.state.project.soft_closing_time).toEqual(
      expected_after_change(old_soft_closing_time_iso, "UTC", "US/Mountain"),
    );
    expect(wrapper.vm.state.project.closing_time).toEqual(
      expected_after_change(old_closing_time_iso, "UTC", "US/Mountain"),
    );
  });

  test("Groups get more submissions binding", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.max_group_size = 2;
    await wrapper.vm.$nextTick();

    let checkbox = wrapper.find(
      "[data-testid=groups_combine_daily_submissions]",
    );
    expect(checkbox.element).not.toBeDisabled();

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.groups_combine_daily_submissions).toEqual(
      true,
    );

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.groups_combine_daily_submissions).toEqual(
      false,
    );

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.groups_combine_daily_submissions).toEqual(
      true,
    );

    wrapper.vm.state.project.groups_combine_daily_submissions = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.groups_combine_daily_submissions = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("Groups get more submissions disabled when max group size is 1", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.max_group_size = 1;
    await wrapper.vm.$nextTick();

    let checkbox = wrapper.find(
      "[data-testid=groups_combine_daily_submissions]",
    );
    expect(checkbox.element).toBeDisabled();
  });

  test("Allow late days binding", async () => {
    let checkbox = wrapper.find("[data-testid=allow_late_days]");

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.allow_late_days).toEqual(true);

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.allow_late_days).toEqual(false);

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.allow_late_days).toEqual(true);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.allow_late_days = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.allow_late_days = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("state.project.total_submission_limit nullable form input", async () => {
    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.total_submission_limit = 42;
    await wrapper.vm.$nextTick();
    let daily_submission_limit_input = wrapper.find("#total-submission-limit");
    expect(get_validated_input_text(daily_submission_limit_input)).toEqual(
      "42",
    );

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    wrapper.vm.state.project.total_submission_limit = null;
    await wrapper.vm.$nextTick();
    expect(get_validated_input_text(daily_submission_limit_input)).toEqual("");

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    await set_validated_input_text(daily_submission_limit_input, "7");
    expect(wrapper.vm.state.project?.total_submission_limit).toEqual(7);

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    await set_validated_input_text(daily_submission_limit_input, "");
    expect(wrapper.vm.state.project?.total_submission_limit).toEqual(null);

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);
  });

  test("Successful attempt to save project settings", async () => {
    assert_not_null(wrapper.vm.state.project);
    let save_settings_stub = sinon.stub(wrapper.vm.state.project, "save");

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    wrapper.findComponent({ ref: "project_settings_form" }).trigger("submit");
    await wrapper.vm.$nextTick();

    expect(save_settings_stub.firstCall.thisValue).toEqual(
      wrapper.vm.state.project,
    );
  });

  test("Unsuccessful attempt to save project settings", async () => {
    assert_not_null(wrapper.vm.state.project);
    let save_settings_stub = sinon.stub(wrapper.vm.state.project, "save");
    save_settings_stub.returns(
      Promise.reject(
        new HttpError(400, {
          __all__: "Project with this name already exists in course",
        }),
      ),
    );

    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    await set_validated_input_text(
      wrapper.findComponent({ ref: "project_name_input" }),
      "AlreadyExists.cpp",
    );
    expect(wrapper.vm.state.settings_form_is_valid).toBe(true);

    await wrapper
      .findComponent({ ref: "project_settings_form" })
      .trigger("submit");
    expect(await wait_until(wrapper, (w) => w.vm.state.saving === false)).toBe(
      true,
    );

    expect(save_settings_stub.calledOnce).toBe(true);

    let api_errors = <APIErrors>wrapper.findComponent({ ref: "api_errors" }).vm;
    expect(api_errors.state.api_errors.length).toBe(1);
  });

  test("use_honor_pledge binding", async () => {
    let checkbox = wrapper.find("[data-testid=use_honor_pledge]");

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.use_honor_pledge).toEqual(true);

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.use_honor_pledge).toEqual(false);

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.use_honor_pledge).toEqual(true);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.use_honor_pledge = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.use_honor_pledge = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("honor_pledge_text binding", async () => {
    expect(wrapper.find("[data-testid=honor_pledge_text]").exists()).toBe(
      false,
    );

    let checkbox = wrapper.find("[data-testid=use_honor_pledge]");
    await checkbox.setChecked(true);
    let pledge_text = wrapper.find("[data-testid=honor_pledge_text]");
    expect(pledge_text.exists()).toBe(true);

    let text = "noerastoineratonieratsienrastoinearsoitrs";
    await set_validated_input_text(pledge_text, text);
    expect(wrapper.vm.state.project?.honor_pledge_text).toEqual(text);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.honor_pledge_text = "very new text";
    await wrapper.vm.$nextTick();
    expect(get_validated_input_text(pledge_text)).toEqual("very new text");
  });

  test("send_email_on_submission_received binding", async () => {
    let checkbox = wrapper.find(
      "[data-testid=send_email_on_submission_received]",
    );

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.send_email_on_submission_received).toEqual(
      true,
    );

    await checkbox.setChecked(false);
    expect(wrapper.vm.state.project?.send_email_on_submission_received).toEqual(
      false,
    );

    await checkbox.setChecked(true);
    expect(wrapper.vm.state.project?.send_email_on_submission_received).toEqual(
      true,
    );

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.send_email_on_submission_received = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.send_email_on_submission_received = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });

  test("send_email_on_non_deferred_tests_finished binding", async () => {
    let checkbox = wrapper.find(
      "[data-testid=send_email_on_non_deferred_tests_finished]",
    );

    await checkbox.setChecked(true);
    expect(
      wrapper.vm.state.project?.send_email_on_non_deferred_tests_finished,
    ).toEqual(true);

    await checkbox.setChecked(false);
    expect(
      wrapper.vm.state.project?.send_email_on_non_deferred_tests_finished,
    ).toEqual(false);

    await checkbox.setChecked(true);
    expect(
      wrapper.vm.state.project?.send_email_on_non_deferred_tests_finished,
    ).toEqual(true);

    assert_not_null(wrapper.vm.state.project);
    wrapper.vm.state.project.send_email_on_non_deferred_tests_finished = false;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(false);

    wrapper.vm.state.project.send_email_on_non_deferred_tests_finished = true;
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(checkbox)).toEqual(true);
  });
});

describe("Delete project tests", () => {
  test("Delete project", async () => {
    let delete_stub = sinon.stub(wrapper.vm.state.project, "delete");
    await wrapper
      .find("[data-testid=show_delete_project_modal_button]")
      .trigger("click");
    await wrapper.find("[data-testid=delete_project_button]").trigger("click");
    expect(await wait_until(wrapper, (w) => !w.vm.state.deleting)).toBe(true);

    expect(delete_stub.calledOnce).toBe(true);
    expect(router_push_stub.calledOnce).toBe(true);
    let args = router_push_stub.firstCall.args[0];
    expect(args.name).toEqual("course_admin");
    expect(args.params).toEqual({ course_id: project.course.toString() });
  });

  test("Delete project API errors handled", async () => {
    sinon
      .stub(wrapper.vm.state.project, "delete")
      .rejects(new HttpError(400, "Noope"));
    await wrapper
      .find("[data-testid=show_delete_project_modal_button]")
      .trigger("click");
    await wrapper.find("[data-testid=delete_project_button]").trigger("click");
    expect(await wait_until(wrapper, (w) => !w.vm.state.deleting)).toBe(true);

    expect(router_push_stub.callCount).toEqual(0);
    expect(api_error_count(wrapper, { ref: "delete_errors" })).toEqual(1);
  });
});

describe("Invalid input tests", () => {
  test("Error project name is blank", async () => {
    const project_name_input = wrapper.findComponent({
      ref: "project_name_input",
    });
    expect(project_name_input.emitted("update:is_valid")?.at(-1)).toStrictEqual(
      [true],
    );

    await set_validated_input_text(project_name_input, "   ");
    console.log(project_name_input.emitted("update:is_valid"));
    expect(project_name_input.emitted("update:is_valid")?.at(-1)).toStrictEqual(
      [false],
    );
  });

  test("min_group_size is blank or not a number", async () => {
    let min_num_matches_input = wrapper.find("#min-group-size");
    expect(
      min_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(min_num_matches_input, "    ");
    expect(
      min_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);

    await set_validated_input_text(min_num_matches_input, "Winterfell");
    expect(
      min_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);
  });

  test("min_group_size is zero or negative", async () => {
    let min_num_matches_input = wrapper.find("#min-group-size");
    expect(
      min_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(min_num_matches_input, "-8");
    expect(
      min_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);

    await set_validated_input_text(min_num_matches_input, "1");
    expect(
      min_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(min_num_matches_input, "0");
    expect(
      min_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);
  });

  test("max_group_size is blank or not a number", async () => {
    let max_num_matches_input = wrapper.find("#max-group-size");
    expect(
      max_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(max_num_matches_input, "    ");
    expect(
      max_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);

    await set_validated_input_text(max_num_matches_input, "Waluigi");
    expect(
      max_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);
  });

  test("max_group_size is zero or negative", async () => {
    let max_num_matches_input = wrapper.find("#max-group-size");
    expect(
      max_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(max_num_matches_input, "-8");
    expect(
      max_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);

    await set_validated_input_text(max_num_matches_input, "1");
    expect(
      max_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(max_num_matches_input, "0");
    expect(
      max_num_matches_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);
  });

  test("submission_limit_per_day less than 1 or not a number", async () => {
    let daily_submission_limit_input = wrapper.find(
      "#submission-limit-per-day",
    );
    await set_validated_input_text(daily_submission_limit_input, "");
    expect(
      daily_submission_limit_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(daily_submission_limit_input, "-3");
    expect(
      daily_submission_limit_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);

    await set_validated_input_text(daily_submission_limit_input, "0");
    expect(
      daily_submission_limit_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);

    await set_validated_input_text(daily_submission_limit_input, "1");
    expect(
      daily_submission_limit_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);
  });

  test("num_bonus_submissions is empty or not a number", async () => {
    let bonus_submissions_input = wrapper.findComponent({
      ref: "bonus_submissions_input",
    });
    expect(
      bonus_submissions_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(bonus_submissions_input, "   ");
    expect(
      bonus_submissions_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);

    await set_validated_input_text(bonus_submissions_input, "King's Landing");
    expect(
      bonus_submissions_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);
  });

  test("num_bonus_submissions is negative", async () => {
    let bonus_submissions_input = wrapper.findComponent({
      ref: "bonus_submissions_input",
    });
    expect(
      bonus_submissions_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([true]);

    await set_validated_input_text(
      wrapper.findComponent({ ref: "bonus_submissions_input" }),
      "-18",
    );
    expect(
      bonus_submissions_input.emitted("update:is_valid")?.at(-1),
    ).toStrictEqual([false]);
  });
});
