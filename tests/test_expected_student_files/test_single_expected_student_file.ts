import SingleExpectedStudentFile from
        '@/components/expected_student_files/single_expected_student_file.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile } from 'ag-client-typescript';
import { AxiosError } from 'axios';

import {
    patch_async_class_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ExpectedStudentFiles tests', () => {
    let file_without_wildcard: ExpectedStudentFile;
    let file_with_wildcard: ExpectedStudentFile;
    let wrapper: Wrapper<SingleExpectedStudentFile>;
    let single_file: SingleExpectedStudentFile;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        file_without_wildcard = new ExpectedStudentFile({
            pk: 1,
            project: 10,
            pattern: "filename.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        file_with_wildcard = new ExpectedStudentFile({
            pk: 2,
            project: 10,
            pattern: "filename*.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    async function updated_fields_should_equal(updated_file: ExpectedStudentFile,
                                               expected_value_for_pattern: string,
                                               expected_value_for_min: string,
                                               expected_value_for_max: string) {
        expect(updated_file.pattern).toEqual(expected_value_for_pattern);
        expect(updated_file.min_num_matches).toEqual(expected_value_for_min);
        expect(updated_file.max_num_matches).toEqual(expected_value_for_max);
    }

    // test.skip('d_expected_student_file becomes a copy of the expected_student_file received' +
    //      ' as a prop',
    //      async () => {
    //     wrapper = mount(SingleExpectedStudentFile, {
    //         propsData: {
    //             expected_student_file: file_without_wildcard,
    //             odd_index: false
    //         }
    //     });
    //
    //     single_file = wrapper.vm;
    //     await single_file.$nextTick();
    //
    //     expect(single_file.d_expected_student_file.pk = file_without_wildcard.pk);
    //     expect(single_file.d_expected_student_file.project = file_without_wildcard.project);
    //     expect(single_file.d_expected_student_file.pattern = file_without_wildcard.pattern);
    //     expect(single_file.d_expected_student_file.min_num_matches = file_without_wildcard.min_num_matches);
    //     expect(single_file.d_expected_student_file.max_num_matches = file_without_wildcard.max_num_matches);
    //     expect(single_file.d_expected_student_file.last_modified = file_without_wildcard.last_modified);
    //     expect(single_file.odd_index).toBe(false);
    // });

    test.skip('Delete expected student file', async () => {
        wrapper = mount(SingleExpectedStudentFile, {
            propsData: {
                expected_student_file: file_without_wildcard
            }
        });

        single_file = wrapper.vm;
        await single_file.$nextTick();

        const spy = jest.fn();
        return patch_async_class_method(
            ExpectedStudentFile,
            'delete',
            spy,
            async () => {

            wrapper.find('.delete-file').trigger('click');
            await single_file.$nextTick();

            wrapper.find('.modal-delete-button').trigger('click');
            await single_file.$nextTick();

            expect(spy.mock.calls.length).toBe(1);
        });
    });

    test.skip('Cancel delete of expected student file', async () => {
        wrapper = mount(SingleExpectedStudentFile, {
            propsData: {
                expected_student_file: file_without_wildcard
            }
        });

        single_file = wrapper.vm;
        await single_file.$nextTick();

        const spy = jest.fn();
        return patch_async_class_method(
            ExpectedStudentFile,
            'delete',
            spy,
            async () => {

            wrapper.find('.delete-file').trigger('click');
            await single_file.$nextTick();

            wrapper.find('.modal-cancel-button').trigger('click');
            await single_file.$nextTick();

            expect(spy.mock.calls.length).not.toBeTruthy();
        });
    });

    test.skip('Update expected student file - add a shell wildcard to the filename', async () => {
         wrapper = mount(SingleExpectedStudentFile, {
             propsData: {
                 expected_student_file: file_without_wildcard
             }
         });
         fail("change to handle on submit event");
         single_file = wrapper.vm;
         await single_file.$nextTick();

         wrapper.find('.edit-file').trigger('click');
         await single_file.$nextTick();

         let filename = wrapper.find({ref: 'filename'}).find('#input');
         (<HTMLInputElement> filename.element).value = "filename!.cpp";
         filename.trigger('input');
         await single_file.$nextTick();

         expect(single_file.wildcard_is_present()).toBe(true);
         expect(single_file.exact_match).toBe(false);

         let min_matches = wrapper.find({ref: 'min_matches'}).find('#input');
         (<HTMLInputElement> min_matches.element).value = "1";
         min_matches.trigger('input');
         await single_file.$nextTick();

         let max_matches = wrapper.find({ref: 'max_matches'}).find('#input');
         (<HTMLInputElement> max_matches.element).value = "3";
         max_matches.trigger('input');
         await single_file.$nextTick();

         expect(single_file.d_expected_student_file.pattern).toEqual("filename!.cpp");
         expect(single_file.d_expected_student_file.min_num_matches).toEqual("1");
         expect(single_file.d_expected_student_file.max_num_matches).toEqual("3");

         expect(single_file.expected_student_file.pattern).toEqual("filename.cpp");
         expect(single_file.expected_student_file.min_num_matches).toEqual(1);
         expect(single_file.expected_student_file.max_num_matches).toEqual(1);

         return patch_async_class_method(
             ExpectedStudentFile,
             'save',
             () => Promise.resolve(updated_fields_should_equal(
                 file_without_wildcard,
                 "filename!.cpp",
                 "1",
                 "3")),
             async () => {

             // wrapper.find('#edit-expected-student-file-form').trigger('submit.native');
             wrapper.find('.update-edit-button').trigger('click');
             await single_file.$nextTick();
         });
    });

    test.skip('Cancel the process of updating the expected student file', async () => {
         wrapper = mount(SingleExpectedStudentFile, {
             propsData: {
                 expected_student_file: file_with_wildcard
             }
         });

         single_file = wrapper.vm;
         await single_file.$nextTick();

         wrapper.find('.edit-file').trigger('click');
         await single_file.$nextTick();

         let filename = wrapper.find({ref: 'filename'}).find('#input');
         (<HTMLInputElement> filename.element).value = "!.cpp";
         filename.trigger('input');
         await single_file.$nextTick();

         expect(single_file.wildcard_is_present()).toBe(true);
         expect(single_file.exact_match).toBe(false);

         let min_matches = wrapper.find({ref: 'min_matches'}).find('#input');
         (<HTMLInputElement> min_matches.element).value = "1";
         min_matches.trigger('input');
         await single_file.$nextTick();

         let max_matches = wrapper.find({ref: 'max_matches'}).find('#input');
         (<HTMLInputElement> max_matches.element).value = "3";
         max_matches.trigger('input');
         await single_file.$nextTick();

         const spy = jest.fn();
         return patch_async_class_method(
             ExpectedStudentFile,
             'save',
             spy,
             async () => {

             wrapper.find('.cancel-edit-button').trigger('click');
             await single_file.$nextTick();

             expect(spy.mock.calls.length).not.toBeTruthy();
             expect(single_file.expected_student_file.pattern).toEqual(file_with_wildcard.pattern);
             expect(single_file.expected_student_file.min_num_matches).toEqual(file_with_wildcard.min_num_matches);
             expect(single_file.expected_student_file.max_num_matches).toEqual(file_with_wildcard.max_num_matches);

             expect(single_file.d_expected_student_file.pattern).toEqual(file_with_wildcard.pattern);
             expect(single_file.d_expected_student_file.min_num_matches).toEqual(file_with_wildcard.min_num_matches);
             expect(single_file.d_expected_student_file.max_num_matches).toEqual(file_with_wildcard.max_num_matches);
         });
    });

    test.skip('Update expected student file - violates requirement that all filenames must be ' +
         'unique',
         async () => {
         let axios_response_instance: AxiosError = {
             name: 'AxiosError',
             message: 'u heked up',
             response: {
                 data: {
                     __all__: "Expected student file with this Pattern and Project already exists."
                 },
                 status: 400,
                 statusText: 'OK',
                 headers: {},
                 request: {},
                 config: {}
             },
             config: {},
         };

         wrapper = mount(SingleExpectedStudentFile, {
             propsData: {
                 expected_student_file: file_with_wildcard
             }
         });

         single_file = wrapper.vm;
         await single_file.$nextTick();

         wrapper.find('.edit-file').trigger('click');
         await single_file.$nextTick();

         let filename = wrapper.find({ref: 'filename'}).find('#input');
         (<HTMLInputElement> filename.element).value = file_without_wildcard.pattern;
         filename.trigger('input');
         await single_file.$nextTick();

         return patch_async_class_method(
             ExpectedStudentFile,
             'save',
             () => Promise.reject(axios_response_instance),
             async () => {

             wrapper.find('.update-edit-button').trigger('click');
             await single_file.$nextTick();

             expect(single_file.api_errors.length).toBeGreaterThan(0);
         });
    });
});
