<template>
  <div id="select-object-demo">
    <div class="container">
      <select-object :items="things"
                      v-model="selected"
                      id_field="id">
        <template v-slot:option-text="{item}">
          {{item.name}}: {{item.id}}
        </template>
      </select-object>

      Selected value: {{selected}}
    </div>

    <div class="container">
      <select-object :items="things"
                      v-model="initially_null"
                      id_field="id">
        <option :value="null">select one plz</option>
        <template v-slot:option-text="{item}">
          {{item.name}}
        </template>
      </select-object>

      Selected value (starts null): {{initially_null}}
    </div>

    <div class="container">
      <select-object :items="things"
                      id_field="id"
                      @change="recent_selection = $event">
        <option selected disabled :value="null">-- Select an option --</option>
        <template v-slot:option-text="{item}">
          {{item.name}}
        </template>
      </select-object>

      Selected value: {{recent_selection}}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import SelectObject from '@/components/select_object.vue';

@Component({
  components: {
    SelectObject
  }
})
export default class SelectObjectDemo extends Vue {
  things = [
    {id: 1, name: 'Thing 1'},
    {id: 4, name: 'Thing 2'},
    {id: 2, name: 'Thing 3'},
    {id: 3, name: 'Thing 4'},
  ];

  selected = this.things[2];
  initially_null = null;
  recent_selection = null;
}
</script>

<style scoped lang="scss">
  #select-object-demo {
    padding: 15px;
  }

  .container {
    margin-bottom: 15px;
  }
</style>
