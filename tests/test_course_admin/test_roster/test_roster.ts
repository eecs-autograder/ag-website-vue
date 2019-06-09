import { config, mount, Wrapper } from '@vue/test-utils';

import { User } from 'ag-client-typescript';

import Roster from '@/components/course_admin/roster/roster.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Roster tests', () => {
    let wrapper: Wrapper<Roster>;
    let roster: Roster;
    let original_match_media: (query: string) => MediaQueryList;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;
    let validated_input: Wrapper<ValidatedInput>;
    let validated_input_component: ValidatedInput;
    let roster_form_component: ValidatedForm;
    let roster_form_wrapper: Wrapper<ValidatedForm>;

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

        wrapper = mount(Roster, {
            propsData: {
                role: "admin",
                roster: [user_1, user_2, user_3, user_4]
            }
        });

        roster = wrapper.vm;
        expect(roster.d_roster.length).toEqual(4);

        validated_input = <Wrapper<ValidatedInput>> wrapper.find('#add-users-input');
        validated_input_component = <ValidatedInput> wrapper.find('#add-users-input').vm;
        roster_form_component = <ValidatedForm> wrapper.find('#add-users-form').vm;
        roster_form_wrapper = <Wrapper<ValidatedForm>> wrapper.find('#add-users-form');
        validated_input.find('#textarea').trigger('input');
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Usernames are displayed in alphabetical order', () => {
        expect(roster.role).toEqual("admin");
        expect(roster.d_roster[0]).toEqual(user_2); // amandaplease
        expect(roster.d_roster[1]).toEqual(user_1); // coolmom
        expect(roster.d_roster[2]).toEqual(user_4); // freshPrince
        expect(roster.d_roster[3]).toEqual(user_3); // worldsbestboss

        let all_users = wrapper.findAll('.email');

        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_1.username);
        expect(all_users.at(2).text()).toEqual(user_4.username);
        expect(all_users.at(3).text()).toEqual(user_3.username);
    });

    test('When a user is removed from roster, the parent component is notified',
         async () => {
        let remove_user_buttons = wrapper.findAll('.remove-user');
        remove_user_buttons.at(1).trigger('click');
        await roster.$nextTick();

        expect(roster.d_roster.length).toEqual(3);

        let all_users = wrapper.findAll('.email');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_4.username);
        expect(all_users.at(2).text()).toEqual(user_3.username);
        expect(wrapper.emitted().remove_user.length).toBe(1);
    });

    test('The d_roster is updated when the value of the roster prop changes in the parent',
         async () => {
        let all_users = wrapper.findAll('.email');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_1.username);
        expect(all_users.at(2).text()).toEqual(user_4.username);
        expect(all_users.at(3).text()).toEqual(user_3.username);
        expect(roster.d_roster.length).toEqual(4);

        wrapper.setProps({roster: [user_1, user_3, user_4, new_user_1, new_user_2, user_2]});
        await roster.$nextTick();
        expect(roster.d_roster.length).toEqual(6);

        all_users = wrapper.findAll('.email');
        expect(all_users.at(0).text()).toEqual(user_2.username);
        expect(all_users.at(1).text()).toEqual(user_1.username);
        expect(all_users.at(2).text()).toEqual(user_4.username);
        expect(all_users.at(3).text()).toEqual(new_user_1.username);
        expect(all_users.at(4).text()).toEqual(new_user_2.username);
        expect(all_users.at(5).text()).toEqual(user_3.username);
    });

    test('Usernames that adhere to the valid email regex are valid', async () => {
        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "ch%cken.n00dle.s0up+soda-on_the-side@2007-WebstarAndYoungB.edu";
        validated_input.find('#textarea').trigger('input');
        expect(roster_form_component.is_valid).toBe(true);
        expect(validated_input_component.d_input_value).toBe(
        'ch%cken.n00dle.s0up+soda-on_the-side@2007-WebstarAndYoungB.edu'
        );

        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "sk8gr8m8@umich.edu";
        validated_input.find('#textarea').trigger('input');
        expect(roster_form_component.is_valid).toBe(true);
        expect(validated_input_component.d_input_value).toBe('sk8gr8m8@umich.edu');

        (<HTMLInputElement> validated_input.find('#textarea').element).value = "a_B-C@d-e-f-g.hi";
        validated_input.find('#textarea').trigger('input');
        expect(roster_form_component.is_valid).toBe(true);
        expect(validated_input_component.d_input_value).toBe('a_B-C@d-e-f-g.hi');
    });

    test('Emails whose local-part (before the @ symbol) is empty are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find('#textarea').element).value = "@e.iou";
        validated_input.find('#textarea').trigger('input');
        expect(roster_form_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('@e.iou');
    });

    test("Empty string cannot be added to a roster", async () => {
        (<HTMLInputElement> validated_input.find('#textarea').element).value = "         ";
        validated_input.find('#textarea').trigger('input');
        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe("         ");

        roster_form_wrapper.trigger('submit');
        await roster.$nextTick();

        expect(wrapper.emitted('add_users')).not.toBeTruthy();
    });

    // /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    test('emails that contain disallowed characters in the local-part are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "a*@e.iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('a*@e.iou');
        // console.log("Users to add: " + roster.users_to_add);
        // Something about these tests makes it so that the following two assertions
        // fail (only when the input is changed more than once in a test).
        // This behavior has been independently tested as part of the validated form
        // tests.
        // UPDATE: The refactoring of validated form and input included in fixing #127
        // appears to have fixed this issue.
        expect(roster_form_component.is_valid).toBe(false);
        expect(roster.add_users_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "a?@e.iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('a?@e.iou');
        // See above comment
        expect(roster_form_component.is_valid).toBe(false);
        expect(roster.add_users_form_is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "a(@e.iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('a(@e.iou');
        // See above comment
        expect(roster_form_component.is_valid).toBe(false);
        expect(roster.add_users_form_is_valid).toBe(false);
    });

    test('Emails missing the @ character after the local part are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "iceberg.iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(roster_form_component.is_valid).toBe(false);
        expect(roster.add_users_form_is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg.iou');
    });

    test('Emails containing invalid characters in the mail server portion are invalid',
         async () => {

        (<HTMLInputElement> validated_input.find(
         '#textarea'
        ).element).value = "iceberg@.iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@.iou');

        (<HTMLInputElement> validated_input.find(
         '#textarea'
        ).element).value = "iceberg@hello_world.iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@hello_world.iou');

        (<HTMLInputElement> validated_input.find(
         '#textarea'
        ).element).value = "iceberg@@hello.iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@@hello.iou');
    });

    test('Emails that do not contain the . before the top-level-domain are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "iceberg@iou";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@iou');
        expect(roster_form_component.is_valid).toBe(false);
        expect(roster.add_users_form_is_valid).toBe(false);
    });

    test('Emails where the top-level-domain is less than 2 characters are invalid',
         async () => {
        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "iceberg@ae.";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@ae.');

        (<HTMLInputElement> validated_input.find(
        '#textarea'
        ).element).value = "iceberg@ae.i";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@ae.i');
    });

    test('Emails featuring invalid characters in the top-level domain are invalid',
         async () => {

        (<HTMLInputElement> validated_input.find(
         '#textarea'
        ).element).value = "iceberg@umich.sk8";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@umich.sk8');

        (<HTMLInputElement> validated_input.find(
         '#textarea'
        ).element).value = "iceberg@umich.edu?";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(false);
        expect(validated_input_component.d_input_value).toBe('iceberg@umich.edu?');
    });

    test('When a user is added, the parent component is notified',
         async () => {
         (<HTMLInputElement> validated_input.find(
             '#textarea'
         ).element).value = "letitsnow@umich.edu  sevenEleven@umich.edu";
         validated_input.find('#textarea').trigger('input');
         await roster.$nextTick();

         expect(roster_form_component.is_valid).toBe(true);
         expect(validated_input_component.d_input_value).toBe(
             'letitsnow@umich.edu  sevenEleven@umich.edu'
         );
         expect(roster.add_users_form_is_valid).toBe(true);

         roster_form_wrapper.trigger('submit');
         await roster.$nextTick();

         expect(wrapper.emitted().add_users.length).toBe(1);
    });

    test('Validator function exposes addresses that do not adhere to the format specified ' +
         'in the valid email addresses regex',
         async () => {
         (<HTMLInputElement> validated_input.find('#textarea').element).value = " angela";
         validated_input.find('#textarea').trigger('input');
         await roster.$nextTick();

         expect(validated_input_component.is_valid).toBe(false);
         expect(validated_input_component.d_input_value).toBe(' angela');
         expect(roster_form_component.is_valid).toBe(false);
         expect(roster.add_users_form_is_valid).toBe(false);

         (<HTMLInputElement> validated_input.find(
             '#textarea'
         ).element).value = " angela@umich";
         validated_input.find('#textarea').trigger('input');

         await roster.$nextTick();

         expect(validated_input_component.is_valid).toBe(false);
         expect(validated_input_component.d_input_value).toBe(' angela@umich');

         (<HTMLInputElement> validated_input.find(
             '#textarea'
         ).element).value = " angela@umich.edu";
         validated_input.find('#textarea').trigger('input');
         await roster.$nextTick();

         expect(validated_input_component.is_valid).toBe(true);
         expect(validated_input_component.d_input_value).toBe(' angela@umich.edu');
    });

    test('valid emails can be separated by colons, whitespace, or newlines', async () => {
        (<HTMLInputElement> validated_input.find(
            '#textarea'
        ).element).value = " roy@anderson.net\nclark@aol.com,pete@nd.edu     meredith@cmu.edu";
        validated_input.find('#textarea').trigger('input');
        await roster.$nextTick();

        expect(validated_input_component.is_valid).toBe(true);
        expect(validated_input_component.d_input_value).toBe(
            ' roy@anderson.net\nclark@aol.com,pete@nd.edu     meredith@cmu.edu'
        );
        expect(roster_form_component.is_valid).toBe(true);
        expect(roster.add_users_form_is_valid).toBe(true);
    });

    test('Validator function exposes the first invalid email address even when there' +
         ' may be many',
         async () => {
         (<HTMLInputElement> validated_input.find(
             '#textarea'
         ).element).value = " angela@umich.edu,oscar@umich.edu\nphyllis@@umich.edu" +
                            "\nryan@msuedu\ngabe";
         validated_input.find('#textarea').trigger('input');
         await roster.$nextTick();

         expect(validated_input_component.is_valid).toBe(false);
         expect(roster.first_invalid_email).toEqual("phyllis@@umich.edu");
    });

    test('Invalid usernames prevent form submission',
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
         await roster.$nextTick();

         expect(validated_input_component.is_valid).toBe(false);
         expect(validated_input_component.d_input_value).toBe(username_input);
         expect(roster.first_invalid_email).toEqual("hollyflax");

         let add_users_button = wrapper.find('#add-users-button');
         expect(add_users_button.is('[disabled]')).toBe(true);
         expect(roster.add_users_form_is_valid).toEqual(false);

         roster_form_wrapper.trigger('submit');
         await roster.$nextTick();

         expect(wrapper.emitted('add_users')).not.toBeTruthy();
    });

    test('If the textarea contains all valid emails, the parent component is notified ' +
         'when the add_users button is pressed.',
         async () => {

         let username_input = "michael@umich.edu\n\nDarryl@umich.edu Bearyl@umich.edu " +
                              "erinH@umich.edu\ngabe@umich.edu\nmeredith@umich.edu " +
                              "dwight@umich.edu\nandy@umich.com\nphyllis@umich.edu" +
                              " pam@umich.edu jim@umich.edu " +
                              "oscar@umich.edu\n angela@umich.edu\n" +
                              "kevin@umich.edu,stanley@umich.edu " +
                              "kelly@umich.edu,\nryan@umich.edu,";

         (<HTMLInputElement> validated_input.find('#textarea').element).value = username_input;
         validated_input.find('#textarea').trigger('input');
         await roster.$nextTick();

         expect(validated_input_component.is_valid).toBe(true);
         expect(validated_input_component.d_input_value).toBe(username_input);
         expect(roster_form_component.is_valid).toBe(true);

         roster_form_wrapper.trigger('submit');
         await roster.$nextTick();

         expect(wrapper.emitted().add_users.length).toBe(1);
    });
});
