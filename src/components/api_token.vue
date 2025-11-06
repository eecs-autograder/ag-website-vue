<template>
  <div style="padding: 1rem">
    Your API token download should start automatically.<br />
    If it doesn't, try refreshing the page.<br />
    If that doesn't work, please contact {{ sysadmin_contact }}.
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import * as FileSaver from "file-saver";
import { SYSADMIN_CONTACT } from "@/constants";
import { get_cookie } from "@/cookie";

// Computed properties
const sysadmin_contact = computed(() => {
  return SYSADMIN_CONTACT;
});

// Lifecycle
// istanbul ignore next
onMounted(() => {
  let token = get_cookie("token");
  if (token) {
    FileSaver.saveAs(new File([token], "agtoken"));
  } else {
    console.error("API token not found.");
  }
});
</script>

<style scoped lang="scss"></style>
