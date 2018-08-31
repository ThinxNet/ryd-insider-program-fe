<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>
  <leaflet v-else
    @init.once="leafletInit"
    @tileLoaded.once="baseTileLoaded"
    :tileConfig="tileConfig"><slot></slot></leaflet>
</template>

<script>
  import Leaflet from '../../Leaflet';
  import moment from 'moment';

  // @onLocationsChanged([])
  // @onMapInit(map)
  // @onMapReady(map)
  // @onReadyStateChanged(boolean)
  export default {
    name: 'session-map',
    components: {Leaflet},
    props: {
      config: Object,
      highlights: Array,
      polylineSource: {default: 'gps', type: String},
      sessionId: {type: String, required: true},
      uiControls: {default: false, type: Boolean}
    },
    data: () => ({
      events: [],
      highlightGroup: null,
      loading: true,
      locations: [],
      map: null,
      polyline: null,
      session: null
    }),

    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
      this.polyline = L.polyline([], {color: '#039be5', interactive: false, weight: 3});
      this.highlightGroup = L.layerGroup();
    },

    mounted() {
      this.fetchData(this.sessionId, this.polylineSource);
    },

    watch: {
      highlights(current) {
        if (!this.map.hasLayer(this.highlightGroup)) {
          this.map.addLayer(this.highlightGroup);
        }

        this.highlightGroup.clearLayers();
        if (!current.length) { return; }

        const location = this.locations.find(location => location._id === current[0]);
        if (!location || !location.coordinates.length) { return; }

        if (location.coordinates.length > 1) {
          this.highlightGroup
            .addLayer(L.polyline(location.coordinates, {color: '#ff3860', weight: 10}));
          return;
        }

        this.highlightGroup.addLayer(
          L.circle(location.coordinates[0], {
            color: '#ff3860',
            fillColor: '#FFF',
            fillOpacity: 0.5,
            radius: 20, weight: 15
          })
        );
      },
      loading(current) {
        this.$emit('onReadyStateChanged', !current);
      },
      polylineSource(currentSource) {
        this.fetchData(this.sessionId, currentSource);
      },
      sessionId(currentId) {
        this.fetchData(currentId, this.polylineSource);
      }
    },

    methods: {
      async fetchData(id, source) {
        this.loading = true;
        try {
          const results = await Promise.all([
            this.api.session(id),
            //this.api.sessionLocations(id, {source}),
            //this.api.sessionEvents(id)
          ]);
          this.session = results[0].data;
          //this.locations = results[1].data;
          //this.events = results[1].data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }

        /*this.polyline
          .setLatLngs(_(this.locations).map('coordinates').flatten().map(Array.reverse).value());*/

        //this.$emit('onLocationsChanged', this.locations);
      },
      leafletInit(instance) {
        this.map = instance;
        this.$emit('onMapInit', instance);
      },
      baseTileLoaded(instance) {
        /*const iconParking = L.marker(
          _.last(this.polyline.getLatLngs()), {
            icon: L.AwesomeMarkers.icon({icon: 'logo-model-s', markerColor: 'green'}),
            interactive: false
          }
        );*/
        const layers = {/*'Trip': this.polyline*/},
          groups = {/*'Parking': iconParking*/};

        // show all by default
        _.keys(layers).forEach(key => instance.addLayer(layers[key]));
        _.keys(groups).forEach(key => instance.addLayer(groups[key]));


        if (this.uiControls) {
          instance.addControl(L.control.layers(layers, groups, {hideSingleBase: true}));
        }

        //instance.fitBounds(this.polyline.getBounds());

        this.$emit('onMapReady', instance);
      },

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
