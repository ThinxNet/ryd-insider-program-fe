<template>
  <article class="tile is-child notification is-white">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else class="content">
      <p class="title">Trip overview</p>

      <div class="content">
        <p v-if="entriesSame.length && entriesPartialSimilarity.length">
          You did <span class="tag">{{ entriesSame.length }}</span>
          and <span class="tag">{{ entriesPartialSimilarity.length }}</span> trips with the
          same signature.
        </p>
        <p v-else-if="!entriesSame.length && entriesPartialSimilarity.length">
          You have no similar trips, but
          <span class="tag">{{ entriesPartialSimilarity.length }}</span> trips with the
          same signature.
        </p>
        <p v-else-if="entriesSame.length && !entriesPartialSimilarity.length">
          You did <span class="tag">{{ entriesSame.length }}</span> similar trip
          and no trips with the same signature.
        </p>
        <p v-else>
          You have no similar trips, and no trips with the same signature.
        </p>
      </div>
    </div>
  </article>
</template>

<script>
  export default {
    name: 'widget-thing-session-details',
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
