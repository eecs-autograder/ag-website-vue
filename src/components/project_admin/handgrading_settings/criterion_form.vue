<template>
  <validated-form ref="form"
                  @submit="submit"
                  @form_validity_changed="$emit('form_validity_changed', $event)">
    <div class="input-spacing">
      <label class="text-label">Name</label>
      <validated-input v-model="d_form_data.short_description"
                       ref="short_description"
                       :validators="[is_not_empty]"></validated-input>
    </div>

    <div class="input-spacing">
      <label class="text-label">Points</label>
      <validated-input v-model="d_form_data.points"
                       ref="points"
                       :validators="[is_not_empty, is_integer]"
                       :from_string_fn="string_to_num"></validated-input>
    </div>

    <div class="input-spacing">
      <label class="text-label">Description</label>
      <validated-input v-model="d_form_data.long_description"
                       ref="long_description"
                       :num_rows="3"
                       :validators="[]"></validated-input>
    </div>

    <slot></slot>
  </validated-form>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { Criterion } from 'ag-client-typescript';

import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { Created } from '@/lifecycle';
import { is_integer, is_not_empty, string_to_num } from '@/validators';

export class CriterionFormData {
  short_description: string;
  long_description: string;
  points: number;

  constructor(args: CriterionFormData = {short_description: '',
                                         long_description : '', points: 0}) {
    this.short_description = args.short_description;
    this.long_description = args.long_description;
    this.points = args.points;
  }
}

@Component({
  components: {
    ValidatedForm,
    ValidatedInput,
  }
})
export default class CriterionForm extends Vue implements Created {
  @Prop({default: () => new CriterionFormData(), type: [Criterion, CriterionFormData]})
  criterion!: Criterion;

  d_form_data: CriterionFormData = new CriterionFormData();

  @Watch('criterion')
  on_criterion_changed(new_value: Criterion, old_value: Criterion) {
    this.d_form_data = new CriterionFormData(new_value);
  }

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly string_to_num = string_to_num;

  created() {
    this.d_form_data = new CriterionFormData(this.criterion);

    this.$nextTick(() => {
      (<ValidatedInput> this.$refs.short_description).focus();
    });
  }

  submit() {
    this.$emit('submit', this.d_form_data);
  }

  reset() {
    (<ValidatedForm> this.$refs.form).reset_warning_state();
    this.d_form_data = new CriterionFormData(this.criterion);
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/global.scss';

</style>
