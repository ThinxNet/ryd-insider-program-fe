<template>
  <article class="tile is-child notification is-white">
    <div v-if="loading" class="has-text-centered">
      <span class="icon is-large"><i class="ion-clock"></i></span>
    </div>
    <div v-else>
      <div ref="timeline"></div>
    </div>
  </article>
</template>

<script>
  import _ from 'lodash';

  import Widget from '../../lib/mixins/widget';

  export default {
    name: 'widget-thing-session-timeline',
    props: {sessionId: String},
    mixins: [Widget],
    data: () => ({api: null, loading: true, entries: []}),
    beforeMount() {
      google.charts.load('current', {packages: ['timeline']});
    },
    async mounted() {
      this.api = await this.$store.getters['common/apiInsiderProgram'];
      google.charts.setOnLoadCallback(() => this.fetchData(this.sessionId));
    },
    watch: {
      loading(current, previous) {
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
        const dataTable = new google.visualization.DataTable(),
          presets = {'Country': 'country', 'State': 'state', 'City': 'city', 'Suburb': 'suburb'};

        dataTable.addColumn({ type: 'string', id: 'Location' });
        dataTable.addColumn({ type: 'string', id: 'Name' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });

        _.keys(presets).forEach(title => {
          const data = _(this.entries).filter('address')
            .groupBy(v => v.address[presets[title]])
            .mapValues(v => _.map(v, a => _.pick(a, ['speed', 'distance', 'timestamp']))).value();

          _.keys(data).forEach(key => {
            dataTable.addRow([
              title,
              key === 'null' ? 'Other' : key,
              new Date(_.head(data[key]).timestamp),
              new Date(_.last(data[key]).timestamp)
            ]);
          });
        });

        const options = {
          chartArea: {width: '100%', height: '100%'},
          avoidOverlappingGridLines: false,
          height: 215
        };

        (new google.visualization.Timeline(this.$refs.timeline)).draw(dataTable, options);
      }
    },
  }
</script>
