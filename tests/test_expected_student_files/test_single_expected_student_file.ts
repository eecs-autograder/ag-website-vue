import ExpectedStudentFileForm
    from '@/components/expected_student_files/expected_student_file_form.vue';
import SingleExpectedStudentFile from '@/components/expected_student_files/single_expected_student_file.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile } from 'ag-client-typescript';
import * as sinon from "sinon";
import { createDeflateRaw } from 'zlib';
import clearAllMocks = jest.clearAllMocks;

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
    sinon.restore();
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

    test.only('Successful edit of file', async () => {
        fail("save() is receiving undefined as argument");
        let fake_update = sinon.fake();
        sinon.replace(component.d_expected_student_file, 'save', fake_update);

        expect(component.expected_student_file.pattern).toEqual("filename*.cpp");
        expect(component.expected_student_file.min_num_matches).toEqual(2);
        expect(component.expected_student_file.max_num_matches).toEqual(4);

        wrapper.find('.edit-file').trigger('click');
        await component.$nextTick();

        let form_wrapper = wrapper.find({ref: "form"});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "filename.cpp";
        await component.$nextTick();

        form_component.submit_form();
        await component.$nextTick();
        await component.$nextTick();

        // This works
        expect(fake_update.callCount).toEqual(1);

        // This doesn't
        // apparently it's getting called with undefined...
        // expect(fake_update.getCall(0).args[0]
        // ).toEqual({
        //     pk: 1,
        //     project: 1,
        //     pattern: "filename.cpp",
        //     min_num_matches: 1,
        //     max_num_matches: 1,
        //     last_modified: "now"
        // });
    });

    test('Cancel edit of file', async () => {
        fail("Max call stack size exceeded");

        let fake_update = sinon.fake();
        sinon.replace(file_with_wildcard, 'save', fake_update);

        wrapper.find('.edit-file').trigger('click');

        let form_wrapper = wrapper.find({ref: "form"});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;

        form_component.d_expected_student_file.pattern = "filename.cpp";
        await component.$nextTick();

        wrapper.find('.cancel-update-button').trigger('click');
        await component.$nextTick();

        expect(fake_update.callCount).toEqual(0);
        expect(component.d_expected_student_file.pattern).toEqual("filename*.cpp");
    });

    test('Delete file', async () => {
        let fake_delete = sinon.fake();
        sinon.replace(file_with_wildcard, 'delete', fake_delete);

        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(fake_delete.callCount).toEqual(1);
    });

    test('Cancel delete file', async () => {
        let fake_delete = sinon.fake();
        sinon.replace(file_with_wildcard, 'delete', fake_delete);

        wrapper.find('.delete-file').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-cancel-button').trigger('click');
        await component.$nextTick();

        expect(fake_delete.callCount).toEqual(0);
    });
});
