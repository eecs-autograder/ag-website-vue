import { config, mount, Wrapper } from '@vue/test-utils';

import {
    BugsExposedFeedbackLevel,
    MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import EditFeedbackSettingsMutationSuite from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_mutation_suite.vue';

import { create_mutation_suite_feedback_config } from '@/tests/data_utils';
import { checkbox_is_checked } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('EditFeedbackSettingsMutationSuite tests', () => {
    let wrapper: Wrapper<EditFeedbackSettingsMutationSuite>;
    let component: EditFeedbackSettingsMutationSuite;
    let mutation_test_suite_normal_feedback_config: MutationTestSuiteFeedbackConfig;
    let mutation_test_suite_past_limit_feedback_config: MutationTestSuiteFeedbackConfig;

    beforeEach(() => {
        mutation_test_suite_normal_feedback_config = create_mutation_suite_feedback_config();

        mutation_test_suite_past_limit_feedback_config = create_mutation_suite_feedback_config();

        wrapper = mount(EditFeedbackSettingsMutationSuite, {
            propsData: {
                config_name: "normal",
                value: mutation_test_suite_normal_feedback_config
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
        let visible_input = wrapper.find('#normal-visible');

        visible_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.visible).toEqual(true);

        visible_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.visible).toEqual(false);

        visible_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.visible).toEqual(true);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.visible = false;
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.visible = true;
        expect(checkbox_is_checked(visible_input)).toEqual(true);
    });

    test('show_setup_return_code binding', async () => {
        wrapper.setData({is_open: true});

        let show_setup_return_code_input = wrapper.find('#normal-show-setup-return-code');

        show_setup_return_code_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_setup_return_code).toEqual(true);

        show_setup_return_code_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_setup_return_code).toEqual(false);

        show_setup_return_code_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_setup_return_code).toEqual(true);

        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_setup_return_code = false;
        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_setup_return_code = true;
        expect(checkbox_is_checked(show_setup_return_code_input)).toEqual(true);
    });

    test('show_setup_stdout binding', async () => {
        wrapper.setData({is_open: true});

        let show_setup_stdout_input = wrapper.find('#normal-show-setup-stdout');

        show_setup_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_setup_stdout).toEqual(true);

        show_setup_stdout_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_setup_stdout).toEqual(false);

        show_setup_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_setup_stdout).toEqual(true);

        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_setup_stdout = false;
        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_setup_stdout = true;
        expect(checkbox_is_checked(show_setup_stdout_input)).toEqual(true);
    });

    test('show_setup_stderr binding', async () => {
        wrapper.setData({is_open: true});

        let show_setup_stderr_input = wrapper.find('#normal-show-setup-stderr');

        show_setup_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_setup_stderr).toEqual(true);

        show_setup_stderr_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_setup_stderr).toEqual(false);

        show_setup_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_setup_stderr).toEqual(true);

        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_setup_stderr = false;
        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_setup_stderr = true;
        expect(checkbox_is_checked(show_setup_stderr_input)).toEqual(true);
    });

    test('show_invalid_test_names binding', async () => {
        wrapper.setData({is_open: true});

        let show_invalid_test_names_input = wrapper.find('#normal-show-invalid-test-names');

        show_invalid_test_names_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_invalid_test_names).toEqual(true);

        show_invalid_test_names_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_invalid_test_names).toEqual(false);

        show_invalid_test_names_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_invalid_test_names).toEqual(true);

        expect(checkbox_is_checked(show_invalid_test_names_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_invalid_test_names = false;
        expect(checkbox_is_checked(show_invalid_test_names_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_invalid_test_names = true;
        expect(checkbox_is_checked(show_invalid_test_names_input)).toEqual(true);
    });

    test('show_points binding', async () => {
        wrapper.setData({is_open: true});

        let show_points_input = wrapper.find('#normal-show-points');

        show_points_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_points).toEqual(true);

        show_points_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_points).toEqual(false);

        show_points_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_points).toEqual(true);

        expect(checkbox_is_checked(show_points_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_points = false;
        expect(checkbox_is_checked(show_points_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_points = true;
        expect(checkbox_is_checked(show_points_input)).toEqual(true);
    });

    test('bugs_exposed_fdbk_level binding binding', async () => {
        wrapper.setData({is_open: true});

        let bugs_exposed_fdbk_level_input = wrapper.find(
            '#normal-bugs-exposed-fdbk-level'
        );

        bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.no_feedback);
        expect(component.d_mutation_test_suite_settings!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.no_feedback
        );

        bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.num_bugs_exposed);
        expect(component.d_mutation_test_suite_settings!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.num_bugs_exposed
        );

        bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.exposed_bug_names);
        expect(component.d_mutation_test_suite_settings!.bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.exposed_bug_names
        );
    });

    test('show_get_test_names_return_code binding', async () => {
        wrapper.setData({is_open: true});

        let show_get_test_names_return_code_input = wrapper.find(
            '#normal-show-get-test-names-return-code'
        );

        show_get_test_names_return_code_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_return_code).toEqual(
            true
        );

        show_get_test_names_return_code_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_return_code).toEqual(
            false
        );

        show_get_test_names_return_code_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_return_code).toEqual(
            true
        );

        expect(checkbox_is_checked(show_get_test_names_return_code_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_get_test_names_return_code = false;
        expect(checkbox_is_checked(show_get_test_names_return_code_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_get_test_names_return_code = true;
        expect(checkbox_is_checked(show_get_test_names_return_code_input)).toEqual(true);
    });

    test('show_get_test_names_stdout binding', async () => {
        wrapper.setData({is_open: true});

        let show_get_test_names_stdout_input = wrapper.find('#normal-show-get-test-names-stdout');

        show_get_test_names_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_stdout).toEqual(
            true
        );

        show_get_test_names_stdout_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_stdout).toEqual(
            false
        );

        show_get_test_names_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_stdout).toEqual(
            true
        );

        expect(checkbox_is_checked(show_get_test_names_stdout_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_get_test_names_stdout = false;
        expect(checkbox_is_checked(show_get_test_names_stdout_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_get_test_names_stdout = true;
        expect(checkbox_is_checked(show_get_test_names_stdout_input)).toEqual(true);
    });

    test('show_get_test_names_stderr binding', async () => {
        wrapper.setData({is_open: true});

        let show_get_test_names_stderr_input = wrapper.find('#normal-show-get-test-names-stderr');

        show_get_test_names_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_stderr).toEqual(true);

        show_get_test_names_stderr_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_stderr).toEqual(
            false
        );

        show_get_test_names_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_get_test_names_stderr).toEqual(true);

        expect(checkbox_is_checked(show_get_test_names_stderr_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_get_test_names_stderr = false;
        expect(checkbox_is_checked(show_get_test_names_stderr_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_get_test_names_stderr = true;
        expect(checkbox_is_checked(show_get_test_names_stderr_input)).toEqual(true);
    });

    test('show_validity_check_stdout binding', async () => {
        wrapper.setData({is_open: true});

        let show_validity_check_stdout_input = wrapper.find('#normal-show-validity-check-stdout');

        show_validity_check_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_validity_check_stdout).toEqual(
            true
        );

        show_validity_check_stdout_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_validity_check_stdout).toEqual(
            false
        );

        show_validity_check_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_validity_check_stdout).toEqual(
            true
        );

        expect(checkbox_is_checked(show_validity_check_stdout_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_validity_check_stdout = false;
        expect(checkbox_is_checked(show_validity_check_stdout_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_validity_check_stdout = true;
        expect(checkbox_is_checked(show_validity_check_stdout_input)).toEqual(true);
    });

    test('show_validity_check_stderr binding', async () => {
        wrapper.setData({is_open: true});

        let show_validity_check_stderr_input = wrapper.find('#normal-show-validity-check-stderr');

        show_validity_check_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_validity_check_stderr).toEqual(true);

        show_validity_check_stderr_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_validity_check_stderr).toEqual(
            false
        );

        show_validity_check_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_validity_check_stderr).toEqual(true);

        expect(checkbox_is_checked(show_validity_check_stderr_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_validity_check_stderr = false;
        expect(checkbox_is_checked(show_validity_check_stderr_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_validity_check_stderr = true;
        expect(checkbox_is_checked(show_validity_check_stderr_input)).toEqual(true);
    });

    test('show_grade_buggy_impls_stdout binding', async () => {
        wrapper.setData({is_open: true});

        let show_grade_buggy_impls_stdout_input = wrapper.find(
            '#normal-show-grade-buggy-impls-stdout'
        );

        show_grade_buggy_impls_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stdout).toEqual(
            true
        );

        show_grade_buggy_impls_stdout_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stdout).toEqual(
            false
        );

        show_grade_buggy_impls_stdout_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stdout).toEqual(
            true
        );

        expect(checkbox_is_checked(show_grade_buggy_impls_stdout_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stdout = false;
        expect(checkbox_is_checked(show_grade_buggy_impls_stdout_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stdout = true;
        expect(checkbox_is_checked(show_grade_buggy_impls_stdout_input)).toEqual(true);
    });

    test('show_grade_buggy_impls_stderr binding', async () => {
        wrapper.setData({is_open: true});

        let show_grade_buggy_impls_stderr_input = wrapper.find(
            '#normal-show-grade-buggy-impls-stderr'
        );

        show_grade_buggy_impls_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stderr).toEqual(
            true
        );

        show_grade_buggy_impls_stderr_input.setChecked(false);
        expect(component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stderr).toEqual(
            false
        );

        show_grade_buggy_impls_stderr_input.setChecked(true);
        expect(component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stderr).toEqual(
            true
        );

        expect(checkbox_is_checked(show_grade_buggy_impls_stderr_input)).toEqual(true);

        component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stderr = false;
        expect(checkbox_is_checked(show_grade_buggy_impls_stderr_input)).toEqual(false);

        component.d_mutation_test_suite_settings!.show_grade_buggy_impls_stderr = true;
        expect(checkbox_is_checked(show_grade_buggy_impls_stderr_input)).toEqual(true);
    });

    test('value Watcher', async () => {
        expect(component.d_mutation_test_suite_settings!).toEqual(
            mutation_test_suite_normal_feedback_config
        );

        wrapper.setProps({'value': mutation_test_suite_past_limit_feedback_config});
        await component.$nextTick();

        expect(component.d_mutation_test_suite_settings!).toEqual(
            mutation_test_suite_past_limit_feedback_config
        );
    });

    test('config_name Prop', async () => {
        expect(component.config_name).toEqual("normal");

        wrapper.setProps({'config_name': "past-limit"});
        await component.$nextTick();

        expect(component.config_name).toEqual("past-limit");
    });

    test('toggle_is_open', async () => {
        expect(component.is_open).toBe(false);

        component.toggle_is_open();
        expect(component.is_open).toBe(true);

        component.toggle_is_open();
        expect(component.is_open).toBe(false);

        wrapper.find('.advanced-settings-label').trigger('click');
        expect(component.is_open).toBe(true);

        wrapper.find('.advanced-settings-label').trigger('click');
        expect(component.is_open).toBe(false);
    });
});
