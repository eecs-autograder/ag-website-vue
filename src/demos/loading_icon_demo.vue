<template>
  <div id="loading-icon-demo-component">
    <p class="loading-icon-explanation"> This Loading Icon Example supplies a size. </p>
    <button class="toggle-button"
            @click="ex_1_loading = !ex_1_loading">
      Toggle Loading
    </button>
    <br>
    <LoadingIcon
      :loading="ex_1_loading"
      size="30px"
      id="loading-icon-ex-1">
      <div class="finished-loading-ex-1">
        Done Loading!
      </div>
    </LoadingIcon>

    <p class="loading-icon-explanation">
      This Loading Icon Example inherits its size from its parent!
    </p>
    <button class="save-button"> Save Updates </button>
    <div id="loading-icon-ex-2">
      <LoadingIcon
        :loading="ex_2_loading === null">
        <div>
          <span> Last Saved: </span> Yesterday, December 2nd
        </div>
      </LoadingIcon>
    </div>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import LoadingIcon from '@/components/loading_icon.vue';

  @Component({
    components: {LoadingIcon}
  })
  export default class LoadingIconDemo extends Vue {
    ex_1_loading = false;

    ex_2_loading: string | null = null;
  }
</script>


<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';

#loading-icon-demo-component {
  padding: 10px;
}

.toggle-button {
  @extend .purple-button;
}

.save-button {
  @extend .green-button;
}

.inline-component {
  display: inline-block;
}

#loading-icon-ex-1 {
  padding-top: 5px;
}

#loading-icon-ex-2 {
  display: inline-block;
  padding: 10px;
}

.loading-icon-explanation {
  font-weight: bold;
  margin: 25px 0 5px 0;
}

.finished-loading-ex-1 {
  padding: 5px;
  background-color: $pebble-light;
  display: inline-block;
}

</style>
