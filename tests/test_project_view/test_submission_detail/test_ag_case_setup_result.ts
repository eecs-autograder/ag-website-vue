import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuiteResultFeedback,
    FeedbackCategory,
    GradingStatus, ResultOutput,
    Submission
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGCaseSetupResult from '@/components/project_view/submission_detail/ag_case_setup_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

import { make_ag_test_suite_fdbk_config } from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCaseSetupResult tests', () => {
    let wrapper: Wrapper<AGCaseSetupResult>;
    let submission: Submission;
    let ag_test_suite_result: AGTestSuiteResultFeedback;

    beforeEach(() => {
        submission = new Submission({
            pk: 5,
            group: 7,
            timestamp: "",
            submitter: 'batman',
            submitted_filenames: ['spam', 'egg'],
            discarded_files: ['very', 'nope'],
            missing_files: {'oops': 1, '*.cpp': 3},
            status: GradingStatus.being_graded,
            count_towards_daily_limit: false,
            is_past_daily_limit: false,
            is_bonus_submission: true,
            count_towards_total_limit: true,
            does_not_count_for: ['robin'],
            position_in_queue: 3,
            last_modified: ""
        });

        ag_test_suite_result = {
            pk: 1,
            ag_test_suite_name: "Suite Name",
            ag_test_suite_pk: 1,
            fdbk_settings: make_ag_test_suite_fdbk_config(),
            total_points: 0,
            total_points_possible: 2,
            setup_name: null,
            setup_return_code: 0,
            setup_timed_out: false,
            ag_test_case_results: []
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    test('setup_stdout is null && show_setup_stdout is true', async () => {
        fail();
        sinon.stub(ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout').returns(
            Promise.resolve("hi")
        );
        sinon.stub(ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr').returns(
            Promise.resolve("bye")
        );

        ag_test_suite_result.fdbk_settings.show_setup_stdout = true;

        wrapper = mount(AGCaseSetupResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: FeedbackCategory.max
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_setup_stdout_loaded).toBe(true);
        expect(wrapper.find('#stdout-section').isVisible()).toBe(true);
    });

    test.skip('setup_stderr is null', async () => {
    });

    test.skip('setup_stdout is not null', async () => {
    });

    test.skip('setup_stderr is not null', async () => {
    });

    test.skip('show_setup_stdout is true', async () => {
    });

    test.skip('show_setup_stdout is false', async () => {
    });

    test.skip('show_setup_stderr is true', async () => {
    });

    test.skip('show_setup_stderr is false', async () => {
    });

    test.skip('setup command timed out', async () => {
    });

    test.skip('Exit status is displayed', async () => {
    });
});
