import FileUpload from '@/components/file_upload.vue';
import InstructorFiles from '@/components/instructor_files/instructor_files.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { InstructorFile, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import Vue from 'vue';
import Component from 'vue-class-component';

import {
    patch_async_class_method,
    patch_async_static_method,
} from '../mocking';


beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('InstructorFiles.vue', () => {
    let project: Project;
    let wrapper: Wrapper<InstructorFiles>;
    let instructor_files_component: InstructorFiles;
    let original_match_media: (query: string) => MediaQueryList;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let renamed_file_2: InstructorFile;
    let existing_instructor_files: InstructorFile[];
    let file_same_name_as_1: File;
    let uniquely_named_file: File;
    let new_uniquely_named_instructor_file: InstructorFile;
    let updated_contents_file_1: InstructorFile;
    let file_upload_component: FileUpload;
    let mfv: MultiFileViewer;

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

        file_same_name_as_1 = new File(
            [['ham', 'hashbrowns', 'eggs'].join('\n')],
            'aqua.cpp',
            { lastModified: 1426305600000 }
        );

        uniquely_named_file = new File(
            [['oatmeal', 'toast', 'jam'].join('\n')],
            'green.cpp'
        );

        instructor_file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "aqua.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        instructor_file_2 = new InstructorFile({
            pk: 2,
            project: 10,
            name: "red.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        instructor_file_3 = new InstructorFile({
            pk: 3,
            project: 10,
            name: "violet.cpp",
            size: 5,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        updated_contents_file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "aqua.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        new_uniquely_named_instructor_file = new InstructorFile({
            pk: 4,
            project: 10,
            name: "green.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        renamed_file_2 = new InstructorFile({
            pk: 3,
            project: 10,
            name: "amber.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        existing_instructor_files = [instructor_file_2, instructor_file_3, instructor_file_1];

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

    test('InstructorFiles get fetched and sorted', async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            expect(instructor_files_component.instructor_files.length).toEqual(3);
            expect(instructor_files_component.instructor_files[0]).toEqual(instructor_file_1);
            expect(instructor_files_component.instructor_files[1]).toEqual(instructor_file_2);
            expect(instructor_files_component.instructor_files[2]).toEqual(instructor_file_3);
        });
    });

    test('Uploading file with same name as preexisting instructor file', async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            expect(instructor_files_component.instructor_files.length).toEqual(3);

            let final_upload_button = wrapper.find('.upload-files-button');
            file_upload_component = <FileUpload> wrapper.find({ref: 'instructor_files_upload'}).vm;
            file_upload_component.d_files.push(file_same_name_as_1);

            let prev_size = instructor_files_component.instructor_files[0].size;

            return patch_async_class_method(
                InstructorFile,
                'get_content',
                () => Promise.resolve("Hi"),
                async () => {

                return patch_async_class_method(
                    InstructorFile,
                    'set_content',
                    () => Promise.resolve(call_notify_content_changed()),
                    async () => {

                    final_upload_button.trigger('click');
                    await instructor_files_component.$nextTick();

                    expect(instructor_files_component.instructor_files.length).toEqual(3);
                    expect(instructor_files_component.instructor_files[0].size).not.toEqual(
                        prev_size
                    );
                });
            });
        });
    });

    async function call_notify_content_changed() {
        instructor_file_1.size = 20;
        InstructorFile.notify_instructor_file_content_changed(instructor_file_1);
    }

    test('Uploading file with same name as preexisting instructor file that is' +
         ' being viewed in the multi-file-viewer',
         async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            expect(instructor_files_component.instructor_files.length).toEqual(3);

            return patch_async_class_method(
                InstructorFile,
                'get_content',
                () => Promise.resolve("Hi"),
                async () => {

                wrapper.findAll('#single-file-component').at(0).trigger('click');
                await instructor_files_component.$nextTick();

                let prev_size = instructor_files_component.instructor_files[0].size;
                let final_upload_button = wrapper.find('.upload-files-button');
                file_upload_component = <FileUpload> wrapper.find(
                    {ref: 'instructor_files_upload'}
                ).vm;
                file_upload_component.d_files.push(file_same_name_as_1);

                mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                expect(mfv.files_currently_viewing.length).toEqual(1);
                expect(wrapper.find('.active-tab-header').text()).toEqual(instructor_file_1.name);

                return patch_async_class_method(
                    InstructorFile,
                    'set_content',
                    () => Promise.resolve(call_notify_content_changed()),
                    async () => {

                    final_upload_button.trigger('click');
                    await instructor_files_component.$nextTick();

                    expect(instructor_files_component.instructor_files.length).toEqual(3);
                    expect(instructor_files_component.instructor_files[0].size).not.toEqual(
                        prev_size
                    );
                });
            });
        });
    });

    test('Uploading file that doesnt share a name with any preexisting instructor' +
         'file triggers a new instructor file to be created',
         async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            expect(instructor_files_component.instructor_files.length).toEqual(3);

            let final_upload_button = wrapper.find('.upload-files-button');
            let file_upload_component = <FileUpload> wrapper.find(
            {ref: 'instructor_files_upload'}
            ).vm;
            file_upload_component.d_files.push(uniquely_named_file);

            return patch_async_static_method(
                InstructorFile,
                'create',
                () => Promise.resolve(new_uniquely_named_instructor_file),
                async () => {

                final_upload_button.trigger('click');
                await instructor_files_component.$nextTick();

                // aqua, green, red, violet
                expect(instructor_files_component.instructor_files.length).toEqual(4);
                expect(instructor_files_component.instructor_files[0]).toEqual(instructor_file_1);
                expect(instructor_files_component.instructor_files[1]).toEqual(
                    new_uniquely_named_instructor_file
                );
                expect(instructor_files_component.instructor_files[2]).toEqual(instructor_file_2);
                expect(instructor_files_component.instructor_files[3]).toEqual(instructor_file_3);
            });
        });
    });


    test('Viewing a file (adding a file to the multi-file-viewer)', async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            return patch_async_class_method(
                InstructorFile,
                'get_content',
                () => Promise.resolve(mock_get_contents("Test 5")),
                async () => {

                wrapper.findAll('#single-file-component').at(0).trigger('click');
                await instructor_files_component.$nextTick();

                mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                expect(mfv.files_currently_viewing.length).toEqual(1);
                expect(wrapper.find('.active-tab-header').text()).toEqual(instructor_file_1.name);
                expect(wrapper.find('#viewing-container').text()).toContain("Test 5");
            });
        });
    });

    test('Clicking on a file that is already being viewed makes it the active tab ' +
         'in the multi-file-viewer',
         async () => {
         return patch_async_static_method(
             InstructorFile,
             'get_all_from_project',
             () => Promise.resolve(existing_instructor_files),
             async () => {

             wrapper = mount(InstructorFiles, {
                 propsData: {
                     project: project
                 }
             });

             instructor_files_component = wrapper.vm;
             await instructor_files_component.$nextTick();

             return patch_async_class_method(
                 InstructorFile,
                 'get_content',
                 () => Promise.resolve(mock_get_contents("Test 6")),
                 async () => {

                 wrapper.findAll('#single-file-component').at(0).trigger('click');
                 await instructor_files_component.$nextTick();

                 wrapper.findAll('#single-file-component').at(1).trigger('click');
                 await instructor_files_component.$nextTick();

                 mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                 expect(instructor_files_component.num_files_currently_viewing).toEqual(2);
                 expect(mfv.files_currently_viewing.length).toEqual(2);
                 expect(wrapper.find('.active-tab-header').text()).toEqual(
                     instructor_file_2.name
                 );

                 wrapper.findAll('#single-file-component').at(0).trigger('click');
                 await instructor_files_component.$nextTick();

                 expect(instructor_files_component.num_files_currently_viewing).toEqual(2);
                 expect(mfv.files_currently_viewing.length).toEqual(2);
                 expect(wrapper.find('.active-tab-header').text()).toEqual(
                     instructor_file_1.name
                 );
             });
         });
    });

    test('Deleting a file removes it from the list of instructor files', async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            return patch_async_class_method(
                InstructorFile,
                'delete',
                () => Promise.resolve(call_notify_deleted()),
                async () => {

                wrapper.findAll('.delete-file').at(0).trigger('click');
                await instructor_files_component.$nextTick();

                expect(wrapper.find('.file-to-delete').text()).toContain(
                    instructor_file_1.name
                );

                wrapper.find('.modal-delete-button').trigger('click');
                await instructor_files_component.$nextTick();

                let uploaded_files = wrapper.findAll('.file-name');
                expect(uploaded_files.at(0).text()).toEqual(instructor_file_2.name);
                expect(uploaded_files.at(1).text()).toEqual(instructor_file_3.name);
            });
        });
    });

    function call_notify_deleted() {
        InstructorFile.notify_instructor_file_deleted(instructor_file_1);
    }

    test('File is removed from the multi-file-viewer when it is being viewed ' +
         'and gets deleted in the instructor files list',
         async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            expect(instructor_files_component.instructor_files.length).toEqual(3);

            // aqua, red, violet
            let existing_files = wrapper.findAll('.file-name');
            expect(existing_files.at(0).text()).toEqual(instructor_file_1.name);
            expect(existing_files.at(1).text()).toEqual(instructor_file_2.name);
            expect(existing_files.at(2).text()).toEqual(instructor_file_3.name);

            return patch_async_class_method(
                InstructorFile,
                'get_content',
                () => Promise.resolve(mock_get_contents("Test 8")),
                async () => {

                wrapper.findAll('#single-file-component').at(0).trigger('click');
                await instructor_files_component.$nextTick();

                wrapper.findAll('#single-file-component').at(1).trigger('click');
                await instructor_files_component.$nextTick();

                mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                expect(instructor_files_component.num_files_currently_viewing).toEqual(2);
                expect(mfv.files_currently_viewing.length).toEqual(2);
                expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_1.name);
                expect(mfv.files_currently_viewing[1].name).toEqual(instructor_file_2.name);

                return patch_async_class_method(
                    InstructorFile,
                    'delete',
                    () => Promise.resolve(call_notify_deleted()),
                    async () => {

                    let file_to_delete = wrapper.findAll('#single-file-component').at(0);
                    file_to_delete.find('.delete-file').trigger('click');
                    await instructor_files_component.$nextTick();

                    expect(wrapper.find('.file-to-delete').text()).toContain(
                        instructor_file_1.name
                    );

                    wrapper.find('.modal-delete-button').trigger('click');
                    await instructor_files_component.$nextTick();

                    existing_files = wrapper.findAll('.file-name');
                    expect(existing_files.length).toEqual(2);
                    expect(existing_files.at(0).text()).toEqual(instructor_file_2.name);
                    expect(existing_files.at(1).text()).toEqual(instructor_file_3.name);
                    expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                    expect(mfv.files_currently_viewing.length).toEqual(1);
                    expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_2.name);
                });
            });
        });
    });

    async function mock_get_contents(msg: string) {
        return msg;
    }

    test('Renaming a file updates the name of the file', async () => {
        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            let file_2 = wrapper.findAll('#single-file-component').at(1);
            expect(file_2.text()).toContain(instructor_file_2.name);

            file_2.find('.edit-file-name').trigger('click');
            await instructor_files_component.$nextTick();

            return patch_async_class_method(
                InstructorFile,
                'rename',
                () => Promise.resolve(call_notify_renamed()),
                async () => {

                let file_name_input = wrapper.find('#validated-input-component').find('#input');
                (<HTMLInputElement> file_name_input.element).value = renamed_file_2.name;
                file_name_input.trigger('input');
                await instructor_files_component.$nextTick();

                wrapper.find('.update-file-name-button').trigger('click');
                await instructor_files_component.$nextTick();

                let uploaded_files = wrapper.findAll('.file-name');

                expect(uploaded_files.length).toEqual(3);
                expect(uploaded_files.at(0).text()).toEqual(renamed_file_2.name);
                expect(uploaded_files.at(1).text()).toEqual(instructor_file_1.name);
                expect(uploaded_files.at(2).text()).toEqual(instructor_file_3.name);
            });
        });
    });

    async function call_notify_renamed() {
        instructor_file_2.name = renamed_file_2.name;
        InstructorFile.notify_instructor_file_renamed(instructor_file_2);
    }

    test('File name is updated in the multi-file-viewer when a file being ' +
         'viewed is renamed',
         async () => {

        return patch_async_static_method(
            InstructorFile,
            'get_all_from_project',
            () => Promise.resolve(existing_instructor_files),
            async () => {

            wrapper = mount(InstructorFiles, {
                propsData: {
                    project: project
                }
            });

            instructor_files_component = wrapper.vm;
            await instructor_files_component.$nextTick();

            let uploaded_files = wrapper.findAll('.file-name');
            expect(uploaded_files.at(0).text()).toEqual(instructor_file_1.name);
            expect(uploaded_files.at(1).text()).toEqual(instructor_file_2.name);
            expect(uploaded_files.at(2).text()).toEqual(instructor_file_3.name);

            let file_2 = wrapper.findAll('#single-file-component').at(1);
            expect(file_2.text()).toContain(instructor_file_2.name);

            return patch_async_class_method(
                InstructorFile,
                'get_content',
                () => Promise.resolve(mock_get_contents("Test 10")),
                async () => {

                wrapper.findAll('#single-file-component').at(1).trigger('click');
                await instructor_files_component.$nextTick();

                mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                expect(mfv.files_currently_viewing.length).toEqual(1);
                expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_2.name);

                file_2.find('.edit-file-name').trigger('click');
                await instructor_files_component.$nextTick();

                return patch_async_class_method(
                    InstructorFile,
                    'rename',
                    () => Promise.resolve(call_notify_renamed()),
                    async () => {

                    let file_name_input = wrapper.find(
                        '#validated-input-component'
                    ).find('#input');
                    (<HTMLInputElement> file_name_input.element).value = renamed_file_2.name;
                    file_name_input.trigger('input');
                    await instructor_files_component.$nextTick();

                    wrapper.find('.update-file-name-button').trigger('click');
                    await instructor_files_component.$nextTick();

                    expect(uploaded_files.length).toEqual(3);
                    expect(mfv.files_currently_viewing.length).toEqual(1);
                    expect(mfv.files_currently_viewing[0].name).toEqual(renamed_file_2.name);

                    // aqua, red, violet --> amber(2), aqua(1), violet(3)
                    uploaded_files = wrapper.findAll('.file-name');
                    expect(uploaded_files.at(0).text()).toEqual(renamed_file_2.name);
                    expect(uploaded_files.at(1).text()).toEqual(instructor_file_1.name);
                    expect(uploaded_files.at(2).text()).toEqual(instructor_file_3.name);
                });
            });
        });
    });

    test('Clicking the collapse/show button toggles the width the multi-file-viewer ' +
         'and the visibility of the uploaded instructor files',
         async () => {
         return patch_async_static_method(
             InstructorFile,
             'get_all_from_project',
             () => Promise.resolve(existing_instructor_files),
             async () => {

             wrapper = mount(InstructorFiles, {
                 propsData: {
                     project: project
                 }
             });

             instructor_files_component = wrapper.vm;
             await instructor_files_component.$nextTick();

             let mfv_wrapper = wrapper.find('#instructor-file-viewer-wrapper');
             let instructor_files_column = wrapper.find('#column-of-files');

             let toggle_collapse_button = wrapper.find('.collapse-button');
             expect(instructor_files_component.collapsed).toBe(false);
             expect(toggle_collapse_button.text()).toContain("Collapse");
             expect(mfv_wrapper.element.style.left).toEqual("390px");
             expect(instructor_files_column.element.style.display).toEqual('block');

             return patch_async_class_method(
                 InstructorFile,
                 'get_content',
                 () => Promise.resolve("File Content"),
                 async () => {

                 wrapper.findAll('#single-file-component').at(0).trigger('click');
                 await instructor_files_component.$nextTick();

                 mfv = <MultiFileViewer> wrapper.find(
                     {ref: 'instructor_files_viewer'}
                 ).vm;
                 expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                 expect(mfv.files_currently_viewing.length).toEqual(1);

                 toggle_collapse_button.trigger('click');
                 await instructor_files_component.$nextTick();

                 expect(toggle_collapse_button.text()).toContain("Show");
                 expect(instructor_files_component.collapsed).toBe(true);
                 expect(mfv_wrapper.element.style.left).toEqual("0px");
                 expect(instructor_files_column.element.style.display).toEqual('none');

                 toggle_collapse_button.trigger('click');
                 await instructor_files_component.$nextTick();

                 expect(toggle_collapse_button.text()).toContain("Collapse");
                 expect(instructor_files_component.collapsed).toBe(false);
                 expect(mfv_wrapper.element.style.left).toEqual("390px");
                 expect(instructor_files_column.element.style.display).toEqual('block');
             });
         });
     });
});
