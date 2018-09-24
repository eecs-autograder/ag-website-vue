<template>
  <div>

    <todo-list title_in="Shapes" :items_in="shapes">
      <template slot-scope="shape">
        <div> {{shape.name}} {{shape.sides}}</div>
      </template>
    </todo-list>
    <todo-list title_in="Colors" :items_in="colors">
      <template slot-scope="color">
        <div>
          <div class="swatch" :style="{ background: color.hex }"></div>
          {{color.name}}
        </div>
      </template>
    </todo-list>
    <todo-list title_in="" :items_in="colors">
      <template slot-scope="color">
        <div>
          <div class="swatch" :style="{ background: color.hex }"></div>
          <span>{{color.name}}</span>
        </div>
      </template>
    </todo-list>

  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  import TodoList from '@/components/todo_list.vue';

  @Component({
    components: { TodoList }
  })
  export default class TodoListDemo extends Vue {

    hello: string = "hello";

    shapes: object[] = [
      { name: "Square", sides: 4 },
      { name: "Triangle", sides: 3 },
      { name: "Hexagon", sides: 8 }
    ];

    colors: object[] = [
      { name: 'Yellow', hex: '#F4D03F'},
      { name: 'Green', hex: '#229954'},
      { name: 'Purple', hex: '#9B59B6'}
    ];

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .swatch {
    height: 20px;
    width: 20px;
  }


</style>
