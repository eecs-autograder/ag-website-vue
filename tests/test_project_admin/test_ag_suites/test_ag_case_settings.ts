import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';

describe('', () => {
    let wrapper: Wrapper<AGCaseSettings>;
    let component: AGCaseSettings;
    let ag_case: AGTestCase;
    let default_case_feedback_config: AGTestCaseFeedbackConfig;

    beforeEach(() => {
        default_case_feedback_config = {
            visible: false,
            show_individual_commands: false
        };

        ag_case = new AGTestCase({
            pk: 2,
            name: "Case in Point",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });

        wrapper = mount(AGCaseSettings, {
            propsData: {
                test_case: ag_case
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('error - case name is blank', async () => {
        let name_input = wrapper.find({ref: "name"}).find('#input');
        let name_validator = <ValidatedInput> wrapper.find({ref: "name"}).vm;

        (<HTMLInputElement> name_input.element).value = "Rain";
        name_input.trigger('input');
        await component.$nextTick();

        expect(name_validator.is_valid).toBe(true);
        expect(wrapper.find('#save-button').is('[disabled]')).toBe(false);

        (<HTMLInputElement> name_input.element).value = " ";
        name_input.trigger('input');
        await component.$nextTick();

        expect(name_validator.is_valid).toBe(false);
        expect(wrapper.find('#save-button').is('[disabled]')).toBe(true);
    });

    test('test_case Watcher', async () => {
        await component.$nextTick();
        expect(component.d_test_case!.name).toEqual(ag_case.name);

        let another_case = new AGTestCase({
            pk: 3,
            name: "Best Case Scenario",
            ag_test_suite: 1,
            normal_fdbk_config: default_case_feedback_config,
            ultimate_submission_fdbk_config: default_case_feedback_config,
            past_limit_submission_fdbk_config: default_case_feedback_config,
            staff_viewer_fdbk_config: default_case_feedback_config,
            last_modified: '',
            ag_test_commands: []
        });
        expect(component.d_test_case).toEqual(ag_case);

        wrapper.setProps({test_case: another_case});
        await component.$nextTick();

        expect(component.d_test_case).toEqual(another_case);
    });

    test('save d_ag_case - successful', async () => {
        let save_case_stub = sinon.stub(component.d_test_case!, 'save');

        wrapper.find({ref: 'ag_case_settings_form'}).trigger('submit');
        await component.$nextTick();

        expect(save_case_stub.calledOnce).toBe(true);
    });

    test('save d_ag_case - unsuccessful', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "An AG Test Case with this name already exists in the suite."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        let save_case_stub = sinon.stub(component.d_test_case!, 'save').returns(
            Promise.reject(axios_response_instance)
        );

        wrapper.find({ref: 'ag_case_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_case_stub.calledOnce).toBe(true);
        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});

