import ValidatedInput from '@/components/validated_input.vue';
import { zip } from '@/utils';
import { config, mount } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

const IS_NUMBER = (value: string): [boolean, string] => {
    const valid = value !== "" && !isNaN(Number(value));
    return [valid, "Invalid number!"];
};

describe('ValidatedInput.vue', () => {
    test('Validated input uses default string conversion when to_string_fn not present',
         () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        wrapper.vm.$mount();
        const input: HTMLInputElement = <HTMLInputElement> wrapper.find('#input').element;
        expect(input.value).toBe("1");
    });

    test('Validated input uses default when from_string_fn not present', () => {
        const component = {
            template:  `<validated-input ref="validated_input_1" v-model="my_input"
                                         :validators="[() => [true, 'placeholder']]"/>`,
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
        wrapper.vm.$mount();
        const validated_input = wrapper.find({ref: 'validated_input_1'});
        expect(validated_input.vm.$data.input_value).toEqual("hello");

        // Changing variable in parent component should update variable in child component
        wrapper.setData({my_input: "hey"});
        expect(validated_input.vm.$data.input_value).toEqual("hey");

        // Changing input in child component should update variable in parent component
        // (this time, using default from_string_fn)
        (<HTMLInputElement> validated_input.find('#input').element).value = "yo";
        validated_input.find('#input').trigger('input');
        expect(validated_input.vm.$data.input_value).toEqual("yo");
        expect(wrapper.vm.$data.my_input).toEqual("yo");
    });

    test('v-modal variable not updated when a validators fails', () => {
        const component = {
            template:  `<validated-input ref="validated_input_1" v-model="my_input"
                                         :validators="[
                                            (val) => [val === 'hello', 'error']
                                         ]"/>`,
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
        const validated_input = wrapper.find({ref: 'validated_input_1'});
        expect(validated_input.vm.$data.input_value).toEqual("hello");

        // Change input to an invalid value (should trigger validator error)
        (<HTMLInputElement> validated_input.find('#input').element).value = "yo";
        validated_input.find('#input').trigger('input');

        // Local input should change, but variable should NOT be updated
        expect(validated_input.vm.$data.input_value).toEqual("yo");
        expect(wrapper.vm.$data.my_input).toEqual("hello");
    });

    test('Only failed validator error messages are displayed', () => {
        const component = {
            template:  `<validated-input ref="validated_input_1" v-model="my_input"
                                         :validators="[
                                            (val) => [val === 'hello', 'is not hello'],
                                            (val) => [val !== val, 'should always be displayed']
                                         ]"/>`,
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
        const validated_input = wrapper.find({ref: 'validated_input_1'});

        // Change input to an invalid value (should trigger BOTH validator errors)
        (<HTMLInputElement> validated_input.find('#input').element).value = "yo";
        validated_input.find('#input').trigger('input');

        let expected_texts = ['is not hello', 'should always be displayed'];
        let error_msgs = validated_input.findAll('.error-message');
        for (let [expected, error_msg] of zip(expected_texts, error_msgs.wrappers)) {
            expect(error_msg.text()).toEqual(expected);
        }

        // This should ONLY trigger SECOND validator error)
        (<HTMLInputElement> validated_input.find('#input').element).value = "hello";
        validated_input.find('#input').trigger('input');

        expected_texts = ['should always be displayed'];
        error_msgs = validated_input.findAll('.error-message');
        for (let [expected, error_msg] of zip(expected_texts, error_msgs.wrappers)) {
            expect(error_msg.text()).toEqual(expected);
        }
    });

    test('is_valid returns correct value on failure/success', () => {
        const wrapper = mount(ValidatedInput, {
            propsData: {
                value: 1,
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        wrapper.vm.$mount();
        let input = wrapper.find('#input');
        (<HTMLInputElement> input.element).value = '2';
        input.trigger('input');

        expect(wrapper.vm.is_valid()).toBe(true);

        (<HTMLInputElement> input.element).value = 'not a number!';
        input.trigger('input');

        expect(wrapper.vm.is_valid()).toBe(false);

        (<HTMLInputElement> input.element).value = '2';
        input.trigger('input');

        expect(wrapper.vm.is_valid()).toBe(true);
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
                validators: [IS_NUMBER],
                from_string_fn: (val: string) => parseInt(val, 10),
            }
        });

        wrapper.vm.$mount();

        type ValidatedInputProp = {
            required: boolean
        };

        type ValidatedInputPropsObj = {
            value: ValidatedInputProp,
            validators: ValidatedInputProp,
            from_string_fn: ValidatedInputProp,
            to_string_fn: ValidatedInputProp
        };

        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).value.required).toBe(true);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).validators.required).toBe(
            true);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).from_string_fn.required).toBe(
            false);
        expect((<ValidatedInputPropsObj> wrapper.vm.$options.props).to_string_fn.required).toBe(
            false);
    });
});
