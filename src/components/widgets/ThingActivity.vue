<template>
  <article class="tile is-child is-radiusless box">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else ref="chart" class="is-fullwidth"></div>
    <br>
    <div class="buttons has-addons is-centered">
      <span v-for="type in ['obd', 'geo', 'gps']"
        @click="sourceSwitchTo(type)"
        :class="['button', 'is-small', source === type ? 'is-primary is-active' : '']">
          {{ type.toUpperCase() }}
      </span>
    </div>
    <p v-if="payload.length">
      You've spent <span class="tag">{{ timeDrive }}</span> in the car
      and <span class="tag">{{ timeStandstill }}</span> at lights and in traffic jams.
    </p>
  </article>
</template>

<script>
  import _ from 'lodash';
  import moment from 'moment';

  export default {
    name: 'widget-thing-charts',
    props: {entity: Object},
    data() {
      return {api: null, loading: true, payload: [], source: 'geo'};
    },
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    beforeMount() {
      google.charts.load('current', {packages: ['corechart', 'bar']});
    },
    async mounted() {
      google.charts.setOnLoadCallback(() => this.entityChange(this.entity));
    },
    watch: {
      loading(current, previous) {
        if (current) { return; }
        setTimeout(this.chartRepaint);
      },
      entity(current, previous) {
        this.entityChange(current);
      }
    },
    methods: {
      async entityChange(entity) {
        this.loading = true;
        try {
          const response = await this.api.statisticsActivity(entity._id);
          this.payload = response.data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      },
      sourceSwitchTo(type) {
        this.source = type;
        this.chartRepaint();
      },
      chartRepaint() {
        const data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');
        data.addColumn('number', 'Driving');
        data.addColumn({type: 'string', role: 'tooltip'});
        data.addColumn('number', 'Standstill');
        data.addColumn({type: 'string', role: 'tooltip'});

        (this.payload || []).forEach(e => {
          const driveDuration = moment.duration(e[this.driveDurationKey], 's'),
            stayDuration = moment.duration(e[this.stayDurationKey], 's');
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
          hAxis: {textPosition: 'none', baselineColor: 'none', gridlines: {color: 'none'}},
          isStacked: true,
          legend: {position: 'in', maxLines: 3, alignment: 'center'},
          theme: 'maximized',
          vAxis: {viewWindowMode: 'explicit', gridlines: {color: 'none'}}
        });
      }
    },

    computed: {
      timeStandstill() {
        return moment.duration(_.sumBy(this.payload, this.stayDurationKey), 's').humanize();
      },
      timeDrive() {
        return moment.duration(_.sumBy(this.payload, this.driveDurationKey), 's').humanize();
      },
      stayDurationKey() {
        return `${this.source}StayDurationS`;
      },
      driveDurationKey() {
        return `${this.source}DriveDurationS`;
      }
    }
  }
</script>
