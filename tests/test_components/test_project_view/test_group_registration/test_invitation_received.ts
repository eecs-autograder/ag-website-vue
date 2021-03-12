import { Wrapper } from '@vue/test-utils';

import {
    Group,
    GroupInvitation,
    HttpError,
    Project,
    User
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import InvitationReceived from '@/components/project_view/group_registration/invitation_received.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { wait_until } from '@/tests/utils';

describe('InvitationReceived tests', () => {
    let wrapper: Wrapper<InvitationReceived>;
    let user: User;
    let invitation: GroupInvitation;
    let project: Project;

    beforeEach(async () => {

        project = data_ut.make_project(data_ut.make_course().pk);

        invitation = data_ut.make_group_invitation(
            project.pk,
            "sean@umich.edu",
            ["alexis@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            ["milo@umich.edu"]
        );

        user = invitation.recipients[0];
        data_ut.set_global_current_user(user);
        wrapper = managed_mount(InvitationReceived, {
            propsData: {
                value: invitation,
                project: project
            }
        });
    });

    test('reject an invitation - cancel action in modal', async () => {
        expect(wrapper.vm.d_invitation!).toEqual(invitation);
        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);

        wrapper.find('[data-testid=reject_invitation_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);

        wrapper.find('[data-testid=cancel_reject_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);
    });

    test('reject an invitation - confirm action in modal - successful', async () => {
        let reject_invitation_stub = sinon.stub(wrapper.vm.d_invitation!, 'reject');
        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);

        wrapper.find('[data-testid=reject_invitation_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);

        wrapper.find('[data-testid=confirm_reject_button]').trigger('click');
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
        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(false);

        wrapper.find('[data-testid=reject_invitation_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);

        await wrapper.find('[data-testid=confirm_reject_button]').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_accepting)).toBe(true);
        await wrapper.vm.$nextTick();

        let api_errors
            = <APIErrors> wrapper.findComponent({ref: 'reject_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(reject_invitation_stub.calledOnce);
        expect(wrapper.findComponent({ref: 'confirm_reject_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_reject_invitation_modal).toBe(true);
    });

    test('already_accepted', async () => {
        let updated_invitation = deep_copy(invitation, GroupInvitation);
        updated_invitation.recipients_who_accepted.push(user.username);
        expect(wrapper.vm.d_invitation!.recipients_who_accepted).not.toContain(user.username);
        expect(wrapper.vm.already_accepted).toBe(false);
        expect(wrapper.find('[data-testid=accept_invitation_button]').element).not.toBeDisabled();

        wrapper.setProps({value: updated_invitation});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_invitation!.recipients_who_accepted).toContain(user.username);
        expect(wrapper.vm.already_accepted).toBe(true);
        expect(wrapper.find('[data-testid=accept_invitation_button]').element).toBeDisabled();
    });

    test('accept an invitation - cancel action in modal', async () => {
        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
        expect(wrapper.find('[data-testid=accept_invitation_button]').element).not.toBeDisabled();

        wrapper.find('[data-testid=accept_invitation_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);

        wrapper.find('[data-testid=cancel_accept_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
    });

    test('accept an invitation - confirm action in modal - successful ' +
         '- & not the last person in the group to accept the invite',
         async () => {
        let accept_invitation_stub = sinon.stub(wrapper.vm.d_invitation!, 'accept').returns(
            Promise.resolve(null)
        );
        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);

        expect(wrapper.find('[data-testid=accept_invitation_button]').element).not.toBeDisabled();

        wrapper.find('[data-testid=accept_invitation_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);


        wrapper.find('[data-testid=confirm_accept_button]').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_accepting)).toBe(true);
        await wrapper.vm.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
    });

    test('accept an invitation - confirm action in modal - successful ' +
         '& last person in group to accept invitation',
         async () => {
        let group_created = data_ut.make_group(
            project.pk, 4, {members: [user, ...invitation.recipients]}
        );

        let updated_invitation = deep_copy(invitation, GroupInvitation);
        updated_invitation.recipients_who_accepted = invitation.recipient_usernames.slice(1);
        wrapper.setProps({invitation: updated_invitation});
        expect(
            updated_invitation.recipients_who_accepted.find(item => item === user.username)
        ).toBeUndefined();

        let accept_invitation_stub = sinon.stub(
            wrapper.vm.d_invitation!, 'accept'
        ).callsFake(() => {
            Group.notify_group_created(group_created);
            return Promise.resolve(group_created);
        });
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.find('[data-testid=accept_invitation_button]').element).not.toBeDisabled();

        wrapper.find('[data-testid=accept_invitation_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(true);

        await wrapper.find('[data-testid=confirm_accept_button]').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_accepting)).toBe(true);
        await wrapper.vm.$nextTick();

        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(false);
    });

    test('accept an invitation - confirm action in modal - unsuccessful', async () => {
        let accept_invitation_stub = sinon.stub(wrapper.vm.d_invitation!, 'accept').returns(
            Promise.reject(
                new HttpError(400, {
                    __all__: "Already accepted invitation."
                })
            )
        );

        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(false);

        expect(wrapper.find('[data-testid=accept_invitation_button]').element).not.toBeDisabled();

        await wrapper.find('[data-testid=accept_invitation_button]').trigger('click');

        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);

        await wrapper.find('[data-testid=confirm_accept_button]').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_accepting)).toBe(true);
        await wrapper.vm.$nextTick();

        let api_errors
            = <APIErrors> wrapper.findComponent({ref: 'accept_invitation_api_errors'}).vm;
        expect(wrapper.findComponent({ref: 'confirm_accept_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_accept_invitation_modal).toBe(true);
        expect(accept_invitation_stub.calledOnce).toBe(true);
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('prospective_group_members', async () => {
        expect(wrapper.vm.d_invitation!.recipient_usernames).toEqual([
            "alexis@umich.edu",
            "milo@umich.edu",
            "keiko@umich.edu"
        ]);
        expect(wrapper.vm.d_globals.current_user!.username).toEqual("alexis@umich.edu");
        expect(wrapper.vm.d_invitation!.sender_username).toEqual("sean@umich.edu");
        expect(wrapper.vm.other_group_members).toEqual([
            invitation.sender_username,
            "milo@umich.edu",
            "keiko@umich.edu"
        ]);
    });

    test('value Watcher', async () => {
        let updated_invitation = deep_copy(invitation, GroupInvitation);
        updated_invitation.recipients_who_accepted.push(user.username);

        expect(wrapper.vm.d_invitation).toEqual(invitation);

        wrapper.setProps({value: updated_invitation});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_invitation).toEqual(updated_invitation);
    });
});
