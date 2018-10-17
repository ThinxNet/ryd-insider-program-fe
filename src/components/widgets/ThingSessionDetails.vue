<template>
  <article class="tile is-child">
    <div class="tabs box is-centered is-small is-fullwidth is-radiusless">
      <ul v-for="(entry, idx) in componentList">
        <li :class="{'is-active': componentIdx === idx}">
          <a @click.prevent="componentIdx = idx">{{ entry.title }}</a>
        </li>
      </ul>
    </div>
    <div class="box is-radiusless" style="min-height: 16.95rem;position: relative;">
      <div v-if="!sessionId" class="has-text-centered">
        <span class="icon is-large"><i class="ion-ios-time"></i></span>
      </div>

      <transition v-else name="fade" mode="out-in" :duration="100">
        <component :is='component' :sessionId='sessionId'/>
      </transition>

      <feedback style="position: absolute; bottom: 0; left: 0;"
        :widget-version="widgetVersion"
        :widget-id="widgetId"
        :debug-payload="widgetDebugPayload()"/>
    </div>
  </article>
</template>

<script>
  import Widget from '../../lib/mixins/widget';
  import Feedback from './shared/Feedback';

  import SessionDetailsContext from './thing-session-details/Context';
  import SessionDetailsRelations from './thing-session-details/Relations';
  import SessionDetailsWeather from './thing-session-details/Weather';

  export default {
    name: 'widget-thing-session-details',
    props: {sessionId: String},
    data: () => ({
      componentIdx: 0,
      componentList: [
        {title: 'Relations', component: SessionDetailsRelations},
        {title: 'Weather', component: SessionDetailsWeather},
        {title: 'Context', component: SessionDetailsContext}
      ]
    }),
    components: {Feedback},
    mixins: [Widget],
    computed: {
      widgetDebugData() {
        return _.omit(this.$data, ['api', 'componentList']);
      },
      component() {
        return this.componentList[this.componentIdx].component;
      }
    }
  }
</script>
