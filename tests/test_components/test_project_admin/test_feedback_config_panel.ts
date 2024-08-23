import { mount, Wrapper } from '@vue/test-utils';

import { AGTestSuiteFeedbackConfig } from 'ag-client-typescript';

import FeedbackConfigPanel from '@/components/project_admin/feedback_config_panel/feedback_config_panel.vue';
import {
    AGTestSuiteFeedbackPreset,
} from '@/components/project_admin/feedback_config_panel/feedback_config_utils';
import { SafeMap } from '@/safe_map';

import {
    make_ag_test_suite_fdbk_config
} from '@/tests/data_utils';
import { emitted } from '@/tests/utils';


describe('FeedbackConfigPanel tests', () => {
    let wrapper: Wrapper<FeedbackConfigPanel>;
    let ag_test_suite_normal_feedback_config: AGTestSuiteFeedbackConfig;
    let ag_test_suite_default_config: AGTestSuiteFeedbackConfig;
    let ag_test_suite_fdbk_presets: SafeMap<string, AGTestSuiteFeedbackPreset>;

    beforeEach(() => {
        ag_test_suite_normal_feedback_config = make_ag_test_suite_fdbk_config();
        ag_test_suite_default_config = make_ag_test_suite_fdbk_config();
        ag_test_suite_fdbk_presets = new SafeMap<string, AGTestSuiteFeedbackPreset>([
            [
                'Public Setup',
                {
                    show_individual_tests: true,
                    show_setup_return_code: true,
                    show_setup_timed_out: true,
                    show_setup_stdout: true,
                    show_setup_stderr: true,
                    show_student_description: true,
                }
            ],
            [
                'Pass/Fail Setup',
                {
                    show_individual_tests: true,
                    show_setup_return_code: true,
                    show_setup_timed_out: true,
                    show_setup_stdout: false,
                    show_setup_stderr: false,
                    show_student_description: true,
                }
            ],
            [
                'Private Setup',
                {
                    show_individual_tests: true,
                    show_setup_return_code: false,
                    show_setup_timed_out: false,
                    show_setup_stdout: false,
                    show_setup_stderr: false,
                    show_student_description: false,
                }
            ]
        ]);
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('created with value = null', () => {
        wrapper = mount(FeedbackConfigPanel, {
            propsData: {
                preset_options: ag_test_suite_fdbk_presets,
                value: null
            }
        });

        expect(wrapper.vm.d_configuration).toBe(null);
        expect(wrapper.vm.selected_preset_name).toEqual("Custom");
    });

    test('selected_preset_name binding', async () => {
        wrapper = mount(FeedbackConfigPanel, {
            propsData: {
                preset_options: ag_test_suite_fdbk_presets,
                value: ag_test_suite_normal_feedback_config
            }
        });

        expect(wrapper.vm.preset_names.length).toEqual(3);
        expect(wrapper.vm.preset_names).toEqual([
            'Public Setup',
            'Pass/Fail Setup',
            'Private Setup'
        ]);
        let config_preset_select_input = wrapper.find('.select');

        config_preset_select_input.setValue(wrapper.vm.preset_names[0]);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.selected_preset_name).toEqual(wrapper.vm.preset_names[0]);

        config_preset_select_input.setValue(wrapper.vm.preset_names[1]);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.selected_preset_name).toEqual(wrapper.vm.preset_names[1]);

        config_preset_select_input.setValue(wrapper.vm.preset_names[2]);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.selected_preset_name).toEqual(wrapper.vm.preset_names[2]);
    });

    test("Change preset", async () => {
        wrapper = mount(FeedbackConfigPanel, {
            propsData: {
                preset_options: ag_test_suite_fdbk_presets,
                value: ag_test_suite_normal_feedback_config
            }
        });

        expect(wrapper.vm.preset_names.length).toEqual(3);
        expect(wrapper.vm.preset_names).toEqual([
            'Public Setup',
            'Pass/Fail Setup',
            'Private Setup'
        ]);

        let config_preset_select_input = wrapper.find('.select');

        config_preset_select_input.setValue(wrapper.vm.preset_names[2]);
        expect(
            config_is_preset(emitted(wrapper, 'input')[0][0],
                             ag_test_suite_fdbk_presets.get(wrapper.vm.preset_names[2]))
        ).toEqual(true);

        config_preset_select_input.setValue(wrapper.vm.preset_names[1]);
        expect(
            config_is_preset(emitted(wrapper, 'input')[1][0],
                             ag_test_suite_fdbk_presets.get(wrapper.vm.preset_names[1]))
        ).toEqual(true);

        config_preset_select_input.setValue(wrapper.vm.preset_names[0]);
        expect(
            config_is_preset(emitted(wrapper, 'input')[2][0],
                             ag_test_suite_fdbk_presets.get(wrapper.vm.preset_names[0]))
        ).toEqual(true);
    });

    function config_is_preset(fdbk_config: object, preset: object) {
        for (let key of Object.keys(preset)) {
            if (key === 'visible') {
                fail('Feedback presets should not modify visibility');
            }
            // @ts-ignore
            if (fdbk_config[key] !== preset[key]) {
                return false;
            }
        }
        return true;
    }

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

        wrapper = mount(FeedbackConfigPanel, {
            propsData: {
                preset_options: ag_test_suite_fdbk_presets,
                value: public_setup_fdbk_config
            }
        });

        expect(wrapper.vm.d_configuration).toEqual(public_setup_fdbk_config);
        expect(wrapper.vm.selected_preset_name).toEqual("Public Setup");

        wrapper.setProps({value: ag_test_suite_default_config});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_configuration).toEqual(ag_test_suite_default_config);
        expect(wrapper.vm.selected_preset_name).toEqual("Custom");

        wrapper.setProps({value: pass_fail_setup_fdbk_config});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_configuration).toEqual(pass_fail_setup_fdbk_config);
        expect(wrapper.vm.selected_preset_name).toEqual("Pass/Fail Setup");

        wrapper.setProps({value: private_setup_fdbk_config});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_configuration).toEqual(private_setup_fdbk_config);
        expect(wrapper.vm.selected_preset_name).toEqual("Private Setup");
    });

    test('Preset selector hidden when input value is null', async () => {
        wrapper = mount(FeedbackConfigPanel, {
            propsData: {
                preset_options: ag_test_suite_fdbk_presets,
                value: ag_test_suite_normal_feedback_config
            }
        });

        expect(wrapper.vm.d_configuration).toEqual(ag_test_suite_normal_feedback_config);
        expect(wrapper.find('[data-testid=preset_selection]').isVisible()).toBe(true);

        wrapper.setProps({value: null});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_configuration).toEqual(null);
        expect(wrapper.find('[data-testid=preset_selection]').isVisible()).toBe(false);
    });

    test('Presets not provided, no preset dropdown', async () => {
        wrapper = mount(FeedbackConfigPanel, {
            propsData: {
                value: ag_test_suite_normal_feedback_config
            }
        });

        expect(wrapper.find('[data-testid=preset_selection]').isVisible()).toBe(false);
    });
});
