import CollapsibleContent from '@/components/CollapsibleContent.vue';

import { managed_mount } from '@/tests/setup';
import { set_props } from '@/tests/utils';

test('start_open true', () => {
    let wrapper = managed_mount(CollapsibleContent, {
        propsData: {
            start_open: true
        }
    });

    expect(wrapper.find('[data-testid=collapsible_body]').isVisible()).toBe(true);
});

test('start_open default false', () => {
    let wrapper = managed_mount(CollapsibleContent);

    expect(wrapper.find('[data-testid=collapsible_body]').isVisible()).toBe(false);
});

test('include_caret default true', () => {
    let wrapper = managed_mount(CollapsibleContent);
    expect(wrapper.find('.caret').exists()).toBe(true);
});

test('include_caret false', () => {
    let wrapper = managed_mount(CollapsibleContent, {
        propsData: {
            include_caret: false
        }
    });
    expect(wrapper.find('.caret').exists()).toBe(false);
});

test('stay_open prevents closing when true', async () => {
    let wrapper = managed_mount(CollapsibleContent, {
        propsData: {
            stay_open: true
        }
    });

    expect(wrapper.find('[data-testid=collapsible_body]').isVisible()).toBe(false);

    wrapper.vm.toggle_is_open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid=collapsible_body]').isVisible()).toBe(true);

    wrapper.vm.toggle_is_open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid=collapsible_body]').isVisible()).toBe(true);

    await set_props(wrapper, {stay_open: false});

    wrapper.vm.toggle_is_open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid=collapsible_body]').isVisible()).toBe(false);
});
