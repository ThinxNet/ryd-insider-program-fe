<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <div class="tile is-parent">
        <widget-things @onEntrySelected="thingChange"></widget-things>
      </div>

      <div class="tile is-parent">
        <div class="notification is-warning">
          The map information comes from <strong>very</strong> slow and unreliable machines.
          Some trips might have less than 50% of real data. Having mentioned limitations,
          please consider these results only for concept-demonstration purposes.
        </div>
      </div>

      <div class="tile" v-if="thing">
        <!-- last session -->
        <div class="tile is-parent is-4">
          <widget-thing-session-list
            :entity="thing" @onSessionChange="thingSessionListChange"></widget-thing-session-list>
        </div>

        <div class="tile is-vertical">
          <div class="tile">
            <!-- session details -->
            <div class="tile is-parent">
              <widget-thing-session-details :sessionId="thingSessionId"></widget-thing-session-details>
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
                <p class="subtitle">news feed</p>
                <div class="content">
                  <dl>
                    <dt>06.04.2018 </dt>
                    <dd>The first public available version.</dd>
                    <dt>12.03.2018 </dt>
                    <dd>Initial demonstration to the awesome team.</dd>
                  </dl>
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
  import WidgetThingSessionDetails from './widgets/ThingSessionDetails';
  import WidgetThingSessionList from './widgets/ThingSessionList';

  export default {
    name: 'dashboard',
    data() {
      return {thing: null, thingSessionId: null};
    },
    components: {
      WidgetThingActivity, WidgetThings, WidgetThingSessionDetails, WidgetThingSessionList
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
