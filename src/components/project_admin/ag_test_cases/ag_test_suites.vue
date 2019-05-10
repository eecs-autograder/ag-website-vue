<template>
  <div id="ag-test-cases-component">
    <div id="suite-navigation-bar">
      <div id="suites-title"> Suites </div>
      <div class="suite-container" v-for="test_suite of suites">
        <div :class="['test-suite', {'active-suite' : test_suite === active_suite}]"
             @click="update_active_suite(test_suite)"> {{test_suite}} </div>
        <div class="cases-container" v-if="active_suite === test_suite">
          <div v-for="test_case of cases" class="test-case"> {{test_case}} </div>
          <div class="command-container" v-for="test_command of commands">
            <div class="test-command"> {{test_command}} </div>
          </div>
        </div>
      </div>
    </div>
    <div id="viewing-window">
      <AGTestCommandSettings> </AGTestCommandSettings>
    </div>
  </div>
</template>

<script lang="ts">
import { Project } from 'ag-client-typescript';
import { Component, Prop, Vue } from 'vue-property-decorator';

import AGTestCommandSettings from '@/components/project_admin/ag_test_cases/ag_test_command_settings.vue';

@Component({
  components: {
    AGTestCommandSettings
  }
})
export default class AGTestSuites extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  suites: string[] = ["Card Public Test", "Card Private Tests", "Euchre Public Tests with Solution Card Pack Player"];

  cases: string[] = ["Test Case 1"];

  commands: string[] = ["Compile", "Run"];

  active_suite = "Card Public Test";

  d_project!: Project;

  new_suite_name = "";

  update_active_suite(suite: string) {
    this.active_suite = suite;
  }

  update_active_case() {

  }

  update_active_command() {

  }
}
</script>

@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

#ag-test-cases-component {
  font-family: "Poppins";
}

#suites-title {
  font-size: 18px;
  padding: 5px 0 15px 10px;
  font-weight: 500;
}

.test-suite {
  background-color: hsl(210, 20%, 96%);
  padding: 10px;
  border-bottom: 1px solid hsl(210, 20%, 94%);
  cursor: pointer;
}

.active-suite {
  background-color: teal;
  color: white;
}

.active-suite:after {

}

.active-case {

}

.active-command {

}

.test-case {
  background-color: hsl(210, 20%, 93%);
  padding: 10px;
  border-bottom: 1px solid hsl(210, 20%, 94%);
  cursor: pointer;
}

.test-command {
  background-color: hsl(210, 20%, 90%);
  padding: 10px;
  border-bottom: 1px solid hsl(210, 20%, 94%);
  cursor: pointer;
}

#suite-navigation-bar {
  width: 350px;
}

#viewing-window {
  position: absolute;
  left: 360px;
  top: 0;
  right: 0;
}

</style>
