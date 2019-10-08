import { Wrapper, WrapperArray } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import GroupSummaryPanel from '@/components/handgrading/group_summary_panel.vue';
import HandgradingContainer from '@/components/handgrading/handgrading_container.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, wait_for_load, wait_until, compress_whitespace } from '@/tests/utils';
import {HandgradingStatus} from '@/components/handgrading/handgrading_status';

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
        get_all_summaries_stub.resolves({
            count: 5,
            next: null,
            previous: null,
            results: [
                no_submissions_group,
                ungraded_group,
                in_progress_group,
                graded_group,
                staff_group,
            ],
        });

        wrapper = managed_mount(HandgradingContainer, {
            propsData: {
                course: course,
                project: project,
                handgrading_rubric: data_ut.make_handgrading_rubric(project.pk)
            }
        });
        await wait_until(wrapper, w => !w.vm.d_loading_result_summaries);
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

    function summary_pks(wrapper_: Wrapper<HandgradingContainer>): number[] {
        return (<WrapperArray<GroupSummaryPanel>> wrapper_.findAll(
            {name: 'GroupSummaryPanel'}
        )).wrappers.map(w => w.vm.group_summary.pk);
    }
});

test('Load and display paginated group summaries', async () => {
    fail();
});

test('Select group for grading', async () => {
    fail();
});

test('Group selected for grading has no submissions', async () => {
    fail();
});

test('Select next group on event', async () => {
    fail();
});

test('Select prev group on event', async () => {
    fail();
});

test('Handgrading result created', async () => {
    fail();
});

test('Handgrading result updated', async () => {
    fail();
});

test('Header is "Students" or "Groups based on max group size"', async () => {
    fail();
});
