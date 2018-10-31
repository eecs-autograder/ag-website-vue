import FileUpload from '@/components/file_upload.vue';
import Modal from '@/components/modal.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';

import { patch_component_method } from './mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

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

describe('File Upload tests', () => {
    let wrapper: Wrapper<FileUpload>;
    let file_upload_component: FileUpload;
    let empty_files_present_modal: Modal;
    let rows1: string[];
    let rows2: string[];
    let fake_file_1: File;
    let fake_file_2: File;

    beforeEach(() => {
        wrapper = mount(FileUpload, {
            propsData: {
                submit_button_text: "Submit Your Files!",
                file_list_label: "Your Files:"
            }
        });

        file_upload_component = wrapper.vm;
        empty_files_present_modal = <Modal> wrapper.find(
            {ref: 'empty_file_found_in_submission_attempt'}
        ).vm;
        rows1 = ['ham', 'hashbrowns', 'eggs'];
        fake_file_1 = new File([rows1.join('\n')], 'fake_file_1.cpp',  {
            lastModified: 1426305600000
        });
        rows2 = [''];
        fake_file_2 = new File([rows2.join('\n')], 'fake_file_2.cpp', {
            lastModified: 1346904000000
        });
    });

    test('File Upload props are set to values passed in', () => {
        expect(file_upload_component.d_submit_button_text).toEqual("Submit Your Files!");
        expect(file_upload_component.d_file_list_label).toEqual("Your Files:");
    });

    test('empty files are identified on upload', () => {
        expect(file_upload_component.d_empty_filenames.size).toEqual(0);
        file_upload_component.check_for_emptiness(fake_file_1);
        expect(file_upload_component.d_empty_filenames.size).toEqual(0);
        file_upload_component.check_for_emptiness(fake_file_2);
        expect(file_upload_component.d_empty_filenames.size).toEqual(1);
    });

    test('Calling clear_files() on the file upload component erases all files (empty ' +
        'and non-empty)',
         () => {
        file_upload_component.d_files.push(fake_file_1);
        file_upload_component.d_files.push(fake_file_2);

        file_upload_component.check_for_emptiness(fake_file_1);
        file_upload_component.check_for_emptiness(fake_file_2);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.size).toEqual(1);

        file_upload_component.clear_files();

        expect(file_upload_component.d_files.length).toEqual(0);
        expect(file_upload_component.d_empty_filenames.size).toEqual(0);
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

        let other: DataTransfer = <DataTransfer> {
            files: new MockFileList([fake_file_1, fake_file_2])
        };

        drag_drop_zone.trigger('dragover', {
            dataTransfer: other
        });

        drag_drop_zone.trigger('drop', {
            dataTransfer: other
        });

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.size).toEqual(1);
    });

    test('If a user uploads a file that has the same name of a file already in the ' +
         'submission, then the previously uploaded file of the same name is replaced by the ' +
         'new file',
         () => {
        let rows3 = ['toast', 'jam'];
        let fake_file_3 = new File([rows3.join('\n')], 'fake_file_1.cpp', {
            lastModified: 1408593600000
        });

        let rows4 = ['witch', 'ghost'];
        let fake_file_4 = new File([rows4.join('\n')], 'fake_file_2.cpp', {
            lastModified: 336542400000
        });

        let mock_event = {
            target: {
                files: new MockFileList([fake_file_3, fake_file_4])
            }
        };

        console.log(fake_file_4.lastModified);

        expect(fake_file_1.name).toEqual(fake_file_3.name);
        expect(fake_file_1.lastModified).not.toEqual(fake_file_3.lastModified);
        expect(fake_file_2.name).toEqual(fake_file_4.name);
        expect(fake_file_2.lastModified).not.toEqual(fake_file_4.lastModified);

        file_upload_component.d_files.push(fake_file_1);
        file_upload_component.d_files.push(fake_file_2);
        file_upload_component.check_for_emptiness(fake_file_1);
        file_upload_component.check_for_emptiness(fake_file_2);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.size).toEqual(1);
        expect(file_upload_component.d_files[0].lastModified).toEqual(fake_file_1.lastModified);
        expect(file_upload_component.d_files[1].lastModified).toEqual(fake_file_2.lastModified);

        file_upload_component.add_files_from_button(mock_event);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.size).toEqual(0);
        expect(file_upload_component.d_files[0].lastModified).toEqual(fake_file_3.lastModified);
        expect(file_upload_component.d_files[1].lastModified).toEqual(fake_file_4.lastModified);
    });

    test('Clicking the add file button allows you to upload one or more files', () => {
        let file_input_element = wrapper.find({ref: 'file_input'});
        let mock_add_files = jest.fn();
        let mock_event = {
            target: {
                files: new MockFileList([fake_file_1, fake_file_2])
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
        expect(file_upload_component.d_files[0].name).toEqual(fake_file_1.name);
        expect(file_upload_component.d_files[0].lastModified).toEqual(fake_file_1.lastModified);
        expect(file_upload_component.d_files[1].name).toEqual(fake_file_2.name);
        expect(file_upload_component.d_files[1].lastModified).toEqual(fake_file_2.lastModified);
    });

    test('add_files_from_button throws error when event.target is null', () => {
        let mock_event = {
            target: null
        };

        // bubbles: true,
        // cancelBubble: false,
        // cancelable: true,
        // composed: true

        expect(() => file_upload_component.add_files_from_button(mock_event)).toThrow(
            'Target is null'
        );
    });

    test('add_files_from_button throws an error when event.target.files is null', () => {
        let mock_event = {
            target: {
                files: null,
            }
        };

        expect(() => file_upload_component.add_files_from_button(mock_event)).toThrow(
            'Files property of event target is unexpectedly null'
        );
    });

    test('add_dropped_files throws an error when event.target is null', () => {
        let mock_event = {
            target: null,
            preventDefault: () => {},
            stopPropagation: () => {}
        };

        expect(() => file_upload_component.add_dropped_files(mock_event)).toThrow(
            'Target is null'
        );
    });

    test("Users can delete files after they've been updated", () => {
        file_upload_component.d_files.push(fake_file_1);
        file_upload_component.d_files.push(fake_file_2);

        file_upload_component.check_for_emptiness(fake_file_1);
        file_upload_component.check_for_emptiness(fake_file_2);

        expect(file_upload_component.d_files.length).toEqual(2);
        expect(file_upload_component.d_empty_filenames.size).toEqual(1);

        let file_delete_buttons = wrapper.findAll('.remove-file-button');
        file_delete_buttons.at(0).trigger('click');

        expect(file_upload_component.d_files.length).toEqual(1);
        expect(file_upload_component.d_empty_filenames.has(fake_file_2.name)).toBe(true);

        file_delete_buttons = wrapper.findAll('.remove-file-button');
        file_delete_buttons.at(0).trigger('click');

        expect(file_upload_component.d_files.length).toEqual(0);
        expect(file_upload_component.d_empty_filenames.size).toEqual(0);
    });

    test('Users can successfully submit files when all files are non-empty', () => {
        let rows3 = ['oatmeal', 'toast', 'jam'];
        let fake_file_3 = new File([rows3.join('\n')], 'fake_file_3.cpp');

        let final_submit_button = wrapper.find('.submit-files-button');

        file_upload_component.d_files.push(fake_file_1);
        file_upload_component.d_files.push(fake_file_3);

        file_upload_component.check_for_emptiness(fake_file_1);
        file_upload_component.check_for_emptiness(fake_file_3);

        final_submit_button.trigger('click');

        expect(wrapper.emitted().submit_click.length).toBe(1);
        expect(empty_files_present_modal.is_open).toBe(false);
    });
});

describe("Concerning the 'empty files present in submission' modal", () => {
    let wrapper: Wrapper<FileUpload>;
    let file_upload_component: FileUpload;
    let final_submit_button: Wrapper<Vue>;
    let empty_files_present_modal: Modal;
    let rows1: string[];
    let rows2: string[];
    let fake_file_1: File;
    let fake_file_2: File;

    beforeEach(() => {
        wrapper = mount(FileUpload);
        file_upload_component = wrapper.vm;
        final_submit_button = wrapper.find('.submit-files-button');

        rows1 = ['ham', 'hashbrowns', 'eggs'];
        fake_file_1 = new File([rows1.join('\n')], 'fake_file_1.cpp');

        rows2 = [];
        fake_file_2 = new File([rows2.join('\n')], 'fake_file_2.cpp');

        file_upload_component.d_files.push(fake_file_1);
        file_upload_component.d_files.push(fake_file_2);

        file_upload_component.check_for_emptiness(fake_file_1);
        file_upload_component.check_for_emptiness(fake_file_2);

        expect(file_upload_component.d_empty_filenames.size).toBeGreaterThan(0);

        empty_files_present_modal = <Modal> wrapper.find(
            {ref: 'empty_file_found_in_submission_attempt'}
        ).vm;

        expect(empty_files_present_modal.is_open).toBe(false);

        final_submit_button.trigger('click');

        expect(empty_files_present_modal.is_open).toBe(true);
    });

    test('You can choose to submit despite having one or more empty files', () => {
        let submit_despite_empty_files_button = wrapper.find(
            '.submit-despite-empty-files-button'
        );

        submit_despite_empty_files_button.trigger('click');

        expect(wrapper.emitted().submit_click.length).toBe(1);
        expect(empty_files_present_modal.is_open).toBe(false);
    });

    test('You can choose not to submit after receiving the warning modal concerning ' +
         'empty files in your submission',
         () => {
        let cancel_submission_button = wrapper.find(
              '.cancel-submission-process-button'
        );

        cancel_submission_button.trigger('click');

        expect(wrapper.emitted('submit_click')).not.toBeTruthy();
        expect(empty_files_present_modal.is_open).toBe(false);
    });
});
