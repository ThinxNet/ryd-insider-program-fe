<template>
  <article class="tile is-child is-radiusless box">
    <h6 class="subtitle">Device confidence</h6>
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else>
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Level (%)</p>
            <p class="title">{{ confidencePercent('obdFuelLevelPercent') || 'N/A' }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Level (L)</p>
            <p class="title">{{ confidencePercent('obdFuelLevelL') || 'N/A' }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Cons. (L)</p>
            <p class="title">{{ confidencePercent('fuelConsumptionL') || 'N/A' }}</p>
          </div>
        </div>
      </nav>

      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Odometer</p>
            <p class="title">{{ confidencePercent('obdCarOdometer') || 'N/A' }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">GPS</p>
            <p class="title">{{ confidencePercent('gpsDistanceM') || 'N/A' }}</p>
          </div>
        </div>
      </nav>
    </div>
  </article>
</template>

<script>
  import Widget from '../../lib/mixins/widget';

  export default {
    name: 'widget-device-confidence',
    props: {deviceId: String},
    data: () => ({api: null, loading: true, payload: []}),
    mixins: [Widget],
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.fetchData(this.deviceId);
    },
    watch: {
      deviceId(currentId) {
        this.fetchData(currentId);
      }
    },
    methods: {
      async fetchData(deviceId) {
        this.loading = true;
        try {
          const response = await this.api.deviceConfidence(deviceId);
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
    }
  }
</script>
