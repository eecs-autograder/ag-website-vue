import { mount, Wrapper } from '@vue/test-utils';

import StickySidebar from '@/components/sticky_sidebar.vue';

let wrapper: Wrapper<StickySidebar>;

afterEach(() => {
    if (wrapper.exists()) {
        wrapper.destroy();
    }
});

test('Sidebar height calculation', () => {
    wrapper = mount(StickySidebar);
    expect(wrapper.vm.d_height).toEqual('calc(100vh - 0px)');

    // Workaround: vue-test-utils doesn't seem to support getBoundingClientRect
    wrapper.vm.$refs.sidebar.getBoundingClientRect = () => {
        return {top: 10};
    };

    wrapper.vm.scroll_handler();
    expect(wrapper.vm.d_height).toEqual('calc(100vh - 10px)');
});
