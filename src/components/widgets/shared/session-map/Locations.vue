<script>
  // @onReadyStateChanged(true|false, locations)
  export default {
    name: 'session-map-locations',
    template: '<div></div>',
    props: {
      sessionId: {type: String, required: true},
      source: {default: 'gps', type: String}
    },
    data: () => ({api: null, loading: true, locations: []}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    watch: {
      loading(current) {
        this.$emit('onReadyStateChanged', !current, this.locations);
      },
      source(current) {
        this.fetchData(this.sessionId, current);
      }
    },
    mounted() {
      this.fetchData(this.sessionId, this.source);
    },
    methods: {
      async fetchData(sessionId, source) {
        this.loading = true;
        try {
          this.locations = (await
            this.api.sessionLocations(
              sessionId, {source: ['mixed', 'map'].includes(source) ? source : 'gps'}
            )
          ).data || [];
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      }
    }
  }
</script>
