import { mount, Wrapper } from '@vue/test-utils';

import { HttpError, InstructorFile } from 'ag-client-typescript';
const file_saver = require('file-saver');
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import SingleInstructorFile from '@/components/project_admin/instructor_files/single_instructor_file.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { set_validated_input_text, validated_input_is_valid } from '@/tests/utils';


describe('SingleInstructorFile tests', () => {
    let wrapper: Wrapper<SingleInstructorFile>;
    let component: SingleInstructorFile;
    let file_1: InstructorFile;
    let validated_input: ValidatedInput;

    let save_as_stub: sinon.SinonStub;

    beforeEach(() => {
        save_as_stub = sinon.stub(file_saver, 'saveAs');
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

        set_validated_input_text(wrapper.findComponent({ref: 'file_name'}), 'Jane.cpp');
        await component.$nextTick();

        expect(component.new_file_name).toEqual("Jane.cpp");

        wrapper.findComponent({ref: 'rename_form'}).trigger('submit');
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

        set_validated_input_text(wrapper.findComponent({ref: 'file_name'}), "Jane.cpp");
        expect(validated_input_is_valid(wrapper.findComponent({ref: 'file_name'}))).toBe(true);
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

        set_validated_input_text(wrapper.findComponent({ref: 'file_name'}), "     ");
        validated_input = <ValidatedInput> wrapper.findComponent({ref: 'file_name'}).vm;
        await component.$nextTick();

        expect(validated_input.is_valid).toBe(false);
        expect(component.new_name_is_valid).toBe(false);
        expect(wrapper.find('.update-file-name-button').element).toBeDisabled();
    });

    test('Users have the ability to delete a file', async () => {
        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().delete_requested).toBeTruthy();
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
        // tslint:disable-next-line:deprecation
        expect(save_as_stub.called).toBe(true);
    });

    test('File names must be unique - violates condition', async () => {
        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        set_validated_input_text(wrapper.findComponent({ref: 'file_name'}), "AlreadyExists.cpp");
        await component.$nextTick();

        expect(component.new_file_name).toEqual("AlreadyExists.cpp");

        sinon.stub(file_1, 'rename').returns(Promise.reject(
            new HttpError(400, {__all__: "File with this name already exists in project"})
        ));
        await wrapper.findComponent({ref: 'rename_form'}).trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
