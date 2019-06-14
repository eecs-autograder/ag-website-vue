import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, Project, Semester, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import CourseView from '@/components/course_view.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseView tests', () => {
    let wrapper: Wrapper<CourseView>;
    let component: CourseView;
    let user: User;
    let fall18_eecs280: Course;
    let fall18_eecs370: Course;
    let project_1: Project;

    const $route = {
        path: '/web/project/:project_id',
        params: {
            project_id: '10'
        },
        query: { }
    };

    beforeEach(() => {
        user = new User(
            {pk: 1, username: 'ashberg', first_name: 'Ashley', last_name: 'IceBerg',
             email: 'iceberg@umich.edu', is_superuser: false});

        fall18_eecs280 = new Course(
            {pk: 1, name: 'EECS 280', semester: Semester.fall, year: 2018,
             subtitle: 'Programming and Introductory Data Structures', num_late_days: 0,
             allowed_guest_domain: '', last_modified: ''});

        fall18_eecs370 = new Course(
            {pk: 2, name: 'EECS 370', semester: Semester.fall, year: 2018, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

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
            expected_student_files: []
        });

        sinon.stub(User, 'get_current').returns(Promise.resolve(user));
        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(fall18_eecs280));
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('User is NOT an admin for the course whose projects they are viewing', async () => {
        sinon.stub(user, 'courses_is_admin_for').returns(
            Promise.resolve([])
        );
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve([project_1]));

        wrapper = mount(CourseView, {
            stubs: ['router-link', 'router-view'],
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(component.d_loading).toBe(false);
        expect(component.is_admin).toBe(false);
        expect(wrapper.findAll('.cog').length).toEqual(0);
    });

    test('User IS an admin for the course whose projects they are viewing', async () => {
        sinon.stub(user, 'courses_is_admin_for').returns(
            Promise.resolve([fall18_eecs280, fall18_eecs370])
        );
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve([project_1]));

        wrapper = mount(CourseView, {
            stubs: ['router-link', 'router-view'],
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(component.d_loading).toBe(false);
        expect(component.is_admin).toBe(true);
        expect(wrapper.findAll('.cog').length).toEqual(1);
    });

    test('No projects have been published', async () => {
        sinon.stub(user, 'courses_is_admin_for').returns(
            Promise.resolve([fall18_eecs280, fall18_eecs370])
        );
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve([]));

        wrapper = mount(CourseView, {
            stubs: ['router-link', 'router-view'],
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(component.d_loading).toBe(false);
        expect(component.is_admin).toBe(true);
        expect(wrapper.findAll('#no-projects-message').length).toEqual(1);
    });
});
