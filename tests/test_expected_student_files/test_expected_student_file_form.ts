import ExpectedStudentFileForm from '@/components/expected_student_files/expected_student_file_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile } from 'ag-client-typescript';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
    sinon.restore();
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


describe.only('Valid form submit tests', () => {
    let wrapper: Wrapper<ExpectedStudentFileForm>;
    let component: ExpectedStudentFileForm;

    beforeEach(() => {
        wrapper = mount(ExpectedStudentFileForm);
        component = wrapper.vm;
    });

    test('Submit without wildcard present and exact match set to true', async () => {
        component.d_expected_student_file.pattern = "tomato.cpp";
        await component.$nextTick();

        wrapper.find({ref: 'expected_student_file_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(wrapper.emitted().on_submit.length).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].pattern).toEqual("tomato.cpp");
        expect(wrapper.emitted().on_submit[0][0].min_num_matches).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].max_num_matches).toEqual(1);
    });

    // RangeError: Max call stack size exceeded
    test.only('Submit without wildcard present and exact match set to false', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        component.d_expected_student_file.pattern = "cabbage.cpp";
        await component.$nextTick();

        wrapper.find({ref: 'expected_student_file_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(wrapper.emitted().on_submit.length).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].pattern).toEqual("cabbage.cpp");
        expect(wrapper.emitted().on_submit[0][0].min_num_matches).toEqual(1);
        expect(wrapper.emitted().on_submit[0][0].max_num_matches).toEqual(1);
    });

    //  RangeError: Maximum call stack size exceeded at String.replace (<anonymous>)
    test('Submit with wildcard present', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        let pattern_input = <ValidatedInput> wrapper.find({ref: "pattern"}).vm;
        pattern_input.value = "yellow_pepper_*.cpp";
        await component.$nextTick();

        let min_num_matches_input = <ValidatedInput> wrapper.find({ref: "min_num_matches"}).vm;
        min_num_matches_input.value = "3";
        await component.$nextTick();

        let max_num_matches_input = <ValidatedInput> wrapper.find({ref: "max_num_matches"}).vm;
        max_num_matches_input.value = "5";
        await component.$nextTick();

        wrapper.find({ref: 'expected_student_file_form'}).trigger('submit.native');
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
        // let pattern_input = <ValidatedInput> wrapper.find({ref: "pattern"}).vm;
        // pattern_input.value = "zucch!ni.cpp";
        // await component.$nextTick();

        // expect(pattern_input.is_valid).toBe(true);
        // The statement immediately below fails
        // expect(component.wildcard_is_present).toBe(true);

        // The combination of statements below passes but causes:
        // Error in callback for watcher "wildcard_is_present": "RangeError: Maximum call
        // stack size exceeded"
        component.d_expected_student_file.pattern = "zucch!ni.cpp";
        await component.$nextTick();

        expect(component.wildcard_is_present).toBe(true);
    });

    // Passes but causes error: Error in callback for watcher "wildcard_is_present":
    // "RangeError: Maximum call stack size exceeded"
    test('exact_match is set to false and cannot change when wildcard_is_present becomes true',
         async () => {
         // the one statement below alone causes the Max call stack size exceeded error....
         component.d_expected_student_file.pattern = "zucch!ni.cpp";
         await component.$nextTick();

         expect(component.wildcard_is_present).toBe(true);
         expect(component.d_exact_match).toBe(false);

         component.d_exact_match = true;
         await component.$nextTick();

         expect(component.wildcard_is_present).toBe(true);
         expect(component.d_exact_match).toBe(false);
    });

    // RangeError: Maximum call stack size exceeded
    test('min and max num matches are editable when wildcard_is_present and !exact_match',
         async () => {
         component.d_exact_match = false;
         await component.$nextTick();

         expect(component.wildcard_is_present).toBe(false);
         expect(component.d_exact_match).toBe(false);

         component.d_expected_student_file.pattern = "zucch!ni.cpp";
         await component.$nextTick();

         // doesn't even get to this line before failing
         console.log(wrapper.html());

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
        let pattern_input = <ValidatedInput> wrapper.find({ref: "pattern"}).vm;

        pattern_input.value = "hello*";
        await component.$nextTick();
        expect(pattern_input.is_valid).toBe(true);

        pattern_input.value = "  ";
        await component.$nextTick();
        expect(pattern_input.is_valid).toBe(false);
    });

    test('Error min_num_matches is blank or not a number', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        let min_num_matches_input = <ValidatedInput> wrapper.find({ref: "min_num_matches"}).vm;

        min_num_matches_input.value = "  ";
        await component.$nextTick();
        expect(min_num_matches_input.is_valid).toBe(false);

        min_num_matches_input.value = "carrot";
        await component.$nextTick();
        expect(min_num_matches_input.is_valid).toBe(false);
    });

    test('Error min_num_matches is negative', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        let min_num_matches_input = <ValidatedInput> wrapper.find({ref: "min_num_matches"}).vm;
        min_num_matches_input.value = "-2";
        await component.$nextTick();

        expect(min_num_matches_input.is_valid).toBe(false);
    });

    test('Error max_num_matches is blank or not a number', async () => {
        component.d_exact_match = false;
        await component.$nextTick();

        let max_num_matches_input = <ValidatedInput> wrapper.find({ref: "max_num_matches"}).vm;

        max_num_matches_input.value = "  ";
        await component.$nextTick();
        expect(max_num_matches_input.is_valid).toBe(false);

        max_num_matches_input.value = "onion";
        await component.$nextTick();
        expect(max_num_matches_input.is_valid).toBe(false);
    });
});
