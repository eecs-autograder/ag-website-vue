import { mount, Wrapper } from '@vue/test-utils';

import { AGTestCaseFeedbackConfig } from 'ag-client-typescript';

import AGTestCaseFdbkConfigPanel from '@/components/project_admin/ag_suites/ag_test_case_fdbk_config_panel.vue';

import { make_ag_test_case_feedback_config } from '@/tests/data_utils';
import { checkbox_is_checked, set_data } from '@/tests/utils';


describe('AGTestCaseFdbkConfigPanel tests', () => {
    let wrapper: Wrapper<AGTestCaseFdbkConfigPanel>;
    let component: AGTestCaseFdbkConfigPanel;
    let ag_test_case_normal_feedback_config: AGTestCaseFeedbackConfig;

    beforeEach(() => {
        ag_test_case_normal_feedback_config = make_ag_test_case_feedback_config();

        wrapper = mount(AGTestCaseFdbkConfigPanel, {
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
        expect(component.d_feedback_config).toEqual(ag_test_case_normal_feedback_config);

        let another_ag_case_feedback = make_ag_test_case_feedback_config();

        wrapper.setProps({value: another_ag_case_feedback});
        await component.$nextTick();

        expect(component.d_feedback_config).toEqual(another_ag_case_feedback);
    });

    test('visible binding', async () => {
        let visible_input = wrapper.find('[data-testid=is_visible]');

        await visible_input.setChecked(true);
        expect(component.d_feedback_config!.visible).toEqual(true);

        await visible_input.setChecked(false);
        expect(component.d_feedback_config!.visible).toEqual(false);

        await visible_input.setChecked(true);
        expect(component.d_feedback_config!.visible).toEqual(true);

        expect(checkbox_is_checked(visible_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {visible: false}});
        expect(checkbox_is_checked(visible_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {visible: true}});
        expect(checkbox_is_checked(visible_input)).toEqual(true);
    });

    test('show_individual_commands binding', async () => {
        let show_individual_commands_input = wrapper.find('[data-testid=show_individual_commands]');

        await show_individual_commands_input.setChecked(true);
        expect(component.d_feedback_config!.show_individual_commands).toEqual(true);

        await show_individual_commands_input.setChecked(false);
        expect(component.d_feedback_config!.show_individual_commands).toEqual(false);

        await show_individual_commands_input.setChecked(true);
        expect(component.d_feedback_config!.show_individual_commands).toEqual(true);

        expect(checkbox_is_checked(show_individual_commands_input)).toEqual(true);

        await set_data(wrapper, {d_feedback_config: {show_individual_commands: false}});
        expect(checkbox_is_checked(show_individual_commands_input)).toEqual(false);

        await set_data(wrapper, {d_feedback_config: {show_individual_commands: true}});
        expect(checkbox_is_checked(show_individual_commands_input)).toEqual(true);
    });
});
