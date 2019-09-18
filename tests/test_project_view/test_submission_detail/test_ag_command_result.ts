import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGCommandResult from '@/components/project_view/submission_detail/ag_command_result.vue';

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

beforeEach(() => {
    user = data_ut.make_user();
    group = data_ut.make_group(1, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
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

        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBe(true);
        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.return_code_correctness).toEqual("Timed Out");
        expect(wrapper.find('#return-code-correctness').exists()).toBe(false);
    });

    test('return_code_correctness - timed_out === false && return_code_correct === null',
         async () => {
        ag_test_command_result.timed_out = false;
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

        expect(wrapper.vm.d_ag_test_command_result!.timed_out).toBe(false);
        expect(wrapper.vm.d_ag_test_command_result!.return_code_correct).toBeNull();
        expect(wrapper.vm.return_code_correctness).toEqual("Not Available");
        expect(wrapper.find('#return-code-correctness').exists()).toBe(false);
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
        expect(wrapper.vm.return_code_correctness).toEqual("Correct");
        expect(wrapper.find('#return-code-correctness').text()).toEqual("Correct");
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
        expect(wrapper.vm.return_code_correctness).toEqual("Incorrect");
        expect(wrapper.find('#return-code-correctness').text()).toEqual("Incorrect");
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
        expect(wrapper.find('#stdout-correctness-section').text()).toContain("Correct");
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === false and stdout_fdbk_level ' +
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
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_ag_test_command_result!.stdout_correct).not.toBeNull();
        expect(wrapper.vm.d_ag_test_command_result!.fdbk_settings.stdout_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.no_feedback
        );
        expect(wrapper.find('#stdout-correctness-section').text()).toContain("Incorrect");
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === false and stdout_fdbk_level ' +
        '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;
        ag_test_command_result.fdbk_settings.stdout_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        let diff_contents = [
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

        get_ag_test_cmd_result_stdout_diff_stub.returns(
            Promise.resolve(diff_contents)
        );

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
        expect(wrapper.find('#stdout-correctness-section').text()).toContain("Incorrect");
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
        expect(wrapper.find('#stdout-actual-section').text()).toContain("No Output");
    });

    test('stdout_section - show_actual_stdout === true and stdout_content !== null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        get_ag_test_cmd_result_stdout_stub.returns(
            Promise.resolve("actual stdout")
        );

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
        expect(wrapper.vm.d_stdout_content).toEqual("actual stdout");
        expect(wrapper.find('#stdout-actual-section').text()).toContain("actual stdout");
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
        expect(wrapper.find('#stdout-actual-section').exists()).toBe(false);
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
        expect(wrapper.find('#stderr-correctness-section').text()).toContain("Correct");
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === false and stderr_fdbk_level ' +
        '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;

        get_ag_test_cmd_result_stderr_diff_stub.returns(
            Promise.resolve(["stderr diff contents"])
        );

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
        expect(wrapper.find('#stderr-correctness-section').text()).toContain("Incorrect");
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === false and stderr_fdbk_level ' +
        '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;
        ag_test_command_result.fdbk_settings.stderr_fdbk_level
            = ag_cli.ValueFeedbackLevel.expected_and_actual;

        let diff_contents = [
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

        get_ag_test_cmd_result_stderr_diff_stub.returns(
            Promise.resolve(diff_contents)
        );

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
        expect(wrapper.find('#stderr-correctness-section').text()).toContain("Incorrect");
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
        expect(wrapper.find('#stderr-actual-section').text()).toContain("No Output");
    });

    test('stderr_section - show_actual_stderr === true and stderr_content !== null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stderr = true;

        get_ag_test_cmd_result_stderr_stub.returns(
            Promise.resolve("actual stderr")
        );

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
        expect(wrapper.vm.d_stderr_content).toEqual("actual stderr");
        expect(wrapper.find('#stderr-actual-section').text()).toContain("actual stderr");
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
