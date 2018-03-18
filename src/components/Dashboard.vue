<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <div class="tile is-parent">
        <widget-things @onEntrySelected="thingChange"></widget-things>
      </div>

      <div class="tile" v-if="thing">
        <div class="tile is-parent is-4">
          <widget-thing-session-last :entity="thing"></widget-thing-session-last>
        </div>

        <div class="tile is-vertical">
          <div class="tile">
            <div class="tile is-parent">
              <widget-thing-activity :entity="thing"></widget-thing-activity>
            </div>
            <div class="tile is-parent">
              <article class="tile is-child notification is-white">
                <div class="content">
                  <p class="title">Tall tile</p>
                  <p class="subtitle">With even more content</p>
                  <div class="content">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at
                      erat pulvinar, at pulvinar felis blandit. Vestibulum volutpat tellus diam,
                      consequat gravida libero rhoncus ut. Morbi maximus, leo sit amet vehicula
                      eleifend, nunc dui porta orci, quis semper odio felis ut quam.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child notification is-white">
              <div class="content">
                <p class="title">Insider Program</p>
                <p class="subtitle">Subtitle</p>
                <div class="content">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at
                    erat pulvinar, at pulvinar felis blandit. Vestibulum volutpat tellus diam,
                    consequat gravida libero rhoncus ut. Morbi maximus, leo sit amet vehicula
                    eleifend, nunc dui porta orci, quis semper odio felis ut quam.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import WidgetThingActivity from './widgets/ThingActivity';
  import WidgetThings from './widgets/Things';
  import WidgetThingSessionLast from './widgets/ThingSessionLast';

  export default {
    name: 'dashboard',
    data() {
      return {thing: null};
    },
    components: {
      WidgetThingActivity, WidgetThings, WidgetThingSessionLast
    },
    computed: {
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      }
    },
    methods: {
      thingChange(thing) {
        this.thing = thing;
      }
    }
  }
</script>
