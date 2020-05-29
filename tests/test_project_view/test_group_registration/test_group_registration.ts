import { Wrapper } from '@vue/test-utils';

import {
    Course,
    Group, GroupInvitation, HttpError,
    Project,
    User
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import GroupRegistration from '@/components/project_view/group_registration/group_registration.vue';
import InvitationReceived from '@/components/project_view/group_registration/invitation_received.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';

describe('GroupRegistration tests', () => {
    let wrapper: Wrapper<GroupRegistration>;
    let course: Course;
    let project: Project;
    let user: User;

    beforeEach(() => {
        course = data_ut.make_course();

        project = data_ut.make_project(
            course.pk,
            {
               disallow_group_registration: false,
               max_group_size: 3
           }
        );

        user = data_ut.make_user();
        data_ut.set_global_current_user(user);
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Max group size 1, automatically work alone', async () => {
        let work_alone_stub = sinon.stub(Group, 'create_solo_group').resolves(
            data_ut.make_group(project.pk, 1, {member_names: [user.username]})
        );
        project.max_group_size = 1;
        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(work_alone_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_loading).toBe(false);
    });

    test('Min group size 2, work alone button hidden', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        project.min_group_size = 2;
        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_loading).toBe(false);

        expect(wrapper.find('#registration-buttons #work-alone-button').exists()).toBe(false);
        expect(
            wrapper.find('#registration-buttons #send-group-invitation-button').exists()
        ).toBe(true);
    });

    test('created - Project.disallow_group_registration is true', async () => {
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        project.disallow_group_registration = true;

        wrapper = managed_mount(GroupRegistration, {
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

        wrapper = managed_mount(GroupRegistration, {
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
        let group_invitation_sent = data_ut.make_group_invitation(
            project.pk,
            "alexis@umich.edu",
            ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            ["milo@umich.edu", "keiko@umich.edu"]
        );

        sinon.stub(user, 'group_invitations_sent').returns(
            Promise.resolve(
                [
                    group_invitation_sent
                ]
            )
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));

        wrapper = managed_mount(GroupRegistration, {
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
        let group_invitation_sent = data_ut.make_group_invitation(
            data_ut.make_project(course.pk).pk,
            "alexis@umich.edu",
            ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            ["milo@umich.edu", "keiko@umich.edu"]
        );
        sinon.stub(user, 'group_invitations_sent').returns(
            Promise.resolve(
                [
                    group_invitation_sent
                ]
            )
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));

        wrapper = managed_mount(GroupRegistration, {
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
        let group_invitation_received_1 = data_ut.make_group_invitation(
            data_ut.make_project(course.pk).pk,
            "laura@umich.edu",
            ["alexis@umich.edu", "george@umich.edu"],
            []
        );
        let group_invitation_received_2 = data_ut.make_group_invitation(
            project.pk,
            "linda@umich.edu",
            ["alexis@umich.edu", "liz@umich.edu"],
            ["liz@umich.edu"]
        );
        let group_invitation_received_3 = data_ut.make_group_invitation(
            project.pk,
            "james@umich.edu",
            ["alexis@umich.edu", "violet@umich.edu"],
            ["alexis@umich.edu"]
        );
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([
            group_invitation_received_1,
            group_invitation_received_2,
            group_invitation_received_3
        ]));

        wrapper = managed_mount(GroupRegistration, {
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
        expect(wrapper.findAllComponents({name: 'InvitationReceived'}).length).toEqual(2);
    });

    test('if invitation_sent is not null, it is an invitation sent by the user for ' +
         'the current project',
         async () => {
        let invitation_sent_1 = data_ut.make_group_invitation(
            data_ut.make_project(course.pk).pk,
            user.username,
            ["liz@umich.edu", "yanic@umich.edu"],
            ["liz@umich.edu"]
        );
        let invitation_sent_2 = data_ut.make_group_invitation(
            project.pk,
            user.username,
            ["edward@umich.edu", "kelly@umich.edu"],
            ["kelly@umich.edu"]
        );
        let invitation_sent_3 = data_ut.make_group_invitation(
            data_ut.make_project(course.pk).pk,
            user.username,
            ["milo@umich.edu"],
            [""]
        );
        let invitation_sent_4 = data_ut.make_group_invitation(
            data_ut.make_project(course.pk).pk,
            user.username,
            ["melissa@umich.edu"],
            [""]
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([
            invitation_sent_1,
            invitation_sent_2,
            invitation_sent_3,
            invitation_sent_4
        ]));

        wrapper = managed_mount(GroupRegistration, {
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

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);

        wrapper.find('#cancel-confirm-working-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);
    });

    test('work alone - confirm action in modal - successful',  async () => {
        let work_alone_stub = sinon.stub(Group, 'create_solo_group').resolves(
            data_ut.make_group(project.pk, 1, {members: [user]})
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitation_sent).toBeNull();
        expect(wrapper.vm.invitations_received.length).toEqual(0);
        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);

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

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.invitation_sent).toBeNull();
        expect(wrapper.vm.invitations_received.length).toEqual(0);
        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(false);

        wrapper.find('#work-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(true);

        wrapper.find('#confirm-working-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(work_alone_stub.callCount).toEqual(1);
        expect(wrapper.findComponent({ref: 'confirm_working_alone_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_confirm_working_alone_modal).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'work_alone_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('delete invitation - cancel action in modal', async () => {
        let group_invitation_sent = data_ut.make_group_invitation(
            project.pk,
            "alexis@umich.edu",
            ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            ["milo@umich.edu", "keiko@umich.edu"]
        );
        let reject_invitation_stub = sinon.stub(group_invitation_sent, 'reject');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([
            group_invitation_sent
        ]));

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('#delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);

        wrapper.find('#confirm-keep-sent-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(reject_invitation_stub.callCount).toEqual(0);
        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);
    });

    test('delete invitation - confirm action in modal - successful', async () => {
        let group_invitation_sent = data_ut.make_group_invitation(
            project.pk,
            "alexis@umich.edu",
            ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            ["milo@umich.edu", "keiko@umich.edu"]
        );
        let reject_invitation_stub = sinon.stub(group_invitation_sent, 'reject');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([
            group_invitation_sent
        ]));

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('#delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);

        wrapper.find('#confirm-delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);
    });

    test('delete invitation - confirm action in modal - unsuccessful', async () => {
        let group_invitation_sent = data_ut.make_group_invitation(
            project.pk,
            "alexis@umich.edu",
            ["sean@umich.edu", "milo@umich.edu", "keiko@umich.edu"],
            ["milo@umich.edu", "keiko@umich.edu"]
        );
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

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        wrapper.find('#delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);

        wrapper.find('#confirm-delete-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(reject_invitation_stub.calledOnce).toBe(true);
        expect(wrapper.findComponent({ref: 'delete_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_delete_invitation_modal).toBe(true);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_sent);

        let api_errors
            = <APIErrors> wrapper.findComponent({ref: 'delete_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('send invitation - cancel action in modal', async () => {
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation');
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);

        wrapper.find('#cancel-send-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(send_invitation_stub.callCount).toEqual(0);
        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);
    });

    test('send invitation - successful', async () => {
        let group_invitation_created = data_ut.make_group_invitation(
            project.pk,
            user.username,
            ["milo@umich.edu"],
            []
        );
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation').returns(
            Promise.resolve(group_invitation_created)
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);

        wrapper.findComponent({ref: 'send_invitation_form'}).vm.$emit('submit', ['milo@umich.edu']);
        await wrapper.vm.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_invitation_stub.firstCall.calledWith(project.pk, ["milo@umich.edu"])).toBe(
            true
        );
        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(group_invitation_created);
        expect(wrapper.findAll('#group-registration-bar-buttons').length).toEqual(0);
    });

    test('send invitation - unsuccessful', async () => {
        let send_invitation_stub = sinon.stub(GroupInvitation, 'send_invitation').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Error in 'recipient_usernames'"}
                )
            )
        );
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(false);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        wrapper.find('#send-group-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);

        wrapper.findComponent({ref: 'send_invitation_form'}).vm.$emit('submit', [user.username]);
        await wrapper.vm.$nextTick();

        expect(send_invitation_stub.calledOnce).toBe(true);
        expect(send_invitation_stub.firstCall.calledWith(project.pk, [user.username])).toBe(true);
        expect(wrapper.findComponent({ref: 'send_group_invitation_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_send_group_invitation_modal).toBe(true);
        expect(wrapper.vm.invitation_sent).toEqual(null);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'send_invitation_api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Rejecting a group invitation', async () => {
        project.max_group_size = 4;
        let invitation_received_1 = data_ut.make_group_invitation(
            project.pk,
            "melissa@umich.edu",
            ["alexis@umich.edu", "liz@umich.edu", "yanic@umich.edu"],
            ["liz@umich.edu", "yanic@umich.edu"]
        );
        let invitation_received_2 = data_ut.make_group_invitation(
            project.pk,
            "lauren@umich.edu",
            ["alexis@umich.edu", "edward@umich.edu", "kelly@umich.edu"],
            ["kelly@umich.edu"]
        );
        let invitation_received_3 = data_ut.make_group_invitation(
            project.pk,
            "scott@umich.edu",
            ["alexis@umich.edu", "milo@umich.edu"],
            [""]
        );

        let invitation_received_4 = data_ut.make_group_invitation(
            project.pk,
            "liza@umich.edu",
            ["alexis@umich.edu"],
            [""]
        );

        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([
            invitation_received_1,
            invitation_received_2,
            invitation_received_3,
            invitation_received_4
        ]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = managed_mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        await wrapper.vm.$nextTick();
        // this second await needs to be here for the invitation_received component to render
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllComponents({ref: 'invitation_received'}).length).toEqual(4);
        expect(wrapper.vm.invitations_received.length).toEqual(4);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_1);
        expect(wrapper.vm.invitations_received[1]).toEqual(invitation_received_2);
        expect(wrapper.vm.invitations_received[2]).toEqual(invitation_received_3);
        expect(wrapper.vm.invitations_received[3]).toEqual(invitation_received_4);

        let invitation_to_reject = wrapper.findAllComponents({ref: 'invitation_received'}).at(0);
        let invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        await invitation_to_reject.get('[data-testid=reject_invitation_button]').trigger('click');

        sinon.stub(invitation_received_component.d_invitation! , 'reject');
        await invitation_to_reject.get('[data-testid=confirm_reject_button]').trigger('click');

        expect(wrapper.vm.invitations_received.length).toEqual(3);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_2);
        expect(wrapper.vm.invitations_received[1]).toEqual(invitation_received_3);
        expect(wrapper.vm.invitations_received[2]).toEqual(invitation_received_4);

        invitation_to_reject = wrapper.findAllComponents({ref: 'invitation_received'}).at(1);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        await invitation_to_reject.find('[data-testid=reject_invitation_button]').trigger('click');

        sinon.stub(invitation_received_component.d_invitation! , 'reject');
        await invitation_to_reject.find('[data-testid=confirm_reject_button]').trigger('click');

        expect(wrapper.vm.invitations_received.length).toEqual(2);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_2);
        expect(wrapper.vm.invitations_received[1]).toEqual(invitation_received_4);

        invitation_to_reject = wrapper.findAllComponents({ref: 'invitation_received'}).at(1);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        await invitation_to_reject.find('[data-testid=reject_invitation_button]').trigger('click');

        sinon.stub(invitation_received_component.d_invitation! , 'reject');
        await invitation_to_reject.find('[data-testid=confirm_reject_button]').trigger('click');

        expect(wrapper.vm.invitations_received.length).toEqual(1);
        expect(wrapper.vm.invitations_received[0]).toEqual(invitation_received_2);

        invitation_to_reject = wrapper.findAllComponents({ref: 'invitation_received'}).at(0);
        invitation_received_component = <InvitationReceived> invitation_to_reject.vm;
        await invitation_to_reject.find('[data-testid=reject_invitation_button]').trigger('click');

        sinon.stub(invitation_received_component.d_invitation! , 'reject');
        await invitation_to_reject.find('[data-testid=confirm_reject_button]').trigger('click');

        expect(wrapper.vm.invitations_received.length).toEqual(0);
    });
});
