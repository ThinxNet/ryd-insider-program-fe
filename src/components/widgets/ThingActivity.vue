<template>
  <article class="tile is-child notification is-white">
    <p class="title">Activity</p>
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else ref="chart"></div>
  </article>
</template>

<script>
  import moment from 'moment';

  export default {
    name: 'widget-thing-charts',
    props: {entity: Object},
    data() {
      return {loading: true, payload: []};
    },
    beforeMount() {
      google.charts.load('current', {packages: ['corechart', 'bar']});
    },
    async mounted() {
      try {
        const response = await this.$store.getters['common/apiInsiderProgram']
          .statisticsActivity(this.entity._id);
        this.payload = response.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    watch: {
      loading (current, previous) {
        if (current) { return; }
        setTimeout(this.chartRepaint);
      }
    },
    methods: {
      chartRepaint() {
        const data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');
        data.addColumn('number', 'Driving');
        data.addColumn({type: 'string', role: 'tooltip'});
        data.addColumn('number', 'Standstill');
        data.addColumn({type: 'string', role: 'tooltip'});

        this.payload.forEach(e => {
          const driveDuration = moment.duration(e.geoDriveDurationS, 's'),
            stayDuration = moment.duration(e.geoStayDurationS, 's');
          data.addRow([
            moment().dayOfYear(e.dayOfYear).toDate(),
            driveDuration.asMinutes(),
            `${moment.utc(driveDuration.asMilliseconds()).format("HH:mm")}h`,
            stayDuration.asMinutes(),
            `${moment.utc(stayDuration.asMilliseconds()).format("HH:mm")}h`,
          ]);
        });

        (new google.visualization.BarChart(this.$refs.chart)).draw(data, {
          chartArea: {width: '100%', height: '100%'},
          hAxis: {textPosition: 'none', baselineColor: '#039be5', gridlines: {color: 'none'}},
          isStacked: true,
          legend: { position: 'in', maxLines: 3, alignment: 'center' },
          theme: 'maximized',
          vAxis: { viewWindowMode: 'explicit'}
        });
      }
    }
  }
</script>
