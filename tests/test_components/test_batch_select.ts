import Vue from "vue";
import Component from "vue-class-component";

import { Wrapper } from '@vue/test-utils';

import _ from 'lodash';
import * as sinon from 'sinon';

import BatchSelect from "@/components/batch_select.vue";

import { managed_mount } from '@/tests/setup';
import { emitted, wait_until } from '@/tests/utils';


interface TestObj {
    value: string;
    pk: number;
}

const obj1: TestObj = {
    value: "ab",
    pk: 1
};
const obj2: TestObj = {
    value: "bc",
    pk: 2
};
const obj3: TestObj = {
    value: "ac",
    pk: 3
};

@Component({
    template: `<div>
                 <batch-select
                     v-model="selected"
                     :choices="objects"
                     :are_items_equal="are_items_equal"
                     :filter_fn="filter_fn"
                     @input="on_input($event)"
                     v-slot="{ item }"
                     ref="batch_select"
                     aria_label="test"
                 >
                     {{ item.value }}
                 </batch-select>
                 <div class="change-selected"
                      @click="change_selected">
                 </div>
               </div>`,
    components: {
        'batch-select': BatchSelect
    }
})
class WrapperComponent extends Vue {
    objects: TestObj[] = [];
    selected: TestObj[] = [];

    filter_fn(obj: TestObj, filter_text: string) {
        return _.includes(obj.value, filter_text);
    }

    are_items_equal(lhs: TestObj, rhs: TestObj) {
        return lhs.value === rhs.value;
    }

    on_input(object: TestObj) {}

    change_selected() {
        this.selected = [obj3];
    }
}

function get_wrapper({
    objects = [obj1, obj2, obj3],
    selected = [],
}: { objects?: TestObj[], selected?: TestObj[] } = {}) {
    return managed_mount(WrapperComponent, {
        attachTo: document.body,
        data: () => ({ objects, selected }),
    });
}

describe('BatchSelect', () => {
    let wrapper: Wrapper<WrapperComponent>;
    let batch_select_wrapper: Wrapper<Vue>;
    let on_input_spy: sinon.SinonSpy;
    let objects: TestObj[];
    let selected: TestObj[];

    function modal_is_open(w: Wrapper<Vue>) {
        return w.find('.batch-search-field').exists();
    }

    beforeEach(() => {
        objects = [obj1, obj2, obj3];
        selected = [obj1];
        wrapper = get_wrapper({ selected });
        on_input_spy = sinon.spy(wrapper.vm, 'on_input');
        batch_select_wrapper = wrapper.findComponent({ref: 'batch_select'}) as Wrapper<Vue>;
    });

    test('reflects the value prop\'s initial selection when opened', async () => {
        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(batch_select_wrapper.find('.modal-header').text()).toContain(
            '1 out of 3 items selected'
        );
        const cards = batch_select_wrapper.findAll('.batch-select-card');
        expect(cards.at(0).attributes('aria-selected')).toBe('true');
        expect(cards.at(1).attributes('aria-selected')).toBe('false');
        expect(cards.at(2).attributes('aria-selected')).toBe('false');
    });

    test('does not mutate the original value array when toggling selection', async () => {
        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        batch_select_wrapper.findAll('.batch-select-card').at(1).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(batch_select_wrapper.find('.modal-header').text()).toContain(
            '2 out of 3 items selected'
        );
        expect(selected.length).toBe(1);
    });

    test('closes the modal after cancelling', async () => {
        expect(modal_is_open(batch_select_wrapper)).toBe(false);

        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(modal_is_open(batch_select_wrapper)).toBe(true);

        batch_select_wrapper.findAll('.modal-cancel-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(modal_is_open(batch_select_wrapper)).toBe(false);
    });

    test('closes the modal after clicking close', async () => {
        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        batch_select_wrapper.findAll('.close-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(modal_is_open(batch_select_wrapper)).toBe(false);
    });

    test('adds the item after selected', async () => {
        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        batch_select_wrapper.findAll('.batch-select-card').at(1).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        batch_select_wrapper.find('.modal-confirm-button').trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(emitted(batch_select_wrapper, 'input')[0][0]).toEqual([obj1, obj2]);
        expect(on_input_spy.calledWith([obj1, obj2])).toBe(true);
    });

    test('removes the selected item after selected again', async () => {
        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        batch_select_wrapper.findAll('.batch-select-card').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        batch_select_wrapper.find('.modal-confirm-button').trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(emitted(batch_select_wrapper, 'input')[0][0]).toEqual([]);
        expect(on_input_spy.calledWith([])).toBe(true);
    });

    test('displays the object by slot attribute', async () => {
        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        const cards = batch_select_wrapper.findAll('.batch-select-card');
        await batch_select_wrapper.vm.$nextTick();

        _.each(_.range(selected.length), (index) => {
           expect(cards.at(index).text()).toEqual(objects[index].value);
        });
    });

    test('filters items', async () => {
        let filter_param = 'b';
        let filter_objs = [obj1, obj2];

        batch_select_wrapper.find('.batch-select-button').trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        let cards = batch_select_wrapper.findAll('.batch-select-card');
        _.each(_.range(objects.length), (index) => {
            expect(cards.at(index).text()).toEqual(objects[index].value);
        });

        await batch_select_wrapper.find('.batch-search-field').setValue(filter_param);
        await batch_select_wrapper.vm.$nextTick();

        cards = batch_select_wrapper.findAll('.batch-select-card');
        expect(cards.length).toBe(filter_objs.length);
        _.each(_.range(filter_objs.length), (index) => {
            expect(cards.at(index).text()).toEqual(filter_objs[index].value);
        });
    });

    test('updates selected after the prop value is updated', async () => {
        batch_select_wrapper.find('.batch-select-button').trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        wrapper.find('.change-selected').trigger('click');
        await wrapper.vm.$nextTick();

        const cards = batch_select_wrapper.findAll('.batch-select-card');
        expect(cards.at(0).attributes('aria-selected')).toBe('false');
        expect(cards.at(1).attributes('aria-selected')).toBe('false');
        expect(cards.at(2).attributes('aria-selected')).toBe('true');
    });
});

describe('Focus and keyboard navigation', () => {
    let wrapper: Wrapper<WrapperComponent>;

    function mount(args: { objects?: TestObj[], selected?: TestObj[] } = {}) {
        wrapper = get_wrapper(args);
    }

    function active_descendant(w: Wrapper<Vue>) {
        return w.find('[role=listbox]').attributes('aria-activedescendant');
    }

    function visible_options(w: Wrapper<Vue>) {
        return w.findAll('[role="option"]');
    }

    function active_option_is(w: Wrapper<Vue>, index: number) {
        return active_descendant(w) === visible_options(w).at(index).attributes('id');
    }

    function no_options_and_no_active_descendant(w: Wrapper<Vue>) {
        return visible_options(w).length === 0 && active_descendant(w) === undefined;
    }

    describe('No items selected', () => {
        beforeEach(() => mount());

        test("Focuses on first element on open", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);
        });

        test("Focuses on first visible element when focus enters list and none selected", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');

            // Hide obj1 and obj2 so obj3 is the only visible option.
            await wrapper.find('[aria-label="Filter"]').setValue('ac');

            const obj3_is_only_visible_option_and_active = (w: Wrapper<Vue>) => {
                const opts = visible_options(w);
                return opts.length === 1
                    && opts.at(0).text() === obj3.value
                    && active_option_is(w, 0);
            };

            expect(await wait_until(wrapper, obj3_is_only_visible_option_and_active)).toBe(true);

            const listbox = wrapper.find('[role=listbox]');
            (listbox.element as HTMLElement).blur();
            expect(await wait_until(wrapper, (w) => active_descendant(w) === undefined)).toBe(true);
            (listbox.element as HTMLElement).focus();

            expect(await wait_until(wrapper, obj3_is_only_visible_option_and_active)).toBe(true);
        });

        test("Exposes no active descendant when no options are visible", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');

            // Wait for focus to land on an option while the full list is visible,
            // so filtering-to-empty actually exercises the out-of-range guard.
            expect(await wait_until(wrapper, (w) => active_descendant(w) !== undefined)).toBe(true);

            // Filter out every option.
            await wrapper.find('[aria-label="Filter"]').setValue('foobar');

            expect(await wait_until(wrapper, no_options_and_no_active_descendant)).toBe(true);
        });

        test("Arrow keys transfer focus between items", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);

            const listbox = wrapper.find('[role=listbox]');
            const options = wrapper.findAll('[role="option"]');
            const active_id = () => active_descendant(wrapper);

            await listbox.trigger('keydown.down');
            expect(active_id()).toBe(options.at(1).attributes('id'));

            await listbox.trigger('keydown.right');
            expect(active_id()).toBe(options.at(2).attributes('id'));

            // No-op at boundary
            await listbox.trigger('keydown.down');
            expect(active_id()).toBe(options.at(2).attributes('id'));
            await listbox.trigger('keydown.right');
            expect(active_id()).toBe(options.at(2).attributes('id'));

            await listbox.trigger('keydown.up');
            expect(active_id()).toBe(options.at(1).attributes('id'));

            await listbox.trigger('keydown.left');
            expect(active_id()).toBe(options.at(0).attributes('id'));

            // No-op at boundary
            await listbox.trigger('keydown.up');
            expect(active_id()).toBe(options.at(0).attributes('id'));
            await listbox.trigger('keydown.left');
            expect(active_id()).toBe(options.at(0).attributes('id'));
        });

        test("Arrow keys skip filtered items", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);

            // Hide obj2, which sits between obj1 and obj3 in the list.
            await wrapper.find('[aria-label="Filter"]').setValue('a');

            const listbox = wrapper.find('[role=listbox]');
            const options = wrapper.findAll('[role="option"]');
            const active_id = () => active_descendant(wrapper);

            expect(options.length).toBe(2);
            expect(options.at(0).text()).toBe(obj1.value);
            expect(options.at(1).text()).toBe(obj3.value);
            expect(active_id()).toBe(options.at(0).attributes('id'));

            await listbox.trigger('keydown.down');
            expect(active_id()).toBe(options.at(1).attributes('id'));
            await listbox.trigger('keydown.up');
            expect(active_id()).toBe(options.at(0).attributes('id'));
            await listbox.trigger('keydown.right');
            expect(active_id()).toBe(options.at(1).attributes('id'));
            await listbox.trigger('keydown.left');
            expect(active_id()).toBe(options.at(0).attributes('id'));
        });

        test("Arrow keys respect new boundaries when original boundaries are filtered out", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);

            // Hide obj1 (first) and obj3 (last); only obj2 remains.
            await wrapper.find('[aria-label="Filter"]').setValue('bc');

            const listbox = wrapper.find('[role=listbox]');
            const options = wrapper.findAll('[role="option"]');
            const active_id = () => active_descendant(wrapper);

            expect(options.length).toBe(1);
            expect(options.at(0).text()).toBe(obj2.value);
            expect(active_id()).toBe(options.at(0).attributes('id'));

            // No movement key can shift focus off the sole remaining item.
            for (const key of ['up', 'down', 'left', 'right']) {
                await listbox.trigger(`keydown.${key}`);
                expect(active_id()).toBe(options.at(0).attributes('id'));
            }
        });

        test("Space toggles selection of the focused item", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);

            const listbox = wrapper.find('[role=listbox]');
            const options = wrapper.findAll('[role="option"]');

            expect(options.at(0).attributes('aria-selected')).toBe('false');
            await listbox.trigger('keydown.space');
            expect(options.at(0).attributes('aria-selected')).toBe('true');
            await listbox.trigger('keydown.space');
            expect(options.at(0).attributes('aria-selected')).toBe('false');

            await listbox.trigger('keydown.down');
            await listbox.trigger('keydown.space');
            expect(options.at(0).attributes('aria-selected')).toBe('false');
            expect(options.at(1).attributes('aria-selected')).toBe('true');
        });

        test("Keyboard selection is committed on confirm", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);

            const listbox = wrapper.find('[role=listbox]');

            // Select obj1 and obj3
            await listbox.trigger('keydown.space');
            await listbox.trigger('keydown.down');
            await listbox.trigger('keydown.down');
            await listbox.trigger('keydown.space');

            await wrapper.find('.modal-confirm-button').trigger('click');

            const batch_select = wrapper.findComponent({ref: 'batch_select'});
            expect(emitted(batch_select, 'input')[0][0]).toEqual([obj1, obj3]);
        });

        test("Blurring the list clears the active descendant", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);

            (wrapper.find('[role=listbox]').element as HTMLElement).blur();

            expect(await wait_until(wrapper, (w) => active_descendant(w) === undefined)).toBe(true);
        });
    });

    describe('Some items selected', () => {
        // obj2 and obj3 are selected; obj1 (index 0) is not, so "first selected"
        // is distinguishable from "first item".
        beforeEach(() => mount({ selected: [obj2, obj3] }));

        test("Focuses on first selected element when focus enters list and some selected -- all visible", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');

            // obj2 is the first selected item, so focus lands on it (index 1), not index 0.
            expect(await wait_until(wrapper, (w) => active_option_is(w, 1))).toBe(true);

            const options = wrapper.findAll('[role="option"]');
            expect(options.at(1).text()).toBe(obj2.value);
        });

        test("Focuses on first selected visible element when focus enters list and some selected", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 1))).toBe(true);

            // Hide obj2 (the first selected item); visible list becomes [obj1, obj3].
            await wrapper.find('[aria-label="Filter"]').setValue('a');

            const listbox = wrapper.find('[role=listbox]');
            (listbox.element as HTMLElement).blur();
            expect(await wait_until(wrapper, (w) => active_descendant(w) === undefined)).toBe(true);
            (listbox.element as HTMLElement).focus();

            // obj3 is now the first selected item still visible, so focus skips to it.
            const obj3_is_second_visible_option_and_active = (w: Wrapper<Vue>) => {
                const opts = visible_options(w);
                return opts.length === 2
                    && opts.at(1).text() === obj3.value
                    && active_option_is(w, 1);
            };
            expect(await wait_until(wrapper, obj3_is_second_visible_option_and_active)).toBe(true);
        });

        test("Falls back to the first visible item when no selected item is visible", async () => {
            // Mark the first object as selected, but then we'll filter it out.
            // Make sure the focused element is the first visible one,
            // not coincidentally the first option.
            await wrapper.setData({selected: [obj1]});

            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, (w) => active_option_is(w, 0))).toBe(true);

            // Hide obj1 (the selected item); only obj2 and obj3 (unselected) remain.
            await wrapper.find('[aria-label="Filter"]').setValue('c');

            const listbox = wrapper.find('[role=listbox]');
            (listbox.element as HTMLElement).blur();
            expect(await wait_until(wrapper, (w) => active_descendant(w) === undefined)).toBe(true);
            (listbox.element as HTMLElement).focus();

            // No selected item is visible, so focus falls back to the first item.
            const obj2_is_only_visible_option_and_active = (w: Wrapper<Vue>) => {
                const opts = visible_options(w);
                return opts.length === 2
                    && opts.at(0).text() === obj2.value
                    && active_option_is(w, 0);
            };
            expect(await wait_until(wrapper, obj2_is_only_visible_option_and_active)).toBe(true);
        });
    });

    describe('No items', () => {
        beforeEach(() => mount({ objects: [] }));

        test("Renders an empty listbox with no error", async () => {
            await wrapper.find('[aria-label="Open batch select"]').trigger('click');
            expect(await wait_until(wrapper, no_options_and_no_active_descendant)).toBe(true);
        });
    });
});
