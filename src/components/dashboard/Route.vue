<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <div class="tile is-parent is-vertical" v-if="notification">
        <div class="notification is-danger is-radiusless">{{ notification }}</div>
      </div>

      <div class="tile is-parent">
        <widget-thing-list @onEntrySelected="thingChange"/>
      </div>

      <div class="tile" v-if="thing">
        <!-- last session -->
        <div class="tile is-parent is-4" style="background-color: #14ADDD">
          <widget-thing-session-list
            :session-id="sessionId"
            :device-id="thing.device"
            @onSessionChange="thingSessionListChange"/>
        </div>

        <div class="tile is-vertical">
          <div class="tile">
            <!-- session details -->
            <div class="tile is-parent" v-if="sessionId" style="background-color: #14ADDD">
              <widget-thing-session-details :session-id="sessionId"/>
            </div>

            <!-- activity -->
            <div class="tile is-parent">
              <widget-thing-activity :thing-id="thing._id"/>
            </div>
          </div>

          <div class="tile">
            <!-- timeline -->
            <div v-if="sessionId" class="tile is-parent" style="background-color: #14ADDD">
              <widget-thing-session-safety :session-id="sessionId"/>
            </div>

            <!-- device confidence -->
            <div class="tile is-parent">
              <widget-device-confidence :thing-id="thing._id"/>
            </div>
          </div>
        </div>
      </div>

      <div class="tile">
          <div v-if="sessionId" class="tile is-parent is-8" style="background-color: #14ADDD">
            <widget-thing-session-timeline :session-id="sessionId"/>
          </div>
        <div class="tile is-4">

        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import WidgetDeviceConfidence from '../widgets/DeviceConfidence';
  import WidgetThingActivity from '../widgets/ThingActivity';
  import WidgetThingList from '../widgets/ThingList';
  import WidgetThingSessionDetails from '../widgets/ThingSessionDetails';
  import WidgetThingSessionList from '../widgets/ThingSessionList';
  import WidgetThingSessionSafety from '../widgets/ThingSessionSafety'
  import WidgetThingSessionTimeline from '../widgets/ThingSessionTimeline'

  export default {
    name: 'dashboard',
    data: () => ({thing: null, sessionId: null}),
    components: {
      WidgetDeviceConfidence, WidgetThingActivity, WidgetThingList, WidgetThingSessionDetails,
      WidgetThingSessionList, WidgetThingSessionSafety, WidgetThingSessionTimeline
    },
    created() {
      this.$watch(
        () => this.$store.getters["componentDashboard/sessionId"],
        newId => this.sessionId = newId
      );
    },
    beforeDestroy() {
      this.$store.dispatch('componentDashboard/sessionIdReset');
    },
    methods: {
      thingChange(thing) {
        this.thing = thing;
        this.$store.dispatch('componentDashboard/sessionIdReset');
      },
      thingSessionListChange(sessionId) {
        this.$store.dispatch('componentDashboard/sessionIdChange', {sessionId});
      }
    },
    computed: {
      notification() {
        return (process.env.NODE_ENV === 'production')
          ? 'Unstable backend infrastructure. Please use the staging environment instead '
              + '(though, it is also might be unstable sometimes).'
          : null;
      },
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      }
    }
  }
</script>
