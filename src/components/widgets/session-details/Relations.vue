<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-clock"></i></span>
  </div>
  <article v-else class="content">
    <p v-if="alikeSimilar.length && alikeClose.length">
      You did <span class="tag">{{ alikeSimilar.length }}</span>
      and <span class="tag">{{ alikeClose.length }}</span> trips with the
      same signature.
    </p>
    <p v-else-if="!alikeSimilar.length && alikeClose.length">
      You have no similar trips, but
      <span class="tag">{{ alikeClose.length }}</span> trips with the
      same signature.
    </p>
    <p v-else-if="alikeSimilar.length && !alikeClose.length">
      You did <span class="tag">{{ alikeSimilar.length }}</span> similar trip
      and no trips with the same signature.
    </p>
    <p v-else>
      You have no similar trips, and no trips with the same signature.
    </p>
  </article>
</template>

<script>
  export default {
    name: 'widget-thing-session-details-relations',
    props: {sessionId: String},
    data() {
      return {relations: [], loading: true};
    },
    mounted() {
      this.fetchData(this.sessionId);
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
          this.relations = (await this.$store.getters['common/apiInsiderProgram']
            .sessionAlike(id, {confidence: 40})).data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      }
    },
    computed: {
      alikeSimilar() {
        return this.relations.filter(e => e.confidence >= 75);
      },

      alikeClose() {
        return this.relations.filter(e => e.confidence < 75);
      }
    }
  }
</script>
