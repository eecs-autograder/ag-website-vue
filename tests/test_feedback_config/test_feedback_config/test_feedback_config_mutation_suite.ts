import { config, mount, Wrapper } from '@vue/test-utils';

import {
    BugsExposedFeedbackLevel,
    HttpError,
    MutationTestSuite,
    MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import FeedbackConfigMutationSuite from '@/components/feedback_config/feedback_config/feedback_config_mutation_suite.vue';
import { FeedbackConfigLabel, transform_to_snake_case } from '@/components/feedback_config/feedback_config/feedback_config_utils';

import { create_mutation_suite, create_mutation_suite_feedback_config } from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('FeedbackConfigMutationSuite tests', () => {
    let wrapper: Wrapper<FeedbackConfigMutationSuite>;
    let component: FeedbackConfigMutationSuite;
    let mutation_test_suite: MutationTestSuite;

    beforeEach(() => {

        mutation_test_suite = create_mutation_suite(1, "Mutation Suite 1", 1);

        wrapper = mount(FeedbackConfigMutationSuite, {
            propsData: {
                mutation_test_suite: mutation_test_suite
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test("get_current_preset_fn", async () => {
        let public_preset = component.fdbk_presets.get('Public');
        let num_bugs_plus_prep_output_preset = component.fdbk_presets.get(
            'Num Bugs + Prep Output'
        );
        let num_bugs_exposed_preset = component.fdbk_presets.get('Num Bugs Exposed');
        let false_positives_preset = component.fdbk_presets.get('False Positives');
        let private_preset = component.fdbk_presets.get('Private');

        let mutation_test_suite_config: MutationTestSuiteFeedbackConfig | null = {
            visible: true,
            show_setup_return_code: public_preset.show_setup_return_code,
            show_setup_stdout: public_preset.show_setup_stdout,
            show_setup_stderr: public_preset.show_setup_stderr,
            show_invalid_test_names: public_preset.show_invalid_test_names,
            show_points: public_preset.show_points,
            bugs_exposed_fdbk_level: public_preset.bugs_exposed_fdbk_level,
            show_get_test_names_return_code: public_preset.show_get_test_names_return_code,
            show_get_test_names_stdout: public_preset.show_get_test_names_stdout,
            show_get_test_names_stderr: public_preset.show_get_test_names_stderr,
            show_validity_check_stdout: public_preset.show_validity_check_stdout,
            show_validity_check_stderr: public_preset.show_validity_check_stderr,
            show_grade_buggy_impls_stdout: public_preset.show_grade_buggy_impls_stdout,
            show_grade_buggy_impls_stderr: public_preset.show_grade_buggy_impls_stderr
        };

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Public");

        mutation_test_suite_config = {
            visible: true,
            show_setup_return_code: num_bugs_plus_prep_output_preset.show_setup_return_code,
            show_setup_stdout: num_bugs_plus_prep_output_preset.show_setup_stdout,
            show_setup_stderr: num_bugs_plus_prep_output_preset.show_setup_stderr,
            show_invalid_test_names: num_bugs_plus_prep_output_preset.show_invalid_test_names,
            show_points: num_bugs_plus_prep_output_preset.show_points,
            bugs_exposed_fdbk_level: num_bugs_plus_prep_output_preset.bugs_exposed_fdbk_level,
            show_get_test_names_return_code:
            num_bugs_plus_prep_output_preset.show_get_test_names_return_code,
            show_get_test_names_stdout:
            num_bugs_plus_prep_output_preset.show_get_test_names_stdout,
            show_get_test_names_stderr:
            num_bugs_plus_prep_output_preset.show_get_test_names_stderr,
            show_validity_check_stdout:
            num_bugs_plus_prep_output_preset.show_validity_check_stdout,
            show_validity_check_stderr:
            num_bugs_plus_prep_output_preset.show_validity_check_stderr,
            show_grade_buggy_impls_stdout:
            num_bugs_plus_prep_output_preset.show_grade_buggy_impls_stdout,
            show_grade_buggy_impls_stderr:
            num_bugs_plus_prep_output_preset.show_grade_buggy_impls_stderr
        };

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Num Bugs + Prep Output");

        mutation_test_suite_config = {
            visible: true,
            show_setup_return_code: num_bugs_exposed_preset.show_setup_return_code,
            show_setup_stdout: num_bugs_exposed_preset.show_setup_stdout,
            show_setup_stderr: num_bugs_exposed_preset.show_setup_stderr,
            show_invalid_test_names: num_bugs_exposed_preset.show_invalid_test_names,
            show_points: num_bugs_exposed_preset.show_points,
            bugs_exposed_fdbk_level: num_bugs_plus_prep_output_preset.bugs_exposed_fdbk_level,
            show_get_test_names_return_code:
            num_bugs_exposed_preset.show_get_test_names_return_code,
            show_get_test_names_stdout: num_bugs_exposed_preset.show_get_test_names_stdout,
            show_get_test_names_stderr: num_bugs_exposed_preset.show_get_test_names_stderr,
            show_validity_check_stdout: num_bugs_exposed_preset.show_validity_check_stdout,
            show_validity_check_stderr: num_bugs_exposed_preset.show_validity_check_stderr,
            show_grade_buggy_impls_stdout: num_bugs_exposed_preset.show_grade_buggy_impls_stdout,
            show_grade_buggy_impls_stderr: num_bugs_exposed_preset.show_grade_buggy_impls_stderr
        };

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Num Bugs Exposed");

        mutation_test_suite_config = {
            visible: true,
            show_setup_return_code: false_positives_preset.show_setup_return_code,
            show_setup_stdout: false_positives_preset.show_setup_stdout,
            show_setup_stderr: false_positives_preset.show_setup_stderr,
            show_invalid_test_names: false_positives_preset.show_invalid_test_names,
            show_points: false_positives_preset.show_points,
            bugs_exposed_fdbk_level: false_positives_preset.bugs_exposed_fdbk_level,
            show_get_test_names_return_code:
            false_positives_preset.show_get_test_names_return_code,
            show_get_test_names_stdout: false_positives_preset.show_get_test_names_stdout,
            show_get_test_names_stderr: false_positives_preset.show_get_test_names_stderr,
            show_validity_check_stdout: false_positives_preset.show_validity_check_stdout,
            show_validity_check_stderr: false_positives_preset.show_validity_check_stderr,
            show_grade_buggy_impls_stdout: false_positives_preset.show_grade_buggy_impls_stdout,
            show_grade_buggy_impls_stderr: false_positives_preset.show_grade_buggy_impls_stderr
        };

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("False Positives");

        mutation_test_suite_config = {
            visible: true,
            show_setup_return_code: private_preset.show_setup_return_code,
            show_setup_stdout: private_preset.show_setup_stdout,
            show_setup_stderr: private_preset.show_setup_stderr,
            show_invalid_test_names: private_preset.show_invalid_test_names,
            show_points: private_preset.show_points,
            bugs_exposed_fdbk_level: private_preset.bugs_exposed_fdbk_level,
            show_get_test_names_return_code: private_preset.show_get_test_names_return_code,
            show_get_test_names_stdout: private_preset.show_get_test_names_stdout,
            show_get_test_names_stderr: private_preset.show_get_test_names_stderr,
            show_validity_check_stdout: private_preset.show_validity_check_stdout,
            show_validity_check_stderr: private_preset.show_validity_check_stderr,
            show_grade_buggy_impls_stdout: private_preset.show_grade_buggy_impls_stdout,
            show_grade_buggy_impls_stderr: private_preset.show_grade_buggy_impls_stderr
        };

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Private");

        mutation_test_suite_config = null;

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");
    });

    test("apply_preset", async () => {
        let mutation_test_suite_config = create_mutation_suite_feedback_config();

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");

        component.apply_preset("Public",
                               mutation_test_suite_config,
                               component.fdbk_presets);

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Public");

        component.apply_preset("Num Bugs + Prep Output",
                               mutation_test_suite_config,
                               component.fdbk_presets);

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Num Bugs + Prep Output");

        component.apply_preset("Num Bugs Exposed",
                               mutation_test_suite_config,
                               component.fdbk_presets);

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Num Bugs Exposed");

        component.apply_preset("False Positives",
                               mutation_test_suite_config,
                               component.fdbk_presets);

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("False Positives");

        component.apply_preset("Private",
                               mutation_test_suite_config,
                               component.fdbk_presets);

        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Private");

        // Nothing should happen
        component.apply_preset(
            "Custom", mutation_test_suite_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Private");
    });

    test("apply_preset called from config_panel", async () => {
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");

        let past_limit_config_panel = wrapper.find(
            {ref: transform_to_snake_case(FeedbackConfigLabel.past_limit)}
        );

        past_limit_config_panel.find('#config-preset-select').setValue(
            "False Positives"
        );
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("False Positives");
    });

    test("update_config_settings", async () => {
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.normal_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.ultimate_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.staff_viewer_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");

        let ultimate_submission_config_panel = wrapper.find(
            {ref: transform_to_snake_case(FeedbackConfigLabel.ultimate_submission)}
        );

        ultimate_submission_config_panel.find('.advanced-settings-label').trigger(
            'click'
        );
        await component.$nextTick();

        wrapper.find('#final-graded-bugs-exposed-fdbk-level').setValue(
            BugsExposedFeedbackLevel.no_feedback
        );

        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.normal_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.ultimate_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Private");
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.staff_viewer_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
    });

    test("update_config_settings - checkboxes in config panels do not react to changes in " +
         "other panels",
         async () => {
        expect(component.d_mutation_test_suite!.normal_fdbk_config
                   .show_validity_check_stderr).toBe(false);
        expect(component.d_mutation_test_suite!.past_limit_submission_fdbk_config
                   .show_validity_check_stderr).toBe(false);
        expect(component.d_mutation_test_suite!.ultimate_submission_fdbk_config
                   .show_validity_check_stderr).toBe(false);
        expect(component.d_mutation_test_suite!.staff_viewer_fdbk_config
                   .show_validity_check_stderr).toBe(false);

        wrapper.findAll('.advanced-settings-label').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(1).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(2).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(3).trigger('click');
        await component.$nextTick();

        wrapper.find('#student-lookup-show-validity-check-stderr').setChecked(true);

        expect(component.d_mutation_test_suite!.normal_fdbk_config
                   .show_validity_check_stderr).toBe(false);
        expect(component.d_mutation_test_suite!.past_limit_submission_fdbk_config
                   .show_validity_check_stderr).toBe(false);
        expect(component.d_mutation_test_suite!.ultimate_submission_fdbk_config
                   .show_validity_check_stderr).toBe(false);
        expect(component.d_mutation_test_suite!.staff_viewer_fdbk_config
                   .show_validity_check_stderr).toBe(true);
    });

    test("save d_mutation_test_suite settings - successful", async () => {
        let save_stub = sinon.stub(component.d_mutation_test_suite!, 'save');

        wrapper.find('.save-feedback-config-settings').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test("save d_mutation_test_suite settings - unsuccessful", async () => {
        let save_stub = sinon.stub(component.d_mutation_test_suite!, 'save');
        save_stub.returns(Promise.reject(
            new HttpError
            (
                400,
                {__all__: "Mutation test suite with this Name and Project already exists."}
            )
        ));

        wrapper.find('.save-feedback-config-settings').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
