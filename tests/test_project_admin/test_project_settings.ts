import { Wrapper } from '@vue/test-utils';

import { HttpError, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import TimePicker from "@/components/datetime/time_picker.vue";
import ProjectSettings from '@/components/project_admin/project_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    checkbox_is_checked,
    expect_html_element_has_value,
    get_validated_input_text,
    set_validated_input_text, validated_input_is_valid
} from "@/tests/utils";


let wrapper: Wrapper<ProjectSettings>;
let project: Project;

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);

    wrapper = managed_mount(ProjectSettings, {
        propsData: {
            project: project
        }
    });
});

describe('ProjectSettings tests', () => {
    test('soft_closing_time clear button sets field to null', async () => {
        wrapper.vm.d_project.soft_closing_time = (new Date()).toISOString();
        await wrapper.vm.$nextTick();

        let button = wrapper.find('[data-testid=clear_soft_closing_time]');
        expect(button.element).not.toBeDisabled();

        button.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_project.soft_closing_time).toBeNull();
        expect(button.element).toBeDisabled();
    });

    test('Clicking soft closing time toggles time picker visibility', async () => {
        let time = wrapper.find('.soft-deadline .datetime-input');
        let picker = <Wrapper<DatetimePicker>> wrapper.findComponent({ref: 'soft_closing_time'});

        expect(picker.vm.is_visible).toEqual(false);

        time.trigger('click');
        await wrapper.vm.$nextTick();

        expect(picker.vm.is_visible).toEqual(true);

        time.trigger('click');
        await wrapper.vm.$nextTick();
        expect(picker.vm.is_visible).toEqual(false);
    });

    test('closing_time clear button sets field to null', async () => {
        wrapper.vm.d_project.closing_time = (new Date()).toISOString();
        await wrapper.vm.$nextTick();

        let button = wrapper.find('[data-testid=clear_closing_time]');
        expect(button.element).not.toBeDisabled();

        button.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_project.closing_time).toBeNull();
        expect(button.element).toBeDisabled();
    });

    test('Clicking closing time toggles time picker visibility', async () => {
        let time = wrapper.find('.hard-deadline .datetime-input');
        let picker = <Wrapper<DatetimePicker>> wrapper.findComponent({ref: 'closing_time'});

        expect(picker.vm.is_visible).toEqual(false);

        time.trigger('click');
        await wrapper.vm.$nextTick();
        expect(picker.vm.is_visible).toEqual(true);

        time.trigger('click');
        await wrapper.vm.$nextTick();
        expect(picker.vm.is_visible).toEqual(false);
    });

    test('visible_to_students binding', async () => {
        let checkbox = wrapper.find('#visible-to-students');

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.visible_to_students).toEqual(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_project.visible_to_students).toEqual(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.visible_to_students).toEqual(true);

        wrapper.vm.d_project.visible_to_students = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        wrapper.vm.d_project.visible_to_students = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('guests_can_submit binding', async () => {
        let checkbox = wrapper.find('#guests-can-submit');

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.guests_can_submit).toEqual(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_project.guests_can_submit).toEqual(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.guests_can_submit).toEqual(true);

        wrapper.vm.d_project.guests_can_submit = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        wrapper.vm.d_project.guests_can_submit = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('disallow_student_submissions binding', async () => {
        let checkbox = wrapper.find('#disallow-student-submissions');

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.disallow_student_submissions).toEqual(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_project.disallow_student_submissions).toEqual(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.disallow_student_submissions).toEqual(true);

        wrapper.vm.d_project.disallow_student_submissions = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        wrapper.vm.d_project.disallow_student_submissions = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('disallow_group_registration binding', async () => {
        let checkbox = wrapper.find('#disallow-group-registration');

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.disallow_group_registration).toEqual(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_project.disallow_group_registration).toEqual(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.disallow_group_registration).toEqual(true);

        wrapper.vm.d_project.disallow_group_registration = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        wrapper.vm.d_project.disallow_group_registration = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('min and max group size binding', async () => {
        wrapper.vm.d_project.min_group_size = 4;
        wrapper.vm.d_project.max_group_size = 5;
        await wrapper.vm.$nextTick();

        let min_group_size_input = wrapper.find('#min-group-size');
        let max_group_size_input = wrapper.find('#max-group-size');

        expect(get_validated_input_text(min_group_size_input)).toEqual('4');
        expect(get_validated_input_text(max_group_size_input)).toEqual('5');

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        await set_validated_input_text(min_group_size_input, '1');
        await set_validated_input_text(max_group_size_input, '3');

        expect(wrapper.vm.d_project.min_group_size).toEqual(1);
        expect(wrapper.vm.d_project.max_group_size).toEqual(3);

        expect(wrapper.vm.settings_form_is_valid).toBe(true);
    });

    test('Publish final grades binding', async () => {
        let publish_grades = wrapper.find('#publish-final-grades');

        await publish_grades.setChecked(true);
        expect(wrapper.vm.d_project.hide_ultimate_submission_fdbk).toEqual(false);

        await publish_grades.setChecked(false);
        expect(wrapper.vm.d_project.hide_ultimate_submission_fdbk).toEqual(true);

        await publish_grades.setChecked(true);
        expect(wrapper.vm.d_project.hide_ultimate_submission_fdbk).toEqual(false);

        expect(checkbox_is_checked(publish_grades)).toEqual(true);

        wrapper.vm.d_project.hide_ultimate_submission_fdbk = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(publish_grades)).toEqual(false);

        wrapper.vm.d_project.hide_ultimate_submission_fdbk = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(publish_grades)).toEqual(true);
    });

    test('ultimate_submission_policy binding', async () => {
        let ultimate_submission_policy_input = wrapper.find('#ultimate-submission-policy');

        await ultimate_submission_policy_input.setValue(UltimateSubmissionPolicy.most_recent);
        expect(wrapper.vm.d_project.ultimate_submission_policy).toEqual(
            UltimateSubmissionPolicy.most_recent
        );

        await ultimate_submission_policy_input.setValue(UltimateSubmissionPolicy.best);
        expect(wrapper.vm.d_project.ultimate_submission_policy).toEqual(
            UltimateSubmissionPolicy.best
        );

        wrapper.vm.d_project.ultimate_submission_policy = UltimateSubmissionPolicy.most_recent;
        await wrapper.vm.$nextTick();
        expect_html_element_has_value(ultimate_submission_policy_input,
                                      UltimateSubmissionPolicy.most_recent);

        wrapper.vm.d_project.ultimate_submission_policy = UltimateSubmissionPolicy.best;
        await wrapper.vm.$nextTick();
        expect_html_element_has_value(ultimate_submission_policy_input,
                                      UltimateSubmissionPolicy.best);
    });

    test('Best submission with normal feedback disabled, only visible if in use', async () => {
        wrapper.vm.d_project.ultimate_submission_policy
            = UltimateSubmissionPolicy.best_with_normal_fdbk;
        await wrapper.vm.$nextTick();

        let ultimate_submission_policy_input = wrapper.find('#ultimate-submission-policy');

        expect(ultimate_submission_policy_input.findAll('option').at(2).element).toBeDisabled();
        expect_html_element_has_value(ultimate_submission_policy_input,
                                      UltimateSubmissionPolicy.best_with_normal_fdbk);

        wrapper.vm.d_project.ultimate_submission_policy = UltimateSubmissionPolicy.best;
        await wrapper.vm.$nextTick();

        let option_tags = wrapper.find('#ultimate-submission-policy').findAll('option');
        expect(option_tags.length).toEqual(2);

        expect_html_element_has_value(option_tags.at(0), UltimateSubmissionPolicy.most_recent);
        expect_html_element_has_value(option_tags.at(1), UltimateSubmissionPolicy.best);
    });

    test('d_project.submission_limit_per_day nullable form input',
         async () => {
        wrapper.vm.d_project.submission_limit_per_day = 42;
        await wrapper.vm.$nextTick();
        let daily_submission_limit_input = wrapper.find('#submission-limit-per-day');
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('42');

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        wrapper.vm.d_project.submission_limit_per_day = null;
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('');

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        set_validated_input_text(daily_submission_limit_input, '7');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_project.submission_limit_per_day).toEqual(7);

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        set_validated_input_text(daily_submission_limit_input, '');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_project.submission_limit_per_day).toEqual(null);

        expect(wrapper.vm.settings_form_is_valid).toBe(true);
    });

    test('allow_submissions_past_limit checkbox disabled when submission_limit_per_day is null',
         async () => {
        expect(wrapper.vm.d_project.submission_limit_per_day).toBeNull();
        expect(wrapper.find('#allow-submissions-past-limit').element).toBeDisabled();

        set_validated_input_text(wrapper.find('#submission-limit-per-day'), '7');

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_project.submission_limit_per_day).not.toBeNull();
        expect(wrapper.find('#allow-submissions-past-limit').element).not.toBeDisabled();
    });

    test('Clicking submission limit reset time toggles time picker visibility', async () => {
        let time = wrapper.findComponent({ref: 'submission_limit_reset_time'});

        expect(wrapper.vm.d_show_reset_time_picker).toEqual(false);
        expect(
            wrapper.findComponent({ref: 'submission_limit_reset_time_picker'}).exists()
        ).toEqual(false);

        time.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_show_reset_time_picker).toEqual(true);
        expect(
            wrapper.findComponent({ref: 'submission_limit_reset_time_picker'}).exists()
        ).toEqual(true);

        time.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_show_reset_time_picker).toEqual(false);
        expect(
            wrapper.findComponent({ref: 'submission_limit_reset_time_picker'}).exists()
        ).toEqual(false);
    });

    test('Submission limit reset time binding', async () => {
        wrapper.vm.d_show_reset_time_picker = true;
        await wrapper.vm.$nextTick();

        let time = <Wrapper<TimePicker>> wrapper.findComponent({
            ref: 'submission_limit_reset_time_picker'
        });
        wrapper.vm.d_project.submission_limit_reset_time = '08:00';
        await wrapper.vm.$nextTick();
        expect(time.vm.value).toEqual('08:00');

        time.vm.go_to_next_minute();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_project.submission_limit_reset_time).toEqual('08:01');
    });

    test('Submission limit reset timezone binding', async () => {
        let submission_limit_reset_timezone_input = wrapper.find(
            '#submission-limit-reset-timezone');

        await submission_limit_reset_timezone_input.setValue('US/Mountain');
        expect(wrapper.vm.d_project.submission_limit_reset_timezone).toEqual('US/Mountain');

        await submission_limit_reset_timezone_input.setValue('US/Eastern');
        expect(wrapper.vm.d_project.submission_limit_reset_timezone).toEqual('US/Eastern');

        wrapper.vm.d_project.submission_limit_reset_timezone = 'UTC';
        await wrapper.vm.$nextTick();
        expect_html_element_has_value(submission_limit_reset_timezone_input, 'UTC');

        wrapper.vm.d_project.submission_limit_reset_timezone = 'US/Pacific';
        await wrapper.vm.$nextTick();
        expect_html_element_has_value(submission_limit_reset_timezone_input, 'US/Pacific');
    });

    test('Groups get more submissions binding', async () => {
        wrapper.vm.d_project.max_group_size = 2;
        await wrapper.vm.$nextTick();

        let checkbox = wrapper.find('#groups-combine-daily-submissions');
        expect(checkbox.element).not.toBeDisabled();

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.groups_combine_daily_submissions).toEqual(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_project.groups_combine_daily_submissions).toEqual(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.groups_combine_daily_submissions).toEqual(true);

        wrapper.vm.d_project.groups_combine_daily_submissions = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        wrapper.vm.d_project.groups_combine_daily_submissions = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('Groups get more submissions disabled when max group size is 1', async () => {
        wrapper.vm.d_project.max_group_size = 1;
        await wrapper.vm.$nextTick();

        let checkbox = wrapper.find('#groups-combine-daily-submissions');
        expect(checkbox.element).toBeDisabled();
    });

    test('Allow late days binding', async () => {
        let checkbox = wrapper.find('#allow-late-days');

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.allow_late_days).toEqual(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_project.allow_late_days).toEqual(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_project.allow_late_days).toEqual(true);

        wrapper.vm.d_project.allow_late_days = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        wrapper.vm.d_project.allow_late_days = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('d_project.total_submission_limit nullable form input', async () => {
        wrapper.vm.d_project.total_submission_limit = 42;
        await wrapper.vm.$nextTick();
        let daily_submission_limit_input = wrapper.find('#total-submission-limit');
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('42');

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        wrapper.vm.d_project.total_submission_limit = null;
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('');

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        await set_validated_input_text(daily_submission_limit_input, '7');
        expect(wrapper.vm.d_project.total_submission_limit).toEqual(7);

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        await set_validated_input_text(daily_submission_limit_input, '');
        expect(wrapper.vm.d_project.total_submission_limit).toEqual(null);

        expect(wrapper.vm.settings_form_is_valid).toBe(true);
    });

    test('Successful attempt to save project settings', async () => {
        let save_settings_stub = sinon.stub(wrapper.vm.d_project, 'save');

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        wrapper.findComponent({ref: 'project_settings_form'}).trigger('submit');
        await wrapper.vm.$nextTick();

        expect(save_settings_stub.firstCall.thisValue).toEqual(wrapper.vm.d_project);
    });

    test('Unsuccessful attempt to save project settings', async () => {
        let save_settings_stub = sinon.stub(wrapper.vm.d_project, 'save');
        save_settings_stub.returns(Promise.reject(
            new HttpError(400, {__all__: "Project with this name already exists in course"})
        ));

        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        await set_validated_input_text(
            wrapper.findComponent({ref: 'project_name_input'}), "AlreadyExists.cpp");
        expect(wrapper.vm.settings_form_is_valid).toBe(true);

        wrapper.findComponent({ref: 'project_settings_form'}).trigger('submit');
        await wrapper.vm.$nextTick();

        expect(save_settings_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});


describe('Invalid input tests', () => {
    test('Error project name is blank', async () => {
        let project_name_validator
        = <ValidatedInput> wrapper.findComponent({ref: "project_name_input"}).vm;
        expect(project_name_validator.is_valid).toBe(true);

        set_validated_input_text(wrapper.findComponent({ref: "project_name_input"}), '   ');
        expect(project_name_validator.is_valid).toBe(false);
    });

    test('min_group_size is blank or not a number', () => {
        let min_num_matches_input = wrapper.find('#min-group-size');

        expect(validated_input_is_valid(min_num_matches_input)).toBe(true);

        set_validated_input_text(min_num_matches_input, '    ');
        expect(validated_input_is_valid(min_num_matches_input)).toBe(false);

        set_validated_input_text(min_num_matches_input, 'Winterfell');
        expect(validated_input_is_valid(min_num_matches_input)).toBe(false);
    });

    test('min_group_size is zero or negative', () => {
        let min_num_matches_input = wrapper.find('#min-group-size');
        expect(validated_input_is_valid(min_num_matches_input)).toBe(true);

        set_validated_input_text(min_num_matches_input, '-8');
        expect(validated_input_is_valid(min_num_matches_input)).toBe(false);

        set_validated_input_text(min_num_matches_input, '1');
        expect(validated_input_is_valid(min_num_matches_input)).toBe(true);

        set_validated_input_text(min_num_matches_input, '0');
        expect(validated_input_is_valid(min_num_matches_input)).toBe(false);
    });

    test('max_group_size is blank or not a number', () => {
        let max_num_matches_input = wrapper.find('#max-group-size');

        expect(validated_input_is_valid(max_num_matches_input)).toBe(true);

        set_validated_input_text(max_num_matches_input, '    ');
        expect(validated_input_is_valid(max_num_matches_input)).toBe(false);

        set_validated_input_text(max_num_matches_input, 'Waluigi');
        expect(validated_input_is_valid(max_num_matches_input)).toBe(false);
    });

    test('max_group_size is zero or negative', async () => {
        let max_num_matches_input = wrapper.find('#max-group-size');
        expect(validated_input_is_valid(max_num_matches_input)).toBe(true);

        set_validated_input_text(max_num_matches_input, '-8');
        expect(validated_input_is_valid(max_num_matches_input)).toBe(false);

        set_validated_input_text(max_num_matches_input, '1');
        expect(validated_input_is_valid(max_num_matches_input)).toBe(true);

        set_validated_input_text(max_num_matches_input, '0');
        expect(validated_input_is_valid(max_num_matches_input)).toBe(false);
    });

    test('submission_limit_per_day less than 1 or not a number', async () => {
        let daily_submission_limit_input = wrapper.find('#submission-limit-per-day');
        set_validated_input_text(daily_submission_limit_input, '');
        expect(validated_input_is_valid(daily_submission_limit_input)).toEqual(true);

        set_validated_input_text(daily_submission_limit_input, '-3');
        expect(validated_input_is_valid(daily_submission_limit_input)).toEqual(false);

        set_validated_input_text(daily_submission_limit_input, '0');
        expect(validated_input_is_valid(daily_submission_limit_input)).toEqual(false);

        set_validated_input_text(daily_submission_limit_input, '1');
        expect(validated_input_is_valid(daily_submission_limit_input)).toEqual(true);
    });

    test('num_bonus_submissions is empty or not a number', async () => {
        let bonus_submissions_input = wrapper.findComponent({ref: "bonus_submissions_input"});
        let bonus_submissions_validator = <ValidatedInput> wrapper.findComponent({
            ref: "bonus_submissions_input"
        }).vm;

        expect(bonus_submissions_validator.is_valid).toBe(true);

        set_validated_input_text(bonus_submissions_input, "   ");
        bonus_submissions_input.trigger('input');
        await wrapper.vm.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);

        set_validated_input_text(bonus_submissions_input, "King's Landing");
        bonus_submissions_input.trigger('input');
        await wrapper.vm.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

    test('num_bonus_submissions is negative', async () => {
        let bonus_submissions_validator = <ValidatedInput> wrapper.findComponent({
            ref: "bonus_submissions_input"
        }).vm;

        expect(bonus_submissions_validator.is_valid).toBe(true);

        set_validated_input_text(wrapper.findComponent({ref: "bonus_submissions_input"}), "-18");
        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

});
