import { mount, Wrapper } from '@vue/test-utils';
// tslint:disable-next-line: no-duplicate-imports
import * as vue_test_utils from '@vue/test-utils';


import {
    Course,
    Group, GroupInvitation, HttpError,
    Project,
    User
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import { GlobalData } from '@/App.vue';
import APIErrors from '@/components/api_errors.vue';
import GroupRegistration from '@/components/project_view/group_registration/group_registration.vue';
import InvitationReceived from '@/components/project_view/group_registration/invitation_received.vue';

import { make_course, make_project } from '@/tests/data_utils';

describe('GroupRegistration tests', () => {
    let wrapper: Wrapper<GroupRegistration>;
    let course: Course;
    let project: Project;
    let user: User;

    beforeEach(() => {
        course = make_course();

        project = make_project(
            course.pk,
            {
               disallow_group_registration: false,
               max_group_size: 3
           }
        );

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
        vue_test_utils.config.provide!['globals'] = globals;
    });

    afterEach(() => {
        sinon.restore();
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
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_loading).toBe(false);
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
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('#registration-open').length).toEqual(1);
        expect(wrapper.vm.invitation_sent).toEqual(null);
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
            Promise.resolve(
                [
                    group_invitation_sent
                ]
            )
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.findAll('#registration-open').length).toEqual(1);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);
        expect(wrapper.vm.invitations_received.length).toEqual(0);
        expect(wrapper.findAll('#resolve-invitation-message').length).toEqual(1);
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
            Promise.resolve(
                [
                    group_invitation_sent
                ]
            )
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.findAll('#registration-open').length).toEqual(1);
        expect(wrapper.vm.invitation_sent).toEqual(null);
        expect(wrapper.vm.invitations_received.length).toEqual(0);
        expect(wrapper.findAll('#resolve-invitation-message').length).toEqual(0);
    });

    test('created - user has received a invitations from several projects', async () => {
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
            project: project.pk,
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
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitations_received.length).toEqual(2);
        expect(wrapper.vm.invitations_received).toEqual(
            [group_invitation_received_2, group_invitation_received_3]);
        expect(wrapper.findAll('#resolve-invitation-message').length).toEqual(1);
        expect(wrapper.findAll({name: 'InvitationReceived'}).length).toEqual(2);
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
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitation_sent).toEqual(invitation_sent_2);
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
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);

        wrapper.find('#cancel-confirm-working-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);
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
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitation_sent).toBeNull();
        expect(wrapper.vm.invitations_received.length).toEqual(0);
        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(true);
        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);

        wrapper.find('#confirm-working-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

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
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitation_sent).toBeNull();
        expect(wrapper.vm.invitations_received.length).toEqual(0);
        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(true);

        wrapper.find('#confirm-working-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(work_alone_stub.callCount).toEqual(1);
        expect(wrapper.find({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'work_alone_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('delete invitation - cancel action in modal', async () => {
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
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('#delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);

        wrapper.find('#confirm-keep-sent-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(reject_invitation_stub.callCount).toEqual(0);
        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);
    });

    test('delete invitation - confirm action in modal - successful', async () => {
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
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('#delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);

        wrapper.find('#confirm-delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);
    });

    test('delete invitation - confirm action in modal - unsuccessful', async () => {
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
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('#delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);

        wrapper.find('#confirm-delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.find({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        let api_errors = <APIErrors> wrapper.find({ref: 'delete_invitation_api_errors'}).vm;
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
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);

        wrapper.find('#cancel-send-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(send_invitation_stub.callCount).toEqual(0);
        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);
    });

    test('send invitation - successful', async () => {
        let group_invitation_created = new GroupInvitation({
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
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);

        wrapper.find({ref: 'send_invitation_form'}).vm.$emit('submit', ['milo@umich.edu']);
        await wrapper.vm.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_invitation_stub.firstCall.calledWith(project.pk, ["milo@umich.edu"])).toBe(
            true
        );
        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_created);
        expect(wrapper.findAll('#group-registration-bar-buttons').length).toEqual(0);
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
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);

        wrapper.find({ref: 'send_invitation_form'}).vm.$emit('submit', [user.username]);
        await wrapper.vm.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_invitation_stub.firstCall.calledWith(project.pk, [user.username])).toBe(true);
        expect(wrapper.find({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        let api_errors = <APIErrors> wrapper.find({ref: 'send_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
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
        await wrapper.vm.$nextTick();
        // this second await needs to be here for the invitation_received component to render
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll({ref: 'invitation_received'}).length).toEqual(4);
        expect(wrapper.vm.invitations_received.length).toEqual(4);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_1);
        expect(wrapper.vm.invitations_received[1]).toEqual(invitation_received_2);
        expect(wrapper.vm.invitations_received[2]).toEqual(invitation_received_3);
        expect(wrapper.vm.invitations_received[3]).toEqual(invitation_received_4);

        let invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(0);
        let invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitations_received.length).toEqual(3);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_2);
        expect(wrapper.vm.invitations_received[1]).toEqual(invitation_received_3);
        expect(wrapper.vm.invitations_received[2]).toEqual(invitation_received_4);

        invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(1);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitations_received.length).toEqual(2);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_2);
        expect(wrapper.vm.invitations_received[1]).toEqual(invitation_received_4);

        invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(1);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitations_received.length).toEqual(1);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_2);

        invitation_to_reject = wrapper.findAll({ref: 'invitation_received'}).at(0);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        invitation_to_reject.find('#reject-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        sinon.stub(invitation_received_component.d_invitation! , 'reject');

        invitation_to_reject.find('#confirm-reject-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitations_received.length).toEqual(0);
    });
});
