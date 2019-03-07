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

// @onPaginationChanged
export default {
  data: () => ({paginationEntries: [], paginationIdx: 0, paginationSize: 0}),
  methods: {
    paginationGoForward() {
      this.paginationJumpBy(1);
    },
    paginationGoBackwards() {
      this.paginationJumpBy(-1);
    },
    paginationJumpBy(num) {
      this.paginationJumpTo(this.paginationIdx + num);
    },
    paginationJumpTo(idx) {
      if (idx < 0 || idx > this.paginationSize) {
        throw new RangeError('Invalid range for the pagination');
      }
      this.paginationIdx = idx;
      this.$emit('onPaginationChanged', idx);
    },
    paginationResetEntries(entries) {
      if (!Array.isArray(entries)) {
        throw new TypeError('An array is expected');
      }
      this.paginationEntries = entries;
      this.paginationSize = entries.length;
      this.paginationJumpTo(0);
    }
  },
  computed: {
    paginationEntry() {
      return this.paginationEntries[this.paginationIdx] || null;
    },
    paginationHasEntries() {
      return this.paginationSize > 0;
    },
    paginationHasNext() {
      return (this.paginationIdx < this.paginationSize - 1);
    },
    paginationHasPrevious() {
      return this.paginationIdx > 0;
    }
  }
}
