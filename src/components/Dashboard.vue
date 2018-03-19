<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <div class="tile is-parent">
        <widget-things @onEntrySelected="thingChange"></widget-things>
      </div>

      <div class="tile" v-if="thing">
        <!-- last session -->
        <div class="tile is-parent is-4">
          <widget-thing-session-list
            :entity="thing" @onSessionChange="thingSessionListChange"></widget-thing-session-list>
        </div>

        <div class="tile is-vertical">
          <div class="tile">
            <!-- session history -->
            <div class="tile is-parent">
              <widget-thing-session-history :sessionId="thingSessionId"></widget-thing-session-history>
            </div>

            <!-- activity -->
            <div class="tile is-parent">
              <widget-thing-activity :entity="thing"></widget-thing-activity>
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
  import WidgetThingSessionHistory from './widgets/ThingSessionHistory';
  import WidgetThingSessionList from './widgets/ThingSessionList';

  export default {
    name: 'dashboard',
    data() {
      return {thing: null, thingSessionId: null};
    },
    components: {
      WidgetThingActivity, WidgetThings, WidgetThingSessionHistory, WidgetThingSessionList
    },
    computed: {
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      }
    },
    methods: {
      thingChange(thing) {
        this.thing = thing;
      },

      thingSessionListChange(sessionId) {
        this.thingSessionId = sessionId;
      }
    }
  }
</script>
