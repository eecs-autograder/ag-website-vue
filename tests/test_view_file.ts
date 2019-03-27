import ViewFile from '@/components/view_file.vue';
import { config, mount, Wrapper } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ViewFile.vue', () => {
    let wrapper: Wrapper<ViewFile>;
    let component: ViewFile;
    const filename = 'ke$ha_file.cpp';
    const content = Promise.resolve('line one\nline two');
    const height_in = "250px";

    beforeEach(() => {
        wrapper = mount(ViewFile, {
            propsData: {
                filename: filename,
                file_contents: content,
                view_file_height: height_in
            }
        });
        component = wrapper.vm;
    });

    test('ViewFile data set to values passed in by parent', async () => {
        await component.$nextTick();

        let view_file_wrapper = wrapper.find('#view-file-component');
        expect(view_file_wrapper.element.style.height).toEqual('250px');
        expect(component.d_filename).toBe(filename);
        expect(component.d_file_contents).toBe(await content);
    });

    test('File content and line numbers displayed in order', async () => {
        await component.$nextTick();

        const line_numbers = wrapper.findAll('.line-number');
        expect(line_numbers.length).toEqual(2);
        expect(line_numbers.at(0).text()).toContain('1');
        expect(line_numbers.at(1).text()).toContain('2');

        const content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('line one');
        expect(content_lines.at(1).text()).toContain('line two');
    });

    test('The contents of a ViewFile component can change', async () => {
        await component.$nextTick();

        let content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('line one');
        expect(content_lines.at(1).text()).toContain('line two');

        wrapper.setData({file_contents: Promise.resolve("Blue \nMoon")});
        await component.$nextTick();

        content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('Blue');
        expect(content_lines.at(1).text()).toContain('Moon');
    });

    test('The filename of a ViewFile Component can change', async () => {
        let new_filename = "macklemore.cpp";
        await component.$nextTick();

        expect(component.d_filename).toEqual(filename);

        wrapper.setData({filename: new_filename});
        await component.$nextTick();

        expect(component.d_filename).toEqual(new_filename);
    });
});
