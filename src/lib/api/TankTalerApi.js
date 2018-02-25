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

import ApiAbstract from './ApiAbstract';

export default class TankTalerApi extends ApiAbstract {
  authLogin(email, password, clientId = 'ip_tt') {
    return this._request('auth/login/local', {email, password, clientId}, 'POST');
  }

  authLogout() {
    return this._request('auth/logout', null, 'POST');
  }

  authStatus() {
    return this._request('auth/status');
  }
};
