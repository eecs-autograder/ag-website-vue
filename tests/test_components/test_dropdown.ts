import Vue from 'vue';

import { mount, Wrapper } from '@vue/test-utils';

import * as sinon from 'sinon';

import Dropdown from '@/components/dropdown.vue';
import { zip } from '@/utils';

import { emitted, set_props } from '@/tests/utils';


test('Scoped slot can be used to specify custom menu item text', () => {
    const component = {
        template: `
            <dropdown :items="[{name: 'steve'}, {name: 'stove'}]" data-testid="dropdown">
                <template slot="header">
                    <p ref="header">Hello</p>
                </template>
                <div slot-scope="{item}">
                    {{item.name}}
                </div>
            </dropdown>`,
        components: {
            'dropdown': Dropdown
        }
    };

    const wrapper = mount(component);
    let expected_texts = ['steve', 'stove'];
    let menu_items = wrapper.find('[data-testid=dropdown]').findAll('.dropdown-row');
    for (let [expected, menu_item] of zip(expected_texts, menu_items.wrappers)) {
        expect(menu_item.text()).toEqual(expected);
    }
});

test('Error missing header slot', () => {
    sinon.stub(console, 'error');
    expect(() => {
        mount(Dropdown, {propsData: {items: [1, 2]}});
    }).toThrowError('Missing required slot: "header"');
});

describe('Dropdown tests', () => {
    let item_values = ['first', 'second', 'third'];
    let wrapper: Wrapper<Dropdown>;
    let dropdown: Dropdown;
    let dropdown_container_wrapper: Wrapper<Vue>;
    let header_wrapper: Wrapper<Vue>;
    let menu_wrapper: Wrapper<Vue>;

    beforeEach(() => {
        wrapper = mount(Dropdown, {
            propsData: {
                items: item_values,
                dropdown_height: "100px"
            },
            slots: {
                header: '<div id="dropdown-header">Header</div>'
            }
        });

        dropdown = wrapper.vm;

        dropdown_container_wrapper = wrapper.find('.dropdown-container');

        header_wrapper = wrapper.find('#dropdown-header');
        menu_wrapper = wrapper.find(".dropdown-content");

        expect(header_wrapper.exists()).toBe(true);
        expect(menu_wrapper.exists()).toBe(true);
    });

    test('Input items are displayed as-is by default', () => {
        let menu_items = menu_wrapper.findAll('.dropdown-row');
        for (let [expected, menu_item] of zip(item_values, menu_items.wrappers)) {
            expect(menu_item.text()).toEqual(expected);
        }
    });

    test('The height of the dropdown can be customized', () => {
        expect(dropdown.dropdown_height).toEqual("100px");
        let dropdown_container = wrapper.find('.dropdown-content');
        expect(dropdown_container.element.style.height).toEqual("100px");
        expect(dropdown_container.element.style.overflowY).toEqual('scroll');
    });

    test('Clicking on header opens and closes dropdown', async () => {
        expect(dropdown.is_open).toBe(false);
        expect(menu_wrapper.element.style.display).toEqual('none');

        await header_wrapper.trigger('click');

        expect(dropdown.is_open).toBe(true);
        expect(menu_wrapper.element.style.display).toEqual('block');

        await header_wrapper.trigger('click');

        expect(dropdown.is_open).toBe(false);
        expect(menu_wrapper.element.style.display).toEqual('none');
    });

    test('Public show and hide dropdown functions', async () => {
        expect(dropdown.is_open).toBe(false);
        expect(menu_wrapper.element.style.display).toEqual('none');

        dropdown.show();
        await dropdown.$nextTick();
        expect(dropdown.is_open).toBe(true);
        expect(menu_wrapper.element.style.display).toEqual('block');

        dropdown.hide();
        await dropdown.$nextTick();
        expect(dropdown.is_open).toBe(false);
        expect(menu_wrapper.element.style.display).toEqual('none');
    });

    test('Up and down arrow keys re-open menu after closing', async () => {
        await header_wrapper.trigger('click');
        expect(dropdown.is_open).toBe(true);

        dropdown.hide();
        await dropdown.$nextTick();
        expect(dropdown.is_open).toBe(false);

        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});
        expect(dropdown.is_open).toBe(true);

        dropdown.hide();
        await dropdown.$nextTick();
        expect(dropdown.is_open).toBe(false);

        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        expect(dropdown.is_open).toBe(true);
    });

    test("Non-arrow keys don't re-open menu after closing", async () => {
        await header_wrapper.trigger('click');
        expect(dropdown.is_open).toBe(true);

        dropdown.hide();
        await dropdown.$nextTick();

        await dropdown_container_wrapper.trigger('keydown', {code: 'A'});
        expect(dropdown.is_open).toBe(false);
    });

    test('Up and down arrow keys change the highlighted item', async () => {
        expect(item_values.length).toBe(3);

        await header_wrapper.trigger('click');
        expect(dropdown.current_highlighted_index).toEqual(0);

        expect(wrapper.find(".highlight").text()).toContain(item_values[0]);

        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        expect(wrapper.find(".highlight").text()).toContain(item_values[1]);

        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        expect(wrapper.find(".highlight").text()).toContain(item_values[2]);

        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});
        expect(wrapper.find(".highlight").text()).toContain(item_values[1]);

        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});
        expect(wrapper.find(".highlight").text()).toContain(item_values[0]);
    });

    test("Arrow key navigation doesn't go off the end", async () => {
        await set_props(wrapper, {items: ['first', 'second']});

        await header_wrapper.trigger('click');
        expect(dropdown.is_open).toBe(true);

        expect(dropdown.current_highlighted_index).toBe(0);

        await dropdown_container_wrapper.trigger('keydown', {code: 'ArrowUp'});
        expect(dropdown.current_highlighted_index).toBe(0);

        await dropdown_container_wrapper.trigger('keydown', {code: 'ArrowDown'});
        expect(dropdown.current_highlighted_index).toBe(1);
        await dropdown_container_wrapper.trigger('keydown', {code: 'ArrowDown'});
        expect(dropdown.current_highlighted_index).toBe(1);

        await dropdown_container_wrapper.trigger('keydown', {code: 'ArrowUp'});
        expect(dropdown.current_highlighted_index).toBe(0);
        await dropdown_container_wrapper.trigger('keydown', {code: 'ArrowUp'});
        expect(dropdown.current_highlighted_index).toBe(0);
    });

    test('Clicking on an item in the menu emits the item and closes the menu', async () => {
        await header_wrapper.trigger('click');

        expect(dropdown.current_highlighted_index).toEqual(0);
        let highlighted_item = wrapper.find(".highlight");

        await highlighted_item.trigger('click');

        expect(dropdown.is_open).toBe(false);
        expect(emitted(wrapper, 'item_selected')[0][0]).toEqual(item_values[0]);
    });

    test('Pressing enter emits the selected item and closes the menu', async () => {
        expect(item_values.length).toBeGreaterThanOrEqual(2);

        await header_wrapper.trigger('click');
        await dropdown_container_wrapper.trigger('keydown', {code: 'ArrowDown'});

        expect(dropdown.current_highlighted_index).toBe(1);

        await dropdown_container_wrapper.trigger("keydown", {code: "Enter" });

        expect(dropdown.is_open).toBe(false);
        expect(emitted(wrapper, 'item_selected')[0][0]).toEqual(item_values[1]);
    });

    test('Blur event closes dropdown', async () => {
        await header_wrapper.trigger('click');
        expect(dropdown.is_open).toBe(true);

        await header_wrapper.trigger('blur');
        expect(dropdown.is_open).toBe(false);
    });

    test('Esc key closes menu', async () => {
        await header_wrapper.trigger('click');
        expect(dropdown.is_open).toBe(true);

        await dropdown_container_wrapper.trigger('keydown', {code: 'Escape'});
        expect(dropdown.is_open).toBe(false);

        // Make sure pressing esc again doesn't open it.
        await dropdown_container_wrapper.trigger('keydown', {code: 'Escape'});
        expect(dropdown.is_open).toBe(false);
    });

    test("Dropdown items can change and the highlighted index adjusts appropriately", async () => {
        expect(item_values.length).toEqual(3);
        await header_wrapper.trigger("click");

        expect(dropdown.current_highlighted_index).toEqual(0);

        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});

        expect(dropdown.current_highlighted_index).toEqual(2);

        await set_props(wrapper, {items: ['new_one', 'new_two']});

        let menu_items = menu_wrapper.findAll('.dropdown-row');
        expect(menu_items.at(0).text()).toContain('new_one');
        expect(menu_items.at(1).text()).toContain('new_two');

        // Index adjusts to avoid going off the end
        expect(dropdown.current_highlighted_index).toEqual(1);
    });
});
