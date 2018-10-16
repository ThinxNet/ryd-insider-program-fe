<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>
  <div v-else-if="Object.keys(entries).length"
    style="max-height: 12.5rem; overflow-y: scroll; overflow-x: hidden;">
    <div class="columns" v-for="key in Object.keys(entries)">
      <div class="column is-4">
        <span class="tag">{{ key }}</span>
      </div>
      <div class="column">
        <table class="table is-narrow is-fullwidth" style="overflow: hidden">
          <tbody>
            <tr v-for="sub in percentileOf(entries[key])">
              <td>{{ sub.key }}</td>
              <td><span class="tag">{{ sub.percent }}%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div v-else class="notification">No environmental information is available.</div>
</template>

<script>
  import _ from 'lodash';

  const USABLE_TAGS = [
    'fee',
    'highway',
    'lanes',
    'lit',
    'maxspeed',
    'maxspeed:forward',
    'maxspeed:type',
    'name',
    'shoulder',
    'smoothness',
    'surface',
    'traffic_calming',
    'tunnel:length',
    'tunnel:name'
  ];

  export default {
    name: 'thing-session-details-environment',
    props: {sessionId: String},
    data: () => ({loading: true, entries: []}),
    mounted() {
      this.fetchData(this.sessionId);
    },
    watch: {
      sessionId(currentId) {
        this.fetchData(currentId);
      }
    },
    methods: {
      async fetchData(id) {
        this.loading = true;
        try {
          const response = await this.$store.getters['common/apiInsiderProgram']
            .sessionEnvironment(id);
          this.entries = _(response.data).map('tags').flatten().groupBy('key').pick(USABLE_TAGS)
            .mapValues(e => _.map(e, 'value'))
            .value();
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      },
      percentileOf(arr) {
        const len = arr.length,
          values = _.countBy(arr);
        return _.keys(values).map(key => ({key, percent: Math.round(values[key] / (len * 0.01))}));
      }
    }
  }
</script>
