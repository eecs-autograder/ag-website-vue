import MultiFileViewer from '@/components/multi_file_viewer.vue';
import { config, mount } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

@Component({
    template:  `<div>
                  <multi_file_viewer
                    ref="multi_file"
                    :height_of_view_file="height_of_view_file_in">
                  </multi_file_viewer>
                </div>`,
    components: {
        'multi_file_viewer': MultiFileViewer
    }
})
class WrapperComponent extends Vue {
    height_of_view_file_in = "540px";
}

describe('MultiFileViewer.vue', () => {

    test('MultiFileViewer data set to values passed in by parent', async () => {
        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(0);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        let scrollable_container = view_file_component.find('#scrollable-container');

        expect(scrollable_container.element.style.height).toEqual("540px");

    });

    test('When a file is added it becomes the active file/tab ', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain('Kiwi Body');

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain('Lime Body');

        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(view_file_component.text()).toContain('Mango Body');

        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain('Nectarine Body');
    });

    test('Clicking on a tab makes it the active tab', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain('Nectarine Body');

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain('Kiwi Body');

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');
    });

    test('Only one copy of a file and its contents can exist at once in the mfv', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain('Kiwi Body');

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');
    });

    test('When leftmost tab is active & gets deleted, right neighbor becomes active', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain('Kiwi Body');

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain('Lime Body');

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        leftmost_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        let leftmost_tab_close_x = wrapper.findAll('.close-x');
        leftmost_tab_close_x.trigger('click');

        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');
    });

    test('When the only tab gets deleted, the active_tab_index becomes negative', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Kiwi Body');

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        expect(leftmost_tab.text()).toContain('Kiwi');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        let leftmost_tab_close_x = wrapper.findAll('.close-x').at(0);
        leftmost_tab_close_x.trigger('click');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(0);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
    });

    test('When an active middle tab gets deleted, the right neighbor becomes active', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Nectarine Body');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);

        let second_tab_close_button = wrapper.findAll('.close-x').at(1);
        second_tab_close_button.trigger('click');

        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Mango Body');
    });

    test('Deleting rightmost active tab causes left neighbor to become active', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);

        let rightmost_tab_close_x = wrapper.findAll('.close-x').at(3);
        rightmost_tab_close_x.trigger('click');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
    });

    test('Close middle tab when middle tab is not active', () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
    });


    test('Close leftmost tab when it is not active', () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);

        let first_tab_close_button = wrapper.findAll('.close-x').at(0);
        first_tab_close_button.trigger('click');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
    });

    test('Close rightmost tab when it is not active', () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');

        let third_tab_close_x = wrapper.findAll('.close-x').at(2);
        third_tab_close_x.trigger('click');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
    });


    test('Close tab to left of active tab (active tab is not rightmost tab)', () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Monday', 'Monday Body');
        multi_file_viewer.add_to_viewing('Tuesday', 'Tuesday Body');
        multi_file_viewer.add_to_viewing('Wednesday', 'Wednesday Body');
        multi_file_viewer.add_to_viewing('Thursday', 'Thursday Body');
        multi_file_viewer.add_to_viewing('Friday', 'Friday Body');

        expect(multi_file_viewer.$data.active_tab_index).toEqual(4);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(5);

        // click on fourth
        let fourth_tab = wrapper.findAll('.tab-label').at(3);
        fourth_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);

        // delete the first tab
        let first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);

        // delete the 'new' first tab
        first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
    });
});
