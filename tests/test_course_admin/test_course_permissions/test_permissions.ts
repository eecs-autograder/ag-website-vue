import AdminRoster from '@/components/course_admin/permissions/admin_roster.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Project, Semester, User } from 'ag-client-typescript';
import Vue from 'vue';

import Permissions from '@/components/course_admin/permissions/permissions.vue';
import ValidatedInput from '@/components/validated_input.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Permissions.vue', () => {
    let wrapper: Wrapper<Permissions>;
    let course_permissions: Permissions;
    let original_match_media: (query: string) => MediaQueryList;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;

    const $route = {
        path: '/web/course_admin/:courseId',
        params: { courseId: '2' }
    };

    beforeEach(() => {
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

    test('Variables are initialized to the values passed in as props', () => {
        wrapper = mount(Permissions, {
            propsData: {
                role: "admin",
                roster: [user_1, user_2, user_3, user_4]
            }
        });

        course_permissions = wrapper.vm;
        expect(course_permissions.role).toEqual("admin");
        expect(course_permissions.d_roster[0]).toEqual(user_2); // amandaplease
        expect(course_permissions.d_roster[1]).toEqual(user_1); // coolmom
        expect(course_permissions.d_roster[2]).toEqual(user_4); // coolmom
        expect(course_permissions.d_roster[3]).toEqual(user_3); // worldsbestboss
    });

    test('Usernames are displayed in alphabetical order', () => {
        wrapper = mount(Permissions, {
            propsData: {
                role: "admin",
                roster: [user_1, user_2, user_3, user_4]
            }
        });

        let all_users = wrapper.findAll('.username');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_1.username);
        expect(all_users.at(2).text()).toEqual(user_4.username);
        expect(all_users.at(3).text()).toEqual(user_3.username);
    });

    test('When a user is deleted from permissions, the parent component is notified',
         async () => {
        wrapper = mount(Permissions, {
            propsData: {
                role: "admin",
                roster: [user_1, user_2, user_3, user_4]
            }
        });

        course_permissions = wrapper.vm;
        expect(course_permissions.d_roster.length).toEqual(4);

        let delete_permission_buttons = wrapper.findAll('.delete-enrollee');
        delete_permission_buttons.at(1).trigger('click');
        await course_permissions.$nextTick();

        expect(course_permissions.d_roster.length).toEqual(3);

        let all_users = wrapper.findAll('.username');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_4.username);
        expect(all_users.at(2).text()).toEqual(user_3.username);

        expect(wrapper.emitted().remove_permission.length).toBe(1);
    });

    test('When a user is given permission, the parent component is notified',
         async () => {
        wrapper = mount(Permissions, {
            propsData: {
                role: "admin",
                roster: [user_1, user_2, user_3, user_4]
            }
        });

        course_permissions = wrapper.vm;
        expect(course_permissions.d_roster.length).toEqual(4);

        let validated_input = wrapper.find({ref: 'add_permissions_input'});
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "letitsnow@umich.edu  sevenEleven@umich.edu";
        validated_input.find('#textarea').trigger('input');

        let permissions_form = wrapper.find('#add-permissions-form');
        permissions_form.trigger('submit.native');
        await course_permissions.$nextTick();

        expect(wrapper.emitted().add_permissions.length).toBe(1);
    });

    test("When a user attempts to add invalid usernames the parent component is not notified",
         async () => {
         wrapper = mount(Permissions, {
             propsData: {
                 role: "admin",
                 roster: [user_1, user_2, user_3, user_4]
             }
         });

         course_permissions = wrapper.vm;
         expect(course_permissions.d_roster.length).toEqual(4);

         let validated_input = wrapper.find({ref: 'add_permissions_input'});
         (<HTMLInputElement> validated_input.find(
             '#textarea'
         ).element).value = "         ";
         validated_input.find('#textarea').trigger('input');

         let permissions_form = wrapper.find('#add-permissions-form');
         permissions_form.trigger('submit.native');
         await course_permissions.$nextTick();

         expect(wrapper.emitted('add_permissions')).not.toBeTruthy();
    });

    test('The d_roster is updated when the value of the roster prop changes in the parent',
         async () => {

        wrapper = mount(Permissions, {
            propsData: {
                role: "admin",
                roster: [user_1, user_2, user_3, user_4]
            }
        });

        course_permissions = wrapper.vm;
        expect(course_permissions.d_roster.length).toEqual(4);

        let all_users = wrapper.findAll('.username');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_1.username);
        expect(all_users.at(2).text()).toEqual(user_4.username);
        expect(all_users.at(3).text()).toEqual(user_3.username);

        wrapper.setProps({roster: [user_1, user_3, user_4, new_user_1, new_user_2, user_2]});
        await course_permissions.$nextTick();
        expect(course_permissions.d_roster.length).toEqual(6);

        all_users = wrapper.findAll('.username');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_1.username);
        expect(all_users.at(2).text()).toEqual(user_4.username);
        expect(all_users.at(3).text()).toEqual(new_user_1.username);
        expect(all_users.at(4).text()).toEqual(new_user_2.username);
        expect(all_users.at(5).text()).toEqual(user_3.username);
    });
});
