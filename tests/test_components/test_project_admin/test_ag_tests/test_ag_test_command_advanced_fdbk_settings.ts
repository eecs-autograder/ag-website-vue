import { Wrapper } from '@vue/test-utils';

import { AGTestCase, AGTestCommandFeedbackConfig, AGTestSuite, ValueFeedbackLevel } from 'ag-client-typescript';

import AGTestCommandAdvancedFdbkSettings from '@/components/project_admin/ag_tests/ag_test_command_advanced_fdbk_settings.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, set_data, set_props } from '@/tests/utils';


describe('AGTestCommandAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<AGTestCommandAdvancedFdbkSettings>;
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
        ag_test_case = data_ut.make_ag_test_case(ag_test_suite.pk);
        ag_test_case.ag_test_commands = [data_ut.make_ag_test_command(ag_test_case.pk)];

        wrapper = managed_mount(AGTestCommandAdvancedFdbkSettings, {
            propsData: {
                ag_test_case: ag_test_case,
                value: feedback_config
            }
        });
    });

    test('visible binding - case has only one command', async () => {
        let visible_input = wrapper.find('[data-testid=cmd_is_visible]');

        expect(wrapper.vm.ag_test_case.ag_test_commands.length).toEqual(1);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(false);
        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(1);

        await visible_input.setChecked(true);

        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);
        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(0);
    });

    test('visible binding - case has more than one command', async () => {
        let case_with_more_than_one_command = data_ut.make_ag_test_case(ag_test_suite.pk);
        case_with_more_than_one_command.ag_test_commands = [
            data_ut.make_ag_test_command(case_with_more_than_one_command.pk),
            data_ut.make_ag_test_command(case_with_more_than_one_command.pk),
        ];
        await set_props(wrapper, {ag_test_case: case_with_more_than_one_command});

        let visible_input = wrapper.find('[data-testid=cmd_is_visible]');

        expect(wrapper.vm.d_feedback_config!.visible).toEqual(false);
        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(1);

        await visible_input.setChecked(true);

        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);
        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(1);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {visible: false}});
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {visible: true}});
        expect(checkbox_is_checked(visible_input)).toEqual(true);

        await set_props(wrapper, {ag_test_case: ag_test_case});

        expect(wrapper.vm.d_feedback_config?.visible).toEqual(true);
        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(0);
    });

    test('show_student_description binding', async () => {
        let show_student_description_input = wrapper.find('[data-testid=show_student_description]');

        await show_student_description_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_student_description).toEqual(true);

        await show_student_description_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_student_description).toEqual(false);

        await show_student_description_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_student_description).toEqual(true);

        expect(checkbox_is_checked(show_student_description_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_student_description: false}});
        expect(checkbox_is_checked(show_student_description_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_student_description: true}});
        expect(checkbox_is_checked(show_student_description_input)).toEqual(true);
    });

    test('return_code_fdbk_level binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let return_code_fdbk_level_input = wrapper.find('[data-testid=return_code_fdbk_level]');

        await return_code_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(wrapper.vm.d_feedback_config!.return_code_fdbk_level).toEqual(
            ValueFeedbackLevel.correct_or_incorrect
        );

        await return_code_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.d_feedback_config!.return_code_fdbk_level).toEqual(
            ValueFeedbackLevel.expected_and_actual
        );

        await return_code_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(wrapper.vm.d_feedback_config!.return_code_fdbk_level).toEqual(
            ValueFeedbackLevel.no_feedback
        );
    });

    test('stdout_fdbk_level binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let stdout_fdbk_level_input = wrapper.find('[data-testid=stdout_fdbk_level]');

        await stdout_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(wrapper.vm.d_feedback_config!.stdout_fdbk_level).toEqual(
            ValueFeedbackLevel.correct_or_incorrect
        );

        await stdout_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.d_feedback_config!.stdout_fdbk_level).toEqual(
            ValueFeedbackLevel.expected_and_actual
        );

        await stdout_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(wrapper.vm.d_feedback_config!.stdout_fdbk_level).toEqual(
            ValueFeedbackLevel.no_feedback
        );
    });

    test('stderr_fdbk_level binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let stderr_fdbk_level_input = wrapper.find('[data-testid=stderr_fdbk_level]');

        await stderr_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(wrapper.vm.d_feedback_config!.stderr_fdbk_level).toEqual(
            ValueFeedbackLevel.correct_or_incorrect
        );

        await stderr_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.d_feedback_config!.stderr_fdbk_level).toEqual(
            ValueFeedbackLevel.expected_and_actual
        );

        await stderr_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(wrapper.vm.d_feedback_config!.stderr_fdbk_level).toEqual(
            ValueFeedbackLevel.no_feedback
        );
    });

    test('show_points binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_points_input = wrapper.find('[data-testid=show_points]');

        await show_points_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(true);

        await show_points_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(false);

        await show_points_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(true);

        expect(checkbox_is_checked(show_points_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_points: false}});
        expect(checkbox_is_checked(show_points_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_points: true}});
        expect(checkbox_is_checked(show_points_input)).toEqual(true);
    });

    test('show_actual_stdout binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_actual_stdout_input = wrapper.find('[data-testid=show_actual_stdout]');

        await show_actual_stdout_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_actual_stdout).toEqual(true);

        await show_actual_stdout_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_actual_stdout).toEqual(false);

        await show_actual_stdout_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_actual_stdout).toEqual(true);

        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_actual_stdout: false}});
        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_actual_stdout: true}});
        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(true);
    });

    test('show_actual_stderr binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_actual_stderr_input = wrapper.find('[data-testid=show_actual_stderr]');

        await show_actual_stderr_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_actual_stderr).toEqual(true);

        await show_actual_stderr_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_actual_stderr).toEqual(false);

        await show_actual_stderr_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_actual_stderr).toEqual(true);

        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_actual_stderr: false}});
        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_actual_stderr: true}});
        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(true);
    });

    test('show_whether_timed_out binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_whether_timed_out_input = wrapper.find('[data-testid=show_whether_timed_out]');

        await show_whether_timed_out_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_whether_timed_out).toEqual(true);

        await show_whether_timed_out_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_whether_timed_out).toEqual(false);

        await show_whether_timed_out_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_whether_timed_out).toEqual(true);

        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_whether_timed_out: false}});
        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_whether_timed_out: true}});
        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(true);
    });

    test('value Watcher', async () => {
        await set_data(wrapper, {d_is_open: true});

        expect(wrapper.vm.d_feedback_config!).toEqual(feedback_config);

        let new_config = data_ut.make_ag_test_command_fdbk_config({
            show_actual_stdout: !feedback_config.show_actual_stdout,
            show_actual_stderr: !feedback_config.show_actual_stderr
        });
        await set_props(wrapper, {'value': new_config});
        expect(wrapper.vm.d_feedback_config).toEqual(new_config);
    });

    test('toggle_is_open', async () => {
        expect(wrapper.vm.d_is_open).toBe(false);

        wrapper.vm.toggle_is_open();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_is_open).toBe(true);

        wrapper.vm.toggle_is_open();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_is_open).toBe(false);

        await wrapper.find('.advanced-settings-label').trigger('click');
        expect(wrapper.vm.d_is_open).toBe(true);

        await wrapper.find('.advanced-settings-label').trigger('click');
        expect(wrapper.vm.d_is_open).toBe(false);
    });
});
