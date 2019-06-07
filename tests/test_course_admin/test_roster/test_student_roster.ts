import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, Semester, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import Roster from '@/components/course_admin/roster/roster.vue';
import StudentRoster from '@/components/course_admin/roster/student_roster.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('StudentRoster tests', () => {
    let wrapper: Wrapper<StudentRoster>;
    let component: StudentRoster;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;
    let course: Course;
    let students: User[];
    let updated_students: User[];
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });
        user_1 = new User({
            pk: 1,
            username: "coolmom@umich.edu",
            first_name: "Amy",
            last_name: "Poehler",
            email: "coolmom@umich.edu",
            is_superuser: true
        });
        user_2 = new User({
            pk: 2,
            username: "amandaplease@umich.edu",
            first_name: "Amanda",
            last_name: "Bynes",
            email: "amandaplease@umich.edu",
            is_superuser: true
        });
        user_3 = new User({
            pk: 3,
            username: "worldsbestboss@umich.edu",
            first_name: "Steve",
            last_name: "Carell",
            email: "worldsbestbo$$@umich.edu",
            is_superuser: true
        });
        user_4 = new User({
            pk: 4,
            username: "freshPrince@umich.edu",
            first_name: "Will",
            last_name: "Smith",
            email: "freshPrince@umich.edu",
            is_superuser: true
        });
        new_user_1 = new User({
            pk: 5,
            username: "letitsnow@umich.edu",
            first_name: "Brittany",
            last_name: "Snow",
            email: "letitsnow@umich.edu",
            is_superuser: true
        });
        new_user_2 = new User({
            pk: 6,
            username: "sevenEleven@umich.edu",
            first_name: "Millie",
            last_name: "Brown",
            email: "sevenEleven@umich.edu",
            is_superuser: true
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        students = [user_1, user_2, user_3, user_4];
        updated_students = [user_1, user_2, user_3, user_4, new_user_1, new_user_2];

        let get_students_stub = sinon.stub(course, 'get_students');
        get_students_stub.onFirstCall().returns(Promise.resolve(students));
        get_students_stub.onSecondCall().returns(Promise.resolve(updated_students));

        wrapper = mount(StudentRoster, {
            propsData: {
                course: course
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('The created function calls the Course method "get_students"', async () => {
        await component.$nextTick();

        expect(component.d_course).toEqual(course);
        expect(component.students).toEqual(students);
    });

    test('Clicking the "Add to Roster" button with valid input prompts the Course ' +
         'add_students method to be called',
         async () => {
        let add_students_stub = sinon.stub(course, 'add_students');
        await component.$nextTick();

        expect(component.d_course).toEqual(course);
        expect(component.students).toEqual(students);

        let roster = <Roster> wrapper.find({ref: 'student_roster'}).vm;
        roster.users_to_add = new_user_1.username + " " + new_user_2.username;
        await component.$nextTick();

        let add_students_form = wrapper.find('#add-users-form');
        add_students_form.trigger('submit');
        await component.$nextTick();

        expect(add_students_stub.firstCall.calledWith(
            new_user_1.username + " " + new_user_2.username)
        );
        expect(component.students).toEqual(updated_students);
    });

    test('Deleting a user from the roster causes the Course "remove_students" method to' +
         ' be called ',
         async () => {
        let remove_students_stub = sinon.stub(course, 'remove_students');
        await component.$nextTick();

        expect(component.d_course).toEqual(course);
        expect(component.students).toEqual(students);

        let remove_user_buttons = wrapper.find({ref: 'student_roster'}).findAll('.remove-user');
        remove_user_buttons.at(1).trigger('click');
        await component.$nextTick();

        expect(remove_students_stub.firstCall.calledWith([user_1])).toBe(true);
    });
});
