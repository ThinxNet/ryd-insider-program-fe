<template>
  <article class="tile is-child is-radiusless box" style="position: relative;">
    <span v-if="loading" class="icon is-large"><i class="ion-ios-time"></i></span>

    <div v-else class="columns is-gapless">
      <div class="column is-4" style="margin-top: 8px">
        <div class="level">
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">Last 4 Weeks</p>
              <p class="title">{{ summaryCountRides }}</p>
              <p class="tag is-white">Total Rides</p>
              <p class="title is-size-4">{{ summaryDistanceM }}</p>
              <p class="tag is-white">
                Distance&nbsp;<span class="has-text-grey-light">(km)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-8">
        <table class="table is-narrow is-striped is-fullwidth">
          <tr class="is-size-7">
            <td class="has-text-grey-light">Mon</td>
            <td class="has-text-grey-light">Tue</td>
            <td class="has-text-grey-light">Wed</td>
            <td class="has-text-grey-light">Thu</td>
            <td class="has-text-grey-light">Fri</td>
            <td class="has-text-grey-light">Sat</td>
            <td class="has-text-grey-light">Sun</td>
          </tr>
          <tr v-for="subset in calendarEntries.results">
            <td v-for="entry in subset"
              class="is-paddingless has-text-centered"
              style="border-bottom-width: 0;">
              <span
                :title="calendarEntryTitle(entry)"
                :style="{
                  height: '10px',
                  width: '10px',
                  display: 'inline-block',
                  backgroundColor: calendarEntryBgColor(entry, calendarEntries.top)
                }"></span>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div class="buttons has-addons is-centered" v-if="isSourceModeAdvanced">
      <span v-for="type in ['obd', 'geo', 'gps', 'mixed']"
        @click="sourceSwitchTo(type)"
        :class="['button', 'is-small', source === type ? 'is-primary is-active' : '']">
          {{ type.toUpperCase() }}
      </span>
    </div>
    <hr v-else>

    <div class="columns">
      <div class="column is-four-fifths is-paddingless has-text-right">
        <div v-if="payload.length" class="content">
          You've spent <span class="tag">{{ timeDrive }}</span> in the car <br>
          and <span class="tag">{{ timeStandstill }}</span> at lights and in traffic jams.
        </div>
      </div>
      <div class="column has-text-right">
        <dropdown v-once @onEntryChange="sourceModeSwitch" :active-idx="0" :entry-list="[
          {title: 'Simple mode', value: 'simple'},
          {title: 'Advanced mode', value: 'advanced'}
        ]"/>
      </div>
    </div>

    <feedback style="position: absolute; bottom: 0; left: 0;"
      :widget-version="widgetVersion"
      :widget-id="widgetId"
      :debug-payload="widgetDebugPayload()"/>
  </article>
</template>

<script>
  import _ from 'lodash';
  import moment from 'moment';

  import Dropdown from './shared/Dropdown';
  import Feedback from './shared/Feedback';
  import Widget from '../../lib/mixins/widget'

  export default {
    name: 'widget-thing-activity',
    props: {thingId: String},
    components: {Dropdown, Feedback},
    mixins: [Widget],
    data: () => ({api: null, loading: true, payload: [], source: 'mixed', sourceMode: 'simple'}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.fetchData(this.thingId)
    },
    watch: {
      thingId(current) {
        this.fetchData(current);
      }
    },
    methods: {
      async fetchData(thingId) {
        this.loading = true;
        try {
          const response = await this.api.statisticsActivity(thingId);
          this.payload = response.data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      },
      sourceSwitchTo(type) {
        this.source = type;
      },
      sourceModeSwitch(mode) {
        this.sourceMode = mode;
        if (!this.isSourceModeAdvanced) {
          this.sourceSwitchTo('mixed');
        }
      },
      colorIncreaseBrightness(hex, percent) {
        return '#' + _(hex.replace('#', '')).chunk(2)
          .map(v => parseInt(v.join(''), 16))
          .map(v => ((0 | (1 << 8) + v + (256 - v) * percent / 100).toString(16))
          .substr(1)).join('');
      },
      calendarEntryTitle(entry) {
        if (!entry) {
          return _.isUndefined(entry) ? '' : 'No trips';
        }
        const standstill = moment
          .duration(entry.durationS - entry[this.keyDriveDuration], 's')
          .humanize();
        return `${moment().dayOfYear(entry.dayOfYear).format("L")}\n`
          + `Trips: ${entry.count}\n`
          + `Distance: ${_.round(entry[this.keyDistance] / 1000, 1)} km.\n`
          + `Moving: ${moment.duration(entry[this.keyDriveDuration], 's').humanize()}\n`
          + `Stay: ${standstill}`;
      },
      calendarEntryBgColor(entry, top) {
        const count = _.isUndefined(entry) ? -1 : _.get(entry, 'count', 0),
          color = '#FFFFFF',
          percent = Math.ceil(count / (top * 0.01));
        if (count > -1) {
          return (percent < 1) ? '#EBEDF0' :
            ((percent > 99) ? '#0099FF' : this.colorIncreaseBrightness('#209CEE', 100 - percent));
        }
        return color;
      }
    },
    computed: {
      widgetDebugData() {
        return _(this.$data).merge(this.$props).omit(['payload', 'api']).value();
      },
      calendarEntries() {
        const start = moment().startOf('day').subtract(28, 'd'),
          output = {results: [], top: _(this.payload).map('count').max()};

        let buffer = [];
        for (let i = 0; i <= 28; i++) {
          const current = start.clone().add(i, 'd'),
            weekday = current.weekday(),
            dayOfYear = current.dayOfYear();
          buffer[weekday] = this.payload.find(e => e.dayOfYear === dayOfYear) || null;
          if (weekday === 6 || i === 28) {
            output.results.push(buffer);
            buffer = [];
          }
        }

        return output;
      },
      isSourceModeAdvanced() {
        return this.sourceMode === 'advanced';
      },
      summaryCountRides() {
        return _.sumBy(this.payload, 'count');
      },
      summaryDistanceM() {
        return _.round(_.sumBy(this.payload, this.keyDistance) / 1000, 1);
      },
      timeStandstill() {
        return moment
          .duration(
            _.sumBy(this.payload, 'durationS') - _.sumBy(this.payload, this.keyDriveDuration), 's'
          )
          .humanize();
      },
      timeDrive() {
        return moment.duration(_.sumBy(this.payload, this.keyDriveDuration), 's').humanize();
      },
      keyDriveDuration() {
        return this.source === 'mixed' ? 'driveDurationS' : `${this.source}DriveDurationS`;
      },
      keyDistance() {
        return this.source === 'mixed' ? 'distanceM' : `${this.source}DistanceM`;
      }
    }
  }
</script>
