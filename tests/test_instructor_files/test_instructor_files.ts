import FileUpload from '@/components/file_upload.vue';
import InstructorFiles from '@/components/instructor_files/instructor_files.vue';
import SingleFile from '@/components/instructor_files/single_file.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import ValidatedInput from '@/components/validated_input.vue';
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
    let renamed_file_3: InstructorFile;
    let existing_instructor_files: InstructorFile[];
    let upload_file_1: File;
    let upload_file_2: File;
    let new_instructor_file: InstructorFile;
    let updated_contents_file_1: InstructorFile;

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

        upload_file_1 = new File(
            [['ham', 'hashbrowns', 'eggs'].join('\n')],
            'purple.cpp',
            { lastModified: 1426305600000 }
        );

        upload_file_2 = new File(
            [['oatmeal', 'toast', 'jam'].join('\n')],
            'Green.cpp'
        );

        instructor_file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "purple.cpp",
            size: 2,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        instructor_file_2 = new InstructorFile({
            pk: 2,
            project: 10,
            name: "aqua.cpp",
            size: 4,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        instructor_file_3 = new InstructorFile({
            pk: 3,
            project: 10,
            name: "Blue.cpp",
            size: 5,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        updated_contents_file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "purple.cpp",
            size: 20,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        new_instructor_file = new InstructorFile({
            pk: 4,
            project: 10,
            name: "Green.cpp",
            size: 5,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        renamed_file_3 = new InstructorFile({
            pk: 3,
            project: 10,
            name: "light_blue.cpp",
            size: 5,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        existing_instructor_files = [instructor_file_1, instructor_file_2, instructor_file_3];

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

    test('0 - InstructorFile data set to values passed in by parent', () => {
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });

        instructor_files_component = wrapper.vm;
        expect(instructor_files_component.project).toEqual(project);
    });

    test('1 - InstructorFiles get fetched and sorted', async () => {
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
                expect(instructor_files_component.instructor_files[0]).toEqual(instructor_file_3);
                expect(instructor_files_component.instructor_files[1]).toEqual(instructor_file_2);
                expect(instructor_files_component.instructor_files[2]).toEqual(instructor_file_1);
        });
    });

    test('2 - Uploading file with same name as preexisting instructor file',
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

            let file_upload_component = <FileUpload> wrapper.find(
                {ref: 'instructor_files_upload'}
            ).vm;
            let final_upload_button = wrapper.find('.upload-files-button');
            file_upload_component.d_files.push(upload_file_1);

            let prev_size = instructor_files_component.instructor_files[2].size;

            patch_async_class_method(
                InstructorFile,
                'set_content',
                call_notify_content_changed,
                async () => {

                final_upload_button.trigger('click');
                await instructor_files_component.$nextTick();

                expect(instructor_files_component.instructor_files.length).toEqual(3);
                expect(instructor_files_component.instructor_files[2].size).not.toEqual(prev_size);
            });
        });
    });


    function call_notify_content_changed() {
        // instructor_file_1.set_content(new Blob(["ice cream"], {type: 'text/plain'}));
        instructor_file_1.size = 20;
        InstructorFile.notify_instructor_file_content_changed(instructor_file_1);
        console.log("Notify got called");
        return Promise.resolve("");
    }

    test.skip('3 - Uploading file with same name as preexisting instructor file that is' +
              'being viewed in the multi-file-viewer',
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

            let file_upload_component = <FileUpload> wrapper.find(
                {ref: 'instructor_files_upload'}
            ).vm;
            let final_upload_button = wrapper.find('.upload-files-button');
            file_upload_component.d_files.push(upload_file_1);

            patch_async_class_method(
                InstructorFile,
                'set_content',
                call_notify_content_changed,
                async () => {

                final_upload_button.trigger('click');
                await instructor_files_component.$nextTick();

                // how to compare the content of two files/blobs?
                expect(instructor_files_component.instructor_files.length).toEqual(3);
            });
        });
    });

    test('4 - Uploading file that doesnt share a name with any preexisting instructor' +
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

            let file_upload_component = <FileUpload> wrapper.find(
            {ref: 'instructor_files_upload'}
            ).vm;
            let final_upload_button = wrapper.find('.upload-files-button');

            file_upload_component.d_files.push(upload_file_2);

            patch_async_static_method(
                InstructorFile,
                'create',
                () => Promise.resolve(new_instructor_file),
                async () => {

                final_upload_button.trigger('click');
                await instructor_files_component.$nextTick();

                expect(instructor_files_component.instructor_files.length).toEqual(4);
                expect(instructor_files_component.instructor_files[0]).toEqual(instructor_file_3);
                expect(instructor_files_component.instructor_files[1]).toEqual(new_instructor_file);
                expect(instructor_files_component.instructor_files[2]).toEqual(instructor_file_2);
                expect(instructor_files_component.instructor_files[3]).toEqual(instructor_file_1);
            });
        });
    });


    test('5 - Viewing a file (adding a file to the multi-file-viewer)', async () => {
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
                () => Promise.resolve("File Content"),
                async () => {

                wrapper.findAll('#single-file-component').at(0).trigger('click');
                await instructor_files_component.$nextTick();

                let mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                expect(mfv.files_currently_viewing.length).toEqual(1);
                expect(wrapper.find('.active-tab-header').text()).toEqual(instructor_file_3.name);
                expect(wrapper.find('#viewing-container').text()).toContain("File Content");
            });
        });
    });

    test('6 - clicking on a file that is already being viewed makes it the active tab ' +
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
                 () => Promise.resolve("Content"),
                 async () => {

                     wrapper.findAll('#single-file-component').at(0).trigger('click');
                     await instructor_files_component.$nextTick();

                     wrapper.findAll('#single-file-component').at(1).trigger('click');
                     await instructor_files_component.$nextTick();

                     let mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
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
                         instructor_file_3.name
                     );
             });
         });
    });

    test('7 - Deleting a file removes it from the list of instructor files',
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
            expect(uploaded_files.at(0).text()).toEqual(instructor_file_3.name);
            expect(uploaded_files.at(1).text()).toEqual(instructor_file_2.name);
            expect(uploaded_files.at(2).text()).toEqual(instructor_file_1.name);

            return patch_async_class_method(
                InstructorFile,
                'delete',
                call_notify_deleted,
                async () => {

                    wrapper.findAll('.delete-file').at(0).trigger('click');
                    await instructor_files_component.$nextTick();

                    expect(wrapper.find('.file-to-delete').text()).toContain(instructor_file_3.name);

                    wrapper.find('.modal-delete-button').trigger('click');
                    await instructor_files_component.$nextTick();

                    uploaded_files = wrapper.findAll('.file-name');
                    expect(uploaded_files.at(0).text()).toEqual(instructor_file_2.name);
                    expect(uploaded_files.at(1).text()).toEqual(instructor_file_1.name);
                }
            );
        });
    });

    function call_notify_deleted() {
        InstructorFile.notify_instructor_file_deleted(instructor_file_3);
        console.log("Notify got called");
        return Promise.resolve("");
    }

    test('8 - File is removed from the multi-file-viewer when it is being viewed ' +
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

            let uploaded_files = wrapper.findAll('.file-name');
            expect(uploaded_files.at(0).text()).toEqual(instructor_file_3.name);
            expect(uploaded_files.at(1).text()).toEqual(instructor_file_2.name);
            expect(uploaded_files.at(2).text()).toEqual(instructor_file_1.name);

            return patch_async_class_method(
                InstructorFile,
                'get_content',
                () => Promise.resolve("Content"),
                async () => {

                expect(instructor_files_component.instructor_files.length).toEqual(3);

                wrapper.findAll('#single-file-component').at(0).trigger('click');
                await instructor_files_component.$nextTick();

                wrapper.findAll('#single-file-component').at(1).trigger('click');
                await instructor_files_component.$nextTick();

                let mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                expect(instructor_files_component.num_files_currently_viewing).toEqual(2);
                expect(mfv.files_currently_viewing.length).toEqual(2);
                expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_3.name);
                expect(mfv.files_currently_viewing[1].name).toEqual(instructor_file_2.name);

                return patch_async_class_method(
                    InstructorFile,
                    'delete',
                    call_notify_deleted,
                    async () => {

                    let file_3 = wrapper.findAll('#single-file-component').at(0);
                    console.log(file_3.html());

                    file_3.find('.delete-file').trigger('click');
                    await instructor_files_component.$nextTick();

                    wrapper.find('.modal-delete-button').trigger('click');
                    await instructor_files_component.$nextTick();

                    uploaded_files = wrapper.findAll('.file-name');
                    expect(uploaded_files.at(0).text()).toEqual(instructor_file_2.name);
                    expect(uploaded_files.at(1).text()).toEqual(instructor_file_1.name);
                    expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                    expect(mfv.files_currently_viewing.length).toEqual(1);
                    expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_2.name);
                });
            });
        });
    });

    test('9 - Renaming a file updates the name of the file', async () => {

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
            expect(uploaded_files.at(0).text()).toEqual(instructor_file_3.name);
            expect(uploaded_files.at(1).text()).toEqual(instructor_file_2.name);
            expect(uploaded_files.at(2).text()).toEqual(instructor_file_1.name);

            let file_3 = wrapper.findAll('#single-file-component').at(2);
            file_3.find('.edit-file-name').trigger('click');
            await instructor_files_component.$nextTick();

            await patch_async_class_method(
                InstructorFile,
                'rename',
                call_notify_renamed,
                async () => {

                let file_name_input = wrapper.find(
                    '#validated-input-component'
                ).find('#input');

                (<HTMLInputElement> file_name_input.element).value = renamed_file_3.name;
                file_name_input.trigger('input');
                await instructor_files_component.$nextTick();

                wrapper.find('.update-file-name-button').trigger('click');
                await instructor_files_component.$nextTick();

                uploaded_files = wrapper.findAll('.file-name');

                expect(uploaded_files.length).toEqual(3);
                expect(uploaded_files.at(0).text()).toEqual(instructor_file_2.name);
                expect(uploaded_files.at(1).text()).toEqual(renamed_file_3.name);
                expect(uploaded_files.at(2).text()).toEqual(instructor_file_1.name);
            });
        });
    });

    function call_notify_renamed() {
        InstructorFile.notify_instructor_file_renamed(renamed_file_3);
        return Promise.resolve("");
    }

    test('10 - File name is updated in the multi-file-viewer when a file being ' +
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

            let uploaded_files = wrapper.findAll('#single-file-component');
            let first_file = uploaded_files.at(0);

            return patch_async_class_method(
                InstructorFile,
                'get_content',
                () => Promise.resolve("Content"),
                async () => {

                expect(instructor_files_component.instructor_files.length).toEqual(3);

                wrapper.findAll('#single-file-component').at(0).trigger('click');
                await instructor_files_component.$nextTick();

                let mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
                expect(instructor_files_component.num_files_currently_viewing).toEqual(1);
                expect(mfv.files_currently_viewing.length).toEqual(1);
                expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_3.name);

                first_file.find('.edit-file-name').trigger('click');
                await instructor_files_component.$nextTick();

                await patch_async_class_method(
                    InstructorFile,
                    'rename',
                    call_notify_renamed,
                    async () => {

                    let file_name_input = wrapper.find(
                        '#validated-input-component'
                    ).find('#input');

                    (<HTMLInputElement> file_name_input.element).value = renamed_file_3.name;
                    file_name_input.trigger('input');  // Network error
                    await instructor_files_component.$nextTick();

                    wrapper.find('.update-file-name-button').trigger('click');
                    await instructor_files_component.$nextTick();

                    uploaded_files = wrapper.findAll('.file-name');

                    expect(uploaded_files.length).toEqual(3);
                    expect(mfv.files_currently_viewing.length).toEqual(1);
                    expect(mfv.files_currently_viewing[0].name).toEqual(renamed_file_3.name);
                    expect(uploaded_files.at(0).text()).toEqual(instructor_file_2.name);
                    expect(uploaded_files.at(1).text()).toEqual(renamed_file_3.name);
                    expect(uploaded_files.at(2).text()).toEqual(instructor_file_1.name);
                });
            });
        });
    });

    test('11 - Clicking the collapse/show button toggles the width the multi-file-viewer ' +
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

                let mfv = <MultiFileViewer> wrapper.find(
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
