<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-clock"></i></span>
  </div>

  <article v-else-if="weather.length" class="content">
    <template v-if="weather[0].payload.visibility">
      Visibility
      <span class="tag">{{ Math.round(weather[0].payload.visibility / 1000) }} km</span>.
    </template>
    Weather might be described as
    <span class="tag">{{ weather[0].payload.weather[0].description }}</span> with
    <span class="tag">{{ weather[0].payload.wind.speed }} m/s wind</span>.
    The temperature was
    <span class="tag">{{ Math.round(weather[0].payload.main.temp) }}&#8451;</span>,
    humidity <span class="tag">{{ weather[0].payload.main.humidity }}%</span> and
    pressure <span class="tag">{{ weather[0].payload.main.pressure }} hPa</span>.
  </article>

  <div v-else class="notification">No weather information available.</div>
</template>

<script>
  export default {
    name: 'widget-thing-session-details-weather',
    props: {sessionId: String},
    data() {
      return {loading: true, weather: []};
    },
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
          this.weather = (await this.$store.getters['common/apiInsiderProgram']
            .sessionWeather(id)).data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      }
    }
  }
</script>
