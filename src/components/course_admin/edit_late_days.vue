<template>
  <div v-if="d_loading" class="loading-centered loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="edit-late-days-component">
    <div class="search-wrapper">
      <dropdown-typeahead
        ref="lookup"
        class="lookup"
        placeholder_text="Enter a username"
        @item_selected="search($event)"
        :filter_fn="(username, filter_text) => username.includes(filter_text)"
        :choices="d_students">
      </dropdown-typeahead>
      <button type="button"
              data-testid="search_button"
              class="blue-button"
              @click="search($refs.lookup.filter_text)">
        Search (If not in list)
      </button>
    </div>

    <div v-if="d_searching" class="loading-medium">
      <i class="fa fa-spinner loading fa-pulse"></i>
    </div>
    <div class="late-day-info-wrapper" v-else-if="d_selected_username !== ''">
      <div v-if="d_show_not_found_message" class="user-not-found">
        User "{{d_selected_username}}" not found.
      </div>
      <validated-form v-else
                      ref="late_day_form"
                      @submit="save_late_days"
                      @form_validity_changed="d_late_day_form_is_valid = $event">
        <label class="label">"{{d_selected_username}}" Late Day Tokens Remaining</label>
        <validated-input ref="late_days_input"
                         v-model="d_num_late_days"
                         :from_string_fn="string_to_num"
                         :validators="[is_non_negative]"
                         input_style="width: 100px">
        </validated-input>

        <APIErrors ref="api_errors"></APIErrors>

        <div class="button-footer">
          <button data-testid="save_button"
                  class="save-button"
                  type="submit"
                  :disabled="!d_late_day_form_is_valid || d_saving">
            Save
          </button>
        </div>
      </validated-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, HttpError, User } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import {
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func
} from '@/error_handling';
import { toggle } from '@/utils';
import { is_non_negative, string_to_num } from '@/validators';

@Component({
  components: {
    APIErrors,
    DropdownTypeahead,
    ValidatedForm,
    ValidatedInput,
  }
})
export default class EditLateDays extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  d_loading = true;
  d_searching = false;
  d_saving = false;

  d_students: string[] = [];

  d_selected_username = '';
  d_num_late_days = 0;

  // For showing a helpful message when the user uses the search button
  // and the user doesn't exist.
  d_show_not_found_message = false;

  d_late_day_form_is_valid = false;

  readonly is_non_negative = is_non_negative;
  readonly string_to_num = string_to_num;

  @handle_global_errors_async
  async created() {
    this.d_students = (await this.course.get_students()).map(user => user.username);
    this.d_loading = false;
  }

  @handle_global_errors_async
  async search(username: string) {
    username = username.trim();
    if (username === '') {
      return;
    }

    this.d_saving = true;
    this.d_show_not_found_message = false;
    this.d_selected_username = '';
    try {
      this.d_num_late_days = (
        await User.get_num_late_days(this.course.pk, username)
      ).late_days_remaining;
      this.d_selected_username = username;
    }
    catch (e) {
      if (!(e instanceof HttpError) || e.status !== 404) {
        // istanbul ignore next
        throw e;
      }
      this.d_show_not_found_message = true;
      // Do NOT put this line in the finally block
      this.d_selected_username = username;
    }
    finally {
      this.d_saving = false;
    }
  }

  @handle_api_errors_async(make_error_handler_func())
  save_late_days() {
    return toggle(this, 'd_saving', () => {
        return User.set_num_late_days(
          this.course.pk, this.d_selected_username, this.d_num_late_days);
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';

.fa-exclamation-triangle {
  color: darken($light-yellow, 25%);
}

.warning-wrapper {
  margin: .25rem 0;
  display: flex;

  .warning-text {
    padding-left: .25rem;
  }
}

.search-wrapper {
  display: flex;
  max-width: 500px;
  margin: .5rem 0;

  .lookup {
    flex-grow: 1;
    margin-right: .375rem;
  }
}

.late-day-info-wrapper {
  margin: 1.25rem 0;
  max-width: 500px;
}
</style>
