import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { config, mount } from '@vue/test-utils';

import { sleep } from './utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ValidatedForm.vue', () => {
    test('is_valid returns true only if all ValidatedInputs are valid ', async () => {
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

        await wrapper.vm.$nextTick();

        expect(form_vm.d_validated_inputs.length).toBe(2);
        expect(form_vm.is_valid).toBe(false);

        wrapper.setData({value2: 42});
        await wrapper.vm.$nextTick();
        expect(form_vm.is_valid).toBe(true);

        wrapper.setData({value1: "invalid"});
        await wrapper.vm.$nextTick();
        expect(form_vm.is_valid).toBe(false);

        wrapper.setData({value2: "invalid"});
        await wrapper.vm.$nextTick();
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

    test('is_valid works with a single ValidatedInput child', async () => {
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
        await wrapper.vm.$nextTick();

        expect(form_vm.is_valid).toBe(false);

        (<HTMLInputElement> validated_input.find('#input').element).value = "2001";
        validated_input.find('#input').trigger('input');
        await wrapper.vm.$nextTick();

        expect(form_vm.is_valid).toBe(true);
    });

    test('is_valid works with deeply nested ValidatedInput elements', async () => {
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
        await wrapper.vm.$nextTick();
        expect(form_vm.is_valid).toBe(true);

        wrapper.setData({value1: "invalid"});
        await wrapper.vm.$nextTick();
        expect(form_vm.is_valid).toBe(false);

        wrapper.setData({value1: 23});
        await wrapper.vm.$nextTick();
        expect(form_vm.is_valid).toBe(true);

        wrapper.setData({value2: "invalid"});
        await wrapper.vm.$nextTick();
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
        await wrapper.vm.$nextTick();

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

    test('reset_warning_state hides warnings for all input fields ', async () => {
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
                    value1: "not a number",
                    value2: "also not a number"
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
        const form_vm = <ValidatedForm> wrapper.find({ref: 'form'}).vm;
        const vinput1 = wrapper.find({ref: 'validated_input_1'});
        const vinput1_vm = <ValidatedInput> vinput1.vm;
        const vinput2 =  wrapper.find({ref: 'validated_input_2'});
        const vinput2_vm = <ValidatedInput> vinput2.vm;

        expect(form_vm.is_valid).toBe(false);
        expect(vinput1_vm.d_show_warnings).toBe(false);
        expect(vinput2_vm.d_show_warnings).toBe(false);

        // Change the inputs so that error messages are displayed
        (<HTMLInputElement> vinput1.find('#input').element).value = "invalid value 1";
        vinput1.find('#input').trigger('input');
        (<HTMLInputElement> vinput2.find('#input').element).value = "invalid value 2";
        vinput2.find('#input').trigger('input');
        await sleep(0.75);
        await wrapper.vm.$nextTick();

        // Make sure error messages are displayed
        expect(vinput1_vm.d_show_warnings).toBe(true);
        expect(vinput2_vm.d_show_warnings).toBe(true);
        await vinput1_vm.$nextTick();
        await vinput2_vm.$nextTick();
        await form_vm.$nextTick();
        expect(vinput1.find('#error-text').exists()).toBe(true);
        expect(vinput2.find('#error-text').exists()).toBe(true);
        expect((<HTMLInputElement> vinput1.find('#input').element).value).toBe("invalid value 1");
        expect((<HTMLInputElement> vinput2.find('#input').element).value).toBe("invalid value 2");

        // Clear
        form_vm.reset_warning_state();
        await wrapper.vm.$nextTick();

        // Make sure error messages are no longer displayed, and that inputs are cleared
        expect(vinput1_vm.d_show_warnings).toBe(false);
        expect(vinput2_vm.d_show_warnings).toBe(false);
        expect(vinput1.find('#error-text').exists()).toBe(false);
        expect(vinput2.find('#error-text').exists()).toBe(false);
        expect((<HTMLInputElement> vinput1.find('#input').element).value).toBe("invalid value 1");
        expect((<HTMLInputElement> vinput2.find('#input').element).value).toBe("invalid value 2");
    });
});
