<template>
  <div style="width: 400px; height: 400px;"></div>
</template>

<script>
  export default {
    name: 'leaflet',
    data() {
      return {instance: null};
    },
    computed: {
      isAuthenticated() {
        return this.$store.getters['authentication/isAuthenticated'];
      }
    },
    mounted() {
      this.instance = L.map(this.$el, {
        attributionControl: false,
        center: [48.1223046, 11.5620394],
        zoom: 13
      });

      this.instance.addLayer(
        L.tileLayer(
          'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoidHhua2siLCJhIjoiY2pkeGZtMHNmMmF6MjMzcGR2MHdwZ3I1YyJ9.o'
              + '7Pih5pcqxhAz0DVgGGG5g'
          }
        )
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
