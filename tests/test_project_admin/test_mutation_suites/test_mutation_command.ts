import { config, mount, Wrapper } from '@vue/test-utils';

import { AGCommand } from 'ag-client-typescript';
import * as sinon from "sinon";

import MutationCommand from '@/components/project_admin/mutation_suites/mutation_command.vue';
import ResourceLimitSettings from '@/components/project_admin/resource_limit_settings.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    do_invalid_text_input_test,
    emitted,
    find_by_name,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid,
} from '@/tests/utils';


describe('MutationCommand tests', () => {
    let wrapper: Wrapper<MutationCommand>;
    let ag_command = data_ut.make_ag_command({
        name: 'Command',
        cmd: "Do something",
    });

    beforeEach(() => {
        wrapper = managed_mount(MutationCommand, {
            propsData: {
                value: ag_command,
                command_label: "Setup"
            }
        });
    });

    test('command name binding', async () => {
        wrapper.setProps({include_command_name_input: true});
        await wrapper.vm.$nextTick();

        let command_name_input = wrapper.find({ref: 'name'});
        set_validated_input_text(command_name_input, 'Tim Hortons');

        expect(emitted(wrapper, 'input').length).toEqual(1);
        expect(wrapper.vm.d_ag_command!.name).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);

        wrapper.vm.d_ag_command!.name = 'Starbucks';
        expect(get_validated_input_text(command_name_input)).toEqual('Starbucks');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);
    });

    test('Error: command name is blank', async () => {
        wrapper.setProps({include_command_name_input: true});
        await wrapper.vm.$nextTick();

        return do_invalid_text_input_test(wrapper, {ref: "name"}, ' ', null);
    });

    test('cmd binding', async () => {
        let command_input = wrapper.find({ref: 'cmd'});

        set_validated_input_text(command_input, 'Tim Hortons');

        expect(wrapper.vm.d_ag_command!.cmd).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_input)).toEqual(true);
        expect(emitted(wrapper, 'input').length).toEqual(1);

        wrapper.vm.d_ag_command!.cmd = 'Starbucks';
        expect(get_validated_input_text(command_input)).toEqual('Starbucks');
        expect(validated_input_is_valid(command_input)).toEqual(true);
    });

    test('Error: cmd is blank', async () => {
        return do_invalid_text_input_test(wrapper, {ref: "cmd"}, ' ', null);
    });

    test('Resource limit settings binding', async () => {
        wrapper.setData({d_is_open: true});
        await wrapper.vm.$nextTick();

        let resource_limit_settings = find_by_name<ResourceLimitSettings>(
            wrapper, 'ResourceLimitSettings');
        expect(resource_limit_settings.vm.resource_limits).toEqual(ag_command);

        let new_time_limit = 35;
        resource_limit_settings.vm.$emit('field_change', {time_limit: new_time_limit});

        expect(wrapper.vm.d_ag_command!.time_limit).toEqual(new_time_limit);
        expect(emitted(wrapper, 'input').length).toEqual(1);
    });

    test('value Watcher', async () => {
        let another_ag_command = data_ut.make_ag_command({
            name: "Another Command",
            cmd: "Do something else",
        });
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
