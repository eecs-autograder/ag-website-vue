import ProjectAdmin from '@/components/project_admin/project_admin.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';

import * as sinon from 'sinon';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ProjectAdmin Tests', () => {
    let wrapper: Wrapper<ProjectAdmin>;
    let component: ProjectAdmin;
    let project_1: Project;
    let original_match_media: (query: string) => MediaQueryList;
    const $route = {
        path: '/web/project_admin/:projectId',
        params: {
            projectId: '3'
        }
    };

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
            hide_ultimate_submission_fdbk: false
        });

        sinon.stub(Project, 'get_by_pk').returns(Promise.resolve(project_1));

        wrapper = mount(ProjectAdmin, {
            mocks: {
                $route
            }
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

    test('Project gets fetched', async () => {
        await component.$nextTick();

        expect(component.d_loading).toBe(false);
        expect(component.project).toEqual(project_1);
        expect(component.current_tab_index).toEqual(0);
    });

    test('Update tabs', async () => {
        await component.$nextTick();
        expect(component.current_tab_index).toEqual(0);

        wrapper.findAll('.tab-label').at(2).trigger('click');
        await component.$nextTick();
        expect(component.current_tab_index).toBe(2);
    });
});
