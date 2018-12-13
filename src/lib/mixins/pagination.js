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

// @onPaginationChanged
export default {
  data: () => ({paginationCount: 0, paginationEntries: [], paginationIdx: -1}),
  watch: {
    paginationIdx(idx) {
      this.$emit('onPaginationChanged', idx);
    }
  },
  methods: {
    paginationGoForward() {
      this.paginationJumpBy(1);
    },
    paginationGoBackwards() {
      this.paginationJumpBy(-1);
    },
    paginationJumpBy(num) {
      this.paginationIdx += num;
    },
    paginationJumpTo(idx) {
      if (idx < 0 || idx > this.paginationCount) {
        throw new RangeError('Invalid range for the pagination');
      }
      this.paginationIdx = idx;
    },
    paginationResetEntries(entries) {
      if (!Array.isArray(entries)) {
        throw new TypeError('An array is expected');
      }
      this.paginationIdx = -1;
      this.paginationEntries = entries;
      this.paginationCount = entries.length;
      setTimeout(() => this.paginationJumpTo(0));
    }
  },
  computed: {
    paginationEntry() {
      return this.paginationEntries[this.paginationIdx] || null;
    },
    paginationHasNext() {
      return (this.paginationIdx < this.paginationCount - 1);
    },
    paginationHasPrevious() {
      return this.paginationIdx > 0;
    }
  }
}
