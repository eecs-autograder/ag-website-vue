import { mount, Wrapper } from '@vue/test-utils';

import { AGTestSuiteFeedbackConfig } from 'ag-client-typescript';

import AGTestSuiteAdvancedFdbkSettings from '@/components/project_admin/ag_tests/ag_test_suite_advanced_fdbk_settings.vue';

import { make_ag_test_suite_fdbk_config } from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked } from '@/tests/utils';


describe('AGTestSuiteAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<AGTestSuiteAdvancedFdbkSettings>;
    let feedback_config: AGTestSuiteFeedbackConfig;

    beforeEach(() => {
        feedback_config = make_ag_test_suite_fdbk_config({
            show_setup_stdout: false,
            show_setup_stderr: true,
        });

        wrapper = managed_mount(AGTestSuiteAdvancedFdbkSettings, {
            propsData: {
                value: feedback_config
            }
        });
    });

    test('visible binding', async () => {
        let visible_input = wrapper.find('[data-testid=suite_is_visible]');

        await visible_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);

        await visible_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(false);

        await visible_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        wrapper.vm.d_feedback_config!.visible = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        wrapper.vm.d_feedback_config!.visible = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(visible_input)).toEqual(true);
    });

    test('show_individual_tests binding', async () => {
        await wrapper.setData({d_is_open: true});

        let show_individual_tests_input = wrapper.find('[data-testid=show_individual_tests]');

        show_individual_tests_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_individual_tests).toEqual(true);

        show_individual_tests_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_individual_tests).toEqual(false);

        await show_individual_tests_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_individual_tests).toEqual(true);

        expect(checkbox_is_checked(show_individual_tests_input)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_individual_tests = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_individual_tests_input)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_individual_tests = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_individual_tests_input)).toEqual(true);
    });

    test('Toggle show_setup_return_code', async () => {
        wrapper.setData({d_is_open: true});
        await wrapper.vm.$nextTick();

        let show_setup_return_code_input = wrapper.find('[data-testid=show_setup_return_code]');

        await show_setup_return_code_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(true);

        await show_setup_return_code_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(false);

        await show_setup_return_code_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(true);

        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_setup_return_code = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_setup_return_code = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(true);
    });

    test('Toggle show_setup_timed_out', async () => {
        wrapper.setData({d_is_open: true});
        await wrapper.vm.$nextTick();

        let show_setup_timed_out_input = wrapper.find('[data-testid=show_setup_timed_out]');

        show_setup_timed_out_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_timed_out).toEqual(true);

        show_setup_timed_out_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_timed_out).toEqual(false);

        show_setup_timed_out_input.setChecked(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_feedback_config!.show_setup_timed_out).toEqual(true);

        expect(checkbox_is_checked(show_setup_timed_out_input)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_setup_timed_out = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_timed_out_input)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_setup_timed_out = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_timed_out_input)).toEqual(true);
    });

    test('Toggle show_setup_stdout', async () => {
        wrapper.setData({d_is_open: true});
        await wrapper.vm.$nextTick();

        let show_setup_stdout_input = wrapper.find('[data-testid=show_setup_stdout]');

        show_setup_stdout_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(true);

        show_setup_stdout_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(false);

        show_setup_stdout_input.setChecked(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(true);
        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_setup_stdout = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_setup_stdout = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(true);
    });

    test('Toggle show_setup_stderr', async () => {
        wrapper.setData({d_is_open: true});
        await wrapper.vm.$nextTick();

        let show_setup_stderr_input = wrapper.find('[data-testid=show_setup_stderr]');

        show_setup_stderr_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(true);

        show_setup_stderr_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(false);

        show_setup_stderr_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(true);

        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_setup_stderr = false;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_setup_stderr = true;
        await wrapper.vm.$nextTick();
        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(true);
    });

    test('value Watcher', async () => {
        expect(wrapper.vm.d_feedback_config!).toEqual(feedback_config);

        let new_val = make_ag_test_suite_fdbk_config({
            show_setup_stdout: !feedback_config.show_setup_stdout,
            show_setup_stderr: !feedback_config.show_setup_stderr,
        });
        wrapper.setProps({'value': new_val});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_feedback_config!).toEqual(new_val);
    });

    test('toggle_is_open', async () => {
        expect(wrapper.vm.d_is_open).toBe(false);

        wrapper.vm.toggle_is_open();
        expect(wrapper.vm.d_is_open).toBe(true);

        wrapper.vm.toggle_is_open();
        expect(wrapper.vm.d_is_open).toBe(false);

        wrapper.find('.advanced-settings-label').trigger('click');
        expect(wrapper.vm.d_is_open).toBe(true);

        wrapper.find('.advanced-settings-label').trigger('click');
        expect(wrapper.vm.d_is_open).toBe(false);
    });
});
