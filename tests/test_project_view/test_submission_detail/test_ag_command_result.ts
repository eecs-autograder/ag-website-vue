import AGCommandResult from '@/components/project_view/submission_detail/ag_command_result.vue';

import * as data_ut from '@/tests/data_utils';
import { config, mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import { ValueFeedbackLevel } from 'ag-client-typescript';
import * as sinon from 'sinon';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCommandResult tests', () => {
    let wrapper: Wrapper<AGCommandResult>;
    let submission: ag_cli.Submission;
    let ag_test_command_result: ag_cli.AGTestCommandResultFeedback;

    let get_ag_test_cmd_result_stdout_stub: sinon.SinonStub;
    let get_ag_test_cmd_result_stderr_stub: sinon.SinonStub;
    let get_ag_test_cmd_result_stdout_diff_stub: sinon.SinonStub;
    let get_ag_test_cmd_result_stderr_diff_stub: sinon.SinonStub;

    beforeEach(() => {
        submission = new ag_cli.Submission({
            pk: 5,
            group: 7,
            timestamp: "",
            submitter: 'batman',
            submitted_filenames: ['spam', 'egg'],
            discarded_files: ['very', 'nope'],
            missing_files: {'oops': 1, '*.cpp': 3},
            status: ag_cli.GradingStatus.being_graded,
            count_towards_daily_limit: false,
            is_past_daily_limit: false,
            is_bonus_submission: true,
            count_towards_total_limit: true,
            does_not_count_for: ['robin'],
            position_in_queue: 3,
            last_modified: ""
        });

        ag_test_command_result = data_ut.make_ag_test_command_result_feedback(1);

        get_ag_test_cmd_result_stdout_stub = sinon.stub(
            ag_cli.ResultOutput,
            'get_ag_test_cmd_result_stdout'
        );

        get_ag_test_cmd_result_stdout_diff_stub = sinon.stub(
            ag_cli.ResultOutput,
            'get_ag_test_cmd_result_stdout_diff'
        );

        get_ag_test_cmd_result_stderr_stub = sinon.stub(
            ag_cli.ResultOutput,
            'get_ag_test_cmd_result_stderr'
        );

        get_ag_test_cmd_result_stderr_diff_stub = sinon.stub(
            ag_cli.ResultOutput,
            'get_ag_test_cmd_result_stderr_diff'
        );
    });

    afterEach(() => {
       sinon.restore();
    });

    test('Exit status - ag_test_command_result.timed_out is true', async () => {
        ag_test_command_result.timed_out = true;
        ag_test_command_result.return_code_correct = false;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('#return-code-correctness').text()).toContain("Timed out");
    });

    test('Exit status - ag_test_command_result.return_code_correct is true', async () => {
        ag_test_command_result.return_code_correct = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('#return-code-correctness').text()).toContain("Correct");
    });

    test('Exit status - ag_test_command_result.return_code_correct is false?', async () => {
        ag_test_command_result.return_code_correct = false;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('#return-code-correctness').text()).toContain("Incorrect");
    });

    test('Exit status - expected_and_actual_return_code tooltip is present - ' +
         'return_code_fdbk_level = expected_and_actual',
         async () => {
        ag_test_command_result.return_code_correct = true;
        ag_test_command_result.fdbk_settings.return_code_fdbk_level
            = ValueFeedbackLevel.expected_and_actual;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'expected_and_actual_return_code'}).exists()).toBe(true);
    });

    test('Exit status - expected_and_actual_return_code tooltip is present - ' +
         'actual_return_code is not null',
         async () => {
        ag_test_command_result.return_code_correct = true;
        ag_test_command_result.actual_return_code = 0;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'expected_and_actual_return_code'}).exists()).toBe(true);
    });

    test('Exit status - expected_and_actual_return_code tooltip is present - ' +
         'timed_out is true',
         async () => {
        ag_test_command_result.return_code_correct = true;
        ag_test_command_result.timed_out = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'expected_and_actual_return_code'}).exists()).toBe(true);
    });

    test('stdout_section - stdout_correct is null',
         async () => {
        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_command_result.stdout_correct).toBeNull();
        expect(wrapper.find('#stdout-correctness-section').exists()).toBe(false);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct is true',
         async () => {
        ag_test_command_result.stdout_correct = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_command_result.stdout_correct).not.toBeNull();
        expect(wrapper.find('#stdout-correctness-section').exists()).toBe(true);
        expect(wrapper.find('#stdout-correctness-section').text()).toContain("Correct");
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct is false and stdout_fdbk_level ' +
         '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;

        get_ag_test_cmd_result_stdout_diff_stub.returns(
            Promise.resolve(["stdout diff contents"])
        );

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_command_result.stdout_correct).not.toBeNull();
        expect(wrapper.find('#stdout-correctness-section').exists()).toBe(true);
        expect(wrapper.find('#stdout-correctness-section').text()).toContain("Incorrect");
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct is false and stdout_fdbk_level ' +
         '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;
        ag_test_command_result.fdbk_settings.stdout_fdbk_level
            = ValueFeedbackLevel.expected_and_actual;

        get_ag_test_cmd_result_stdout_diff_stub.returns(
            Promise.resolve(["stdout diff contents"])
        );

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_command_result.stdout_correct).not.toBeNull();
        expect(wrapper.find('#stdout-correctness-section').exists()).toBe(true);
        expect(wrapper.find('#stdout-correctness-section').text()).toContain("Incorrect");
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(true);
        expect(wrapper.find('#stdout-diff-section').text()).toContain("stdout diff contents");
    });
});
