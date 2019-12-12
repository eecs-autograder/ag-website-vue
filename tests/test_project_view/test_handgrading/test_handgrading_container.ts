import { Vue } from 'vue-property-decorator';

import { Wrapper, WrapperArray } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import GroupSummaryPanel from '@/components/project_view/handgrading/group_summary_panel.vue';
import Handgrading from '@/components/project_view/handgrading/handgrading.vue';
import HandgradingContainer from '@/components/project_view/handgrading/handgrading_container.vue';
import { HandgradingStatus } from '@/components/project_view/handgrading/handgrading_status';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, compress_whitespace, find_by_name, wait_until } from '@/tests/utils';

let course: ag_cli.Course;
let project: ag_cli.Project;
let rubric: ag_cli.HandgradingRubric;

let no_submissions_group: ag_cli.GroupWithHandgradingResultSummary;
let ungraded_group: ag_cli.GroupWithHandgradingResultSummary;
let in_progress_group: ag_cli.GroupWithHandgradingResultSummary;
let graded_group: ag_cli.GroupWithHandgradingResultSummary;
let staff_group: ag_cli.GroupWithHandgradingResultSummary;

let get_staff_stub: sinon.SinonStub;
let get_all_summaries_stub: sinon.SinonStub;
let get_or_create_stub: sinon.SinonStub;

beforeEach(() => {
    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);
    rubric = data_ut.make_handgrading_rubric(project.pk);

    get_staff_stub = sinon.stub(course, 'get_staff').resolves([]);
    get_all_summaries_stub = sinon.stub(
        ag_cli.HandgradingResult, 'get_all_summaries_from_project'
    ).rejects(new ag_cli.HttpError(500, 'Mock me please'));
    get_or_create_stub = sinon.stub(
        ag_cli.HandgradingResult, 'get_or_create'
    ).rejects(new ag_cli.HttpError(500, 'Mock me please'));

    no_submissions_group = data_ut.make_group_summary(
        project.pk, 1, {member_names: ['none@me.com']});
    ungraded_group = data_ut.make_group_summary(
        project.pk, 1, {member_names: ['not_yet@me.com'], num_submissions: 1});
    in_progress_group = data_ut.make_group_summary(
        project.pk, 1, {member_names: ['progress@me.com'], num_submissions: 1},
        {
            finished_grading: false,
            total_points: 4,
            total_points_possible: 6
        }
    );
    graded_group = data_ut.make_group_summary(
        project.pk, 1, {member_names: ['graded@me.com'], num_submissions: 1},
        {
            finished_grading: true,
            total_points: 5,
            total_points_possible: 6
        }
    );

    let staff = [
        data_ut.make_user({username: 'staff1@spam.com'}),
        data_ut.make_user({username: 'staff2@spam.com'})
    ];
    staff_group = data_ut.make_group_summary(
        project.pk, 1,
        {member_names: staff.map(user => user.username), num_submissions: 1},
        {
            finished_grading: true,
            total_points: 6,
            total_points_possible: 6
        }
    );
    get_staff_stub.resolves(staff);
});

describe('Filter group summaries tests', () => {
    let wrapper: Wrapper<HandgradingContainer>;

    beforeEach(async () => {
        set_summaries([
            no_submissions_group,
            ungraded_group,
            in_progress_group,
            graded_group,
            staff_group,
        ]);

        wrapper = await make_wrapper();
    });

    test('Include/exclude staff', async () => {
        expect(checkbox_is_checked(wrapper.find('#include-staff'))).toBe(false);
        expect(wrapper.vm.d_include_staff).toBe(false);
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(4);
        expect(summary_pks(wrapper).includes(staff_group.pk)).toBe(false);

        wrapper.find('#include-staff').setChecked();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_include_staff).toBe(true);
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(5);
        expect(summary_pks(wrapper).includes(staff_group.pk)).toBe(true);
    });

    test('Filter by status', async () => {
        expect(checkbox_is_checked(wrapper.find('#all'))).toBe(true);
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(4);
        expect(summary_pks(wrapper)).toEqual([
            no_submissions_group.pk,
            ungraded_group.pk,
            in_progress_group.pk,
            graded_group.pk,
        ]);

        wrapper.find('#graded').setChecked();
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(1);
        expect(summary_pks(wrapper)).toEqual([graded_group.pk]);

        wrapper.find('#in-progress').setChecked();
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(1);
        expect(summary_pks(wrapper)).toEqual([in_progress_group.pk]);

        wrapper.find('#ungraded').setChecked();
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(1);
        expect(summary_pks(wrapper)).toEqual([ungraded_group.pk]);

        wrapper.find('#no-submission').setChecked();
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(1);
        expect(summary_pks(wrapper)).toEqual([no_submissions_group.pk]);
    });

    test('Filter by username', async () => {
        wrapper.find('.sidebar-footer input[type=text]').setValue('progress');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(1);
        expect(summary_pks(wrapper)).toEqual([in_progress_group.pk]);

        wrapper.vm.d_include_staff = true;
        wrapper.find('.sidebar-footer input[type=text]').setValue('taff2');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(1);
        expect(summary_pks(wrapper)).toEqual([staff_group.pk]);
    });

    test('Grading progress', async () => {
        expect(wrapper.vm.d_include_staff).toBe(false);
        expect(
            compress_whitespace(wrapper.find({ref: 'progress_text'}).text())
        ).toEqual('1/3 (4 total)');

        wrapper.vm.d_include_staff = true;
        await wrapper.vm.$nextTick();

        expect(
            compress_whitespace(wrapper.find({ref: 'progress_text'}).text())
        ).toEqual('2/4 (5 total)');

        wrapper.vm.d_status_filter = HandgradingStatus.graded;
        await wrapper.vm.$nextTick();

        expect(
            compress_whitespace(wrapper.find({ref: 'progress_text'}).text())
        ).toEqual('2/4 (5 total)');

        wrapper.vm.d_search_text = 'staff';
        await wrapper.vm.$nextTick();

        expect(
            compress_whitespace(wrapper.find({ref: 'progress_text'}).text())
        ).toEqual('2/4 (5 total)');
    });
});

test('Load and display paginated group summaries', async () => {
    get_all_summaries_stub.withArgs(project.pk).onFirstCall().resolves({
        count: 5,
        next: '/i/am/url',
        previous: null,
        results: [no_submissions_group]
    });
    get_all_summaries_stub.withArgs(project.pk).onSecondCall().resolves({
        count: 5,
        next: '/i/am/url',
        previous: null,
        results: [ungraded_group, in_progress_group]
    });
    get_all_summaries_stub.withArgs(project.pk).onThirdCall().resolves({
        count: 5,
        next: null,
        previous: null,
        results: [graded_group, staff_group]
    });

    let wrapper = await make_wrapper();
    wrapper.vm.d_include_staff = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll({name: 'GroupSummaryPanel'}).length).toBe(5);
    expect(summary_pks(wrapper)).toEqual([
        no_submissions_group.pk,
        ungraded_group.pk,
        in_progress_group.pk,
        graded_group.pk,
        staff_group.pk,
    ]);

    expect(get_all_summaries_stub.firstCall.args[1].page_num).toEqual(1);
    expect(get_all_summaries_stub.secondCall.args[1].page_num).toEqual(2);
    expect(get_all_summaries_stub.thirdCall.args[1].page_num).toEqual(3);
    expect(get_all_summaries_stub.callCount).toEqual(3);
});

function summary_pks(wrapper_: Wrapper<HandgradingContainer>): number[] {
    return (<WrapperArray<GroupSummaryPanel>> wrapper_.findAll(
        {name: 'GroupSummaryPanel'}
    )).wrappers.map(w => w.vm.group_summary.pk);
}

describe('Select group tests', () => {
    let wrapper: Wrapper<HandgradingContainer>;

    beforeEach(async () => {
        set_summaries([no_submissions_group, ungraded_group, graded_group]);
        wrapper = await make_wrapper();
    });

    test('Select ungraded group for grading', async () => {
        let result = data_ut.make_handgrading_result(rubric, ungraded_group.pk, 42);
        get_or_create_stub.withArgs(ungraded_group.pk).resolves(result);
        expect(wrapper.find({name: 'Handgrading'}).exists()).toBe(false);

        wrapper.findAll({name: 'GroupSummaryPanel'}).at(1).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_currently_grading).toEqual(result);
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(result);
    });

    test('Select graded group for grading', async () => {
        let result = data_ut.make_handgrading_result(rubric, graded_group.pk, 42);
        get_or_create_stub.withArgs(graded_group.pk).resolves(result);
        expect(wrapper.find({name: 'Handgrading'}).exists()).toBe(false);

        wrapper.findAll({name: 'GroupSummaryPanel'}).at(2).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_currently_grading).toEqual(result);
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(result);
    });

    test('Group selected for grading has no submissions', async () => {
        expect(wrapper.find({name: 'Handgrading'}).exists()).toBe(false);
        wrapper.findAll({name: 'GroupSummaryPanel'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_currently_grading).toBe(null);
        expect(wrapper.find({name: 'Handgrading'}).exists()).toBe(false);
    });
});

describe('Select next/prev for grading', () => {
    let ungraded_result: ag_cli.HandgradingResult;
    let graded_result: ag_cli.HandgradingResult;

    beforeEach(() => {
        ungraded_result = data_ut.make_handgrading_result(rubric, ungraded_group.pk, 42);
        graded_result = data_ut.make_handgrading_result(rubric, graded_group.pk, 43);

        get_or_create_stub.withArgs(ungraded_group.pk).resolves(ungraded_result);
        get_or_create_stub.withArgs(graded_group.pk).resolves(graded_result);
    });

    test('Select next or prev group on event', async () => {
        set_summaries([ungraded_group, graded_group]);
        let wrapper = await make_wrapper();

        wrapper.findAll({name: 'GroupSummaryPanel'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(ungraded_result);

        wrapper.find({name: 'Handgrading'}).vm.$emit('next_group');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(graded_result);

        wrapper.find({name: 'Handgrading'}).vm.$emit('prev_group');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(ungraded_result);
    });

    test('Select next and prev skips no_submission', async () => {
        set_summaries([ungraded_group, no_submissions_group, graded_group]);
        let wrapper = await make_wrapper();

        wrapper.findAll({name: 'GroupSummaryPanel'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(ungraded_result);

        wrapper.find({name: 'Handgrading'}).vm.$emit('next_group');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(graded_result);

        wrapper.find({name: 'Handgrading'}).vm.$emit('prev_group');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(ungraded_result);
    });

    test('Current group is first or last', async () => {
        set_summaries([ungraded_group, graded_group]);
        let wrapper = await make_wrapper();

        wrapper.findAll({name: 'GroupSummaryPanel'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(ungraded_result);
        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_first).toBe(true);
        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_last).toBe(false);

        wrapper.find({name: 'Handgrading'}).vm.$emit('next_group');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(graded_result);
        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_first).toBe(false);
        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_last).toBe(true);
    });

    test('Current group is first with submission', async () => {
        set_summaries([no_submissions_group, ungraded_group, graded_group]);

        let wrapper = await make_wrapper();
        wrapper.findAll({name: 'GroupSummaryPanel'}).at(1).trigger('click');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(ungraded_result);

        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_first).toBe(true);
        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_last).toBe(false);
    });

    test('Current group is last with submission', async () => {
        set_summaries([ungraded_group, graded_group, no_submissions_group]);

        let wrapper = await make_wrapper();
        wrapper.findAll({name: 'GroupSummaryPanel'}).at(1).trigger('click');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(graded_result);

        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_first).toBe(false);
        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_last).toBe(true);
    });

    test('Current group is only group', async () => {
        set_summaries([ungraded_group]);

        let wrapper = await make_wrapper();
        wrapper.findAll({name: 'GroupSummaryPanel'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(
            find_by_name<Handgrading>(wrapper, 'Handgrading').vm.handgrading_result
        ).toEqual(ungraded_result);

        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_first).toBe(true);
        expect(find_by_name<Handgrading>(wrapper, 'Handgrading').vm.is_last).toBe(true);
    });
});

test('Handgrading result created', async () => {
    set_summaries([ungraded_group]);
    let wrapper = await make_wrapper();
    expect(wrapper.vm.d_result_summaries[0].handgrading_result).toBeNull();

    let ungraded_result = data_ut.make_handgrading_result(
        rubric, ungraded_group.pk, 42,
        {
            total_points: 3,
            total_points_possible: 8,
            finished_grading: false
        }
    );
    ag_cli.HandgradingResult.notify_handgrading_result_created(ungraded_result);
    expect(wrapper.vm.d_result_summaries[0].handgrading_result).toEqual({
        total_points: 3,
        total_points_possible: 8,
        finished_grading: false
    });
});

test('Handgrading result updated', async () => {
    set_summaries([in_progress_group]);
    let wrapper = await make_wrapper();
    expect(wrapper.vm.d_result_summaries[0].handgrading_result).toEqual(
        in_progress_group.handgrading_result
    );

    let changed_result = data_ut.make_handgrading_result(
        rubric, in_progress_group.pk, 42, in_progress_group.handgrading_result!
    );
    changed_result.total_points += 1;
    changed_result.finished_grading = true;

    ag_cli.HandgradingResult.notify_handgrading_result_changed(changed_result);
    expect(wrapper.vm.d_result_summaries[0].handgrading_result).toEqual({
        'total_points': changed_result.total_points,
        'total_points_possible': changed_result.total_points_possible,
        'finished_grading': changed_result.finished_grading,
    });
});

test('Header is "Students" or "Groups based on max group size"', async () => {
    project.max_group_size = 1;
    set_summaries([]);
    let wrapper = await make_wrapper();
    expect(wrapper.find('.sidebar-header .header-text').text()).toEqual('Students');

    project.max_group_size = 2;
    wrapper.vm.$forceUpdate();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sidebar-header .header-text').text()).toEqual('Groups');
});

function set_summaries(summaries: ag_cli.GroupWithHandgradingResultSummary[]) {
    get_all_summaries_stub.resolves({
        count: summaries.length,
        next: null,
        previous: null,
        results: summaries,
    });
}

async function make_wrapper() {
    let wrapper = managed_mount(HandgradingContainer, {
        propsData: {
            course: course,
            project: project,
            handgrading_rubric: data_ut.make_handgrading_rubric(project.pk)
        }
    });
    await wait_until(wrapper, w => !w.vm.d_loading_result_summaries);
    return wrapper;
}
