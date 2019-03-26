import APIErrors from '@/components/api_errors.vue';
import SingleInstructorFile from '@/components/instructor_files/single_instructor_file.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { InstructorFile } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as FileSaver from 'file-saver';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

jest.mock('file-saver');

describe('SingleInstructorFile tests', () => {
    let wrapper: Wrapper<SingleInstructorFile>;
    let component: SingleInstructorFile;
    let file_1: InstructorFile;
    let original_match_media: (query: string) => MediaQueryList;
    let validated_input: ValidatedInput;

    beforeEach(() => {
        file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "Tarzan.cpp",
            size: 2,
            last_modified: "2019-02-15T20:44:30.534985Z"
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(SingleInstructorFile, {
            propsData: {
                file: file_1
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

    test('Users have the ability to rename a file', async () => {
        let rename_stub = sinon.stub(file_1, 'rename');

        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        expect(component.new_file_name).toEqual(component.file.name);
        expect(component.editing).toBe(true);

        let file_name_input = wrapper.find({ref: 'file_name'}).find('#input');
        (<HTMLInputElement> file_name_input.element).value = "Jane.cpp";
        file_name_input.trigger('input');
        await component.$nextTick();

        expect(component.new_file_name).toEqual("Jane.cpp");

        wrapper.find('.update-file-name-button').trigger('click');
        await component.$nextTick();

        expect(rename_stub.calledOnce).toBe(true);
        expect(rename_stub.calledWith("Jane.cpp")).toBe(true);
        expect(component.editing).toBe(false);
    });

    test('Users can choose to cancel the action of renaming a file after entering a ' +
         'different name but before pressing "update"',
         async () => {
        let rename_stub = sinon.stub(file_1, 'rename');

        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        expect(component.new_file_name).toEqual(component.file.name);
        expect(component.editing).toBe(true);

        let file_name_input = wrapper.find({ref: 'file_name'}).find('#input');
        (<HTMLInputElement> file_name_input.element).value = "Jane.cpp";
        file_name_input.trigger('input');
        validated_input = <ValidatedInput> wrapper.find({ref: 'file_name'}).vm;
        await component.$nextTick();

        expect(validated_input.is_valid).toBe(true);
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

        let file_name_input = wrapper.find({ref: 'file_name'}).find('#input');
        (<HTMLInputElement> file_name_input.element).value = "       ";
        file_name_input.trigger('input');
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

    test('Users have the ability to download a file', async () => {
        let get_content_stub = sinon.stub(file_1, 'get_content');
        get_content_stub.resolves("File Contents");

        wrapper.find('.download-file').trigger('click');
        await component.$nextTick();

        expect(get_content_stub.calledOnce).toBe(true);
        expect(FileSaver.saveAs).toBeCalled();
    });

    test('Users have the ability to view a file', async () => {
        wrapper.find('#single-instructor-file-component').trigger('click');
        await component.$nextTick();

        expect(wrapper.emitted().open_file.length).toEqual(1);
    });

    test('File names must be unique - violates condition', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "File with this name already exists in project"
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        wrapper.find('.edit-file-name').trigger('click');
        await component.$nextTick();

        let file_name_input = wrapper.find({ref: 'file_name'}).find('#input');
        (<HTMLInputElement> file_name_input.element).value = "AlreadyExists.cpp";
        file_name_input.trigger('input');
        await component.$nextTick();

        expect(component.new_file_name).toEqual("AlreadyExists.cpp");

        sinon.stub(file_1, 'rename').returns(Promise.reject(axios_response_instance));
        wrapper.find('.update-file-name-button').trigger('click');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
