import ViewFile from '@/components/view_file.vue';
import { config, mount } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ViewFile.vue', () => {

    test('ViewFile data set to values passed in by parent', () => {
        const filename = 'ke$ha_file.cpp';
        const content = 'blah\nblah\nblah';
        const wrapper = mount(ViewFile, {
            propsData: {
                incoming_filename: filename,
                incoming_file_contents: content
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.filename).toBe(filename);
        expect(vm.$data.file_contents).toBe(content);
    });

    test('File content and line numbers displayed in order', () => {
        const wrapper = mount(ViewFile, {
            propsData: {
                incoming_filename: 'filename',
                incoming_file_contents: 'line one\nline two'
            }
        });

        const line_numbers = wrapper.findAll('.line-number');
        expect(line_numbers.length).toEqual(2);
        expect(line_numbers.at(0).text()).toContain('1');
        expect(line_numbers.at(1).text()).toContain('2');

        const content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('line one');
        expect(content_lines.at(1).text()).toContain('line two');
    });

    test('Height of the ViewFile component is set to the height passed in', () => {

        @Component({
            template:  `<view_file ref='view_file'
                          incoming_filename='filename'
                          incoming_file_contents='line one\nline two'
                          :view_file_height="height_of_view_file_in">
                        </view_file>`,
            components: {
                'view_file': ViewFile
            }
        })

        class WrapperComponent2 extends Vue {
            height_of_view_file_in = "250px";
        }

        const wrapper = mount(WrapperComponent2);
        const view_file_component = wrapper.find({ref: 'view_file'});

        let scrollable_container = view_file_component.find('#scrollable-container');
        expect(scrollable_container.element.style.height).toEqual('250px');

        const line_numbers = wrapper.findAll('.line-number');
        expect(line_numbers.length).toEqual(2);
        expect(line_numbers.at(0).text()).toContain('1');
        expect(line_numbers.at(1).text()).toContain('2');

        const content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('line one');
        expect(content_lines.at(1).text()).toContain('line two');
    });

    test('The contents of a ViewFile Component can change', async () => {

        @Component({
            template:  `<div>
                            <button id='change-contents-button'
                               @click="change_contents()">
                               Change Contents
                            </button>
                            <view_file ref='view_file'
                              :incoming_filename="filename_3"
                              :incoming_file_contents="file_contents_3">
                            </view_file>
                        </div>`,
            components: {
                'view_file': ViewFile
            }
        })

        class WrapperComponent2 extends Vue {

            filename_3 = "Ice_Cream.cpp";
            file_contents_3 = "Mint\nChocolate\nChip";
            alternate_file_contents_3 = "Blue\nMoon";

            change_contents() {
                this.file_contents_3 = this.alternate_file_contents_3;
            }
        }

        const wrapper = mount(WrapperComponent2);
        const view_file_wrapper = wrapper.find({ref: 'view_file'});
        const view_file_component = <ViewFile> view_file_wrapper.vm;

        let line_numbers = wrapper.findAll('.line-number');
        expect(line_numbers.length).toEqual(3);
        expect(line_numbers.at(0).text()).toContain('1');
        expect(line_numbers.at(1).text()).toContain('2');
        expect(line_numbers.at(2).text()).toContain('3');

        let content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(3);
        expect(content_lines.at(0).text()).toContain('Mint');
        expect(content_lines.at(1).text()).toContain('Chocolate');
        expect(content_lines.at(2).text()).toContain('Chip');

        let change_contents_button = wrapper.find('#change-contents-button');

        change_contents_button.trigger('click');

        await view_file_component.$nextTick();

        line_numbers = wrapper.findAll('.line-number');
        expect(line_numbers.length).toEqual(2);
        expect(line_numbers.at(0).text()).toContain('1');
        expect(line_numbers.at(1).text()).toContain('2');

        content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('Blue');
        expect(content_lines.at(1).text()).toContain('Moon');
    });
});
