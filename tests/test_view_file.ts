import ViewFile from '@/components/view_file.vue';
import { mount } from '@vue/test-utils';

describe('ViewFile.vue', () => {

    test('Data set to default values when props are not specified by parent', () => {
        const wrapper = mount(ViewFile);

        const vm = wrapper.vm;
        expect(vm.$data.filename).toBe("filename");
        expect(vm.$data.file_content).toBe("file content");

    });

    test('Data set to values passed in by parent', () => {
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

    test('The amount of line numbers corresponds to the number of lines with content', () => {
        const content = 'blah\nblah\nblah';
        const wrapper = mount(ViewFile, {
            propsData: {
                incoming_file_content: content
            }
        });

        const vm = wrapper.vm;
        expect(vm.$data.filename).toBe("filename");
        expect(vm.$data.file_content).toBe(content);
        expect(wrapper.html()).toContain('<div class="line-number"> 1 </div>');
        expect(wrapper.html()).toContain('<div class="line-number"> 2 </div>');
        expect(wrapper.html()).toContain('<div class="line-number"> 3 </div>');
        expect(wrapper.findAll('.line-number')).toHaveLength(3);
    });

});
