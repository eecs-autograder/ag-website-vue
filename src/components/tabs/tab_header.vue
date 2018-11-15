<template>

<div class="tab-header"
     :class="[
       {'inactive-tab-header': !is_active},
       is_active ? active_tab_class : inactive_tab_class
     ]"
     :click="on_click_fn">
  <slot></slot>
</div>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TabHeader extends Vue {
  @Prop({default: false, type: Boolean})
  is_active!: boolean;

  @Prop({default: 'white-theme-active', type: String})
  active_tab_class!: string;

  @Prop({default: 'white-theme-inactive', type: String})
  inactive_tab_class!: string;

  @Prop({default: (event: Event) => {}, type: Function})
  on_click_fn!: (event: Event) => void;

  // d_is_active = false;
  // d_active_tab_class = 'white-theme-active';
  // d_inactive_tab_class = 'white-theme-inactive';
  // d_on_click_fn = (event: Event) => {};
}

</script>


<style scoped lang="scss">
@import '@/styles/components/tab_styles.scss';

.tab-header {
  display: inline-block;

  border-radius: 10px 10px 0 0;
  margin-right: 2px;
  margin-top: 4px;
  padding: 10px 15px;
}

.inactive-tab-header:hover {
  cursor: pointer;
}

</style>
