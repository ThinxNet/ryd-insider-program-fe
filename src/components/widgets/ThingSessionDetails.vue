<template>
  <article class="tile is-child">
    <div class="tabs box is-centered is-small is-fullwidth is-radiusless">
      <ul v-for="(entry, idx) in componentList">
        <li :class="{'is-active': componentIdx === idx}">
          <a @click.prevent="componentIdx = idx" :title="entry.title">
             <span class="icon"><i :class="entry.icon"></i></span>
          </a>
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
  import SessionDetailsHighlights from './thing-session-details/Highlights';
  import SessionDetailsRelations from './thing-session-details/Relations';
  import SessionDetailsTags from './thing-session-details/Tags';
  import SessionDetailsWeather from './thing-session-details/Weather';

  export default {
    name: 'widget-thing-session-details',
    props: {sessionId: String},
    data: () => ({
      componentIdx: 1,
      componentList: [
        {component: SessionDetailsTags, icon: 'ion-md-pricetags', title: 'Tags'},
        {component: SessionDetailsRelations, icon: 'ion-md-git-compare', title: 'Relations'},
        {component: SessionDetailsHighlights, icon: 'ion-md-pulse', title: 'Highlights'},
        {component: SessionDetailsWeather, icon: 'ion-md-partly-sunny', title: 'Weather'},
        {component: SessionDetailsContext, icon: 'ion-md-compass', title: 'Context'}
      ]
    }),
    components: {Feedback},
    mixins: [Widget],
    computed: {
      widgetDebugData() {
        return _(this.$data).merge(this.$props).omit(['api', 'componentList']).value();
      },
      component() {
        return this.componentList[this.componentIdx].component;
      }
    }
  }
</script>
