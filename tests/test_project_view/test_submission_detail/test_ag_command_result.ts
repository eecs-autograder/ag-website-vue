import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGCommandResult from '@/components/project_view/submission_detail/ag_command_result.vue';
import { ReturnCodeCorrectness } from '@/components/project_view/submission_detail/return_code_correctness';

import * as data_ut from '@/tests/data_utils';

let user: ag_cli.User;
let group: ag_cli.Group;
let submission: ag_cli.Submission;
let ag_test_command_result: ag_cli.AGTestCommandResultFeedback;

let get_ag_test_cmd_result_stdout_stub: sinon.SinonStub;
let get_ag_test_cmd_result_stderr_stub: sinon.SinonStub;
let get_ag_test_cmd_result_stdout_diff_stub: sinon.SinonStub;
let get_ag_test_cmd_result_stderr_diff_stub: sinon.SinonStub;
let get_ag_test_cmd_result_output_size_stub: sinon.SinonStub;

let diff_contents: string[];
let stdout_content: string;
let stderr_content: string;
let stdout_diff_content: string[];
let stderr_diff_content: string[];

beforeEach(() => {
    user = data_ut.make_user();
    group = data_ut.make_group(1, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
    ag_test_command_result = data_ut.make_ag_test_command_result_feedback(1);

    diff_contents = [
        '  one\r\n',
        '  two\n',
        '- left one\n',
        '- left two\n',
        '- left three\n',
        '  three\n',
        '+ right one\n',
        '+ right two\n',
        '  four\n',
        '  five\n'
    ];

    stdout_content = "stdout content";
    stderr_content = "stderr_content";
    stdout_diff_content = diff_contents;
    stderr_diff_content = diff_contents;

    get_ag_test_cmd_result_stdout_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stdout'
    ).returns(Promise.resolve(stdout_content));

    get_ag_test_cmd_result_stdout_diff_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stdout_diff'
    ).returns(Promise.resolve(stdout_diff_content));

    get_ag_test_cmd_result_stderr_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stderr'
    ).returns(Promise.resolve(stderr_content));

    get_ag_test_cmd_result_stderr_diff_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stderr_diff'
    ).returns(Promise.resolve(stderr_diff_content));

    get_ag_test_cmd_result_output_size_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_output_size'
    ).returns(Promise.resolve(
        {
            stdout_size: 10,
            stderr_size: 10,
            stdout_diff_size: 10,
            stderr_diff_size: 10
        }
    ));
});

afterEach(() => {
    sinon.restore();
});

describe('AGCommandResult tests', () => {
    let wrapper: Wrapper<AGCommandResult>;

    test('return_code_correctness - timed_out === null && return_code_correct === null',
         async () => {
        ag_test_command_result.timed_out = null;
        ag_test_command_result.return_code_correct = null;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.return_code_correctness).toEqual("Not Available");
        expect(wrapper.find('#return-code-correctness').exists()).toBe(false);
    });

    test('return_code_correctness - timed_out === true', async () => {
        ag_test_command_result.timed_out = true;
        ag_test_command_result.stdout_correct = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBe(true);
        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.return_code_correctness).toEqual("Timed Out");
        expect(wrapper.find('.correctness-output').find(
            '.timed-out-icon'
        ).exists()).toBe(true);
    });

    test('return_code_correctness - timed_out === false && return_code_correct === null',
         async () => {
        ag_test_command_result.timed_out = false;
        ag_test_command_result.return_code_correct = null;
        ag_test_command_result.stdout_correct = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBe(false);
        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.return_code_correctness).toEqual("Not Available");
        expect(wrapper.find('.correctness-output').find(
            '.not-available-icon'
        ).exists()).toBe(true);
    });

    test('return_code_correctness - timed_out === null && return_code_correct === true',
         async () => {
        ag_test_command_result.timed_out = null;
        ag_test_command_result.return_code_correct = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBe(true);
        expect(wrapper.vm.return_code_correctness).toEqual(ReturnCodeCorrectness.correct);
        expect(wrapper.find('.correctness-output').find(
            '.correct-icon'
        ).exists()).toBe(true);
    });

    test('return_code_correctness - timed_out === null && return_code_correct === false',
         async () => {
        ag_test_command_result.timed_out = null;
        ag_test_command_result.return_code_correct = false;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBe(false);
        expect(wrapper.vm.return_code_correctness).toEqual(ReturnCodeCorrectness.incorrect);
        expect(wrapper.find('.correctness-output').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
    });

    test('Exit status - expected_and_actual_return_code tooltip is present - ' +
        'return_code_fdbk_level === expected_and_actual',
         async () => {
        ag_test_command_result.return_code_correct = true;
        ag_test_command_result.fdbk_settings.return_code_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find({ref: 'expected_and_actual_return_code'}).exists()).toBe(true);
    });

    test('Exit status - expected_and_actual_return_code tooltip is present - ' +
        'actual_return_code !== null',
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
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find({ref: 'expected_and_actual_return_code'}).exists()).toBe(true);
    });

    test('Exit status - expected_and_actual_return_code tooltip is present - ' +
        'timed_out === true',
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
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find({ref: 'expected_and_actual_return_code'}).exists()).toBe(true);
    });

    test('stdout_section - stdout_correct === null', async () => {
        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBeNull();
        expect(wrapper.find('#stdout-correctness-section').exists()).toBe(false);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === true', async () => {
        ag_test_command_result.stdout_correct = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: 10,
                stderr_size: 10,
                stdout_diff_size: null,
                stderr_diff_size: 10
            }
        ));

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).not.toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.no_feedback
        );
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stdout_diff).toBeNull();
        expect(wrapper.find('#stdout-correctness-section').find(
            '.correct-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === false and stdout_fdbk_level ' +
        '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).not.toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.no_feedback
        );
        expect(wrapper.find('#stdout-correctness-section').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === false and stdout_fdbk_level ' +
        '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;
        ag_test_command_result.fdbk_settings.stdout_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).not.toBeNull();
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.expected_and_actual
        );
        expect(wrapper.find('#stdout-correctness-section').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(true);
        expect(wrapper.find({ref: 'stdout_diff'}).exists()).toBe(true);
    });

    test('stdout_section - show_actual_stdout === true and stdout_content === null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: null,
                stderr_size: 10,
                stdout_diff_size: 10,
                stderr_diff_size: 10
            }
        ));

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.show_actual_stdout).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stdout_content).toBeNull();
        expect(wrapper.find('#actual-stdout-section').text()).toContain("No Output");
    });

    test('stdout_section - show_actual_stdout === true and stdout_content !== null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.show_actual_stdout).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_stdout_content).toEqual(stdout_content);
        expect(wrapper.find('#actual-stdout-section').text()).toContain(stdout_content);
    });

    test('stdout_section - show_actual_stdout === false', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stdout = false;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.show_actual_stdout).toBe(false);
        expect(wrapper.find('#actual-stdout-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === null', async () => {
        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBeNull();
        expect(wrapper.find('#stderr-correctness-section').exists()).toBe(false);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === true', async () => {
        ag_test_command_result.stderr_correct = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: 10,
                stderr_size: 10,
                stdout_diff_size: 10,
                stderr_diff_size: null
            }
        ));

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBe(true);
        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.no_feedback
        );
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stderr_diff).toBeNull();
        expect(wrapper.find('#stderr-correctness-section').find(
            '.correct-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === false and stderr_fdbk_level ' +
        '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).not.toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.no_feedback
        );
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(wrapper.find('#stderr-correctness-section').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === false and stderr_fdbk_level ' +
        '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;
        ag_test_command_result.fdbk_settings.stderr_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).not.toBeNull();
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.expected_and_actual
        );
        expect(wrapper.find('#stderr-correctness-section').find(
            '.incorrect-icon').exists()
        ).toBe(true);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(true);
        expect(wrapper.find({ref: 'stderr_diff'}).exists()).toBe(true);
    });

    test('stderr_section - show_actual_stderr === true and stderr_content === null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stderr = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: 10,
                stderr_size: null,
                stdout_diff_size: 10,
                stderr_diff_size: 10
            }
        ));

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.show_actual_stderr).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stderr_content).toBeNull();
        expect(wrapper.find('#actual-stderr-section').text()).toContain("No Output");
    });

    test('stderr_section - show_actual_stderr === true and stderr_content !== null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stderr = true;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.show_actual_stderr).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_stderr_content).toEqual(stderr_content);
        expect(wrapper.find('#actual-stderr-section').text()).toContain(stderr_content);
    });

    test('show_correctness_fieldset getter', async () => {
        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBeNull();
        expect(wrapper.vm.show_correctness_fieldset).toBe(false);

        wrapper.vm.d_ag_test_command_result!.return_code_correct = true;

        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).not.toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBeNull();
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);

        wrapper.vm.d_ag_test_command_result!.return_code_correct = null;
        wrapper.vm.d_ag_test_command_result!.stdout_correct = true;

        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).not.toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBeNull();
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);

        wrapper.vm.d_ag_test_command_result!.stdout_correct = null;
        wrapper.vm.d_ag_test_command_result!.stderr_correct = false;

        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).not.toBeNull();
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);
    });

    test('show_exit_status_tooltip getter', async () => {
        ag_test_command_result!.timed_out = null;

        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level
        ).not.toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.d_ag_test_command_result!.actual_return_code).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBeNull();
        expect(wrapper.vm.show_exit_status_tooltip).toBe(false);

        wrapper.vm.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.expected_and_actual
        );
        expect(wrapper.vm.d_ag_test_command_result!.actual_return_code).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBeNull();
        expect(wrapper.vm.show_exit_status_tooltip).toBe(true);

        wrapper.vm.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level
            = ag_cli.ValueFeedbackLevel.correct_or_incorrect;
        wrapper.vm.d_ag_test_command_result!.actual_return_code = 0;

        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level
        ).not.toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.d_ag_test_command_result!.actual_return_code).toEqual(0);
        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBeNull();
        expect(wrapper.vm.show_exit_status_tooltip).toBe(true);

        wrapper.vm.d_ag_test_command_result!.actual_return_code = null;
        wrapper.vm.d_ag_test_command_result!.timed_out = true;

        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.return_code_fdbk_level
        ).not.toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.d_ag_test_command_result!.actual_return_code).toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBe(true);
        expect(wrapper.vm.show_exit_status_tooltip).toBe(true);
    });

    test('show_stdout_diff getter', async () => {
        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBeNull();
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level
        ).not.toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stdout_diff).toBe(false);

        wrapper.vm.d_ag_test_command_result!.stdout_correct = false;

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBe(false);
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level
        ).not.toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stdout_diff).toBe(false);

        wrapper.vm.d_ag_test_command_result!.stdout_correct = null;
        wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBeNull();
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level
        ).toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stdout_diff).toBe(false);

        wrapper.vm.d_ag_test_command_result!.stdout_correct = false;

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).toBe(false);
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level
        ).toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stdout_diff).toBe(true);
    });

    test('show_stderr_diff getter', async () => {
        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBeNull();
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level
        ).not.toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stderr_diff).toBe(false);

        wrapper.vm.d_ag_test_command_result!.stderr_correct = false;

        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBe(false);
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level
        ).not.toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stderr_diff).toBe(false);

        wrapper.vm.d_ag_test_command_result!.stderr_correct = null;
        wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBeNull();
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level
        ).toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stderr_diff).toBe(false);

        wrapper.vm.d_ag_test_command_result!.stderr_correct = false;

        expect(wrapper.vm.d_ag_test_command_result!.stderr_correct).toBe(false);
        expect(
            wrapper.vm.d_ag_test_command_result!.fdbk_settings.stderr_fdbk_level
        ).toEqual(ag_cli.ValueFeedbackLevel.expected_and_actual);
        expect(wrapper.vm.show_stderr_diff).toBe(true);
    });
});

describe('AGCommandResults Watchers', () => {
    let wrapper: Wrapper<AGCommandResult>;

    beforeEach(() => {
        wrapper = mount(AGCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
    });

    test('submission Watcher', async () => {
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_submission).toEqual(submission);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);

        let updated_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: updated_submission});

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(submission).not.toEqual(updated_submission);
        expect(wrapper.vm.d_submission).toEqual(updated_submission);

        expect(get_ag_test_cmd_result_stdout_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledTwice).toBe(true);
    });

    test('ag_test_command_result Watcher', async () => {
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result).toEqual(ag_test_command_result);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);

        let updated_ag_test_command_result = data_ut.make_ag_test_command_result_feedback(1);
        wrapper.setProps({ag_test_command_result: updated_ag_test_command_result});

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(ag_test_command_result).not.toEqual(updated_ag_test_command_result);
        expect(wrapper.vm.d_ag_test_command_result).toEqual(updated_ag_test_command_result);
        expect(get_ag_test_cmd_result_stdout_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledTwice).toBe(true);
    });

    test('fdbk_category Watcher', async () => {
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.ultimate_submission});

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.ultimate_submission);
        expect(get_ag_test_cmd_result_stdout_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledTwice).toBe(true);
    });
});
