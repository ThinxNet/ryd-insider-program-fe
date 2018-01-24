<template>
  <section class="hero is-fullheight">
    <div class="hero-head">
    <header class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item">
            <img
              src="https://storage.googleapis.com/instapage-user-media/8c07daac/5426852-0-TankTaler-Logo-wei.png"
              alt="TankTaler">
          </a>
          <span class="navbar-burger burger" data-target="navbar-menu">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <div id="navbar-menu" class="navbar-menu">
          <div class="navbar-end">
            <a class="navbar-item" @click.prevent="logout">Log-out</a>
          </div>
        </div>
      </div>
    </header>
  </div>

    <div class="hero-body">
      <div class="container has-text-centered">
        <pre>{{identity}}</pre>
      </div>
    </div>
    <div class="hero-foot">
      <nav class="tabs is-fullwidth">
        <div class="container">
          <ul>
            <li>
              <a href="https://github.com/ThinxNet/tanktaler-insider-program-fe"
                target="_blank">GitHub</a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </section>
</template>

<script>
  export default {
    name: 'lobby',
    data() {
      return {};
    },
    computed: {
      identity() {
        return JSON.stringify(this.$store.state.authentication.identity);
      }
    },
    methods: {
      async logout() {
        try {
          await this.$store.getters['common/apiTankTaler'].authLogout();
          window.location.reload();
        } catch (e) { console.error(e); }
      }
    }
  }
</script>
