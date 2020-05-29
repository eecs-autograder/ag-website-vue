import { Wrapper } from '@vue/test-utils';

import { Course, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import CourseAdmin, { RosterChoice } from '@/components/course_admin/course_admin.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_shallow_mount } from '@/tests/setup';
import { wait_for_load, wait_until } from '@/tests/utils';


let course: Course;
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
    router_replace = sinon.stub();
    sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(
        data_ut.make_user_roles({is_admin: true}));
    sinon.stub(Course, 'get_by_pk').withArgs(course.pk).resolves(course);
});

describe('Changing Tabs', ()  => {
    let wrapper: Wrapper<CourseAdmin>;

    beforeEach(async () => {
        wrapper = managed_shallow_mount(CourseAdmin, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Settings loaded initially, select another tab and then settings again', async () => {
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'CourseSettings'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'CourseSettings'}).vm.$props.course).toEqual(course);

        let tabs = wrapper.findAll('.nav-link');
        await tabs.at(2).trigger('click');

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'ManageProjects'}).exists())
        ).toBe(true);
        expect(wrapper.vm.current_tab).toEqual('projects');
        expect(wrapper.findComponent({name: 'ManageProjects'}).element).toBeVisible();
        expect(wrapper.findComponent({name: 'CourseSettings'}).element).not.toBeVisible();
        expect(router_replace.calledOnce).toBe(true);

        await tabs.at(0).trigger('click');
        expect(wrapper.findComponent({name: 'CourseSettings'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('settings');
        expect(router_replace.secondCall.calledWith(
            {query: {current_tab: 'settings'}})
        ).toBe(true);
        expect(wrapper.findComponent({name: 'ManageProjects'}).element).not.toBeVisible();
    });

    test('Select admin roster', async () => {
        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await wrapper.vm.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('Admin_roster');
        expect(wrapper.vm.role_selected).toEqual(RosterChoice.admin);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Admin_roster'}}
        )).toBe(true);
        expect(wrapper.findComponent({name: 'AdminRoster'}).vm.$props.course).toEqual(course);
    });

    test('Select staff roster', async () => {
        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await wrapper.vm.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('Staff_roster');
        expect(wrapper.vm.role_selected).toEqual(RosterChoice.staff);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Staff_roster'}})
        ).toBe(true);
        expect(wrapper.findComponent({name: 'StaffRoster'}).vm.$props.course).toEqual(course);
    });

    test('Select student roster', async () => {
        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await wrapper.vm.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(2).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('Student_roster');
        expect(wrapper.vm.role_selected).toEqual(RosterChoice.student);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Student_roster'}}
        )).toBe(true);
        expect(wrapper.findComponent({name: 'StudentRoster'}).vm.$props.course).toEqual(course);
    });

    test('Select handgrader roster', async () => {
        wrapper.find('.roster-tab-header').trigger('mouseenter');
        await wrapper.vm.$nextTick();

        wrapper.findAll('.dropdown .menu-item').at(3).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('Handgrader_roster');
        expect(wrapper.vm.role_selected).toEqual(RosterChoice.handgrader);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'Handgrader_roster'}}
        )).toBe(true);
        expect(wrapper.findComponent({name: 'HandgraderRoster'}).vm.$props.course).toEqual(course);
    });

    test('Select manage projects', async () => {
        let tabs = wrapper.findAll('.nav-link');
        expect(tabs.length).toEqual(3);
        tabs.at(2).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('projects');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'projects'}}));
        expect(wrapper.findComponent({name: 'ManageProjects'}).vm.$props.course).toEqual(course);
    });

    test('Select late days', async () => {
        let tabs = wrapper.findAll('.nav-link');
        expect(tabs.length).toEqual(3);

        wrapper.vm.d_course!.num_late_days = 1;
        await wrapper.vm.$nextTick();

        tabs = wrapper.findAll('.nav-link');
        expect(tabs.length).toEqual(4);

        tabs.at(3).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_tab).toEqual('late_days');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'late_days'}}));
        expect(wrapper.findComponent({name: 'EditLateDays'}).vm.$props.course).toEqual(course);
    });
});


describe('Initially selected tab requested in query param', ()  => {
    test('Settings tab', async () => {
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'settings'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'CourseSettings'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'CourseSettings'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('settings');
        expect(wrapper.findComponent({name: 'CourseSettings'}).vm.$props.course).toEqual(course);
    });

    test('Admin roster tab', async () => {
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Admin_roster'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'AdminRoster'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'AdminRoster'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('Admin_roster');
        expect(wrapper.findComponent({name: 'AdminRoster'}).vm.$props.course).toEqual(course);
    });

    test('Staff roster tab', async () => {
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Staff_roster'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'StaffRoster'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'StaffRoster'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('Staff_roster');
        expect(wrapper.findComponent({name: 'StaffRoster'}).vm.$props.course).toEqual(course);
    });

    test('Student roster tab', async () => {
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Student_roster'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'StudentRoster'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'StudentRoster'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('Student_roster');
        expect(wrapper.findComponent({name: 'StudentRoster'}).vm.$props.course).toEqual(course);
    });

    test('Handgrader roster tab', async () => {
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'Handgrader_roster'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'HandgraderRoster'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'HandgraderRoster'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('Handgrader_roster');
        expect(wrapper.findComponent({name: 'HandgraderRoster'}).vm.$props.course).toEqual(course);
    });

    test('Manage projects tab', async () => {
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'projects'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'ManageProjects'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'ManageProjects'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('projects');
        expect(wrapper.findComponent({name: 'ManageProjects'}).vm.$props.course).toEqual(course);
    });

    test('Late days tab', async () => {
        course.num_late_days = 1;
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'late_days'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'EditLateDays'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'EditLateDays'}).element).toBeVisible();
        expect(wrapper.vm.current_tab).toEqual('late_days');
        expect(wrapper.findComponent({name: 'EditLateDays'}).vm.$props.course).toEqual(course);
    });

    test('Late days tab requested, no late days, defaults to settings', async () => {
        let wrapper = managed_shallow_mount(CourseAdmin, {
            mocks: get_router_mocks({current_tab: 'late_days'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'CourseSettings'}).exists())
        ).toBe(true);

        expect(wrapper.findComponent({name: 'EditLateDays'}).exists()).toBe(false);
        expect(wrapper.vm.current_tab).toEqual('settings');
    });
});

test('Component observes course changes', async () => {
    let wrapper = managed_shallow_mount(CourseAdmin, {mocks: get_router_mocks()});
    expect(await wait_for_load(wrapper)).toBe(true);

    let updated_course = deep_copy(course, Course);
    updated_course.name = 'A very new name';

    Course.notify_course_changed(updated_course);

    expect(wrapper.vm.d_course).toBe(course);
    expect(wrapper.vm.d_course).toEqual(updated_course);

    let other_course = data_ut.make_course();
    Course.notify_course_changed(other_course);

    expect(wrapper.vm.d_course).toEqual(updated_course);
});
