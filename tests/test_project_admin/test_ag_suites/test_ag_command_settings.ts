import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCommand,
    AGTestSuite,
    ExpectedOutputSource,
    ExpectedReturnCode,
    HttpError,
    InstructorFile,
    Project,
    StdinSource,
    ValueFeedbackLevel,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGTestCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import AGTestCommandAdvancedFdbkSettings from '@/components/project_admin/ag_suites/ag_test_command_advanced_fdbk_settings.vue';
import FeedbackConfigPanel from '@/components/project_admin/feedback_config_panel.vue';

import {
    make_ag_test_case,
    make_ag_test_command,
    make_ag_test_command_fdbk_config,
    make_ag_test_suite,
    make_course,
    make_project,
} from '@/tests/data_utils';
import {
    checkbox_is_checked, do_input_blank_or_not_integer_test, do_invalid_text_input_test,
    expect_html_element_has_value,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

let ag_test_suite: AGTestSuite;
let ag_test_case: AGTestCase;
let ag_test_command: AGTestCommand;
let instructor_file_1: InstructorFile;
let instructor_file_2: InstructorFile;
let instructor_file_3: InstructorFile;
let project: Project;

beforeEach(() => {
    let course = make_course();
    project = make_project(course.pk);

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

    project.instructor_files = [instructor_file_1, instructor_file_2, instructor_file_3];

    ag_test_suite = make_ag_test_suite(project.pk);
    ag_test_case = make_ag_test_case(ag_test_suite.pk);
    ag_test_command = make_ag_test_command(ag_test_case.pk);

    ag_test_case = make_ag_test_case(ag_test_suite.pk);
    ag_test_case.ag_test_commands = [ag_test_command];
});

describe('AGTestCommandSettings tests', () => {
    let wrapper: Wrapper<AGTestCommandSettings>;

    beforeEach(() => {
        wrapper = mount(AGTestCommandSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command,
                project: project
            }
        });
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('command name binding', async () => {
        let two_cmd_test = make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [ag_test_command, make_ag_test_command(two_cmd_test.pk)];

        wrapper.setProps({ag_test_case: two_cmd_test});
        await wrapper.vm.$nextTick();

        let command_name_input = wrapper.find({ref: 'command_name'});
        set_validated_input_text(command_name_input, 'Name');

        expect(wrapper.vm.d_ag_test_command!.name).toEqual('Name');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.name = 'Fame';
        expect(get_validated_input_text(command_name_input)).toEqual('Fame');
    });

    test('error - command name is blank (case has more than one command)', async () => {
        let two_cmd_test = make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [ag_test_command, make_ag_test_command(two_cmd_test.pk)];

        wrapper.setProps({ag_test_case: two_cmd_test});
        await wrapper.vm.$nextTick();

        return do_invalid_text_input_test(wrapper, {ref: "command_name"}, ' ', '.save-button');
    });

    test('cmd binding', async () => {
        let command_name_input = wrapper.find({ref: 'cmd'});

        set_validated_input_text(command_name_input, 'Tim Hortons');

        expect(wrapper.vm.d_ag_test_command!.cmd).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.cmd = 'Starbucks';
        expect(get_validated_input_text(command_name_input)).toEqual('Starbucks');
    });

    test('error - cmd is blank', async () => {
        return do_invalid_text_input_test(wrapper, {ref: "cmd"}, ' ', '.save-button');
    });

    test('stdin_source binding', async () => {
        let stdin_source_input = wrapper.find('#stdin-source');

        stdin_source_input.setValue(StdinSource.none);
        expect(wrapper.vm.d_ag_test_command!.stdin_source).toEqual(
            StdinSource.none
        );

        stdin_source_input.setValue(StdinSource.text);
        expect(wrapper.vm.d_ag_test_command!.stdin_source).toEqual(
            StdinSource.text
        );

        stdin_source_input.setValue(StdinSource.instructor_file);
        expect(wrapper.vm.d_ag_test_command!.stdin_source).toEqual(
            StdinSource.instructor_file
        );

        wrapper.vm.d_ag_test_command!.stdin_source = StdinSource.none;
        expect_html_element_has_value(stdin_source_input,
                                      StdinSource.none);

        wrapper.vm.d_ag_test_command!.stdin_source = StdinSource.text;
        expect_html_element_has_value(stdin_source_input,
                                      StdinSource.text);

        wrapper.vm.d_ag_test_command!.stdin_source = StdinSource.instructor_file;
        expect_html_element_has_value(stdin_source_input,
                                      StdinSource.instructor_file);
    });

    test('stdin_text binding', async () => {
        wrapper.vm.d_ag_test_command!.stdin_source = StdinSource.text;

        let stdin_text_input = wrapper.find({ref: 'stdin_text'});
        set_validated_input_text(stdin_text_input, 'Hot');

        expect(wrapper.vm.d_ag_test_command!.stdin_text).toEqual('Hot');
        expect(validated_input_is_valid(stdin_text_input)).toEqual(true);

        set_validated_input_text(stdin_text_input, '');

        expect(wrapper.vm.d_ag_test_command!.stdin_text).toEqual('');
        expect(validated_input_is_valid(stdin_text_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.stdin_text = 'Cold';
        expect(get_validated_input_text(stdin_text_input)).toEqual('Cold');
    });

    test('stdin_instructor_file binding', async () => {
        wrapper.vm.d_ag_test_command!.stdin_source = StdinSource.instructor_file;
        await wrapper.vm.$nextTick();

        let stdin_instructor_file_input = wrapper.find('#stdin-instructor-file');
        stdin_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_2.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.stdin_instructor_file).toEqual(instructor_file_2);
        expect(stdin_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_2.name);

        stdin_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_3.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.stdin_instructor_file).toEqual(instructor_file_3);
        expect(stdin_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_3.name);

        stdin_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_1.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.stdin_instructor_file).toEqual(instructor_file_1);
        expect(stdin_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_1.name);
    });

    test('expected_return_code binding', async () => {
        let expected_return_code_input = wrapper.find('#expected-return-code');

        expected_return_code_input.setValue(ExpectedReturnCode.none);
        expect(wrapper.vm.d_ag_test_command!.expected_return_code).toEqual(
            ExpectedReturnCode.none
        );

        expected_return_code_input.setValue(ExpectedReturnCode.zero);
        expect(wrapper.vm.d_ag_test_command!.expected_return_code).toEqual(
            ExpectedReturnCode.zero
        );

        expected_return_code_input.setValue(ExpectedReturnCode.nonzero);
        expect(wrapper.vm.d_ag_test_command!.expected_return_code).toEqual(
            ExpectedReturnCode.nonzero
        );

        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.none;
        expect_html_element_has_value(expected_return_code_input,
                                      ExpectedReturnCode.none);

        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        expect_html_element_has_value(expected_return_code_input,
                                      ExpectedReturnCode.zero);

        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.nonzero;
        expect_html_element_has_value(expected_return_code_input,
                                      ExpectedReturnCode.nonzero);
    });

    test('points_for_correct_return_code binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;

        let points_for_correct_return_code_input = wrapper.find(
            {ref: 'points_for_correct_return_code'}
        );

        set_validated_input_text(points_for_correct_return_code_input, '2');

        expect(wrapper.vm.d_ag_test_command!.points_for_correct_return_code).toEqual(2);
        expect(validated_input_is_valid(points_for_correct_return_code_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.points_for_correct_return_code = 3;
        expect(get_validated_input_text(points_for_correct_return_code_input)).toEqual('3');
    });

    test('error - points_for_correct_return_code is blank or not an integer', async () => {
        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await wrapper.vm.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: "points_for_correct_return_code"}, '.save-button');
    });

    test('error - points_for_correct_return_code must be >= 0', async () => {
        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await wrapper.vm.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_return_code'}, '-2', '.save-button');
    });

    test('deduction_for_wrong_return_code binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;

        let deduction_for_wrong_return_code_input = wrapper.find(
            {ref: 'deduction_for_wrong_return_code'}
        );

        set_validated_input_text(deduction_for_wrong_return_code_input, '-2');

        expect(wrapper.vm.d_ag_test_command!.deduction_for_wrong_return_code).toEqual(-2);
        expect(validated_input_is_valid(deduction_for_wrong_return_code_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.deduction_for_wrong_return_code = -3;
        expect(get_validated_input_text(deduction_for_wrong_return_code_input)).toEqual('-3');
    });

    test('error - deduction_for_wrong_return_code is blank or not an integer', async () => {
        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await wrapper.vm.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_return_code'}, '.save-button');
    });

    test('error - deduction_for_wrong_return_code must be <= 0', async () => {
        wrapper.vm.d_ag_test_command!.expected_return_code = ExpectedReturnCode.zero;
        await wrapper.vm.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_return_code'}, '1', '.save-button');
    });

    test('expected_stdout_source binding', async () => {
        let expected_stdout_source_input = wrapper.find('#expected-stdout-source');

        expected_stdout_source_input.setValue(ExpectedOutputSource.none);
        expect(wrapper.vm.d_ag_test_command!.expected_stdout_source).toEqual(
            ExpectedOutputSource.none
        );

        expected_stdout_source_input.setValue(ExpectedOutputSource.text);
        expect(wrapper.vm.d_ag_test_command!.expected_stdout_source).toEqual(
            ExpectedOutputSource.text
        );

        expected_stdout_source_input.setValue(ExpectedOutputSource.instructor_file);
        expect(wrapper.vm.d_ag_test_command!.expected_stdout_source).toEqual(
            ExpectedOutputSource.instructor_file
        );

        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.none;
        expect_html_element_has_value(expected_stdout_source_input,
                                      ExpectedOutputSource.none);

        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        expect_html_element_has_value(expected_stdout_source_input,
                                      ExpectedOutputSource.text);

        wrapper.vm.d_ag_test_command!.expected_stdout_source
            = ExpectedOutputSource.instructor_file;
        expect_html_element_has_value(expected_stdout_source_input,
                                      ExpectedOutputSource.instructor_file);
    });

    test('expected_stdout_text binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;

        let expected_stdout_text = wrapper.find({ref: 'expected_stdout_text'});
        set_validated_input_text(expected_stdout_text, 'Not');

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_text).toEqual('Not');
        expect(validated_input_is_valid(expected_stdout_text)).toEqual(true);

        set_validated_input_text(expected_stdout_text, '');

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_text).toEqual('');
        expect(validated_input_is_valid(expected_stdout_text)).toEqual(true);

        wrapper.vm.d_ag_test_command!.expected_stdout_text = 'Cot';
        expect(get_validated_input_text(expected_stdout_text)).toEqual('Cot');
    });

    test('expected_stdout_instructor_file binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source
            = ExpectedOutputSource.instructor_file;
        await wrapper.vm.$nextTick();

        let expected_stdout_instructor_file_input = wrapper.find(
            '#expected-stdout-instructor-file'
        );
        expected_stdout_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_2.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_instructor_file).toEqual(
            instructor_file_2
        );
        expect(expected_stdout_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_2.name);

        expected_stdout_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_3.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_instructor_file).toEqual(
            instructor_file_3
        );
        expect(expected_stdout_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_3.name);

        expected_stdout_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_1.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.expected_stdout_instructor_file).toEqual(
            instructor_file_1
        );
        expect(expected_stdout_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_1.name);
    });

    test('points_for_correct_stdout binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;

        let points_for_correct_stdout_input = wrapper.find({ref: 'points_for_correct_stdout'});

        set_validated_input_text(points_for_correct_stdout_input, '21');

        expect(wrapper.vm.d_ag_test_command!.points_for_correct_stdout).toEqual(21);
        expect(validated_input_is_valid(points_for_correct_stdout_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.points_for_correct_stdout = 5;
        expect(get_validated_input_text(points_for_correct_stdout_input)).toEqual('5');
    });


    test('error - points_for_correct_stdout is blank or not an integer', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stdout_text = "Hi there";

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'points_for_correct_stdout'}, '.save-button');
    });

    test('error - points_for_correct_stdout must be >= 0', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stdout_text = "Hi there";

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_stdout'}, '-1', '.save-button');
    });

    test('deduction_for_wrong_stdout binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;

        let deduction_for_wrong_stdout_input = wrapper.find({ref: 'deduction_for_wrong_stdout'});

        set_validated_input_text(deduction_for_wrong_stdout_input, '-9');

        expect(wrapper.vm.d_ag_test_command!.deduction_for_wrong_stdout).toEqual(-9);
        expect(validated_input_is_valid(deduction_for_wrong_stdout_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.deduction_for_wrong_stdout = -4;
        expect(get_validated_input_text(deduction_for_wrong_stdout_input)).toEqual('-4');
    });

    test('error - deduction_for_wrong_stdout is blank or not an integer', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stdout_text = "Hi there";

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_stdout'}, '.save-button');
    });

    test('error - deduction_for_wrong_stdout must be <= 0', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stdout_text = "Hi there";

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_stdout'}, '1', '.save-button');
    });

    test('expected_stderr_source binding', async () => {
        let expected_stderr_source_input = wrapper.find('#expected-stderr-source');

        expected_stderr_source_input.setValue(ExpectedOutputSource.none);
        expect(wrapper.vm.d_ag_test_command!.expected_stderr_source).toEqual(
            ExpectedOutputSource.none
        );

        expected_stderr_source_input.setValue(ExpectedOutputSource.text);
        expect(wrapper.vm.d_ag_test_command!.expected_stderr_source).toEqual(
            ExpectedOutputSource.text
        );

        expected_stderr_source_input.setValue(ExpectedOutputSource.instructor_file);
        expect(wrapper.vm.d_ag_test_command!.expected_stderr_source).toEqual(
            ExpectedOutputSource.instructor_file
        );

        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.none;
        expect_html_element_has_value(expected_stderr_source_input,
                                      ExpectedOutputSource.none);

        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        expect_html_element_has_value(expected_stderr_source_input,
                                      ExpectedOutputSource.text);

        wrapper.vm.d_ag_test_command!.expected_stderr_source
            = ExpectedOutputSource.instructor_file;
        expect_html_element_has_value(expected_stderr_source_input,
                                      ExpectedOutputSource.instructor_file);
    });

    test('expected_stderr_text binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        let expected_stderr_text = wrapper.find({ref: 'expected_stderr_text'});
        set_validated_input_text(expected_stderr_text, 'Rot');

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_text).toEqual('Rot');
        expect(validated_input_is_valid(expected_stderr_text)).toEqual(true);

        set_validated_input_text(expected_stderr_text, '');

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_text).toEqual('');
        expect(validated_input_is_valid(expected_stderr_text)).toEqual(true);

        wrapper.vm.d_ag_test_command!.expected_stderr_text = 'Jot';
        expect(get_validated_input_text(expected_stderr_text)).toEqual('Jot');
    });

    test('expected_stderr_instructor_file binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source
            = ExpectedOutputSource.instructor_file;
        await wrapper.vm.$nextTick();

        let expected_stderr_instructor_file_input = wrapper.find(
            '#expected-stderr-instructor-file'
        );
        expected_stderr_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_2.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_instructor_file).toEqual(
            instructor_file_2
        );
        expect(expected_stderr_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_2.name);

        expected_stderr_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_3.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_instructor_file).toEqual(
            instructor_file_3
        );
        expect(expected_stderr_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_3.name);

        expected_stderr_instructor_file_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(instructor_file_1.name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.expected_stderr_instructor_file).toEqual(
            instructor_file_1
        );
        expect(expected_stderr_instructor_file_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(instructor_file_1.name);
    });

    test('points_for_correct_stderr binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        let points_for_correct_stderr_input = wrapper.find({ref: 'points_for_correct_stderr'});

        set_validated_input_text(points_for_correct_stderr_input, '9');

        expect(wrapper.vm.d_ag_test_command!.points_for_correct_stderr).toEqual(9);
        expect(validated_input_is_valid(points_for_correct_stderr_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.points_for_correct_stderr = 4;
        expect(get_validated_input_text(points_for_correct_stderr_input)).toEqual('4');
    });

    test('error - points_for_correct_stderr is blank or not an integer', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stderr_text = "Hi there";
        await wrapper.vm.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'points_for_correct_stderr'}, '.save-button');
    });

    test('error - points_for_correct_stderr must be >= 0', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stderr_text = "Hi there";
        await wrapper.vm.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'points_for_correct_stderr'}, '-1', '.save-button');
    });

    test('deduction_for_wrong_stderr binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        let deduction_for_wrong_stderr_input = wrapper.find({ref: 'deduction_for_wrong_stderr'});

        set_validated_input_text(deduction_for_wrong_stderr_input, '-9');

        expect(wrapper.vm.d_ag_test_command!.deduction_for_wrong_stderr).toEqual(-9);
        expect(validated_input_is_valid(deduction_for_wrong_stderr_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.deduction_for_wrong_stderr = -4;
        expect(get_validated_input_text(deduction_for_wrong_stderr_input)).toEqual('-4');
    });

    test('error - deduction_for_wrong_stderr is blank or not an integer', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stderr_text = "Hi there";
        await wrapper.vm.$nextTick();

        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'deduction_for_wrong_stderr'}, '.save-button');
    });

    test('error - deduction_for_wrong_stderr must be <= 0', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stderr_text = "Hi there";
        await wrapper.vm.$nextTick();

        return do_invalid_text_input_test(
            wrapper, {ref: 'deduction_for_wrong_stderr'}, '1', '.save-button');
    });

    test('Diff options appear when expected_stdout_source !== none ' +
         'OR expected_stderr_source !== none',
         async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source
            = ExpectedOutputSource.instructor_file;
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.none;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        wrapper.vm.d_ag_test_command!.expected_stdout_source
            = ExpectedOutputSource.instructor_file;
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        wrapper.vm.d_ag_test_command!.expected_stdout_source
            = ExpectedOutputSource.instructor_file;
        wrapper.vm.d_ag_test_command!.expected_stderr_source
            = ExpectedOutputSource.instructor_file;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.none;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.none;
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.none;
        wrapper.vm.d_ag_test_command!.expected_stderr_source
            = ExpectedOutputSource.instructor_file;

        expect(wrapper.findAll('.diff-options').length).toEqual(1);

        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.none;
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.none;

        expect(wrapper.findAll('.diff-options').length).toEqual(0);
    });

    test('ignore_case binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source
            = ExpectedOutputSource.instructor_file;

        let ignore_case = wrapper.find('#ignore-case');

        ignore_case.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_case).toBe(true);
        expect(checkbox_is_checked(ignore_case)).toEqual(true);

        ignore_case.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_case).toBe(false);
        expect(checkbox_is_checked(ignore_case)).toEqual(false);

        ignore_case.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_case).toBe(true);
        expect(checkbox_is_checked(ignore_case)).toEqual(true);

        wrapper.vm.d_ag_test_command!.ignore_case = false;
        expect(checkbox_is_checked(ignore_case)).toBe(false);

        wrapper.vm.d_ag_test_command!.ignore_case = true;
        expect(checkbox_is_checked(ignore_case)).toBe(true);
    });

    test('ignore_whitespace binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stderr_source = ExpectedOutputSource.text;

        let ignore_whitespace = wrapper.find('#ignore-whitespace');

        ignore_whitespace.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(true);

        ignore_whitespace.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace).toBe(false);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(false);

        ignore_whitespace.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace)).toEqual(true);

        wrapper.vm.d_ag_test_command!.ignore_whitespace = false;
        expect(checkbox_is_checked(ignore_whitespace)).toBe(false);

        wrapper.vm.d_ag_test_command!.ignore_whitespace = true;
        expect(checkbox_is_checked(ignore_whitespace)).toBe(true);
    });

    test('ignore_whitespace_changes binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source = ExpectedOutputSource.text;

        let ignore_whitespace_changes = wrapper.find('#ignore-whitespace-changes');

        ignore_whitespace_changes.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace_changes).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(true);

        ignore_whitespace_changes.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace_changes).toBe(false);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(false);

        ignore_whitespace_changes.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_whitespace_changes).toBe(true);
        expect(checkbox_is_checked(ignore_whitespace_changes)).toEqual(true);

        wrapper.vm.d_ag_test_command!.ignore_whitespace_changes = false;
        expect(checkbox_is_checked(ignore_whitespace_changes)).toBe(false);

        wrapper.vm.d_ag_test_command!.ignore_whitespace_changes = true;
        expect(checkbox_is_checked(ignore_whitespace_changes)).toBe(true);
    });

    test('ignore_blank_lines binding', async () => {
        wrapper.vm.d_ag_test_command!.expected_stdout_source
            = ExpectedOutputSource.instructor_file;
        let ignore_blank_lines = wrapper.find('#ignore-blank-lines');

        ignore_blank_lines.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_blank_lines).toBe(true);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(true);

        ignore_blank_lines.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.ignore_blank_lines).toBe(false);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(false);

        ignore_blank_lines.setChecked(true);
        expect(wrapper.vm.d_ag_test_command!.ignore_blank_lines).toBe(true);
        expect(checkbox_is_checked(ignore_blank_lines)).toEqual(true);

        wrapper.vm.d_ag_test_command!.ignore_blank_lines = false;
        expect(checkbox_is_checked(ignore_blank_lines)).toBe(false);

        wrapper.vm.d_ag_test_command!.ignore_blank_lines = true;
        expect(checkbox_is_checked(ignore_blank_lines)).toBe(true);
    });

    test('time_limit binding', async () => {
        let time_limit_input = wrapper.find({ref: 'time_limit'});

        set_validated_input_text(time_limit_input, '9');

        expect(wrapper.vm.d_ag_test_command!.time_limit).toEqual(9);
        expect(validated_input_is_valid(time_limit_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.time_limit = 4;
        expect(get_validated_input_text(time_limit_input)).toEqual('4');
    });

    test('error - time_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(wrapper, {ref: 'time_limit'}, '.save-button');
    });

    test('error - time_limit must be >= 1', async () => {
        return do_invalid_text_input_test(wrapper, {ref: 'time_limit'}, '0', '.save-button');
    });

    test('virtual_memory_limit binding', async () => {
        let virtual_memory_limit_input = wrapper.find({ref: 'virtual_memory_limit'});

        set_validated_input_text(virtual_memory_limit_input, '9');

        expect(wrapper.vm.d_ag_test_command!.virtual_memory_limit).toEqual(9);
        expect(validated_input_is_valid(virtual_memory_limit_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.virtual_memory_limit = 4;
        expect(get_validated_input_text(virtual_memory_limit_input)).toEqual('4');
    });

    test('error - virtual_memory_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'virtual_memory_limit'}, '.save-button');
    });

    test('error - virtual_memory_limit must be >= 1', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'virtual_memory_limit'}, '0', '.save-button');
    });

    test('stack_size_limit binding', async () => {
        let stack_size_limit_input = wrapper.find({ref: 'stack_size_limit'});

        set_validated_input_text(stack_size_limit_input, '9');

        expect(wrapper.vm.d_ag_test_command!.stack_size_limit).toEqual(9);
        expect(validated_input_is_valid(stack_size_limit_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.stack_size_limit = 4;
        expect(get_validated_input_text(stack_size_limit_input)).toEqual('4');
    });

    test('error - stack_size_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'stack_size_limit'}, '.save-button');
    });

    test('error - stack_size_limit must be >= 1', async () => {
        return do_invalid_text_input_test(wrapper, {ref: 'stack_size_limit'}, '0', '.save-button');
    });

    test('process_spawn_limit binding', async () => {
        let process_spawn_limit_input = wrapper.find({ref: 'process_spawn_limit'});

        set_validated_input_text(process_spawn_limit_input, '9');

        expect(wrapper.vm.d_ag_test_command!.process_spawn_limit).toEqual(9);
        expect(validated_input_is_valid(process_spawn_limit_input)).toEqual(true);

        wrapper.vm.d_ag_test_command!.process_spawn_limit = 4;
        expect(get_validated_input_text(process_spawn_limit_input)).toEqual('4');
    });

    test('error - process_spawn_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'process_spawn_limit'}, '.save-button');
    });

    test('error - process_spawn_limit must be >= 0', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'process_spawn_limit'}, '-1', '.save-button');
    });

    test('Save command settings - successful', async () => {
        let save_stub = sinon.stub(wrapper.vm.d_ag_test_command!, 'save');
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);
        expect(wrapper.find('.sticky-save-button').is('[disabled]')).toBe(false);

        wrapper.find('#ag-test-command-settings-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('Sticky save button icon', () => {
        expect(wrapper.find('.sticky-save-button .fa-save').exists()).toBe(true);
        expect(wrapper.find('.sticky-save-button .fa-exclamation-triangle').exists()).toBe(false);
    });

    test('Sticky save button disabled when form invalid', () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'process_spawn_limit'}, '.sticky-save-button');
    });

    test('Sticky save button disabled while saving', async () => {
        wrapper.vm.d_saving = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.sticky-save-button').is('[disabled]')).toBe(true);
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
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        wrapper.find('#ag-test-command-settings-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);

        expect(wrapper.find('.sticky-save-button .fa-exclamation-triangle').exists()).toBe(true);
        expect(wrapper.find('.sticky-save-button .fa-save').exists()).toBe(false);
    });

    test('Delete command', async () => {
        let two_cmd_test = make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [ag_test_command, make_ag_test_command(two_cmd_test.pk)];

        wrapper.setProps({ag_test_case: two_cmd_test});

        let delete_command_stub = sinon.stub(wrapper.vm.d_ag_test_command!, 'delete');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);

        wrapper.find('.delete-ag-test-command-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(true);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_command_stub.calledOnce).toBe(true);
        expect(wrapper.find({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);
    });

    test('Delete case with exactly one command', async () => {
        let delete_case_stub = sinon.stub(wrapper.vm.d_ag_test_case!, 'delete');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);

        wrapper.find('.delete-ag-test-command-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(true);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_case_stub.calledOnce).toBe(true);
        expect(wrapper.find({ref: 'delete_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_ag_test_command_modal).toBe(false);
    });

    test('Parent component changes the value supplied to the test_command prop', async () => {
        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(ag_test_command.pk);

        let other_cmd = make_ag_test_command(ag_test_case.pk);
        wrapper.setProps({'ag_test_command': other_cmd});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(other_cmd.pk);

        wrapper.setProps({'ag_test_command': ag_test_command});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(ag_test_command.pk);
    });

    test('Parent component changes the value supplied to the test_case prop', async () => {
        expect(wrapper.vm.d_ag_test_case!.pk).toEqual(ag_test_case.pk);

        let two_cmd_test = make_ag_test_case(ag_test_suite.pk);
        two_cmd_test.ag_test_commands = [ag_test_command, make_ag_test_command(two_cmd_test.pk)];

        wrapper.setProps({'ag_test_case': two_cmd_test});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_case!.pk).toEqual(two_cmd_test.pk);

        wrapper.setProps({'ag_test_case': ag_test_case});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_command!.pk).toEqual(ag_test_command.pk);
    });
});

describe('AG test command feedback tests', () => {
    test('Normal fdbk binding', () => {
        ag_test_command.normal_fdbk_config = make_ag_test_command_fdbk_config({
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
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'normal_config_panel'});
        expect(normal_config_panel.vm.value).toEqual(ag_test_command.normal_fdbk_config);

        let normal_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.find(
                {ref: 'normal_edit_feedback_settings'});
        expect(normal_advanced_settings.vm.value).toEqual(ag_test_command.normal_fdbk_config);

        let new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        normal_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.normal_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        normal_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.normal_fdbk_config).toEqual(new_val);
    });

    test('First failure fdbk binding', () => {
        ag_test_command.first_failed_test_normal_fdbk_config = make_ag_test_command_fdbk_config({
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

        let first_failure_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'first_failure_config_panel'});
        expect(first_failure_config_panel.vm.value).toEqual(
            ag_test_command.first_failed_test_normal_fdbk_config);

        let first_failure_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.find(
                {ref: 'first_failure_edit_feedback_settings'});
        expect(first_failure_advanced_settings.vm.value).toEqual(
            ag_test_command.first_failed_test_normal_fdbk_config);

        let new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        first_failure_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        first_failure_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toEqual(new_val);
    });

    test('Final graded fdbk binding', () => {
        ag_test_command.ultimate_submission_fdbk_config = make_ag_test_command_fdbk_config({
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

        let final_graded_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'final_graded_config_panel'});
        expect(final_graded_config_panel.vm.value).toEqual(
            ag_test_command.ultimate_submission_fdbk_config);

        let final_graded_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.find(
                {ref: 'final_graded_edit_feedback_settings'});
        expect(final_graded_advanced_settings.vm.value).toEqual(
            ag_test_command.ultimate_submission_fdbk_config);

        let new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        final_graded_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.ultimate_submission_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        final_graded_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.ultimate_submission_fdbk_config).toEqual(new_val);
    });

    test('Past limit fdbk binding', () => {
        ag_test_command.past_limit_submission_fdbk_config = make_ag_test_command_fdbk_config({
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

        let past_limit_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'past_limit_config_panel'});
        expect(past_limit_config_panel.vm.value).toEqual(
            ag_test_command.past_limit_submission_fdbk_config);

        let past_limit_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.find(
                {ref: 'past_limit_edit_feedback_settings'});
        expect(past_limit_advanced_settings.vm.value).toEqual(
            ag_test_command.past_limit_submission_fdbk_config);

        let new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        past_limit_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.past_limit_submission_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: false,
        });
        past_limit_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.past_limit_submission_fdbk_config).toEqual(new_val);
    });

    test('Student lookup fdbk binding', () => {
        ag_test_command.staff_viewer_fdbk_config = make_ag_test_command_fdbk_config({
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

        let student_lookup_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'student_lookup_config_panel'});
        expect(student_lookup_config_panel.vm.value).toEqual(
            ag_test_command.staff_viewer_fdbk_config);

        let student_lookup_advanced_settings
            = <Wrapper<AGTestCommandAdvancedFdbkSettings>> wrapper.find(
                {ref: 'student_lookup_edit_feedback_settings'});
        expect(student_lookup_advanced_settings.vm.value).toEqual(
            ag_test_command.staff_viewer_fdbk_config);

        let new_val = make_ag_test_command_fdbk_config({
            show_actual_return_code: false,
            show_whether_timed_out: true,
        });
        student_lookup_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_command!.staff_viewer_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_command_fdbk_config({
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

        checkbox.setChecked(true);
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

        checkbox.setChecked(false);
        expect(wrapper.vm.d_ag_test_command!.first_failed_test_normal_fdbk_config).toBeNull();
    });
});
