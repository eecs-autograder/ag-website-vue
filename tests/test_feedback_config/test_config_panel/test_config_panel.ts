import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import { SafeMap } from '@/safe_map';

import { create_ag_suite_feedback_config } from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

interface AGTestSuiteFeedbackPreset {
    show_individual_tests: boolean;
    show_setup_return_code: boolean;
    show_setup_timed_out: boolean;
    show_setup_stdout: boolean;
    show_setup_stderr: boolean;
}

describe('ConfigPanel tests', () => {
    let wrapper: Wrapper<ConfigPanel>;
    let component: ConfigPanel;
    let ag_test_suite_normal_feedback_config: AGTestSuiteFeedbackConfig;
    let ag_test_suite_default_config: AGTestSuiteFeedbackConfig;
    let ag_test_suite_fdbk_presets: SafeMap<string, AGTestSuiteFeedbackPreset>;

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

        function get_current_preset_fn(current_config: AGTestSuiteFeedbackConfig,
                                       preset_options: SafeMap<string,
                                           AGTestSuiteFeedbackPreset>) {
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
            return null;
        }

        wrapper = mount(ConfigPanel, {
            propsData: {
                value: ag_test_suite_normal_feedback_config,
                config_name: "Normal",
                get_preset_fn: get_current_preset_fn,
                preset_options: ag_test_suite_fdbk_presets
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Toggle visible', async () => {
        expect(true).toBe(true);
    });
});
