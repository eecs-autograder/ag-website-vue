<template>

  <div>
    <ButtonDemo></ButtonDemo>
    <TabsDemo></TabsDemo>
  </div>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file.vue';

import ButtonDemo from '@/demos/button_demo.vue';
import TabsDemo from '@/demos/tabs_demo.vue';


@Component({
  components: {Toggle, ViewFile, Tab, Tabs, ButtonDemo, TabsDemo}
})
export default class HelloWorld extends Vue {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
