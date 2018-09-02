<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>
  <leaflet v-else
    @init.once="leafletInit"
    @tileLoaded.once="baseTileLoaded"
    :tileConfig="tileConfig">
    <session-map-locations v-if="uiMapLocations"
      :map-fit-bounds="true"
      :session-id="sessionId"
      :source="mapLocationsSource"
      @onReadyStateChanged="mapLocationsReady"/>
    <session-map-events v-if="uiMapEvents"
      :session-id="sessionId"
      @onReadyStateChanged="mapEventsReady"/>
    <session-map-highlights v-if="uiMapHighlights"
      :locations="mapLocations"
      :highlights="mapHighlights"/>
  </leaflet>
</template>

<script>
  import SessionMapEvents from '../shared/session-map/Events';
  import SessionMapHighlights from '../shared/session-map/Highlights';
  import SessionMapLocations from '../shared/session-map/Locations';

  import Leaflet from '../../Leaflet';
  import moment from 'moment';

  // @onLocationsChanged([])
  // @onMapInit(map)
  // @onMapReady(map)
  // @onReadyStateChanged(boolean)
  export default {
    name: 'session-map',
    components: {Leaflet, SessionMapEvents, SessionMapHighlights, SessionMapLocations},
    props: {
      mapConfig: Object,
      mapHighlights: Array,
      mapLocationsSource: {default: 'geo', type: String},
      sessionId: {type: String, required: true},
      uiControls: {default: false, type: Boolean},
      uiMapEvents: {default: false, type: Boolean},
      uiMapHighlights: {default: false, type: Boolean},
      uiMapLocations: {default: false, type: Boolean}
    },
    data: () => ({
      loading: true,
      mapControl: null,
      mapGroups: {},
      mapInstance: null,
      mapLayers: {},
      mapLocations: [],
      session: null
    }),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.fetchData(this.sessionId);
    },
    watch: {
      loading(current) {
        this.$emit('onReadyStateChanged', !current);
      },
      sessionId(current) {
        this.fetchData(current);
      }
    },
    methods: {
      async fetchData(id) {
        this.loading = true;
        try {
          const results = await this.api.session(id);
          if (results.data) {
            this.session = results.data;
          }
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      },
      leafletInit(instance) {
        this.mapInstance = instance;
        this.$emit('onMapInit', instance);
      },
      baseTileLoaded(instance) {
        if (this.uiControls && !this.mapControl) {
          this.mapControl = L.control
            .layers(this.mapLayers, this.mapGroups, {hideSingleBase: true})
            .addTo(instance);
        }
        this.$emit('onMapReady', instance);
      },
      mapEventsReady(isReady, events) {
        if (!isReady || !events.length) { return; }

        for (const event of events) {
          const icon = this.eventTypeIcon(event.type),
            marker = L
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
                  <br>Duration: ${event.payload.durationS} s.
                  <br>Strength: ${_.round(event.payload.maxAccCmS2 / 980.665, 2)} g
                  <br>Starting speed: ${event.payload.startingSpeedKmH} km/h.
                `
              );

          if (!this.mapGroups[icon.title]) {
            this.mapGroups[icon.title] = L.layerGroup().addTo(this.mapInstance);
          }
          this.mapGroups[icon.title].addLayer(marker.addTo(this.mapInstance));
        }
      },
      mapLocationsReady(isReady, locations) {
        if (!isReady) { return; }

        _(this.mapGroups).extend(this.mapLayers).values()
          .forEach(v => this.mapInstance.removeLayer(v));

        if (!locations.length) { return; }

        const polyline = L.polyline([], {color: '#039be5', interactive: false, weight: 4})
          .setLatLngs(_(locations).map('coordinates').flatten().map(Array.reverse).value());
        const iconParking = L.marker(
          _.last(polyline.getLatLngs()), {
            icon: L.AwesomeMarkers.icon({icon: 'logo-model-s', markerColor: 'green'}),
            interactive: false
          }
        );

        this.mapGroups['Parking'] = iconParking.addTo(this.mapInstance);
        this.mapLayers['Trip'] = polyline.addTo(this.mapInstance);
        this.mapLocations = locations;

        this.mapInstance.fitBounds(polyline.getBounds());

        this.$emit('onLocationsChanged', locations);
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
