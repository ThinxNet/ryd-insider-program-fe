<template>
  <article class="tile is-child notification is-white">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else class="content">
      <p class="title">History</p>
      <div class="content">
        <p>
          You did <span class="tag">{{ entriesSame.length }}</span> similar trips
          <template v-if="entriesPartialSimilarity.length">
            and <span class="tag">{{ entriesPartialSimilarity.length }}</span> trips with the
            same signature.
          </template>
        </p>
      </div>
    </div>
  </article>
</template>

<script>
  export default {
    name: 'widget-thing-session-history',
    props: {sessionId: String},
    data() {
      return {loading: true, entries: []};
    },
    watch: {
      async sessionId(currentId, previousId) {
        this.loading = true;
        try {
          const response = await this.$store.getters['common/apiInsiderProgram']
            .sessionAlike(currentId, {confidence: 40});
          this.entries = response.data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      }
    },
    methods: {
    },
    computed: {
      entriesSame() {
        return this.entries.filter(e => e.confidence >= 75);
      },

      entriesPartialSimilarity() {
        return this.entries.filter(e => e.confidence < 75);
      }
    }
  }
</script>
