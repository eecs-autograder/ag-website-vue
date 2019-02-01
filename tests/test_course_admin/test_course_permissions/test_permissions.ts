import ValidatedForm from '@/components/validated_form.vue';
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
    let validated_input: Wrapper<Vue>;
    let validated_input_component: ValidatedInput;
    let permissions_form_component: ValidatedForm;
    let permissions_form: Wrapper<Vue>;

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

        wrapper = mount(Permissions, {
            propsData: {
                role: "admin",
                roster: [user_1, user_2, user_3, user_4]
            }
        });

        course_permissions = wrapper.vm;
        expect(course_permissions.d_roster.length).toEqual(4);

        validated_input = wrapper.find('#add-permissions-input');
        validated_input_component = <ValidatedInput> wrapper.find(
            '#add-permissions-input'
        ).vm;
        permissions_form_component = <ValidatedForm> wrapper.find(
            '#add-permissions-form'
        ).vm;
        permissions_form = wrapper.find('#add-permissions-form');
        validated_input.find('#textarea').trigger('input');
        // expect(permissions_form_component.is_valid).toBe(true); -- not true bc of empty string
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            // console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test('Variables are initialized to the values passed in as props', () => {
        expect(course_permissions.role).toEqual("admin");
        expect(course_permissions.d_roster[0]).toEqual(user_2); // amandaplease
        expect(course_permissions.d_roster[1]).toEqual(user_1); // coolmom
        expect(course_permissions.d_roster[2]).toEqual(user_4); // coolmom
        expect(course_permissions.d_roster[3]).toEqual(user_3); // worldsbestboss
    });

    test('Usernames are displayed in alphabetical order', () => {
        let all_users = wrapper.findAll('.username');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_1.username);
        expect(all_users.at(2).text()).toEqual(user_4.username);
        expect(all_users.at(3).text()).toEqual(user_3.username);
    });

    test('When a user is deleted from permissions, the parent component is notified',
         async () => {
        let delete_permission_buttons = wrapper.findAll('.delete-permission');
        delete_permission_buttons.at(1).trigger('click');
        await course_permissions.$nextTick();

        expect(course_permissions.d_roster.length).toEqual(3);

        let all_users = wrapper.findAll('.username');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_4.username);
        expect(all_users.at(2).text()).toEqual(user_3.username);
        expect(wrapper.emitted().remove_permission.length).toBe(1);
    });

    test('The d_roster is updated when the value of the roster prop changes in the parent',
         async () => {
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

    test('Usernames that adhere to the valid email regex are valid',
         async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "ch%cken.n00dle.s0up+soda-on_the-side@2007-WebstarAndYoungB.edu";
        validated_input.find('#textarea').trigger('input');
        expect(permissions_form_component.is_valid).toBe(true);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "sk8gr8m8@umich.edu";
        validated_input.find('#textarea').trigger('input');
        expect(permissions_form_component.is_valid).toBe(true);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "a_B-C@d-e-f-g.hi";
        validated_input.find('#textarea').trigger('input');
        expect(permissions_form_component.is_valid).toBe(true);
    });

    test('emails whose local-part (before the @ symbol) is empty are invalid',
         async () => {
         (<HTMLInputElement> validated_input.find(
             '#textarea'
         ).element).value = "@e.iou";
         validated_input.find('#textarea').trigger('input');
         expect(permissions_form_component.is_valid).toBe(false);
    });

    test("The empty string cannot be added to a permissions roster", async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "         ";
        validated_input.find('#textarea').trigger('input');
        expect(validated_input_component.is_valid).toBe(false);

        permissions_form.trigger('submit.native');
        await course_permissions.$nextTick();

        expect(wrapper.emitted('add_permissions')).not.toBeTruthy();
    });

    // /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    test('emails that contain disallowed characters in the local-part are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "a*@e.iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // console.log("Users to add: " + course_permissions.users_to_add);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "a?@e.iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "a(@e.iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);
    });

    test('emails missing the @ character after the local part are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg.iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(permissions_form_component.is_valid).toBe(false);
        expect(course_permissions.permissions_form_is_valid).toBe(false);
    });

    test('emails containing invalid characters in the mail server portion are invalid',
         async () => {

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg@.iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg@hello_world.iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg@@hello.iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);
    });

    test('emails that do not contain the . before the top-level-domain are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "iceberg@iou";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(permissions_form_component.is_valid).toBe(false);
        expect(course_permissions.permissions_form_is_valid).toBe(false);
    });

    test('emails where the top-level-domain is less than 2 characters are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg@ae.";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg@ae.i";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);
    });

    test('emails featuring invalid characters in the top-level domain are invalid',
         async () => {

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg@umich.sk8";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "iceberg@umich.edu?";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);
    });

    test('When a user is given permission, the parent component is notified',
         async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = "letitsnow@umich.edu  sevenEleven@umich.edu";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(permissions_form_component.is_valid).toBe(true);
        expect(course_permissions.permissions_form_is_valid).toBe(true);

        permissions_form.trigger('submit.native');
        await course_permissions.$nextTick();

        expect(wrapper.emitted().add_permissions.length).toBe(1);
    });

    test('Validator function exposes addresses that do not adhere to the format specified ' +
         'in the valid email addresses regex',
         async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = " angela";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = " angela@umich";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        // expect(permissions_form_component.is_valid).toBe(false);
        // expect(course_permissions.permissions_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = " angela@umich.edu";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(true);
        // expect(permissions_form_component.is_valid).toBe(true);
        // expect(course_permissions.permissions_form_is_valid).toBe(true);
    });

    test('valid emails can be separated by colons, whitespace, or newlines', async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = " roy@anderson.net\nclark@aol.com,pete@nd.edu     meredith@cmu.edu";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(true);
        expect(permissions_form_component.is_valid).toBe(true);
        expect(course_permissions.permissions_form_is_valid).toBe(true);
    });

    test('Validator function exposes the first invalid email address even when there' +
         ' may be many',
         async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = " angela@umich.edu,oscar@umich.edu\nphyllis@@umich.edu" +
                           "\nryan@msuedu\ngabe";
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(course_permissions.first_invalid_email).toEqual("phyllis@@umich.edu");
    });

    test('When trying to add permissions invalid usernames entered will prevent ' +
         'a successful submission',
         async () => {
        let username_input = "michael@umich.edu\nhollyflax\nDarryl@umich.edu Bearyl@umich.edu " +
                          "erinH@umich.edu\ngabe@umich\nmeredith@umich.edu " +
                          "dwight@umich.edu\nandy@umich.\nphyllis@umich.edu" +
                          " pam@umich.edu jim@umich.edu " +
                          "oscar@umich.edu\n angela@umich.edu\n" +
                          "kevin@umich.edu,stanley@umich.edu " +
                          "kelly@umich.edu,\nryan@umich.edu,\n";

        (<HTMLInputElement> validated_input.find(
         '#textarea'
        ).element).value = username_input;
        validated_input.find('#textarea').trigger('input');
        await wrapper.vm.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(course_permissions.first_invalid_email).toEqual("hollyflax");
        // expect the button to be disabled?

        let add_permissions_button = wrapper.find('.add-permissions-button');
        expect(add_permissions_button.is('[disabled]')).toBe(true);
        expect(course_permissions.permissions_form_is_valid).toEqual(false);

        let permissions_form = wrapper.find('#add-permissions-form');
        permissions_form.trigger('submit.native');
        await course_permissions.$nextTick();

        expect(wrapper.emitted('add_permissions')).not.toBeTruthy();
    });

    test('If the textarea contains all valid emails, the parent component is notified ' +
         'when the add_permissions button is pressed.',
         async () => {

         let username_input = "michael@umich.edu\n\nDarryl@umich.edu Bearyl@umich.edu " +
                              "erinH@umich.edu\ngabe@umich.edu\nmeredith@umich.edu " +
                              "dwight@umich.edu\nandy@umich.com\nphyllis@umich.edu" +
                              " pam@umich.edu jim@umich.edu " +
                              "oscar@umich.edu\n angela@umich.edu\n" +
                              "kevin@umich.edu,stanley@umich.edu " +
                              "kelly@umich.edu,\nryan@umich.edu,";

         (<HTMLInputElement> validated_input.find(
             '#textarea'
         ).element).value = username_input;
         validated_input.find('#textarea').trigger('input');
         await wrapper.vm.$nextTick();

         expect(validated_input_component.is_valid).toBe(true);
         expect(permissions_form_component.is_valid).toBe(true);

         let permissions_form = wrapper.find('#add-permissions-form');
         permissions_form.trigger('submit.native');
         await course_permissions.$nextTick();

         expect(wrapper.emitted().add_permissions.length).toBe(1);
    });
});
