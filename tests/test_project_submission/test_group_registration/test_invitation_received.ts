import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import { mount, Wrapper } from '@vue/test-utils';

import {
    Group,
    GroupInvitation,
    HttpError,
    Project,
    UltimateSubmissionPolicy,
    User
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import InvitationReceived from '@/components/project_submission/group_registration/invitation_received.vue';

describe('InvitationReceived tests', () => {
    let wrapper: Wrapper<InvitationReceived>;
    let component: InvitationReceived;
    let user: User;
    let invitation: GroupInvitation;
    let project: Project;

    beforeEach(() => {

        invitation = new GroupInvitation({
            pk: 1,
            invitation_creator: "sean@umich.edu",
            project: 15,
            invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu"]
        });

        project = new Project({
            pk: 15,
            name: "Project 100",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
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

        user = new User({
            pk: 3,
            username: "alexis@umich.edu",
            first_name: "Alexis",
            last_name: "Bledel",
            email: "RoryGilmore@umich.edu",
            is_superuser: true
        });

        sinon.stub(User, 'get_current').returns(Promise.resolve(user));

        wrapper = mount(InvitationReceived, {
            propsData: {
                invitation: invitation,
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('reject an invitation - cancel action in modal', async () => {
        expect(component.invitation).toEqual(invitation);
        expect(component.user).toEqual(user);
        expect(component.d_loading).toBe(false);
        let confirm_reject_modal = <Modal> wrapper.find({ref: 'confirm_reject_modal'}).vm;
        expect(confirm_reject_modal.is_open).toBe(false);

        wrapper.find('.reject-invite-button').trigger('click');
        await component.$nextTick();

        expect(confirm_reject_modal.is_open).toBe(true);

        wrapper.find('.cancel-reject-button').trigger('click');
        await component.$nextTick();

        expect(confirm_reject_modal.is_open).toBe(false);
    });

    test('reject an invitation - confirm action in modal', async () => {
        let reject_invitation_stub = sinon.stub(component.d_invitation, 'reject');
        let confirm_reject_modal = <Modal> wrapper.find({ref: 'confirm_reject_modal'}).vm;
        expect(confirm_reject_modal.is_open).toBe(false);

        wrapper.find('.reject-invite-button').trigger('click');
        await component.$nextTick();

        expect(confirm_reject_modal.is_open).toBe(true);

        wrapper.find('.confirm-reject-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.calledOnce);
    });

    test('already_accepted', async () => {
        expect(component.invitation.invitees_who_accepted).not.toContain(user.username);
        expect(component.already_accepted).toBe(false);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(false);

        wrapper.setProps({invitation: new GroupInvitation({
                pk: 1,
                invitation_creator: "sean@umich.edu",
                project: 15,
                invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
                invitees_who_accepted: ["milo@umich.edu", "alexis@umich.edu"]
            })
        });

        expect(component.invitation.invitees_who_accepted).toContain(user.username);
        expect(component.already_accepted).toBe(true);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(true);
    });

    test('accept an invitation - cancel action in modal', async () => {
        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invite-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.cancel-accept-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(false);
    });

    test.skip('accept an invitation - confirm action in modal - successful - & not the last person ' +
         'in the group to accept the invite',
         async () => {
        let accept_invitation_stub = sinon.stub(component.d_invitation, 'accept');
        let create_group_stub = sinon.stub(Group, 'create');
        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invite-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.confirm-accept-button').trigger('click');
        await component.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(create_group_stub.callCount).toEqual(0);
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(true);

        fail();
    });

    test.only('accept an invitation - confirm action in modal - successful ' +
         '& last person in group to accept invitation',
         async () => {
        wrapper.setProps({invitation: new GroupInvitation({
                pk: 1,
                invitation_creator: "sean@umich.edu",
                project: 15,
                invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
                invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
            })
        });

        let accept_invitation_stub = sinon.stub(component.d_invitation, 'accept');
        let create_group_stub = sinon.stub(Group, 'create');
        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invite-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.confirm-accept-button').trigger('click');
        await component.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(create_group_stub.callCount).toEqual(1);
    });

    test('accept an invitation - confirm action in modal - unsuccessful', async () => {
        let accept_invitation_stub = sinon.stub(component.d_invitation, 'accept').returns(
            Promise.reject(
                new HttpError(400, {
                    __all__: "Already accepted invitation."
                })
            )
        );

        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invite-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invite-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.confirm-accept-button').trigger('click');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(confirm_accept_modal.is_open).toBe(true);
        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('prospective_group_members', async () => {
        fail();

    });

    test('Members who have already accepted', async () => {
        fail();

    });

    test('invitation Watcher', async () => {
        fail();
    });

});
