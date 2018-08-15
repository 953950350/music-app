<template>
  <transition name="user">
    <div class="user-center">
      <div class="icon" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
      </div>
      <div class="play-wrapper" ref="play" @click="playAll">
        <div class="paly">
          <span class="icon-play"></span>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll class="list-scroll" ref="likeList" v-if="currentIndex === 0" :data="likeSongs">
          <div class="list-inner">
            <song-list :songs="likeSongs" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll class="list-scroll" ref="playList" v-if="currentIndex === 1" :data="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultText"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
import switches from 'base/switches/switches'
import songList from 'base/song-list/song-list'
import { mapGetters, mapActions } from 'vuex'
import scroll from 'base/scroll/scroll'
import Song from 'common/js/song'
import { playlistMixin } from 'common/js/mixin'
import noResult from 'base/no-result/no-result'
export default {
  mixins: [playlistMixin],
  data() {
    return {
      switches: [
        { name: '我喜欢的' },
        { name: '最近听的' }
      ],
      currentIndex: 0
    }
  },
  methods: {
    back() {
      this.$router.back()
    },
    switchItem(index) {
      this.currentIndex = index

      setTimeout(_ => {
        if (this.currentIndex === 0) {
          this.$refs.likeList && this.$refs.likeList.refresh()
        } else {
          this.$refs.playList && this.$refs.playList.refresh()
        }
      }, 20)
    },
    selectSong(song, index) {
      this.insertSong(new Song(song))
    },
    playAll() {
      let list = this.currentIndex === 0 ? this.likeSongs : this.playHistory
      list = list.map(song => {
        return new Song(song)
      })
      this.randomPlay({
        list
      })
    },
    handlePlaylist(playList) {
      let bottom = playList.length ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      this.$refs.likeList && this.$refs.likeList.refresh()
      this.$refs.playList && this.$refs.playList.refresh()
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  computed: {
    noResult() {
      if (this.currentIndex === 0) {
        return !this.likeSongs.length
      } else {
        return !this.playHistory.length
      }
    },
    noResultText() {
      if (this.currentIndex === 0) {
        return '暂无收藏歌曲'
      } else {
        return '您还没有听过歌曲'
      }
    },
    ...mapGetters([
      'playHistory',
      'likeSongs'
    ])
  },
  components: {
    switches,
    songList,
    scroll,
    noResult
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
.user-center {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  background-color: @color-background;
  &.user-enter,
  &.user-leave-to {
    transform: translate3d(100%, 0, 0);
  }
  &.user-enter-active,
  &.user-leave-active {
    transition: all 0.3s;
  }
  .icon {
    position: absolute;
    left: 6px;
    top: 0;
    z-index: 50;
    .icon-back {
      display: block;
      font-size: @font-size-large-x;
      padding: 10px;
      color: @color-theme;
    }
  }
  .switches-wrapper {
    margin: 10px 0 30px;
  }
  .play-wrapper {
    width: 100%;
    z-index: 50;
    .paly {
      box-sizing: border-box;
      width: 135px;
      padding: 7px 0;
      margin: 0 auto;
      text-align: center;
      border: 1px solid @color-theme;
      color: @color-theme;
      border-radius: 100px;
      font-size: 0;
      .icon-play {
        font-size: 16px;
        margin-right: 6px;
        vertical-align: middle;
        display: inline-block;
      }
      .text {
        font-size: 12px;
        vertical-align: middle;
        display: inline-block;
      }
    }
  }
  .list-wrapper {
    position: absolute;
    top: 110px;
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
  .no-result-wrapper {
    position: absolute;
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
  }
}
</style>

