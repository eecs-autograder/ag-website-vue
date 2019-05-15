<template>
  <div id="ag-test-cases-component">
    <div id="suite-navigation-bar">
      <div id="suites-title"> Suites
        <div class="add-suite"
             title="Add a Suite"
             @click="$refs.new_suite_modal.open()">
          <i class="far fa-plus-square"></i>
        </div>
      </div>
      <div class="all-suites"
           @wheel.stop>
        <div :class="['suite-container', {'active-suite-container': test_suite === active_suite}]"
             v-for="(test_suite, index) of suites">
          <div :class="['test-suite',
                       {'active-suite': test_suite === active_suite && level_selected === 'Suite'},
                       {'suite-in-active-container': test_suite === active_suite}]"
               @click="update_active_suite(test_suite)">
            <div class="suite-name"> {{test_suite.name}} {{index}}</div>

            <div v-if="test_suite === active_suite"
                 class="add-case"
                 title="Add a Case"
                 @click.stop="$refs.new_case_modal.open()">
              <i class="far fa-plus-square"></i>
            </div>

          </div>
          <div class="cases-container" v-if="active_suite === test_suite">
            <div v-for="test_case of test_suite.test_cases">

              <div :class="['test-case',
                           {'active-case' : test_case === active_case && level_selected === 'Case'},
                           {'parent-of-active-case': test_case === active_case}]"
                   @click="update_active_case(test_case)">
                <div class="case-name"> {{test_case.name}} </div>

                <div v-if="test_case === active_case"
                     class="add-command"
                     title="Add a Command"
                     @click="$refs.new_command_modal.open()">
                  <i class="far fa-plus-square"></i>
                </div>

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
        <div class="nav-bottom"></div>
      </div>
    </div>
    <div id="viewing-window">

      <div v-if="level_selected === 'Suite'"> <AGSuiteSettings> </AGSuiteSettings> </div>

      <div v-if="level_selected === 'Case'"> <AGCaseSettings></AGCaseSettings> </div>

      <div v-if="level_selected === 'Command'"> <AGCommandSettings> </AGCommandSettings> </div>

    </div>

    <modal ref="new_suite_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Suite </div>
      <hr>
      <div class="modal-body">
        <div class="name-container">
          <label class="text-label"> Suite Name </label>
          <validated-input ref="new_suite_name"
                           v-model="new_suite_name"
                           :validators="[is_not_empty]">
          </validated-input>
        </div>

        <button class="green-button modal-create-button"> Add Suite </button>
      </div>
    </modal>



    <modal ref="new_case_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Case </div>
      <hr>
      <div class="modal-body">
        <div class="name-container">
          <label class="text-label"> Case Name </label>
          <validated-input ref="new_case_name"
                           v-model="new_case_name"
                           :validators="[is_not_empty]">
          </validated-input>
        </div>

        <button class="green-button modal-create-button"> Add Case </button>
      </div>
    </modal>



    <modal ref="new_command_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Command </div>
      <hr>
      <div class="modal-body">

        <div id="name-and-command">
          <div class="name-container">
            <label class="text-label"> Command Name </label>
            <validated-input ref="new_command_name"
                             v-model="new_command_name"
                             :validators="[is_not_empty]">
            </validated-input>
          </div>

          <div class="command-container">
            <label class="text-label"> Command </label>
            <validated-input ref="new_command_name"
                             v-model="new_command"
                             :validators="[is_not_empty]">
            </validated-input>
          </div>
        </div>


        <button class="green-button modal-create-button"> Add Command </button>
      </div>
    </modal>


  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import AGCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import AGSuiteSettings from '@/components/project_admin/ag_suites/ag_suite_settings.vue';
import Modal from '@/components/modal.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import {
  is_not_empty,
} from '@/validators';

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
    AGCaseSettings,
    AGCommandSettings,
    AGSuiteSettings,
    Modal,
    ValidatedInput
  }
})

export default class AGSuites extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;

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
      name: "Euchre Public Tests with Solution Card, Pack, Player",
      pk: 3,
      test_cases: [
        {
          name: "Remove Sources",
          pk: 4,
          test_commands: [
            { name: "Remove Sources", pk: 6 }
          ]
        },
        {
          name: "euchre_test00 with solution Card, Pack, Player",
          pk: 5,
          test_commands: [
            { name: "euchre_test00 with solution Card, Pack, Player", pk: 7 }
          ]
        },
        {
          name: "euchre_test01 with solution Card, Pack, Player",
          pk: 6,
          test_commands: [
            { name: "euchre_test01 with solution Card, Pack, Player", pk: 8 }
          ]
        }
      ]
    },
    {
      name: "Player Public Tests",
      pk: 4,
      test_cases: [
        { name: "Player Public Test",
          pk: 7,
          test_commands: [
            { name: "Compile", pk: 10},
            { name: "Run", pk: 11 },
            { name: "Valgrind", pk: 12 }
          ]
        },
        { name: "Student Player tests on student Player",
          pk: 8,
          test_commands: [
            { name: "Compile", pk: 13 },
            { name: "Run", pk: 14 },
            { name: "Valgrind", pk: 14 }
          ]
        }
      ],
    },
    {
      name: "Player Public Tests",
      pk: 4,
      test_cases: [
        { name: "Player Public Test",
          pk: 7,
          test_commands: [
            { name: "Compile", pk: 10},
            { name: "Run", pk: 11 },
            { name: "Valgrind", pk: 12 }
          ]
        },
        { name: "Student Player tests on student Player",
          pk: 8,
          test_commands: [
            { name: "Compile", pk: 13 },
            { name: "Run", pk: 14 },
            { name: "Valgrind", pk: 14 }
          ]
        }
      ],
    }
  ];

  active_suite: TestSuite | null = null;
  active_case: TestCase | null = null;
  active_command: TestCommand | null = null;
  d_project!: Project;
  loading = true;
  new_suite_name = "";
  new_case_name = "";
  new_command_name = "";
  new_command = "";
  level_selected = "";

  async created() {
    this.d_project = this.project;
    // call to get all suites
    this.loading = false;
  }

  update_active_suite(suite: TestSuite) {
    // to collapse
    if (this.active_suite === suite && this.level_selected === "Suite") {
      this.active_suite = null;
    }
    else {
      this.active_suite = suite;
      this.active_command = null;
      this.active_case = null;
      this.level_selected = "Suite";
    }
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

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';

#ag-test-cases-component {
  font-family: "Poppins";
}

$active-color: lighten(mediumvioletred, 30);
$parent-of-active-command-color: lighten(mediumvioletred, 40);
$suite-in-active-container-color: lighten(mediumvioletred, 50);

#suites-title {
  font-size: 20px;
  padding: 5px 0 0 10px;
  margin: 0 0 0 0;
}

#name-and-command {
  padding: 10px 0 20px 0;
}

.name-container, .command-container {
  padding: 0 0 22px 0;
}

.suite-name, .case-name {
  display: inline-block;
  padding: 10px 10px 10px 10px;
  max-width: 80%;
}

.add-suite, .add-case, .add-command {
  display: inline-block;
  padding: 4px 8px;
  font-size: 25px;
  margin-left: 2px;
  cursor: pointer;
  vertical-align: top;
}

.add-suite {
  vertical-align: middle;
}

.modal-create-button {
  float: right;
}

.all-suites {
  border: 2px solid #ebedef;
  border-bottom: 1px solid #ebedef;
}

.test-suite {
  background-color: hsl(210, 20%, 99%);
  border-bottom: 1px solid hsl(210, 20%, 90%);
  cursor: pointer;
  font-size: 15px;
  box-sizing: border-box;
}

.test-case {
  background-color: hsl(210, 20%, 96%);
  box-sizing: border-box;
  border-bottom: 1px solid hsl(210, 20%, 90%);
  cursor: pointer;
  width: 95%;
  margin-left: 5%;
  font-size: 15px;
}

.test-command {
  background-color: hsl(210, 20%, 96%);
  box-sizing: border-box;
  border-bottom: 1px solid hsl(210, 20%, 90%);
  cursor: pointer;
  padding: 10px;
  width: 90%;
  margin-left: 10%;
  font-size: 15px;
}

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
}

.active-case, .active-case:hover {
  background-color: $active-color;
}

.active-command, .active-command:hover {
  background-color: $active-color;
}

#suite-navigation-bar {
  margin-bottom: 20px;
}

@media only screen and (min-width: 481px) {

  #ag-test-cases-component {
    position: relative;
  }

  #suite-navigation-bar {
    width: 400px;
    padding-top: 2px;
    margin: 0;
  }

  .all-suites {
    max-height: 87vh;
    overflow-y: scroll;
    scroll-behavior: smooth;
  }

  #viewing-window {
    position: absolute;
    left: 398px;
    top: 0;
    right: 0;
  }
}

</style>
