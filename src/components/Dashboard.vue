<template>
  <div>
    <widget-things @onEntrySelected="thingChange"></widget-things>
    <widget-thing-charts v-if="thing" :entity="thing"></widget-thing-charts>
  </div>
</template>

<script>
  import WidgetThings from './widgets/Things';
  import WidgetThingCharts from './widgets/ThingCharts';

  export default {
    name: 'dashboard',
    data() {
      return {thing: null};
    },
    components: {
      WidgetThings, WidgetThingCharts
    },
    computed: {
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      }
    },
    methods: {
      thingChange(thing) {
        this.thing = thing;
      }
    }
  }
</script>
