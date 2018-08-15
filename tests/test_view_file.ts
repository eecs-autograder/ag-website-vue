import ViewFile from '@/components/view_file.vue';
import { mount } from '@vue/test-utils';

describe('ViewFile.vue', () => {

    test('ViewFile data set to values passed in by parent', () => {
        const filename = 'ke$ha_file.cpp';
        const content = 'blah\nblah\nblah';
        const wrapper = mount(ViewFile, {
            propsData: {
                incoming_filename: filename,
                incoming_file_content: content
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.filename).toBe(filename);
        expect(vm.$data.file_content).toBe(content);
    });

    test('File content and line numbers displayed in order', () => {
        const wrapper = mount(ViewFile, {
            propsData: {
                incoming_filename: 'filename',
                incoming_file_content: 'line one\nline two'
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

});
