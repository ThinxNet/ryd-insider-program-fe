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
      polylineSource: {default: 'gps', type: String},
      sessionId: String
    },
    data: () => ({
      api: null,
      events: [],
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
            this.api.session(id),
            this.api.sessionLocations(id, {source}),
            this.api.sessionEvents(id)
          ]);
          this.session = results[0].data;
          this.locations = results[1].data;
          this.events = results[2].data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }

        this.polyline.setLatLngs(
          _(this.locations).map('coordinates').flatten().map(Array.reverse).value()
        );

        // @todo! missing session id change
        this.$emit('onLocationsChanged', this.locations);
      },
      leafletInit(instance) {
        this.$emit('onMapInit', instance);
      },
      baseTileLoaded(instance) {
        const iconParking = L.marker(
          _.last(this.polyline.getLatLngs()), {
            icon: L.AwesomeMarkers.icon({icon: 'logo-model-s', markerColor: 'green'}),
            interactive: false
          }
        );
        const layers = {'Trip': this.polyline},
          groups = {'Parking': iconParking};

        this.events.forEach(event => {
          const icon = this.eventTypeIcon(event.type);
          if (!groups[icon.title]) {
            groups[icon.title] = L.layerGroup();
          }
          groups[icon.title].addLayer(
            L
              .marker(
                [event.payload.latitude, event.payload.longitude], {
                  icon: L.AwesomeMarkers
                    .icon({icon: icon.id, markerColor: icon.bg, iconColor: icon.fg})
                }
              )
              .bindTooltip(
                `
                  <b>${icon.title}</b>
                  <br>${moment(event.timestamp).format('LTS')}
                  <br>Duration: ${event.payload.durationS}s.
                  <br>Starting speed: ${event.payload.startingSpeedKmH} km/h.
                `
              )
          );
        });

        // show all by default
        _.keys(layers).forEach(key => instance.addLayer(layers[key]));
        _.keys(groups).forEach(key => instance.addLayer(groups[key]));

        instance.addControl(L.control.layers(layers, groups, {hideSingleBase: true}));
        instance.fitBounds(this.polyline.getBounds());

        this.$emit('onMapReady', instance);
      },
      eventTypeIcon(type) {
        return {
          ACC_HARD_CURVE_LEFT:
            {bg: 'orange', fg: '#FFF', id: 'ios-undo', title: 'Hard curve (left)'},
          ACC_HARD_CURVE_RIGHT:
            {bg: 'orange', fg: '#FFF', id: 'ios-redo', title: 'Hard curve (right)'},
          HARD_BRAKING:
            {id: 'ios-warning', bg: 'darkred', fg: '#FFF', title: 'Hard braking'},
        }[type] || {id: 'ios-help-circle', bg: 'white', fg: 'black', title: 'Unknown'};
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
