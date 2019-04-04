import ProjectSubmission from '@/components/project_submission/project_submission.vue';
import { config, createLocalVue, mount, Wrapper } from '@vue/test-utils';
import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import * as sinon from 'sinon';
import VueRouter from 'vue-router';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Changing Tabs', ()  => {
    let wrapper: Wrapper<ProjectSubmission>;
    let component: ProjectSubmission;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;
    // tslint:disable-next-line naming-convention
    const localVue = createLocalVue();
    localVue.use(VueRouter);

    const routes = [
        {
            path: '/web/project/:project_id',
            name: "project_submission",
            component: ProjectSubmission
        }
    ];

    const router = new VueRouter ({
        routes: routes,
        mode: 'history'
    });

    beforeEach(() => {

        project = new Project({
            pk: 44,
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
            hide_ultimate_submission_fdbk: false
        });

        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project));

        config.logModifiedComponents = false;
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(ProjectSubmission, {
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

    test('Clicking on submit tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        expect(tabs.length).toEqual(3);
        tabs.at(1).trigger('click');
        await component.$nextTick();

        tabs.at(0).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(0);
        expect(router_replace.calledTwice).toBe(true);
        expect(router_replace.secondCall.calledWith({ query: { current_tab: 'submit'}}));
    });

    test('Clicking on submissions tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(1).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(1);
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'my_submissions'}}));
    });

    test('Clicking on student_lookup tab', async () => {
        await component.$nextTick();
        let router_replace = sinon.stub(router, 'replace');

        let tabs = wrapper.findAll('.tab-label');
        tabs.at(2).trigger('click');
        await component.$nextTick();

        expect(component.current_tab_index).toEqual(2);
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({ query: { current_tab: 'student_lookup'}}));
    });
});


describe('select_tab function called with different values associated with "current_tab" ' +
         'key on create',
         ()  => {
    let wrapper: Wrapper<ProjectSubmission>;
    let component: ProjectSubmission;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    const $route = {
        path: '/web/project/:project_id',
        params: {
            project_id: '44'
        },
        query: { }
    };

    beforeEach(() => {

        project = new Project({
            pk: 44,
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
            hide_ultimate_submission_fdbk: false
        });

        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project));

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
        wrapper = mount(ProjectSubmission, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project);
        expect(component.current_tab_index).toEqual(0);
        expect(component.d_loading).toEqual(false);
    });

    test('current_tab parameter value = my_submissions', async () => {
        $route.query = { current_tab: 'my_submissions' };
        wrapper = mount(ProjectSubmission, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project);
        expect(component.current_tab_index).toEqual(1);
        expect(component.d_loading).toEqual(false);
    });

    test('current_tab parameter value = student_lookup', async () => {
        $route.query = { current_tab: 'student_lookup' };
        wrapper = mount(ProjectSubmission, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project);
        expect(component.current_tab_index).toEqual(2);
        expect(component.d_loading).toEqual(false);
    });

    test('current_tab parameter value = empty string', async () => {
        $route.query = { current_tab: '' };
        wrapper = mount(ProjectSubmission, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project);
        expect(component.current_tab_index).toEqual(0);
        expect(component.d_loading).toEqual(false);
    });

    test('current_tab parameter value = array of values', async () => {
        $route.query = { current_tab: ['student_lookup', 'submit'] };
        wrapper = mount(ProjectSubmission, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project);
        expect(component.current_tab_index).toEqual(2);
        expect(component.d_loading).toEqual(false);
    });

    test('current_tab parameter value = null', async () => {
        $route.query = { };
        wrapper = mount(ProjectSubmission, {
            mocks: {
                $route
            }
        });
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.project).toEqual(project);
        expect(component.current_tab_index).toEqual(0);
        expect(component.d_loading).toEqual(false);
    });
});
