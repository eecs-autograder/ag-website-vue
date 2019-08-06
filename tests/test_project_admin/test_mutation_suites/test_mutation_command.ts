import { Vue } from 'vue-property-decorator';

import { config, mount, RefSelector, Wrapper } from '@vue/test-utils';

import { AGCommand } from 'ag-client-typescript/dist/src/ag_command';
import * as sinon from "sinon";

import MutationCommand from '@/components/project_admin/mutation_suites/mutation_command.vue';

import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationCommand tests', () => {
    let wrapper: Wrapper<MutationCommand>;
    let component: MutationCommand;
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
                value: ag_command
            }
        });
        component = wrapper.vm;
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
        wrapper.setProps({include_command_name: true});
        await component.$nextTick();

        let command_name_input = wrapper.find({ref: 'name'});
        set_validated_input_text(command_name_input, 'Tim Hortons');

        expect(component.d_ag_command!.name).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_name_input)).toEqual(true);

        component.d_ag_command!.name = 'Starbucks';
        expect(get_validated_input_text(command_name_input)).toEqual('Starbucks');
        expect(component.d_ag_command_settings_form_is_valid).toBe(true);
    });

    test('Error: command name is blank', async () => {
        wrapper.setProps({include_command_name: true});
        await component.$nextTick();

        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: "name"}, ' '
        );
    });

    test('cmd binding', async () => {
        let command_input = wrapper.find({ref: 'cmd'});

        set_validated_input_text(command_input, 'Tim Hortons');

        expect(component.d_ag_command!.cmd).toEqual('Tim Hortons');
        expect(validated_input_is_valid(command_input)).toEqual(true);

        component.d_ag_command!.cmd = 'Starbucks';
        expect(get_validated_input_text(command_input)).toEqual('Starbucks');
        expect(component.d_ag_command_settings_form_is_valid).toBe(true);
    });

    test('Error: cmd is blank', async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: "cmd"}, ' '
        );
    });

    test('time_limit binding', async () => {
        let time_limit_input = wrapper.find({ref: 'time_limit'});

        set_validated_input_text(time_limit_input, '9');

        expect(component.d_ag_command!.time_limit).toEqual(9);
        expect(validated_input_is_valid(time_limit_input)).toEqual(true);

        component.d_ag_command!.time_limit = 4;
        expect(get_validated_input_text(time_limit_input)).toEqual('4');
    });

    test('Error: time_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'time_limit'}
        );
    });

    test('Error: time_limit must be >= 1', async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'time_limit'}, '0'
        );
    });

    test('stack_size_limit binding', async () => {
        let stack_size_limit_input = wrapper.find({ref: 'stack_size_limit'});

        set_validated_input_text(stack_size_limit_input, '9');

        expect(component.d_ag_command!.stack_size_limit).toEqual(9);
        expect(validated_input_is_valid(stack_size_limit_input)).toEqual(true);

        component.d_ag_command!.stack_size_limit = 4;
        expect(get_validated_input_text(stack_size_limit_input)).toEqual('4');
    });

    test('Error: stack_size_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'stack_size_limit'}
        );
    });

    test('Error: stack_size_limit must be >= 1', async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'stack_size_limit'}, '0'
        );
    });

    test('virtual_memory_limit binding', async () => {
        let virtual_memory_limit_input = wrapper.find({ref: 'virtual_memory_limit'});

        set_validated_input_text(virtual_memory_limit_input, '9');

        expect(component.d_ag_command!.virtual_memory_limit).toEqual(9);
        expect(validated_input_is_valid(virtual_memory_limit_input)).toEqual(true);

        component.d_ag_command!.virtual_memory_limit = 4;
        expect(get_validated_input_text(virtual_memory_limit_input)).toEqual('4');
    });

    test('Error: virtual_memory_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'virtual_memory_limit'}
        );
    });

    test('Error: virtual_memory_limit must be >= 1', async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'virtual_memory_limit'}, '0'
        );
    });

    test('process_spawn_limit binding', async () => {
        let process_spawn_limit_input = wrapper.find({ref: 'process_spawn_limit'});

        set_validated_input_text(process_spawn_limit_input, '9');

        expect(component.d_ag_command!.process_spawn_limit).toEqual(9);
        expect(validated_input_is_valid(process_spawn_limit_input)).toEqual(true);

        component.d_ag_command!.process_spawn_limit = 4;
        expect(get_validated_input_text(process_spawn_limit_input)).toEqual('4');
    });

    test('Error: process_spawn_limit is blank or not an integer', async () => {
        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'process_spawn_limit'}
        );
    });

    test('Error: process_spawn_limit must be >= 0', async () => {
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
        expect(component.d_ag_command).toEqual(ag_command);

        wrapper.setProps({value: another_ag_command});
        await component.$nextTick();

        expect(component.d_ag_command).toEqual(another_ag_command);
    });
});

async function do_invalid_text_input_test_without_save_button(component_wrapper: Wrapper<Vue>,
                                                              input_selector: string | RefSelector,
                                                              invalid_text: string) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    expect(validated_input_is_valid(input_wrapper)).toEqual(true);

    set_validated_input_text(input_wrapper, invalid_text);
    await component_wrapper.vm.$nextTick();

    expect(validated_input_is_valid(input_wrapper)).toEqual(false);
}

async function do_input_blank_or_not_integer_test_without_save_button(
        component_wrapper: Wrapper<Vue>,
        input_selector: string | RefSelector) {
    // See https://github.com/Microsoft/TypeScript/issues/14107#issuecomment-483995795
    let input_wrapper = component_wrapper.find(<any> input_selector); // tslint:disable-line
    let original_text = get_validated_input_text(input_wrapper);

    await do_invalid_text_input_test_without_save_button(
        component_wrapper, input_selector, ' '
    );
    set_validated_input_text(input_wrapper, original_text);
    return do_invalid_text_input_test_without_save_button(
        component_wrapper, input_selector, 'not num'
    );
}
