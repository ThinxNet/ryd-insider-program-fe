<template>
  <div class="tile is-parent">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <article v-else class="tile is-child">
      <p class="title">Middle box</p>
      <p class="subtitle">With an image</p>
      <figure class="image is-4by3">
        <img src="https://bulma.io/images/placeholders/640x480.png">
      </figure>
    </article>
  </div>
</template>

<script>
  export default {
    name: 'widget-thing-charts',
    props: {entity: Object},
    data() {
      return {loading: true};
    },
    async mounted() {
      try {
        await this.$store.getters['common/apiInsiderProgram'].get(`thing/${this.entity.id}`);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    methods: {
    }
  }
</script>
