import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    HttpError
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import FeedbackConfigAGSuite from '@/components/feedback_config/feedback_config/feedback_config_ag_suite.vue';
import {
    FeedbackConfigLabel,
    transform_to_snake_case
} from '@/components/feedback_config/feedback_config/feedback_config_utils';

import { create_ag_suite } from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('FeedbackConfigAGSuite tests', () => {
    let wrapper: Wrapper<FeedbackConfigAGSuite>;
    let component: FeedbackConfigAGSuite;
    let ag_test_suite: AGTestSuite;

    beforeEach(() => {

        ag_test_suite = create_ag_suite(1, "Suite 1", 1);

        wrapper = mount(FeedbackConfigAGSuite, {
            propsData: {
                ag_test_suite: ag_test_suite
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
        let public_setup_preset = component.fdbk_presets.get('Public Setup');
        let pass_fail_setup_preset = component.fdbk_presets.get('Pass/Fail Setup');
        let private_setup_preset = component.fdbk_presets.get('Private Setup');

        let ag_test_suite_config: AGTestSuiteFeedbackConfig | null = {
            visible: true,
            show_individual_tests: public_setup_preset.show_individual_tests,
            show_setup_return_code: public_setup_preset.show_setup_return_code,
            show_setup_timed_out: public_setup_preset.show_setup_timed_out,
            show_setup_stdout: public_setup_preset.show_setup_stdout,
            show_setup_stderr: public_setup_preset.show_setup_stderr
        };

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Public Setup");

        ag_test_suite_config = {
            visible: true,
            show_individual_tests: pass_fail_setup_preset.show_individual_tests,
            show_setup_return_code: pass_fail_setup_preset.show_setup_return_code,
            show_setup_timed_out: pass_fail_setup_preset.show_setup_timed_out,
            show_setup_stdout: pass_fail_setup_preset.show_setup_stdout,
            show_setup_stderr: pass_fail_setup_preset.show_setup_stderr
        };

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Pass/Fail Setup");

        ag_test_suite_config = {
            visible: true,
            show_individual_tests: private_setup_preset.show_individual_tests,
            show_setup_return_code: private_setup_preset.show_setup_return_code,
            show_setup_timed_out: private_setup_preset.show_setup_timed_out,
            show_setup_stdout: private_setup_preset.show_setup_stdout,
            show_setup_stderr: private_setup_preset.show_setup_stderr
        };

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Private Setup");

        ag_test_suite_config = {
            visible: false,
            show_individual_tests: false,
            show_setup_return_code: false,
            show_setup_timed_out: false,
            show_setup_stdout: false,
            show_setup_stderr: false
        };

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");

        ag_test_suite_config = null;

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");
    });

    test("apply_preset", async () => {
        let ag_test_suite_config: AGTestSuiteFeedbackConfig = {
            visible: false,
            show_individual_tests: false,
            show_setup_return_code: false,
            show_setup_timed_out: false,
            show_setup_stdout: false,
            show_setup_stderr: false
        };

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");

        component.apply_preset("Public Setup", ag_test_suite_config, component.fdbk_presets);

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Public Setup");

        component.apply_preset("Pass/Fail Setup", ag_test_suite_config, component.fdbk_presets);

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Pass/Fail Setup");

        component.apply_preset("Private Setup", ag_test_suite_config, component.fdbk_presets);

        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Private Setup");

        // Nothing should happen - but this feels like a weird test
        component.apply_preset(
            "Custom", ag_test_suite_config, component.fdbk_presets);
        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Private Setup");
    });

    test("apply_preset called from config_panel", async () => {
        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");

        let staff_viewer_config_panel = wrapper.find(
            {ref: transform_to_snake_case(FeedbackConfigLabel.staff_viewer)}
        );

        staff_viewer_config_panel.find('#config-preset-select').setValue("Pass/Fail Setup");
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Pass/Fail Setup");
    });

    test("update_config_settings", async () => {
        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.past_limit_submission_fdbk_config, component.fdbk_presets
        )).toEqual("Custom");

        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.normal_fdbk_config, component.fdbk_presets
        )).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.ultimate_submission_fdbk_config,
            component.fdbk_presets)
        ).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.past_limit_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");
        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.staff_viewer_fdbk_config,
            component.fdbk_presets
        )).toEqual("Custom");

        let normal_config_panel = wrapper.findAll(
            {ref: transform_to_snake_case(FeedbackConfigLabel.normal)}
        ).at(0);

        normal_config_panel.find('.advanced-settings-label').trigger(
            'click'
        );
        await component.$nextTick();

        wrapper.find('#normal-show-individual-tests').setChecked(true);

        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.normal_fdbk_config,
            component.fdbk_presets
        )).toEqual("Private Setup");
    });

    test("update_config_settings - checkboxes in config panels do not react to changes in " +
         "other panels",
         async () => {
        expect(component.d_ag_test_suite!.normal_fdbk_config
                   .show_setup_timed_out).toBe(false);
        expect(component.d_ag_test_suite!.ultimate_submission_fdbk_config
                   .show_setup_timed_out).toBe(false);
        expect(component.d_ag_test_suite!.past_limit_submission_fdbk_config
                   .show_setup_timed_out).toBe(false);
        expect(component.d_ag_test_suite!.staff_viewer_fdbk_config
                   .show_setup_timed_out).toBe(false);

        wrapper.findAll('.advanced-settings-label').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(1).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(2).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(3).trigger('click');
        await component.$nextTick();

        wrapper.find('#final-graded-show-setup-timed-out').setChecked(true);

        expect(component.d_ag_test_suite!.normal_fdbk_config
                   .show_setup_timed_out).toBe(false);
        expect(component.d_ag_test_suite!.ultimate_submission_fdbk_config
                   .show_setup_timed_out).toBe(true);
        expect(component.d_ag_test_suite!.past_limit_submission_fdbk_config
            .show_setup_timed_out).toBe(false);
        expect(component.d_ag_test_suite!.staff_viewer_fdbk_config
                   .show_setup_timed_out).toBe(false);
    });

    test("save d_ag_test_suite settings - successful", async () => {
        let save_stub = sinon.stub(component.d_ag_test_suite!, 'save');

        wrapper.find('.save-feedback-config-settings').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test("save d_ag_test_suite settings - unsuccessful", async () => {
        let save_stub = sinon.stub(component.d_ag_test_suite!, 'save');
        save_stub.returns(Promise.reject(
            new HttpError
            (
                400,
                {__all__: "Ag test suite with this Name and Project already exists."}
            )
        ));

        wrapper.find('.save-feedback-config-settings').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
