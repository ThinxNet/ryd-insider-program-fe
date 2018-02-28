<template>
  <div class="tile is-parent">

    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <article class="tile is-child box">
      <p class="title">Activity</p>
      <figure class=" is-4by3">
        <div id="chart_div"></div>
      </figure>
    </article>
  </div>
</template>

<script>
  import moment from 'moment';

  export default {
    name: 'widget-thing-charts',
    props: {entity: Object},
    data() {
      return {loading: true};
    },
    async mounted() {
      google.charts.load('current', {packages: ['corechart', 'bar']});


      function drawStacked(payload) {
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Day Of Month');
        data.addColumn('number', 'Driving');
        data.addColumn('number', 'Standstill');

        payload.forEach(e =>
          data.addRow([
            e.dayOfMonth,
            moment.duration(e.gpsDriveDurationS, 's').asMinutes(),
            moment.duration(e.gpsStayDurationS, 's').asMinutes()
          ])
        );


        var options = {
          bars: 'horizontal',
          chartArea: {width: '80%', height: '80%'},
          legend: {position: 'none'},
          isStacked: true
        };

      var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
      chart.draw(data, options);
      }

      try {
        const response = await this.$store.getters['common/apiInsiderProgram']
          .statisticsStandstill(this.entity._id);

        google.charts.setOnLoadCallback(() => drawStacked(response.data));
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    methods: {
    }
  }
</script>
