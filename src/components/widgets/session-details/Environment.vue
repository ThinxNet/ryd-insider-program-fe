<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-clock"></i></span>
  </div>
  <div v-else style="max-height: 280px; overflow-y: scroll;">
    <table class="table is-fullwidth is-narrow is-hoverable">
      <thead>
        <tr>
          <th>Type</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="key in $_.keys(entries)">
          <td><span class="tag">{{ key }}</span></td>
          <td>
            <table class="table is-narrow is-fullwidth">
              <tbody>
                <tr v-for="sub in percentileOf(entries[key])">
                  <td>{{ sub.key }}</td>
                  <td><span class="tag">{{ sub.percent }}%</span></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import _ from 'lodash';

  const USABLE_TAGS = [
    /*'access',
    'bridge',*/
    'fee',
    'highway',
    //'junction',
    'lanes',
    'lit',
    'maxspeed',
    'maxspeed:forward',
    'maxspeed:type',
    'name',
    //'oneway',
    'shoulder',
    'smoothness',
    'surface',
    'traffic_calming',
    'tunnel:length',
    'tunnel:name'
  ];

  export default {
    name: 'widget-thing-session-details-environment',
    props: {sessionId: String},
    data() {
      return {loading: true, entries: []};
    },
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
