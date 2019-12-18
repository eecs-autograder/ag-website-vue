import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import RerunSubmissions from '@/components/project_admin/rerun_submissions/rerun_submissions.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    checkbox_is_checked,
    compress_whitespace,
    find_by_name,
    wait_for_load,
    wait_until,
} from '@/tests/utils';

let project: ag_cli.Project;

let groups: ag_cli.Group[];
let group1_submissions: ag_cli.Submission[];
let group2_submissions: ag_cli.Submission[];

let ag_test_suites: ag_cli.AGTestSuite[];
let mutation_test_suites: ag_cli.MutationTestSuite[];

let get_reruns_stub: sinon.SinonStub;
let get_mutation_test_suites_stub: sinon.SinonStub;

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);
    let group1 = data_ut.make_group(project.pk, 1, {member_names: ['user1']});
    group1_submissions = [
        data_ut.make_submission(group1),
        data_ut.make_submission(group1),
    ];
    let group2 = data_ut.make_group(project.pk, 1, {member_names: ['user2']});
    group2_submissions = [
        data_ut.make_submission(group2),
        data_ut.make_submission(group2),
        data_ut.make_submission(group2),
    ];

    groups = [group1, group2];

    let suite1 = data_ut.make_ag_test_suite(project.pk);
    suite1.ag_test_cases = [
        data_ut.make_ag_test_case(suite1.pk),
        data_ut.make_ag_test_case(suite1.pk),
    ];
    let suite2 = data_ut.make_ag_test_suite(project.pk);
    suite2.ag_test_cases = [
        data_ut.make_ag_test_case(suite2.pk),
        data_ut.make_ag_test_case(suite2.pk),
    ];

    ag_test_suites = [suite1, suite2];

    mutation_test_suites = [
        data_ut.make_mutation_test_suite(project.pk),
        data_ut.make_mutation_test_suite(project.pk),
    ];

    get_reruns_stub = sinon.stub(
        ag_cli.RerunSubmissionTask, 'get_all_from_project').withArgs(project.pk).resolves([]);
    sinon.stub(ag_cli.Group, 'get_all_from_project').withArgs(project.pk).resolves(groups);
    sinon.stub(
        ag_cli.AGTestSuite, 'get_all_from_project').withArgs(project.pk).resolves(ag_test_suites);
    get_mutation_test_suites_stub = sinon.stub(
        ag_cli.MutationTestSuite, 'get_all_from_project'
    ).withArgs(project.pk).resolves(mutation_test_suites);
});

async function make_wrapper() {
    let wrapper = managed_mount(RerunSubmissions, {
        propsData: {
            project: project,
        },
        stubs: {
            'submission-selector': true
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);
    return wrapper;
}

describe('Rerun list tests', () => {
    let create_task_stub: sinon.SinonStub;
    let new_tasks: ag_cli.RerunSubmissionTask[] = [];

    beforeEach(() => {
        create_task_stub = sinon.stub(ag_cli.RerunSubmissionTask, 'create');
        create_task_stub.callsFake((project_pk, args) => {
            let new_task = new ag_cli.RerunSubmissionTask({
                pk: 42,
                project: project_pk,
                progress: 0,
                has_error: false,
                ...args,
            });
            new_tasks.unshift(new ag_cli.RerunSubmissionTask(new_task));
            return Promise.resolve(new_task);
        });
    });

    test('New rerun added to top of list', async () => {
        let wrapper = await make_wrapper();
        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_rerun_tasks).toEqual(new_tasks);
        expect(wrapper.findAll({ref: 'task_row'}).length).toBe(1);

        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_rerun_tasks).toEqual(new_tasks);
        expect(wrapper.findAll({ref: 'task_row'}).length).toBe(2);
    });

    test('Manual refresh', async () => {
        let wrapper = await make_wrapper();
        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.progress-cell').text()).toEqual('0%');
        expect(wrapper.find('.refresh-icon').exists()).toBe(true);

        let updated = new ag_cli.RerunSubmissionTask(new_tasks[0]);
        updated.progress = 100;
        sinon.stub(ag_cli.RerunSubmissionTask, 'get_by_pk').withArgs(
            new_tasks[0].pk).resolves(updated);
        wrapper.find('.refresh-icon').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.progress-cell').text()).toEqual('100%');
        expect(wrapper.find('.refresh-icon').exists()).toBe(false);
    });

    test('Task has error', async () => {
        let wrapper = await make_wrapper();
        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.vm.d_rerun_tasks[0].has_error = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.progress-cell').text()).toContain('ERROR');
        expect(wrapper.find('.progress-cell').text()).toContain(
            `Rerun task ID: ${wrapper.vm.d_rerun_tasks[0].pk}`);
        expect(wrapper.find('.refresh-icon').exists()).toBe(false);
    });
});

test('Selecting and unselecting submissions', async () => {
    let wrapper = await make_wrapper();
    wrapper.find({name: 'GroupLookup'}).vm.$emit('update_group_selected', groups[0]);
    wrapper.find({name: 'GroupLookup'}).vm.$emit('update_group_selected', groups[1]);

    expect(wrapper.vm.d_selected_submissions.size()).toEqual(0);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(0).text())
    ).toEqual('0 submission(s)');

    wrapper.findAll({name: 'SubmissionSelector'}).at(0).vm.$emit(
        'submissions_selected', group1_submissions);
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(2);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(0).text())
    ).toEqual('2 submission(s)');
    expect(wrapper.vm.d_selected_submissions.has(group1_submissions[0])).toBe(true);
    expect(wrapper.vm.d_selected_submissions.has(group1_submissions[1])).toBe(true);

    wrapper.findAll({name: 'SubmissionSelector'}).at(1).vm.$emit(
        'submissions_selected', [group2_submissions[2]]);
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(3);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(0).text())
    ).toEqual('3 submission(s)');
    expect(wrapper.vm.d_selected_submissions.has(group1_submissions[0])).toBe(true);
    expect(wrapper.vm.d_selected_submissions.has(group1_submissions[1])).toBe(true);
    expect(wrapper.vm.d_selected_submissions.has(group2_submissions[2])).toBe(true);

    wrapper.findAll({name: 'SubmissionSelector'}).at(0).vm.$emit(
        'submissions_unselected', group1_submissions);
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(1);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(0).text())
    ).toEqual('1 submission(s)');
    expect(wrapper.vm.d_selected_submissions.has(group1_submissions[0])).toBe(false);
    expect(wrapper.vm.d_selected_submissions.has(group1_submissions[1])).toBe(false);

    wrapper.findAll({name: 'SubmissionSelector'}).at(1).vm.$emit(
        'submissions_unselected', [group2_submissions[2]]);
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(0);
});

test('Removing group unselects submissions', async () => {
    let wrapper = await make_wrapper();
    wrapper.find({name: 'GroupLookup'}).vm.$emit('update_group_selected', groups[0]);
    wrapper.find({name: 'GroupLookup'}).vm.$emit('update_group_selected', groups[1]);

    expect(wrapper.vm.d_selected_submissions.size()).toEqual(0);

    wrapper.findAll({name: 'SubmissionSelector'}).at(0).vm.$emit(
        'submissions_selected', group1_submissions);

    wrapper.findAll({name: 'SubmissionSelector'}).at(1).vm.$emit(
        'submissions_selected', [group2_submissions[0], group2_submissions[2]]);
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(4);

    wrapper.findAll({name: 'SubmissionSelector'}).at(1).vm.$emit('remove_group', groups[1]);
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(2);
    expect(wrapper.vm.d_selected_submissions.has(group2_submissions[0])).toBe(false);
    expect(wrapper.vm.d_selected_submissions.has(group2_submissions[2])).toBe(false);
});

test('Selecting and unselecting AG test suites', async () => {
    let wrapper = await make_wrapper();
    wrapper.find('#rerun-all-ag-test-cases').setChecked(false);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(0);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(1).text())
    ).toEqual('0 test case(s) from 0 suite(s)');
    let checkboxes = wrapper.findAll({ref: 'ag_test_suite_checkbox'});
    checkboxes.at(1).setChecked(true);
    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(1);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(1).text())
    ).toEqual('2 test case(s) from 1 suite(s)');
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(ag_test_suites[1].pk).size
    ).toEqual(0);

    checkboxes.at(0).setChecked(true);
    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(2);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(1).text())
    ).toEqual('4 test case(s) from 2 suite(s)');
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(ag_test_suites[0].pk).size
    ).toEqual(0);

    checkboxes.at(0).setChecked(false);
    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(1);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.has(ag_test_suites[0].pk)
    ).toBe(false);
});

test('Selecting and unselecting test cases', async () => {
    let wrapper = await make_wrapper();
    wrapper.find('#rerun-all-ag-test-cases').setChecked(false);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(0);
    wrapper.findAll({ref: 'ag_test_suite_checkbox'}).at(0).setChecked(true);
    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(1);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(1).text())
    ).toEqual('2 test case(s) from 1 suite(s)');
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(ag_test_suites[0].pk).size
    ).toEqual(0);

    wrapper.findAll({ref: 'ag_test_case_checkbox'}).at(1).setChecked(true);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(ag_test_suites[0].pk).size
    ).toEqual(1);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(
            ag_test_suites[0].pk
        ).has(ag_test_suites[0].ag_test_cases[1].pk)
    ).toBe(true);

    wrapper.findAll({ref: 'ag_test_case_checkbox'}).at(0).setChecked(true);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(ag_test_suites[0].pk).size
    ).toEqual(2);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(
            ag_test_suites[0].pk
        ).has(ag_test_suites[0].ag_test_cases[0].pk)
    ).toBe(true);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(
            ag_test_suites[0].pk
        ).has(ag_test_suites[0].ag_test_cases[1].pk)
    ).toBe(true);

    wrapper.findAll({ref: 'ag_test_case_checkbox'}).at(1).setChecked(false);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(ag_test_suites[0].pk).size
    ).toEqual(1);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(
            ag_test_suites[0].pk
        ).has(ag_test_suites[0].ag_test_cases[0].pk)
    ).toBe(true);
});

test('Selecting test case also selects suite, unselecting suite unselects tests', async () => {
    let wrapper = await make_wrapper();
    wrapper.find('#rerun-all-ag-test-cases').setChecked(false);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(0);

    wrapper.findAll({ref: 'ag_test_case_checkbox'}).at(1).setChecked(true);
    await wrapper.vm.$nextTick();
    expect(checkbox_is_checked(wrapper.findAll({ref: 'ag_test_suite_checkbox'}).at(0))).toBe(true);
    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(1);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(ag_test_suites[0].pk).size
    ).toEqual(1);
    expect(
        wrapper.vm.d_selected_test_cases_by_suite_pk.get(
            ag_test_suites[0].pk
        ).has(ag_test_suites[0].ag_test_cases[1].pk)
    ).toBe(true);
    expect(checkbox_is_checked(wrapper.findAll({ref: 'ag_test_suite_checkbox'}).at(0))).toBe(true);

    // Add another suite so we make sure the right one is unchecked later
    wrapper.findAll({ref: 'ag_test_suite_checkbox'}).at(1).setChecked(true);

    wrapper.findAll({ref: 'ag_test_suite_checkbox'}).at(0).setChecked(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.size).toEqual(1);
    expect(wrapper.vm.d_selected_test_cases_by_suite_pk.has(ag_test_suites[0].pk)).toBe(false);
    expect(checkbox_is_checked(wrapper.findAll({ref: 'ag_test_case_checkbox'}).at(1))).toBe(false);
    expect(checkbox_is_checked(wrapper.findAll({ref: 'ag_test_suite_checkbox'}).at(1))).toBe(true);
});

test('Selecting and unselecting mutation test suites', async () => {
    let wrapper = await make_wrapper();
    expect(wrapper.find({ref: 'choose_mutation_test_suites'}).exists()).toBe(false);
    wrapper.find('#rerun-all-mutation-test-suites').setChecked(false);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.d_selected_mutation_test_suite_pks.size).toEqual(0);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(2).text())
    ).toEqual('0 mutation test suite(s)');
    let checkboxes = wrapper.findAll({ref: 'mutation_test_suite_checkbox'});
    checkboxes.at(1).setChecked(true);
    expect(wrapper.vm.d_selected_mutation_test_suite_pks.size).toEqual(1);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(2).text())
    ).toEqual('1 mutation test suite(s)');
    expect(
        wrapper.vm.d_selected_mutation_test_suite_pks.has(mutation_test_suites[1].pk)
    ).toBe(true);

    checkboxes.at(0).setChecked(true);
    expect(wrapper.vm.d_selected_mutation_test_suite_pks.size).toEqual(2);
    expect(
        wrapper.vm.d_selected_mutation_test_suite_pks.has(mutation_test_suites[0].pk)
    ).toBe(true);
    expect(
        compress_whitespace(wrapper.findAll('.summary-line').at(2).text())
    ).toEqual('2 mutation test suite(s)');

    checkboxes.at(1).setChecked(false);
    expect(wrapper.vm.d_selected_mutation_test_suite_pks.size).toEqual(1);
    expect(
        wrapper.vm.d_selected_mutation_test_suite_pks.has(mutation_test_suites[1].pk)
    ).toBe(false);
});

test('Mutation testing suites section hidden when empty', async () => {
    get_mutation_test_suites_stub.withArgs(project.pk).resolves([]);
    let wrapper = await make_wrapper();
    expect(wrapper.find({ref: 'choose_mutation_test_suites'}).exists()).toBe(false);
    expect(wrapper.find({ref: 'mutation_test_suite_summary'}).exists()).toBe(false);
});

describe('Start rerun tests', () => {
    let create_task_stub: sinon.SinonStub;

    beforeEach(() => {
        create_task_stub = sinon.stub(ag_cli.RerunSubmissionTask, 'create').resolves(
            new ag_cli.RerunSubmissionTask({
                pk: 1,
                project: project.pk,
                progress: 0,
                error_msg: '',
                has_error: false,
                rerun_all_submissions: true,
                submission_pks: [],
                rerun_all_ag_test_suites: true,
                ag_test_suite_data: {},
                rerun_all_student_test_suites: true,
                student_suite_pks: [],
                created_at: (new Date()).toISOString(),
            })
        );
    });

    test('Rerun all submissions', async () => {
        let wrapper = await make_wrapper();
        wrapper.find('#rerun-all-submissions').setChecked(true);

        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(create_task_stub.calledOnce).toBe(true);
        expect(create_task_stub.getCall(0).args[0]).toEqual(project.pk);
        expect(create_task_stub.getCall(0).args[1].rerun_all_submissions).toBe(true);
    });

    test('Rerun select submissions', async () => {
        let wrapper = await make_wrapper();
        wrapper.find('#rerun-all-submissions').setChecked(false);
        wrapper.vm.d_selected_submissions.insert(group1_submissions[0]);
        wrapper.vm.d_selected_submissions.insert(group2_submissions[1]);

        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(create_task_stub.calledOnce).toBe(true);
        expect(create_task_stub.getCall(0).args[0]).toEqual(project.pk);
        expect(create_task_stub.getCall(0).args[1].rerun_all_submissions).toBe(false);
        expect(create_task_stub.getCall(0).args[1].submission_pks).toEqual([
            group1_submissions[0].pk, group2_submissions[1].pk
        ]);
    });

    test('Rerun all tests', async () => {
        let wrapper = await make_wrapper();
        wrapper.find('#rerun-all-ag-test-cases').setChecked(true);

        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(create_task_stub.calledOnce).toBe(true);
        expect(create_task_stub.getCall(0).args[0]).toEqual(project.pk);
        expect(create_task_stub.getCall(0).args[1].rerun_all_ag_test_suites).toBe(true);
    });

    test('Rerun select tests', async () => {
        let wrapper = await make_wrapper();
        wrapper.find('#rerun-all-ag-test-cases').setChecked(false);

        wrapper.findAll({ref: 'ag_test_case_checkbox'}).at(0).setChecked(true);
        wrapper.findAll({ref: 'ag_test_suite_checkbox'}).at(1).setChecked(true);

        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(create_task_stub.calledOnce).toBe(true);
        expect(create_task_stub.getCall(0).args[0]).toEqual(project.pk);
        expect(create_task_stub.getCall(0).args[1].rerun_all_ag_test_suites).toBe(false);
        expect(create_task_stub.getCall(0).args[1].ag_test_suite_data).toEqual({
            [ag_test_suites[0].pk]: [ag_test_suites[0].ag_test_cases[0].pk],
            [ag_test_suites[1].pk]: [],
        });
    });

    test('Rerun all mutation testing suites', async () => {
        let wrapper = await make_wrapper();
        wrapper.find('#rerun-all-mutation-test-suites').setChecked(true);

        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(create_task_stub.calledOnce).toBe(true);
        expect(create_task_stub.getCall(0).args[0]).toEqual(project.pk);
        expect(create_task_stub.getCall(0).args[1].rerun_all_student_test_suites).toBe(true);
    });

    test('Rerun select mutation testing suites', async () => {
        let wrapper = await make_wrapper();
        wrapper.find('#rerun-all-mutation-test-suites').setChecked(false);

        wrapper.findAll({ref: 'mutation_test_suite_checkbox'}).at(1).setChecked(true);

        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        await wrapper.vm.$nextTick();
        expect(create_task_stub.calledOnce).toBe(true);
        expect(create_task_stub.getCall(0).args[0]).toEqual(project.pk);
        expect(create_task_stub.getCall(0).args[1].rerun_all_student_test_suites).toBe(false);
        expect(create_task_stub.getCall(0).args[1].student_suite_pks).toEqual([
            mutation_test_suites[1].pk
        ]);
    });

    test('Start rerun, API errors handled', async () => {
        create_task_stub.rejects(new ag_cli.HttpError(403, 'U heked up'));
        let wrapper = await make_wrapper();
        wrapper.find({ref: 'start_rerun_button'}).trigger('click');
        expect(
            await wait_until(
                wrapper, w => find_by_name<APIErrors>(
                    w, 'APIErrors').vm.d_api_errors.length === 1)
        ).toBe(true);
    });
});

describe('Observer tests', () => {
    let wrapper: Wrapper<RerunSubmissions>;

    beforeEach(async () => {
        wrapper = await make_wrapper();
    });

    test('Groups updated', async () => {
        expect(wrapper.vm.d_groups.length).toEqual(2);
        let new_group = data_ut.make_group(project.pk);
        ag_cli.Group.notify_group_created(new_group);
        expect(wrapper.vm.d_groups.length).toEqual(3);

        let modified = new ag_cli.Group(new_group);
        modified.member_names = ['waluigi'];
        ag_cli.Group.notify_group_changed(modified);
        expect(
            wrapper.vm.d_groups.find(group => group.member_names.includes('waluigi'))
        ).toEqual(modified);

        let merged_group = data_ut.make_group(project.pk, 1, {member_names: ['spam']});
        ag_cli.Group.notify_group_merged(merged_group, groups[0].pk, groups[1].pk);
        expect(wrapper.vm.d_groups).toEqual([merged_group, modified]);
    });

    test('Group updates from other project ignored', async () => {
        let other_project = data_ut.make_project(data_ut.make_course().pk);
        let group = data_ut.make_group(other_project.pk);

        expect(wrapper.vm.d_groups).toEqual(groups);
        ag_cli.Group.notify_group_created(group);
        ag_cli.Group.notify_group_changed(group);
        ag_cli.Group.notify_group_merged(group, groups[0].pk, groups[1].pk);
        expect(wrapper.vm.d_groups).toEqual(groups);
    });

    test('AGTestSuites updated', async () => {
        let new_suite = data_ut.make_ag_test_suite(project.pk);
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);

        ag_cli.AGTestSuite.notify_ag_test_suite_created(new_suite);
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_ag_test_suites[2].ag_test_cases).toEqual([]);

        let modified_suite = new ag_cli.AGTestSuite(new_suite);
        modified_suite.name = 'Spam';
        ag_cli.AGTestSuite.notify_ag_test_suite_changed(modified_suite);
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_ag_test_suites[2]).toEqual(modified_suite);

        let new_test = data_ut.make_ag_test_case(new_suite.pk);
        ag_cli.AGTestCase.notify_ag_test_case_created(new_test);
        expect(wrapper.vm.d_ag_test_suites[2].ag_test_cases).toEqual([new_test]);

        let modified_test = new ag_cli.AGTestCase(new_test);
        modified_test.name = 'Egg';
        ag_cli.AGTestCase.notify_ag_test_case_changed(modified_test);
        expect(wrapper.vm.d_ag_test_suites[2].ag_test_cases).toEqual([modified_test]);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(new_test);
        expect(wrapper.vm.d_ag_test_suites[2].ag_test_cases).toEqual([]);

        let new_test_order = [
            ag_test_suites[0].ag_test_cases[1].pk, ag_test_suites[0].ag_test_cases[0].pk
        ];
        ag_cli.AGTestCase.notify_ag_test_case_order_updated(ag_test_suites[0].pk, new_test_order);
        expect(
            wrapper.vm.d_ag_test_suites[0].ag_test_cases.map(test_case => test_case.pk)
        ).toEqual(new_test_order);

        let new_suite_order = [
            new_suite.pk, ag_test_suites[0].pk, ag_test_suites[1].pk
        ];
        ag_cli.AGTestSuite.notify_ag_test_suite_order_updated(project.pk, new_suite_order);
        expect(wrapper.vm.d_ag_test_suites.map(suite => suite.pk)).toEqual(new_suite_order);

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(new_suite);
        expect(wrapper.vm.d_ag_test_suites).toEqual(ag_test_suites);
    });

    test('AGTestSuite updates from other project ignored', async () => {
        let other_project = data_ut.make_project(data_ut.make_course().pk);
        let new_suite = data_ut.make_ag_test_suite(other_project.pk);
        let new_test = data_ut.make_ag_test_case(new_suite.pk);

        ag_cli.AGTestSuite.notify_ag_test_suite_created(new_suite);
        ag_cli.AGTestSuite.notify_ag_test_suite_changed(new_suite);
        ag_cli.AGTestCase.notify_ag_test_case_created(new_test);
        ag_cli.AGTestCase.notify_ag_test_case_changed(new_test);
        ag_cli.AGTestCase.notify_ag_test_case_deleted(new_test);
        ag_cli.AGTestCase.notify_ag_test_case_order_updated(new_suite.pk, [1, 2, 3]);
        ag_cli.AGTestSuite.notify_ag_test_suite_order_updated(other_project.pk, [4, 5, 2]);
        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(new_suite);

        expect(wrapper.vm.d_ag_test_suites).toEqual(ag_test_suites);
    });

    test('MutationTestSuites updated', async () => {
        let new_suite = data_ut.make_mutation_test_suite(project.pk);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(2);

        ag_cli.MutationTestSuite.notify_mutation_test_suite_created(new_suite);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);

        let modified_suite = new ag_cli.MutationTestSuite(new_suite);
        modified_suite.name = 'Waluigi';
        ag_cli.MutationTestSuite.notify_mutation_test_suite_changed(modified_suite);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_mutation_test_suites[2]).toEqual(modified_suite);

        let new_suite_order = [
            new_suite.pk, mutation_test_suites[1].pk, mutation_test_suites[0].pk
        ];
        ag_cli.MutationTestSuite.notify_mutation_test_suite_order_updated(
            project.pk, new_suite_order);
        expect(wrapper.vm.d_mutation_test_suites.map(suite => suite.pk)).toEqual(new_suite_order);

        ag_cli.MutationTestSuite.notify_mutation_test_suite_deleted(new_suite);
        expect(wrapper.vm.d_mutation_test_suites).toEqual(mutation_test_suites);
    });

    test('MutationTestSuite updates from other project ignored', async () => {
        let other_project = data_ut.make_project(data_ut.make_course().pk);
        let new_suite = data_ut.make_mutation_test_suite(other_project.pk);

        ag_cli.MutationTestSuite.notify_mutation_test_suite_created(new_suite);
        ag_cli.MutationTestSuite.notify_mutation_test_suite_changed(new_suite);
        ag_cli.MutationTestSuite.notify_mutation_test_suite_order_updated(
            other_project.pk, [4, 5, 2]);
        ag_cli.MutationTestSuite.notify_mutation_test_suite_deleted(new_suite);

        expect(wrapper.vm.d_mutation_test_suites).toEqual(mutation_test_suites);
    });
});
