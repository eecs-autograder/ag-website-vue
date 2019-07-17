import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    HttpError
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import FeedbackConfigAGCase from '@/components/feedback_config/feedback_config/feedback_config_ag_case.vue';

import { create_ag_case } from '@/tests/data_utils';

export enum FeedbackConfigLabel {
    normal = "Normal",
    ultimate_submission = "Ultimate Submission",
    past_limit = "Past Limit",
    staff_viewer = "Student Lookup"
}

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
