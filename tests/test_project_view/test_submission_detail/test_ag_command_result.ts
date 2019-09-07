import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCommandResultFeedback,
    FeedbackCategory,
    Submission
} from 'ag-client-typescript';

import AGCommandResult from '@/components/project_view/submission_detail/ag_command_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCommandResult tests', () => {
    let wrapper: Wrapper<AGCommandResult>;
    let submission: Submission;
    let ag_test_command_result: AGTestCommandResultFeedback;

    beforeEach(() => {

        wrapper = mount(AGCommandResult, {
            propsData: {
                ag_test_command_result: ag_test_command_result,
                submission: submission,
                fdbk_category: FeedbackCategory.max,
                ag_test_command_row_correctness_level: CorrectnessLevel.none_correct,
                panel_is_active: true,
                panel_is_odd: true
            }
        });
    });

    test('', async () => {

    });
});
