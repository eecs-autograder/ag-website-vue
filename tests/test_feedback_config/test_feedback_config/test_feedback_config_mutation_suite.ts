import { config, mount, Wrapper } from '@vue/test-utils';

import {
    BugsExposedFeedbackLevel,
    HttpError,
    MutationTestSuite,
    MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import EditFeedbackSettingsMutationSuite from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_mutation_suite.vue';
import FeedbackConfigMutationSuite from '@/components/feedback_config/feedback_config/feedback_config_mutation_suite.vue';
import { safe_assign } from '@/utils';

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

        let mutation_test_suite_config: MutationTestSuiteFeedbackConfig | null
            = create_mutation_suite_feedback_config();
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");

        safe_assign(mutation_test_suite_config!, public_preset);
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Public");

        safe_assign(mutation_test_suite_config!, num_bugs_plus_prep_output_preset);
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Num Bugs + Prep Output");

        safe_assign(mutation_test_suite_config!, num_bugs_exposed_preset);
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Num Bugs Exposed");

        safe_assign(mutation_test_suite_config!, false_positives_preset);
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("False Positives");

        safe_assign(mutation_test_suite_config!, private_preset);
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Private");

        mutation_test_suite_config = null;
        expect(component.get_current_preset_fn(
            mutation_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");
    });

    test("apply_preset called from config_panel - updates EditFeedbackSettings", async () => {
        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");

        let past_limit_config_panel = wrapper.find({ref: 'past_limit'});
        let past_limit_edit_settings = <EditFeedbackSettingsMutationSuite> wrapper.find({
            ref: 'past_limit_edit_feedback_settings'
        }).vm;

        past_limit_config_panel.find('#config-preset-select').setValue("Num Bugs + Prep Output");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Num Bugs + Prep Output");
        expect(component.get_current_preset_fn(
            past_limit_edit_settings.d_mutation_test_suite_settings,
            component.fdbk_presets
        )).toEqual("Num Bugs + Prep Output");

        past_limit_config_panel.find('#config-preset-select').setValue("Num Bugs Exposed");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Num Bugs Exposed");
        expect(component.get_current_preset_fn(
            past_limit_edit_settings.d_mutation_test_suite_settings,
            component.fdbk_presets
        )).toEqual("Num Bugs Exposed");

        past_limit_config_panel.find('#config-preset-select').setValue("False Positives");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("False Positives");
        expect(component.get_current_preset_fn(
            past_limit_edit_settings.d_mutation_test_suite_settings,
            component.fdbk_presets
        )).toEqual("False Positives");

        past_limit_config_panel.find('#config-preset-select').setValue("Private");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Private");
        expect(component.get_current_preset_fn(
            past_limit_edit_settings.d_mutation_test_suite_settings,
            component.fdbk_presets
        )).toEqual("Private");

        past_limit_config_panel.find('#config-preset-select').setValue("Public");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Public");
        expect(component.get_current_preset_fn(
            past_limit_edit_settings.d_mutation_test_suite_settings,
            component.fdbk_presets
        )).toEqual("Public");
    });

    test("update config settings in edit_feedback_settings_mutation_suite - changes " +
         "reflected in preset_selected in config_panel",
         async () => {
        let ultimate_submission_config_panel = wrapper.find({ref: 'final_graded'});
        let ultimate_submission_config_panel_component =
            <ConfigPanel> ultimate_submission_config_panel.vm;

        ultimate_submission_config_panel.find('.advanced-settings-label').trigger('click');
        await component.$nextTick();

        expect(ultimate_submission_config_panel_component.preset_selected).toEqual("Custom");

        wrapper.find('#final-graded-bugs-exposed-fdbk-level').setValue(
            BugsExposedFeedbackLevel.no_feedback
        );
        expect(ultimate_submission_config_panel_component.preset_selected).toEqual("Private");

        wrapper.find('#final-graded-show-points').setChecked(true);
        expect(ultimate_submission_config_panel_component.preset_selected).toEqual("Custom");

        wrapper.find('#final-graded-show-invalid-test-names').setChecked(true);
        expect(ultimate_submission_config_panel_component.preset_selected).toEqual("Custom");

        wrapper.find('#final-graded-show-get-test-names-return-code').setChecked(true);
        expect(ultimate_submission_config_panel_component.preset_selected).toEqual("Custom");

        wrapper.find('#final-graded-show-setup-return-code').setChecked(true);
        expect(ultimate_submission_config_panel_component.preset_selected).toEqual(
            "False Positives"
        );
    });

    test("checkboxes in config panels do not react to changes in other panels",
         async () => {
        expect(
            component.d_mutation_test_suite!.normal_fdbk_config.show_validity_check_stderr
        ).toBe(false);
        expect(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr).toBe(false);
        expect(
            component.d_mutation_test_suite!.ultimate_submission_fdbk_config
                .show_validity_check_stderr).toBe(false);
        expect(
            component.d_mutation_test_suite!.staff_viewer_fdbk_config.show_validity_check_stderr
        ).toBe(false);

        wrapper.findAll('.advanced-settings-label').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(1).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(2).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(3).trigger('click');
        await component.$nextTick();

        wrapper.find('#student-lookup-show-validity-check-stderr').setChecked(true);

        expect(
            component.d_mutation_test_suite!.normal_fdbk_config.show_validity_check_stderr
        ).toBe(false);
        expect(
            component.d_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr).toBe(false);
        expect(
            component.d_mutation_test_suite!.ultimate_submission_fdbk_config
                .show_validity_check_stderr).toBe(false);
        expect(
            component.d_mutation_test_suite!.staff_viewer_fdbk_config.show_validity_check_stderr
        ).toBe(true);
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
