<template>
  <!-- This outer div insulates the wrapped select tag from attribute
       and event bindings on the component. -->
  <div>
    <select class="select" v-model="d_value" @change="update_value">
      <slot></slot>
      <option v-for="item of d_items"
              :key="item[id_field]"
              :value="item[id_field]">
        <slot name="option-text" v-bind:item="item">{{item[id_field]}}</slot>
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';

type ItemType = {[key: string]: unknown};

@Component
export default class SelectObject extends Vue {
  @Prop({default: [], type: Array})
  items!: ItemType[];

  d_items: ItemType[] = [];

  @Model('change', {required: false, type: Object, default: null})
  value!: ItemType | null;

  d_value: unknown = null;

  // The name of the field used to uniquely identify the items.
  @Prop({type: String})
  id_field!: string;

  @Watch('items')
  on_items_changed(new_items: ItemType[], old_items: ItemType[]) {
    this.d_items = new_items;
  }

  @Watch('value')
  on_value_changed(new_value: ItemType | null, old_value: ItemType | null) {
    this.set_d_value(new_value);
  }

  created() {
    this.d_items = this.items;
    this.set_d_value(this.value);
  }

  private set_d_value(value: ItemType | null) {
    if (value === null) {
      this.d_value = null;
    }
    else {
      this.d_value = value[this.id_field];
    }
  }

  private update_value() {
    let selected = this.d_items.find(
      (item) => item[this.id_field] === this.d_value);
    this.$emit('change', selected);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';

</style>
