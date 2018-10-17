<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <h6 class="subtitle">Device confidence</h6>
    <span v-if="loading" class="icon is-large"><i class="ion-ios-time"></i></span>
    <div v-else>
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Fuel level percent">Fuel (%)</p>
            <p class="title">{{ confidencePercent('obdFuelLevelPercent') || 'N/A' }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Fuel level liters">Fuel (L)</p>
            <p class="title">{{ confidencePercent('obdFuelLevelL') || 'N/A' }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Fuel consumption liters">Cons. (L)</p>
            <p class="title">{{ confidencePercent('fuelConsumptionL') || 'N/A' }}</p>
          </div>
        </div>
      </nav>

      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Odometer quality">Odometer</p>
            <p class="title">{{ confidencePercent('obdCarOdometer') || 'N/A' }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="GPS quality">GPS</p>
            <p class="title">{{ confidencePercent('gpsDistanceM') || 'N/A' }}</p>
          </div>
        </div>
      </nav>
    </div>

    <feedback style="position: absolute; bottom: 0; left: 0;"
      :widget-version="widgetVersion"
      :widget-id="widgetId"
      :debug-payload="widgetDebugPayload()"/>
  </article>
</template>

<script>
  import Widget from '../../lib/mixins/widget';
  import Feedback from './shared/Feedback';

  // @todo #12:2h move the widget functionality to a new component

  export default {
    name: 'widget-device-confidence',
    props: {thingId: String},
    data: () => ({api: null, loading: true, payload: []}),
    components: {Feedback},
    mixins: [Widget],
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.fetchData(this.thingId);
    },
    watch: {
      thingId(currentId) {
        this.fetchData(currentId);
      }
    },
    methods: {
      async fetchData(thingId) {
        this.loading = true;
        try {
          const response = await this.api.thingDeviceConfidence(thingId);
          this.payload = response.data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      },
      confidencePercent(target) {
        const value = (_.find(this.payload, {target}) || {}).confidence;
        return value ? value + '%' : null;
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).omit(['api']).merge(this.$props).value();
      }
    }
  }
</script>
