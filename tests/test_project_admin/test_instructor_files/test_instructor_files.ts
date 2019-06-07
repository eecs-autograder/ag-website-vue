import { config, mount, Wrapper } from '@vue/test-utils';

import { InstructorFile, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import * as sinon from "sinon";

import FileUpload from '@/components/file_upload.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import InstructorFiles from '@/components/project_admin/instructor_files/instructor_files.vue';


beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('InstructorFiles.vue', () => {
    let project: Project;
    let wrapper: Wrapper<InstructorFiles>;
    let component: InstructorFiles;
    let original_match_media: (query: string) => MediaQueryList;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let existing_instructor_files: InstructorFile[];
    let file_same_name_as_1: File;
    let uniquely_named_file: File;
    let new_uniquely_named_instructor_file: InstructorFile;
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

        new_uniquely_named_instructor_file = new InstructorFile({
            pk: 4,
            project: 10,
            name: "green.cpp",
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

        let get_all_from_project_stub = sinon.stub(InstructorFile, 'get_all_from_project');
        get_all_from_project_stub.resolves(existing_instructor_files);

        wrapper = mount(InstructorFiles, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    function call_notify_content_changed(file: InstructorFile, new_content: string) {
        InstructorFile.notify_instructor_file_content_changed(instructor_file_1, new_content);
    }

    function call_notify_renamed(file: InstructorFile, new_name: string) {
        file.name = new_name;
        InstructorFile.notify_instructor_file_renamed(file);
    }

    function call_notify_deleted(file: InstructorFile) {
        InstructorFile.notify_instructor_file_deleted(file);
    }

    test('InstructorFiles get fetched and sorted', async () => {
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

    test('Uploading file with same name as existing instructor file that is being viewed ' +
         'in the multi-file-viewer',
         async () => {
        sinon.stub(instructor_file_1, 'get_content').resolves("Old Content");
        sinon.stub(instructor_file_1, 'set_content').callsFake(
            () => call_notify_content_changed(instructor_file_1, "New Content")
        );

        wrapper.findAll('#single-instructor-file-component').at(0).trigger('click');
        await component.$nextTick();

        let final_upload_button = wrapper.find('.upload-files-button');
        file_upload_component = <FileUpload> wrapper.find({ref: 'instructor_files_upload'}).vm;
        file_upload_component.d_files.insert(file_same_name_as_1);

        mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;

        expect(component.num_files_currently_viewing).toEqual(1);
        expect(mfv.files_currently_viewing.length).toEqual(1);
        expect(wrapper.find('.active-tab-header').text()).toEqual(instructor_file_1.name);
        expect(wrapper.find('#view-file-component').text()).toContain("Old Content");

        final_upload_button.trigger('click');
        await component.$nextTick();

        expect(component.instructor_files.length).toEqual(3);
        expect(wrapper.find('#view-file-component').text()).toContain("New Content");
    });

    test('Uploading file that doesnt share a name with any preexisting instructor file ' +
         'triggers a new instructor file to be created',
         async () => {

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

    test('Viewing a file (adding a file to the multi-file-viewer)', async () => {
        sinon.stub(instructor_file_1, 'get_content').resolves("Monday");

        wrapper.findAll('#single-instructor-file-component').at(0).trigger('click');
        await component.$nextTick();

        mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
        expect(component.num_files_currently_viewing).toEqual(1);
        expect(mfv.files_currently_viewing.length).toEqual(1);
        expect(wrapper.find('.active-tab-header').text()).toEqual(instructor_file_1.name);
        expect(wrapper.find('#viewing-container').text()).toContain("Monday");
    });

    test('Clicking on a file that is already being viewed makes it the active tab ' +
         'in the multi-file-viewer',
         async () => {
        let get_content_stub_1 = sinon.stub(instructor_file_1, 'get_content');
        let get_content_stub_2 = sinon.stub(instructor_file_2, 'get_content');
        get_content_stub_1.resolves("File 1 Contents");
        get_content_stub_2.resolves("File 2 Contents");

        wrapper.findAll('#single-instructor-file-component').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('#single-instructor-file-component').at(1).trigger('click');
        await component.$nextTick();

        mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
        expect(component.num_files_currently_viewing).toEqual(2);
        expect(mfv.files_currently_viewing.length).toEqual(2);
        expect(wrapper.find('.active-tab-header').text()).toEqual(instructor_file_2.name);

        expect(get_content_stub_1.calledOnce).toBe(true);
        expect(get_content_stub_2.calledOnce).toBe(true);

        wrapper.findAll('#single-instructor-file-component').at(0).trigger('click');
        await component.$nextTick();

        expect(component.num_files_currently_viewing).toEqual(2);
        expect(mfv.files_currently_viewing.length).toEqual(2);
        expect(wrapper.find('.active-tab-header').text()).toEqual(instructor_file_1.name);

        expect(get_content_stub_1.calledTwice).toBe(true);
        expect(get_content_stub_2.calledOnce).toBe(true);
    });

    test('Deleting a file removes it from the list of instructor files', async () => {
        let delete_stub = sinon.stub(instructor_file_1, 'delete');
        delete_stub.callsFake(() => call_notify_deleted(instructor_file_1));

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

    test('File is removed from the multi-file-viewer when it is being viewed ' +
         'and gets deleted in the instructor files list',
         async () => {
        sinon.stub(instructor_file_1, 'get_content').resolves("File 1 Content");
        sinon.stub(instructor_file_2, 'get_content').resolves("File 2 Content");

        wrapper.findAll('#single-instructor-file-component').at(0).trigger('click');
        await component.$nextTick();

        wrapper.findAll('#single-instructor-file-component').at(1).trigger('click');
        await component.$nextTick();

        mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
        expect(component.num_files_currently_viewing).toEqual(2);
        expect(mfv.files_currently_viewing.length).toEqual(2);
        expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_1.name);
        expect(mfv.files_currently_viewing[1].name).toEqual(instructor_file_2.name);

        sinon.stub(instructor_file_1, 'delete').callsFake(
            () => call_notify_deleted(instructor_file_1)
        );

        let file_to_delete = wrapper.findAll('#single-instructor-file-component').at(0);
        file_to_delete.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        let existing_files = wrapper.findAll('.file-name');
        expect(existing_files.length).toEqual(2);
        expect(existing_files.at(0).text()).toEqual(instructor_file_2.name);
        expect(existing_files.at(1).text()).toEqual(instructor_file_3.name);

        expect(component.num_files_currently_viewing).toEqual(1);
        expect(mfv.files_currently_viewing.length).toEqual(1);
        expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_2.name);
    });

    test('Renaming a file updates the name of the file', async () => {
        let new_file_name = "amber.cpp";
        let file_2 = wrapper.findAll('#single-instructor-file-component').at(1);
        expect(file_2.text()).toContain(instructor_file_2.name);

        file_2.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        let rename_stub = sinon.stub(instructor_file_2, 'rename').callsFake(
            (new_name: string) => call_notify_renamed(instructor_file_2, new_name)
        );

        let file_name_input = wrapper.find('#validated-input-component').find('#input');
        (<HTMLInputElement> file_name_input.element).value = new_file_name;
        file_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('.update-file-name-button').trigger('click');
        await component.$nextTick();

        expect(rename_stub.calledOnce).toBe(true);
        expect(rename_stub.getCall(0).args[0]).toEqual(new_file_name);

        let uploaded_files = wrapper.findAll('.file-name');
        expect(uploaded_files.length).toEqual(3);
        expect(uploaded_files.at(0).text()).toEqual(new_file_name);
        expect(uploaded_files.at(1).text()).toEqual(instructor_file_1.name);
        expect(uploaded_files.at(2).text()).toEqual(instructor_file_3.name);
    });

    test('File name is updated in the multi-file-viewer when a file being ' +
         'viewed is renamed',
         async () => {
        let new_file_name = "amber.cpp";
        let file_2 = wrapper.findAll('#single-instructor-file-component').at(1);
        expect(file_2.text()).toContain(instructor_file_2.name);

        sinon.stub(instructor_file_2, 'get_content').resolves("File 2 Content");
        wrapper.findAll('#single-instructor-file-component').at(1).trigger('click');
        await component.$nextTick();

        mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
        expect(component.num_files_currently_viewing).toEqual(1);
        expect(mfv.files_currently_viewing.length).toEqual(1);
        expect(mfv.files_currently_viewing[0].name).toEqual(instructor_file_2.name);

        file_2.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        let rename_stub = sinon.stub(instructor_file_2, 'rename').callsFake(
            (new_name: string) => call_notify_renamed(instructor_file_2, new_name)
        );

        let file_name_input = wrapper.find('#validated-input-component').find('#input');
        (<HTMLInputElement> file_name_input.element).value = new_file_name;
        file_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find('.update-file-name-button').trigger('click');
        await component.$nextTick();

        expect(rename_stub.getCall(0).args[0]).toEqual(new_file_name);
        expect(component.instructor_files.length).toEqual(3);
        expect(mfv.files_currently_viewing.length).toEqual(1);
        expect(mfv.files_currently_viewing[0].name).toEqual(new_file_name);

        expect(component.instructor_files[0]).toEqual(instructor_file_2);
        expect(component.instructor_files[0].name).toEqual(new_file_name);
        expect(component.instructor_files[1]).toEqual(instructor_file_1);
        expect(component.instructor_files[2]).toEqual(instructor_file_3);
    });

    test('Clicking the collapse/show button toggles the width the multi-file-viewer ' +
         'and the visibility of the uploaded instructor files',
         async () => {

        let mfv_wrapper = wrapper.find('#instructor-file-viewer-wrapper');
        let instructor_files_column = wrapper.find('#column-of-files');

        let toggle_collapse_button = wrapper.find('.collapse-show-area');
        expect(component.d_collapsed).toBe(false);
        expect(toggle_collapse_button.text()).toContain("Collapse");
        expect(instructor_files_column.element.style.display).toEqual('block');

        sinon.stub(instructor_file_1, 'get_content').resolves("File 1 Content");

        wrapper.findAll('#single-instructor-file-component').at(0).trigger('click');
        await component.$nextTick();

        mfv = <MultiFileViewer> wrapper.find({ref: 'instructor_files_viewer'}).vm;
        expect(component.num_files_currently_viewing).toEqual(1);
        expect(mfv.files_currently_viewing.length).toEqual(1);

        toggle_collapse_button.trigger('click');
        await component.$nextTick();

        expect(toggle_collapse_button.text()).toContain("Show");
        expect(component.d_collapsed).toBe(true);
        expect(instructor_files_column.element.style.display).toEqual('none');

        toggle_collapse_button.trigger('click');
        await component.$nextTick();

        expect(toggle_collapse_button.text()).toContain("Collapse");
        expect(component.d_collapsed).toBe(false);
        expect(instructor_files_column.element.style.display).toEqual('block');
    });
});
