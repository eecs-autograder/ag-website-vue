import APIErrors from '@/components/api_errors.vue';
import ExpectedStudentFileForm from '@/components/project_admin/expected_student_files/expected_student_file_form.vue';
import SingleExpectedStudentFile from '@/components/project_admin/expected_student_files/single_expected_student_file.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ExpectedStudentFiles tests', () => {
    let wrapper: Wrapper<SingleExpectedStudentFile>;
    let component: SingleExpectedStudentFile;
    let file_with_wildcard: ExpectedStudentFile;
    let file_without_wildcard: ExpectedStudentFile;

    beforeEach(() => {
        file_with_wildcard = new ExpectedStudentFile({
            pk: 1,
            project: 1,
            pattern: "filename*.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        file_without_wildcard = new ExpectedStudentFile({
            pk: 1,
            project: 1,
            pattern: "filename.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        wrapper = mount(SingleExpectedStudentFile, {
           propsData: {
               expected_student_file: file_with_wildcard,
               odd_index: true
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

    test('Successful edit of file', async () => {
        await component.$nextTick();
        let save_stub = sinon.stub(component.d_expected_student_file, 'save');

        expect(component.expected_student_file.pattern).toEqual("filename*.cpp");
        expect(component.expected_student_file.min_num_matches).toEqual(2);
        expect(component.expected_student_file.max_num_matches).toEqual(4);

        wrapper.find('.edit-file').trigger('click');
        await component.$nextTick();

        let form_wrapper = wrapper.find({ref: "form"});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "filename.cpp";
        await component.$nextTick();

        wrapper.find('#expected-student-file-form').trigger('submit.native');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
        expect(save_stub.thisValues[0].pattern).toEqual(file_without_wildcard.pattern);
        expect(save_stub.thisValues[0].min_num_matches).toEqual(
            file_without_wildcard.min_num_matches
        );
        expect(save_stub.thisValues[0].max_num_matches).toEqual(
            file_without_wildcard.max_num_matches
        );
        expect(component.editing).toBe(false);
    });

    test('error - edited filename not unique to project', async () => {
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
        sinon.stub(component.d_expected_student_file, 'save').rejects(axios_response_instance);

        expect(component.expected_student_file.pattern).toEqual("filename*.cpp");
        expect(component.expected_student_file.min_num_matches).toEqual(2);
        expect(component.expected_student_file.max_num_matches).toEqual(4);

        wrapper.find('.edit-file').trigger('click');
        await component.$nextTick();

        let form_wrapper = wrapper.find({ref: "form"});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "filename.cpp";
        await component.$nextTick();

        wrapper.find('#expected-student-file-form').trigger('submit.native');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBeGreaterThan(0);
        expect(component.editing).toBe(true);
    });

    test('Cancel edit of file', async () => {
        let save_stub = sinon.stub(component.d_expected_student_file, 'save');

        wrapper.find('.edit-file').trigger('click');
        await component.$nextTick();

        let form_wrapper = wrapper.find({ref: "form"});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "filename.cpp";
        await component.$nextTick();

        wrapper.find('.cancel-save-button').trigger('click');
        await component.$nextTick();

        expect(save_stub.callCount).toEqual(0);
        expect(component.d_expected_student_file!.pattern).toEqual(file_with_wildcard.pattern);
    });

    test('Delete file', async () => {
        let delete_stub = sinon.stub(component.expected_student_file, 'delete');

        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.callCount).toEqual(1);
        expect(component.d_delete_pending).toBe(false);
    });

    test('Cancel delete file', async () => {
        let delete_stub = sinon.stub(component.expected_student_file, 'delete');

        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-cancel-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.callCount).toEqual(0);
    });

    test("The 'Update File' button is disabled when an input value is invalid", async () => {
        wrapper.find('.edit-file').trigger('click');
        await component.$nextTick();

        let form_wrapper = wrapper.find({ref: "form"});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = " ";
        await component.$nextTick();

        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
        expect(component.pattern_is_valid).toBe(false);
    });

    test('Update expected_student_file', async () => {
        expect(component.expected_student_file).toEqual(file_with_wildcard);

        wrapper.setProps({expected_student_file: file_without_wildcard});
        await component.$nextTick();

        expect(component.expected_student_file).toEqual(file_without_wildcard);
    });
});
