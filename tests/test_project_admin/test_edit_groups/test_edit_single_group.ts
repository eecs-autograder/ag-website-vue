import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import {
    Course,
    Group,
    Project,
    Semester,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

// @ts-ignore
import moment from 'moment';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('EditSingleGroup tests', () => {
    let wrapper: Wrapper<EditSingleGroup>;
    let component: EditSingleGroup;
    let course: Course;
    let group: Group;
    let project: Project;

    beforeEach(() => {
        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '@cornell.edu', last_modified: ''
        });

        group = new Group({
            pk: 1,
            project: 2,
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {"oscar@cornell.edu": 2},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        project = new Project({
            pk: 2,
            name: "Project 1 - Statistics",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 2,
            max_group_size: 3,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        wrapper = mount(EditSingleGroup, {
            propsData: {
                course: course,
                project: project,
                group: group
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('A group must have at most max_group_size members and at least one member', async () => {
        expect(component.d_group!.member_names.length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(false);

        wrapper.find(".add-member-button").trigger('click');

        expect(component.d_group!.member_names.length).toEqual(3);
        expect(wrapper.findAll('.member-name-input').length).toEqual(3);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(true);

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        expect(component.d_group!.member_names.length).toEqual(3);
        expect(wrapper.findAll('.member-name-input').length).toEqual(3);

        wrapper.findAll(".remove-member-button").at(1).trigger('click');

        expect(component.d_group!.member_names.length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        wrapper.findAll(".remove-member-button").at(1).trigger('click');

        expect(component.d_group!.member_names.length).toEqual(1);
        expect(wrapper.findAll('.member-name-input').length).toEqual(1);

        wrapper.findAll(".remove-member-button").at(0).trigger('click');

        expect(component.d_group!.member_names.length).toEqual(1);
        expect(wrapper.findAll('.member-name-input').length).toEqual(1);
    });

    test('bonus_submissions_remaining cannot be a negative number', async () => {
        let bonus_submissions_input = wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).find("#input");
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).vm;
        (<HTMLInputElement> bonus_submissions_input.element).value = "-4";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(component.edit_group_form_is_valid).toBe(false);
        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

    test('bonus_submissions_remaining cannot be empty or not a number', async () => {
        let bonus_submissions_input = wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).find("#input");
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).vm;
        (<HTMLInputElement> bonus_submissions_input.element).value = "";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);

        (<HTMLInputElement> bonus_submissions_input.element).value = "scranton";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(component.edit_group_form_is_valid).toBe(false);
        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

    test('Usernames of group members are trimmed before attempt to create group',
         async () => {
        let save_group_stub = sinon.stub(component.d_group, 'save');

        let group_members = [
            "   abernard@cornell.edu  ",
            "  amartin@cornell.edu",
            "kelly@cornell.edu   "
        ];

        let trimmed_group_members = [
            "abernard@cornell.edu",
            "amartin@cornell.edu",
            "kelly@cornell.edu"
        ];

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = group_members[0];
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = group_members[1];
        member_2_name_input.trigger('input');
        await component.$nextTick();

        let member_3_name_input = member_name_inputs.at(2);
        (<HTMLInputElement> member_3_name_input.element).value = group_members[2];
        member_3_name_input.trigger('input');
        await component.$nextTick();

        expect(component.edit_group_form_is_valid).toBe(true);
        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_group_stub.firstCall.thisValue.member_names).toEqual(trimmed_group_members);
    });

    test('Member name inputs that are blank are thrown out before save', async () => {
        let save_group_stub = sinon.stub(component.d_group, 'save');
        let group_members = [
            "    ",
            "  amartin@cornell.edu",
            " "
        ];

        let savable_group_members = [
            "amartin@cornell.edu"
        ];

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = group_members[0];
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = group_members[1];
        member_2_name_input.trigger('input');
        await component.$nextTick();

        let member_3_name_input = member_name_inputs.at(2);
        (<HTMLInputElement> member_3_name_input.element).value = group_members[2];
        member_3_name_input.trigger('input');
        await component.$nextTick();

        expect(component.edit_group_form_is_valid).toBe(true);
        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_group_stub.calledOnce);
        expect(save_group_stub.firstCall.thisValue.member_names).toEqual(savable_group_members);
    });

    test('When all member names are blank in save(), all names are thrown out' +
         ' and a single field with the allowed_guest_domain will replace them',
         async () => {
        let save_group_stub = sinon.stub(component.d_group, 'save');
        let group_members = [
            "    ",
            "    ",
            " "
        ];

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = group_members[0];
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = group_members[1];
        member_2_name_input.trigger('input');
        await component.$nextTick();

        let member_3_name_input = member_name_inputs.at(2);
        (<HTMLInputElement> member_3_name_input.element).value = group_members[2];
        member_3_name_input.trigger('input');
        await component.$nextTick();

        expect(component.edit_group_form_is_valid).toBe(true);
        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_group_stub.callCount).toEqual(0);
        expect(component.d_group.member_names.length).toEqual(1);
        expect(component.d_group.member_names[0]).toEqual(component.course.allowed_guest_domain);
    });

    test('When a member name field contains just the allowed guest domain, the ' +
         'attempt to save the group is unsuccessful and an error message is raised',
         async () => {
        let save_group_stub = sinon.stub(component.d_group, 'save');
        let group_members = [
            "jim@cornell.edu",
            component.course.allowed_guest_domain,
            component.course.allowed_guest_domain
        ];

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = group_members[0];
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = group_members[1];
        member_2_name_input.trigger('input');
        await component.$nextTick();

        let member_3_name_input = member_name_inputs.at(2);
        (<HTMLInputElement> member_3_name_input.element).value = group_members[2];
        member_3_name_input.trigger('input');
        await component.$nextTick();

        expect(component.edit_group_form_is_valid).toBe(true);
        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_group_stub.callCount).toEqual(0);
        expect(component.d_group.member_names.length).toEqual(3);
        expect(component.incomplete_input_present).toBe(true);
        expect(wrapper.findAll('.error-input').length).toEqual(2);
        expect(wrapper.findAll('.incomplete-input-msg').length).toEqual(2);
    });

    test('Clicking extension display opens datetime picker', () => {
        let extension_display = wrapper.find('#extension');
        let picker = <Wrapper<DatetimePicker>> wrapper.find({ref: 'extension_datetime_picker'});

        expect(picker.vm.d_is_open).toEqual(false);

        extension_display.trigger('click');
        expect(picker.vm.d_is_open).toEqual(true);
    });

    test('Revoking and granting extension', async () => {
        expect(component.d_group.extended_due_date).not.toBeNull();

        let revoke_button = wrapper.find('#revoke-extension');
        revoke_button.trigger('click');
        expect(component.d_group.extended_due_date).toBeNull();

        let picker = <Wrapper<DatetimePicker>> wrapper.find({ref: 'extension_datetime_picker'});
        picker.vm.toggle_visibility();
        expect(picker.vm.d_is_open).toEqual(true);

        let now = moment();
        picker.vm.set_date_and_time(now.format());
        picker.vm.update_time_selected();
        expect(component.d_group.extended_due_date).toEqual(now.format());
    });

    test('Group member must be enrolled in course - violates condition', async () => {
        let save_group_stub = sinon.stub(component.d_group, 'save');
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Error in \"members\": This project only accepts submissions " +
                             "from enrolled students."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        save_group_stub.returns(Promise.reject(axios_response_instance));

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "michael@cornell.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = "ryan@cornell.edu";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(save_group_stub.calledOnce);
    });

    test("When the prop 'group' changes in the parent component, d_group is updated and" +
         "incomplete_input_present is reset to false",
         async () => {
        wrapper.setData({incomplete_input_present: true});
        await component.$nextTick();

        expect(component.incomplete_input_present).toBe(true);

        let different_group = new Group({
            pk: 2,
            project: 2,
            extended_due_date: null,
            member_names: [
                "kelly@cornell.edu",
                "erin@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "11am"
         });

        await component.$nextTick();

        expect(component.d_group).toEqual(group);

        wrapper.setProps({group: different_group});
        await component.$nextTick();

        expect(component.d_group).toEqual(different_group);
        expect(component.incomplete_input_present).toBe(false);
    });
});
