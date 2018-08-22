<template>

  <div id="tooltip">

    <span class="tooltiptext" v-html="tooltip_message"></span>

  </div>

</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class Tooltip extends Vue {
    @Prop({default: "", type: String})
    message!: string;

    @Prop({default: "top", type: String})
    placement!: string;

    @Prop({default: "small", type: String})
    width!: string;

    tooltip_message = "";

    tooltip_width = "";

    mounted() {
      this.$el.parentElement.style.position = "relative";
      this.$el.parentElement.style.display = "inline-block";
      this.$el.parentElement.addEventListener("mouseenter", () => {
        this.$el.getElementsByClassName("tooltiptext")[0].style.visibility = "visible";
        this.$el.getElementsByClassName("tooltiptext")[0].style.opacity = "1";
      });

      this.$el.parentElement.addEventListener("mouseout", () => {
        this.$el.getElementsByClassName("tooltiptext")[0].style.visibility = "hidden";
        this.$el.getElementsByClassName("tooltiptext")[0].style.opacity = "0";
      });
      this.tooltip_message = this.message;
      this.tooltip_width = this.width;
    }

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .tooltiptext {
    visibility: hidden;
    width: 220px;
    display: inline-block;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 10px;
    position: absolute;
    z-index: 1;
    bottom: 145%;
    left: 50%;
    opacity: 0;
    margin-left: -120px;
    transition: opacity 0.3s;
  }

  .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }

</style>
