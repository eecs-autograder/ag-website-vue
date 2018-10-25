<template>
  <div>
    <ButtonDemo></ButtonDemo>
    <ColorPaletteDemo></ColorPaletteDemo>
    <ContextMenuDemo></ContextMenuDemo>
    <DiffDemo></DiffDemo>
    <DropdownDemo></DropdownDemo>
    <DropdownTypeaheadDemo></DropdownTypeaheadDemo>
    <ModalDemo></ModalDemo>
    <!--<MultiFileViewerDemo></MultiFileViewerDemo>-->
    <!--<TabsDemo></TabsDemo>-->
    <!--<TooltipDemo></TooltipDemo>-->
    <!--<ToggleDemo></ToggleDemo>-->
    <!--<ViewFileDemo></ViewFileDemo>-->
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
import ContextMenuDemo from '@/demos/context_menu_demo.vue';
import DiffDemo from '@/demos/diff_demo.vue';
import DropdownDemo from '@/demos/dropdown_demo.vue';
import DropdownTypeaheadDemo from '@/demos/dropdown_typeahead_demo.vue';
import FileUploadDemo from '@/demos/file_upload_demo.vue';
import ModalDemo from '@/demos/modal_demo.vue';
import MultiFileViewerDemo from '@/demos/multi_file_viewer_demo.vue';
import TabsDemo from '@/demos/tabs_demo.vue';
import ToggleDemo from '@/demos/toggle_demo.vue';
import TooltipDemo from '@/demos/tooltip_demo.vue';
import ViewFileDemo from '@/demos/view_file_demo.vue';

@Component({
  components: {
    ButtonDemo,
    ColorPaletteDemo,
    ContextMenuDemo,
    DiffDemo,
    Dropdown,
    DropdownDemo,
    DropdownTypeaheadDemo,
    FileUploadDemo,
    ModalDemo,
    MultiFileViewerDemo,
    Tab,
    Tabs,
    TabsDemo,
    Toggle,
    ToggleDemo,
    TooltipDemo,
    ViewFile,
    ViewFileDemo
  }
})
export default class HelloWorld extends Vue {}

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .collection-of-items {
    margin-top: 70px;
    padding: 20px;
    background-color: mediumpurple;
    color: white;
  }

  .one-drop {
    margin: 50px 0 0 50px;
  }

  .two-drop {
    padding: 100px;
    display: inline-block;
  }
</style>
