import VueRouter from 'vue-router';

import { config, createLocalVue, mount, Wrapper } from '@vue/test-utils';

import { Course, Project, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import CourseAdmin, { RosterChoice } from '@/components/course_admin/course_admin.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';

beforeAll(() => {
    config.logModifiedComponents = false;
});

let course: Course;
let user: User;

beforeEach(() => {
    course = data_ut.make_course();

    user = new User({
        pk: 1, username: "amandaplease@umich.edu", first_name: "Amanda", last_name: "Bynes",
        email: "amandaplease@umich.edu", is_superuser: true
    });
    data_ut.set_global_current_user(user);
    sinon.stub(User, 'get_current_user_roles').returns(
        Promise.resolve(data_ut.make_user_roles()));
});


describe('Changing Tabs', ()  => {
    // tslint:disable-next-line naming-convention
    const localVue = createLocalVue();
    localVue.use(VueRouter);

    const routes = [
        { path: '/web/course_admin/:course_id', name: "course_admin", component: CourseAdmin }
    ];

    const router = new VueRouter ({
        routes: routes,
        mode: 'history'
    });

    let wrapper: Wrapper<CourseAdmin>;
    let component: CourseAdmin;
    let roster: User[];

    beforeEach(() => {
        roster = [user];
        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));

        wrapper = managed_mount(CourseAdmin, {
            localVue,
            router
        });
        component = wrapper.vm;
    });

    test('Select admin roster', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course, 'get_admins').returns(Promise.resolve(roster));

        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await component.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(0).trigger('click');
        await component.$nextTick();

        expect(component.current_tab).toEqual('Admin_roster');
        expect(component.role_selected).toEqual(RosterChoice.admin);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Admin_roster'}}
        )).toBe(true);
    });

    test('Select staff roster', async () => {
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course, 'get_staff').returns(Promise.resolve(roster));

        await component.$nextTick();
        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await component.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(1).trigger('click');
        await component.$nextTick();

        expect(component.current_tab).toEqual('Staff_roster');
        expect(component.role_selected).toEqual(RosterChoice.staff);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Staff_roster'}})
        ).toBe(true);
    });

    test('Select student roster', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course, 'get_students').returns(Promise.resolve(roster));

        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await component.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(2).trigger('click');
        await component.$nextTick();

        expect(component.current_tab).toEqual('Student_roster');
        expect(component.role_selected).toEqual(RosterChoice.student);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Student_roster'}}
        )).toBe(true);
    });

    test('Select handgrader roster', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course, 'get_handgraders').returns(Promise.resolve(roster));

        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await component.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(3).trigger('click');
        await component.$nextTick();

        expect(component.current_tab).toEqual('Handgrader_roster');
        expect(component.role_selected).toEqual(RosterChoice.handgrader);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Handgrader_roster'}}
        )).toBe(true);
    });

    test('Clicking on manage_projects tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve([]));

        let tabs = wrapper.findAll('.nav-link');
        expect(tabs.length).toEqual(3);
        tabs.at(2).trigger('click');
        await component.$nextTick();

        expect(component.current_tab).toEqual('projects');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'projects'}}));
    });

    test('Clicking on settings tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.nav-link');
        tabs.at(2).trigger('click');
        await component.$nextTick();

        expect(component.current_tab).toEqual('projects');

        tabs.at(0).trigger('click');
        await component.$nextTick();

        expect(component.current_tab).toEqual('settings');
        expect(router_replace.calledTwice).toBe(true);
        expect(router_replace.secondCall.calledWith({ query: { current_tab: 'settings'}}));
    });
});


describe('select_tab function called with different values associated with "current_tab" ' +
         'key on create',
         ()  => {
    let wrapper: Wrapper<CourseAdmin>;
    let component: CourseAdmin;
    let router_replace: sinon.SinonStub;

    function get_router_mocks(query = {}) {
        return {
            $route: {
                params: {
                    course_id: course.pk.toString()
                },
                query: query
            },
            $router: {
                replace: router_replace
            }
        };
    }

    beforeEach(() => {
        course = data_ut.make_course();

        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));
        sinon.stub(course, 'get_admins').returns(Promise.resolve([]));
        sinon.stub(course, 'get_staff').returns(Promise.resolve([]));
        sinon.stub(course, 'get_students').returns(Promise.resolve([]));
        sinon.stub(course, 'get_handgraders').returns(Promise.resolve([]));
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve([]));

        router_replace = sinon.stub();
    });

    test('current_tab parameter value = settings', async () => {
        wrapper = managed_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'settings'})
        });
        component = wrapper.vm;
        await component.$nextTick();
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab).toEqual('settings');
        expect(component.role_selected).toEqual("");
        expect(component.loading).toEqual(false);
    });

    test('current_tab parameter value = admin_roster', async () => {
        wrapper = managed_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Admin_roster'})
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab).toEqual('Admin_roster');
        expect(component.role_selected).toEqual(RosterChoice.admin);
    });

    test('current_tab parameter value = staff_roster', async () => {
        wrapper = managed_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Staff_roster'})
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab).toEqual('Staff_roster');
        expect(component.role_selected).toEqual(RosterChoice.staff);
    });

    test('current_tab parameter value = student_roster', async () => {
        wrapper = managed_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Student_roster'})
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab).toEqual('Student_roster');
        expect(component.role_selected).toEqual(RosterChoice.student);
    });

    test('current_tab parameter value = handgrader_roster', async () => {
        wrapper = managed_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Handgrader_roster'})
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab).toEqual('Handgrader_roster');
        expect(component.role_selected).toEqual(RosterChoice.handgrader);
    });

    test('current_tab parameter value = projects', async () => {
        wrapper = managed_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'projects'})
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab).toEqual('projects');
        expect(component.role_selected).toEqual("");
    });

    test('current_tab parameter value = null', async () => {
        wrapper = managed_mount(CourseAdmin, {
            mocks: get_router_mocks({})
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(0);
        expect(component.role_selected).toEqual("");
    });
});
