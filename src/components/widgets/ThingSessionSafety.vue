<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <div v-if="loading" class="has-text-centered">
      <span class="icon is-large"><i class="ion-ios-time"></i></span>
    </div>

    <div v-else class="columns is-gapless">
      <!--<div class="column is-4" style="margin-top: 8px"></div>
      <div class="column is-8"></div>-->
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
    data() {
      return {api: null, loading: true};
    },
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.fetchData(this.sessionId)
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
          //const response = await this.api.statisticsActivity(sessionId);
          //this.payload = response.data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

        this.chartRepaint();
      },
      chartRepaint() {
        google.charts.load("current", {packages:["corechart"]});
        google.charts.setOnLoadCallback(() => {
          var data = google.visualization.arrayToDataTable([
            ['Group', 'Segments'],
            ['< 40 km/h',     3],
            ['< 70 km/h',     5],
            ['> 70 km/h',     2]
          ]);

          var options = {
            pieHole: 0.3,
            legend: 'none',
            width: 300,
            chartArea:{left: '30%',top:0,width:'100%',height:'100%'}
          };

          var chart = new google.visualization.PieChart(this.$refs.chart);
          chart.draw(data, options);
        });
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).omit(['api']).merge(this.$props).value();
      }
    }
  }
</script>
