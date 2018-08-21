<template>
<<<<<<< HEAD
=======
  <div class="hello">

    <button class="button-styling blue-button"> Click On Me </button>
    <br>
    <br>
    <button class="button-styling green-button"> Save </button>
    <br>
    <br>
    <button class="button-styling red-button"> Delete  <p class="trash-can fas fa-trash"></p> </button>
    <br>
    <br>
    <button class="button-styling gray-button"> Cancel </button>
    <br>
    <br>
    <button class="button-styling orange-button"> Happy Halloween </button>
    <br>
    <br>
    <button class="button-styling purple-button"> Enter Contest </button>
    <br>
    <br>

    <!--<div class="button-styling green-button"> Hello </div>-->
>>>>>>> Changed the color of the red button to be the color of the incorrect row in the submission_detail component.

  <div>
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

  .trash-can {
    margin: 0 0 0 5px;
  }

</style>
