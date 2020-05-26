import { Component, Vue } from 'vue-property-decorator';

import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import ResourceLimitSettings from '@/components/project_admin/resource_limit_settings.vue';
import {
    MAX_COMMAND_TIMEOUT,
} from '@/constants';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    do_input_blank_or_not_integer_test,
    do_invalid_text_input_test,
    emitted,
    find_by_name,
    get_validated_input_text,
    set_data,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

let ag_command: ag_cli.AGCommand;

beforeEach(() => {
    ag_command = data_ut.make_ag_command();
});

test('Input property initialization and change', async () => {
    let new_time_limit = 72;

    @Component({
        template: `<resource-limit-settings :resource_limits="cmd"></resource-limit-settings>`,
        components: {ResourceLimitSettings},
    })
    class WrapperComponent extends Vue {
        cmd = ag_command;

        // Change one field to make sure that the deep watcher works.
        change_suite_field() {
            this.cmd.time_limit = new_time_limit;
        }
    }

    let outer_wrapper = managed_mount(WrapperComponent);
    await outer_wrapper.vm.$nextTick();
    let inner_wrapper = find_by_name<ResourceLimitSettings>(
        outer_wrapper, 'ResourceLimitSettings');

    let original = inner_wrapper.vm.d_resource_limits;
    expect(inner_wrapper.vm.d_resource_limits).not.toBe(ag_command);

    outer_wrapper.vm.change_suite_field();
    await outer_wrapper.vm.$nextTick();

    expect(inner_wrapper.vm.d_resource_limits).not.toBe(original);
    expect(inner_wrapper.vm.d_resource_limits!.time_limit).toEqual(new_time_limit);
});

describe('Field binding tests', () => {
    let wrapper: Wrapper<ResourceLimitSettings>;

    beforeEach(() => {
        wrapper = managed_mount(ResourceLimitSettings, {
            propsData: {
                resource_limits: ag_command
            }
        });
        expect(wrapper.emitted('field_change')).toBeUndefined();
    });

    test('time_limit binding', async () => {
        let time_limit_input = wrapper.find({ref: 'time_limit'});

        await set_validated_input_text(time_limit_input, '9');

        expect(wrapper.vm.d_resource_limits!.time_limit).toEqual(9);
        expect(validated_input_is_valid(time_limit_input)).toEqual(true);

        await set_data(wrapper, {d_resource_limits: {time_limit: 4}});
        expect(get_validated_input_text(time_limit_input)).toEqual('4');

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_resource_limits);
    });

    test('error - time_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(wrapper, {ref: 'time_limit'}, null);
    });

    test('error - time_limit must be >= 1', async () => {
        return do_invalid_text_input_test(wrapper, {ref: 'time_limit'}, '0', null);
    });

    test('error - time_limit too large', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'time_limit'}, (MAX_COMMAND_TIMEOUT + 1).toString(), null);
    });

    test('virtual_memory_limit binding', async () => {
        let virtual_memory_limit_input = wrapper.find({ref: 'virtual_memory_limit'});

        await set_validated_input_text(virtual_memory_limit_input, '9');

        expect(wrapper.vm.d_resource_limits!.virtual_memory_limit).toEqual(9);
        expect(validated_input_is_valid(virtual_memory_limit_input)).toEqual(true);

        await set_data(wrapper, {d_resource_limits: {virtual_memory_limit: 4}});
        expect(get_validated_input_text(virtual_memory_limit_input)).toEqual('4');

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_resource_limits);
    });

    test('error - virtual_memory_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test(
            wrapper, {ref: 'virtual_memory_limit'}, null);
    });

    test('error - virtual_memory_limit must be >= 1', async () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'virtual_memory_limit'}, '0', null);
    });

    // test('error - virtual_memory_limit too large', async () => {
    //     return do_invalid_text_input_test(
    //         wrapper,
    //         {ref: 'virtual_memory_limit'}, (MAX_VIRTUAL_MEM_LIMIT + 1).toString(), null);
    // });

    // test('stack_size_limit binding', async () => {
    //     let stack_size_limit_input = wrapper.find({ref: 'stack_size_limit'});

    //     await set_validated_input_text(stack_size_limit_input, '9');

    //     expect(wrapper.vm.d_resource_limits!.stack_size_limit).toEqual(9);
    //     expect(validated_input_is_valid(stack_size_limit_input)).toEqual(true);

    //     await set_data(wrapper, {d_resource_limits: {stack_size_limit: 4}});
    //     expect(get_validated_input_text(stack_size_limit_input)).toEqual('4');

    //     expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_resource_limits);
    // });

    // test('error - stack_size_limit is blank or not an integer', async () => {
    //     return do_input_blank_or_not_integer_test(
    //         wrapper, {ref: 'stack_size_limit'}, null);
    // });

    // test('error - stack_size_limit must be >= 1', async () => {
    //     return do_invalid_text_input_test(wrapper, {ref: 'stack_size_limit'}, '0', null);
    // });

    // test('error - stack_size_limit too large', async () => {
    //     return do_invalid_text_input_test(
    //         wrapper, {ref: 'stack_size_limit'}, (MAX_STACK_SIZE_LIMIT + 1).toString(), null);
    // });

    // test('process_spawn_limit binding', async () => {
    //     let process_spawn_limit_input = wrapper.find({ref: 'process_spawn_limit'});

    //     await set_validated_input_text(process_spawn_limit_input, '9');

    //     expect(wrapper.vm.d_resource_limits!.process_spawn_limit).toEqual(9);
    //     expect(validated_input_is_valid(process_spawn_limit_input)).toEqual(true);

    //     await set_data(wrapper, {d_resource_limits: {process_spawn_limit: 4}});
    //     expect(get_validated_input_text(process_spawn_limit_input)).toEqual('4');

    //     expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_resource_limits);
    // });

    // test('error - process_spawn_limit is blank or not an integer', async () => {
    //     return do_input_blank_or_not_integer_test(
    //         wrapper, {ref: 'process_spawn_limit'}, null);
    // });

    // test('error - process_spawn_limit must be >= 0', async () => {
    //     return do_invalid_text_input_test(
    //         wrapper, {ref: 'process_spawn_limit'}, '-1', null);
    // });

    // test('error - process_spawn_limit too large', async () => {
    //     return do_invalid_text_input_test(
    //         wrapper, {ref: 'process_spawn_limit'}, (MAX_PROCESS_LIMIT + 1).toString(), null);
    // });
});
