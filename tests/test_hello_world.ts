import HelloWorld from '@/components/hello_world.vue';

import { mount } from '@vue/test-utils';

describe('HelloWorld.vue', () => {
    test('renders props.msg when passed', () => {
        // const msg = 'new message';
        const wrapper = mount(HelloWorld);

        let tooltip = wrapper.find({ref: 'first_tooltip'});

        expect(tooltip.vm.$data.tooltip_message).toEqual("Right<br>Right<br>Right<br>Right");
    });
});
