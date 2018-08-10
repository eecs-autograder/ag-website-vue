import HelloWorld from '@/components/hello_world.vue';

import { mount } from '@vue/test-utils';

describe('HelloWorld.vue', () => {
    test('renders props.msg when passed', () => {
        const msg = 'new message';
        const wrapper = mount(HelloWorld, {
            propsData: { msg }
        });
<<<<<<< 0dfcaec28d0e0e1fbe760ff90424c8c9d15d0de3
=======

        expect(wrapper.text()).toContain(msg);

        // expect(wrapper.vm.$data.switchy).toEqual(true);
        // // To select a component (css selectors won't work), add the "ref" attribute to
        // // the html instance of the component you want.
        let toggle = wrapper.find({ref: 'switchy_toggle'});
        expect(toggle.vm.$data.is_on).toEqual(true);

        let viewfile = wrapper.find({ref: 'viewing_file'});
        expect(viewfile.vm.$data.filename).toEqual('ke$ha.cpp');

        //
        // let button = toggle.find('button');
        // button.trigger('click');
        //
        // expect(wrapper.vm.$data.switchy).toEqual(false);
        // expect(toggle.vm.$data.is_on).toEqual(false);

        // let button = toggle.find('button');
        // button.trigger('click');
        //
        // expect(wrapper.vm.$data.switchy).toEqual(false);
        // expect(toggle.vm.$data.is_on).toEqual(false);
>>>>>>> Add tests for ViewFile component in 'tests'.
    });
});
