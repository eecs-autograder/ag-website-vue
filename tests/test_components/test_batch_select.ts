import Vue from "vue";
import Component from "vue-class-component";

import { Wrapper } from '@vue/test-utils';

import _ from 'lodash';
import * as sinon from 'sinon';

import BatchSelect from "@/components/batch_select.vue";

import { managed_mount } from '@/tests/setup';
import { emitted } from '@/tests/utils';


interface TestObj {
    value: string;
}

let obj1: TestObj = {
    value: "objectA-a"
};
let obj2: TestObj = {
    value: "objectA-b"
};
let obj3: TestObj = {
    value: "otherObject"
};

let objects: TestObj[] = [obj1, obj2, obj3];
let selected: TestObj[] = [obj1];

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
    objects: TestObj[] = objects;
    selected: TestObj[] = selected;

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

describe('BatchSelect', () => {
    let wrapper: Wrapper<WrapperComponent>;
    let batch_select_wrapper: Wrapper<BatchSelect>;
    let on_input_spy: sinon.SinonSpy;

    beforeEach(() => {
        wrapper = managed_mount(WrapperComponent);
        on_input_spy = sinon.spy(wrapper.vm, 'on_input');
        batch_select_wrapper = wrapper.findComponent({ref: 'batch_select'}) as Wrapper<BatchSelect>;
    });

    test('sets d_selected_items to a deep copy of value', async () => {
        expect(batch_select_wrapper.vm.d_selected_items).toEqual(selected);
        expect(batch_select_wrapper.vm.d_selected_items).not.toBe(selected);
    });

    test('closes the modal after cancelling', async () => {
        expect(batch_select_wrapper.vm.d_show_batch_select_modal).toBe(false);

        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(batch_select_wrapper.vm.d_show_batch_select_modal).toBe(true);

        batch_select_wrapper.findAll('.modal-cancel-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(batch_select_wrapper.vm.d_show_batch_select_modal).toBe(false);
    });

    test('closes the modal after clicking close', async () => {
        batch_select_wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        batch_select_wrapper.findAll('.close-button').at(0).trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(batch_select_wrapper.vm.d_show_batch_select_modal).toBe(false);
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
        let filter_param = 'objectA';
        let filter_objs = [obj1, obj2];

        batch_select_wrapper.find('.batch-select-button').trigger('click');
        await batch_select_wrapper.vm.$nextTick();

        expect(batch_select_wrapper.vm.batch_filtered_items).toEqual(objects);

        await batch_select_wrapper.find('.batch-search-field').setValue(filter_param);
        await batch_select_wrapper.vm.$nextTick();

        const cards = batch_select_wrapper.findAll('.batch-select-card');
        await batch_select_wrapper.vm.$nextTick();

        expect(batch_select_wrapper.vm.batch_filtered_items).toEqual(filter_objs);
        _.each(_.range(filter_objs.length), (index) => {
            expect(cards.at(index).text()).toEqual(filter_objs[index].value);
        });
    });

    test('updates selected after the prop value is updated', async () => {
       wrapper.find('.change-selected').trigger('click');
       await wrapper.vm.$nextTick();

       expect(batch_select_wrapper.vm.d_selected_items).toEqual([obj3]);
    });
});
