<template>
  <div style="padding: 1rem;">
    Your API token download should start automatically.<br>
    If it doesn't, try refreshing the page.<br>
    If that doesn't work, please contact {{sysadmin_contact}}.
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import * as FileSaver from 'file-saver';

import { SYSADMIN_CONTACT } from '@/constants';
import { get_cookie } from '@/cookie';

@Component
export default class APITokenView extends Vue {
  // istanbul ignore next
  mounted() {
    let token = get_cookie('token');
    if (token) {
      FileSaver.saveAs(new File([token], 'agtoken'));
    }
    else {
      console.error('API token not found.');
    }
  }

  // istanbul ignore next
  get sysadmin_contact() {
    return SYSADMIN_CONTACT;
  }
}
</script>

<style scoped lang="scss">

</style>
