<template>
  <div class="column is-4 is-offset-4">
    <div class="box">
      <span v-if="loading" class="icon is-large">
        <i class="ion-clock"></i>
      </span>
      <div v-else class="control has-icons-left">
        <div class="select is-medium">
          <select v-model="selected">
            <option disabled value="">Select one&hellip;</option>
            <option :value="entry._id" v-for="entry in entries">
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
      try {
        this.entries = await this.$store.getters['common/apiTankTaler'].things();
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    watch: {
      selected: function (current, previous) {
        if (current !== '') {
          this.$emit('onEntrySelected', this.entries.find(e => e._id === current));
        }
      }
    },
    methods: {
    }
  }
</script>
