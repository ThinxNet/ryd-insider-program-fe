import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import ComponentsLogin from './components/Login.vue';
import ComponentsLobby from './components/Lobby.vue';

export default new VueRouter({
  routes: [
    {path: '/', name: 'lobby', component: ComponentsLobby},
    {path: '/login', name: 'login', component: ComponentsLogin}
  ]
});
