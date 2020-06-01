<template>
  <!-- Given a Group, loads a list of its submissions and shows a checkbox
       for each submission. -->

  <div class="submission-selector">
    <div class="header" @click="d_collapsed = !d_collapsed">
      <i class="caret fas" :class="d_collapsed ? 'fa-caret-right' : 'fa-caret-down'"></i>
      <div class="member-names">
        <div class="member-name"
             v-for="(member, index) of group.member_names">
          {{member}}<span class="separator" v-if="index < group.member_names.length - 1">,</span>
        </div>
      </div>
    </div>
    <div v-show="!d_collapsed">
      <div v-if="d_loading" class="loading-horiz-centered loading-medium">
        <i class="fa fa-spinner fa-pulse"></i>
      </div>
      <div v-else class="selector-body">
        <div class="button-footer">
          <button data-testid="select_all_button" class="white-button" @click="select_all">
            <i class="far fa-check-square"></i>
            Select All
          </button>
          <button data-testid="clear_all_button" class="white-button" @click="clear_all">
            <i class="far fa-square"></i>
            Clear All
          </button>
          <button data-testid="remove_group_button"
                  class="white-button"
                  @click="$emit('remove_group', group)">
            <i class="fas fa-times"></i>
            Remove Group
          </button>
        </div>
        <div class="checkbox-input-container"
             ref="submission_checkbox"
             v-for="submission of d_submissions" :key="submission.pk">
          <label>
            <input
              type="checkbox"
              class="checkbox"
              :checked="d_selected_submissions.has(submission)"
              @change="toggle_submission(submission)"/>
            {{format_datetime(submission.timestamp)}}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { ArraySet, pk_more } from '@/array_set';
import { handle_global_errors_async } from '@/error_handling';
import { format_datetime } from '@/utils';

@Component
export default class SubmissionSelector extends Vue {
  @Prop({required: true, type: ag_cli.Group})
  group!: ag_cli.Group;

  d_submissions: ag_cli.Submission[] = [];
  d_selected_submissions = new ArraySet<ag_cli.Submission>([], {less_func: pk_more});

  d_loading = true;
  d_collapsed = false;

  readonly format_datetime = format_datetime;

  @handle_global_errors_async
  async created() {
    this.d_submissions = await ag_cli.Submission.get_all_from_group(this.group.pk);
    this.d_loading = false;
  }

  toggle_submission(submission: ag_cli.Submission) {
    if (this.d_selected_submissions.has(submission)) {
      this.d_selected_submissions.remove(submission);
      this.$emit('submissions_unselected', [submission]);
    }
    else {
      this.d_selected_submissions.insert(submission);
      this.$emit('submissions_selected', [submission]);
    }
  }

  select_all() {
    this.d_selected_submissions = new ArraySet(this.d_submissions.slice(), {less_func: pk_more});
    this.$emit('submissions_selected', this.d_selected_submissions.data);
  }

  clear_all() {
    let to_emit = this.d_selected_submissions.data;
    this.d_selected_submissions = new ArraySet([], {less_func: pk_more});
    this.$emit('submissions_unselected', to_emit);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/section_header.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.header {
  @include collapsible-section-header($line-color: $pebble-dark);
}

.member-names {
  display: flex;
  flex-wrap: wrap;

  .separator {
    margin-right: .25rem;
  }
}

.selector-body {
  margin-left: .75rem;
}
</style>
