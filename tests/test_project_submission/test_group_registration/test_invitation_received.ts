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

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
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
                value: invitation,
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('reject an invitation - cancel action in modal', async () => {
        expect(component.d_invitation!).toEqual(invitation);
        expect(component.user).toEqual(user);
        expect(component.d_loading).toBe(false);
        let confirm_reject_modal = <Modal> wrapper.find({ref: 'confirm_reject_modal'}).vm;
        expect(confirm_reject_modal.is_open).toBe(false);

        wrapper.find('.reject-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_reject_modal.is_open).toBe(true);

        wrapper.find('.cancel-reject-button').trigger('click');
        await component.$nextTick();

        expect(confirm_reject_modal.is_open).toBe(false);
    });

    test('reject an invitation - confirm action in modal - successful', async () => {
        let reject_invitation_stub = sinon.stub(component.d_invitation!, 'reject');
        let confirm_reject_modal = <Modal> wrapper.find({ref: 'confirm_reject_modal'}).vm;
        expect(confirm_reject_modal.is_open).toBe(false);

        wrapper.find('.reject-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_reject_modal.is_open).toBe(true);

        wrapper.find('.confirm-reject-button').trigger('click');
        await component.$nextTick();

        expect(reject_invitation_stub.calledOnce);
    });

    test('reject an invitation - confirm action in modal - unsuccessful', async () => {
        let reject_invitation_stub = sinon.stub(component.d_invitation!, 'reject').returns(
            Promise.reject(
                new HttpError(400, {
                    __all__: "Sorry, you can't reject this invitation at the moment."
                })
            )
        );
        let confirm_reject_modal = <Modal> wrapper.find({ref: 'confirm_reject_modal'}).vm;
        expect(confirm_reject_modal.is_open).toBe(false);

        wrapper.find('.reject-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_reject_modal.is_open).toBe(true);

        wrapper.find('.confirm-reject-button').trigger('click');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'reject_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(reject_invitation_stub.calledOnce);
    });

    test('already_accepted', async () => {
        let updated_invitation = new GroupInvitation({
            pk: 1,
            invitation_creator: "sean@umich.edu",
            project: 15,
            invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "alexis@umich.edu"]
        });
        expect(component.d_invitation!.invitees_who_accepted).not.toContain(user.username);
        expect(component.already_accepted).toBe(false);
        expect(wrapper.find('.accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.setProps({value: updated_invitation});
        await component.$nextTick();

        expect(component.d_invitation!.invitees_who_accepted).toContain(user.username);
        expect(component.already_accepted).toBe(true);
        expect(wrapper.find('.accept-invitation-button').is('[disabled]')).toBe(true);
    });

    test('accept an invitation - cancel action in modal', async () => {
        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.cancel-accept-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(false);
    });

    test('accept an invitation - confirm action in modal - successful ' +
         '- & not the last person in the group to accept the invite',
         async () => {
        let accept_invitation_stub = sinon.stub(component.d_invitation!, 'accept').returns(
            Promise.resolve(null)
        );
        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.confirm-accept-button').trigger('click');
        await component.$nextTick();
        await component.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(confirm_accept_modal.is_open).toBe(false);
    });

    test('accept an invitation - confirm action in modal - successful ' +
         '& last person in group to accept invitation',
         async () => {
        let group_created = new Group({
            pk: 1,
            project: 15,
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                user.username,
                "keiko@umich.edu",
                "milo@umich.edu",
                "sean@umich.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        wrapper.setProps({invitation: new GroupInvitation({
                pk: 1,
                invitation_creator: "sean@umich.edu",
                project: 15,
                invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
                invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
            })
        });

        let accept_invitation_stub = sinon.stub(component.d_invitation!, 'accept').returns(
            Promise.resolve(group_created)
        );
        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.confirm-accept-button').trigger('click');
        await component.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(confirm_accept_modal.is_open).toBe(true);
    });

    test('accept an invitation - confirm action in modal - unsuccessful', async () => {
        let accept_invitation_stub = sinon.stub(component.d_invitation!, 'accept').returns(
            Promise.reject(
                new HttpError(400, {
                    __all__: "Already accepted invitation."
                })
            )
        );

        let confirm_accept_modal = <Modal> wrapper.find({ref: 'confirm_accept_modal'}).vm;
        expect(confirm_accept_modal.is_open).toBe(false);
        expect(wrapper.find('.accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('.accept-invitation-button').trigger('click');
        await component.$nextTick();

        expect(confirm_accept_modal.is_open).toBe(true);

        wrapper.find('.confirm-accept-button').trigger('click');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'accept_invitation_api_errors'}).vm;
        expect(confirm_accept_modal.is_open).toBe(true);
        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('prospective_group_members', async () => {
        expect(component.d_invitation!.invited_usernames).toEqual([
            "alexis@umich.edu",
            "milo@umich.edu",
            "keiko@umich.edu"
        ]);
        expect(component.user!.username).toEqual("alexis@umich.edu");
        expect(component.d_invitation!.invitation_creator).toEqual("sean@umich.edu");
        expect(component.other_group_members).toEqual([
            invitation.invitation_creator,
            "milo@umich.edu",
            "keiko@umich.edu"
        ]);
    });

    test('Members who have already accepted', async () => {
        expect(component.d_invitation!.invitees_who_accepted.length).toEqual(1);
        expect(component.d_invitation!.invitees_who_accepted).toContain("milo@umich.edu");

        let members_who_have_accepted = wrapper.findAll('.member-who-has-accepted');
        expect(members_who_have_accepted.length).toEqual(1);
        expect(members_who_have_accepted.at(0).text()).toEqual("milo@umich.edu");
    });

    test('value Watcher', async () => {
        let updated_invitation = new GroupInvitation({
            pk: 1,
            invitation_creator: "sean@umich.edu",
            project: 15,
            invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
        });

        expect(component.d_invitation).toEqual(invitation);

        wrapper.setProps({value: updated_invitation});
        await component.$nextTick();

        expect(component.d_invitation).toEqual(updated_invitation);
    });

});
