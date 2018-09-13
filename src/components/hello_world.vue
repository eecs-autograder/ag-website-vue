<template>
  <div>
    <MultiFileViewerDemo></MultiFileViewerDemo>
    <ButtonDemo></ButtonDemo>
    <DiffDemo></DiffDemo>
    <TabsDemo></TabsDemo>
    <TooltipDemo></TooltipDemo>
    <ModalDemo></ModalDemo>
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
import MultiFileViewerDemo from '@/demos/multi_file_viewer_demo.vue';
import TabsDemo from '@/demos/tabs_demo.vue';
import TooltipDemo from '@/demos/tooltip_demo.vue';

@Component({
  components: {
    Toggle, ViewFile, Tab, Tabs, ButtonDemo, DiffDemo,
    TabsDemo, TooltipDemo, MultiFileViewerDemo, ModalDemo, ColorPaletteDemo
  }
})
export default class HelloWorld extends Vue {

}
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';


</style>
