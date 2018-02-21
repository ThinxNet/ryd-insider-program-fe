<template>
  <div class="tile">
    <div class="tile is-parent is-4">
      <div class="tile is-parent">
        <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>

        <div v-if="entry" class="card tile is-child">
          <div class="card-image">
            <leaflet></leaflet>
          </div>
          <div class="card-content">
            <div class="content">
              <p>
                <time :datetime="datetime">{{ duration }}</time>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Leaflet from '../Leaflet';

  export default {
    name: 'widget-thing-session-last',
    props: {entity: Object},
    components: {Leaflet},
    data() {
      return {loading: true, entry: null};
    },
    async mounted() {
      try {
        const response = await this.$store.getters['common/apiInsiderProgram']
          .get(`sessions`, {page: {limit: 1}});
        this.entry = response.data[0];
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    methods: {
    },
    computed: {
      duration() {
        return moment.duration(this.entry.end - this.entry.start, 's').humanize();
      },
      datetime() {
        return moment(moment.unix(this.entry.end)).format()
      }
    }
  }
</script>
