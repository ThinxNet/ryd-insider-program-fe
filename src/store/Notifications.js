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

import _ from 'lodash';

class Notification {
  constructor(namespace, caption = 'No caption', payload = {}) {
    this._namespace = namespace;
    this._caption = caption;
    this._payload = payload;
  }

  get caption() {
    return this._caption;
  }

  get namespace() {
    return this._namespace;
  }

  get payload() {
    return this._payload;
  }
}

export default {
  namespaced: true,
  state: {entries: {}},
  getters: {
    entries: state => _(state.entries).values().map(_.toArray).flatten().value(),
    entriesNamespaced: state => namespace => [...(state.entries[namespace] || [])],
    namespaces: state => Object.keys(state.entries)
  },
  mutations: {
    entryAdd: (state, entry) => {
      if (!state.entries[entry.namespace]) {
        state.entries[entry.namespace] = new Set();
      }
      state.entries[entry.namespace].add(entry);
    },
    entryRemove: (state, entry) => {
      state.entries[entry.namespace].delete(entry);
      if (!state.entries[entry.namespace].size) {
        delete state.entries[entry.namespace];
      }
    }
  },
  actions: {
    entryAdd: (ctx, data) => {
      ctx.commit("entryAdd", new Notification(data.namespace, data.caption, data.payload));
    },
    entryRemove: (ctx, notification) => {
      if (!(notification instanceof Notification)) {
        throw TypeError('Notification is expected');
      }
      ctx.commit("entryRemove", notification);
    }
  }
};
