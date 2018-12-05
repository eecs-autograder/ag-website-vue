<template>
  <div v-if="d_loading"
       ref="loading_icon_component">
    <i class="fa fa-spinner fa-pulse loading-spinner"
       :style="{ fontSize: size }"></i>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>


<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class LoadingIcon extends Vue {
    @Watch('loading')
    on_loading_change(new_val: boolean, old_val: boolean) {
      this.d_loading = new_val;
    }

    @Prop({required: true, type: Boolean})
    loading!: boolean;

    @Prop({default: "inherit", type: String})
    size!: string;

    d_loading = false;

    created() {
      this.d_loading = this.loading;
    }
  }
</script>


<style scoped lang="scss">
@import '@/styles/colors.scss';

.loading-spinner {
  color: $stormy-gray-dark;
}

</style>
