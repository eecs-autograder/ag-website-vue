<template>
  <div>
    <div class="view_file_ex_1">
      <p> <b> View File allows for horizontal scrolling when the text is longer than
        the width of the display. </b></p>
      <view-file :incoming_filename="filename_1"
                 :incoming_file_content="file_contents_1">
      </view-file>
    </div>
    <div class="view_file_ex_2">
      <p> <b> View File allows for vertical scrolling when there are more lines than can
        fit in the height of the display. </b></p>
      <view-file :incoming_filename="filename_2"
                 :incoming_file_content="file_contents_2">
      </view-file>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import ViewFile from '@/components/view_file.vue';

  @Component({
    components: {ViewFile}
  })
  export default class ViewFileDemo extends Vue {
    filename_1 = "long_lines.txt";
    file_contents_1 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    filename_2 = "many_lines.txt";
    file_contents_2 = "Doe, a deer, a female deer\n" +
                      "Ray, a drop of golden sun\n" +
                      "Me, a name I call myself\n" +
                      "Far, a long, long way to run\n" +
                      "Sew, a needle pulling thread\n" +
                      "La, a note to follow Sew\n" +
                      "Tea, a drink with jam and bread\n" +
                      "That will bring us back to Do (oh-oh-oh)\n\n" +
                      "Doe, a deer, a female deer\n" +
                      "Ray, a drop of golden sun\n" +
                      "Me, a name I call myself\n" +
                      "Far, a long, long way to run\n" +
                      "Sew, a needle pulling thread\n" +
                      "La, a note to follow Sew\n" +
                      "Tea, a drink with jam and bread\n" +
                      "That will bring us back to Do (oh-oh-oh)\n\n" +
                      "Doe, a deer, a female deer\n" +
                      "Ray, a drop of golden sun\n" +
                      "Me, a name I call myself\n" +
                      "Far, a long, long way to run\n" +
                      "Sew, a needle pulling thread\n" +
                      "La, a note to follow Sew\n" +
                      "Tea, a drink with jam and bread\n" +
                      "That will bring us back to Do (oh-oh-oh)\n\n" +
                      "Doe, a deer, a female deer\n" +
                      "Ray, a drop of golden sun\n" +
                      "Me, a name I call myself\n" +
                      "Far, a long, long way to run\n" +
                      "Sew, a needle pulling thread\n" +
                      "La, a note to follow Sew\n" +
                      "Tea, a drink with jam and bread\n" +
                      "That will bring us back to Do (oh-oh-oh)\n\n" +
                      "Doe, a deer, a female deer\n" +
                      "Ray, a drop of golden sun\n" +
                      "Me, a name I call myself\n" +
                      "Far, a long, long way to run\n" +
                      "Sew, a needle pulling thread\n" +
                      "La, a note to follow Sew\n" +
                      "Tea, a drink with jam and bread\n" +
                      "That will bring us back to Do (oh-oh-oh)\n";
  }

</script>

<style scoped lang="scss">

.view_file_ex_1{
  width: 700px;
  margin: 20px;
}

.view_file_ex_2 {
  width: 400px;
  height: 40px;
  margin: 20px;
}

</style>
