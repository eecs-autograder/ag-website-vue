import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, HttpError, Project, Semester, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import SingleProject from '@/components/course_admin/manage_projects/single_project.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { set_global_current_user } from '@/tests/data_utils';
import { set_select_object_value, set_validated_input_text } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
   sinon.restore();
});

describe('SingleProject.vue', () => {
    let wrapper: Wrapper<SingleProject>;
    let single_project: SingleProject;
    let course_1: Course;
    let course_2: Course;
    let newly_cloned_project_1: Project;
    let newly_cloned_project_2: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];
    let user: User;

    beforeEach(() => {
        user = new User({
            pk: 1, username: 'ashberg', first_name: 'Ashley',
            last_name: 'IceBerg', email: 'iceberg@umich.edu',
            is_superuser: false});

        set_global_current_user(user);

        course_1 = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        course_2 = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2020, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        sinon.stub(user, "courses_is_admin_for").resolves([course_1, course_2]);

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
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false,
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
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false,
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
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false,
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
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false,
        });
    });

    test('Data members are initialized correctly', async () => {
        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
            },
            stubs: ['router-link']
        });
        single_project = wrapper.vm;
        await single_project.$nextTick();

        expect(single_project.course).toEqual(course_1);
        expect(single_project.project).toEqual(project_1);
        expect(single_project.course_to_clone_to).toEqual(course_1);
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

        wrapper.find('.copy-project').trigger('click');
        await single_project.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "cloned_project_name"}).vm;

        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(true);
        expect(validated_input.is_valid).toBe(false);

        set_validated_input_text(wrapper.find({ref: 'cloned_project_name'}), '   ');
        await single_project.$nextTick();

        expect(validated_input.is_valid).toBe(false);

        wrapper.find({ref: 'clone_project_modal'}).vm.$emit('close');
        await single_project.$nextTick();

        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(false);
    });

    test('Clone project to current course', async () => {
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

        wrapper.find('.copy-project').trigger('click');
        await single_project.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find(
            {ref: "cloned_project_name"}).vm;

        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(true);
        expect(validated_input.is_valid).toBe(false);

        set_validated_input_text(
            wrapper.find({ref: 'cloned_project_name'}), newly_cloned_project_1.name);
        await single_project.$nextTick();

        expect(single_project.course_to_clone_to).toBe(course_1);
        expect(validated_input.is_valid).toBe(true);
        expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

        sinon.stub(project_1, 'copy_to_course').returns(Promise.resolve(newly_cloned_project_1));

        wrapper.find('.clone-project-button').trigger('click');
        await single_project.$nextTick();

        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_project_modal).toBe(false);
    });

    test('Clone project to other course', async () => {
        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
                existing_projects: projects
            },
            stubs: ['router-link']
        });

        await wrapper.vm.$nextTick();

        wrapper.find('.copy-project').trigger('click');
        await wrapper.vm.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find(
            {ref: "cloned_project_name"}
        ).vm;

        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(validated_input.is_valid).toBe(false);

        set_validated_input_text(
            wrapper.find({ref: 'cloned_project_name'}), newly_cloned_project_2.name);
        await wrapper.vm.$nextTick();

        set_select_object_value(wrapper.find({ref: 'cloning_destinations_dropdown'}), course_2.pk);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.course_to_clone_to).toBe(course_2);
        expect(validated_input.is_valid).toBe(true);
        expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

        let copy_to_course_stub = sinon.stub(project_1, 'copy_to_course').resolves(
            newly_cloned_project_2);

        wrapper.find('.clone-project-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(
            copy_to_course_stub.calledOnceWith(course_2.pk, newly_cloned_project_2.name)
        ).toEqual(true);
        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(false);
    });

    test('Error cloned project name must be unique within course', async () => {
        wrapper = mount(SingleProject, {
            propsData: {
                course: course_1,
                project: project_1,
            },
            stubs: ['router-link']
        });

        single_project = wrapper.vm;
        await single_project.$nextTick();

        wrapper.find('.copy-project').trigger('click');
        await single_project.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find(
            {ref: "cloned_project_name"}
        ).vm;

        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(true);
        expect(validated_input.is_valid).toBe(false);

        set_validated_input_text(wrapper.find({ref: 'cloned_project_name'}), project_1.name);
        await single_project.$nextTick();

        expect(single_project.course_to_clone_to).toBe(course_1);
        expect(validated_input.is_valid).toBe(true);
        expect(wrapper.find('.clone-project-button').is('[disabled]')).toBe(false);

        sinon.stub(project_1, 'copy_to_course').returns(
            Promise.reject(
                new HttpError(400, {__all__: "Project with this Name and Course already exists."}
            )
        ));
        wrapper.find('.clone-project-button').trigger('click');
        await single_project.$nextTick();

        expect(wrapper.find({ref: 'clone_project_modal'}).exists()).toBe(true);
        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
