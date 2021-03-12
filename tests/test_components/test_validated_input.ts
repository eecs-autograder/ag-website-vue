import {  mount, Wrapper } from '@vue/test-utils';

import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import { emitted, expect_html_element_has_value, set_validated_input_text, sleep } from '@/tests/utils';


const IS_NUMBER = (value: string): ValidatorResponse => {
    return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg: "Invalid number!"
    };
};

describe('ValidatedInput.vue', () => {
    test('Validated input uses default string conversion when to_string_fn not present',
         async () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        await wrapper.vm.$nextTick();
        const input: HTMLInputElement = <HTMLInputElement> wrapper.find('input').element;
        expect(input.value).toBe("1");
    });

    test('If placeholder text is specified, it appears when the input is empty', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: 1,
                validators: [IS_NUMBER],
                placeholder: "Please enter a number",
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        expect(wrapper.vm.is_valid).toBe(true);

        let input = wrapper.find('input');
        (<HTMLInputElement> input.element).value = '';
        input.trigger('input');

        expect(wrapper.vm.is_valid).toBe(false);
        expect(input.attributes().placeholder).toEqual("Please enter a number");
    });

    test('Validated input uses default when from_string_fn not present', async () => {
        const component = {
            template:  `<validated-input ref="validated_input_1" v-model="my_input"
                                         :validators="[(v) => {
                                           return {
                                              'is_valid': true,
                                              'error_msg': 'placeholder'
                                           }}]"/>`,
            components: {
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    my_input: "hello"
                };
            }
        };

        const wrapper = mount(component);
        const validated_input = wrapper.findComponent({ref: 'validated_input_1'});
        const validated_input_vm = <ValidatedInput> validated_input.vm;
        expect(validated_input_vm.d_input_value).toEqual("hello");

        // Changing variable in parent component should update variable in child component
        await wrapper.setData({my_input: "hey"});
        expect(validated_input_vm.d_input_value).toEqual("hey");

        // Changing input in child component should update variable in parent component
        // (this time, using default from_string_fn)
        await validated_input.find('input').setValue("yo");

        expect(validated_input_vm.d_input_value).toEqual("yo");
        expect(wrapper.vm.$data.my_input).toEqual("yo");
    });

    test('v-modal variable not updated when a validators fails', () => {
        const component = {
            template:  `<validated-input ref="validated_input_1" v-model="my_input"
                                         :validators="[
                                            (val) => {
                                              return {
                                                 is_valid: val === 'hello',
                                                 error_msg: 'error'
                                              }
                                            }]"/>`,
            components: {
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    my_input: "hello"
                };
            }
        };

        const wrapper = mount(component);

        const validated_input = wrapper.findComponent({ref: 'validated_input_1'});
        const validated_input_vm = <ValidatedInput> validated_input.vm;

        expect(validated_input_vm.d_input_value).toEqual("hello");

        // Change input to an invalid value (should trigger validator error)
        (<HTMLInputElement> validated_input.find('input').element).value = "yo";
        validated_input.find('input').trigger('input');

        // Local input should change, but variable should NOT be updated
        expect(validated_input_vm.d_input_value).toEqual("yo");
        expect(validated_input_vm.d_error_msg).toEqual("error");
        expect(wrapper.vm.$data.my_input).toEqual("hello");
    });

    test('Only first failed validator\'s error message is displayed', async () => {
        const component = {
            template:  `<validated-input ref="validated_input_1" v-model="my_input"
                                         :validators="[
                                            (val) => {
                                              return {
                                                is_valid: val === 'hello',
                                                error_msg: 'is not hello'
                                              };
                                            },
                                            (val) => {
                                              return {
                                                is_valid: val !== val,
                                                error_msg: 'should always be displayed'
                                              };
                                            }
                                         ]"/>`,
            components: {
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    my_input: "placeholder"
                };
            }
        };

        const wrapper = mount(component);
        const validated_input = wrapper.findComponent({ref: 'validated_input_1'});

        // Make a change in the input so that error messages are initially displayed
        wrapper.find('input').setValue("hello");
        await wrapper.vm.$nextTick();

        // Make sure second error message is displayed after delay
        await sleep(0.75);
        await wrapper.vm.$nextTick();
        let error_msg = validated_input.find('.error-text').text();
        let expected_error_msg = 'should always be displayed';
        expect(error_msg).toEqual(expected_error_msg);

        // Change input to fail first validator
        validated_input.find('input').setValue("yo");
        await wrapper.vm.$nextTick();

        // Even though both validators fail, only FIRST error should be displayed
        error_msg = validated_input.find('.error-text').text();
        expected_error_msg = 'is not hello';
        expect(error_msg).toEqual(expected_error_msg);
    });

    test('Validated input uses custom to_string_fn and from_string_fn when present',
         async () => {
        const component = {
            template:  `<validated-input ref="v1" v-model="my_obj"
                                         :validators="[obj_is_json]"
                                         :to_string_fn="obj_to_string"
                                         :from_string_fn="string_to_obj"/>`,
            components: {
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    my_obj: {
                        firstOne: "hello"
                    }
                };
            },
            methods: {
                obj_is_json: (str_obj: string) => {
                    const msg = "Not valid object (JSON) syntax!";

                    try {
                        JSON.parse(str_obj);    // Will fail if not valid JSON
                        return {is_valid: true, error_msg: msg};
                    }
                    catch (e) {
                        return {is_valid: false, error_msg: msg};
                    }
                },
                obj_to_string: (obj: object): string => {
                    return JSON.stringify(obj);
                },
                string_to_obj: (str_obj: string): object => {
                    return JSON.parse(str_obj);
                }
            }
        };

        const wrapper = mount(component);

        const v_input = wrapper.findComponent({ref: 'v1'});
        expect(v_input.find('.error-text').exists()).toBe(false);

        // Change input to pass validator
        const new_obj = {
            new_key: "new_value"
        };

        (<HTMLInputElement> v_input.find('input').element).value = JSON.stringify(new_obj);
        v_input.find('input').trigger('input');

        const v_input_vm = <ValidatedInput> v_input.vm;
        expect(v_input_vm.d_input_value).toEqual(JSON.stringify(new_obj));
        expect(wrapper.vm.$data.my_obj).toEqual(new_obj);
    });

    test('is_valid returns correct value on failure/success', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        expect(wrapper.vm.is_valid).toBe(true);

        let input = wrapper.find('input');
        (<HTMLInputElement> input.element).value = '25';
        input.trigger('input');

        expect(wrapper.vm.is_valid).toBe(true);

        (<HTMLInputElement> input.element).value = 'not a number!';
        input.trigger('input');

        expect(wrapper.vm.is_valid).toBe(false);

        (<HTMLInputElement> input.element).value = '2';
        input.trigger('input');

        expect(wrapper.vm.is_valid).toBe(true);
    });

    test('ValidatedInput displays input if num_rows prop === 1', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                num_rows: 1,
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        expect(wrapper.find('input').exists()).toBe(true);
        expect(wrapper.find('textarea').exists()).toBe(false);
    });

    test('ValidatedInput displays textarea if num_rows prop > 1', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                num_rows: 2,
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        expect(wrapper.find('input').exists()).toBe(false);
        expect(wrapper.find('textarea').exists()).toBe(true);
    });

    test('input_style prop modifies the style of input', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                input_style: "background-color: yellow;",
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        expect(wrapper.find('input').exists()).toBe(true);
        expect(wrapper.find('input').element.style.backgroundColor).toBe('yellow');
    });

    test('input_style prop modifies the style of textarea', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                input_style: "background-color: yellow;",
                num_rows: 3,
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        expect(wrapper.find('textarea').exists()).toBe(true);
        expect(wrapper.find('textarea').element.style.backgroundColor).toBe('yellow');
    });

    test('input_style accepts object as prop', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                input_style: {
                    backgroundColor: "yellow"
                },
                num_rows: 3,
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        expect(wrapper.find('textarea').exists()).toBe(true);
        expect(wrapper.find('textarea').element.style.backgroundColor).toBe('yellow');
    });

    test('Props required values are correct', () => {
        /*
         * v-modal (value): required
         * validators; required
         * from_string_fn: not required
         * to_string_fn: not required
         */
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        type ValidatedInputProp = {
            required: boolean
        };

        type ValidatedInputPropsObj = {
            value: ValidatedInputProp,
            validators: ValidatedInputProp,
            from_string_fn: ValidatedInputProp,
            to_string_fn: ValidatedInputProp,
            num_rows: ValidatedInputProp,
            input_style: ValidatedInputProp
        };

        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).value.required).toBe(true);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).validators.required).toBe(
            true);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).from_string_fn.required).toBe(
            false);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).to_string_fn.required).toBe(
            false);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).num_rows.required).toBe(
            false);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).input_style.required).toBe(
            false);
    });

    test('input_validity_changed gets triggered when is_valid changes', async () => {
        const component = {
            template:  `<validated-input ref="vinput" v-model="value1" :validators="[is_number]"
                                         @input_validity_changed="input_is_valid = $event"/>`,
            components: {
                'validated-input': ValidatedInput
            },
            data: () => {
                return {
                    value1: 32,
                    input_is_valid: false,
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
        let vinput = wrapper.findComponent({ref: 'vinput'});
        let vinput_vm = <ValidatedInput> vinput.vm;

        expect(vinput_vm.is_valid).toBe(true);
        expect(wrapper.vm.$data.input_is_valid).toBe(true);

        vinput.find('input').setValue("42");
        await wrapper.vm.$nextTick();

        expect(vinput_vm.is_valid).toBe(true);
        expect(wrapper.vm.$data.input_is_valid).toBe(true);

        vinput.find('input').setValue("invalid");
        await wrapper.vm.$nextTick();

        expect(vinput_vm.is_valid).toBe(false);
        expect(wrapper.vm.$data.input_is_valid).toBe(false);

        // Back to valid
        vinput.find('input').setValue("3");
        await wrapper.vm.$nextTick();

        expect(vinput_vm.is_valid).toBe(true);
        expect(wrapper.vm.$data.input_is_valid).toBe(true);
    });

    test('Error messages aren\'t displayed by default', async () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: "hey",
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        await wrapper.vm.$nextTick();
        const vinput_vm = <ValidatedInput> wrapper.vm;

        expect(vinput_vm.is_valid).toBe(false);
        expect(vinput_vm.d_show_warnings).toBe(false);
        expect(wrapper.find('.error-text').exists()).toBe(false);

        (<HTMLInputElement> wrapper.find('input').element).value = "heyoo";
        wrapper.find('input').trigger('input');
        await sleep(0.75);
        await wrapper.vm.$nextTick();

        expect(vinput_vm.is_valid).toBe(false);
        expect(vinput_vm.d_show_warnings).toBe(true);
        expect(wrapper.find('.error-text').exists()).toBe(true);
    });

    test('enable_warnings shows warnings immediately', async () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: "not number",
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
                show_warnings_on_blur: true
            }
        });

        await sleep(0.75);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_valid).toBe(false);
        expect(wrapper.vm.d_show_warnings).toBe(false);
        expect(wrapper.find('.error-text').exists()).toBe(false);

        wrapper.vm.enable_warnings();

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_valid).toBe(false);
        expect(wrapper.vm.d_show_warnings).toBe(true);
        expect(wrapper.find('.error-text').exists()).toBe(true);
    });

    test('reset_warning_state hides warnings', async () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: "1",
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        await wrapper.vm.$nextTick();
        const vinput_vm = <ValidatedInput> wrapper.vm;

        (<HTMLInputElement> wrapper.find('input').element).value = "invalid value here!";
        wrapper.find('input').trigger('input');
        await sleep(0.75);
        await wrapper.vm.$nextTick();

        expect(vinput_vm.is_valid).toBe(false);
        expect(vinput_vm.d_show_warnings).toBe(true);
        expect(wrapper.find('.error-text').exists()).toBe(true);

        vinput_vm.reset_warning_state();
        await wrapper.vm.$nextTick();

        // Clear method should set input to be empty and not display error messages
        expect(vinput_vm.is_valid).toBe(false);
        expect(vinput_vm.d_show_warnings).toBe(false);
        expect(wrapper.find('.error-text').exists()).toBe(false);
        expect(
            (<HTMLInputElement> wrapper.find('input').element).value
        ).toBe("invalid value here!");
    });

    test('show_warnings_on_blur', async () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: "not number",
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
                show_warnings_on_blur: true
            }
        });

        let input_wrapper = wrapper.find('input');

        await sleep(0.75);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_valid).toBe(false);
        expect(wrapper.vm.d_show_warnings).toBe(false);
        expect(wrapper.find('.error-text').exists()).toBe(false);

        input_wrapper.trigger('click');

        await sleep(0.75);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_valid).toBe(false);
        expect(wrapper.vm.d_show_warnings).toBe(false);
        expect(wrapper.find('.error-text').exists()).toBe(false);

        input_wrapper.trigger('blur');

        await sleep(0.75);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.is_valid).toBe(false);
        expect(wrapper.vm.d_show_warnings).toBe(true);
        expect(wrapper.find('.error-text').exists()).toBe(true);
    });
});


function is_number_or_null(value: string): ValidatorResponse {
    return {
        is_valid: value === "" || !isNaN(Number(value)),
        error_msg: "Invalid number!"
    };
}

describe('Custom from_string_fn and to_string_fn allow null tests', () => {
    let wrapper: Wrapper<ValidatedInput>;

    beforeEach(() => {
        wrapper = mount(ValidatedInput, {
            propsData: {
                value: '42',
                validators: [is_number_or_null],
                from_string_fn: (val: string) => val === '' ? null : parseInt(val, 10),
                to_string_fn: (val: number | null) => val === null ? '' : val.toString()
            }
        });

        expect(wrapper.vm.is_valid).toEqual(true);
    });

    test('Empty string converted to null', () => {
        set_validated_input_text(wrapper, '');
        expect(wrapper.vm.is_valid).toEqual(true);
        expect(emitted(wrapper, 'input').length).toEqual(1);
        expect(emitted(wrapper, 'input')[0][0]).toBeNull();
    });

    test('null converted to empty string', () => {
        expect_html_element_has_value(wrapper.find('input'), '42');
        wrapper.setProps({value: null});
        expect(wrapper.vm.is_valid).toEqual(true);
        expect(wrapper.text()).toEqual('');
    });
});
