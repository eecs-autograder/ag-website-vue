<template>
  <div>
    <MultiFileViewerDemo></MultiFileViewerDemo>
    <ButtonDemo></ButtonDemo>
    <DiffDemo></DiffDemo>
    <TabsDemo></TabsDemo>
    <TooltipDemo></TooltipDemo>
    <ModalDemo></ModalDemo>
    <DropdownDemo></DropdownDemo>
    <ColorPaletteDemo></ColorPaletteDemo>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

import Dropdown from '@/components/dropdown.vue';
import Tab from '@/components/tabs/tab.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file.vue';

import ButtonDemo from '@/demos/button_demo.vue';
import ColorPaletteDemo from '@/demos/color_palette_demo.vue';
import DiffDemo from '@/demos/diff_demo.vue';
import DropdownDemo from '@/demos/dropdown_demo.vue';
import ModalDemo from '@/demos/modal_demo.vue';
<<<<<<< d3f39a1e4583b52553ad07b491844c304ca4c753
import MultiFileViewerDemo from '@/demos/multi_file_viewer_demo.vue';
=======
>>>>>>> Removed 'chosen_item' from the dropdown_component. Added a scoped slot in the v-for of the dropdown component so that dropdown content rows can be personalized in the parent component. Updated the tests in test_dropdown.ts to reflect these changes.
import TabsDemo from '@/demos/tabs_demo.vue';
import TooltipDemo from '@/demos/tooltip_demo.vue';

@Component({
  components: {
    ButtonDemo,
    ColorPaletteDemo,
    DiffDemo,
    Dropdown,
    DropdownDemo,
    ModalDemo,
    MultiFileViewerDemo,
    Tab,
    Tabs,
    TabsDemo,
    Toggle,
    TooltipDemo,
    ViewFile,
  }
})
export default class HelloWorld extends Vue {}
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';


</style>
