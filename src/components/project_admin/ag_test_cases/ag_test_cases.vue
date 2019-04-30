<template>
  <div id="ag-test-cases-component">
    <div id="left-column">
      <div id="left-column-title"> Suites </div>
      <!--<div class="suite-container">-->
      <!--<div class="new-suite-section">-->
      <!--<input type="text" v-model="new_suite_name" id="new-suite" placeholder="New suite name">-->
      <!--<input type="submit" value="Add Suite" id="new-suite-submit">-->
      <!--</div>-->
      <!--</div>-->
      <div class="suite-container active-suite-container">
        <div class="suite-active"> Card Public Tests <i class="fas fa-plus add-test-sign"></i></div>
        <div class="cases">
          <div class="case-name first-case"> Card Public Test </div>
          <div class="commands">
            <div class="command-name first-command chosen-command"> Compile </div>
            <div class="command-name"> Run </div>
            <div class="command-name"> Valgrind </div>
          </div>
          <div class="case-name"> Student Card tests on student Card </div>
          <div class="commands">
            <div class="command-name first-command"> Compile </div>
            <div class="command-name"> Run </div>
            <div class="command-name"> Valgrind </div>
          </div>
        </div>
      </div>
      <div class="suite-container">
        <div class="suite-name"> Card Private Tests </div>
      </div>
      <div class="suite-container">
        <div class="suite-name"> Euchre Public Tests with Solution Card, Pack, Player </div>
      </div>
    </div>
    <div id="right-column">
      <div class="right-column-tabs">
        <tabs ref="tabs"
              v-model="current_suite_tab_index"
              tab_active_class="buttons-style-active"
              tab_inactive_class="buttons-style-inactive">
          <tab>
            <tab-header v-on:click="current_suite_tab_index = 2">
              <p class="tab-heading"> Case Settings </p>
            </tab-header>
            <template slot="body">
              <div class="tab-body2">
                <!--<div id="test-cases">-->
                <!--<div class="test-case"> Remove Sources </div>-->
                <!--&lt;!&ndash;<div class="btns">&ndash;&gt;-->
                <!--&lt;!&ndash;<div class="left-btn"> Edit Case Settings </div>&ndash;&gt;-->
                <!--&lt;!&ndash;<div class="right-btn"> Commands </div>&ndash;&gt;-->
                <!--&lt;!&ndash;</div>&ndash;&gt;-->
                <!--<div class="test-case case-active"> Euchre test00 with solution Card, Pack, Player </div>-->
                <!--<div class="commands">-->
                <!--&lt;!&ndash;<p class="commands-title"> Commands: </p>&ndash;&gt;-->
                <!--<div class="command"> Compile </div>-->
                <!--<div class="command"> Run </div>-->
                <!--<div class="command"> Valgrind </div>-->
                <!--&lt;!&ndash;<div class="command"> Edit Case Settings</div>&ndash;&gt;-->
                <!--</div>-->
                <!--<div class="test-case"> Euchre test01 with solution Card, Pack, Player </div>-->
                <!--<div class="test-case"> Euchre test50 with solution Card, Pack, Player </div>-->
                <!--</div>-->
              </div>
            </template>
          </tab>
          <!--<tab>-->
          <!--<tab-header v-on:click="current_suite_tab_index = 1">-->
          <!--<p class="tab-heading"> Case Settings </p>-->
          <!--</tab-header>-->
          <!--<template slot="body">-->
          <!--<div class="tab-body2">-->
          <!--</div>-->
          <!--</template>-->
          <!--</tab>-->
        </tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Project } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';

@Component({
  components: {
    Tab,
    TabHeader,
    Tabs
  }
})
export default class AGTestCases extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  d_project: Project | null = null;

  current_suite_tab_index = 0;

  new_suite_name = "";
}
</script>

@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

$piping-color: white;

$cascade-1: $pebble-light;
$cascade-2: $stormy-gray-light;
$cascade-3: lighten($stormy-gray-light, 10);

.add-test-sign {
  font-size: 12px;
  border: 2px solid black;
  cursor: pointer;
  border-radius: 100%;
  padding: 4px 5px;
  margin-left: 10px;
  color: black;
}

#ag-test-cases-component {
  font-family: Poppins;
}

#left-column {
  /*background-color: darken(lavender, 15);*/
  /*background-color: white;*/
  position: absolute;
  left: 0;
  top: 0;
  width: 400px;
  height: 100%;
}

#left-column-title {
  padding: 15px;
  color: white;
  font-size: 28px;
}

#right-column {
  background-color: white;
  position: absolute;
  left: 400px;
  right: 0;
  top: 0;
  height: 100%;
}

#new-suite {
  padding: 8px;
  font-size: 18px;
  border: 1px solid $pebble-light;
  border-radius: 5px;
  width: 300px;
  margin: 12px 0;
}

.new-suite-section {
  color: white;
  padding: 12px 15px;
  display: block;
  font-size: 18px;
}

#new-suite-submit {
  border: none;
  border-radius: 5px;
  padding: 8px;
  font-size: 18px;
  background-color: black;
  color: gray;
  margin-left: 10px;
}

.suite-container {
  /*<!--border-bottom: 2px solid $pebble-dark;-->*/
  /*border-bottom: 2px solid white;*/
}

.active-suite-container {
  /*padding-bottom: 10px;*/
  /*border-bottom: 2px solid white;*/
  margin-bottom: 10px;
}

.first-case {
  /*border-top: 2px solid white;*/
}

.suite-active, .suite-active:hover {
  background-color: $cascade-1;
  font-weight: bold;
  color: black;
  padding: 8px 15px;
  display: block;
  font-size: 16px;
  border-bottom: 2px solid white;
}

.case-name {
  background-color: $cascade-2;
  color: black;
  margin-left: 20px;
  padding: 8px 15px;
  display: block;
  font-size: 16px;
  position: relative;
  /*border-bottom: 2px solid black;*/
  /*border-right: 2px solid black;*/
  /*border-bottom-left-radius: 5px;*/
  border-bottom: 2px solid white;
}

/*
.case-name:before {
  content: " ";
  height: 20%;
  width: 2%;
  border-radius: 100%;
  top: 50%;
  left: -26px;
  position: absolute;
  background-color: $piping-color;
}

.case-name:after {
  content: " ";
  height: 2px;
  width: 20px;
  top: 50%;
  left: -20px;
  position: absolute;
  background-color: $piping-color;
}

.command-name:before {
  content: " ";
  height: 10px;
  width: 10px;
  border-radius: 100%;
  top: 50%;
  left: -26px;
  position: absolute;
  background-color: $piping-color;
}

.command-name:after {
  content: " ";
  height: 2px;
  width: 20px;
  top: 50%;
  left: -20px;
  position: absolute;
  background-color: $piping-color;
}
*/

.cases {
  //border-left: 2px solid $piping-color;
  margin-left: 20px;
}

.commands {
  //border-left: 2px solid $piping-color;
  margin-left: 40px;
}

.command-name {
  background-color: $cascade-3;
  color: black;
  margin-left: 20px;
  padding: 8px 15px;
  display: block;
  font-size: 16px;
  /*border-bottom: 2px solid white;*/
  position: relative;
  border-bottom: 2px solid white;
}

.first-command {
  /*border-top: 2px solid white;*/
}

.command-name:last-child {
  /*border-bottom: none;*/
}

.suite-name {
  padding: 8px 15px;
  display: block;
  font-size: 16px;
  color: black;
}

.suite-name:hover {
  background-color: darken($stormy-gray-dark, 15);
  cursor: pointer;
}

.edit-suite-choices {
  color: black;
  padding: 0 15px 15px 15px;
  background-color: white;
  margin-bottom: 10px;
  font-size: 14px;
  border-right: 2px solid $pebble-dark;
}

.edit-suite-choices div {
  display: inline-block;
  text-align: center;
}

.edit-suite-settings, .edit-test-cases {
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
}

.edit-suite-settings {
  background-color: gray;
  margin-right: 30px;
}

.edit-test-cases {
  /*background-color: orange;*/
}

.edit-test-cases {
  background: gray;
}

.edit-test-cases:hover, .edit-suite-settings:hover {
  /*background-color: darken(orange, 3);*/
}

#test-cases {
  padding: 10px 20px;
}

.test-case {
  /*border-radius: 5px;*/
  display: block;
  width: 400px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: darken($stormy-gray-dark, 10);
  color: white;
}

.case-active {
  /*background-color: orange;*/
  color: black;
  font-weight: bold;
}

.right-column-title {
  font-size: 18px;
  padding: 20px 30px 10px 30px;
  margin: 0;
  font-weight: bold;
}

.left-btn, .right-btn {
  cursor: pointer;
  padding: 10px 15px;
  /*background-color: orange;*/
  border-radius: 5px;
  display: inline-block;
  font-size: 18px;
}

.left-btn {
  background-color: white;
  color: black;
}

.btns {
  padding: 10px;
}

.left-btn {
  margin-right: 20px;
}

.command {
  padding: 10px;
  margin: 5px;
  width: 400px;
  border-radius: 3px;
}

.commands-title {
  padding: 0 10px;
}

.right-column-tabs {
  padding: 12px 20px;
}

.tab-heading {
  margin: 0;
  font-size: 16px;
}

.tab-body2 {
  padding: 20px;
  /*border-top: 2px solid black;*/
}

</style>
