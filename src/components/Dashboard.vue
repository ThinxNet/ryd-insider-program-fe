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
              <widget-thing-activity :entity="thing"/>
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

    <div class="modal is-active" v-if="uiFeedbackFormActive" style="z-index: 9999">
      <div class="modal-background"></div>
      <div class="modal-content">
          <header class="modal-card-head is-radiusless">
            <p class="modal-card-title">feedback</p>
          </header>
          <div class="box is-radiusless">
            <div class="field">
              <strong>Reference:</strong>
              <span class="tag">{{ $store.getters['widget/feedbackFormReference'] }}</span>
            </div>

            <div class="field">
              <label class="label">Category</label>
              <div class="control">
                <div class="select">
                  <select class="is-radiusless">
                    <option>No category</option>
                    <option>Issue</option>
                    <option>Suggestion</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <textarea class="textarea is-radiusless" placeholder="Message"></textarea>
              </div>
            </div>

            <div class="is-clearfix">
              <div class="is-pulled-left">
                <button class="button is-primary is-radiusless">send</button>
              </div>
              <div class="is-pulled-right">
                <button class="button is-white is-radiusless"
                  @click.prevent="uiFeedbackFormClose()">cancel</button>
              </div>
            </div>
          </div>
      </div>
      <button class="modal-close is-large" aria-label="close"
        @click.prevent="uiFeedbackFormClose()"></button>
    </div>

  </div>
</template>

<script>
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
      WidgetDeviceConfidence, WidgetThingActivity, WidgetThings, WidgetThingSessionDetails,
      WidgetThingSessionList, WidgetThingSessionTimeline
    },
    computed: {
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      },
      uiFeedbackFormActive() {
        return this.$store.getters['widget/isFeedbackFormActive'];
      }
    },
    methods: {
      thingChange(thing) {
        this.thing = thing;
      },
      thingSessionListChange(sessionId) {
        this.selectedSessionId = sessionId;
      },
      uiFeedbackFormClose() {
        this.$store.dispatch('widget/feedbackFormDiscard');
      }
    }
  }
</script>
