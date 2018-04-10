<template>
  <article class="tile is-child">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else-if="session" class="card">
      <div class="card-image" style="height: 400px;">
        <leaflet style="height: 400px;" v-if="(locations.length > 0)"
          @init.once="leafletInit"
          @tileLoaded.once="leafletReady"
          :tileConfig="leafletTileConfig"></leaflet>
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
                <span class="button is-small" v-if="session.statistics.mapConfidenceAvg > 60"
                  @click="sourceSwitchTo('map')" :class="sourceBtnClass('map')"
                  :title="session.statistics.mapConfidenceAvg + '%'">MAP</span>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <time :datetime="$moment(session.start).format()">
                {{ $moment(session.start).format('L LT') }}
              </time>
              &mdash;
              <time :datetime="$moment(session.end).format()">
                {{ $moment(session.end).format('LT') }}
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
              </template>
            </div>
          </div>

          <div class="columns is-flex">
            <div class="column is-2">
              <span class="tag is-size-7" title="Version"><small>v</small>{{ widgetVersion }}</span>
            </div>
            <div class="column is-3">
              <div class="buttons has-addons">
                <router-link :to="{name: 'widget-feedback', params: {direction: 'up'}}"
                  class="button is-size-7"><i class="ion-thumbsup"></i></router-link>
                <router-link :to="{name: 'widget-feedback', params: {direction: 'down'}}"
                  class="button is-size-7"><i class="ion-thumbsdown"></i></router-link>
              </div>
            </div>
            <div class="column has-text-right is-7">
              <button @click="sessionNavigate('back')"
                :class="['button', 'is-small', {'is-loading': leafletBlocked}]"
                :disabled="!sessionHasPrev">
                  <i class="ion-ios-arrow-back"></i>
              </button>
              <button @click="sessionNavigate('forward')"
                :class="['button', 'is-small', {'is-loading': leafletBlocked}]"
                :disabled="!sessionHasNext">
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
  import Leaflet from '../Leaflet';
  import _ from 'lodash';

  import Widget from '../../lib/mixins/widget';

  export default {
    name: 'widget-thing-session-list',
    components: {Leaflet},
    mixins: [Widget],
    props: {entity: Object},
    data() {
      return {
        api: null,
        leafletBlocked: false,
        loading: true,
        locations: [],
        polyline: null,
        sessionIdx: null,
        sessions: [],
        source: null
      };
    },

    mounted() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
      this.polyline = L.polyline([], {color: '#039be5', interactive: false});
      this.entityChange(this.entity);
    },

    watch: {
      source(current, previous) {
        this.updateLocations();
      },

      entity(current, previous) {
        this.entityChange(current);
      }
    },

    methods: {
      leafletInit(map) {
        //map._handlers.forEach(h => h.disable());
      },

      leafletReady(map) {
        map.addLayer(this.polyline);
        map.fitBounds(this.polyline.getBounds());
        map.addLayer(
          L.marker(
            _.last(this.polyline.getLatLngs()), {
              icon: L.AwesomeMarkers.icon({icon: 'model-s', markerColor: 'green'}),
              interactive: false
            }
          )
        );
      },

      async entityChange(entity) {
        this.loading = true;
        try {
          const payload = {filter: {device: entity.device}, page: {size: 10}},
            response = await this.api.sessionsFetchAll(payload);
          this.sessions = response.data;
          this.sessionIdx = 0;
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

      async updateLocations() {
        this.leafletBlocked = true;

        const source = ['obd', 'geo'].includes(this.source) ? 'gps' : this.source;

        let locations = [];
        try {
          locations = (await this.$store.getters['common/apiInsiderProgram']
            .sessionLocations(this.session._id, {source})).data;
        } catch (e) {
          return console.error(e);
        }

        if (source === 'map'
          && (!locations.length || this.session.statistics.mapConfidenceAvg <= 60)) {
          this.sourceSwitchTo('gps');
          return;
        }

        this.$emit('onSessionChange', this.session._id);
        this.locations = locations;
        this.polyline.setLatLngs(locations.map(s => s.coordinate.reverse()));
        this.leafletBlocked = false;
      },

      sessionNavigate(direction) {
        this.locations = [];
        this.sessionIdx += (direction === 'back') ? -1 : 1;
        this.updateLocations();
      }
    },

    computed: {
      sessionHasNext() {
        return (this.sessionIdx < this.sessions.length - 1);
      },

      sessionHasPrev() {
        return this.sessionIdx > 0;
      },

      session() {
        return this.sessions[this.sessionIdx];
      },

      sessionStatistics() {
        const fields = {
          distanceM: this.session.statistics.geoDistanceM,
          durationS: this.session.statistics.durationS,
          speedKmHAvg: this.session.statistics.geoSpeedKmHAvg
        };
        switch (this.source) {
          case 'map':
            fields.distanceM = this.session.statistics.mapDistanceM;
            fields.durationS = this.session.statistics.mapDurationS;
            break;

          case 'gps':
            fields.distanceM = this.session.statistics.gpsDistanceM;
            fields.speedKmHAvg = this.session.statistics.gpsSpeedKmHAvg;
            break;

          case 'obd':
            fields.distanceM = this.session.statistics.obdDistanceM;
            fields.speedKmHAvg = this.session.statistics.obdSpeedKmHAvg;
            break;
        }
        return fields;
      },

      leafletTileConfig() {
        return {
          minZoom: 7,
          id: (this.session.statistics.nightDurationS > this.session.statistics.dayDurationS)
            ? 'mapbox.dark' : 'mapbox.streets'
        };
      },

      viaStreets() {
        const streets = _(this.locations).map('street').reject(_.isEmpty).uniq().value();
        if (!streets.length) {
          return [];
        }
        if (streets.length < 2) {
          return _.head(streets);
        }
        if (streets.length < 3) {
          return streets;
        }
        return [
          _.head(streets),
          _.nth(streets, Math.round((streets.length - 1) / 2)),
          _.last(streets)
        ];
      }
    }
  }
</script>
