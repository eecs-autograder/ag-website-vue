import { config, mount, Wrapper } from '@vue/test-utils';

import { AGCommand } from 'ag-client-typescript/dist/src/ag_command';
import * as sinon from "sinon";

import MutationCommand from '@/components/project_admin/mutation_suites/mutation_command.vue';

import {
    do_input_blank_or_not_integer_test_without_save_button,
    do_invalid_text_input_test_without_save_button,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationCommand tests', () => {
    let wrapper: Wrapper<MutationCommand>;
    let ag_command: AGCommand;
    let original_match_media: (query: string) => MediaQueryList;

    ag_command = {
        name: "Command",
        cmd: "Do something",
        time_limit: 10,
        stack_size_limit: 10000000,
        virtual_memory_limit: 500000000,
        process_spawn_limit: 16
    };

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(MutationCommand, {
            propsData: {
                value: ag_command,
                command_label: "Setup"
            }
        });
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('command name binding', async () => {
        wrapper.setProps({include_command_name_input: true});
        await wrapper.vm.$nextTick();

        let command_name_input = wrapper.find({ref: 'name'});
        set_validated_input_text(command_name_input, 'Tim Hortons');

        expect(wrapper.emitted().input.length).toEqual(1);
        expect(wrapper.vm.d_ag_command!.name).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);

        wrapper.vm.d_ag_command!.name = 'Starbucks';
        expect(get_validated_input_text(command_name_input)).toEqual('Starbucks');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);
    });

    test('Error: command name is blank', async () => {
        wrapper.setProps({include_command_name_input: true});
        await wrapper.vm.$nextTick();

        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: "name"}, ' '
        );
    });

    test('cmd binding', async () => {
        let command_input = wrapper.find({ref: 'cmd'});

        set_validated_input_text(command_input, 'Tim Hortons');

        expect(wrapper.vm.d_ag_command!.cmd).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_ag_command!.cmd = 'Starbucks';
        expect(get_validated_input_text(command_input)).toEqual('Starbucks');
        expect(validated_input_is_valid(command_input)).toEqual(true);
    });

    test('Error: cmd is blank', async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: "cmd"}, ' '
        );
    });

    test('time_limit binding', async () => {
        wrapper.setData({d_is_open: true});

        let time_limit_input = wrapper.find({ref: 'time_limit'});

        set_validated_input_text(time_limit_input, '9');

        expect(wrapper.vm.d_ag_command!.time_limit).toEqual(9);
        expect(validated_input_is_valid(time_limit_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_ag_command!.time_limit = 4;
        expect(get_validated_input_text(time_limit_input)).toEqual('4');
        expect(validated_input_is_valid(time_limit_input)).toEqual(true);
    });

    test('Error: time_limit is blank or not an integer', async () => {
        wrapper.setData({d_is_open: true});

        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'time_limit'}
        );
    });

    test('Error: time_limit must be >= 1', async () => {
        wrapper.setData({d_is_open: true});

        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'time_limit'}, '0'
        );
    });

    test('stack_size_limit binding', async () => {
        wrapper.setData({d_is_open: true});

        let stack_size_limit_input = wrapper.find({ref: 'stack_size_limit'});

        set_validated_input_text(stack_size_limit_input, '9');

        expect(wrapper.vm.d_ag_command!.stack_size_limit).toEqual(9);
        expect(validated_input_is_valid(stack_size_limit_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_ag_command!.stack_size_limit = 4;
        expect(get_validated_input_text(stack_size_limit_input)).toEqual('4');
        expect(validated_input_is_valid(stack_size_limit_input)).toEqual(true);
    });

    test('Error: stack_size_limit is blank or not an integer', async () => {
        wrapper.setData({d_is_open: true});

        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'stack_size_limit'}
        );
    });

    test('Error: stack_size_limit must be >= 1', async () => {
        wrapper.setData({d_is_open: true});

        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'stack_size_limit'}, '0'
        );
    });

    test('virtual_memory_limit binding', async () => {
        wrapper.setData({d_is_open: true});

        let virtual_memory_limit_input = wrapper.find({ref: 'virtual_memory_limit'});

        set_validated_input_text(virtual_memory_limit_input, '9');

        expect(wrapper.vm.d_ag_command!.virtual_memory_limit).toEqual(9);
        expect(validated_input_is_valid(virtual_memory_limit_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_ag_command!.virtual_memory_limit = 4;
        expect(get_validated_input_text(virtual_memory_limit_input)).toEqual('4');
        expect(validated_input_is_valid(virtual_memory_limit_input)).toEqual(true);
    });

    test('Error: virtual_memory_limit is blank or not an integer', async () => {
        wrapper.setData({d_is_open: true});

        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'virtual_memory_limit'}
        );
    });

    test('Error: virtual_memory_limit must be >= 1', async () => {
        wrapper.setData({d_is_open: true});

        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'virtual_memory_limit'}, '0'
        );
    });

    test('process_spawn_limit binding', async () => {
        wrapper.setData({d_is_open: true});

        let process_spawn_limit_input = wrapper.find({ref: 'process_spawn_limit'});

        set_validated_input_text(process_spawn_limit_input, '9');

        expect(wrapper.vm.d_ag_command!.process_spawn_limit).toEqual(9);
        expect(validated_input_is_valid(process_spawn_limit_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_ag_command!.process_spawn_limit = 4;
        expect(get_validated_input_text(process_spawn_limit_input)).toEqual('4');
        expect(validated_input_is_valid(process_spawn_limit_input)).toEqual(true);
    });

    test('Error: process_spawn_limit is blank or not an integer', async () => {
        wrapper.setData({d_is_open: true});

        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'process_spawn_limit'}
        );
    });

    test('Error: process_spawn_limit must be >= 0', async () => {
        wrapper.setData({d_is_open: true});

        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'process_spawn_limit'}, '-1'
        );
    });

    test('value Watcher', async () => {
        let another_ag_command = {
            name: "Another Command",
            cmd: "Do something else",
            time_limit: 10,
            stack_size_limit: 10000000,
            virtual_memory_limit: 500000000,
            process_spawn_limit: 16
        };
        expect(wrapper.vm.d_ag_command).toEqual(ag_command);

        wrapper.setProps({value: another_ag_command});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_command).toEqual(another_ag_command);
    });

    test('toggle_is_open', async () => {
        expect(wrapper.vm.d_is_open).toBe(false);

        wrapper.vm.toggle_is_open();
        expect(wrapper.vm.d_is_open).toBe(true);

        wrapper.vm.toggle_is_open();
        expect(wrapper.vm.d_is_open).toBe(false);

        wrapper.find('.resource-limits-label').trigger('click');
        expect(wrapper.vm.d_is_open).toBe(true);

        wrapper.find('.resource-limits-label').trigger('click');
        expect(wrapper.vm.d_is_open).toBe(false);
    });
});
