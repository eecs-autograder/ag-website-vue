import { mount, Wrapper } from '@vue/test-utils';

import { HttpError, InstructorFile } from 'ag-client-typescript';
import * as FileSaver from 'file-saver';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import SingleInstructorFile from '@/components/project_admin/instructor_files/single_instructor_file.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { set_validated_input_text, validated_input_is_valid } from '@/tests/utils';


jest.mock('file-saver');

describe('SingleInstructorFile tests', () => {
    let wrapper: Wrapper<SingleInstructorFile>;
    let component: SingleInstructorFile;
    let file_1: InstructorFile;
    let validated_input: ValidatedInput;

    beforeEach(() => {
        file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "Tarzan.cpp",
            size: 2,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        wrapper = mount(SingleInstructorFile, {
            propsData: {
                file: file_1
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Users have the ability to rename a file', async () => {
        let rename_stub = sinon.stub(file_1, 'rename');

        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        expect(component.new_file_name).toEqual(component.file.name);
        expect(component.editing).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'file_name'}), 'Jane.cpp');
        await component.$nextTick();

        expect(component.new_file_name).toEqual("Jane.cpp");

        wrapper.find({ref: 'rename_form'}).trigger('submit');
        await component.$nextTick();

        expect(rename_stub.calledOnce).toBe(true);
        expect(rename_stub.calledWith("Jane.cpp")).toBe(true);
        expect(component.editing).toBe(false);
    });

    test('Cancel renaming file', async () => {
        let rename_stub = sinon.stub(file_1, 'rename');

        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        expect(component.new_file_name).toEqual(component.file.name);
        expect(component.editing).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'file_name'}), "Jane.cpp");
        expect(validated_input_is_valid(wrapper.find({ref: 'file_name'}))).toBe(true);
        expect(component.new_file_name).toEqual("Jane.cpp");

        wrapper.find('.update-file-name-cancel-button').trigger('click');
        await component.$nextTick();

        expect(rename_stub.callCount).toEqual(0);
        expect(component.file.name).toEqual(file_1.name);
        expect(component.editing).toBe(false);
    });

    test('Users cannot make an empty string the new name of a file', async () => {
        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        expect(component.new_file_name).toEqual(component.file.name);
        expect(component.editing).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'file_name'}), "     ");
        validated_input = <ValidatedInput> wrapper.find({ref: 'file_name'}).vm;
        await component.$nextTick();

        expect(validated_input.is_valid).toBe(false);
        expect(component.new_name_is_valid).toBe(false);
        expect(wrapper.find('.update-file-name-button').is('[disabled]')).toBe(true);
    });

    test('Users have the ability to delete a file', async () => {
        let delete_stub = sinon.stub(file_1, 'delete');
        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        expect(delete_stub.thisValues[0]).toEqual(file_1);
    });

    test('Users have the ability to cancel the process of deleting a file', async () => {
        let delete_stub = sinon.stub(file_1, 'delete');

        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-cancel-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.callCount).toEqual(0);
    });

    test('API errors handled on delete', async () => {
        sinon.stub(file_1, 'delete').rejects(new HttpError(403, "nope"));
        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'delete_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Users have the ability to download a file', async () => {
        let get_content_stub = sinon.stub(file_1, 'get_content');
        get_content_stub.callsFake((on_download_progress) => {
            // tslint:disable-next-line: no-object-literal-type-assertion
            on_download_progress!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 6});
            return Promise.resolve(new Blob(['File Contents']));
        });

        wrapper.find('.download-file').trigger('click');
        await component.$nextTick();

        expect(get_content_stub.calledOnce).toBe(true);
        expect(FileSaver.saveAs).toBeCalled();
    });

    test('File names must be unique - violates condition', async () => {
        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        set_validated_input_text(wrapper.find({ref: 'file_name'}), "AlreadyExists.cpp");
        await component.$nextTick();

        expect(component.new_file_name).toEqual("AlreadyExists.cpp");

        sinon.stub(file_1, 'rename').returns(Promise.reject(
            new HttpError(400, {__all__: "File with this name already exists in project"})
        ));
        wrapper.find({ref: 'rename_form'}).trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
