<template>
  <div class="tile">
    <div class="tile is-parent is-4">
      <div class="tile is-parent">
        <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>

        <div v-if="session" class="card tile is-child">
          <div class="card-image">
            <leaflet v-if="(locations.length > 0)"
              @init.once="leafletInit"
              @tileLoaded.once="leafletReady"
              :tileConfig="leafletTileConfig"></leaflet>
          </div>
          <div class="card-content">
            <div class="content">
              <div class="buttons has-addons">
                <span class="button"
                  @click="sourceSwitchTo('obd')" :class="sourceBtnClass('obd')">OBD</span>
                <span class="button"
                  @click="sourceSwitchTo('geo')" :class="sourceBtnClass('geo')">GEO</span>
                <span class="button"
                  @click="sourceSwitchTo('gps')" :class="sourceBtnClass('gps')">GPS</span>
                <span class="button"
                  @click="sourceSwitchTo('map')" :class="sourceBtnClass('map')">MAP</span>
              </div>
              <p>
                <time :datetime="$moment(session.start).format()">
                  {{ $moment(session.start).format('LT') }}
                </time>
                &mdash;
                <time :datetime="$moment(session.end).format()">
                  {{ $moment(session.end).format('LT') }}
                </time>
                <br>
                <span class="tag">{{ $_.ceil(sessionStatistics.distanceM / 1000, 1) }} km</span>
                for
                <span class="tag">
                  ~{{ $moment.duration(sessionStatistics.durationS, 's').humanize() }}
                </span>
                <br>
                Avg. speed was <span class="tag">{{ sessionStatistics.speedKmHAvg }} km/h</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Leaflet from '../Leaflet';
  import _ from 'lodash';

  export default {
    name: 'widget-thing-session-last',
    props: {entity: Object},
    components: {Leaflet},
    data() {
      return {loading: true, locations: [], polyline: null, session: null, source: null};
    },
    async mounted() {
      this.polyline = L.polyline([], {color: '#039be5', interactive: false});

      try {
        const api = this.$store.getters['common/apiInsiderProgram'],
          payload = {filter: {device: this.entity.device}, page: {size: 1}},
          response = await api.sessionsFetchAll(payload);
        this.session = response.data[0];
      } catch (e) {
        return console.error(e);
      } finally {
        this.loading = false;
      }

      this.sourceSwitchTo('gps');
    },
    watch: {
      async source(current, previous) {
        if (['obd', 'geo'].includes(current)) {
          return;
        }

        let locations = [];
        try {
          locations = (await this.$store.getters['common/apiInsiderProgram']
            .sessionLocationsFetchAll(this.session._id, {source: this.source})).data;
        } catch (e) {
          return console.error(e);
        }
        this.polyline.setLatLngs(locations.map(s => s.coordinate.reverse()));
        this.locations = locations;
      }
    },
    methods: {
      leafletInit(map) {
        map.zoomControl.remove();
        map._handlers.forEach(h => h.disable());
      },
      leafletReady(map) {
        map.addLayer(this.polyline);
        map.addLayer(
          L.marker(
            _.last(this.polyline.getLatLngs()), {
              icon: L.AwesomeMarkers.icon({icon: 'model-s', markerColor: 'green'}),
              interactive: false
            }
          )
        );
        map.fitBounds(this.polyline.getBounds());
      },
      sourceSwitchTo(source) {
        this.source = source.toLowerCase();
      },
      sourceBtnClass(source) {
        return (this.source === source) ? ['is-primary', 'is-active'] : [];
      }
    },
    computed: {
      leafletTileConfig() {
        return {
          id: (this.session.statistics.nightDurationS > this.session.statistics.dayDurationS)
            ? 'mapbox.dark' : 'mapbox.streets'
        };
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
      }
    }
  }
</script>
