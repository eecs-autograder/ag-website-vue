<template>
  <div>
    <div class="view-file-ex-1">
      <p> <b> View File content wraps when the width of the view file container is less
        than the length of the content. </b></p>
      <div class="border-box">
        <view-file :filename="filename_1"
                   :file_contents="Promise.resolve(file_contents_1)">
        </view-file>
      </div>
    </div>
    <div class="view-file-ex-2">
      <p> <b> View File allows for vertical scrolling when there are more lines than can
        fit in the height of the display. </b></p>
      <div class="border-box">
        <view-file :filename="filename_2"
                   :file_contents="Promise.resolve(file_contents_2)"
                   :view_file_height="height_in">
        </view-file>
      </div>
    </div>
    <div class="view-file-ex-3">
      <p> <b> File contents can be swapped out for different contents </b></p>
      <button
        id="swap-contents-button"
        @click="change_contents()">
        Change Contents (once)
      </button>
      <div class="border-box">
        <view-file :filename="filename_3"
                   :file_contents="Promise.resolve(file_contents_3)"
                   view_file_height="95px">
        </view-file>
      </div>
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
    height_in = '300px';
    filename_1 = "long_lines.txt";
    file_contents_1 = "I watch two episodes of family fued back to back every night. \n" +
                      "They're supposed to pick the 5 7 or 9 most probable answers from \na " +
                      "survey \nof 100 people. Like if the show was called 'hey that's " +
                      "possible' the show \nwould be called Family Feud";
    filename_2 = "many_lines.txt";
    file_contents_2 =
`#file-container {
    border: 0px solid lightgray;
    border-radius: 0px 0px 3px 3px;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    width: 100%;
    border-left: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
    border-right: 1px solid lightgray;
}

.continue-bar {
    background-color: white;
    height: 5px;
    width: 45px;
    border-radius: 0px;
}

#current-file {
    background-color: #E8EEFE;
}`;
    filename_3 = "Ice_Cream.cpp";
    file_contents_3 = "Mint Chocolate Chip";
    alternate_file_contents_3 = "Blue Moon";

    change_contents() {
      this.file_contents_3 = this.alternate_file_contents_3;
    }
  }

</script>

<style scoped lang="scss">

.view-file-ex-1{
  width: 50%;
  margin: 20px;
}

.view-file-ex-2 {
  width: 600px;
  margin: 20px;
}

.view-file-ex-3 {
  width: 300px;
  margin: 20px;
}

.border-box {
  border: 1px solid lightgray;
  border-radius: 2px;
  font-weight: 300;
}

#swap-contents-button {
  background-color: #ace7c9;
  border-radius: 5px;
  color: black;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  margin: 10px 0 20px 0;
  outline: none;
  padding: 10px;
}

</style>
