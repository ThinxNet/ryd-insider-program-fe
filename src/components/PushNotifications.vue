<script>
  import pushJs from 'push.js';

  export default {
    name: 'push-notifications',
    render: () => null,
    props: ({namespace: String}),
    mounted() {
      this.$store.subscribeAction({after: action => {
        if (action.type !== 'notifications/entryAdd'
          || action.payload.namespace !== this.namespace) {
          return;
        }
        this.$store.getters['notifications/entriesNamespaced'](this.namespace).forEach(
          notification => {
            pushJs.create(notification.caption, notification.payload)
              .catch(console.debug);
            this.$store.dispatch('notifications/entryRemove', notification);
          }
        );
      }});
    }
  };
</script>
