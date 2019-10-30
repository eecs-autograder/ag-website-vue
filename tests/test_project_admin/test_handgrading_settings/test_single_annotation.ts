import { mount, Wrapper } from "@vue/test-utils";

import { Annotation, HttpError } from "ag-client-typescript";
import * as sinon from 'sinon';

import APIErrors from "@/components/api_errors.vue";
import AnnotationForm from "@/components/project_admin/handgrading_settings/annotation_form.vue";
import SingleAnnotation from "@/components/project_admin/handgrading_settings/single_annotation.vue";

let annotation: Annotation;

beforeEach(() => {
    annotation = new Annotation({
        pk: 3,
        handgrading_rubric: 41,
        short_description: 'Spam',
        long_description: 'Egg',
        deduction: -4,
        max_deduction: -7,
        last_modified: ''
    });
});

describe('SingleAnnotation tests', () => {
    test('Input value and watcher', () => {
        const wrapper = mount(SingleAnnotation, {propsData: {annotation: annotation}});
        expect(wrapper.vm.d_annotation).not.toBe(annotation);
        expect(wrapper.vm.d_annotation).toEqual(annotation);

        let other = new Annotation({
            pk: 3,
            handgrading_rubric: 41,
            short_description: 'Waa',
            long_description: '',
            deduction: -5,
            max_deduction: -8,
            last_modified: ''
        });
        wrapper.setProps({annotation: other});
        expect(wrapper.vm.d_annotation).not.toBe(other);
        expect(wrapper.vm.d_annotation).toEqual(other);
    });

    test('Toggle edit mode', () => {
        const wrapper = mount(SingleAnnotation, {propsData: {annotation: annotation}});
        expect(wrapper.find({ref: 'annotation_form'}).exists()).toEqual(false);
        wrapper.vm.d_edit_mode = true;
        expect(wrapper.find({ref: 'annotation_form'}).exists()).toEqual(true);
    });

    test('Short description displyed', () => {
        const wrapper = mount(SingleAnnotation, {propsData: {annotation: annotation}});
        expect(wrapper.find('.short-description').text()).toEqual(annotation.short_description);
    });

    test('Deduction and max_deduction displayed', () => {
        annotation.max_deduction = null;
        const wrapper = mount(SingleAnnotation, {propsData: {annotation: annotation}});
        expect(wrapper.find('.deduction').text()).toEqual('-4 points');

        wrapper.vm.d_annotation.deduction = -1;
        expect(wrapper.find('.deduction').text()).toEqual('-1 point');

        wrapper.vm.d_annotation.max_deduction = -3;
        expect(
            wrapper.find('.deduction').text().replace(/\s+/g, ' ')
        ).toEqual('-1 point (-3 max)');
    });

    test('Long description displayed when not empty', () => {
        const wrapper = mount(SingleAnnotation, {propsData: {annotation: annotation}});
        expect(wrapper.find('.long-description').text()).toEqual(annotation.long_description);

        wrapper.vm.d_annotation.long_description = '';
        expect(wrapper.find('.long-description').exists()).toEqual(false);
    });
});

describe('Save annotation tests', () => {
    let wrapper: Wrapper<SingleAnnotation>;
    let save_stub: sinon.SinonStub;

    beforeEach(async () => {
        wrapper = mount(SingleAnnotation, {propsData: {annotation: annotation}});
        wrapper.vm.d_edit_mode = true;
        await wrapper.vm.$nextTick();
        save_stub = sinon.stub(wrapper.vm.d_annotation, 'save').returns(Promise.resolve());
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Save', async () => {
        expect(wrapper.vm.d_annotation_form_is_valid).toEqual(true);

        (<AnnotationForm> wrapper.find({ref: 'annotation_form'}).vm).d_form_data = {
            short_description: 'new short description',
            deduction: -7,
            max_deduction: -14,
            long_description: 'new long description',
        };

        wrapper.find({ref: 'annotation_form'}).trigger('submit');

        await wrapper.vm.$nextTick();

        expect(save_stub.calledOnce).toEqual(true);
        expect(wrapper.vm.d_edit_mode).toEqual(false);

        expect(wrapper.vm.d_annotation.short_description).toEqual('new short description');
        expect(wrapper.vm.d_annotation.deduction).toEqual(-7);
        expect(wrapper.vm.d_annotation.max_deduction).toEqual(-14);
        expect(wrapper.vm.d_annotation.long_description).toEqual('new long description');
    });

    test('Save button disabled when form is invalid', async () => {
        let new_input = new Annotation(annotation);
        new_input.short_description = '';
        wrapper.setProps({annotation: new_input});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_annotation_form_is_valid).toEqual(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toEqual(true);
    });

    test('API error', async () => {
        save_stub.returns(Promise.reject(new HttpError(403, 'Permission denied')));

        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'save_annotation_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(0);

        expect(wrapper.vm.d_annotation_form_is_valid).toEqual(true);
        wrapper.find({ref: 'annotation_form'}).trigger('submit');

        await wrapper.vm.$nextTick();

        expect(api_errors.d_api_errors.length).toEqual(1);
    });
});

describe('Delete annotation tests', () => {
    let wrapper: Wrapper<SingleAnnotation>;
    let delete_stub: sinon.SinonStub;

    beforeEach(() => {
        wrapper = mount(SingleAnnotation, {propsData: {annotation: annotation}});
        delete_stub = sinon.stub(wrapper.vm.d_annotation, 'delete').returns(Promise.resolve());
    });

    test('Delete', async () => {
        wrapper.find('.delete-icon').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find({ref: 'delete_annotation_modal'}).exists()).toBe(true);

        wrapper.find('.delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(delete_stub.calledOnce).toEqual(true);
        expect(wrapper.find({ref: 'delete_annotation_modal'}).exists()).toBe(false);
    });

    test('Cancel delete', async () => {
        wrapper.find('.delete-icon').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find({ref: 'delete_annotation_modal'}).exists()).toBe(true);

        wrapper.find('.cancel-delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(delete_stub.called).toEqual(false);
        expect(wrapper.find({ref: 'delete_annotation_modal'}).exists()).toBe(false);
    });

    test('API error', async () => {
        wrapper.find('.delete-icon').trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find({ref: 'delete_annotation_modal'}).exists()).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'delete_annotation_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(0);

        delete_stub.returns(Promise.reject(new HttpError(403, 'Permission denied')));

        wrapper.find('.delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(api_errors.d_api_errors.length).toEqual(1);
        expect(wrapper.find({ref: 'delete_annotation_modal'}).exists()).toBe(true);
    });
});
