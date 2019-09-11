<template>
  <div class="sticky-sidebar"
       ref="sidebar"
       :style="{height: d_height}"
       v-on="$listeners">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class StickySidebar extends Vue {
  d_height: string = '';

  private scroll_handler = () => {};

  mounted() {
    this.scroll_handler = () => {
      let bounding_rect = (<HTMLElement> this.$refs.sidebar).getBoundingClientRect();
      this.d_height = `calc(100vh - ${Math.ceil(bounding_rect.top)}px)`;
    };
    this.scroll_handler();
    window.addEventListener('scroll', this.scroll_handler);
  }

  beforeDestroy() {
    window.removeEventListener('scroll', this.scroll_handler);
  }
}
</script>

<style scoped lang="scss">

.sticky-sidebar {
  position: sticky;
  top: 0;
  overflow: auto;
}

</style>
