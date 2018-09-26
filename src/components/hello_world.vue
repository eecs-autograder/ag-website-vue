<template>

  <div>
    <MultiFileViewerDemo></MultiFileViewerDemo>
    <ButtonDemo></ButtonDemo>
    <DiffDemo></DiffDemo>
    <TabsDemo></TabsDemo>
    <TooltipDemo></TooltipDemo>
    <ViewFileDemo></ViewFileDemo>
 </div>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file.vue';

import ButtonDemo from '@/demos/button_demo.vue';
import DiffDemo from '@/demos/diff_demo.vue';
import MultiFileViewerDemo from '@/demos/multi_file_viewer_demo.vue';
import TabsDemo from '@/demos/tabs_demo.vue';
import TooltipDemo from '@/demos/tooltip_demo.vue';
import ViewFileDemo from '@/demos/view_file_demo.vue';

@Component({
  components: {Toggle, ViewFile, Tab, Tabs, ButtonDemo, DiffDemo, MultiFileViewerDemo, TabsDemo,
               TooltipDemo}
})
export default class HelloWorld extends Vue {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
