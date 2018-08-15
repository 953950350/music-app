<template>
  <div class="music-list">
    <div class="icon" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 v-html="title" class="title"></h1>
    <div class="bg-image" :style="backgroundImage" ref="bgImage">
      <div class="play-wrapper" ref="play">
        <div class="paly" @click="random">
          <span class="icon-play"></span>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="bgLayer"></div>
    <scroll class="list" ref="list" @scroll="scroll" :data="songs" :listenScroll="listenScroll" :probeType="probeType">
      <div class="song-list-wrapper">
        <songList @select="selectItem" :songs="songs" :rank="rank"></songList>
      </div>
      <div class="loading-wrapper" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import songList from 'base/song-list/song-list'
import scroll from 'base/scroll/scroll'
import { prefixStyle } from 'common/js/dom'
import loading from 'base/loading/loading'
import { mapActions } from 'vuex'
import { playlistMixin } from 'common/js/mixin'
const RESERVE_HEIGHT = 40

const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')
export default {
  mixins: [playlistMixin],
  props: {
    avatar: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: []
    },
    title: {
      type: String,
      default: ''
    },
    // 用于是否展示排行榜
    rank: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollY: 0
    }
  },
  computed: {
    backgroundImage() {
      return `background-image: url(${this.avatar})`
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  methods: {
    back(event) {
      this.$router.back()
    },
    scroll(pos) {
      // 获取到当前滚动的位置
      this.scrollY = pos.y
    },
    selectItem(item, index) {
      // 当点击歌曲时，调用vuex中的selectPlay播放歌曲
      this.selectPlay({
        list: this.songs,
        index: index
      })
    },
    random() {
      // 当点击随机播放歌曲时，调用随机播放歌曲的方法
      this.randomPlay({
        list: this.songs
      })
    },
    handlePlaylist(playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    scrollY(newY) {
      let minHeight = this.minHeight
      let zIndex = 0
      let scale = 1
      let blur = 0
      let bgImage = this.$refs.bgImage
      let bgLayer = this.$refs.bgLayer

      // 控制bgLayer向上移动的最大距离只能是minHeight
      let translateY = Math.max(newY, minHeight)

      // 当向下滑动时图片放大的比例
      const percent = Math.abs(newY / this.bgImageHeight)

      // 控制bgLayer随着list的移动
      bgLayer.style[transform] = `translate3d(0, ${translateY}px, 0)`

      if (newY < minHeight) {
        // 提高层级用来遮住上滑的列表
        zIndex = 10
        // 将bgImage高度设为RESERVE_HEIGHT，这样保证bgImage只遮住上滑的列表
        bgImage.style.padding = 0
        bgImage.style.height = RESERVE_HEIGHT + 'px'
        // 由于bgImage高度变了，所以需要键play隐藏，要不然play会出现在bgImage中
        this.$refs.play.style.display = 'none'
      } else {
        // 如果没有达到最大高度则将bgImage的高度变回来
        bgImage.style['padding-top'] = '70%'
        bgImage.style.height = 0
        this.$refs.play.style.display = ''
      }
      if (newY > 0) {
        // 如果是向下滑动，则设置bgImage的放大值
        zIndex = 10
        scale = 1 + percent
      } else {
        // 如果是向上滑动，设置bgImage的模糊值
        blur = Math.min(20 * percent, 20)
      }
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
      bgImage.style[transform] = `scale(${scale})`
      bgImage.style['z-index'] = zIndex
    }
  },
  mounted() {
    // 获取专辑图片的高度
    this.bgImageHeight = this.$refs.bgImage.clientHeight
    // 设置歌曲列表距离顶部最小的高度
    this.minHeight = -this.bgImageHeight + RESERVE_HEIGHT
    this.$refs.list.$el.style.top = `${this.bgImageHeight}px`
    // 由于设备大小不一样，bgImage的高度不是固定的，所以需要手动修改歌曲列表的top值
  },
  components: {
    songList,
    scroll,
    loading
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.music-list {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  background-color: @color-background;
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
  .title {
    position: absolute;
    top: 0;
    left: 10%;
    .no-wrap();
    width: 80%;
    font-size: @font-size-large;
    line-height: 40px;
    color: @color-text;
    text-align: center;
    z-index: 40;
  }
  .bg-image {
    position: relative;
    height: 0;
    width: 100%;
    padding-top: 70%;
    background-size: cover;
    transform-origin: top;
    .play-wrapper {
      position: absolute;
      bottom: 20px;
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
    .filter {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(7, 17, 27, 0.4);
    }
  }
  .bg-layer {
    position: relative;
    height: 100%;
    background-color: @color-background;
  }
  .list {
    position: fixed;
    bottom: 0;
    width: 100%;
    top: 0;
    background-color: @color-background;
    .song-list-wrapper {
      padding: 20px 30px;
    }
    .loading-wrapper {
      width: 100%;
      z-index: 100;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>

