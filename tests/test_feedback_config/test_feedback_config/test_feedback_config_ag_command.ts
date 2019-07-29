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
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import EditFeedbackSettingsAGCommand from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_ag_command.vue';
import FeedbackConfigAGCommand from '@/components/feedback_config/feedback_config/feedback_config_ag_command.vue';
import { safe_assign } from '@/utils';

import {
    create_ag_case,
    create_ag_command,
    create_ag_command_feedback_config
} from '@/tests/data_utils';

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
        let first_failure_config = wrapper.find({ref: 'first_failure'});
        let first_failure_config_component = <ConfigPanel> first_failure_config.vm;

        safe_assign(
            component.d_ag_test_command!.first_failed_test_normal_fdbk_config!,
            component.fdbk_presets.get("Pass/Fail + Exit Status")
        );
        await component.$nextTick();

        expect(component.d_ag_test_command!.first_failed_test_normal_fdbk_config).not.toBeNull();
        expect(first_failure_config_component.selected_preset_name).toEqual(
            "Pass/Fail + Exit Status");
        expect(first_failure_config.findAll('.setting-selection-container').length).toEqual(1);
        expect(first_failure_config.findAll('.advanced-settings-label').length).toEqual(1);
        expect(component.first_failed_config_is_enabled).toBe(true);

        let first_failure_config_is_enabled_input = wrapper.find('#first-failure-config-enabled');
        first_failure_config_is_enabled_input.setChecked(false);

        expect(component.d_ag_test_command!.first_failed_test_normal_fdbk_config).toBeNull();
        expect(first_failure_config.findAll('setting-selection-container').length).toEqual(0);
        expect(first_failure_config.findAll('.advanced-settings-label').length).toEqual(0);
        expect(component.first_failed_config_is_enabled).toBe(false);

        first_failure_config_is_enabled_input.setChecked(true);

        expect(component.d_ag_test_command!.first_failed_test_normal_fdbk_config).not.toBeNull();
        expect(first_failure_config_component.selected_preset_name).toEqual("Public");
        expect(first_failure_config.findAll('.setting-selection-container').length).toEqual(1);
        expect(first_failure_config.findAll('.advanced-settings-label').length).toEqual(1);
        expect(component.first_failed_config_is_enabled).toBe(true);
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

        let ag_test_command_config: AGTestCommandFeedbackConfig | null
            = create_ag_command_feedback_config();
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Custom");

        safe_assign(ag_test_command_config!, pass_fail_plus_output);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Output");

        safe_assign(ag_test_command_config!, pass_fail_plus_diff_preset);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Diff");

        safe_assign(ag_test_command_config!, pass_fail_plus_exit_status_preset);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail + Exit Status");

        safe_assign(ag_test_command_config!, pass_fail_preset);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Pass/Fail");

        safe_assign(ag_test_command_config!, private_preset);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Private");

        safe_assign(ag_test_command_config!, public_preset);
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Public");

        ag_test_command_config = null;
        expect(component.get_current_preset_fn(
            ag_test_command_config, component.fdbk_presets
        )).toEqual("Custom");
    });

    test("apply_preset called from config_panel - updates EditFeedbackSettings", async () => {
        expect(component.get_current_preset_fn(
            component.d_ag_test_command!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");

        let staff_viewer_config_panel = wrapper.find({ref: 'student_lookup'});
        staff_viewer_config_panel.find('.advanced-settings-label').trigger('click');

        let staff_viewer_edit_settings = <EditFeedbackSettingsAGCommand> wrapper.find({ref:
            'student_lookup_edit_feedback_settings'
        }).vm;

        staff_viewer_config_panel.find('#config-preset-select').setValue("Public");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_command!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Public");
        expect(component.get_current_preset_fn(
            staff_viewer_edit_settings.d_ag_test_command_settings,
            component.fdbk_presets
        )).toEqual("Public");

        staff_viewer_config_panel.find('#config-preset-select').setValue("Pass/Fail + Output");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_command!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Pass/Fail + Output");
        expect(component.get_current_preset_fn(
            staff_viewer_edit_settings.d_ag_test_command_settings,
            component.fdbk_presets
        )).toEqual("Pass/Fail + Output");

        staff_viewer_config_panel.find('#config-preset-select').setValue("Pass/Fail + Diff");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_command!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Pass/Fail + Diff");
        expect(component.get_current_preset_fn(
            staff_viewer_edit_settings.d_ag_test_command_settings,
            component.fdbk_presets
        )).toEqual("Pass/Fail + Diff");

        staff_viewer_config_panel.find('#config-preset-select').setValue(
            "Pass/Fail + Exit Status"
        );
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_command!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Pass/Fail + Exit Status");
        expect(component.get_current_preset_fn(
            staff_viewer_edit_settings.d_ag_test_command_settings,
            component.fdbk_presets
        )).toEqual("Pass/Fail + Exit Status");

        staff_viewer_config_panel.find('#config-preset-select').setValue("Pass/Fail");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_command!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Pass/Fail");
        expect(component.get_current_preset_fn(
            staff_viewer_edit_settings.d_ag_test_command_settings,
            component.fdbk_presets
        )).toEqual("Pass/Fail");

        staff_viewer_config_panel.find('#config-preset-select').setValue("Private");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_command!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Private");
        expect(component.get_current_preset_fn(
            staff_viewer_edit_settings.d_ag_test_command_settings,
            component.fdbk_presets
        )).toEqual("Private");
    });

    test("update config settings in edit_feedback_settings_ag_command - changes reflected " +
         "in selected_preset_name in config_panel",
         async () => {
        let past_limit_config_panel = wrapper.find({ref: 'past_limit'});
        let past_limit_config_panel_component = <ConfigPanel>  past_limit_config_panel.vm;

        expect(past_limit_config_panel_component.selected_preset_name).toEqual("Custom");

        past_limit_config_panel.find('.advanced-settings-label').trigger('click');
        await component.$nextTick();

        wrapper.find('#past-limit-show-points').setChecked(true);
        expect(past_limit_config_panel_component.selected_preset_name).toEqual("Pass/Fail");

        wrapper.find('#past-limit-return-code-fdbk-level').setValue(
            ValueFeedbackLevel.no_feedback
        );
        expect(past_limit_config_panel_component.selected_preset_name).toEqual("Custom");

        wrapper.find('#past-limit-stdout-fdbk-level').setValue(ValueFeedbackLevel.no_feedback);
        expect(past_limit_config_panel_component.selected_preset_name).toEqual("Custom");


        wrapper.find('#past-limit-stderr-fdbk-level').setValue(ValueFeedbackLevel.no_feedback);
        expect(past_limit_config_panel_component.selected_preset_name).toEqual("Custom");

        wrapper.find('#past-limit-show-points').setChecked(false);
        expect(past_limit_config_panel_component.selected_preset_name).toEqual("Private");
    });

    test("checkboxes in config panels do not react to changes in other panels", async () => {
        expect(component.d_ag_test_command!.normal_fdbk_config.show_actual_stdout).toBe(false);
        expect(
            component.d_ag_test_command!.first_failed_test_normal_fdbk_config!.show_actual_stdout
        ).toBe(false);
        expect(
            component.d_ag_test_command!.ultimate_submission_fdbk_config.show_actual_stdout
        ).toBe(false);
        expect(
            component.d_ag_test_command!.past_limit_submission_fdbk_config.show_actual_stdout
        ).toBe(false);
        expect(
            component.d_ag_test_command!.staff_viewer_fdbk_config.show_actual_stdout
        ).toBe(false);

        wrapper.findAll('.advanced-settings-label').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(1).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(2).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(3).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(4).trigger('click');
        await component.$nextTick();

        wrapper.find('#first-failure-show-actual-stdout').setChecked(true);

        expect(component.d_ag_test_command!.normal_fdbk_config.show_actual_stdout).toBe(false);
        expect(
            component.d_ag_test_command!.first_failed_test_normal_fdbk_config!.show_actual_stdout
        ).toBe(true);
        expect(
            component.d_ag_test_command!.ultimate_submission_fdbk_config.show_actual_stdout
        ).toBe(false);
        expect(
            component.d_ag_test_command!.past_limit_submission_fdbk_config.show_actual_stdout
        ).toBe(false);
        expect(
            component.d_ag_test_command!.staff_viewer_fdbk_config.show_actual_stdout
        ).toBe(false);
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

    test('ag_test_command Watcher', async () => {
        expect(component.d_ag_test_command).toEqual(ag_test_command);

        let another_command = create_ag_command(2, "Command 2", 1);

        wrapper.setProps({ag_test_command: another_command});
        await component.$nextTick();

        expect(component.d_ag_test_command).toEqual(another_command);
    });
});
