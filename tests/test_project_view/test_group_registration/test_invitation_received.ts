import { mount, Wrapper } from '@vue/test-utils';

import {
    Group,
    GroupInvitation,
    HttpError,
    Project,
    User
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import { GlobalData } from '@/App.vue';
import APIErrors from '@/components/api_errors.vue';
import InvitationReceived from '@/components/project_view/group_registration/invitation_received.vue';

import { make_course, make_project } from '@/tests/data_utils';

describe('InvitationReceived tests', () => {
    let wrapper: Wrapper<InvitationReceived>;
    let user: User;
    let invitation: GroupInvitation;
    let project: Project;

    beforeEach(() => {

        project = make_project(make_course().pk);

        invitation = new GroupInvitation({
            pk: 1,
            invitation_creator: "sean@umich.edu",
            project: project.pk,
            invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu"]
        });

        user = new User({
            pk: 3,
            username: "alexis@umich.edu",
            first_name: "Alexis",
            last_name: "Bledel",
            email: "RoryGilmore@umich.edu",
            is_superuser: true
        });

        let globals = new GlobalData();
        globals.current_user = user;
        wrapper = mount(InvitationReceived, {
            propsData: {
                value: invitation,
                project: project
            },
            provide: {
                globals: globals
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    test('reject an invitation - cancel action in modal', async () => {
        expect(wrapper.vm.d_invitation!).toEqual(invitation);
        expect(wrapper.vm.d_globals.current_user).toEqual(user);
        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);

        wrapper.find('#reject-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);

        wrapper.find('#cancel-reject-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);
    });

    test('reject an invitation - confirm action in modal - successful', async () => {
        let reject_invitation_stub = sinon.stub(wrapper.vm.d_invitation!, 'reject');
        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);

        wrapper.find('#reject-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);

        wrapper.find('#confirm-reject-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(reject_invitation_stub.calledOnce);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);
    });

    test('reject an invitation - confirm action in modal - unsuccessful', async () => {
        let reject_invitation_stub = sinon.stub(wrapper.vm.d_invitation!, 'reject').returns(
            Promise.reject(
                new HttpError(400, {
                    __all__: "Sorry, you can't reject this invitation at the moment."
                })
            )
        );
        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);

        wrapper.find('#reject-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);

        wrapper.find('#confirm-reject-button').trigger('click');
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'reject_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(reject_invitation_stub.calledOnce);
        expect(wrapper.find({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);
    });

    test('already_accepted', async () => {
        let updated_invitation = new GroupInvitation({
            pk: 1,
            invitation_creator: "sean@umich.edu",
            project: 15,
            invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "alexis@umich.edu"]
        });
        expect(wrapper.vm.d_invitation!.invitees_who_accepted).not.toContain(user.username);
        expect(wrapper.vm.already_accepted).toBe(false);
        expect(wrapper.find('#accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.setProps({value: updated_invitation});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_invitation!.invitees_who_accepted).toContain(user.username);
        expect(wrapper.vm.already_accepted).toBe(true);
        expect(wrapper.find('#accept-invitation-button').is('[disabled]')).toBe(true);
    });

    test('accept an invitation - cancel action in modal', async () => {
        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
        expect(wrapper.find('#accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('#accept-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);

        wrapper.find('#cancel-accept-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
    });

    test('accept an invitation - confirm action in modal - successful ' +
         '- & not the last person in the group to accept the invite',
         async () => {
        let accept_invitation_stub = sinon.stub(wrapper.vm.d_invitation!, 'accept').returns(
            Promise.resolve(null)
        );
        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);

        expect(wrapper.find('#accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('#accept-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);


        wrapper.find('#confirm-accept-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
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

        let accept_invitation_stub = sinon.stub(
            wrapper.vm.d_invitation!, 'accept'
        ).callsFake(() => {
            Group.notify_group_created(group_created);
            return Promise.resolve(group_created);
        });
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.find('#accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('#accept-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);
        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(true);

        wrapper.find('#confirm-accept-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(false);
    });

    test('accept an invitation - confirm action in modal - unsuccessful', async () => {
        let accept_invitation_stub = sinon.stub(wrapper.vm.d_invitation!, 'accept').returns(
            Promise.reject(
                new HttpError(400, {
                    __all__: "Already accepted invitation."
                })
            )
        );

        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);

        expect(wrapper.find('#accept-invitation-button').is('[disabled]')).toBe(false);

        wrapper.find('#accept-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);

        wrapper.find('#confirm-accept-button').trigger('click');
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'accept_invitation_api_errors'}).vm;
        expect(wrapper.find({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);
        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('prospective_group_members', async () => {
        expect(wrapper.vm.d_invitation!.invited_usernames).toEqual([
            "alexis@umich.edu",
            "milo@umich.edu",
            "keiko@umich.edu"
        ]);
        expect(wrapper.vm.d_globals.current_user.username).toEqual("alexis@umich.edu");
        expect(wrapper.vm.d_invitation!.invitation_creator).toEqual("sean@umich.edu");
        expect(wrapper.vm.other_group_members).toEqual([
            invitation.invitation_creator,
            "milo@umich.edu",
            "keiko@umich.edu"
        ]);
    });

    test('value Watcher', async () => {
        let updated_invitation = new GroupInvitation({
            pk: 1,
            invitation_creator: "sean@umich.edu",
            project: 15,
            invited_usernames: ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            invitees_who_accepted: ["milo@umich.edu", "keiko@umich.edu"]
        });

        expect(wrapper.vm.d_invitation).toEqual(invitation);

        wrapper.setProps({value: updated_invitation});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_invitation).toEqual(updated_invitation);
    });
});
