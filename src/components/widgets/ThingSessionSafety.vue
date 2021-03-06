<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <div v-if="loading" class="has-text-centered">
      <span class="icon is-large"><i class="ion-ios-time"></i></span>
    </div>

    <template v-else-if="paginationHasEntries">
      <div class="columns">
        <div class="column is-three-fifths">
          <h6 class="subtitle">{{ paginationEntry.title }}</h6>
        </div>
        <div class="column has-text-right is-unselectable">
          <button class="button is-radiusless is-small"
            @click="paginationGoBackwards" :disabled="!paginationHasPrevious">
              <i class="ion-ios-arrow-back"></i>
          </button>
          <button class="button is-radiusless is-small"
            @click="paginationGoForward" :disabled="!paginationHasNext">
            <i class="ion-ios-arrow-forward"></i>
          </button>
        </div>
      </div>

      <div class="columns is-gapless">
        <div class="column">
          <div ref="chart"></div>
        </div>
      </div>
    </template>

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

  import MixinPagination from '../../lib/mixins/pagination';
  import MixinWidget from '../../lib/mixins/widget';

  import Feedback from './shared/Feedback';

  export default {
    name: 'widget-thing-session-safety',
    props: {sessionId: String},
    components: {Feedback},
    mixins: [MixinPagination, MixinWidget],
    data: () => ({api: null, entity: null, loading: true}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    beforeMount() {
      google.charts.load('current', {packages: ['corechart', 'bar']});
    },
    mounted() {
      google.charts.setOnLoadCallback(() => this.fetchData(this.sessionId));
      this.$on('onPaginationChanged', this.chartRepaint);
    },
    watch: {
      sessionId(id) {
        this.fetchData(id);
      }
    },
    methods: {
      async fetchData(sessionId) {
        this.loading = true;
        try {
          this.entity = (
            await this.api.session(sessionId, {fields: {statistics: 'speedBucketsKmH'}})
          ).data;
          this.paginationResetEntries([{title: 'Trip risk zones'}, {title: 'Speed distribution'}]);
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      },
      chartRepaint(idx) {
        const fnc = [_chartSafety, _chartSpeed][idx];
        if (!fnc) {
          throw new RangeError('Unknown chart');
        }
        return setTimeout(() => fnc(this.chartData, this.$refs.chart), 100);
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).merge(this.$props).omit(['entity', 'api']).value();
      },
      chartData() {
        return _.get(this.entity, 'statistics.speedBucketsKmH', []);
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
        vAxis: {
          baselineColor: '#FFF',
          gridlines: {count: 0},
          textStyle: {color: '#FFFFFF'},
          viewWindowMode: 'maximized'
        }
      };

    chart.draw(dataTable, options);
  }
</script>
