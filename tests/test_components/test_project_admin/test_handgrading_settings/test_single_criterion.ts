import { Wrapper } from "@vue/test-utils";
import { Vue } from 'vue-property-decorator';

import { Criterion, HttpError } from "ag-client-typescript";
import * as sinon from 'sinon';

import CriterionForm, { CriterionFormData } from "@/components/project_admin/handgrading_settings/criterion_form.vue";
import SingleCriterion from "@/components/project_admin/handgrading_settings/single_criterion.vue";

import { managed_mount } from "@/tests/setup";
import { wait_until } from "@/tests/utils";

let criterion: Criterion;

beforeEach(() => {
    criterion = new Criterion({
        pk: 3,
        handgrading_rubric: 41,
        short_description: 'Spam',
        long_description: 'Egg',
        points: 4,
        last_modified: ''
    });
});

describe('SingleCriterion tests', () => {
    test('Displays criterion values, updates when prop changes', async () => {
        const wrapper = managed_mount(
            SingleCriterion, {propsData: {criterion, index: 0, count: 1}});
        expect(wrapper.find('.short-description').text()).toEqual('Spam');
        expect(wrapper.find('.points').text()).toEqual('4 points');
        expect(wrapper.find('.long-description').text()).toEqual('Egg');

        let other = new Criterion({
            pk: 3,
            handgrading_rubric: 41,
            short_description: 'Waa',
            long_description: '',
            points: 1,
            last_modified: ''
        });
        wrapper.setProps({criterion: other});
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.short-description').text()).toEqual('Waa');
        expect(wrapper.find('.points').text()).toEqual('1 point');
        expect(wrapper.find('.long-description').exists()).toEqual(false);
    });

    test('Toggle edit mode', async () => {
        const wrapper = managed_mount(
            SingleCriterion, {propsData: {criterion, index: 0, count: 1}});
        expect(wrapper.findComponent(CriterionForm).exists()).toEqual(false);

        await wrapper.find('.edit-criterion-button').trigger('click');
        expect(wrapper.findComponent(CriterionForm).exists()).toEqual(true);

        await wrapper.find('.white-button').trigger('click');
        expect(wrapper.findComponent(CriterionForm).exists()).toEqual(false);
    });
});

describe('Save criterion tests', () => {
    let wrapper: Wrapper<Vue>;
    let save_stub: sinon.SinonStub;

    beforeEach(async () => {
        wrapper = managed_mount(SingleCriterion, {propsData: {criterion, index: 0, count: 1}});
        await wrapper.find('.edit-criterion-button').trigger('click');
        save_stub = sinon.stub(Criterion.prototype, 'save').returns(Promise.resolve());
    });

    test('Save', async () => {
        const form_data: CriterionFormData = {
            short_description: 'new short description',
            points: 78,
            long_description: 'new long description',
        };
        wrapper.findComponent(CriterionForm).vm.$emit('submit', form_data);
        expect(await wait_until(
            wrapper, w => !w.findComponent(CriterionForm).exists())).toBe(true);

        expect(save_stub.calledOnce).toEqual(true);

        expect(wrapper.find('.short-description').text()).toEqual('new short description');
        expect(wrapper.find('.points').text()).toEqual('78 points');
        expect(wrapper.find('.long-description').text()).toEqual('new long description');

        // The criterion prop object itself must not be mutated by saving.
        expect(criterion.short_description).toEqual('Spam');
    });

    test('Save button disabled when form is invalid', async () => {
        let new_input = new Criterion(criterion);
        new_input.short_description = '';
        wrapper.setProps({criterion: new_input});
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.save-button').element).toBeDisabled();
    });

    test('API error', async () => {
        save_stub.returns(Promise.reject(new HttpError(403, 'Permission denied')));

        let save_errors = wrapper.findComponent({ref: 'save_criterion_errors'});
        expect(save_errors.findAll('.error-msg').length).toEqual(0);

        wrapper.findComponent(CriterionForm).vm.$emit('submit', {
            short_description: 'x', points: 1, long_description: ''
        });
        expect(await wait_until(wrapper, () => save_errors.findAll('.error-msg').length !== 0))
            .toBe(true);
    });
});

describe('Delete criterion tests', () => {
    let wrapper: Wrapper<Vue>;
    let delete_stub: sinon.SinonStub;

    beforeEach(() => {
        wrapper = managed_mount(SingleCriterion, {propsData: {criterion, index: 0, count: 1}});
        delete_stub = sinon.stub(Criterion.prototype, 'delete').returns(Promise.resolve());
    });

    test('Delete', async () => {
        await wrapper.find('.delete-icon').trigger('click');
        expect(wrapper.findComponent({ref: 'delete_criterion_modal'}).exists()).toBe(true);

        await wrapper.find('.delete-button').trigger('click');
        expect(await wait_until(
            wrapper, w => !w.findComponent({ref: 'delete_criterion_modal'}).exists())).toBe(true);
        expect(delete_stub.calledOnce).toEqual(true);
    });

    test('Cancel delete', async () => {
        await wrapper.find('.delete-icon').trigger('click');
        expect(wrapper.findComponent({ref: 'delete_criterion_modal'}).exists()).toBe(true);

        await wrapper.find('.cancel-delete-button').trigger('click');
        expect(delete_stub.called).toEqual(false);
        expect(wrapper.findComponent({ref: 'delete_criterion_modal'}).exists()).toBe(false);
    });

    test('API error', async () => {
        await wrapper.find('.delete-icon').trigger('click');
        expect(wrapper.findComponent({ref: 'delete_criterion_modal'}).exists()).toBe(true);

        let delete_errors = wrapper.findComponent({ref: 'delete_criterion_errors'});
        expect(delete_errors.findAll('.error-msg').length).toEqual(0);

        delete_stub.returns(Promise.reject(new HttpError(403, 'Permission denied')));

        await wrapper.find('.delete-button').trigger('click');
        expect(await wait_until(wrapper, () => delete_errors.findAll('.error-msg').length !== 0))
            .toBe(true);
        expect(wrapper.findComponent({ref: 'delete_criterion_modal'}).exists()).toBe(true);
    });
});
