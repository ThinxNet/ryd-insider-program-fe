<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>

  <article v-else-if="entries.length" class="content">tbd...</article>

  <div v-else class="notification has-text-centered">No highlights information available.</div>
</template>

<script>
  export default {
    name: 'thing-session-details-highlights',
    props: {sessionId: String},
    data: () => ({api: null, loading: true, entries: []}),
    mounted() {
      this.fetchData(this.sessionId);
    },
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    watch: {
      sessionId(currentId) {
        this.fetchData(currentId);
      }
    },
    methods: {
      async fetchData(id) {
        this.loading = true;
        try {
          this.entries = (await this.api.sessionHighlights(id)).data || [];
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
