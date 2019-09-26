import { mount } from "@vue/test-utils";

import { Criterion } from "ag-client-typescript";

import CriterionForm from "@/components/project_admin/handgrading_settings/criterion_form.vue";

import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from "@/tests/utils";

describe('CriterionForm tests', () => {
    let criterion = new Criterion({
        pk: 3,
        handgrading_rubric: 41,
        short_description: 'Spam',
        long_description: 'Egg',
        points: 4,
        last_modified: ''
    });

    test('Default_input', () => {
        let wrapper = mount(CriterionForm);
        expect(wrapper.vm.d_form_data).toEqual({
            short_description: '',
            long_description: '',
            points: 0
        });
    });

    test('Non-default input', () => {
        let wrapper = mount(CriterionForm, {
            propsData: {
                criterion: criterion
            }
        });

        expect(wrapper.vm.d_form_data).not.toBe(criterion);

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: criterion.short_description,
            long_description: criterion.long_description,
            points: criterion.points,
        });
    });

    test('Input watcher', () => {
        let wrapper = mount(CriterionForm);
        expect(wrapper.vm.d_form_data).toEqual({
            short_description: '',
            long_description: '',
            points: 0
        });

        wrapper.setProps({criterion: criterion});

        expect(wrapper.vm.d_form_data).not.toBe(criterion);

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: criterion.short_description,
            long_description: criterion.long_description,
            points: criterion.points,
        });
    });

    test('short_description binding', () => {
        let wrapper = mount(CriterionForm, {propsData: {criterion: criterion}});
        expect(
            get_validated_input_text(wrapper.find({ref: 'short_description'}))
        ).toEqual(criterion.short_description);

        set_validated_input_text(wrapper.find({ref: 'short_description'}), 'An criterion');
        expect(wrapper.vm.d_form_data.short_description).toEqual('An criterion');
    });

    test('Invalid short_description empty', () => {
        let wrapper = mount(CriterionForm, {propsData: {criterion: criterion}});
        set_validated_input_text(wrapper.find({ref: 'short_description'}), '');
        expect(validated_input_is_valid(wrapper.find({ref: 'short_description'}))).toEqual(false);
    });

    test('points binding', () => {
        let wrapper = mount(CriterionForm, {propsData: {criterion: criterion}});
        expect(
            get_validated_input_text(wrapper.find({ref: 'points'}))
        ).toEqual(criterion.points.toString());

        set_validated_input_text(wrapper.find({ref: 'points'}), '3');
        expect(wrapper.vm.d_form_data.points).toEqual(3);
    });

    test('Invalid points empty or non integer', () => {
        let wrapper = mount(CriterionForm, {propsData: {criterion: criterion}});
        set_validated_input_text(wrapper.find({ref: 'points'}), '');
        expect(validated_input_is_valid(wrapper.find({ref: 'points'}))).toEqual(false);

        set_validated_input_text(wrapper.find({ref: 'points'}), '42');
        expect(validated_input_is_valid(wrapper.find({ref: 'points'}))).toEqual(true);

        set_validated_input_text(wrapper.find({ref: 'points'}), 'spam');
        expect(validated_input_is_valid(wrapper.find({ref: 'points'}))).toEqual(false);
    });

    test('long_description binding', () => {
        let wrapper = mount(CriterionForm, {propsData: {criterion: criterion}});
        expect(
            get_validated_input_text(wrapper.find({ref: 'long_description'}))
        ).toEqual(criterion.long_description);

        set_validated_input_text(wrapper.find({ref: 'long_description'}), 'Very criterion');
        expect(wrapper.vm.d_form_data.long_description).toEqual('Very criterion');
    });

    test('form_validity_changed', () => {
        let wrapper = mount(CriterionForm);
        set_validated_input_text(wrapper.find({ref: 'short_description'}), 'An criterion');
        expect(wrapper.emitted().form_validity_changed.length).toEqual(2);
        expect(wrapper.emitted().form_validity_changed).toEqual([[false], [true]]);
    });

    test('Submit', () => {
        let wrapper = mount(CriterionForm);
        set_validated_input_text(wrapper.find({ref: 'short_description'}), 'An criterion');
        set_validated_input_text(wrapper.find({ref: 'long_description'}), 'Very criterion');
        set_validated_input_text(wrapper.find({ref: 'points'}), '12');

        wrapper.vm.submit();
        expect(wrapper.emitted().submit.length).toEqual(1);
        expect(
            wrapper.emitted().submit[0][0]
        ).toEqual(
            {short_description: 'An criterion', long_description: 'Very criterion', points: 12}
        );
    });

    test('Reset', () => {
        let wrapper = mount(CriterionForm);
        set_validated_input_text(wrapper.find({ref: 'short_description'}), 'An criterion');
        set_validated_input_text(wrapper.find({ref: 'long_description'}), 'Very criterion');
        set_validated_input_text(wrapper.find({ref: 'points'}), '12');

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: 'An criterion',
            long_description: 'Very criterion' ,
            points: 12,
        });

        wrapper.vm.reset();

        expect(wrapper.vm.d_form_data).toEqual({
            short_description: '',
            long_description: '' ,
            points: 0,
        });
    });
});
