import Permissions from '@/components/course_admin/roster/roster.vue';
import StudentRoster from '@/components/course_admin/roster/student_roster.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';

import { patch_async_class_method } from '../../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('StudentRoster.vue', () => {
    let wrapper: Wrapper<StudentRoster>;
    let student_roster: StudentRoster;
    let original_match_media: (query: string) => MediaQueryList;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;
    let my_course: Course;
    let students: User[];

    beforeEach(() => {
        my_course = new Course({
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

    test('The created function calls the Course method "get_students"', () => {
        students = [user_1, user_2, user_3, user_4];

        return patch_async_class_method(
            Course,
            'get_students',
            () => Promise.resolve(students),
            async () => {

            wrapper = mount(StudentRoster, {
                propsData: {
                    course: my_course
                }
            });

            student_roster = wrapper.vm;
            await student_roster.$nextTick();

            expect(student_roster.d_course).toEqual(my_course);
            expect(student_roster.students).toEqual(students);
        });
    });

    test('Clicking the "Add to Roster" button with valid input prompts the Course ' +
         'add_students method to be called',
         async () => {

        students = [
            make_user(0, `user${0}`),
            make_user(1, `user${1}`),
            make_user(2, `user${2}`)
        ];

        return patch_async_class_method(
            Course,
            'get_students',
            make_fake_get_students_func(),
            async () => {

            wrapper = mount(StudentRoster, {
                propsData: {
                    course: my_course
                }
            });

            student_roster = wrapper.vm;
            await student_roster.$nextTick();

            expect(student_roster.d_course).toEqual(my_course);
            expect(student_roster.students).toEqual(students);

            const spy = jest.fn();
            return patch_async_class_method(
                Course,
                'add_students',
                spy,
                async () => {

                let permissions = <Permissions> wrapper.find({ref: 'student_permissions'}).vm;
                permissions.users_to_add = "letitsnow@umich.edu sevenEleven@umich.edu";
                await student_roster.$nextTick();

                let add_students_form = wrapper.find('#add-permissions-form');
                add_students_form.trigger('submit');
                await student_roster.$nextTick();

                students.push(make_user(3, `user${3}`));

                expect(student_roster.students).toEqual(students);
                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });

    function make_fake_get_students_func() {
        let counter = 0;
        let students2: User[] = [];
        for (let i = 0; i < 3; ++i) {
            students2.push(make_user(counter, `user${counter}`));
            counter += 1;
        }

        return () => {
            let to_return = students2.slice(0);
            students2.push(make_user(counter, `user${counter}`));
            counter += 1;
            return Promise.resolve(to_return);
        };
    }

    function make_user(pk: number, username: string): User {
        return new User({
            pk: pk,
            username: username,
            first_name: 'Steve the Llama',
            last_name: 'Spam',
            is_superuser: false,
            email: 'steve@thellama.com'
        });
    }

    test('Deleting a user from the roster causes the Course "remove_students" method to' +
         ' be called ',
         async () => {

        students = [user_1, user_2, user_3, user_4];
        return patch_async_class_method(
            Course,
            'get_students',
            () => Promise.resolve(students),
            async () => {

            wrapper = mount(StudentRoster, {
                propsData: {
                    course: my_course
                }
            });

            student_roster = wrapper.vm;
            await student_roster.$nextTick();

            expect(student_roster.d_course).toEqual(my_course);
            expect(student_roster.students).toEqual(students);

            const spy = jest.fn();
            return patch_async_class_method(
                Course,
                'remove_students',
                spy,
                async () => {
                let student_permissions = wrapper.find(
                {ref: 'student_permissions'});
                let delete_permission_buttons = student_permissions.findAll(
                '.delete-permission'
                );
                delete_permission_buttons.at(1).trigger('click');
                await student_roster.$nextTick();

                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });
});
