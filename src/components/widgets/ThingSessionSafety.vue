<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <h6 class="subtitle">Trip safety</h6>
    <div v-if="loading" class="has-text-centered">
      <span class="icon is-large"><i class="ion-ios-time"></i></span>
    </div>

    <div v-else-if="!isPayloadEmpty" class="columns is-gapless">
      <div class="column">
        <div ref="chart"></div>
      </div>
    </div>

    <p v-else class="notification has-text-centered">Not enough data to build the safety chart.</p>

    <feedback style="position: absolute; bottom: 0; left: 0;"
      :widget-version="widgetVersion"
      :widget-id="widgetId"
      :debug-payload="widgetDebugPayload()"/>
  </article>
</template>

<script>
  import _ from 'lodash';

  import Widget from '../../lib/mixins/widget';
  import Feedback from './shared/Feedback';

  export default {
    name: 'widget-thing-session-safety',
    props: {sessionId: String},
    components: {Feedback},
    mixins: [Widget],
    data: () => ({api: null, loading: true, payload: null}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    beforeMount() {
      google.charts.load('current', {packages: ['corechart']});
    },
    mounted() {
      google.charts.setOnLoadCallback(() => this.fetchData(this.sessionId));
    },
    watch: {
      sessionId(current) {
        this.fetchData(current);
      }
    },
    methods: {
      async fetchData(sessionId) {
        this.loading = true;
        try {
          this.payload = (await this.api.sessionSafety(sessionId)).data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

        setTimeout(this.chartRepaint);
      },
      chartRepaint() {
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn({type: 'string', label: 'Risk'});
        dataTable.addColumn({type: 'number', label: 'Percent'});
        dataTable.addColumn({type: 'string', role: 'tooltip'});

        _.keys(this.payload).forEach(key => {
          const entry = this.payload[key];
          dataTable.addRow([
            key,
            entry.count,
            `Risk: ${key}\nDistance: ${_.round(entry.distanceM / 1000, 1)} km`
          ]);
        });

        const chart = new google.visualization.PieChart(this.$refs.chart),
          options = {
            chartArea: {left: '10', top: '8', width: '100%', height: '90%'},
            colors: ['#00b89c', '#f46036', '#ff3860'],
            enableInteractivity: false,
            height: 160,
            legend: {position: 'labeled', textStyle: {color: '#363636'}},
            pieHole: 0.4,
            pieSliceText: 'none',
            pieStartAngle: 100,
            slices: {0: {}, 1: {}, 2: {offset: 0.1}},
            title: 'none'
          };

        chart.draw(dataTable, options);
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).omit(['api']).merge(this.$props).value();
      },
      isPayloadEmpty() {
        return !this.payload || !_(this.payload).values().sumBy('count');
      }
    }
  }
</script>
