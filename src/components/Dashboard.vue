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
          <widget-thing-session-list :entity="thing" @onSessionChange="thingSessionListChange"/>
        </div>

        <div class="tile is-vertical">
          <div class="tile">
            <!-- session details -->
            <div class="tile is-parent">
              <widget-thing-session-details :sessionId="selectedSessionId"/>
            </div>

            <!-- activity -->
            <div class="tile is-parent">
              <widget-thing-activity :entity="thing"/>
            </div>
          </div>

          <div class="tile">
            <!-- timeline -->
            <div class="tile is-parent" v-if="selectedSessionId">
              <widget-thing-session-timeline :sessionId="selectedSessionId"/>
            </div>

            <!-- device confidence -->
            <div class="tile is-parent">
              <widget-device-confidence :deviceId="thing.device"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import WidgetDeviceConfidence from './widgets/DeviceConfidence';
  import WidgetThingActivity from './widgets/ThingActivity';
  import WidgetThings from './widgets/Things';
  import WidgetThingSessionDetails from './widgets/ThingSessionDetails';
  import WidgetThingSessionList from './widgets/ThingSessionList';
  import WidgetThingSessionTimeline from './widgets/ThingSessionTimeline';

  export default {
    name: 'dashboard',
    data: () => ({thing: null, selectedSessionId: null}),
    components: {
      WidgetDeviceConfidence, WidgetThingActivity, WidgetThings, WidgetThingSessionDetails,
      WidgetThingSessionList, WidgetThingSessionTimeline
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
        this.selectedSessionId = sessionId;
      }
    }
  }
</script>
