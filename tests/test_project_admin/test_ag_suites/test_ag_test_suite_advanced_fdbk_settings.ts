import { config, mount, Wrapper } from '@vue/test-utils';

import { AGTestSuiteFeedbackConfig } from 'ag-client-typescript';

import AGTestSuiteAdvancedFdbkSettings from '@/components/project_admin/ag_suites/ag_test_suite_advanced_fdbk_settings.vue';

import { make_ag_test_suite_fdbk_config } from '@/tests/data_utils';
import { checkbox_is_checked } from '@/tests/utils';


describe('AGTestSuiteAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<AGTestSuiteAdvancedFdbkSettings>;
    let component: AGTestSuiteAdvancedFdbkSettings;
    let feedback_config: AGTestSuiteFeedbackConfig;

    beforeEach(() => {
        feedback_config = make_ag_test_suite_fdbk_config({
            show_setup_stdout: false,
            show_setup_stderr: true,
        });

        wrapper = mount(AGTestSuiteAdvancedFdbkSettings, {
            propsData: {
                config_name: "normal",
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

    test('visible binding', async () => {
        let visible_input = wrapper.find('#normal-suite-visible');

        visible_input.setChecked(true);
        expect(component.d_feedback_config!.visible).toEqual(true);

        visible_input.setChecked(false);
        expect(component.d_feedback_config!.visible).toEqual(false);

        visible_input.setChecked(true);
        expect(component.d_feedback_config!.visible).toEqual(true);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        component.d_feedback_config!.visible = false;
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        component.d_feedback_config!.visible = true;
        expect(checkbox_is_checked(visible_input)).toEqual(true);
    });

    test('show_individual_tests binding', async () => {
        wrapper.setData({d_is_open: true});

        let show_individual_tests_input = wrapper.find('#normal-show-individual-tests');

        show_individual_tests_input.setChecked(true);
        expect(component.d_feedback_config!.show_individual_tests).toEqual(true);

        show_individual_tests_input.setChecked(false);
        expect(component.d_feedback_config!.show_individual_tests).toEqual(false);

        show_individual_tests_input.setChecked(true);
        expect(component.d_feedback_config!.show_individual_tests).toEqual(true);

        expect(checkbox_is_checked(show_individual_tests_input)).toEqual(true);

        component.d_feedback_config!.show_individual_tests = false;
        expect(checkbox_is_checked(show_individual_tests_input)).toEqual(false);

        component.d_feedback_config!.show_individual_tests = true;
        expect(checkbox_is_checked(show_individual_tests_input)).toEqual(true);
    });

    test('Toggle show_setup_return_code', async () => {
        wrapper.setData({d_is_open: true});

        let show_setup_return_code_input = wrapper.find('#normal-show-setup-return-code');

        show_setup_return_code_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_return_code).toEqual(true);

        show_setup_return_code_input.setChecked(false);
        expect(component.d_feedback_config!.show_setup_return_code).toEqual(false);

        show_setup_return_code_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_return_code).toEqual(true);

        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(true);

        component.d_feedback_config!.show_setup_return_code = false;
        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(false);

        component.d_feedback_config!.show_setup_return_code = true;
        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(true);
    });

    test('Toggle show_setup_timed_out', async () => {
        wrapper.setData({d_is_open: true});

        let show_setup_timed_out_input = wrapper.find('#normal-show-setup-timed-out');

        show_setup_timed_out_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_timed_out).toEqual(true);

        show_setup_timed_out_input.setChecked(false);
        expect(component.d_feedback_config!.show_setup_timed_out).toEqual(false);

        show_setup_timed_out_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_timed_out).toEqual(true);

        expect(checkbox_is_checked(show_setup_timed_out_input)).toEqual(true);

        component.d_feedback_config!.show_setup_timed_out = false;
        expect(checkbox_is_checked(show_setup_timed_out_input)).toEqual(false);

        component.d_feedback_config!.show_setup_timed_out = true;
        expect(checkbox_is_checked(show_setup_timed_out_input)).toEqual(true);
    });

    test('Toggle show_setup_stdout', async () => {
        wrapper.setData({d_is_open: true});

        let show_setup_stdout_input = wrapper.find('#normal-show-setup-stdout');

        show_setup_stdout_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_stdout).toEqual(true);

        show_setup_stdout_input.setChecked(false);
        expect(component.d_feedback_config!.show_setup_stdout).toEqual(false);

        show_setup_stdout_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_stdout).toEqual(true);

        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(true);

        component.d_feedback_config!.show_setup_stdout = false;
        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(false);

        component.d_feedback_config!.show_setup_stdout = true;
        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(true);
    });

    test('Toggle show_setup_stderr', async () => {
        wrapper.setData({d_is_open: true});

        let show_setup_stderr_input = wrapper.find('#normal-show-setup-stderr');

        show_setup_stderr_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_stderr).toEqual(true);

        show_setup_stderr_input.setChecked(false);
        expect(component.d_feedback_config!.show_setup_stderr).toEqual(false);

        show_setup_stderr_input.setChecked(true);
        expect(component.d_feedback_config!.show_setup_stderr).toEqual(true);

        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(true);

        component.d_feedback_config!.show_setup_stderr = false;
        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(false);

        component.d_feedback_config!.show_setup_stderr = true;
        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(true);
    });

    test('value Watcher', async () => {
        expect(component.d_feedback_config!).toEqual(feedback_config);

        let new_val = make_ag_test_suite_fdbk_config({
            show_setup_stdout: !feedback_config.show_setup_stdout,
            show_setup_stderr: !feedback_config.show_setup_stderr,
        });
        wrapper.setProps({'value': new_val});
        await component.$nextTick();

        expect(component.d_feedback_config!).toEqual(new_val);
    });

    test('config_name Prop', async () => {
        expect(component.config_name).toEqual("normal");

        wrapper.setProps({'config_name': "past-limit"});
        await component.$nextTick();

        expect(component.config_name).toEqual("past-limit");
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
