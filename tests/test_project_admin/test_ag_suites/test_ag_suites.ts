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
    HttpError,
    InstructorFile,
    Project,
    StdinSource,
    UltimateSubmissionPolicy,
    ValueFeedbackLevel
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import { AxiosError } from 'axios';
import { create } from 'domain';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGSuites from '@/components/project_admin/ag_suites/ag_suites.vue';

let default_suite_feedback_config: AGTestSuiteFeedbackConfig = {
    show_individual_tests: false,
    show_setup_return_code: false,
    show_setup_stderr: false,
    show_setup_stdout: false,
    show_setup_timed_out: false,
    visible: false
};

let default_case_feedback_config: AGTestCaseFeedbackConfig = {
    visible: false,
    show_individual_commands: false
};

let default_command_feedback_config: AGTestCommandFeedbackConfig = {
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

function create_command(pk: number, command_name: string, ag_test_case: number): AGTestCommand {
    let new_command = new AGTestCommand({
        pk: pk,
        name: command_name,
        ag_test_case: ag_test_case,
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
    return new_command;
}

function create_case(pk: number, case_name: string, ag_test_suite: number): AGTestCase {

    let new_case = new AGTestCase({
        pk: pk,
        name: case_name,
        ag_test_suite: ag_test_suite,
        normal_fdbk_config: default_case_feedback_config,
        ultimate_submission_fdbk_config: default_case_feedback_config,
        past_limit_submission_fdbk_config: default_case_feedback_config,
        staff_viewer_fdbk_config: default_case_feedback_config,
        last_modified: '',
        ag_test_commands: []
    });
    return new_case;
}

function create_suite(pk: number, suite_name: string): AGTestSuite {
    let new_suite = new AGTestSuite({
        pk: pk,
        name: suite_name,
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
    return new_suite;
}
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

    let ag_case_green: AGTestCase;
    let ag_command_green_1: AGTestCommand;
    let ag_command_green_2: AGTestCommand;
    let ag_command_green_3: AGTestCommand;

    let ag_suite_pets: AGTestSuite;

    let ag_case_dog: AGTestCase;
    let ag_command_dog_1: AGTestCommand;

    let ag_case_bird: AGTestCase;
    let ag_command_bird_1: AGTestCommand;

    let ag_suite_beverages: AGTestSuite;
    let ag_case_sprite: AGTestCase;
    let ag_command_sprite_1: AGTestCommand;

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

        ag_suite_colors = create_suite(1, "Colors Suite");
        ag_case_purple = create_case(1, "Purple Case", 1);
        ag_command_purple_1 = create_command(1, "Purple Command 1", 1);
        ag_command_purple_2 = create_command(2, "Purple Command 2", 1);
        ag_case_blue = create_case(2, "Blue Case", 1);
        ag_command_blue_1 = create_command(3, "Blue Command 1", 2);
        ag_case_green = create_case(3, "Green Case", 1);
        ag_command_green_1 = create_command(4, "Green Command 1", 3);
        ag_command_green_2 = create_command(5, "Green Command 1", 3);
        ag_command_green_3 = create_command(6, "Green Command 1", 3);

        ag_case_purple.ag_test_commands = [
            ag_command_purple_1,
            ag_command_purple_2
        ];
        ag_case_blue.ag_test_commands = [
            ag_command_blue_1
        ];
        ag_case_green.ag_test_commands = [
            ag_command_green_1,
            ag_command_green_2,
            ag_command_green_3
        ];
        ag_suite_colors.ag_test_cases = [
            ag_case_purple, ag_case_blue, ag_case_green
        ];

        ag_suite_pets = create_suite(2, "Pets Suite");
        ag_case_dog = create_case(4, "Dog Case", 2);
        ag_command_dog_1 = create_command(7, "Dog Command 1", 4);
        ag_case_bird = create_case(5, "Bird Case", 2);
        ag_command_bird_1 = create_command(8, "Bird Command 1", 5);

        ag_case_dog.ag_test_commands = [ag_command_dog_1];
        ag_case_bird.ag_test_commands = [ag_command_bird_1];
        ag_suite_pets.ag_test_cases = [ag_case_dog, ag_case_bird];

        ag_suite_beverages = create_suite(3, "Beverages Suite");
        ag_case_sprite = create_case(6, "Sprite Case", 3);
        ag_command_sprite_1 = create_command(9, "Sprite Command 1", 6);

        ag_case_sprite.ag_test_commands = [ag_command_sprite_1];
        ag_suite_beverages.ag_test_cases = [ag_case_sprite];

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
        let new_suite = create_suite(4, "New Suite");

        wrapper.find('#add-ag-test-suite-button').trigger('click');
        await component.$nextTick();

        component.new_ag_test_suite_name = "Sweet";

        expect(component.ag_test_suites.length).toEqual(3);

        let create_suite_stub = sinon.stub(AGTestSuite, 'create').callsFake(() =>
            AGTestSuite.notify_ag_test_suite_created(new_suite)
        );

        wrapper.find('#add-ag-test-suite-form').trigger('submit');
        await component.$nextTick();

        expect(create_suite_stub.calledOnce).toBe(true);
        expect(component.new_ag_test_suite_name).toBe("");
        expect(component.ag_test_suites.length).toEqual(4);
        expect(component.active_ag_test_suite).toEqual(new_suite);
    });

    test('Creating a suite - unsuccessfully', async () => {
        let create_suite_stub = sinon.stub(AGTestSuite, 'create').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test suite with this Name and Project already exists."}
                )
            )
        );

        wrapper.find('#add-ag-test-suite-button').trigger('click');
        await component.$nextTick();

        component.new_ag_test_suite_name = "Sweet";

        wrapper.find('#add-ag-test-suite-form').trigger('submit');
        await component.$nextTick();

        expect(create_suite_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Delete first suite in suites', async () => {
        expect(component.ag_test_suites.length).toEqual(3);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(2);
    });

    test('Delete active first suite in suites', async () => {
        expect(component.ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(2);
        expect(component.active_ag_test_suite!.pk).toEqual(ag_suite_pets.pk);
    });

    test('Delete last suite in suites', async () => {
        expect(component.ag_test_suites.length).toEqual(3);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(2);
    });

    test('Delete active last suite in suites', async () => {
        expect(component.ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_beverages);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(2);
        expect(component.active_ag_test_suite!.pk).toEqual(ag_suite_pets.pk);
    });

    test('Delete middle suite in suites', async () => {
        expect(component.ag_test_suites.length).toEqual(3);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(2);
    });

    test('Delete active middle suite in suites', async () => {
        expect(component.ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_pets);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(2);
        expect(component.active_ag_test_suite!.pk).toEqual(ag_suite_beverages.pk);
    });

    test('Delete all suites - active_suite gets set to null', async () => {
        expect(component.ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(2);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(1);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.ag_test_suites.length).toEqual(0);
        expect(component.active_ag_test_suite).toBe(null);
    });

    test('Suite changed', async () => {
        let updated_ag_suite_pets = create_suite(ag_suite_pets.pk, "Pets 2 Suite");

        expect(component.ag_test_suites[1]).toEqual(ag_suite_pets);
        expect(ag_suite_pets).not.toEqual(updated_ag_suite_pets);

        AGTestSuite.notify_ag_test_suite_changed(updated_ag_suite_pets);
        await component.$nextTick();

        expect(component.ag_test_suites[1].name).toEqual(updated_ag_suite_pets.name);
    });

    // Case Related ------------------------------------------------------------------------------

    test('Case created', async () => {
        expect(component.ag_test_suites[1]).toEqual(ag_suite_pets);
        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(2);

        let ag_case_cat = create_case(6, "Cat Case", ag_suite_pets.pk);

        AGTestCase.notify_ag_test_case_created(ag_case_cat);
        await component.$nextTick();

        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(3);
    });

    test('Case changed', async () => {
        let updated_ag_case_bird = create_case(ag_case_bird.pk, "Updated Bird Case", 2);

        expect(component.ag_test_suites[1]).toEqual(ag_suite_pets);
        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(2);
        expect(component.ag_test_suites[1].ag_test_cases[1]).toEqual(ag_case_bird);
        expect(component.ag_test_suites[1].ag_test_cases[1]).not.toEqual(updated_ag_case_bird);

        AGTestCase.notify_ag_test_case_changed(updated_ag_case_bird);
        await component.$nextTick();

        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(2);
        expect(component.ag_test_suites[1].ag_test_cases[1]).toEqual(updated_ag_case_bird);
    });

    test('First case deleted', async () => {
        expect(component.ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_purple);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(2);
    });

    test('active first case deleted', async () => {
        component.update_active_item(ag_case_purple);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_purple_1);
        expect(component.ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_purple);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(component.active_ag_test_command).toEqual(ag_command_blue_1);
    });

    test('Middle case deleted', async () => {
        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_blue);
        await component.$nextTick();

        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(2);
    });

    test('Active middle case deleted', async () => {
        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(3);

        component.update_active_item(ag_case_blue);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_blue_1);

        AGTestCase.notify_ag_test_case_deleted(ag_case_blue);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(component.active_ag_test_command).toEqual(ag_command_green_1);
    });

    test('last case deleted', async () => {
        expect(component.ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_green);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(2);
    });

    test('active last case deleted', async () => {
        component.update_active_item(ag_case_green);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_green_1);
        expect(component.ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_green);
        await component.$nextTick();

        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(2);
        expect(component.active_ag_test_command).toEqual(ag_command_blue_1);
    });

    test('Delete all cases in suite - suite becomes active', async () => {
        component.update_active_item(ag_case_dog);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_dog_1);
        expect(component.ag_test_suites[1]).toEqual(ag_suite_pets);
        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(2);

        AGTestCase.notify_ag_test_case_deleted(ag_case_dog);
        await component.$nextTick();

        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(1);
        expect(component.active_ag_test_suite).toBeNull();
        expect(component.active_ag_test_command).toEqual(ag_command_bird_1);

        AGTestCase.notify_ag_test_case_deleted(ag_case_bird);
        await component.$nextTick();

        expect(component.ag_test_suites[1].ag_test_cases.length).toEqual(0);
        expect(component.active_ag_test_suite).toEqual(ag_suite_pets);
    });

    // Command Related ---------------------------------------------------------------------------

    test('Command created', async () => {
        let ag_command_blue_2 = create_command(50, "Blue Command 2", ag_case_blue.pk);

        expect(component.ag_test_suites[0].ag_test_cases[1].ag_test_commands.length).toEqual(1);

        AGTestCommand.notify_ag_test_command_created(ag_command_blue_2);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[1].ag_test_commands.length).toEqual(2);
        expect(component.active_ag_test_command).toEqual(ag_command_blue_2);
    });

    test('Command changed', async () => {
        let updated_ag_command_purple_2 = create_command(
            ag_command_purple_2.pk,
            "Updated Purple Command 2",
            ag_command_purple_2.ag_test_case
        );

        expect(component.ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(component.ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            ag_command_purple_1
        );
        expect(ag_command_purple_2).not.toEqual(updated_ag_command_purple_2);

        AGTestCommand.notify_ag_test_command_changed(updated_ag_command_purple_2);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(component.ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            updated_ag_command_purple_2
        );
    });

    test('First command deleted in case', async () => {
        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_1);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
    });

    test('active First command deleted in case', async () => {
        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        component.update_active_item(ag_command_green_1);
        await component.$nextTick();

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_1);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
        expect(component.active_ag_test_command).toEqual(ag_command_green_2);
    });

    test('Middle command deleted in case',
         async () => {
        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_2);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
    });

    test('Active middle command deleted in case', async () => {
        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        component.update_active_item(ag_command_green_2);
        await component.$nextTick();

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_2);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
        expect(component.active_ag_test_command).toEqual(ag_command_green_3);
    });

    test('Last command deleted in case', async () => {
        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_3);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
    });

    test('Active last command deleted in case', async () => {
        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        component.update_active_item(ag_command_green_3);
        await component.$nextTick();

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_3);
        await component.$nextTick();

        expect(component.ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
        expect(component.active_ag_test_command).toEqual(ag_command_green_2);
    });

    // Visiting Previous Test Case ---------------------------------------------------------------

    test('prev_ag_test_case_is_available (false) - active_ag_test_suite is null', async () => {
        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#prev-ag-test-case-button').length).toEqual(0);
    });

    test('prev_ag_test_case_is_available (false) - active_ag_test_command is null', async () => {
        component.update_active_item(ag_suite_colors);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#prev-ag-test-case-button').length).toEqual(0);
    });

    test('prev_ag_test_case_is_available (false) - suite index is 0, case index is 0',
         async () => {
        component.update_active_item(ag_case_purple);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('prev_ag_test_case_is_available (false) - suite index != 0, case index is 0, ' +
         'prev suite doesnt have any cases',
         async () => {
        AGTestCase.notify_ag_test_case_deleted(ag_case_dog);
        await component.$nextTick();

        AGTestCase.notify_ag_test_case_deleted(ag_case_bird);
        await component.$nextTick();

        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test("prev_ag_test_case_is_available (false) - suite index != 0, case index is 0, " +
         "prev suite's last case doesnt have enough commands",
         async () => {
        let ag_case_cat = create_case(6, "Cat Case", ag_suite_pets.pk);

        AGTestCase.notify_ag_test_case_created(ag_case_cat);
        await component.$nextTick();

        component.update_active_item(ag_case_sprite);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test("prev_ag_test_case_is_available (true) - suite index != 0, case index is 0, " +
         "prev suite's last case has enough commands",
         async () => {
        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('prev_ag_test_case_is_available (false) - suite index is 0, case index != 0, ' +
         'prev case does not have enough commands',
         async () => {
        component.update_active_item(ag_command_green_3);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('prev_ag_test_case_is_available (true) - suite index is 0, case index != 0, prev ' +
         'case has enough commands',
         async () => {
        let ag_command_blue_2 = create_command(
            50,
            "Blue Command 2",
            ag_case_blue.pk
        );

        AGTestCommand.notify_ag_test_command_created(ag_command_blue_2);
        await component.$nextTick();

        component.update_active_item(ag_command_green_2);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('go_to_prev_command - prev case in same suite', async () => {
        component.update_active_item(ag_command_blue_1);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_blue_1);

        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#prev-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_purple_1);
    });

    test('go_to_prev_command - last case in previous suite', async () => {
        component.update_active_item(ag_command_dog_1);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_dog_1);

        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#prev-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_green_1);
    });

    // Visiting Next Test Case -------------------------------------------------------------------

    test('next_ag_test_case_is_available (false) - active_ag_test_suite is null', async () => {
        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#next-ag-test-case-button').length).toEqual(0);
    });

    test('next_ag_test_case_is_available (false) - active_ag_test_command is null', async () => {
        component.update_active_item(ag_suite_colors);
        await component.$nextTick();


        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#next-ag-test-case-button').length).toEqual(0);
    });

    test('next_ag_test_case_is_available (false) - suite index is 0, case index is 0, ' +
         'next case doesnt have enough commands',
         async () => {
        component.update_active_item(ag_command_purple_2);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (true) - suite index is 0, case index is 0, next ' +
         'case has enough commands',
         async () => {
        component.update_active_item(ag_command_purple_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('next_ag_test_case_is_available (false) - suite is the last suite, case is the ' +
         'last case in the suite',
         async () => {
        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (false) - suite is not the last suite, ' +
         'case is the last case in the suite, next suite doesnt have any cases',
         async () => {
        let new_suite = create_suite(4, "New Suite");

        AGTestSuite.notify_ag_test_suite_created(new_suite);
        await component.$nextTick();

        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (false) - suite is not the last suite, case is ' +
         'the last case in the suite, first case in next suite doesnt have enough commands',
         async () => {
        component.update_active_item(ag_command_green_2);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (true) - suite is not the last suite, case is' +
         'the last case in the suite, first case in the next suite has enough commands',
         async () => {
        component.update_active_item(ag_command_green_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('go_to_next_command - next case in same suite', async () => {
        component.update_active_item(ag_command_dog_1);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_dog_1);

        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#next-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_bird_1);
    });

    test('go_to_next_command - first case in next suite', async () => {
        component.update_active_item(ag_command_green_1);
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_green_1);

        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#next-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.active_ag_test_command).toEqual(ag_command_dog_1);
    });

    test('active_level_is_suite', async () => {
        expect(component.active_level_is_suite).toBe(false);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();
        expect(component.active_level_is_suite).toBe(true);

        component.update_active_item(ag_case_green);
        await component.$nextTick();
        expect(component.active_level_is_suite).toBe(false);

        component.update_active_item(ag_command_green_1);
        await component.$nextTick();
        expect(component.active_level_is_suite).toBe(false);
    });

    test('active_level_is_command', async () => {
        expect(component.active_level_is_command).toBe(false);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();
        expect(component.active_level_is_command).toBe(false);

        component.update_active_item(ag_case_green);
        await component.$nextTick();
        expect(component.active_level_is_command).toBe(true);

        component.update_active_item(ag_command_green_1);
        await component.$nextTick();
        expect(component.active_level_is_command).toBe(true);
    });

    test('parent_ag_test_case getter', async () => {
        expect(component.parent_ag_test_case).toBeNull();

        component.update_active_item(ag_case_green);
        await component.$nextTick();

        expect(component.parent_ag_test_case).toEqual(ag_case_green);

        component.update_active_item(ag_command_bird_1);
        await component.$nextTick();

        expect(component.parent_ag_test_case).toEqual(ag_case_bird);
    });

    test('parent_ag_test_suite getter', async () => {
        expect(component.parent_ag_test_suite).toBeNull();

        component.update_active_item(ag_suite_pets);
        await component.$nextTick();

        expect(component.parent_ag_test_suite).toBeNull();

        component.update_active_item(ag_case_blue);
        await component.$nextTick();

        expect(component.parent_ag_test_suite).toEqual(ag_suite_colors);

        component.update_active_item(ag_command_bird_1);
        await component.$nextTick();

        expect(component.parent_ag_test_suite).toEqual(ag_suite_pets);
    });
});
