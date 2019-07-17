import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    HttpError
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import FeedbackConfigAGCase from '@/components/feedback_config/feedback_config/feedback_config_ag_case.vue';

import { create_ag_case } from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('FeedbackConfigAGCase tests', () => {
    let wrapper: Wrapper<FeedbackConfigAGCase>;
    let component: FeedbackConfigAGCase;
    let ag_test_case: AGTestCase;

    beforeEach(() => {

        ag_test_case = create_ag_case(1, "Case 1", 1);

        wrapper = mount(FeedbackConfigAGCase, {
            propsData: {
                ag_test_case: ag_test_case
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('update_config_settings - checkbox ids are unique to a config panel', async () => {
        expect(component.d_ag_test_case!.normal_fdbk_config.visible).toBe(false);
        expect(component.d_ag_test_case!.ultimate_submission_fdbk_config.visible).toBe(false);
        expect(component.d_ag_test_case!.past_limit_submission_fdbk_config.visible).toBe(false);
        expect(component.d_ag_test_case!.staff_viewer_fdbk_config.visible).toBe(false);

        wrapper.find('#normal-visible').setChecked(true);

        expect(component.d_ag_test_case!.normal_fdbk_config.visible).toBe(true);
        expect(component.d_ag_test_case!.ultimate_submission_fdbk_config.visible).toBe(false);
        expect(component.d_ag_test_case!.past_limit_submission_fdbk_config.visible).toBe(false);
        expect(component.d_ag_test_case!.staff_viewer_fdbk_config.visible).toBe(false);

        expect(component.d_ag_test_case!.normal_fdbk_config
                   .show_individual_commands).toBe(false);
        expect(component.d_ag_test_case!.ultimate_submission_fdbk_config
                   .show_individual_commands).toBe(false);
        expect(component.d_ag_test_case!.past_limit_submission_fdbk_config
                   .show_individual_commands).toBe(false);
        expect(component.d_ag_test_case!.staff_viewer_fdbk_config
                   .show_individual_commands).toBe(false);

        wrapper.find('#normal-show-individual-commands').setChecked(true);

        expect(component.d_ag_test_case!.normal_fdbk_config
                   .show_individual_commands).toBe(true);
        expect(component.d_ag_test_case!.ultimate_submission_fdbk_config
                   .show_individual_commands).toBe(false);
        expect(component.d_ag_test_case!.past_limit_submission_fdbk_config
                   .show_individual_commands).toBe(false);
        expect(component.d_ag_test_case!.staff_viewer_fdbk_config
                   .show_individual_commands).toBe(false);
    });

    test("save d_ag_test_case settings - successful", async () => {
        let save_stub = sinon.stub(component.d_ag_test_case!, 'save');

        wrapper.find('.save-feedback-config-settings').trigger('click');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test("save d_ag_test_case settings - unsuccessful", async () => {
        let save_stub = sinon.stub(component.d_ag_test_case!, 'save');
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
