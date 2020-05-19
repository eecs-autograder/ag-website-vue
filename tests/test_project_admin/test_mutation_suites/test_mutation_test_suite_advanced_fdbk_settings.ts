import { mount, Wrapper } from '@vue/test-utils';

import {
    BugsExposedFeedbackLevel,
    MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import MutationTestSuiteAdvancedFdbkSettings from '@/components/project_admin/mutation_suites/mutation_test_suite_advanced_fdbk_settings.vue';

import { make_mutation_test_suite_fdbk_config } from '@/tests/data_utils';
import { checkbox_is_checked, emitted } from '@/tests/utils';


describe('MutationTestSuiteAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<MutationTestSuiteAdvancedFdbkSettings>;
    let feedback_config: MutationTestSuiteFeedbackConfig;

    beforeEach(() => {
        feedback_config = make_mutation_test_suite_fdbk_config();

        wrapper = mount(MutationTestSuiteAdvancedFdbkSettings, {
            propsData: {
                config_name: "normal",
                value: feedback_config
            }
        });
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('visible binding', async () => {
        let visible_input = wrapper.find('#normal-mutation-suite-visible');

        visible_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);

        visible_input.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(false);

        visible_input.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.visible).toEqual(true);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        wrapper.vm.d_feedback_config!.visible = false;
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        wrapper.vm.d_feedback_config!.visible = true;
        expect(checkbox_is_checked(visible_input)).toEqual(true);
    });

    test('bugs_exposed_fdbk_level binding', async () => {
        wrapper.setData({d_is_open: true});

        let bugs_exposed_fdbk_level_input = wrapper.find('#normal-bugs-exposed-fdbk-level');

        bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.no_feedback);
        expect(wrapper.vm.d_feedback_config!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.no_feedback
        );

        bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.num_bugs_exposed);
        expect(wrapper.vm.d_feedback_config!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.num_bugs_exposed
        );

        bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.exposed_bug_names);
        expect(wrapper.vm.d_feedback_config!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.exposed_bug_names
        );
    });

    test('Toggle show_invalid_test_names', async () => {
        wrapper.setData({d_is_open: true});

        let show_invalid_test_names = wrapper.find('#normal-show-invalid-test-names');

        show_invalid_test_names.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_invalid_test_names).toEqual(true);
        expect(emitted(wrapper, 'input').length).toEqual(1);

        show_invalid_test_names.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_invalid_test_names).toEqual(false);

        show_invalid_test_names.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_invalid_test_names).toEqual(true);

        expect(checkbox_is_checked(show_invalid_test_names)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_invalid_test_names = false;
        expect(checkbox_is_checked(show_invalid_test_names)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_invalid_test_names = true;
        expect(checkbox_is_checked(show_invalid_test_names)).toEqual(true);
    });

    test('Toggle show_points', async () => {
        wrapper.setData({d_is_open: true});

        let show_points = wrapper.find('#normal-show-points');

        show_points.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(true);

        show_points.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(false);

        show_points.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_points).toEqual(true);

        expect(checkbox_is_checked(show_points)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_points = false;
        expect(checkbox_is_checked(show_points)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_points = true;
        expect(checkbox_is_checked(show_points)).toEqual(true);
    });

    test('Toggle show_setup_return_code', async () => {
        wrapper.setData({d_is_open: true});

        let show_setup_return_code = wrapper.find('#normal-show-setup-return-code');

        show_setup_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(true);

        show_setup_return_code.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(false);

        show_setup_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_return_code).toEqual(true);

        expect(checkbox_is_checked(show_setup_return_code)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_setup_return_code = false;
        expect(checkbox_is_checked(show_setup_return_code)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_setup_return_code = true;
        expect(checkbox_is_checked(show_setup_return_code)).toEqual(true);
    });

    test('Toggle show_setup_stdout', async () => {
        wrapper.setData({d_is_open: true});

        let show_setup_stdout = wrapper.find('#normal-show-setup-stdout');

        show_setup_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(true);

        show_setup_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(false);

        show_setup_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stdout).toEqual(true);

        expect(checkbox_is_checked(show_setup_stdout)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_setup_stdout = false;
        expect(checkbox_is_checked(show_setup_stdout)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_setup_stdout = true;
        expect(checkbox_is_checked(show_setup_stdout)).toEqual(true);
    });

    test('Toggle show_setup_stderr', async () => {
        wrapper.setData({d_is_open: true});

        let show_setup_stderr = wrapper.find('#normal-show-setup-stderr');

        show_setup_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(true);

        show_setup_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(false);

        show_setup_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_setup_stderr).toEqual(true);

        expect(checkbox_is_checked(show_setup_stderr)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_setup_stderr = false;
        expect(checkbox_is_checked(show_setup_stderr)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_setup_stderr = true;
        expect(checkbox_is_checked(show_setup_stderr)).toEqual(true);
    });

    test('Toggle show_get_test_names_return_code', async () => {
        wrapper.setData({d_is_open: true});

        let show_get_test_names_return_code = wrapper.find(
            '#normal-show-get-test-names-return-code'
        );

        show_get_test_names_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_return_code).toEqual(true);

        show_get_test_names_return_code.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_return_code).toEqual(false);

        show_get_test_names_return_code.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_return_code).toEqual(true);

        expect(checkbox_is_checked(show_get_test_names_return_code)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_get_test_names_return_code = false;
        expect(checkbox_is_checked(show_get_test_names_return_code)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_get_test_names_return_code = true;
        expect(checkbox_is_checked(show_get_test_names_return_code)).toEqual(true);
    });

    test('Toggle show_get_test_names_stdout', async () => {
        wrapper.setData({d_is_open: true});

        let show_get_test_names_stdout = wrapper.find('#normal-show-get-test-names-stdout');

        show_get_test_names_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stdout).toEqual(true);

        show_get_test_names_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stdout).toEqual(false);

        show_get_test_names_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stdout).toEqual(true);

        expect(checkbox_is_checked(show_get_test_names_stdout)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_get_test_names_stdout = false;
        expect(checkbox_is_checked(show_get_test_names_stdout)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_get_test_names_stdout = true;
        expect(checkbox_is_checked(show_get_test_names_stdout)).toEqual(true);
    });

    test('Toggle show_get_test_names_stderr', async () => {
        wrapper.setData({d_is_open: true});

        let show_get_test_names_stderr = wrapper.find('#normal-show-get-test-names-stderr');

        show_get_test_names_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stderr).toEqual(true);

        show_get_test_names_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stderr).toEqual(false);

        show_get_test_names_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_get_test_names_stderr).toEqual(true);

        expect(checkbox_is_checked(show_get_test_names_stderr)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_get_test_names_stderr = false;
        expect(checkbox_is_checked(show_get_test_names_stderr)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_get_test_names_stderr = true;
        expect(checkbox_is_checked(show_get_test_names_stderr)).toEqual(true);
    });

    test('Toggle show_validity_check_stdout', async () => {
        wrapper.setData({d_is_open: true});

        let show_validity_check_stdout = wrapper.find('#normal-show-validity-check-stdout');

        show_validity_check_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stdout).toEqual(true);

        show_validity_check_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stdout).toEqual(false);

        show_validity_check_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stdout).toEqual(true);

        expect(checkbox_is_checked(show_validity_check_stdout)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_validity_check_stdout = false;
        expect(checkbox_is_checked(show_validity_check_stdout)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_validity_check_stdout = true;
        expect(checkbox_is_checked(show_validity_check_stdout)).toEqual(true);
    });

    test('Toggle show_validity_check_stderr', async () => {
        wrapper.setData({d_is_open: true});

        let show_validity_check_stderr = wrapper.find('#normal-show-validity-check-stderr');

        show_validity_check_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stderr).toEqual(true);

        show_validity_check_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stderr).toEqual(false);

        show_validity_check_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_validity_check_stderr).toEqual(true);

        expect(checkbox_is_checked(show_validity_check_stderr)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_validity_check_stderr = false;
        expect(checkbox_is_checked(show_validity_check_stderr)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_validity_check_stderr = true;
        expect(checkbox_is_checked(show_validity_check_stderr)).toEqual(true);
    });

    test('Toggle show_grade_buggy_impls_stdout', async () => {
        wrapper.setData({d_is_open: true});

        let show_grade_buggy_impls_stdout = wrapper.find('#normal-show-grade-buggy-impls-stdout');

        show_grade_buggy_impls_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout).toEqual(true);

        show_grade_buggy_impls_stdout.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout).toEqual(false);

        show_grade_buggy_impls_stdout.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout).toEqual(true);

        expect(checkbox_is_checked(show_grade_buggy_impls_stdout)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout = false;
        expect(checkbox_is_checked(show_grade_buggy_impls_stdout)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stdout = true;
        expect(checkbox_is_checked(show_grade_buggy_impls_stdout)).toEqual(true);
    });

    test('Toggle show_grade_buggy_impls_stderr', async () => {
        wrapper.setData({d_is_open: true});

        let show_grade_buggy_impls_stderr = wrapper.find('#normal-show-grade-buggy-impls-stderr');

        show_grade_buggy_impls_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr).toEqual(true);

        show_grade_buggy_impls_stderr.setChecked(false);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr).toEqual(false);

        show_grade_buggy_impls_stderr.setChecked(true);
        expect(wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr).toEqual(true);

        expect(checkbox_is_checked(show_grade_buggy_impls_stderr)).toEqual(true);

        wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr = false;
        expect(checkbox_is_checked(show_grade_buggy_impls_stderr)).toEqual(false);

        wrapper.vm.d_feedback_config!.show_grade_buggy_impls_stderr = true;
        expect(checkbox_is_checked(show_grade_buggy_impls_stderr)).toEqual(true);
    });

    test('value Watcher', async () => {
        expect(wrapper.vm.d_feedback_config!).toEqual(feedback_config);

        let new_val = make_mutation_test_suite_fdbk_config({
            show_grade_buggy_impls_stderr: true,
            show_grade_buggy_impls_stdout: true
        });
        wrapper.setProps({'value': new_val});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_feedback_config!).toEqual(new_val);
    });

    test('config_name Prop', async () => {
        expect(wrapper.vm.config_name).toEqual("normal");

        wrapper.setProps({'config_name': "past-limit"});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.config_name).toEqual("past-limit");
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
