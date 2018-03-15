<template>
  <div></div>
</template>

<script>
  import _ from 'lodash';

  export default {
    name: 'leaflet',
    props: {tileConfig: Object},
    data() {
      return {instance: null};
    },
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

      this.instance = L.map(this.$el, {
        attributionControl: false,
        center: [48.1223046, 11.5620394],
        zoom: 18
      });

      this.instance.addLayer(
        L.tileLayer(
          'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
          tileConfig
        ).on('load', () => this.$emit('tileLoaded', this.instance))
      );

      this.instance.whenReady(() => this.$emit('ready', this.instance));

      this.$emit('init', this.instance);
    },
    methods: {
      async logout() {
        try {
          await this.$store.getters['common/apiTankTaler'].authLogout();
          this.$store.dispatch('authentication/logout');
          this.$router.push({name: 'login'});
        } catch (e) { console.error(e); }
      }
    }
  };
</script>
