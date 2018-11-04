<template>
  <div>
    <a class="button is-info is-small is-radiusless" title="Feedback"
      @click.prevent="feedbackFormOpen()">
      <i class="icon ion-ios-megaphone"></i>
    </a>
    <span class="tag is-white is-radiusless has-text-grey"
      title="Version">{{ widgetVersion }}</span>
  </div>
</template>

<script>
  export default {
    name: 'feedback',
    props: {debugPayload: String, widgetId: String, widgetVersion: String},
    methods: {
      feedbackFormOpen() {
        this.$store.dispatch(
          'componentWidgetMixin/feedbackFormActivate',
          {widgetId: this.widgetId, payload: this.debugPayload}
        );
      }
    }
  }
</script>
