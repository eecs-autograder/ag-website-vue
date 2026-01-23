import { Wrapper } from '@vue/test-utils';

import {
    Course,
    Group,
    HttpError,
    Project,
} from 'ag-client-typescript';
// @ts-ignore
import moment from 'moment-timezone';
import * as sinon from "sinon";

import DatetimePicker from "@/components/datetime/datetime_picker.vue";
import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
import { assert_not_null } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { set_validated_input_text, wait_until } from '@/tests/utils';


describe('EditSingleGroup tests', () => {
    let wrapper: Wrapper<EditSingleGroup>;
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
            extended_due_date: "2019-04-18T15:26:06Z",
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {"oscar@cornell.edu": 2},
        });


        wrapper = managed_mount(EditSingleGroup, {
            propsData: {
                course: course,
                project: project,
                group: group
            }
        });
    });

    test('Group members form v-model binding', () => {
        let edit_group_form
            = <Wrapper<GroupMembersForm>> wrapper.findComponent({ref: 'edit_group_form'});
        expect(edit_group_form.vm.state.value).toBe(wrapper.vm.state.member_names);

        let new_members = ['wa@luigi.net', 'spam@egg.net'];
        edit_group_form.vm.$emit('input', new_members);
        expect(wrapper.vm.state.group.member_names).toEqual(new_members);
    });

    test('bonus_submissions_remaining cannot be a negative number', async () => {
        const input = wrapper.findComponent({ ref: 'bonus_submissions_remaining_input' });
        await set_validated_input_text(input, "-4");

        let submit = wrapper.find('button[type="submit"]');
        expect(submit.attributes('disabled')).toBeDefined();

        await set_validated_input_text(input, "1");
        submit = wrapper.find('button[type="submit"]');
        expect(submit.attributes('disabled')).toBeUndefined();

        await set_validated_input_text(input, "-1");
        expect(submit.attributes('disabled')).toBeDefined();
    });

    test('bonus_submissions_remaining cannot be empty or not a number', async () => {
        // Find the validated input
        const input = wrapper.findComponent({ ref: 'bonus_submissions_remaining_input' });

        await set_validated_input_text(input, "1");
        let submit = wrapper.find('button[type="submit"]');
        expect(submit.attributes('disabled')).toBeUndefined();

        await set_validated_input_text(input, "");
        submit = wrapper.find('button[type="submit"]');
        expect(submit.attributes('disabled')).toBeDefined();

        await set_validated_input_text(input, "1");
        submit = wrapper.find('button[type="submit"]');
        expect(submit.attributes('disabled')).toBeUndefined();

        await set_validated_input_text(input, "spam");
        submit = wrapper.find('button[type="submit"]');
        expect(submit.attributes('disabled')).toBeDefined();
    });

    test('Clicking extension display opens datetime picker', () => {
        let extension_display = wrapper.find('[data-testid=extension]');
        let picker
            = <Wrapper<DatetimePicker>> wrapper.findComponent({ref: 'extension_datetime_picker'});

        expect(picker.vm.is_visible).toEqual(false);

        extension_display.trigger('click');
        expect(picker.vm.is_visible).toEqual(true);
    });

    test('Revoking and granting extension', async () => {
        expect(wrapper.vm.d_group?.extended_due_date).not.toBeNull();

        let revoke_button = wrapper.find('[data-testid=revoke_extension]');
        await revoke_button.trigger('click');
        expect(wrapper.vm.state.group?.extended_due_date).toBeNull();

        let picker
            = <Wrapper<DatetimePicker>> wrapper.findComponent({ref: 'extension_datetime_picker'});
        picker.vm.toggle_visibility();
        expect(picker.vm.is_visible).toEqual(true);

        let now = moment();
        picker.vm.set_date_and_time(now.format());
        picker.vm.update_time_selected();
        expect(moment(wrapper.vm.state.group?.extended_due_date).format()).toEqual(now.format());
    });

    test('API errors displayed on submit', async () => {
        assert_not_null(wrapper.vm.state.group);
        let save_group_stub = sinon.stub(wrapper.vm.state.group, 'save');
        save_group_stub.returns(Promise.reject(
            new HttpError(
                400,
                {__all__: "Error in \"members\": This project only accepts submissions "
                          + "from enrolled students."})
            )
        );

        await wrapper.findComponent({ref: 'edit_group_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.state.saving)).toBe(true);
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.state.api_errors.length).toBe(1);
        expect(save_group_stub.calledOnce);
    });

    test('Delete group', async () => {
        assert_not_null(wrapper.vm.state.group);
        let delete_group_stub = sinon.stub(wrapper.vm.state.group, 'pseudo_delete');
        wrapper.get('[data-testid=show_delete_modal_button]').trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.get('[data-testid=delete_group_button]').trigger('click');
        await wrapper.vm.$nextTick();
        expect(await wait_until(wrapper, w => !w.vm.state.deleting)).toBe(true);

        expect(wrapper.findComponent({ref: 'delete_group'}).exists()).toBe(false);
        expect(delete_group_stub.calledOnce).toBe(true);
    });

    test('Delete group API errors handled', async () => {
        assert_not_null(wrapper.vm.state.group);
        sinon.stub(wrapper.vm.state.group, 'pseudo_delete').rejects(new HttpError(403, ''));

        wrapper.get('[data-testid=show_delete_modal_button]').trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.get('[data-testid=delete_group_button]').trigger('click');
        await wrapper.vm.$nextTick();
        expect(await wait_until(wrapper, w => !w.vm.state.deleting)).toBe(true);
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'delete_group_api_errors'}).vm;
        expect(api_errors.state.api_errors.length).toBe(1);
    });

    test("When the prop 'group' changes in the parent component, d_group is updated", async () => {
        let different_group = data_ut.make_group(project.pk, 2, {
            member_names: [
                "kelly@cornell.edu",
                "erin@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
         });

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.state.group).toEqual(group);

        wrapper.setProps({group: different_group});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.state.group).toEqual(different_group);
    });
});
