<template>
  <div class="info-blurb">
    <i class="fas fa-info-circle"></i>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.info-blurb {
  margin: 0.5rem 0;
  font-size: .875rem;
}

.info-blurb > .fa-info-circle {
  color: $ocean-blue;
}
</style>
