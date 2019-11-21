import { config, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCommand,
    AGTestSuite,
    HttpError,
    Project,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGSuitePanel from '@/components/project_admin/ag_suites/ag_suite_panel.vue';
import ValidatedInput from '@/components/validated_input.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuitePanel tests', () => {
    let wrapper: Wrapper<AGSuitePanel>;
    let component: AGSuitePanel;
    let project: Project;
    let ag_suite: AGTestSuite;
    let ag_case_a: AGTestCase;
    let ag_case_b: AGTestCase;
    let ag_case_c: AGTestCase;
    let ag_command: AGTestCommand;
    let case_from_different_suite: AGTestCase;

    beforeEach(() => {
        project = data_ut.make_project(data_ut.make_course().pk);
        ag_suite = data_ut.make_ag_test_suite(project.pk);

        ag_case_a = data_ut.make_ag_test_case(ag_suite.pk);
        ag_command = data_ut.make_ag_test_command(ag_case_a.pk);

        ag_case_b = data_ut.make_ag_test_case(ag_suite.pk);
        ag_case_c = data_ut.make_ag_test_case(ag_suite.pk);

        ag_suite.ag_test_cases = [ag_case_a, ag_case_b, ag_case_c];

        case_from_different_suite = data_ut.make_ag_test_case(
            data_ut.make_ag_test_suite(project.pk).pk);

        wrapper = managed_mount(AGSuitePanel, {
            propsData: {
                ag_test_suite: ag_suite,
                active_ag_test_suite: null,
                active_ag_test_command: null
            }
        });
        component = wrapper.vm;
    });

    test('Click on suite that is closed, inactive, child command is not active', async () => {
        wrapper.findAll('.panel').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_suite);
        expect(component.d_cases_are_visible).toBe(true);
    });

    test('Click on suite that is open, inactive, child command is not active', async () => {
        let another_suite = data_ut.make_ag_test_suite(project.pk);

        wrapper.findAll('.panel').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_suite);

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.setProps({active_ag_test_suite: another_suite});
        await component.$nextTick();

        wrapper.findAll('.panel').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[1][0]).toEqual(ag_suite);
        expect(component.d_cases_are_visible).toBe(true);
    });

    test('Click on suite that is open, active, child command is not active', async () => {
        wrapper.findAll('.panel').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted('update_active_item').length).toEqual(1);

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        expect(component.d_cases_are_visible).toBe(true);

        wrapper.findAll('.panel').at(0).trigger('click');
        await component.$nextTick();

        expect(component.d_cases_are_visible).toBe(false);
    });

    test('Click on suite that is open, inactive, with active child command', async () => {
        wrapper.setProps({active_ag_test_command: ag_command});
        await component.$nextTick();

        expect(component.d_cases_are_visible).toBe(true);

        wrapper.find('.panel').trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_suite);
    });

    test('Command in suite becomes active', async () => {
        wrapper.setProps({active_ag_test_command: ag_command});
        await component.$nextTick();

        expect(component.d_cases_are_visible).toBe(true);
        expect(component.is_open).toBe(true);
    });

    test('Clicking on inactive suite panel emits event', async () => {
        expect(component.active_ag_test_suite).toBeNull();

        wrapper.find('.panel').trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted('update_active_item').length).toEqual(1);
    });

    test('d_new_case_name binding', async () => {
        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        let d_new_case_name_input = wrapper.find({ref: 'new_case_name'});

        set_validated_input_text(d_new_case_name_input, "Case 1");
        expect(validated_input_is_valid(d_new_case_name_input)).toBe(true);
        expect(component.d_new_case_name).toEqual("Case 1");

        component.d_new_case_name = "Case 2";
        expect(get_validated_input_text(d_new_case_name_input)).toEqual("Case 2");
    });

    test('Add case with first command having the same name - successful', async () => {
        let new_case = data_ut.make_ag_test_case(ag_suite.pk);
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        expect(component.d_new_case_name).toEqual("");
        expect(component.d_new_commands[0]).toEqual({name: "", cmd: ""});

        component.d_new_case_name = "Case 2";
        component.d_new_commands[0].cmd = "Sit down";

        wrapper.find({ref: 'create_ag_test_case_form'}).trigger('submit');
        await component.$nextTick();

        expect(create_case_stub.calledOnce).toBe(true);
        expect(create_case_stub.firstCall.args[1].name).toEqual("Case 2");
        expect(create_command_stub.calledOnce).toBe(true);
        expect(create_command_stub.firstCall.args[1].name).toEqual("Case 2");
    });

    test('Add case with two commands, first command has same name as case - successful',
         async () => {
        let new_case = data_ut.make_ag_test_case(ag_suite.pk);
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        expect(component.d_new_case_name).toEqual("");
        expect(component.d_new_commands[0]).toEqual({name: "", cmd: ""});

        component.d_new_case_name = "Casey";

        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();

        component.d_new_commands[0].cmd = "apples";
        component.d_new_commands[1].name = "BANANAS";
        component.d_new_commands[1].cmd = "bananas";

        wrapper.find({ref: 'create_ag_test_case_form'}).trigger('submit');
        await component.$nextTick();

        expect(create_case_stub.calledOnce).toBe(true);
        expect(create_case_stub.firstCall.args[1].name).toEqual("Casey");
        expect(create_command_stub.calledTwice).toBe(true);
        expect(create_command_stub.firstCall.args[1].name).toEqual("Casey");
        expect(create_command_stub.firstCall.args[1].cmd).toEqual("apples");
        expect(create_command_stub.secondCall.args[1].name).toEqual("BANANAS");
        expect(create_command_stub.secondCall.args[1].cmd).toEqual("bananas");
    });

    test('Add case with two commands, first command has a different name - successful',
         async () => {
        let new_case = data_ut.make_ag_test_case(ag_suite.pk);
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        expect(component.d_new_case_name).toEqual("");
        expect(component.d_new_commands[0]).toEqual({name: "", cmd: ""});

        component.d_new_case_name = "Casey";

        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();

        component.d_new_commands[0].name = "APPLES";
        component.d_new_commands[0].cmd = "apples";
        component.d_new_commands[1].name = "BANANAS";
        component.d_new_commands[1].cmd = "bananas";

        wrapper.find({ref: 'create_ag_test_case_form'}).trigger('submit');
        await component.$nextTick();

        expect(create_case_stub.calledOnce).toBe(true);
        expect(create_case_stub.firstCall.args[1].name).toEqual("Casey");
        expect(create_command_stub.calledTwice).toBe(true);
        expect(create_command_stub.firstCall.args[1].name).toEqual("APPLES");
        expect(create_command_stub.firstCall.args[1].cmd).toEqual("apples");
        expect(create_command_stub.secondCall.args[1].name).toEqual("BANANAS");
        expect(create_command_stub.secondCall.args[1].cmd).toEqual("bananas");
    });

    test('Attempt to add case with duplicate command name present', async () => {
        let new_case = data_ut.make_ag_test_case(ag_suite.pk);

        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        expect(component.d_new_case_name).toEqual("");
        expect(component.d_new_commands[0]).toEqual({name: "", cmd: ""});

        component.d_new_case_name = "Casey";

        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();
        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();

        component.d_new_commands[0].name = "APPLES";
        component.d_new_commands[0].cmd = "apples";
        component.d_new_commands[1].name = "BANANAS";
        component.d_new_commands[1].cmd = "bananas";
        component.d_new_commands[2].name = "APPLES";
        component.d_new_commands[2].cmd = "cherries";

        wrapper.find({ref: 'create_ag_test_case_form'}).trigger('submit');
        await component.$nextTick();

        expect(create_case_stub.callCount).toEqual(0);
        expect(create_command_stub.callCount).toEqual(0);

        expect(wrapper.findAll('.duplicate-ag-test-command-msg').length).toEqual(2);
    });

    test('Add test case - unsuccessful', async () => {
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test case with this Name and AG test suite already exists."})
            )
        );
        sinon.stub(AGTestCommand, 'create');

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        component.d_new_case_name = "Case A";
        component.d_new_commands[0].cmd = "stand up";

        wrapper.find({ref: 'create_ag_test_case_form'}).trigger('submit');
        await component.$nextTick();

        expect(create_case_stub.callCount).toEqual(1);

        let api_errors = <APIErrors> wrapper.find({ref: 'new_ag_test_case_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Remove command from create_case_modal', async () => {
        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(false);
        expect(wrapper.find({ref: 'new_ag_test_case_modal'}).exists()).toBe(false);

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_case_modal'}).exists()).toBe(true);

        expect(component.d_new_case_name).toEqual("");
        expect(component.d_new_commands[0]).toEqual({name: "", cmd: ""});

        component.d_new_case_name = "Casey";
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(0);

        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(2);

        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(3);

        wrapper.findAll('.remove-ag-test-command-button').at(0).trigger('click');
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(2);

        wrapper.findAll('.remove-ag-test-command-button').at(1).trigger('click');
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(0);
    });

    test('Opening and closing new test case modal preserves number of commands', async () => {
        wrapper.setProps({active_suite: ag_suite});
        await component.$nextTick();

        expect(component.ag_test_suite.ag_test_cases.length).toEqual(3);

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_case_modal'}).exists()).toBe(true);

        wrapper.find({ref: 'new_ag_test_case_modal'}).vm.$emit('close');
        await component.$nextTick();

        expect(component.ag_test_suite.ag_test_cases.length).toEqual(3);
        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(false);
        expect(wrapper.find({ref: 'new_ag_test_case_modal'}).exists()).toBe(false);
    });

    test('is_active_suite getter', async () => {
        let another_suite = data_ut.make_ag_test_suite(project.pk);
        expect(component.suite_is_active).toBe(false);

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        expect(component.suite_is_active).toBe(true);

        wrapper.setProps({active_ag_test_suite: another_suite});
        await component.$nextTick();

        expect(component.suite_is_active).toBe(false);
    });

    test('error - new case name is blank', async () => {
        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');

        let new_case_name_input = wrapper.find({ref: 'new_case_name'}).find('#input');
        let new_case_name_validator = <ValidatedInput> wrapper.find({ref: 'new_case_name'}).vm;

        expect(new_case_name_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_case_name_input.element).value = "Paradise";
        new_case_name_input.trigger('input');
        await component.$nextTick();

        expect(new_case_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_case_name_input.element).value = " ";
        new_case_name_input.trigger('input');
        await component.$nextTick();

        expect(new_case_name_validator.is_valid).toBe(false);
        expect(wrapper.find('.modal-create-button').is('[disabled]')).toBe(true);
    });

    test('new_command.name binding', async () => {
        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();

        let first_new_command_name_input = wrapper.findAll({ref: 'command_name'}).at(0);

        set_validated_input_text(first_new_command_name_input, "Pasta");
        expect(validated_input_is_valid(first_new_command_name_input)).toBe(true);
        expect(component.d_new_commands[0].name).toEqual("Pasta");

        component.d_new_commands[0].name = "Pizza";
        expect(get_validated_input_text(first_new_command_name_input)).toEqual("Pizza");
    });

    test('error - new command name is blank', async () => {
        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-ag-test-command-button').trigger('click');
        await component.$nextTick();

        let new_command_name_input = wrapper.findAll(
            {ref: 'command_name'}
        ).at(0).find('#input');
        let new_command_name_validator = <ValidatedInput> wrapper.findAll(
            {ref: 'command_name'}
        ).at(0).vm;

        expect(new_command_name_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_name_input.element).value = "Great";
        new_command_name_input.trigger('input');
        await component.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_name_input.element).value = " ";
        new_command_name_input.trigger('input');
        await component.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(false);

        expect(wrapper.find('.modal-create-button').is(
            '[disabled]'
        )).toBe(true);
    });

    test('new_command.cmd binding', async () => {
        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');
        await component.$nextTick();

        let first_new_command_input = wrapper.find({ref: 'command'});

        set_validated_input_text(first_new_command_input, "Lasagna");
        expect(validated_input_is_valid(first_new_command_input)).toBe(true);
        expect(component.d_new_commands[0].cmd).toEqual("Lasagna");

        component.d_new_commands[0].cmd = "Spaghetti";
        expect(get_validated_input_text(first_new_command_input)).toEqual("Spaghetti");
    });

    test('error - new command is blank', async () => {
        wrapper.setProps({active_ag_test_suite: ag_suite});
        await component.$nextTick();

        wrapper.find('.icons .fa-plus').trigger('click');

        let new_command_input = wrapper.find({ref: 'command'}).find('#input');
        let new_command_validator = <ValidatedInput> wrapper.find({ref: 'command'}).vm;

        expect(new_command_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_input.element).value = "Splendid";
        new_command_input.trigger('input');
        await component.$nextTick();

        expect(new_command_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_input.element).value = " ";
        new_command_input.trigger('input');
        await component.$nextTick();

        expect(new_command_validator.is_valid).toBe(false);
        expect(wrapper.find('.modal-create-button').is(
            '[disabled]'
        )).toBe(true);
    });

    test('Watcher for test_suite', async () => {
        let another_suite = data_ut.make_ag_test_suite(project.pk);
        expect(component.ag_test_suite).toEqual(ag_suite);

        wrapper.setProps({ag_test_suite: another_suite});
        await component.$nextTick();

        expect(component.ag_test_suite).toEqual(another_suite);
    });

    test('duplicate_command_name getter', async () => {
        component.d_new_commands = [
            {name: "Anna", cmd: "Kendrick"}
        ];
        expect(component.duplicate_command_name).toEqual("");

        component.d_new_commands = [
            {name: "Anna", cmd: "Kendrick"},
            {name: "Rebel", cmd: "Wilson"}
        ]; // different names
        expect(component.duplicate_command_name).toEqual("");

        component.d_new_commands = [
            {name: "Anna", cmd: "Kendrick"},
            {name: "Anna", cmd: "Camp"}
        ]; // same name
        expect(component.duplicate_command_name).toEqual("Anna");

        component.d_new_commands = [
            {name: "Adam", cmd: "DeVine"},
            {name: "Adam", cmd: "Levine"},
            {name: "Brittany", cmd: "Snow"}
        ];  // 1 and 2 same name
        expect(component.duplicate_command_name).toEqual("Adam");

        component.d_new_commands = [
            {name: "Ester", cmd: "Dean"},
            {name: "Anna", cmd: "Camp"},
            {name: "Anna", cmd: "Kendrick"}
        ];  // 2 and 3 same name
        expect(component.duplicate_command_name).toEqual("Anna");

        component.d_new_commands = [
            {name: "Adam", cmd: "DeVine"},
            {name: "Brittany", cmd: "Snow"},
            {name: "Adam", cmd: "Levine"}
        ];  // 1 and 3 same name
        expect(component.duplicate_command_name).toEqual("Adam");

        component.d_new_commands = [
            {name: "Ester", cmd: "Dean"},
            {name: "Anna", cmd: "Camp"},
            {name: "Rebel", cmd: "Wilson"}
        ];  // all have different names
        expect(component.duplicate_command_name).toEqual("");
    });
});

test('Update test cases order', async () => {
    let order_stub = sinon.stub(AGTestCase, 'update_order');
    let suite = data_ut.make_ag_test_suite(data_ut.make_project(data_ut.make_course().pk).pk);
    let test_cases = [
        data_ut.make_ag_test_case(suite.pk),
        data_ut.make_ag_test_case(suite.pk),
        data_ut.make_ag_test_case(suite.pk),
    ];
    suite.ag_test_cases = test_cases;
    let wrapper = managed_mount(AGSuitePanel, {
        propsData: {
            ag_test_suite: suite,
            active_ag_test_suite: null,
            active_ag_test_command: null
        }
    });
    wrapper.find('.panel').trigger('click');
    await wrapper.vm.$nextTick();

    wrapper.find({ref: 'ag_test_case_order'}).vm.$emit('change');
    await wrapper.vm.$nextTick();
    expect(
        order_stub.calledOnceWith(suite.pk, test_cases.map(test_case => test_case.pk))
    ).toBe(true);
});
