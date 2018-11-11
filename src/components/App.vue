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
            <span
              data-target="navbar-menu"
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
          <div id="navbar-menu"
            v-if="isAuthenticated"
            :class="['navbar-menu', {'is-active': uiIsMenuActive}]">
            <div class="navbar-end">
              <a @click.prevent="feedbackFormOpen" class="navbar-item">Feedback</a>
              <a @click.prevent="logout" class="navbar-item">Log-out</a>
            </div>
          </div>
        </div>
      </header>
    </div>

    <div class="hero-body">
      <div class="container">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
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
  export default {
    name: 'app',
    data: () => ({uiIsMenuActive: false}),
    computed: {
      isAuthenticated() {
        return this.$store.getters['authentication/isAuthenticated'];
      }
    },
    methods: {
      async logout() {
        try {
          await this.$store.getters['common/apiRyd'].authLogout();
          this.$store.dispatch('authentication/logout');
          this.$router.push({name: 'login'});
        } catch (e) { console.error(e); }
      },
      feedbackFormOpen() {
        this.$store.dispatch(
          'componentWidgetMixin/feedbackFormActivate',
          {widgetId: 'ryd.one insider program', payload: "{}"}
        );
      }
    }
  };
</script>
