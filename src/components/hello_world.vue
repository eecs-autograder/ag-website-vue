<template>
<<<<<<< a89a4b687717299333a0baefa574d9629712ed57
=======
  <div class="hello">

    <p id="purple"> Welcome to Clarkston
      <tooltip :message="tooltip_message_1"></tooltip>
    </p>

    <ul>
      <li> One </li>
      <li> Two </li>
      <li> Three </li>
    </ul>

    <p id="shoes"> Payless Shoes
      <tooltip message="BOGO"></tooltip>
    </p>

    <!--<button tooltip="tooltip content here" tooltip_position="left"> Click here</button>-->

    <!--<br><br><br>-->
    <!--<p> Water Bottle-->
      <!--<tooltip message="A dream is a wish your heart makes."></tooltip>-->
    <!--</p>-->

    <!--<div class="water"> <p> Cool </p> </div>-->
>>>>>>> Visibility of the tooltip text is controlled by statements inside of the tooltip component mounted() function.

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
<<<<<<< a89a4b687717299333a0baefa574d9629712ed57
=======
  @Prop()
  msg!: string;

  on = "Hello";

  off = "Super Off";

  filename = "ke$ha.cpp";

  content = "#include \"macklemore.cpp\"\nblah\nblah\nblah\n5coffeeeeeeee\n";

  switchy: boolean = true;

<<<<<<< 67ea74ecb67c94128b779175eea1c9a9c537def7
  active_bkgrnd_color = {
    'backgroundColor': 'hotpink'
  };
=======


  tooltip_message_1 = "Today is August 21st, 2018 <br> " +
                      "Yesterday was August 20th, 2018 <br>" +
                      "Tomorrow will be August 22nd, 2018";
>>>>>>> Visibility of the tooltip text is controlled by statements inside of the tooltip component mounted() function.
>>>>>>> Visibility of the tooltip text is controlled by statements inside of the tooltip component mounted() function.
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
<<<<<<< a89a4b687717299333a0baefa574d9629712ed57
=======
/*h3 {*/
  /*margin: 40px 0 0;*/
/*}*/
/*ul {*/
  /*list-style-type: none;*/
  /*padding: 0;*/
/*}*/
/*li {*/
  /*display: inline-block;*/
  /*margin: 0 10px;*/
/*}*/
/*a {*/
  /*color: #42b983;*/
/*}*/

.water {
  height: 100px;
  width: 100px;
  background-color: cornflowerblue;
}

.water::before {
  content: "before";
}

.water::after {
  content: "after";
}
>>>>>>> Visibility of the tooltip text is controlled by statements inside of the tooltip component mounted() function.

<<<<<<< 67ea74ecb67c94128b779175eea1c9a9c537def7
=======
  #purple {
    margin-top: 200px;
    margin-left: 100px;
  }

  #shoes {
    margin-top: 300px;
    margin-left: 300px;
  }
>>>>>>> Visibility of the tooltip text is controlled by statements inside of the tooltip component mounted() function.
</style>
