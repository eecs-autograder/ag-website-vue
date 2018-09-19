import Tooltip from '@/components/tooltip.vue';
import { config, mount } from '@vue/test-utils';
import { Component, Vue } from 'vue-property-decorator';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Tooltip.vue', () => {
    test('Default placement and width', () => {
        const component = {
            template: `<div><tooltip ref="tooltip"></tooltip></div>`,
            components: {
                'tooltip': Tooltip,
            }
        };
        const wrapper = mount(component);
        let tooltip = wrapper.find({ref: 'tooltip'});
        expect(tooltip.vm.$data.tooltip_width).toBe('small');
        expect(tooltip.vm.$data.tooltip_placement).toBe('top');
    });

    test('Non-default placement and width', () => {
        const component = {
            components: { Tooltip },
            template: `<div ref="tooltip_parent">Hello
    <tooltip ref="small_top" width="small" placement="top">Small top</tooltip>
    <tooltip ref="small_bottom" width="small" placement="bottom">Small bottom</tooltip>
    <tooltip ref="small_left" width="small" placement="left">Small left</tooltip>
    <tooltip ref="small_right" width="small" placement="right">Small right</tooltip>

    <tooltip ref="medium_top" width="medium" placement="top">Medium top</tooltip>
    <tooltip ref="medium_bottom" width="medium" placement="bottom">Medium bottom</tooltip>
    <tooltip ref="medium_left" width="medium" placement="left">Medium left</tooltip>
    <tooltip ref="medium_right" width="medium" placement="right">Medium right</tooltip>

    <tooltip ref="large_top" width="large" placement="top">Large top</tooltip>
    <tooltip ref="large_bottom" width="large" placement="bottom">Large bottom</tooltip>
    <tooltip ref="large_left" width="large" placement="left">Large left</tooltip>
    <tooltip ref="large_right" width="large" placement="right">Large right</tooltip>
</div>`
        };
        const wrapper = mount(component);

        let small_top = wrapper.find({ref: 'small_top'});
        expect(small_top.vm.$data.tooltip_width).toBe('small');
        expect(small_top.vm.$data.tooltip_placement).toBe('top');
        expect(small_top.text()).toContain('Small top');
        expect(small_top.find('#tooltip').classes()).toContain('small-text-area');
        expect(small_top.find('#tooltip').classes()).toContain('placement-top');

        let small_bottom = wrapper.find({ref: 'small_bottom'});
        expect(small_bottom.vm.$data.tooltip_width).toBe('small');
        expect(small_bottom.vm.$data.tooltip_placement).toBe('bottom');
        expect(small_bottom.text()).toContain('Small bottom');
        expect(small_bottom.find('#tooltip').classes()).toContain('small-text-area');
        expect(small_bottom.find('#tooltip').classes()).toContain('placement-bottom');

        let small_left = wrapper.find({ref: 'small_left'});
        expect(small_left.vm.$data.tooltip_width).toBe('small');
        expect(small_left.vm.$data.tooltip_placement).toBe('left');
        expect(small_left.text()).toContain('Small left');
        expect(small_left.find('#tooltip').classes()).toContain('small-text-area');
        expect(small_left.find('#tooltip').classes()).toContain('placement-left');

        let small_right = wrapper.find({ref: 'small_right'});
        expect(small_right.vm.$data.tooltip_width).toBe('small');
        expect(small_right.vm.$data.tooltip_placement).toBe('right');
        expect(small_right.text()).toContain('Small right');
        expect(small_right.find('#tooltip').classes()).toContain('small-text-area');
        expect(small_right.find('#tooltip').classes()).toContain('placement-right');

        let medium_top = wrapper.find({ref: 'medium_top'});
        expect(medium_top.vm.$data.tooltip_width).toBe('medium');
        expect(medium_top.vm.$data.tooltip_placement).toBe('top');
        expect(medium_top.text()).toContain('Medium top');
        expect(medium_top.find('#tooltip').classes()).toContain('medium-text-area');
        expect(medium_top.find('#tooltip').classes()).toContain('placement-top');

        let medium_bottom = wrapper.find({ref: 'medium_bottom'});
        expect(medium_bottom.vm.$data.tooltip_width).toBe('medium');
        expect(medium_bottom.vm.$data.tooltip_placement).toBe('bottom');
        expect(medium_bottom.text()).toContain('Medium bottom');
        expect(medium_bottom.find('#tooltip').classes()).toContain('medium-text-area');
        expect(medium_bottom.find('#tooltip').classes()).toContain('placement-bottom');

        let medium_left = wrapper.find({ref: 'medium_left'});
        expect(medium_left.vm.$data.tooltip_width).toBe('medium');
        expect(medium_left.vm.$data.tooltip_placement).toBe('left');
        expect(medium_left.text()).toContain('Medium left');
        expect(medium_left.find('#tooltip').classes()).toContain('medium-text-area');
        expect(medium_left.find('#tooltip').classes()).toContain('placement-left');

        let medium_right = wrapper.find({ref: 'medium_right'});
        expect(medium_right.vm.$data.tooltip_width).toBe('medium');
        expect(medium_right.vm.$data.tooltip_placement).toBe('right');
        expect(medium_right.text()).toContain('Medium right');
        expect(medium_right.find('#tooltip').classes()).toContain('medium-text-area');
        expect(medium_right.find('#tooltip').classes()).toContain('placement-right');

        let large_top = wrapper.find({ref: 'large_top'});
        expect(large_top.vm.$data.tooltip_width).toBe('large');
        expect(large_top.vm.$data.tooltip_placement).toBe('top');
        expect(large_top.text()).toContain('Large top');
        expect(large_top.find('#tooltip').classes()).toContain('large-text-area');
        expect(large_top.find('#tooltip').classes()).toContain('placement-top');

        let large_bottom = wrapper.find({ref: 'large_bottom'});
        expect(large_bottom.vm.$data.tooltip_width).toBe('large');
        expect(large_bottom.vm.$data.tooltip_placement).toBe('bottom');
        expect(large_bottom.text()).toContain('Large bottom');
        expect(large_bottom.find('#tooltip').classes()).toContain('large-text-area');
        expect(large_bottom.find('#tooltip').classes()).toContain('placement-bottom');

        let large_left = wrapper.find({ref: 'large_left'});
        expect(large_left.vm.$data.tooltip_width).toBe('large');
        expect(large_left.vm.$data.tooltip_placement).toBe('left');
        expect(large_left.text()).toContain('Large left');
        expect(large_left.find('#tooltip').classes()).toContain('large-text-area');
        expect(large_left.find('#tooltip').classes()).toContain('placement-left');

        let large_right = wrapper.find({ref: 'large_right'});
        expect(large_right.vm.$data.tooltip_width).toBe('large');
        expect(large_right.vm.$data.tooltip_placement).toBe('right');
        expect(large_right.text()).toContain('Large right');
        expect(large_right.find('#tooltip').classes()).toContain('large-text-area');
        expect(large_right.find('#tooltip').classes()).toContain('placement-right');

        // expect(tooltip.vm.$data.tooltip_width).toBe("medium");
        // expect(tooltip.vm.$data.tooltip_placement).toBe("left");
        // expect(
        //     wrapper.find('#tooltip').text()
        // ).toContain("This is a tooltip message");
        // expect(wrapper.find('#tooltip').classes()).toContain("medium-text-area");
        // expect(wrapper.find('#tooltip').classes()).toContain("placement-left");
    });

    test('Tooltip show on mouse enter and hide on mouse exit', () => {
        const component = {
            components: { Tooltip },
            template: `<div ref="tooltip_parent">Hello
    <tooltip>Tooltip message</tooltip>
</div>`
        };

        const wrapper = mount(component);
        let tooltip = wrapper.find('#tooltip');
        expect(tooltip.isVisible()).toBe(false);

        let parent = wrapper.find({ref: 'tooltip_parent'});
        parent.trigger('mouseenter');
        expect(tooltip.isVisible()).toBe(true);

        parent.trigger('mouseout');
        expect(tooltip.isVisible()).toBe(false);

        parent.trigger('mouseenter');
        expect(tooltip.isVisible()).toBe(true);

        parent.trigger('mouseout');
        expect(tooltip.isVisible()).toBe(false);
    });

    test('Error invalid tooltip placement', () => {
        const component = {
            template:  `<div><tooltip placement="not_a_placement"></tooltip></div>`,
            components: {
                'tooltip': Tooltip,
            }
        };

        expect(
            () => mount(component)
        ).toThrow('Invalid tooltip placement: "not_a_placement"');
    });

    test('Error invalid tootltip width', () => {
        const component = {
            template:  `<div><tooltip width="not_a_width"></tooltip></div>`,
            components: {
                'tooltip': Tooltip,
            }
        };

        expect(
            () => mount(component)
        ).toThrow('Invalid tooltip width: "not_a_width"');
    });

    test('Error parent is null', () => {
        expect(() => mount(Tooltip)).toThrow('Tooltips must have a parent element.');
    });
});
