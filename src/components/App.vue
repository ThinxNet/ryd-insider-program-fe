<template>
  <section id="app" class="hero is-fullheight">
    <div class="hero-head">
      <header class="navbar">
        <div class="container">
          <div class="navbar-brand">
            <a class="navbar-item">
              <img
                src="https://ryd.one/wp-content/uploads/ryd_logo.png"
                alt="Ryd">
            </a>
            <span data-target="navbar-menu"
              v-if="isAuthenticated"
              @click.prevent="uiIsMenuActive = !uiIsMenuActive"
              :class="[
                'navbar-burger burger',
                {'has-background-primary': !uiIsMenuActive, 'has-background-white': uiIsMenuActive}
              ]">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>

          <navbar-menu :is-active="uiIsMenuActive"/>
        </div>
      </header>
    </div>

    <div class="hero-body">
      <div class="container">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>

      <feedback-form style="z-index: 9999"
        v-if="$store.getters['componentWidgetMixin/isFeedbackFormActive']"/>
    </div>

    <div class="hero-foot">
      <nav class="tabs is-fullwidth">
        <div class="container">
          <ul>
            <li>
              <a href="https://github.com/ThinxNet/ryd-insider-program-fe"
                class="has-text-white" target="_blank">GitHub</a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </section>
</template>

<script>
  import FeedbackForm from './feedback/Form';
  import NavbarMenu from './NavbarMenu';

  export default {
    name: 'app',
    data: () => ({uiIsMenuActive: false}),
    components: {NavbarMenu, FeedbackForm},
    computed: {
      isAuthenticated() {
        return this.$store.getters['authentication/isAuthenticated'];
      }
    },
    mounted() {
      this.$store.subscribeAction(action => {
        if (action.type !== 'authentication/logout') { return; }
        this.$store.getters['common/apiRyd'].authLogout()
          .then(() => this.$router.push({name: 'login'}))
          .catch(console.error);
      });
    }
  };
</script>
