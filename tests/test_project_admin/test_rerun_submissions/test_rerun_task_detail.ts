import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import RerunTaskDetail from '@/components/project_admin/rerun_submissions/rerun_task_detail.vue';

import { managed_mount } from '@/tests/setup';
import { wait_until } from '@/tests/utils';

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

test('Cancel rerun', async () => {
    cancel_stub.callsFake(() => {
        task.is_cancelled = true;
    });

    let wrapper = managed_mount(RerunTaskDetail, {
        propsData: {
            task: task
        }
    });

    wrapper.findComponent({ref: 'show_stop_task_modal'}).trigger('click');
    await wrapper.vm.$nextTick();

    wrapper.find('[data-testid=stop_task_button]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_cancelling)).toBe(true);

    expect(wrapper.find('.progress-cell').text()).toEqual('Cancelled');
    expect(cancel_stub.calledOnce).toBe(true);
    expect(wrapper.findComponent({ref: 'cancel_task_modal'}).exists()).toBe(false);
});

test('Cancel rerun API errors handled', async () => {
    cancel_stub.rejects(new ag_cli.HttpError(403, 'noope'));

    let wrapper = managed_mount(RerunTaskDetail, {
        propsData: {
            task: task
        }
    });

    wrapper.findComponent({ref: 'show_stop_task_modal'}).trigger('click');
    await wrapper.vm.$nextTick();

    wrapper.find('[data-testid=stop_task_button]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_cancelling)).toBe(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ref: 'cancel_task_modal'}).exists()).toBe(true);
    let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
    expect(api_errors.d_api_errors.length).toBe(1);
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
