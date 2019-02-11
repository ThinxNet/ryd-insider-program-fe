/**
 * Copyright 2019 ThinxNet GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import './assets/styles.css';

import Router from './router';
import Store from './store';
import Vue from 'vue';

import ComponentsApp from './App.vue';

import lodash from 'lodash';
import moment from 'moment';
import pluralize from 'pluralize';

Vue.prototype.$_ = lodash;
Vue.prototype.$moment = moment;
Vue.prototype.$plural = pluralize;

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
    ? next({name: 'login', query: {redirect: to.fullPath}})
    : next();
});

new Vue({
  el: '#app',
  render: h => h(ComponentsApp),
  router: Router,
  store: Store,
  beforeCreate() {
    L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
    this.$moment.locale(this.$store.getters['common/locale']);
  }
});
