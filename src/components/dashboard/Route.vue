<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <div class="tile is-parent is-vertical" v-if="notification">
        <div class="notification is-danger is-radiusless">{{ notification }}</div>
      </div>

      <div class="tile is-parent">
        <widget-thing-list @onEntrySelected="onThingChange"/>
      </div>

      <div class="tile" v-if="thing">
        <!-- last session -->
        <div class="tile is-parent is-4" style="background-color: #14ADDD">
          <widget-thing-session-list
            :entries="sessions" :entry-selected="sessionSelectedId" :device-id="thing.device"
            @onSessionChange="onSessionChange" />
        </div>

        <div class="tile is-vertical">
          <div class="tile">
            <!-- session details -->
            <div class="tile is-parent" v-if="sessionSelectedId" style="background-color: #14ADDD">
              <widget-thing-session-details :session-id="sessionSelectedId"/>
            </div>

            <!-- activity -->
            <div class="tile is-parent">
              <widget-thing-activity :thing-id="thing._id"/>
            </div>
          </div>

          <div class="tile">
            <!-- timeline -->
            <div v-if="sessionSelectedId" class="tile is-parent" style="background-color: #14ADDD">
              <widget-thing-session-safety :session-id="sessionSelectedId"/>
            </div>

            <!-- device confidence -->
            <div class="tile is-parent">
              <widget-device-confidence :thing-id="thing._id"/>
            </div>
          </div>
        </div>
      </div>

      <div class="tile">
        <!-- timeline -->
        <div v-if="sessionSelectedId" class="tile is-parent is-8" style="background-color: #14ADDD">
          <widget-thing-session-timeline :session-id="sessionSelectedId"/>
        </div>

        <div class="tile is-4">
          <!-- nothing here yet -->
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
    data: () => ({api: null, loading: true, sessions: [], sessionSelectedId: null, thing: null}),
    components: {
      WidgetDeviceConfidence, WidgetThingActivity, WidgetThingList, WidgetThingSessionDetails,
      WidgetThingSessionList, WidgetThingSessionSafety, WidgetThingSessionTimeline
    },
    watch: {
      '$route.params.sessionId'(sessionId) {
        this.changeSessionId(sessionId);
      },
      thing(current) {
        this.fetchSessions(current.device);
      }
    },
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    beforeDestroy() {
      this.changeSessionId(null);
    },
    methods: {
      async fetchSessions(deviceId) {
        this.sessions = [];

        this.loading = true;
        try {
          const payload = {filter: {device: deviceId}, page: {size: 10}},
            response = await this.api.sessions(payload);
          this.sessions = response.data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

        let selectedId = this.$route.params.sessionId;
        if (!selectedId || !this.sessions.find(entry => entry._id === selectedId)) {
          selectedId = this.sessions[0] ? this.sessions[0]._id : null;
        }

        this.changeSessionId(selectedId);
      },
      changeSessionId(sessionId) {
        this.sessionSelectedId = sessionId;
      },
      onSessionChange(sessionId) {
        this.changeSessionId(sessionId);
        this.$router.push({name: 'dashboard', params: {sessionId}});
      },
      onThingChange(thing) {
        this.thing = thing;
        this.changeSessionId(null);
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
