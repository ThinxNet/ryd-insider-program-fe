import './assets/styles.css';

import Vue from 'vue';

import Store from './store';
import Router from './router';

Vue.http.interceptors.push((request, next) => {
  const token = Store.getters['authentication/authToken'];
  if (token) {
    request.headers.set('X-Txn-Auth-Token', token);
  }
  request.headers.set('Content-Language', Store.getters['common/locale']);
  next();
});

Router.beforeEach((to, from, next) => {
  return (to.name !== 'login' && !Store.getters['authentication/isAuthenticated'])
    ? next({path: '/login', query: {redirect: to.fullPath}})
    : next();
});

import ComponentsApp from './components/App.vue';

new Vue({
  el: '#app',
  render: h => h(ComponentsApp),
  router: Router,
  store: Store
});
