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

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import GroupRegistration from '@/components/project_submission/group_registration/group_registration.vue';
import InvitationReceived from '@/components/project_submission/group_registration/invitation_received.vue';

describe('GroupRegistration tests', () => {
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

    test('created - user has sent an invitation for this project', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: project.pk,
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

    test('created - user has sent an invitation but not for this project', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: project.pk + 5,
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
        expect(component.invitation_sent).toEqual(null);
        expect(component.invitations_received.length).toEqual(0);
    });

    test('created - user has received an invitation', async () => {
        let group_invitation_received_1 = new GroupInvitation({
            pk: 1,
            invitation_creator: "laura@umich.edu",
            project: project.pk + 1,
            invited_usernames: ["alexis@umich.edu", "george@umich.edu"],
            invitees_who_accepted: []
        });
        let group_invitation_received_2 = new GroupInvitation({
            pk: 2,
            invitation_creator: "linda@umich.edu",
            project: project.pk,
            invited_usernames: ["alexis@umich.edu", "liz@umich.edu"],
            invitees_who_accepted: ["liz@umich.edu"]
        });
        let group_invitation_received_3 = new GroupInvitation({
            pk: 3,
            invitation_creator: "james@umich.edu",
            project: project.pk + 10,
            invited_usernames: ["alexis@umich.edu", "violet@umich.edu"],
            invitees_who_accepted: ["alexis@umich.edu"]
        });
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([
            group_invitation_received_1,
            group_invitation_received_2,
            group_invitation_received_3
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

        expect(component.invitations_received.length).toEqual(1);
        expect(component.invitations_received[0]).toEqual(group_invitation_received_2);
    });

    test('add_group_member', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        project.min_group_size = 1;
        project.max_group_size = 4;
        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.users_to_invite.length).toEqual(0);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.users_to_invite.length).toEqual(1);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(false);
        wrapper.find('.add-member-button').trigger('click');

        expect(component.users_to_invite.length).toEqual(2);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(false);
        wrapper.find('.add-member-button').trigger('click');

        expect(component.users_to_invite.length).toEqual(3);
        expect(component.users_to_invite.length === project.max_group_size - 1);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(true);

        for (let index = 0; index < component.users_to_invite.length; ++index) {
            expect(component.users_to_invite[index]).toEqual({
                id: index,
                username: course.allowed_guest_domain
            });
        }
    });

    test('removing a group member in the send_group_invitation_modal', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        project.min_group_size = 6;
        project.max_group_size = 6;
        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.users_to_invite.length).toEqual(5);
        expect(component.users_to_invite[0].id).toEqual(0);
        expect(component.users_to_invite[1].id).toEqual(1);
        expect(component.users_to_invite[2].id).toEqual(2);
        expect(component.users_to_invite[3].id).toEqual(3);
        expect(component.users_to_invite[4].id).toEqual(4);

        expect(wrapper.findAll('.remove-member-button').at(3).is(
            '[disabled]'
        )).toBe(false);
        wrapper.findAll('.remove-member-button').at(3).trigger('click');
        expect(component.users_to_invite.length).toEqual(4);
        expect(component.users_to_invite[0].id).toEqual(0);
        expect(component.users_to_invite[1].id).toEqual(1);
        expect(component.users_to_invite[2].id).toEqual(2);
        expect(component.users_to_invite[3].id).toEqual(4);

        expect(wrapper.findAll('.remove-member-button').at(0).is(
            '[disabled]'
        )).toBe(false);
        wrapper.findAll('.remove-member-button').at(0).trigger('click');
        expect(component.users_to_invite.length).toEqual(3);
        expect(component.users_to_invite[0].id).toEqual(1);
        expect(component.users_to_invite[1].id).toEqual(2);
        expect(component.users_to_invite[2].id).toEqual(4);

        expect(wrapper.findAll('.remove-member-button').at(1).is(
            '[disabled]'
        )).toBe(false);
        wrapper.findAll('.remove-member-button').at(1).trigger('click');
        expect(component.users_to_invite.length).toEqual(2);
        expect(component.users_to_invite[0].id).toEqual(1);
        expect(component.users_to_invite[1].id).toEqual(4);

        expect(wrapper.findAll('.remove-member-button').at(0).is(
            '[disabled]'
        )).toBe(false);
        wrapper.findAll('.remove-member-button').at(0).trigger('click');
        expect(component.users_to_invite.length).toEqual(1);
        expect(component.users_to_invite[0].id).toEqual(4);

        expect(wrapper.findAll('.remove-member-button').at(0).is(
            '[disabled]'
        )).toBe(true);
        expect(component.users_to_invite.length).toEqual(1);
    });

    test('if invitation_sent is not null, it is an invitation sent by the user for ' +
         'the current project',
         async () => {
        let invitation_sent_1 = new GroupInvitation({
            pk: 1,
            invitation_creator: user.username,
            project: project.pk + 1,
            invited_usernames: ["liz@umich.edu", "yanic@umich.edu"],
            invitees_who_accepted: ["liz@umich.edu"]
        });
        let invitation_sent_2 = new GroupInvitation({
            pk: 2,
            invitation_creator: user.username,
            project: project.pk,
            invited_usernames: ["edward@umich.edu", "kelly@umich.edu"],
            invitees_who_accepted: ["kelly@umich.edu"]
        });
        let invitation_sent_3 = new GroupInvitation({
            pk: 3,
            invitation_creator: user.username,
            project: project.pk + 2,
            invited_usernames: ["milo@umich.edu"],
            invitees_who_accepted: [""]
        });
        let invitation_sent_4 = new GroupInvitation({
            pk: 4,
            invitation_creator: user.username,
            project: project.pk + 3,
            invited_usernames: ["melissa@umich.edu"],
            invitees_who_accepted: [""]
        });
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([
            invitation_sent_1,
            invitation_sent_2,
            invitation_sent_3,
            invitation_sent_4
        ]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.invitation_sent).toEqual(invitation_sent_2);
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

        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);
        expect(confirm_working_alone_modal.is_open).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await component.$nextTick();

        expect(confirm_working_alone_modal.is_open).toBe(true);

        wrapper.find('#cancel-confirm-working-alone-button').trigger('click');
        await component.$nextTick();

        expect(confirm_working_alone_modal.is_open).toBe(false);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);
    });

    test('work alone - confirm action in modal - successful',  async () => {
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
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);
        expect(confirm_working_alone_modal.is_open).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await component.$nextTick();

        expect(confirm_working_alone_modal.is_open).toBe(true);

        wrapper.find('#confirm-working-alone-button').trigger('click');
        await component.$nextTick();

        expect(work_alone_stub.callCount).toEqual(1);
        expect(work_alone_stub.firstCall.calledWith(project.pk)).toBe(true);
    });

    test('work alone - confirm action in modal - unsuccessful',  async () => {
        let work_alone_stub = sinon.stub(Group, 'create_solo_group').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Error: You cannot work alone"}
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

        let confirm_working_alone_modal = <Modal> wrapper.find(
            {ref: 'confirm_working_alone_modal'}
        ).vm;

        expect(component.invitation_sent).toBeNull();
        expect(component.invitations_received.length).toEqual(0);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);
        expect(confirm_working_alone_modal.is_open).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await component.$nextTick();

        expect(confirm_working_alone_modal.is_open).toBe(true);

        wrapper.find('#confirm-working-alone-button').trigger('click');
        await component.$nextTick();

        expect(work_alone_stub.callCount).toEqual(1);
        expect(confirm_working_alone_modal.is_open).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'work_alone_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('cancel invitation - cancel action in modal', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: project.pk,
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

        wrapper.find('#cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_cancel_invitation_modal.is_open).toBe(true);

        wrapper.find('#confirm-keep-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.callCount).toEqual(0);
        expect(confirm_cancel_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(group_invitation_sent);
    });

    test('cancel invitation - confirm action in modal - successful', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: project.pk,
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

        wrapper.find('#cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_cancel_invitation_modal.is_open).toBe(true);

        wrapper.find('#confirm-cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(confirm_cancel_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(null);
    });

    test('cancel invitation - confirm action in modal - unsuccessful', async () => {
        let group_invitation_sent = new GroupInvitation({
            pk: 1,
            invitation_creator: "alexis@umich.edu",
            project: project.pk,
            invited_usernames: ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
        });
        let reject_invitation_stub = sinon.stub(group_invitation_sent, 'reject').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Error: You cannot cancel this invitation."}
                )
            )
        );
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

        wrapper.find('#cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_cancel_invitation_modal.is_open).toBe(true);

        wrapper.find('#confirm-cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(confirm_cancel_invitation_modal.is_open).toBe(true);
        expect(component.invitation_sent).toEqual(group_invitation_sent);

        let api_errors = <APIErrors> wrapper.find({ref: 'cancel_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
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

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        wrapper.find('#cancel-send-invitation-button').trigger('click');
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

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        let member_name_inputs = wrapper.findAll('.member-name-input');
        expect(member_name_inputs.length).toEqual(1);

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "milo@umich.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('#confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_invitation_stub.firstCall.calledWith(project.pk, ["milo@umich.edu"])).toBe(
            true
        );
        expect(send_group_invitation_modal.is_open).toBe(false);
        expect(component.invitation_sent).toEqual(group_invitation_created);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(0);
    });

    test('send invitation - incomplete input present', async () => {
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
        expect(component.incomplete_input_present).toBe(false);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        let member_name_inputs = wrapper.findAll('.member-name-input');
        expect(member_name_inputs.length).toEqual(1);

        wrapper.find('#confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(false);
        expect(send_group_invitation_modal.is_open).toBe(true);
        expect(component.incomplete_input_present).toBe(true);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);
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

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_group_invitation_modal.is_open).toBe(true);

        let member_name_inputs = wrapper.findAll('.member-name-input');
        expect(member_name_inputs.length).toEqual(1);

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = user.username;
        member_1_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('#confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_invitation_stub.firstCall.calledWith(project.pk, [user.username])).toBe(true);
        expect(send_group_invitation_modal.is_open).toBe(true);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);

        let api_errors = <APIErrors> wrapper.find({ref: 'send_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('group member inputs are reset whenever the send_group_invitation_modal is opened' +
         '- after successful submission',
         async () => {
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

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        let member_1_name_input = wrapper.findAll('.member-name-input').at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "milo@umich.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = wrapper.findAll('.member-name-input').at(1);
        (<HTMLInputElement> member_2_name_input.element).value = "keiko@umich.edu";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('#confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_invitation_stub.firstCall.calledWith(
            project.pk, ["milo@umich.edu", "keiko@umich.edu"]
        )).toBe(true);
        expect(component.invitation_sent).toEqual(group_invitation_created);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(0);

        wrapper.find('#cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('#confirm-cancel-sent-invitation-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(component.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.incomplete_input_present).toBe(false);

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').at(0).text()).toEqual("");
        expect(wrapper.findAll('.member-name-input').at(1).text()).toEqual("");
    });

    test('group member inputs are reset whenever the send_group_invitation_modal is opened' +
         '- after canceling during the process of creating the invitation',
         async () => {
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

        expect(component.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        let member_1_name_input = wrapper.findAll('.member-name-input').at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "milo@umich.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = wrapper.findAll('.member-name-input').at(1);
        (<HTMLInputElement> member_2_name_input.element).value = "keiko@umich.edu";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('#cancel-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.callCount).toEqual(0);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.incomplete_input_present).toBe(false);

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').at(0).text()).toEqual("");
        expect(wrapper.findAll('.member-name-input').at(1).text()).toEqual("");
    });

    test('group member inputs are reset whenever the send_group_invitation_modal is opened' +
         '- after clicking outside of the modal when creating the invitation',
         async () => {
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

        expect(component.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        let member_1_name_input = wrapper.findAll('.member-name-input').at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "milo";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('#modal-mask').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.callCount).toEqual(0);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.incomplete_input_present).toBe(false);

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').at(0).text()).toEqual("");
        expect(wrapper.findAll('.member-name-input').at(1).text()).toEqual("");
    });

    test('group member inputs are reset whenever the send_group_invitation_modal is opened' +
         '- after an unsuccessful submit',
         async () => {
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__:
                            "Error in 'invited_users': Groups with any staff users must consist " +
                            "of only staff users" }
                )
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

        expect(component.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        let member_1_name_input = wrapper.findAll('.member-name-input').at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "milo@umich.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = wrapper.findAll('.member-name-input').at(1);
        (<HTMLInputElement> member_2_name_input.element).value = "michael@umich.edu";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('#confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);

        wrapper.find('#modal-mask').trigger('click');
        await component.$nextTick();

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.incomplete_input_present).toBe(false);

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').at(0).text()).toEqual("");
        expect(wrapper.findAll('.member-name-input').at(1).text()).toEqual("");
    });


    test('group member inputs are reset whenever the send_group_invitation_modal is opened' +
        '- after trying to submit with incomplete input present',
         async () => {
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

        expect(component.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        wrapper.find('#confirm-send-invitation-button').trigger('click');
        await component.$nextTick();

        expect(send_invitation_stub.callCount).toEqual(0);
        expect(component.incomplete_input_present).toBe(true);
        expect(component.invitation_sent).toEqual(null);
        expect(wrapper.findAll('#group-registration-options').length).toEqual(1);

        wrapper.find('#modal-mask').trigger('click');
        await component.$nextTick();

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.incomplete_input_present).toBe(false);

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').at(0).text()).toEqual("");
        expect(wrapper.findAll('.member-name-input').at(1).text()).toEqual("");
    });

    test('If the Project.max_group_size === Project.min_group_size, ' +
         'Project.min_group_size - 1 group member inputs are displayed when the ' +
         'send_group_invitation_modal is opened',
         async () => {
         sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
         sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
         project.min_group_size = 5;
         project.max_group_size = 5;

         wrapper = mount(GroupRegistration, {
             propsData: {
                 project: project,
                 course: course
             }
         });
         component = wrapper.vm;
         await component.$nextTick();

         wrapper.find('#send-group-invitation-button').trigger('click');
         await component.$nextTick();

         expect(wrapper.findAll('.member-name-input').length).toEqual(4);
    });

    test('If the Project.max_group_size !== Project.min_group_size, ' +
         'Project.min_group_size - 1 group member inputs are displayed when the ' +
         'send_group_invitation_modal is opened',
         async () => {
         sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
         sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
         project.min_group_size = 3;
         project.max_group_size = 5;

         wrapper = mount(GroupRegistration, {
             propsData: {
                 project: project,
                 course: course
             }
         });
         component = wrapper.vm;
         await component.$nextTick();

         wrapper.find('#send-group-invitation-button').trigger('click');
         await component.$nextTick();

         expect(wrapper.findAll('.member-name-input').length).toEqual(2);
    });

    test('If the Project.max_group_size !== Project.min_group_size, & ' +
         'Project.min_group_size === 1, 1 group member input is displayed when the ' +
         'send_group_invitation_modal is opened',
         async () => {
         sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
         sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
         project.min_group_size = 1;
         project.max_group_size = 5;

         wrapper = mount(GroupRegistration, {
             propsData: {
                 project: project,
                 course: course
             }
         });
         component = wrapper.vm;
         await component.$nextTick();

         wrapper.find('#send-group-invitation-button').trigger('click');
         await component.$nextTick();

         expect(wrapper.findAll('.member-name-input').length).toEqual(1);
    });

    test('The number of group member inputs cannot exceed Project.max_group_size - 1 (to' +
         'account for the creator of the group)',
         async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        project.min_group_size = 3;
        project.max_group_size = 5;

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('#send-group-invitation-button').trigger('click');
        await component.$nextTick();

        expect(component.project.max_group_size).toEqual(5);
        expect(wrapper.findAll('.member-name-input').length).toEqual(2);
        expect(component.users_to_invite.length).toEqual(2);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(false);

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(3);
        expect(component.users_to_invite.length).toEqual(3);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(false);

        wrapper.find('.add-member-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.findAll('.member-name-input').length).toEqual(4);
        expect(component.users_to_invite.length).toEqual(4);
        expect(wrapper.find('.add-member-button').is('[disabled]')).toBe(true);
    });

    test('Rejecting a group invitation', async () => {
        project.max_group_size = 4;
        let invitation_received_1 = new GroupInvitation({
            pk: 1,
            invitation_creator: "melissa@umich.edu",
            project: project.pk,
            invited_usernames: ["alexis@umich.edu", "liz@umich.edu", "yanic@umich.edu"],
            invitees_who_accepted: ["liz@umich.edu", "yanic@umich.edu"]
        });
        let invitation_received_2 = new GroupInvitation({
            pk: 2,
            invitation_creator: "lauren@umich.edu",
            project: project.pk,
            invited_usernames: ["alexis@umich.edu", "edward@umich.edu", "kelly@umich.edu"],
            invitees_who_accepted: ["kelly@umich.edu"]
        });
        let invitation_received_3 = new GroupInvitation({
            pk: 3,
            invitation_creator: "scott@umich.edu",
            project: project.pk,
            invited_usernames: ["alexis@umich.edu", "milo@umich.edu"],
            invitees_who_accepted: [""]
        });

        let invitation_received_4 = new GroupInvitation({
            pk: 4,
            invitation_creator: "liza@umich.edu",
            project: project.pk,
            invited_usernames: ["alexis@umich.edu"],
            invitees_who_accepted: [""]
        });

        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([
            invitation_received_1,
            invitation_received_2,
            invitation_received_3,
            invitation_received_4
        ]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
        await component.$nextTick();
        // this second await needs to be here for the invitation_received component to render
        await component.$nextTick();

        expect(wrapper.findAll({ref: 'invitation_received'}).length).toEqual(4);
        expect(component.invitations_received.length).toEqual(4);
        expect(component.invitations_received[0]).toEqual(invitation_received_1);
        expect(component.invitations_received[1]).toEqual(invitation_received_2);
        expect(component.invitations_received[2]).toEqual(invitation_received_3);
        expect(component.invitations_received[3]).toEqual(invitation_received_4);

        let invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(0);
        let invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await component.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await component.$nextTick();

        expect(component.invitations_received.length).toEqual(3);
        expect(component.invitations_received[0]).toEqual(invitation_received_2);
        expect(component.invitations_received[1]).toEqual(invitation_received_3);
        expect(component.invitations_received[2]).toEqual(invitation_received_4);

        invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(1);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await component.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await component.$nextTick();

        expect(component.invitations_received.length).toEqual(2);
        expect(component.invitations_received[0]).toEqual(invitation_received_2);
        expect(component.invitations_received[1]).toEqual(invitation_received_4);

        invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(1);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await component.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await component.$nextTick();

        expect(component.invitations_received.length).toEqual(1);
        expect(component.invitations_received[0]).toEqual(invitation_received_2);

        invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(0);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await component.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await component.$nextTick();

        expect(component.invitations_received.length).toEqual(0);
    });
});
