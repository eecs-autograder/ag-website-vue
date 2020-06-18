import { mount } from "@vue/test-utils";

import { Annotation } from "ag-client-typescript";

import AnnotationForm from "@/components/project_admin/handgrading_settings/annotation_form.vue";

import {
    emitted,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from "@/tests/utils";

describe('AnnotationForm tests', () => {
    let annotation = new Annotation({
        pk: 3,
        handgrading_rubric: 41,
        short_description: 'Spam',
        long_description: 'Egg',
        deduction: -4,
        max_deduction: -8,
        last_modified: ''
    });

    test('Default_input', () => {
        let wrapper = mount(AnnotationForm);
        expect(wrapper.vm.d_form_data).toEqual({
            short_description: '',
            long_description: '',
            deduction: 0,
            max_deduction: null,
        });
    });

    test('Non-default input', () => {
        let wrapper = mount(AnnotationForm, {
            propsData: {
                annotation: annotation
            }
        });

        expect(wrapper.vm.d_form_data).not.toBe(annotation);

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: annotation.short_description,
            long_description: annotation.long_description,
            deduction: annotation.deduction,
            max_deduction: annotation.max_deduction
        });
    });

    test('Input watcher', async () => {
        let wrapper = mount(AnnotationForm);
        expect(wrapper.vm.d_form_data).toEqual({
            short_description: '',
            long_description: '',
            deduction: 0,
            max_deduction: null,
        });

        wrapper.setProps({annotation: annotation});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_form_data).not.toBe(annotation);

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: annotation.short_description,
            long_description: annotation.long_description,
            deduction: annotation.deduction,
            max_deduction: annotation.max_deduction
        });
    });

    test('short_description binding', () => {
        let wrapper = mount(AnnotationForm, {propsData: {annotation: annotation}});
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'short_description'}))
        ).toEqual(annotation.short_description);

        set_validated_input_text(
            wrapper.findComponent({ref: 'short_description'}), 'An annotation');
        expect(wrapper.vm.d_form_data.short_description).toEqual('An annotation');
    });

    test('Invalid short_description empty', () => {
        let wrapper = mount(AnnotationForm, {propsData: {annotation: annotation}});
        set_validated_input_text(wrapper.findComponent({ref: 'short_description'}), '');
        expect(validated_input_is_valid(
            wrapper.findComponent({ref: 'short_description'}))).toEqual(false);
    });

    test('deduction binding', () => {
        let wrapper = mount(AnnotationForm, {propsData: {annotation: annotation}});
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'deduction'}))
        ).toEqual(annotation.deduction.toString());

        set_validated_input_text(wrapper.findComponent({ref: 'deduction'}), '-1');
        expect(wrapper.vm.d_form_data.deduction).toEqual(-1);
    });

    test('Invalid positive deduction', () => {
        let wrapper = mount(AnnotationForm);
        set_validated_input_text(wrapper.findComponent({ref: 'deduction'}), '2');
        expect(validated_input_is_valid(wrapper.findComponent({ref: 'deduction'}))).toEqual(false);
    });

    test('Invalid deduction empty or non integer', () => {
        let wrapper = mount(AnnotationForm, {propsData: {annotation: annotation}});
        set_validated_input_text(wrapper.findComponent({ref: 'deduction'}), '');
        expect(validated_input_is_valid(wrapper.findComponent({ref: 'deduction'}))).toEqual(false);

        set_validated_input_text(wrapper.findComponent({ref: 'deduction'}), '-42');
        expect(validated_input_is_valid(wrapper.findComponent({ref: 'deduction'}))).toEqual(true);

        set_validated_input_text(wrapper.findComponent({ref: 'deduction'}), 'spam');
        expect(validated_input_is_valid(wrapper.findComponent({ref: 'deduction'}))).toEqual(false);
    });

    test('max_deduction binding', () => {
        let wrapper = mount(AnnotationForm, {propsData: {annotation: annotation}});
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'max_deduction'}))
        ).toEqual('-8');

        set_validated_input_text(wrapper.findComponent({ref: 'max_deduction'}), '-12');
        expect(wrapper.vm.d_form_data.max_deduction).toEqual(-12);

        set_validated_input_text(wrapper.findComponent({ref: 'max_deduction'}), '');
        expect(wrapper.vm.d_form_data.max_deduction).toEqual(null);
    });

    test('Invalid positive max_deduction', () => {
        let wrapper = mount(AnnotationForm);
        set_validated_input_text(wrapper.findComponent({ref: 'max_deduction'}), '4');
        expect(
            validated_input_is_valid(wrapper.findComponent({ref: 'max_deduction'}))
        ).toEqual(false);
    });

    test('Invalid max_deduction non integer', () => {
        let wrapper = mount(AnnotationForm, {propsData: {annotation: annotation}});
        set_validated_input_text(wrapper.findComponent({ref: 'max_deduction'}), 'spam');
        expect(
            validated_input_is_valid(wrapper.findComponent({ref: 'max_deduction'}))
        ).toEqual(false);
    });

    test('long_description binding', () => {
        let wrapper = mount(AnnotationForm, {propsData: {annotation: annotation}});
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'long_description'}))
        ).toEqual(annotation.long_description);

        set_validated_input_text(
            wrapper.findComponent({ref: 'long_description'}), 'Very annotation');
        expect(wrapper.vm.d_form_data.long_description).toEqual('Very annotation');
    });

    test('form_validity_changed', () => {
        let wrapper = mount(AnnotationForm);
        set_validated_input_text(
            wrapper.findComponent({ref: 'short_description'}), 'An annotation');
        expect(emitted(wrapper, 'form_validity_changed').length).toEqual(2);
        expect(emitted(wrapper, 'form_validity_changed')).toEqual([[false], [true]]);
    });

    test('Submit', () => {
        let wrapper = mount(AnnotationForm);
        set_validated_input_text(
            wrapper.findComponent({ref: 'short_description'}), 'An annotation');
        set_validated_input_text(
            wrapper.findComponent({ref: 'long_description'}), 'Very annotation');
        set_validated_input_text(wrapper.findComponent({ref: 'deduction'}), '-1');
        set_validated_input_text(wrapper.findComponent({ref: 'max_deduction'}), '-2');

        wrapper.vm.submit();
        expect(emitted(wrapper, 'submit').length).toEqual(1);
        expect(
            emitted(wrapper, 'submit')[0][0]
        ).toEqual({
            short_description: 'An annotation',
            long_description: 'Very annotation',
            deduction: -1,
            max_deduction: -2
        });
    });

    test('Reset', () => {
        let wrapper = mount(AnnotationForm);
        set_validated_input_text(
            wrapper.findComponent({ref: 'short_description'}), 'An annotation');
        set_validated_input_text(
            wrapper.findComponent({ref: 'long_description'}), 'Very annotation');
        set_validated_input_text(wrapper.findComponent({ref: 'deduction'}), '-1');
        set_validated_input_text(wrapper.findComponent({ref: 'max_deduction'}), '-2');

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: 'An annotation',
            long_description: 'Very annotation' ,
            deduction: -1,
            max_deduction: -2
        });

        wrapper.vm.reset();

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: '',
            long_description: '' ,
            deduction: 0,
            max_deduction: null
        });
    });
});
