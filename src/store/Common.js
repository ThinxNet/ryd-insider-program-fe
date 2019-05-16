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

import {Vue} from '../instance';

import config from 'config';
import InsiderProgramApi from '../lib/api/InsiderProgramApi';
import RydApi from '../lib/api/RydApi';

export default {
  namespaced: true,
  state: {
    apiInsiderProgram: new InsiderProgramApi(
      Vue.http, config.api.insiderProgram.baseURL, process.env.SCM_COMMIT_ID
    ),
    apiRyd: new RydApi(Vue.http, config.api.ryd.baseURL, process.env.SCM_COMMIT_ID),
    locale: null
  },
  getters: {
    apiInsiderProgram: state => state.apiInsiderProgram,
    apiRyd: state => state.apiRyd,
    locale: state => state.locale || config.ui.defaultLocale
  }
};
