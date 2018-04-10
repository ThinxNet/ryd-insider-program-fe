<template>
  <article class="tile is-child notification is-white">
    <span v-if="loading" class="icon is-large"><i class="ion-clock"></i></span>
    <div v-else class="content">
      <p class="title">Trip overview</p>
      <div class="content">
        <p v-if="alikeSimilar.length && alikeClose.length">
          You did <span class="tag">{{ alikeSimilar.length }}</span>
          and <span class="tag">{{ alikeClose.length }}</span> trips with the
          same signature.
        </p>
        <p v-else-if="!alikeSimilar.length && alikeClose.length">
          You have no similar trips, but
          <span class="tag">{{ alikeClose.length }}</span> trips with the
          same signature.
        </p>
        <p v-else-if="alikeSimilar.length && !alikeClose.length">
          You did <span class="tag">{{ alikeSimilar.length }}</span> similar trip
          and no trips with the same signature.
        </p>
        <p v-else>
          You have no similar trips, and no trips with the same signature.
        </p>

        <p v-if="weather.length">
          <template v-if="weather[0].payload.visibility">
            Visibility
            <span class="tag">{{ Math.round(weather[0].payload.visibility / 1000) }} km.</span>
          </template>
          Weather might be described as
          <span class="tag">{{ weather[0].payload.weather[0].description }}</span> with
          <span class="tag">{{ weather[0].payload.wind.speed }} m/s wind</span>.
          The temperature was
          <span class="tag">{{ Math.round(weather[0].payload.main.temp) }}&#8451;</span>,
          humidity <span class="tag">{{ weather[0].payload.main.humidity }}%</span> and
          pressure <span class="tag">{{ weather[0].payload.main.pressure }} hPa</span>.
        </p>
      </div>
    </div>
  </article>
</template>

<script>
  export default {
    name: 'widget-thing-session-details',
    props: {sessionId: String},
    data() {
      return {alike: [], loading: true, weather: []};
    },
    watch: {
      async sessionId(currentId, previousId) {
        this.loading = true;
        try {
          this.alike = (await this.$store.getters['common/apiInsiderProgram']
            .sessionAlike(currentId, {confidence: 40})).data;
          this.weather = (await this.$store.getters['common/apiInsiderProgram']
            .sessionWeather(currentId)).data;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      }
    },
    methods: {
    },
    computed: {
      alikeSimilar() {
        return this.alike.filter(e => e.confidence >= 75);
      },

      alikeClose() {
        return this.alike.filter(e => e.confidence < 75);
      }
    }
  }
</script>
