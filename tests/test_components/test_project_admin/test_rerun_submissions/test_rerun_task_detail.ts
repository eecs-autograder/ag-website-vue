import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import RerunTaskDetail from '@/components/project_admin/rerun_submissions/rerun_task_detail.vue';

import { managed_mount } from '@/tests/setup';

let task: ag_cli.RerunSubmissionTask;
let cancel_stub: sinon.SinonStub;

beforeEach(() => {
    task = new ag_cli.RerunSubmissionTask({
        pk: 42,
        project: 1,
        progress: 0,
        has_error: false,
        is_cancelled: false,

        error_msg: '',
        created_at: (new Date()).toISOString(),
        rerun_all_submissions: true,
        submission_pks: [],
        rerun_all_ag_test_suites: true,
        ag_test_suite_data: {},
        rerun_all_mutation_test_suites: true,
        mutation_suite_pks: [],
    });

    cancel_stub = sinon.stub(task, 'cancel');
});

test('Cancel button emits request-cancel event', async () => {
    let wrapper = managed_mount(RerunTaskDetail, {
        propsData: {
            task: task
        }
    });

    await wrapper.find('.cancel-button').trigger('click');

    expect(wrapper.emitted('request-cancel')).toBeTruthy();
    expect(wrapper.emitted('request-cancel')![0][0]).toBe(task);
});

test('Cancel button hidden when task is done', () => {
    task.progress = 100;

    let wrapper = managed_mount(RerunTaskDetail, {
        propsData: {
            task: task
        }
    });
    expect(wrapper.findComponent({ref: 'show_stop_task_modal'}).exists()).toBe(false);
});

test('Cancel button hidden when task is cancelled', () => {
    task.is_cancelled = true;

    let wrapper = managed_mount(RerunTaskDetail, {
        propsData: {
            task: task
        }
    });
    expect(wrapper.findComponent({ref: 'show_stop_task_modal'}).exists()).toBe(false);
});

test('Cancel button hidden when task has error', () => {
    task.has_error = true;

    let wrapper = managed_mount(RerunTaskDetail, {
        propsData: {
            task: task
        }
    });
    expect(wrapper.findComponent({ref: 'show_stop_task_modal'}).exists()).toBe(false);
});
