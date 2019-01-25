import AdminRoster from '@/components/course_admin/permissions/admin_roster.vue';
import HandgraderRoster from '@/components/course_admin/permissions/handgrader_roster.vue';
import Permissions from '@/components/course_admin/permissions/permissions.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, User } from 'ag-client-typescript';

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
    // let handgrader_permissions: Permissions;
    let handgraders: User[];

    const $route = {
        path: '/web/course_admin/:courseId',
        params: {courseId: '2'}
    };

    beforeEach(() => {
        my_course = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, last_modified: ''
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

    test.skip('course prop is initialized to value passed in.', () => {
        wrapper = mount(HandgraderRoster, {
            propsData: {
                course: my_course
            }
        });

        handgrader_roster = wrapper.vm;
        expect(handgrader_roster.course).toEqual(my_course);
    });

    test.skip('The created function calls the Course method "get_handgraders"', () => {
        handgraders = [user_1, user_2, user_3, user_4];

        patch_async_class_method(Course,
                                 'get_handgraders',
                                 () => Promise.resolve(handgraders),
                                 async () => {

            wrapper = mount(HandgraderRoster, {
                propsData: {
                    course: my_course
                }
            });

            await wrapper.vm.$nextTick();
            handgrader_roster = wrapper.vm;
            expect(handgrader_roster.d_course).toEqual(my_course);
            expect(handgrader_roster.handgraders).toEqual(handgraders);
        });
    });

    test.skip('Clicking the "Add to Roster" button with valid input prompts the Course ' +
         'add_handgraders method to be called ',
         async () => {
        handgraders = [user_1, user_2, user_3, user_4];
        let usernames_to_add = "letitsnow@umich.edu  sevenEleven@umich.edu";

        patch_async_class_method(Course,
                                 'get_handgraders',
                                 () => Promise.resolve(handgraders),
                                 async () => {

            wrapper = mount(HandgraderRoster, {
                propsData: {
                    course: my_course
                }
            });

            await wrapper.vm.$nextTick();
            handgrader_roster = wrapper.vm;
            expect(handgrader_roster.d_course).toEqual(my_course);
            expect(handgrader_roster.handgraders).toEqual(handgraders);

            let handgrader_permissions = <Permissions> wrapper.find(
                {ref: 'handgrader_permissions'}
            ).vm;
            expect(handgrader_permissions.new_permissions_list).toEqual("");

            let validated_input = wrapper.find('#add_permissions_input');
            (<HTMLInputElement> validated_input.find(
                '#textarea'
            ).element).value = usernames_to_add;
            validated_input.find('#textarea').trigger('input');
            await wrapper.vm.$nextTick();
            expect(handgrader_permissions.new_permissions_list).toEqual(usernames_to_add);

            const spy = jest.fn();
            await patch_async_static_method(
                Course, 'add_handgraders',
                spy,
                async () => {

                    let add_handgraders_form = wrapper.find('#add-permissions-form');
                    add_handgraders_form.trigger('submit');
                    await handgrader_permissions.$nextTick();

                    expect(spy.mock.calls.length).toBe(1);
                }
            );
        });
    });

    test.skip('eh',
         async () => {
        handgraders = [user_1, user_2, user_3, user_4];
        let updated_handgraders = [user_1, user_2, user_3, user_4, new_user_2];
        let usernames_to_add = "sevenEleven@umich.edu";

        patch_async_class_method(Course,
                                 'get_handgraders',
                                 () => Promise.resolve(handgraders),
                                 async () => {

            wrapper = mount(HandgraderRoster, {
                propsData: {
                    course: my_course
                }
            });

            await wrapper.vm.$nextTick();
            handgrader_roster = wrapper.vm;
            expect(handgrader_roster.d_course).toEqual(my_course);
            expect(handgrader_roster.handgraders).toEqual(handgraders);

            let handgrader_permissions = <Permissions> wrapper.find(
            {ref: 'handgrader_permissions'}
            ).vm;
            expect(handgrader_permissions.new_permissions_list).toEqual("");

            let validated_input = wrapper.find('#add_permissions_input');
            (<HTMLInputElement> validated_input.find(
                '#textarea'
            ).element).value = usernames_to_add;
            validated_input.find('#textarea').trigger('input');
            await wrapper.vm.$nextTick();

            expect(handgrader_permissions.new_permissions_list).toEqual(usernames_to_add);

            await patch_async_static_method(Course,
                                            'add_handgraders',
                                            () => Promise.resolve(updated_handgraders),
                                            async () => {
                let mock_result = await handgrader_roster.course.add_handgraders(
                    usernames_to_add
                );
                expect(mock_result).toEqual(updated_handgraders);

                let add_handgraders_form = wrapper.find('#add-permissions-form');
                add_handgraders_form.trigger('submit');
                await handgrader_permissions.$nextTick();

                expect(handgrader_roster.handgraders).toEqual(updated_handgraders);
            });
        });
    });


    test.skip('Deleting a user from the roster causes the Course "remove_handgraders" method to' +
         ' be called ',
         async () => {

             handgraders = [user_1, user_2, user_3, user_4];
             let updated_handgraders = [user_1, user_3, user_4];

             patch_async_class_method(
                 Course,
                 'get_handgraders',
                 () => Promise.resolve(handgraders),
                 async () => {

                     wrapper = mount(HandgraderRoster, {
                         propsData: {
                             course: my_course
                         }
                     });

                     await wrapper.vm.$nextTick();
                     handgrader_roster = wrapper.vm;
                     expect(handgrader_roster.d_course).toEqual(my_course);
                     expect(handgrader_roster.handgraders).toEqual(handgraders);

                     patch_async_class_method(
                         Course,
                         'remove_handgraders',
                         () => Promise.resolve(updated_handgraders),
                         async () => {

                         const spy = jest.fn();
                         await patch_async_static_method(
                             Course,
                             'add_handgraders',
                             spy,
                             async () => {

                                 let handgrader_permissions = wrapper.find(
                                     {ref: 'handgrader_permissions'});
                                 let delete_permission_buttons = handgrader_permissions.findAll(
                                     '.delete-enrollee'
                                 );
                                 delete_permission_buttons.at(1).trigger('click');
                                 await wrapper.vm.$nextTick();

                                 expect(spy.mock.calls.length).toBe(1);
                             }
                         );
                     }
                 );
             }
         );
    });
});


