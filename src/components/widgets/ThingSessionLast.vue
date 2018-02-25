<template>
  <div class="tile">
    <div class="tile is-parent is-4">
      <div class="tile is-parent">
        <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>

        <div v-if="response" class="card tile is-child">
          <div class="card-image">
            <leaflet
              @init="leafletInit" @tileLoaded="leafletReady" :tileConfig="leafletTileConfig"></leaflet>
          </div>
          <div class="card-content">
            <div class="content">
              <p>
                <time :datetime="$moment($moment.unix(this.response.start)).format()">
                  {{ $moment($moment.unix(response.start)).format('LT') }}
                </time>
                &mdash;
                <time :datetime="$moment($moment.unix(this.response.end)).format()">
                  {{ $moment($moment.unix(response.end)).format('LT') }}
                </time>
                <br>
                <span class="tag">{{ $_.ceil(response.statistics.geoDistanceM / 1000, 1) }} km</span>
                for <span class="tag">~{{ $moment.duration(response.statistics.durationS, 's').humanize() }}</span>
                <br>
                Avg. speed was <span class="tag">{{ response.statistics.geoSpeedKmHAvg }} km/h</span>
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
      return {loading: true, response: null};
    },
    async mounted() {
      try {
        const api = this.$store.getters['common/apiInsiderProgram'],
          payload = {filter: {device: this.entity.device}, page: {size: 1}};
        const response = await api.sessionsFetchAll(payload);

        // @todo! pagination and the request format are incorrect
        const response2 = await api.sessionsFetchOne(
          response.data[0]._id,
          {fields: {segments: 'attributes.latitude,attributes.longitude,timestamp'}}
        );
        this.response = response2.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    methods: {
      leafletInit(map) {
        map.zoomControl.remove();
        map._handlers.forEach(h => h.disable());
      },
      leafletReady(map) {
        const polyline = L.polyline([], {color: '#039be5', interactive: false}),
          coords = this.response.segments
            .filter(s => _.has(s, 'attributes.latitude'))
            .map(s => [s.attributes.latitude, s.attributes.longitude]);
        polyline.setLatLngs(coords);
        map.addLayer(polyline);
        map.fitBounds(polyline.getBounds());
      }
    },
    computed: {
      leafletTileConfig() {
        return {
          id: (this.response.statistics.nightDurationS > this.response.statistics.dayDurationS)
            ? 'mapbox.dark' : 'mapbox.streets'
        };
      }
    }
  }
</script>
