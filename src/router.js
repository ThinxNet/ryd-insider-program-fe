import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import ComponentsLogin from './components/Login';
import ComponentsDashboard from './components/Dashboard';

export default new VueRouter({
  routes: [
    {path: '/', name: 'dashboard', component: ComponentsDashboard},
    {path: '/login', name: 'login', component: ComponentsLogin}
  ]
});
