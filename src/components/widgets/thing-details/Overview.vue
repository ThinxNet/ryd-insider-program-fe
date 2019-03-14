<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>
  <article v-else>
    <h1 class="title">{{ thing.nickName }} ({{ thing.type.toLowerCase() }})</h1>
    <h2 class="subtitle">identification information</h2>
    <hr>

    <table class="table is-fullwidth is-striped is-narrow">
      <tbody>
        <tr>
          <td>VIN</td>
          <td><span class="tag">{{ thing.ymme.VIN || 'N/A' }}</span></td>
        </tr>
        <tr>
          <td>Year</td>
          <td><span class="tag">{{ thing.ymme.year }}</span></td>
        </tr>
        <tr>
          <td>Make</td>
          <td><span class="tag">{{ thing.ymme.make }}</span></td>
        </tr>
        <tr>
          <td>Model</td>
          <td><span class="tag">{{ thing.ymme.model }}</span></td>
        </tr>
        <tr>
          <td>Fuel</td>
          <td><span class="tag">{{ thing.ymme.fuelType || 'N/A' }}</span></td>
        </tr>
        <tr>
          <td>Cable status</td>
          <td><span class="tag">{{ thing.ymme.cableStatus || 'N/A' }}</span></td>
        </tr>
      </tbody>
    </table>

    <div v-if="flagYmmeNeedsReview === null"
      class="notification is-radiusless is-warning has-text-centered">
      <strong>Ryd.one</strong> hasn't tried to do identify your car yet.
    </div>
    <div v-else-if="flagYmmeNeedsReview === false"
      class="notification is-radiusless is-success has-text-centered">
      <strong>Ryd.one</strong> thinks is that your car is identified properly.
      <a href="#" @click.prevent="feedbackFormOpen">Please let us know if that is not true</a>.
    </div>
    <div v-else class="notification is-radiusless is-danger has-text-centered">
      <strong>Ryd.one</strong> needs some time to manually identify your car.
      <a href="#" @click.prevent="feedbackFormOpen">Please help us to do that
      by providing additional details (VIN/Make/Model/Year)</a>.
    </div>

    <h3 class="title">Device</h3>
    <h4 class="subtitle">hardware and software overview</h4>
    <hr>

    <table class="table is-fullwidth is-striped is-narrow">
      <tbody>
        <tr>
          <td>ID</td>
          <td><span class="tag">{{ device.id }}</span></td>
        </tr>
        <tr>
          <td>State</td>
          <td><span class="tag">{{ device.state }}</span></td>
        </tr>
        <tr>
          <td>Plugged-in</td>
          <td><span class="tag">{{ device.pluggedIn ? 'Yes' : 'No' }}</span></td>
        </tr>
        <tr>
          <td>Firmware version</td>
          <td><span class="tag">{{ device.fwVersion }}</span></td>
        </tr>
        <tr>
          <td>Script version</td>
          <td><span class="tag">{{ device.scriptVersion }}</span></td>
        </tr>
        <tr>
          <td>Config version</td>
          <td><span class="tag">{{ device.configVersion }}</span></td>
        </tr>
      </tbody>
    </table>

    <h4 class="subtitle">hardware status</h4>
    <hr>

    <table class="table is-fullwidth is-striped is-narrow">
      <tbody>
        <tr>
          <td>Antenna</td>
          <td><span class="tag">{{ device.dongleStatus.antennaStatus }}</span></td>
        </tr>
        <tr>
          <td>GPS receiver</td>
          <td><span class="tag">{{ device.dongleStatus.gpsReceiverSelfTest }}</span></td>
        </tr>
        <tr>
          <td>HTTP update</td>
          <td><span class="tag">{{ device.dongleStatus.httpUpdateStatus }}</span></td>
        </tr>
        <tr>
          <td>V-bus</td>
          <td>
            <span class="tag">{{ device.dongleStatus.vbusState }}</span>

            <table v-if="device.VBUSFW" class="table is-fullwidth is-narrow">
              <tr>
                <td>OBD Disabled</td>
                <td><span class="tag">{{ device.obdDisabled ? 'Yes' : 'No' }}</span></td>
              </tr>
              <tr>
                <td>Firmware version</td>
                <td><span class="tag">{{ device.VBUSFW }}</span></td>
              </tr>
              <tr>
                <td>Database version</td>
                <td><span class="tag">{{ device.VBUSDB }}</span></td>
              </tr>
              <tr>
                <td>Conflicts</td>
                <td><span class="tag">{{ device.obdBusConflictCounter }}</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <h4 class="subtitle">compatibility list</h4>
    <hr>

    <table v-if="$_.get(device, 'obdFeatures.protocol.description')"
      class="table is-fullwidth is-striped is-narrow">
      <tbody>
        <tr>
          <td>Protocol</td>
          <td><span class="tag">{{ device.obdFeatures.protocol.description }}</span></td>
        </tr>
        <tr class="is-size-7" v-for="(flag, param) in device.obdFeatures.params">
          <td>{{ param }}</td>
          <td>{{ flag ? 'Yes' : 'No' }}</td>
        </tr>
      </tbody>
    </table>

  </article>
</template>

<script>
  import _ from 'lodash';

  import Widget from '../../../lib/mixins/widget';
  import Feedback from '../shared/Feedback';

  export default {
    name: 'thing-details-overview',
    props: {thingId: String},
    data: () => ({api: null, device: null, loading: true, thing: null}),
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
      async fetchData(id) {
        this.loading = true;
        try {
          const results = await Promise.all([
            this.api.thing(id),
            this.api.thingDevice(id)
          ]);
          this.thing = results[0].data;
          this.device = results[1].data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      },
      feedbackFormOpen() {
        this.$store.dispatch(
          'componentWidgetMixin/feedbackFormActivate',
          {widgetId: this.widgetId, payload: this.widgetDebugPayload()}
        );
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).merge(this.$props).omit(['api']).value();
      },
      flagYmmeNeedsReview() {
        return _.get(this.thing, 'ymme.needsReview', null);
      }
    }
  }
</script>
