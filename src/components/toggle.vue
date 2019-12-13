<template>
  <div class="toggle-button-space">
    <div v-if="is_on" class="active-option-style on-border"
         :style="[{backgroundColor: active_background_color}]">
      <slot name="on"> </slot>
    </div>
    <div v-else @click="_toggle()" class="inactive-option-style on-border cursor-pointer">
      <slot name="on"> </slot>
    </div>

    <div v-if="is_on" @click="_toggle()" class="inactive-option-style off-border">
      <slot name="off"> </slot>
    </div>
    <div v-else class="active-option-style off-border"
         :style="[{backgroundColor: active_background_color}]">
      <slot name="off"> </slot>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Toggle extends Vue {

  @Prop({default: false, type: Boolean})
  value!: boolean;

  @Watch('value')
  on_value_changed(new_value: boolean, old_value: boolean) {
    this.is_on = new_value;
  }

  @Prop({default: 'hsl(208, 59%, 49%)', type: String})
  active_background_color!: string;

  is_on: boolean = false;

  created() {
    this.is_on = this.value;
  }

  private _toggle() {
    this.is_on = !this.is_on;
    this.$emit('input', this.is_on);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.active-option-style, .inactive-option-style {
  display: inline-block;
  padding: .5rem .75rem;
}

.active-option-style {
  box-shadow: 0 1px 1px $dark-gray;
  color: white;
}

.inactive-option-style {
  box-shadow: inset 1px 1px 3px $dark-gray;
  color: black;
  cursor: pointer;
  background-color: white;
}

.off-border {
  border-radius: 0 3px 3px 0;
}

.on-border {
  border-radius: 3px 0 0 3px;
}

</style>
