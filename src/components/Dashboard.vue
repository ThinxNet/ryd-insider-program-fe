<template>
  <div>
    <widget-things @onEntrySelected="thingChange"></widget-things>
  </div>
</template>

<script>
  import WidgetThings from './widgets/Things';

  export default {
    name: 'dashboard',
    data() {
      return {thing: null};
    },
    components: {
      WidgetThings
    },
    computed: {
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      }
    },
    methods: {
      thingChange(thing) {
        console.log(thing);
      }
    }
  }
</script>
