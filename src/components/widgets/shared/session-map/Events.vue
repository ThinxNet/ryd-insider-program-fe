<script>
  // @onReadyStateChanged(true|false, events)
  export default {
    template: '<div></div>',
    name: 'session-map-events',
    props: {sessionId: {type: String, required: true}},
    data: () => ({api: null, events: [], loading: true}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    watch: {
      loading(current) {
        this.$emit('onReadyStateChanged', !current, this.events);
      }
    },
    mounted() {
      this.fetchData(this.sessionId);
    },
    methods: {
      async fetchData(sessionId) {
        this.loading = true;

        try {
          const response = await this.api.sessionEvents(sessionId);
          if (response.data) {
            this.events = response.data;
          }
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

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
                  <br>Duration: ${event.payload.durationS} s.
                  <br>Strength: ${_.round(event.payload.maxAccCmS2 / 980.665, 2)} g
                  <br>Starting speed: ${event.payload.startingSpeedKmH} km/h.
                `
              )
          );
        });
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
    }
  }
</script>
