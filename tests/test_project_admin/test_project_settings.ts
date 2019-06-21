import { config, mount, Wrapper } from '@vue/test-utils';

import { HttpError, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import TimePicker from "@/components/datetime/time_picker.vue";
import ProjectSettings from '@/components/project_admin/project_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';

import {
    checkbox_is_checked,
    expect_html_element_has_value,
    get_validated_input_text,
    set_validated_input_text, validated_input_is_valid
} from "@/tests/utils";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ProjectSettings tests', () => {
    let wrapper: Wrapper<ProjectSettings>;
    let component: ProjectSettings;
    let project: Project;

    beforeEach(() => {
        project = new Project({
            pk: 3,
            name: "Project 200",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "00:00:00",
            submission_limit_reset_timezone: "UTC",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: []
        });

        wrapper = mount(ProjectSettings, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;

    });

    afterEach(() => {
        sinon.restore();
    });

    test('soft_closing_time clear button sets field to null', async () => {
        component.d_project.soft_closing_time = new Date().toISOString();
        let button = wrapper.find({ref: 'clear_soft_closing_time'});

        expect(button.is('[disabled]')).toEqual(false);

        await component.$nextTick();

        button.trigger('click');

        await component.$nextTick();

        expect(component.d_project.soft_closing_time).toBeNull();
        expect(button.is('[disabled]')).toEqual(true);
    });

    test('Clicking soft closing time toggles time picker visibility', async () => {
        let time = wrapper.find('.soft-deadline .datetime-input');
        let picker = <Wrapper<DatetimePicker>> wrapper.find({ref: 'soft_closing_time'});

        expect(picker.vm.is_visible).toEqual(false);

        time.trigger('click');
        await component.$nextTick();

        expect(picker.vm.is_visible).toEqual(true);

        time.trigger('click');
        await component.$nextTick();
        expect(picker.vm.is_visible).toEqual(false);
    });

    test('closing_time clear button sets field to null', async () => {
        component.d_project.closing_time = new Date().toISOString();
        let button = wrapper.find({ref: 'clear_closing_time'});

        expect(button.is('[disabled]')).toEqual(false);

        await component.$nextTick();

        button.trigger('click');

        await component.$nextTick();

        expect(component.d_project.closing_time).toBeNull();
        expect(button.is('[disabled]')).toEqual(true);
    });

    test('Clicking closing time toggles time picker visibility', async () => {
        let time = wrapper.find('.hard-deadline .datetime-input');
        let picker = <Wrapper<DatetimePicker>> wrapper.find({ref: 'closing_time'});

        expect(picker.vm.is_visible).toEqual(false);

        time.trigger('click');
        await component.$nextTick();
        expect(picker.vm.is_visible).toEqual(true);

        time.trigger('click');
        await component.$nextTick();
        expect(picker.vm.is_visible).toEqual(false);
    });

    test('visible_to_students binding', () => {
        let checkbox = wrapper.find('#visible-to-students');

        checkbox.setChecked(true);
        expect(component.d_project.visible_to_students).toEqual(true);

        checkbox.setChecked(false);
        expect(component.d_project.visible_to_students).toEqual(false);

        checkbox.setChecked(true);
        expect(component.d_project.visible_to_students).toEqual(true);

        component.d_project.visible_to_students = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        component.d_project.visible_to_students = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('guests_can_submit binding', () => {
        let checkbox = wrapper.find('#guests-can-submit');

        checkbox.setChecked(true);
        expect(component.d_project.guests_can_submit).toEqual(true);

        checkbox.setChecked(false);
        expect(component.d_project.guests_can_submit).toEqual(false);

        checkbox.setChecked(true);
        expect(component.d_project.guests_can_submit).toEqual(true);

        component.d_project.guests_can_submit = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        component.d_project.guests_can_submit = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('disallow_student_submissions binding', () => {
        let checkbox = wrapper.find('#disallow-student-submissions');

        checkbox.setChecked(true);
        expect(component.d_project.disallow_student_submissions).toEqual(true);

        checkbox.setChecked(false);
        expect(component.d_project.disallow_student_submissions).toEqual(false);

        checkbox.setChecked(true);
        expect(component.d_project.disallow_student_submissions).toEqual(true);

        component.d_project.disallow_student_submissions = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        component.d_project.disallow_student_submissions = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('disallow_group_registration binding', () => {
        let checkbox = wrapper.find('#disallow-group-registration');

        checkbox.setChecked(true);
        expect(component.d_project.disallow_group_registration).toEqual(true);

        checkbox.setChecked(false);
        expect(component.d_project.disallow_group_registration).toEqual(false);

        checkbox.setChecked(true);
        expect(component.d_project.disallow_group_registration).toEqual(true);

        component.d_project.disallow_group_registration = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        component.d_project.disallow_group_registration = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('min and max group size binding', () => {
        component.d_project.min_group_size = 4;
        component.d_project.max_group_size = 5;

        let min_group_size_input = wrapper.find('#min-group-size');
        let max_group_size_input = wrapper.find('#max-group-size');

        expect(get_validated_input_text(min_group_size_input)).toEqual('4');
        expect(get_validated_input_text(max_group_size_input)).toEqual('5');

        expect(component.settings_form_is_valid).toBe(true);

        set_validated_input_text(min_group_size_input, '1');
        set_validated_input_text(max_group_size_input, '3');

        expect(component.d_project.min_group_size).toEqual(1);
        expect(component.d_project.max_group_size).toEqual(3);

        expect(component.settings_form_is_valid).toBe(true);
    });

    test('Publish final grades binding', () => {
        let publish_grades = wrapper.find('#publish-final-grades');

        publish_grades.setChecked(true);
        expect(component.d_project.hide_ultimate_submission_fdbk).toEqual(false);

        publish_grades.setChecked(false);
        expect(component.d_project.hide_ultimate_submission_fdbk).toEqual(true);

        publish_grades.setChecked(true);
        expect(component.d_project.hide_ultimate_submission_fdbk).toEqual(false);

        expect(checkbox_is_checked(publish_grades)).toEqual(true);

        component.d_project.hide_ultimate_submission_fdbk = true;
        expect(checkbox_is_checked(publish_grades)).toEqual(false);

        component.d_project.hide_ultimate_submission_fdbk = false;
        expect(checkbox_is_checked(publish_grades)).toEqual(true);
    });

    test('ultimate_submission_policy binding', async () => {
        let ultimate_submission_policy_input = wrapper.find('#ultimate-submission-policy');

        ultimate_submission_policy_input.setValue(UltimateSubmissionPolicy.most_recent);
        expect(component.d_project.ultimate_submission_policy).toEqual(
            UltimateSubmissionPolicy.most_recent
        );

        ultimate_submission_policy_input.setValue(UltimateSubmissionPolicy.best);
        expect(component.d_project.ultimate_submission_policy).toEqual(
            UltimateSubmissionPolicy.best
        );

        component.d_project.ultimate_submission_policy = UltimateSubmissionPolicy.most_recent;
        expect_html_element_has_value(ultimate_submission_policy_input,
                                      UltimateSubmissionPolicy.most_recent);

        component.d_project.ultimate_submission_policy = UltimateSubmissionPolicy.best;
        expect_html_element_has_value(ultimate_submission_policy_input,
                                      UltimateSubmissionPolicy.best);
    });

    test('Best submission with normal feedback disabled, only visible if in use', async () => {
        component.d_project.ultimate_submission_policy
            = UltimateSubmissionPolicy.best_with_normal_fdbk;
        await component.$nextTick();

        let ultimate_submission_policy_input = wrapper.find('#ultimate-submission-policy');

        expect(ultimate_submission_policy_input.findAll('option').at(2).is('[disabled]')).toEqual(
            true
        );
        expect_html_element_has_value(ultimate_submission_policy_input,
                                      UltimateSubmissionPolicy.best_with_normal_fdbk);

        component.d_project.ultimate_submission_policy = UltimateSubmissionPolicy.best;
        await component.$nextTick();

        let option_tags = wrapper.find('#ultimate-submission-policy').findAll('option');
        expect(option_tags.length).toEqual(2);

        expect_html_element_has_value(option_tags.at(0), UltimateSubmissionPolicy.most_recent);
        expect_html_element_has_value(option_tags.at(1), UltimateSubmissionPolicy.best);
    });

    test('d_project.submission_limit_per_day nullable form input',
         async () => {
        component.d_project.submission_limit_per_day = 42;
        await component.$nextTick();
        let daily_submission_limit_input = wrapper.find('#submission-limit-per-day');
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('42');

        expect(component.settings_form_is_valid).toBe(true);

        component.d_project.submission_limit_per_day = null;
        await component.$nextTick();
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('');

        expect(component.settings_form_is_valid).toBe(true);

        set_validated_input_text(daily_submission_limit_input, '7');
        await component.$nextTick();
        expect(component.d_project.submission_limit_per_day).toEqual(7);

        expect(component.settings_form_is_valid).toBe(true);

        set_validated_input_text(daily_submission_limit_input, '');
        await component.$nextTick();
        expect(component.d_project.submission_limit_per_day).toEqual(null);

        expect(component.settings_form_is_valid).toBe(true);
    });

    test('allow_submissions_past_limit checkbox disabled when submission_limit_per_day is null',
         async () => {
        expect(component.d_project.submission_limit_per_day).toBeNull();
        expect(wrapper.find('#allow-submissions-past-limit').is('[disabled]')).toEqual(true);

        set_validated_input_text(wrapper.find('#submission-limit-per-day'), '7');

        await component.$nextTick();

        expect(component.d_project.submission_limit_per_day).not.toBeNull();
        expect(wrapper.find('#allow-submissions-past-limit').is('[disabled]')).toEqual(false);
    });

    test('Clicking submission limit reset time toggles time picker visibility', async () => {
        let time = wrapper.find({ref: 'submission_limit_reset_time'});

        expect(component.d_show_reset_time_picker).toEqual(false);
        expect(wrapper.find({ref: 'submission_limit_reset_time_picker'}).exists()).toEqual(false);

        time.trigger('click');
        await component.$nextTick();
        expect(component.d_show_reset_time_picker).toEqual(true);
        expect(wrapper.find({ref: 'submission_limit_reset_time_picker'}).exists()).toEqual(true);

        time.trigger('click');
        await component.$nextTick();
        expect(component.d_show_reset_time_picker).toEqual(false);
        expect(wrapper.find({ref: 'submission_limit_reset_time_picker'}).exists()).toEqual(false);
    });

    test('Submission limit reset time binding', async () => {
        component.d_show_reset_time_picker = true;
        await component.$nextTick();

        let time = <Wrapper<TimePicker>> wrapper.find({ref: 'submission_limit_reset_time_picker'});
        component.d_project.submission_limit_reset_time = '08:00';
        expect(time.vm.value).toEqual('08:00');

        time.vm.go_to_next_minute();
        expect(component.d_project.submission_limit_reset_time).toEqual('08:01');
    });

    test('Submission limit reset timezone binding', () => {
        let submission_limit_reset_timezone_input = wrapper.find(
            '#submission-limit-reset-timezone');

        submission_limit_reset_timezone_input.setValue('US/Mountain');
        expect(component.d_project.submission_limit_reset_timezone).toEqual('US/Mountain');

        submission_limit_reset_timezone_input.setValue('US/Eastern');
        expect(component.d_project.submission_limit_reset_timezone).toEqual('US/Eastern');

        component.d_project.submission_limit_reset_timezone = 'UTC';
        expect_html_element_has_value(submission_limit_reset_timezone_input, 'UTC');

        component.d_project.submission_limit_reset_timezone = 'US/Pacific';
        expect_html_element_has_value(submission_limit_reset_timezone_input, 'US/Pacific');
    });

    test('Groups get more submissions binding', async () => {
        component.d_project.max_group_size = 2;
        await component.$nextTick();

        let checkbox = wrapper.find('#groups-combine-daily-submissions');
        expect(checkbox.is('[disabled]')).toEqual(false);

        checkbox.setChecked(true);
        expect(component.d_project.groups_combine_daily_submissions).toEqual(true);

        checkbox.setChecked(false);
        expect(component.d_project.groups_combine_daily_submissions).toEqual(false);

        checkbox.setChecked(true);
        expect(component.d_project.groups_combine_daily_submissions).toEqual(true);

        component.d_project.groups_combine_daily_submissions = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        component.d_project.groups_combine_daily_submissions = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('Groups get more submissions disabled when max group size is 1', async () => {
        component.d_project.max_group_size = 1;
        await component.$nextTick();

        let checkbox = wrapper.find('#groups-combine-daily-submissions');
        expect(checkbox.is('[disabled]')).toEqual(true);
    });

    test('Allow late days binding', () => {
        let checkbox = wrapper.find('#allow-late-days');

        checkbox.setChecked(true);
        expect(component.d_project.allow_late_days).toEqual(true);

        checkbox.setChecked(false);
        expect(component.d_project.allow_late_days).toEqual(false);

        checkbox.setChecked(true);
        expect(component.d_project.allow_late_days).toEqual(true);

        component.d_project.allow_late_days = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);

        component.d_project.allow_late_days = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
    });

    test('d_project.total_submission_limit nullable form input', () => {
        component.d_project.total_submission_limit = 42;
        let daily_submission_limit_input = wrapper.find('#total-submission-limit');
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('42');

        expect(component.settings_form_is_valid).toBe(true);

        component.d_project.total_submission_limit = null;
        expect(get_validated_input_text(daily_submission_limit_input)).toEqual('');

        expect(component.settings_form_is_valid).toBe(true);

        set_validated_input_text(daily_submission_limit_input, '7');
        expect(component.d_project.total_submission_limit).toEqual(7);

        expect(component.settings_form_is_valid).toBe(true);

        set_validated_input_text(daily_submission_limit_input, '');
        expect(component.d_project.total_submission_limit).toEqual(null);

        expect(component.settings_form_is_valid).toBe(true);
    });

    test('Successful attempt to save project settings', async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue).toEqual(component.d_project);
    });

    test('Unsuccessful attempt to save project settings', async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');
        save_settings_stub.returns(Promise.reject(
            new HttpError(400, {__all__: "Project with this name already exists in course"})
        ));

        expect(component.settings_form_is_valid).toBe(true);

        let project_name_input = wrapper.find({ref: 'project_name_input'}).find('#input');
        (<HTMLInputElement> project_name_input.element).value = "AlreadyExists.cpp";
        project_name_input.trigger('input');
        await component.$nextTick();

        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit');
        await component.$nextTick();

        expect(save_settings_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});


describe('Invalid input tests', () => {
    let wrapper: Wrapper<ProjectSettings>;
    let component: ProjectSettings;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        project = new Project({
            pk: 3,
            name: "Project 200",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: []
        });

        wrapper = mount(ProjectSettings, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Error project name is blank', async () => {
        let project_name_input = wrapper.find({ref: "project_name_input"}).find('#input');
        let project_name_validator = <ValidatedInput> wrapper.find({ref: "project_name_input"}).vm;

        expect(project_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> project_name_input.element).value = "   ";
        project_name_input.trigger('input');
        await component.$nextTick();

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
        let bonus_submissions_input = wrapper.find(
            {ref: "bonus_submissions_input"}
        ).find('#input');
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: "bonus_submissions_input"}
        ).vm;

        expect(bonus_submissions_validator.is_valid).toBe(true);

        (<HTMLInputElement> bonus_submissions_input.element).value = "   ";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);

        (<HTMLInputElement> bonus_submissions_input.element).value = "King's Landing";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

    test('num_bonus_submissions is negative', async () => {
        let bonus_submissions_input = wrapper.find(
            {ref: "bonus_submissions_input"}
        ).find('#input');
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: "bonus_submissions_input"}
        ).vm;

        expect(bonus_submissions_validator.is_valid).toBe(true);

        (<HTMLInputElement> bonus_submissions_input.element).value = "-18";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

});
