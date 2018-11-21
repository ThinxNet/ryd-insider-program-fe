<template>
  <div class="box is-radiusless">
    <h1 class="title">Feedback</h1>
    <h2 class="subtitle">List of your feedback messages and their status</h2>

    <div class="columns">
      <div class="column is-one-quarter">
        <a @click.prevent="feedbackFormOpen"
          class="button is-large is-fullwidth is-success">Show the form</a>
      </div>
      <div class="column">
        <div class="card" v-for="entry of entries" style="margin-bottom: 10px">
          <div class="card-content">
            <pre>{{ $_.truncate(entry.message, {length: 100}) }}</pre>
          </div>
          <footer class="card-footer">
            <p class="card-footer-item">
              <span class="tag">{{ $moment(entry.timestamp).format('L LT') }}</span>
            </p>
            <p class="card-footer-item">
              <span class="tag">{{ entry.reference }}</span>
            </p>
            <p class="card-footer-item">
              <span class="tag">{{ entry.category }}</span>
            </p>
            <p class="card-footer-item">
              <span
                :class="['tag', {
                  'is-success': entry.state === 'RESOLVED',
                  'is-warning': entry.state === 'PENDING',
                  'is-danger': entry.state === 'INVALID'
                }]">
                {{ entry.state }}
              </span>
            </p>
          </footer>
        </div>

        <div v-if="!entries.length" class="notification has-text-centered">
          No feedback entries found.
          <a @click.prevent="feedbackFormOpen">The right time to submit one!</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'feedback',
    props: {},
    data: () => ({api: null, loading: true, entries: []}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      async fetchData() {
        this.loading = true;
        try {
          this.entries = (await this.api.feedback()).data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      },
      feedbackFormOpen() {
        this.$store.dispatch(
          'componentWidgetMixin/feedbackFormActivate',
          {widgetId: 'ryd.one insider program', payload: "{}"}
        );
      }
    }
  };
</script>
