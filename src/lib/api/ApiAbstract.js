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

export default class ApiAbstract {
  constructor(client, url, version) {
    this.client = client;
    this.url = url;
    this.version = version;
  }

  /** @access protected */
  _request(path, config = {}, httpMethod = 'GET') {
    const method = httpMethod.toLowerCase();
    if (method === 'get') {
      config.params = Object.assign({}, config.params, {_v: this.version});
    }
    return this.client[method]([this.url, path].join('/'), config).then(r => r.body);
  }
}
