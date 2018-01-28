import Vue from 'vue';
import VueResource from 'vue-resource';
import Vuex from 'vuex';

import Config from '../config';
import TankTalerApi from '../lib/api/TankTalerApi'

Vue.use(VueResource);
Vue.use(Vuex);

export default new Vuex.Store(
  {
    modules: {
      common: {
        namespaced: true,
        state: {
          apiTankTaler: new TankTalerApi(Vue.http, Config.api.tankTaler.url),
          locale: null
        },
        getters: {
          apiTankTaler: state => state.apiTankTaler,
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
