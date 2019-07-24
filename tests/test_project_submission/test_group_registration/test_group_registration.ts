import { mount, Wrapper } from '@vue/test-utils';

import {
    Course,
    Group, GroupInvitation, HttpError,
    Project,
    Semester,
    UltimateSubmissionPolicy,
    User
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import Modal from '@/components/modal.vue';
import GroupRegistration from '@/components/project_submission/group_registration/group_registration.vue';

describe.only('GroupRegistration tests involving the created function', () => {
    let wrapper: Wrapper<GroupRegistration>;
    let component: GroupRegistration;
    let course: Course;
    let project: Project;
    let user: User;

    beforeEach(() => {
        project = new Project({
            pk: 44,
            name: "Project 200",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: false,
            guests_can_submit: true,
            min_group_size: 1,
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
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false
        });

        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        user = new User({
            pk: 3,
            username: "alexis@umich.edu",
            first_name: "Alexis",
            last_name: "Bledel",
            email: "RoryGilmore@umich.edu",
            is_superuser: true
        });

        sinon.stub(User, 'get_current').returns(Promise.resolve(user));
    });

    afterEach(() => {
        sinon.restore();
    });

    test('created - max group size === 1', async () => {
        let work_alone_stub = sinon.stub(Group, 'create_solo_group');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        project.max_group_size = 1;
        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(work_alone_stub.callCount).toEqual(1);
    });

    test('created - max group size !== 1', async () => {
        let work_alone_stub = sinon.stub(Group, 'create_solo_group');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(work_alone_stub.callCount).toEqual(0);
    });

    test('created - Project.disallow_group_registration is true', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        project.disallow_group_registration = true;

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.d_loading).toBe(false);
        expect(wrapper.findAll('#registration-closed').length).toEqual(1);
        expect(wrapper.findAll('#registration-open').length).toEqual(0);
    });

    test('created - user has not sent an invitation', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(wrapper.findAll('#registration-open').length).toEqual(1);
        expect(component.invitation_sent).toEqual(null);
    });

    test('created - user has sent an invitation', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: 15,
            invited_usernames: ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
        });
        sinon.stub(user, 'group_invitations_sent').returns(
            Promise.resolve([
                group_invitation_sent
            ])
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.d_loading).toBe(false);
        expect(wrapper.findAll('#registration-open').length).toEqual(1);
        expect(component.invitation_sent).toEqual(group_invitation_sent);
        expect(component.invitations_received.length).toEqual(0);
    });

    test('created - user has received an invitation', async () => {
        let group_invitation_received_1 = new GroupInvitation({
            pk: 1,
            invitation_creator: "laura@umich.edu",
            project: 15,
            invited_usernames: ["alexis@umich.edu", "george@umich.edu"],
            invitees_who_accepted: []
        });
        let group_invitation_received_2 = new GroupInvitation({
            pk: 2,
            invitation_creator: "linda@umich.edu",
            project: 15,
            invited_usernames: ["alexis@umich.edu", "liz@umich.edu"],
            invitees_who_accepted: ["liz@umich.edu"]
        });
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([
            group_invitation_received_1,
            group_invitation_received_2
        ]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(component.invitations_received.length).toEqual(2);
    });
});

describe.only('GroupRegistration tests', () => {
    let wrapper: Wrapper<GroupRegistration>;
    let component: GroupRegistration;
    let course: Course;
    let project: Project;
    let user: User;

    beforeEach(() => {
        project = new Project({
            pk: 44,
            name: "Project 200",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: false,
            guests_can_submit: true,
            min_group_size: 1,
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
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false
        });

        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        user = new User({
            pk: 3,
            username: "alexis@umich.edu",
            first_name: "Alexis",
            last_name: "Bledel",
            email: "RoryGilmore@umich.edu",
            is_superuser: true
        });

        sinon.stub(User, 'get_current').returns(Promise.resolve(user));
    });

    afterEach(() => {
        sinon.restore();
    });

    test('add_group_member', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;

        expect(component.users_to_invite.length).toEqual(0);

        component.add_group_member();
        await component.$nextTick();

        expect(component.users_to_invite.length).toEqual(1);
        expect(component.users_to_invite[0]).toEqual({
                id: 0,
                username: course.allowed_guest_domain
        });

        component.add_group_member();
        await component.$nextTick();

        expect(component.users_to_invite.length).toEqual(2);
        expect(component.users_to_invite[1]).toEqual({
            id: 1,
            username: course.allowed_guest_domain
        });
    });

    test('remove_group_member', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;

        for (let i = 0; i < 5; ++i) {
            component.add_group_member();
        }
        expect(component.users_to_invite.length).toEqual(5);
        expect(component.users_to_invite[0].id).toEqual(0);
        expect(component.users_to_invite[1].id).toEqual(1);
        expect(component.users_to_invite[2].id).toEqual(2);
        expect(component.users_to_invite[3].id).toEqual(3);
        expect(component.users_to_invite[4].id).toEqual(4);

        component.remove_group_member(3);
        expect(component.users_to_invite.length).toEqual(4);
        expect(component.users_to_invite[0].id).toEqual(0);
        expect(component.users_to_invite[1].id).toEqual(1);
        expect(component.users_to_invite[2].id).toEqual(2);
        expect(component.users_to_invite[3].id).toEqual(4);

        component.remove_group_member(0);
        expect(component.users_to_invite.length).toEqual(3);
        expect(component.users_to_invite[0].id).toEqual(1);
        expect(component.users_to_invite[1].id).toEqual(2);
        expect(component.users_to_invite[2].id).toEqual(4);

        component.remove_group_member(1);
        expect(component.users_to_invite.length).toEqual(2);
        expect(component.users_to_invite[0].id).toEqual(1);
        expect(component.users_to_invite[1].id).toEqual(4);

        component.remove_group_member(0);
        expect(component.users_to_invite.length).toEqual(1);
        expect(component.users_to_invite[0].id).toEqual(4);

        component.remove_group_member(0);
        expect(component.users_to_invite.length).toEqual(0);
    });

    test('work alone - cancel action in modal', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let confirm_working_alone_modal = <Modal> wrapper.find(
            {ref: 'confirm_working_alone_modal'}
        ).vm;

        expect(wrapper.findAll('#button-decision-container').length).toEqual(1);
        expect(confirm_working_alone_modal.is_open).toBe(false);

        wrapper.find('.work-alone-button').trigger('click');
        await component.$nextTick();

        expect(confirm_working_alone_modal.is_open).toBe(true);

        wrapper.find('.cancel-confirm-working-alone-button').trigger('click');
        await component.$nextTick();

        expect(confirm_working_alone_modal.is_open).toBe(false);
        expect(wrapper.findAll('#button-decision-container').length).toEqual(1);
    });

    test('work alone - confirm action in modal',  async () => {
        let work_alone_stub = sinon.stub(Group, 'create_solo_group').returns(Promise.resolve(
            new Group({
                pk: 100,
                project: project.pk,
                extended_due_date: "2019-04-18T15:26:06.965696Z",
                member_names: [
                    user.username,
                ],
                bonus_submissions_remaining: 0,
                late_days_used: {},
                num_submissions: 3,
                num_submits_towards_limit: 2,
                created_at: "9am",
                last_modified: "10am"
            })
        ));
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let confirm_working_alone_modal = <Modal> wrapper.find(
            {ref: 'confirm_working_alone_modal'}
        ).vm;

        expect(component.invitation_sent).toBeNull();
        expect(component.invitations_received.length).toEqual(0);
        expect(wrapper.findAll('#button-decision-container').length).toEqual(1);
        expect(confirm_working_alone_modal.is_open).toBe(false);

        wrapper.find('.work-alone-button').trigger('click');
        await component.$nextTick();

        expect(confirm_working_alone_modal.is_open).toBe(true);

        wrapper.find('.confirm-working-alone-button').trigger('click');
        await component.$nextTick();

        expect(work_alone_stub.callCount).toEqual(1);
        // Parent will be informed of the group created and remove the buttons ???
    });

    test('cancel invitation - cancel action in modal', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: 15,
            invited_usernames: ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
        });
        let reject_invitation_stub = sinon.stub(group_invitation_sent, 'reject');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([
            group_invitation_sent
        ]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let confirm_cancel_invitation_modal = <Modal> wrapper.find(
            {ref: 'cancel_group_invitation_modal'}
        ).vm;

        expect(confirm_cancel_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('.cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_cancel_invitation_modal.is_open).toBe(true);

        wrapper.find('.confirm-keep-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.callCount).toEqual(0);
        expect(confirm_cancel_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(group_invitation_sent);
    });

    test('cancel invitation - confirm action in modal', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: 15,
            invited_usernames: ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
        });
        let reject_invitation_stub = sinon.stub(group_invitation_sent, 'reject');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([
            group_invitation_sent
        ]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let confirm_cancel_invitation_modal = <Modal> wrapper.find(
            {ref: 'cancel_group_invitation_modal'}
        ).vm;

        expect(confirm_cancel_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('.cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_cancel_invitation_modal.is_open).toBe(true);

        wrapper.find('.confirm-cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(confirm_cancel_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(null);
    });

    test('send invitation - cancel action in modal', async () => {
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let send_group_invitation_modal = <Modal> wrapper.find(
            {ref: 'send_group_invitation_modal'}
        ).vm;

        expect(send_group_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(null);

        wrapper.find('.send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        wrapper.find('.cancel-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.callCount).toEqual(0);
        expect(send_group_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(null);
    });

    test('send invitation - successful', async () => {
        let group_invitation_created =  new GroupInvitation({
            pk: 2,
            invitation_creator: user.username,
            project: project.pk,
            invited_usernames: ["milo@umich.edu"],
            invitees_who_accepted: []
        });
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation').returns(
            Promise.resolve(group_invitation_created)
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let send_group_invitation_modal = <Modal> wrapper.find(
            {ref: 'send_group_invitation_modal'}
        ).vm;

        expect(send_group_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(null);

        wrapper.find('.send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        let member_name_inputs = wrapper.findAll('.member-name-input');
        expect(member_name_inputs.length).toEqual(1);

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "milo@umich.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('.confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_group_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(group_invitation_created);
        expect(wrapper.findAll('#button-decision-container').length).toEqual(0);
    });

    test('send invitation - invalid input present', async () => {
        let group_invitation_created =  new GroupInvitation({
            pk: 2,
            invitation_creator: user.username,
            project: project.pk,
            invited_usernames: ["milo@umich.edu"],
            invitees_who_accepted: []
        });
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation').returns(
            Promise.resolve(group_invitation_created)
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let send_group_invitation_modal = <Modal> wrapper.find(
            {ref: 'send_group_invitation_modal'}
        ).vm;

        expect(send_group_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(null);

        wrapper.find('.send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        let member_name_inputs = wrapper.findAll('.member-name-input');
        expect(member_name_inputs.length).toEqual(1);

        wrapper.find('.confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(false);
        expect(send_group_invitation_modal.is_open).toBe(true);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#button-decision-container').length).toEqual(1);
    });

    test('send invitation - unsuccessful', async () => {
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__:
                            "Error in 'invited_users': You cannot send an invitation to yourself."}
                )
            )
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let send_group_invitation_modal = <Modal> wrapper.find(
            {ref: 'send_group_invitation_modal'}
        ).vm;

        expect(send_group_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(null);

        wrapper.find('.send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        let member_name_inputs = wrapper.findAll('.member-name-input');
        expect(member_name_inputs.length).toEqual(1);

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = user.username;
        member_1_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('.confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_group_invitation_modal.is_open).toBe(true);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#button-decision-container').length).toEqual(1);
    });

    test('send invitation - fields reset every time modal is opened', async () => {
        let group_invitation_created =  new GroupInvitation({
            pk: 2,
            invitation_creator: user.username,
            project: project.pk,
            invited_usernames: ["milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: []
        });
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation').returns(
            Promise.resolve(group_invitation_created)
        );
        let reject_invitation_stub = sinon.stub(group_invitation_created, 'reject');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        let send_group_invitation_modal = <Modal> wrapper.find(
            {ref: 'send_group_invitation_modal'}
        ).vm;

        expect(component.invitation_sent).toEqual(null);

        wrapper.find('.send-group-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        let member_1_name_input = wrapper.findAll('.member-name-input').at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "milo";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = wrapper.findAll('.member-name-input').at(1);
        (<HTMLInputElement> member_2_name_input.element).value = "keiko";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('.confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.callCount).toEqual(1);
        expect(component.invitation_sent).toEqual(group_invitation_created);
        expect(wrapper.findAll('#button-decision-container').length).toEqual(0);

        wrapper.find('.cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.confirm-cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.callCount).toEqual(1);
        expect(component.invitation_sent).toEqual(null);

        wrapper.find('.send-group-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').at(0).text()).toEqual("");
        expect(wrapper.findAll('.member-name-input').at(1).text()).toEqual("");
    });
});
