import Collapsible from '@/components/collapsible.vue';

import { managed_mount } from '@/tests/setup';

test('start_open true', () => {
    let wrapper = managed_mount(Collapsible, {
        propsData: {
            start_open: true
        }
    });

    expect(wrapper.find({ref: 'body'}).isVisible()).toBe(true);
});

test('start_open default false', () => {
    let wrapper = managed_mount(Collapsible);

    expect(wrapper.find({ref: 'body'}).isVisible()).toBe(false);
});

test('include_caret default true', () => {
    let wrapper = managed_mount(Collapsible);
    expect(wrapper.find('.caret').exists()).toBe(true);
});

test('include_caret false', () => {
    let wrapper = managed_mount(Collapsible, {
        propsData: {
            include_caret: false
        }
    });
    expect(wrapper.find('.caret').exists()).toBe(false);
});
