<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-clock"></i></span>
  </div>
  <article v-else class="content">
    <p v-if="alikeSimilar.length && alikeClose.length">
      You have <span class="tag">{{ alikeSimilar.length }}</span> identical
      {{ $plural('trip', alikeSimilar.length) }}
      and <span class="tag">{{ alikeClose.length }}</span> partially similar
      {{ $plural('trip', alikeClose.length) }}.
    </p>
    <p v-else-if="!alikeSimilar.length && alikeClose.length">
      You have <span class="tag">{{ alikeClose.length }}</span> partially similar
      {{ $plural('trip', alikeClose.length) }}.
    </p>
    <p v-else-if="alikeSimilar.length && !alikeClose.length">
      You have <span class="tag">{{ alikeSimilar.length }}</span> identical
      {{ $plural('trip', alikeSimilar.length) }}.
    </p>
    <p v-else class="notification">
      Neither identical nor partially similar trips have been found.
    </p>

    <div v-if="paginationEntry">
      <div class="columns">
        <div class="column">
          <session-map class="box" style="height: 150px"
            polylineSource="map"
            :sessionId="paginationEntry.session"
            @onReadyStateChanged="readyStateChanged"
            @onMapInit="mapInit"></session-map>
        </div>
      </div>

      <div class="columns is-flex">
        <div class="column">
          <span class="tag" title="Confidence">{{ paginationEntry.confidence }}%</span>
        </div>
        <div class="column has-text-right" v-if="relations.length > 1">
          <button @click="paginationGoBackwards"
            :class="['button', 'is-small', {'is-loading': !isMapReady}]"
            :disabled="!paginationHasPrevious">
              <i class="ion-ios-arrow-back"></i>
          </button>
          <button @click="paginationGoForward"
            :class="['button', 'is-small', {'is-loading': !isMapReady}]"
            :disabled="!paginationHasNext">
            <i class="ion-ios-arrow-forward"></i>
          </button>
        </div>
      </div>
    </div>

  </article>
</template>

<script>
  import MixinPagination from '../../../lib/mixins/pagination';
  import SessionMap from '../shared/SessionMap';

  export default {
    name: 'thing-session-details-relations',
    components: {SessionMap},
    mixins: [MixinPagination],
    props: {sessionId: String},
    data() {
      return {isMapBlocked: true, loading: true, relationIdx: 0, relations: []};
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
          this.relations = (await this.$store.getters['common/apiInsiderProgram']
            .sessionAlike(id, {confidence: 40})).data;
          this.paginationResetEntries(this.relations);
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      },
      readyStateChanged(flag) {
        this.isMapBlocked = !flag;
      },
      mapInit(map) {
        map._handlers.forEach(h => h.disable());
        map.zoomControl.remove();
      }
    },

    computed: {
      isMapReady() {
        return !this.isMapBlocked;
      },
      alikeSimilar() {
        return this.relations.filter(e => e.confidence >= 75);
      },
      alikeClose() {
        return this.relations.filter(e => e.confidence < 75);
      }
    }
  }
</script>
