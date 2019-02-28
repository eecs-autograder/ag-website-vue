import SingleFile from '@/components/instructor_files/single_file.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { InstructorFile, Project, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import * as FileSaver from 'file-saver';
import Vue from 'vue';
import Component from 'vue-class-component';

import {
    patch_async_class_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

jest.mock('file-saver');

describe('InstructorFiles.vue', () => {
    let project: Project;
    let file_1: InstructorFile;
    let updated_file: InstructorFile;
    let wrapper: Wrapper<SingleFile>;
    let single_file_component: SingleFile;
    let original_match_media: (query: string) => MediaQueryList;
    let validated_input: ValidatedInput;

    beforeEach(() => {
        project = new Project({
            pk: 10,
            name: "Project 1 - Statistics",
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

        file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "Tarzan.cpp",
            size: 2,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        updated_file = new InstructorFile({
            pk: 1,
            project: 10,
            name: "Jane.cpp",
            size: 2,
            last_modified: "2019-02-15T21:24:20.117078Z"
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(SingleFile, {
            propsData: {
                file: file_1
            }
        });

        single_file_component = wrapper.vm;
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

    test('SingleFile data receives a file as input', () => {
        expect(single_file_component.file).toEqual(file_1);
    });

    test('Users have the ability to rename a file', async () => {
        const spy = jest.fn();
        wrapper.find('.edit-file-name').trigger('click');
        await single_file_component.$nextTick();

        expect(single_file_component.new_file_name).toEqual(single_file_component.file.name);
        expect(single_file_component.editing).toBe(true);

        await patch_async_class_method(
            InstructorFile,
            'rename',
            spy,
            async () => {

            let file_name_input = wrapper.find({ref: 'file_name'}).find('#input');
            (<HTMLInputElement> file_name_input.element).value = "Jane.cpp";
            file_name_input.trigger('input');
            await single_file_component.$nextTick();

            expect(single_file_component.new_file_name).toEqual("Jane.cpp");

            wrapper.find('.update-file-name-button').trigger('click');
            await single_file_component.$nextTick();

            expect(spy.mock.calls.length).toEqual(1);
            expect(single_file_component.editing).toBe(false);
        });
    });

    test('Users can choose to cancel the action of renaming a file after entering a ' +
         'different name but before pressing "update"',
         async () => {
        const spy = jest.fn();
        wrapper.find('.edit-file-name').trigger('click');
        await single_file_component.$nextTick();

        expect(single_file_component.new_file_name).toEqual(single_file_component.file.name);
        expect(single_file_component.editing).toBe(true);

        await patch_async_class_method(
            InstructorFile,
            'rename',
            spy,
            async () => {

            let file_name_input = wrapper.find({ref: 'file_name'}).find('#input');
            (<HTMLInputElement> file_name_input.element).value = "Jane.cpp";
            file_name_input.trigger('input');
            validated_input = <ValidatedInput> wrapper.find({ref: 'file_name'}).vm;
            await single_file_component.$nextTick();

            expect(validated_input.is_valid).toBe(true);
            expect(single_file_component.new_file_name).toEqual("Jane.cpp");

            wrapper.find('.update-file-name-cancel-button').trigger('click');
            await single_file_component.$nextTick();

            expect(spy.mock.calls.length).toEqual(0);
            expect(single_file_component.file.name).toEqual(file_1.name);
            expect(single_file_component.editing).toBe(false);
        });
    });

    test('Users can click the update button when renaming a file and havent made any ' +
         'changes to the name yet',
         async () => {
         let prev_filename = single_file_component.file.name;
         wrapper.find('.edit-file-name').trigger('click');
         await single_file_component.$nextTick();

         expect(single_file_component.new_file_name).toEqual(single_file_component.file.name);
         expect(single_file_component.editing).toBe(true);
         expect(single_file_component.new_name_is_valid).toBe(true);
         wrapper.find('.update-file-name-button').trigger('click');
         await single_file_component.$nextTick();

         expect(single_file_component.editing).toBe(false);
         expect(single_file_component.file.name).toEqual(prev_filename);
    });

    test('Users cannot make an empty string the new name of a file', async () => {
         wrapper.find('.edit-file-name').trigger('click');
         await single_file_component.$nextTick();

         expect(single_file_component.new_file_name).toEqual(single_file_component.file.name);
         expect(single_file_component.editing).toBe(true);

         let file_name_input = wrapper.find({ref: 'file_name'}).find('#input');
         (<HTMLInputElement> file_name_input.element).value = "       ";
         file_name_input.trigger('input');
         validated_input = <ValidatedInput> wrapper.find({ref: 'file_name'}).vm;
         await single_file_component.$nextTick();

         expect(validated_input.is_valid).toBe(false);
         expect(single_file_component.new_name_is_valid).toBe(false);
         expect(wrapper.find('.update-file-name-button').is('[disabled]')).toBe(true);
    });

    test('Users have the ability to delete a file', async () => {
         const spy = jest.fn();
         await patch_async_class_method(
             InstructorFile,
             'delete',
             spy,
             async () => {

             wrapper.find('.delete-file').trigger('click');
             await single_file_component.$nextTick();

             wrapper.find('.modal-delete-button').trigger('click');
             await single_file_component.$nextTick();

             expect(spy.mock.calls.length).toEqual(1);
         });
    });

    test('Users have the ability to cancel the process of deleting a file', async () => {
         const spy = jest.fn();
         await patch_async_class_method(
             InstructorFile,
             'delete',
             spy,
             async () => {

             wrapper.find('.delete-file').trigger('click');
             await single_file_component.$nextTick();

             wrapper.find('.modal-cancel-button').trigger('click');
             await single_file_component.$nextTick();

             expect(spy.mock.calls.length).toEqual(0);
         });
    });

    test('Users have the ability to download a file', async () => {
        return patch_async_class_method(
            InstructorFile,
            'get_content',
            () => Promise.resolve("File Contents"),
            async () => {

            single_file_component = wrapper.vm;
            await single_file_component.$nextTick();

            wrapper.find('.download-file').trigger('click');
            await single_file_component.$nextTick();

            expect(FileSaver.saveAs).toBeCalled();
        });
    });

    test('Users have the ability to view a file', async () => {
        return patch_async_class_method(
            InstructorFile,
            'get_content',
            () => Promise.resolve("File Contents"),
            async () => {

            single_file_component = wrapper.vm;
            await single_file_component.$nextTick();

            wrapper.find('#single-file-component').trigger('click');
            await single_file_component.$nextTick();

            expect(wrapper.emitted().open_file.length).toEqual(1);
        });
    });
});
