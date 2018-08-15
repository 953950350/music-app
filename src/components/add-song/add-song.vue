<template>
  <transition name="add-song">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <searchBox @query="queryChange" placeholder="搜索歌曲" ref="searchBox"></searchBox>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll :refreshDelay="refreshDelay" class="list-scroll" v-if="currentIndex === 0" :data="playHistory" ref="listScroll">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll :refreshDelay="refreshDelay" class="list-scroll" v-if="currentIndex === 1" :data="searchHistory" ref="listScroll">
            <div class="list-inner">
              <searchList :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></searchList>
            </div>
          </scroll>
        </div>
      </div>
      <div class="serch-result" v-show="query">
        <suggest :showSinger="showSinger" :query="query" @listScroll="blurInput" ref="suggest" @select="saveSearch"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="top-title">
          <i class="icon-ok"></i>
          <span class="text">
            1首歌曲已经添加到播放列表
          </span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import searchBox from 'base/search-box/search-box'
import suggest from 'components/suggest/suggest'
import { searchMixin } from 'common/js/mixin'
import switches from 'base/switches/switches'
import { mapGetters, mapActions } from 'vuex'
import songList from 'base/song-list/song-list'
import scroll from 'base/scroll/scroll'
import Song from 'common/js/song'
import searchList from 'base/search-list/search-list'
import topTip from 'base/top-tip/top-tip'
export default {
  data() {
    return {
      showFlag: false,
      addSuccess: false,
      query: '',
      showSinger: false,
      switches: [
        { name: '最近播放' },
        { name: '搜索历史' }
      ],
      currentIndex: 0
    }
  },
  methods: {
    show() {
      this.showFlag = true
      setTimeout(_ => {
        this.$refs.listScroll.refresh()
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    switchItem(index) {
      this.currentIndex = index
      setTimeout(_ => {
        this.$refs.listScroll.refresh()
      }, 20)
    },
    selectSong(song, index) {
      this.insertSong(new Song(song))
      this.$refs.topTip.show()
    },
    ...mapActions([
      'insertSong'
    ])
  },
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  components: {
    searchBox,
    suggest,
    switches,
    songList,
    scroll,
    searchList,
    topTip
  },
  watch: {
    query(newVal) {
      if (!newVal) {
        setTimeout(_ => {
          this.$refs.listScroll.refresh()
        }, 20)
      }
    }
  },
  mixins: [searchMixin]
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 200;
  width: 100%;
  background-color: @color-background;
  &.add-song-enter,
  &.add-song-leave-to {
    transform: translate3d(100%, 0, 0);
  }
  &.add-song-enter-active,
  &.add-song-leave-active {
    transition: all 0.3s linear;
  }
  .header {
    position: relative;
    height: 44px;
    text-align: center;
    .title {
      line-height: 44px;
      font-size: @font-size-large;
      color: @color-text;
    }
    .close {
      position: absolute;
      top: 0;
      right: 8px;
      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: @color-theme;
      }
    }
  }
  .search-box-wrapper {
    margin: 20px;
  }
  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }
  .serch-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }
  .top-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok {
      font-size: @font-size-medium;
      color: @color-theme;
      margin-right: 4px;
    }
    .text {
      font-size: @font-size-medium;
      color: @color-text;
    }
  }
}
</style>
