import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import { config, mount } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ValidatedForm.vue', () => {
    test('is_valid returns true only if all ValidatedInputs are valid ', () => {
        const component = {
            template:  `<validated-form ref="form">
                          <validated-input ref="validated_input_1" v-model="value1"
                                           :validators="[is_number]"/>
                          <validated-input ref="validated_input_2" v-model="value2"
                                           :validators="[is_number]"/>
                        </validated-form>`,
            components: {
                'validated-form': ValidatedForm,
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    value1: 12,
                    value2: "not a number"
                };
            },
            methods: {
                is_number: (value: string): ValidatorResponse => {
                    return {
                        is_valid: value !== "" && !isNaN(Number(value)),
                        error_msg: "Invalid number!"
                    };
                }
            }
        };

        const wrapper = mount(component);
        const form = wrapper.find({ref: 'form'});
        const form_vm = <ValidatedForm> form.vm;

        expect(form_vm.d_validated_inputs.length).toBe(2);
        expect(form_vm.is_valid).toBe(false);

        wrapper.setData({value2: 42});
        expect(form_vm.is_valid).toBe(true);

        wrapper.setData({value1: "invalid"});
        expect(form_vm.is_valid).toBe(false);

        wrapper.setData({value2: "invalid"});
        expect(form_vm.is_valid).toBe(false);
    });

    test('is_valid returns true if there are no child ValidatedInputs', () => {
        const component = {
            template:  `<validated-form ref="form">
                          <div>hello</div>
                        </validated-form>`,
            components: {
                'validated-form': ValidatedForm,
            },
        };

        const wrapper = mount(component);
        const form_vm = <ValidatedForm> wrapper.find({ref: 'form'}).vm;

        expect(form_vm.d_validated_inputs.length).toBe(0);
        expect(form_vm.is_valid).toBe(true);

    });

    test('is_valid works with a single ValidatedInput child', () => {
        const component = {
            template:  `<validated-form ref="form">
                          <validated-input ref="validated_input_1" v-model="value1"
                                           :validators="[is_number]"/>
                        </validated-form>`,
            components: {
                'validated-form': ValidatedForm,
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    value1: 32,
                };
            },
            methods: {
                is_number: (value: string): ValidatorResponse => {
                    return {
                        is_valid: value !== "" && !isNaN(Number(value)),
                        error_msg: "Invalid number!"
                    };
                }
            }
        };

        const wrapper = mount(component);
        const form = wrapper.find({ref: 'form'});
        const form_vm = <ValidatedForm> form.vm;

        expect(form_vm.d_validated_inputs.length).toBe(1);
        expect(form_vm.is_valid).toBe(true);

        const validated_input = wrapper.find({ref: 'validated_input_1'});
        (<HTMLInputElement> validated_input.find('#input').element).value = "invalid";
        validated_input.find('#input').trigger('input');

        expect(form_vm.is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find('#input').element).value = "2001";
        validated_input.find('#input').trigger('input');
        expect(form_vm.is_valid).toBe(true);
    });

    test('is_valid works with deeply nested ValidatedInput elements', () => {
        const component = {
            template:  `<validated-form ref="form">
                          <div>
                            <div>
                              <validated-input ref="validated_input_1" v-model="value1"
                                           :validators="[is_number]"/>
                            </div>
                            <validated-input ref="validated_input_2" v-model="value2"
                                           :validators="[is_number]"/>
                          </div>
                          <validated-input ref="validated_input_3" v-model="value3"
                                           :validators="[is_number]"/>
                        </validated-form>`,
            components: {
                'validated-form': ValidatedForm,
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    value1: 32,
                    value2: 3,
                    value3: "invalid"
                };
            },
            methods: {
                is_number: (value: string): ValidatorResponse => {
                    return {
                        is_valid: value !== "" && !isNaN(Number(value)),
                        error_msg: "Invalid number!"
                    };
                }
            }
        };

        const wrapper = mount(component);
        const form = wrapper.find({ref: 'form'});
        const form_vm = <ValidatedForm> form.vm;

        expect(form_vm.d_validated_inputs.length).toBe(3);
        expect(form_vm.is_valid).toBe(false);

        wrapper.setData({value3: 42});
        expect(form_vm.is_valid).toBe(true);

        wrapper.setData({value1: "invalid"});
        expect(form_vm.is_valid).toBe(false);

        wrapper.setData({value1: 23});
        expect(form_vm.is_valid).toBe(true);

        wrapper.setData({value2: "invalid"});
        expect(form_vm.is_valid).toBe(false);
    });

    test('register is defined and called in nested validated-input elements', () => {
        const component = {
            template:  `<validated-form ref="form">
                          <validated-input ref="validated_input_1" v-model="value1"
                                           :validators="[is_number]"/>
                        </validated-form>`,
            components: {
                'validated-form': ValidatedForm,
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    value1: 32,
                };
            },
            methods: {
                is_number: (value: string): ValidatorResponse => {
                    return {
                        is_valid: value !== "" && !isNaN(Number(value)),
                        error_msg: "Invalid number!"
                    };
                }
            }
        };

        const wrapper = mount(component);
        const validated_input = <ValidatedInput> wrapper.find({ref: 'validated_input_1'}).vm;
        expect(validated_input.register).toBeDefined();
    });

    test('form_validity_changed gets triggered when is_valid changes', async () => {
        const component = {
            template: `<validated-form ref="form" @form_validity_changed="form_is_valid = $event">
                         <validated-input ref="validated_input" v-model="value1"
                                          :validators="[is_number]"/>
                       </validated-form>`,
            components: {
                'validated-form': ValidatedForm,
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    value1: 32,
                    form_is_valid: false,
                };
            },
            methods: {
                is_number: function(value: string): ValidatorResponse {
                    return {
                        is_valid: value !== "" && !isNaN(Number(value)),
                        error_msg: "Invalid number!"
                    };
                }
            }
        };

        let wrapper = mount(component);
        let form_vm = <ValidatedForm> wrapper.find({ref: 'form'}).vm;
        let validated_input = wrapper.find({ref: 'validated_input'});

        expect(form_vm.is_valid).toBe(true);
        expect(wrapper.vm.$data.form_is_valid).toBe(true);

        (<HTMLInputElement> validated_input.find('#input').element).value = "42";
        validated_input.find('#input').trigger('input');

        expect(form_vm.is_valid).toBe(true);
        expect(wrapper.vm.$data.form_is_valid).toBe(true);

        (<HTMLInputElement> validated_input.find('#input').element).value = "invalid";
        validated_input.find('#input').trigger('input');
        await wrapper.vm.$nextTick();

        expect(form_vm.is_valid).toBe(false);
        expect(wrapper.vm.$data.form_is_valid).toBe(false);

        // Back to valid
        (<HTMLInputElement> validated_input.find('#input').element).value = "3";
        validated_input.find('#input').trigger('input');
        await wrapper.vm.$nextTick();

        expect(form_vm.is_valid).toBe(true);
        expect(wrapper.vm.$data.form_is_valid).toBe(true);
    });
});
