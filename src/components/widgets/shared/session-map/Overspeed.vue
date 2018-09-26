<script>
  import _ from 'lodash';
  import moment from 'moment';

  // @onReadyStateChanged(true|false, group)
  export default {
    name: 'session-map-overspeed',
    template: '<div></div>',
    props: {
      sessionId: {type: String, required: true},
      speedSource: {default: 'geo', type: String}
    },
    data: () => ({api: null, entries: [], group: null, loading: true}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
      this.group = L.layerGroup();
    },
    watch: {
      loading(current) {
        this.$emit('onReadyStateChanged', !current, this.group);
      },
      speedSource(source) {
        this.fetchData(this.sessionId, source);
      },
      sessionId(sessionId) {
        this.fetchData(sessionId, this.speedSource);
      }
    },
    mounted() {
      this.fetchData(this.sessionId, this.speedSource);
    },
    beforeDestroy() {
      this.$parent.instance.removeLayer(this.group);
    },
    methods: {
      async fetchData(sessionId, source) {
        this.loading = true;
        try {
          this.entries = (await
            this.api.sessionEnvironmentOverspeed(sessionId, {source})
          ).data || [];
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

        this.redraw();
      },
      redraw() {
        this.group.clearLayers();

        if (!this.entries.length) {
          return;
        }

        this.entries.forEach(entry => {
          const diff = entry.currentSpeedKmH - entry.maxSpeedKmH;
          if (diff <= 0) { return; }

          const level = (diff < 21) ? 0 : (diff < 41) ? 1 : 2,
            lineSettings = {fillOpacity: 0.5, weight: 10},
            colors = [{color: '#FF9F1C'}, {color: '#ED6A5A'}, {color: '#FF3860'}];
          this.group.addLayer(
            L
              .polyline(
                entry.geometry.map(Array.reverse.bind(this)),
                _.merge(lineSettings, colors[level])
              )
              .bindTooltip(
                `<b>${moment(entry.timestamp).format('LTS')}</b><br>
                Speed: ${entry.currentSpeedKmH} km/h<br>
                Limit: ${entry.maxSpeedKmH} km/h`
              )
          );
        });
      }
    }
  }
</script>
