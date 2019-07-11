<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>

  <article v-else class="content">

  <div class="field is-grouped is-grouped-multiline">
    <div class="control">
      <div class="tags has-addons">
        <span class="tag is-radiusless">Category</span>
        <span class="tag is-primary is-radiusless">Business</span>
        <a class="tag is-success"><span class="icon"><i class="ion-md-create"></i></span></a>
      </div>
    </div>
    <div class="control">
      <div class="tags has-addons">
        <span class="tag is-radiusless">Home</span>
        <a class="tag is-delete is-radiusless"></a>
      </div>
    </div>
    <div class="control">
      <div class="tags has-addons">
        <span class="tag is-radiusless">Type</span>
        <span class="tag is-info is-radiusless">Commute</span>
        <a class="tag is-link"><span class="icon"><i class="ion-md-create"></i></span></a>
      </div>
    </div>
    <div class="control">
      <div class="tags has-addons">
        <span class="tag is-radiusless">Work</span>
        <a class="tag is-delete is-radiusless"></a>
      </div>
    </div>
    <div class="control">
      <div class="tags">
        <a class="tag is-warning is-radiusless"><span class="icon"><i class="ion-md-add"></i></span></a>
      </div>
    </div>
  </div>

  </article>
</template>

<script>
  export default {
    name: 'thing-session-details-tags',
    props: {sessionId: String},
    data: () => ({loading: true, entries: []}),
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
          this.entries = (await this.$store.getters['common/apiInsiderProgram']
            .sessionWeather(id)).data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      }
    },
    computed: {
    }
  }
</script>
