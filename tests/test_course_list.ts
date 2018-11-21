import CourseList from '@/components/course_list.vue';
import { AllCourses, Model } from '@/model';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';
import Vue from 'vue';

import { patch_async_class_method, patch_async_static_method } from './mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Course_List tests', () => {
    let wrapper: Wrapper<CourseList>;
    let course_list: CourseList;
    let course_list_page: Wrapper<Vue>;
    let user: User;
    let all_courses: AllCourses;
    let fall18_eecs280: Course;
    let fall18_eecs370: Course;
    let fall18_eecs441: Course;
    let spring18_eecs281: Course;
    let winter18_eecs280: Course;
    let no_semester_2018_eecs493: Course;
    let fall17_eecs183: Course;
    let no_year_winter_eecs482: Course;

    beforeEach(() => {
        user = new User({
            pk: 1, username: 'ashberg', first_name: 'Ashley',
            last_name: 'IceBerg', email: 'iceberg@umich.edu',
            is_superuser: false});

        fall18_eecs280 = new Course(
            {pk: 2, name: 'EECS 280', semester: Semester.fall, year: 2018, subtitle: '',
             num_late_days: 0, last_modified: ''});

        fall18_eecs370 = new Course(
            {pk: 3, name: 'EECS 370', semester: Semester.fall, year: 2018, subtitle: '',
             num_late_days: 0, last_modified: ''});

        fall18_eecs441 = new Course(
            {pk: 4, name: 'EECS 441', semester: Semester.fall, year: 2018, subtitle: '',
             num_late_days: 0, last_modified: ''});

        spring18_eecs281 = new Course(
            {pk: 5, name: 'EECS 281', semester: Semester.spring, year: 2018, subtitle: '',
             num_late_days: 0, last_modified: ''});

        winter18_eecs280 = new Course(
            {pk: 6, name: 'EECS 280', semester: Semester.winter, year: 2018, subtitle: '',
             num_late_days: 0, last_modified: ''});

        no_semester_2018_eecs493 = new Course(
            {pk: 7, name: 'EECS 493', semester: null, year: 2018, subtitle: '',
             num_late_days: 0, last_modified: ''});

        fall17_eecs183 = new Course(
            {pk: 8, name: 'EECS 183', semester: Semester.fall, year: 2017, subtitle: '',
             num_late_days: 0, last_modified: ''});

        no_year_winter_eecs482 = new Course(
            {pk: 9, name: 'EECS 482', semester: Semester.winter, year: null, subtitle: '',
             num_late_days: 0, last_modified: ''});
    });

    afterEach(() => {
        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test("The semester, year, and name of a course get displayed", async () => {

        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs280],
            courses_is_handgrader_for: []
        };

        await patch_async_static_method(
            User, 'get_current',
            () => Promise.resolve(user), async () => {

            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                let mock_result = await Model.get_instance().get_courses_for_user(user);
                expect(mock_result).toEqual(all_courses);

                wrapper = mount(CourseList);

                await wrapper.vm.$nextTick();

                course_list = wrapper.vm;
                course_list_page = wrapper.find({ref: 'course_list_component'});

                let course_displayed = course_list_page.find('.course');
                expect(course_displayed.html()).toContain(fall18_eecs280.semester);
                expect(course_displayed.html()).toContain(fall18_eecs280.year);
                expect(course_displayed.html()).toContain(fall18_eecs280.name);
            });
        });
    });

    test('Courses in which a user is an admin can be identified using is_admin',
         async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs280],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, winter18_eecs280],
            courses_is_handgrader_for: []
        };

        await patch_async_static_method(
              User, 'get_current',
              () => Promise.resolve(user), async () => {

            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                 let mock_result = await Model.get_instance().get_courses_for_user(user);
                 expect(mock_result).toEqual(all_courses);

                 wrapper = mount(CourseList);

                 await wrapper.vm.$nextTick();

                 course_list = wrapper.vm;
                 course_list_page = wrapper.find({ref: 'course_list_component'});

                 expect(course_list.is_admin(fall18_eecs280)).toBe(true);
                 expect(course_list.is_admin(fall18_eecs370)).toBe(false);
                 expect(course_list.is_admin(winter18_eecs280)).toBe(false);
             });
        });
    });

    test('If a user is an admin of a course, that course will have an edit-settings ' +
         'button',
         async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs280],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, winter18_eecs280],
            courses_is_handgrader_for: []
        };

        await patch_async_static_method(
        User, 'get_current',
        () => Promise.resolve(user), async () => {

            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                let mock_result = await Model.get_instance().get_courses_for_user(user);
                expect(mock_result).toEqual(all_courses);

                wrapper = mount(CourseList);

                await wrapper.vm.$nextTick();

                course_list = wrapper.vm;
                course_list_page = wrapper.find({ref: 'course_list_component'});

                expect(course_list.all_courses!.courses_is_admin_for.length).toEqual(1);
                expect(course_list.all_courses!.courses_is_admin_for[0]).toEqual(fall18_eecs280);

                let all_displayed_courses = course_list_page.findAll('.course');
                expect(all_displayed_courses.length).toEqual(3);
                expect(course_list_page.findAll('.edit-admin-settings').length).toEqual(1);

                expect(all_displayed_courses.at(0).html()).toContain(fall18_eecs280.name);
                expect(all_displayed_courses.at(0).html()).toContain(fall18_eecs280.semester);
                expect(all_displayed_courses.at(0).html()).toContain(fall18_eecs280.year);
                expect(all_displayed_courses.at(0).findAll(
                    '.edit-admin-settings').length
                ).toEqual(1);

                expect(all_displayed_courses.at(1).html()).toContain(fall18_eecs370.name);
                expect(all_displayed_courses.at(1).html()).toContain(fall18_eecs370.semester);
                expect(all_displayed_courses.at(1).html()).toContain(fall18_eecs370.year);
                expect(all_displayed_courses.at(1).findAll(
                    '.edit-admin-settings').length
                ).toEqual(0);

                expect(all_displayed_courses.at(2).html()).toContain(winter18_eecs280.name);
                expect(all_displayed_courses.at(2).html()).toContain(winter18_eecs280.semester);
                expect(all_displayed_courses.at(2).html()).toContain(winter18_eecs280.year);
                expect(all_displayed_courses.at(2).findAll(
                    '.edit-admin-settings').length
                ).toEqual(0);
            });
        });
    });

    test("When a user isn't enrolled in any courses, an informative message is " +
         "displayed",
         async () => {

        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [],
            courses_is_handgrader_for: []
        };

        await patch_async_static_method(
            User, 'get_current',
            () => Promise.resolve(user), async () => {

            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                 let mock_result = await Model.get_instance().get_courses_for_user(user);
                 expect(mock_result).toEqual(all_courses);

                 wrapper = mount(CourseList);

                 await wrapper.vm.$nextTick();

                 course_list = wrapper.vm;
                 course_list_page = wrapper.find({ref: 'course_list_component'});

                 expect(course_list.courses_by_term.length).toBe(0);
                 expect(course_list_page.text()).toContain(
                     "You are not enrolled in any courses."
                 );
             });
         });
    });


    test('Terms appear in the correct order (year DESC, semester DESC)', async () => {

        all_courses = {
            courses_is_admin_for: [fall18_eecs370],
            courses_is_staff_for: [spring18_eecs281, no_year_winter_eecs482],
            courses_is_student_in: [fall17_eecs183, no_semester_2018_eecs493],
            courses_is_handgrader_for: [winter18_eecs280]
        };

        await patch_async_static_method(
            User, 'get_current',
            () => Promise.resolve(user), async () => {

            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                let mock_result = await Model.get_instance().get_courses_for_user(user);
                expect(mock_result).toEqual(all_courses);

                wrapper = mount(CourseList);

                await wrapper.vm.$nextTick();

                course_list = wrapper.vm;
                course_list_page = wrapper.find({ref: 'course_list_component'});

                let all_terms = course_list_page.findAll('.semester-name');

                expect(all_terms.length).toEqual(6);
                expect(all_terms.at(0).html()).toContain("Fall 2018");
                expect(all_terms.at(1).html()).toContain("Spring 2018");
                expect(all_terms.at(2).html()).toContain("Winter 2018");
                expect(all_terms.at(3).html()).toContain("2018");
                expect(all_terms.at(4).html()).toContain("Fall 2017");
                expect(all_terms.at(5).html()).toContain("Winter");
            });
        });
    });

    test('Courses in a semester appear in the correct order (name ASC)',  async () => {
        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, fall18_eecs441, fall18_eecs280],
            courses_is_handgrader_for: []
        };
        await patch_async_static_method(
            User, 'get_current',
            () => Promise.resolve(user), async () => {

            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                let mock_result = await Model.get_instance().get_courses_for_user(user);
                expect(mock_result).toEqual(all_courses);

                wrapper = mount(CourseList);

                await wrapper.vm.$nextTick();

                course_list = wrapper.vm;
                course_list_page = wrapper.find({ref: 'course_list_component'});

                let fall_2018_term = course_list_page.find('.single-semester-container');
                let fall_2018_courses = fall_2018_term.findAll('.course');

                expect(fall_2018_courses.length).toEqual(3);
                expect(fall_2018_courses.at(0).html()).toContain("EECS 280");
                expect(fall_2018_courses.at(1).html()).toContain("EECS 370");
                expect(fall_2018_courses.at(2).html()).toContain("EECS 441");
            });
        });
    });

    test("Terms are stored in the right order", async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs370],
            courses_is_staff_for: [spring18_eecs281, no_year_winter_eecs482],
            courses_is_student_in: [fall17_eecs183, no_semester_2018_eecs493],
            courses_is_handgrader_for: [winter18_eecs280]
        };
        await patch_async_static_method(
            User, 'get_current',
            () => Promise.resolve(user), async () => {
            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                let mock_result = await Model.get_instance().get_courses_for_user(user);
                expect(mock_result).toEqual(all_courses);

                wrapper = mount(CourseList);

                await wrapper.vm.$nextTick();

                course_list = wrapper.vm;

                expect(course_list.courses_by_term[0].term.semester).toEqual(Semester.fall);
                expect(course_list.courses_by_term[0].term.year).toEqual(2018);

                expect(course_list.courses_by_term[1].term.semester).toEqual(Semester.spring);
                expect(course_list.courses_by_term[1].term.year).toEqual(2018);

                expect(course_list.courses_by_term[2].term.semester).toEqual(Semester.winter);
                expect(course_list.courses_by_term[2].term.year).toEqual(2018);

                expect(course_list.courses_by_term[3].term.semester).toBeNull();
                expect(course_list.courses_by_term[3].term.year).toEqual(2018);

                expect(course_list.courses_by_term[4].term.semester).toEqual(Semester.fall);
                expect(course_list.courses_by_term[4].term.year).toEqual(2017);

                expect(course_list.courses_by_term[5].term.semester).toEqual(Semester.winter);
                expect(course_list.courses_by_term[5].term.year).toBeNull();
            });
        });
    });

    test("Course names are stored in the right order within a semester", async () => {
        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, fall18_eecs441, fall18_eecs280],
            courses_is_handgrader_for: []
        };
        await patch_async_static_method(
            User, 'get_current',
            () => Promise.resolve(user), async () => {
            await patch_async_static_method(
                Course, 'get_courses_for_user',
                () =>  Promise.resolve(all_courses), async () => {

                let mock_result = await Model.get_instance().get_courses_for_user(user);
                expect(mock_result).toEqual(all_courses);

                wrapper = mount(CourseList);

                await wrapper.vm.$nextTick();

                course_list = wrapper.vm;
                let fall_18_term = course_list.courses_by_term[0];

                expect(fall_18_term.term.semester).toEqual(Semester.fall);
                expect(fall_18_term.term.year).toEqual(2018);
                expect(fall_18_term.course_list.length).toEqual(3);
                expect(fall_18_term.course_list[0]).toEqual(fall18_eecs280);
                expect(fall_18_term.course_list[1]).toEqual(fall18_eecs370);
                expect(fall_18_term.course_list[2]).toEqual(fall18_eecs441);
            });
        });
    });
});
