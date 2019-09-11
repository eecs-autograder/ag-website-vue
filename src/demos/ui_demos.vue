<template>
  <div id="ui-demos">
    <h2>UI Component Demos</h2>
    <div id="sidebar-toggle" @click="d_show_sidebar = !d_show_sidebar">
      Menu
      <i class="fas fa-bars"></i>
    </div>
    <div class="wrapper">
      <sticky-sidebar class="sidebar" v-if="d_show_sidebar">
        <div :class="['sidebar-item', {active: d_current_tab === 'buttons'}]"
            @click="d_current_tab ='buttons'">
          Buttons
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'colors'}]"
            @click="d_current_tab ='colors'">
          Color Palette
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'context_menu'}]"
            @click="d_current_tab ='context_menu'">
          Context Menu
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'datetime'}]"
            @click="d_current_tab ='datetime'">
          Datetime Picker
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'diff'}]"
            @click="d_current_tab ='diff'">
          Diff
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'dropdown'}]"
            @click="d_current_tab ='dropdown'">
          Dropdown
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'typeahead'}]"
            @click="d_current_tab ='typeahead'">
          Dropdown Typeahead
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'upload'}]"
            @click="d_current_tab ='upload'">
          File Upload
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'modal'}]"
            @click="d_current_tab ='modal'">
          Modal
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'multi_file'}]"
            @click="d_current_tab ='multi_file'">
          Multi-file Viewer
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'tabs'}]"
            @click="d_current_tab ='tabs'">
          Tabs
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'tooltip'}]"
            @click="d_current_tab ='tooltip'">
          Tooltip
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'toggle'}]"
            @click="d_current_tab ='toggle'">
          Toggle
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'view_file'}]"
            @click="d_current_tab ='view_file'">
          View File
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'validated_input'}]"
            @click="d_current_tab ='validated_input'">
          Validated Input
        </div>
        <div :class="['sidebar-item', {active: d_current_tab === 'validated_form'}]"
            @click="d_current_tab ='validated_form'">
          Validated Form
        </div>
      </sticky-sidebar>

      <div class="body">
        <ButtonDemo v-show="d_current_tab === 'buttons'"></ButtonDemo>
        <ColorPaletteDemo v-show="d_current_tab === 'colors'"></ColorPaletteDemo>
        <ContextMenuDemo v-show="d_current_tab === 'context_menu'"></ContextMenuDemo>
        <DatetimePickerDemo v-show="d_current_tab === 'datetime'"></DatetimePickerDemo>
        <DiffDemo v-show="d_current_tab === 'diff'"></DiffDemo>
        <DropdownDemo v-show="d_current_tab === 'dropdown'"></DropdownDemo>
        <DropdownTypeaheadDemo v-show="d_current_tab === 'typeahead'"></DropdownTypeaheadDemo>
        <FileUploadDemo v-show="d_current_tab === 'upload'"></FileUploadDemo>
        <ModalDemo v-show="d_current_tab === 'modal'"></ModalDemo>
        <MultiFileViewerDemo v-show="d_current_tab === 'multi_file'"></MultiFileViewerDemo>
        <TabsDemo v-show="d_current_tab === 'tabs'"></TabsDemo>
        <TooltipDemo v-show="d_current_tab === 'tooltip'"></TooltipDemo>
        <ToggleDemo v-show="d_current_tab === 'toggle'"></ToggleDemo>
        <ViewFileDemo v-show="d_current_tab === 'view_file'"></ViewFileDemo>
        <ValidatedInputDemo v-show="d_current_tab === 'validated_input'"></ValidatedInputDemo>
        <ValidatedFormDemo v-show="d_current_tab === 'validated_form'"></ValidatedFormDemo>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Dropdown from '@/components/dropdown.vue';
import StickySidebar from '@/components/sticky_sidebar.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from "@/components/tabs/tab_header.vue";
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file.vue';

import ButtonDemo from './button_demo.vue';
import ColorPaletteDemo from './color_palette_demo.vue';
import ContextMenuDemo from './context_menu_demo.vue';
import DatetimePickerDemo from './datetime_picker_demo.vue';
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
    DatetimePickerDemo,
    DiffDemo,
    Dropdown,
    DropdownDemo,
    DropdownTypeaheadDemo,
    FileUploadDemo,
    ModalDemo,
    MultiFileViewerDemo,
    StickySidebar,
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

  d_current_tab: string = 'buttons';

  mounted() {
    this.d_show_sidebar = window.matchMedia('(min-width: 768px)').matches;
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/independent_scrolling.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.wrapper {
  display: flex;
}

$sidebar-width: 220px;
$sidebar-toggle-height: 30px;

@mixin sidebar-item() {
  background-color: $pebble-light;

  &:not(.active):hover {
    background-color: lighten($stormy-gray-light, 20%);
    cursor: pointer;
  }
}

#sidebar-toggle {
  @include sidebar-item();
  width: $sidebar-width;
  height: $sidebar-toggle-height;

  border: 1px solid lighten($stormy-gray-light, 20%);
  border-left: none;

  text-align: center;
  font-size: 20px;
  padding: 3px 0;

  position: sticky;
  top: 0;
}

.sidebar {
  z-index: 1;
  margin-right: -$sidebar-width;

  min-width: $sidebar-width;
  top: $sidebar-toggle-height;

  border-right: 1px solid lighten($stormy-gray-light, 20%);

  background-color: $pebble-light;

  .sidebar-item {
    @include sidebar-item();
    padding: 3px 20px 3px 8px;
    font-size: 1.2em;
  }

  .active {
    background-color: lighten($stormy-gray-light, 10%);
  }
}

.body {
  flex-grow: 1;
}

@media only screen and (min-width: 800px) {
  .sidebar {
    margin-right: 0;
  }
}
</style>
