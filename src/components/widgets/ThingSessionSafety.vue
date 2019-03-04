<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <div class="columns">
      <div class="column is-three-fifths">
        <h6 class="subtitle">{{ chartTitle }}</h6>
      </div>
      <div class="column has-text-right is-unselectable">
        <button class="button is-radiusless is-small"
          @click="chartIndexModify(-1)" :disabled="!chartHasPrevious">
            <i class="ion-ios-arrow-back"></i>
        </button>
        <button class="button is-radiusless is-small"
          @click="chartIndexModify(1)" :disabled="!chartHasNext">
          <i class="ion-ios-arrow-forward"></i>
        </button>
      </div>
    </div>

    <div v-if="loading" class="has-text-centered">
      <span class="icon is-large"><i class="ion-ios-time"></i></span>
    </div>

    <div v-else-if="chartData.length" class="columns is-gapless">
      <div class="column">
        <div ref="chart"></div>
      </div>
    </div>

    <p v-else class="notification has-text-centered">Not enough data to build the chart.</p>

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
      api: null, loading: true, entity: null, chartIndex: 0,
      charts: [{title: 'Trip risk zones'}, {title: 'Speed distribution'}]
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
        if (current) { return; }
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
          this.entity = (
            await this.api.session(sessionId, {fields: {statistics: 'speedBucketsKmH'}})
          ).data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      },
      chartRepaint(index) {
        switch (index) {
          case 0:
            return _chartSafety(this.chartData, this.$refs.chart);
          case 1:
            return _chartSpeed(this.chartData, this.$refs.chart);
          default:
            throw new RangeError('Unknown chart');
        }
      },
      chartIndexModify(position) {
        const idxNew = this.chartIndex + position;
        if (idxNew > -1 && idxNew < this.charts.length) {
          this.chartIndex = idxNew;
        }
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).omit(['entity', 'api']).merge(this.$props).value();
      },
      chartData() {
        return _.get(this.entity, 'statistics.speedBucketsKmH', []);
      },
      chartTitle() {
        return this.charts[this.chartIndex].title;
      },
      chartHasPrevious() {
        return this.chartIndex - 1 >= 0;
      },
      chartHasNext() {
        return this.chartIndex + 1 < this.charts.length;
      }
    }
  }

  /** @private */
  function _chartSafety(payload, element) {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({type: 'string', label: 'Risk'});
    dataTable.addColumn({type: 'number', label: 'Percent'});

    _.forEach(
      {low: [0, 40], medium: [40, 70], high: [70, Number.MAX_SAFE_INTEGER]},
      (range, label) => {
        const list = _(payload).filter(entry => _.inRange(entry.step, range[0], range[1])).value(),
          distanceM = _.sumBy(list, 'distanceM');
        dataTable.addRow([`${label} (${_.round(distanceM / 1000, 1)} km)`, list.length]);
      }
    );

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

    const totalDurationS = _.maxBy(payload, 'durationS').durationS,
      totaldistanceM = _.maxBy(payload, 'distanceM').distanceM;

    payload.forEach(entry => {
      dataTable.addRow([
        '~' + (entry.step + 10),
        percentile(totalDurationS, entry.durationS),
        `Duration: ${moment
          .utc(moment.duration(entry.durationS, 's').asMilliseconds()).format('HH:mm:ss')} h`,
        percentile(totaldistanceM, entry.distanceM),
        `Distance: ${_.round(entry.distanceM / 1000, 1)} km`
      ]);
    });

    const chart = new google.visualization.ColumnChart(element),
      options = {
        chartArea: {left: 0, top: 0, width: '100%', height: '80%'},
        colors: ['#14addd', '#00b89c'],
        height: 160,
        isStacked: true,
        legend: 'none',
        vAxis: {gridlines: {count: 0}, baselineColor: '#FFF', textStyle: {color: '#FFFFFF'}}
      };

    chart.draw(dataTable, options);
  }
</script>
