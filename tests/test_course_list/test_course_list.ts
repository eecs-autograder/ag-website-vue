import { Wrapper } from '@vue/test-utils';

import { AllCourses, Course, HttpError, Semester, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import CourseList from '@/components/course_list/course_list.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';

import { wait_for_load, wait_until } from '../utils';

let can_create_courses_stub: sinon.SinonStub;

beforeEach(() => {
    can_create_courses_stub = sinon.stub(User, 'current_can_create_courses').resolves(false);
});

describe('Create course tests', () => {
    beforeEach(() => {
        sinon.stub(Course, 'get_courses_for_user').resolves({
            courses_is_admin_for: [],
            courses_is_staff_for: [],
            courses_is_student_in: [],
            courses_is_handgrader_for: []
        });
    });

    test('Create course button hidden', async () => {
        let wrapper = managed_mount(CourseList, {stubs: ['router-link', 'router-view']});
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.find('[data-testid=show_create_course_modal_button]').exists()).toBe(false);
    });

    test('Create course', async () => {
        let create_course_stub = sinon.stub(Course, 'create');
        can_create_courses_stub.resolves(true);

        let wrapper = managed_mount(CourseList, {stubs: ['router-link', 'router-view']});
        expect(await wait_for_load(wrapper)).toBe(true);

        await wrapper.find('[data-testid=show_create_course_modal_button]').trigger('click');

        let new_course_data = {
            name: 'An very new name',
            semester: Semester.spring,
            year: 2111,
            num_late_days: 5,
            allowed_guest_domain: '@llama.net',
            subtitle: 'Great course',
        };
        wrapper.findComponent({ref: 'new_course_form'}).vm.$emit('submit', new_course_data);
        await wrapper.vm.$nextTick();
        expect(await wait_until(wrapper, w => !w.vm.d_creating_course)).toBe(true);
        expect(create_course_stub.calledOnceWith(new_course_data)).toBe(true);

        expect(wrapper.findComponent({ref: 'created_course_modal'}).exists()).toBe(false);
    });

    test('Create course API errors handled', async () => {
        sinon.stub(Course, 'create').rejects(new HttpError(403, 'noope'));

        can_create_courses_stub.resolves(true);
        let wrapper = managed_mount(CourseList, {stubs: ['router-link', 'router-view']});
        expect(await wait_for_load(wrapper)).toBe(true);

        await wrapper.find('[data-testid=show_create_course_modal_button]').trigger('click');

        wrapper.findComponent({ref: 'new_course_form'}).vm.$emit('submit', {});
        await wrapper.vm.$nextTick();
        expect(await wait_until(wrapper, w => !w.vm.d_creating_course)).toBe(true);
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'create_course_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(1);
    });
});

describe('CourseList tests', () => {
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
        user = data_ut.make_user();

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

    test('Cloning a course - cloned course causes new term to be created', async () => {
        all_courses = {
            courses_is_admin_for: [fall18_eecs280, fall18_eecs370],
            courses_is_staff_for: [],
            courses_is_student_in: [],
            courses_is_handgrader_for: []
        };
        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = managed_mount(CourseList, {stubs: ['router-link', 'router-view']});
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(component.d_all_courses!.courses_is_admin_for.length).toEqual(2);
        expect(component.courses_by_term.length).toEqual(1);

        copy_of_course.name = "Clonedd course";
        copy_of_course.year = 2042;
        Course.notify_course_created(copy_of_course);

        expect(component.d_all_courses!.courses_is_admin_for.length).toEqual(3);
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

        wrapper = managed_mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        copy_of_course.name = "EECS 281";
        copy_of_course.year = 2018;
        Course.notify_course_created(copy_of_course);

        expect(component.d_all_courses!.courses_is_admin_for.length).toEqual(3);
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

        wrapper = managed_mount(CourseList, {
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

        wrapper = managed_mount(CourseList, {
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

        wrapper = managed_mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(component.d_all_courses!.courses_is_admin_for.length).toEqual(1);
        expect(component.d_all_courses!.courses_is_admin_for[0]).toEqual(fall18_eecs280);

        let all_displayed_courses = wrapper.findAllComponents({name: 'SingleCourse'});
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

        wrapper = managed_mount(CourseList, {
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

        wrapper = managed_mount(CourseList, {
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

        wrapper = managed_mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.single-semester-container').length).toEqual(1);
        let fall_2018_courses = wrapper.findAllComponents({name: 'SingleCourse'});

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

        wrapper = managed_mount(CourseList, {
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

        wrapper = managed_mount(CourseList, {
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

    test('Course user is multiple roles for only displays once', async () => {
        all_courses = {
            courses_is_admin_for: [],
            courses_is_staff_for: [fall18_eecs280],
            courses_is_student_in: [fall18_eecs280],
            courses_is_handgrader_for: []
        };

        sinon.stub(Course, 'get_courses_for_user').returns(Promise.resolve(all_courses));

        wrapper = managed_mount(CourseList, {
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(wrapper.findAll('.course').length).toEqual(1);

        let course_displayed = wrapper.find('.course');
        expect(course_displayed.html()).toContain(fall18_eecs280.name);
        expect(course_displayed.html()).toContain(fall18_eecs280.subtitle);
    });
});
