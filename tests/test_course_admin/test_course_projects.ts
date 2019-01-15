import CourseProjects from '@/components/course_admin/course_projects.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester , UltimateSubmissionPolicy } from 'ag-client-typescript';
import { AxiosResponse } from 'axios';
import Vue from 'vue';

import {
    patch_async_class_method,
    patch_async_static_method,
    patch_component_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseProjects.vue', () => {
    let wrapper: Wrapper<CourseProjects>;
    let course_projects: CourseProjects;
    let course: Course;
    let updated_course: Course;
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
        wrapper = mount(CourseProjects, {
            propsData: {
                course: course,
            }
        });

        course_projects = wrapper.vm;

        expect(course_projects.new_project_name).toEqual("");
        const spy = jest.fn();

        await patch_async_static_method(
            Project, 'create',
            spy,
            async () => {

                let new_project_form = wrapper.find('#new-project-form');

                new_project_form.trigger('submit.native');
                await course_projects.$nextTick();

                expect(spy.mock.calls.length).toBe(0);
            }
        );
    });

    test('New Project name cannot be the empty string', async () => {
        wrapper = mount(CourseProjects, {
            propsData: {
                course: course,
            }
        });

        course_projects = wrapper.vm;

        expect(course_projects.new_project_name).toEqual("");
        const spy = jest.fn();

        await patch_async_static_method(
            Project, 'create',
            spy,
            async () => {

                let new_project_form = wrapper.find('#new-project-form');

                new_project_form.trigger('submit.native');
                await course_projects.$nextTick();

                expect(spy.mock.calls.length).toBe(0);
            }
        );
    });

    test('Preexisting projects get displayed in alphabetical order', async () => {
        await patch_async_static_method(
            Project, 'get_all_from_course',
            () => Promise.resolve(projects),
            async () => {
                wrapper = mount(CourseProjects, {
                    propsData: {
                        course: course,
                    },
                    mocks: {
                        $route
                    }
                });

                await wrapper.vm.$nextTick();
                course_projects = wrapper.vm;

                expect(course_projects.projects).toEqual(projects);

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
        wrapper = mount(CourseProjects, {
            propsData: {
                course: course,
            }
        });

        course_projects = wrapper.vm;
        course_projects.new_project_name = "Project 1";

        const spy = jest.fn();

        await patch_async_static_method(
            Project, 'create',
            spy,
            async () => {

                let new_project_form = wrapper.find('#new-project-form');

                new_project_form.trigger('submit.native');
                await course_projects.$nextTick();

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
                wrapper = mount(CourseProjects, {
                    propsData: {
                        course: course,
                    },
                    mocks: {
                        $route
                    }
                });

                await wrapper.vm.$nextTick();
                course_projects = wrapper.vm;

                expect(course_projects.projects).toEqual(projects);

                let all_projects = wrapper.findAll('.project-name');
                expect(all_projects.length).toEqual(2);
                expect(all_projects.at(0).text()).toEqual(project_1.name);
                expect(all_projects.at(1).text()).toEqual(project_2.name);

                course_projects.new_project_name = "Lab 09 - Functors";
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
                        await course_projects.$nextTick();

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

    // Skipping until we figure out how to handle the axiosResponse error business
    test.skip('New project name must be unique among projects in the same course', () => {
        wrapper = mount(CourseProjects, {
            propsData: {
                course: course,
            }
        });

        course_projects = wrapper.vm;
    });
});
