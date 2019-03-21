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
          <single-expected-student-file :expected_student_file="file"
                                        :odd_index="index % 2 === 1">
          </single-expected-student-file>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
  import { array_remove_unique } from '@/utils';
  import { ExpectedStudentFile, ExpectedStudentFileObserver, Project } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import CreateExpectedStudentFile from '@/components/expected_student_files/create_expected_student_file.vue';
  import SingleExpectedStudentFile from '@/components/expected_student_files/single_expected_student_file.vue';
  import Tooltip from '@/components/tooltip.vue';

  @Component({
    components: { CreateExpectedStudentFile, SingleExpectedStudentFile, Tooltip }
  })
  export default class ExpectedStudentFiles extends Vue implements ExpectedStudentFileObserver {

    @Prop({required: true, type: Project})
    project!: Project;

    expected_student_files: ExpectedStudentFile[] = [];

    async created() {
      ExpectedStudentFile.subscribe(this);
      this.expected_student_files = await ExpectedStudentFile.get_all_from_project(this.project.pk);
      this.sort_files();
    }

    destroyed() {
      ExpectedStudentFile.unsubscribe(this);
    }

    update_expected_student_file_created(expected_student_file: ExpectedStudentFile): void {
      this.expected_student_files.push(expected_student_file);
      this.sort_files();
    }

    update_expected_student_file_changed(expected_student_file: ExpectedStudentFile): void {
      console.log("A file was changed");
      let index = this.expected_student_files.findIndex(
        (file) => file.pk === expected_student_file.pk);
      Vue.set(this.expected_student_files, index, expected_student_file);
      this.sort_files();
    }

    update_expected_student_file_deleted(expected_student_file: ExpectedStudentFile): void {
      array_remove_unique(this.expected_student_files,
                          expected_student_file.pk,
                          (file, pk) => file.pk === pk
      );
    }

    sort_files() {
      this.expected_student_files.sort(
        (file_a: ExpectedStudentFile, file_b: ExpectedStudentFile) => {
          if (file_a.pattern <= file_b.pattern) {
            return -1;
          }
          return 1;
        }
      );
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');
$current-language: "Quicksand";

#expected-student-files-component {
  font-family: $current-language;
  width: 95%;
  margin: 20px 2.5%;
}

#new-expected-file-pattern {
  color: white;
  padding: 10px 25px 10px 25px;
  border-radius: 3px;
  background-image: linear-gradient(to bottom right, hsl(220, 20%, 37%), hsl(220, 20%, 39%));
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
