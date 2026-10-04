import { Wrapper } from '@vue/test-utils';
import Vue from 'vue';

import {
    BugsExposedFeedbackLevel,
    MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import MutationTestSuiteAdvancedFdbkSettings
    from '@/components/project_admin/mutation_suites/mutation_test_suite_advanced_fdbk_settings.vue';

import { make_mutation_test_suite_fdbk_config } from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, emitted, find_collapsible_section_header, set_props } from '@/tests/utils';

function last_emitted_config(wrapper: Wrapper<Vue>) {
    let events = emitted(wrapper, 'input');
    return events[events.length - 1][0] as MutationTestSuiteFeedbackConfig;
}

async function do_checkbox_toggle_test(
    wrapper: Wrapper<Vue>,
    testid: string,
    field: keyof MutationTestSuiteFeedbackConfig,
) {
    let input = wrapper.find(`[data-testid=${testid}]`);

    await input.setChecked(true);
    expect(checkbox_is_checked(input)).toBe(true);
    expect(last_emitted_config(wrapper)[field]).toBe(true);

    await input.setChecked(false);
    expect(checkbox_is_checked(input)).toBe(false);
    expect(last_emitted_config(wrapper)[field]).toBe(false);

    await input.setChecked(true);
    expect(checkbox_is_checked(input)).toBe(true);
    expect(last_emitted_config(wrapper)[field]).toBe(true);
}

describe('MutationTestSuiteAdvancedFdbkSettings tests', () => {
    let wrapper: Wrapper<Vue>;
    let feedback_config: MutationTestSuiteFeedbackConfig;

    beforeEach(() => {
        feedback_config = make_mutation_test_suite_fdbk_config();

        wrapper = managed_mount(MutationTestSuiteAdvancedFdbkSettings, {
            propsData: {
                config_name: "normal",
                value: feedback_config
            }
        });
    });

    test('visible binding', async () => {
        await do_checkbox_toggle_test(wrapper, 'mutation_suite_is_visible', 'visible');
    });

    test('bugs_exposed_fdbk_level binding', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let bugs_exposed_fdbk_level_input = wrapper.get('[data-testid=bugs_exposed_fdbk_level]');

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.no_feedback);
        expect(last_emitted_config(wrapper).bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.no_feedback
        );

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.num_bugs_exposed);
        expect(last_emitted_config(wrapper).bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.num_bugs_exposed
        );

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.exposed_bug_names);
        expect(last_emitted_config(wrapper).bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.exposed_bug_names
        );

        await bugs_exposed_fdbk_level_input.setValue(BugsExposedFeedbackLevel.all_bug_names);
        expect(last_emitted_config(wrapper).bugs_exposed_fdbk_level).toEqual(
            BugsExposedFeedbackLevel.all_bug_names
        );
    });

    test('Toggle show_invalid_test_names', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(wrapper, 'show_invalid_test_names', 'show_invalid_test_names');
    });

    test('Toggle show_points', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(wrapper, 'show_points', 'show_points');
    });

    test('Toggle show_setup_return_code', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(wrapper, 'show_setup_return_code', 'show_setup_return_code');
    });

    test('Toggle show_setup_stdout', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(wrapper, 'show_setup_stdout', 'show_setup_stdout');
    });

    test('Toggle show_setup_stderr', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(wrapper, 'show_setup_stderr', 'show_setup_stderr');
    });

    test('Toggle show_get_test_names_return_code', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(
            wrapper, 'show_test_name_discovery_return_code', 'show_get_test_names_return_code'
        );
    });

    test('Toggle show_get_test_names_stdout', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(
            wrapper, 'show_test_name_discovery_stdout', 'show_get_test_names_stdout'
        );
    });

    test('Toggle show_get_test_names_stderr', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(
            wrapper, 'show_test_name_discovery_stderr', 'show_get_test_names_stderr'
        );
    });

    test('Toggle show_validity_check_stdout', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(
            wrapper, 'show_validity_check_stdout', 'show_validity_check_stdout'
        );
    });

    test('Toggle show_validity_check_stderr', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(
            wrapper, 'show_validity_check_stderr', 'show_validity_check_stderr'
        );
    });

    test('Toggle show_grade_buggy_impls_stdout', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(
            wrapper, 'show_grade_buggy_impls_stdout', 'show_grade_buggy_impls_stdout'
        );
    });

    test('Toggle show_grade_buggy_impls_stderr', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');
        await do_checkbox_toggle_test(
            wrapper, 'show_grade_buggy_impls_stderr', 'show_grade_buggy_impls_stderr'
        );
    });

    test('value prop update is reflected in rendered inputs', async () => {
        await find_collapsible_section_header(wrapper).trigger('click');

        let new_val = make_mutation_test_suite_fdbk_config({
            visible: true,
            bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.all_bug_names,
            show_invalid_test_names: true,
            show_points: true,
            show_setup_return_code: true,
            show_setup_stdout: true,
            show_setup_stderr: true,
            show_get_test_names_return_code: true,
            show_get_test_names_stdout: true,
            show_get_test_names_stderr: true,
            show_validity_check_stdout: true,
            show_validity_check_stderr: true,
            show_grade_buggy_impls_stdout: true,
            show_grade_buggy_impls_stderr: true,
        });
        await set_props(wrapper, {'value': new_val});

        expect(checkbox_is_checked(wrapper.find('[data-testid=mutation_suite_is_visible]'))).toBe(true);
        expect(
            wrapper.get('[data-testid=bugs_exposed_fdbk_level]').element.value
        ).toEqual(BugsExposedFeedbackLevel.all_bug_names);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_invalid_test_names]'))
        ).toBe(true);
        expect(checkbox_is_checked(wrapper.find('[data-testid=show_points]'))).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_setup_return_code]'))
        ).toBe(true);
        expect(checkbox_is_checked(wrapper.find('[data-testid=show_setup_stdout]'))).toBe(true);
        expect(checkbox_is_checked(wrapper.find('[data-testid=show_setup_stderr]'))).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_test_name_discovery_return_code]'))
        ).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_test_name_discovery_stdout]'))
        ).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_test_name_discovery_stderr]'))
        ).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_validity_check_stdout]'))
        ).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_validity_check_stderr]'))
        ).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_grade_buggy_impls_stdout]'))
        ).toBe(true);
        expect(
            checkbox_is_checked(wrapper.find('[data-testid=show_grade_buggy_impls_stderr]'))
        ).toBe(true);

        await set_props(wrapper, {'value': feedback_config});
        expect(checkbox_is_checked(wrapper.find('[data-testid=mutation_suite_is_visible]'))).toBe(false);
    });
});
