import Tooltip from '@/components/tooltip.vue';
import { mount } from '@vue/test-utils';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: { Tooltip },
    template: `<p>Hello` +
              `<tooltip ref="first_tooltip" placement="left" width="medium">` +
              `<p> Caution! <br> Contents may be hot! </p>` +
              '</tooltip>' +
              '</p>'
})

class TooltipTestWrapper extends Vue {
    placement_in = "left";
    width_in = "medium";
}

describe('Tooltip.vue', () => {

    test('Tooltip data set to values specified by parent', () => {
        const wrapper = mount(TooltipTestWrapper);

        let tooltip = wrapper.find({ref: 'first_tooltip'});

        expect(tooltip.vm.$data.tooltip_width).toBe("medium");
        expect(tooltip.vm.$data.tooltip_placement).toBe("left");
        expect(wrapper.find('.tooltip-text').text()).toContain("Caution! " +
                                                               " Contents may be hot!");
        expect(wrapper.find('.tooltip-text').classes()).toContain("medium-text-area");
        expect(wrapper.find('.tooltip-text').classes()).toContain("placement-left");
    });

});
