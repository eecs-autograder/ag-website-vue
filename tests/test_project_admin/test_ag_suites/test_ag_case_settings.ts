import { mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    HttpError
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { create_ag_case, create_ag_command } from '@/tests/data_utils';
import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

describe('AG test case settings form tests', () => {
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
                ag_test_case: ag_case
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('case name binding', () => {
       let case_name_input = wrapper.find({ref: 'name'});

       set_validated_input_text(case_name_input, "Case 1");
       expect(validated_input_is_valid(case_name_input)).toBe(true);
       expect(component.d_ag_test_case!.name).toEqual("Case 1");

       component.d_ag_test_case!.name = "Case 2";
       expect(get_validated_input_text(case_name_input)).toEqual("Case 2");
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

    test('save d_ag_case - successful', async () => {
        let save_case_stub = sinon.stub(component.d_ag_test_case!, 'save');

        wrapper.find({ref: 'ag_test_case_settings_form'}).trigger('submit');
        await component.$nextTick();

        expect(save_case_stub.calledOnce).toBe(true);
    });

    test('save d_ag_case - unsuccessful', async () => {
        let save_case_stub = sinon.stub(component.d_ag_test_case!, 'save').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "An AG Test Case with this name already exists in the suite."}
                )
            )
        );

        wrapper.find({ref: 'ag_test_case_settings_form'}).trigger('submit');
        await component.$nextTick();

        expect(save_case_stub.calledOnce).toBe(true);
        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('FeedbackCongfigAGCase component only available when ag_test_case has more than ' +
         'one command',
         async () => {
        let case_2 = create_ag_case(2, "Case 2", 1);
        case_2.ag_test_commands = [
            create_ag_command(40, "Command 40", 2),
            create_ag_command(50, "Command 50", 2)
        ];

        wrapper.setProps({ag_test_case: case_2});
        await component.$nextTick();

        expect(wrapper.findAll('.ag-case-feedback-panels').length).toEqual(1);

        let case_3 = create_ag_case(2, "Case 3", 1);
        case_3.ag_test_commands = [
            create_ag_command(60, "Command 60", 3),
        ];

        wrapper.setProps({ag_test_case: case_3});
        await component.$nextTick();

        expect(wrapper.findAll('.ag-case-feedback-panels').length).toEqual(0);
    });

    test('ag_test_case Watcher', async () => {
        await component.$nextTick();
        expect(component.d_ag_test_case!.name).toEqual(ag_case.name);

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
        expect(component.d_ag_test_case).toEqual(ag_case);

        wrapper.setProps({ag_test_case: another_case});
        await component.$nextTick();

        expect(component.d_ag_test_case).toEqual(another_case);
    });
});

