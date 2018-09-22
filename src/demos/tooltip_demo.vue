<template>
  <div>
    <div class="tooltip-example">
      Right
      <tooltip width="small" placement="right"> Right side </tooltip>
    </div>

    <div class="tooltip-example">
      Left
      <tooltip width="small" placement="left"> Left side </tooltip>
    </div>

    <div class="tooltip-example">
      Top
      <tooltip width="small" placement="top"> Top </tooltip>
    </div>

    <div class="tooltip-example">
      Bottom
      <tooltip width="small" placement="bottom"> Bottom </tooltip>
    </div>

    <div class="tooltip-example">
      <i class="fas fa-info-circle">
        <tooltip width="small" placement="top"> It also works on icons </tooltip>
      </i>
    </div>

    <div class="tooltip-example">
      <p>
        This is some wide text this is some wide text <br>
        This text is also multiline
        <tooltip  width="small" placement="right">
          <div> This is a <br> multiline tooltip </div>
        </tooltip>
      </p>
    </div>

    <div class="tooltip-example">
      <p>
        This <br>
        text <br>
        spans <br>
        many <br>
        lines <br>
        <tooltip width="small" placement="right"> Hey </tooltip>
      </p>
    </div>

    <div class="tooltip-example">
      <p>
        Small
        <tooltip width="small" placement="top"> This is a small tooltip </tooltip>
      </p>
    </div>

    <div class="tooltip-example">
      <p>
        Medium
        <tooltip width="medium" placement="top"> This is a medium tooltip. It is medium. </tooltip>
      </p>
    </div>

    <div class="tooltip-example">
      <p>
        Large
        <tooltip width="large" placement="right">
          This is a large tooltip. It is rather large, wouldn't you say?
        </tooltip>
      </p>
    </div>
    <div class="tooltip-example">
      <span>
        Overlap
        <tooltip width="large" placement="right">
          This tooltip overlaps content on the right
        </tooltip>
      </span>

      <span>This will get covered</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Tooltip from '@/components/tooltip.vue';

@Component({
  components: {Tooltip}
})
export default class TooltipDemo extends Vue {
}
</script>

<style scoped lang="scss">

.tooltip-example {
  display: inline-block;
  margin: 80px 100px;
}

</style>
