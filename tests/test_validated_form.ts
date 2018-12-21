import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import { config, mount } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ValidatedForm.vue', () => {
    test('is_valid returns true only if all ValidatedInputs are valid ', () => {
        const component = {
            template:  `<validated-form ref="vform">
                          <validated-input ref="vinput_1" v-model="value1"
                                           :validators="[is_number]"/>
                          <validated-input ref="vinput_2" v-model="value2"
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
        const vform = wrapper.find({ref: 'vform'});
        const vform_vm = <ValidatedForm> vform.vm;

        expect(vform_vm.d_validated_inputs.length).toBe(2);
        expect(vform_vm.is_valid).toBe(false);

        wrapper.setData({value2: 42});
        expect(vform_vm.is_valid).toBe(true);

        wrapper.setData({value1: "invalid"});
        expect(vform_vm.is_valid).toBe(false);

        wrapper.setData({value2: "invalid"});
        expect(vform_vm.is_valid).toBe(false);
    });

    test('is_valid returns true if there are no child ValidatedInputs', () => {
        const component = {
            template:  `<validated-form ref="vform">
                          <div>hello</div>
                        </validated-form>`,
            components: {
                'validated-form': ValidatedForm,
            },
        };

        const wrapper = mount(component);
        const vform_vm = <ValidatedForm> wrapper.find({ref: 'vform'}).vm;

        expect(vform_vm.d_validated_inputs.length).toBe(0);
        expect(vform_vm.is_valid).toBe(true);

    });

    test('is_valid works with a single ValidatedInput child', () => {
        const component = {
            template:  `<validated-form ref="vform">
                          <validated-input ref="vinput_1" v-model="value1"
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
        const vform = wrapper.find({ref: 'vform'});
        const vform_vm = <ValidatedForm> vform.vm;

        expect(vform_vm.d_validated_inputs.length).toBe(1);
        expect(vform_vm.is_valid).toBe(true);

        const vinput = wrapper.find({ref: 'vinput_1'});
        (<HTMLInputElement> vinput.find('#input').element).value = "invalid";
        vinput.find('#input').trigger('input');

        expect(vform_vm.is_valid).toBe(false);

        (<HTMLInputElement> vinput.find('#input').element).value = "2001";
        vinput.find('#input').trigger('input');
        expect(vform_vm.is_valid).toBe(true);
    });

    test('is_valid works with deeply nested ValidatedInput elements', () => {
        const component = {
            template:  `<validated-form ref="vform">
                          <div>
                            <div>
                              <validated-input ref="vinput_1" v-model="value1"
                                           :validators="[is_number]"/>
                            </div>
                            <validated-input ref="vinput_2" v-model="value2"
                                           :validators="[is_number]"/>
                          </div>
                          <validated-input ref="vinput_3" v-model="value3"
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
        const vform = wrapper.find({ref: 'vform'});
        const vform_vm = <ValidatedForm> vform.vm;

        expect(vform_vm.d_validated_inputs.length).toBe(3);
        expect(vform_vm.is_valid).toBe(false);

        wrapper.setData({value3: 42});
        expect(vform_vm.is_valid).toBe(true);

        wrapper.setData({value1: "invalid"});
        expect(vform_vm.is_valid).toBe(false);

        wrapper.setData({value1: 23});
        expect(vform_vm.is_valid).toBe(true);

        wrapper.setData({value2: "invalid"});
        expect(vform_vm.is_valid).toBe(false);
    });

    test('register is defined and called in nested validated-input elements', () => {
        const component = {
            template:  `<validated-form ref="vform">
                          <validated-input ref="vinput_1" v-model="value1"
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
        const vinput = <ValidatedInput> wrapper.find({ref: 'vinput_1'}).vm;
        expect(vinput.register).toBeDefined();
    });
});
