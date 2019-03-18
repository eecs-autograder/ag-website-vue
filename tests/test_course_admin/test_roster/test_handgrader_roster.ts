import HandgraderRoster from '@/components/course_admin/roster/handgrader_roster.vue';
import Roster from '@/components/course_admin/roster/roster.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';

import { patch_async_class_method, patch_async_static_method } from '../../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('HandgraderRoster.vue', () => {
    let wrapper: Wrapper<HandgraderRoster>;
    let handgrader_roster: HandgraderRoster;
    let original_match_media: (query: string) => MediaQueryList;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;
    let my_course: Course;
    let handgraders: User[];

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
            wrapper.destroy();
        }
    });

    test('The created function calls the Course method "get_handgraders"', () => {
        handgraders = [user_1, user_2, user_3, user_4];

        return patch_async_class_method(
            Course,
            'get_handgraders',
            () => Promise.resolve(handgraders),
            async () => {

            wrapper = mount(HandgraderRoster, {
                propsData: {
                    course: my_course
                }
            });

            handgrader_roster = wrapper.vm;
            await handgrader_roster.$nextTick();

            expect(handgrader_roster.d_course).toEqual(my_course);
            expect(handgrader_roster.handgraders).toEqual(handgraders);
        });
    });

    test('Clicking the "Add to Roster" button with valid input prompts the Course ' +
         'add_handgraders method to be called',
         async () => {
        handgraders = [
            make_user(0, `user${0}`),
            make_user(1, `user${1}`),
            make_user(2, `user${2}`)
        ];

        return patch_async_class_method(
            Course,
            'get_handgraders',
            make_fake_get_handgraders_func(),
            async () => {

            wrapper = mount(HandgraderRoster, {
                propsData: {
                    course: my_course
                }
            });

            handgrader_roster = wrapper.vm;
            await handgrader_roster.$nextTick();

            expect(handgrader_roster.d_course).toEqual(my_course);
            expect(handgrader_roster.handgraders).toEqual(handgraders);

            const spy = jest.fn();
            return patch_async_class_method(
                Course,
                'add_handgraders',
                spy,
                async () => {

                let roster = <Roster> wrapper.find({ref: 'handgrader_roster'}).vm;
                roster.users_to_add = "letitsnow@umich.edu sevenEleven@umich.edu";
                await handgrader_roster.$nextTick();

                let add_handgraders_form = wrapper.find('#add-users-form');
                add_handgraders_form.trigger('submit');
                await handgrader_roster.$nextTick();

                handgraders.push(make_user(3, `user${3}`));

                expect(handgrader_roster.handgraders).toEqual(handgraders);
                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });

    function make_fake_get_handgraders_func() {
        let counter = 0;
        let handgraders2: User[] = [];
        for (let i = 0; i < 3; ++i) {
            handgraders2.push(make_user(counter, `user${counter}`));
            counter += 1;
        }

        return () => {
            let to_return = handgraders2.slice(0);
            handgraders2.push(make_user(counter, `user${counter}`));
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

    test('Deleting a user from the roster causes the Course "remove_handgraders" method to' +
         ' be called ',
         async () => {

        handgraders = [user_1, user_2, user_3, user_4];

        return patch_async_class_method(
            Course,
            'get_handgraders',
            () => Promise.resolve(handgraders),
            async () => {

            wrapper = mount(HandgraderRoster, {
                propsData: {
                    course: my_course
                }
            });

            handgrader_roster = wrapper.vm;
            await handgrader_roster.$nextTick();

            expect(handgrader_roster.d_course).toEqual(my_course);
            expect(handgrader_roster.handgraders).toEqual(handgraders);

            const spy = jest.fn();
            return patch_async_class_method(
                Course,
                'remove_handgraders',
                spy,
                async () => {

                let remove_user_buttons = wrapper.find(
                    {ref: 'handgrader_roster'}
                ).findAll(
                    '.remove-user'
                );
                remove_user_buttons.at(1).trigger('click');
                await wrapper.vm.$nextTick();

                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });
});
