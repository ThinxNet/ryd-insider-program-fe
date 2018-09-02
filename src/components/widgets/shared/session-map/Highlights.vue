<script>
  // @onReadyStateChanged(true|false, events)
  export default {
    name: 'session-map-highlights',
    template: '<div></div>',
    props: {
      highlights: {required: true, type: Array},
      locations: {required: true, type: Array}
    },
    data: () => ({api: null, group: null}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
      this.group = L.layerGroup();
    },
    beforeDestroy() {
      this.$parent.instance.removeLayer(this.group);
    },
    watch: {
      loading(current) {
        this.$emit('onReadyStateChanged', !current, this.events);
      },
      locations() {
        this.group.clearLayers();
        if (!this.$parent.instance.hasLayer(this.group)) {
          this.$parent.instance.addLayer(this.group);
        }
      },
      highlights(current) {
        this.group.clearLayers();
        if (!current.length) { return; }

        const location = this.locations.find(location => location._id === current[0]);
        if (!location || !location.coordinates.length) { return; }

        if (location.coordinates.length > 1) {
          this.group.addLayer(L.polyline(location.coordinates, {color: '#ff3860', weight: 10}));
          return;
        }

        this.group.addLayer(
          L.circle(location.coordinates[0], {
            color: '#ff3860',
            fillColor: '#FFF',
            fillOpacity: 0.5,
            radius: 20, weight: 15
          })
        );
      }
    }
  }
</script>
