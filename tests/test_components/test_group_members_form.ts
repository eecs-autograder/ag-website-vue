import { vi } from 'vitest';
import { mount, Wrapper, flushPromises } from '@vue/test-utils';

import { Course } from 'ag-client-typescript';

import InputErrors from '@/components/validated_input/InputErrors.vue';
import GroupMembersForm from '@/components/group_members_form.vue';
import ValidatedTextInput from '@/components/validated_input/ValidatedTextInput.vue';
import NewValidatedForm from '@/components/validated_input/NewValidatedForm.vue';

import { make_course } from '@/tests/data_utils';
import { emitted, get_validated_input_text, set_validated_input_text } from '@/tests/utils';

let course: Course = make_course({allowed_guest_domain: '@llama.net'});

describe('GroupMembersForm tests', () => {
    test('Default value prop, usernames initialized based on min_num_inputs', () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                course: course,
                min_num_inputs: 4,
                max_num_inputs: 7,
            },
        });

        expect(wrapper.vm.state.usernames).toEqual(
            ['@llama.net', '@llama.net', '@llama.net', '@llama.net']);
        let inputs = wrapper.findAllComponents(ValidatedTextInput);
        expect(inputs.length).toEqual(4);
        for (let i = 0; i < inputs.length; ++i) {
            expect(get_validated_input_text(inputs.at(i))).toEqual(course.allowed_guest_domain);
        }
    });

    test('Custom value prop, d_usernames copy of value array', () => {
        let value = ['spam', 'egg'];
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                course: course,
                value: value,
                min_num_inputs: 2,
                max_num_inputs: 2
            }
        });

        expect(wrapper.vm.state.usernames).not.toBe(value);
        expect(wrapper.vm.state.usernames).toEqual(value);

        let inputs = wrapper.findAllComponents(ValidatedTextInput);
        expect(inputs.length).toEqual(value.length);
        for (let i = 0; i < inputs.length; ++i) {
            expect(get_validated_input_text(inputs.at(i))).toEqual(value[i]);
        }
    });

    test('min_num_inputs is 1 with no max_num_inputs', () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                course: course,
                min_num_inputs: 1,
                max_num_inputs: null,
            },
        });

        expect(wrapper.vm.min_num_inputs).toEqual(1);
    });

    test('Add member button disabled when num inputs is max_num_inputs', () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                course: course,
                value: ['', '', ''],
                min_num_inputs: 1,
                max_num_inputs: 3,
            },
        });

        expect(wrapper.find('.add-member-button').element).toBeDisabled();
    });

    test('Remove member buttons disabled when num inputs is min_num_inputs', () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                course: course,
                value: ['', ''],
                min_num_inputs: 2,
                max_num_inputs: 3,
            },
        });

        let remove_buttons = wrapper.findAll('.remove-member-button');
        for (let i = 0; i < remove_buttons.length; ++i) {
            expect(remove_buttons.at(i).element).toBeDisabled();
        }
    });

    test('Add member', async () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                min_num_inputs: 1,
                max_num_inputs: 2,
                course: course,
                value: ['spam']
            }
        });

        let add_button = wrapper.find('.add-member-button');
        expect(add_button.element).not.toBeDisabled();
        await add_button.trigger('click');

        let inputs = wrapper.findAllComponents(ValidatedTextInput);
        expect(inputs.length).toEqual(2);

        expect(get_validated_input_text(inputs.at(0))).toEqual('spam');
        expect(get_validated_input_text(inputs.at(1))).toEqual(course.allowed_guest_domain);
    });

    test('Remove member', async () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                course: course,
                min_num_inputs: 1,
                max_num_inputs: 2,
                value: ['spam', 'egg']
            }
        });
        let inputs = wrapper.findAllComponents(ValidatedTextInput);
        expect(inputs.length).toEqual(2);

        let remove_button = wrapper.findAll('.remove-member-button').at(1);
        expect(remove_button.element).not.toBeDisabled();
        await remove_button.trigger('click');

        inputs = wrapper.findAllComponents(ValidatedTextInput);
        expect(inputs.length).toEqual(1);

        expect(get_validated_input_text(inputs.at(0))).toEqual('spam');

        expect(emitted(wrapper, 'input')).toEqual([[['spam']]]);
    });

    test('value watcher', async () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                min_num_inputs: 1,
                max_num_inputs: null,
                course: course,
                value: ['spam']
            }
        });
        expect(wrapper.vm.state.usernames).toEqual(['spam']);

        let new_value = ['egg'];
        await wrapper.setProps({value: new_value});
        expect(wrapper.vm.state.usernames).not.toBe(new_value);
        expect(wrapper.vm.state.usernames).toEqual(new_value);
    });

    test('Username input invalid non-email', async () => {
        vi.useFakeTimers()

        let wrapper = mount(GroupMembersForm, {
            propsData: {
                course: course,
                min_num_inputs: 2,
                max_num_inputs: null,
                value: ['spam', 'egg@spam.com']
            }
        });
        let inputs = wrapper.findAllComponents(ValidatedTextInput);

        const wait_for_debounce = () => {
            vi.runAllTimers();
            return wrapper.vm.$nextTick();
        }

        const error_exists = () => {
            const errors_component = wrapper.findComponent(InputErrors);
            if (!errors_component.exists()) {
                return false;
            }
            return errors_component.text().includes('email');
        }

        // don't show error on intial load
        await wait_for_debounce();
        expect(emitted(wrapper, 'form_validity_changed')).toEqual([[false]]);
        expect(error_exists()).toBe(false);

        await set_validated_input_text(inputs.at(0), 'wa@luigi.net');
        await wait_for_debounce();
        expect(emitted(wrapper, 'form_validity_changed')).toEqual([[false], [true]]);
        expect(error_exists()).toBe(false);
        expect(emitted(wrapper, 'input')).toEqual([[['wa@luigi.net', 'egg@spam.com']]]);

        await set_validated_input_text(inputs.at(0), 'waaaaaaa');
        await wait_for_debounce();
        expect(emitted(wrapper, 'form_validity_changed')).toEqual([[false], [true], [false]]);
        expect(error_exists()).toBe(true);
        expect(emitted(wrapper, 'input')).toEqual([[['wa@luigi.net', 'egg@spam.com']]]);
    });

    test('reset()', async () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                min_num_inputs: 1,
                max_num_inputs: null,
                course: course,
            }
        });
        const input = wrapper.findComponent(ValidatedTextInput);
        await set_validated_input_text(input, 'wa@luigi.net');
        expect(wrapper.vm.state.usernames).toEqual(['wa@luigi.net']);

        wrapper.vm.reset();
        await wrapper.vm.$nextTick();

        expect(get_validated_input_text(input)).toEqual(course.allowed_guest_domain);
        expect(wrapper.vm.state.usernames).toEqual([course.allowed_guest_domain]);
    });

    test('submit()', async () => {
        let value = ['spam@egg.net', 'wa@luigi.net'];
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                min_num_inputs: 2,
                max_num_inputs: null,
                course: course,
                value: value
            }
        });

        wrapper.findComponent(NewValidatedForm).vm.$emit('submit');
        await wrapper.vm.$nextTick();
        expect(emitted(wrapper, 'submit')[0][0]).toEqual(value);
    });
});
