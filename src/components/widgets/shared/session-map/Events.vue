<script>
  // @onReadyStateChanged(true|false, events)
  export default {
    name: 'session-map-events',
    template: '<div></div>',
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
          this.events = (await this.api.sessionEvents(sessionId)).data || [];
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
