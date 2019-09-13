import { config, mount, Wrapper, WrapperArray } from '@vue/test-utils';

import { InstructorFile, Project } from 'ag-client-typescript';
import * as sinon from "sinon";

import FileUpload from '@/components/file_upload.vue';
import InstructorFiles from '@/components/project_admin/instructor_files/instructor_files.vue';
import SingleInstructorFile from '@/components/project_admin/instructor_files/single_instructor_file.vue';
import ViewFile from '@/components/view_file.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('InstructorFiles.vue', () => {
    let project: Project;
    let wrapper: Wrapper<InstructorFiles>;
    let component: InstructorFiles;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let existing_instructor_files: InstructorFile[];
    let file_same_name_as_1: File;
    let uniquely_named_file: File;
    let new_uniquely_named_instructor_file: InstructorFile;
    let file_upload_component: FileUpload;

    beforeEach(async () => {
        project = data_ut.make_project(data_ut.make_course().pk);

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
            project: project.pk,
            name: "aqua.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        instructor_file_2 = new InstructorFile({
            pk: 2,
            project: project.pk,
            name: "red.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        instructor_file_3 = new InstructorFile({
            pk: 3,
            project: project.pk,
            name: "violet.cpp",
            size: 5,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        new_uniquely_named_instructor_file = new InstructorFile({
            pk: 4,
            project: project.pk,
            name: "green.cpp",
            size: 1,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });
        existing_instructor_files = [instructor_file_1, instructor_file_2, instructor_file_3];

        let get_all_from_project_stub = sinon.stub(InstructorFile, 'get_all_from_project');
        get_all_from_project_stub.resolves(existing_instructor_files);

        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
        await wrapper.vm.$nextTick();
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('InstructorFiles loaded on create', async () => {
        expect(component.instructor_files.length).toEqual(3);
        expect(component.instructor_files[0]).toEqual(instructor_file_1);
        expect(component.instructor_files[1]).toEqual(instructor_file_2);
        expect(component.instructor_files[2]).toEqual(instructor_file_3);
    });

    test('Uploading file with same name as an existing instructor file', async () => {
        let set_content_stub = sinon.stub(instructor_file_1, 'set_content');

        let final_upload_button = wrapper.find('.upload-files-button');
        file_upload_component = <FileUpload> wrapper.find({ref: 'instructor_files_upload'}).vm;
        file_upload_component.d_files.insert(file_same_name_as_1);

        final_upload_button.trigger('click');
        await component.$nextTick();

        expect(set_content_stub.calledOnce).toBe(true);
        expect(set_content_stub.calledWith(file_same_name_as_1)).toBe(true);
        expect(component.instructor_files.length).toEqual(3);
    });

    test('Re-upload file being viewed, contents updated', async () => {
        sinon.stub(instructor_file_1, 'get_content').resolves("Old Content");

        wrapper.findAll({name: 'SingleInstructorFile'}).at(0).trigger('click');
        let view_file = <Wrapper<ViewFile>> wrapper.find({name: 'ViewFile'});
        await component.$nextTick();
        expect(await view_file.vm.file_contents).toEqual('Old Content');

        InstructorFile.notify_instructor_file_content_changed(instructor_file_1, "New Content");
        await component.$nextTick();
        expect(await view_file.vm.file_contents).toEqual('New Content');
    });

    test('Upload new instructor file', async () => {
        let final_upload_button = wrapper.find('.upload-files-button');
        file_upload_component = <FileUpload> wrapper.find({ref: 'instructor_files_upload'}).vm;
        file_upload_component.d_files.insert(uniquely_named_file);

        let create_stub = sinon.stub(InstructorFile, 'create');
        create_stub.resolves(new_uniquely_named_instructor_file);

        final_upload_button.trigger('click');
        await component.$nextTick();

        expect(create_stub.calledOnce).toBe(true);
        expect(create_stub.calledWith(
            project.pk,
            uniquely_named_file.name,
            uniquely_named_file
        )).toBe(true);

        expect(component.instructor_files.length).toEqual(4);
        expect(component.instructor_files[0]).toEqual(instructor_file_1);
        expect(component.instructor_files[1]).toEqual(new_uniquely_named_instructor_file);
        expect(component.instructor_files[2]).toEqual(instructor_file_2);
        expect(component.instructor_files[3]).toEqual(instructor_file_3);
    });

    test('Viewing a file', async () => {
        let get_content_stub_1 = sinon.stub(instructor_file_1, 'get_content').resolves("Monday");
        wrapper.findAll({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        let view_file = <Wrapper<ViewFile>> wrapper.find({name: 'ViewFile'});
        expect(view_file.vm.filename).toEqual(instructor_file_1.name);
        expect(await view_file.vm.file_contents).toEqual('Monday');

        sinon.stub(instructor_file_2, 'get_content').resolves("Tuesday");
        wrapper.findAll({name: 'SingleInstructorFile'}).at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(view_file.vm.filename).toEqual(instructor_file_2.name);
        expect(await view_file.vm.file_contents).toEqual('Tuesday');

        // Check that contents are cached locally

        wrapper.findAll({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(view_file.vm.filename).toEqual(instructor_file_1.name);
        expect(await view_file.vm.file_contents).toEqual('Monday');

        expect(get_content_stub_1.calledOnce).toBe(true);
    });

    test('Deleting a file removes it from the list of instructor files', async () => {
        let delete_stub = sinon.stub(instructor_file_1, 'delete');
        delete_stub.callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_1));

        expect(delete_stub.callCount).toEqual(0);
        wrapper.findAll('.delete-file').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.find('.file-to-delete').text()).toContain(instructor_file_1.name);

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        let uploaded_files = wrapper.findAll('.file-name');
        expect(uploaded_files.at(0).text()).toEqual(instructor_file_2.name);
        expect(uploaded_files.at(1).text()).toEqual(instructor_file_3.name);
        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Instructor file deleted while being viewed', async () => {
        sinon.stub(instructor_file_1, 'get_content').resolves("File 1 Content");

        wrapper.findAll({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await component.$nextTick();
        expect(wrapper.vm.d_current_filename).toBe(instructor_file_1.name);

        sinon.stub(instructor_file_1, 'delete').callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_1)
        );

        let file_to_delete = wrapper.findAll({name: 'SingleInstructorFile'}).at(0);
        file_to_delete.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        let existing_files = <WrapperArray<SingleInstructorFile>> wrapper.findAll(
            {name: 'SingleInstructorFile'});
        expect(existing_files.length).toEqual(2);
        expect(existing_files.at(0).vm.file.name).toEqual(instructor_file_2.name);
        expect(existing_files.at(1).vm.file.name).toEqual(instructor_file_3.name);

        expect(wrapper.vm.d_current_filename).toBeNull();
        expect(wrapper.vm.d_open_files.has(instructor_file_1.name)).toBe(false);
    });

    test('Renaming a file updates the name of the file', async () => {
        let renamed_file = deep_copy(instructor_file_2, InstructorFile);
        let new_file_name = "amber.cpp";
        renamed_file.name = new_file_name;
        InstructorFile.notify_instructor_file_renamed(renamed_file);

        let instructor_files = <WrapperArray<SingleInstructorFile>> wrapper.findAll(
            {name: 'SingleInstructorFile'});
        expect(instructor_files.length).toEqual(3);
        expect(instructor_files.at(0).vm.file.name).toEqual(new_file_name);
        expect(instructor_files.at(1).vm.file.name).toEqual(instructor_file_1.name);
        expect(instructor_files.at(2).vm.file.name).toEqual(instructor_file_3.name);
    });

    test('Open/close the sidebar', async () => {
        let sidebar_header = wrapper.find('.sidebar-header');
        expect(wrapper.vm.d_collapsed).toBe(false);
        expect(wrapper.find('.sidebar-content').isVisible()).toBe(true);
        expect(sidebar_header.text().includes('Uploaded Files')).toBe(true);

        // Header text still shows up if we haven't selected a file
        sinon.stub(instructor_file_1, 'get_content').resolves("Monday");
        wrapper.findAll({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.collapse-show-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_collapsed).toBe(true);
        expect(wrapper.find('.sidebar-content').exists()).toBe(false);
        expect(sidebar_header.text().includes('Uploaded Files')).toBe(false);

        // Re-open the sidebar
        wrapper.find('.collapse-show-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_collapsed).toBe(false);
        expect(wrapper.find('.sidebar-content').isVisible()).toBe(true);
        expect(sidebar_header.text().includes('Uploaded Files')).toBe(true);
    });
});
