import HelloWorld from '@/components/hello_world.vue';

import { mount } from '@vue/test-utils';

describe('HelloWorld.vue', () => {
    test('renders props.msg when passed', () => {
        const msg = 'new message';
        const wrapper = mount(HelloWorld, {
            propsData: { msg }
        });

        expect(wrapper.text()).toContain(msg);

        expect(wrapper.vm.$data.switchy).toEqual(true);

        let toggle = wrapper.find({ref: 'switchy_toggle'});
        expect(toggle.vm.$data.is_on).toEqual(true);

        let viewfile = wrapper.find({ref: 'viewing_file'});
        expect(viewfile.vm.$data.filename).toEqual('ke$ha.cpp');

    });
});
