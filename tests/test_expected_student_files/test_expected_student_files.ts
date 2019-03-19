import CreateExpectedStudentFile from '@/components/expected_student_files/create_expected_student_file.vue';
import ExpectedStudentFiles from '@/components/expected_student_files/expected_student_files.vue';
import SingleExpectedStudentFile from '@/components/expected_student_files/single_expected_student_file.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';

import {
    patch_async_class_method,
    patch_async_static_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ExpectedStudentFiles tests', () => {
    let project_1: Project;
    let file_1_has_wildcard: ExpectedStudentFile;
    let file_2_no_wildcard: ExpectedStudentFile;
    let file_3_no_wildcard: ExpectedStudentFile;
    let new_file_no_wildcard: ExpectedStudentFile;
    let new_file_has_wildcard: ExpectedStudentFile;
    let existing_expected_student_files: ExpectedStudentFile[];
    let wrapper: Wrapper<ExpectedStudentFiles>;
    let expected_student_files: ExpectedStudentFiles;
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

        file_1_has_wildcard = new ExpectedStudentFile({
            pk: 1,
            project: 10,
            pattern: "elephant*.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        file_2_no_wildcard = new ExpectedStudentFile({
            pk: 2,
            project: 10,
            pattern: "monkey.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        file_3_no_wildcard = new ExpectedStudentFile({
            pk: 3,
            project: 10,
            pattern: "penguin.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        new_file_no_wildcard = new ExpectedStudentFile({
            pk: 4,
            project: 10,
            pattern: "aardvark.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        new_file_has_wildcard = new ExpectedStudentFile({
            pk: 5,
            project: 10,
            pattern: "kangaroo_?.cpp",
            min_num_matches: 2,
            max_num_matches: 3,
            last_modified: "now"
        });

        existing_expected_student_files = [
            file_1_has_wildcard,
            file_3_no_wildcard,
            file_2_no_wildcard
        ];

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

    async function call_notify_expected_student_file_created(file_to_create: ExpectedStudentFile,
                                                             min_matches: number,
                                                             max_matched: number) {
        console.log("Calling notify created");
        file_to_create.min_num_matches = min_matches;
        file_to_create.max_num_matches = max_matched;
        ExpectedStudentFile.notify_expected_student_file_created(file_to_create);
    }

    async function call_notify_expected_student_file_deleted(file_to_delete: ExpectedStudentFile) {
        ExpectedStudentFile.notify_expected_student_file_deleted(file_to_delete);
    }

    async function call_notify_expected_student_file_changed(file_that_changed: ExpectedStudentFile) {
        ExpectedStudentFile.notify_expected_student_file_changed(file_that_changed);
    }

    test.skip('Fetches existing expected student files and displays them in the correct order',
         async () => {
         return patch_async_static_method(
             ExpectedStudentFile,
             'get_all_from_project',
             () => Promise.resolve(existing_expected_student_files),
             async () => {

             wrapper = mount(ExpectedStudentFiles, {
                propsData: {
                    project: project_1
                }
             });

             expected_student_files = wrapper.vm;
             await expected_student_files.$nextTick();

             expect(expected_student_files.expected_student_files.length).toEqual(3);
             expect(expected_student_files.expected_student_files[0]).toEqual(file_1_has_wildcard);
             expect(expected_student_files.expected_student_files[1]).toEqual(file_2_no_wildcard);
             expect(expected_student_files.expected_student_files[2]).toEqual(file_3_no_wildcard);
         });
    });

    // Error in event handler for "form_validity_changed": "TypeError: Cannot read property
    // '_transitionClasses' of undefined"
    test.skip('Create new expected_student file without a wildcard present and exact match set to ' +
         'true',
         async () => {
        return patch_async_static_method(
            ExpectedStudentFile,
            'get_all_from_project',
            () => Promise.resolve(existing_expected_student_files),
            async () => {

            wrapper = mount(ExpectedStudentFiles, {
                propsData: {
                    project: project_1
                }
            });

            expected_student_files = wrapper.vm;
            await expected_student_files.$nextTick();

            let create_esf = wrapper.find({ref: 'create_expected_student_file'});
            let create_esf_component = <CreateExpectedStudentFile> create_esf.vm;

            let new_filename = create_esf.find({ref: 'filename'}).find('#input');
            (<HTMLInputElement> new_filename.element).value = new_file_no_wildcard.pattern;
            new_filename.trigger('input');
            await expected_student_files.$nextTick();

            expect(create_esf_component.exact_match).toBe(true);
            expect(create_esf_component.wildcard_is_present()).toBe(false);

            return patch_async_static_method(
                 ExpectedStudentFile,
                 'create',
                 () => Promise.resolve(
                     call_notify_expected_student_file_created(
                         new_file_no_wildcard,
                         create_esf_component.d_new_expected_student_file.min_num_matches,
                         create_esf_component.d_new_expected_student_file.max_num_matches
                     )
                 ),
                 async () => {

                 // call on form in the future
                 create_esf_component.create_pattern();
                 await expected_student_files.$nextTick();

                 expect(expected_student_files.expected_student_files.length).toEqual(4);
                 expect(expected_student_files.expected_student_files[0]).toEqual(new_file_no_wildcard);
                 expect(expected_student_files.expected_student_files[1]).toEqual(file_1_has_wildcard);
                 expect(expected_student_files.expected_student_files[2]).toEqual(file_2_no_wildcard);
                 expect(expected_student_files.expected_student_files[3]).toEqual(file_3_no_wildcard);
             });
         });
    });

    // [Vue warn]: Error in event handler for "form_validity_changed": "TypeError: Cannot read
    // property '$options' of undefined" --> ValidatedForm
    test.skip('Create new expected_student file with a wildcard present and exact match set to ' +
              'false ',
         async () => {
         return patch_async_static_method(
             ExpectedStudentFile,
             'get_all_from_project',
             () => Promise.resolve(existing_expected_student_files),
             async () => {

             wrapper = mount(ExpectedStudentFiles, {
                 propsData: {
                     project: project_1
                 }
             });

             expected_student_files = wrapper.vm;
             await expected_student_files.$nextTick();

             let create_esf = wrapper.find({ref: 'create_expected_student_file'});
             let create_esf_component = <CreateExpectedStudentFile> create_esf.vm;

             let new_filename = create_esf.find({ref: 'filename'}).find('#input');
             (<HTMLInputElement> new_filename.element).value = new_file_has_wildcard.pattern;
             new_filename.trigger('input');
             await expected_student_files.$nextTick();

             expect(create_esf_component.wildcard_is_present()).toBe(true);
             expect(create_esf_component.exact_match).toBe(false);

             let min_matches = create_esf.find({ref: 'min_matches'}).find('#input');
             (<HTMLInputElement> min_matches.element).value = "2";
             min_matches.trigger('input');
             await expected_student_files.$nextTick();

             let max_matches = create_esf.find({ref: 'max_matches'}).find('#input');
             (<HTMLInputElement> max_matches.element).value = "3";
             max_matches.trigger('input');
             await expected_student_files.$nextTick();

             return patch_async_static_method(
                 ExpectedStudentFile,
                 'create',
                 () => Promise.resolve(
                     call_notify_expected_student_file_created(
                         new_file_has_wildcard,
                         create_esf_component.d_new_expected_student_file.min_num_matches,
                         create_esf_component.d_new_expected_student_file.max_num_matches
                     )
                 ),
                 async () => {

                 // call on form in the future
                 create_esf_component.create_pattern();
                 await expected_student_files.$nextTick();

                 expect(expected_student_files.expected_student_files.length).toEqual(4);
                 expect(expected_student_files.expected_student_files[0]).toEqual(file_1_has_wildcard);
                 expect(expected_student_files.expected_student_files[1]).toEqual(new_file_has_wildcard);
                 expect(expected_student_files.expected_student_files[2]).toEqual(file_2_no_wildcard);
                 expect(expected_student_files.expected_student_files[3]).toEqual(file_3_no_wildcard);
             });
         });
    });

    test.skip('Remove existing expected student file', async () => {
        return patch_async_static_method(
            ExpectedStudentFile,
            'get_all_from_project',
            () => Promise.resolve(existing_expected_student_files),
            async () => {

            wrapper = mount(ExpectedStudentFiles, {
                propsData: {
                    project: project_1
                }
            });

            expected_student_files = wrapper.vm;
            await expected_student_files.$nextTick();

            let existing_expected_student_files = wrapper.findAll(
                '#single-expected-student-file'
            );
            expect(existing_expected_student_files.at(1).text()).toContain(
                file_2_no_wildcard.pattern
            );

            return patch_async_class_method(
                ExpectedStudentFile,
                'delete',
                () => Promise.resolve(
                    call_notify_expected_student_file_deleted(file_2_no_wildcard)
                ),
                async () => {

                existing_expected_student_files.at(1).find('delete-file');
                await expected_student_files.$nextTick();

                expect(expected_student_files.expected_student_files.length).toEqual(2);
                expect(expected_student_files.expected_student_files[0]).toEqual(file_1_has_wildcard);
                expect(expected_student_files.expected_student_files[1]).toEqual(file_3_no_wildcard);
            });
        });
    });

    test.skip('Edit existing expected student file --> add shell wildcard character',
         async () => {
         return patch_async_static_method(
             ExpectedStudentFile,
             'get_all_from_project',
             () => Promise.resolve(existing_expected_student_files),
             async () => {

             wrapper = mount(ExpectedStudentFiles, {
                 propsData: {
                     project: project_1
                 }
             });

             expected_student_files = wrapper.vm;
             await expected_student_files.$nextTick();

             let existing_file_3 = wrapper.findAll('#single-expected-student-file').at(2);
             let single_file_3 = <SingleExpectedStudentFile> existing_file_3.vm;
             expect(existing_file_3.text()).toContain(file_2_no_wildcard.pattern);

             existing_file_3.find('edit-file').trigger('click');
             await expected_student_files.$nextTick();

             let filename = existing_file_3.find({ref: 'filename'}).find('#input');
             (<HTMLInputElement> filename.element).value = "lemur!.cpp";
             filename.trigger('input');
             await expected_student_files.$nextTick();

             let min_matches = existing_file_3.find({ref: 'min_matches'}).find('#input');
             (<HTMLInputElement> min_matches.element).value = "1";
             min_matches.trigger('input');
             await expected_student_files.$nextTick();

             let max_matches = existing_file_3.find({ref: 'max_matches'}).find('#input');
             (<HTMLInputElement> max_matches.element).value = "2";
             max_matches.trigger('input');
             await expected_student_files.$nextTick();

             return patch_async_class_method(
                 ExpectedStudentFile,
                 'save',
                 () => Promise.resolve(
                     call_notify_expected_student_file_changed(
                         single_file_3.d_expected_student_file
                     )
                 ),
                 async () => {

                 existing_file_3.find('.update-edit-button').trigger('click');
                 await expected_student_files.$nextTick();

                 expect(expected_student_files.expected_student_files[1].pattern).toEqual("lemur!.cpp");
                 expect(expected_student_files.expected_student_files[1].min_num_matches).toEqual(1);
                 expect(expected_student_files.expected_student_files[1].max_num_matches).toEqual(2);

                 expect(expected_student_files.expected_student_files.length).toEqual(3);
                 expect(expected_student_files.expected_student_files[0]).toEqual(file_1_has_wildcard);
                 expect(expected_student_files.expected_student_files[1]).toEqual(file_3_no_wildcard);
                 expect(expected_student_files.expected_student_files[2]).toEqual(file_2_no_wildcard);
             });
         });
    });

    test.skip('Edit existing expected student file --> remove shell wildcard character',
         async () => {
         return patch_async_static_method(
             ExpectedStudentFile,
             'get_all_from_project',
             () => Promise.resolve(existing_expected_student_files),
             async () => {

             wrapper = mount(ExpectedStudentFiles, {
                 propsData: {
                     project: project_1
                 }
             });

             expected_student_files = wrapper.vm;
             await expected_student_files.$nextTick();

             let existing_file_1 = wrapper.findAll('#single-expected-student-file').at(0);
             let single_file_1 = <SingleExpectedStudentFile> existing_file_1.vm;
             expect(existing_file_1.text()).toContain(file_2_no_wildcard.pattern);


             existing_file_1.find('edit-file').trigger('click');
             await expected_student_files.$nextTick();

             let filename = existing_file_1.find({ref: 'filename'}).find('#input');
             (<HTMLInputElement> filename.element).value = "capybara.cpp";
             filename.trigger('input');
             await expected_student_files.$nextTick();

             return patch_async_class_method(
                 ExpectedStudentFile,
                 'save',
                 () => Promise.resolve(
                     call_notify_expected_student_file_changed(
                         file_1_has_wildcard,
                         single_file_1.pattern,
                         single_file_1.min_num_matches,
                         single_file_1.max_num_matches
                     )
                 ),
                 async () => {

                 existing_file_1.find('.update-edit-button').trigger('click');
                 await expected_student_files.$nextTick();

                 // check new values of min and max for file 1
                 // check that the name of file 1 changed
                 expect(expected_student_files.expected_student_files[0].pattern).toEqual("capybara");
                 expect(expected_student_files.expected_student_files[0].min_num_matches).toEqual(1);
                 expect(expected_student_files.expected_student_files[0].max_num_matches).toEqual(1);

                 expect(expected_student_files.expected_student_files.length).toEqual(3);
                 expect(expected_student_files.expected_student_files[0]).toEqual(file_1_has_wildcard);
                 expect(expected_student_files.expected_student_files[1]).toEqual(file_2_no_wildcard);
                 expect(expected_student_files.expected_student_files[2]).toEqual(file_3_no_wildcard);
             });
         });
    });

    test.skip('Cancel edit of an existing expected student file',
         async () => {

         return patch_async_static_method(
             ExpectedStudentFile,
             'get_all_from_project',
             () => Promise.resolve(existing_expected_student_files),
             async () => {

             wrapper = mount(ExpectedStudentFiles, {
                 propsData: {
                     project: project_1
                 }
             });

             expected_student_files = wrapper.vm;
             await expected_student_files.$nextTick();

             let existing_file_1 = wrapper.findAll('#single-expected-student-file').at(0);
             let single_file_1 = <SingleExpectedStudentFile> existing_file_1.vm;
             expect(existing_file_1.text()).toContain(file_2_no_wildcard.pattern);

             existing_file_1.find('edit-file').trigger('click');
             await expected_student_files.$nextTick();

             let filename = existing_file_1.find({ref: 'filename'}).find('#input');
             (<HTMLInputElement> filename.element).value = "capybara.cpp";
             filename.trigger('input');
             await expected_student_files.$nextTick();

             const spy = jest.fn();

             existing_file_1.find('.cancel-edit-button').trigger('click');
             await expected_student_files.$nextTick();

             // check values of min and max for file 1 - that they havent changed
             // check that the name of file 1 hasnt changed

             expect(expected_student_files.expected_student_files.length).toEqual(3);
             expect(expected_student_files.expected_student_files[0]).toEqual(file_1_has_wildcard);
             expect(expected_student_files.expected_student_files[1]).toEqual(file_2_no_wildcard);
             expect(expected_student_files.expected_student_files[2]).toEqual(file_3_no_wildcard);
         });
    });
});
