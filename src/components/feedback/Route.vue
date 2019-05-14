<template>
  <div class="box is-radiusless">
    <h1 class="title">Feedback</h1>
    <h2 class="subtitle">List of your feedback messages and their status</h2>

    <div class="columns">
      <div class="column is-one-quarter">
        <aside class="menu">
          <ul class="menu-list">
            <li>
              <a @click.prevent="feedbackFormOpen">
                <span class="icon"><i class="ion-ios-chatbubbles"></i></span> Share your feedback
              </a>
            </li>
          </ul>

          <p class="menu-label">List by state</p>
          <ul class="menu-list">
            <li>
              <a :class="{'is-active': !state}"
                @click.prevent="stateFilterChange(null)">All feedback entries</a>
            </li>
            <li>
              <ul class="menu-list">
                <li v-for="(title, key) in {
                  UNKNOWN: 'Open entries',
                  PENDING: 'Pending',
                  RESOLVED: 'Closed',
                  INVALID: 'Invalid'
                }">
                  <a :class="{'is-active': state === key}"
                    @click.prevent="stateFilterChange(key)">{{ title }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </aside>
      </div>

      <div class="column" ref="content-area">
        <div v-if="loading" class="has-text-centered">
          <span class="icon is-large"><i class="ion-ios-time"></i></span>
        </div>

        <div v-else-if="entries.length && !currentEntries.length"
          class="notification has-text-centered">
          No entries matching the filter conditions.
        </div>

        <div class="card"
          v-else-if="entries.length"
          v-for="entry of currentEntries" style="margin-bottom: 10px">
          <div class="card-content">
            <div>
              <span class="tag is-primary is-radiusless" :title="entry.id">Message</span>
              <span class="tag is-radiusless">{{ $moment(entry.timestamp).format('L LT') }}</span>
              <pre :style="stylesMessageArea" class="has-background-white">
                {{ entry.message }}
              </pre>
            </div>
            <div v-if="entry.updatedAt && entry.response">
              <span class="tag is-success is-radiusless">Response</span>
              <span class="tag is-radiusless">{{ $moment(entry.updatedAt).format('L LT') }}</span>
              <pre :style="stylesMessageArea" class="has-background-white">
                {{ entry.response }}
              </pre>
            </div>
          </div>
          <span class="tag is-radiusless" title="Reference">{{ entry.reference }}</span>
          <span title="State"
            :class="['tag is-radiusless', {
              'is-success': entry.state === 'RESOLVED',
              'is-warning': entry.state === 'PENDING',
              'is-danger': entry.state === 'INVALID'
            }]">
            {{ entry.state }}
          </span>
          <span class="tag is-radiusless" title="Category"
            v-if="entry.category !== 'NONE'">{{ entry.category }}</span>
        </div>

        <div v-else-if="!entries.length" class="notification has-text-centered">
          <p><b>No feedback entries found.</b></p>
          <p>
            <a @click.prevent="feedbackFormOpen">
              Please let us know if there’s anything we can improve!
            </a>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  export default {
    name: 'feedback',
    data: () => ({api: null, entries: [], loading: true, state: null}),
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
      },
      stateFilterChange(state) {
        this.state = state;
      }
    },
    computed: {
      currentEntries() {
        return this.state
          ? this.entries.filter(entry => entry.state === this.state)
          : this.entries;
      },
      stylesMessageArea() {
        return {
          'max-width': (this.$refs['content-area'].clientWidth - 80) + 'px',
          'white-space': 'inherit'
        };
      }
    }
  };
</script>
