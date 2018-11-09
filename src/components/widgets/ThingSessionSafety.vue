<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <div v-if="loading" class="has-text-centered">
      <span class="icon is-large"><i class="ion-ios-time"></i></span>
    </div>

    <div v-else class="columns is-gapless">
      <div ref="chart"></div>
    </div>

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
            pieHole: 0.5,
            legend: 'none',
            slices: {
              0: {color: '#00b89c'},
              1: {color: '#f46036'},
              2: {color: '#ff3860'}
            },
            width: 300,
            chartArea:{left: '30%', top: '5%', width: '100%', height: '90%'}
          };

        chart.draw(dataTable, options);
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).omit(['api']).merge(this.$props).value();
      }
    }
  }
</script>
