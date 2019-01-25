<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <h6 class="subtitle">Device confidence</h6>
    <span v-if="loading" class="icon is-large"><i class="ion-ios-time"></i></span>
    <div v-else>
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Fuel level (in percent)">Fuel (%)</p>
            <p v-if="confidencePercent('REGRESSION_DEVICE_FUEL_LEVEL_PERCENT')" class="title">
              {{ confidencePercent('REGRESSION_DEVICE_FUEL_LEVEL_PERCENT') }}
            </p>
            <p v-else class="title has-text-grey-lighter">N/A</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Fuel level (in liters)">Fuel (L)</p>
            <p v-if='confidencePercent("REGRESSION_DEVICE_FUEL_LEVEL_LITERS")' class='title'>
              {{ confidencePercent('REGRESSION_DEVICE_FUEL_LEVEL_LITERS') }}
            </p>
            <p v-else class="title has-text-grey-lighter">N/A</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Fuel consumption (in liters)">Cons. (L)</p>
            <p v-if="confidencePercent('REGRESSION_DEVICE_FUEL_CONSUMPTION')" class="title">
              {{ confidencePercent('REGRESSION_DEVICE_FUEL_CONSUMPTION') }}
            </p>
            <p v-else class="title has-text-grey-lighter">N/A</p>
          </div>
        </div>
      </nav>

      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="Odometer quality">Odometer</p>
            <p v-if="confidencePercent('DEVICE_OBD_CAR_ODOMETER')" class="title">
              {{ confidencePercent('DEVICE_OBD_CAR_ODOMETER') }}
            </p>
            <p v-else class="title has-text-grey-lighter">N/A</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading" title="GPS quality">GPS</p>
            <p v-if="confidencePercent('DEVICE_GPS_DISTANCE')" class="title">
              {{ confidencePercent('DEVICE_GPS_DISTANCE') }}
            </p>
            <p class="title has-text-grey-lighter" v-else>N/A</p>
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
          return;
        } finally {
          this.loading = false;
        }
      },
      confidencePercent(origin) {
        const value = (_.find(this.payload, {origin}) || {}).confidence;
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
