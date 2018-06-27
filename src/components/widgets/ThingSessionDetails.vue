<template>
  <article class="tile is-child">
    <div class="tabs box is-centered is-small is-fullwidth is-radiusless">
      <ul v-for="(entry, idx) in componentList">
        <li :class="{'is-active': componentIdx === idx}">
          <a @click.prevent="componentIdx = idx">{{ entry.title }}</a>
        </li>
      </ul>
    </div>
    <component class="box is-radiusless" :is='component' :sessionId='sessionId' v-if='sessionId'/>
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
