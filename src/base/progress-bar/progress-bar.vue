<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div ref="btn" class="progress-btn-wrapper" @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend="progressEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { prefixStyle } from 'common/js/dom'

const transform = prefixStyle('transform')
const progressBtnWidth = 16
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent(newVal) {
      // 传入的歌曲播放进度必须大于0，当用户在修改歌曲播放进度时不改变进度条，进度条外部盒子的宽度必须大于0
      if (newVal > 0 && !this.touch.initiated && this.$refs.progressBar.clientWidth > 0) {
        // 进度条的从长度应该是进度条外部盒子的长度减去进度条最前面圆形的按钮的长度。
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 计算出进度条的长度，这里Math.min()的作用是，
        // 当歌曲切换之后而歌曲总时长变化了，而当前歌曲的播放时间还没有变化，
        // 就会出现percent大于1的情况，所以使用这个函数避免offsetWidth大于barWidth的情况
        let offsetWidth = barWidth * Math.min(newVal, 1)
        // 修改进度条长度，并且设置btn的偏移量
        this._offset(offsetWidth)
      }
    }
  },
  created() {
    // 如果组件中有需要共享但是不需要与页面交互的数据，那么可以在created时定义这些数据，
    // 而不需要在data中定义数据
    this.touch = {}
  },
  methods: {
    progressTouchStart(e) {
      // 滑动开始时建立一个滑动开始的标识符
      this.touch.initiated = true
      // 记录滑动开始时手指的位置
      this.touch.startX = e.touches[0].pageX
      // 记录滑动开始时进度条的长度
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove(e) {
      // 判断是否触发过touchstart事件。
      if (!this.touch.initiated) {
        return
      }
      // 计算出手指移动的距离
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 获取进度条应该修改的长度，首先这里必须保证这个长度是大于等于0的所以使用Math.max函数，之后必须保证长度必须小于等于进度条盒子的长度
      let offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, deltaX + this.touch.left))
      // 修改进度条和btn的偏移
      this._offset(offsetWidth)
      // 将进度条改变这个传递到外部的函数，由于在移动滑动进度条时只需要修改歌曲的时间，而不需要修改歌曲的播放的位置，所以使用一个标识符来区分这两个事件
      this._triggerPercent(true)
    },
    progressEnd(e) {
      // 拖拽完成之后修改正在滑动标识符让进度条正常运行
      this.touch.initiated = false
      // 将进度改变传递给外部
      this._triggerPercent()
    },
    progressClick(e) {
      // 点击进度条时获取到点击时的位置然后计算出应该偏移的长度
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      // 当点击到小方块时e.offsetX的值是不对的，所以不能用这个
      // this._offset(e.offsetX)
      this._offset(offsetWidth)
      this._triggerPercent()
    },
    _triggerPercent(isMove) {
      // 计算出新的播放进度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      if (isMove) {
        // 当还在移动进度条时，只需要改变左边用来展示当前播放时间的那个数据，不需要改变歌曲的播放
        this.$emit('currentTimeChange', percent)
      } else {
        // 改变歌曲播放位置的事件
        this.$emit('precentChange', percent)
      }
    },
    _offset(offsetWidth) {
      this.$refs.progress.style.width = offsetWidth + 'px'
      this.$refs.btn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    }
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.progress-bar {
  height: 30px;
  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background-color: rgba(0, 0, 0, 0.3);
    .progress {
      position: absolute;
      height: 100%;
      background-color: @color-theme;
    }
    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid @color-text;
        border-radius: 50%;
        background-color: @color-theme;
      }
    }
  }
}
</style>

