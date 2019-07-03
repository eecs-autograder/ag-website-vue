import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    ExpectedStudentFile,
    InstructorFile,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import AGSuiteSettings from '@/components/project_admin/ag_suites/ag_suite_settings.vue';

import { checkbox_is_checked } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuiteSettings tests', () => {
    let wrapper: Wrapper<AGSuiteSettings>;
    let component: AGSuiteSettings;
    let ag_suite: AGTestSuite;
    let project: Project;
    let student_file_1: ExpectedStudentFile;
    let student_file_2: ExpectedStudentFile;
    let student_file_3: ExpectedStudentFile;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let default_feedback_config: AGTestSuiteFeedbackConfig;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        default_feedback_config = {
            show_individual_tests: false,
            show_setup_return_code: false,
            show_setup_stderr: false,
            show_setup_stdout: false,
            show_setup_timed_out: false,
            visible: false
        };

        student_file_1 = new ExpectedStudentFile({
            pk: 1,
            project: 10,
            pattern: "elephant*.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        student_file_2 = new ExpectedStudentFile({
            pk: 2,
            project: 10,
            pattern: "monkey?.cpp",
            min_num_matches: 1,
            max_num_matches: 2,
            last_modified: "now"
        });

        student_file_3 = new ExpectedStudentFile({
            pk: 3,
            project: 10,
            pattern: "zebra.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        instructor_file_1 = new InstructorFile({
            pk: 4,
            project: 10,
            name: "penguin.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_2 = new InstructorFile({
            pk: 5,
            project: 10,
            name: "rabit.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_3 = new InstructorFile({
            pk: 6,
            project: 10,
            name: "walrus.cpp",
            size: 2,
            last_modified: "now"
        });

        ag_suite = new AGTestSuite({
            pk: 1,
            name: "Suite 1",
            project: 10,
            last_modified: "",
            read_only_instructor_files: true,
            setup_suite_cmd: "",
            setup_suite_cmd_name: "",
            sandbox_docker_image: {
                pk: 1,
                name: "Sandy",
                tag: "",
                display_name: "Hi everyone"
            },
            allow_network_access: false,
            deferred: true,
            normal_fdbk_config: default_feedback_config,
            past_limit_submission_fdbk_config: default_feedback_config,
            staff_viewer_fdbk_config: default_feedback_config,
            ultimate_submission_fdbk_config: default_feedback_config,
            ag_test_cases: [],
            instructor_files_needed: [instructor_file_1, instructor_file_2],
            student_files_needed: [student_file_1, student_file_2]
        });

        project = new Project({
            pk: 10,
            name: "Detroit Zoo",
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
            expected_student_files: [student_file_1, student_file_2, student_file_3],
            instructor_files: [instructor_file_1, instructor_file_2, instructor_file_3]
        });

        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([]));

        wrapper = mount(AGSuiteSettings, {
            propsData: {
                ag_test_suite: ag_suite,
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

    test('Suite name cannot be empty - violates condition', async () => {
        expect(component.settings_form_is_valid).toBe(true);

        component.d_ag_test_suite!.name = " ";
        await component.$nextTick();

        expect(component.settings_form_is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('deferred binding', () => {
        let synchronous_checkbox = wrapper.find('#synchronous-or-deferred');

        synchronous_checkbox.setChecked(true);
        expect(component.d_ag_test_suite!.deferred).toEqual(false);

        synchronous_checkbox.setChecked(false);
        expect(component.d_ag_test_suite!.deferred).toEqual(true);

        synchronous_checkbox.setChecked(true);
        expect(component.d_ag_test_suite!.deferred).toEqual(false);

        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);

        component.d_ag_test_suite!.deferred = true;
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(false);

        component.d_ag_test_suite!.deferred = false;
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);
    });

    test('Adding a student file', async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'student_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([student_file_3]);

        let search_bar = wrapper.find(
            {ref: 'student_files_typeahead'}
        ).find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "a";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_3);

        search_bar.trigger('keydown', {code: 'Enter'});
        await dropdown_typeahead.$nextTick();

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(3);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_ag_test_suite!.student_files_needed[1]).toEqual(student_file_2);
        expect(component.d_ag_test_suite!.student_files_needed[2]).toEqual(student_file_3);
    });

    test('Deleting a student file', async () => {
        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_ag_test_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(1);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
    });

    test('Adding an instructor file', async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'instructor_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([instructor_file_3]);

        let search_bar = wrapper.find(
            {ref: 'instructor_files_typeahead'}
        ).find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "a";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_3);

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(3);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_ag_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);
        expect(component.d_ag_test_suite!.instructor_files_needed[2]).toEqual(instructor_file_3);
    });

    test('Deleting an instructor file', async () => {
        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_ag_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        let instructor_files_section = wrapper.find('.instructor-files');
        instructor_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(1);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
    });

    test('ExpectedStudentFile filter function on dropdown typeahead',  async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'student_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([student_file_3]);

        dropdown_typeahead.filter_text = "e";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_3);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(0).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([student_file_1, student_file_3]);

        dropdown_typeahead.filter_text = "ep";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_1);
    });

    test('expected_student_files_available', async () => {
        expect(component.expected_student_files_available).toEqual([student_file_3]);

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_ag_test_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(1);
        expect(component.expected_student_files_available).toEqual(
            [student_file_2, student_file_3]
        );
    });

    test('InstructorFile filter function on dropdown typeahead', async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'instructor_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([instructor_file_3]);

        dropdown_typeahead.filter_text = "a";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_3);

        let instructor_files_section = wrapper.find('.instructor-files');
        instructor_files_section.findAll('.file').at(0).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([instructor_file_1, instructor_file_3]);

        dropdown_typeahead.filter_text = "ui";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_1);
    });

    test('instructor_files_available', async () => {
        expect(component.instructor_files_available).toEqual([instructor_file_3]);

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_ag_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        let instructor_file_section = wrapper.find('.instructor-files');
        instructor_file_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(1);
        expect(component.instructor_files_available).toEqual(
            [instructor_file_2, instructor_file_3]
        );
    });

    test('Save suite settings - successful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_suite!, 'save');

        wrapper.find('#ag-test-suite-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('Save suite settings - unsuccessful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_suite!, 'save');
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Ag test suite with this Name and Project already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        save_stub.returns(Promise.reject(axios_response_instance));

        wrapper.find('#ag-test-suite-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Delete a Suite', async () => {
        let delete_stub = sinon.stub(component.d_ag_test_suite!, 'delete');

        wrapper.setData({current_tab_index: 2});
        await component.$nextTick();

        wrapper.find('.delete-ag-test-suite-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Parent component changes the value of the test_suite prop', async () => {
        let another_ag_suite = new AGTestSuite({
            pk: 2,
            name: "Suite 2",
            project: 10,
            last_modified: "",
            read_only_instructor_files: true,
            setup_suite_cmd: "",
            setup_suite_cmd_name: "",
            sandbox_docker_image: {
            pk: 1,
            name: "Patrick",
            tag: "",
            display_name: "Star"
            },
            allow_network_access: false,
            deferred: true,
            normal_fdbk_config: default_feedback_config,
            past_limit_submission_fdbk_config: default_feedback_config,
            staff_viewer_fdbk_config: default_feedback_config,
            ultimate_submission_fdbk_config: default_feedback_config,
            ag_test_cases: [],
            instructor_files_needed: [instructor_file_2, instructor_file_1],
            student_files_needed: [student_file_2, student_file_1]
        });

        expect(component.d_ag_test_suite!.pk).toEqual(ag_suite.pk);
        expect(component.current_tab_index).toEqual(0);

        wrapper.setProps({'ag_test_suite': another_ag_suite});
        await component.$nextTick();

        expect(component.d_ag_test_suite!.pk).toEqual(another_ag_suite.pk);
        expect(component.current_tab_index).toEqual(0);

        wrapper.setData({current_tab_index: 2});
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(2);

        wrapper.setProps({'ag_test_suite': ag_suite});
        await component.$nextTick();

        expect(component.d_ag_test_suite!.pk).toEqual(ag_suite.pk);
        expect(component.current_tab_index).toEqual(0);
    });
});
