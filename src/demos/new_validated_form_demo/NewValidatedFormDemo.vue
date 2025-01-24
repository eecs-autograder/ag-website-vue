<template>
  <div style="padding: 10px;">
    <hr/>
    <h1>Validated Form</h1>
    <SimpleForm />
    <h2>Errors display on submit</h2>
    <ErrorsOnSubmit />
  </div>

</template>

<script setup lang="ts">
import SimpleForm from './SimpleForm.vue';
import ErrorsOnSubmit from './ErrorsOnSubmit.vue';
</script>
