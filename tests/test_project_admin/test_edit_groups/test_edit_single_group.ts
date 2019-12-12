import { config, mount, Wrapper } from '@vue/test-utils';

import {
    Course,
    Group,
    HttpError,
    Project,
} from 'ag-client-typescript';
// @ts-ignore
import moment from 'moment';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import GroupMembersForm from '@/components/group_members_form.vue';
import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
import ValidatedInput from '@/components/validated_input.vue';

import * as data_ut from '@/tests/data_utils';

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
        course = data_ut.make_course({allowed_guest_domain: '@cornell.edu'});
        project = data_ut.make_project(course.pk, {
            min_group_size: 2,
            max_group_size: 3,
        });

        group = data_ut.make_group(project.pk, 2, {
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {"oscar@cornell.edu": 2},
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

    test('Group members form v-model binding', () => {
        let edit_group_form = <Wrapper<GroupMembersForm>> wrapper.find({ref: 'edit_group_form'});
        expect(edit_group_form.vm.value).toBe(wrapper.vm.d_group.member_names);

        let new_members = ['wa@luigi.net', 'spam@egg.net'];
        edit_group_form.vm.$emit('input', new_members);
        expect(wrapper.vm.d_group.member_names).toEqual(new_members);
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

    test('Clicking extension display opens datetime picker', () => {
        let extension_display = wrapper.find('#extension');
        let picker = <Wrapper<DatetimePicker>> wrapper.find({ref: 'extension_datetime_picker'});

        expect(picker.vm.is_visible).toEqual(false);

        extension_display.trigger('click');
        expect(picker.vm.is_visible).toEqual(true);
    });

    test('Revoking and granting extension', async () => {
        expect(component.d_group.extended_due_date).not.toBeNull();

        let revoke_button = wrapper.find('#revoke-extension');
        revoke_button.trigger('click');
        expect(component.d_group.extended_due_date).toBeNull();

        let picker = <Wrapper<DatetimePicker>> wrapper.find({ref: 'extension_datetime_picker'});
        picker.vm.toggle_visibility();
        expect(picker.vm.is_visible).toEqual(true);

        let now = moment();
        picker.vm.set_date_and_time(now.format());
        picker.vm.update_time_selected();
        expect(component.d_group.extended_due_date).toEqual(now.format());
    });

    test('API errors displayed on submit', async () => {
        let save_group_stub = sinon.stub(component.d_group, 'save');
        save_group_stub.returns(Promise.reject(
            new HttpError(
                400,
                {__all__: "Error in \"members\": This project only accepts submissions "
                          + "from enrolled students."})
            )
        );

        wrapper.find({ref: 'edit_group_form'}).trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(save_group_stub.calledOnce);
    });

    test("When the prop 'group' changes in the parent component, d_group is updated", async () => {
        let different_group = data_ut.make_group(project.pk, 2, {
            member_names: [
                "kelly@cornell.edu",
                "erin@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
         });

        await component.$nextTick();

        expect(component.d_group).toEqual(group);

        wrapper.setProps({group: different_group});
        await component.$nextTick();

        expect(component.d_group).toEqual(different_group);
    });
});
