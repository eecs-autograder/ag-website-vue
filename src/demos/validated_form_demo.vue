<template>
  <validated-form @submit="save_data" ref="form1">
    <validated-input v-model="data.id"
                     :validators="[is_number]"
                     :from_string_fn="(val) => parseInt(val, 10)"></validated-input>
    <div id="hello">
      <p>here</p>
      <validated-input v-model="data.name" :validators="[(val) => [val === 'mars', 'not mars']]"></validated-input>
    </div>

    <button type="submit" :disabled="loading || !$refs.form1.is_valid()">Save</button>
  </validated-form>
  <!--<div>-->
    <!--<validated-form ref="form1">hello</validated-form>-->
    <!--<h3>{{loading || this.$refs.form1.is_valid()}}</h3>-->
  <!--</div>-->
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

  @Component({
    components: { ValidatedForm, ValidatedInput }
  })
  export default class ValidatedFormDemo extends Vue {
    data = {
      id: 42,
      name: "Waaaaaaluigi"
    };

    loading = true;

    save_data() {
      console.log("saved!");
    }

    is_number(value: string): ValidatorResponse {
      return {
        is_valid: value !== "" && !isNaN(Number(value)),
        error_msg:  "Invalid number!",
      };
    }

    mounted() {
      /*
       * The loading variable is necessary in order to display the value of
       * this.$refs.my_input.is_valid() on render.

       * For more info, see notice at end of section
       * "Accessing Child Component Instances & Child Elements" at
       * https://vuejs.org/v2/guide/components-edge-cases.html
       */
      this.loading = false;
    }
  }
</script>

<style scoped lang="scss">
</style>
