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

export default class InsiderProgramApi extends ApiAbstract {
  deviceConfidence(id, params) {
    return this._request(`devices/${id}/confidence`, {params});
  }

  thingsFetchAll(params) {
    return this._request('things', {params});
  }

  thingsFetchOne(id, params) {
    return this._request(`things/${id}`, {params});
  }

  statisticsActivity(thingId, params) {
    return this._request(`statistics/${thingId}/activity`, {params});
  }

  sessionsFetchAll(params) {
    return this._request('sessions', {params});
  }

  sessionsFetchOne(id, params) {
    return this._request(`sessions/${id}`, {params});
  }

  sessionLocations(id, params) {
    return this._request(`sessions/${id}/locations`, {params});
  }

  sessionWeather(id, params) {
    return this._request(`sessions/${id}/weather`, {params});
  }

  sessionEnvironment(id, params) {
    return this._request(`sessions/${id}/environment`, {params});
  }

  sessionAlike(id, params) {
    return this._request(`sessions/${id}/alike`, {params});
  }
};
