<template>

  <div class="hello">
    <TabsDemo></TabsDemo>
  </div>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file.vue';
import TabsDemo from '@/demos/tabs_demo.vue';

@Component({
  components: {Toggle, ViewFile, Tab, Tabs, TabsDemo}
})
export default class HelloWorld extends Vue {
  @Prop()
  msg!: string;

  wee(e: Event) {
    console.log(e);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

  @import '@/styles/colors.scss';

  h3 {
    margin: 40px 0 0;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }

</style>
