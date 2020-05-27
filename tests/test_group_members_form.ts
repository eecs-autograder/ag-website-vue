import { mount, Wrapper } from '@vue/test-utils';

import { Course, Project } from 'ag-client-typescript';

import GroupMembersForm from '@/components/group_members_form.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { make_course, make_project } from '@/tests/data_utils';
import { emitted, get_validated_input_text, set_validated_input_text } from '@/tests/utils';

let course: Course = make_course({allowed_guest_domain: '@llama.net'});
let project: Project;

beforeEach(() => {
    project = make_project(course.pk);
});

describe('GroupMembersForm tests', () => {
    test('Default value prop, d_usernames initialized based on min_num_inputs', () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
            },
            computed: {
                min_num_inputs: () => 4,
                max_num_inputs: () => 8
            }
        });

        expect(wrapper.vm.d_usernames).toEqual(
            ['@llama.net', '@llama.net', '@llama.net', '@llama.net']);
        let inputs = wrapper.findAllComponents({name: 'ValidatedInput'});
        expect(inputs.length).toEqual(4);
        for (let i = 0; i < inputs.length; ++i) {
            expect(get_validated_input_text(inputs.at(i))).toEqual(course.allowed_guest_domain);
        }
    });

    test('Custom value prop, d_usernames copy of value array', () => {
        let value = ['spam', 'egg'];
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: value
            }
        });

        expect(wrapper.vm.d_usernames).not.toBe(value);
        expect(wrapper.vm.d_usernames).toEqual(value);

        let inputs = wrapper.findAllComponents({name: 'ValidatedInput'});
        expect(inputs.length).toEqual(value.length);
        for (let i = 0; i < inputs.length; ++i) {
            expect(get_validated_input_text(inputs.at(i))).toEqual(value[i]);
        }
    });

    test('max_num_inputs is project.max_group_size when max_num_members is null', () => {
        project.max_group_size = 42;
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
            }
        });
        expect(wrapper.vm.max_num_inputs).toEqual(project.max_group_size);
    });

    test('max_num_inputs is max_num_members when max_num_members is non-null', () => {
        project.max_group_size = 42;
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                max_num_members: 40,
            }
        });
        expect(wrapper.vm.max_num_inputs).toEqual(40);
    });

    test('min_num_inputs is min of project.min_group_size and max_num_inputs', () => {
        project.min_group_size = 1;
        let options = {
            propsData: {
                project: project,
                course: course,
            },
            computed: {
                max_num_inputs: () => 3
            }
        };
        let wrapper = mount(GroupMembersForm, options);
        expect(wrapper.vm.min_num_inputs).toEqual(1);

        wrapper.destroy();
        project.min_group_size = 5;
        wrapper = mount(GroupMembersForm, options);
        expect(wrapper.vm.min_num_inputs).toEqual(3);
    });

    test('min_num_inputs is 1 when ignore_group_size_limits is true', () => {
        project.min_group_size = 2;
        project.max_group_size = 3;
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                ignore_group_size_limits: true,
            },
        });

        expect(wrapper.vm.min_num_inputs).toEqual(1);
    });

    test('Add member button disabled when num inputs is max_num_inputs', () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: ['', '', '']
            },
            computed: {
                min_num_inputs: () => 1,
                max_num_inputs: () => 3
            }
        });

        expect(wrapper.find('.add-member-button').element).toBeDisabled();
    });

    test('Remove member buttons disabled when num inputs is min_num_inputs', () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: ['', '']
            },
            computed: {
                min_num_inputs: () => 2,
                max_num_inputs: () => 3
            }
        });

        let remove_buttons = wrapper.findAll('.remove-member-button');
        for (let i = 0; i < remove_buttons.length; ++i) {
            expect(remove_buttons.at(i).element).toBeDisabled();
        }
    });

    test('Add member', async () => {
        project.max_group_size = 2;
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: ['spam']
            }
        });

        let add_button = wrapper.find('.add-member-button');
        expect(add_button.element).not.toBeDisabled();
        await add_button.trigger('click');

        let inputs = wrapper.findAllComponents({name: 'ValidatedInput'});
        expect(inputs.length).toEqual(2);

        expect(get_validated_input_text(inputs.at(0))).toEqual('spam');
        expect(get_validated_input_text(inputs.at(1))).toEqual(course.allowed_guest_domain);
    });

    test('Remove member', async () => {
        project.max_group_size = 2;
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: ['spam', 'egg']
            }
        });
        let inputs = wrapper.findAllComponents({name: 'ValidatedInput'});
        expect(inputs.length).toEqual(2);

        let remove_button = wrapper.findAll('.remove-member-button').at(1);
        expect(remove_button.element).not.toBeDisabled();
        await remove_button.trigger('click');

        inputs = wrapper.findAllComponents({name: 'ValidatedInput'});
        expect(inputs.length).toEqual(1);

        expect(get_validated_input_text(inputs.at(0))).toEqual('spam');

        expect(emitted(wrapper, 'input')).toEqual([[['spam']]]);
    });

    test('value watcher', async () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: ['spam']
            }
        });
        expect(wrapper.vm.d_usernames).toEqual(['spam']);

        let new_value = ['egg'];
        await wrapper.setProps({value: new_value});
        expect(wrapper.vm.d_usernames).not.toBe(new_value);
        expect(wrapper.vm.d_usernames).toEqual(new_value);
    });

    test('Username input invalid non-email', async () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: ['spam', 'egg@spam.com']
            }
        });
        let inputs = wrapper.findAllComponents({name: 'ValidatedInput'});
        expect((<ValidatedInput> inputs.at(0).vm).is_valid).toBe(false);
        expect((<ValidatedInput> inputs.at(1).vm).is_valid).toBe(true);

        expect(emitted(wrapper, 'form_validity_changed')).toEqual([[false]]);
        await set_validated_input_text(inputs.at(0), 'wa@luigi.net');
        expect(emitted(wrapper, 'form_validity_changed')).toEqual([[false], [true]]);
        expect(emitted(wrapper, 'input')).toEqual([[['wa@luigi.net', 'egg@spam.com']]]);
    });

    test('reset()', async () => {
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
            }
        });
        let input = <Wrapper<ValidatedInput>> wrapper.findComponent({name: 'ValidatedInput'});
        await set_validated_input_text(input, 'wa@luigi.net');
        expect(wrapper.vm.d_usernames).toEqual(['wa@luigi.net']);

        wrapper.vm.reset();
        await wrapper.vm.$nextTick();

        expect(get_validated_input_text(input)).toEqual(course.allowed_guest_domain);
        expect(wrapper.vm.d_usernames).toEqual([course.allowed_guest_domain]);
    });

    test('submit()', async () => {
        let value = ['spam@egg.net', 'wa@luigi.net'];
        let wrapper = mount(GroupMembersForm, {
            propsData: {
                project: project,
                course: course,
                value: value
            }
        });

        wrapper.findComponent({name: 'ValidatedForm'}).vm.$emit('submit');
        await wrapper.vm.$nextTick();
        expect(emitted(wrapper, 'submit')[0][0]).toEqual(value);
    });
});
