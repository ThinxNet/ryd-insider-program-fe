<template>
  <article class="tile is-child">
    <div v-if="loading" class="has-text-centered has-text-white">
      <span class="icon is-large is-radiusless box"><i class="ion-ios-time"></i></span>
      loading&hellip;
    </div>

    <div v-else class="columns is-radiusless is-flex is-gapless">
      <div class="column is-11 has-text-centered">
        <div class="media" v-if="currentThing">
          <div class="media-content">
            <b class="is-size-4 has-text-white">{{currentThing.nickName}}</b>
            <span v-if="currentThing.ymme" class="has-text-light">
             <span class="has-text-primary is-size-5">|</span>
             {{currentThing.ymme.year}} {{currentThing.ymme.make}} {{currentThing.ymme.model}}
            </span>
          </div>
        </div>
      </div>
      <div class="column has-text-right">
        <button class="button is-white"
          :disabled="!hasPreviousThing"
          @click.prevent="previousThing">
          <span class="icon"><i class="ion-ios-arrow-back"></i></span>
        </button>
        <button class="button is-white" :disabled="!hasNextThing" @click.prevent="nextThing">
          <span class="icon"><i class="ion-ios-arrow-forward"></i></span>
        </button>
      </div>
    </div>
  </article>
</template>

<script>
  export default {
    name: 'widget-things',
    data: () => ({entries: [], loading: true, selectedIdx: null}),
    async mounted() {
      try {
        const response = await this.$store.getters['common/apiInsiderProgram']
          .things({page: {size: 1}});
        this.entries = response.data.filter(e => e.device);
        if (this.entries.length > 0) {
          this.selectedIdx = 0;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    watch: {
      selectedIdx() {
        this.$emit('onEntrySelected', this.currentThing);
      }
    },
    methods: {
      previousThing() {
        if (this.hasPreviousThing) {
          this.selectedIdx--;
        }
        return false;
      },
      nextThing() {
        if (this.hasNextThing) {
          this.selectedIdx++;
        }
        return false;
      }
    },
    computed: {
      currentThing() {
        return this.entries[this.selectedIdx];
      },
      hasNextThing() {
        return this.selectedIdx + 1 < this.entries.length;
      },
      hasPreviousThing() {
        return this.selectedIdx > 0;
      }
    }
  }
</script>
