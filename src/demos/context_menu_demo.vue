<template>
  <div class="context-menu-demo-outer">
    <div class="context-menu-demo-1">
      <div class="area-of-focus-1"
           @click="$refs.context_menu_1.update_x_and_y_coords($event)">
        As Harry and a severely weakened Dumbledore flee the cave where Dumbledore drank the
        potion of despair to obtain what he thought was one of Voldemort’s Horcruxes, Harry
        pleads for the headmaster to remain calm. His plea prompts this touching display of
        faith. This moment — which takes place shortly before Dumbledore is killed by Severus
        Snape — exemplifies the strong father-son bond that has formed over the years between
        the two.
        <br> <br>
        The line inseparable from an unforgettable ending. Harry allows Voldemort to hit him with
        a killing curse so that the piece of Voldemort’s soul inside him will be destroyed. Harry
        then has an out-of-body experience, finding himself in King’s Cross Station talking to
        Dumbledore. As Harry prepares to return to the scene of his “death,” he asks the late
        headmaster about what has occurred and receives this answer. In many ways, this seems
        to be a nod from Rowling to all the readers who helped bring the magic of her iconic
        fantasy series to life.
        <br> <br>
        Even though it’s just one word, “always” is largely considered one of the most iconic
        lines from the Potter series. Uttered by Snape to Dumbledore during a memory Harry
        observes in the Pensieve of Snape casting a doe Patronus, the phrase embodies the
        controversial potions professor’s most redemptive quality — his unconditional love
        for Lily Potter. “Snape is all grey,” Rowling tweeted in 2015. “You can’t make him a
        saint: he was vindictive & bullying. You can’t make him a devil: he died to save the
        wizarding world.”
        <p id="thanks"> <i class="fas fa-fish red-fish"></i> </p>
        <context-menu ref="context_menu_1">
          <template slot="context_menu_items">
            <context-menu-item :first_child="true"
                               @context_menu_item_clicked="function_a('A Fish!')">
              <template slot="label">
                One Fish <i class="fas fa-fish fish"></i>
              </template>
            </context-menu-item>
            <!--<div class="context-menu-divider"> </div>-->
            <context-menu-item :disabled="true"
                               @context_menu_item_clicked="function_b()">
              <template slot="label"> <span class="disabled-row"> Two Fish
            <i class="fas fa-fish fish"></i>
            <i class="fas fa-fish fish"></i>
            </span>
              </template>
            </context-menu-item>
            <div class="context-menu-divider"> </div>
            <context-menu-item
              @context_menu_item_clicked="function_2('red')">
              <template slot="label">
                <span> Red Fish </span>
                <i class="fas fa-fish red-fish"></i>
              </template>
            </context-menu-item>
            <div class="context-menu-divider"> </div>
            <context-menu-item :last_child="true"
                               @context_menu_item_clicked="function_3('Blue Fish')">
              <template slot="label"> Blue Fish <i class="fas fa-fish blue-fish"></i> </template>
            </context-menu-item>
            <context-menu-item :last_child="true"
                               @context_menu_item_clicked="function_3('Blue Fish')">
              <template slot="label"> Blue Fish <i class="fas fa-fish blue-fish"></i> </template>
            </context-menu-item>
          </template>
        </context-menu>
      </div>
    </div>

    <div class="context-menu-demo-2">
      <div class="area-of-focus-2"
           @click="$refs.context_menu_2.update_x_and_y_coords($event)">
        Today is Toby Flenderson's last day.
        I couldn't sleep last night.
        I came in extra early.
        So much energy.
        There are certain days that you know you'll remember the rest of your life.
        And I just have a feeling that today is one of those days.
        - Morning.
        - Mornin'.
        So here we go.
        Just a matter of hours now until his horribleness has left the building.
        I'm going to set my watch alarm And Good morning, Kelly.
        I can't believe this is your last day.
        How do you feel? Fine.
        Good.
        I feel weird.
        First thing on the agenda.
        Actually, the only thing on the agenda is that status of Toby's going away party.
        We have a buttercream cake and a slide show of Toby.
        But so far we only have two pictures of him.
        Okay, well, this will not do.
        Toby is going away forever, and we need to do something very, very special.
        In some cultures, when somebody leaves, like New Orleans culture, they have a parade,
        and they have a band.
        And people party in the streets.
        Do you mean leaves as in dies? You want us to throw Toby a New Orleans funeral? If
        the devil were to explode, and evil were gone forever, what sort of party would you
        have? - Michael - Like a beach blowout? - Or a toga - No, you know No! - Toga! -
        You always do this.
        We have a nice, modest party planned, and you come in and demand the world.
        Let me be clear.
        There is simply no money for anything other than a cake, and to develop a few more
        slides.
        Although Toby won't be in them.
        I thought that you might say that.
        Every year, my sweet, sweet grandmother sends me a check on my birthday for $50.
        And lately she has been sending me, like, nine or ten checks a year.
        As Nana starts to But I knew I should be saving it for something.
        I just didn't know what I should be saving it for.
        And then I had an awakening.
        Michael, buy a motorcycle.
        So I put the money in my shoe, and then I forgot about it until now.
        I want a party that makes me feel like I'm flying through the air without this ugly
        weight holding me down.
        You know? I want an antigravity machine.
        I saw it in a movie.
        You drink a potion, and then you just start floating all around.
        So how much antigravity potion do you want? No, you know what? This is not a
        party-planning committee anymore.
        And I don't want your foot money, and I feel uncomfortable participating.
        Phyllis.
        Can you do this? Yes.
        - Hi, can I help you? - Hi, yes.
        I'm Holly Flax.
        I was told to ask for Mr.
        Flenderson.
        As part of my last day, I'm training the new human resources rep in the ways of the
        company.
        Again, the company has allotted for this training one day.
        So this is H.
        R.
        This is your desk.
        I love the view.
        Yeah, it's great, isn't it? Hey.
        Hey.
        What? Guess who just got into the Pratt school of design.
        No way! What'd I say? I said that they'd love those sketches.
        - Congrats.
        - Oh, thank you.
        I don't know why I doubted it.
        Because I'm so clearly awesome.
        Yes.
        So when do you start? I didn't read it carefully.
        I just saw "congratulations," and skimmed the list.
        I saw my name, I came in here to tell you and get a snack.
        Busy morning.
        So you know, it means I have to go to New York for three months.
        It's not a big deal.
        I'll come visit you.
        And you'll visit me.
        It's only two hours away.
        It'll be fine.
        - It's gonna suck, but it'll be great.
        - Yeah, it sucks, but it'll be great.
        See how easy that is? I wouldn't go if things weren't so solid with Jim.
        And down the road, if we have a family, I couldn't go then either.
        So the timing's perfect.
        And that is the first time I've ever used the word "perfect" in here.
        Hey, Stanley.
        I want to introduce you to Toby's replacement.
        So what do we know about her? Well, we know that Toby thinks she'll be great.
        Oh, strike one.
        I hate her already.
        I hate her too.
        Why do you hate her? Because she stinks with her ways and her head.
        You know, Dwight, sometimes I don't know, I think you say things just to agree with me.
        - Would that be such a bad thing? - Yeah, it would.
        Just have a thought.
        Have an original thought! Although I will agree that her head is weird.
        - You know what we need to do? - What? - We need to sell her an elevator pass.
        - But our elevator doesn't require a Exactly.

        <context-menu ref="context_menu_2">
          <template slot="context_menu_items">
            <context-menu-item v-for="(item, index) of items"
                               :first_child="index === 0"
                               :last_child="index === (items.length - 1)"
                               :disabled="item.disabled"
                               @context_menu_item_clicked="function_a(item.name)">
              <template slot="label">
                {{item.name}}
              </template>
            </context-menu-item>
          </template>
        </context-menu>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import ContextMenu from '@/components/context_menu.vue';
  import ContextMenuItem from '@/components/context_menu_item.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {ContextMenu, ContextMenuItem}
  })
  export default class ContextMenuDemo extends Vue {

    function_a(word: string) {
      console.log('You have clicked on: ' + word);
    }

    function_b() {
      alert("Two Fish!");
    }

    function_2(word: string) {
      let text = this.$el.style.color = word;
    }

    function_3(word: string) {
      let p = document.createElement("p");
      p.innerText = word;
      document.body.appendChild(p);
    }

    items = [
      {name: 'Option 1', disabled: false},
      {name: 'Option 2', disabled: false},
      {name: 'Option 3', disabled: false},
      {name: 'Option 4', disabled: true}
    ];

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import '@/styles/colors.scss';

.context-menu-demo-1{
  font-family: "Helvetica";
  /*border: 2px solid hotpink;*/
  height: 500px;
  width: 400px;
  overflow: scroll;
  /*element that the context menu is on must be non-static positioned*/
}

.context-menu-demo-2{
  font-family: "Helvetica";
  width: 400px;
}

.context-menu-divider {
  border-bottom: 1px solid $pebble-light;
  margin-left: 2px;
  margin-right: 2px;
}

.area-of-focus-1 {
  height: 800px;
  width: 1000px;
  background-color: $pebble-light;
  padding: 20px;
  position: relative;
}

.area-of-focus-2 {
  background-color: mediumpurple;
  padding: 20px;
  position: relative;
}

#thanks {
  visibility: hidden;
  color: dodgerblue;
}

.fish {
  padding-left: 10px;
}

.red-fish {
  color: red;
  padding-left: 10px;
}

.blue-fish {
  color: cornflowerblue;
  padding-left: 10px;
}

.disabled-row {
  color: $baking-pan;
}

.context-menu-demo-outer {
  border: 2px solid blue;
}

</style>
