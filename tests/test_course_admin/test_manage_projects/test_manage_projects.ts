import APIErrors from '@/componenets/api_errors.vue';
import ManageProjects from '@/components/course_admin/manage_projects/manage_projects.vue';
import SingleProject from '@/components/course_admin/manage_projects/single_project.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import { create } from 'domain';
import * as sinon from 'sinon';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ManageProjects.vue', () => {
    let component: ManageProjects;
    let wrapper: Wrapper<ManageProjects>;
    let user: User;
    let current_course: Course;
    let another_course: Course;
    let new_project: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];
    let newly_cloned_project_1: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        user = new User({
            pk: 1, username: 'ashberg', first_name: 'Ashley',
            last_name: 'IceBerg', email: 'iceberg@umich.edu',
            is_superuser: false
        });

        current_course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        another_course = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2020, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        project_1 = new Project({
            pk: 10,
            name: "Project 1 - Statistics",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        project_2 = new Project({
            pk: 4,
            name: "Project 2 - Images",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        new_project = new Project ({
            pk: 5,
            name: "New Project",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        projects = [project_1, project_2];

        newly_cloned_project_1 = new Project({
            pk: 12,
            name: "george_cloney.cpp",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best_with_normal_fdbk,
            hide_ultimate_submission_fdbk: false
        });

        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve(projects));

        wrapper = mount(ManageProjects, {
            propsData: {
                course: current_course
            },
            stubs: ['router-link']
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

    test('Existing projects get fetched (sorted in http response)', async () => {
        await component.$nextTick();

        expect(component.d_course).toEqual(current_course);
        expect(component.projects).toEqual(projects);
        expect(component.projects[0]).toEqual(project_1);
        expect(component.projects[1]).toEqual(project_2);
    });

    test('New project name cannot be an empty string', async () => {
        let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;
        expect(validated_input.is_valid).toBe(false);

        let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
        (<HTMLInputElement> new_project_name.element).value = "   ";
        new_project_name.trigger('input');
        await component.$nextTick();

        expect(validated_input.is_valid).toBe(false);
        expect(wrapper.find('.add-project-button').is('[disabled]')).toBe(true);
    });

    test('A project can be created and then displayed in the list of projects', async () => {
        expect(component.projects.length).toEqual(2);

        let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;
        expect(validated_input.is_valid).toBe(false);

        let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
        (<HTMLInputElement> new_project_name.element).value = new_project.name;
        new_project_name.trigger('input');
        await component.$nextTick();

        expect(validated_input.is_valid).toBe(true);

        let create_project_stub = sinon.stub(Project, 'create').returns(
            Promise.resolve(new_project)
        );
        wrapper.find('.add-project-button').trigger('click');
        await component.$nextTick();

        expect(create_project_stub.firstCall.calledWith(
            current_course.pk, { name: new_project.name }
        )).toBe(true);
        expect(component.projects.length).toEqual(3);
        expect(component.projects[0]).toEqual(new_project);
        expect(component.projects[1]).toEqual(project_1);
        expect(component.projects[2]).toEqual(project_2);
    });

    test('New project name must be unique among projects in the same course - violates ' +
         'condition',
         async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Project with this Name and Course already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        expect(component.projects.length).toEqual(2);

        let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;
        expect(validated_input.is_valid).toBe(false);

        let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
        (<HTMLInputElement> new_project_name.element).value = project_1.name;
        new_project_name.trigger('input');
        await component.$nextTick();

        expect(validated_input.is_valid).toBe(true);

        let create_project_stub = sinon.stub(Project, 'create').returns(
            Promise.reject(axios_response_instance)
        );

        wrapper.find('.add-project-button').trigger('click');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        // Note: api_errors.d_api_errors is flagged by the compiler here with error message
        // "Property 'd_api_errors' does not exist on type 'Vue'." It's unclear why that
        // is happening, so we'll access it through $data for now.
        expect(create_project_stub.calledOnce).toBe(true);
        expect(api_errors.$data.d_api_errors.length).toBe(1);
    });

    test('A project can be cloned to the current course', async () => {
        expect(component.projects.length).toEqual(2);

        let project_to_clone = <SingleProject> wrapper.findAll(
            {ref: 'single_project'}
        ).at(0).vm;

        let courses = [current_course, another_course];
        sinon.stub(User, 'get_current').returns(Promise.resolve(user));
        sinon.stub(user, 'courses_is_admin_for').returns(Promise.resolve(courses));

        wrapper.findAll('.copier').at(0).trigger('click');
        await component.$nextTick();

        project_to_clone.cloned_project_name = newly_cloned_project_1.name;
        await component.$nextTick();

        expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

        let copy_to_course_stub = sinon.stub(project_1, 'copy_to_course').returns(
            Promise.resolve(newly_cloned_project_1)
        );

        wrapper.find('.clone-project-button').trigger('click');
        await component.$nextTick();

        expect(copy_to_course_stub.firstCall.calledWith(
            current_course.pk, newly_cloned_project_1.name)
        ).toBe(true);
        expect(component.projects.length).toEqual(3);
        expect(component.projects[0]).toEqual(project_1);
        expect(component.projects[1]).toEqual(project_2);
        expect(component.projects[2]).toEqual(newly_cloned_project_1);
    });
});
