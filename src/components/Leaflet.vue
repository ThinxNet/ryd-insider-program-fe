<template>
  <div>
    <div ref="leaflet" style="width: 100%; height: 100%"></div>
    <slot></slot>
  </div>
</template>

<script>
  import _ from 'lodash';

  export default {
    props: {tileConfig: Object},
    data: () => ({instance: null}),
    computed: {
      isAuthenticated() {
        return this.$store.getters['authentication/isAuthenticated'];
      }
    },
    mounted() {
      const tileConfig = {
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoidHhua2siLCJhIjoiY2pkeGZtMHNmMmF6MjMzcGR2MHdwZ3I1YyJ9.o'
          + '7Pih5pcqxhAz0DVgGGG5g'
      };

      _.merge(tileConfig, this.tileConfig);

      this.instance = L.map(this.$refs.leaflet, {attributionControl: false});
      this.instance.addLayer(
        L.tileLayer(
          'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
          tileConfig
        ).on('load', () => this.$emit('tileLoaded', this.instance))
      );
      this.instance.whenReady(() => this.$emit('ready', this.instance));

      this.$emit('init', this.instance);
    }
  };
</script>
