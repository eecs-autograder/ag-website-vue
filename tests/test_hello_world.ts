import HelloWorld from '@/components/hello_world.vue';

import { mount } from '@vue/test-utils';

describe('HelloWorld.vue', () => {
    test('renders props.msg when passed', () => {
        const msg = 'new message';
        const wrapper = mount(HelloWorld, {
            propsData: { msg }
        });

        expect(wrapper.text()).toMatch(msg);

        expect(wrapper.vm.$data.switchy).toEqual(true);
        // To select a component (css selectors won't work), add the "ref" attribute to
        // the html instance of the component you want.
        let toggle = wrapper.find({ref: 'switchy_toggle'});
        expect(toggle.vm.$data.is_on).toEqual(true);

        let button = toggle.find('button');
        button.trigger('click');

        expect(wrapper.vm.$data.switchy).toEqual(false);
        expect(toggle.vm.$data.is_on).toEqual(false);
    });
});
