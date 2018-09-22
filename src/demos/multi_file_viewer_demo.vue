<template>
  <div class="multi-file-viewer-demo">

    <div>
      <p @click="open_file(1)"> Add A </p>
      <p @click="open_file(2)"> Add B </p>
      <p @click="open_file(3)"> Add C </p>
      <p @click="open_file(4)"> Add D </p>
      <p @click="open_file(5)"> Add E </p>
      <div class="mvf-container">
        <multi-file-viewer
          ref="multi_file"
          :height_of_view_file="height_of_view_file">
        </multi-file-viewer>
      </div>
    </div>

    <div class="faux-incorrect-row"> </div>
    <div class="faux-correct-row"> </div>
    <div class="faux-unavailable-row"> </div>


    <div>
      <p class="letters" @click="open('A')"> Add A </p>
      <p class="letters" @click="open('B')"> Add B </p>
      <p class="letters" @click="open('C')"> Add C </p>
      <div class="mvf-container">
        <multi-file-viewer
          ref="multi_file2">
        </multi-file-viewer>
      </div>
    </div>

  </div>
</template>

<script lang="ts">

  import MultiFileViewer from '@/components/multi_file_viewer.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: { MultiFileViewer }
  })
  export default class MultiFileViewerDemo extends Vue {

    open_file(file_number: number) {
      let mfv = <MultiFileViewer> this.$refs.multi_file;
      if (file_number === 1) {
        mfv.add_to_viewing(this.file1, this.file_1_content);
      }
      else if (file_number === 2) {
        mfv.add_to_viewing(this.file2, this.file_2_content);
      }
      else if (file_number === 3) {
        mfv.add_to_viewing(this.file3, this.file_3_content);
      }
      else if (file_number === 4) {
        mfv.add_to_viewing(this.file4, this.file_4_content);
      }
      else {
        mfv.add_to_viewing(this.file5, this.file_5_content);
      }
    }

    open(file: string) {
      let mfv = <MultiFileViewer> this.$refs.multi_file2;
      if (file === 'A') {
        mfv.add_to_viewing(this.file_a, this.file_a_content);
      }
      else if (file === 'B') {
        mfv.add_to_viewing(this.file_b, this.file_b_content);
      }
      else {
        mfv.add_to_viewing(this.file_c, this.file_c_content);
      }
    }

    file_a = 'A';
    file_b = 'B';
    file_c = 'C';

    file_a_content = "Aurora\nAurora";
    file_b_content = "Belle";
    file_c_content = "Cinderella\nCinderella\nCinderella";



    file1 = "Apple";

    file2 = "Banana";

    file3 = "Cantaloupe";

    file4 = "Dragonfruit";

    file5 = "Grapes";

    file_1_content = "#include \"Apples\"\nApple\nApple\nApple\nApple\nApple\nApple\nApple\n" +
                     "Apple\nApple\n\nApple\nApple\nApple\nApple\nApple\nApple\nApple\nApple\n" +
                     "Apple\nApple\n\n\n\nApple\nApple\nApple\nApple\nApple\nApple\nApple\nApple" +
                     "\nApple\nApple\nApple\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n" +
                     "a\nb\nc\nd\ne\nf\ng\nh\n\ni\n\n\n\n\n\n\n\n\n\nj\nk\nl\nm\nn\no\np\nq" +
                     "r\n\n\n\n\n\n\ns\nt\nu\nv\nw\nx\ny\nz";

    file_2_content = "BananaBananaBananaBananaBananaBananaBananaBananaBananaBananaBananaBanana" +
                     "BananaBananaBananaBananaBananaBanana";

    file_3_content = "Cantaloupe";

    file_4_content = "Dragonfruit";

    file_5_content = "Green Grapes\nPurple Grapes";

    height_of_view_file = {
      "height": "585px"
    };

  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

p {
  background-color: $medium-dark-blue;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  display: inline-block;
  margin-right: 10px;
  padding: 20px;
}

.mvf-container {
  width: 90%;
}

.faux-incorrect-row {
  height: 40px;
  border-radius: 5px;
  background-color: $third-red;
  margin-top: 30px;
  width: 90%;
}

.faux-incorrect-row:hover {
  background-color: $none-correct-hover-color;
}

.faux-correct-row {
  height: 40px;
  border-radius: 5px;
  background-color: hsl(212, 100%, 90%);
  margin-top: 30px;
  width: 90%;
}

.faux-unavailable-row {
  height: 40px;
  border-radius: 5px;
  background-color: hsl(210, 12%, 93%);
  margin-top: 30px;
  width: 90%;
}

.letters {
  background-color: $mello-yello;
  color: black;
}

</style>
