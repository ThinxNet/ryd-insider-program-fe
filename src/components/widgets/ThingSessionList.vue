<template>
  <article class="tile is-child">
    <span v-if="loading" class="icon is-large"><i class="ion-ios-time"></i></span>
    <div v-else-if="paginationEntry" class="card">
      <div class="card-image"
        :style="[{height: '470px'}, {width: parentElementWidth(this.$el) + 'px'}]">
        <session-map v-if="paginationEntry._id" style="height: 460px"
          :map-highlights="segmentsHighlighted"
          :map-locations-source="source"
          :session-id="paginationEntry._id"
          :ui-controls="true"
          :ui-map-events="true"
          :ui-map-highlights="true"
          :ui-map-locations="true"
          :ui-map-overspeed="true"
          @onMapInit="mapInit"
          @onLocationsChanged="mapLocationsChange"
          @onReadyStateChanged="mapReadyStateChange"/>
      </div>
      <div class="card-content">
        <div class="content">
          <transition name="fade">
            <div v-if="uiSpeedDetails" :style="[
              {left: 0, position: 'absolute', top: '230px', zIndex: 1000},
              {width: (parentElementWidth(this.$el) + 1) + 'px'}
            ]">
              <article class="message is-info is-radiusless">
                <div class="message-header is-radiusless">
                  movement overview
                  <button class="delete" @click.prevent="uiSpeedDetailsClose"></button>
                </div>
                <div class="message-body is-paddingless" style="height: 200px;">
                  <thing-session-details-speed
                    :source="['mixed', 'map'].includes(source) ? 'geo' : source"
                    :session-id="paginationEntry._id"
                    @onSegmentHighlighted="segmentHighlight"
                    @onSegmentSelected=""/>
                </div>
              </article>
            </div>
          </transition>

          <div class="columns">
            <div class="column is-paddingless">
              <div class="buttons has-addons is-centered">
                <span class="button is-small"
                  @click="sourceSwitchTo('obd')" :class="sourceBtnClass('obd')">OBD</span>
                <span class="button is-small"
                  @click="sourceSwitchTo('gps')" :class="sourceBtnClass('gps')">GPS</span>
                <span class="button is-small"
                  @click="sourceSwitchTo('geo')" :class="sourceBtnClass('geo')">GEO</span>
                <span class="button is-small"
                  v-if="paginationEntry.statistics.mapConfidenceAvg > 10"
                  @click="sourceSwitchTo('map')" :class="sourceBtnClass('map')"
                  :title="mapMatchingConfidenceHint">MAP</span>
                <span class="button is-small"
                  @click="sourceSwitchTo('mixed')" :class="sourceBtnClass('mixed')">MIXED</span>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <time :datetime="$moment(paginationEntry.start).format()">
                {{ $moment(paginationEntry.start).format('L LT') }}
              </time>
              &mdash;
              <time :datetime="$moment(paginationEntry.end).format()">
                {{ $moment(paginationEntry.end).format('L LT') }}
              </time>

              <template v-if="['mixed', 'map'].includes(source) && viaStreets.length">
                <br><small>{{ viaStreets.join(', ') }}</small>
              </template>

              <br>
              <span class="tag">{{ $_.ceil(sessionStatistics.distanceM / 1000, 1) }} km</span>

              <template v-if="source !== 'map'">
                for
              </template>
              <template v-else>
                ideally doable within
              </template>

              <span class="tag">
                ~{{ $moment.duration(sessionStatistics.durationS, 's').humanize() }}
              </span>

              <template v-if="sessionStatistics.speedKmHAvg">
                <br>
                Avg. speed <span class="tag">{{ sessionStatistics.speedKmHAvg }} km/h</span>
                (max: <span class="tag">{{ sessionStatistics.speedKmHMax }} km/h</span>)
              </template>
            </div>
          </div>

          <div class="columns is-flex">
            <div class="column is-2">
              <span class="tag is-size-7" title="Version"><small>v</small>{{ widgetVersion }}</span>
            </div>

            <!--
            <div class="column is-3">
              <div class="buttons has-addons">
                <router-link :to="{name: 'widget-feedback', params: {direction: 'up'}}"
                  class="button is-size-7"><i class="ion-thumbsup"></i></router-link>
                <router-link :to="{name: 'widget-feedback', params: {direction: 'down'}}"
                  class="button is-size-7"><i class="ion-thumbsdown"></i></router-link>
              </div>
            </div>
            -->

            <div class="column has-text-right is-10 is-unselectable">
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
      </div>
    </div>
  </article>
</template>

<script>
  import _ from 'lodash';

  import SessionMap from './shared/SessionMap';
  import ThingSessionDetailsSpeed from './thing-session-details/Speed';

  import Pagination from '../../lib/mixins/pagination';
  import Widget from '../../lib/mixins/widget';

  export default {
    name: 'widget-thing-session-list',
    components: {SessionMap, ThingSessionDetailsSpeed},
    mixins: [Pagination, Widget],
    props: {entity: Object},
    data() {
      return {
        api: null,
        isMapBlocked: true,
        loading: true,
        locations: [],
        segmentsHighlighted: [],
        sessions: [],
        source: null,
        uiSpeedDetails: false
      };
    },
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.$on('onPaginationChanged', () => {
        this.locations = [];
        if (!this.paginationEntry) { return; }
        this.$emit('onSessionChange', this.paginationEntry._id);
        if (['map', 'mixed'].includes(this.source)
          && this.paginationEntry.statistics.mapConfidenceAvg <= 10) {
          this.sourceSwitchTo('gps');
        }
      });
      this.fetchData(this.entity);
    },
    watch: {
      entity(current) {
        this.fetchData(current);
      }
    },
    methods: {
      async fetchData(entity) {
        this.loading = true;
        try {
          const payload = {filter: {device: entity.device}, page: {size: 10}},
            response = await this.api.sessions(payload);
          this.sessions = response.data;
          this.paginationResetEntries(this.sessions);
        } catch (e) {
          return console.error(e);
        } finally {
          this.loading = false;
        }
        this.sourceSwitchTo('gps');
      },
      sourceSwitchTo(source) {
        this.source = source.toLowerCase();
      },
      sourceBtnClass(source) {
        return (this.source === source) ? ['is-primary', 'is-active'] : [];
      },
      mapInit(instance) {
        const self = this,
          control = L.Control.extend({
            options: {position: 'bottomleft'},
            onAdd(map) {
              const icon = L.DomUtil.create('i', 'ion-ios-speedometer'),
                container = L.DomUtil
                  .create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
              icon.style.cssText = 'font-size: 1.5rem;padding: 0.1rem 0.5rem;cursor: pointer;';
              container.style.backgroundColor = 'white';
              container.onclick = () => { self.uiSpeedDetails = true; };
              container.appendChild(icon);
              return container;
            },
            onRemove(map) {
              return map;
            }
          });
        instance.addControl(new control());
      },
      mapReadyStateChange(flag) {
        this.isMapBlocked = !flag;
      },
      mapLocationsChange(locations) {
        this.locations = locations;
      },
      uiSpeedDetailsClose() {
        this.uiSpeedDetails = false;
        this.segmentsHighlighted = [];
      },
      segmentHighlight(segmentId) {
        this.segmentsHighlighted = [segmentId];
      },
      parentElementWidth(elem, modifier = 26) {
        return elem.parentElement.clientWidth - modifier;
      }
    },
    computed: {
      sessionStatistics() {
        const fields = {
          distanceM: this.paginationEntry.statistics.geoDistanceM,
          durationS: this.paginationEntry.statistics.durationS,
          speedKmHAvg: this.paginationEntry.statistics.geoSpeedKmHAvg,
          speedKmHMax: this.paginationEntry.statistics.geoSpeedKmHMax
        };

        switch (this.source) {
          case 'mixed':
            if (this.paginationEntry.statistics.mapConfidenceAvg > 90
              && !this.paginationEntry.statistics.mapHasGaps) {
              fields.distanceM = this.paginationEntry.statistics.mapDistanceM;
            }
            break;
          case 'map':
            fields.distanceM = this.paginationEntry.statistics.mapDistanceM;
            fields.durationS = this.paginationEntry.statistics.mapDurationS;
            fields.speedKmHAvg = this.paginationEntry.statistics.mapSpeedKmHAvg;
            fields.speedKmHMax = this.paginationEntry.statistics.mapSpeedKmHMax;
            break;
          default:
            Object.keys(fields)
              .filter(key => key !== 'durationS')
              .forEach(key =>
                fields[key] = this.paginationEntry.statistics[this.source + _.upperFirst(key)]
              );
            break;
        }

        return fields;
      },
      isMapReady() {
        return !this.isMapBlocked;
      },
      viaStreets() {
        const streets = _(this.locations).map('name').reject(_.isEmpty).uniq().value();
        if (!streets.length) {
          return [];
        }
        if (streets.length < 2) {
          return [_.head(streets)];
        }
        if (streets.length < 3) {
          return streets;
        }
        return [
          _.head(streets),
          _.nth(streets, Math.round((streets.length - 1) / 2)),
          _.last(streets)
        ];
      },
      mapMatchingConfidenceHint() {
        return [
          this.paginationEntry.statistics.mapConfidenceAvg + '%',
          this.paginationEntry.statistics.mapHasGaps ? 'with' : 'without',
          'gaps'
        ].join(' ');
      }
    }
  }
</script>
