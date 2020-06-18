import { mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCommand,
    AGTestSuite,
    HttpError,
    Project,
} from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGCasePanel from '@/components/project_admin/ag_suites/ag_case_panel.vue';
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


describe('commands_are_visible getter', () => {
    let wrapper: Wrapper<AGCasePanel>;
    let project: Project;
    let ag_suite_colors: AGTestSuite;
    let ag_case_green: AGTestCase;
    let ag_case_yellow: AGTestCase;
    let ag_command_green_1: AGTestCommand;
    let ag_command_green_2: AGTestCommand;
    let ag_command_green_3: AGTestCommand;
    let ag_command_yellow_1: AGTestCommand;

    beforeEach(() => {
        project = data_ut.make_project(
            data_ut.make_course().pk
        );

        ag_suite_colors = data_ut.make_ag_test_suite(project.pk);
        ag_case_green = data_ut.make_ag_test_case(ag_suite_colors.pk);
        ag_command_green_1 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_command_green_2 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_command_green_3 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_case_yellow = data_ut.make_ag_test_case(ag_suite_colors.pk);
        ag_command_yellow_1 = data_ut.make_ag_test_command(ag_case_yellow.pk);

        ag_case_green.ag_test_commands = [
            ag_command_green_1,
            ag_command_green_2,
            ag_command_green_3
        ];
        ag_case_yellow.ag_test_commands = [
            ag_command_yellow_1
        ];

        ag_suite_colors.ag_test_cases = [
            ag_case_green,
            ag_case_yellow
        ];
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Command in case is active', async () => {
        wrapper = mount(AGCasePanel, {
            propsData: {
                ag_test_case: ag_case_green,
                ag_test_suite: ag_suite_colors,
                active_ag_test_case: null,
                active_ag_test_command: ag_command_green_2
            }
        });

        expect(wrapper.vm.commands_are_visible).toBe(true);
    });

    test('Command in case is not active', async () => {
        wrapper = mount(AGCasePanel, {
            propsData: {
                ag_test_case: ag_case_green,
                ag_test_suite: ag_suite_colors,
                active_ag_test_case: null,
                active_ag_test_command: ag_command_yellow_1
            }
        });

        expect(wrapper.vm.commands_are_visible).toBe(false);
    });
});

describe('AGCasePanel tests', () => {
    let wrapper: Wrapper<AGCasePanel>;
    let project: Project;
    let ag_suite_colors: AGTestSuite;
    let ag_case_green: AGTestCase;
    let ag_case_yellow: AGTestCase;
    let ag_command_green_1: AGTestCommand;
    let ag_command_green_2: AGTestCommand;
    let ag_command_green_3: AGTestCommand;
    let ag_command_yellow_1: AGTestCommand;

    beforeEach(() => {
        project = data_ut.make_project(
            data_ut.make_course().pk
        );

        ag_suite_colors = data_ut.make_ag_test_suite(project.pk);
        ag_case_green = data_ut.make_ag_test_case(ag_suite_colors.pk);
        ag_command_green_1 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_command_green_2 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_command_green_3 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_case_yellow = data_ut.make_ag_test_case(ag_suite_colors.pk);
        ag_command_yellow_1 = data_ut.make_ag_test_command(ag_case_yellow.pk);

        ag_case_green.ag_test_commands = [
            ag_command_green_1,
            ag_command_green_2,
            ag_command_green_3
        ];
        ag_case_yellow.ag_test_commands = [
            ag_command_yellow_1
        ];

        ag_suite_colors.ag_test_cases = [
            ag_case_green,
            ag_case_yellow
        ];

        wrapper = mount(AGCasePanel, {
            propsData: {
                ag_test_case: ag_case_green,
                ag_test_suite: ag_suite_colors,
                active_ag_test_case: null,
                active_ag_test_command: null
            }
        });
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Case (closed and child command not active) is clicked on',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_case_green);
        expect(wrapper.vm.commands_are_visible).toBe(true);
    });

    test('Case (closed and child command is active) is clicked on',
         async () => {
        wrapper.setProps({active_ag_test_command: ag_command_green_2});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.command_in_case_is_active).toBe(true);
        expect(wrapper.vm.active_ag_test_command).toEqual(ag_command_green_2);
        expect(wrapper.vm.commands_are_visible).toBe(true);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.command_in_case_is_active).toBe(true);
        expect(wrapper.vm.commands_are_visible).toBe(false);
        expect(wrapper.vm.active_ag_test_command).toEqual(ag_command_green_2);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.command_in_case_is_active).toBe(true);
        expect(wrapper.vm.commands_are_visible).toBe(true);
        expect(wrapper.vm.active_ag_test_command).toEqual(ag_command_green_2);
    });

    test('Case (open and child command not active) is clicked on',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_case_green);

        expect(wrapper.vm.commands_are_visible).toBe(true);

        wrapper.setProps({active_ag_test_command: ag_command_green_1});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.command_in_case_is_active).toBe(true);

        wrapper.setProps({active_ag_test_command: ag_command_yellow_1});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.commands_are_visible).toBe(true);
        expect(wrapper.vm.command_in_case_is_active).toBe(false);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[1][0]).toEqual(ag_case_green);
        expect(wrapper.vm.commands_are_visible).toBe(true);
    });

    test('Case (open and child command is active) is clicked on',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_case_green);

        wrapper.setProps({active_ag_test_command: ag_command_green_1});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.commands_are_visible).toBe(true);
        expect(wrapper.vm.command_in_case_is_active).toBe(true);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.commands_are_visible).toBe(false);
        expect(wrapper.vm.command_in_case_is_active).toBe(true);
    });

    test('Command in case becomes active',
         async () => {
        wrapper.setProps({active_ag_test_command: ag_command_green_2});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.commands_are_visible).toBe(true);
        expect(wrapper.vm.command_in_case_is_active).toBe(true);
    });

    test('When a case that is active is clicked on again, it closes', async () => {
        expect(wrapper.vm.is_open).toBe(false);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_open).toBe(true);
        expect(wrapper.vm.commands_are_visible).toBe(true);
        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_case_green);

        wrapper.setProps({active_ag_test_command: ag_command_green_1});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.command_in_case_is_active).toBe(true);

        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.command_in_case_is_active).toBe(true);
        expect(wrapper.vm.commands_are_visible).toBe(false);
        expect(wrapper.vm.is_open).toBe(false);
    });

    test('When a command is clicked on, an event is emitted',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[0][0]).toEqual(ag_case_green);
        expect(wrapper.vm.commands_are_visible).toBe(true);

        wrapper.findAll('.ag-test-command').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(emitted(wrapper, 'update_active_item')[1][0]).toEqual(ag_command_green_2);
    });

    test('Add command - successful', async () => {
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        expect(wrapper.findComponent({ref: 'new_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(false);

        await wrapper.findAllComponents(
            {ref: 'add_ag_test_command_menu_item'}).at(0).trigger('click');
        expect(wrapper.findComponent({ref: 'new_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(true);

        wrapper.vm.d_new_command_name = "New command name";
        wrapper.vm.d_new_command = "New command";
        await wrapper.vm.$nextTick();

        await wrapper.findComponent({ref: 'add_ag_test_command_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_adding_command)).toBe(true);

        expect(create_command_stub.calledOnce).toBe(true);
        expect(wrapper.findComponent({ref: 'new_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(false);
    });

    test('Add command - unsuccessful', async () => {
        let create_command_stub = sinon.stub(AGTestCommand, 'create').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test command with this Name and AG test case already exists."}
                )
            )
        );
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'new_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(false);

        wrapper.findComponent({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'new_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(true);

        wrapper.vm.d_new_command_name = "New command name";
        wrapper.vm.d_new_command = "New command";
        await wrapper.vm.$nextTick();

        wrapper.findComponent({ref: 'add_ag_test_command_form'}).trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_command_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'new_command_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(wrapper.findComponent({ref: 'new_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(true);
    });

    test('d_cloned_case_name binding', async () => {
        await wrapper.setProps({active_case: ag_case_green});
        await wrapper.findComponent({ref: 'clone_ag_test_case_menu_item'}).trigger('click');

        let ag_test_case_clone_name = wrapper.findComponent({ref: 'ag_test_case_clone_name'});

        await set_validated_input_text(ag_test_case_clone_name, 'Water');
        expect(wrapper.vm.d_cloned_case_name).toEqual("Water");
        expect(validated_input_is_valid(ag_test_case_clone_name)).toEqual(true);

        wrapper.vm.d_cloned_case_name = "Air";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(ag_test_case_clone_name)).toEqual("Air");
    });

    test('error - d_cloned_case_name is blank', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.findComponent({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);

        let ag_test_case_clone_name = wrapper.findComponent({ref: 'ag_test_case_clone_name'});
        let case_clone_name_validator = <ValidatedInput> wrapper.findComponent(
            {ref: 'ag_test_case_clone_name'}
        ).vm;
        expect(case_clone_name_validator.is_valid).toBe(false);

        set_validated_input_text(ag_test_case_clone_name, 'Stupendous');
        expect(wrapper.vm.d_cloned_case_name).toEqual("Stupendous");
        expect(case_clone_name_validator.is_valid).toBe(true);

        set_validated_input_text(ag_test_case_clone_name, ' ');
        expect(case_clone_name_validator.is_valid).toBe(false);
    });

    test('Clone case - successful', async () => {
        let new_case = data_ut.make_ag_test_case(ag_suite_colors.pk);
        let clone_case_stub = sinon.stub(wrapper.vm.ag_test_case, 'copy').returns(
            Promise.resolve(
                new_case
            )
        );
        await wrapper.setProps({active_case: ag_case_green});

        expect(wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        await wrapper.findComponent({ref: 'clone_ag_test_case_menu_item'}).trigger('click');

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).exists()).toBe(true);

        let ag_test_case_clone_name = wrapper.findComponent({ref: 'ag_test_case_clone_name'});
        await set_validated_input_text(ag_test_case_clone_name, 'Water');

        expect(
            wrapper.findComponent({ref: 'modal_clone_ag_test_case_button'}).element
        ).not.toBeDisabled();

        await wrapper.findComponent({ref: 'clone_ag_test_case_form'}).trigger('submit');

        expect(clone_case_stub.calledOnce).toBe(true);
        expect(clone_case_stub.firstCall.calledWith("Water")).toBe(true);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).exists()).toBe(false);
    });

    test('d_cloned_case_name begins as the empty string whenever the clone_ag_test_case ' +
         'modal is opened',
         async () => {
        await wrapper.setProps({active_case: ag_case_green});
        await wrapper.findComponent({ref: 'clone_ag_test_case_menu_item'}).trigger('click');

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.vm.d_cloned_case_name).toEqual("");

        await set_validated_input_text(
            wrapper.findComponent({ref: 'ag_test_case_clone_name'}), 'Fall');
        expect(wrapper.vm.d_cloned_case_name).toEqual("Fall");

        wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        await wrapper.findComponent({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.vm.d_cloned_case_name).toEqual("");

        await set_validated_input_text(
            wrapper.findComponent({ref: 'ag_test_case_clone_name'}), 'Winter');
        expect(wrapper.vm.d_cloned_case_name).toEqual("Winter");

        wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        await wrapper.findComponent({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.vm.d_cloned_case_name).toEqual("");
    });

    test('Clone case - unsuccessful', async () => {
        let clone_case_stub = sinon.stub(wrapper.vm.ag_test_case, 'copy').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {
                        __all__: "Error: Ag test case with this Name and Ag " +
                                 "test suite already exists."
                    }
                )
            )
        );

        await wrapper.setProps({active_case: ag_case_green});
        expect(wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        await wrapper.findComponent({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).exists()).toBe(true);

        let ag_test_case_clone_name = wrapper.findComponent({ref: 'ag_test_case_clone_name'});
        await set_validated_input_text(ag_test_case_clone_name, 'Purple Case');

        expect(
            wrapper.findComponent({ref: 'modal_clone_ag_test_case_button'}).element
        ).not.toBeDisabled();

        await wrapper.findComponent({ref: 'clone_ag_test_case_form'}).trigger('submit');

        expect(clone_case_stub.calledOnce).toBe(true);
        expect(clone_case_stub.firstCall.calledWith("Purple Case")).toBe(true);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'clone_ag_test_case_modal'}).exists()).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'clone_case_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Edit AGTestCase settings', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_ag_test_case_settings_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'ag_test_case_settings_modal'}).exists()).toBe(false);

        wrapper.findComponent({ref: 'edit_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_ag_test_case_settings_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'ag_test_case_settings_modal'}).exists()).toBe(true);
    });

    test('Delete case - successful', async () => {
        let delete_case_stub = sinon.stub(wrapper.vm.ag_test_case, 'delete');
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_case_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'delete_ag_test_case_modal'}).exists()).toBe(false);

        wrapper.findComponent({ref: 'delete_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_case_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'delete_ag_test_case_modal'}).exists()).toBe(true);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_case_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_delete_ag_test_case_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'delete_ag_test_case_modal'}).exists()).toBe(false);
    });

    test('API errors handled on test case deletion', async () => {
        sinon.stub(wrapper.vm.ag_test_case, 'delete').rejects(new HttpError(403, 'err'));
        await wrapper.vm.$nextTick();

        wrapper.findComponent({ref: 'delete_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'delete_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(1);
    });

    test('command in a different case changed', async () => {
        let updated_command_in_different_case = data_ut.make_ag_test_command(
            data_ut.make_ag_test_case(ag_suite_colors.pk).pk
        );

        expect(wrapper.vm.ag_test_case.ag_test_commands!.length).toEqual(3);
        expect(wrapper.vm.ag_test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(wrapper.vm.ag_test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(wrapper.vm.ag_test_case.ag_test_commands[2].name).toEqual(ag_command_green_3.name);

        AGTestCommand.notify_ag_test_command_changed(updated_command_in_different_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_case.ag_test_commands[0].name).toEqual(ag_command_green_1.name);
        expect(wrapper.vm.ag_test_case.ag_test_commands[1].name).toEqual(ag_command_green_2.name);
        expect(wrapper.vm.ag_test_case.ag_test_commands[2].name).toEqual(ag_command_green_3.name);
    });

    test('d_new_command_name binding', async () => {
        await wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.findComponent({ref: 'add_ag_test_command_menu_item'}).trigger('click');

        let new_ag_test_command_name_input
            = wrapper.findComponent({ref: 'new_ag_test_command_name'});
        await set_validated_input_text(new_ag_test_command_name_input, 'Sunny');

        expect(wrapper.vm.d_new_command_name).toEqual("Sunny");
        expect(validated_input_is_valid(new_ag_test_command_name_input)).toEqual(true);

        wrapper.vm.d_new_command_name = "Cloudy";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(new_ag_test_command_name_input)).toEqual("Cloudy");
    });

    test('error - new command name is blank', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.findComponent({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let new_command_name_input = wrapper.findComponent({ref: 'new_ag_test_command_name'});
        let new_command_name_validator = <ValidatedInput> wrapper.findComponent(
            {ref: 'new_ag_test_command_name'}
        ).vm;

        expect(new_command_name_validator.is_valid).toBe(false);

        set_validated_input_text(new_command_name_input, "Great");
        expect(new_command_name_validator.is_valid).toBe(true);

        set_validated_input_text(new_command_name_input, " ");
        expect(new_command_name_validator.is_valid).toBe(false);
    });

    test('d_new_command binding', async () => {
        await wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.findComponent({ref: 'add_ag_test_command_menu_item'}).trigger('click');

        let new_ag_test_command_input = wrapper.findComponent({ref: 'new_ag_test_command'});
        await set_validated_input_text(new_ag_test_command_input, 'Moo');

        expect(wrapper.vm.d_new_command).toEqual("Moo");
        expect(validated_input_is_valid(new_ag_test_command_input)).toEqual(true);

        wrapper.vm.d_new_command = "Baa";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(new_ag_test_command_input)).toEqual("Baa");
    });

    test('error - new command is blank', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.findComponent({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let new_command_input = wrapper.findComponent({ref: 'new_ag_test_command'});
        let new_command_validator
            = <ValidatedInput> wrapper.findComponent({ref: 'new_ag_test_command'}).vm;

        expect(new_command_validator.is_valid).toBe(false);

        set_validated_input_text(new_command_input, "Splenda");
        expect(new_command_validator.is_valid).toBe(true);

        set_validated_input_text(new_command_input, " ");
        expect(new_command_validator.is_valid).toBe(false);
    });

    test('Watcher for test_case', async () => {
        expect(wrapper.vm.ag_test_case).toEqual(ag_case_green);

        wrapper.setProps({ag_test_case: ag_case_yellow});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_case).toEqual(ag_case_yellow);
    });

    test('Watcher for test_suite', async () => {
        let another_suite = data_ut.make_ag_test_suite(project.pk);
        expect(wrapper.vm.ag_test_suite).toEqual(ag_suite_colors);

        wrapper.setProps({ag_test_suite: another_suite});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite).toEqual(another_suite);
    });
});

test('Update test commands order', async () => {
    let order_stub = sinon.stub(AGTestCommand, 'update_order');
    let suite = data_ut.make_ag_test_suite(data_ut.make_project(data_ut.make_course().pk).pk);
    let test_case = data_ut.make_ag_test_case(suite.pk);
    suite.ag_test_cases = [test_case];
    let cmds = [
        data_ut.make_ag_test_command(test_case.pk),
        data_ut.make_ag_test_command(test_case.pk),
        data_ut.make_ag_test_command(test_case.pk),
    ];
    test_case.ag_test_commands = cmds;

    let wrapper = managed_mount(AGCasePanel, {
            propsData: {
                ag_test_case: test_case,
                ag_test_suite: suite,
                active_ag_test_command: null,
            }
    });
    wrapper.find('.panel').trigger('click');
    await wrapper.vm.$nextTick();

    wrapper.findComponent({ref: 'ag_test_command_order'}).vm.$emit('change');
    await wrapper.vm.$nextTick();
    expect(
        order_stub.calledOnceWith(test_case.pk, cmds.map(cmd => cmd.pk))
    ).toBe(true);
});
