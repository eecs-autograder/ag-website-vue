<template>
  <div id="superuser-dashboard">
    <sandbox-images></sandbox-images>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { GlobalData } from '@/app.vue';
import SandboxImages from '@/components/sandbox_images/sandbox_images.vue';
import { use_title } from '@/composables/use_title';

@Component({
  components: {
    SandboxImages
  },
  setup() {
    use_title('Superuser Dashboard | Autograder.io');
  },
})
export default class SuperuserDashboardView extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  created() {
    return this.d_globals.set_current_course(null);
  }
}
</script>

<style scoped lang="scss">

</style>
