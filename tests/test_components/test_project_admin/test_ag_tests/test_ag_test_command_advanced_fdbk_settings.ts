import { Wrapper } from '@vue/test-utils';

import { AGTestCase, AGTestCommandFeedbackConfig, AGTestSuite, ValueFeedbackLevel } from 'ag-client-typescript';

import AGTestCommandAdvancedFdbkSettings from '@/components/project_admin/ag_tests/ag_test_command_advanced_fdbk_settings.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, emitted, set_props, find_collapsible_section_header } from '@/tests/utils';


describe('AGTestCommandAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<Vue>;
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
        expect(ag_test_case.ag_test_commands.length).toEqual(1);

        let visible_input = wrapper.find('[data-testid=cmd_is_visible]');
        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(1);
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        await visible_input.setChecked(true);

        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({visible: true})
        );
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
        expect(checkbox_is_checked(visible_input)).toEqual(false);
        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(1);

        await visible_input.setChecked(true);

        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(1);
        expect(checkbox_is_checked(wrapper.find('[data-testid=cmd_is_visible]'))).toEqual(true);

        await set_props(wrapper, {value: data_ut.make_ag_test_command_fdbk_config({visible: false})});
        expect(checkbox_is_checked(wrapper.find('[data-testid=cmd_is_visible]'))).toEqual(false);

        await set_props(wrapper, {value: data_ut.make_ag_test_command_fdbk_config({visible: true})});
        expect(checkbox_is_checked(wrapper.find('[data-testid=cmd_is_visible]'))).toEqual(true);

        await set_props(wrapper, {ag_test_case: ag_test_case});

        expect(wrapper.findAll('[data-testid=cmd_is_visible]').length).toEqual(0);
    });

    test('show_student_description binding', async () => {
        let show_student_description_input = wrapper.find('[data-testid=show_student_description]');

        await show_student_description_input.setChecked(true);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({show_student_description: true})
        );

        await show_student_description_input.setChecked(false);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(
            expect.objectContaining({show_student_description: false})
        );

        await show_student_description_input.setChecked(true);
        expect(checkbox_is_checked(show_student_description_input)).toEqual(true);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_student_description: false})}
        );
        expect(checkbox_is_checked(show_student_description_input)).toEqual(false);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_student_description: true})}
        );
        expect(checkbox_is_checked(show_student_description_input)).toEqual(true);
    });

    test('return_code_fdbk_level binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let return_code_fdbk_level_input = wrapper.find('[data-testid=return_code_fdbk_level]');

        await return_code_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect})
        );

        await return_code_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(
            expect.objectContaining({return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual})
        );

        await return_code_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(emitted(wrapper, 'input')[2][0]).toEqual(
            expect.objectContaining({return_code_fdbk_level: ValueFeedbackLevel.no_feedback})
        );
    });

    test('stdout_fdbk_level binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let stdout_fdbk_level_input = wrapper.find('[data-testid=stdout_fdbk_level]');

        await stdout_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect})
        );

        await stdout_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(
            expect.objectContaining({stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual})
        );

        await stdout_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(emitted(wrapper, 'input')[2][0]).toEqual(
            expect.objectContaining({stdout_fdbk_level: ValueFeedbackLevel.no_feedback})
        );
    });

    test('stderr_fdbk_level binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let stderr_fdbk_level_input = wrapper.find('[data-testid=stderr_fdbk_level]');

        await stderr_fdbk_level_input.setValue(ValueFeedbackLevel.correct_or_incorrect);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect})
        );

        await stderr_fdbk_level_input.setValue(ValueFeedbackLevel.expected_and_actual);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(
            expect.objectContaining({stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual})
        );

        await stderr_fdbk_level_input.setValue(ValueFeedbackLevel.no_feedback);
        expect(emitted(wrapper, 'input')[2][0]).toEqual(
            expect.objectContaining({stderr_fdbk_level: ValueFeedbackLevel.no_feedback})
        );
    });

    test('show_points binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let show_points_input = wrapper.find('[data-testid=show_points]');

        await show_points_input.setChecked(true);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(expect.objectContaining({show_points: true}));

        await show_points_input.setChecked(false);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(expect.objectContaining({show_points: false}));

        await show_points_input.setChecked(true);
        expect(checkbox_is_checked(show_points_input)).toEqual(true);

        await set_props(wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_points: false})});
        expect(checkbox_is_checked(show_points_input)).toEqual(false);

        await set_props(wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_points: true})});
        expect(checkbox_is_checked(show_points_input)).toEqual(true);
    });

    test('show_actual_stdout binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let show_actual_stdout_input = wrapper.find('[data-testid=show_actual_stdout]');

        await show_actual_stdout_input.setChecked(true);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({show_actual_stdout: true})
        );

        await show_actual_stdout_input.setChecked(false);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(
            expect.objectContaining({show_actual_stdout: false})
        );

        await show_actual_stdout_input.setChecked(true);
        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(true);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_actual_stdout: false})}
        );
        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(false);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_actual_stdout: true})}
        );
        expect(checkbox_is_checked(show_actual_stdout_input)).toEqual(true);
    });

    test('show_actual_stderr binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let show_actual_stderr_input = wrapper.find('[data-testid=show_actual_stderr]');
        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(true);

        await show_actual_stderr_input.setChecked(false);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({show_actual_stderr: false})
        );

        await show_actual_stderr_input.setChecked(true);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(
            expect.objectContaining({show_actual_stderr: true})
        );

        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(true);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_actual_stderr: false})}
        );
        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(false);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_actual_stderr: true})}
        );
        expect(checkbox_is_checked(show_actual_stderr_input)).toEqual(true);
    });

    test('show_whether_timed_out binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let show_whether_timed_out_input = wrapper.find('[data-testid=show_whether_timed_out]');

        await show_whether_timed_out_input.setChecked(true);
        expect(emitted(wrapper, 'input')[0][0]).toEqual(
            expect.objectContaining({show_whether_timed_out: true})
        );

        await show_whether_timed_out_input.setChecked(false);
        expect(emitted(wrapper, 'input')[1][0]).toEqual(
            expect.objectContaining({show_whether_timed_out: false})
        );

        await show_whether_timed_out_input.setChecked(true);
        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(true);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_whether_timed_out: false})}
        );
        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(false);

        await set_props(
            wrapper, {value: data_ut.make_ag_test_command_fdbk_config({show_whether_timed_out: true})}
        );
        expect(checkbox_is_checked(show_whether_timed_out_input)).toEqual(true);
    });

    test('value prop change updates rendered feedback config', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        expect(checkbox_is_checked(wrapper.find('[data-testid=show_actual_stdout]'))).toEqual(false);
        expect(checkbox_is_checked(wrapper.find('[data-testid=show_actual_stderr]'))).toEqual(true);

        let new_config = data_ut.make_ag_test_command_fdbk_config({
            show_actual_stdout: !feedback_config.show_actual_stdout,
            show_actual_stderr: !feedback_config.show_actual_stderr
        });
        await set_props(wrapper, {value: new_config});

        expect(checkbox_is_checked(wrapper.find('[data-testid=show_actual_stdout]'))).toEqual(true);
        expect(checkbox_is_checked(wrapper.find('[data-testid=show_actual_stderr]'))).toEqual(false);
    });
});
