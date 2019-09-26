<template>
  <select class="select" v-model="d_select_value" @change="update_value">
    <slot></slot>
    <option v-for="item of d_items"
            :key="item[id_field]"
            :value="item[id_field]"
            :selected="item[id_field] === value[id_field]">
      <slot name="option-text" v-bind:item="item"></slot>
    </option>
  </select>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class SelectObject extends Vue {
  @Prop({default: [], type: Array})
  items!: object[];

  d_items: object[] = [];

  @Watch('items')
  on_items_changed(old_value: object[], new_value: object[]) {
    this.d_items = new_value;
  }

  // The name of the field used to uniquely identify the items.
  @Prop({type: String})
  id_field!: string;

  @Prop({default: false, type: Object})
  value!: object;

  @Watch('value')
  on_value_changed(new_value: object, old_value: object) {
    // @ts-ignore
    this.d_select_value = new_value[this.id_field];
  }

  d_select_value: unknown;

  created() {
    this.d_items = this.items;
    // @ts-ignore
    this.d_select_value = this.value[this.id_field];
  }

  private update_value() {
    let selected = this.d_items.find(
      // @ts-ignore
      (item) => item[this.id_field] === this.d_select_value);
    this.$emit('change', selected);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';

</style>
