<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <div class="columns">
      <div class="column is-three-fifths">
        <h6 class="subtitle">Trip safety</h6>
      </div>
      <div class="column has-text-right is-unselectable">
        <button class="button is-radiusless is-small"
          @click="chartIndexModify(-1)">
            <i class="ion-ios-arrow-back"></i>
        </button>
        <button class="button is-radiusless is-small"
          @click="chartIndexModify(1)">
          <i class="ion-ios-arrow-forward"></i>
        </button>
      </div>
    </div>

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
  import moment from 'moment';

  import Widget from '../../lib/mixins/widget';
  import Feedback from './shared/Feedback';

  export default {
    name: 'widget-thing-session-safety',
    props: {sessionId: String},
    components: {Feedback},
    mixins: [Widget],
    data: () => ({
      api: null, loading: true, payload: null, chartIndex: 0
    }),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    beforeMount() {
      google.charts.load('current', {packages: ['corechart', 'bar']});
    },
    mounted() {
      google.charts.setOnLoadCallback(() => this.fetchData(this.sessionId));
    },
    watch: {
      loading(current) {
        if (current || this.isPayloadEmpty) { return; }
        setTimeout(() => this.chartRepaint(this.chartIndex));
      },
      chartIndex(currentIdx) {
        this.chartRepaint(currentIdx);
      },
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
      },
      chartRepaint(index) {
        switch (index) {
          case 0: return _chartSafety(this.payload, this.$refs.chart);
          case 1: return _chartSpeed(this.payload, this.$refs.chart);
          default: throw new RangeError('Unknown chart');
        }
      },
      chartIndexModify(position) {
        const idxNew = this.chartIndex + position;
        console.log(idxNew);
        if (idxNew > -1 && idxNew < 2) {
          this.chartIndex = idxNew;
        }
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

  /** @private */
  function _chartSafety(payload, element) {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({type: 'string', label: 'Risk'});
    dataTable.addColumn({type: 'number', label: 'Percent'});

    _.keys(payload).forEach(key => {
      const entry = payload[key];
      dataTable.addRow([`${key} (${_.round(entry.distanceM / 1000, 1)} km)`, entry.count]);
    });

    const chart = new google.visualization.PieChart(element),
      options = {
        chartArea: {left: '10', top: '8', width: '100%', height: '90%'},
        colors: ['#00b89c', '#f46036', '#ff3860'],
        enableInteractivity: false,
        height: 160,
        legend: {position: 'labeled', textStyle: {color: '#363636'}},
        pieHole: 0.4,
        pieSliceText: 'none',
        title: 'none'
      };

    chart.draw(dataTable, options);
  }

  /** @private */
  function _chartSpeed(payload, element) {
    const dataTable = new google.visualization.DataTable(),
      percentile = (total, current) => current / (total * 0.01);
    dataTable.addColumn({type: 'string', label: 'Speed'});
    dataTable.addColumn({type: 'number', label: 'Duration'});
    dataTable.addColumn({type: 'string', role: 'tooltip'});
    dataTable.addColumn({type: 'number', label: 'Distance'});
    dataTable.addColumn({type: 'string', role: 'tooltip'});

  payload = [
            {
                "distanceM" : 54,
                "durationS" : 26,
                "step" : 0
            },
            {
                "distanceM" : 321,
                "durationS" : 79,
                "step" : 10
            },
            {
                "distanceM" : 741,
                "durationS" : 114,
                "step" : 20
            },
            {
                "distanceM" : 1490,
                "durationS" : 164,
                "step" : 30
            },
            {
                "distanceM" : 2582,
                "durationS" : 121,
                "step" : 40
            },
            {
                "distanceM" : 2788,
                "durationS" : 181,
                "step" : 50
            },
            {
                "distanceM" : 556,
                "durationS" : 30,
                "step" : 60
            },
            {
                "distanceM" : 3628,
                "durationS" : 171,
                "step" : 70
            },
            {
                "distanceM" : 4406,
                "durationS" : 160,
                "step" : 80
            },
            {
                "distanceM" : 4535,
                "durationS" : 156,
                "step" : 90
            },
            {
                "distanceM" : 511,
                "durationS" : 18,
                "step" : 100
            }
        ];

    const totalDurationS = _.maxBy(payload, 'durationS').durationS,
      totaldistanceM = _.maxBy(payload, 'distanceM').distanceM;
    payload.forEach(entry => {
      console.log(totalDurationS, entry.durationS, percentile(totalDurationS, entry.durationS));
      dataTable.addRow([
        '' + (entry.step + 10),
        percentile(totalDurationS, entry.durationS),
        `Duration: ${moment
          .utc(moment.duration(entry.durationS, 's').asMilliseconds()).format('HH:mm:ss')} h`,
        percentile(totaldistanceM, entry.distanceM),
        `Distance: ${_.round(entry.distanceM / 1000)} km`
      ]);
    });

    const chart = new google.visualization.ColumnChart(element),
      options = {
        chartArea: {left: 0, top: 0, width: '100%', height: '80%'},
        colors: ['#14addd', '#00b89c'],
        height: 170,
        isStacked: true,
        legend: 'none',
        vAxis: {gridlines: {count: 0}, baselineColor: '#FFF', textStyle: {color: '#FFFFFF'}}
      };

    chart.draw(dataTable, options);
  }
</script>
