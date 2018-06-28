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
  data: () => ({paginationIdx: 0, paginationEntries: []}),
  methods: {
    paginationGoForward() {
      this.paginationJumpBy(1);
    },
    paginationGoBackwards() {
      this.paginationJumpBy(-1);
    },
    paginationJumpBy(num) {
      this.paginationIdx += num;
      this.$emit('onPaginationChanged');
    },
    paginationResetEntries(entries) {
      this.paginationIdx = 0;
      this.paginationEntries = entries;
      this.paginationJumpBy(0);
    }
  },
  computed: {
    paginationEntry() {
      return this.paginationEntries[this.paginationIdx] || null;
    },
    paginationHasNext() {
      return (this.paginationIdx < this.paginationEntries.length - 1);
    },
    paginationHasPrevious() {
      return this.paginationIdx > 0;
    }
  }
}
