<template>
  <div id="ag-test-cases-component">
    <div id="suite-navigation-bar">
      <div id="suites-title"> Suites </div>
      <div :class="['suite-container', {'active-suite-container': test_suite === active_suite}]"
           v-for="test_suite of suites">
        <div :class="['test-suite',
                     {'active-suite': test_suite === active_suite && level_selected === 'Suite'},
                     {'suite-in-active-container': test_suite === active_suite}]"
             @click="update_active_suite(test_suite)">
          {{test_suite.name}}
        </div>
        <div class="cases-container" v-if="active_suite === test_suite">
          <div v-for="test_case of test_suite.test_cases">

            <div :class="['test-case',
                         {'active-case' : test_case === active_case && level_selected === 'Case'},
                         {'parent-of-active-case': test_case === active_case}]"
                 @click="update_active_case(test_case)"> {{test_case.name}}
            </div>

            <div class="commands-container">
              <div v-for="test_command of test_case.test_commands"
                   :class="['test-command',
                           {'active-command' : test_command === active_command && level_selected === 'Command'}]"
                   @click="update_active_command(test_case, test_command)">
                {{test_command.name}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="viewing-window">

      <div v-if="level_selected === 'Suite'">
        <AGSuiteSettings> </AGSuiteSettings>
      </div>
      <div v-if="level_selected === 'Case'"> {{active_case.name}} </div>
      <div v-if="level_selected === 'Command'">
        <AGCommandSettings> </AGCommandSettings>
      </div>
    </div>

    <modal ref="create_suite_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> Create a new suite: </div>
      <hr>
      <div class="modal-body">
        <div> New suite name: </div>
      </div>
    </modal>

    <modal ref="create_case_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> Create a new case: </div>
      <hr>
      <div class="modal-body">
        <div> New case name: </div>
      </div>
    </modal>

    <modal ref="create_command_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> Create a new command: </div>
      <hr>
      <div class="modal-body">
        <div> New command name: </div>
      </div>
    </modal>


  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import AGCommandSettings from '@/components/project_admin/ag_test_cases/ag_test_command_settings.vue';
import AGSuiteSettings from '@/components/project_admin/ag_test_cases/ag_test_suite_settings.vue';
import Modal from '@/components/modal.vue';

import { Project } from 'ag-client-typescript';

interface TestCommand {
  name: string;
  pk: number;
}

interface TestCase {
  name: string;
  pk: number;
  test_commands: TestCommand[];
}

interface TestSuite {
  name: string;
  pk: number,
  test_cases: TestCase[];
}

@Component({
  components: {
    AGCommandSettings,
    AGSuiteSettings,
    Modal
  }
})

export default class AGTestSuites extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  suites: TestSuite[] = [
    {
      name: "Card Public Test",
      pk: 1,
      test_cases: [
        { name: "Test Case 1",
          pk: 1,
          test_commands: [
            { name: "Test command 1", pk: 1 },
            { name: "Test command 2", pk: 2 }
          ]
        },
        { name: "Test Case 2",
          pk: 2,
          test_commands: [
            { name: "Test command 1", pk: 3 },
            { name: "Test command 2", pk: 4 }
          ]
        }
      ],
    },
    {
      name: "Card Private Tests",
      pk: 2,
      test_cases: [
        { name: "Test Case 1",
          pk: 3,
          test_commands: [
            { name: "Test command 1", pk: 5 },
            { name: "Test command 2", pk: 6 }
          ]
        }
      ],
    },
    {
      name: "Euchre Public Tests with Solution Card Pack Player",
      pk: 3,
      test_cases: [
        { name: "Test Case 1",
          pk: 4,
          test_commands: [
            { name: "Test command 1", pk: 6 },
            { name: "Test command 2", pk: 7 }
          ]
        },
        { name: "Test Case 2",
          pk: 5,
          test_commands: [
            { name: "Test command 1", pk: 8 },
            { name: "Test command 2", pk: 9 }
          ]
        }
      ],
    },
  ];

  active_suite: TestSuite | null = null;
  active_case: TestCase | null = null;
  active_command: TestCommand | null = null;

  d_project!: Project;

  new_suite_name = "";
  new_case_name = "";
  new_command_name = "";

  level_selected = "";

  update_active_suite(suite: TestSuite) {
    this.active_suite = suite;
    this.active_command = null;
    this.active_case = null;
    this.level_selected = "Suite";
  }

  update_active_case(test_case: TestCase) {
    this.active_case = test_case;
    this.active_command = null;
    this.level_selected = "Case";
  }

  update_active_command(test_case: TestCase, test_command: TestCommand) {
    this.active_case = test_case;
    this.active_command = test_command;
    this.level_selected = "Command";
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

$active-color: lighten(mediumvioletred, 30);
$parent-of-active-command-color: lighten(mediumvioletred, 40);
$suite-in-active-container-color: lighten(mediumvioletred, 50);

#suites-title {
  font-size: 18px;
  padding: 22px 0 15px 10px;
  font-weight: 500;
}

.test-suite {
  background-color: hsl(210, 20%, 99%);
  padding: 10px;
  border-bottom: 1px solid hsl(210, 20%, 90%);
  cursor: pointer;
}

/*.test-suite:hover {*/
/*  background-color: lavender;*/
/*}*/

.test-case {
  background-color: hsl(210, 20%, 95%);
  box-sizing: border-box;
  padding: 10px;
  border-bottom: 1px solid hsl(210, 20%, 90%);
  cursor: pointer;
  width: 92.5%;
  margin-left: 7.5%;
}

/*.test-case:hover {*/
/*  background-color: lavender;*/
/*}*/

.test-command {
  background-color: hsl(210, 20%, 95%);
  box-sizing: border-box;
  padding: 10px;
  border-bottom: 1px solid hsl(210, 20%, 90%);
  cursor: pointer;
  width: 85%;
  margin-left: 15%;
}

/*.test-command:hover {*/
/*  background-color: lavender;*/
/*}*/

.suite-in-active-container {
  background-color: $suite-in-active-container-color;
}

.parent-of-active-case {
  background-color: $parent-of-active-command-color;
}

.active-suite-container {
  border-bottom: 1px solid hsl(210, 20%, 90%);
}

.active-suite, .active-suite:hover {
  background-color: $active-color;
  /*color: white;*/
}

.active-case, .active-case:hover {
  background-color: $active-color;
  /*color: white;*/
}

.active-command, .active-command:hover {
  background-color: $active-color;
  /*color: white;*/
}

.cases-container {

}

.commands-container {

}

#suite-navigation-bar {
  margin-bottom: 20px;
}

#viewing-window {

}

@media only screen and (min-width: 481px) {
  #suite-navigation-bar {
    width: 350px;
  }

  #viewing-window {
    position: absolute;
    left: 350px;
    top: 15px;
    right: 0;
  }
}

</style>
