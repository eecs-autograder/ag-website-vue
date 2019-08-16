import VueRouter from 'vue-router';

import { config, createLocalVue, mount, Wrapper } from '@vue/test-utils';

import { Course, Project, Semester, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import CourseAdmin, { RosterChoice } from '@/components/course_admin/course_admin.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Changing Tabs', ()  => {
    let wrapper: Wrapper<CourseAdmin>;
    let component: CourseAdmin;
    let course_1: Course;
    let user: User;
    let roster: User[];
    let projects: Project[];
    let original_match_media: (query: string) => MediaQueryList;
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

    beforeEach(() => {
        course_1 = data_ut.make_course();

        user = new User({
            pk: 1, username: "amandaplease@umich.edu", first_name: "Amanda", last_name: "Bynes",
            email: "amandaplease@umich.edu", is_superuser: true
        });

        roster = [user];
        projects = [];

        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course_1));

        config.logModifiedComponents = false;
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(CourseAdmin, {
            localVue,
            router
        });
        component = wrapper.vm;
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

    test('Clicking on roster tab with role selected = "Admin"', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course_1, 'get_admins').returns(Promise.resolve(roster));

        wrapper.find('.roster-tab-header').trigger('click');
        await component.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Admin");
        highlighted_item.trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.admin);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'admin_roster'}}
        )).toBe(true);
    });

    test('Clicking on roster tab with role selected = "Staff"', async () => {
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course_1, 'get_staff').returns(Promise.resolve(roster));

        await component.$nextTick();
        wrapper.find('.roster-tab-header').trigger('click');
        await component.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await component.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Staff");
        highlighted_item.trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.staff);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'staff_roster'}})
        ).toBe(true);
    });

    test('Clicking on roster tab with role selected = "Student"', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course_1, 'get_students').returns(Promise.resolve(roster));

        wrapper.find('.roster-tab-header').trigger('click');
        await component.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await component.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Student");
        highlighted_item.trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.student);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'student_roster'}}
        )).toBe(true);
    });

    test('Clicking on roster tab with role selected = "Handgrader"', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course_1, 'get_handgraders').returns(Promise.resolve(roster));

        wrapper.find('.roster-tab-header').trigger('click');
        await component.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await component.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Handgrader");
        highlighted_item.trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.handgrader);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'handgrader_roster'}}
        )).toBe(true);
    });

    test('Pressing enter on roster tab with role selected = "Handgrader"', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(course_1, 'get_handgraders').returns(Promise.resolve(roster));

        wrapper.find('.roster-tab-header').trigger('click');
        await component.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await component.$nextTick();

        let highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain("Handgrader");
        highlighted_item.trigger("keydown", {code: "Enter" });
        await component.$nextTick();
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.handgrader);
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'handgrader_roster'}})
        ).toBe(true);
    });

    test('Clicking on manage_projects tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve(projects));

        let tabs = wrapper.findAll('.tab-label');
        expect(tabs.length).toEqual(3);
        tabs.at(2).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(2);
        expect(component.role_selected).toEqual("");
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'manage_projects'}}));
    });

    test('Clicking on settings tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(2).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(2);
        expect(component.role_selected).toEqual("");

        tabs.at(0).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(0);
        expect(component.role_selected).toEqual("");
        expect(router_replace.calledTwice).toBe(true);
        expect(router_replace.secondCall.calledWith({ query: { current_tab: 'settings'}}));
    });
});


describe('select_tab function called with different values associated with "current_tab" ' +
         'key on create',
         ()  => {
    let wrapper: Wrapper<CourseAdmin>;
    let component: CourseAdmin;
    let course: Course;
    let roster: User[];
    let projects: Project[];
    let original_match_media: (query: string) => MediaQueryList;

    const $route = {
      path: '/web/course_admin/:course_id',
      params: {
          course_id: '2'
      },
      query: { }
    };

    beforeEach(() => {
        course = data_ut.make_course();

        roster = [];
        projects = [];

        sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));
        sinon.stub(course, 'get_admins').returns(Promise.resolve(roster));
        sinon.stub(course, 'get_staff').returns(Promise.resolve(roster));
        sinon.stub(course, 'get_students').returns(Promise.resolve(roster));
        sinon.stub(course, 'get_handgraders').returns(Promise.resolve(roster));
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve(projects));

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

    test('current_tab parameter value = settings', async () => {
        $route.query = { current_tab: 'settings' };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(0);
        expect(component.role_selected).toEqual("");
        expect(component.loading).toEqual(false);
    });

    test('current_tab parameter value = admin_roster', async () => {
        $route.query = { current_tab: 'admin_roster' };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.admin);
    });

    test('current_tab parameter value = staff_roster', async () => {
        $route.query = { current_tab: 'staff_roster' };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.staff);
    });

    test('current_tab parameter value = student_roster', async () => {
        $route.query = { current_tab: 'student_roster' };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.student);
    });

    test('current_tab parameter value = handgrader_roster', async () => {
        $route.query = { current_tab: 'handgrader_roster' };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(1);
        expect(component.role_selected).toEqual(RosterChoice.handgrader);
    });

    test('current_tab parameter value = manage_projects', async () => {
        $route.query = { current_tab: 'manage_projects' };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(2);
        expect(component.role_selected).toEqual("");
    });

    test('current_tab parameter value = empty string', async () => {
        $route.query = { current_tab: '' };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(0);
        expect(component.role_selected).toEqual("");
    });

    test('current_tab parameter value = array of values', async () => {
        $route.query = { current_tab: ['manage_projects', 'another_tab'] };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(2);
        expect(component.role_selected).toEqual("");
    });

    test('current_tab parameter value = null', async () => {
        $route.query = { };
        wrapper = mount(CourseAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course);
        expect(component.current_tab_index).toEqual(0);
        expect(component.role_selected).toEqual("");
    });
});
