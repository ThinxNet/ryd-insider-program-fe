<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>

  <article v-else-if="weather" class="content">
    <template v-if="weather.visibility">
      Visibility
      <span class="tag">{{ Math.round(weather.visibility / 1000) }} km</span>.
    </template>
    Weather might be described as
    <span class="tag">{{ weather.weather[0].description }}</span> with
    <span class="tag">{{ weather.wind.speed }} m/s wind</span>
    <span :style="[{display: 'inline-block'}, {transform: `rotate(${weather.wind.deg}deg)`}]">
      <i class="ion-ios-arrow-round-up has-text-info"></i>
    </span>.
    The temperature was
    <span class="tag">{{ Math.round(weather.main.temp) }}&#8451;</span>,
    humidity <span class="tag">{{ weather.main.humidity }}%</span> and
    pressure <span class="tag">{{ weather.main.pressure }} hPa</span>.
  </article>

  <div v-else class="notification">No weather information available.</div>
</template>

<script>
  export default {
    name: 'thing-session-details-weather',
    props: {sessionId: String},
    data: () => ({loading: true, entries: []}),
    mounted() {
      this.fetchData(this.sessionId);
    },
    watch: {
      sessionId(currentId) {
        this.fetchData(currentId);
      }
    },
    methods: {
      async fetchData(id) {
        this.loading = true;
        try {
          this.entries = (await this.$store.getters['common/apiInsiderProgram']
            .sessionWeather(id)).data;
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      }
    },
    computed: {
      weather() {
        return this.entries.length ? this.entries[0].payload : null;
      }
    }
  }
</script>
