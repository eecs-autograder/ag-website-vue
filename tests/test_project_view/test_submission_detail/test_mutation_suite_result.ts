import { config, mount, Wrapper } from '@vue/test-utils';

import {
    FeedbackCategory,
    MutationTestSuiteResultFeedback,
    Submission
} from 'ag-client-typescript';

import MutationSuiteResult from '@/components/project_view/submission_detail/mutation_suite_result.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationSuiteResult tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;
    let submission: Submission;
    let mutation_test_suite_result: MutationTestSuiteResultFeedback;

    beforeEach(() => {

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: FeedbackCategory.max
            }
        });
    });

    test('', async () => {

    });
});
