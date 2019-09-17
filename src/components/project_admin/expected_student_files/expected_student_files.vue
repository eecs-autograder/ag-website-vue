<template>
  <div id="expected-student-files-component">
    <div class="new-pattern-side">
      <div class="new-pattern-container">
        <div class="new-pattern-title"> New Expected Student File </div>
        <div id="new-expected-file-pattern">
          <create-expected-student-file ref="create_expected_student_file"
                                        :project="project">
          </create-expected-student-file>
        </div>
      </div>
    </div>

    <div class="existing-patterns">
      <div class="existing-patterns-title"> Existing Expected Student Files </div>
      <div class="list-of-patterns-container">
        <div v-for="(file, index) of expected_student_files"
             :key="file.pk">
          <single-expected-student-file :expected_student_file="file">
          </single-expected-student-file>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { ExpectedStudentFile, ExpectedStudentFileObserver, Project } from 'ag-client-typescript';

import CreateExpectedStudentFile from '@/components/project_admin/expected_student_files/create_expected_student_file.vue';
import SingleExpectedStudentFile from '@/components/project_admin/expected_student_files/single_expected_student_file.vue';
import Tooltip from '@/components/tooltip.vue';
import { array_remove_unique, deep_copy } from '@/utils';

@Component({
  components: {
    CreateExpectedStudentFile,
    SingleExpectedStudentFile,
    Tooltip
  }
})
export default class ExpectedStudentFiles extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  // Do NOT modify the contents of this array!!
  get expected_student_files(): ReadonlyArray<Readonly<ExpectedStudentFile>> {
    return this.project.expected_student_files;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#expected-student-files-component {
  width: 95%;
  margin: 20px 2.5%;
}

#new-expected-file-pattern {
  color: black;
  padding: 10px 25px 10px 25px;
  border-radius: 5px;
  background-color: hsl(220, 30%, 95%);
  border: 2px solid hsl(220, 30%, 94%);
}

.new-pattern-side, .existing-patterns {
  display: block;
}

.new-pattern-title, .existing-patterns-title {
  font-size: 17px;
  font-weight: 600;
}

.existing-patterns-title {
  padding: 40px 0 10px 0;
}

.new-pattern-title {
  padding: 5px 0 10px 0;
}

@media only screen and (min-width: 800px) {
  .new-pattern-side, .existing-patterns {
    display: inline-block;
    vertical-align: top;
  }

  .new-pattern-side {
    width: 35%;
    box-sizing: border-box;
  }

  .existing-patterns {
    width: 65%;
    box-sizing: border-box;
    padding: 0 0 0 40px;
  }

  .new-pattern-title, .existing-patterns-title {
    font-size: 18px;
    padding: 5px 0 15px 0;
  }
}
</style>
