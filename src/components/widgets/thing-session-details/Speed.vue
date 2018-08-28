<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>

  <article v-else-if="session" class="content">
    <div ref="chart"></div>
  </article>

  <div v-else class="notification">No speed information available.</div>
</template>

<script>
  import _ from 'lodash';
  import moment from 'moment';

  export default {
    name: 'thing-session-details-speed',
    props: {sessionId: String, source: {default: 'gps', type: String}},
    data() {
      return {api: null, loading: true, session: null};
    },
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
      sessionId(currentId) {
        this.fetchData(currentId);
      },
      source() {
        this.fetchData(this.sessionId);
      }
    },
    methods: {
      async fetchData(id) {
        this.loading = true;
        try {
          this.session = (await this.api.session(id, {fields: {segments: 'attributes,timestamp'}}))
            .data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
        setTimeout(this.chartRepaint);
      },
      chartRepaint() {
        if (!this.session || !this.session.segments.length) { return; }

        const dataTable = new google.visualization.DataTable(),
          field = this.source + (this.source === 'obd' ? 'MaxSpeedKmH': 'SpeedKmH'),
          avg = _.ceil(_.meanBy(this.session.segments, `attributes.${field}`)),
          normalizer = avg * this.session.segments.length;

        dataTable.addColumn({type: 'datetime', label: 'Time'});
        dataTable.addColumn({type: 'string', role: 'tooltip', label: 'Id'});
        dataTable.addColumn({type: 'number', label: 'Speed (km/h)'});
        dataTable.addColumn({type: 'string', role: 'tooltip'});
        dataTable.addColumn({type: 'number', label: 'RPM'});
        dataTable.addColumn({type: 'string', role: 'tooltip'});
        dataTable.addColumn({type: 'number', label: `⌀ ${avg} km/h`});
        dataTable.addColumn({type: 'string', role: 'tooltip'});

        this.session.segments.forEach(segment => {
          const date = moment(segment.timestamp),
            timestamp = date.format('LTS');
          dataTable.addRow([
            date.toDate(),
            segment._id,
            segment.attributes[field],
            `${timestamp}\n${segment.attributes[field]} km/h`,
            segment.attributes.obdMaxRpm / normalizer,
            `${timestamp}\n${segment.attributes.obdMaxRpm} rpm`,
            avg,
            `${avg} km/h`
          ]);
        });

        const chart = new google.visualization.SteppedAreaChart(this.$refs.chart),
          options = {
            chartArea: {width: '85%'},
            hAxis: {format: 'mm'},
            legend: {position: 'top'},
            series: {1: {type: 'line'}, 2: {type: 'line'}},
            seriesType: 'steppedArea'
          };

        google.visualization.events
          .addListener(chart, 'onmouseover', sel => this.chartHover(sel, chart, dataTable));
        google.visualization.events
          .addListener(chart, 'select', () => chart.setSelection([]));

        chart.draw(dataTable, options);
      },
      chartHover(selection, instance, dataTable) {
        if (!selection.row) { return; }
        if (selection.column !== 6) {
          this.$emit('onSegmentHighlighted', dataTable.getValue(selection.row, 1));
        }
      }
    }
  }
</script>
