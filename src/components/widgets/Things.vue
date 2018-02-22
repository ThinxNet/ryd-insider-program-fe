<template>
  <div class="column">
    <div class="box">
      <span v-if="loading" class="icon is-large">
        <i class="ion-clock"></i>
      </span>

      <div v-else class="control has-icons-left">
        <div class="select is-medium is-fullwidth">
          <select v-model="selected">
            <option disabled value="">Select one&hellip;</option>
            <option :value="entry.id" v-for="entry in entries">
              {{entry.nickName}} ({{entry.ymme.year}} {{entry.ymme.make}} {{entry.ymme.model}})
            </option>
          </select>
        </div>
        <span class="icon is-medium is-left">
          <i class="ion-android-car"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'widget-things',
    data() {
      return {entries: [], loading: true, selected: ''};
    },
    async mounted() {
      // @todo! remove it
      this.$store.getters['common/apiInsiderProgram'].headers['X-Txn-Auth-Token'] =
        this.$store.getters['authentication/authToken'];

      try {
        const reply = await this.$store.getters['common/apiInsiderProgram']
          .get('things', {include: 'device'});
        this.entries = reply.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    watch: {
      selected: function (current, previous) {
        if (current !== '') {
          this.$emit('onEntrySelected', this.entries.find(e => e.id === current));
        }
      }
    },
    methods: {
    }
  }
</script>
