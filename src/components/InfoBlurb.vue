<template>
  <div class="info-blurb">
    <i class="fas fa-info-circle" aria-hidden="true"></i>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.info-blurb {
  margin: 0.5rem 0;
  font-size: .875rem;
  display: flex;
  align-items: flex-start;

  .fa-info-circle {
    color: $ocean-blue;
    flex-shrink:0;
  }

  .content {
    flex: 1;
    margin-left: 0.5rem;
  }
}
</style>
