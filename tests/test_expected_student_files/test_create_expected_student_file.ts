import CreateExpectedStudentFile from '@/components/expected_student_files/create_expected_student_file.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import Vue from 'vue';
import Component from 'vue-class-component';

import {
    patch_async_class_method,
    patch_async_static_method,
    patch_component_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CreateExpectedStudentFile tests', () => {
    let project_1: Project;
    let file_without_wildcard: CreateExpectedStudentFile;
    let file_with_wildcard: CreateExpectedStudentFile;
    let wrapper: Wrapper<CreateExpectedStudentFile>;
    let expected_file_pattern: CreateExpectedStudentFile;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        project_1 = new Project({
            pk: 10,
            name: "Detroit Zoo",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        file_without_wildcard = {
            pk: 1,
            project: 10,
            expected_student_file: "filename.cpp",
            min_num_matches: 1,
            max_num_matches: 1
        };

        file_with_wildcard = {
            pk: 1,
            project: 10,
            expected_student_file: "filename*.cpp",
            min_num_matches: 2,
            max_num_matches: 4
        };

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

    // this test is producing the error: Error in event handler for "form_validity_changed":
    // "TypeError: Cannot read property '_transitionClasses' of undefined"
    test('Valid create pattern without shell wildcard', async () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        await expected_file_pattern.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "filename"}).vm;

        let filename = wrapper.find({ref: 'filename'}).find('#input');
        (<HTMLInputElement> filename.element).value = "Giraffe.cpp";
        filename.trigger('input');
        await expected_file_pattern.$nextTick();

        expect(validated_input.is_valid).toBe(true);

        const spy = jest.fn();
        return patch_async_static_method(
            ExpectedStudentFile,
            'create',
            spy,
            async () => {

            wrapper.find("#create-expected-student-file-form").trigger('submit.native');
            await expected_file_pattern.$nextTick();

            expect(expected_file_pattern.api_errors.length).toEqual(0);
            expect(spy.mock.calls.length).toBe(1);
        });
    });

    test('Error pattern is blank', async () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        await expected_file_pattern.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "filename"}).vm;

        let filename = wrapper.find({ref: 'filename'}).find('#input');
        (<HTMLInputElement> filename.element).value = "   ";
        filename.trigger('input');
        await expected_file_pattern.$nextTick();

        expect(validated_input.is_valid).toBe(false);
    });

    test('400 error pattern not unique', async () => {
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

        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        await expected_file_pattern.$nextTick();

        let validated_input = <ValidatedInput> wrapper.find({ref: "filename"}).vm;

        let filename = wrapper.find({ref: 'filename'}).find('#input');
        (<HTMLInputElement> filename.element).value = "Zebra.cpp";
        filename.trigger('input');
        await expected_file_pattern.$nextTick();

        expect(validated_input.is_valid).toBe(true);

        return patch_async_static_method(
            ExpectedStudentFile,
            'create',
            () => Promise.reject(axios_response_instance),
            async () => {

            wrapper.find("#create-expected-student-file-form").trigger('submit.native');
            await expected_file_pattern.$nextTick();

            expect(expected_file_pattern.api_errors.length).toBeGreaterThan(0);
            expect(expected_file_pattern.api_error_present).toBe(true);
        });
    });

    test.skip('Error min_num_matches is blank', () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        expect(true).toEqual(true);
    });

    test.skip('Error min_num_matches is negative', () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        expect(true).toEqual(true);
    });

    test.skip('Error max_num_matches is blank', () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        expect(true).toEqual(true);
    });

    test.skip('Error max_num_matches is less than min_num_matches', () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        expect(true).toEqual(true);
    });

    // This test prompts the error - Error in event handler for "form_validity_changed":
    // "TypeError: Cannot read property '$options' of undefined"
    test('wildcard_is_present is true when pattern contains shell wildcard chars',
              async () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        await expected_file_pattern.$nextTick();

        // TypeError: Cannot read property '_transitionClasses' of undefined
        // expected_file_pattern.d_new_expected_student_file.pattern = "Flamingo*.cpp";

        let filename = wrapper.find({ref: 'filename'}).find('#input');
        (<HTMLInputElement> filename.element).value = "Flamingo*.cpp";
        filename.trigger('input');
        await expected_file_pattern.$nextTick();

        expect(expected_file_pattern.wildcard_is_present()).toBe(true);
    });

    test.skip('exact_match set to false and cannot change when is_wildcard becomes true', () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        expect(true).toEqual(true);
    });

    test.skip('min and max num matches editable when is_wildcard and exact_match are false', () => {
        // fail();
    });

    test.skip('min and max num matches set to 1 when exact_match becomes true', () => {
        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });

        expected_file_pattern = wrapper.vm;
        expect(true).toEqual(true);
    });
});
