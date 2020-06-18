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
    checkbox_is_checked,
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
        let time_limit_input = wrapper.findComponent({ref: 'time_limit'});

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

    test('use_virtual_memory_limit binding', async () => {
        let checkbox = wrapper.find('[data-testid=limit_virtual_memory]');
        expect(checkbox_is_checked(checkbox)).toBe(true);
        expect(wrapper.vm.d_resource_limits?.use_virtual_memory_limit).toBe(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_resource_limits?.use_virtual_memory_limit).toBe(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_resource_limits?.use_virtual_memory_limit).toBe(true);

        await set_data(wrapper, {d_resource_limits: {use_virtual_memory_limit: false}});
        expect(checkbox_is_checked(checkbox)).toBe(false);

        await set_data(wrapper, {d_resource_limits: {use_virtual_memory_limit: true}});
        expect(checkbox_is_checked(checkbox)).toBe(true);
    });

    test('virtual_memory_limit binding', async () => {
        let virtual_memory_limit_input = wrapper.findComponent({ref: 'virtual_memory_limit'});


        await set_validated_input_text(virtual_memory_limit_input, '9');
        expect(wrapper.vm.d_resource_limits!.virtual_memory_limit).toEqual(9000000);
        expect(validated_input_is_valid(virtual_memory_limit_input)).toEqual(true);

        await set_data(wrapper, {d_resource_limits: {virtual_memory_limit: 2500000000}});
        expect(get_validated_input_text(virtual_memory_limit_input)).toEqual('2500');
        expect(validated_input_is_valid(virtual_memory_limit_input)).toEqual(true);

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

    test('block_process_spawn binding', async () => {
        let checkbox = wrapper.find('[data-testid=block_process_spawn]');
        expect(checkbox_is_checked(checkbox)).toBe(true);
        expect(wrapper.vm.d_resource_limits?.block_process_spawn).toBe(true);

        await checkbox.setChecked(false);
        expect(wrapper.vm.d_resource_limits?.block_process_spawn).toBe(false);

        await checkbox.setChecked(true);
        expect(wrapper.vm.d_resource_limits?.block_process_spawn).toBe(true);

        await set_data(wrapper, {d_resource_limits: {block_process_spawn: false}});
        expect(checkbox_is_checked(checkbox)).toBe(false);

        await set_data(wrapper, {d_resource_limits: {block_process_spawn: true}});
        expect(checkbox_is_checked(checkbox)).toBe(true);
    });
});
