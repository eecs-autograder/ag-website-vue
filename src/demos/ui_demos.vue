<template>
  <div id="demos-container">
    <tabs tab_active_class="sidebar-tab-active"
          tab_inactive_class="sidebar-tab-inactive"
          tab_position="side">
      <tab>
        <tab-header>ButtonDemo</tab-header>
        <template slot="body">
          <ButtonDemo></ButtonDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ColorPaletteDemo</tab-header>
        <template slot="body">
          <ColorPaletteDemo></ColorPaletteDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ContextMenuDemo</tab-header>
        <template slot="body">
          <ContextMenuDemo></ContextMenuDemo>
        </template>
      </tab>
      <tab>
        <tab-header>DiffDemo</tab-header>
        <template slot="body">
          <DiffDemo></DiffDemo>
        </template>
      </tab>
      <tab>
        <tab-header>DropdownDemo</tab-header>
        <template slot="body">
          <DropdownDemo></DropdownDemo>
        </template>
      </tab>
      <tab>
        <tab-header>DropdownTypeaheadDemo</tab-header>
        <template slot="body">
          <DropdownTypeaheadDemo></DropdownTypeaheadDemo>
        </template>
      </tab>
      <tab>
        <tab-header>FileUploadDemo</tab-header>
        <template slot="body">
          <FileUploadDemo></FileUploadDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ManageProjectsDemo</tab-header>
        <template slot="body">
          <ManageProjectsDemo></ManageProjectsDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ModalDemo</tab-header>
        <template slot="body">
          <ModalDemo></ModalDemo>
        </template>
      </tab>
      <tab>
        <tab-header>MultiFileViewerDemo</tab-header>
        <template slot="body">
          <MultiFileViewerDemo></MultiFileViewerDemo>
        </template>
      </tab>

      <tab>
        <tab-header>TabsDemo</tab-header>
        <template slot="body">
          <TabsDemo></TabsDemo>
        </template>
      </tab>
      <tab>
        <tab-header>TooltipDemo</tab-header>
        <template slot="body">
          <TooltipDemo></TooltipDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ToggleDemo</tab-header>
        <template slot="body">
          <ToggleDemo></ToggleDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ViewFileDemo</tab-header>
        <template slot="body">
          <ViewFileDemo></ViewFileDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ValidatedInputDemo</tab-header>
        <template slot="body">
          <ValidatedInputDemo></ValidatedInputDemo>
        </template>
      </tab>
      <tab>
        <tab-header>ValidatedFormDemo</tab-header>
        <template slot="body">
          <ValidatedFormDemo></ValidatedFormDemo>
        </template>
      </tab>
    </tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Dropdown from '../components/dropdown.vue';
import Tab from '../components/tabs/tab.vue';
import Tabs from '../components/tabs/tabs.vue';
import Toggle from '../components/toggle.vue';
import ViewFile from '../components/view_file.vue';

import ButtonDemo from './button_demo.vue';
import ColorPaletteDemo from './color_palette_demo.vue';
import ContextMenuDemo from './context_menu_demo.vue';
import DiffDemo from './diff_demo.vue';
import DropdownDemo from './dropdown_demo.vue';
import DropdownTypeaheadDemo from './dropdown_typeahead_demo.vue';
import FileUploadDemo from './file_upload_demo.vue';
import ManageProjectsDemo from './manage_projects_demo.vue';
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
    ManageProjectsDemo,
    ModalDemo,
    MultiFileViewerDemo,
    Tab,
    Tabs,
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
export default class UIDemos extends Vue {}

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  #demos-container {
    /*margin-left: 7%;*/
    /*margin-right: 7%;*/
  }

  /*.demo-group {*/
    /*padding-top: 50px;*/
    /*padding-bottom: 50px;*/
    /*border-bottom: 1px solid black;*/
  /*}*/
</style>

<style lang="scss">
  @import '@/styles/colors.scss';

  .sidebar-tab-active {
    background-color: $stormy-gray-light;
  }

  .sidebar-tab-inactive {
  }

  /*.sidebar-body {*/
    /*margin-left: 5%;*/
    /*margin-right: 5%;*/
    /*display: inline-block;*/
    /*!*float: left;*!*/
    /*!*background-color: hotpink;*!*/
    /*!*margin-left: 500px;*!*/
  /*}*/

  /*.sidebar-items {*/
    /*display: inline-block;*/
  /*}*/
</style>
