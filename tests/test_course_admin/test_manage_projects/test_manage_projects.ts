import { config, Wrapper } from '@vue/test-utils';

import { Course, HttpError, Project, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import ManageProjects from '@/components/course_admin/manage_projects/manage_projects.vue';
import SingleProject from '@/components/course_admin/manage_projects/single_project.vue';
import ValidatedInput from '@/components/validated_input.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { find_by_name, set_validated_input_text, wait_until } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Manage projects tests', () => {
    let component: ManageProjects;
    let wrapper: Wrapper<ManageProjects>;
    let user: User;
    let current_course: Course;
    let another_course: Course;
    let courses: Course[];
    let new_project: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];

    beforeEach(async () => {
        user = data_ut.make_user();

        current_course = data_ut.make_course();
        another_course = data_ut.make_course();

        project_1 = data_ut.make_project(current_course.pk, {name: 'Project 1'});
        project_2 = data_ut.make_project(current_course.pk, {name: 'Project 2'});

        new_project = data_ut.make_project(current_course.pk, {name: 'Project 0'});

        projects = [project_1, project_2];
        courses = [current_course, another_course];

        data_ut.set_global_current_user(user);
        sinon.stub(user, 'courses_is_admin_for').returns(Promise.resolve(courses));
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve(projects));

        wrapper = managed_mount(ManageProjects, {
            propsData: {
                course: current_course
            },
            stubs: ['router-link']
        });
        component = wrapper.vm;
        await wrapper.vm.$nextTick();
    });

    test('Existing projects get fetched (sorted in http response)', async () => {
        expect(wrapper.vm.projects).toEqual(projects);
        expect(wrapper.vm.projects[0]).toEqual(project_1);
        expect(wrapper.vm.projects[1]).toEqual(project_2);

        let rendered_projects = wrapper.findAll({name: 'SingleProject'});
        expect((<SingleProject> rendered_projects.at(0).vm).project).toEqual(project_1);
        expect((<SingleProject> rendered_projects.at(1).vm).project).toEqual(project_2);
    });

    test('New project name cannot be an empty string', async () => {
        let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;
        expect(validated_input.is_valid).toBe(false);

        let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
        (<HTMLInputElement> new_project_name.element).value = "   ";
        new_project_name.trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input.is_valid).toBe(false);
        expect(wrapper.find('.add-project-button').is('[disabled]')).toBe(true);
    });

    test('A project can be created and then displayed in the list of projects', async () => {
        expect(wrapper.vm.projects.length).toEqual(2);

        let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;
        expect(validated_input.is_valid).toBe(false);

        let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
        (<HTMLInputElement> new_project_name.element).value = new_project.name;
        new_project_name.trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input.is_valid).toBe(true);

        let create_project_stub = sinon.stub(Project, 'create').callsFake(() => {
            Project.notify_project_created(new_project);
            return Promise.resolve(new_project);
        });
        wrapper.find({ref: 'new_project_form'}).trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_project_stub.firstCall.calledWith(
            current_course.pk, { name: new_project.name }
        )).toBe(true);
        expect(wrapper.vm.projects.length).toEqual(3);
        expect(wrapper.vm.projects[0]).toEqual(new_project);
        expect(wrapper.vm.projects[1]).toEqual(project_1);
        expect(wrapper.vm.projects[2]).toEqual(project_2);
    });

    test('Create project API errors handled', async () => {
        set_validated_input_text(wrapper.find({ref: "new_project_name"}), project_1.name);
        await wrapper.vm.$nextTick();

        let create_project_stub = sinon.stub(Project, 'create').returns(
            Promise.reject(
                new HttpError(400, {
                    __all__: "Project with this Name and Course already exists."
                })
            )
        );

        wrapper.find({ref: 'new_project_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_adding_project)).toBe(true);

        expect(create_project_stub.calledOnce).toBe(true);
        let api_errors = find_by_name<APIErrors>(wrapper, 'APIErrors');
        expect(api_errors.vm.d_api_errors.length).toEqual(1);
    });

    test('A project can be cloned to the current course', async () => {
        expect(wrapper.findAll({name: 'SingleProject'}).length).toEqual(2);

        let clone = data_ut.make_project(current_course.pk, {name: 'Cloney'});
        Project.notify_project_created(clone);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll({name: 'SingleProject'}).length).toEqual(3);
        expect(wrapper.vm.projects[0]).toEqual(clone);
        expect(wrapper.vm.projects[1]).toEqual(project_1);
        expect(wrapper.vm.projects[2]).toEqual(project_2);
    });

    test('Cloned project comes from different course', async () => {
        expect(wrapper.findAll({name: 'SingleProject'}).length).toEqual(2);

        let clone = data_ut.make_project(another_course.pk, {name: 'Cloney'});
        Project.notify_project_created(clone);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll({name: 'SingleProject'}).length).toEqual(2);
    });
});
