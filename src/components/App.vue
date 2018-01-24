<template>
  <div id="app">
    <transition name="fade">
      <router-view></router-view>
    </transition>
    <slot name="header"></slot>
    <slot name="content"></slot>
    <slot name="footer"></slot>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {};
    },
    components: {},
    methods: {},
    mounted() {},
    computed: {}
  };
</script>
