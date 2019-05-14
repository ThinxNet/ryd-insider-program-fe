<template>
  <section id="app" class="hero is-fullheight">
    <div class="hero-head">
      <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
        <div class="container">
          <div class="navbar-brand">
            <a class="navbar-item">
              <img src="https://ryd.one/wp-content/uploads/ryd_logo.png" alt="Ryd">
            </a>
            <a v-if="isAuthenticated"
              @click.prevent="uiIsMenuActive = !uiIsMenuActive"
              :class="['navbar-burger burger', {'is-active': uiIsMenuActive}]"
              role="button" aria-label="menu" aria-expanded="false" data-target="navbar-menu">
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <navbar-menu :is-active="uiIsMenuActive" v-if="isAuthenticated"/>
        </div>
      </nav>
    </div>

    <div class="hero-body">
      <div class="container">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>

      <feedback-notifications v-once :timeout="60000"></feedback-notifications>
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
  import NavbarMenu from './NavbarMenu';
  import FeedbackNotifications from './feedback/Notifications';
  import FeedbackForm from './feedback/Form';

  export default {
    name: 'layout',
    data: () => ({uiIsMenuActive: false}),
    components: {NavbarMenu, FeedbackNotifications, FeedbackForm},
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
