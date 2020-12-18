import { mount, Wrapper } from '@vue/test-utils';

import { HttpError, InstructorFile, Project } from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from "@/components/api_errors.vue";
import FileUpload from '@/components/file_upload.vue';
import InstructorFiles from '@/components/project_admin/instructor_files/instructor_files.vue';
import ViewFile from '@/components/view_file.vue';

import * as data_ut from '@/tests/data_utils';
import { wait_until } from '@/tests/utils';


describe('InstructorFiles.vue', () => {
    let project: Project;
    let wrapper: Wrapper<InstructorFiles>;
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

        project.instructor_files = existing_instructor_files;
        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
        await wrapper.vm.$nextTick();
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('InstructorFiles used from project', async () => {
        expect(wrapper.vm.instructor_files.length).toEqual(3);
        expect(wrapper.vm.instructor_files[0]).toEqual(instructor_file_1);
        expect(wrapper.vm.instructor_files[1]).toEqual(instructor_file_2);
        expect(wrapper.vm.instructor_files[2]).toEqual(instructor_file_3);
    });

    test('Uploading file with same name as an existing instructor file', async () => {
        let set_content_stub = sinon.stub(instructor_file_1, 'set_content');
        set_content_stub.callsFake((content, on_upload_progress) => {
            // tslint:disable-next-line: no-object-literal-type-assertion
            on_upload_progress!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 10});
            return Promise.resolve();
        });

        let final_upload_button = wrapper.find('.upload-files-button');
        file_upload_component
            = <FileUpload> wrapper.findComponent({ref: 'instructor_files_upload'}).vm;
        file_upload_component.d_files.insert(file_same_name_as_1);

        final_upload_button.trigger('click');
        await wrapper.vm.$nextTick();

        expect(set_content_stub.calledOnce).toBe(true);
        expect(set_content_stub.calledWith(file_same_name_as_1)).toBe(true);
        expect(wrapper.vm.instructor_files.length).toEqual(3);
    });

    test('Re-upload file being viewed, contents updated', async () => {
        sinon.stub(instructor_file_1, 'get_content').resolves(new Blob(["Old Content"]));

        await wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0).trigger('click');
        expect(
            await wait_until(wrapper, w => w.vm.current_filename === instructor_file_1.name)
        ).toBe(true);
        let view_file = <Wrapper<ViewFile>> wrapper.findComponent({name: 'ViewFile'});
        expect(await view_file.vm.file_contents).toEqual('Old Content');

        InstructorFile.notify_instructor_file_content_changed(
            instructor_file_1, new Blob(["New Content"]));
        await wrapper.vm.$nextTick();
        expect(await view_file.vm.file_contents).toEqual('New Content');
    });

    test('Upload new instructor file', async () => {
        let final_upload_button = wrapper.find('.upload-files-button');
        file_upload_component
            = <FileUpload> wrapper.findComponent({ref: 'instructor_files_upload'}).vm;
        file_upload_component.d_files.insert(uniquely_named_file);

        let create_stub = sinon.stub(InstructorFile, 'create');
        create_stub.callsFake((project_pk, name, content, on_upload_progress) => {
            // tslint:disable-next-line: no-object-literal-type-assertion
            on_upload_progress!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 10});
            return Promise.resolve(new_uniquely_named_instructor_file);
        });

        final_upload_button.trigger('click');
        await wrapper.vm.$nextTick();

        expect(create_stub.calledOnce).toBe(true);
        expect(create_stub.calledWith(
            project.pk,
            uniquely_named_file.name,
            uniquely_named_file
        )).toBe(true);

        // project_admin.vue listens for created instructor files
    });

    test('Error uploading instructor file', async () => {
        let final_upload_button = wrapper.find('.upload-files-button');
        file_upload_component
            = <FileUpload> wrapper.findComponent({ref: 'instructor_files_upload'}).vm;
        file_upload_component.d_files.insert(uniquely_named_file);

        sinon.stub(InstructorFile, 'create').rejects(
            new HttpError(413, 'Too large'));

        final_upload_button.trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Viewing a file', async () => {
        let get_content_stub_1 = sinon.stub(instructor_file_1, 'get_content').callsFake(
            (on_upload_progress) => {
                // tslint:disable-next-line: no-object-literal-type-assertion
                on_upload_progress!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 6});
                return Promise.resolve(new Blob(['Monday']));
            }
        );
        wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        let view_file = <Wrapper<ViewFile>> wrapper.findComponent({name: 'ViewFile'});
        expect(view_file.vm.filename).toEqual(instructor_file_1.name);
        expect(await view_file.vm.file_contents).toEqual('Monday');

        sinon.stub(instructor_file_2, 'get_content').resolves(new Blob(["Tuesday"]));
        wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(view_file.vm.filename).toEqual(instructor_file_2.name);
        expect(await view_file.vm.file_contents).toEqual('Tuesday');

        // Check that contents are cached locally

        wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(view_file.vm.filename).toEqual(instructor_file_1.name);
        expect(await view_file.vm.file_contents).toEqual('Monday');

        expect(get_content_stub_1.calledOnce).toBe(true);
    });

    test('Rename opened file', async () => {
        let expected_content = 'I am contenttt';
        sinon.stub(instructor_file_1, 'get_content').resolves(new Blob([expected_content]));
        let renamed = new InstructorFile(instructor_file_1);
        renamed.name = 'Renamed';

        wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        let view_file = <Wrapper<ViewFile>> wrapper.findComponent({name: 'ViewFile'});
        expect(view_file.vm.filename).toEqual(instructor_file_1.name);
        expect(await view_file.vm.file_contents).toEqual(expected_content);

        InstructorFile.notify_instructor_file_renamed(renamed, instructor_file_1.name);
        await wrapper.vm.$nextTick();

        expect(view_file.vm.filename).toEqual(renamed.name);
        expect(await view_file.vm.file_contents).toEqual(expected_content);
    });

    test('Delete single file', async () => {
        let delete_stub = sinon.stub(instructor_file_1, 'delete');
        delete_stub.callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_1));

        expect(delete_stub.callCount).toEqual(0);
        wrapper.findAll('.delete-file').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.files-to-delete').findAll('li').length).toEqual(1);
        expect(wrapper.find('.filename').text()).toContain(instructor_file_1.name);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Delete single file while batched files are selected', async () => {
        let delete_stub = sinon.stub(instructor_file_1, 'delete');
        delete_stub.callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_1));

        wrapper.findAll('.single-instructor-file-component input').at(0).trigger('click');
        await wrapper.vm.$nextTick();
        wrapper.findAll('.single-instructor-file-component input').at(1).trigger('click');
        await wrapper.vm.$nextTick();


        expect(delete_stub.callCount).toEqual(0);
        wrapper.findAll('.delete-file').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.files-to-delete').findAll('li').length).toEqual(1);
        expect(wrapper.find('.filename').text()).toContain(instructor_file_1.name);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Delete single file using batch delete', async () => {
        let delete_stub = sinon.stub(instructor_file_1, 'delete');
        delete_stub.callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_1));

        wrapper.findAll('.single-instructor-file-component input').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.callCount).toEqual(0);
        wrapper.find('.batch-delete-files-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.files-to-delete').findAll('li').length).toEqual(1);
        expect(wrapper.find('.filename').text()).toContain(instructor_file_1.name);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Delete multiple files using batch delete', async () => {
        let delete_stub1 = sinon.stub(instructor_file_1, 'delete');
        delete_stub1.callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_1));

        let delete_stub2 = sinon.stub(instructor_file_2, 'delete');
        delete_stub2.callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_2));

        expect(delete_stub1.callCount).toEqual(0);
        expect(delete_stub2.callCount).toEqual(0);
        wrapper.findAll('.single-instructor-file-component input').at(0).trigger('click');
        await wrapper.vm.$nextTick();
        wrapper.findAll('.single-instructor-file-component input').at(1).trigger('click');
        await wrapper.vm.$nextTick();
        wrapper.findAll('.single-instructor-file-component input').at(2).trigger('click');
        await wrapper.vm.$nextTick();

        // click again to test deselect behavior 
        wrapper.findAll('.single-instructor-file-component input').at(2).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.batch-delete-files-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.files-to-delete').findAll('li').length).toEqual(2);
        expect(wrapper.findAll('.filename').at(0).text()).toContain(instructor_file_1.name);
        expect(wrapper.findAll('.filename').at(1).text()).toContain(instructor_file_2.name);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub1.calledOnce).toBe(true);
        expect(delete_stub2.calledOnce).toBe(true);
    });

    test('Instructor file deleted while being viewed', async () => {
        let get_content_stub = sinon.stub(
            instructor_file_1, 'get_content'
        ).callsFake((callback) => {
            // tslint:disable-next-line: no-object-literal-type-assertion
            callback!(<ProgressEvent> {lengthComputable: true, loaded: 10, total: 20});
            return Promise.resolve(new Blob(["File 1 Content"]));
        });

        wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.current_filename).toBe(instructor_file_1.name);

        sinon.stub(instructor_file_1, 'delete').callsFake(
            async () => InstructorFile.notify_instructor_file_deleted(instructor_file_1)
        );

        let file_to_delete = wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0);
        file_to_delete.find('.delete-file').trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.current_filename).toBeNull();

        // If we re-add the file and open it, get_content should be called again because
        // the cached contents should have been cleared.
        expect(get_content_stub.calledOnce).toBe(true);
        InstructorFile.notify_instructor_file_created(instructor_file_1);
        wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(get_content_stub.calledTwice).toBe(true);
    });

    test('Users have the ability to cancel the process of deleting a file', async () => {
        let delete_stub = sinon.stub(instructor_file_1, 'delete');

        wrapper.find('.delete-file').trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-cancel-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.callCount).toEqual(0);
    });

    test('API errors handled on delete', async () => {
        sinon.stub(instructor_file_1, 'delete').rejects(new HttpError(403, "nope"));
        wrapper.find('.delete-file').trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'delete_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Open/close the sidebar', async () => {
        let sidebar_header = wrapper.find('.sidebar-header');
        expect(wrapper.vm.d_collapsed).toBe(false);
        expect(wrapper.find('.sidebar-content').element).toBeVisible();
        expect(sidebar_header.text().includes('Uploaded Files')).toBe(true);

        // Header text still shows up if we haven't selected a file
        sinon.stub(instructor_file_1, 'get_content').resolves(new Blob(["Monday"]));
        wrapper.findAllComponents({name: 'SingleInstructorFile'}).at(0).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.sidebar-collapse-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_collapsed).toBe(true);
        expect(wrapper.find('.sidebar-content').exists()).toBe(false);
        expect(sidebar_header.text().includes('Uploaded Files')).toBe(false);

        // Re-open the sidebar
        wrapper.find('.sidebar-collapse-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_collapsed).toBe(false);
        expect(wrapper.find('.sidebar-content').element).toBeVisible();
        expect(sidebar_header.text().includes('Uploaded Files')).toBe(true);
    });
});
