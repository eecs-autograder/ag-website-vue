<template>
  <div>
    <div v-for="(error, index) of d_api_errors"
         class="error-msg-container">
      <div class="error-msg">{{error}}</div>
      <button class="dismiss-error-button"
              type="button"
              @click="d_api_errors.splice(index, 1)">
        <span class="dismiss-error">Dismiss</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { HttpError } from 'ag-client-typescript';

@Component
export default class APIErrors extends Vue {
  d_api_errors: string[] = [];

  show_errors_from_response(error_response: unknown) {
    if (!(error_response instanceof HttpError)) {
      throw error_response;
    }
    this.d_api_errors = [];
    if (error_response.status === 504) {
      this.d_api_errors.push('Error: The request timed out. Please try again later.');
    }
    else if (error_response.status === 413) {
      this.d_api_errors.push(
        'Error: Request too large. If you are uploading files, please reduce their size.');
    }
    else if (error_response.status === 400) {
      this.show_400_error_data(error_response);
    }
    else {
      this.d_api_errors.push(
        'An unexpected error occurred: '
        + `${error_response.status} ${JSON.stringify(error_response.data)}`);
    }
  }

  private show_400_error_data(error: HttpError) {
    if (typeof error.data === 'string') {
      this.d_api_errors.push(error.data);
    }
    else {
      for (let [field_name, message] of Object.entries(error.data)) {
        if (field_name ===  '__all__') {
          if (Array.isArray(message)) {
            this.d_api_errors.push(message[0]);
          }
          else if (typeof message === 'string') {
            this.d_api_errors.push(message);
          }
        }
        else {
          this.d_api_errors.push(`Error in "${field_name}": ${message}`);
        }
      }
    }
  }

  clear() {
    this.d_api_errors = [];
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';

.error-msg-container {
  box-sizing: border-box;
  width: 100%;
  position: relative;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px 90px 10px 10px;
  border-radius: .25rem;
  margin-top: 11px;
}

.dismiss-error-button {
  font-size: 15px;
  position: absolute;
  right: 5px;
  top: 5px;
  padding: 4px 10px;
  background-color: white;
  border-radius: .25rem;
  color: black; // text is not visible without this
  cursor: pointer;
  color: black;
  border: 1px solid #f5c6cb;
}
</style>
