import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import Diff from '@/components/diff.vue';
import AGTestCommandResult from '@/components/project_view/submission_detail/ag_test_command_result.vue';
import ViewFile from '@/components/view_file.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { compress_whitespace, wait_fixed, wait_until } from '@/tests/utils';

let group: ag_cli.Group;
let submission: ag_cli.Submission;
let ag_test_command_result: ag_cli.AGTestCommandResultFeedback;

let output_size_stub: sinon.SinonStub;
let stdout_stub: sinon.SinonStub;
let stderr_stub: sinon.SinonStub;
let stdout_diff_stub: sinon.SinonStub;
let stderr_diff_stub: sinon.SinonStub;

beforeEach(() => {
    let project = data_ut.make_project(data_ut.make_course().pk);
    group = data_ut.make_group(project.pk);
    submission = data_ut.make_submission(group);
    ag_test_command_result = data_ut.make_ag_test_command_result_feedback(
        data_ut.make_ag_test_command(
            data_ut.make_ag_test_case(
                data_ut.make_ag_test_suite(project.pk).pk
            ).pk
        ).pk
    );

    output_size_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_output_size'
    ).resolves({
        stdout_size: null,
        stderr_size: null,
        stdout_diff_size: null,
        stderr_diff_size: null,
    });

    stdout_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stdout'
    ).rejects(new ag_cli.HttpError(500, 'Stub me'));

    stdout_diff_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stdout_diff'
    ).rejects(new ag_cli.HttpError(500, 'Stub me'));

    stderr_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stderr'
    ).rejects(new ag_cli.HttpError(500, 'Stub me'));

    stderr_diff_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stderr_diff'
    ).rejects(new ag_cli.HttpError(500, 'Stub me'));
});

async function make_wrapper() {
    let wrapper = managed_mount(AGTestCommandResult, {
        propsData: {
            submission: submission,
            ag_test_command_result: ag_test_command_result,
            fdbk_category: ag_cli.FeedbackCategory.max
        }
    });
    expect(await wait_until(wrapper, w => w.vm.d_output_size !== null));
    return wrapper;
}

describe('Correctness feedback tests', () => {
    test('No correctness info available', async () => {
        let wrapper = await make_wrapper();
        expect(wrapper.find({ref: 'correctness_section'}).exists()).toEqual(false);
    });

    describe('Return code correctness tests', () => {
        beforeEach(() => {
            // Force the correctness section to show up
            ag_test_command_result.stdout_correct = false;
        });

        test('Return code correctness hidden', async () => {
            let wrapper = await make_wrapper();
            expect(wrapper.find({ref: 'correctness'}).exists()).toEqual(true);
            expect(wrapper.find({ref: 'return_code_correctness'}).exists()).toEqual(false);
        });

        test('Return code correct, timeout fdbk hidden', async () => {
            ag_test_command_result.return_code_correct = true;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'return_code_correctness'});
            expect(section_wrapper.find('.correct-icon').exists()).toBe(true);
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(false);
            expect(section_wrapper.find('.timed-out-icon').exists()).toBe(false);
        });

        test('Return code incorrect, timeout fdbk hidden', async () => {
            ag_test_command_result.return_code_correct = false;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'return_code_correctness'});
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(true);
            expect(section_wrapper.find('.correct-icon').exists()).toBe(false);
            expect(section_wrapper.find('.timed-out-icon').exists()).toBe(false);
        });

        test('Return code correctness available, command did not time out', async () => {
            ag_test_command_result.return_code_correct = false;
            ag_test_command_result.timed_out = false;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'return_code_correctness'});
            expect(section_wrapper.find('.timed-out-icon').exists()).toBe(false);
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(true);
        });

        test('Return code correctness available, command timed out', async () => {
            ag_test_command_result.return_code_correct = false;
            ag_test_command_result.timed_out = true;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'return_code_correctness'});
            expect(section_wrapper.find('.timed-out-icon').exists()).toBe(true);
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(false);
            expect(section_wrapper.find('.correct-icon').exists()).toBe(false);
        });

        test('Return code correctness hidden, command did not time out', async () => {
            ag_test_command_result.timed_out = false;
            let wrapper = await make_wrapper();
            expect(wrapper.find({ref: 'return_code_correctness'}).exists()).toBe(false);
        });

        test('Return code correctness hidden, command timed out', async () => {
            ag_test_command_result.timed_out = true;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'return_code_correctness'});
            expect(section_wrapper.find('.timed-out-icon').exists()).toBe(true);
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(false);
            expect(section_wrapper.find('.correct-icon').exists()).toBe(false);
        });

        test('Actual return code hidden', async () => {
            ag_test_command_result.actual_return_code = null;
            ag_test_command_result.return_code_correct = true;
            let wrapper = await make_wrapper();
            expect(wrapper.find({ref: 'actual_return_code'}).exists()).toBe(false);
            expect(wrapper.find({ref: 'return_code_correctness'}).exists()).toBe(true);
        });

        test('Actual return code available', async () => {
            ag_test_command_result.actual_return_code = 42;
            let wrapper = await make_wrapper();
            expect(wrapper.find({ref: 'actual_return_code'}).text()).toEqual(
                'Actual exit status: 42'
            );
        });

        test('Expected return code available, return code not checked', async () => {
            ag_test_command_result.expected_return_code = ag_cli.ExpectedReturnCode.none;
            let wrapper = await make_wrapper();
            expect(wrapper.find({ref: 'expected_return_code'}).exists()).toBe(false);
        });

        test('Expected return code availble, zero expected', async () => {
            ag_test_command_result.expected_return_code = ag_cli.ExpectedReturnCode.zero;
            let wrapper = await make_wrapper();
            expect(
                compress_whitespace(wrapper.find({ref: 'expected_return_code'}).text())
            ).toEqual('Expected exit status: 0');
        });

        test('Expected return code available, nonzero expected', async () => {
            ag_test_command_result.expected_return_code = ag_cli.ExpectedReturnCode.nonzero;
            let wrapper = await make_wrapper();
            expect(
                compress_whitespace(wrapper.find({ref: 'expected_return_code'}).text())
            ).toEqual('Expected exit status: nonzero');
        });
    });

    describe('Output correctness tests', () => {
        beforeEach(() => {
            // Force the correctness section to show up
            ag_test_command_result.return_code_correct = true;
        });

        test('Stdout correct hidden', async () => {
            let wrapper = await make_wrapper();
            expect(wrapper.find({ref: 'correctness'}).exists()).toEqual(true);
            expect(wrapper.find({ref: 'stdout_correctness'}).exists()).toBe(false);
        });

        test('Stdout correct', async () => {
            ag_test_command_result.stdout_correct = true;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'stdout_correctness'});
            expect(section_wrapper.find('.correct-icon').exists()).toBe(true);
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(false);
        });

        test('Stdout incorrect', async () => {
            ag_test_command_result.stdout_correct = false;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'stdout_correctness'});
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(true);
            expect(section_wrapper.find('.correct-icon').exists()).toBe(false);
        });

        test('Stderr correct hidden', async () => {
            let wrapper = await make_wrapper();
            expect(wrapper.find({ref: 'correctness'}).exists()).toEqual(true);
            expect(wrapper.find({ref: 'stderr_correctness'}).exists()).toBe(false);
        });

        test('Stderr correct', async () => {
            ag_test_command_result.stderr_correct = true;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'stderr_correctness'});
            expect(section_wrapper.find('.correct-icon').exists()).toBe(true);
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(false);
        });

        test('Stderr incorrect', async () => {
            ag_test_command_result.stderr_correct = false;
            let wrapper = await make_wrapper();
            let section_wrapper = wrapper.find({ref: 'stderr_correctness'});
            expect(section_wrapper.find('.incorrect-icon').exists()).toBe(true);
            expect(section_wrapper.find('.correct-icon').exists()).toBe(false);
        });
    });
});

function output_size_resolves({
    stdout_size = null,
    stderr_size = null,
    stdout_diff_size = null,
    stderr_diff_size = null,
}: {
    stdout_size?: number | null,
    stderr_size?: number | null,
    stdout_diff_size?: number | null,
    stderr_diff_size?: number | null,
} = {}) {
    output_size_stub.resolves({
        stdout_size: stdout_size,
        stderr_size: stderr_size,
        stdout_diff_size: stdout_diff_size,
        stderr_diff_size: stderr_diff_size,
    });
}

describe('Diff tests', () => {
    test('No diffs available', async () => {
        let wrapper = await make_wrapper();
        expect(wrapper.find({ref: 'diffs'}).exists()).toBe(false);
    });

    test('Stdout diff available', async () => {
        output_size_resolves({stdout_diff_size: 42});
        let diff = ['  Hello'];
        stdout_diff_stub.resolves(diff);

        let wrapper = await make_wrapper();
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'diffs'}).exists()).toBe(true);
        let diff_wrapper =  <Wrapper<Diff>> wrapper.find({ref: 'stdout_diff'});
        expect(diff_wrapper.vm.diff_contents).toEqual(diff);

        expect(wrapper.find({ref: 'stderr_diff'}).exists()).toBe(false);
    });

    test('Stderr diff available', async () => {
        output_size_resolves({stderr_diff_size: 10});
        let diff = ['  I am some diff'];
        stderr_diff_stub.resolves(diff);

        let wrapper = await make_wrapper();
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'diffs'}).exists()).toBe(true);
        let diff_wrapper =  <Wrapper<Diff>> wrapper.find({ref: 'stderr_diff'});
        expect(diff_wrapper.vm.diff_contents).toEqual(diff);

        expect(wrapper.find({ref: 'stdout_diff'}).exists()).toBe(false);
    });

    test('Both diffs available', async () => {
        output_size_resolves({stdout_diff_size: 15, stderr_diff_size: 20});
        let stdout_diff = ['  This is diff'];
        stdout_diff_stub.resolves(stdout_diff);
        let stderr_diff = ['  Such diffage'];
        stderr_diff_stub.resolves(stderr_diff);

        let wrapper = await make_wrapper();
        expect(
            await wait_until(
                wrapper, w => w.vm.d_stdout_diff !== null && w.vm.d_stderr_diff !== null)
        ).toBe(true);

        let stdout_diff_wrapper =  <Wrapper<Diff>> wrapper.find({ref: 'stdout_diff'});
        expect(stdout_diff_wrapper.vm.diff_contents).toEqual(stdout_diff);
        let stderr_diff_wrapper =  <Wrapper<Diff>> wrapper.find({ref: 'stderr_diff'});
        expect(stderr_diff_wrapper.vm.diff_contents).toEqual(stderr_diff);
    });
});

describe('Actual output tests', () => {
    test('No actual output available', async () => {
        let wrapper = await make_wrapper();
        expect(wrapper.find({ref: 'actual_output'}).exists()).toBe(false);
    });

    test('Actual stdout available', async () => {
        let stdout = 'this is some very stdout';
        output_size_resolves({stdout_size: stdout.length});
        stdout_stub.resolves(stdout);

        let wrapper = await make_wrapper();
        await wrapper.vm.$nextTick();

        let stdout_wrapper = <Wrapper<ViewFile>> wrapper.find({ref: 'stdout'});
        expect(await stdout_wrapper.vm.file_contents).toEqual(stdout);

        expect(wrapper.find({ref: 'stderr'}).exists()).toBe(false);
    });

    test('Actual stderr available', async () => {
        let stderr = 'here is stderr';
        output_size_resolves({stderr_size: stderr.length});
        stderr_stub.resolves(stderr);

        let wrapper = await make_wrapper();
        await wrapper.vm.$nextTick();

        let stderr_wrapper = <Wrapper<ViewFile>> wrapper.find({ref: 'stderr'});
        expect(await stderr_wrapper.vm.file_contents).toEqual(stderr);

        expect(wrapper.find({ref: 'stdout'}).exists()).toBe(false);
    });

    test('Actual stdout and stderr available', async () => {
        let stdout = 'moar stdout';
        let stderr = 'such stderr';
        output_size_resolves({stdout_size: stdout.length, stderr_size: stderr.length});
        stdout_stub.resolves(stdout);
        stderr_stub.resolves(stderr);

        let wrapper = await make_wrapper();
        expect(
            await wait_until(
                wrapper, w => w.vm.d_stdout_content !== null && w.vm.d_stderr_content !== null)
        ).toBe(true);

        let stdout_wrapper = <Wrapper<ViewFile>> wrapper.find({ref: 'stdout'});
        expect(await stdout_wrapper.vm.file_contents).toEqual(stdout);

        let stderr_wrapper = <Wrapper<ViewFile>> wrapper.find({ref: 'stderr'});
        expect(await stderr_wrapper.vm.file_contents).toEqual(stderr);
    });
});

describe('AGTestCommandResult Watchers tests', () => {
    let wrapper: Wrapper<AGTestCommandResult>;

    beforeEach(async () => {
        output_size_resolves(
            {stdout_size: 1, stderr_size: 2, stdout_diff_size: 3, stderr_diff_size: 4});
        stdout_stub.resolves('a');
        stderr_stub.resolves('aa');
        stdout_diff_stub.resolves(['  b']);
        stderr_diff_stub.resolves(['  c']);
        wrapper = await make_wrapper();
        await wait_fixed(wrapper, 4);
    });

    test('submission Watcher', async () => {
        expect(wrapper.vm.submission).toEqual(submission);
        expect(output_size_stub.calledOnce).toBe(true);
        expect(stdout_stub.calledOnce).toBe(true);
        expect(stderr_stub.calledOnce).toBe(true);
        expect(stdout_diff_stub.calledOnce).toBe(true);
        expect(stderr_diff_stub.calledOnce).toBe(true);

        let updated_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: updated_submission});

        await wait_fixed(wrapper, 4);

        expect(submission).not.toEqual(updated_submission);
        expect(wrapper.vm.submission).toEqual(updated_submission);
        expect(output_size_stub.calledOnce).toBe(true);
        expect(stdout_stub.calledOnce).toBe(true);
        expect(stderr_stub.calledOnce).toBe(true);
        expect(stdout_diff_stub.calledOnce).toBe(true);
        expect(stderr_diff_stub.calledOnce).toBe(true);
    });

    test('ag_test_command_result Watcher', async () => {
        expect(wrapper.vm.ag_test_command_result).toEqual(ag_test_command_result);
        expect(output_size_stub.calledOnce).toBe(true);
        expect(stdout_stub.calledOnce).toBe(true);
        expect(stderr_stub.calledOnce).toBe(true);
        expect(stdout_diff_stub.calledOnce).toBe(true);
        expect(stderr_diff_stub.calledOnce).toBe(true);

        let updated_ag_test_command_result = data_ut.make_ag_test_command_result_feedback(1);
        wrapper.setProps({ag_test_command_result: updated_ag_test_command_result});

        await wait_fixed(wrapper, 4);

        expect(ag_test_command_result).not.toEqual(updated_ag_test_command_result);
        expect(wrapper.vm.ag_test_command_result).toEqual(updated_ag_test_command_result);
        expect(output_size_stub.calledTwice).toBe(true);
        expect(stdout_stub.calledTwice).toBe(true);
        expect(stderr_stub.calledTwice).toBe(true);
        expect(stdout_diff_stub.calledTwice).toBe(true);
        expect(stderr_diff_stub.calledTwice).toBe(true);
    });

    test('fdbk_category Watcher', async () => {
        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(output_size_stub.calledOnce).toBe(true);
        expect(stdout_stub.calledOnce).toBe(true);
        expect(stderr_stub.calledOnce).toBe(true);
        expect(stdout_diff_stub.calledOnce).toBe(true);
        expect(stderr_diff_stub.calledOnce).toBe(true);

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.ultimate_submission});

        await wait_fixed(wrapper, 4);

        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.ultimate_submission);
        expect(output_size_stub.calledOnce).toBe(true);
        expect(stdout_stub.calledOnce).toBe(true);
        expect(stderr_stub.calledOnce).toBe(true);
        expect(stdout_diff_stub.calledOnce).toBe(true);
        expect(stderr_diff_stub.calledOnce).toBe(true);
    });
});
