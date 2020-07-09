import { mount, Wrapper } from '@vue/test-utils';

import {
    BugsExposedFeedbackLevel,
    MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import MutationTestSuiteAdvancedFdbkSettings from '@/components/project_admin/mutation_suites/mutation_test_suite_advanced_fdbk_settings.vue';

import { make_mutation_test_suite_fdbk_config } from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, emitted, set_data, set_props } from '@/tests/utils';


describe('MutationTestSuiteAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<MutationTestSuiteAdvancedFdbkSettings>;
    let feedback_config: MutationTestSuiteFeedbackConfig;

    beforeEach(() => {
        feedback_config = make_mutation_test_suite_fdbk_config();

        wrapper = managed_mount(MutationTestSuiteAdvancedFdbkSettings, {
            propsData: {
                config_name: "normal",
                value: feedback_config
            }
        });
    });

    test('visible binding', async () => {
        let visible_input = wrapper.find('[data-testid=mutation_suite_is_visible]');

        await visible_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);

        await visible_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(false);

        await visible_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {visible: false}});
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {visible: true}});
        expect(checkbox_is_checked(visible_input)).toEqual(true);
    });

    test('bugs_exposed_fdbk_level binding', async () => {
        await set_data(wrapper, {d_is_open: true});

        let bugs_exposed_fdbk_level_input = wrapper.get('[data-testid=bugs_exposed_fdbk_level]');

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.no_feedback);
        expect(wrapper.vm.d_feedback_config!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.no_feedback
        );

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.num_bugs_exposed);
        expect(wrapper.vm.d_feedback_config!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.num_bugs_exposed
        );

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.exposed_bug_names);
        expect(wrapper.vm.d_feedback_config!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.exposed_bug_names
        );

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.all_bug_names);
        expect(wrapper.vm.d_feedback_config!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.all_bug_names
        );
    });

    test('Toggle show_invalid_test_names', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_invalid_test_names = wrapper.find('[data-testid=show_invalid_test_names]');

        await show_invalid_test_names.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_invalid_test_names).toEqual(true);
        expect(emitted(wrapper, 'input').length).toEqual(1);

        await show_invalid_test_names.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_invalid_test_names).toEqual(false);

        await show_invalid_test_names.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_invalid_test_names).toEqual(true);

        expect(checkbox_is_checked(show_invalid_test_names)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_invalid_test_names: false}});
        expect(checkbox_is_checked(show_invalid_test_names)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_invalid_test_names: true}});
        expect(checkbox_is_checked(show_invalid_test_names)).toEqual(true);
    });

    test('Toggle show_points', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_points = wrapper.find('[data-testid=show_points]');

        await show_points.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(true);

        await show_points.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(false);

        await show_points.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(true);

        expect(checkbox_is_checked(show_points)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_points: false}});
        expect(checkbox_is_checked(show_points)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_points: true}});
        expect(checkbox_is_checked(show_points)).toEqual(true);
    });

    test('Toggle show_setup_return_code', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_setup_return_code = wrapper.find('[data-testid=show_setup_return_code]');

        await show_setup_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(true);

        await show_setup_return_code.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(false);

        await show_setup_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(true);

        expect(checkbox_is_checked(show_setup_return_code)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_setup_return_code: false}});
        expect(checkbox_is_checked(show_setup_return_code)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_setup_return_code: true}});
        expect(checkbox_is_checked(show_setup_return_code)).toEqual(true);
    });

    test('Toggle show_setup_stdout', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_setup_stdout = wrapper.find('[data-testid=show_setup_stdout]');

        await show_setup_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(true);

        await show_setup_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(false);

        await show_setup_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(true);

        expect(checkbox_is_checked(show_setup_stdout)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_setup_stdout: false}});
        expect(checkbox_is_checked(show_setup_stdout)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_setup_stdout: true}});
        expect(checkbox_is_checked(show_setup_stdout)).toEqual(true);
    });

    test('Toggle show_setup_stderr', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_setup_stderr = wrapper.find('[data-testid=show_setup_stderr]');

        await show_setup_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(true);

        await show_setup_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(false);

        await show_setup_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(true);

        expect(checkbox_is_checked(show_setup_stderr)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_setup_stderr: false}});
        expect(checkbox_is_checked(show_setup_stderr)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_setup_stderr: true}});
        expect(checkbox_is_checked(show_setup_stderr)).toEqual(true);
    });

    test('Toggle show_get_test_names_return_code', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_get_test_names_return_code = wrapper.get(
            '[data-testid=show_test_name_discovery_return_code]'
        );

        await show_get_test_names_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_return_code).toEqual(true);

        await show_get_test_names_return_code.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_return_code).toEqual(false);

        await show_get_test_names_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_return_code).toEqual(true);

        expect(checkbox_is_checked(show_get_test_names_return_code)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_get_test_names_return_code: false}});
        expect(checkbox_is_checked(show_get_test_names_return_code)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_get_test_names_return_code: true}});
        expect(checkbox_is_checked(show_get_test_names_return_code)).toEqual(true);
    });

    test('Toggle show_get_test_names_stdout', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_get_test_names_stdout = wrapper.find(
            '[data-testid=show_test_name_discovery_stdout]');

        await show_get_test_names_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stdout).toEqual(true);

        await show_get_test_names_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stdout).toEqual(false);

        await show_get_test_names_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stdout).toEqual(true);

        expect(checkbox_is_checked(show_get_test_names_stdout)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_get_test_names_stdout: false}});
        expect(checkbox_is_checked(show_get_test_names_stdout)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_get_test_names_stdout: true}});
        expect(checkbox_is_checked(show_get_test_names_stdout)).toEqual(true);
    });

    test('Toggle show_get_test_names_stderr', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_get_test_names_stderr = wrapper.find(
            '[data-testid=show_test_name_discovery_stderr]');

        await show_get_test_names_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stderr).toEqual(true);

        await show_get_test_names_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stderr).toEqual(false);

        await show_get_test_names_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stderr).toEqual(true);

        expect(checkbox_is_checked(show_get_test_names_stderr)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_get_test_names_stderr: false}});
        expect(checkbox_is_checked(show_get_test_names_stderr)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_get_test_names_stderr: true}});
        expect(checkbox_is_checked(show_get_test_names_stderr)).toEqual(true);
    });

    test('Toggle show_validity_check_stdout', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_validity_check_stdout = wrapper.find('[data-testid=show_validity_check_stdout]');

        await show_validity_check_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stdout).toEqual(true);

        await show_validity_check_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stdout).toEqual(false);

        await show_validity_check_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stdout).toEqual(true);

        expect(checkbox_is_checked(show_validity_check_stdout)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_validity_check_stdout: false}});
        expect(checkbox_is_checked(show_validity_check_stdout)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_validity_check_stdout: true}});
        expect(checkbox_is_checked(show_validity_check_stdout)).toEqual(true);
    });

    test('Toggle show_validity_check_stderr', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_validity_check_stderr = wrapper.find('[data-testid=show_validity_check_stderr]');

        await show_validity_check_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stderr).toEqual(true);

        await show_validity_check_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stderr).toEqual(false);

        await show_validity_check_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stderr).toEqual(true);

        expect(checkbox_is_checked(show_validity_check_stderr)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_validity_check_stderr: false}});
        expect(checkbox_is_checked(show_validity_check_stderr)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_validity_check_stderr: true}});
        expect(checkbox_is_checked(show_validity_check_stderr)).toEqual(true);
    });

    test('Toggle show_grade_buggy_impls_stdout', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_grade_buggy_impls_stdout = wrapper.find(
            '[data-testid=show_grade_buggy_impls_stdout]');

        await show_grade_buggy_impls_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout).toEqual(true);

        await show_grade_buggy_impls_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout).toEqual(false);

        await show_grade_buggy_impls_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout).toEqual(true);

        expect(checkbox_is_checked(show_grade_buggy_impls_stdout)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_grade_buggy_impls_stdout: false}});
        expect(checkbox_is_checked(show_grade_buggy_impls_stdout)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_grade_buggy_impls_stdout: true}});
        expect(checkbox_is_checked(show_grade_buggy_impls_stdout)).toEqual(true);
    });

    test('Toggle show_grade_buggy_impls_stderr', async () => {
        await set_data(wrapper, {d_is_open: true});

        let show_grade_buggy_impls_stderr = wrapper.find(
            '[data-testid=show_grade_buggy_impls_stderr]');

        await show_grade_buggy_impls_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr).toEqual(true);

        await show_grade_buggy_impls_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr).toEqual(false);

        await show_grade_buggy_impls_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr).toEqual(true);

        expect(checkbox_is_checked(show_grade_buggy_impls_stderr)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_grade_buggy_impls_stderr: false}});
        expect(checkbox_is_checked(show_grade_buggy_impls_stderr)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_grade_buggy_impls_stderr: true}});
        expect(checkbox_is_checked(show_grade_buggy_impls_stderr)).toEqual(true);
    });

    test('value Watcher', async () => {
        expect(wrapper.vm.d_feedback_config!).toEqual(feedback_config);

        let new_val = make_mutation_test_suite_fdbk_config({
            show_grade_buggy_impls_stderr: true,
            show_grade_buggy_impls_stdout: true
        });
        await set_props(wrapper, {'value': new_val});

        expect(wrapper.vm.d_feedback_config!).toEqual(new_val);
    });

    test('config_name Prop', async () => {
        expect(wrapper.vm.config_name).toEqual("normal");

        await set_props(wrapper, {'config_name': "past-limit"});
        expect(wrapper.vm.config_name).toEqual("past-limit");
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
