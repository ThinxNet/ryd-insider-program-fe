<template>
  <article class="tile is-child" style="position: relative;">
    <div v-if="loading" class="has-text-centered">
      <div class="icon is-large" style="min-height: 672px;">
        <i class="ion-ios-time box is-radiusless"></i>
      </div>
    </div>
    <div v-else-if="paginationEntry" class="card">
      <div class="card-image"
        :style="[{height: '500px'}, {width: parentElementWidth(this.$el) + 'px'}]">
        <div v-if="paginationEntry.incomplete" class="tags has-addons"
          style="position: absolute; z-index: 401; left: 40%; top: 1%;"
          title="This trip is incomplete and will be replaced with a new one as soon as we receive all the data.">
          <span class="tag is-danger">INCOMPLETE</span>
          <span class="tag is-white">
            <span class="icon is-small"><i class="ion-md-cut"></i> </span>
          </span>
        </div>
        <session-map v-if="paginationEntry._id" style="height: 490px"
          :map-highlights="segmentsHighlighted"
          :map-locations-source="source"
          :session-id="paginationEntry._id"
          :ui-controls="true"
          :ui-map-events="true"
          :ui-map-highlights="true"
          :ui-map-locations="true"
          :ui-map-overspeed="true"
          @onLocationsChanged="mapLocationsChange"
          @onMapInit="mapInit"
          @onReadyStateChanged="mapReadyStateChange"/>
      </div>
      <div class="card-content" style="padding: 0 0 1.5rem 0;">
        <div class="columns">
          <div class="column is-full">
            <div class="tags has-addons">
              <span class="tag is-white" v-if="entryStatistics.distanceM > 0">
                {{ $_.ceil(entryStatistics.distanceM / 1000, 1) }} km
              </span>
              <span class="tag is-white">
                {{ $moment.utc($moment.duration(entryStatistics.durationS, 's')
                    .asMilliseconds()).format('HH:mm') }} h
              </span>
              <template v-if="entryStatistics.speedKmHAvg">
                <span class="tag is-white">
                  <span class="icon is-small"><i class="ion-md-radio-button-off"></i></span>
                  &nbsp;{{ entryStatistics.speedKmHAvg }} km/h
                </span>
                <span class="tag is-white">
                  <span class="icon is-small"><i class="ion-md-arrow-round-up"></i></span>
                  &nbsp;{{ entryStatistics.speedKmHMax }} km/h
                </span>
              </template>
              <span class="tag is-white" v-if="currentConsumption && currentConsumption.amountPerM"
                :title="`~${$_.round(currentConsumption.amountPerM * 100, 1)} l for 100 km`">
                <span class="icon is-small"><i class="ion-ios-water"></i></span>
                &nbsp;{{ $_.round(currentConsumption.amountMl * 0.001, 1) }} l
              </span>
              <span class="tag is-white">
                <span :title="`Trip quality (rank: ${paginationEntry.quality})`"
                  :class="['icon is-small', 'has-text-' + (qualityClassName)]">
                  <i class="ion-ios-wifi"></i>
                </span>
              </span>
            </div>
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

              <template v-if="viaStreetsLabel.length
                && (isSourceModeAdvanced || ['mixed', 'map'].includes(source))">
                <small>{{ viaStreetsLabel.join(', ') }}</small>
              </template>
            </div>
          </div>

          <div class="columns">
            <div class="column is-four-fifths has-text-right is-unselectable">
              <button @click="paginationJumpTo(0)"
                :class="['button is-radiusless is-small', {'is-loading': !isMapReady}]"
                :disabled="!paginationHasPrevious">
                  <i class="ion-ios-rewind"></i>
              </button>
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
    <div v-else class="box is-radiusless" style="height: 100%">
      <div class="notification has-text-centered">No trips available.</div>
    </div>

    <feedback style="position: absolute; bottom: 0; left: 0;"
      :widget-version="widgetVersion"
      :widget-id="widgetId"
      :debug-payload="widgetDebugPayload()"/>
  </article>
</template>

<script>
  import _ from 'lodash';

  import Dropdown from './shared/Dropdown';
  import Feedback from './shared/Feedback';
  import SessionMap from './shared/SessionMap';

  import MixinPagination from '../../lib/mixins/pagination';
  import MixinWidget from '../../lib/mixins/widget';

  import ThingSessionDetailsSpeed from './thing-session-details/Speed';

  export default {
    name: 'widget-thing-session-list',
    components: {Dropdown, Feedback, SessionMap, ThingSessionDetailsSpeed},
    mixins: [MixinPagination, MixinWidget],
    props: {deviceId: String, entries: Array, entrySelected: {default: null, type: String}},
    data() {
      return {
        api: null,
        currentConsumption: null,
        isMapBlocked: true,
        loading: true,
        locations: [],
        segmentsHighlighted: [],
        source: 'mixed',
        sourceMode: 'simple',
        uiSpeedDetails: false
      };
    },
    created() {
      this.api = this.$store.getters['common/apiInsiderProgram'];
    },
    mounted() {
      this.$on('onPaginationChanged', () => {
        if (this.loading) {
          return;
        }

        this.currentConsumption = null;
        this.locations = [];
        this.segmentsHighlighted = [];

        if (!this.paginationEntry) {
          return;
        }

        this.$emit('onSessionChange', this.paginationEntry._id);

        if (this.source === 'map' && this.paginationEntry.statistics.mapConfidenceAvg <= 10) {
          this.sourceSwitchTo('mixed');
        }
      });
    },
    watch: {
      entries(currentList) {
        this.paginationResetEntries(currentList);
        this.loading = false;
      },
      entrySelected(sessionId) {
        if (!sessionId) { return; }
        this.paginationJumpTo(this.entries.findIndex(entry => entry._id === sessionId));
        this.fetchConsumption(sessionId);
      }
    },
    methods: {
      fetchConsumption(sessionId) {
        this.currentConsumption = null;
        this.api.sessionConsumption(sessionId)
          .then(response => this.currentConsumption = response.data)
          .catch(console.error);
      },
      sourceModeSwitch(mode) {
        this.sourceMode = mode;
        if (!this.isSourceModeAdvanced) {
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
      isMapReady() {
        return !this.isMapBlocked;
      },
      widgetDebugData() {
        return _(this.$data)
          .merge(this.$props)
          .omit(['entries', 'locations', 'paginationEntries', 'api'])
          .extend({sessionId: _.get(this.paginationEntry, '_id')})
          .value();
      },
      entryStatistics() {
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
      isSourceModeAdvanced() {
        return this.sourceMode === 'advanced';
      },
      viaStreetsLabel() {
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
      },
      qualityClassName() {
        return {
          A: 'primary', B: 'grey-light', C: 'warning', D: 'danger', E: 'danger', F: 'danger'
        }[this.paginationEntry.quality];
      }
    }
  }
</script>
