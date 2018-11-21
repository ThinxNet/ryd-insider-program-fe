<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content" v-if="!uiSuccess">
      <header class="modal-card-head is-radiusless">
        <p class="modal-card-title">feedback</p>
      </header>
      <div class="box is-radiusless">
        <div class="field">
          <strong>Reference:</strong>
          <span class="tag">{{ $store.getters['componentWidgetMixin/feedbackFormReference'] }}</span>
        </div>

        <div class="field">
          <label class="label">Category</label>
          <div class="control">
            <div class="select">
              <select v-model="category" class="is-radiusless">
                <option value="none">No category</option>
                <option value="issue">Issue</option>
                <option value="suggestion">Suggestion</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <div class="control">
            <textarea class="textarea is-radiusless" placeholder="Message"
              v-model="message"></textarea>
          </div>
        </div>

        <div v-if="exception && !loading" class="notification is-danger is-radiusless">
          {{ exception }}
        </div>

        <div class="is-clearfix">
          <div class="is-pulled-left">
            <button :disabled="loading || !message.length"
              :class="['button is-primary is-radiusless', {'is-loading': loading}]"
              @click.prevent="uiFeedbackFormSend()">send</button>
          </div>
          <div class="is-pulled-right">
            <button class="button is-white is-radiusless"
              @click.prevent="uiFeedbackFormClose()">cancel</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-content" v-else>
      <div class="notification is-success is-radiusless">
        <p class="is-size-5">Message has been sent. Thank you!</p>
        <p>
          <a href="#" @click.prevent="uiFeedbackFormClose()">Click here to close the window</a>.
        </p>
      </div>
    </div>

    <button class="modal-close is-large" aria-label="close"
      @click.prevent="uiFeedbackFormClose()"></button>
  </div>
</template>

<script>
  export default {
    name: 'feedback-form',
    props: {},
    data: () => ({
      api: null,
      category: 'none',
      exception: null,
      loading: false,
      message: '',
      uiFeedbackFormActive: false,
      uiSuccess: false
    }),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    methods: {
      uiFeedbackFormClose() {
        this.$store.dispatch('componentWidgetMixin/feedbackFormDiscard');
      },
      async uiFeedbackFormSend() {
        this.loading = true;

        const reference = this.$store.getters['componentWidgetMixin/feedbackFormReference'],
          payload = this.$store.getters['componentWidgetMixin/feedbackFormPayload'];

        try {
          await this.api.feedbackWidgetEntryNew(
            reference,
            {payload, category: this.category, message: this.message.trim()}
          );
        } catch (e) {
          if (e.body && e.body.errors) {
            if (!this.exception) {
              setTimeout(() => this.exception = null, 3000);
            }
            this.exception = e.body.errors.join('; ');
          }
          return;
        } finally {
          this.loading = false;
        }

        this.uiSuccess = true;
      }
    }
  };
</script>
