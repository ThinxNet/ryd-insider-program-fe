<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <div class="tile is-parent">
        <widget-things @onEntrySelected="thingChange"></widget-things>
      </div>

      <div class="tile" v-if="thing">
        <!-- last session -->
        <div class="tile is-parent is-4" style="background-color: #14ADDD">
          <widget-thing-session-list :device-id="thing.device"
            @onSessionChange="thingSessionListChange"/>
        </div>

        <div class="tile is-vertical">
          <div class="tile">
            <!-- session details -->
            <div class="tile is-parent" style="background-color: #14ADDD">
              <widget-thing-session-details :session-id="selectedSessionId"/>
            </div>

            <!-- activity -->
            <div class="tile is-parent">
              <widget-thing-activity :thing-id="thing._id"/>
            </div>
          </div>

          <div class="tile">
            <!-- timeline -->
            <div v-if="selectedSessionId" class="tile is-parent" style="background-color: #14ADDD">
              <widget-thing-session-timeline :session-id="selectedSessionId"/>
            </div>

            <!-- device confidence -->
            <div class="tile is-parent">
              <widget-device-confidence :thing-id="thing._id"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <feedback-form style="z-index: 9999"
      v-if="$store.getters['widget/isFeedbackFormActive']"/>
  </div>
</template>

<script>
  import FeedbackForm from './FeedbackForm';
  import WidgetDeviceConfidence from './widgets/DeviceConfidence';
  import WidgetThingActivity from './widgets/ThingActivity';
  import WidgetThings from './widgets/Things';
  import WidgetThingSessionDetails from './widgets/ThingSessionDetails';
  import WidgetThingSessionList from './widgets/ThingSessionList';
  import WidgetThingSessionTimeline from './widgets/ThingSessionTimeline'

  export default {
    name: 'dashboard',
    data: () => ({thing: null, selectedSessionId: null}),
    components: {
      FeedbackForm, WidgetDeviceConfidence, WidgetThingActivity, WidgetThings,
      WidgetThingSessionDetails, WidgetThingSessionList, WidgetThingSessionTimeline
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
