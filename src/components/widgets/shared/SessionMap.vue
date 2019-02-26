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
      :highlights="mapHighlights"
      :locations="mapLocations"/>
    <session-map-overspeed v-if="uiMapOverspeed"
      :session-id="sessionId"
      :speed-source="mapLocationsSource"
      @onReadyStateChanged="mapOverspeedReady"/>
  </leaflet>
</template>

<script>
  import SessionMapEvents from '../shared/session-map/Events';
  import SessionMapHighlights from '../shared/session-map/Highlights';
  import SessionMapLocations from '../shared/session-map/Locations';
  import SessionMapOverspeed from '../shared/session-map/Overspeed';

  import Leaflet from '../../Leaflet';
  import moment from 'moment';

  // @onLocationsChanged([])
  // @onMapInit(map)
  // @onMapReady(map)
  // @onReadyStateChanged(boolean)
  export default {
    name: 'session-map',
    components: {
      Leaflet, SessionMapEvents, SessionMapHighlights, SessionMapLocations, SessionMapOverspeed
    },
    props: {
      mapConfig: Object,
      mapHighlights: Array,
      mapLocationsSource: {default: 'geo', type: String},
      sessionId: {type: String, required: true},
      uiControls: {default: false, type: Boolean},
      uiMapEvents: {default: false, type: Boolean},
      uiMapHighlights: {default: false, type: Boolean},
      uiMapLocations: {default: false, type: Boolean},
      uiMapOverspeed: {default: false, type: Boolean}
    },
    data: () => ({
      loading: true,
      mapControl: null,
      mapElements: [],
      mapInstance: null,
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
      mapElements(current, previous) {
        previous.forEach(obj => this.mapInstance.removeLayer(obj.element));
        current.forEach(obj => this.mapInstance.addLayer(obj.element));

        if (!this.uiControls) {
          return;
        }

        const layers = _(current).pickBy({type: 'layer'})
          .transform((r, v) => r[v.title] = v.element).value();
        const groups = _(current).reject({type: 'layer'}).sortBy('title').groupBy('type')
          .reduce((result, value) => {
            value.forEach(v => {
              if (!result[v.title]) {
                result[v.title] = L.layerGroup().addTo(this.mapInstance);
              }
              result[v.title].addLayer(v.element);
            });
            return result;
          }, {});

        if (this.mapControl) {
          this.mapInstance.removeControl(this.mapControl);
        }
        this.mapControl = L.control
          .layers(layers, groups, {hideSingleBase: true})
          .addTo(this.mapInstance);
      },
      sessionId(current) {
        this.mapElements = [];
        this.mapLocations = [];
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
        this.$emit('onMapReady', instance);
      },
      mapEventsReady(isReady, events) {
        if (!isReady || !events.length) { return; }

        const entries = [];
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

          entries.push({element: marker, title: icon.title, type: 'event'});
        }

        this.mapElements = _(this.mapElements).reject({type: 'event'}).concat(entries).value();
      },
      mapOverspeedReady(isReady, lGroup) {
        if (!isReady) { return; }

        this.mapElements = _.reject(this.mapElements, {type: 'overspeed'});

        if (lGroup.getLayers().length > 0) {
          this.mapElements.push({element: lGroup, title: 'Over-speed', type: 'overspeed'});
        }
      },
      mapLocationsReady(isReady, locations) {
        if (!isReady || !locations.length) { return; }

        const polyline = L.polyline([], {color: '#039be5', interactive: false, weight: 4});
        polyline.setLatLngs(_(locations).map('coordinates').flatten().map(Array.reverse).value());

        const iconParking = L.marker(
          _.last(polyline.getLatLngs()), {
            icon: L.AwesomeMarkers.icon({icon: 'logo-model-s', markerColor: 'green'}),
            interactive: false
          }
        );

        const fitBounds = !this.mapLocations.length,
          entries = [
            {element: iconParking, title: 'Parking', type: 'parking'},
            {element: polyline, title: 'Trip', type: 'layer'}
          ];

        this.mapElements = _(this.mapElements)
          .reject(v => _.map(entries, 'type').includes(v.type))
          .concat(entries).value();
        this.mapLocations = locations;

        if (fitBounds) {
          this.mapInstance.fitBounds(polyline.getBounds());
        }

        this.$emit('onLocationsChanged', locations);
      },
      eventTypeIcon(type) {
        return {
          ACCELERATION:
            {bg: 'orange', fg: '#FFF', id: 'ios-speedometer', title: 'Acceleration'},
          ACC_HARD_CURVE_LEFT:
            {bg: 'cadetblue', fg: '#FFF', id: 'ios-undo', title: 'Hard curve (left)'},
          ACC_HARD_CURVE_RIGHT:
            {bg: 'cadetblue', fg: '#FFF', id: 'ios-redo', title: 'Hard curve (right)'},
          HARD_BRAKING:
            {bg: 'darkred', fg: '#FFF', id: 'ios-warning', title: 'Hard braking'},
        }[type] || {id: 'ios-help-circle', bg: 'white', fg: 'black', title: 'Unknown'};
      }
    },
    computed: {
      tileConfig() {
        const dayDuration = this.session.statistics.durationS
          - this.session.statistics.nightDurationS;
        return this.config ? this.config : {
          minZoom: 7,
          zoom: 7,
          id: (this.session.statistics.nightDurationS > dayDuration)
            ? 'mapbox.dark' : 'mapbox.light'
        };
      }
    }
  }
</script>
