import { config, mount, Wrapper } from '@vue/test-utils';

import { AGTestCase, AGTestCommandFeedbackConfig, AGTestSuite, ValueFeedbackLevel } from 'ag-client-typescript';

import EditFeedbackSettingsAGCommand from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_ag_command.vue';

import * as data_ut from '@/tests/data_utils';
import { checkbox_is_checked } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('EditFeedbackSettingsAGCommand tests', () => {
    let wrapper: Wrapper<EditFeedbackSettingsAGCommand>;
    let component: EditFeedbackSettingsAGCommand;
    let ag_test_suite: AGTestSuite;
    let ag_test_case: AGTestCase;
    let feedback_config: AGTestCommandFeedbackConfig;

    beforeEach(() => {
        let course = data_ut.make_course();
        let project = data_ut.make_project(course.pk);
        ag_test_suite = data_ut.make_ag_test_suite(project.pk);
        feedback_config = data_ut.make_ag_test_command_fdbk_config({
            show_actual_stdout: false,
            show_actual_stderr: true,
        });
        ag_test_case = data_ut.make_ag_test_case(
            ag_test_suite.pk,
            {ag_test_commands: [data_ut.make_ag_test_command(ag_test_case.pk)]});

        wrapper = mount(EditFeedbackSettingsAGCommand, {
            propsData: {
                config_name: "normal",
                ag_test_case: ag_test_case,
                value: feedback_config
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('visible binding - case has only one command', async () => {
        let visible_input = wrapper.find('#normal-visible');

        expect(component.ag_test_case.ag_test_commands.length).toEqual(1);
        expect(component.d_feedback_config!.visible).toEqual(false);
        expect(wrapper.findAll('#normal-visible').length).toEqual(1);

        visible_input.setChecked(true);

        expect(component.d_feedback_config!.visible).toEqual(true);
        expect(wrapper.findAll('#normal-visible').length).toEqual(0);
    });

    test('visible binding - case has more than one command', async () => {
        let case_with_more_than_one_command = data_ut.make_ag_test_case(ag_test_suite.pk);
        case_with_more_than_one_command.ag_test_commands = [
            data_ut.make_ag_test_command(case_with_more_than_one_command.pk),
            data_ut.make_ag_test_command(case_with_more_than_one_command.pk),
        ];
        wrapper.setProps({ag_test_case: case_with_more_than_one_command});
        await component.$nextTick();

        let visible_input = wrapper.find('#normal-visible');

        expect(component.d_feedback_config!.visible).toEqual(false);
        expect(wrapper.findAll('#normal-visible').length).toEqual(1);

        visible_input.setChecked(true);

        expect(component.d_feedback_config!.visible).toEqual(true);
        expect(wrapper.findAll('#normal-visible').length).toEqual(1);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        component.d_feedback_config!.visible = false;
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        component.d_feedback_config!.visible = true;
        expect(checkbox_is_checked(visible_input)).toEqual(true);

        wrapper.setProps({ag_test_case: ag_test_case});
        await component.$nextTick();

        expect(component.d_feedback_config!.visible).toEqual(true);
        expect(wrapper.findAll('#normal-visible').length).toEqual(0);
    });

    test('return_code_fdbk_level binding', async () => {
        wrapper.setData({d_is_open: true});

        let return_code_fdbk_level_input = wrapper.find('#normal-return-code-fdbk-level');

        return_code_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(component.d_feedback_config!.return_code_fdbk_level).toEqual(
            ValueFeedbackLevel.correct_or_incorrect
        );

        return_code_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(component.d_feedback_config!.return_code_fdbk_level).toEqual(
            ValueFeedbackLevel.expected_and_actual
        );

        return_code_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(component.d_feedback_config!.return_code_fdbk_level).toEqual(
            ValueFeedbackLevel.no_feedback
        );
    });

    test('stdout_fdbk_level binding', async () => {
        wrapper.setData({d_is_open: true});

        let stdout_fdbk_level_input = wrapper.find('#normal-stdout-fdbk-level');

        stdout_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(component.d_feedback_config!.stdout_fdbk_level).toEqual(
            ValueFeedbackLevel.correct_or_incorrect
        );

        stdout_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(component.d_feedback_config!.stdout_fdbk_level).toEqual(
            ValueFeedbackLevel.expected_and_actual
        );

        stdout_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(component.d_feedback_config!.stdout_fdbk_level).toEqual(
            ValueFeedbackLevel.no_feedback
        );
    });

    test('stderr_fdbk_level binding', async () => {
        wrapper.setData({d_is_open: true});

        let stderr_fdbk_level_input = wrapper.find('#normal-stderr-fdbk-level');

        stderr_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(component.d_feedback_config!.stderr_fdbk_level).toEqual(
            ValueFeedbackLevel.correct_or_incorrect
        );

        stderr_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(component.d_feedback_config!.stderr_fdbk_level).toEqual(
            ValueFeedbackLevel.expected_and_actual
        );

        stderr_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(component.d_feedback_config!.stderr_fdbk_level).toEqual(
            ValueFeedbackLevel.no_feedback
        );
    });

    test('show_points binding', async () => {
        wrapper.setData({d_is_open: true});

        let show_points_input = wrapper.find('#normal-show-points');

        show_points_input.setChecked(true);
        expect(component.d_feedback_config!.show_points).toEqual(true);

        show_points_input.setChecked(false);
        expect(component.d_feedback_config!.show_points).toEqual(false);

        show_points_input.setChecked(true);
        expect(component.d_feedback_config!.show_points).toEqual(true);

        expect(checkbox_is_checked(show_points_input)).toEqual(true);

        component.d_feedback_config!.show_points = false;
        expect(checkbox_is_checked(show_points_input)).toEqual(false);

        component.d_feedback_config!.show_points = true;
        expect(checkbox_is_checked(show_points_input)).toEqual(true);
    });

    test('show_actual_stdout binding', async () => {
        wrapper.setData({d_is_open: true});

        let show_actual_stdout_input = wrapper.find('#normal-show-actual-stdout');

        show_actual_stdout_input.setChecked(true);
        expect(component.d_feedback_config!.show_actual_stdout).toEqual(true);

        show_actual_stdout_input.setChecked(false);
        expect(component.d_feedback_config!.show_actual_stdout).toEqual(false);

        show_actual_stdout_input.setChecked(true);
        expect(component.d_feedback_config!.show_actual_stdout).toEqual(true);

        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(true);

        component.d_feedback_config!.show_actual_stdout = false;
        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(false);

        component.d_feedback_config!.show_actual_stdout = true;
        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(true);
    });

    test('show_actual_stderr binding', async () => {
        wrapper.setData({d_is_open: true});

        let show_actual_stderr_input = wrapper.find('#normal-show-actual-stderr');

        show_actual_stderr_input.setChecked(true);
        expect(component.d_feedback_config!.show_actual_stderr).toEqual(true);

        show_actual_stderr_input.setChecked(false);
        expect(component.d_feedback_config!.show_actual_stderr).toEqual(false);

        show_actual_stderr_input.setChecked(true);
        expect(component.d_feedback_config!.show_actual_stderr).toEqual(true);

        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(true);

        component.d_feedback_config!.show_actual_stderr = false;
        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(false);

        component.d_feedback_config!.show_actual_stderr = true;
        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(true);
    });

    test('show_whether_timed_out binding', async () => {
        wrapper.setData({d_is_open: true});

        let show_whether_timed_out_input = wrapper.find('#normal-show-whether-timed-out');

        show_whether_timed_out_input.setChecked(true);
        expect(component.d_feedback_config!.show_whether_timed_out).toEqual(true);

        show_whether_timed_out_input.setChecked(false);
        expect(component.d_feedback_config!.show_whether_timed_out).toEqual(false);

        show_whether_timed_out_input.setChecked(true);
        expect(component.d_feedback_config!.show_whether_timed_out).toEqual(true);

        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(true);

        component.d_feedback_config!.show_whether_timed_out = false;
        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(false);

        component.d_feedback_config!.show_whether_timed_out = true;
        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(true);
    });

    test('value Watcher', async () => {
        wrapper.setData({d_is_open: true});

        expect(component.d_feedback_config!).toEqual(feedback_config);

        let new_config = data_ut.make_ag_test_command_fdbk_config({
            show_actual_stdout: !feedback_config.show_actual_stdout,
            show_actual_stderr: !feedback_config.show_actual_stderr
        });
        wrapper.setProps({'value': new_config});
        await component.$nextTick();

        expect(component.d_feedback_config!).toEqual(new_config);
    });

    test('config_name Prop', async () => {
        wrapper.setData({d_is_open: true});

        expect(component.config_name).toEqual("normal");

        wrapper.setProps({'config_name': "first-failure"});
        await component.$nextTick();

        expect(component.config_name).toEqual("first-failure");
    });

    test('toggle_is_open', async () => {
        expect(component.d_is_open).toBe(false);

        component.toggle_is_open();
        expect(component.d_is_open).toBe(true);

        component.toggle_is_open();
        expect(component.d_is_open).toBe(false);

        wrapper.find('.advanced-settings-label').trigger('click');
        expect(component.d_is_open).toBe(true);

        wrapper.find('.advanced-settings-label').trigger('click');
        expect(component.d_is_open).toBe(false);
    });
});
