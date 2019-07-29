import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    HttpError
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import EditFeedbackSettingsAGSuite from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_ag_suite.vue';
import FeedbackConfigAGSuite from '@/components/feedback_config/feedback_config/feedback_config_ag_suite.vue';
import { safe_assign } from '@/utils';

import { create_ag_suite, create_ag_suite_feedback_config } from '@/tests/data_utils';

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

        let ag_test_suite_config: AGTestSuiteFeedbackConfig | null
            = create_ag_suite_feedback_config();
        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");

        safe_assign(ag_test_suite_config!, public_setup_preset);
        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Public Setup");

        safe_assign(ag_test_suite_config!, pass_fail_setup_preset);
        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Pass/Fail Setup");

        safe_assign(ag_test_suite_config!, private_setup_preset);
        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Private Setup");

        ag_test_suite_config = null;
        expect(component.get_current_preset_fn(
            ag_test_suite_config, component.fdbk_presets
        )).toEqual("Custom");
    });

    test("apply_preset called from config_panel - updates EditFeedbackSettings", async () => {
        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.staff_viewer_fdbk_config, component.fdbk_presets
        )).toEqual("Custom");

        let ultimate_submission_config_panel = wrapper.find({ref: 'final_graded'});
        let ultimate_submission_edit_settings = <EditFeedbackSettingsAGSuite> wrapper.find({
            ref: 'final_graded_edit_feedback_settings'
        }).vm;

        ultimate_submission_config_panel.find('#config-preset-select').setValue(
            "Pass/Fail Setup"
        );
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.ultimate_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Pass/Fail Setup");
        expect(component.get_current_preset_fn(
            ultimate_submission_edit_settings.d_ag_test_suite_settings,
            component.fdbk_presets
        )).toEqual("Pass/Fail Setup");

        ultimate_submission_config_panel.find('#config-preset-select').setValue(
            "Public Setup"
        );
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.ultimate_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Public Setup");
        expect(component.get_current_preset_fn(
            ultimate_submission_edit_settings.d_ag_test_suite_settings,
            component.fdbk_presets
        )).toEqual("Public Setup");

        ultimate_submission_config_panel.find('#config-preset-select').setValue(
            "Private Setup"
        );
        await component.$nextTick();

        expect(component.get_current_preset_fn(
            component.d_ag_test_suite!.ultimate_submission_fdbk_config,
            component.fdbk_presets
        )).toEqual("Private Setup");
        expect(component.get_current_preset_fn(
            ultimate_submission_edit_settings.d_ag_test_suite_settings,
            component.fdbk_presets
        )).toEqual("Private Setup");

    });

    test("update_config_settings in edit_feedback_settings_ag_suite - changes reflected in " +
         "selected_preset_name in config_panel",
         async () => {
        let normal_config_panel = wrapper.find({ref: 'normal'});
        let normal_config_panel_component = <ConfigPanel> normal_config_panel.vm;

        expect(normal_config_panel_component.selected_preset_name).toEqual("Custom");

        normal_config_panel.find('.advanced-settings-label').trigger('click');
        await component.$nextTick();

        wrapper.find('#normal-show-individual-tests').setChecked(true);
        expect(normal_config_panel_component.selected_preset_name).toEqual("Private Setup");

        wrapper.find('#normal-show-setup-return-code').setChecked(true);
        expect(normal_config_panel_component.selected_preset_name).toEqual("Custom");

        wrapper.find('#normal-show-setup-timed-out').setChecked(true);
        expect(normal_config_panel_component.selected_preset_name).toEqual("Pass/Fail Setup");
    });

    test("checkboxes in config panels do not react to changes in " +
         "other panels",
         async () => {
        expect(
            component.d_ag_test_suite!.normal_fdbk_config.show_setup_timed_out
        ).toBe(false);
        expect(
            component.d_ag_test_suite!.ultimate_submission_fdbk_config.show_setup_timed_out
        ).toBe(false);
        expect(
            component.d_ag_test_suite!.past_limit_submission_fdbk_config.show_setup_timed_out
        ).toBe(false);
        expect(
            component.d_ag_test_suite!.staff_viewer_fdbk_config.show_setup_timed_out
        ).toBe(false);

        wrapper.findAll('.advanced-settings-label').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(1).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(2).trigger('click');
        await component.$nextTick();

        wrapper.findAll('.advanced-settings-label').at(3).trigger('click');
        await component.$nextTick();

        wrapper.find('#final-graded-show-setup-timed-out').setChecked(true);
        expect(
            component.d_ag_test_suite!.normal_fdbk_config.show_setup_timed_out
        ).toBe(false);
        expect(
            component.d_ag_test_suite!.ultimate_submission_fdbk_config.show_setup_timed_out
        ).toBe(true);
        expect(
            component.d_ag_test_suite!.past_limit_submission_fdbk_config.show_setup_timed_out
        ).toBe(false);
        expect(
            component.d_ag_test_suite!.staff_viewer_fdbk_config.show_setup_timed_out
        ).toBe(false);
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
