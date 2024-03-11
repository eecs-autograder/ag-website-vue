<template>
  <div id="ui-demos">
    <h2>UI Component Demos</h2>
    <div class="sidebar-container">
      <div class="sidebar-menu">
        <div class="sidebar-header" :class="{'sidebar-header-closed': !d_show_sidebar}">
          <i class="fas fa-bars" @click="d_show_sidebar = !d_show_sidebar"></i>
          <template v-if="d_show_sidebar">Menu</template>
        </div>
        <div class="sidebar-content" v-if="d_show_sidebar">
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
          <div :class="['sidebar-item', {active: d_current_tab === 'select_object'}]"
              @click="d_current_tab ='select_object'">
            Select Object
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
        </div>
      </div>
      <div class="body" :class="{'body-closed': !d_show_sidebar}">
        <ButtonDemo v-show="d_current_tab === 'buttons'"></ButtonDemo>
        <ColorPaletteDemo v-show="d_current_tab === 'colors'"></ColorPaletteDemo>
        <ContextMenuDemo v-show="d_current_tab === 'context_menu'"></ContextMenuDemo>
        <DatetimePickerDemo v-show="d_current_tab === 'datetime'"></DatetimePickerDemo>
        <DiffDemo v-show="d_current_tab === 'diff'"></DiffDemo>
        <DropdownDemo v-show="d_current_tab === 'dropdown'"></DropdownDemo>
        <DropdownTypeaheadDemo v-show="d_current_tab === 'typeahead'"></DropdownTypeaheadDemo>
        <FileUploadDemo v-show="d_current_tab === 'upload'"></FileUploadDemo>
        <ModalDemo v-show="d_current_tab === 'modal'"></ModalDemo>
        <SelectObjectDemo v-show="d_current_tab === 'select_object'"></SelectObjectDemo>
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
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file/view_file.vue';

import ButtonDemo from './button_demo.vue';
import ColorPaletteDemo from './color_palette_demo.vue';
import ContextMenuDemo from './context_menu_demo.vue';
import DatetimePickerDemo from './datetime_picker_demo.vue';
import DiffDemo from './diff_demo.vue';
import DropdownDemo from './dropdown_demo.vue';
import DropdownTypeaheadDemo from './dropdown_typeahead_demo.vue';
import FileUploadDemo from './file_upload_demo.vue';
import ModalDemo from './modal_demo.vue';
import SelectObjectDemo from './select_object_demo.vue';
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
    SelectObjectDemo,
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
@import '@/styles/collapsible_sidebar.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@include collapsible-sidebar(
  $sidebar-width: 220px,
  $sidebar-header-height: 30px,
  $border-color: lighten($stormy-gray-light, 20%),
  $background-color: $pebble-light,
  $active-color: lighten($stormy-gray-light, 10%),
  $overlap-breakpoint: 750px,
);

.sidebar-header {
  border-bottom: 1px solid lighten($stormy-gray-light, 20%);

  font-size: 20px;
  padding: 3px 0;

  .fa-bars {
    padding: 0 5px;
  }

  .fa-bars:hover {
    cursor: pointer;
    color: $stormy-gray-dark;
  }
}

.sidebar-item {
  padding: 3px 20px 3px 8px;
  font-size: 1.2em;

  &:not(.active):hover {
    background-color: lighten($stormy-gray-light, 20%);
    cursor: pointer;
  }
}

</style>
