<template>
  <div :class="['dropdown is-unselectable', {'is-active': uiIsMenuActive}]"
    @click.exact="uiToggleMenu()">
    <div class="dropdown-trigger">
      <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu3">
        <span class="icon is-small"><i class="icon ion-ios-settings"></i></span>
        <span class="icon is-small">
          <i class="icon ion-ios-arrow-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu3" role="menu">
      <div class="dropdown-content is-unselectable">
        <a v-for="(entry, idx) in entryList" href="#"
          :class="['dropdown-item', {'is-active': isEntryActive(idx)}]"
          @click.prevent="entryActivate(idx)">
          {{ entry.title }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'dropdown',
    props: {
      active: {default: false, type: Boolean},
      activeIdx: {default: null, type: Number},
      entryList: {default: [], type: Array}
    },
    data: () => ({uiIsMenuActive: false, entryActiveIdx: null}),
    created() {
      this.entryActiveIdx = this.activeIdx;
      this.uiIsMenuActive = this.active;
    },
    methods: {
      entryActivate(idx) {
        this.entryActiveIdx = idx;
        this.$emit('onEntryChange', this.entryList[idx].value);
      },
      isEntryActive(idx) {
        return this.entryActiveIdx === idx;
      },
      uiToggleMenu() {
        this.uiIsMenuActive = !this.uiIsMenuActive;
      }
    }
  }
</script>
