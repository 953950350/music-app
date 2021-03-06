<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll class="list-content" :data="playList" ref="listContent" :refreshDelay="refreshDelay">
          <transition-group tag="ul" name="list">
            <li ref="listItem" class="item" v-for="(item, index) in sequenceList" :key="item.id" @click="selectItem(item, index)">
              <i class="current" :class="{'icon-play': item.id === currentSong.id}"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="toggleLike(item)">
                <i :class="getLikeIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="showAddSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
        <confirm text="是否清空播放列表" @confirm="clearPlaylist" confirmBtnText="清空" ref="confirm"></confirm>
        <add-song ref="addSong"></add-song>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import scroll from 'base/scroll/scroll'
import { playMode } from 'common/js/config'
import confirm from 'base/confirm/confirm'
import { playerMixin } from 'common/js/mixin'
import addSong from 'components/add-song/add-song'
export default {
  mixins: [playerMixin],
  data() {
    return {
      showFlag: false,
      refreshDelay: 100
    }
  },
  methods: {
    show() {
      this.showFlag = true
      setTimeout(_ => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    selectItem(item, index) {
      if (item.id === this.currentSong.id) return
      if (this.mode === playMode.random) {
        index = this.playList.findIndex(song => {
          return song.id === item.id
        })
      }
      this.setCurrentIndex(index)
      this.setPlayingState(true)
    },
    scrollToCurrent(current) {
      const index = this.sequenceList.findIndex(song => {
        return song.id === current.id
      }) - 3
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    deleteOne(song) {
      this.deleteSong(song)
      if (!this.playList.length) {
        this.hide()
      }
    },
    clearPlaylist() {
      this.deleteSongList()
      this.hide()
    },
    showConfirm() {
      this.$refs.confirm.show()
    },
    showAddSong() {
      this.$refs.addSong.show()
    },
    ...mapActions([
      'selectPlay',
      'deleteSong',
      'deleteSongList'
    ]),
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    })
  },
  computed: {
    modeText() {
      return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
    }
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (this.showFlag && newSong.id !== oldSong.id) {
        this.scrollToCurrent(newSong)
      }
    }
  },
  components: {
    scroll,
    confirm,
    addSong
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.playlist {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 200;
  background-color: @color-background-d;
  &.list-fade-enter,
  &.list-fade-leave-to {
    opacity: 0;
    .list-wrapper {
      transform: translateY(100%);
    }
  }
  &.list-fade-enter-active,
  &.list-fade-leave-active {
    transition: opacity 0.3s linear;
    .list-wrapper {
      transition: all 0.3s linear;
    }
  }
  .list-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: @color-highlight-background;
    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;
      .title {
        display: flex;
        align-items: center;
        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: @color-theme-d;
        }
        .text {
          flex: 1;
          font-size: @font-size-medium;
          color: @color-text-l;
        }
        .clear {
          .extend-click();
          .icon-clear {
            font-size: @font-size-medium;
            color: @color-text-d;
          }
        }
      }
    }
    .list-content {
      max-height: 240px;
      overflow: hidden;
      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;
        &.list-enter,
        &.list-leave-to {
          height: 0;
        }
        &.list-enter-active,
        &.list-leave-active {
          transition: all 0.3s;
        }
        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: @font-size-small;
          color: @color-theme-d;
        }
        .text {
          flex: 1;
          .no-wrap();
          font-size: @font-size-medium;
          color: @color-text-d;
        }
        .like {
          .extend-click();
          margin-right: 15px;
          font-size: @font-size-small;
          color: @color-theme;
          .icon-favorite {
            color: @color-sub-theme;
          }
        }
        .delete {
          .extend-click();
          font-size: @font-size-small;
          color: @color-theme;
        }
      }
    }
    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;
      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid @color-text-l;
        border-radius: 100px;
        color: @color-text-l;
        .icon-add {
          margin-right: 5px;
          font-size: @font-size-small-s;
        }
        .text {
          font-size: @font-size-small;
        }
      }
    }
    .list-close {
      text-align: center;
      line-height: 50px;
      font-size: @font-size-medium-x;
      color: @color-text-l;
      background-color: @color-background;
    }
  }
}
</style>

