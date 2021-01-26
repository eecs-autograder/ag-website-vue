import { mount } from '@vue/test-utils';

import Tooltip from '@/components/tooltip.vue';


describe('Tooltip.vue', () => {
    test('Default placement and width', () => {
        const wrapper = mount(Tooltip);
        expect(wrapper.vm.width).toBe('small');
        expect(wrapper.vm.placement).toBe('top');
    });

    test('Non-default placement and width', () => {
        const component = {
            components: {Tooltip},
            template: `<div>
                <tooltip width="small" placement="top">Small top</tooltip>
                <tooltip width="small" placement="bottom">Small bottom</tooltip>
                <tooltip width="small" placement="left">Small left</tooltip>
                <tooltip width="small" placement="right">Small right</tooltip>

                <tooltip width="medium" placement="top">Medium top</tooltip>
                <tooltip width="medium" placement="bottom">Medium bottom</tooltip>
                <tooltip width="medium" placement="left">Medium left</tooltip>
                <tooltip width="medium" placement="right">Medium right</tooltip>

                <tooltip width="large" placement="top">Large top</tooltip>
                <tooltip width="large" placement="bottom">Large bottom</tooltip>
                <tooltip width="large" placement="left">Large left</tooltip>
                <tooltip width="large" placement="right">Large right</tooltip>
            </div>`
        };
        const wrapper = mount(component);
        expect(wrapper.vm.$el).toMatchSnapshot();
    });
});
