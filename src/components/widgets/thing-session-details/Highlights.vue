<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>

  <article v-else-if="paginationHasEntries">
    <div class="columns">
      <div class="column is-three-fifths">
        <h6 class="subtitle">{{ pageTitle }}</h6>
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

    <div ref="chart"></div>
  </article>

  <div v-else class="notification has-text-centered">No highlights information available.</div>
</template>

<script>
  import _ from 'lodash';

  import MixinPagination from '../../../lib/mixins/pagination';

  export default {
    name: 'thing-session-details-highlights',
    props: {sessionId: String},
    data: () => ({api: null, loading: true}),
    mixins: [MixinPagination],
    beforeMount() {
      google.charts.load('current', {packages: ['corechart']});
    },
    mounted() {
      this.fetchData(this.sessionId);
    },
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    watch: {
      sessionId(current) {
        this.fetchData(current);
      },
      paginationIdx() {
        this.chartRepaint(this.paginationEntry);
      }
    },
    methods: {
      async fetchData(id) {
        this.loading = true;
        try {
          const response = (await this.api.sessionHighlights(id)).data || [];
          this.paginationResetEntries(_.sortBy(response, 'type'));
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

        this.chartRepaint(this.paginationEntry)
      },
      chartRepaint: function (entry) {
        if (!this.paginationHasEntries) {
          return;
        }

        const fnc = {
          'OVERSPEED': _chartOverSpeed,
          'ROAD_CLASSIFICATION': _chartRoadClassification
        }[entry.type];
        if (!fnc) {
          throw new RangeError(`Unknown type "${entry.type}"`);
        }

        return setTimeout(() => fnc(entry.attributes.segments, this.$refs.chart), 100);
      }
    },
    computed: {
      pageTitle() {
        return {
          'OVERSPEED': 'Exceeding speed limit',
          'ROAD_CLASSIFICATION': 'Road classification'
        }[this.paginationEntry.type] || 'Unknown';
      }
    }
  }

  /** @private */
  function _chartRoadClassification(payload, element) {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({type: 'string', label: 'Class'});
    dataTable.addColumn({type: 'number', label: 'Distance (meters)'});

    const colors = {country: '#f46036', federal: '#f48e35', other: '#00b89c'},
      groups = _.groupBy(payload, 'class');
    _.forEach(groups, (entries, group) => dataTable.addRow([group, _.sumBy(entries, 'distanceM')]));

    const chart = new google.visualization.PieChart(element),
      hasMultipleClasses = dataTable.getNumberOfRows() > 1,
      options = {
        chartArea: {top: 5, width: '100%', height: '92%'},
        colors: _.pullAt(colors, _.keys(groups)),
        enableInteractivity: false,
        height: 146,
        legend: {position: 'labeled', textStyle: {color: '#363636'}},
        pieSliceText: 'none',
        slices: {0: {offset: hasMultipleClasses ? 0.1 : 0}}
      };

    chart.draw(dataTable, options);
  }

  /** @private */
  function _chartOverSpeed(payload, element) {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({type: 'string', label: 'Category'});
    dataTable.addColumn({type: 'number', label: 'Distance (city area)'});
    dataTable.addColumn({type: 'number', label: 'Distance (country area)'});

    _(payload).groupBy(entry => {
      const diff = entry.speedKmH - entry.maxSpeedKmH;
      switch (true) {
        case diff >= 31: return 2;
        case diff >= 21: return 1;
        default: return 0;
      }
    })
    .forEach((attrs, idx) => {
      const category = (+idx + 1) * 10,
        partitions = _.partition(attrs, 'cityArea');
      dataTable.addRow([
        `${category + 1}-${category + 10} km/h`,
        _.sumBy(partitions[0], 'distanceM'),
        _.sumBy(partitions[1], 'distanceM')
      ])
    });

    const chart = new google.visualization.BarChart(element),
      options = {
        chartArea: {width: '70%', height: '80%'},
        colors: ['#00b89c', '#f46036'],
        hAxis: {viewWindowMode: 'maximized'},
        height: 140,
        isStacked: true,
        legend: {alignment: 'end', position: 'top', textStyle: {color: '#363636'}},
        vAxis: {gridlines: {count: 10}}
      };

    chart.draw(dataTable, options);
  }
</script>
