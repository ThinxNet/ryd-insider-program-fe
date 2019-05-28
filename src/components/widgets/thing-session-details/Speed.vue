<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>

  <article v-else-if="session" class="content">
    <div ref="chart"></div>
  </article>

  <div v-else class="notification has-text-centered">
    No speed information available.
  </div>
</template>

<script>
  import _ from 'lodash';
  import moment from 'moment';

  export default {
    name: 'thing-session-details-speed',
    props: {sessionId: String, source: {default: 'gps', type: String}},
    data: () => ({api: null, loading: true, session: null}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    beforeMount() {
      google.charts.load('current', {packages: ['corechart']});
    },
    mounted() {
      google.charts.setOnLoadCallback(() => this.fetchData(this.sessionId, this.source));
    },
    watch: {
      sessionId(currentId) {
        this.fetchData(currentId, this.source);
      },
      source(source) {
        this.fetchData(this.sessionId, source);
      }
    },
    methods: {
      async fetchData(id, source) {
        if (!['geo', 'gps', 'obd', 'mixed'].includes(source)) { return; }

        this.loading = true;
        try {
          this.session = (await this.api.session(id, {fields: {segments: 'attributes,timestamp'}}))
            .data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
        setTimeout(() => this.chartRepaint(source));
      },
      chartRepaint(source) {
        if (!this.session || !this.session.segments.length) { return; }

        const dataTable = new google.visualization.DataTable(),
          segmentsWrapped = _(this.session.segments),
          field = source === 'mixed' ? 'speedKmH' : (source + 'SpeedKmH'),
          avg = _.ceil(segmentsWrapped.meanBy(`attributes.${field}`));

        const obdRpmValues = segmentsWrapped
          .map(v => _.max([v.attributes.obdEngineRpm, v.attributes.obdMaxRpm]))
          .reject(_.lte);
        const obdRpmMax = obdRpmValues.max(),
          obdRpmMin = obdRpmValues.min();

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
            timestamp = date.format('LTS'),
            obdRpm = _.max([segment.attributes.obdEngineRpm, segment.attributes.obdMaxRpm]),
            obdRpmNormal = obdRpm ? ((obdRpm - obdRpmMin) / (obdRpmMax - obdRpmMin)) * avg : null;
          dataTable.addRow([
            date.toDate(),
            segment._id,
            segment.attributes[field],
            `${timestamp}\n${segment.attributes[field]} km/h`,
            Math.max(0, obdRpmNormal),
            `${timestamp}\n${obdRpm} rpm`,
            avg,
            `${avg} km/h`
          ]);
        });

        const dataView = new google.visualization.DataView(dataTable),
          chart = new google.visualization.SteppedAreaChart(this.$refs.chart),
          options = {
            chartArea: {width: '85%'},
            colors: ['#3273dc', '#ff3860', '#209cee'],
            hAxis: {format: 'mm'},
            legend: {position: 'top'},
            series: {1: {type: 'line'}, 2: {type: 'line'}},
            seriesType: 'steppedArea',
            vAxis: {gridlines: {count: 10}}
          };

        google.visualization.events
          .addListener(chart, 'onmouseover', sel => this.chartHover(sel, chart, dataView));
        google.visualization.events
          .addListener(chart, 'select', () => {
            const selection = chart.getSelection();
            if (selection.length !== 1 || !_.isNull(selection[0].row)) {
              return chart.setSelection([]);
            }

            dataView.setColumns(
              dataView.getViewColumns().length > 4
                ? [0, 1, selection[0].column, selection[0].column + 1]
                : _.range(dataTable.getNumberOfColumns())
            );

            chart.draw(dataView, options);
          });

        chart.draw(dataView, options);
      },
      chartHover(selection, instance, data) {
        if (!selection.row) { return; }
        if (selection.column !== 6) {
          this.$emit('onSegmentHighlighted', data.getValue(selection.row, 1));
        }
      }
    }
  }
</script>
