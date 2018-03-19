<template>
  <div class="column is-4 is-offset-4">
    <div class="box">
      <form>
        <div class="field">
          <div class="control">
            <input v-model="email"
              class="input is-large" type="email" placeholder="Your Email" autofocus="true">
          </div>
        </div>
        <div class="field">
          <div class="control">
            <input v-model="password"
              class="input is-large" type="password" placeholder="Your Password">
          </div>
        </div>
        <a :class="['button', 'is-block', 'is-large', isFormValid ? 'is-success' : 'is-info']"
          @click.prevent="login">Login</a>
      </form>
    </div>
    <p class="has-text-white has-text-weight-bold has-text-centered">
      <a href="https://www.tanktaler.de/blog/insider-program" target="_blank"
        class="has-text-white">What is it?</a>
    </p>
  </div>
</template>

<script>
  import Store from '../store';

  async function _ttIdentity(api) {
    try {
      return await api.authStatus();
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function _ttToken(api, email, password) {
    try {
      return (await api.authLogin(email, password)).auth_token;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  export default {
    name: 'login',
    data() {
      return {email: '', password: ''};
    },
    computed: {
      isFormValid() {
        return ~this.email.indexOf('@') && this.password.length > 4;
      }
    },
    async beforeRouteEnter (to, from, next) {
      if (!Store.getters['authentication/isAuthenticated']
        && Store.getters['authentication/authToken']) {
        const identity = await _ttIdentity(Store.getters['common/apiTankTaler']);
        if (identity) {
          Store.commit('authentication/identityUpdate', identity);
          return next(to.query.redirect);
        }
      }
      return next();
    },
    methods: {
      async login() {
        const tt4Api = Store.getters['common/apiTankTaler'],
          token = await _ttToken(tt4Api, this.email, this.password);
        if (token) {
          Store.commit('authentication/tokenUpdate', token);
        }
        const identity = await _ttIdentity(tt4Api);
        if (identity) {
          Store.commit('authentication/identityUpdate', identity);
        }
        this.$router.push(this.$route.query.redirect || {name: 'dashboard'});
      }
    }
  };
</script>
