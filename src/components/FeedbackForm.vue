<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content">
        <header class="modal-card-head is-radiusless">
          <p class="modal-card-title">feedback</p>
        </header>
        <div class="box is-radiusless">
          <div class="field">
            <strong>Reference:</strong>
            <span class="tag">{{ $store.getters['widget/feedbackFormReference'] }}</span>
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

          <div class="is-clearfix">
            <div class="is-pulled-left">
              <button class="button is-primary is-radiusless"
                @click.prevent="uiFeedbackFormSend()">send</button>
            </div>
            <div class="is-pulled-right">
              <button class="button is-white is-radiusless"
                @click.prevent="uiFeedbackFormClose()">cancel</button>
            </div>
          </div>
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close"
      @click.prevent="uiFeedbackFormClose()"></button>
  </div>
</template>

<script>
  import _ from 'lodash';

  export default {
    name: 'feedback-form',
    props: {},
    data: () => ({
      api: null, category: 'none', loading: false, message: null, uiFeedbackFormActive: false
    }),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    computed: {
    },
    methods: {
      uiFeedbackFormClose() {
        this.$store.dispatch('widget/feedbackFormDiscard');
      },
      async uiFeedbackFormSend() {
        const reference = this.$store.getters['widget/feedbackFormReference'],
          payload = this.$store.getters['widget/feedbackFormPayload'];
        await this.api.feedbackWidgetEntryNew(
          reference,
          {payload, category: this.category, message: this.message}
        );
      }
    }
  };
</script>
