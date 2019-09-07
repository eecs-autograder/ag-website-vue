import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuiteResultFeedback,
    FeedbackCategory,
    Submission
} from 'ag-client-typescript';

import AGSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuiteResult tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;
    let submission: Submission;
    let ag_test_suite_result: AGTestSuiteResultFeedback;

    beforeEach(() => {

        wrapper = mount(AGSuiteResult, {
            propsData: {
                ag_test_suite_result: ag_test_suite_result,
                submission: submission,
                fdbk_category: FeedbackCategory.max,
                is_first_suite: true
            }
        });
    });

    test('', async () => {

    });
});
