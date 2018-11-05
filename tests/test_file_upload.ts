import FileUpload from '@/components/file_upload.vue';
import Modal from '@/components/modal.vue';

import { config, mount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';

import { array_has_unique } from '@/utils';

import { patch_component_method } from './mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}

class MockFileList implements FileList {
    mock_files: File[];

    constructor(files: File[]) {
        this.mock_files = files;
    }

    item(index: number) {
        return this.mock_files[index];
    }

    get length() {
        return this.mock_files.length;
    }

    [Symbol.iterator]() {
        return this.mock_files[Symbol.iterator]();
    }

    [index: number]: File;
}

describe('File Upload tests not involving the empty files modal', () => {
    let wrapper: Wrapper<FileUpload>;
    let file_upload_component: FileUpload;
    let empty_files_present_modal: Modal;
    let empty_file: File;
    let file_1: File;
    let file_2: File;
    let file_3: File;

    beforeEach(() => {
        wrapper = mount(FileUpload, {
            slots: {
                file_list_label: `<span>Files You've Uploaded</span>`,
                upload_button_text: `<span>Submit your files</span>`
            }
        });

        file_upload_component = wrapper.vm;
        file_1 = new File([['ham', 'hashbrowns', 'eggs'].join('\n')], 'file_1.cpp',  {
            lastModified: 1426305600000
        });
        empty_file = new File([''], 'file_2.cpp', {
            lastModified: 1346904000000
        });
        file_2 = new File([['oatmeal', 'toast', 'jam'].join('\n')], 'file_1.cpp');
        file_3 = new File([['witch', 'ghost'].join('\n')], 'file_2.cpp', {
            lastModified: 336542400000
        });
    });

    test('The file upload component can be customized using slots', () => {
        let name_of_file_label = wrapper.find('.name-of-file-label');
        expect(name_of_file_label.text()).toEqual("Files You've Uploaded");
        let upload_files_button = wrapper.find('.upload-files-button');
        expect(upload_files_button.text()).toEqual("Submit your files");
    });

    test('Empty files are identified on upload', () => {
        expect(file_upload_component.d_empty_filenames.length).toEqual(0);
        file_upload_component.check_for_emptiness(file_1);
        expect(file_upload_component.d_empty_filenames.length).toEqual(0);
        file_upload_component.check_for_emptiness(empty_file);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);
    });

    test('Calling clear_files() on the file upload component erases all files (empty ' +
        'and non-empty)',
         () => {
        file_upload_component.d_files.push(file_1);
        file_upload_component.d_files.push(empty_file);

        file_upload_component.check_for_emptiness(file_1);
        file_upload_component.check_for_emptiness(empty_file);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);

        file_upload_component.clear_files();

        expect(file_upload_component.d_files.length).toEqual(0);
        expect(file_upload_component.d_empty_filenames.length).toEqual(0);
    });

    test('Dragging a file over the drag and drop area causes the area to become ' +
        'highlighted',
         () => {
        let drag_drop_zone = wrapper.find('#drag-and-drop');

        drag_drop_zone.trigger('dragenter');

        expect(file_upload_component.d_files_dragged_over).toBe(true);
        expect(drag_drop_zone.classes()).toContain('drag-and-drop-hover');

        drag_drop_zone.trigger('dragleave');

        expect(file_upload_component.d_files_dragged_over).toBe(false);
        expect(drag_drop_zone.classes()).not.toContain('drag-and-drop-hover');
    });

    test('Dragging and dropping file over drop area uploads the file', () => {
        let drag_drop_zone = wrapper.find('#drag-and-drop');
        // tslint:disable-next-line:no-object-literal-type-assertion
        let mock_datatransfer: DataTransfer = <DataTransfer> <unknown> {
            files: new MockFileList([file_1, empty_file])
        };

        drag_drop_zone.trigger('dragover', {
            dataTransfer: mock_datatransfer
        });

        drag_drop_zone.trigger('drop', {
            dataTransfer: mock_datatransfer
        });

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);
    });

    test('If a user uploads a file that has the same name of a file already in the ' +
         'upload, then the previously uploaded file of the same name is replaced by the ' +
         'new file',
         () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        let mock_event = <HTMLInputEvent> <unknown> {
            target: {
                files: new MockFileList([file_2, file_3])
            }
        };

        expect(file_1.name).toEqual(file_2.name);
        expect(file_1.lastModified).not.toEqual(file_2.lastModified);
        expect(empty_file.name).toEqual(file_3.name);
        expect(empty_file.lastModified).not.toEqual(file_3.lastModified);

        file_upload_component.d_files.push(file_1);
        file_upload_component.d_files.push(empty_file);
        file_upload_component.check_for_emptiness(file_1);
        file_upload_component.check_for_emptiness(empty_file);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);
        expect(file_upload_component.d_files[0].lastModified).toEqual(file_1.lastModified);
        expect(file_upload_component.d_files[1].lastModified).toEqual(empty_file.lastModified);

        file_upload_component.add_files_from_button(mock_event);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.length).toEqual(0);
        expect(file_upload_component.d_files[0].lastModified).toEqual(file_2.lastModified);
        expect(file_upload_component.d_files[1].lastModified).toEqual(file_3.lastModified);
    });

    test('Replacing an empty file with an empty file of the same name', () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        let mock_html_input_event = <HTMLInputEvent> <unknown> {
            target: {
                files: new MockFileList([empty_file])
            }
        };

        file_upload_component.add_files_from_button(mock_html_input_event);
        expect(file_upload_component.d_files.length).toEqual(1);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);

        file_upload_component.add_files_from_button(mock_html_input_event);
        expect(file_upload_component.d_files.length).toEqual(1);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);

        let mock_drop_event = <DragEvent> {
            // tslint:disable-next-line:no-object-literal-type-assertion
            dataTransfer: <DataTransfer> <unknown> {
                files: new MockFileList([empty_file])
            },

            preventDefault: () => {},
            stopPropagation: () => {}
        };

        file_upload_component.add_dropped_files(mock_drop_event);

        expect(file_upload_component.d_files.length).toEqual(1);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);
    });

    test('Clicking the add file button allows you to upload one or more files', () => {
        let file_input_element = wrapper.find({ref: 'file_input'});
        let mock_add_files = jest.fn();
        // tslint:disable-next-line:no-object-literal-type-assertion
        let mock_event = <HTMLInputEvent> <unknown> {
            target: {
                files: new MockFileList([file_1, empty_file])
            }
        };

        patch_component_method(wrapper, "add_files_from_button",
                               mock_add_files, () => {
           file_input_element.trigger('change');
           expect(mock_add_files.mock.calls.length).toBe(1);
           expect(
               mock_add_files.mock.calls[0][0].target.files instanceof FileList
           ).toBe(true);
        });

        file_upload_component.add_files_from_button(mock_event);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_files[0].name).toEqual(file_1.name);
        expect(file_upload_component.d_files[0].lastModified).toEqual(file_1.lastModified);
        expect(file_upload_component.d_files[1].name).toEqual(empty_file.name);
        expect(file_upload_component.d_files[1].lastModified).toEqual(empty_file.lastModified);
    });

    test('add_files_from_button throws error when event.target is null', () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        let mock_event = <HTMLInputEvent> <unknown> {
            target: null
        };

        expect(() => file_upload_component.add_files_from_button(mock_event)).toThrow(
            'Target is null'
        );
    });

    test('add_files_from_button throws an error when event.target.files is null', () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        let mock_event = <HTMLInputEvent> {
            target: {
                files: null,
            }
        };

        expect(() => file_upload_component.add_files_from_button(mock_event)).toThrow(
            'Files property of event target is unexpectedly null'
        );
    });

    test('add_dropped_files throws an error when event.target is null', () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        let mock_event = <DragEvent> {
            target: null,
            preventDefault: () => {},
            stopPropagation: () => {}
        };

        expect(() => file_upload_component.add_dropped_files(mock_event)).toThrow(
            'Target is null'
        );
    });

    test("Users can delete files after they've been updated", () => {
        file_upload_component.d_files.push(file_1);
        file_upload_component.d_files.push(empty_file);

        file_upload_component.check_for_emptiness(file_1);
        file_upload_component.check_for_emptiness(empty_file);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.length).toEqual(1);

        let file_delete_buttons = wrapper.findAll('.remove-file-button');
        file_delete_buttons.at(0).trigger('click');

        expect(file_upload_component.d_files.length).toEqual(1);

        expect(array_has_unique(file_upload_component.d_empty_filenames,
                                empty_file.name)).toBe(true);

        file_delete_buttons = wrapper.findAll('.remove-file-button');
        file_delete_buttons.at(0).trigger('click');

        expect(file_upload_component.d_files.length).toEqual(0);
        expect(file_upload_component.d_empty_filenames.length).toEqual(0);
    });

    test('Users can successfully upload files when all files are non-empty', () => {
        let final_upload_button = wrapper.find('.upload-files-button');
        empty_files_present_modal = <Modal> wrapper.find(
            {ref: 'empty_file_found_in_upload_attempt'}
        ).vm;

        file_upload_component.d_files.push(file_1);
        file_upload_component.d_files.push(file_2);

        file_upload_component.check_for_emptiness(file_1);
        file_upload_component.check_for_emptiness(file_2);

        final_upload_button.trigger('click');

        expect(wrapper.emitted().upload_files.length).toBe(1);
        expect(empty_files_present_modal.is_open).toBe(false);
    });
});

describe("File Upload tests concerning the empty files modal", () => {
    let wrapper: Wrapper<FileUpload>;
    let file_upload_component: FileUpload;
    let final_upload_button: Wrapper<Vue>;
    let empty_files_present_modal: Modal;
    let file_1: File;
    let empty_file: File;

    beforeEach(() => {
        wrapper = mount(FileUpload);
        file_upload_component = wrapper.vm;
        final_upload_button = wrapper.find('.upload-files-button');

        file_1 = new File([['ham', 'hashbrowns', 'eggs'].join('\n')], 'file_1.cpp');

        empty_file = new File([''], 'file_2.cpp');

        file_upload_component.d_files.push(file_1);
        file_upload_component.d_files.push(empty_file);

        file_upload_component.check_for_emptiness(file_1);
        file_upload_component.check_for_emptiness(empty_file);

        expect(file_upload_component.d_empty_filenames.length).toBeGreaterThan(0);

        empty_files_present_modal = <Modal> wrapper.find(
            {ref: 'empty_file_found_in_upload_attempt'}
        ).vm;

        expect(empty_files_present_modal.is_open).toBe(false);

        final_upload_button.trigger('click');

        expect(empty_files_present_modal.is_open).toBe(true);
    });

    test('You can choose to upload despite having one or more empty files', () => {
        let upload_despite_empty_files_button = wrapper.find(
            '.upload-despite-empty-files-button'
        );

        upload_despite_empty_files_button.trigger('click');

        expect(wrapper.emitted().upload_files.length).toBe(1);
        expect(empty_files_present_modal.is_open).toBe(false);
    });

    test('You can choose not to upload after receiving the warning modal concerning ' +
         'empty files in your upload',
         () => {
        let cancel_upload_button = wrapper.find(
              '.cancel-upload-process-button'
        );

        cancel_upload_button.trigger('click');

        expect(wrapper.emitted('upload_click')).not.toBeTruthy();
        expect(empty_files_present_modal.is_open).toBe(false);
    });
});
