import ManageProjects from '@/components/course_admin/manage_projects/manage_projects.vue';
import SingleProject from '@/components/course_admin/manage_projects/single_project.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import { AxiosError } from 'axios';

import {
    patch_async_class_method,
    patch_async_static_method
} from '../../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ManageProjects.vue', () => {
    let wrapper: Wrapper<ManageProjects>;
    let original_match_media: (query: string) => MediaQueryList;
    let user: User;
    let current_course: Course;
    let another_course: Course;
    let new_project: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];
    let newly_cloned_project_1: Project;

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
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test('Existing projects get fetched (sorted in http response)', async () => {
        return patch_async_static_method(
            Project,
            'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {

            wrapper = mount(ManageProjects, {
                propsData: {
                    course: current_course
                },
                stubs: ['router-link']
            });

            let manage_projects = wrapper.vm;
            await manage_projects.$nextTick();

            expect(manage_projects.d_course).toEqual(current_course);
            expect(manage_projects.projects).toEqual(projects);
            expect(manage_projects.projects[0]).toEqual(project_1);
            expect(manage_projects.projects[1]).toEqual(project_2);
        });
    });

    test('New project name cannot be an empty string', async () => {
        return patch_async_static_method(
            Project,
            'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {

            wrapper = mount(ManageProjects, {
                propsData: {
                    course: current_course
                },
                stubs: ['router-link']
            });

            let manage_projects = wrapper.vm;
            await manage_projects.$nextTick();

            let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;

            expect(validated_input.is_valid).toBe(false);

            let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
            (<HTMLInputElement> new_project_name.element).value = "   ";
            new_project_name.trigger('input');
            await manage_projects.$nextTick();

            expect(validated_input.is_valid).toBe(false);
            expect(wrapper.find('.add-project-button').is('[disabled]')).toBe(true);
        });
    });

    test('A project can be created and then displayed in the list of projects', async () => {
        return patch_async_static_method(
            Project,
            'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {

            wrapper = mount(ManageProjects, {
                propsData: {
                    course: current_course
                },
                stubs: ['router-link']
            });

            let manage_projects = wrapper.vm;
            await manage_projects.$nextTick();

            expect(manage_projects.projects.length).toEqual(2);

            let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;

            expect(validated_input.is_valid).toBe(false);

            let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
            (<HTMLInputElement> new_project_name.element).value = new_project.name;
            new_project_name.trigger('input');
            await manage_projects.$nextTick();

            expect(validated_input.is_valid).toBe(true);

            return patch_async_static_method(
                Project,
                'create',
                () => Promise.resolve(new_project),
                async () => {

                wrapper.find('.add-project-button').trigger('click');
                await manage_projects.$nextTick();

                expect(manage_projects.projects.length).toEqual(3);
                expect(manage_projects.projects[0]).toEqual(new_project);
                expect(manage_projects.projects[1]).toEqual(project_1);
                expect(manage_projects.projects[2]).toEqual(project_2);
            });
        });
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

        return patch_async_static_method(
            Project,
            'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {

            wrapper = mount(ManageProjects, {
                propsData: {
                    course: current_course
                },
                stubs: ['router-link']
            });

            let manage_projects = wrapper.vm;
            await manage_projects.$nextTick();

            expect(manage_projects.projects.length).toEqual(2);

            let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;

            expect(validated_input.is_valid).toBe(false);

            let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
            (<HTMLInputElement> new_project_name.element).value = project_1.name;
            new_project_name.trigger('input');
            await manage_projects.$nextTick();

            expect(validated_input.is_valid).toBe(true);

            return patch_async_static_method(
                Project,
                'create',
                () => Promise.reject(axios_response_instance),
                async () => {

                wrapper.find('.add-project-button').trigger('click');
                await manage_projects.$nextTick();

                expect(manage_projects.new_project_api_errors.length).toBeGreaterThan(0);
                expect(manage_projects.projects.length).toEqual(2);
            });
        });
    });


    test('When attempting to create a project and response.data.__all__ is empty - no api ' +
         'error is displayed and a new project is not created',
         async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: []
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        return patch_async_static_method(
            Project,
            'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {

            wrapper = mount(ManageProjects, {
                propsData: {
                    course: current_course
                },
                stubs: ['router-link']
            });

            let manage_projects = wrapper.vm;
            await manage_projects.$nextTick();

            expect(manage_projects.projects.length).toEqual(2);

            let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;

            expect(validated_input.is_valid).toBe(false);

            let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
            (<HTMLInputElement> new_project_name.element).value = project_1.name;
            new_project_name.trigger('input');
            await manage_projects.$nextTick();

            expect(validated_input.is_valid).toBe(true);
            expect(wrapper.findAll('.api-error').length).toEqual(0);

            return patch_async_static_method(
                Project,
                'create',
                () => Promise.reject(axios_response_instance),
                async () => {

                wrapper.find('.add-project-button').trigger('click');
                await manage_projects.$nextTick();

                expect(manage_projects.new_project_api_errors.length).toEqual(0);
                expect(manage_projects.projects.length).toEqual(2);
            });
        });
    });

    test('New project api errors can be dismissed', async () => {
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

        return patch_async_static_method(
            Project,
            'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {

            wrapper = mount(ManageProjects, {
                propsData: {
                    course: current_course
                },
                stubs: ['router-link']
            });

            let manage_projects = wrapper.vm;
            await manage_projects.$nextTick();

            expect(manage_projects.projects.length).toEqual(2);

            let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;

            expect(validated_input.is_valid).toBe(false);

            let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
            (<HTMLInputElement> new_project_name.element).value = project_1.name;
            new_project_name.trigger('input');
            await manage_projects.$nextTick();

            expect(validated_input.is_valid).toBe(true);
            expect(wrapper.findAll('.api-error').length).toEqual(0);

            return patch_async_static_method(
                Project,
                'create',
                () => Promise.reject(axios_response_instance),
                async () => {

                wrapper.find('.add-project-button').trigger('click');
                await manage_projects.$nextTick();

                expect(manage_projects.new_project_api_errors.length).toBeGreaterThan(0);
                expect(manage_projects.projects.length).toEqual(2);

                wrapper.findAll('.dismiss-error-button').at(0).trigger('click');

                expect(wrapper.findAll('.api-error').length).toEqual(0);
            });
        });
    });

    // If this test is uncommented, the compiler will respond with an error that:
    // "Property 'data' is missing in type 'AxiosError'"
    // test('If __all__ is not defined in the AxiosResponse when making a request to ' +
    //      'add a project, an error will be thrown',
    //      async () => {
    //     let axios_response_instance: AxiosError = {
    //         name: 'AxiosError',
    //         message: 'u heked up',
    //         response: {
    //             data: {},
    //             status: 400,
    //             statusText: 'OK',
    //             headers: {},
    //             request: {},
    //             config: {}
    //         },
    //         config: {},
    //     };
    //
    //     return patch_async_static_method(
    //         Project,
    //         'get_all_from_course',
    //         () => Promise.resolve(projects),
    //         async () => {
    //
    //         wrapper = mount(ManageProjects, {
    //             propsData: {
    //                 course: current_course
    //             }
    //         });
    //
    //         let manage_projects = wrapper.vm;
    //         await manage_projects.$nextTick();
    //
    //         expect(manage_projects.projects.length).toEqual(2);
    //
    //         let validated_input = <ValidatedInput> wrapper.find({ref: "new_project_name"}).vm;
    //
    //         expect(validated_input.is_valid).toBe(false);
    //
    //         let new_project_name = wrapper.find({ref: 'new_project_name'}).find('#input');
    //         (<HTMLInputElement> new_project_name.element).value = project_1.name;
    //         new_project_name.trigger('input');
    //         await manage_projects.$nextTick();
    //
    //         expect(validated_input.is_valid).toBe(true);
    //         expect(wrapper.findAll('.api-error').length).toEqual(0);
    //
    //         return patch_async_static_method(
    //             Project,
    //             'create',
    //             () => Promise.reject(axios_response_instance),
    //             async () => {
    //
    //             return patch_async_static_method(
    //                 Project,
    //                 'create',
    //                 () => Promise.reject(axios_response_instance),
    //                 async () => {
    //
    //                 // Throws TypeError: Cannot read property '__all__' of undefined
    //                 expect(() =>
    //                            handle_add_project_error(manage_projects, axios_response_instance
    //                 )).toThrow(Error);
    //             });
    //         });
    //     });
    // });

    test('A project can be cloned to the current course', async () => {
        return patch_async_static_method(
            Project,
            'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {

            wrapper = mount(ManageProjects, {
                propsData: {
                    course: current_course
                },
                stubs: ['router-link']
            });

            let manage_projects = wrapper.vm;
            await manage_projects.$nextTick();

            expect(manage_projects.projects.length).toEqual(2);

            let project_to_clone = <SingleProject> wrapper.findAll(
                {ref: 'single_project'}
            ).at(0).vm;

            let courses = [current_course, another_course];
            return patch_async_static_method(
                User,
                'get_current',
                () => Promise.resolve(user),
                async () => {

                return patch_async_class_method(
                    User,
                    'courses_is_admin_for',
                    () => Promise.resolve(courses),
                    async () => {

                    wrapper.findAll('.copier').at(0).trigger('click');
                    await manage_projects.$nextTick();

                    project_to_clone.cloned_project_name = newly_cloned_project_1.name;
                    await manage_projects.$nextTick();

                    expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

                    return patch_async_class_method(
                        Project,
                        'copy_to_course',
                        () => Promise.resolve(newly_cloned_project_1),
                        async () => {

                        wrapper.find('.clone-project-button').trigger('click');
                        await manage_projects.$nextTick();

                        expect(manage_projects.projects.length).toEqual(3);
                        expect(manage_projects.projects[0]).toEqual(project_1);
                        expect(manage_projects.projects[1]).toEqual(project_2);
                        expect(manage_projects.projects[2]).toEqual(newly_cloned_project_1);
                    });
                });
            });
        });
    });
});
