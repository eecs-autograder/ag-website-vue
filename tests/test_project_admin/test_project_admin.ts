import VueRouter from 'vue-router';

import { config, createLocalVue, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuite,
    Course,
    ExpectedStudentFile,
    Group,
    InstructorFile,
    Project,
    Semester,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import ProjectAdmin from '@/components/project_admin/project_admin.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

let course = new Course({
   pk: 4,
   name: 'A Course',
   semester: Semester.fall,
   year: 2018,
   subtitle: '',
   num_late_days: 0,
   allowed_guest_domain: '@llama.edu',
   last_modified: ''
});

beforeEach(() => {
   sinon.stub(Course, 'get_by_pk').returns(Promise.resolve(course));
});

afterEach(() => {
    sinon.restore();
});

// As child components of the ProjectAdmin component get merged, their methods that make api calls
// in created() will need to be stubbed in these tests.
describe('Changing tabs in project admin', () => {
    let wrapper: Wrapper<ProjectAdmin>;
    let component: ProjectAdmin;
    let project_1: Project;
    let original_match_media: (query: string) => MediaQueryList;
    // tslint:disable-next-line naming-convention
    const localVue = createLocalVue();
    localVue.use(VueRouter);

    const routes = [
        { path: '/web/project_admin/:project_id', name: "project_admin", component: ProjectAdmin}
    ];

    const router = new VueRouter({
        routes: routes,
        mode: "history"
    });

    beforeEach(() => {

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return { matches: true };
            })
        });

        project_1 = new Project({
            pk: 3,
            name: "Project 200",
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
            expected_student_files: []
        });

        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project_1));
        sinon.stub(Group, 'get_all_from_project').returns(
            Promise.resolve([])
        );

        wrapper = mount(ProjectAdmin, {
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

    test('Clicking on Settings', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(1).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(router_replace.calledOnce);

        tabs.at(0).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(0);
        expect(router_replace.secondCall.calledWith(
            { query: { current_tab: 'settings'}})
        ).toBe(true);
    });

    test('Clicking on Instructor Files tab', async () => {
        sinon.stub(InstructorFile, 'get_all_from_project').returns(
            Promise.resolve([])
        );
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(1).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'instructor_files'}})
        ).toBe(true);
    });

    test('Clicking on Expected Student Files tab', async () => {
        sinon.stub(ExpectedStudentFile, "get_all_from_project").returns(
            Promise.resolve([])
        );
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(2).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(2);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'expected_student_files'}})
        ).toBe(true);
    });

    test('Clicking on Test Cases tab', async () => {
        sinon.stub(AGTestSuite, 'get_all_from_project').returns(
            Promise.resolve([])
        );
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(3).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(3);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'test_cases'}})
        ).toBe(true);
    });

    test('Clicking on Mutation Testing tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(4).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(4);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'mutation_testing'}})
        ).toBe(true);
    });

    test('Clicking on Edit Groups tab', async () => {
        // let get_all_groups_stub = sinon.stub(Group, 'get_all_from_project').returns(
        //     Promise.resolve([])
        // );
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(5).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(5);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'edit_groups'}})
        ).toBe(true);
        // expect(get_all_groups_stub.calledOnce).toBe(true);
    });

    test('Clicking on Download Grades tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(6).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(6);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'download_grades'}})
        ).toBe(true);
    });

    test('Clicking on Rerun Tests tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(7).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(7);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'rerun_tests'}})
        ).toBe(true);
    });

    test('Clicking on Configure Handgrading tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(8).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(8);
        expect(router_replace.firstCall.calledWith(
            { query: { current_tab: 'configure_handgrading'}})
        ).toBe(true);
    });
});

describe('select_tab function called with different values associated with "current_tab" ' +
         'key on create',
         () => {
    let wrapper: Wrapper<ProjectAdmin>;
    let component: ProjectAdmin;
    let project_1: Project;
    let original_match_media: (query: string) => MediaQueryList;

    const $route = {
        path: '/web/project_admin/:project_id',
        params: {
            project_id: '3'
        },
        query: { }
    };

    beforeEach(() => {
        project_1 = new Project({
            pk: 3,
            name: "Project 200",
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
            expected_student_files: []
        });

        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project_1));
        sinon.stub(Group, 'get_all_from_project').returns(
            Promise.resolve([])
        );

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

    test('current tab parameter value = settings', async () => {
       $route.query = { current_tab: 'settings' };
       wrapper = mount(ProjectAdmin, {
           mocks: {
               $route
           }
       });
       component = wrapper.vm;
       await component.$nextTick();

       expect(component.project).toEqual(project_1);
       expect(component.current_tab_index).toEqual(0);
       expect(component.d_loading).toBe(false);
    });

    test('current tab parameter value = instructor_files', async () => {
        sinon.stub(InstructorFile, 'get_all_from_project').returns(
            Promise.resolve([])
        );
        $route.query = { current_tab: 'instructor_files' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(1);
    });

    test('current tab parameter value = expected_student_files', async () => {
        sinon.stub(ExpectedStudentFile, "get_all_from_project").returns(
            Promise.resolve([])
        );
        $route.query = { current_tab: 'expected_student_files' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(2);
    });


    test('current tab parameter value = test_cases', async () => {
        sinon.stub(AGTestSuite, 'get_all_from_project').returns(
            Promise.resolve([])
        );
        $route.query = { current_tab: 'test_cases' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(3);
    });

    test('current tab parameter value = mutation_testing', async () => {
        $route.query = { current_tab: 'mutation_testing' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(4);
    });


    test('current tab parameter value = edit_groups', async () => {
        // let get_all_groups_stub = sinon.stub(Group, 'get_all_from_project').returns(
        //     Promise.resolve([])
        // );
        $route.query = { current_tab: 'edit_groups' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(5);
        // expect(get_all_groups_stub.calledOnce).toBe(true);
    });


    test('current tab parameter value = download_grades', async () => {
        $route.query = { current_tab: 'download_grades' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(6);
    });

    test('current tab parameter value = rerun_tests', async () => {
        $route.query = { current_tab: 'rerun_tests' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(7);
    });

    test('current tab parameter value = configure_handgrading', async () => {
        $route.query = { current_tab: 'configure_handgrading' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(8);
    });

    test('current tab parameter value = empty string', async () => {
        $route.query = { current_tab: '' };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(0);
    });

    test('current tab parameter value = empty string', async () => {
        $route.query = { current_tab: ['edit_groups', 'dont_edit_groups'] };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(5);
    });

    test('current_tab query not provided', async () => {
        $route.query = { };
        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(0);
    });
});
