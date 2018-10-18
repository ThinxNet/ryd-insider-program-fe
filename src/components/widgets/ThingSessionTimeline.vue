<template>
  <article class="tile is-child is-radiusless box" style="position: relative">
    <div v-if="loading" class="has-text-centered">
      <span class="icon is-large"><i class="ion-ios-time"></i></span>
    </div>

    <div v-else-if="entries.length">
      <div ref="timeline"></div>
    </div>

    <p v-else class="notification">Not enough data to build the timeline.</p>

    <feedback style="position: absolute; bottom: 0; left: 0;"
      :widget-version="widgetVersion"
      :widget-id="widgetId"
      :debug-payload="widgetDebugPayload()"/>
  </article>
</template>

<script>
  import _ from 'lodash';
  import moment from 'moment';

  import Feedback from './shared/Feedback';

  import Widget from '../../lib/mixins/widget';

  export default {
    name: 'widget-thing-session-timeline',
    components: {Feedback},
    mixins: [Widget],
    props: {sessionId: String},
    data: () => ({api: null, loading: true, entries: []}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    beforeMount() {
      google.charts.load('current', {packages: ['timeline']});
    },
    mounted() {
      google.charts.setOnLoadCallback(() => this.fetchData(this.sessionId));
    },
    watch: {
      loading(current) {
        if (current) { return; }
        setTimeout(this.chartRepaint);
      },
      sessionId(currentId) {
        this.fetchData(currentId);
      }
    },
    methods: {
      async fetchData(id) {
        this.loading = true;
        this.entries = [];
        try {
          this.entries = (await this.api.sessionEnvironment(id)).data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
        setTimeout(this.chartRepaint);
      },
      chartRepaint() {
        if (!this.entries.length) { return; }

        const dataTable = new google.visualization.DataTable(),
          presets = {
            'Country': a => a.country,
            'State': a => a.state,
            'City': a => a.city || a.county,
            'Suburb': a => a.suburb || a.village || a.town
          };

        dataTable.addColumn({type: 'string', id: 'Location'});
        dataTable.addColumn({type: 'string', id: 'Name'});
        dataTable.addColumn({type: 'string', role: 'tooltip', p: {html: true}});
        dataTable.addColumn({type: 'date', id: 'Start'});
        dataTable.addColumn({type: 'date', id: 'End'});

        _.keys(presets).forEach(title => {
          const fields = ['speedMs', 'durationS', 'distanceM', 'timestamp'],
            timestamp = moment(_.head(this.entries).timestamp),
            data = _(this.entries).filter('address')
              .groupBy(v => presets[title](v.address))
              .mapValues(v => _.map(v, a => _.pick(a, fields))).value();
          _.keys(data).forEach(key => {
            const distance = _.round(_.sumBy(data[key], 'distanceM') / 1000, 1),
              speed = _.round(_.meanBy(data[key], 'speedMs') * 3.6, 1),
              duration = _.sumBy(data[key], 'durationS'),
              tooltip = `<div class="notification">
                <b>${key}</b><br>
                <b>Duration:</b> ${moment.duration(duration, 's').humanize()}<br>
                <b>Distance:</b> ${distance} km.<br>
                <b>Avg. speed:</b> ${speed} km/h
               </div>`;
            dataTable.addRow([
              title,
              key === 'null' ? 'Other' : key,
              tooltip,
              timestamp.toDate(),
              timestamp.add(duration, 's').toDate()
            ]);
          });
        });

        const options = {
          avoidOverlappingGridLines: false,
          chartArea: {width: '100%'},
          height: 215,
          timeline: {showRowLabels: false}
        };

        (new google.visualization.Timeline(this.$refs.timeline)).draw(dataTable, options);
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).omit(['api', 'entries']).merge(this.$props).value();
      }
    }
  }
</script>
