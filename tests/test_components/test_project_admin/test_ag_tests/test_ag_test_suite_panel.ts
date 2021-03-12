import { Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCommand,
    AGTestSuite,
    HttpError,
    Project,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGTestSuitePanel from '@/components/project_admin/ag_tests/ag_test_suite_panel.vue';
import ValidatedInput from '@/components/validated_input.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    emitted,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid,
    wait_until
} from '@/tests/utils';


describe('AGTestSuitePanel tests', () => {
    let wrapper: Wrapper<AGTestSuitePanel>;
    let project: Project;
    let ag_suite: AGTestSuite;
    let ag_command: AGTestCommand;
    let case_from_different_suite: AGTestCase;

    beforeEach(() => {
        project = data_ut.make_project(data_ut.make_course().pk);
        ag_suite = data_ut.make_ag_test_suite(project.pk);

        ag_suite.ag_test_cases = [
            data_ut.make_ag_test_case(ag_suite.pk),
            data_ut.make_ag_test_case(ag_suite.pk),
            data_ut.make_ag_test_case(ag_suite.pk),
        ];

        ag_command = data_ut.make_ag_test_command(ag_suite.ag_test_cases[0].pk);

        case_from_different_suite = data_ut.make_ag_test_case(
            data_ut.make_ag_test_suite(project.pk).pk);

        wrapper = managed_mount(AGTestSuitePanel, {
            propsData: {
                ag_test_suite: ag_suite,
                active_ag_test_suite: null,
                active_ag_test_command: null
            }
        });
    });

    test('Click on suite that is closed, inactive, child command is not active', async () => {
        wrapper.findAll('.panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_suite);
        expect(wrapper.vm.d_cases_are_visible).toBe(true);
    });

    test('Click on suite that is open, inactive, child command is not active', async () => {
        let another_suite = data_ut.make_ag_test_suite(project.pk);

        wrapper.findAll('.panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_suite);

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.vm.$nextTick();

        wrapper.setProps({active_ag_test_suite: another_suite});
        await wrapper.vm.$nextTick();

        wrapper.findAll('.panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[1][0]).toEqual(ag_suite);
        expect(wrapper.vm.d_cases_are_visible).toBe(true);
    });

    test('Click on suite that is open, active, child command is not active', async () => {
        wrapper.findAll('.panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item').length).toEqual(1);

        wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_cases_are_visible).toBe(true);

        wrapper.findAll('.panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_cases_are_visible).toBe(false);
    });

    test('Click on suite that is open, inactive, with active child command', async () => {
        wrapper.setProps({active_ag_test_command: ag_command});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_cases_are_visible).toBe(true);

        wrapper.find('.panel').trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_suite);
    });

    test('Command in suite becomes active', async () => {
        wrapper.setProps({active_ag_test_command: ag_command});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_cases_are_visible).toBe(true);
        expect(wrapper.vm.is_open).toBe(true);
    });

    test('Clicking on inactive suite panel emits event', async () => {
        expect(wrapper.vm.active_ag_test_suite).toBeNull();

        wrapper.find('.panel').trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item').length).toEqual(1);
    });

    test('d_new_case_name binding', async () => {
        await wrapper.setProps({active_ag_test_suite: ag_suite});

        await wrapper.find('.icons .fa-plus').trigger('click');

        let d_new_case_name_input = wrapper.findComponent({ref: 'new_case_name'});

        await set_validated_input_text(d_new_case_name_input, "Case 1");
        expect(validated_input_is_valid(d_new_case_name_input)).toBe(true);
        expect(wrapper.vm.d_new_case_name).toEqual("Case 1");

        wrapper.vm.d_new_case_name = "Case 2";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(d_new_case_name_input)).toEqual("Case 2");
    });

    test('Add case with first command having the same name - successful', async () => {
        let new_case = data_ut.make_ag_test_case(ag_suite.pk);
        let create_case_stub = sinon.stub(AGTestCase, 'create').returns(Promise.resolve(new_case));
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        await wrapper.setProps({active_ag_test_suite: ag_suite});

        await wrapper.find('.icons .fa-plus').trigger('click');

        expect(wrapper.vm.d_new_case_name).toEqual("");
        expect(wrapper.vm.d_new_commands[0]).toEqual({name: "", cmd: ""});

        wrapper.vm.d_new_case_name = "Case 2";
        wrapper.vm.d_new_commands[0].cmd = "Sit down";
        await wrapper.vm.$nextTick();

        await wrapper.findComponent({ref: 'create_ag_test_case_form'}).trigger('submit');

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

        await wrapper.setProps({active_suite: ag_suite});

        await wrapper.find('.icons .fa-plus').trigger('click');

        expect(wrapper.vm.d_new_case_name).toEqual("");
        expect(wrapper.vm.d_new_commands[0]).toEqual({name: "", cmd: ""});

        wrapper.vm.d_new_case_name = "Casey";
        await wrapper.vm.$nextTick();

        await wrapper.find('.add-ag-test-command-button').trigger('click');

        wrapper.vm.d_new_commands[0].cmd = "apples";
        wrapper.vm.d_new_commands[1].name = "BANANAS";
        wrapper.vm.d_new_commands[1].cmd = "bananas";
        await wrapper.vm.$nextTick();

        await wrapper.findComponent({ref: 'create_ag_test_case_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_case)).toBe(true);
        await wrapper.vm.$nextTick();

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

        await wrapper.setProps({active_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');

        expect(wrapper.vm.d_new_case_name).toEqual("");
        expect(wrapper.vm.d_new_commands[0]).toEqual({name: "", cmd: ""});

        wrapper.vm.d_new_case_name = "Casey";
        await wrapper.vm.$nextTick();

        await wrapper.find('.add-ag-test-command-button').trigger('click');

        wrapper.vm.d_new_commands[0].name = "APPLES";
        wrapper.vm.d_new_commands[0].cmd = "apples";
        wrapper.vm.d_new_commands[1].name = "BANANAS";
        wrapper.vm.d_new_commands[1].cmd = "bananas";
        await wrapper.vm.$nextTick();

        await wrapper.findComponent({ref: 'create_ag_test_case_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_case)).toBe(true);
        await wrapper.vm.$nextTick();

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

        await wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');

        expect(wrapper.vm.d_new_case_name).toEqual("");
        expect(wrapper.vm.d_new_commands[0]).toEqual({name: "", cmd: ""});

        wrapper.vm.d_new_case_name = "Casey";
        await wrapper.vm.$nextTick();

        await wrapper.find('.add-ag-test-command-button').trigger('click');
        await wrapper.find('.add-ag-test-command-button').trigger('click');

        wrapper.vm.d_new_commands[0].name = "APPLES";
        wrapper.vm.d_new_commands[0].cmd = "apples";
        wrapper.vm.d_new_commands[1].name = "BANANAS";
        wrapper.vm.d_new_commands[1].cmd = "bananas";
        wrapper.vm.d_new_commands[2].name = "APPLES";
        wrapper.vm.d_new_commands[2].cmd = "cherries";
        await wrapper.vm.$nextTick();

        await wrapper.findComponent({ref: 'create_ag_test_case_form'}).trigger('submit');

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

        await wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');

        wrapper.vm.d_new_case_name = "Case A";
        wrapper.vm.d_new_commands[0].cmd = "stand up";
        await wrapper.vm.$nextTick();

        await wrapper.findComponent({ref: 'create_ag_test_case_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_case)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(create_case_stub.callCount).toEqual(1);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'new_ag_test_case_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Remove command from create_case_modal', async () => {
        await wrapper.setProps({active_suite: ag_suite});

        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'new_ag_test_case_modal'}).exists()).toBe(false);

        await wrapper.find('.icons .fa-plus').trigger('click');

        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'new_ag_test_case_modal'}).exists()).toBe(true);

        expect(wrapper.vm.d_new_case_name).toEqual("");
        expect(wrapper.vm.d_new_commands[0]).toEqual({name: "", cmd: ""});

        wrapper.vm.d_new_case_name = "Casey";
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(0);

        await wrapper.find('.add-ag-test-command-button').trigger('click');
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(2);

        await wrapper.find('.add-ag-test-command-button').trigger('click');
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(3);

        await wrapper.findAll('.remove-ag-test-command-button').at(0).trigger('click');
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(2);

        await wrapper.findAll('.remove-ag-test-command-button').at(1).trigger('click');
        expect(wrapper.findAll('.remove-ag-test-command-button').length).toEqual(0);
    });

    test('Opening and closing new test case modal preserves number of commands', async () => {
        await wrapper.setProps({active_suite: ag_suite});
        expect(wrapper.vm.ag_test_suite.ag_test_cases.length).toEqual(3);

        await wrapper.find('.icons .fa-plus').trigger('click');
        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'new_ag_test_case_modal'}).exists()).toBe(true);

        wrapper.findComponent({ref: 'new_ag_test_case_modal'}).vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite.ag_test_cases.length).toEqual(3);
        expect(wrapper.vm.d_show_new_ag_test_case_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'new_ag_test_case_modal'}).exists()).toBe(false);
    });

    test('is_active_suite getter', async () => {
        let another_suite = data_ut.make_ag_test_suite(project.pk);
        expect(wrapper.vm.suite_is_active).toBe(false);

        await wrapper.setProps({active_ag_test_suite: ag_suite});
        expect(wrapper.vm.suite_is_active).toBe(true);

        await wrapper.setProps({active_ag_test_suite: another_suite});
        expect(wrapper.vm.suite_is_active).toBe(false);
    });

    test('error - new case name is blank', async () => {
        await wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');

        let new_case_name_input = wrapper.findComponent({ref: 'new_case_name'});
        let new_case_name_validator
            = <ValidatedInput> wrapper.findComponent({ref: 'new_case_name'}).vm;

        expect(new_case_name_validator.is_valid).toBe(false);

        await set_validated_input_text(new_case_name_input, "Paradise");
        expect(new_case_name_validator.is_valid).toBe(true);

        await set_validated_input_text(new_case_name_input, " ");
        expect(new_case_name_validator.is_valid).toBe(false);
        expect(wrapper.find('.modal-create-button').element).toBeDisabled();
    });

    test('new_command.name binding', async () => {
        await wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');
        await wrapper.find('.add-ag-test-command-button').trigger('click');

        let first_new_command_name_input = wrapper.findAllComponents({ref: 'command_name'}).at(0);

        await set_validated_input_text(first_new_command_name_input, "Pasta");
        expect(validated_input_is_valid(first_new_command_name_input)).toBe(true);
        expect(wrapper.vm.d_new_commands[0].name).toEqual("Pasta");

        wrapper.vm.d_new_commands[0].name = "Pizza";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(first_new_command_name_input)).toEqual("Pizza");
    });

    test('error - new command name is blank', async () => {
        await wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');
        await wrapper.find('.add-ag-test-command-button').trigger('click');

        let new_command_name_input = wrapper.findAllComponents({ref: 'command_name'}).at(0);
        let new_command_name_validator = <ValidatedInput> wrapper.findAllComponents({
            ref: 'command_name'
        }).at(0).vm;

        expect(new_command_name_validator.is_valid).toBe(false);

        await set_validated_input_text(new_command_name_input, "Great");
        expect(new_command_name_validator.is_valid).toBe(true);

        await set_validated_input_text(new_command_name_input, " ");
        expect(new_command_name_validator.is_valid).toBe(false);

        await wrapper.vm.$nextTick();
        expect(wrapper.find('.modal-create-button').element).toBeDisabled();
    });

    test('new_command.cmd binding', async () => {
        await wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');

        let first_new_command_input = wrapper.findComponent({ref: 'command'});

        await set_validated_input_text(first_new_command_input, "Lasagna");
        expect(validated_input_is_valid(first_new_command_input)).toBe(true);
        expect(wrapper.vm.d_new_commands[0].cmd).toEqual("Lasagna");

        wrapper.vm.d_new_commands[0].cmd = "Spaghetti";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(first_new_command_input)).toEqual("Spaghetti");
    });

    test('error - new command is blank', async () => {
        await wrapper.setProps({active_ag_test_suite: ag_suite});
        await wrapper.find('.icons .fa-plus').trigger('click');

        let new_command_input = wrapper.findComponent({ref: 'command'});
        let new_command_validator = <ValidatedInput> wrapper.findComponent({ref: 'command'}).vm;

        expect(new_command_validator.is_valid).toBe(false);

        await set_validated_input_text(new_command_input, "Splendid");
        expect(new_command_validator.is_valid).toBe(true);

        await set_validated_input_text(new_command_input, " ");
        expect(new_command_validator.is_valid).toBe(false);

        await wrapper.vm.$nextTick();
        expect(wrapper.find('.modal-create-button').element).toBeDisabled();
    });

    test('Watcher for test_suite', async () => {
        let another_suite = data_ut.make_ag_test_suite(project.pk);
        expect(wrapper.vm.ag_test_suite).toEqual(ag_suite);

        await wrapper.setProps({ag_test_suite: another_suite});
        expect(wrapper.vm.ag_test_suite).toEqual(another_suite);
    });

    test('duplicate_command_name getter', async () => {
        wrapper.vm.d_new_commands = [
            {name: "Anna", cmd: "Kendrick"}
        ];
        expect(wrapper.vm.duplicate_command_name).toEqual("");

        wrapper.vm.d_new_commands = [
            {name: "Anna", cmd: "Kendrick"},
            {name: "Rebel", cmd: "Wilson"}
        ]; // different names
        expect(wrapper.vm.duplicate_command_name).toEqual("");

        wrapper.vm.d_new_commands = [
            {name: "Anna", cmd: "Kendrick"},
            {name: "Anna", cmd: "Camp"}
        ]; // same name
        expect(wrapper.vm.duplicate_command_name).toEqual("Anna");

        wrapper.vm.d_new_commands = [
            {name: "Adam", cmd: "DeVine"},
            {name: "Adam", cmd: "Levine"},
            {name: "Brittany", cmd: "Snow"}
        ];  // 1 and 2 same name
        expect(wrapper.vm.duplicate_command_name).toEqual("Adam");

        wrapper.vm.d_new_commands = [
            {name: "Ester", cmd: "Dean"},
            {name: "Anna", cmd: "Camp"},
            {name: "Anna", cmd: "Kendrick"}
        ];  // 2 and 3 same name
        expect(wrapper.vm.duplicate_command_name).toEqual("Anna");

        wrapper.vm.d_new_commands = [
            {name: "Adam", cmd: "DeVine"},
            {name: "Brittany", cmd: "Snow"},
            {name: "Adam", cmd: "Levine"}
        ];  // 1 and 3 same name
        expect(wrapper.vm.duplicate_command_name).toEqual("Adam");

        wrapper.vm.d_new_commands = [
            {name: "Ester", cmd: "Dean"},
            {name: "Anna", cmd: "Camp"},
            {name: "Rebel", cmd: "Wilson"}
        ];  // all have different names
        expect(wrapper.vm.duplicate_command_name).toEqual("");
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
    let wrapper = managed_mount(AGTestSuitePanel, {
        propsData: {
            ag_test_suite: suite,
            active_ag_test_suite: null,
            active_ag_test_command: null
        }
    });
    await wrapper.find('.panel').trigger('click');

    wrapper.findComponent({ref: 'ag_test_case_order'}).vm.$emit('change');
    await wrapper.vm.$nextTick();
    expect(
        order_stub.calledOnceWith(suite.pk, test_cases.map(test_case => test_case.pk))
    ).toBe(true);
});
