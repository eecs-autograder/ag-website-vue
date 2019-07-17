import { config, mount, Wrapper } from '@vue/test-utils';

import { AGTestCaseFeedbackConfig } from 'ag-client-typescript';

import AGCaseConfigPanel from '@/components/feedback_config/config_panel/ag_case_config_panel.vue';

import { create_ag_case_feedback_config } from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCaseConfigPanel tests', () => {
    let wrapper: Wrapper<AGCaseConfigPanel>;
    let component: AGCaseConfigPanel;
    let ag_test_case_normal_feedback_config: AGTestCaseFeedbackConfig;
    let ag_test_case_staff_viewer_config: AGTestCaseFeedbackConfig;

    beforeEach(() => {
        ag_test_case_normal_feedback_config = create_ag_case_feedback_config();
        ag_test_case_staff_viewer_config = create_ag_case_feedback_config();

        wrapper = mount(AGCaseConfigPanel, {
            propsData: {
                config_name: "Normal",
                editing_settings: true,
                value: ag_test_case_normal_feedback_config,
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Toggle visible', async () => {
        expect(true).toBe(true);
    });
});
