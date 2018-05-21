<template>
  <article class="tile is-child box">
    <div class="tabs is-centered is-fullwidth">
      <ul v-for="(entry, idx) in componentList">
        <li :class="{'is-active': componentIdx === idx}">
          <a @click.prevent="componentIdx = idx">{{ entry.title }}</a>
        </li>
      </ul>
    </div>
    <component :is='component' :sessionId='sessionId' v-if='sessionId'></component>
  </article>
</template>

<script>
  import Widget from '../../lib/mixins/widget';

  import SessionDetailsEnvironment from './thing-session-details/Environment';
  import SessionDetailsRelations from './thing-session-details/Relations';
  import SessionDetailsWeather from './thing-session-details/Weather';

  export default {
    name: 'widget-thing-session-details',
    props: {sessionId: String},
    data: () => ({api: null, loading: true, payload: [], source: 'geo'}),
    mixins: [Widget],
    data() {
      return {
        componentIdx: 0,
        componentList: [
          {title: 'Relations', component: SessionDetailsRelations},
          {title: 'Weather', component: SessionDetailsWeather},
          {title: 'Environment', component: SessionDetailsEnvironment}
        ]
      };
    },
    computed: {
      component() {
        return this.componentList[this.componentIdx].component;
      }
    }
  }
</script>
