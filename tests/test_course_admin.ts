import CourseAdmin from '@/components/course_admin.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, User } from 'ag-client-typescript';
import Vue from 'vue';

import { patch_async_static_method } from './mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Course_Admin tests', () => {
    let wrapper: Wrapper<CourseAdmin>;
    let course_admin: CourseAdmin;
    let course_admin_page: Wrapper<Vue>;
    let course: Course;
    let projects: Project[];
    let admins: User[];
    let staff: User[];
    let handgraders: User[];
    let students: User[];
    let admin_1: User;
    let admin_2: User;
    let admin_3: User;
    let staff_1: User;
    let staff_2: User;
    let staff_3: User;
    let student_1: User;
    let student_2: User;
    let student_3: User;
    let handgrader_1: User;
    let handgrader_2: User;
    let handgrader_3: User;
    let project_1: Project;
    let project_2: Project;

    beforeEach(() => {
        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.fall, year: 2018,
            subtitle: '', num_late_days: 0, last_modified: ''
        });

        admin_1 = new User({
            pk: 1, username: 'jjuett', first_name: 'James', last_name: 'Juett',
            email: 'jjuett@umich.edu', is_superuser: false
        });

        admin_2 = new User({
            pk: 2, username: 'akamil', first_name: 'Amir', last_name: 'Kamil',
            email: 'akamil@umich.edu', is_superuser: false
        });

        admin_3 = new User({
            pk: 3, username: 'awdeorio', first_name: 'Andrew', last_name: 'Deorio',
            email: 'awdeorio@umich.edu', is_superuser: false
        });

        staff_1 = new User({
            pk: 4, username: 'jameslp', first_name: 'James', last_name: 'Perretta',
            email: 'jameslp@umich.edu', is_superuser: false
        });

        staff_2 = new User({
            pk: 5, username: 'ashberg', first_name: 'Ashley', last_name: 'Berg',
            email: 'ashberg@umich.edu', is_superuser: false
        });

        staff_3 = new User({
            pk: 6, username: 'mmgeorg', first_name: 'Melissa', last_name: 'George',
            email: 'mmgeorg@umich.edu', is_superuser: false
        });

        student_1 = new User({
            pk: 7, username: 'mrmercury', first_name: 'Freddie', last_name: 'Mercury',
            email: 'mrmercury@umich.edu', is_superuser: false
        });

        student_2 = new User({
            pk: 8, username: 'maybe', first_name: 'Brian', last_name: 'May',
            email: 'maybe@umich.edu', is_superuser: false
        });

        student_3 = new User({
            pk: 9, username: 'rtaylor', first_name: 'Roger', last_name: 'Taylor',
            email: 'rtaylor@umich.edu', is_superuser: false
        });

        handgrader_1 = new User({
            pk: 10, username: 'patrick', first_name: 'Patrick', last_name: 'Star',
            email: 'patrick@umich.edu', is_superuser: false
        });

        handgrader_2 = new User({
            pk: 11, username: 'spongebob', first_name: 'Spongebob', last_name: 'Squarepants',
            email: 'spongebob@umich.edu', is_superuser: false
        });

        handgrader_3 = new User({
            pk: 12, username: 'squidward', first_name: 'Squidward', last_name: 'Tentacles',
            email: 'squidward@umich.edu', is_superuser: false
        });

        // project_1 = new Project({
        //     pk: 1, name: "EECS 365", last_modified: "", course: 1, visible_to_students: false,
        //     closing_time: "", soft_closing_time: "", disallow_student_submissions: false,
        //     disallow_group_registration: false, guests_can_submit: false, min_group_size: 1,
        //     max_group_size: 3, submission_limit_per_day: 3, allow_submissions_past_limit: false,
        //     groups_combine_daily_submissions: false, submission_limit_reset_time: "",
        //     submission_limit_reset_timezone: "", num_bonus_submissions: 0,
        //     total_submission_limit: 9, allow_late_days: false,
        //     ultimate_submission_policy: UltimateSubmissionPolicy.best,
        //     hide_ultimate_submission_fdbk: true
        // });

        // project_2 = new Project({
        //     pk: 2, name: "EECS 711", last_modified: "", course: 1, visible_to_students: false,
        //     closing_time: "", soft_closing_time: "", disallow_student_submissions: false,
        //     disallow_group_registration: false, guests_can_submit: false, min_group_size: 1,
        //     max_group_size: 3, submission_limit_per_day: 3, allow_submissions_past_limit: false,
        //     groups_combine_daily_submissions: false, submission_limit_reset_time: "",
        //     submission_limit_reset_timezone: "", num_bonus_submissions: 0,
        //     total_submission_limit: 9, allow_late_days: false,
        //     ultimate_submission_policy: UltimateSubmissionPolicy.most_recent,
        //     hide_ultimate_submission_fdbk: true
        // });

        admins = [admin_1, admin_2, admin_3];
        staff = [staff_1, staff_2, staff_3];
        handgraders = [handgrader_1, handgrader_2, handgrader_3];
        students = [student_1, student_2, student_3];
        projects = [project_1, project_2];
    });

    afterEach(() => {
        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test.skip("Clicking on the Settings tab shows the settings inputs", async () => {

        await patch_async_static_method(
            Course, 'get_by_pk(',
            () => Promise.resolve(course), async () => {

                wrapper = mount(CourseAdmin);
                console.log(wrapper.html());




        });
    });

    test.skip("Clicking on the Permissions tab shows the admins roster by default", async () => {
        // mock all user getters?
    });

    test.skip("Clicking on the Projects tab shows the projects for the course", async () => {

        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            await patch_async_static_method(
                Project, 'get_all_from_course',
                () => Promise.resolve(projects), async () => {

                let mock_result = await Project.get_all_from_course(course.pk);
                expect(mock_result).toEqual(projects);

                wrapper = mount(CourseAdmin);
            });
        });
    });

    test.skip("The course's name, semester, year, and number of late days can be updated",
              async () => {

    });

    test.skip("A course cannot have less than 0 late days", async () => {

    });

    test.skip("The last saved timestamp gets updated whenever there is a change to the " +
              "course settings",
              async () => {

    });

    test.skip("All admins are displayed in the admins permission tab", async () => {

    });

    test.skip("All staff are displayed in the admins permission tab", async () => {

    });

    test.skip("All students are displayed in the admins permission tab", async () => {

    });

    test.skip("All handgraders are displayed in the admins permission tab", async () => {

    });

    test.skip("Admins can be added to the admins roster", async () => {

    });

    test.skip("Staff can be added to the staff roster", async () => {

    });

    test.skip("Students can be added to the students roster", async () => {

    });

    test.skip("Handgraders can be added to the handgraders roster", async () => {

    });

    test.skip("Admins can be removed from the admins roster", async () => {

    });

    test.skip("Staff can be removed from the staff roster", async () => {

    });

    test.skip("Students can be removed from the students roster", async () => {

    });

    test.skip("Handgraders can be removed from the handgraders roster", async () => {

    });

    test.skip("Individuals cannot have two different roles in a course?", async () => {

    });

    test.skip("Users can create new projects for a course", async () => {

    });

});
