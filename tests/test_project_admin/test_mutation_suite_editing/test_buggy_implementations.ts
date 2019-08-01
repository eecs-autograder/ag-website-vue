import { Vue } from 'vue-property-decorator';

import { config, mount, RefSelector, Wrapper } from '@vue/test-utils';

import {
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    BugsExposedFeedbackLevel,
    ExpectedOutputSource,
    ExpectedReturnCode, HttpError,
    MutationTestSuite,
    MutationTestSuiteFeedbackConfig,
    StdinSource,
    ValueFeedbackLevel
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import BuggyImplementation from '@/components/project_admin/mutation_suite_editing/buggy_implementations.vue';

import {
    checkbox_is_checked,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

let default_ag_command_feedback_config: AGTestCommandFeedbackConfig = {
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

export function create_ag_command_feedback_config() {
    return JSON.parse(JSON.stringify(default_ag_command_feedback_config));
}

export function create_ag_command(pk: number, command_name: string,
                                  ag_test_case: number): AGTestCommand {
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
        normal_fdbk_config: create_ag_command_feedback_config(),
        first_failed_test_normal_fdbk_config: create_ag_command_feedback_config(),
        ultimate_submission_fdbk_config: create_ag_command_feedback_config(),
        past_limit_submission_fdbk_config: create_ag_command_feedback_config(),
        staff_viewer_fdbk_config: create_ag_command_feedback_config(),
        time_limit: 1,
        stack_size_limit: 1,
        virtual_memory_limit: 1,
        process_spawn_limit: 1
    });
    return new_command;
}

let default_mutation_suite_feedback_config: MutationTestSuiteFeedbackConfig = {
    visible: false,
    show_setup_return_code: false,
    show_setup_stdout: false,
    show_setup_stderr: false,
    show_invalid_test_names: false,
    show_points: false,
    bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.exposed_bug_names,
    show_get_test_names_return_code: false,
    show_get_test_names_stdout: false,
    show_get_test_names_stderr: false,
    show_validity_check_stdout: false,
    show_validity_check_stderr: false,
    show_grade_buggy_impls_stdout: false,
    show_grade_buggy_impls_stderr: false
};

export function create_mutation_suite_feedback_config() {
    return JSON.parse(JSON.stringify(default_mutation_suite_feedback_config));
}

export function create_mutation_suite(pk: number, suite_name: string,
                                      project: number): MutationTestSuite {
    let new_suite = new MutationTestSuite({
        pk: pk,
        name: suite_name,
        project: project,
        last_modified: "Today",
        read_only_instructor_files: true,
        buggy_impl_names: ["Bug_2", "Bug_12", "Bug_1", "Bug_4"],
        use_setup_command: false,
        setup_command: create_ag_command(1, 'Command 1', 1),
        get_student_test_names_command: create_ag_command(2, "Command 2", 2),
        max_num_student_tests: 3,
        student_test_validity_check_command: create_ag_command(3, "Command 3", 3),
        grade_buggy_impl_command: create_ag_command(4, "Command 4", 4),
        points_per_exposed_bug: "1",
        max_points: 0,
        deferred: false,
        sandbox_docker_image: {
            pk: 1,
            name: "Sandy",
            tag: "",
            display_name: "Hi everyone"
        },
        allow_network_access: false,
        normal_fdbk_config: create_mutation_suite_feedback_config(),
        ultimate_submission_fdbk_config: create_mutation_suite_feedback_config(),
        past_limit_submission_fdbk_config: create_mutation_suite_feedback_config(),
        staff_viewer_fdbk_config: create_mutation_suite_feedback_config(),
        instructor_files_needed: [],
        student_files_needed: [],
    });
    return new_suite;
}

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('BuggyImplementation tests', () => {
    let wrapper: Wrapper<BuggyImplementation>;
    let component: BuggyImplementation;
    let mutation_test_suite: MutationTestSuite;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        mutation_test_suite = create_mutation_suite(1, "Mutation Suite 1", 1);

        wrapper = mount(BuggyImplementation, {
            propsData: {
                mutation_test_suite: mutation_test_suite
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

    test('points_per_exposed_bug binding', async () => {
        let points_per_exposed_bug_input = wrapper.find({ref: 'points_per_exposed_bug'});

        set_validated_input_text(points_per_exposed_bug_input, '905.5');

        expect(component.d_mutation_test_suite!.points_per_exposed_bug).toEqual(905.5);
        expect(validated_input_is_valid(points_per_exposed_bug_input)).toEqual(true);

        component.d_mutation_test_suite!.points_per_exposed_bug = 10.51;
        expect(get_validated_input_text(points_per_exposed_bug_input)).toEqual('10.51');
    });

    test('Error: points_per_exposed_bug is blank or not a number', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'points_per_exposed_bug'}, '#save-button');
    });

    test('Error: points_per_exposed_bug must be >= 0', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'points_per_exposed_bug'}, '-1', '#save-button');
    });

    test('Error: points_per_exposed_bug must have less than or equal to four digits in ' +
         'total - no decimal present',
         async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'points_per_exposed_bug'}, '12345', '#save-button');
    });

    test('Error: points_per_exposed_bug must have less than or equal to four digits in ' +
         'total - decimal present',
         async () => {
         return do_invalid_text_input_test(
             wrapper, {ref: 'points_per_exposed_bug'}, '123.45', '#save-button');
    });

    test('Error: points_per_exposed_bug must have less than or equal to two decimal places',
         async () => {
         return do_invalid_text_input_test(
             wrapper, {ref: 'points_per_exposed_bug'}, '12.345', '#save-button');
    });

    test('use_custom_max_points binding', async () => {
        let checkbox = wrapper.find('#use-max-points');

        checkbox.setChecked(false);
        expect(component.use_custom_max_points).toEqual(false);
        expect(wrapper.findAll('#max-points').length).toEqual(0);
        expect(component.d_mutation_test_suite!.max_points).toBeNull();

        checkbox.setChecked(true);
        expect(component.use_custom_max_points).toEqual(true);
        expect(wrapper.findAll('#max-points').length).toEqual(1);
        expect(component.d_mutation_test_suite!.max_points).toEqual(0);

        checkbox.setChecked(false);
        expect(component.use_custom_max_points).toEqual(false);
        expect(wrapper.findAll('#max-points').length).toEqual(0);
        expect(component.d_mutation_test_suite!.max_points).toBeNull();

        component.use_custom_max_points = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
        expect(wrapper.findAll('#max-points').length).toEqual(1);

        component.use_custom_max_points = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);
        expect(wrapper.findAll('#max-points').length).toEqual(0);
    });

    test('max_points binding', async () => {
        wrapper.find('#use-max-points').setChecked(true);
        await component.$nextTick();

        let max_points_input = wrapper.find({ref: 'max_points'});

        set_validated_input_text(max_points_input, '3');

        expect(component.d_mutation_test_suite!.max_points).toEqual(3);
        expect(validated_input_is_valid(max_points_input)).toEqual(true);

        component.d_mutation_test_suite!.max_points = 7;
        expect(get_validated_input_text(max_points_input)).toEqual('7');
    });

    test('Error: max_points is blank or not a number', async () => {
        wrapper.find('#use-max-points').setChecked(true);
        await component.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'max_points'}, '#save-button');
    });

    test('Error: max_points must be greater than or equal to zero', async () => {
        wrapper.find('#use-max-points').setChecked(true);
        await component.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'max_points'}, '-1', '#save-button');
    });

    test('max_num_student_tests binding', async () => {
        wrapper.find('#use-max-points').setChecked(true);
        await component.$nextTick();

        let max_num_student_tests_input = wrapper.find({ref: 'max_num_student_tests'});

        set_validated_input_text(max_num_student_tests_input, '3');

        expect(component.d_mutation_test_suite!.max_num_student_tests).toEqual(3);
        expect(validated_input_is_valid(max_num_student_tests_input)).toEqual(true);

        component.d_mutation_test_suite!.max_num_student_tests = 7;
        expect(get_validated_input_text(max_num_student_tests_input)).toEqual('7');
    });

    test('Error: max_num_student_tests must be greater than or equal to zero', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'max_num_student_tests'}, '-1', '#save-button');
    });

    test('buggy_impl_names binding', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        set_validated_input_text(buggy_implementation_names_input, 'cricket, mosquito, bee');
        expect(component.buggy_impl_names).toEqual('cricket, mosquito, bee');

        component.buggy_impl_names = "ladybug ant";
        expect(get_validated_input_text(buggy_implementation_names_input)).toEqual('ladybug ant');
    });

    test('adding buggy_impl_names', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
        expect(component.buggy_impl_names).toEqual("");

        set_validated_input_text(buggy_implementation_names_input, 'Bug_41 Bug_23 Bug_3');
        expect(component.buggy_impl_names).toEqual('Bug_41 Bug_23 Bug_3');

        wrapper.find('.add-buggy-impl-names-button').trigger('click');
        await component.$nextTick();

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(7);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_3");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_12");
        expect(component.d_mutation_test_suite!.buggy_impl_names[5]).toEqual("Bug_23");
        expect(component.d_mutation_test_suite!.buggy_impl_names[6]).toEqual("Bug_41");
        expect(component.buggy_impl_names).toEqual("");
    });


    test('adding buggy_impl_names - no duplicates allowed', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, 'Bug_12 Bug_13 Bug_4');
        expect(component.buggy_impl_names).toEqual('Bug_12 Bug_13 Bug_4');

        wrapper.find('.add-buggy-impl-names-button').trigger('click');
        await component.$nextTick();

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(5);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
        expect(component.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_13");
    });

    test('adding buggy_impl_names - empty strings cannot be added', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, '     ');
        expect(component.buggy_impl_names).toEqual('     ');

        wrapper.find('.add-buggy-impl-names-button').trigger('click');
        await component.$nextTick();

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, ' , , , , ');
        expect(component.buggy_impl_names).toEqual(' , , , , ');

        wrapper.find('.add-buggy-impl-names-button').trigger('click');
        await component.$nextTick();

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, ' ,    ,   Bug_3       ,   , ');
        expect(component.buggy_impl_names).toEqual(' ,    ,   Bug_3       ,   , ');

        wrapper.find('.add-buggy-impl-names-button').trigger('click');
        await component.$nextTick();

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(5);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_3");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_12");
    });

    test('buggy_impl_names get sorted', async () => {
        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
    });

    test('removing a buggy_impl_name', async () => {
        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(component.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        wrapper.findAll('.remove-buggy-impl-name-container').at(3).trigger('click');

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(3);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(component.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");

        wrapper.findAll('.remove-buggy-impl-name-container').at(1).trigger('click');

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(2);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(component.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_4");

        wrapper.findAll('.remove-buggy-impl-name-container').at(0).trigger('click');

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(1);
        expect(component.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_4");

        wrapper.findAll('.remove-buggy-impl-name-container').at(0).trigger('click');

        expect(component.d_mutation_test_suite!.buggy_impl_names.length).toEqual(0);
    });

    test('saving d_mutation_test_suite without using custom_max_points - successful',
         async () => {
        wrapper.find('#use-max-points').setChecked(false);
        await component.$nextTick();

        let save_stub = sinon.stub(component.d_mutation_test_suite!, 'save');
        expect(wrapper.find('#save-button').is('[disabled]')).toBe(false);

        wrapper.find('#buggy-implementation-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
        expect(save_stub.firstCall.calledOn(component.d_mutation_test_suite)).toBe(true);
        expect(component.d_mutation_test_suite!.max_points).toBeNull();
    });

    test('saving d_mutation_test_suite using custom_max_points - successful',
         async () => {
        wrapper.find('#use-max-points').setChecked(true);
        await component.$nextTick();

        let max_points_input = wrapper.find({ref: 'max_points'});
        set_validated_input_text(max_points_input, '5');

        let save_stub = sinon.stub(component.d_mutation_test_suite!, 'save');
        expect(wrapper.find('#save-button').is('[disabled]')).toBe(false);

        wrapper.find('#buggy-implementation-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
        expect(save_stub.firstCall.calledOn(component.d_mutation_test_suite)).toBe(true);
        expect(component.d_mutation_test_suite!.max_points).toEqual(5);
    });

    test('saving d_mutation_test_suite - unsuccessful', async () => {
        let save_stub = sinon.stub(component.d_mutation_test_suite!, 'save').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Encountered an error."}
                )
            )
        );
        expect(wrapper.find('#save-button').is('[disabled]')).toBe(false);

        wrapper.find('#buggy-implementation-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('mutation_test_suite - Watcher', async () => {
        let another_mutation_suite = create_mutation_suite(2, "Suite 2", 1);

        expect(component.d_mutation_test_suite.pk).toEqual(mutation_test_suite.pk);

        wrapper.setProps({mutation_test_suite: another_mutation_suite});
        await component.$nextTick();

        expect(component.d_mutation_test_suite.pk).toEqual(another_mutation_suite.pk);
    });
});

async function do_invalid_text_input_test(component_wrapper: Wrapper<Vue>,
                                          input_selector: string | RefSelector,
                                          invalid_text: string,
                                          save_button_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    expect(validated_input_is_valid(input_wrapper)).toEqual(true);
    // tslint:disable-next-line
    expect(component_wrapper.find(<any> save_button_selector).is('[disabled]')).toBe(false);

    set_validated_input_text(input_wrapper, invalid_text);
    await component_wrapper.vm.$nextTick();

    expect(validated_input_is_valid(input_wrapper)).toEqual(false);
    // tslint:disable-next-line
    let save_button_wrapper = component_wrapper.find(<any> save_button_selector);
    expect(save_button_wrapper.is('[disabled]')).toBe(true);
}

async function do_input_blank_or_not_integer_test(component_wrapper: Wrapper<Vue>,
                                                  input_selector: string | RefSelector,
                                                  save_button_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    let original_text = get_validated_input_text(input_wrapper);

    await do_invalid_text_input_test(component_wrapper, input_selector, ' ', save_button_selector);
    set_validated_input_text(input_wrapper, original_text);
    return do_invalid_text_input_test(
        component_wrapper, input_selector, 'not num', save_button_selector);
}
