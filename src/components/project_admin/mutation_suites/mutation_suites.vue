<template>
  <div>
    <div v-if="suites.length > 0"
         class="config-viewing-area">
      <feedback-config-mutation-test-suite :mutation_test_suite="suites[0]">
      </feedback-config-mutation-test-suite>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { MutationTestSuite, Project } from 'ag-client-typescript';

import FeedbackConfigMutationTestSuite from '@/components/feedback_config/feedback_config/feedback_config_mutation_suite.vue';

@Component({
  components: {
    FeedbackConfigMutationTestSuite
  }
})
export default class MutationSuites extends Vue {
  @Prop({required: true, type: Project})
  project!: Project;

  adding = false;
  suites: MutationTestSuite[] = [];

  async created() {
    this.suites = await MutationTestSuite.get_all_from_project(this.project.pk);
  }
}
</script>

<style scoped lang="scss">
.config-viewing-area {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
