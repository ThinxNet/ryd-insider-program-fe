<template>
  <div class="column">
    <div class="box">
      <span v-if="loading" class="icon is-large">
        <i class="ion-clock"></i>
      </span>
    </div>
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
