import SingleProject from '@/components/manage_projects/single_project.vue';
import Modal from '@/components/modal.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import { AxiosError } from 'axios';

import { patch_async_class_method, patch_async_static_method } from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('SingleProject.vue', () => {
    let wrapper: Wrapper<SingleProject>;
    let single_project: SingleProject;
    let course_1: Course;
    let course_2: Course;
    let original_match_media: (query: string) => MediaQueryList;
    let newly_cloned_project_1: Project;
    let newly_cloned_project_2: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];
    let courses: Course[];
    let user: User;

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
            is_superuser: false});

        course_1 = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        course_2 = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2020, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        courses = [course_1];

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

        newly_cloned_project_2 = new Project({
            pk: 23,
            name: "rosemary_cloney.cpp",
            last_modified: "today",
            course: 2,
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
    });

    test('Data members are initialized correctly', async () => {
        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
                existing_projects: projects
            },
            stubs: ['router-link']
        });
        single_project = wrapper.vm;
        await single_project.$nextTick();

        expect(single_project.course).toEqual(course_1);
        expect(single_project.project).toEqual(project_1);
        expect(single_project.existing_projects).toEqual(projects);
        expect(single_project.odd_index).toEqual(false);
        expect(single_project.course_to_clone_to).toEqual(course_1);

        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test('The cloned project name cannot be an empty string', async () => {
        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
                existing_projects: projects
            },
            stubs: ['router-link']
        });

        single_project = wrapper.vm;
        await single_project.$nextTick();

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

                wrapper.find('.copier').trigger('click');
                await single_project.$nextTick();

                let modal = <Modal> wrapper.find({ ref: 'clone_project_modal'}).vm;
                let validated_input = <ValidatedInput> wrapper.find(
                    {ref: "cloned_project_name"}
                ).vm;

                expect(modal.is_open).toBe(true);
                expect(validated_input.is_valid).toBe(false);

                let clone_name = wrapper.find({ref: 'cloned_project_name'}).find('#input');
                (<HTMLInputElement> clone_name.element).value = "   ";
                clone_name.trigger('input');
                await single_project.$nextTick();

                expect(validated_input.is_valid).toBe(false);

                wrapper.find("#close-button").trigger('click');
                await single_project.$nextTick();

                expect(modal.is_open).toBe(false);

                if (wrapper.exists()) {
                    console.log("wrapper exists");
                    wrapper.destroy();
                }
            });
        });
    });

    test('When a project is cloned to the same course an event is emitted', async () => {
        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
                existing_projects: projects
            },
            stubs: ['router-link']
        });

        single_project = wrapper.vm;
        await single_project.$nextTick();

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

                wrapper.find('.copier').trigger('click');
                await single_project.$nextTick();

                let modal = <Modal> wrapper.find({ ref: 'clone_project_modal'}).vm;
                let validated_input = <ValidatedInput> wrapper.find(
                    {ref: "cloned_project_name"}).vm;

                expect(modal.is_open).toBe(true);
                expect(validated_input.is_valid).toBe(false);

                let clone_name = wrapper.find({ref: 'cloned_project_name'}).find('#input');
                (<HTMLInputElement> clone_name.element).value = newly_cloned_project_1.name;
                clone_name.trigger('input');
                await single_project.$nextTick();

                expect(single_project.course_to_clone_to).toBe(course_1);
                expect(validated_input.is_valid).toBe(true);
                expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

                return patch_async_class_method(
                    Project,
                    'copy_to_course',
                    () => Promise.resolve(newly_cloned_project_1),
                    async () => {

                    wrapper.find('.clone-project-button').trigger('click');
                    await single_project.$nextTick();

                    expect(modal.is_open).toBe(false);
                    expect(wrapper.emitted().add_cloned_project.length).toEqual(1);

                    if (wrapper.exists()) {
                        console.log("wrapper exists");
                        wrapper.destroy();
                    }
                });
            });
        });
    });

    test('When a project is cloned to a different course an event is not emitted',
         async () => {
        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
                existing_projects: projects
            },
            stubs: ['router-link']
        });

        single_project = wrapper.vm;
        await single_project.$nextTick();

        courses = [course_1, course_2];
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

                wrapper.find('.copier').trigger('click');
                await single_project.$nextTick();

                let modal = <Modal> wrapper.find({ ref: 'clone_project_modal'}).vm;
                let validated_input = <ValidatedInput> wrapper.find(
                    {ref: "cloned_project_name"}
                ).vm;

                expect(modal.is_open).toBe(true);
                expect(validated_input.is_valid).toBe(false);

                let clone_name = wrapper.find({ref: 'cloned_project_name'}).find('#input');
                (<HTMLInputElement> clone_name.element).value = newly_cloned_project_2.name;
                clone_name.trigger('input');
                await single_project.$nextTick();

                single_project.course_to_clone_to = course_2;

                expect(single_project.course_to_clone_to).toBe(course_2);
                expect(validated_input.is_valid).toBe(true);
                expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

                return patch_async_class_method(
                    Project,
                    'copy_to_course',
                    () => Promise.resolve(newly_cloned_project_2),
                    async () => {

                    wrapper.find('.clone-project-button').trigger('click');
                    await single_project.$nextTick();

                    expect(modal.is_open).toBe(false);
                    expect(wrapper.emitted().add_cloned_project).toBeFalsy();

                    if (wrapper.exists()) {
                        console.log("wrapper exists");
                        wrapper.destroy();
                    }
                });
            });
        });
    });

    test('Cloned project name must be unique among projects in the same course - violates ' +
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

         wrapper = mount(SingleProject, {
             propsData: {
                 course: course_1,
                 project: project_1,
                 existing_projects: projects
             },
             stubs: ['router-link']
         });

         single_project = wrapper.vm;
         await single_project.$nextTick();

         courses = [course_1, course_2];
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

                 wrapper.find('.copier').trigger('click');
                 await single_project.$nextTick();

                 let modal = <Modal> wrapper.find({ ref: 'clone_project_modal'}).vm;
                 let validated_input = <ValidatedInput> wrapper.find(
                     {ref: "cloned_project_name"}
                 ).vm;

                 expect(modal.is_open).toBe(true);
                 expect(validated_input.is_valid).toBe(false);

                 let clone_name = wrapper.find({ref: 'cloned_project_name'}).find('#input');
                 (<HTMLInputElement> clone_name.element).value = project_1.name;
                 clone_name.trigger('input');
                 await single_project.$nextTick();

                 expect(single_project.course_to_clone_to).toBe(course_1);
                 expect(validated_input.is_valid).toBe(true);
                 expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

                 return patch_async_class_method(
                     Project,
                     'copy_to_course',
                     () => Promise.reject(axios_response_instance),
                     async () => {

                     wrapper.find('.clone-project-button').trigger('click');
                     await single_project.$nextTick();

                     expect(modal.is_open).toBe(true);
                     expect(single_project.cloning_api_error_present).toBe(true);

                     if (wrapper.exists()) {
                         console.log("wrapper exists");
                         wrapper.destroy();
                     }
                 });
             });
         });
    });

    // Would this ever happen?
    test('When attempting to copy a project and response.data.__all__ is empty - no api ' +
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

         wrapper = mount(SingleProject, {
             propsData: {
                 course: course_1,
                 project: project_1,
                 existing_projects: projects
             },
             stubs: ['router-link']
         });

         single_project = wrapper.vm;
         await single_project.$nextTick();

         courses = [course_1, course_2];
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

                 wrapper.find('.copier').trigger('click');
                 await single_project.$nextTick();

                 let modal = <Modal> wrapper.find({ ref: 'clone_project_modal'}).vm;
                 let validated_input = <ValidatedInput> wrapper.find(
                     {ref: "cloned_project_name"}
                 ).vm;

                 expect(modal.is_open).toBe(true);
                 expect(validated_input.is_valid).toBe(false);

                 let clone_name = wrapper.find({ref: 'cloned_project_name'}).find('#input');
                 (<HTMLInputElement> clone_name.element).value = project_1.name;
                 clone_name.trigger('input');
                 await single_project.$nextTick();

                 expect(single_project.course_to_clone_to).toBe(course_1);
                 expect(validated_input.is_valid).toBe(true);
                 expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

                 return patch_async_class_method(
                     Project,
                     'copy_to_course',
                     () => Promise.reject(axios_response_instance),
                     async () => {

                     wrapper.find('.clone-project-button').trigger('click');
                     await single_project.$nextTick();

                     expect(modal.is_open).toBe(true);
                     expect(single_project.cloning_api_error_present).toBe(false);

                     if (wrapper.exists()) {
                         console.log("wrapper exists");
                         wrapper.destroy();
                     }
                 });
             });
         });
     });

    // If this test is uncommented, the compiler will respond with an error that:
    // "Property 'data' is missing in type 'AxiosError'"
    // test('If __all__ is not defined in the AxiosResponse when making a request to ' +
    //      'clone a project, an error will be thrown',
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
    //     wrapper = mount(SingleProject, {
    //         propsData: {
    //             course: course_1,
    //             project: project_1,
    //             existing_projects: projects
    //         }
    //     });
    //
    //     let single_project = wrapper.vm;
    //     await single_project.$nextTick();
    //
    //     courses = [course_1, course_2];
    //     return patch_async_static_method(
    //         User,
    //         'get_current',
    //         () => Promise.resolve(user),
    //         async () => {
    //
    //         return patch_async_class_method(
    //             User,
    //             'courses_is_admin_for',
    //             () => Promise.resolve(courses),
    //             async () => {
    //
    //             wrapper.find('.copier').trigger('click');
    //             await single_project.$nextTick();
    //
    //             let modal = <Modal> wrapper.find({ ref: 'clone_project_modal'}).vm;
    //             expect(modal.is_open).toBe(true);
    //
    //             let validated_input = <ValidatedInput> wrapper.find(
    //                 {ref: "cloned_project_name"}).vm;
    //
    //             expect(validated_input.is_valid).toBe(false);
    //
    //             let clone_name = wrapper.find({ref: 'cloned_project_name'}).find('#input');
    //             (<HTMLInputElement> clone_name.element).value = project_1.name;
    //             clone_name.trigger('input');
    //             await single_project.$nextTick();
    //
    //             expect(single_project.course_to_clone_to).toBe(course_1);
    //             expect(validated_input.is_valid).toBe(true);
    //             expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);
    //
    //             return patch_async_class_method(
    //                 Project,
    //                 'copy_to_course',
    //                 () => Promise.reject(axios_response_instance),
    //                 async () => {
    //
    //                 // Throws TypeError: Cannot read property '__all__' of undefined
    //                 expect(() =>
    //                        handle_add_cloned_project_error(single_project,
    //                                                        axios_response_instance)
    //                 ).toThrow(Error);
    //
    //                 if (wrapper.exists()) {
    //                     console.log("wrapper exists");
    //                     wrapper.destroy();
    //                 }
    //             });
    //         });
    //     });
    // });

    test('A cloning project api error can be dismissed', async () => {
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

        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
                existing_projects: projects
            },
            stubs: ['router-link']
        });

        single_project = wrapper.vm;
        await single_project.$nextTick();

        courses = [course_1, course_2];
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

                wrapper.find('.copier').trigger('click');
                await single_project.$nextTick();

                let modal = <Modal> wrapper.find({ ref: 'clone_project_modal'}).vm;
                let validated_input = <ValidatedInput> wrapper.find(
                    {ref: "cloned_project_name"}
                ).vm;

                expect(modal.is_open).toBe(true);
                expect(validated_input.is_valid).toBe(false);

                let clone_name = wrapper.find({ref: 'cloned_project_name'}).find('#input');
                (<HTMLInputElement> clone_name.element).value = project_1.name;
                clone_name.trigger('input');
                await single_project.$nextTick();

                expect(single_project.course_to_clone_to).toBe(course_1);
                expect(validated_input.is_valid).toBe(true);
                expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);
                expect(wrapper.findAll('.api-error').length).toEqual(0);

                return patch_async_class_method(
                    Project,
                    'copy_to_course',
                    () => Promise.reject(axios_response_instance),
                    async () => {

                    wrapper.find('.clone-project-button').trigger('click');
                    await single_project.$nextTick();

                    expect(modal.is_open).toBe(true);
                    expect(single_project.cloning_api_error_present).toBe(true);
                    expect(wrapper.findAll('.api-error').length).toBeGreaterThan(0);

                    wrapper.findAll('.dismiss-error-button').at(0).trigger('click');

                    expect(wrapper.findAll('.api-error').length).toEqual(0);

                    if (wrapper.exists()) {
                        console.log("wrapper exists");
                        wrapper.destroy();
                    }
                });
            });
        });
    });

    test('When the existing_projects array is updated, d_projects gets updated', async () => {
        const component = {
            template:  `<single-project ref="single_project"
                                        :project="curr_project"
                                        :course="curr_course"
                                        :existing_projects="course_1_projects">
                        </single-project>`,
            components: {
                'single-project': SingleProject
            },
            data: () => {
                return {
                    curr_project: project_1,
                    curr_course: course_1,
                    course_1_projects: [project_1, project_2]
                };
            }
        };

        let wrapper2 = mount(component, {
            stubs: ['router-link']
        });
        await wrapper2.vm.$nextTick();

        const single_project2 = <SingleProject> wrapper2.find({ref: 'single_project'}).vm;

        expect(single_project2.d_projects).toEqual([project_1, project_2]);

        wrapper2.setData({course_1_projects: [project_1, project_2, newly_cloned_project_1]});
        await wrapper2.vm.$nextTick();

        expect(single_project2.d_projects).toEqual([project_1, project_2, newly_cloned_project_1]);

        if (wrapper2.exists()) {
            console.log("wrapper exists");
            wrapper2.destroy();
        }
    });
});
