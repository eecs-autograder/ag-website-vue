import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import ProjectStats from '@/components/project_admin/project_stats/project_stats.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, wait_fixed, wait_until } from '@/tests/utils';

let course: ag_cli.Course;
let project: ag_cli.Project;

let get_staff_stub: sinon.SinonStub;
let get_admins_stub: sinon.SinonStub;

beforeEach(() => {
    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);

    get_staff_stub = sinon.stub(course, 'get_staff').resolves([]);
    get_admins_stub = sinon.stub(course, 'get_admins').resolves([]);
});

test('Staff and admins loaded initially', async () => {
    let staff = Array(3).fill(null).map(item => data_ut.make_user());
    get_staff_stub.resolves(staff);
    let admins = Array(2).fill(null).map(item => data_ut.make_user());
    get_admins_stub.resolves(admins);

    let wrapper = managed_mount(ProjectStats, {
        propsData: {
            course: course,
            project: project,
        }
    });
    await wrapper.vm.$nextTick();
    expect(Array.from(wrapper.vm.d_staff_usernames).sort()).toEqual([
        ...staff.map(user => user.username),
        ...admins.map(user => user.username)
    ].sort());
});

test('Data load for Summary', async () => {
    let groups = Array(3).fill(null).map(item => data_ut.make_group(project.pk));

    let get_all_ultimate_submission_results_stub = sinon.stub(
        ag_cli.SubmissionResults, 'get_all_ultimate_submission_results'
    ).withArgs(project.pk).onFirstCall().resolves({
        count: 3, next: 'nrosetin', previous: null,
        results: [
            {
                username: groups[0].member_names[0],
                group: groups[0],
                ultimate_submission: data_ut.make_submission_with_results(groups[0])
            }
        ]
    }).onSecondCall().resolves({
        count: 3, next: null, previous: 'norseta',
        results: [
            {
                username: groups[1].member_names[0],
                group: groups[1],
                ultimate_submission: data_ut.make_submission_with_results(groups[1])
            },
            {
                username: groups[2].member_names[0],
                group: groups[2],
                ultimate_submission: data_ut.make_submission_with_results(groups[2])
            }
        ]
    });

    let wrapper = managed_mount(ProjectStats, {
        propsData: {
            course: course,
            project: project,
        },
        stubs: ['submission-score-histogram']
    });
    await wait_fixed(wrapper, 5);

    // Nothing should get loaded until we open the collapsible
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(0);

    await wrapper.findComponent({ref: 'histogram_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_submission_results)).toBe(true);
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(2);
    expect(wrapper.vm.d_submission_results?.length).toEqual(3);

    // Collapse and re-open the collapsible, no data should be reloaded
    await wrapper.findComponent({ref: 'histogram_collapsible'}).trigger('click');
    await wrapper.findComponent({ref: 'histogram_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_submission_results)).toBe(true);
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(2);
});

test('Data load for Submissions over time', async () => {
    let groups = Array(3).fill(null).map(item => data_ut.make_group(project.pk));
    let get_groups_stub = sinon.stub(
        ag_cli.Group, 'get_all_from_project'
    ).withArgs(project.pk).resolves(groups);

    sinon.stub(ag_cli.Submission, 'get_all_from_group').withArgs(groups[0].pk).resolves(
        Array(2).fill(null).map(item => data_ut.make_submission(groups[0]))
    ).withArgs(groups[1].pk).resolves(
        Array(3).fill(null).map(item => data_ut.make_submission(groups[1]))
    ).withArgs(groups[2].pk).resolves([]);

    let wrapper = managed_mount(ProjectStats, {
        propsData: {
            course: course,
            project: project,
        },
        stubs: ['submissions-over-time-graph']
    });
    await wait_fixed(wrapper, 5);

    // Nothing should get loaded until we open the collapsible
    expect(get_groups_stub.callCount).toEqual(0);

    await wrapper.findComponent({ref: 'submissions_over_time_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_all_submissions)).toBe(true);
    expect(get_groups_stub.callCount).toEqual(1);
    expect(wrapper.vm.d_all_submissions?.length).toEqual(5);

    // Collapse and re-open the collapsible, no data should be reloaded
    await wrapper.findComponent({ref: 'submissions_over_time_collapsible'}).trigger('click');
    await wrapper.findComponent({ref: 'submissions_over_time_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_all_submissions)).toBe(true);
    expect(get_groups_stub.callCount).toEqual(1);
});

// Pass/fail counts uses the same data as score histogram
test('Data load for Pass Fail Counts', async () => {
    let get_all_ultimate_submission_results_stub = sinon.stub(
        ag_cli.SubmissionResults, 'get_all_ultimate_submission_results'
    ).withArgs(project.pk).onFirstCall().resolves({
        count: 0, next: null, previous: null, results: []
    });

    let wrapper = managed_mount(ProjectStats, {
        propsData: {
            course: course,
            project: project,
        },
        stubs: ['pass-fail-counts']
    });
    await wait_fixed(wrapper, 5);

    // Nothing should get loaded until we open the collapsible
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(0);

    await wrapper.findComponent({ref: 'pass_fail_counts_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_submission_results)).toBe(true);
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(1);
    expect(wrapper.vm.d_submission_results?.length).toEqual(0);

    // Collapse and re-open the collapsible, no data should be reloaded
    await wrapper.findComponent({ref: 'pass_fail_counts_collapsible'}).trigger('click');
    await wrapper.findComponent({ref: 'pass_fail_counts_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_submission_results)).toBe(true);
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(1);
});

// Re-uses data loading from submission score histogram and pass/fail counts
test('Data load for Final Score vs First Submission Time', async () => {
    let get_groups_stub = sinon.stub(
        ag_cli.Group, 'get_all_from_project'
    ).withArgs(project.pk).resolves([]);

    let get_all_ultimate_submission_results_stub = sinon.stub(
        ag_cli.SubmissionResults, 'get_all_ultimate_submission_results'
    ).withArgs(project.pk).resolves({
        count: 0, next: null, previous: null, results: []
    });

    let wrapper = managed_mount(ProjectStats, {
        propsData: {
            course: course,
            project: project,
        },
        stubs: ['submission-score-histogram', 'pass-fail-counts']
    });
    await wait_fixed(wrapper, 5);

    // Nothing should get loaded until we open the collapsible
    expect(get_groups_stub.callCount).toEqual(0);

    await wrapper.findComponent(
        {ref: 'final_score_vs_first_submission_collapsible'}).trigger('click');
    expect(
        await wait_until(wrapper, w => !w.vm.d_loading_first_submissions_by_group)
    ).toBe(true);
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(1);
    expect(get_groups_stub.callCount).toEqual(1);

    // Collapse and re-open the collapsible, no data should be reloaded
    await wrapper.findComponent(
        {ref: 'final_score_vs_first_submission_collapsible'}).trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.findComponent(
        {ref: 'final_score_vs_first_submission_collapsible'}).trigger('click');
    expect(
        await wait_until(wrapper, w => !w.vm.d_loading_first_submissions_by_group)
    ).toBe(true);
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(1);
    expect(get_groups_stub.callCount).toEqual(1);

    // Coverage for the reload method
    await wrapper.vm.reload_final_score_vs_first_submission();
    expect(
        await wait_until(wrapper, w => !w.vm.d_loading_first_submissions_by_group)
    ).toBe(true);
    expect(get_all_ultimate_submission_results_stub.callCount).toEqual(2);
    expect(get_groups_stub.callCount).toEqual(2);
});

test('Include staff checkbox', async () => {
    let groups = Array(3).fill(null).map(item => data_ut.make_group(project.pk));
    sinon.stub(ag_cli.Group, 'get_all_from_project').withArgs(project.pk).resolves(groups);

    get_staff_stub.resolves([groups[0].members[0]]);
    get_admins_stub.resolves([groups[1].members[0]]);

    sinon.stub(ag_cli.Submission, 'get_all_from_group')
        .withArgs(groups[0].pk).resolves([data_ut.make_submission(groups[0])])
        .withArgs(groups[1].pk).resolves([data_ut.make_submission(groups[1])])
        .withArgs(groups[2].pk).resolves([data_ut.make_submission(groups[2])]);

    sinon.stub(
        ag_cli.SubmissionResults, 'get_all_ultimate_submission_results'
    ).withArgs(project.pk).onFirstCall().resolves({
        count: 3, next: null, previous: null,
        results: groups.map(group => {
            return {
                username: group.member_names[0],
                group: group,
                ultimate_submission: data_ut.make_submission_with_results(group)
            };
        })
    });

    let wrapper = managed_mount(ProjectStats, {
        propsData: {
            course: course,
            project: project,
        },
        stubs: ['submission-score-histogram', 'pass-fail-counts']
    });
    await wait_fixed(wrapper, 5);

    await wrapper.findComponent({ref: 'submissions_over_time_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_all_submissions)).toBe(true);

    await wrapper.findComponent({ref: 'pass_fail_counts_collapsible'}).trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_loading_submission_results)).toBe(true);

    let checkbox = wrapper.find('[data-testid=include_staff_checkbox]');
    expect(checkbox_is_checked(checkbox)).toBe(true);
    expect(wrapper.vm.submission_results?.length).toEqual(3);
    expect(wrapper.vm.all_submissions?.length).toEqual(3);

    await checkbox.trigger('click');
    expect(checkbox_is_checked(checkbox)).toBe(false);
    expect(wrapper.vm.submission_results?.length).toEqual(1);
    expect(wrapper.vm.all_submissions?.length).toEqual(1);
});
