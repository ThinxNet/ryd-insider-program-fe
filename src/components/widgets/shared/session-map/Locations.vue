<script>
  // @onReadyStateChanged(true|false, polyline)
  export default {
    template: '<div></div>',
    name: 'session-map-locations',
    props: {
      polylineConfig: {
        default: () => ({color: '#039be5', interactive: false, weight: 3}),
        type: Object
      },
      sessionId: {type: String, required: true},
      source: {default: 'gps', type: String}
    },
    data: () => ({
      api: null,
      loading: true,
      locations: [],
      polyline: null
    }),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
      this.polyline = L.polyline([], this.polylineConfig);
    },
    watch: {
      loading(current) {
        this.$emit('onReadyStateChanged', !current, this.polyline);
      }
    },
    mounted() {
      this.fetchData(this.sessionId, this.source);
    },
    beforeDestroy() {
      this.$parent.instance.removeLayer(this.polyline);
    },
    methods: {
      async fetchData(sessionId, source) {
        this.loading = true;

        try {
          const response = await this.api.sessionLocations(sessionId, {source});
          if (response.data) {
            this.locations = response.data;
            this.polyline
              .setLatLngs(_(this.locations).map('coordinates').flatten().map(Array.reverse).value());
          }
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

        this.$parent.instance.addLayer(this.polyline);
      }
    }
  }
</script>
