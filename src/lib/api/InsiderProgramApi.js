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

import ApiAbstract from './ApiAbstract';

export default class InsiderProgramApi extends ApiAbstract {
  // /things
  things(params) {
    return this._request('things', {params});
  }

  thing(id, params) {
    return this._request(`things/${id}`, {params});
  }

  thingDevice(id, params) {
    return this._request(`things/${id}/device`, {params});
  }

  thingDeviceConfidence(thingId, params) {
    return this._request(`things/${thingId}/device/confidence`, {params});
  }

  // /statistics
  statisticsActivity(thingId, params) {
    return this._request(`statistics/${thingId}/activity`, {params});
  }

  // sessions
  sessions(params) {
    return this._request('sessions', {params});
  }

  session(id, params) {
    return this._request(`sessions/${id}`, {params});
  }

  sessionConsumption(id) {
    return this._request(`sessions/${id}/consumption`);
  }

  sessionLocations(id, params) {
    return this._request(`sessions/${id}/locations`, {params});
  }

  sessionHighlights(id) {
    return this._request(`sessions/${id}/highlights`);
  }

  sessionWeather(id, params) {
    return this._request(`sessions/${id}/weather`, {params});
  }

  sessionEvents(id, params) {
    return this._request(`sessions/${id}/events`, {params});
  }

  sessionEnvironment(id, params) {
    return this._request(`sessions/${id}/environment`, {params});
  }

  sessionEnvironmentOverspeed(id, params) {
    return this._request(`sessions/${id}/environment/overspeed`, {params});
  }

  sessionAlike(id, params) {
    return this._request(`sessions/${id}/alike`, {params});
  }

  // feedback
  feedback(params) {
    return this._request('feedback', {params});
  }

  feedbackWidgetEntryNew(id, data) {
    return this._request(`feedback/widget/${id}`, data, 'POST');
  }
};
