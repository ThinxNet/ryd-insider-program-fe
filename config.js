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

import _ from 'lodash';

const defaults = {
  ui: {
    defaultLocale: 'de' // i.e. de-at
  },
  api: {
    ryd: {
      baseURL: 'https://tt4.thinxcloud-staging.de'
    },
    insiderProgram: {
      baseURL: 'http://localhost:8080'
    }
  }
};

export default {
  development: _.defaultsDeep({
    ui: {
      defaultLocale: 'en' // i.e. en-gb
    },
    api: {
      insiderProgram: {
        baseURL: 'http://localhost:8080'
      }
    }
  }, defaults),

  staging:  _.defaultsDeep({
    api: {
      insiderProgram: {
        baseURL: 'https://insider-api.thinxcloud-staging.de'
      }
    }
  }, defaults),

  production:  _.defaultsDeep({
    api: {
      ryd: {
        baseURL: 'https://tt4.thinxcloud.de'
      },
      insiderProgram: {
        baseURL: 'https://insider-api.thinxcloud.de'
      }
    }
  }, defaults)
};
