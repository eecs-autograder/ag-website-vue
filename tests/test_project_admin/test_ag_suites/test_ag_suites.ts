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
    let ag_case_sprite: AGTestCase;
    let ag_command_sprite_1: AGTestCommand;

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

        ag_command_sprite_1 = new AGTestCommand({
            pk: 5,
            name: "Sprite Command 1",
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

        ag_case_sprite = new AGTestCase({
            pk: 5,
            name: "Sprite Case",
            ag_test_suite: 3,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_sprite_1]
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
            ag_test_cases: [ag_case_sprite],
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

    // Suite Related -----------------------------------------------------------------------------

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

    test('Delete all suites - active_suite gets set to null', async () => {
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

    // Case Related ------------------------------------------------------------------------------

    test('Case created', async () => {
        component.update_active_suite(ag_suite_pets);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(2);

        let cat_case = new AGTestCase({
            pk: 6,
            name: "Cat Case",
            ag_test_suite: ag_suite_pets.pk,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        AGTestCase.notify_ag_test_case_created(cat_case);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(3);
        expect(component.active_case).toEqual(cat_case);
    });

    test('Case changed', async () => {
        let updated_ag_case_bird = new AGTestCase({
            pk: 4,
            name: "Updated Bird Case",
            ag_test_suite: 2,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: [ag_command_bird_1]
        });

        component.update_active_suite(ag_suite_pets);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(2);
        expect(component.test_suites[1].ag_test_cases[1].name).toEqual(ag_case_bird.name);

        AGTestCase.notify_ag_test_case_changed(updated_ag_case_bird);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(2);
        expect(ag_case_bird.name).not.toEqual(updated_ag_case_bird.name);
        expect(component.test_suites[1].ag_test_cases[1].name).toEqual(updated_ag_case_bird.name);
    });

    test('Case deleted in suite with only one case - suite becomes active level', async () => {
        component.update_active_suite(ag_suite_beverages);
        await component.$nextTick();

        component.update_active_case(ag_case_sprite);
        await component.$nextTick();

        expect(component.test_suites[2].ag_test_cases.length).toEqual(1);

        AGTestCase.notify_ag_test_case_deleted(ag_case_sprite);
        await component.$nextTick();

        expect(component.test_suites[2].ag_test_cases.length).toEqual(0);
        expect(component.active_level_is_suite).toBe(true);
    });

    test('first case deleted in suite with more than one case', async () => {
        component.update_active_suite(ag_suite_pets);
        await component.$nextTick();

        component.update_active_case(ag_case_dog);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(2);

        AGTestCase.notify_ag_test_case_deleted(ag_case_dog);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(1);
        expect(component.active_case).toEqual(ag_case_bird);
        expect(component.active_level_is_suite).toBe(false);
    });

    test('Case that is not the first case is deleted in suite with more than one ' +
         'case',
         async () => {
        component.update_active_suite(ag_suite_pets);
        await component.$nextTick();

        component.update_active_case(ag_case_bird);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(2);

        AGTestCase.notify_ag_test_case_deleted(ag_case_bird);
        await component.$nextTick();

        expect(component.test_suites[1].ag_test_cases.length).toEqual(1);
        expect(component.active_case).toEqual(ag_case_dog);
        expect(component.active_level_is_suite).toBe(false);
    });

    // Command Related ---------------------------------------------------------------------------

    test('Command created', async () => {
        component.update_active_suite(ag_suite_colors);
        await component.$nextTick();

        component.update_active_case(ag_case_blue);
        await component.$nextTick();

        let ag_command_blue_2 = new AGTestCommand({
            pk: 7,
            name: "Blue Command 2",
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

        AGTestCommand.notify_ag_test_command_created(ag_command_blue_2);
        await component.$nextTick();

        expect(component.active_case!.ag_test_commands.length).toEqual(2);
        expect(component.active_command).toEqual(ag_command_blue_2);
    });

    test.only('Command changed - parent case has more than one command', async () => {
        let updated_ag_command_purple_1 = new AGTestCommand({
            pk: 1,
            name: "Updated Purple Command 1",
            ag_test_case: 1,
            last_modified: "",
            cmd: "The Music Man",
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

        component.update_active_suite(ag_suite_colors);
        await component.$nextTick();

        component.update_active_case(ag_case_purple);
        await component.$nextTick();
        //
        expect(component.active_suite).toEqual(ag_suite_colors);
        expect(component.active_case).toEqual(ag_case_purple);
        expect(component.active_command).toEqual(ag_command_purple_1);

        expect(component.test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(component.test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            ag_command_purple_1
        );

        AGTestCommand.notify_ag_test_command_changed(updated_ag_command_purple_1);
        await component.$nextTick();

        expect(ag_command_purple_1.name).not.toEqual(updated_ag_command_purple_1.name);
        expect(component.test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(component.test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            updated_ag_command_purple_1
        );

        expect(component.active_command).toEqual(updated_ag_command_purple_1);
    });

    test.skip('Command changed - parent case has exactly one command', async () => {

    });

    test.skip('First command deleted in case with more than one case', async () => {

    });

    test.skip('Command that is not the first command is deleted in suite with more than ' +
         'one case',
              async () => {

    });

    // Visiting Previous Command -----------------------------------------------------------------

    test.skip('prev_command_is_available (false) - Active case is null', async () => {
        // should return false
    });

    test.skip('prev_command_is_available (false) - Active command is null', async () => {
        // should return false
    });

    test.skip('prev_command_is_available (false) - Active case index is 0 and active suite' +
              ' index is zero',
              async () => {
             // should return false
    });

    test.skip('prev_command_is_available (false) - Active case index is 0, active suite ' +
              'index is not zero, and the previous suite doesnt have any test cases',
              async () => {
        // returns false
    });

    test.skip("prev_command_is_available (false) - Active case index is 0, active suite " +
              "index is not zero, the previous suite's last case doesnt have at least " +
              "index_active_command commands",
              async () => {
         // returns false
    });

    test.skip("prev_command_is_available (true) - Active case index is 0, active suite " +
              "index is not zero, the previous suite's last case has at least " +
              "index_active_command commands commands",
              async () => {
         // returns false
    });

    test.skip("prev_command_is_available (true) - Active case index is 0, active suite " +
              "index is not zero, the previous suite's last case has at least " +
              "index_active_command commands commands",
              async () => {
         // returns false
    });

    test.skip('prev_command_is_available (false) - Active case index is not zero, ' +
              'previous case does not have at least index_active_command commands',
              async () => {

    });

    test.skip('prev_command_is_available (true) - Active case index is not zero, ' +
              'previous case has at least index_active_command commands',
              async () => {

    });

    test.skip('go_to_prev_command - prev case in same suite', async () => {

    });

    test.skip('go_to_prev_command - last case in previous suite', async () => {

    });

    // Visiting Next Command ---------------------------------------------------------------------

    test.skip('next_command_is_available (false) - Active case is null', async () => {
        // should return false
    });

    test.skip('next_command_is_available (false) - Active command is null', async () => {
        // should return false
    });

    test.skip('next_command_is_available (false) - More than index_active_case cases ' +
              'in current suite but there are not at least index_active_command commands in the ' +
              'next suite',
              async () => {
             // should return false
    });

    test.skip('next_command_is_available (true) - More than index_active_case cases in ' +
              'current suite and next suite has at least index_active_command commands',
              async () => {
             // returns false
    });

    test.skip('next_command_is_available (false) - There are not more than index_active_case ' +
         'cases in the current suite, and current suite is the last suite',
              async () => {

    });

    test.skip('next_command_is_available (false) - There are not more than index_active_case ' +
         'cases in the current suite, current suite is not the last suite but the next suite' +
         'doesnt have any cases',
              async () => {

    });

    test.skip('next_command_is_available (false) - There are not more than index_active_case ' +
         'cases in the current suite, current suite is not the last suite, the next suite' +
         'has at least one case, but the first case doesnt have at least index_active_command ' +
         'commands.',
              async () => {

    });

    test.skip('next_command_is_available (true) - There are not more than index_active_case ' +
         'cases in the current suite, current suite is not the last suite, the next suite' +
         'has at least one case, and the first case has at least index_active_command ' +
         'commands.',
              async () => {

    });

    test.skip('go_to_next_command - next case in same suite', async () => {

    });

    test.skip('go_to_next_command - first case in next suite', async () => {

    });


    test.skip('active_level_is_suite', async () => {

    });

    test.skip('active_level_is_command', async () => {

    });

    // -------------------------------------------------------------------------------------------

    // updating active suite
    test.skip('updating active suite - suite was already the active suite', async () => {

    });

    test.skip('updating active suite - suite passed in is not already the active suite',
              async () => {

    });

    // updating active case
    test.skip('updating active case', async () => {

    });

    // updating active command
    test.skip('updating active command', async () => {

    });

});
