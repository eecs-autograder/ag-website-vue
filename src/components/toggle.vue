<template>
  <div id="toggle-button-space">

    <div v-if="is_on" class="active-option-style on-border" :style="active_background_color">
      <slot name="on"> </slot>
    </div>
    <div v-else @click="_toggle()" class="inactive-option-style on-border cursor-pointer">
      <slot name="on"> </slot>
    </div>

    <div v-if="is_on" @click="_toggle()" class="inactive-option-style off-border">
      <slot name="off"> </slot>
    </div>
    <div v-else class="active-option-style off-border" :style="active_background_color">
      <slot name="off"> </slot>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Toggle extends Vue {

  @Prop({default: false, type: Boolean})
  value!: boolean;

  @Prop({default: () => ({ 'backgroundColor': 'hsl(208, 59%, 49%)' }), type: Object})
  incoming_active_background_color!: object;

  is_on: boolean = false;
  active_background_color = { };

  created() {
    this.is_on = this.value;
    this.active_background_color = this.incoming_active_background_color;
  }

  private _toggle() {
    this.is_on = !this.is_on;
    this.$emit('input', this.is_on);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.active-option-style {
  box-shadow: 0 1px 1px $shadow-color;
  color: white;
  display: inline-block;
  font-weight: normal;
  opacity: 1;
  z-index: 4;
  padding: 8px 12px 7.5px 12px;
}

.inactive-option-style {
  box-shadow: inset 1px 1px 3px $shadow-color;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: normal;
  opacity: 0.85;
  z-index: 3;
  padding: 8px 12px 7.5px 12px;
}

.active-option-style p, .inactive-option-style p {
  font-size: 13px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  margin: 0;
}

.off-border {
  border-radius: 0 3px 3px 0;
}

.on-border {
  border-radius: 3px 0 0 3px;
}

#toggle-button-space {
  border-radius: 3px;
  display: inline-block;
  z-index: 4;
}

</style>
