import { Wrapper } from '@vue/test-utils';
import Vue from 'vue';

import { AGTestSuiteFeedbackConfig } from 'ag-client-typescript';

import AGTestSuiteAdvancedFdbkSettings from '@/components/project_admin/ag_tests/ag_test_suite_advanced_fdbk_settings.vue';

import { make_ag_test_suite_fdbk_config } from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, emitted, find_collapsible_section_header } from '@/tests/utils';


describe('AGTestSuiteAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<Vue>;
    let feedback_config: AGTestSuiteFeedbackConfig;

    beforeEach(() => {
        feedback_config = make_ag_test_suite_fdbk_config({
            show_setup_stdout: false,
            show_setup_stderr: true,
        });

        wrapper = managed_mount(AGTestSuiteAdvancedFdbkSettings, {
            propsData: {
                value: feedback_config
            }
        });
    });

    function last_emitted_config(): AGTestSuiteFeedbackConfig {
        let events = emitted(wrapper, 'input');
        return events[events.length - 1][0];
    }

    // Checking a box must emit the new config, and a new "value" prop must be
    // reflected back in the box's checked state.
    async function expect_two_way_binding(
        testid: string, field: keyof AGTestSuiteFeedbackConfig
    ) {
        await wrapper.setProps({value: make_ag_test_suite_fdbk_config({[field]: false})});

        let input = wrapper.find(`[data-testid=${testid}]`);
        expect(checkbox_is_checked(input)).toEqual(false);

        await input.setChecked(true);
        expect(last_emitted_config()[field]).toEqual(true);

        await input.setChecked(false);
        expect(last_emitted_config()[field]).toEqual(false);

        await input.setChecked(true);
        expect(last_emitted_config()[field]).toEqual(true);
        expect(checkbox_is_checked(input)).toEqual(true);

        await wrapper.setProps({value: make_ag_test_suite_fdbk_config({[field]: false})});
        expect(checkbox_is_checked(input)).toEqual(false);

        await wrapper.setProps({value: make_ag_test_suite_fdbk_config({[field]: true})});
        expect(checkbox_is_checked(input)).toEqual(true);
    }

    test('visible binding', async () => {
        await expect_two_way_binding('suite_is_visible', 'visible');
    });

    test('Toggle show_student_description', async () => {
        await expect_two_way_binding('show_student_description', 'show_student_description');
    });

    test('show_individual_tests binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await expect_two_way_binding('show_individual_tests', 'show_individual_tests');
    });

    test('Toggle show_setup_return_code', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await expect_two_way_binding('show_setup_return_code', 'show_setup_return_code');
    });

    test('Toggle show_setup_timed_out', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await expect_two_way_binding('show_setup_timed_out', 'show_setup_timed_out');
    });

    test('Toggle show_setup_stdout', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await expect_two_way_binding('show_setup_stdout', 'show_setup_stdout');
    });

    test('Toggle show_setup_stderr', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await expect_two_way_binding('show_setup_stderr', 'show_setup_stderr');
    });

    test('value Watcher', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let stdout_input = wrapper.find('[data-testid=show_setup_stdout]');
        let stderr_input = wrapper.find('[data-testid=show_setup_stderr]');
        expect(checkbox_is_checked(stdout_input)).toEqual(feedback_config.show_setup_stdout);
        expect(checkbox_is_checked(stderr_input)).toEqual(feedback_config.show_setup_stderr);

        let new_val = make_ag_test_suite_fdbk_config({
            show_setup_stdout: !feedback_config.show_setup_stdout,
            show_setup_stderr: !feedback_config.show_setup_stderr,
        });
        await wrapper.setProps({value: new_val});

        expect(checkbox_is_checked(stdout_input)).toEqual(new_val.show_setup_stdout);
        expect(checkbox_is_checked(stderr_input)).toEqual(new_val.show_setup_stderr);
    });
});
