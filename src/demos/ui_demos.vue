<template>
  <div id="demos-container">
    <h2>UI Component Demos</h2>
    <div id="sidebar-toggle" @click="d_show_sidebar = !d_show_sidebar">
      Menu
      <i class="fas fa-bars"></i>
    </div>
    <tabs tab_active_class="sidebar-tab-active"
          tab_inactive_class="sidebar-tab-inactive"
          tab_position="side"
          :tab_headers_container_class="d_show_sidebar ? 'sidebar-container'
                                                       : 'sidebar-container-hidden'"
          :tab_body_container_class="d_show_sidebar ? 'demo-body' : 'demo-body-sidebar-collapsed'">
      <tab>
        <tab-header>Buttons</tab-header>
        <template slot="body">
          <ButtonDemo></ButtonDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Color Palette</tab-header>
        <template slot="body">
          <ColorPaletteDemo></ColorPaletteDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Context Menu</tab-header>
        <template slot="body">
          <ContextMenuDemo></ContextMenuDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Diff</tab-header>
        <template slot="body">
          <DiffDemo></DiffDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Dropdown</tab-header>
        <template slot="body">
          <DropdownDemo></DropdownDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Dropdown Typeahead</tab-header>
        <template slot="body">
          <DropdownTypeaheadDemo></DropdownTypeaheadDemo>
        </template>
      </tab>
      <tab>
        <tab-header>File Upload</tab-header>
        <template slot="body">
          <FileUploadDemo></FileUploadDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Modal</tab-header>
        <template slot="body">
          <ModalDemo></ModalDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Multi-file Viewer</tab-header>
        <template slot="body">
          <MultiFileViewerDemo></MultiFileViewerDemo>
        </template>
      </tab>

      <tab>
        <tab-header>Tabs</tab-header>
        <template slot="body">
          <TabsDemo></TabsDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Tooltip</tab-header>
        <template slot="body">
          <TooltipDemo></TooltipDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Toggle</tab-header>
        <template slot="body">
          <ToggleDemo></ToggleDemo>
        </template>
      </tab>
      <tab>
        <tab-header>View File</tab-header>
        <template slot="body">
          <ViewFileDemo></ViewFileDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Validated Input</tab-header>
        <template slot="body">
          <ValidatedInputDemo></ValidatedInputDemo>
        </template>
      </tab>
      <tab>
        <tab-header>Validated Form</tab-header>
        <template slot="body">
          <ValidatedFormDemo></ValidatedFormDemo>
        </template>
      </tab>
    </tabs>
  </div>
</template>

<script lang="ts">
import TabHeader from "@/components/tabs/tab_header.vue";
import { Component, Vue } from 'vue-property-decorator';

import Dropdown from '@/components/dropdown.vue';
import Tab from '@/components/tabs/tab.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file.vue';

import ButtonDemo from './button_demo.vue';
import ColorPaletteDemo from './color_palette_demo.vue';
import ContextMenuDemo from './context_menu_demo.vue';
import DiffDemo from './diff_demo.vue';
import DropdownDemo from './dropdown_demo.vue';
import DropdownTypeaheadDemo from './dropdown_typeahead_demo.vue';
import FileUploadDemo from './file_upload_demo.vue';
import ModalDemo from './modal_demo.vue';
import MultiFileViewerDemo from './multi_file_viewer_demo.vue';
import TabsDemo from './tabs_demo.vue';
import ToggleDemo from './toggle_demo.vue';
import TooltipDemo from './tooltip_demo.vue';
import ValidatedFormDemo from './validated_form_demo.vue';
import ValidatedInputDemo from './validated_input_demo.vue';
import ViewFileDemo from './view_file_demo.vue';

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
    TabHeader,
    TabsDemo,
    Toggle,
    ToggleDemo,
    TooltipDemo,
    ValidatedFormDemo,
    ValidatedInputDemo,
    ViewFile,
    ViewFileDemo
  }
})
export default class UIDemos extends Vue {
  d_show_sidebar = false;

  mounted() {
    this.d_show_sidebar = window.matchMedia('(min-width: 768px)').matches;
  }
}

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  #demos-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>

<style lang="scss">
  @import '@/styles/colors.scss';

  .sidebar-tab-active {
    background-color: lighten($stormy-gray-light, 10%);
  }

  .sidebar-tab-inactive:hover {
    background-color: lighten($stormy-gray-light, 20%);
  }

  .sidebar-tab-active, .sidebar-tab-inactive {
    padding: 3px 20px 3px 8px;
    font-size: 1.2em;
  }

  $sidebar-width: 220px;

  #sidebar-toggle {
    width: $sidebar-width;
    background-color: $pebble-light;
    font-size: 1.2em;
    border: 1px solid lighten($stormy-gray-light, 20%);
    border-left: 0;
    text-align: center;
    padding: 3px 0;
  }

  #sidebar-toggle:hover {
    background-color: darken($pebble-light, 10%);
    cursor: pointer;
  }

  .sidebar-container {
    width: $sidebar-width;
    border-right: 1px solid lighten($stormy-gray-light, 20%);

    background-color: $pebble-light;
  }

  .sidebar-container-hidden {
    display: none;
  }

  .demo-body-sidebar-collapsed, .demo-body {
    margin-top: 5px;
    margin-left: 8px;;
  }
</style>
