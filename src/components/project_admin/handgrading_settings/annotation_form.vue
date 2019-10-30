<template>
  <validated-form ref="form" @submit="submit"
                  @form_validity_changed="$emit('form_validity_changed', $event)">
    <div class="input-spacing">
      <label class="text-label">Name</label>
      <validated-input v-model="d_form_data.short_description"
                       ref="short_description"
                       :validators="[is_not_empty]"></validated-input>
    </div>

    <div class="input-spacing">
      <label class="text-label">Deduction</label>
      <validated-input v-model="d_form_data.deduction"
                       ref="deduction"
                       :validators="[is_not_empty, is_integer, is_non_positive]"
                       :from_string_fn="string_to_num"></validated-input>
    </div>

    <div class="input-spacing">
      <label class="text-label">Max deduction</label>
      <validated-input v-model="d_form_data.max_deduction"
                       ref="max_deduction"
                       :validators="[is_non_positive_or_empty]"
                       :to_string_fn="(num) => num === null ? '' : num.toString()"
                       :from_string_fn="(val) => val.trim() === '' ? null : Number(val)">
      </validated-input>
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

import { Annotation } from 'ag-client-typescript';

import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { Created } from '@/lifecycle';
import {
  is_integer,
  is_not_empty,
  make_max_value_validator,
  string_to_num,
} from '@/validators';

export class AnnotationFormData {
  short_description: string;
  long_description: string;
  deduction: number;
  max_deduction: number | null;

  constructor(args: AnnotationFormData = {short_description: '', long_description: '',
                                          deduction: 0, max_deduction: null}) {
    this.short_description = args.short_description;
    this.long_description = args.long_description;
    this.deduction = args.deduction;
    this.max_deduction = args.max_deduction;
  }
}

@Component({
  components: {
    ValidatedForm,
    ValidatedInput,
  }
})
export default class AnnotationForm extends Vue implements Created {
  @Prop({default: () => new AnnotationFormData(), type: [Annotation, AnnotationFormData]})
  annotation!: Annotation;

  d_form_data: AnnotationFormData = new AnnotationFormData();

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_non_positive = make_max_value_validator(0);
  readonly is_non_positive_or_empty = make_max_value_validator(0, true);
  readonly string_to_num = string_to_num;

  created() {
    this.d_form_data = new AnnotationFormData(this.annotation);

    this.$nextTick(() => {
      (<ValidatedInput> this.$refs.short_description).focus();
    });
  }

  @Watch('annotation')
  on_annotation_changed(new_value: Annotation, old_value: Annotation) {
    this.d_form_data = new AnnotationFormData(this.annotation);
  }

  submit() {
    this.$emit('submit', this.d_form_data);
  }

  reset() {
    (<ValidatedForm> this.$refs.form).reset_warning_state();
    this.d_form_data = new AnnotationFormData(this.annotation);
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/global.scss';

</style>
