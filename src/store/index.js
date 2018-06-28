/**
 * Copyright 2018 ThinxNet GmbH
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

import Vue from 'vue';
import VueResource from 'vue-resource';
import Vuex from 'vuex';

import Config from '../config';
import InsiderProgramApi from "../lib/api/InsiderProgramApi";
import RydApi from '../lib/api/RydApi';

Vue.use(VueResource);
Vue.use(Vuex);

export default new Vuex.Store(
  {
    modules: {
      common: {
        namespaced: true,
        state: {
          apiInsiderProgram: new InsiderProgramApi(Vue.http, Config.api.insiderProgram.baseURL),
          apiRyd: new RydApi(Vue.http, Config.api.tankTaler.baseURL),
          locale: null
        },
        getters: {
          apiInsiderProgram: state => state.apiInsiderProgram,
          apiRyd: state => state.apiRyd,
          locale: state => state.locale || Config.ui.defaultLocale
        }
      },
      authentication: {
        namespaced: true,
        state: {
          authToken: localStorage.getItem('authToken'),
          identity: null
        },
        getters: {
          authToken: state => state.authToken,
          isAuthenticated: state => state.authToken && state.identity !== null
        },
        mutations: {
          tokenUpdate: (state, token) => {
            try {
              if (token === null) {
                localStorage.removeItem("authToken");
              } else {
                localStorage.setItem('authToken', token);
              }
              state.authToken = token;
            } catch (e) { console.error(e); }
          },
          identityUpdate: (state, identity) => {
            state.identity = identity;
          }
        },
        actions: {
          logout: ctx => {
            ctx.commit("tokenUpdate", null);
            ctx.commit("identityUpdate", null);
          }
        }
      }
    }
  }
);
