import { mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCommand,
    AGTestSuite,
    ExpectedOutputSource,
    ExpectedReturnCode,
    HttpClient,
    HttpError,
    HttpResponse,
    InstructorFile,
    Project,
    StdinSource,
    ValueFeedbackLevel,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGTestCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import AGTestCommandAdvancedFdbkSettings from '@/components/project_admin/ag_suites/ag_test_command_advanced_fdbk_settings.vue';
import FeedbackConfigPanel from '@/components/project_admin/feedback_config_panel/feedback_config_panel.vue';
import ResourceLimitSettings from '@/components/project_admin/resource_limit_settings.vue';
import { assert_not_null } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    checkbox_is_checked, do_input_blank_or_not_integer_test, do_invalid_text_input_test,
    expect_html_element_has_value,
    expect_select_object_has_value,
    find_by_name,
    get_validated_input_text,
    set_data,
    set_props,
    set_select_object_value,
    set_validated_input_text,
    validated_input_is_valid,
    wait_until,
} from '@/tests/utils';


let ag_test_suite: AGTestSuite;
let ag_test_case: AGTestCase;
let ag_test_command: AGTestCommand;
let instructor_file_1: InstructorFile;
let instructor_file_2: InstructorFile;
let instructor_file_3: InstructorFile;
let project: Project;

function make_wrapper() {
    return managed_mount(AGTestCommandSettings, {
        propsData: {
            ag_test_case: ag_test_case,
            ag_test_command: ag_test_command,
            project: project
        }
    });
}

beforeEach(() => {
    let course = data_ut.make_course();
    project = data_ut.make_project(course.pk);

    instructor_file_1 = data_ut.make_instructor_file(project.pk, 'antarctica.cpp');
    instructor_file_2 = data_ut.make_instructor_file(project.pk, 'africa.cpp');
    instructor_file_3 = data_ut.make_instructor_file(project.pk, 'asia.cpp');

    project.instructor_files = [instructor_file_1, instructor_file_2, instructor_file_3];

    ag_test_suite = data_ut.make_ag_test_suite(project.pk);
    ag_test_case = data_ut.make_ag_test_case(ag_test_suite.pk);
    ag_test_command = data_ut.make_ag_test_command(ag_test_case.pk);

    ag_test_case = data_ut.make_ag_test_case(ag_test_suite.pk);
    ag_test_case.ag_test_commands = [ag_test_command];
});

describe('Test name editing tests', () => {
    let wrapper: Wrapper<AGTestCommandSettings>;

    beforeEach(() => {
       wrapper = make_wrapper();
    });

    test('Toggle edit mode', async () => {
        let original_name = ag_test_case.name;
        expect(wrapper.find('.test-name').text()).toEqual(original_name);
        expect(wrapper.findComponent({ref: 'ag_test_case_name_form'}).exists()).toBe(false);

        await wrapper.findComponent({ref: 'toggle_name_edit'}).trigger('click');

        expect(wrapper.find('.test-name').exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'ag_test_case_name_form'}).exists()).toBe(true);

        // Change the text, cancel, then make sure that the test name is the same
        await set_validated_input_text(
            wrapper.findComponent({ref: 'test_case_name'}), 'a new name');
        expect(validated_input_is_valid(wrapper.findComponent({ref: 'test_case_name'}))).toBe(true);
        await wrapper.find('.name-form-buttons .white-button').trigger('click');
        expect(wrapper.find('.test-name').text()).toEqual(original_name);

        // The new name input should have the current test name next time we
        // go into edit mode
        await wrapper.findComponent({ref: 'toggle_name_edit'}).trigger('click');
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'test_case_name'}))
        ).toEqual(original_name);
    });

    test('New name empty, form invalid', async () => {
        await wrapper.findComponent({ref: 'toggle_name_edit'}).trigger('click');
        await set_validated_input_text(wrapper.findComponent({ref: 'test_case_name'}), ' ');
        expect(
            validated_input_is_valid(wrapper.findComponent({ref: 'test_case_name'}))
        ).toBe(false);
        expect(wrapper.find('.name-form-buttons .green-button').element).toBeDisabled();
    });

    test('Save test name', async () => {
        // This component should NOT change the test case name.
        // That change will be handled by the ancestor that is subscribed to
        // test case changes.
        let original_name = ag_test_case.name;
        let new_name = 'This new name';
        await wrapper.findComponent({ref: 'toggle_name_edit'}).trigger('click');
        await set_validated_input_text(wrapper.findComponent({ref: 'test_case_name'}), new_name);
        expect(validated_input_is_valid(wrapper.findComponent({ref: 'test_case_name'}))).toBe(true);
        let save_button = wrapper.find('.name-form-buttons .green-button');
        expect(save_button.element).not.toBeDisabled();

        let http_stub = sinon.stub(HttpClient.get_instance(), 'patch').resolves(
            new HttpResponse({status: 200, data: ag_test_case, headers: {}})
        );
        await wrapper.findComponent({ref: 'ag_test_case_name_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

        expect(http_stub.calledOnce).toBe(true);
        expect(http_stub.firstCall.args[0]).toEqual(`/ag_test_cases/${ag_test_case.pk}/`);
        expect((<{name: string}> http_stub.firstCall.args[1]).name).toEqual(new_name);
        expect(wrapper.find('.test-name').text()).toEqual(original_name);
    });

    test('Handle API errors', async () => {
        sinon.stub(HttpClient.get_instance(), 'patch').rejects(
            new HttpError(400, 'U nub')
        );

        await wrapper.findComponent({ref: 'toggle_name_edit'}).trigger('click');
        await wrapper.findComponent({ref: 'ag_test_case_name_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'ag_test_case_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});

describe('AGTestCommandSettings tests', () => {
    let wrapper: Wrapper<AGTestCommandSettings>;

    beforeEach(() => {
        wrapper = make_wrapper();
    });

    test('command name binding', async () => {
        let two_cmd_test = data_ut.make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [
            ag_test_command, data_ut.make_ag_test_command(two_cmd_test.pk)
        ];
        await set_props(wrapper, {ag_test_case: two_cmd_test});

        let command_name_input = wrapper.findComponent({ref: 'command_name'});
        await set_validated_input_text(command_name_input, 'Name');

        expect(wrapper.vm.d_ag_test_command!.name).toEqual('Name');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {name: 'Fame'}});
        expect(get_validated_input_text(command_name_input)).toEqual('Fame');
    });

    test('error - command name is blank (case has more than one command)', async () => {
        let two_cmd_test = data_ut.make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [
            ag_test_command, data_ut.make_ag_test_command(two_cmd_test.pk)];
        await set_props(wrapper, {ag_test_case: two_cmd_test});

        return do_invalid_text_input_test(wrapper, {ref: "command_name"}, ' ', '.save-button');
    });

    test('cmd binding', async () => {
        let command_name_input = wrapper.findComponent({ref: 'cmd'});

        await set_validated_input_text(command_name_input, 'Tim Hortons');

        expect(wrapper.vm.d_ag_test_command!.cmd).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {cmd: 'Starbucks'}});
        expect(get_validated_input_text(command_name_input)).toEqual('Starbucks');
    });

    test('error - cmd is blank', async () => {
        return do_invalid_text_input_test(wrapper, {ref: "cmd"}, ' ', '.save-button');
    });

    test('stdin_source binding', async () => {
        let stdin_source_input = wrapper.find('#stdin-source');

        await stdin_source_input.setValue(StdinSource.none);
        expect(wrapper.vm.d_ag_test_command!.stdin_source).toEqual(
            StdinSource.none
        );

        await stdin_source_input.setValue(StdinSource.text);
        expect(wrapper.vm.d_ag_test_command!.stdin_source).toEqual(
            StdinSource.text
        );

        await stdin_source_input.setValue(StdinSource.instructor_file);
        expect(wrapper.vm.d_ag_test_command!.stdin_source).toEqual(
            StdinSource.instructor_file
        );

        await set_data(wrapper, {d_ag_test_command: {stdin_source: StdinSource.none}});
        expect_html_element_has_value(stdin_source_input,
                                      StdinSource.none);

        await set_data(wrapper, {d_ag_test_command: {stdin_source: StdinSource.text}});
        expect_html_element_has_value(stdin_source_input,
                                      StdinSource.text);

        await set_data(wrapper, {d_ag_test_command: {stdin_source: StdinSource.instructor_file}});
        expect_html_element_has_value(stdin_source_input,
                                      StdinSource.instructor_file);
    });

    test('stdin_text binding', async () => {
        await set_data(wrapper, {d_ag_test_command: {stdin_source: StdinSource.text}});

        let stdin_text_input = wrapper.findComponent({ref: 'stdin_text'});
        await set_validated_input_text(stdin_text_input, 'Hot');

        expect(wrapper.vm.d_ag_test_command!.stdin_text).toEqual('Hot');
        expect(validated_input_is_valid(stdin_text_input)).toEqual(true);

        await set_validated_input_text(stdin_text_input, '');

        expect(wrapper.vm.d_ag_test_command!.stdin_text).toEqual('');
        expect(validated_input_is_valid(stdin_text_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {stdin_text: 'Cold'}});
        expect(get_validated_input_text(stdin_text_input)).toEqual('Cold');
    });

    test('stdin_instructor_file binding', async () => {
        await set_data(wrapper, {d_ag_test_command: {stdin_source: StdinSource.instructor_file}});

        let stdin_instructor_file = wrapper.findComponent({ref: 'stdin_instructor_file'});
        await set_select_object_value(stdin_instructor_file, instructor_file_2.pk);

        expect(wrapper.vm.d_ag_test_command?.stdin_instructor_file).toEqual(instructor_file_2);

        assert_not_null(wrapper.vm.d_ag_test_command);
        // Do NOT use set_data here. We do NOT want a recursive member-wise assignment.
        wrapper.vm.d_ag_test_command.stdin_instructor_file = instructor_file_3;
        await wrapper.vm.$nextTick();

        expect_select_object_has_value(stdin_instructor_file, instructor_file_3.pk.toString());
    });

    test('expected_return_code binding', async () => {
        let expected_return_code_input = wrapper.find('#expected-return-code');

        await expected_return_code_input.setValue(ExpectedReturnCode.none);
        expect(wrapper.vm.d_ag_test_command!.expected_return_code).toEqual(
            ExpectedReturnCode.none
        );

        await expected_return_code_input.setValue(ExpectedReturnCode.zero);
        expect(wrapper.vm.d_ag_test_command!.expected_return_code).toEqual(
            ExpectedReturnCode.zero
        );

        await expected_return_code_input.setValue(ExpectedReturnCode.nonzero);
        expect(wrapper.vm.d_ag_test_command!.expected_return_code).toEqual(
            ExpectedReturnCode.nonzero
        );

        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.none}});
        expect_html_element_has_value(expected_return_code_input, ExpectedReturnCode.none);

        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.zero}});
        expect_html_element_has_value(expected_return_code_input, ExpectedReturnCode.zero);

        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.nonzero}});
        expect_html_element_has_value(expected_return_code_input, ExpectedReturnCode.nonzero);
    });

    test('points_for_correct_return_code binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.zero}});

        let points_for_correct_return_code_input = wrapper.findComponent(
            {ref: 'points_for_correct_return_code'}
        );

        await set_validated_input_text(points_for_correct_return_code_input, '2');

        expect(wrapper.vm.d_ag_test_command!.points_for_correct_return_code).toEqual(2);
        expect(validated_input_is_valid(points_for_correct_return_code_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {points_for_correct_return_code: 3}});
        expect(get_validated_input_text(points_for_correct_return_code_input)).toEqual('3');
    });

    test('error - points_for_correct_return_code is blank or not an integer', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.zero}});

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: "points_for_correct_return_code"}, '.save-button');
    });

    test('error - points_for_correct_return_code must be >= 0', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.zero}});

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_return_code'}, '-2', '.save-button');
    });

    test('deduction_for_wrong_return_code binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.zero}});

        let deduction_for_wrong_return_code_input = wrapper.findComponent({
            ref: 'deduction_for_wrong_return_code'
        });

        await set_validated_input_text(deduction_for_wrong_return_code_input, '-2');

        expect(wrapper.vm.d_ag_test_command!.deduction_for_wrong_return_code).toEqual(-2);
        expect(validated_input_is_valid(deduction_for_wrong_return_code_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {deduction_for_wrong_return_code: -3}});
        expect(get_validated_input_text(deduction_for_wrong_return_code_input)).toEqual('-3');
    });

    test('error - deduction_for_wrong_return_code is blank or not an integer', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.zero}});

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_return_code'}, '.save-button');
    });

    test('error - deduction_for_wrong_return_code must be <= 0', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_return_code: ExpectedReturnCode.zero}});

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_return_code'}, '1', '.save-button');
    });

    test('expected_stdout_source binding', async () => {
        let expected_stdout_source_input = wrapper.find('#expected-stdout-source');

        await expected_stdout_source_input.setValue(ExpectedOutputSource.none);
        expect(wrapper.vm.d_ag_test_command!.expected_stdout_source).toEqual(
            ExpectedOutputSource.none
        );

        await expected_stdout_source_input.setValue(ExpectedOutputSource.text);
        expect(wrapper.vm.d_ag_test_command!.expected_stdout_source).toEqual(
            ExpectedOutputSource.text
        );

        await expected_stdout_source_input.setValue(ExpectedOutputSource.instructor_file);
        expect(wrapper.vm.d_ag_test_command!.expected_stdout_source).toEqual(
            ExpectedOutputSource.instructor_file
        );

        await set_data(
            wrapper, {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.none}});
        expect_html_element_has_value(expected_stdout_source_input,
                                      ExpectedOutputSource.none);

        await set_data(
            wrapper, {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.text}});
        expect_html_element_has_value(expected_stdout_source_input,
                                      ExpectedOutputSource.text);

        await set_data(
            wrapper,
            {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.instructor_file}});
        expect_html_element_has_value(expected_stdout_source_input,
                                      ExpectedOutputSource.instructor_file);
    });

    test('expected_stdout_text binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.text}});

        let expected_stdout_text = wrapper.findComponent({ref: 'expected_stdout_text'});
        await set_validated_input_text(expected_stdout_text, 'Not');

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_text).toEqual('Not');
        expect(validated_input_is_valid(expected_stdout_text)).toEqual(true);

        await set_validated_input_text(expected_stdout_text, '');

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_text).toEqual('');
        expect(validated_input_is_valid(expected_stdout_text)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {expected_stdout_text: 'Cot'}});
        expect(get_validated_input_text(expected_stdout_text)).toEqual('Cot');
    });

    test('expected_stdout_instructor_file binding', async () => {
        await set_data(
            wrapper,
            {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.instructor_file}});

        let expected_stdout_instructor_file = wrapper.findComponent({
            ref: 'expected_stdout_instructor_file'
        });
        await set_select_object_value(expected_stdout_instructor_file, instructor_file_2.pk);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_instructor_file).toEqual(
            instructor_file_2);

        assert_not_null(wrapper.vm.d_ag_test_command);
        // Do NOT use set_data here. We do NOT want a recursive member-wise assignment.
        wrapper.vm.d_ag_test_command.expected_stdout_instructor_file = instructor_file_3;
        await wrapper.vm.$nextTick();

        expect_select_object_has_value(
            expected_stdout_instructor_file, instructor_file_3.pk.toString());
    });

    test('points_for_correct_stdout binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.text}});

        let points_for_correct_stdout_input
            = wrapper.findComponent({ref: 'points_for_correct_stdout'});
        await set_validated_input_text(points_for_correct_stdout_input, '21');

        expect(wrapper.vm.d_ag_test_command!.points_for_correct_stdout).toEqual(21);
        expect(validated_input_is_valid(points_for_correct_stdout_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {points_for_correct_stdout: 5}});
        expect(get_validated_input_text(points_for_correct_stdout_input)).toEqual('5');
    });


    test('error - points_for_correct_stdout is blank or not an integer', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stdout_source: ExpectedOutputSource.text,
                expected_stdout_text: "Hi there"
            }
        });

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'points_for_correct_stdout'}, '.save-button');
    });

    test('error - points_for_correct_stdout must be >= 0', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stdout_source: ExpectedOutputSource.text,
                expected_stdout_text: "Hi there"
            }
        });

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_stdout'}, '-1', '.save-button');
    });

    test('deduction_for_wrong_stdout binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.text}});

        let deduction_for_wrong_stdout_input
            = wrapper.findComponent({ref: 'deduction_for_wrong_stdout'});

        await set_validated_input_text(deduction_for_wrong_stdout_input, '-9');

        expect(wrapper.vm.d_ag_test_command!.deduction_for_wrong_stdout).toEqual(-9);
        expect(validated_input_is_valid(deduction_for_wrong_stdout_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {deduction_for_wrong_stdout: -4}});
        expect(get_validated_input_text(deduction_for_wrong_stdout_input)).toEqual('-4');
    });

    test('error - deduction_for_wrong_stdout is blank or not an integer', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stdout_source: ExpectedOutputSource.text,
                expected_stdout_text: "Hi there"
            }
        });

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_stdout'}, '.save-button');
    });

    test('error - deduction_for_wrong_stdout must be <= 0', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stdout_source: ExpectedOutputSource.text,
                expected_stdout_text: "Hi there"
            }
        });

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_stdout'}, '1', '.save-button');
    });

    test('expected_stderr_source binding', async () => {
        let expected_stderr_source_input = wrapper.find('#expected-stderr-source');

        await expected_stderr_source_input.setValue(ExpectedOutputSource.none);
        expect(wrapper.vm.d_ag_test_command!.expected_stderr_source).toEqual(
            ExpectedOutputSource.none
        );

        await expected_stderr_source_input.setValue(ExpectedOutputSource.text);
        expect(wrapper.vm.d_ag_test_command!.expected_stderr_source).toEqual(
            ExpectedOutputSource.text
        );

        await expected_stderr_source_input.setValue(ExpectedOutputSource.instructor_file);
        expect(wrapper.vm.d_ag_test_command!.expected_stderr_source).toEqual(
            ExpectedOutputSource.instructor_file
        );

        await set_data(
            wrapper, {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.none}});
        expect_html_element_has_value(expected_stderr_source_input, ExpectedOutputSource.none);

        await set_data(
            wrapper, {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.text}});
        expect_html_element_has_value(expected_stderr_source_input, ExpectedOutputSource.text);

        await set_data(
            wrapper,
            {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.instructor_file}});
        expect_html_element_has_value(
            expected_stderr_source_input, ExpectedOutputSource.instructor_file);
    });

    test('expected_stderr_text binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.text}});

        let expected_stderr_text = wrapper.findComponent({ref: 'expected_stderr_text'});
        await set_validated_input_text(expected_stderr_text, 'Rot');

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_text).toEqual('Rot');
        expect(validated_input_is_valid(expected_stderr_text)).toEqual(true);

        await set_validated_input_text(expected_stderr_text, '');

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_text).toEqual('');
        expect(validated_input_is_valid(expected_stderr_text)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {expected_stderr_text: 'Jot'}});
        expect(get_validated_input_text(expected_stderr_text)).toEqual('Jot');
    });

    test('expected_stderr_instructor_file binding', async () => {
        await set_data(
            wrapper,
            {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.instructor_file}});

        let expected_stderr_instructor_file = wrapper.findComponent(
            {ref: 'expected_stderr_instructor_file'});
        await set_select_object_value(expected_stderr_instructor_file, instructor_file_2.pk);

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_instructor_file).toEqual(
            instructor_file_2);

        assert_not_null(wrapper.vm.d_ag_test_command);
        // Do NOT use set_data here. We do NOT want a recursive member-wise assignment.
        wrapper.vm.d_ag_test_command.expected_stderr_instructor_file = instructor_file_3;
        await wrapper.vm.$nextTick();

        expect_select_object_has_value(
            expected_stderr_instructor_file, instructor_file_3.pk.toString());
    });

    test('points_for_correct_stderr binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.text}});

        let points_for_correct_stderr_input
            = wrapper.findComponent({ref: 'points_for_correct_stderr'});

        await set_validated_input_text(points_for_correct_stderr_input, '9');
        expect(wrapper.vm.d_ag_test_command!.points_for_correct_stderr).toEqual(9);
        expect(validated_input_is_valid(points_for_correct_stderr_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {points_for_correct_stderr: 4}});
        expect(get_validated_input_text(points_for_correct_stderr_input)).toEqual('4');
    });

    test('error - points_for_correct_stderr is blank or not an integer', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stderr_source: ExpectedOutputSource.text,
                expected_stderr_text: "Hi there"
            }
        });

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'points_for_correct_stderr'}, '.save-button');
    });

    test('error - points_for_correct_stderr must be >= 0', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stderr_source: ExpectedOutputSource.text,
                expected_stderr_text: "Hi there"
            }
        });

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_stderr'}, '-1', '.save-button');
    });

    test('deduction_for_wrong_stderr binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.text}});

        let deduction_for_wrong_stderr_input
            = wrapper.findComponent({ref: 'deduction_for_wrong_stderr'});

        await set_validated_input_text(deduction_for_wrong_stderr_input, '-9');

        expect(wrapper.vm.d_ag_test_command!.deduction_for_wrong_stderr).toEqual(-9);
        expect(validated_input_is_valid(deduction_for_wrong_stderr_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {deduction_for_wrong_stderr: -4}});
        expect(get_validated_input_text(deduction_for_wrong_stderr_input)).toEqual('-4');
    });

    test('error - deduction_for_wrong_stderr is blank or not an integer', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stderr_source: ExpectedOutputSource.text,
                expected_stderr_text: "Hi there"
            }
        });

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_stderr'}, '.save-button');
    });

    test('error - deduction_for_wrong_stderr must be <= 0', async () => {
        await set_data(wrapper, {
            d_ag_test_command: {
                expected_stderr_source: ExpectedOutputSource.text,
                expected_stderr_text: "Hi there",
            }
        });

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_stderr'}, '1', '.save-button');
    });

    test('Diff options appear when any expected output source is not "none"', async () => {
        await do_diff_options_exists_test(
            wrapper, ExpectedOutputSource.text, ExpectedOutputSource.none, true);
        await do_diff_options_exists_test(
            wrapper, ExpectedOutputSource.instructor_file, ExpectedOutputSource.none, true);

        await do_diff_options_exists_test(
            wrapper, ExpectedOutputSource.none, ExpectedOutputSource.text, true);
        await do_diff_options_exists_test(
            wrapper, ExpectedOutputSource.none, ExpectedOutputSource.instructor_file, true);

        await do_diff_options_exists_test(
            wrapper, ExpectedOutputSource.none, ExpectedOutputSource.none, false);
    });

    async function do_diff_options_exists_test(
        wrapper_: Wrapper<AGTestCommandSettings>,
        expected_stdout_source: ExpectedOutputSource,
        expected_stderr_source: ExpectedOutputSource,
        expected_exists: boolean
    ) {
        await set_data(wrapper_, {
            d_ag_test_command: {
                expected_stdout_source: expected_stdout_source,
                expected_stderr_source: expected_stderr_source
            }
        });
        expect(wrapper_.findComponent({ref: 'diff_options'}).exists()).toBe(expected_exists);
    }

    test('ignore_case binding', async () => {
        await set_data(
            wrapper,
            {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.instructor_file}});

        let ignore_case = wrapper.find('#ignore-case');

        await ignore_case.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_case).toBe(true);
        expect(checkbox_is_checked(ignore_case)).toEqual(true);

        await ignore_case.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_case).toBe(false);
        expect(checkbox_is_checked(ignore_case)).toEqual(false);

        await ignore_case.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_case).toBe(true);
        expect(checkbox_is_checked(ignore_case)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {ignore_case: false}});
        expect(checkbox_is_checked(ignore_case)).toBe(false);

        await set_data(wrapper, {d_ag_test_command: {ignore_case: true}});
        expect(checkbox_is_checked(ignore_case)).toBe(true);
    });

    test('ignore_whitespace binding', async () => {
        await set_data(
            wrapper,
            {d_ag_test_command: {expected_stderr_source: ExpectedOutputSource.text}});

        let ignore_whitespace = wrapper.find('#ignore-whitespace');

        await ignore_whitespace.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(true);

        await ignore_whitespace.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace).toBe(false);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(false);

        await ignore_whitespace.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {ignore_whitespace: false}});
        expect(checkbox_is_checked(ignore_whitespace)).toBe(false);

        await set_data(wrapper, {d_ag_test_command: {ignore_whitespace: true}});
        expect(checkbox_is_checked(ignore_whitespace)).toBe(true);
    });

    test('ignore_whitespace_changes binding', async () => {
        await set_data(
            wrapper, {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.text}});

        let ignore_whitespace_changes = wrapper.find('#ignore-whitespace-changes');

        await ignore_whitespace_changes.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace_changes).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(true);

        await ignore_whitespace_changes.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace_changes).toBe(false);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(false);

        await ignore_whitespace_changes.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace_changes).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {ignore_whitespace_changes: false}});
        expect(checkbox_is_checked(ignore_whitespace_changes)).toBe(false);

        await set_data(wrapper, {d_ag_test_command: {ignore_whitespace_changes: true}});
        expect(checkbox_is_checked(ignore_whitespace_changes)).toBe(true);
    });

    test('ignore_blank_lines binding', async () => {
        await set_data(
            wrapper,
            {d_ag_test_command: {expected_stdout_source: ExpectedOutputSource.instructor_file}});
        let ignore_blank_lines = wrapper.find('#ignore-blank-lines');

        await ignore_blank_lines.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_blank_lines).toBe(true);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(true);

        await ignore_blank_lines.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_blank_lines).toBe(false);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(false);

        await ignore_blank_lines.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_blank_lines).toBe(true);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(true);

        await set_data(wrapper, {d_ag_test_command: {ignore_blank_lines: false}});
        expect(checkbox_is_checked(ignore_blank_lines)).toBe(false);

        await set_data(wrapper, {d_ag_test_command: {ignore_blank_lines: true}});
        expect(checkbox_is_checked(ignore_blank_lines)).toBe(true);
    });

    test('Resource limit settings binding', async () => {
        let resource_limit_settings = find_by_name<ResourceLimitSettings>(
            wrapper, 'ResourceLimitSettings');
        expect(resource_limit_settings.vm.resource_limits).toEqual(ag_test_command);

        let new_time_limit = 67;
        resource_limit_settings.vm.$emit('field_change', {time_limit: new_time_limit});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.time_limit).toEqual(new_time_limit);
    });

    test('Save command settings - successful', async () => {
        let save_stub = sinon.stub(wrapper.vm.d_ag_test_command!, 'save');
        expect(wrapper.find('.save-button').element).not.toBeDisabled();
        expect(wrapper.find('.sticky-save-button').element).not.toBeDisabled();

        await wrapper.find('#ag-test-command-settings-form').trigger('submit');
        expect(save_stub.calledOnce).toBe(true);
    });

    test('Sticky save button icon', () => {
        expect(wrapper.find('.sticky-save-button .fa-save').exists()).toBe(true);
        expect(wrapper.find('.sticky-save-button .fa-exclamation-triangle').exists()).toBe(false);
    });

    test('Sticky save button disabled when form invalid', () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'cmd'}, '', '.sticky-save-button');
    });

    test('Sticky save button disabled while saving', async () => {
        await set_data(wrapper, {d_saving: true});
        expect(wrapper.find('.sticky-save-button').element).toBeDisabled();
    });

    test('Save command settings - unsuccessful', async () => {
        Element.prototype.scrollIntoView = () => {};
        let save_stub = sinon.stub(wrapper.vm.d_ag_test_command!, 'save');
        save_stub.returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test command with this Name and AG test case already exists."}
                )
            )
        );
        expect(wrapper.find('.save-button').element).not.toBeDisabled();

        await wrapper.find('#ag-test-command-settings-form').trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);

        expect(wrapper.find('.sticky-save-button .fa-exclamation-triangle').exists()).toBe(true);
        expect(wrapper.find('.sticky-save-button .fa-save').exists()).toBe(false);
    });

    test('Delete command', async () => {
        let two_cmd_test = data_ut.make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [
            ag_test_command, data_ut.make_ag_test_command(two_cmd_test.pk)];

        await wrapper.setProps({ag_test_case: two_cmd_test});
        let delete_command_stub = sinon.stub(wrapper.vm.d_ag_test_command!, 'delete');

        expect(wrapper.findComponent({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);

        await wrapper.find('.delete-ag-test-command-button').trigger('click');

        expect(wrapper.findComponent({ref: 'delete_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(true);

        await wrapper.find('.modal-delete-button').trigger('click');

        expect(delete_command_stub.calledOnce).toBe(true);
        expect(wrapper.findComponent({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);
    });

    test('API errors handled on test command deletion', async () => {
        let two_cmd_test = data_ut.make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [
            ag_test_command, data_ut.make_ag_test_command(two_cmd_test.pk)];

        await set_props(wrapper, {ag_test_case: two_cmd_test});

        sinon.stub(wrapper.vm.d_ag_test_command!, 'delete').rejects(new HttpError(403, 'err'));

        await wrapper.find('.delete-ag-test-command-button').trigger('click');
        await wrapper.find('.modal-delete-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_deleting)).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'delete_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(1);
    });

    test('Delete case with exactly one command', async () => {
        let delete_case_stub = sinon.stub(wrapper.vm.ag_test_case, 'delete');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);

        await wrapper.find('.delete-ag-test-command-button').trigger('click');

        expect(wrapper.findComponent({ref: 'delete_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(true);

        await wrapper.find('.modal-delete-button').trigger('click');

        expect(delete_case_stub.calledOnce).toBe(true);
        expect(wrapper.findComponent({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);
    });

    test('API errors handled on test case deletion', async () => {
        sinon.stub(wrapper.vm.ag_test_case, 'delete').rejects(new HttpError(403, 'err'));

        await wrapper.find('.delete-ag-test-command-button').trigger('click');

        await wrapper.find('.modal-delete-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_deleting)).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'delete_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(1);
    });

    test('Parent component changes the value supplied to the test_command prop', async () => {
        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(ag_test_command.pk);

        let other_cmd = data_ut.make_ag_test_command(ag_test_case.pk);
        await set_props(wrapper, {'ag_test_command': other_cmd});
        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(other_cmd.pk);

        await set_props(wrapper, {'ag_test_command': ag_test_command});
        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(ag_test_command.pk);
    });

    test('Parent component changes the value supplied to the test_case prop', async () => {
        expect(wrapper.vm.ag_test_case.pk).toEqual(ag_test_case.pk);

        let two_cmd_test = data_ut.make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [
            ag_test_command, data_ut.make_ag_test_command(two_cmd_test.pk)];

        await set_props(wrapper, {'ag_test_case': two_cmd_test});
        expect(wrapper.vm.ag_test_case.pk).toEqual(two_cmd_test.pk);

        await set_props(wrapper, {'ag_test_case': ag_test_case});
        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(ag_test_command.pk);
    });
});

describe('AG test command feedback tests', () => {
    test('Normal fdbk binding', () => {
        ag_test_command.normal_fdbk_config = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: true,
            show_whether_timed_out: false,
        });

        let wrapper = mount(AGTestCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
            }
        });

        let normal_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({ref: 'normal_config_panel'});
        expect(normal_config_panel.vm.value).toEqual(ag_test_command.normal_fdbk_config);

        let normal_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.findComponent(
                {ref: 'normal_edit_feedback_settings'});
        expect(normal_advanced_settings.vm.value).toEqual(ag_test_command.normal_fdbk_config);

        let new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        normal_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.normal_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        normal_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.normal_fdbk_config).toEqual(new_val);
    });

    test('First failure fdbk binding', () => {
        ag_test_command.first_failed_test_normal_fdbk_config
            = data_ut.make_ag_test_command_fdbk_config({
                show_actual_return_code: true,
                show_whether_timed_out: false
            }
        );

        let wrapper = mount(AGTestCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
            }
        });

        let first_failure_config_panel = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({
            ref: 'first_failure_config_panel'
        });
        expect(first_failure_config_panel.vm.value).toEqual(
            ag_test_command.first_failed_test_normal_fdbk_config);

        let first_failure_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.findComponent(
                {ref: 'first_failure_edit_feedback_settings'});
        expect(first_failure_advanced_settings.vm.value).toEqual(
            ag_test_command.first_failed_test_normal_fdbk_config);

        let new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        first_failure_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        first_failure_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toEqual(new_val);
    });

    test('Final graded fdbk binding', () => {
        ag_test_command.ultimate_submission_fdbk_config = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: true,
            show_whether_timed_out: false,
        });

        let wrapper = mount(AGTestCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
            }
        });

        let final_graded_config_panel = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({
            ref: 'final_graded_config_panel'
        });
        expect(final_graded_config_panel.vm.value).toEqual(
            ag_test_command.ultimate_submission_fdbk_config);

        let final_graded_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.findComponent(
                {ref: 'final_graded_edit_feedback_settings'});
        expect(final_graded_advanced_settings.vm.value).toEqual(
            ag_test_command.ultimate_submission_fdbk_config);

        let new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        final_graded_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.ultimate_submission_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        final_graded_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.ultimate_submission_fdbk_config).toEqual(new_val);
    });

    test('Past limit fdbk binding', () => {
        ag_test_command.past_limit_submission_fdbk_config
            = data_ut.make_ag_test_command_fdbk_config({
                show_actual_return_code: true,
                show_whether_timed_out: false,
            }
        );

        let wrapper = mount(AGTestCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
            }
        });

        let past_limit_config_panel = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({
            ref: 'past_limit_config_panel'
        });
        expect(past_limit_config_panel.vm.value).toEqual(
            ag_test_command.past_limit_submission_fdbk_config);

        let past_limit_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.findComponent(
                {ref: 'past_limit_edit_feedback_settings'});
        expect(past_limit_advanced_settings.vm.value).toEqual(
            ag_test_command.past_limit_submission_fdbk_config);

        let new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        past_limit_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.past_limit_submission_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        past_limit_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.past_limit_submission_fdbk_config).toEqual(new_val);
    });

    test('Student lookup fdbk binding', () => {
        ag_test_command.staff_viewer_fdbk_config = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: true,
            show_whether_timed_out: false,
        });

        let wrapper = mount(AGTestCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
            }
        });

        let student_lookup_config_panel = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({
            ref: 'student_lookup_config_panel'
        });
        expect(student_lookup_config_panel.vm.value).toEqual(
            ag_test_command.staff_viewer_fdbk_config);

        let student_lookup_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.findComponent(
                {ref: 'student_lookup_edit_feedback_settings'});
        expect(student_lookup_advanced_settings.vm.value).toEqual(
            ag_test_command.staff_viewer_fdbk_config);

        let new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        student_lookup_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.staff_viewer_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        student_lookup_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.staff_viewer_fdbk_config).toEqual(new_val);
    });

    test('Enable/disable first failure fdbk', async () => {
        ag_test_command.first_failed_test_normal_fdbk_config = null;
        let wrapper = mount(AGTestCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
            }
        });

        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toBeNull();
        let checkbox = wrapper.find('#first-failure-config-enabled');
        expect(checkbox_is_checked(checkbox)).toBe(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toEqual({
            visible: true,
            return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual,
            stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual,
            stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
            show_points: true,
            show_actual_return_code: true,
            show_actual_stdout: true,
            show_actual_stderr: true,
            show_whether_timed_out: true
        });

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toBeNull();
    });
});
