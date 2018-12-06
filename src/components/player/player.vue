<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" width="100%" height="100%" alt="">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <span class="icon-back"></span>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="name" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="cd" v-if="fullScreen">
                <img :class="cdCls" ref="cdImg" :src="currentSong.image" class="image" alt="">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric || noLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList">
            <div class="lyric-wrapper">
              <div v-if="currentLyric && currentLyric.lines.length">
                <p class="text" ref="lyricLine" :class="{'current': currentNumber === index}" v-for="(item, index) in currentLyric.lines" :key="index">
                  {{item.txt}}
                </p>
              </div>
            </div>
            <div v-if="currentLyric && !currentLyric.lines.length" class="no-lyric">
              <p class="text">{{noLyric}}</p>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @precentChange="precentBarChange" @currentTimeChange="currentTimeChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" @click="prev" :class="disable">
              <i class="icon-prev"></i>
            </div>
            <div class="icon i-center" @click.stop="togglePlaying" :class="disable">
              <i :class="playIcon"></i>
            </div>
            <div class="icon i-right" @click="next" :class="disable">
              <i class="icon-next"></i>
            </div>
            <div class="icon i-right" @click="toggleLike(currentSong)">
              <i :class="getLikeIcon(currentSong)"></i>
            </div>
          </div>
        </div>
        <div class="no-music">
          <confirm ref="noMusic" text="该歌曲为付费歌曲，请充值后再播放" confirmBtnText="下一首" @cancel="prev" @confirm="next" cancelBtnText="上一首"></confirm>
        </div>
      </div>
    </transition>
    <transition class="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="cd" ref="cd" v-if="!fullScreen">
            <img :src="currentSong.image" :class="cdCls" ref="cdImg" width="40" height="40" alt="">
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniIcon" @click.stop="togglePlaying" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio preload autoplay @timeupdate="update" ref="audio" @pause="pause" @play="ready" @error="error" @ended="ended"></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'
import progressBar from 'base/progress-bar/progress-bar'
import progressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import Lyric from 'lyric-parser'
import scroll from 'base/scroll/scroll'
import playlist from 'base/playlist/playlist'
import { playerMixin } from 'common/js/mixin'
import confirm from 'base/confirm/confirm'
const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
export default {
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: '0:00',
      radius: 32,
      progressMove: false,
      currentLyric: null,
      currentNumber: 0,
      playingLyric: '',
      currentShow: 'cd',
      noLyric: ''
    }
  },
  computed: {
    ...mapGetters([
      'playing',
      'fullScreen',
      'currentIndex'
    ]),
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdCls() {
      if (!this.playing && this.$refs.cd) {
        // 让外部盒子旋转到当前图片的位置，然后再移除图片的类名
        let cd = this.$refs.cd
        let Img = this.$refs.cdImg
        let cdTransform = getComputedStyle(cd).transform
        let ImgTransform = getComputedStyle(Img).transform
        cd.style.transform = cdTransform === 'none' ? ImgTransform : cdTransform.concat(' ', ImgTransform)
        return ''
      }
      return 'play'
    },
    disable() {
      return this.songReady ? '' : 'disable'
    },
    percent() {
      return this.currentTime / this.currentSong.duration
    }
  },
  created() {
    this.touch = {}
    // 解决ios浏览器无法自动播放的bug
    window.addEventListener('touchstart', this.firstPlay)
  },
  methods: {
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    showPlaylist() {
      this.$refs.playlist.show()
    },
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    firstPlay() {
      this.$refs.audio && this.$refs.audio.play()
    },
    prev() {
      if (!this.songReady) {
        return
      }
      // 如果歌曲列表只有一首歌调用loop方法，循环播放这一首歌即可
      if (this.playList.length === 1) {
        this.loop()
        return
      }
      // 判断当前播放歌曲是否是第一首歌，如果是就把歌曲切换到最后一首歌，如果不是就切换到第一首歌
      let nextIndex = this.currentIndex <= 0 ? this.playList.length - 1 : this.currentIndex - 1
      // 修改当前播放歌曲的
      this.setCurrentIndex(nextIndex)
      // 如果播放状态为暂停就修改为播放
      if (!this.playing) {
        this.setPlayingState(true)
      }
      this.songReady = false
    },
    next() {
      if (!this.songReady) {
        return
      }
      if (this.playList.length === 1) {
        this.loop()
        return
      }
      // 判断当前歌曲是否是最后一首，如果是就切换到第一首，如果不是就切换到下一首
      let nextIndex = this.currentIndex >= this.playList.length - 1 ? 0 : this.currentIndex + 1
      this.setCurrentIndex(nextIndex)
      if (!this.playing) {
        this.setPlayingState(true)
      }
      this.songReady = false
    },
    ready() {
      this.songReady = true
      if (this.playing) {
        this.$refs.audio.play()
        this.playHistory(this.currentSong)
      }
      window.removeEventListener('touchstart', this.firstPlay, false)
    },
    error() {
      this.songReady = true
      this.setPlayingState(false)
      this.$refs.noMusic.show()
    },
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    ended() {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop() {
      let audio = this.$refs.audio
      audio.currentTime = 0
      // chrome50 版本之后不允许pause之后立即调用play，所以需要设置一个延时
      setTimeout(_ => {
        audio.play()
        this.setPlayingState(true)
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      }, 150)
    },
    pause() {
      this.setPlayingState(false)
    },
    update(e) {
      if (this.progressMove) {
        return
      }
      if (!this.playing) {
        this.setPlayingState(true)
      }
      this.currentTime = e.target.currentTime
    },
    precentBarChange(percent) {
      // 接受新的歌曲进度，并计算出歌曲播放的时间
      const currentTime = this.currentSong.duration * percent
      // 修改当前歌曲的播放时间
      this.$refs.audio.currentTime = currentTime
      // 如果歌曲处于暂停状态，就播放歌曲
      if (!this.playing) {
        this.togglePlaying()
      }
      // 让自动更新播放时间的update函数正常工作
      this.progressMove = false
      // 修改歌词展示位置
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    currentTimeChange(percent) {
      // 拖动进度条时同步当前播放时间
      this.currentTime = this.currentSong.duration * percent
      // 阻止自动更新当前播放时间
      this.progressMove = true
      // 修改歌词展示位置
      if (this.currentLyric) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },
    getCurrentLyric() {
      this.currentSong.getLyric().then(lyric => {
        if (this.currentSong.lyric !== lyric) {
          return
        }
        this.currentLyric = new Lyric(lyric, this.handler)
        this.noLyric = this.currentLyric.lines.length ? '' : '当前歌曲为无歌词纯音乐'
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentNumber = 0
      })
    },
    handler({ lineNum, txt }) {
      // 设置歌词位置的回调函数。在这里可以获取到当前正在播放的歌词
      // 还有当前播放的的歌词的行数
      this.playingLyric = txt
      this.currentNumber = lineNum
      // 当播放到大于5行歌词时，让歌词滚动到指定的位置
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
    },
    getCurrentUrl() {
      this.currentSong.getMusicUrl().then(url => {
        this.$refs.audio.setAttribute('src', url)
        this.$refs.audio.play()
      }).catch(() => {
        this.songReady = true
        this.setPlayingState(false)
        this.$refs.noMusic.show()
      })
    },
    enter(el, done) {
      // 获取开始的位置和所发比例
      const { x, y, scale } = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: 'translate3d(0,0,0) scale(1.1)'
        },
        100: {
          transform: 'scale(1)'
        }
      }
      // 使用create-keyframe-animation插件来设置animation动画
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      // 将注册的动画绑定到dom元素上
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter(el) {
      // 移除动画
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave(el) {
      this.$refs.cdWrapper.style[transform] = ''
      this.$refs.cdWrapper.style['transition'] = ''
    },
    format(interval) {
      // 播放时间的格式化函数
      interval = interval | 0
      let min = interval / 60 | 0
      let second = interval % 60 | 0
      second = this._pad(second)
      return `${min}:${second}`
    },
    middleTouchStart(e) {
      // 设置一个滑动开始的标识符
      this.initiated = true
      // 记录滑动开始时手指的位置
      let touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
      // 用来判断是否是移动
      this.touch.move = false
    },
    middleTouchMove(e) {
      // 判断是否触发过touchStart事件
      if (!this.initiated) {
        return
      }
      // 计算出滑动的距离
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // 当竖直方向上的滑动距离大于水平方向上的滑动距离时，可能是用户在滑动歌词，就直接退出
      if (Math.abs(deltaX) < Math.abs(deltaY)) {
        return
      }
      // 修改移动标识符
      this.touch.move = true
      // 当当前所处位置在cd时，那么位置偏移为0.如果不是那就是在歌词部分，位置偏移就是-window.innerWidth
      const innerWidth = -window.innerWidth
      // 获取到当前的位置
      const left = this.currentShow === 'cd' ? 0 : innerWidth
      // 由于只能向左偏移所以偏移量一定是负的小于0，而偏移的位置最多就只能是innerWidth
      const offsetWidth = Math.min(0, Math.max(innerWidth, left + deltaX))
      // 计算出偏移的比例
      this.touch.precent = Math.abs(offsetWidth / innerWidth)
      // 设置lyricList的偏移
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      // 设置专辑图片的透明度，偏移比例越大就越透明
      this.$refs.middleL.style.opacity = 1 - this.touch.precent
    },
    middleTouchEnd() {
      // 判断是否有移动
      if (!this.touch.move) {
        return
      }
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') {
        // 如果当前显示的是cd，判断偏移比例是否大于0.1
        // 如果大于0.1需要将cd隐藏显示lyric
        if (this.touch.precent > 0.1) {
          // offsetWidth变量是用来控制lyric的偏移量来控制lyric的显示和隐藏
          offsetWidth = -window.innerWidth
          this.currentShow = 'lyric'
          // opactiy是设置cd的透明度来控制cd的显示和隐藏
          opacity = 0
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 如果当前处于lyric部分，那么precent<0.9实际上就是偏移量大于0.1
        if (this.touch.precent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      // 将样式设置到相应的元素上去
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    _getPosAndScale() {
      // 计算位置和缩放比例
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(width / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - paddingBottom - width / 2
      return {
        x,
        y,
        scale
      }
    },
    _pad(number, n = 2) {
      // 补零的方法
      let len = number.toString().length
      while (len < n) {
        number = '0' + number
        len++
      }
      return number
    },
    ...mapActions([
      'playHistory'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      // 检查是否有id
      if (!this.currentSong.id) return
      // 检查新的歌曲旧歌曲是否是同一首，如果是就不执行操作
      if (newSong.id === oldSong.id) return
      // 切换时如果存在歌词，那么先停止歌词的滚动
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      // 初始化歌曲播放时间和当前正在播放歌词
      this.currentTime = 0
      this.playingLyric = ''
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getCurrentUrl()
        this.getCurrentLyric()
      }, 20)
    },
    playing(newVal) {
      let audio = this.$refs.audio
      this.$nextTick(() => {
        newVal ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    progressBar,
    progressCircle,
    scroll,
    playlist,
    confirm
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.player {
  .normal-player {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 150;
    background-color: @color-background;
    .background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 9px;
          font-size: @font-size-large-x;
          color: @color-theme;
          transform: rotate(-90deg);
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        text-align: center;
        .no-wrap();
        font-size: @font-size-large;
        line-height: 40px;
        color: @color-text;
      }
      .name {
        text-align: center;
        line-height: 20px;
        font-size: @font-size-medium;
        color: @color-text;
      }
    }
    .middle {
      position: fixed;
      top: 80px;
      bottom: 170px;
      width: 100%;
      font-size: 0;
      white-space: nowrap;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            .image {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
              &.play {
                animation: rotate 20s linear infinite;
              }
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          text-align: center;
          overflow: hidden;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: @font-size-medium;
            color: @color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: @color-text-l;
            font-size: @font-size-medium;
            &.current {
              color: @color-text;
            }
          }
        }
        .no-lyric {
          position: absolute;
          top: 50%;
          width: 80%;
          left: 50%;
          text-align: center;
          transform: translate3d(-50%, -50%, 0);
          .text {
            line-height: 32px;
            color: @color-text-l;
            font-size: @font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: @color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background-color: @color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0 auto;
        padding: 10px 0;
      }
      .time {
        color: @color-text;
        font-size: @font-size-small;
        flex: 0 0 30;
        line-height: 30px;
        width: 30px;
        &.time-l {
          text-align: left;
        }
        &.time-r {
          text-align: right;
        }
      }
      .progress-bar-wrapper {
        flex: 1;
      }
      .operators {
        display: flex;
        align-items: center;
        font-size: 30px;
        .icon {
          flex: 1;
          color: @color-theme;
          &.disable {
            color: @color-theme-d;
          }
          &.i-left {
            text-align: right;
          }
          &.i-center {
            padding: 0 20px;
            text-align: center;
            font-size: 40px;
          }
          &.i-right {
            text-align: left;
            .icon-favorite {
              color: @color-sub-theme;
            }
          }
        }
      }
    }
  }
  .normal-enter,
  .normal-leave-to {
    opacity: 0;
    .top {
      transform: translate3d(0, -100px, 0);
    }
    .bottom {
      transform: translate3d(0, 100px, 0);
    }
  }
  .normal-enter-active,
  .normal-leave-active {
    transition: all 0.4s;
    .top,
    .bottom {
      transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
    }
  }
  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background-color: #333;
    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;
      .cd {
        width: 100%;
        height: 40px;
        border-radius: 50%;
        position: relative;
        img {
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
          &.play {
            animation: rotate 20s linear infinite;
          }
        }
      }
    }
    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .name {
        margin-bottom: 2px;
        .no-wrap();
        font-size: @font-size-medium;
        color: @color-text;
      }
      .desc {
        .no-wrap();
        font-size: @font-size-small;
        color: @color-text-d;
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-play-mini,
      .icon-pause-mini,
      .icon-playlist {
        font-size: 30px;
        color: rgba(255, 205, 49, 0.5);
      }
      .icon-mini {
        font-size: 32px;
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
  .mini-enter,
  .mini-leave-to {
    opacity: 0;
  }
  .mini-enter-active,
  .mini-leave-active {
    transition: all 0.4s linear;
  }
  @keyframes rotate {
    100% {
      transform: rotate(1turn);
    }
  }
}
</style>

