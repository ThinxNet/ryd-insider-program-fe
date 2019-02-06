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

import {VueRouter} from './instance';

import ComponentsDashboard from './components/dashboard/Route';
import ComponentsFeedback from './components/feedback/Route';
import ComponentsLogin from './components/login/Route';

export default new VueRouter({
  routes: [
    {component: ComponentsDashboard, name: 'dashboard', path: '/'},
    {component: ComponentsLogin, name: 'login', path: '/login'},
    {component: ComponentsFeedback, name: 'feedback', path: '/feedback'}
  ]
});
