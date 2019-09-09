import { config, mount, Wrapper } from '@vue/test-utils';

import {
    ResultOutput
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGCaseSetupResult from '@/components/project_view/submission_detail/ag_case_setup_result.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCaseSetupResult tests', () => {
    let wrapper: Wrapper<AGCaseSetupResult>;
    let submission: ag_cli.Submission;
    let ag_test_suite_result: ag_cli.AGTestSuiteResultFeedback;

    let get_ag_test_suite_result_setup_stdout_stub: sinon.SinonStub;
    let get_ag_test_suite_result_setup_stderr_stub: sinon.SinonStub;

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

        ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(1);
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('setup_stdout is null && show_setup_stdout is true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve(null)
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#stdout-section').text()).toContain("No Output");
    });

    test('setup_stderr is null && show_setup_stderr is true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve(null)
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stderr).toBe(true);
        expect(wrapper.find('#stderr-section').text()).toContain("No Output");
    });

    test('setup_stdout is not null and show_setup_stdout is true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#stdout-section').text()).toContain("hi");
    });

    test('setup_stderr is not null and show_setup_stderr is true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stderr).toBe(true);
        expect(wrapper.find('#stderr-section').text()).toContain("bye");
    });

    test('show_setup_stdout is true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#stdout-section').exists()).toBe(true);
    });

    test('show_setup_stdout is false', async () => {
        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.find('#stdout-section').exists()).toBe(false);
    });

    test('show_setup_stderr is true', async () => {
        ag_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stderr).toBe(true);
        expect(wrapper.find('#stderr-section').exists()).toBe(true);
    });

    test('show_setup_stderr is false', async () => {
        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.ag_test_suite_result.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.find('#stderr-section').exists()).toBe(false);
    });

    test('setup command timed out', async () => {
        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        ag_test_suite_result.setup_timed_out = true;

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('#exit-status-section').text()).toContain("Timed out");
    });

    test('Exit status is displayed', async () => {
        get_ag_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout'
        ).returns(
            Promise.resolve("hi")
        );
        get_ag_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr'
        ).returns(
            Promise.resolve("bye")
        );

        ag_test_suite_result.setup_timed_out = false;
        ag_test_suite_result.setup_return_code = 0;

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('#exit-status-section').text()).toContain("0");
    });
});
