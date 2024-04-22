import { mount, Wrapper } from '@vue/test-utils';

import { Course, HttpError, Project, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import SingleProject from '@/components/course_admin/manage_projects/single_project.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { make_course, make_project, make_user, set_global_current_user } from '@/tests/data_utils';
import { set_select_object_value, set_validated_input_text, validated_input_is_valid, wait_until } from '@/tests/utils';


describe('SingleProject.vue', () => {
    let wrapper: Wrapper<SingleProject>;
    let course_1: Course;
    let course_2: Course;
    let same_course_project_clone: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];
    let user: User;

    beforeEach(async () => {
        user = make_user();
        set_global_current_user(user);

        course_1 = make_course();
        course_2 = make_course();

        sinon.stub(user, "courses_is_admin_for").resolves([course_1, course_2]);

        project_1 = make_project(course_1.pk);
        project_2 = make_project(course_1.pk);

        projects = [project_1, project_2];

        let data = {...project_1};
        data.name = 'Cloned project 1';
        same_course_project_clone = make_project(course_1.pk, data);

        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
            },
            stubs: ['router-link']
        });
        await wrapper.vm.$nextTick();
    });

    test('Data members are initialized correctly', async () => {
        expect(wrapper.vm.course).toEqual(course_1);
        expect(wrapper.vm.project).toEqual(project_1);
        expect(wrapper.vm.course_to_clone_to).toEqual(course_1);
    });

    test('The cloned project name cannot be an empty string', async () => {
        await wrapper.find('.copy-project').trigger('click');
        let name_input = wrapper.findComponent({ref: "cloned_project_name"});

        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(true);
        expect(validated_input_is_valid(name_input)).toBe(false);

        await set_validated_input_text(wrapper.findComponent({ref: 'cloned_project_name'}), '   ');
        expect(validated_input_is_valid(name_input)).toBe(false);

        wrapper.findComponent({ref: 'clone_project_modal'}).vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(false);
    });

    test('Clone project to current course', async () => {
        await wrapper.find('.copy-project').trigger('click');
        let name_input = wrapper.findComponent({ref: "cloned_project_name"});

        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(true);
        expect(validated_input_is_valid(name_input)).toBe(false);

        await set_validated_input_text(
            wrapper.findComponent({ref: 'cloned_project_name'}), same_course_project_clone.name);

        expect(wrapper.vm.course_to_clone_to).toBe(course_1);
        expect(validated_input_is_valid(name_input)).toBe(true);
        expect(wrapper.find('.clone-project-button').element).not.toBeDisabled();

        sinon.stub(project_1, 'copy_to_course').returns(Promise.resolve(same_course_project_clone));

        await wrapper.find('.clone-project-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_cloning)).toBe(true);

        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(false);
    });

    test('Clone project to other course', async () => {
        await wrapper.find('.copy-project').trigger('click');

        let name_input = wrapper.findComponent({ref: "cloned_project_name"});

        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(validated_input_is_valid(name_input)).toBe(false);

        let data = {...project_2};
        data.name = 'Cloned project 2';
        let other_course_project_clone = make_project(course_2.pk, data);

        await set_validated_input_text(
            wrapper.findComponent({ref: 'cloned_project_name'}), other_course_project_clone.name);
        await set_select_object_value(
            wrapper.findComponent({ref: 'cloning_destinations_dropdown'}), course_2.pk);

        expect(wrapper.vm.course_to_clone_to).toBe(course_2);
        expect(validated_input_is_valid(name_input)).toBe(true);
        expect(wrapper.find('.clone-project-button').element).not.toBeDisabled();

        let copy_to_course_stub = sinon.stub(project_1, 'copy_to_course').resolves(
            other_course_project_clone);

        await wrapper.find('.clone-project-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_cloning)).toBe(true);

        expect(
            copy_to_course_stub.calledOnceWith(course_2.pk, other_course_project_clone.name)
        ).toEqual(true);
        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(false);
    });

    test('API errors handled', async () => {
        await wrapper.find('.copy-project').trigger('click');
        let name_input = wrapper.findComponent({ref: "cloned_project_name"});

        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(validated_input_is_valid(name_input)).toBe(false);

        await set_validated_input_text(
            wrapper.findComponent({ref: 'cloned_project_name'}), project_1.name);

        expect(wrapper.vm.course_to_clone_to).toBe(course_1);
        expect(validated_input_is_valid(name_input)).toBe(true);
        expect(wrapper.find('.clone-project-button').element).not.toBeDisabled();

        sinon.stub(project_1, 'copy_to_course').returns(
            Promise.reject(
                new HttpError(400, {__all__: "Project with this Name and Course already exists."}
            )
        ));
        await wrapper.find('.clone-project-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_cloning)).toBe(true);
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'clone_project_modal'}).exists()).toBe(true);
        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Visibility icons toggle based on project visibility to students', async () => {
        // Test when the project is visible to students
        wrapper.setProps({ project: make_project(course_1.pk, {visible_to_students: true})});
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.fa-eye').exists()).toBe(true);
        expect(wrapper.find('.fa-eye-slash').exists()).toBe(false);

        // Update the project to not visible and check for correct icons
        wrapper.setProps({ project: make_project(course_1.pk, {visible_to_students: false} )});
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.fa-eye').exists()).toBe(false);
        expect(wrapper.find('.fa-eye-slash').exists()).toBe(true);

    });
});
