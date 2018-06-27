<template>
  <article class="tile is-child">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else-if="paginationEntry" class="card">
      <div class="card-image" style="height: 450px;">
        <session-map style="height: 450px"
          :config="mapConfig"
          :polylineSource="source === 'map' ? 'map' : 'gps'"
          :sessionId="paginationEntry._id" v-if="paginationEntry._id"
          @onLocationsChanged="mapLocationsChange"
          @onReadyStateChanged="mapReadyStateChange"></session-map>
      </div>
      <div class="card-content">
        <div class="content">
          <div class="columns">
            <div class="column">
              <div class="buttons has-addons is-centered">
                <span class="button is-small"
                  @click="sourceSwitchTo('obd')" :class="sourceBtnClass('obd')">OBD</span>
                <span class="button is-small"
                  @click="sourceSwitchTo('geo')" :class="sourceBtnClass('geo')">GEO</span>
                <span class="button is-small"
                  @click="sourceSwitchTo('gps')" :class="sourceBtnClass('gps')">GPS</span>
                <span class="button is-small"
                  v-if="paginationEntry.statistics.mapConfidenceAvg > 10"
                  @click="sourceSwitchTo('map')" :class="sourceBtnClass('map')"
                  :title="mapMatchingConfidenceHint">MAP</span>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <time :datetime="$moment(paginationEntry.start).format()">
                {{ $moment(paginationEntry.start).format('L LT') }}
              </time>
              &mdash;
              <time :datetime="$moment(paginationEntry.end).format()">
                {{ $moment(paginationEntry.end).format('LT') }}
              </time>

              <template v-if="source === 'map' && viaStreets.length">
                <br><small>{{ viaStreets.join(', ') }}</small>
              </template>

              <br>
              <span class="tag">{{ $_.ceil(sessionStatistics.distanceM / 1000, 1) }} km</span>
              for
              <span class="tag">
                ~{{ $moment.duration(sessionStatistics.durationS, 's').humanize() }}
              </span>
              <template v-if="sessionStatistics.speedKmHAvg">
                <br>
                Avg. speed was <span class="tag">{{ sessionStatistics.speedKmHAvg }} km/h</span>
                (max: <span class="tag">{{ sessionStatistics.speedKmHMax }} km/h</span>)
              </template>
            </div>
          </div>

          <div class="columns is-flex">
            <div class="column is-2">
              <span class="tag is-size-7" title="Version"><small>v</small>{{ widgetVersion }}</span>
            </div>

            <!--
            <div class="column is-3">
              <div class="buttons has-addons">
                <router-link :to="{name: 'widget-feedback', params: {direction: 'up'}}"
                  class="button is-size-7"><i class="ion-thumbsup"></i></router-link>
                <router-link :to="{name: 'widget-feedback', params: {direction: 'down'}}"
                  class="button is-size-7"><i class="ion-thumbsdown"></i></router-link>
              </div>
            </div>
            -->

            <div class="column has-text-right is-10 is-unselectable">
              <button @click="paginationGoBackwards"
                :class="['button', 'is-small', {'is-loading': !isMapReady}]"
                :disabled="!paginationHasPrevious">
                  <i class="ion-ios-arrow-back"></i>
              </button>
              <button @click="paginationGoForward"
                :class="['button', 'is-small', {'is-loading': !isMapReady}]"
                :disabled="!paginationHasNext">
                <i class="ion-ios-arrow-forward"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
  import _ from 'lodash';

  import SessionMap from './shared/SessionMap';

  import Pagination from '../../lib/mixins/pagination';
  import Widget from '../../lib/mixins/widget';

  export default {
    name: 'widget-thing-session-list',
    components: {SessionMap},
    mixins: [Pagination, Widget],
    props: {entity: Object},
    data() {
      return {
        api: null,
        isMapBlocked: true,
        loading: true,
        locations: [],
        sessions: [],
        source: null
      };
    },

    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },

    mounted() {
      this.$on('onPaginationChanged', () => {
        this.locations = [];
        if (!this.paginationEntry) { return; }
        this.$emit('onSessionChange', this.paginationEntry._id);
        if (this.source === 'map' && this.paginationEntry.statistics.mapConfidenceAvg <= 10) {
          this.sourceSwitchTo('gps');
        }
      });
      this.fetchData(this.entity);
    },

    watch: {
      entity(current) {
        this.fetchData(current);
      }
    },

    methods: {
      async fetchData(entity) {
        this.loading = true;
        try {
          const payload = {filter: {device: entity.device}, page: {size: 10}},
            response = await this.api.sessionsFetchAll(payload);
          this.sessions = response.data;
          this.paginationResetEntries(this.sessions);
        } catch (e) {
          return console.error(e);
        } finally {
          this.loading = false;
        }
        this.sourceSwitchTo('gps');
      },
      sourceSwitchTo(source) {
        this.source = source.toLowerCase();
      },
      sourceBtnClass(source) {
        return (this.source === source) ? ['is-primary', 'is-active'] : [];
      },
      mapReadyStateChange(flag) {
        this.isMapBlocked = !flag;
      },
      mapLocationsChange(locations) {
        this.locations = locations;
      }
    },

    computed: {
      sessionStatistics() {
        const fields = {
          distanceM: this.paginationEntry.statistics.geoDistanceM,
          durationS: this.paginationEntry.statistics.durationS,
          speedKmHAvg: this.paginationEntry.statistics.geoSpeedKmHAvg,
          speedKmHMax: this.paginationEntry.statistics.geoSpeedKmHMax
        };
        switch (this.source) {
          case 'map':
            fields.distanceM = this.paginationEntry.statistics.mapDistanceM;
            fields.durationS = this.paginationEntry.statistics.mapDurationS;
            fields.speedKmHAvg = this.paginationEntry.statistics.mapSpeedKmHAvg;
            fields.speedKmHMax = this.paginationEntry.statistics.mapSpeedKmHMax;
            break;

          default:
            Object.keys(fields).filter(key => key !== 'durationS').forEach(
              key => fields[key] = this.paginationEntry.statistics[this.source + _.upperFirst(key)]
            );
            break;
        }
        return fields;
      },
      mapConfig() {
        return {
          minZoom: 7,
          id: (this.paginationEntry.statistics.nightDurationS
            > this.paginationEntry.statistics.dayDurationS) ? 'mapbox.dark' : 'mapbox.streets'
        };
      },
      isMapReady() {
        return !this.isMapBlocked;
      },
      viaStreets() {
        const streets = _(this.locations).map('street').reject(_.isEmpty).uniq().value();
        if (!streets.length) {
          return [];
        }
        if (streets.length < 2) {
          return [_.head(streets)];
        }
        if (streets.length < 3) {
          return streets;
        }
        return [
          _.head(streets),
          _.nth(streets, Math.round((streets.length - 1) / 2)),
          _.last(streets)
        ];
      },
      mapMatchingConfidenceHint() {
        return [
          this.paginationEntry.statistics.mapConfidenceAvg + '%',
          this.paginationEntry.statistics.mapHasGaps ? 'with' : 'without',
          'gaps'
        ].join(' ');
      }
    }
  }
</script>
