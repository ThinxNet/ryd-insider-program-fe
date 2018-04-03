<template>
  <article class="tile is-child notification is-white">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>

    <div v-else class="control has-icons-left">
      <div class="select is-medium is-fullwidth">
        <select v-model="selected">
          <option disabled value="">Select one&hellip;</option>
          <option :value="entry._id" v-for="entry in entries">
            {{entry.nickName}}<template v-if="entry.ymme"> ({{entry.ymme.year}} {{entry.ymme.make}} {{entry.ymme.model}})</template>
          </option>
        </select>
      </div>
      <span class="icon is-medium is-left">
        <i class="ion-android-car"></i>
      </span>
    </div>
  </article>
</template>

<script>
  export default {
    name: 'widget-things',
    data() {
      return {entries: [], loading: true, selected: ''};
    },
    async mounted() {
      try {
        const response = await this.$store.getters['common/apiInsiderProgram']
          .thingsFetchAll({page: {size: 1}});
        this.entries = response.data;
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
