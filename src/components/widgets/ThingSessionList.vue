<template>
  <article class="tile is-child" style="position: relative;">
    <span v-if="loading" class="icon is-large" style="min-height: 672px;">
      <i class="ion-ios-time"></i>
    </span>
    <div v-else-if="paginationEntry" class="card">
      <div class="card-image"
        :style="[{height: '500px'}, {width: parentElementWidth(this.$el) + 'px'}]">
        <session-map v-if="paginationEntry._id" style="height: 490px"
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
      <div class="card-content" style="padding: 0 0 1.5rem 0;">
        <div class="columns">
          <div class="column is-full has-text-right">
            <span class="tag">{{ $_.ceil(sessionStatistics.distanceM / 1000, 1) }} km</span>

            <small class="is-size-7 has-text-grey-light">|</small>

            <span class="tag">
              {{ $moment.utc($moment.duration(sessionStatistics.durationS, 's')
                  .asMilliseconds()).format('HH:mm') }} h
            </span>

            <small class="is-size-7 has-text-grey-light">|</small>

            <template v-if="sessionStatistics.speedKmHAvg">
              <span class="tag">
                &empty; {{ sessionStatistics.speedKmHAvg }} km/h
                (max: {{ sessionStatistics.speedKmHMax }} km/h)
              </span>
            </template>

            <small class="is-size-7 has-text-grey-light">|</small>

            <span class="tag" style="margin-right: 1rem;">
              <span class="icon is-small has-text-success"><i class="ion-ios-wifi"></i></span>
            </span>
          </div>
        </div>

        <div class="columns" v-if="sourceMode === 'advanced'">
          <div class="column is-full is-paddingless">
            <div class="buttons has-addons is-centered">
              <span class="button is-small is-radiusless"
                @click="sourceSwitchTo('obd')" :class="sourceBtnClass('obd')">OBD</span>
              <span class="button is-small is-radiusless"
                @click="sourceSwitchTo('gps')" :class="sourceBtnClass('gps')">GPS</span>
              <span class="button is-small is-radiusless"
                @click="sourceSwitchTo('geo')" :class="sourceBtnClass('geo')">GEO</span>
              <span class="button is-small is-radiusless"
                v-if="paginationEntry.statistics.mapConfidenceAvg > 10"
                @click="sourceSwitchTo('map')" :class="sourceBtnClass('map')"
                :title="mapMatchingConfidenceHint">MAP</span>
              <span class="button is-small is-radiusless"
                @click="sourceSwitchTo('mixed')" :class="sourceBtnClass('mixed')">MIXED</span>
            </div>
          </div>
        </div>

        <div class="content">
          <transition name="fade">
            <div v-if="uiSpeedDetails" :style="[
              {left: 0, position: 'absolute', top: '250px', zIndex: 1000},
              {width: (parentElementWidth(this.$el) + 1) + 'px'}
            ]">
              <article class="message is-info is-radiusless">
                <div class="message-header is-radiusless">
                  movement overview
                  <button class="delete" @click.prevent="uiSpeedDetailsClose"></button>
                </div>
                <div class="message-body is-paddingless" style="height: 200px;">
                  <thing-session-details-speed
                    :source="['map'].includes(source) ? 'geo' : source"
                    :session-id="paginationEntry._id"
                    @onSegmentHighlighted="segmentHighlight"
                    @onSegmentSelected=""/>
                </div>
              </article>
            </div>
          </transition>

          <div class="columns">
            <div class="column is-full" style="padding: 0 2rem; min-height: 4.55rem">
              <small>{{ $moment(paginationEntry.start).format('dddd') }}</small>
              <br>
              <time :datetime="$moment(paginationEntry.start).format()">
                {{ $moment(paginationEntry.start).format('L LT') }}
              </time>
              &mdash;
              <time :datetime="$moment(paginationEntry.end).format()">
                {{ $moment(paginationEntry.end).format('L LT') }}
              </time>

              <hr class="is-marginless">

              <template v-if="viaStreets.length && (isModeAdvanced || ['mixed', 'map'].includes(source))">
                <small>{{ viaStreets.join(', ') }}</small>
              </template>
            </div>
          </div>

          <div class="columns">
            <div class="column is-four-fifths has-text-right is-unselectable">
              <button @click="paginationGoBackwards"
                :class="['button is-radiusless is-small', {'is-loading': !isMapReady}]"
                :disabled="!paginationHasPrevious">
                  <i class="ion-ios-arrow-back"></i>
              </button>
              <button @click="paginationGoForward"
                :class="['button is-radiusless is-small', {'is-loading': !isMapReady}]"
                :disabled="!paginationHasNext">
                <i class="ion-ios-arrow-forward"></i>
              </button>
            </div>
            <div class="column">
              <dropdown v-once @onEntryChange="sourceModeSwitch" :active-idx="0" :entry-list="[
                {title: 'Simple mode', value: 'simple'},
                {title: 'Advanced mode', value: 'advanced'}
              ]"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <feedback style="position: absolute; bottom: 0; left: 0;"
      :widget-version="widgetVersion"
      :widget-id="widgetId"
      :debug-payload="widgetDebugPayload()"/>
  </article>
</template>

<script>
  import _ from 'lodash';

  import Dropdown from './shared/Dropdown'
  import Feedback from './shared/Feedback';
  import SessionMap from './shared/SessionMap';

  import Pagination from '../../lib/mixins/pagination';
  import Widget from '../../lib/mixins/widget';

  import ThingSessionDetailsSpeed from './thing-session-details/Speed';

  export default {
    name: 'widget-thing-session-list',
    components: {Dropdown, Feedback, SessionMap, ThingSessionDetailsSpeed},
    mixins: [Pagination, Widget],
    props: {deviceId: String, sessionId: String},
    data() {
      return {
        api: null,
        isMapBlocked: true,
        loading: true,
        locations: [],
        segmentsHighlighted: [],
        sessions: [],
        source: null,
        sourceMode: 'simple',
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
        if (this.source === 'map' && this.paginationEntry.statistics.mapConfidenceAvg <= 10) {
          this.sourceSwitchTo('mixed');
        }
      });
      this.fetchData(this.deviceId);
    },
    watch: {
      loading(current) {
        if (current) { return; }
        this.sourceSwitchTo('mixed');
      },
      deviceId(currentId) {
        this.fetchData(currentId);
      },
      sessionId(currentId) {
        const idx = this.paginationEntries.findIndex(entry => entry._id === currentId);
        if (idx) {
          this.paginationJumpTo(idx);
        }
      }
    },
    methods: {
      async fetchData(deviceId) {
        this.loading = true;
        try {
          const payload = {filter: {device: deviceId}, page: {size: 10}},
            response = await this.api.sessions(payload);
          this.sessions = response.data;
          this.paginationResetEntries(this.sessions);
        } catch (e) {
          console.error(e);
          return;
        } finally {
          this.loading = false;
        }
      },
      sourceModeSwitch(mode) {
        this.sourceMode = mode;
        if (!this.isModeAdvanced) {
          this.sourceSwitchTo('mixed');
        }
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
      widgetDebugData() {
        return _(this.$data)
          .omit(['sessions', 'locations', 'paginationEntries', 'api'])
          .merge(this.$props)
          .extend({sessionId: _.get(this.paginationEntry, '_id')})
          .value();
      },
      sessionStatistics() {
        const stats = this.paginationEntry.statistics,
          fields = {
            distanceM: stats.geoDistanceM,
            durationS: stats.durationS,
            speedKmHAvg: stats.geoSpeedKmHAvg,
            speedKmHMax: stats.geoSpeedKmHMax
          };

        switch (this.source) {
          case 'mixed':
            fields.distanceM = stats.distanceM;
            fields.speedKmHAvg = stats.speedKmHAvg;
            fields.speedKmHMax = stats.speedKmHMax;
            break;
          case 'map':
            fields.distanceM = stats.mapDistanceM;
            fields.durationS = stats.mapDurationS;
            fields.speedKmHAvg = stats.mapSpeedKmHAvg;
            fields.speedKmHMax = stats.mapSpeedKmHMax;
            break;
          default:
            Object.keys(fields)
              .filter(key => key !== 'durationS')
              .forEach(key => fields[key] = stats[this.source + _.upperFirst(key)]);
            break;
        }

        return fields;
      },
      isMapReady() {
        return !this.isMapBlocked;
      },
      isModeAdvanced() {
        return this.sourceMode === 'advanced';
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
