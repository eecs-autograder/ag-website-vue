import { config, mount, Wrapper } from '@vue/test-utils';

import MultiFileViewer from '@/components/multi_file_viewer.vue';

describe('MultiFileViewer.vue', () => {
    let wrapper: Wrapper<MultiFileViewer>;
    let component: MultiFileViewer;
    let original_match_media: (query: string) => MediaQueryList;
    let kiwi_body: Promise<string>;
    let lime_body: Promise<string>;
    let nectarine_body: Promise<string>;
    let mango_body: Promise<string>;
    let orange_body: Promise<string>;
    let height_of_view_file_in: string;

    beforeEach(() => {
        kiwi_body = Promise.resolve("Kiwi Body");
        lime_body = Promise.resolve("Lime Body");
        nectarine_body = Promise.resolve("Nectarine Body");
        mango_body = Promise.resolve("Mango Body");
        orange_body = Promise.resolve("Orange Body");
        height_of_view_file_in = "540px";

        config.logModifiedComponents = false;
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return { matches: true };
            })
        });

        wrapper = mount(MultiFileViewer, {
            propsData: {
                height_of_view_file: height_of_view_file_in
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });
    });

    test('MultiFileViewer data set to values passed in by parent', async () => {
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(0);
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        let view_file_wrapper = view_file_component.find('#view-file-component');

        expect(view_file_wrapper.element.style.height).toEqual(height_of_view_file_in);
    });

    test('When a file is added it becomes the active file/tab ', async () => {
        await component.$nextTick();
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});

        expect(component.active_tab_index).toEqual(0);
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain(await kiwi_body);

        component.add_to_viewing('Lime', lime_body);
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(1);
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain(await lime_body);

        component.add_to_viewing('Mango', mango_body);
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(2);
        expect(component.files_currently_viewing.length).toEqual(3);
        expect(view_file_component.text()).toContain(await mango_body);

        component.add_to_viewing('Nectarine', nectarine_body);
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(4);
        expect(component.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain(await nectarine_body);
    });

    test('Clicking on a tab makes it the active tab', async () => {
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Kiwi', kiwi_body);
        component.add_to_viewing('Lime', lime_body);
        component.add_to_viewing('Mango', mango_body);
        component.add_to_viewing('Nectarine', nectarine_body);

        await component.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(component.files_currently_viewing.length).toEqual(4);
        expect(component.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain(await nectarine_body);

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');
        await component.$nextTick();
        expect(component.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain(await kiwi_body);

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        await component.$nextTick();
        expect(component.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain(await lime_body);
    });

    test('Only one copy of a file and its contents can exist at once in the mfv', async () => {
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain(await kiwi_body);

        component.add_to_viewing('Lime', lime_body);
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain(await lime_body);

        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain(await kiwi_body);
    });

    test('When leftmost tab is active & gets deleted, right neighbor becomes active', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});

        expect(component.active_tab_index).toEqual(0);
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain(await kiwi_body);

        component.add_to_viewing('Lime', lime_body);
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(1);
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain(await lime_body);

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        leftmost_tab.trigger('click');
        await component.$nextTick();
        expect(component.active_tab_index).toEqual(0);

        let leftmost_tab_close_x = wrapper.findAll('.close-x');
        leftmost_tab_close_x.trigger('click');
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(0);
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain(await lime_body);
    });

    test('When the only tab gets deleted, the active_tab_index becomes negative', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(0);
        expect(component.files_currently_viewing.length).toEqual(1);

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(await kiwi_body);

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        expect(leftmost_tab.text()).toContain('Kiwi');
        expect(component.active_tab_index).toEqual(0);

        let leftmost_tab_close_x = wrapper.findAll('.close-x').at(0);
        leftmost_tab_close_x.trigger('click');
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(0);
        expect(component.active_tab_index).toEqual(0);
    });

    test('When an active middle tab gets deleted, the right neighbor becomes active', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        component.add_to_viewing('Lime', lime_body);
        component.add_to_viewing('Mango', mango_body);
        component.add_to_viewing('Nectarine', nectarine_body);

        await component.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(await nectarine_body);
        expect(component.active_tab_index).toEqual(3);

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(1);

        let second_tab_close_button = wrapper.findAll('.close-x').at(1);
        second_tab_close_button.trigger('click');
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain(await mango_body);
    });

    test('Deleting rightmost active tab causes left neighbor to become active', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        component.add_to_viewing('Lime', lime_body);
        component.add_to_viewing('Mango', mango_body);
        component.add_to_viewing('Nectarine', nectarine_body);
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(4);
        expect(component.active_tab_index).toEqual(3);

        let rightmost_tab_close_x = wrapper.findAll('.close-x').at(3);
        rightmost_tab_close_x.trigger('click');
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(3);
        expect(component.active_tab_index).toEqual(2);
    });

    test('Close middle tab when middle tab is not active', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        component.add_to_viewing('Lime', lime_body);
        component.add_to_viewing('Mango', mango_body);
        component.add_to_viewing('Nectarine', nectarine_body);

        expect(component.active_tab_index).toEqual(3);
        expect(component.files_currently_viewing.length).toEqual(4);

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(3);
        expect(component.active_tab_index).toEqual(2);
    });

    test('Close leftmost tab when it is not active', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        component.add_to_viewing('Lime', lime_body);
        component.add_to_viewing('Mango', mango_body);
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(3);
        expect(component.active_tab_index).toEqual(2);

        let first_tab_close_button = wrapper.findAll('.close-x').at(0);
        first_tab_close_button.trigger('click');
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(1);
    });

    test('Close rightmost tab when it is not active', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        component.add_to_viewing('Lime', lime_body);
        component.add_to_viewing('Mango', mango_body);
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(3);
        expect(component.active_tab_index).toEqual(2);

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');
        await component.$nextTick();

        let third_tab_close_x = wrapper.findAll('.close-x').at(2);
        third_tab_close_x.trigger('click');
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(0);

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);
    });


    test('Close tab to left of active tab (active tab is not rightmost tab)', async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        component.add_to_viewing('Lime', lime_body);
        component.add_to_viewing('Mango', mango_body);
        component.add_to_viewing('Nectarine', nectarine_body);
        component.add_to_viewing('Orange', orange_body);
        await component.$nextTick();

        expect(component.active_tab_index).toEqual(4);
        expect(component.files_currently_viewing.length).toEqual(5);

        // click on fourth
        let fourth_tab = wrapper.findAll('.tab-label').at(3);
        fourth_tab.trigger('click');
        await component.$nextTick();
        expect(component.active_tab_index).toEqual(3);

        // delete the first tab
        let first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
        await component.$nextTick();
        expect(component.active_tab_index).toEqual(2);

        // delete the 'new' first tab
        first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
        await component.$nextTick();
        expect(component.active_tab_index).toEqual(1);
    });

    test('Tabs can be deleted by their name', async () => {
        expect(component.files_currently_viewing.length).toEqual(0);
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Kiwi");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Orange', orange_body);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Orange");
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(1);

        component.remove_by_name("Kiwi");
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Orange");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);

        component.remove_by_name("Orange");
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(0);
        expect(component.active_tab_index).toEqual(0);
    });

    test('Tabs cannot be deleted by their name if the name doesnt occur in the mfv',
         async () => {
        component.add_to_viewing('Kiwi', kiwi_body);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Kiwi");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Orange', orange_body);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Orange");
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(1);

        component.remove_by_name("Pineapple");
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.files_currently_viewing[0]).toEqual(
            {name: "Kiwi", content: kiwi_body, id: null}
        );
        expect(component.files_currently_viewing[1]).toEqual(
            {name: "Orange", content: orange_body, id: null}
        );
    });

    test('Files can be renamed using their id value', async () => {
        component.add_to_viewing('Mango', mango_body, 7);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Mango");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Orange', orange_body, 21);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Orange");
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(1);

        component.rename_file(21, "Orange Juice");
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Orange Juice");
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(1);

        component.rename_file(7, "Mango Juice");
        await component.$nextTick();

        wrapper.findAll('.tab-header').at(0).trigger('click');
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Mango Juice");
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(0);
    });

    test('Trying to rename a file whose id doesnt occur in the mfv does ' +
         'nothing',
         async () => {
        component.add_to_viewing('Mango', mango_body, 7);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Mango");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);

        component.add_to_viewing('Orange', orange_body, 21);
        await component.$nextTick();

        expect(wrapper.find('.active-tab-header').text()).toContain("Orange");
        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.active_tab_index).toEqual(1);

        component.rename_file(22, "Apple Juice");
        await component.$nextTick();

        expect(component.files_currently_viewing.length).toEqual(2);
        expect(component.files_currently_viewing[0].name).toEqual("Mango");
        expect(component.files_currently_viewing[1].name).toEqual("Orange");
    });

    test('File content can be updated', async () => {
        component.add_to_viewing('banana.cpp', Promise.resolve('Old banana'));
        await component.$nextTick();

        expect(wrapper.find('#viewing-container').text()).toContain("Old banana");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);

        component.update_contents_by_name('banana.cpp', Promise.resolve('New banana'));
        await component.$nextTick();

        expect(wrapper.find('#viewing-container').text()).toContain("New banana");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);
    });

    test('Trying to update the content of a file whose name doesnt occur in the mfv ' +
         'does nothing',
         async () => {
        component.add_to_viewing('banana.cpp', Promise.resolve('Old banana'));
        await component.$nextTick();

        expect(wrapper.find('#viewing-container').text()).toContain("Old banana");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);

        component.update_contents_by_name('bananas.cpp', Promise.resolve('New banana'));
        await component.$nextTick();

        expect(wrapper.find('#viewing-container').text()).toContain("Old banana");
        expect(component.files_currently_viewing.length).toEqual(1);
        expect(component.active_tab_index).toEqual(0);
    });
});
