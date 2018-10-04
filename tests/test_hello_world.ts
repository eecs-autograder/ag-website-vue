import HelloWorld from '@/components/hello_world.vue';

import { mount } from '@vue/test-utils';

describe('HelloWorld.vue', () => {
    test('renders props.msg when passed', () => {
        // const msg = 'new message';
        const wrapper = mount(HelloWorld);

    });
});
