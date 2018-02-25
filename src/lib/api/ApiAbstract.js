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

export default class ApiAbstract {
  constructor(client, url) {
    this.client = client;
    this.url = url;
  }

  /** @access protected */
  _request(path, payload, method = 'GET') {
    return this.client[method.toLowerCase()]([this.url, path].join('/'), payload)
      .then(r => r.body);
  }
}
