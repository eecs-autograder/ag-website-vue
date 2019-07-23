import { config, mount, Wrapper } from '@vue/test-utils';

import { AGTestCommandFeedbackConfig, AGTestSuiteFeedbackConfig } from 'ag-client-typescript';

import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import {
    AGTestSuiteFeedbackPreset,
    FeedbackConfigLabel
} from '@/components/feedback_config/feedback_config/feedback_config_utils';
import { SafeMap } from '@/safe_map';

import {
    create_ag_command_feedback_config,
    create_ag_suite_feedback_config
} from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ConfigPanel tests', () => {
    let wrapper: Wrapper<ConfigPanel>;
    let component: ConfigPanel;
    let ag_test_suite_normal_feedback_config: AGTestSuiteFeedbackConfig;
    let ag_test_suite_default_config: AGTestSuiteFeedbackConfig;
    let ag_test_suite_fdbk_presets: SafeMap<string, AGTestSuiteFeedbackPreset>;
    let get_current_preset_fn:
        (config_being_viewed: AGTestSuiteFeedbackConfig,
         preset_options: SafeMap<string, AGTestSuiteFeedbackPreset>) => string;

    beforeEach(() => {
        ag_test_suite_normal_feedback_config = create_ag_suite_feedback_config();
        ag_test_suite_default_config = create_ag_suite_feedback_config();
        ag_test_suite_fdbk_presets = new SafeMap<string, AGTestSuiteFeedbackPreset>([
            [
                'Public Setup',
                {
                    show_individual_tests: true,
                    show_setup_return_code: true,
                    show_setup_timed_out: true,
                    show_setup_stdout: true,
                    show_setup_stderr: true
                }
            ],
            [
                'Pass/Fail Setup',
                {
                    show_individual_tests: true,
                    show_setup_return_code: true,
                    show_setup_timed_out: true,
                    show_setup_stdout: false,
                    show_setup_stderr: false
                }
            ],
            [
                'Private Setup',
                {
                    show_individual_tests: true,
                    show_setup_return_code: false,
                    show_setup_timed_out: false,
                    show_setup_stdout: false,
                    show_setup_stderr: false
                }
            ]
        ]);

        get_current_preset_fn = function(
            current_config: AGTestSuiteFeedbackConfig,
            preset_options: SafeMap<string, AGTestSuiteFeedbackPreset>) {
            for (let [preset_label, potential_match] of preset_options) {
                if ((potential_match.show_individual_tests ===
                     current_config.show_individual_tests) &&
                    (potential_match.show_setup_return_code ===
                     current_config.show_setup_return_code) &&
                    (potential_match.show_setup_timed_out ===
                     current_config.show_setup_timed_out) &&
                    (potential_match.show_setup_stdout ===
                     current_config.show_setup_stdout) &&
                    (potential_match.show_setup_stderr ===
                     current_config.show_setup_stderr)) {
                    return preset_label;
                }
            }
            return "Custom";
        };
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('created with value = null', () => {
        wrapper = mount(ConfigPanel, {
            propsData: {
                config_name: FeedbackConfigLabel.normal,
                get_preset_fn: get_current_preset_fn,
                preset_options: ag_test_suite_fdbk_presets,
                value: null
            }
        });
        component = wrapper.vm;

        expect(component.d_configuration).toBe(null);
        expect(component.preset_selected).toEqual("Custom");
    });

    test('preset_selected binding', async () => {
        wrapper = mount(ConfigPanel, {
            propsData: {
                config_name: FeedbackConfigLabel.normal,
                get_preset_fn: get_current_preset_fn,
                preset_options: ag_test_suite_fdbk_presets,
                value: ag_test_suite_normal_feedback_config
            }
        });
        component = wrapper.vm;

        expect(component.preset_names.length).toEqual(3);
        expect(component.preset_names).toEqual([
            'Public Setup',
            'Pass/Fail Setup',
            'Private Setup'
        ]);
        let config_preset_select_input = wrapper.find('#config-preset-select');

        config_preset_select_input.setValue(component.preset_names[0]);
        await component.$nextTick();

        expect(component.preset_selected).toEqual(component.preset_names[0]);

        config_preset_select_input.setValue(component.preset_names[1]);
        await component.$nextTick();

        expect(component.preset_selected).toEqual(component.preset_names[1]);

        config_preset_select_input.setValue(component.preset_names[2]);
        await component.$nextTick();

        expect(component.preset_selected).toEqual(component.preset_names[2]);
    });

    test.only("apply_preset", async () => {
        wrapper = mount(ConfigPanel, {
            propsData: {
                config_name: FeedbackConfigLabel.normal,
                get_preset_fn: get_current_preset_fn,
                preset_options: ag_test_suite_fdbk_presets,
                value: ag_test_suite_normal_feedback_config
            }
        });
        component = wrapper.vm;

        expect(component.preset_names.length).toEqual(3);
        expect(component.preset_names).toEqual([
            'Public Setup',
            'Pass/Fail Setup',
            'Private Setup'
        ]);

        let config_preset_select_input = wrapper.find('#config-preset-select');

        config_preset_select_input.setValue(component.preset_names[2]);
        expect(component.get_preset_fn(
            component.d_configuration, component.preset_options
        )).toEqual("Private Setup");

        config_preset_select_input.setValue(component.preset_names[1]);
        expect(component.get_preset_fn(
            component.d_configuration, component.preset_options
        )).toEqual("Pass/Fail Setup");

        config_preset_select_input.setValue(component.preset_names[0]);
        expect(component.get_preset_fn(
            component.d_configuration, component.preset_options
        )).toEqual("Public Setup");
    });

    test('Value prop changed to a configuration that is not null', async () => {
        let public_setup_fdbk_config = JSON.parse(JSON.stringify(
            ag_test_suite_fdbk_presets.get("Public Setup")
        ));

        let pass_fail_setup_fdbk_config = JSON.parse(JSON.stringify(
            ag_test_suite_fdbk_presets.get("Pass/Fail Setup")
        ));

        let private_setup_fdbk_config = JSON.parse(JSON.stringify(
            ag_test_suite_fdbk_presets.get("Private Setup")
        ));

        wrapper = mount(ConfigPanel, {
            propsData: {
                config_name: FeedbackConfigLabel.normal,
                get_preset_fn: get_current_preset_fn,
                preset_options: ag_test_suite_fdbk_presets,
                value: public_setup_fdbk_config
            }
        });
        component = wrapper.vm;

        expect(component.d_configuration).toEqual(public_setup_fdbk_config);
        expect(component.preset_selected).toEqual("Public Setup");

        wrapper.setProps({value: ag_test_suite_default_config});
        await component.$nextTick();

        expect(component.d_configuration).toEqual(ag_test_suite_default_config);
        expect(component.preset_selected).toEqual("Custom");

        wrapper.setProps({value: pass_fail_setup_fdbk_config});
        await component.$nextTick();

        expect(component.d_configuration).toEqual(pass_fail_setup_fdbk_config);
        expect(component.preset_selected).toEqual("Pass/Fail Setup");

        wrapper.setProps({value: private_setup_fdbk_config});
        await component.$nextTick();

        expect(component.d_configuration).toEqual(private_setup_fdbk_config);
        expect(component.preset_selected).toEqual("Private Setup");
    });

    test('Value prop changed to a configuration that is null', async () => {
        wrapper = mount(ConfigPanel, {
            propsData: {
                config_name: FeedbackConfigLabel.normal,
                get_preset_fn: get_current_preset_fn,
                preset_options: ag_test_suite_fdbk_presets,
                value: ag_test_suite_normal_feedback_config
            }
        });
        component = wrapper.vm;

        expect(component.d_configuration).toEqual(ag_test_suite_normal_feedback_config);
        expect(wrapper.findAll('#config-preset-select').length).toEqual(1);

        wrapper.setProps({value: null});
        await component.$nextTick();

        expect(component.d_configuration).toEqual(null);
        expect(wrapper.findAll('#config-preset-select').length).toEqual(0);
    });
});
