import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    ExpectedOutputSource,
    ExpectedReturnCode,
    get_sandbox_docker_images,
    InstructorFile,
    Project,
    StdinSource, UltimateSubmissionPolicy,
    ValueFeedbackLevel
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGSuites from '@/components/project_admin/ag_suites/ag_suites.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuites tests', () => {
    let wrapper: Wrapper<AGSuites>;
    let component: AGSuites;
    let ag_suite_colors: AGTestSuite;

    let ag_case_purple: AGTestCase;
    let ag_command_purple_1: AGTestCommand;
    let ag_command_purple_2: AGTestCommand;

    let ag_case_blue: AGTestCase;
    let ag_command_blue_1: AGTestCommand;

    let ag_suite_pets: AGTestSuite;

    let ag_case_dog: AGTestCase;
    let ag_command_dog_1: AGTestCommand;

    let ag_case_bird: AGTestCase;
    let ag_command_bird_1: AGTestCommand;

    let ag_suite_beverages: AGTestSuite;

    let default_suite_feedback_config: AGTestSuiteFeedbackConfig;
    let default_case_feedback_config: AGTestCaseFeedbackConfig;
    let default_command_feedback_config: AGTestCommandFeedbackConfig;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        default_suite_feedback_config = {
            show_individual_tests: false,
            show_setup_return_code: false,
            show_setup_stderr: false,
            show_setup_stdout: false,
            show_setup_timed_out: false,
            visible: false
        };

        default_case_feedback_config = {
            visible: false,
            show_individual_commands: false
        };

        default_command_feedback_config = {
            visible: false,
            return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            show_points: false,
            show_actual_return_code: false,
            show_actual_stdout: false,
            show_actual_stderr: false,
            show_whether_timed_out: false
        };

        ag_command_purple_1 = new AGTestCommand({
            pk: 1,
            name: "Purple Command 1",
            ag_test_case: 1,
            last_modified: "",
            cmd: "Say please and thank you",
            stdin_source: StdinSource.none,
            stdin_text: "",
            stdin_instructor_file: null,
            expected_return_code: ExpectedReturnCode.none,
            expected_stdout_source: ExpectedOutputSource.none,
            expected_stdout_text: "",
            expected_stdout_instructor_file: null,
            expected_stderr_source: ExpectedOutputSource.none,
            expected_stderr_text: "",
            expected_stderr_instructor_file: null,
            ignore_case: false,
            ignore_whitespace: false,
            ignore_whitespace_changes: false,
            ignore_blank_lines: false,
            points_for_correct_return_code: 1,
            points_for_correct_stdout: 1,
            points_for_correct_stderr: 1,
            deduction_for_wrong_return_code: 1,
            deduction_for_wrong_stdout: 1,
            deduction_for_wrong_stderr: 1,
            normal_fdbk_config: default_command_feedback_config,
            first_failed_test_normal_fdbk_config: default_command_feedback_config,
            ultimate_submission_fdbk_config: default_command_feedback_config,
            past_limit_submission_fdbk_config: default_command_feedback_config,
            staff_viewer_fdbk_config: default_command_feedback_config,
            time_limit: 1,
            stack_size_limit: 1,
            virtual_memory_limit: 1,
            process_spawn_limit: 1
        });

        ag_command_purple_2 = new AGTestCommand({
            pk: 2,
            name: "Purple Command 2",
            ag_test_case: 1,
            last_modified: "",
            cmd: "Say please and thank you",
            stdin_source: StdinSource.none,
            stdin_text: "",
            stdin_instructor_file: null,
            expected_return_code: ExpectedReturnCode.none,
            expected_stdout_source: ExpectedOutputSource.none,
            expected_stdout_text: "",
            expected_stdout_instructor_file: null,
            expected_stderr_source: ExpectedOutputSource.none,
            expected_stderr_text: "",
            expected_stderr_instructor_file: null,
            ignore_case: false,
            ignore_whitespace: false,
            ignore_whitespace_changes: false,
            ignore_blank_lines: false,
            points_for_correct_return_code: 1,
            points_for_correct_stdout: 1,
            points_for_correct_stderr: 1,
            deduction_for_wrong_return_code: 1,
            deduction_for_wrong_stdout: 1,
            deduction_for_wrong_stderr: 1,
            normal_fdbk_config: default_command_feedback_config,
            first_failed_test_normal_fdbk_config: default_command_feedback_config,
            ultimate_submission_fdbk_config: default_command_feedback_config,
            past_limit_submission_fdbk_config: default_command_feedback_config,
            staff_viewer_fdbk_config: default_command_feedback_config,
            time_limit: 1,
            stack_size_limit: 1,
            virtual_memory_limit: 1,
            process_spawn_limit: 1
        });

        ag_command_blue_1 = new AGTestCommand({
            pk: 3,
            name: "Blue Command 1",
            ag_test_case: 2,
            last_modified: "",
            cmd: "Say please and thank you",
            stdin_source: StdinSource.none,
            stdin_text: "",
            stdin_instructor_file: null,
            expected_return_code: ExpectedReturnCode.none,
            expected_stdout_source: ExpectedOutputSource.none,
            expected_stdout_text: "",
            expected_stdout_instructor_file: null,
            expected_stderr_source: ExpectedOutputSource.none,
            expected_stderr_text: "",
            expected_stderr_instructor_file: null,
            ignore_case: false,
            ignore_whitespace: false,
            ignore_whitespace_changes: false,
            ignore_blank_lines: false,
            points_for_correct_return_code: 1,
            points_for_correct_stdout: 1,
            points_for_correct_stderr: 1,
            deduction_for_wrong_return_code: 1,
            deduction_for_wrong_stdout: 1,
            deduction_for_wrong_stderr: 1,
            normal_fdbk_config: default_command_feedback_config,
            first_failed_test_normal_fdbk_config: default_command_feedback_config,
            ultimate_submission_fdbk_config: default_command_feedback_config,
            past_limit_submission_fdbk_config: default_command_feedback_config,
            staff_viewer_fdbk_config: default_command_feedback_config,
            time_limit: 1,
            stack_size_limit: 1,
            virtual_memory_limit: 1,
            process_spawn_limit: 1
        });

        ag_command_dog_1 = new AGTestCommand({
            pk: 4,
            name: "Dog Command 1",
            ag_test_case: 3,
            last_modified: "",
            cmd: "Say please and thank you",
            stdin_source: StdinSource.none,
            stdin_text: "",
            stdin_instructor_file: null,
            expected_return_code: ExpectedReturnCode.none,
            expected_stdout_source: ExpectedOutputSource.none,
            expected_stdout_text: "",
            expected_stdout_instructor_file: null,
            expected_stderr_source: ExpectedOutputSource.none,
            expected_stderr_text: "",
            expected_stderr_instructor_file: null,
            ignore_case: false,
            ignore_whitespace: false,
            ignore_whitespace_changes: false,
            ignore_blank_lines: false,
            points_for_correct_return_code: 1,
            points_for_correct_stdout: 1,
            points_for_correct_stderr: 1,
            deduction_for_wrong_return_code: 1,
            deduction_for_wrong_stdout: 1,
            deduction_for_wrong_stderr: 1,
            normal_fdbk_config: default_command_feedback_config,
            first_failed_test_normal_fdbk_config: default_command_feedback_config,
            ultimate_submission_fdbk_config: default_command_feedback_config,
            past_limit_submission_fdbk_config: default_command_feedback_config,
            staff_viewer_fdbk_config: default_command_feedback_config,
            time_limit: 1,
            stack_size_limit: 1,
            virtual_memory_limit: 1,
            process_spawn_limit: 1
        });

        ag_command_bird_1 = new AGTestCommand({
            pk: 5,
            name: "Bird Command 1",
            ag_test_case: 4,
            last_modified: "",
            cmd: "Say please and thank you",
            stdin_source: StdinSource.none,
            stdin_text: "",
            stdin_instructor_file: null,
            expected_return_code: ExpectedReturnCode.none,
            expected_stdout_source: ExpectedOutputSource.none,
            expected_stdout_text: "",
            expected_stdout_instructor_file: null,
            expected_stderr_source: ExpectedOutputSource.none,
            expected_stderr_text: "",
            expected_stderr_instructor_file: null,
            ignore_case: false,
            ignore_whitespace: false,
            ignore_whitespace_changes: false,
            ignore_blank_lines: false,
            points_for_correct_return_code: 1,
            points_for_correct_stdout: 1,
            points_for_correct_stderr: 1,
            deduction_for_wrong_return_code: 1,
            deduction_for_wrong_stdout: 1,
            deduction_for_wrong_stderr: 1,
            normal_fdbk_config: default_command_feedback_config,
            first_failed_test_normal_fdbk_config: default_command_feedback_config,
            ultimate_submission_fdbk_config: default_command_feedback_config,
            past_limit_submission_fdbk_config: default_command_feedback_config,
            staff_viewer_fdbk_config: default_command_feedback_config,
            time_limit: 1,
            stack_size_limit: 1,
            virtual_memory_limit: 1,
            process_spawn_limit: 1
        });

        ag_case_purple = new AGTestCase({
            pk: 1,
            name: "Purple Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_purple_1, ag_command_purple_2]
        });

        ag_case_blue = new AGTestCase({
            pk: 2,
            name: "Blue Case",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_blue_1]
        });

        ag_case_dog = new AGTestCase({
            pk: 3,
            name: "Dog Case",
            ag_test_suite: 2,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_dog_1]
        });

        ag_case_bird = new AGTestCase({
            pk: 4,
            name: "Bird Case",
            ag_test_suite: 2,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_bird_1]
        });

        instructor_file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "antarctica.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_2 = new InstructorFile({
            pk: 2,
            project: 10,
            name: "africa.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_3 = new InstructorFile({
            pk: 3,
            project: 10,
            name: "asia.cpp",
            size: 2,
            last_modified: "now"
        });

        ag_suite_colors = new AGTestSuite({
            pk: 1,
            name: "Colors Suite",
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
            normal_fdbk_config: default_suite_feedback_config,
            past_limit_submission_fdbk_config: default_suite_feedback_config,
            staff_viewer_fdbk_config: default_suite_feedback_config,
            ultimate_submission_fdbk_config: default_suite_feedback_config,
            ag_test_cases: [ag_case_purple, ag_case_blue],
            instructor_files_needed: [],
            student_files_needed: []
        });

        ag_suite_pets = new AGTestSuite({
            pk: 2,
            name: "Pets Suite",
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
            normal_fdbk_config: default_suite_feedback_config,
            past_limit_submission_fdbk_config: default_suite_feedback_config,
            staff_viewer_fdbk_config: default_suite_feedback_config,
            ultimate_submission_fdbk_config: default_suite_feedback_config,
            ag_test_cases: [ag_case_dog, ag_case_bird],
            instructor_files_needed: [],
            student_files_needed: []
        });

        ag_suite_beverages = new AGTestSuite({
            pk: 3,
            name: "Beverages Suite",
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
            normal_fdbk_config: default_suite_feedback_config,
            past_limit_submission_fdbk_config: default_suite_feedback_config,
            staff_viewer_fdbk_config: default_suite_feedback_config,
            ultimate_submission_fdbk_config: default_suite_feedback_config,
            ag_test_cases: [],
            instructor_files_needed: [],
            student_files_needed: []
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
            expected_student_files: [],
            instructor_files: [instructor_file_1, instructor_file_2, instructor_file_3]
        });

        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([]));

        sinon.stub(AGTestSuite, 'get_all_from_project').returns(
            Promise.resolve([ag_suite_colors, ag_suite_pets, ag_suite_beverages])
        );

        wrapper = mount(AGSuites, {
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

    test('Creating a suite - successfully', async () => {
        let new_suite = new AGTestSuite({
            pk: 4,
            name: "New Suite",
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
            normal_fdbk_config: default_suite_feedback_config,
            past_limit_submission_fdbk_config: default_suite_feedback_config,
            staff_viewer_fdbk_config: default_suite_feedback_config,
            ultimate_submission_fdbk_config: default_suite_feedback_config,
            ag_test_cases: [],
            instructor_files_needed: [],
            student_files_needed: []
        });

        wrapper.find('#add-suite-button').trigger('click');
        await component.$nextTick();

        component.new_suite_name = "Sweet";

        expect(component.test_suites.length).toEqual(3);

        let create_suite_stub = sinon.stub(AGTestSuite, 'create').callsFake(() =>
            AGTestSuite.notify_ag_test_suite_created(new_suite)
        );

        wrapper.find('#add-suite-form').trigger('submit.native');
        await component.$nextTick();

        expect(create_suite_stub.calledOnce).toBe(true);
        expect(component.new_suite_name).toBe("");
        expect(component.test_suites.length).toEqual(4);
        expect(component.active_suite).toEqual(new_suite);
    });

    test('Creating a suite - unsuccessfully', async () => {
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

        let create_suite_stub = sinon.stub(AGTestSuite, 'create').returns(
            Promise.reject(axios_response_instance)
        );

        wrapper.find('#add-suite-button').trigger('click');
        await component.$nextTick();

        component.new_suite_name = "Sweet";

        wrapper.find('#add-suite-form').trigger('submit.native');
        await component.$nextTick();

        expect(create_suite_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test.only('Delete all suites - active_suite gets set to null', async () => {
        expect(component.test_suites.length).toEqual(3);

        wrapper.setData({active_suite: ag_suite_colors});
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.test_suites.length).toEqual(2);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.test_suites.length).toEqual(1);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.test_suites.length).toEqual(0);
        expect(component.active_suite).toBe(null);
    });

    test('Delete first suite in suites', async () => {
        expect(component.test_suites.length).toEqual(3);

        wrapper.setData({active_suite: ag_suite_colors});
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.test_suites.length).toEqual(2);
        expect(component.active_suite).toEqual(ag_suite_pets);
    });

    test('Delete last suite in suites', async () => {
        expect(component.test_suites.length).toEqual(3);

        wrapper.setData({active_suite: ag_suite_beverages});
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.test_suites.length).toEqual(2);
        expect(component.active_suite).toEqual(ag_suite_pets);
    });

    test('Delete middle suite in suites', async () => {
        expect(component.test_suites.length).toEqual(3);

        wrapper.setData({active_suite: ag_suite_pets});
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.test_suites.length).toEqual(2);
        expect(component.active_suite).toEqual(ag_suite_beverages);
    });

    test('Suite changed', async () => {
        let updated_ag_suite_pets = new AGTestSuite({
            pk: 2,
            name: "Pets 2 Suite",
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
            normal_fdbk_config: default_suite_feedback_config,
            past_limit_submission_fdbk_config: default_suite_feedback_config,
            staff_viewer_fdbk_config: default_suite_feedback_config,
            ultimate_submission_fdbk_config: default_suite_feedback_config,
            ag_test_cases: [ag_case_dog, ag_case_bird],
            instructor_files_needed: [],
            student_files_needed: []
        });
        expect(component.test_suites[1].name).toEqual(ag_suite_pets.name);

        AGTestSuite.notify_ag_test_suite_changed(updated_ag_suite_pets);
        await component.$nextTick();

        expect(component.test_suites[1].name).toEqual(updated_ag_suite_pets.name);
    });

    test('Update active suite', async () => {
        wrapper.findAll('.test-suite').at(0).trigger('click');
        await component.$nextTick();

        expect(component.active_suite).toEqual(ag_suite_colors);

        wrapper.findAll('.test-suite').at(1).trigger('click');
        await component.$nextTick();

        expect(component.active_suite).toEqual(ag_suite_pets);
    });

    test('Update active suite - close active suite', async () => {
        wrapper.findAll('.test-suite').at(0).trigger('click');
        await component.$nextTick();

        expect(component.active_suite).toEqual(ag_suite_colors);

        wrapper.findAll('.test-suite').at(0).trigger('click');
        await component.$nextTick();

        expect(component.active_suite).toBeNull();
    });

    test('Update active case', async () => {
        wrapper.findAll('.test-suite').at(0).trigger('click');
        await component.$nextTick();

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toBeNull();
        expect(component.active_command).toBeNull();

        wrapper.findAll('.test-case').at(1).trigger('click');

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_blue);
        expect(component.active_command).toEqual(ag_command_blue_1);

        wrapper.findAll('.test-case').at(0).trigger('click');

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_purple);
        expect(component.active_command).toBeNull();

        wrapper.findAll('.test-case').at(1).trigger('click');

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_blue);
        expect(component.active_command).toEqual(ag_command_blue_1);
    });

    test('Update active command', async () => {
        wrapper.findAll('.test-suite').at(0).trigger('click');
        await component.$nextTick();

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toBeNull();

        wrapper.findAll('.test-case').at(0).trigger('click');

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_purple);
        expect(component.active_command).toBeNull();

        wrapper.findAll('.test-command').at(0).trigger('click');

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_purple);
        expect(component.active_command).toEqual(ag_command_purple_1);

        wrapper.findAll('.test-command').at(1).trigger('click');

        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_purple);
        expect(component.active_command).toEqual(ag_command_purple_2);
    });

    // warning case is null in ag_command_settings
    test('active_level_is_suite getter', async () => {
        expect(component.active_level_is_suite).toBe(false);

        wrapper.findAll('.test-suite').at(1).trigger('click');
        await component.$nextTick();

        expect(component.active_level_is_suite).toBe(true);
        expect(component.active_suite).toEqual(ag_suite_pets);
        expect(component.active_case).toBeNull();
        expect(component.active_command).toBeNull();

        wrapper.findAll('.test-case').at(1).trigger('click');
        await component.$nextTick();

        expect(component.active_level_is_suite).toBe(false);
        expect(component.active_suite).toEqual(ag_suite_pets);
        expect(component.active_case).toEqual(ag_case_bird);
        expect(component.active_command).toEqual(ag_command_bird_1);

        wrapper.findAll('.test-suite').at(1).trigger('click');
        await component.$nextTick();

        expect(component.active_level_is_suite).toBe(true);
        expect(component.active_suite).toEqual(ag_suite_pets);
        expect(component.active_case).toBeNull();
        expect(component.active_command).toBeNull();

        wrapper.findAll('.test-suite').at(1).trigger('click');
        await component.$nextTick();

        expect(component.active_level_is_suite).toBe(false);
        expect(component.active_suite).toBeNull();
        expect(component.active_case).toBeNull();
        expect(component.active_command).toBeNull();
    });

    // invalid prop - warning case is null in ag_command_settings
    test('active_level_is_command getter', async () => {
        expect(component.active_level_is_command).toBe(false);

        wrapper.findAll('.test-suite').at(0).trigger('click');
        await component.$nextTick();

        expect(component.active_level_is_command).toBe(false);
        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toBeNull();
        expect(component.active_command).toBeNull();

        wrapper.findAll('.test-case').at(0).trigger('click');

        expect(component.active_level_is_command).toBe(false);
        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_purple);
        expect(component.active_command).toBeNull();

        wrapper.findAll('.test-command').at(1).trigger('click');

        expect(component.active_level_is_command).toBe(true);
        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_purple);
        expect(component.active_command).toEqual(ag_command_purple_2);

        wrapper.findAll('.test-case').at(1).trigger('click');

        expect(component.active_level_is_command).toBe(true);
        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_blue);
        expect(component.active_command).toEqual(ag_command_blue_1);

        wrapper.findAll('.test-suite').at(0).trigger('click');

        expect(component.active_level_is_command).toBe(false);
        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toBeNull();
        expect(component.active_command).toBeNull();
    });
});
