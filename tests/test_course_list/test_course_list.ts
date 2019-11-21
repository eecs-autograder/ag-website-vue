import Vue from 'vue';

import { config, mount, Wrapper } from '@vue/test-utils';

import { AllCourses, Course, HttpError, Semester, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import CourseList from '@/components/course_list/course_list.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Course_List.vue', () => {
    let wrapper: Wrapper<CourseList>;
    let component: CourseList;
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
    let copy_of_course: Course;

    beforeEach(() => {
        user = new User(
            {pk: 1, username: 'ashberg', first_name: 'Ashley', last_name: 'IceBerg',
             email: 'iceberg@umich.edu', is_superuser: false});

        copy_of_course = new Course(
            {pk: 11, name: "Clone", semester: Semester.fall, year: 2048, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        fall18_eecs280 = new Course(
            {pk: 2, name: 'EECS 280', semester: Semester.fall, year: 2018,
             subtitle: 'Programming and Introductory Data Structures', num_late_days: 0,
             allowed_guest_domain: '', last_modified: ''});

        fall18_eecs370 = new Course(
            {pk: 3, name: 'EECS 370', semester: Semester.fall, year: 2018, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        fall18_eecs441 = new Course(
            {pk: 4, name: 'EECS 441', semester: Semester.fall, year: 2018, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        spring18_eecs281 = new Course(
            {pk: 5, name: 'EECS 281', semester: Semester.spring, year: 2018, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        winter18_eecs280 = new Course(
            {pk: 6, name: 'EECS 280', semester: Semester.winter, year: 2018, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        no_semester_2018_eecs493 = new Course(
            {pk: 7, name: 'EECS 493', semester: null, year: 2018, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        fall17_eecs183 = new Course(
            {pk: 8, name: 'EECS 183', semester: Semester.fall, year: 2017, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        no_year_winter_eecs482 = new Course(
            {pk: 9, name: 'EECS 482', semester: Semester.winter, year: null, subtitle: '',
             num_late_days: 0, allowed_guest_domain: '', last_modified: ''});

        sinon.stub(User, 'get_current').returns(Promise.resolve(user));
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    async function call_notify_course_created(name_in: string, year_in: number) {
        copy_of_course.name = name_in;
        copy_of_course.year = year_in;
        Course.notify_course_created(copy_of_course);
    }

    test('Cloning a course - cloned course causes new term to be created', async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs280, fall18_eecs370],
            courses_is_staff_for: [],
            courses_is_student_in: [],
            courses_is_handgrader_for: []
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {stubs: ['router-link', 'router-view']});
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(component.all_courses!.courses_is_admin_for.length).toEqual(2);
        expect(component.courses_by_term.length).toEqual(1);

        copy_of_course.name = "Clonedd course";
        copy_of_course.year = 2042;
        Course.notify_course_created(copy_of_course);

        expect(component.all_courses!.courses_is_admin_for.length).toEqual(3);
        expect(component.courses_by_term.length).toEqual(2);
        expect(component.courses_by_term[0].course_list[0]).toEqual(copy_of_course);
        expect(component.courses_by_term[1].course_list[0]).toEqual(fall18_eecs280);
        expect(component.courses_by_term[1].course_list[1]).toEqual(fall18_eecs370);
    });

    test('Cloning a course - cloned course inserted into existing term', async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs280, fall18_eecs370],
            courses_is_staff_for: [],
            courses_is_student_in: [],
            courses_is_handgrader_for: []
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        copy_of_course.name = "EECS 281";
        copy_of_course.year = 2018;
        Course.notify_course_created(copy_of_course);

        expect(component.all_courses!.courses_is_admin_for.length).toEqual(3);
        expect(component.courses_by_term.length).toEqual(1);
        expect(component.courses_by_term[0].course_list[0]).toEqual(fall18_eecs280);
        expect(component.courses_by_term[0].course_list[1]).toEqual(copy_of_course);
        expect(component.courses_by_term[0].course_list[2]).toEqual(fall18_eecs370);
    });

    test("The name and subtitle of a course get displayed", async () => {
        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs280],
            courses_is_handgrader_for: []
        };

        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        let course_displayed = wrapper.find('.course');
        expect(course_displayed.html()).toContain(fall18_eecs280.name);
        expect(course_displayed.html()).toContain(fall18_eecs280.subtitle);
    });

    test('Courses in which a user is an admin can be identified using is_admin', async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs280],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, winter18_eecs280],
            courses_is_handgrader_for: []
        };

        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
         stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.is_admin(fall18_eecs280)).toBe(true);
        expect(component.is_admin(fall18_eecs370)).toBe(false);
        expect(component.is_admin(winter18_eecs280)).toBe(false);
    });

    test('If a user is an admin of a course, that course will have an edit-settings button',
         async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs280],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, winter18_eecs280],
            courses_is_handgrader_for: []
        };

        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(component.all_courses!.courses_is_admin_for.length).toEqual(1);
        expect(component.all_courses!.courses_is_admin_for[0]).toEqual(fall18_eecs280);

        let all_displayed_courses = wrapper.findAll('.course');
        expect(all_displayed_courses.length).toEqual(3);
        expect(wrapper.findAll('.edit-course-settings').length).toEqual(1);

        expect(all_displayed_courses.at(0).html()).toContain(fall18_eecs280.name);
        expect(all_displayed_courses.at(0).findAll(
            '.edit-course-settings').length
        ).toEqual(1);

        expect(all_displayed_courses.at(1).html()).toContain(fall18_eecs370.name);
        expect(all_displayed_courses.at(1).findAll(
            '.edit-course-settings').length
        ).toEqual(0);

        expect(all_displayed_courses.at(2).html()).toContain(winter18_eecs280.name);
        expect(all_displayed_courses.at(2).findAll(
            '.edit-course-settings').length
        ).toEqual(0);
    });

    test("When a user isn't enrolled in any courses, an informative message is displayed",
         async () => {
        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [],
            courses_is_handgrader_for: []
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(component.courses_by_term.length).toBe(0);
        expect(wrapper.text()).toContain("You are not enrolled in any courses.");
    });

    test('Terms appear in the correct order (year DESC, semester DESC)', async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs370],
            courses_is_staff_for: [spring18_eecs281, no_year_winter_eecs482],
            courses_is_student_in: [fall17_eecs183, no_semester_2018_eecs493],
            courses_is_handgrader_for: [winter18_eecs280]
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let all_terms = wrapper.findAll('.semester-name');

        expect(all_terms.length).toEqual(6);
        expect(all_terms.at(0).html()).toContain("Fall 2018");
        expect(all_terms.at(1).html()).toContain("Spring 2018");
        expect(all_terms.at(2).html()).toContain("Winter 2018");
        expect(all_terms.at(3).html()).toContain("2018");
        expect(all_terms.at(4).html()).toContain("Fall 2017");
        expect(all_terms.at(5).html()).toContain("Winter");
    });

    test('Courses in a semester appear in the correct order (name ASC)',  async () => {
        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, fall18_eecs441, fall18_eecs280],
            courses_is_handgrader_for: []
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let fall_2018_term = wrapper.find('.single-semester-container');
        let fall_2018_courses = fall_2018_term.findAll('.course');

        expect(fall_2018_courses.length).toEqual(3);
        expect(fall_2018_courses.at(0).html()).toContain("EECS 280");
        expect(fall_2018_courses.at(1).html()).toContain("EECS 370");
        expect(fall_2018_courses.at(2).html()).toContain("EECS 441");
    });

    test("Terms are stored in the right order", async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs370],
            courses_is_staff_for: [spring18_eecs281, no_year_winter_eecs482],
            courses_is_student_in: [fall17_eecs183, no_semester_2018_eecs493],
            courses_is_handgrader_for: [winter18_eecs280]
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.courses_by_term[0].term.semester).toEqual(Semester.fall);
        expect(component.courses_by_term[0].term.year).toEqual(2018);

        expect(component.courses_by_term[1].term.semester).toEqual(Semester.spring);
        expect(component.courses_by_term[1].term.year).toEqual(2018);

        expect(component.courses_by_term[2].term.semester).toEqual(Semester.winter);
        expect(component.courses_by_term[2].term.year).toEqual(2018);

        expect(component.courses_by_term[3].term.semester).toBeNull();
        expect(component.courses_by_term[3].term.year).toEqual(2018);

        expect(component.courses_by_term[4].term.semester).toEqual(Semester.fall);
        expect(component.courses_by_term[4].term.year).toEqual(2017);

        expect(component.courses_by_term[5].term.semester).toEqual(Semester.winter);
        expect(component.courses_by_term[5].term.year).toBeNull();
    });

    test("Course names are stored in the right order within a semester", async () => {
        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [fall18_eecs370, fall18_eecs441, fall18_eecs280],
            courses_is_handgrader_for: []
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();

        let fall_18_term = component.courses_by_term[0];
        expect(fall_18_term.term.semester).toEqual(Semester.fall);
        expect(fall_18_term.term.year).toEqual(2018);
        expect(fall_18_term.course_list.length).toEqual(3);
        expect(fall_18_term.course_list[0]).toEqual(fall18_eecs280);
        expect(fall_18_term.course_list[1]).toEqual(fall18_eecs370);
        expect(fall_18_term.course_list[2]).toEqual(fall18_eecs441);
    });
});
