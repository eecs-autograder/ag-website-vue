<template>
  <div>
    <MultiFileViewerDemo></MultiFileViewerDemo>
    <ButtonDemo></ButtonDemo>
    <DiffDemo></DiffDemo>
    <TabsDemo></TabsDemo>
    <TooltipDemo></TooltipDemo>
    <ModalDemo></ModalDemo>
<<<<<<< 927c165e41c5485df10b922ad10b442347ae4d9d
    <ColorPaletteDemo></ColorPaletteDemo>
  </div>

=======
  </div>
>>>>>>> Added more tests to 'test_dropdown.ts' and removed rounded corners from dropdown menu content.
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
  @Prop()
  msg!: string;

  selected_choice = "5 Passengers";

  menu_items = ["1 Passenger", "2 Passengers", "3 Passengers", "4 Passengers", "5 Passengers",
                "6 Passengers", "7 Passengers", "8 Passengers", "9 Passengers"];

  add_item(item: string) {
    this.selected_choice = item;
    this.chosen_items.push(item);
  }


  chosen_items: string[] = [];

}
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  #drop-top {
    background-color: hsl(210, 13%, 95%);
    border: 2px solid hsl(210, 13%, 95%);
    border-radius: 5px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    color: black;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 16px;
    height: 24px;
    margin: 0;
    padding: 6px 55px 6px 10px;
  }

  #drop-top p {
    padding: 2px;
    margin: 0;
  }

  .arrow-down {
    position: absolute;
    right: 25px;
    top: 14px;
  }

  #drop-top:focus {
    outline: none;
  }

  #drop-top:hover {
    background-color: hsl(210, 12%, 93%);
    border-color: hsl(210, 12%, 93%);
    color: black;
  }

  .drop-button {
    outline: none;
    color: white;
  }

  .drop-button {
    padding: 20px;
    background-color: cornflowerblue;
    color: black;
    font-size: 20px;
    border: none;
    cursor: pointer;
    margin: 0;
    width: 200px;
    text-align: center;
  }

  .drop-button:focus {
    outline: 2px solid red;
  }

</style>
