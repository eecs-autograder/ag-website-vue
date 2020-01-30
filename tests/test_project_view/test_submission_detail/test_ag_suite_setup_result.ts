import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGSuiteSetupResult from '@/components/project_view/submission_detail/ag_suite_setup_result.vue';
import ViewFile from '@/components/view_file.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { wait_fixed, wait_until } from '@/tests/utils';

let submission: ag_cli.Submission;
let ag_test_suite_result: ag_cli.AGTestSuiteResultFeedback;
let group: ag_cli.Group;
let user: ag_cli.User;

let setup_stdout_stub: sinon.SinonStub;
let setup_stderr_stub: sinon.SinonStub;
let output_size_stub: sinon.SinonStub;

function output_size_resolves(
    submission_pk: number,
    suite_pk: number,
    {
        setup_stdout_size = null,
        setup_stderr_size = null,
        setup_stdout_truncated = null,
        setup_stderr_truncated = null,
    }: {
        setup_stdout_size?: number | null,
        setup_stderr_size?: number | null,
        setup_stdout_truncated?: boolean | null,
        setup_stderr_truncated?: boolean | null,
    } = {}
) {
    output_size_stub.withArgs(
        submission_pk, suite_pk
    ).resolves({
        setup_stdout_size: setup_stdout_size,
        setup_stderr_size: setup_stderr_size,
        setup_stdout_truncated: setup_stdout_truncated,
        setup_stderr_truncated: setup_stderr_truncated,
    });
}

function progress_stub_resolves<T>(
    submission_pk: number, suite_pk: number, stub: sinon.SinonStub, val: T
) {
    stub.withArgs(
        submission_pk, suite_pk
    ).callsFake((subm_pk, suite_result_pk, fdbk, on_upload_progress) => {
        // tslint:disable-next-line: no-object-literal-type-assertion
        on_upload_progress!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 10});
        return Promise.resolve(val);
    });
}

async function make_wrapper() {
    let wrapper = managed_mount(AGSuiteSetupResult, {
        propsData: {
            submission: submission,
            ag_test_suite_result: ag_test_suite_result,
            fdbk_category: ag_cli.FeedbackCategory.max
        }
    });
    expect(await wait_until(wrapper, w => w.vm.d_output_size !== null));
    return wrapper;
}

beforeEach(() => {
    user = data_ut.make_user();
    group = data_ut.make_group(1, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
    ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(1);

    setup_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
    ).rejects(new ag_cli.HttpError(500, 'Stub me'));

    setup_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
    ).rejects(new ag_cli.HttpError(500, 'Stub me'));

    output_size_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_ag_test_suite_result_output_size'
    ).rejects(new ag_cli.HttpError(500, 'Stub me'));
});

describe('Setup output tests', () => {
    test('Setup stdout available', async () => {
        let stdout_content = 'i am stdouten';
        output_size_resolves(
            submission.pk, ag_test_suite_result.pk, {setup_stdout_size: stdout_content.length});
        progress_stub_resolves(
            submission.pk, ag_test_suite_result.pk, setup_stdout_stub, stdout_content);

        let wrapper = await make_wrapper();
        await wrapper.vm.$nextTick();

        let stdout_viewer = <ViewFile> wrapper.find({ref: 'setup_stdout'}).vm;
        expect(await stdout_viewer.file_contents).toEqual(stdout_content);
        expect(stdout_viewer.progress).not.toBeNull();

        expect(wrapper.find({ref: 'setup_stderr'}).exists()).toBe(false);
    });

    test('Setup stderr available', async () => {
        let stderr_content = 'i am stderren';
        output_size_resolves(
            submission.pk, ag_test_suite_result.pk, {setup_stderr_size: stderr_content.length});
        progress_stub_resolves(
            submission.pk, ag_test_suite_result.pk, setup_stderr_stub, stderr_content);

        let wrapper = await make_wrapper();
        await wrapper.vm.$nextTick();

        let stderr_viewer = <ViewFile> wrapper.find({ref: 'setup_stderr'}).vm;
        expect(await stderr_viewer.file_contents).toEqual(stderr_content);
        expect(stderr_viewer.progress).not.toBeNull();

        expect(wrapper.find({ref: 'setup_stdout'}).exists()).toBe(false);
    });

    test('Setup stdout and stderr available', async () => {
        let stdout_content = 'i am stdouten';
        let stderr_content = 'i am stderren';
        output_size_resolves(
            submission.pk, ag_test_suite_result.pk,
            {setup_stdout_size: stdout_content.length, setup_stderr_size: stderr_content.length});
        progress_stub_resolves(
            submission.pk, ag_test_suite_result.pk, setup_stdout_stub, stdout_content);
        progress_stub_resolves(
            submission.pk, ag_test_suite_result.pk, setup_stderr_stub, stderr_content);

        let wrapper = await make_wrapper();
        await wrapper.vm.$nextTick();

        let stdout_viewer = <ViewFile> wrapper.find({ref: 'setup_stdout'}).vm;
        expect(await stdout_viewer.file_contents).toEqual(stdout_content);
        expect(stdout_viewer.progress).not.toBeNull();

        let stderr_viewer = <ViewFile> wrapper.find({ref: 'setup_stderr'}).vm;
        expect(await stderr_viewer.file_contents).toEqual(stderr_content);
        expect(stderr_viewer.progress).not.toBeNull();
    });

    test('Setup stdout empty', async () => {
        output_size_resolves(submission.pk, ag_test_suite_result.pk,
                             {setup_stdout_size: 0, setup_stderr_size: null});
        let wrapper = await make_wrapper();
        await wait_fixed(wrapper, 5);

        expect(wrapper.find({ref: 'setup_stderr_section'}).exists()).toBe(false);
        expect(
            wrapper.find({ref: 'setup_stdout_section'}).find('.short-output').text()
        ).toEqual('No output');
        expect(wrapper.find({ref: 'setup_stdout'}).exists()).toBe(false);
    });

    test('Setup stderr empty', async () => {
        output_size_resolves(submission.pk, ag_test_suite_result.pk,
                             {setup_stdout_size: null, setup_stderr_size: 0});
        let wrapper = await make_wrapper();
        await wait_fixed(wrapper, 5);

        expect(wrapper.find({ref: 'setup_stdout_section'}).exists()).toBe(false);
        expect(
            wrapper.find({ref: 'setup_stderr_section'}).find('.short-output').text()
        ).toEqual('No output');
        expect(wrapper.find({ref: 'setup_stderr'}).exists()).toBe(false);
    });
});

describe('AGSuiteSetupResult exit_status tests', () => {
    let wrapper: Wrapper<AGSuiteSetupResult>;

    beforeEach(() => {
        output_size_resolves(submission.pk, ag_test_suite_result.pk);
    });

    test('setup_exit_status - setup_timed_out === null && setup_return_code === null', () => {
        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.find('#exit-status-section').exists()).toBe(false);
    });

    test('setup_exit_status - setup_timed_out === null && setup_return_code !== null',  () => {
        ag_test_suite_result!.setup_return_code = 1;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.ag_test_suite_result.setup_return_code).not.toBeNull();
        expect(wrapper.find('#exit-status-section').exists()).toBe(true);
        expect(wrapper.find('#exit-status-section').text()).toContain("1");
    });

    test('setup_exit_status - setup_timed_out === false && setup_return_code === null', () => {
        ag_test_suite_result!.setup_timed_out = false;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBe(false);
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.find('#exit-status-section').exists()).toBe(false);
    });

    test('setup_exit_status - setup_timed_out === true && setup_return_code === null',  () => {
        ag_test_suite_result!.setup_timed_out = true;

        wrapper = mount(AGSuiteSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        expect(wrapper.vm.ag_test_suite_result!.setup_timed_out).toBe(true);
        expect(wrapper.vm.ag_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.find('#exit-status-section').text()).toContain('(Timed out)');
    });
});

test('Output reloaded on fdbk_category change', async () => {
    output_size_stub.onFirstCall().resolves(
        {setup_stdout_size: 0, setup_stderr_size: 0}
    ).onSecondCall().resolves({setup_stdout_size: 1, setup_stderr_size: 1});

    let setup_stdout_content = 'stdouuuuut';
    let setup_stderr_content = 'stderrrrrrrrrrr';

    setup_stdout_stub.onFirstCall().resolves(setup_stdout_content);
    setup_stderr_stub.onFirstCall().resolves(setup_stderr_content);

    let wrapper = managed_mount(AGSuiteSetupResult, {
        propsData: {
            ag_test_suite_result: ag_test_suite_result,
            submission: submission,
            fdbk_category: ag_cli.FeedbackCategory.max
        }
    });
    await wait_fixed(wrapper, 4);

    expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
    expect(setup_stdout_stub.callCount).toEqual(0);
    expect(setup_stderr_stub.callCount).toEqual(0);
    expect(wrapper.vm.d_setup_stdout_content).toBeNull();
    expect(wrapper.vm.d_setup_stderr_content).toBeNull();

    wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.normal});
    await wait_fixed(wrapper, 4);

    expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.normal);
    expect(setup_stdout_stub.callCount).toEqual(1);
    expect(setup_stderr_stub.callCount).toEqual(1);
    expect(await wrapper.vm.d_setup_stdout_content).toEqual(setup_stdout_content);
    expect(await wrapper.vm.d_setup_stderr_content).toEqual(setup_stderr_content);
});
