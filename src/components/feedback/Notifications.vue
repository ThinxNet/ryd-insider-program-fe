<script>
  const LOCAL_STORAGE_RECENT_UPDATE_TIMESTAMP = 'widgetFeedback_RecentUpdateTimestamp';

  export default {
    name: 'feedback-notifications',
    render: () => null,
    props: ({timeout: Number}),
    data: () => ({api: null, timer: null}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    destroyed() {
      clearTimeout(this.timer);
    },
    mounted() {
      this.updateTimeout(5000, this.timeout);
    },
    methods: {
      async fetchData() {
        try {
          const activity = (await this.api.feedbackActivity()).data;
          if (this.isMarkerOutdated(activity.recentUpdate)) {
            this.markerUpdate(activity.recentUpdate);
            this.createNotification();
          }
        } catch (e) {
          console.error(e);
          return;
        }
      },
      createNotification() {
        const self = this;
        this.$store.dispatch(
          'notifications/entryAdd', {
            namespace: 'browser',
            caption: 'ThinxNet Insider Program',
            payload: {
              body: 'Activity in the feedback section. Click here to view the changes.',
              onClick() {
                window.focus();
                self.$router.push({name: 'feedback'});
                this.close();
              }
            }
          }
        );
      },
      isMarkerOutdated(timestamp) {
        return +(localStorage.getItem(LOCAL_STORAGE_RECENT_UPDATE_TIMESTAMP) || 0) < timestamp;
      },
      markerUpdate(timestamp) {
        localStorage.setItem(LOCAL_STORAGE_RECENT_UPDATE_TIMESTAMP, timestamp);
      },
      updateTimeout(timeoutFirst, timeoutSecond) {
        clearTimeout(this.timer);
        this.timer = setTimeout(async () => {
          await this.fetchData();
          this.updateTimeout(timeoutSecond, timeoutSecond);
        }, timeoutFirst);
      }
    }
  };
</script>
