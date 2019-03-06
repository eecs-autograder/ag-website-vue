import AdminRoster from '@/components/course_admin/permissions/admin_roster.vue';
import Permissions from '@/components/course_admin/permissions/permissions.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';

import { patch_async_class_method } from '../../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AdminRoster.vue', () => {
    let wrapper: Wrapper<AdminRoster>;
    let admin_roster: AdminRoster;
    let original_match_media: (query: string) => MediaQueryList;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;
    let my_course: Course;
    let admins: User[];

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
            pk: 3,
            username: "freshPrince@umich.edu",
            first_name: "Will",
            last_name: "Smith",
            email: "freshPrince@umich.edu",
            is_superuser: true
        });
        new_user_1 = new User({
            pk: 4,
            username: "letitsnow@umich.edu",
            first_name: "Brittany",
            last_name: "Snow",
            email: "letitsnow@umich.edu",
            is_superuser: true
        });
        new_user_2 = new User({
            pk: 5,
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

    test('The created function calls the Course method "get_admins"', () => {
        admins = [user_1, user_2, user_3, user_4];
        return patch_async_class_method(
            Course,
            'get_admins',
            () => Promise.resolve(admins),
            async () => {

            wrapper = mount(AdminRoster, {
                propsData: {
                    course: my_course
                }
            });
            admin_roster = wrapper.vm;
            await admin_roster.$nextTick();

            expect(admin_roster.d_course).toEqual(my_course);
            expect(admin_roster.admins).toEqual(admins);
        });
    });

    test('Clicking the "Add to Roster" button with valid input prompts the Course ' +
         'add_admins method to be called',
         async () => {
        admins = [
            make_user(0, `user${0}`),
            make_user(1, `user${1}`),
            make_user(2, `user${2}`)
        ];

        return patch_async_class_method(
            Course,
            'get_admins',
            make_fake_get_admins_func(),
            async () => {

            wrapper = mount(AdminRoster, {
                propsData: {
                    course: my_course
                }
            });

            admin_roster = wrapper.vm;
            await admin_roster.$nextTick();

            expect(admin_roster.d_course).toEqual(my_course);
            expect(admin_roster.admins).toEqual(admins);

            const spy = jest.fn();
            return patch_async_class_method(
                Course,
                'add_admins',
                spy,
                async () => {

                let permissions = <Permissions> wrapper.find({ref: 'admin_permissions'}).vm;
                permissions.users_to_add = "letitsnow@umich.edu sevenEleven@umich.edu";
                await admin_roster.$nextTick();

                let add_admins_form = wrapper.find('#add-permissions-form');
                add_admins_form.trigger('submit');
                await admin_roster.$nextTick();

                admins.push(make_user(3, `user${3}`));

                expect(admin_roster.admins).toEqual(admins);
                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });

    function make_fake_get_admins_func() {
        let counter = 0;
        let admins2: User[] = [];
        for (let i = 0; i < 3; ++i) {
            admins2.push(make_user(counter, `user${counter}`));
            counter += 1;
        }

        return () => {
            let to_return = admins2.slice(0);
            admins2.push(make_user(counter, `user${counter}`));
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

    test('Deleting a user from the roster causes the Course "remove_admins" method to' +
        ' be called ',
         async () => {

        admins = [user_1, user_2, user_3, user_4];

        return patch_async_class_method(
            Course,
            'get_admins',
            () => Promise.resolve(admins),
            async () => {

            wrapper = mount(AdminRoster, {
                propsData: {
                    course: my_course
                }
            });

            admin_roster = wrapper.vm;
            await admin_roster.$nextTick();

            expect(admin_roster.d_course).toEqual(my_course);
            expect(admin_roster.admins).toEqual(admins);

            const spy = jest.fn();
            return patch_async_class_method(
                Course,
                'remove_admins',
                spy,
                async () => {

                let admin_permissions = wrapper.find(
                {ref: 'admin_permissions'});
                let delete_permission_buttons = admin_permissions.findAll(
                '.delete-permission'
                );
                delete_permission_buttons.at(1).trigger('click');
                await admin_roster.$nextTick();

                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });
});
