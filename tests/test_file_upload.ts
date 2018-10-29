import FileUpload from '@/components/file_upload.vue';
import Modal from '@/components/modal.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('File Upload tests', () => {

    test('File Upload props are set to values passed in', () => {
        const component = {
            template:  `<file_upload ref="file_upload"
                                    submit_button_text="Submit Your Files!"
                                    file_list_label="Your Files:">
                        </file_upload>`,
            components: {
                'file_upload': FileUpload
            }
        };

        const wrapper = mount(component);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;
        let empty_files_present_modal = file_upload.find(
            {ref: 'empty_file_found_in_submission_attempt'}
        );
        expect(file_upload_component.d_submit_button_text).toEqual("Submit Your Files!");
        expect(file_upload_component.d_file_list_label).toEqual("Your Files:");
        expect(empty_files_present_modal.exists()).toBe(true);
    });

    test('empty files are identified on upload', () => {
        @Component({
            template: `<div><file_upload ref="file_upload"></file_upload></div>`,
            components: {
                'file_upload': FileUpload
            }
        })

        class WrapperComponent extends Vue {
            blob1 = new Blob([""], { type: 'text/html' });
            fake_file1 = new File([this.blob1], "Hi");

            rows = ['ham', 'hashbrowns', 'eggs'];
            fake_file2 = new File([this.rows.join('\n')], 'breakfast.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;

        expect(file_upload_component.d_empty_filenames.size).toEqual(0);
        file_upload_component.check_for_emptiness(wrapper.vm.fake_file1);
        expect(file_upload_component.d_empty_filenames.size).toEqual(1);
        file_upload_component.check_for_emptiness(wrapper.vm.fake_file2);
        expect(file_upload_component.d_empty_filenames.size).toEqual(1);
    });

    test('Calling clear_files() on the file upload component erases all files (empty ' +
         'and non-empty)',
         async () => {

         @Component({
             template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
             components: {
                 'file_upload': FileUpload
             }
         })

         class WrapperComponent extends Vue {
             rows1 = ['ham', 'hashbrowns', 'eggs'];
             fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');

             rows2 = [];
             fake_file_2 = new File([this.rows2.join('\n')], 'fake_file_2.cpp');
         }

         const wrapper = mount(WrapperComponent);
         let file_upload_component = <FileUpload> wrapper.find({ref: 'file_upload'}).vm;

         file_upload_component.d_files.push(wrapper.vm.fake_file_1);
         file_upload_component.d_files.push(wrapper.vm.fake_file_2);

         file_upload_component.check_for_emptiness(wrapper.vm.fake_file_1);
         file_upload_component.check_for_emptiness(wrapper.vm.fake_file_2);

         console.log(file_upload_component.d_files[0]);
         console.log(file_upload_component.d_empty_filenames);

         expect(file_upload_component.d_files.length).toEqual(2);
         expect(file_upload_component.d_empty_filenames.size).toEqual(1);

         file_upload_component.clear_files();

         expect(file_upload_component.d_files.length).toEqual(0);
         expect(file_upload_component.d_empty_filenames.size).toEqual(0);
    });

    test('Dragging a file over the drag and drop area causes the area to become ' +
              'highlighted',
         async () => {
        const component = {
            template:  `<file_upload ref="file_upload"
                                    submit_button_text="Submit Your Files!"
                                    file_list_label="Your Files:">
                        </file_upload>`,
            components: {
                'file_upload': FileUpload
            }
        };

        const wrapper = mount(component);
        let file_upload_component = <FileUpload> wrapper.find({ref: 'file_upload'}).vm;

        const rows = ['ham', 'hashbrowns', 'eggs'];
        const file = new File([rows.join('\n')], 'breakfast.cpp');

        let ev = new Event('drop');

        let drag_drop_zone = wrapper.find('#drag-and-drop');

        drag_drop_zone.trigger('dragenter');

        expect(file_upload_component.d_files_dragged_over).toBe(true);
        expect(drag_drop_zone.classes()).toContain('drag-and-drop-hover');

        drag_drop_zone.trigger('dragleave');

        expect(file_upload_component.d_files_dragged_over).toBe(false);
        expect(drag_drop_zone.classes()).not.toContain('drag-and-drop-hover');
    });

    test.only('Dragging and dropping file over drop area uploads the file', () => {

        @Component({
            template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
            components: {
                'file_upload': FileUpload
            }
        })

        class WrapperComponent extends Vue {
            rows1 = ['ham', 'hashbrowns', 'eggs'];
            fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload_component = <FileUpload> wrapper.find({ref: 'file_upload'}).vm;

        let drag_drop_zone = wrapper.find('#drag-and-drop');

        // How to call this with a DragEvent and event.dataTransfer set to the file?
        drag_drop_zone.trigger('dragover');

        // drag_drop_zone.element.addEventListener('drop', )

        let drag_file_event = new DragEvent('dragover', {
            // dataTransfer: {
            //     files: Array.isArray(files) ? files : [wrapper.vm.fake_file_1];
            // }
        });

        // drag_file_event.dataTransfer.setData(wrapper.vm.fake_file_1);

        // files is a read only property
        // drag_file_event.dataTransfer.files = [wrapper.vm.fake_file_1];

        let custom_datatransfer_object = {
            files: [wrapper.vm.fake_file_1]
        };

        let custom_drag_event = {
            dataTransfer: custom_datatransfer_object
        };

        patch_object_prototype(DragEvent, custom_drag_event, () => {
            drag_drop_zone.trigger(custom_drag_event);
        });



    });


    // When the user commits the change explicitly (e.g. by selecting a value from a <select>'s '
    // 'dropdown with a mouse click, by selecting a date from a date picker for
    // <input type="date">, by selecting a file in the file picker for <input type="file">, etc.);

    test.skip('Clicking the add file button allows you to upload one or more files', () => {
        @Component({
            template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
            components: {
                'file_upload': FileUpload
            }
        })

        class WrapperComponent extends Vue {
            rows1 = ['ham', 'hashbrowns', 'eggs'];
            fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;
        let file_upload_button = file_upload.find('#add-files');
        let file_input_element = file_upload.find({ref: 'file_input'});

        let num_input_click_events = 0;
        let handle_click_event = () => {
            ++num_input_click_events;
        };

        file_input_element.element.addEventListener('click', handle_click_event);

        file_upload_button.trigger('click');

        expect(num_input_click_events).toEqual(1);

        let input_value_has_changed = false;
        let handle_input_change_event = (event: Event) => {
            input_value_has_changed = true;
            // event.target.files = [wrapper.vm.fake_file];
        };

        file_input_element.element.addEventListener('change', handle_input_change_event);

        expect(input_value_has_changed).toBe(false);
        // update value somehow

        // console.log(file_input_element.files);// undefined

        let file_input = <HTMLInputElement> wrapper.find('input[type="file"]');
        // file_input.setValue('some_value');

        // file_input.element.select = wrapper.vm.fake_file_1; // select DNE on HTMLElement

        file_input_element.trigger('change');

        expect(input_value_has_changed).toBe(true);

        // file_input_element.trigger('change', {
        //     target: {
        //         files: [
        //             'fake_file.cpp'
        //         ]
        //     }
        // });

        // expect that one of the data structures got updated

        // console.log(file_upload_component.d_files);
        // console.log(file_upload_component.d_empty_filenames);

    });

    test("Users can delete files after they've been updated",  async () => {
        @Component({
            template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
            components: {
                'file_upload': FileUpload
            }
        })

        class WrapperComponent extends Vue {
            rows1 = ['ham', 'hashbrowns', 'eggs'];
            fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');

            rows2 = ['oatmeal', 'toast', 'jam'];
            fake_file_2 = new File([this.rows2.join('\n')], 'fake_file_2.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;

        file_upload_component.d_files.push(wrapper.vm.fake_file_1);
        file_upload_component.d_files.push(wrapper.vm.fake_file_2);

        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_1);
        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_2);

        expect(file_upload_component.d_files.length).toEqual(2);

        let file_delete_buttons = file_upload.findAll('.remove-file-button');

        file_delete_buttons.at(0).trigger('click');

        expect(file_upload_component.d_files.length).toEqual(1);
        await file_upload_component.$nextTick();

        file_delete_buttons =  file_upload.findAll('.remove-file-button');

        file_delete_buttons.at(0).trigger('click');
        await file_upload_component.$nextTick();

        expect(file_upload_component.d_files.length).toEqual(0);

    });

    test('You can successfully submit when all files are non-empty', () => {
        @Component({
            template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
            components: {
                'file_upload': FileUpload
            }
        })

        class WrapperComponent extends Vue {
            rows1 = ['ham', 'hashbrowns', 'eggs'];
            fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');

            rows2 = ['oatmeal', 'toast', 'jam'];
            fake_file_2 = new File([this.rows2.join('\n')], 'fake_file_2.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;
        let final_submit_button = file_upload.find('.submit-files-button');
        let empty_files_present_modal = <Modal> file_upload.find(
            {ref: 'empty_file_found_in_submission_attempt'}
        ).vm;

        file_upload_component.d_files.push(wrapper.vm.fake_file_1);
        file_upload_component.d_files.push(wrapper.vm.fake_file_2);

        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_1);
        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_2);

        final_submit_button.trigger('click');

        expect(empty_files_present_modal.is_open).toBe(false);

        expect(file_upload.emitted().submit_click.length).toBe(1);

        expect(empty_files_present_modal.is_open).toBe(false);
    });

    test('Attempting to submit one or more empty files prompts a warning modal', () => {
        @Component({
            template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
            components: {
                'file_upload': FileUpload
            }
        })

        class WrapperComponent extends Vue {
            rows1 = ['ham', 'hashbrowns', 'eggs'];
            fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');

            rows2 = [];
            fake_file_2 = new File([this.rows2.join('\n')], 'fake_file_2.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;
        let final_submit_button = file_upload.find('.submit-files-button');
        let empty_files_present_modal = <Modal> file_upload.find(
            {ref: 'empty_file_found_in_submission_attempt'}
        ).vm;

        file_upload_component.d_files.push(wrapper.vm.fake_file_1);
        file_upload_component.d_files.push(wrapper.vm.fake_file_2);

        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_1);
        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_2);

        expect(file_upload_component.d_empty_filenames.size).toBeGreaterThan(0);

        expect(empty_files_present_modal.is_open).toBe(false);

        final_submit_button.trigger('click');

        expect(empty_files_present_modal.is_open).toBe(true);
    });

    test('You can choose to submit despite having one or more empty files', () => {
        @Component({
            template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
            components: {
                'file_upload': FileUpload
            }
        })

        class WrapperComponent extends Vue {
            rows1 = ['ham', 'hashbrowns', 'eggs'];
            fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');

            rows2 = [];
            fake_file_2 = new File([this.rows2.join('\n')], 'fake_file_2.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;
        let final_submit_button = file_upload.find('.submit-files-button');
        let empty_files_present_modal = <Modal> file_upload.find(
            {ref: 'empty_file_found_in_submission_attempt'}
        ).vm;

        file_upload_component.d_files.push(wrapper.vm.fake_file_1);
        file_upload_component.d_files.push(wrapper.vm.fake_file_2);

        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_1);
        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_2);

        expect(file_upload_component.d_empty_filenames.size).toBeGreaterThan(0);

        expect(empty_files_present_modal.is_open).toBe(false);

        final_submit_button.trigger('click');

        expect(empty_files_present_modal.is_open).toBe(true);

        let submit_despite_empty_files_button = file_upload.find(
            '.submit-despite-empty-files-button'
        );

        submit_despite_empty_files_button.trigger('click');

        // should have been emitted
        expect(file_upload.emitted().submit_click.length).toBe(1);
    });

    test('You can choose not to submit after receiving the warning modal concerning ' +
         'empty files in your submission',
         () => {
        @Component({
              template:  `<div><file_upload ref="file_upload"></file_upload></div>`,
              components: {
                  'file_upload': FileUpload
              }
        })

        class WrapperComponent extends Vue {
            rows1 = ['ham', 'hashbrowns', 'eggs'];
            fake_file_1 = new File([this.rows1.join('\n')], 'fake_file_1.cpp');

            rows2 = [];
            fake_file_2 = new File([this.rows2.join('\n')], 'fake_file_2.cpp');
        }

        const wrapper = mount(WrapperComponent);
        let file_upload = wrapper.find({ref: 'file_upload'});
        let file_upload_component = <FileUpload> file_upload.vm;
        let final_submit_button = file_upload.find('.submit-files-button');
        let empty_files_present_modal = <Modal> file_upload.find(
            {ref: 'empty_file_found_in_submission_attempt'}
        ).vm;

        file_upload_component.d_files.push(wrapper.vm.fake_file_1);
        file_upload_component.d_files.push(wrapper.vm.fake_file_2);

        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_1);
        file_upload_component.check_for_emptiness(wrapper.vm.fake_file_2);

        expect(file_upload_component.d_empty_filenames.size).toBeGreaterThan(0);

        expect(empty_files_present_modal.is_open).toBe(false);

        final_submit_button.trigger('click');

        expect(empty_files_present_modal.is_open).toBe(true);

        let cancel_submission_button = file_upload.find(
              '.cancel-submission-process-button'
        );

        cancel_submission_button.trigger('click');

        expect(file_upload.emitted('submit_click')).not.toBeTruthy();

        expect(empty_files_present_modal.is_open).toBe(false);
    });

});
