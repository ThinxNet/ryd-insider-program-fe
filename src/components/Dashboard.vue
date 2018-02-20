<template>
  <div class="column">
    <widget-things @onEntrySelected="thingChange"></widget-things>
    <widget-thing-charts v-if="thing" :entity="thing"></widget-thing-charts>

    <div class="tile is-ancestor">

      <div class="tile">
        <div class="tile is-parent is-4">
          <div class="tile is-parent">
              <div class="card tile is-child">
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
                  </figure>
                </div>
                <div class="card-content">
                  <div class="content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                    <a href="#">#css</a> <a href="#">#responsive</a>
                    <br>
                    <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>


        <!--<div class="tile is-vertical is-7">
          <div class="tile">
            <div class="tile is-parent">
              <article class="tile is-child">
                <p class="title">Middle box</p>
                <p class="subtitle">With an image</p>
                <figure class="image is-4by3">
                  <img src="https://bulma.io/images/placeholders/640x480.png">
                </figure>
              </article>
            </div>

            <div class="tile is-parent">
              <article class="tile is-child">
                <div class="content">
                  <p class="title">Tall tile</p>
                  <p class="subtitle">With even more content</p>
                  <div class="content">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div class="tile is-parent">
            <article class="tile is-child">
              <div class="content">
                <p class="title">Insider Program</p>
                <p class="subtitle">Subtitle</p>
                <div class="content">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.</p>
                  <p>Suspendisse varius ligula in molestie lacinia. Maecenas varius eget ligula a sagittis. Pellentesque interdum, nisl nec interdum maximus, augue diam porttitor lorem, et sollicitudin felis neque sit amet erat. Maecenas imperdiet felis nisi, fringilla luctus felis hendrerit sit amet. Aenean vitae gravida diam, finibus dignissim turpis. Sed eget varius ligula, at volutpat tortor.</p>
                  <p>Integer sollicitudin, tortor a mattis commodo, velit urna rhoncus erat, vitae congue lectus dolor consequat libero. Donec leo ligula, maximus et pellentesque sed, gravida a metus. Cras ullamcorper a nunc ac porta. Aliquam ut aliquet lacus, quis faucibus libero. Quisque non semper leo.</p>
                </div>
              </div>
            </article>
          </div>

      </div>-->

    </div>

  </div>
</template>

<script>
  import WidgetThings from './widgets/Things';
  import WidgetThingCharts from './widgets/ThingCharts';

  export default {
    name: 'dashboard',
    data() {
      return {thing: null};
    },
    components: {
      WidgetThings, WidgetThingCharts
    },
    computed: {
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      }
    },
    methods: {
      thingChange(thing) {
        this.thing = thing;
      }
    }
  }
</script>
