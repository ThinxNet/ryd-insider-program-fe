<template>
  <div v-if="loading" class="has-text-centered">
    <span class="icon is-large"><i class="ion-ios-time"></i></span>
  </div>

  <article v-else class="content">
    <p v-if="alikeSimilar.length && alikeClose.length" class="is-size-7">
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
    <p v-else class="notification has-text-centered">
      Neither identical nor partially similar trips have been found.
    </p>

    <div v-if="paginationEntry">
      <div class="columns">
        <div class="column">
          <session-map class="box is-radiusless is-paddingless" style="height: 7rem;"
            :session-id="paginationEntry.session"
            :ui-map-locations="true"
            map-locations-source="mixed"
            @onReadyStateChanged="readyStateChanged"
            @onMapInit="mapInit"/>
        </div>
      </div>

      <div class="columns is-flex">
        <div class="column is-2">
          <span class="tag is-radiusless" title="Confidence">
            {{ paginationEntry.confidence }}%
          </span>
        </div>
        <div class="column has-text-centered is-7" v-if="session">
          <router-link tag="button" class="button is-text is-small is-radiusless"
            :to="{name: 'dashboard', params: {sessionId: paginationEntry.session}}">
            <span class="icon is-small">
              <i class="ion-ios-search"></i>
            </span>
            <time :datetime="$moment(session.start).format()">
              {{ $moment(session.start).format('L LT') }}
            </time> -
            <time :datetime="$moment(session.end).format()">
              {{ $moment(session.end).format('LT') }}
            </time>
          </router-link>
        </div>
        <div class="column has-text-right is-unselectable" v-if="relations.length > 1">
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
    data: () => ({api: null, session: null, isMapBlocked: true, loading: true, relations: []}),
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.$on('onPaginationChanged', this.fetchSessionData);
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
          this.relations = (await this.api.sessionAlike(id, {confidence: 40})).data;
          this.paginationResetEntries(this.relations);
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }

        this.fetchSessionData();
      },
      async fetchSessionData() {
        this.session = null;

        if (!this.paginationEntry) { return; }

        try {
          this.session = (await this.api.session(this.paginationEntry.session)).data;
        } catch (err) {
          console.error(err);
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
