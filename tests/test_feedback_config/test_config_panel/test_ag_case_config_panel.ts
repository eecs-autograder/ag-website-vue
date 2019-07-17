import { config, mount, Wrapper } from '@vue/test-utils';

import { AGTestCaseFeedbackConfig } from 'ag-client-typescript';

import AGCaseConfigPanel from '@/components/feedback_config/config_panel/ag_case_config_panel.vue';

import { create_ag_case_feedback_config } from '@/tests/data_utils';
import { checkbox_is_checked } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGCaseConfigPanel tests', () => {
    let wrapper: Wrapper<AGCaseConfigPanel>;
    let component: AGCaseConfigPanel;
    let ag_test_case_normal_feedback_config: AGTestCaseFeedbackConfig;

    beforeEach(() => {
        ag_test_case_normal_feedback_config = create_ag_case_feedback_config();

        wrapper = mount(AGCaseConfigPanel, {
            propsData: {
                config_name: "Normal",
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

    test('Value Watcher', async () => {
        expect(component.d_ag_test_case_settings).toEqual(ag_test_case_normal_feedback_config);

        let another_ag_case_feedback = create_ag_case_feedback_config();

        wrapper.setProps({value: another_ag_case_feedback});
        await component.$nextTick();

        expect(component.d_ag_test_case_settings).toEqual(another_ag_case_feedback);
    });

    test('visible binding', async () => {
        let visible_input = wrapper.find('#normal-visible');

        visible_input.setChecked(true);
        expect(component.d_ag_test_case_settings!.visible).toEqual(true);

        visible_input.setChecked(false);
        expect(component.d_ag_test_case_settings!.visible).toEqual(false);

        visible_input.setChecked(true);
        expect(component.d_ag_test_case_settings!.visible).toEqual(true);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        component.d_ag_test_case_settings!.visible = false;
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        component.d_ag_test_case_settings!.visible = true;
        expect(checkbox_is_checked(visible_input)).toEqual(true);
    });

    test('show_individual_commands binding', async () => {
        let show_individual_commands_input = wrapper.find('#normal-show-individual-commands');

        show_individual_commands_input.setChecked(true);
        expect(component.d_ag_test_case_settings!.show_individual_commands).toEqual(true);

        show_individual_commands_input.setChecked(false);
        expect(component.d_ag_test_case_settings!.show_individual_commands).toEqual(false);

        show_individual_commands_input.setChecked(true);
        expect(component.d_ag_test_case_settings!.show_individual_commands).toEqual(true);

        expect(checkbox_is_checked(show_individual_commands_input)).toEqual(true);

        component.d_ag_test_case_settings!.show_individual_commands = false;
        expect(checkbox_is_checked(show_individual_commands_input)).toEqual(false);

        component.d_ag_test_case_settings!.show_individual_commands = true;
        expect(checkbox_is_checked(show_individual_commands_input)).toEqual(true);
    });
});
