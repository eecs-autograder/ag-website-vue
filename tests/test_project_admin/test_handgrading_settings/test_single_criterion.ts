import { mount, Wrapper } from "@vue/test-utils";

import { Criterion, HttpError } from "ag-client-typescript";
import * as sinon from 'sinon';

import APIErrors from "@/components/api_errors.vue";
import CriterionForm from "@/components/project_admin/handgrading_settings/criterion_form.vue";
import SingleCriterion from "@/components/project_admin/handgrading_settings/single_criterion.vue";

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
    test('Input value and watcher', () => {
        const wrapper = mount(SingleCriterion, {propsData: {criterion: criterion}});
        expect(wrapper.vm.d_criterion).not.toBe(criterion);
        expect(wrapper.vm.d_criterion).toEqual(criterion);

        let other = new Criterion({
            pk: 3,
            handgrading_rubric: 41,
            short_description: 'Waa',
            long_description: '',
            points: 5,
            last_modified: ''
        });
        wrapper.setProps({criterion: other});
        expect(wrapper.vm.d_criterion).not.toBe(other);
        expect(wrapper.vm.d_criterion).toEqual(other);
    });

    test('Toggle edit mode', () => {
        const wrapper = mount(SingleCriterion, {propsData: {criterion: criterion}});
        expect(wrapper.find({ref: 'criterion_form'}).exists()).toEqual(false);
        wrapper.vm.d_edit_mode = true;
        expect(wrapper.find({ref: 'criterion_form'}).exists()).toEqual(true);
    });

    test('Short description displyed', () => {
        const wrapper = mount(SingleCriterion, {propsData: {criterion: criterion}});
        expect(wrapper.find('.short-description').text()).toEqual(criterion.short_description);
    });

    test('Points displayed', () => {
        const wrapper = mount(SingleCriterion, {propsData: {criterion: criterion}});
        expect(wrapper.find('.points').text()).toEqual('4 points');

        wrapper.vm.d_criterion.points = 1;
        expect(wrapper.find('.points').text()).toEqual('1 point');
    });

    test('Long description displayed when not empty', () => {
        const wrapper = mount(SingleCriterion, {propsData: {criterion: criterion}});
        expect(wrapper.find('.long-description').text()).toEqual(criterion.long_description);

        wrapper.vm.d_criterion.long_description = '';
        expect(wrapper.find('.long-description').exists()).toEqual(false);
    });
});

describe('Save criterion tests', () => {
    let wrapper: Wrapper<SingleCriterion>;
    let save_stub: sinon.SinonStub;

    beforeEach(async () => {
        wrapper = mount(SingleCriterion, {propsData: {criterion: criterion}});
        wrapper.vm.d_edit_mode = true;
        await wrapper.vm.$nextTick();
        save_stub = sinon.stub(wrapper.vm.d_criterion, 'save').returns(Promise.resolve());
    });

    afterEach(() => {
       sinon.restore();
    });

    test('Save', async () => {
        expect(wrapper.vm.d_criterion_form_is_valid).toEqual(true);

        (<CriterionForm> wrapper.find({ref: 'criterion_form'}).vm).d_form_data = {
            short_description: 'new short description',
            points: 78,
            long_description: 'new long description',
        };

        wrapper.find({ref: 'criterion_form'}).trigger('submit');

        await wrapper.vm.$nextTick();

        expect(save_stub.calledOnce).toEqual(true);
        expect(wrapper.vm.d_edit_mode).toEqual(false);

        expect(wrapper.vm.d_criterion.short_description).toEqual('new short description');
        expect(wrapper.vm.d_criterion.points).toEqual(78);
        expect(wrapper.vm.d_criterion.long_description).toEqual('new long description');
    });

    test('Save button disabled when form is invalid', async () => {
        let new_input = new Criterion(criterion);
        new_input.short_description = '';
        wrapper.setProps({criterion: new_input});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_criterion_form_is_valid).toEqual(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toEqual(true);
    });

    test('API error', async () => {
        save_stub.returns(Promise.reject(new HttpError(403, 'Permission denied')));

        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'save_criterion_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(0);

        expect(wrapper.vm.d_criterion_form_is_valid).toEqual(true);
        wrapper.find({ref: 'criterion_form'}).trigger('submit');

        await wrapper.vm.$nextTick();

        expect(api_errors.d_api_errors.length).toEqual(1);
    });
});

describe('Delete criterion tests', () => {
    let wrapper: Wrapper<SingleCriterion>;
    let delete_stub: sinon.SinonStub;

    beforeEach(() => {
        wrapper = mount(SingleCriterion, {propsData: {criterion: criterion}});
        delete_stub = sinon.stub(wrapper.vm.d_criterion, 'delete').returns(Promise.resolve());
    });

    test('Delete', async () => {
        wrapper.find('.delete-icon').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find({ref: 'delete_criterion_modal'}).exists()).toBe(true);

        wrapper.find('.delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(delete_stub.calledOnce).toEqual(true);
        expect(wrapper.find({ref: 'delete_criterion_modal'}).exists()).toBe(false);
    });

    test('Cancel delete', async () => {
        wrapper.find('.delete-icon').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find({ref: 'delete_criterion_modal'}).exists()).toBe(true);

        wrapper.find('.cancel-delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(delete_stub.called).toEqual(false);
        expect(wrapper.find({ref: 'delete_criterion_modal'}).exists()).toBe(false);
    });

    test('API error', async () => {
        wrapper.find('.delete-icon').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find({ref: 'delete_criterion_modal'}).exists()).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'delete_criterion_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(0);

        delete_stub.returns(Promise.reject(new HttpError(403, 'Permission denied')));

        wrapper.find('.delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(api_errors.d_api_errors.length).toEqual(1);
        expect(wrapper.find({ref: 'delete_criterion_modal'}).exists()).toBe(true);
    });
});
