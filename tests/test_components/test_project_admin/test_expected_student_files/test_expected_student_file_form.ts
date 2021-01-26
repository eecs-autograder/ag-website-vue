import { mount, Wrapper } from '@vue/test-utils';

import { ExpectedStudentFile } from 'ag-client-typescript';

import ExpectedStudentFileForm from '@/components/project_admin/expected_student_files/expected_student_file_form.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { emitted, set_data, set_validated_input_text } from '@/tests/utils';


describe('Input property tests', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;

    test('Default input', () => {
        wrapper = mount(ExpectedStudentFileForm);

        expect(wrapper.vm.d_expected_student_file.pattern).toEqual("");
        expect(wrapper.vm.d_expected_student_file.min_num_matches).toEqual(1);
        expect(wrapper.vm.d_expected_student_file.max_num_matches).toEqual(1);
    });

    test('Non-default input', () => {
        let file = new ExpectedStudentFile({
            pk: 1,
            project: 10,
            pattern: "lettuce.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        wrapper = mount(ExpectedStudentFileForm, {
            propsData: {
                expected_student_file: file
            }
        });

        expect(wrapper.vm.d_expected_student_file.pattern).toEqual(file.pattern);
        expect(wrapper.vm.d_expected_student_file.min_num_matches).toEqual(file.min_num_matches);
        expect(wrapper.vm.d_expected_student_file.max_num_matches).toEqual(file.max_num_matches);
    });
});

describe('Valid form submit tests', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;

    beforeEach(() => {
        wrapper = mount(ExpectedStudentFileForm);
    });

    test('Submit without wildcard present and exact match set to true', async () => {
        await set_data(wrapper, {d_expected_student_file: {pattern: "tomato.cpp"}});
        await wrapper.findComponent({ref: 'expected_student_file_form'}).trigger('submit');

        expect(emitted(wrapper, 'submit').length).toEqual(1);
        expect(emitted(wrapper, 'submit')[0][0].pattern).toEqual("tomato.cpp");
        expect(emitted(wrapper, 'submit')[0][0].min_num_matches).toEqual(1);
        expect(emitted(wrapper, 'submit')[0][0].max_num_matches).toEqual(1);
    });

    test('Submit without wildcard present and exact match set to false', async () => {
        await set_data(wrapper, {
            d_exact_match: false,
            d_expected_student_file: {pattern: "cabbage.cpp"}
        });
        await wrapper.findComponent({ref: 'expected_student_file_form'}).trigger('submit');

        expect(emitted(wrapper, 'submit').length).toEqual(1);
        expect(emitted(wrapper, 'submit')[0][0].pattern).toEqual("cabbage.cpp");
        expect(emitted(wrapper, 'submit')[0][0].min_num_matches).toEqual(1);
        expect(emitted(wrapper, 'submit')[0][0].max_num_matches).toEqual(1);
    });

    test('Submit with wildcard present', async () => {
        await set_data(wrapper, {
            d_exact_match: false,
            d_expected_student_file: {
                pattern: "yellow_pepper_*.cpp",
                min_num_matches: 3,
                max_num_matches: 5,
            }
        });
        await wrapper.findComponent({ref: 'expected_student_file_form'}).trigger('submit');

        expect(emitted(wrapper, 'submit').length).toEqual(1);
        expect(emitted(wrapper, 'submit')[0][0].pattern).toEqual("yellow_pepper_*.cpp");
        expect(emitted(wrapper, 'submit')[0][0].min_num_matches).toEqual(3);
        expect(emitted(wrapper, 'submit')[0][0].max_num_matches).toEqual(5);
    });
});


describe('Wildcard chars present and exact_match setting', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;

    beforeEach(() => {
        wrapper = mount(ExpectedStudentFileForm);
    });

    test('wildcard_is_present is true when pattern contains shell wildcard chars', async () => {
        expect(wrapper.vm.wildcard_is_present).toBe(false);

        await set_data(wrapper, {d_expected_student_file: {pattern: "zucch!ni.cpp"}});
        expect(wrapper.vm.wildcard_is_present).toBe(true);

        await set_data(wrapper, {d_expected_student_file: {pattern: "wee.cpp"}});
        expect(wrapper.vm.wildcard_is_present).toBe(false);
    });

    test('exact_match set to false overrides wildcard_is_present', async () => {
        expect(wrapper.vm.wildcard_is_present).toBe(false);
        expect(wrapper.vm.d_exact_match).toBe(true);
        expect(wrapper.find('[data-testid=exact_match_button]').element).not.toBeDisabled();

        await set_data(wrapper, {d_expected_student_file: {pattern: "zucch!ni.cpp"}});

        expect(wrapper.vm.wildcard_is_present).toBe(true);
        expect(wrapper.vm.d_exact_match).toBe(false);
        expect(wrapper.find('[data-testid=exact_match_button]').element).toBeDisabled();
    });

    test('min_ and max_num_matches editable when wildcard chars present', async () => {
        expect(wrapper.vm.d_exact_match).toBe(true);
        expect(wrapper.findComponent({ref: 'min_num_matches'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'max_num_matches'}).exists()).toBe(false);

        await set_data(wrapper, {d_expected_student_file: {pattern: "zucch!ni.cpp"}});

        expect(wrapper.findComponent({ref: 'min_num_matches'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'max_num_matches'}).exists()).toBe(true);
    });

    test('min_ and max_num_matches editable when exact_match is false', async () => {
        expect(wrapper.findComponent({ref: 'min_num_matches'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'max_num_matches'}).exists()).toBe(false);

        await set_data(wrapper, {d_exact_match: false});

        expect(wrapper.vm.wildcard_is_present).toBe(false);

        expect(wrapper.findComponent({ref: 'min_num_matches'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'max_num_matches'}).exists()).toBe(true);
    });
});


describe('Invalid input tests', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;

    beforeEach(() => {
       wrapper = mount(ExpectedStudentFileForm);
    });

    test('Error pattern is blank', async () => {
        let pattern_input = wrapper.findComponent({ref: "pattern"});
        let pattern_validator = <ValidatedInput> wrapper.findComponent({ref: "pattern" }).vm;

        await set_validated_input_text(pattern_input, "hello*");
        expect(pattern_validator.is_valid).toBe(true);

        await set_validated_input_text(pattern_input, " ");
        expect(pattern_validator.is_valid).toBe(false);
    });

    test('Error min_num_matches is blank or not a number', async () => {
        await set_data(wrapper, {d_exact_match: false});

        let min_num_matches_input = wrapper.findComponent({ref: "min_num_matches"});
        let min_num_matches_validator = <ValidatedInput> min_num_matches_input.vm;

        await set_validated_input_text(min_num_matches_input, "  ");
        expect(min_num_matches_validator.is_valid).toBe(false);

        await set_validated_input_text(min_num_matches_input, "carrot");
        expect(min_num_matches_validator.is_valid).toBe(false);
    });

    test('Error min_num_matches is negative', async () => {
        await set_data(wrapper, {d_exact_match: false});

        let min_num_matches_validator
            = <ValidatedInput> wrapper.findComponent({ref: "min_num_matches" }).vm;

        await set_validated_input_text(wrapper.findComponent({ref: "min_num_matches"}), "-2");
        expect(min_num_matches_validator.is_valid).toBe(false);
    });

    test('Error max_num_matches is blank or not a number', async () => {
        await set_data(wrapper, {d_exact_match: false});

        let max_num_matches_input = wrapper.findComponent({ref: "max_num_matches"});
        let max_num_matches_validator = <ValidatedInput> max_num_matches_input.vm;

        await set_validated_input_text(max_num_matches_input, "  ");
        expect(max_num_matches_validator.is_valid).toBe(false);

        await set_validated_input_text(max_num_matches_input, "zero");
        expect(max_num_matches_validator.is_valid).toBe(false);
    });
});
