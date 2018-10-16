<template>
  <article class="tile is-child">
    <div class="tabs box is-centered is-small is-fullwidth is-radiusless">
      <ul v-for="(entry, idx) in componentList">
        <li :class="{'is-active': componentIdx === idx}">
          <a @click.prevent="componentIdx = idx">{{ entry.title }}</a>
        </li>
      </ul>
    </div>
    <div class="box is-radiusless" style="min-height: 16.95rem;">
      <div v-if="!sessionId" class="has-text-centered">
        <span class="icon is-large"><i class="ion-ios-time"></i></span>
      </div>

      <transition v-else name="fade" mode="out-in" :duration="100">
        <component :is='component' :sessionId='sessionId'/>
      </transition>

      <div class="columns is-flex">
        <div class="column is-2">
          <span class="tag is-size-7" title="Version"><small>v</small>{{ widgetVersion }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
  import Widget from '../../lib/mixins/widget';

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
    mixins: [Widget],
    computed: {
      component() {
        return this.componentList[this.componentIdx].component;
      }
    }
  }
</script>
