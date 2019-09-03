import VueRouter from 'vue-router';

import { config, createLocalVue, mount, Wrapper } from '@vue/test-utils';

import {
    Course,
    Group, GroupInvitation,
    Project,
    Submission,
    User,
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import InvitationReceived from '@/components/project_view/group_registration/invitation_received.vue';
import ProjectView from '@/components/project_view/project_view.vue';

import {
    make_course,
    make_group,
    make_project,
    make_user_roles,
    set_global_current_user,
} from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

beforeEach(() => {
    sinon.stub(User, 'get_num_late_days').returns(Promise.resolve({late_days_remaining: 0}));
    sinon.stub(User, 'get_current_user_roles').returns(
        Promise.resolve(make_user_roles()));
});

afterEach(() => {
    sinon.restore();
});

describe('Changing Tabs', ()  => {
    let wrapper: Wrapper<ProjectView>;
    let project: Project;
    let course: Course;
    let user: User;
    let original_match_media: (query: string) => MediaQueryList;
    // tslint:disable-next-line naming-convention
    const localVue = createLocalVue();
    localVue.use(VueRouter);

    const routes = [
        {
            path: '/web/project/:project_id',
            name: "project_view",
            component: ProjectView
        }
    ];

    const router = new VueRouter ({
        routes: routes,
        mode: 'history'
    });

    beforeEach(async () => {
        course = make_course();
        project = make_project(course.pk);

        user = new User({
            pk: 3,
            username: "worldsbestboss@umich.edu",
            first_name: "Steve",
            last_name: "Carell",
            email: "worldsbestbo$$@umich.edu",
            is_superuser: true
        });
        set_global_current_user(user);

        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project));
        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([
            make_group(project.pk, 1, {member_names: [user.username]})
        ]));
        sinon.stub(Submission, 'get_all_from_group_with_results').resolves([]);

        config.logModifiedComponents = false;
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(ProjectView, {
            localVue,
            router
        });

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Clicking on submit tab', async () => {
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        expect(tabs.length).toEqual(3);
        tabs.at(1).trigger('click');
        await wrapper.vm.$nextTick();

        tabs.at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab_index).toEqual(0);
        expect(router_replace.calledTwice).toBe(true);
        expect(router_replace.secondCall.calledWith({ query: { current_tab: 'submit'}}));
    });

    test('Clicking on submissions tab', async () => {
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab_index).toEqual(1);
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'my_submissions'}}));
    });

    test('Clicking on student_lookup tab', async () => {
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(2).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab_index).toEqual(2);
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'student_lookup'}}));
    });
});


describe('select_tab function called with different values associated with "current_tab" ' +
         'key on create',
         ()  => {
    let wrapper: Wrapper<ProjectView>;
    let project: Project;
    let course: Course;
    let user: User;
    let original_match_media: (query: string) => MediaQueryList;

    const $route = {
        path: '/web/project/:project_id',
        params: {
            project_id: '44'
        },
        query: { }
    };

    beforeEach(() => {
        course = make_course();
        project = make_project(course.pk);

        user = new User({
            pk: 3,
            username: "worldsbestboss@umich.edu",
            first_name: "Steve",
            last_name: "Carell",
            email: "worldsbestbo$$@umich.edu",
            is_superuser: true
        });
        set_global_current_user(user);

        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project));
        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return { matches: true };
            })
        });
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('current_tab parameter value = submit', async () => {
        $route.query = { current_tab: 'submit' };
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));
        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.group).toBeNull();
        expect(wrapper.vm.current_tab_index).toEqual(0);
        expect(wrapper.vm.d_loading).toEqual(false);
    });

    test('current_tab parameter value = submit - user is not in a group for this project',
         async () => {
        $route.query = { current_tab: 'submit' };
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([
            new Group({
                pk: 1,
                project: 10,
                extended_due_date: "2019-04-18T15:26:06.965696Z",
                member_names: [
                    user.username,
                    "oscar@cornell.edu"
                ],
                bonus_submissions_remaining: 0,
                late_days_used: {"oscar@cornell.edu": 2},
                num_submissions: 3,
                num_submits_towards_limit: 2,
                created_at: "9am",
                last_modified: "10am"
            }),
            new Group({
                pk: 2,
                project: 20,
                extended_due_date: "2019-06-18T15:26:06.965696Z",
                member_names: [
                    user.username,
                ],
                bonus_submissions_remaining: 0,
                late_days_used: {},
                num_submissions: 3,
                num_submits_towards_limit: 2,
                created_at: "9am",
                last_modified: "10am"
            }),
        ]));

        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.group).toBeNull();
        expect(wrapper.vm.current_tab_index).toEqual(0);
        expect(wrapper.vm.d_loading).toEqual(false);
    });

    test('current_tab parameter value = submit - user is in a group for this project',
         async () => {
        let group_1 = new Group({
            pk: 1,
            project: 10,
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                user.username,
                "oscar@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {"oscar@cornell.edu": 2},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });
        let group_2 = new Group ({
            pk: 2,
            project: project.pk,
            extended_due_date: "2019-06-18T15:26:06.965696Z",
            member_names: [
                user.username,
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });
        let groups_is_member_of_stub = sinon.stub(user, 'groups_is_member_of').returns(
            Promise.resolve([
                group_1,
                group_2
            ])
        );
        $route.query = { current_tab: 'submit' };


        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.course).toEqual(course);
        expect(groups_is_member_of_stub.calledOnce).toBe(true);
        expect(wrapper.vm.group).toEqual(group_2);
        expect(wrapper.vm.current_tab_index).toEqual(0);
        expect(wrapper.vm.d_loading).toEqual(false);
    });

    test('current_tab parameter value = my_submissions', async () => {
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([
            make_group(project.pk, 1, {member_names: [user.username]})
        ]));
        sinon.stub(Submission, 'get_all_from_group_with_results').resolves([]);

        $route.query = { current_tab: 'my_submissions' };
        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.current_tab_index).toEqual(1);
        expect(wrapper.vm.d_loading).toEqual(false);
    });

    test('current_tab parameter value = student_lookup', async () => {
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));

        $route.query = { current_tab: 'student_lookup' };
        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.current_tab_index).toEqual(2);
        expect(wrapper.vm.d_loading).toEqual(false);
    });

    test('current_tab parameter value = empty string', async () => {
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));

        $route.query = { current_tab: '' };
        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.current_tab_index).toEqual(0);
        expect(wrapper.vm.d_loading).toEqual(false);
    });

    test('current_tab parameter value = array of values', async () => {
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));

        $route.query = { current_tab: ['student_lookup', 'submit'] };
        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.current_tab_index).toEqual(2);
        expect(wrapper.vm.d_loading).toEqual(false);
    });

    test('current_tab parameter value = null', async () => {
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));

        $route.query = { };
        wrapper = mount(ProjectView, {
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.project).toEqual(project);
        expect(wrapper.vm.current_tab_index).toEqual(0);
        expect(wrapper.vm.d_loading).toEqual(false);
    });
});




describe('GroupObserver tests for the Project Component', () => {
    let wrapper: Wrapper<ProjectView>;
    let project: Project;
    let course: Course;
    let user: User;
    let original_match_media: (query: string) => MediaQueryList;
    // tslint:disable-next-line naming-convention
    const localVue = createLocalVue();
    localVue.use(VueRouter);

    const routes = [
        {
            path: '/web/project/:project_id',
            name: "project_view",
            component: ProjectView
        }
    ];

    const router = new VueRouter ({
        routes: routes,
        mode: 'history'
    });

    beforeEach(() => {

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return { matches: true };
            })
        });

        course = make_course();

        project = make_project(
            course.pk,
            {
                disallow_group_registration: false
            }
        );

        user = new User({
            pk: 3,
            username: "alexis@umich.edu",
            first_name: "Alexis",
            last_name: "Bledel",
            email: "alexis@umich.edu",
            is_superuser: true
        });
        set_global_current_user(user);

        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('solo group created in created() in the GroupRegistration component', async () => {
        let group_created = new Group({
            pk: 32,
            project: project.pk,
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                user.username
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });
        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project));
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        let create_solo_group_stub = sinon.stub(Group, 'create_solo_group').callsFake(
            () => Group.notify_group_created(group_created)
        );
        wrapper = mount(ProjectView, {
            localVue,
            router
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(project.max_group_size === 1).toBe(true);
        expect(create_solo_group_stub.calledOnce);
        expect(wrapper.vm.group).toEqual(group_created);
        expect(wrapper.findAll('#group-registration').length).toEqual(0);
    });

    test('user chooses to work alone', async () => {
        project.max_group_size = 3;
        let group_created = new Group({
            pk: 32,
            project: project.pk,
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                user.username
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });
        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project));
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_received').returns(Promise.resolve([]));
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));
        let create_solo_group_stub = sinon.stub(Group, 'create_solo_group').callsFake(
            () => Group.notify_group_created(group_created)
        );
        wrapper = mount(ProjectView, {
            localVue,
            router
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let group_registration = wrapper.find({ref: 'group_registration'});

        group_registration.find('#work-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        group_registration.find('#confirm-working-alone-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(create_solo_group_stub.calledOnce);
        expect(wrapper.vm.group).toEqual(group_created);
        expect(wrapper.findAll('#group-registration').length).toEqual(0);
    });

    test('last person to accept the group invitation accepts the invitation', async () => {
        project.max_group_size = 3;
        let group_created = new Group({
            pk: 32,
            project: project.pk,
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                user.username,
                "lauren@umich.edu",
                "melissa@umich.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        let invitation_received = new GroupInvitation({
            pk: 1,
            invitation_creator: "melissa@umich.edu",
            project: project.pk,
            invited_usernames: ["alexis@umich.edu", "lauren@umich.edu"],
            invitees_who_accepted: ["lauren@umich.edu"]
        });
        sinon.stub(user, 'groups_is_member_of').returns(Promise.resolve([]));
        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project));
        sinon.stub(user, 'group_invitations_received').returns(
            Promise.resolve([invitation_received])
        );
        sinon.stub(user, 'group_invitations_sent').returns(Promise.resolve([]));

        wrapper = mount(ProjectView, {
            localVue,
            router
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let group_registration = wrapper.find({ref: 'group_registration'});
        expect(group_registration.findAll({ref: 'invitation_received'}).length).toEqual(1);

        let invitation_to_accept = <InvitationReceived> group_registration.findAll(
            {ref: 'invitation_received'}
        ).at(0).vm;
        group_registration.find('#accept-invitation-button').trigger('click');
        await wrapper.vm.$nextTick();

        let create_multi_person_group = sinon.stub(
            invitation_to_accept.d_invitation!, 'accept'
        ).callsFake(() => {
            Group.notify_group_created(group_created);
            return Promise.resolve(group_created);
        });

        group_registration.find('#confirm-accept-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(create_multi_person_group.calledOnce);
        expect(wrapper.vm.group).toEqual(group_created);
        expect(wrapper.findAll('#group-registration').length).toEqual(0);
    });
});
