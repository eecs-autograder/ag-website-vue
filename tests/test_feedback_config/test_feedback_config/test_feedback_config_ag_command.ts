import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    HttpError,
    ValueFeedbackLevel
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import FeedbackConfigAGCommand from '@/components/feedback_config/feedback_config/feedback_config_ag_command.vue';

import { create_ag_case, create_ag_command } from '@/tests/data_utils';

export enum FeedbackConfigLabel {
    normal = "Normal",
    first_failure = "First Failure",
    ultimate_submission = "Ultimate Submission",
    past_limit = "Past Limit",
    staff_viewer = "Student Lookup"
}

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('FeedbackConfigAGCommand tests', () => {
    let wrapper: Wrapper<FeedbackConfigAGCommand>;
    let component: FeedbackConfigAGCommand;
    let ag_test_case: AGTestCase;
    let ag_test_command: AGTestCommand;

    beforeEach(() => {

        ag_test_command = create_ag_command(1, "Example Suite", 1);
        ag_test_case = create_ag_case(1, "Example Case", 1);

        ag_test_case.ag_test_commands = [ag_test_command];

        wrapper = mount(FeedbackConfigAGCommand, {
            propsData: {
                ag_test_case: ag_test_case,
                ag_test_command: ag_test_command
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('toggle whether first_failed_test_normal_fdbk_config config is enabled',
         async () => {
        fail();
    });

    test("get_current_preset_fn", async () => {
        let public_preset = component.fdbk_presets.get('Public');
        let pass_fail_plus_output = component.fdbk_presets.get('Pass/Fail + Output');
        let pass_fail_plus_diff_preset = component.fdbk_presets.get('Pass/Fail + Diff');
        let pass_fail_plus_exit_status_preset = component.fdbk_presets.get(
            'Pass/Fail + Exit Status'
        );
        let pass_fail_preset = component.fdbk_presets.get('Pass/Fail');
        let private_preset = component.fdbk_presets.get('Private');

        let ag_test_command_config: AGTestCommandFeedbackConfig | null = {
            visible: true,
            return_code_fdbk_level: pass_fail_plus_output.return_code_fdbk_level,
            stdout_fdbk_level: pass_fail_plus_output.stdout_fdbk_level,
            stderr_fdbk_level: pass_fail_plus_output.stderr_fdbk_level,
            show_points: pass_fail_plus_output.show_points,
            show_actual_return_code: pass_fail_plus_output.show_actual_return_code,
            show_actual_stdout: pass_fail_plus_output.show_actual_stdout,
            show_actual_stderr: pass_fail_plus_output.show_actual_stderr,
            show_whether_timed_out: pass_fail_plus_output.show_whether_timed_out
        };

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Output");

        ag_test_command_config = {
            visible: true,
            return_code_fdbk_level: pass_fail_plus_diff_preset.return_code_fdbk_level,
            stdout_fdbk_level: pass_fail_plus_diff_preset.stdout_fdbk_level,
            stderr_fdbk_level: pass_fail_plus_diff_preset.stderr_fdbk_level,
            show_points: pass_fail_plus_diff_preset.show_points,
            show_actual_return_code: pass_fail_plus_diff_preset.show_actual_return_code,
            show_actual_stdout: pass_fail_plus_diff_preset.show_actual_stdout,
            show_actual_stderr: pass_fail_plus_diff_preset.show_actual_stderr,
            show_whether_timed_out: pass_fail_plus_diff_preset.show_whether_timed_out
        };

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Diff");

        ag_test_command_config = {
            visible: true,
            return_code_fdbk_level: pass_fail_plus_exit_status_preset.return_code_fdbk_level,
            stdout_fdbk_level: pass_fail_plus_exit_status_preset.stdout_fdbk_level,
            stderr_fdbk_level: pass_fail_plus_exit_status_preset.stderr_fdbk_level,
            show_points: pass_fail_plus_exit_status_preset.show_points,
            show_actual_return_code: pass_fail_plus_exit_status_preset.show_actual_return_code,
            show_actual_stdout: pass_fail_plus_exit_status_preset.show_actual_stdout,
            show_actual_stderr: pass_fail_plus_exit_status_preset.show_actual_stderr,
            show_whether_timed_out: pass_fail_plus_exit_status_preset.show_whether_timed_out
        };

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Exit Status");

        ag_test_command_config = {
            visible: true,
            return_code_fdbk_level: pass_fail_preset.return_code_fdbk_level,
            stdout_fdbk_level: pass_fail_preset.stdout_fdbk_level,
            stderr_fdbk_level: pass_fail_preset.stderr_fdbk_level,
            show_points: pass_fail_preset.show_points,
            show_actual_return_code: pass_fail_preset.show_actual_return_code,
            show_actual_stdout: pass_fail_preset.show_actual_stdout,
            show_actual_stderr: pass_fail_preset.show_actual_stderr,
            show_whether_timed_out: pass_fail_preset.show_whether_timed_out
        };

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail");

        ag_test_command_config = {
            visible: true,
            return_code_fdbk_level: private_preset.return_code_fdbk_level,
            stdout_fdbk_level: private_preset.stdout_fdbk_level,
            stderr_fdbk_level: private_preset.stderr_fdbk_level,
            show_points: private_preset.show_points,
            show_actual_return_code: private_preset.show_actual_return_code,
            show_actual_stdout: private_preset.show_actual_stdout,
            show_actual_stderr: private_preset.show_actual_stderr,
            show_whether_timed_out: private_preset.show_whether_timed_out
        };

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Private");

        ag_test_command_config = {
            visible: true,
            return_code_fdbk_level: public_preset.return_code_fdbk_level,
            stdout_fdbk_level: public_preset.stdout_fdbk_level,
            stderr_fdbk_level: public_preset.stderr_fdbk_level,
            show_points: public_preset.show_points,
            show_actual_return_code: public_preset.show_actual_return_code,
            show_actual_stdout: public_preset.show_actual_stdout,
            show_actual_stderr: public_preset.show_actual_stderr,
            show_whether_timed_out: public_preset.show_whether_timed_out
        };

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Public");

        ag_test_command_config = null;

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Custom");
    });

    test("apply_preset", async () => {
        let ag_test_command_config: AGTestCommandFeedbackConfig = {
            visible: true,
            return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
            stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
            show_points: true,
            show_actual_return_code: true,
            show_actual_stdout: true,
            show_actual_stderr: true,
            show_whether_timed_out: true
        };

        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Custom");

        component.apply_preset(
            "Public", ag_test_command_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Public");

        component.apply_preset(
            "Pass/Fail + Output", ag_test_command_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Output");

        component.apply_preset(
            "Pass/Fail + Diff", ag_test_command_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Diff");

        component.apply_preset(
            "Pass/Fail + Exit Status", ag_test_command_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Exit Status");

        component.apply_preset(
            "Pass/Fail", ag_test_command_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail");

        component.apply_preset(
            "Private", ag_test_command_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Private");

        // Nothing should happen
        component.apply_preset(
            "Custom", ag_test_command_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Private");
    });

    test("apply_preset called from config_panel", async () => {
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");

        let staff_viewer_config_panel = wrapper.find(
            {ref: FeedbackConfigLabel.staff_viewer}
        );

        staff_viewer_config_panel.find('#config-preset-select').setValue(
            "Pass/Fail + Diff"
        );
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_command.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Pass/Fail + Diff");
    });

    test("update_config_settings", async () => {
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.past_limit_submission_fdbk_config, component.fdbk_presets)
        ).toEqual("Custom");

        expect(component.get_current_preset_fn(component.d_ag_test_command.normal_fdbk_config,
                                               component.fdbk_presets)).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.first_failed_test_normal_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.ultimate_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.past_limit_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.staff_viewer_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");

        let past_limit_config_panel = wrapper.findAll(
            {ref: FeedbackConfigLabel.past_limit}
        ).at(0);

        past_limit_config_panel.find('.advanced-settings-label').trigger(
            'click'
        );
        await component.$nextTick();

        wrapper.find('#past-limit-show-points').setChecked(true);

        expect(component.get_current_preset_fn(
            component.d_ag_test_command.past_limit_submission_fdbk_config, component.fdbk_presets)
        ).toEqual("Pass/Fail");

        wrapper.find('#past-limit-return-code-fdbk-level').setValue(
            ValueFeedbackLevel.no_feedback
        );

        expect(component.get_current_preset_fn(
            component.d_ag_test_command.past_limit_submission_fdbk_config, component.fdbk_presets)
        ).toEqual("Custom");

        wrapper.find('#past-limit-stdout-fdbk-level').setValue(ValueFeedbackLevel.no_feedback);

        expect(component.get_current_preset_fn(
            component.d_ag_test_command.past_limit_submission_fdbk_config, component.fdbk_presets)
        ).toEqual("Custom");

        wrapper.find('#past-limit-stderr-fdbk-level').setValue(ValueFeedbackLevel.no_feedback);

        expect(component.get_current_preset_fn(
            component.d_ag_test_command.past_limit_submission_fdbk_config, component.fdbk_presets)
        ).toEqual("Custom");

        wrapper.find('#past-limit-show-points').setChecked(false);

        expect(component.get_current_preset_fn(
            component.d_ag_test_command.normal_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.first_failed_test_normal_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.ultimate_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.past_limit_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Private");
        expect(component.get_current_preset_fn(
            component.d_ag_test_command.staff_viewer_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
    });

    test("update_config_settings - checkboxes in config panels do not react to changes in " +
         "other panels",
         async () => {

        wrapper.findAll('.advanced-settings-label').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(1).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(2).trigger('click');
        await component.$nextTick();

        wrapper.find('#first-failure-show-actual-stdout').setChecked(true);

        expect(component.d_ag_test_command.normal_fdbk_config.show_actual_stdout).toBe(false);
        expect(component.d_ag_test_command.first_failed_test_normal_fdbk_config
                   .show_actual_stdout
        ).toBe(true);
        expect(component.d_ag_test_command.ultimate_submission_fdbk_config
                   .show_actual_stdout
        ).toBe(false);
    });

    test("update_config_settings - command visibility changed & case only has one command",
         async () => {
        let staff_viewer_fdbk_config_panel = wrapper.findAll(
            {ref: FeedbackConfigLabel.staff_viewer}
        ).at(0);

        staff_viewer_fdbk_config_panel.find('.advanced-settings-label').trigger('click');
        await component.$nextTick();

        component.d_ag_test_command.staff_viewer_fdbk_config.visible = true;
        component.d_ag_test_case.staff_viewer_fdbk_config.show_individual_commands = true;

        expect(component.d_ag_test_command.staff_viewer_fdbk_config.visible).toBe(true);
        expect(component.d_ag_test_case.staff_viewer_fdbk_config.show_individual_commands).toBe(
            true
        );

        staff_viewer_fdbk_config_panel.find("#student-lookup-visible").trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_command.staff_viewer_fdbk_config.visible).toBe(false);
        expect(component.d_ag_test_case.staff_viewer_fdbk_config.show_individual_commands).toBe(
            false
        );
    });

    test("update_config_settings - command visibility changed & case has more than one " +
         "command",
         async () => {
        let another_command = create_ag_command(2, "Another Command", 1);

        component.ag_test_case.ag_test_commands = [ag_test_command, another_command];
        await component.$nextTick();

        let staff_viewer_fdbk_config_panel = wrapper.findAll(
            {ref: FeedbackConfigLabel.staff_viewer}
        ).at(0);

        staff_viewer_fdbk_config_panel.find('.advanced-settings-label').trigger('click');
        await component.$nextTick();

        component.d_ag_test_command.staff_viewer_fdbk_config.visible = true;
        component.d_ag_test_case.staff_viewer_fdbk_config.show_individual_commands = true;

        expect(component.d_ag_test_command.staff_viewer_fdbk_config.visible).toBe(true);
        expect(component.d_ag_test_case.staff_viewer_fdbk_config.show_individual_commands).toBe(
            true
        );

        staff_viewer_fdbk_config_panel.find("#student-lookup-visible").trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_command.staff_viewer_fdbk_config.visible).toBe(false);
        expect(component.d_ag_test_case.staff_viewer_fdbk_config.show_individual_commands).toBe(
            true
        );
    });

    test("save d_ag_test_command settings - successful", async () => {
        let save_stub = sinon.stub(component.d_ag_test_command!, 'save');

        wrapper.find('.save-feedback-config-settings').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test("save d_ag_test_command settings - unsuccessful", async () => {
        let save_stub = sinon.stub(component.d_ag_test_command!, 'save');
        save_stub.returns(Promise.reject(
            new HttpError
            (
                400,
                {__all__: "Ag test command with this Name and Case already exists."}
            )
        ));

        wrapper.find('.save-feedback-config-settings').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
