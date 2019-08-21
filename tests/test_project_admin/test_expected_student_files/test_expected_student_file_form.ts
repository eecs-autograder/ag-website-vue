import { config, mount, Wrapper } from '@vue/test-utils';

import { ExpectedStudentFile } from 'ag-client-typescript';

import ExpectedStudentFileForm from '@/components/project_admin/expected_student_files/expected_student_file_form.vue';
import ValidatedInput from '@/components/validated_input.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Input property tests', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;
    let component: ExpectedStudentFileForm;

    test('Default input', () => {
        wrapper = mount(ExpectedStudentFileForm);
        component = wrapper.vm;

        expect(component.d_expected_student_file.pattern).toEqual("");
        expect(component.d_expected_student_file.min_num_matches).toEqual(1);
        expect(component.d_expected_student_file.max_num_matches).toEqual(1);
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
        component = wrapper.vm;

        expect(component.d_expected_student_file.pattern).toEqual(file.pattern);
        expect(component.d_expected_student_file.min_num_matches).toEqual(file.min_num_matches);
        expect(component.d_expected_student_file.max_num_matches).toEqual(file.max_num_matches);
    });
});

describe('Valid form submit tests', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;
    let component: ExpectedStudentFileForm;

    beforeEach(() => {
        wrapper = mount(ExpectedStudentFileForm);
        component = wrapper.vm;
    });

    test('Submit without wildcard present and exact match set to true', async () => {
        component.d_expected_student_file.pattern = "tomato.cpp";
        await component.$nextTick();

        wrapper.find({ref: 'expected_student_file_form'}).trigger('submit');
        await component.$nextTick();

        expect(wrapper.emitted().on_submit.length).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].pattern).toEqual("tomato.cpp");
        expect(wrapper.emitted().on_submit[0][0].min_num_matches).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].max_num_matches).toEqual(1);
    });

    test('Submit without wildcard present and exact match set to false', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        component.d_expected_student_file.pattern = "cabbage.cpp";
        await component.$nextTick();

        wrapper.find({ref: 'expected_student_file_form'}).trigger('submit');
        await component.$nextTick();

        expect(wrapper.emitted().on_submit.length).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].pattern).toEqual("cabbage.cpp");
        expect(wrapper.emitted().on_submit[0][0].min_num_matches).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].max_num_matches).toEqual(1);
    });

    test('Submit with wildcard present', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        component.d_expected_student_file.pattern = "yellow_pepper_*.cpp";
        component.d_expected_student_file.min_num_matches = 3;
        component.d_expected_student_file.max_num_matches = 5;

        wrapper.find({ref: 'expected_student_file_form'}).trigger('submit');
        await component.$nextTick();

        expect(wrapper.emitted().on_submit.length).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].pattern).toEqual("yellow_pepper_*.cpp");
        expect(wrapper.emitted().on_submit[0][0].min_num_matches).toEqual(3);
        expect(wrapper.emitted().on_submit[0][0].max_num_matches).toEqual(5);
    });
});


describe('Wildcard chars present and exact_match setting', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;
    let component: ExpectedStudentFileForm;

    beforeEach(() => {
        wrapper = mount(ExpectedStudentFileForm);
        component = wrapper.vm;
    });

    test('wildcard_is_present is true when pattern contains shell wildcard chars',
         async () => {
        component.d_expected_student_file.pattern = "zucch!ni.cpp";
        await component.$nextTick();

        expect(component.wildcard_is_present).toBe(true);

        component.d_expected_student_file.pattern = "zucch!ni.cpp";
        await component.$nextTick();

        expect(component.wildcard_is_present).toBe(true);
    });

    test('exact_match is set to false and cannot change when wildcard_is_present becomes true',
         async () => {
         component.d_expected_student_file.pattern = "zucch!ni.cpp";
         await component.$nextTick();

         expect(component.wildcard_is_present).toBe(true);
         expect(component.d_exact_match).toBe(false);
         expect(wrapper.find('#exact-match-button').is('[disabled]')).toBe(true);

         expect(component.wildcard_is_present).toBe(true);
         expect(component.d_exact_match).toBe(false);
    });

    test('min and max num matches are editable when wildcard_is_present and !exact_match',
         async () => {
         component.d_exact_match = false;
         await component.$nextTick();

         expect(component.wildcard_is_present).toBe(false);
         expect(component.d_exact_match).toBe(false);

         component.d_expected_student_file.pattern = "zucch!ni.cpp";
         await component.$nextTick();

         expect(component.wildcard_is_present).toBe(true);
         expect(component.d_exact_match).toBe(false);

         expect(wrapper.findAll({ref: 'min_num_matches'}).length).toEqual(1);
         expect(wrapper.findAll({ref: 'max_num_matches'}).length).toEqual(1);
    });

    test('min and max num matches are editable when !wildcard_is_present and !exact_match',
         async () => {
         component.d_exact_match = false;
         await component.$nextTick();

         expect(component.wildcard_is_present).toBe(false);
         expect(component.d_exact_match).toBe(false);
         expect(wrapper.findAll({ref: 'min_num_matches'}).length).toEqual(1);
         expect(wrapper.findAll({ref: 'max_num_matches'}).length).toEqual(1);
    });

    test('min and max num matches are NOT editable when !wildcard_is_present and exact_match',
         async () => {
         expect(component.wildcard_is_present).toBe(false);
         expect(component.d_exact_match).toBe(true);
         expect(wrapper.findAll({ref: 'min_num_matches'}).length).toEqual(0);
         expect(wrapper.findAll({ref: 'max_num_matches'}).length).toEqual(0);
    });
});


describe('Invalid input tests', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;
    let component: ExpectedStudentFileForm;

    beforeEach(() => {
       wrapper = mount(ExpectedStudentFileForm);
       component = wrapper.vm;
    });

    test('Error pattern is blank', async () => {
        let pattern_input = wrapper.find({ref: "pattern"}).find('#input');
        let pattern_validator = <ValidatedInput> wrapper.find({ref: "pattern" }).vm;

        (<HTMLInputElement> pattern_input.element).value = "hello*";
        pattern_input.trigger('input');
        await component.$nextTick();

        expect(pattern_validator.is_valid).toBe(true);

        (<HTMLInputElement> pattern_input.element).value = " ";
        pattern_input.trigger('input');
        await component.$nextTick();

        expect(pattern_validator.is_valid).toBe(false);
    });

    test('Error min_num_matches is blank or not a number', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        let min_num_matches_input = wrapper.find({ref: "min_num_matches"}).find('#input');
        let min_num_matches_validator = <ValidatedInput> wrapper.find(
            {ref: "min_num_matches" }
        ).vm;

        (<HTMLInputElement> min_num_matches_input.element).value = "  ";
        min_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(min_num_matches_validator.is_valid).toBe(false);

        (<HTMLInputElement> min_num_matches_input.element).value = "carrot";
        min_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(min_num_matches_validator.is_valid).toBe(false);
    });

    test('Error min_num_matches is negative', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        let min_num_matches_input = wrapper.find({ref: "min_num_matches"}).find('#input');
        let min_num_matches_validator = <ValidatedInput> wrapper.find(
            {ref: "min_num_matches" }
        ).vm;

        (<HTMLInputElement> min_num_matches_input.element).value = "-2";
        min_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(min_num_matches_validator.is_valid).toBe(false);
    });

    test('Error max_num_matches is blank or not a number', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        let max_num_matches_input = wrapper.find({ref: "max_num_matches"}).find('#input');
        let max_num_matches_validator = <ValidatedInput> wrapper.find(
            {ref: "max_num_matches" }
        ).vm;

        (<HTMLInputElement> max_num_matches_input.element).value = "  ";
        max_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(max_num_matches_validator.is_valid).toBe(false);

        (<HTMLInputElement> max_num_matches_input.element).value = "zero";
        max_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(max_num_matches_validator.is_valid).toBe(false);
    });
});
