import { config, mount, Wrapper } from '@vue/test-utils';

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
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

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

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);
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

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);

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

        expect(wrapper.emitted().update_active_item[1][0]).toEqual(ag_case_green);
        expect(wrapper.vm.commands_are_visible).toBe(true);
    });

    test('Case (open and child command is active) is clicked on',
         async () => {
        wrapper.findAll('.ag-test-case').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);

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
        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);

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

        expect(wrapper.emitted().update_active_item[0][0]).toEqual(ag_case_green);
        expect(wrapper.vm.commands_are_visible).toBe(true);

        wrapper.findAll('.ag-test-command').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted().update_active_item[1][0]).toEqual(ag_command_green_2);
    });

    test('Add command - successful', async () => {
        let create_command_stub = sinon.stub(AGTestCommand, 'create');

        expect(wrapper.find({ref: 'new_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(false);

        wrapper.findAll({ref: 'add_ag_test_command_menu_item'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'new_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(true);

        wrapper.vm.d_new_command_name = "New command name";
        wrapper.vm.d_new_command = "New command";

        wrapper.find('#add-ag-test-command-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_command_stub.calledOnce).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_command_modal'}).exists()).toBe(false);
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

        expect(wrapper.find({ref: 'new_ag_test_command_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(false);

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'new_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(true);

        wrapper.vm.d_new_command_name = "New command name";
        wrapper.vm.d_new_command = "New command";

        wrapper.find('#add-ag-test-command-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_command_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'new_command_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(wrapper.find({ref: 'new_ag_test_command_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_new_ag_test_command_modal).toBe(true);
    });

    test('d_cloned_case_name binding', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let ag_test_case_clone_name = wrapper.find({ref: 'ag_test_case_clone_name'});

        set_validated_input_text(ag_test_case_clone_name, 'Water');
        expect(wrapper.vm.d_cloned_case_name).toEqual("Water");
        expect(validated_input_is_valid(ag_test_case_clone_name)).toEqual(true);

        wrapper.vm.d_cloned_case_name = "Air";
        expect(get_validated_input_text(ag_test_case_clone_name)).toEqual("Air");
    });

    test('error - d_cloned_case_name is blank', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);

        let ag_test_case_clone_name = wrapper.find({ref: 'ag_test_case_clone_name'});
        let case_clone_name_validator = <ValidatedInput> wrapper.find(
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
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'clone_ag_test_case_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        wrapper.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.find({ref: 'clone_ag_test_case_modal'}).exists()).toBe(true);

        let ag_test_case_clone_name = wrapper.find({ref: 'ag_test_case_clone_name'});
        set_validated_input_text(ag_test_case_clone_name, 'Water');

        expect(wrapper.find('#modal-clone-ag-test-case-button').is(
            '[disabled]'
        )).toBe(false);

        wrapper.find('#clone-ag-test-case-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(clone_case_stub.calledOnce).toBe(true);
        expect(clone_case_stub.firstCall.calledWith("Water")).toBe(true);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);
        expect(wrapper.find({ref: 'clone_ag_test_case_modal'}).exists()).toBe(false);
    });

    test('d_cloned_case_name begins as the empty string whenever the clone_ag_test_case ' +
         'modal is opened',
         async () => {
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.vm.d_cloned_case_name).toEqual("");

        set_validated_input_text(wrapper.find({ref: 'ag_test_case_clone_name'}), 'Fall');

        expect(wrapper.vm.d_cloned_case_name).toEqual("Fall");

        wrapper.find({ref: 'clone_ag_test_case_modal'}).vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        wrapper.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.vm.d_cloned_case_name).toEqual("");

        set_validated_input_text(wrapper.find({ref: 'ag_test_case_clone_name'}), 'Winter');

        expect(wrapper.vm.d_cloned_case_name).toEqual("Winter");

        wrapper.find({ref: 'clone_ag_test_case_modal'}).vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        wrapper.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

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

        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'clone_ag_test_case_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(false);

        wrapper.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.find({ref: 'clone_ag_test_case_modal'}).exists()).toBe(true);

        let ag_test_case_clone_name = wrapper.find({ref: 'ag_test_case_clone_name'});
        set_validated_input_text(ag_test_case_clone_name, 'Purple Case');

        expect(wrapper.find('#modal-clone-ag-test-case-button').is(
            '[disabled]'
        )).toBe(false);

        wrapper.find('#clone-ag-test-case-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(clone_case_stub.calledOnce).toBe(true);
        expect(clone_case_stub.firstCall.calledWith("Purple Case")).toBe(true);
        expect(wrapper.vm.d_show_clone_ag_test_case_modal).toBe(true);
        expect(wrapper.find({ref: 'clone_ag_test_case_modal'}).exists()).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'clone_case_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Edit AGTestCase settings', async () => {
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_ag_test_case_settings_modal).toBe(false);
        expect(wrapper.find({ref: 'ag_test_case_settings_modal'}).exists()).toBe(false);

        wrapper.find({ref: 'edit_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_ag_test_case_settings_modal).toBe(true);
        expect(wrapper.find({ref: 'ag_test_case_settings_modal'}).exists()).toBe(true);
    });

    test('Delete case - successful', async () => {
        let delete_case_stub = sinon.stub(wrapper.vm.ag_test_case, 'delete');
        wrapper.setProps({active_case: ag_case_green});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_case_modal).toBe(false);
        expect(wrapper.find({ref: 'delete_ag_test_case_modal'}).exists()).toBe(false);

        wrapper.find({ref: 'delete_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_case_modal).toBe(true);
        expect(wrapper.find({ref: 'delete_ag_test_case_modal'}).exists()).toBe(true);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_case_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_delete_ag_test_case_modal).toBe(false);
        expect(wrapper.find({ref: 'delete_ag_test_case_modal'}).exists()).toBe(false);
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
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let new_ag_test_command_name_input = wrapper.find({ref: 'new_ag_test_command_name'});
        set_validated_input_text(new_ag_test_command_name_input, 'Sunny');

        expect(wrapper.vm.d_new_command_name).toEqual("Sunny");
        expect(validated_input_is_valid(new_ag_test_command_name_input)).toEqual(true);

        wrapper.vm.d_new_command_name = "Cloudy";
        expect(get_validated_input_text(new_ag_test_command_name_input)).toEqual("Cloudy");
    });

    test('error - new command name is blank', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let new_command_name_input = wrapper.find(
            {ref: 'new_ag_test_command_name'}
        ).find('#input');
        let new_command_name_validator = <ValidatedInput> wrapper.find(
            {ref: 'new_ag_test_command_name'}
        ).vm;

        expect(new_command_name_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_name_input.element).value = "Great";
        new_command_name_input.trigger('input');
        await wrapper.vm.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_name_input.element).value = " ";
        new_command_name_input.trigger('input');
        await wrapper.vm.$nextTick();

        expect(new_command_name_validator.is_valid).toBe(false);
    });

    test('d_new_command binding', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let new_ag_test_command_input = wrapper.find({ref: 'new_ag_test_command'});
        set_validated_input_text(new_ag_test_command_input, 'Moo');

        expect(wrapper.vm.d_new_command).toEqual("Moo");
        expect(validated_input_is_valid(new_ag_test_command_input)).toEqual(true);

        wrapper.vm.d_new_command = "Baa";
        expect(get_validated_input_text(new_ag_test_command_input)).toEqual("Baa");
    });

    test('error - new command is blank', async () => {
        wrapper.setProps({active_ag_test_case: ag_case_green});
        await wrapper.vm.$nextTick();

        wrapper.find({ref: 'add_ag_test_command_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let new_command_input = wrapper.find({ref: 'new_ag_test_command'}).find('#input');
        let new_command_validator = <ValidatedInput> wrapper.find({ref: 'new_ag_test_command'}).vm;

        expect(new_command_validator.is_valid).toBe(false);

        (<HTMLInputElement> new_command_input.element).value = "Splenda";
        new_command_input.trigger('input');
        await wrapper.vm.$nextTick();

        expect(new_command_validator.is_valid).toBe(true);

        (<HTMLInputElement> new_command_input.element).value = " ";
        new_command_input.trigger('input');
        await wrapper.vm.$nextTick();

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

    wrapper.find({ref: 'ag_test_command_order'}).vm.$emit('change');
    await wrapper.vm.$nextTick();
    expect(
        order_stub.calledOnceWith(test_case.pk, cmds.map(cmd => cmd.pk))
    ).toBe(true);
});
