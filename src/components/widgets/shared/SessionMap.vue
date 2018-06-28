<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>
  <leaflet v-else
    @init.once="leafletInit" @tileLoaded.once="baseTileLoaded"
    :tileConfig="tileConfig"></leaflet>
</template>

<script>
  import Leaflet from '../../Leaflet';

  // @onLocationsChanged([])
  // @onMapInit(map)
  // @onMapReady(map)
  // @onReadyStateChanged(boolean)
  export default {
    name: 'session-map',
    components: {Leaflet},
    props: {
      config: Object,
      polylineSource: {default: 'gps', type: String},
      sessionId: String
    },
    data: () => ({
      api: null,
      loading: true,
      locations: [],
      polyline: null,
      session: null
    }),

    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
      this.polyline = L.polyline([], {color: '#039be5', interactive: false});
    },

    mounted() {
      this.fetchData(this.sessionId, this.polylineSource);
    },

    watch: {
      polylineSource(currentSource) {
        this.fetchData(this.sessionId, currentSource);
      },
      sessionId(currentId) {
        this.fetchData(currentId, this.polylineSource);
      },
      loading(current) {
        this.$emit('onReadyStateChanged', !current);
      }
    },

    methods: {
      async fetchData(id, source) {
        this.loading = true;
        try {
          const results = await Promise.all([
            this.api.sessionsFetchOne(id),
            this.api.sessionLocations(id, {source})
          ]);
          this.session = results[0].data;
          this.locations = results[1].data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
        this.polyline.setLatLngs(this.locations.map(s => s.coordinate.reverse()));

        // @todo! missing session id change
        this.$emit('onLocationsChanged', this.locations);
      },
      leafletInit(instance) {
        this.$emit('onMapInit', instance);
      },
      baseTileLoaded(instance) {
        const layers = {'Trip': this.polyline};
        const iconParking = L.marker(
          _.last(this.polyline.getLatLngs()), {
            icon: L.AwesomeMarkers.icon({icon: 'logo-model-s', markerColor: 'green'}),
            interactive: false
          }
        );

        instance.addLayer(this.polyline);
        instance.addLayer(iconParking);

        /*instance.addControl(
          L.control.layers(layers, {'Parking': iconParking}, {hideSingleBase: true})
        );*/

        instance.fitBounds(this.polyline.getBounds());

        this.$emit('onMapReady', instance);
      }
    },

    computed: {
      tileConfig() {
        return this.config ? this.config : {
          minZoom: 7,
          id: (this.session.statistics.nightDurationS > this.session.statistics.dayDurationS)
            ? 'mapbox.dark' : 'mapbox.light'
        };
      }
    }
  }
</script>
