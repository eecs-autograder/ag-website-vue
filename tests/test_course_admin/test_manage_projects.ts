import ManageProjects from '@/components/course_admin/manage_projects.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester , UltimateSubmissionPolicy } from 'ag-client-typescript';
import { AxiosError, AxiosResponse } from 'axios';
import Vue from 'vue';

import {
    patch_async_class_method,
    patch_async_static_method,
    patch_component_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ManageProjects.vue', () => {
    let wrapper: Wrapper<ManageProjects>;
    let manage_projects: ManageProjects;
    let course: Course;
    let original_match_media: (query: string) => MediaQueryList;
    let new_project: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];

    const $route = {
        path: '/web/course_admin/:courseId',
        params: { courseId: '2' }
    };


    beforeEach(() => {
        course = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, last_modified: ''
        });
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        project_1 = new Project({
            pk: 10,
            name: "Project 1 - Statistics",
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
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        project_2 = new Project({
            pk: 4,
            name: "Project 2 - Images",
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
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        projects = [project_1, project_2];

        new_project = new Project({
            pk: 12,
            name: "Lab 09 - Functors",
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
            hide_ultimate_submission_fdbk: false,
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

    test('New Project name cannot be the empty string', async () => {
        wrapper = mount(ManageProjects, {
            propsData: {
                course: course,
            }
        });

        manage_projects = wrapper.vm;

        expect(manage_projects.new_project_name).toEqual("");
        const spy = jest.fn();

        await patch_async_static_method(
            Project, 'create',
            spy,
            async () => {

                let new_project_form = wrapper.find('#new-project-form');

                new_project_form.trigger('submit.native');
                await manage_projects.$nextTick();

                expect(spy.mock.calls.length).toBe(0);
            }
        );
    });

    test('New Project name cannot be the empty string', async () => {
        await patch_async_static_method(
            Project, 'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {
                wrapper = mount(ManageProjects, {
                    propsData: {
                        course: course,
                    },
                    mocks: {
                        $route
                    }
                });

                await wrapper.vm.$nextTick();
                manage_projects = wrapper.vm;

                expect(manage_projects.new_project_name).toEqual("");

                let new_project_form = wrapper.find('#new-project-form');
                new_project_form.trigger('submit.native');
                await manage_projects.$nextTick();

                expect(manage_projects.api_errors.length).toEqual(1);
            }
        );
    });

    test('Preexisting projects get displayed in alphabetical order', async () => {
        await patch_async_static_method(
            Project, 'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {
                wrapper = mount(ManageProjects, {
                    propsData: {
                        course: course,
                    },
                    mocks: {
                        $route
                    }
                });

                await wrapper.vm.$nextTick();
                manage_projects = wrapper.vm;

                expect(manage_projects.projects).toEqual(projects);

                let preexisting_projects = wrapper.findAll('.project-name');
                expect(preexisting_projects.length).toEqual(2);
                expect(preexisting_projects.at(0).text()).toEqual(project_1.name);
                expect(preexisting_projects.at(1).text()).toEqual(project_2.name);
            }
        );
    });

    test('Clicking on the add project button when the new project name is not the empty ' +
         'string calls Project.create',
         async () => {
        wrapper = mount(ManageProjects, {
            propsData: {
                course: course,
            }
        });

        manage_projects = wrapper.vm;
        manage_projects.new_project_name = "Project 1";

        const spy = jest.fn();

        await patch_async_static_method(
            Project, 'create',
            spy,
            async () => {

                let new_project_form = wrapper.find('#new-project-form');

                new_project_form.trigger('submit.native');
                await manage_projects.$nextTick();

                expect(spy.mock.calls.length).toBe(1);
            }
        );
    });

    test('When a new project is created it gets displayed among the prexisting projects',
         async () => {
        await patch_async_static_method(
            Project, 'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {
                wrapper = mount(ManageProjects, {
                    propsData: {
                        course: course,
                    },
                    mocks: {
                        $route
                    }
                });

                await wrapper.vm.$nextTick();
                manage_projects = wrapper.vm;

                expect(manage_projects.projects).toEqual(projects);

                let all_projects = wrapper.findAll('.project-name');
                expect(all_projects.length).toEqual(2);
                expect(all_projects.at(0).text()).toEqual(project_1.name);
                expect(all_projects.at(1).text()).toEqual(project_2.name);

                manage_projects.new_project_name = "Lab 09 - Functors";
                let new_project_name = "Lab 09 - Functors";

                await patch_async_static_method(
                    Project, 'create',
                    () => Promise.resolve(new_project),
                    async () => {

                        let mock_result = await Project.create(
                            {name: new_project_name, course: 2}
                        );
                        expect(mock_result).toEqual(new_project);

                        let new_project_form = wrapper.find('#new-project-form');
                        new_project_form.trigger('submit.native');
                        await manage_projects.$nextTick();

                        all_projects = wrapper.findAll('.project-name');
                        expect(all_projects.length).toEqual(3);
                        expect(all_projects.at(0).text()).toEqual(new_project.name);
                        expect(all_projects.at(1).text()).toEqual(project_1.name);
                        expect(all_projects.at(2).text()).toEqual(project_2.name);
                    }
                );
            }
        );
    });

    test('New project name must be unique among projects in the same course', async () => {
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

        await patch_async_static_method(
            Project, 'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {
                wrapper = mount(ManageProjects, {
                    propsData: {
                        course: course,
                    },
                    mocks: {
                        $route
                    }
                });

                await wrapper.vm.$nextTick();
                manage_projects = wrapper.vm;

                return patch_async_static_method(
                    Project, 'create',
                    () => Promise.reject(axios_response_instance),
                    async () => {
                        manage_projects.new_project_name = "Banana";
                        expect(manage_projects.project_form_is_valid).toBe(true);

                        let new_project_form = wrapper.find('#new-project-form');
                        new_project_form.trigger('submit.native');
                        await manage_projects.$nextTick();

                        // console.log(wrapper.html());

                        expect(manage_projects.api_errors.length).toEqual(1);
                    }
                );
            }
        );
    });
});
