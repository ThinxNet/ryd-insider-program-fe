<template>
  <div class="column is-4 is-offset-4">
    <div class="box">
      <form @keyup.enter="login">
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
        <a :class="['button', 'is-block', 'is-large', isFormValid ? 'is-success' : 'is-info', {'is-loading': loading}]"
          :disabled="loading"
          @click.prevent="login">Login</a>
      </form>

    </div>

    <div class="notification is-danger" v-if="notification">
      <button class="delete" @click.prevent="notificationClose"></button>
      {{ notification }}
    </div>

    <p class="has-text-white has-text-weight-bold has-text-centered">
      <a href="https://www.ryd.one/blog/insider-program" target="_blank"
        class="has-text-white">What is it?</a>
    </p>
  </div>
</template>

<script>
  import Store from '../../store';

  export default {
    name: 'login',
    data: () => ({api: null, email: '', loading: false, notification: null, password: ''}),

    created() {
      this.api = this.$store.getters['common/apiRyd'];
    },

    computed: {
      isFormValid() {
        return ~this.email.indexOf('@') && this.password.length > 4;
      }
    },

    async beforeRouteEnter (to, from, next) {
      if (!Store.getters['authentication/isAuthenticated']
        && Store.getters['authentication/authToken']) {
        try {
          const identity = await Store.getters['common/apiRyd'].authStatus();
          if (identity) {
            Store.commit('authentication/identityUpdate', identity);
            return next(to.query.redirect);
          }
        } catch (e) {
          console.error(e);
        }
      }
      return next();
    },

    methods: {
      async login() {
        this.loading = true;

        try {
          const token = (await this.api.authLogin(this.email, this.password)).auth_token;
          if (token) {
            Store.commit('authentication/tokenUpdate', token);
          }
          const identity = await this.api.authStatus();
          if (identity) {
            Store.commit('authentication/identityUpdate', identity);
          }
        } catch (e) {
          this.notification = e.body ? e.body.message : e.message;
          return;
        } finally {
          this.loading = false;
        }

        this.$router.push(this.$route.query.redirect || {name: 'dashboard'});
      },
      notificationClose() {
        this.notification = null;
      }
    }
  };
</script>
