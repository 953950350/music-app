<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span v-for="(item, index) in dots" :key="index" class="dot" :class="{'active': currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { addClass } from 'common/js/dom.js'
export default {
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 1000
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()
      if (this.autoplay) {
        this._play()
      }
    }, 20)
    window.addEventListener('resize', () => {
      if (!this.slider || !this.slider.enabled) {
        return false
      }
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        if (this.slider.isIntransition) {
          this._onScrollEnd()
        } else {
          if (this.autoplay) {
            this._play()
          }
        }
        this.refresh()
      }, 60)
    })
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  activated() {
    if (!this.slider) {
      return false
    }
    let pageIndex = this.slider.getCurrentPage().pageX
    this.slider.goToPage(pageIndex, 0, 0)
    this.currentPageIndex = pageIndex
    if (this.autoplay) {
      this._play()
    }
  },
  methods: {
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        },
        bounce: false,
        stopPropagation: true,
        click: true
      })
      this.slider.on('scrollEnd', this._onScrollEnd)
      this.slider.on('touchEnd', () => {
        if (this.autoplay) {
          this._play()
        }
      })
      this.slider.on('beforeScrollStart', () => {
        if (this.autoplay) {
          this._play()
        }
      })
    },
    refresh() {
      this._setSliderWidth(true)
      this.slider.refresh()
    },
    _onScrollEnd() {
      let pageIndex = this.slider.getCurrentPage().pageX
      this.currentPageIndex = pageIndex
      if (this.autoplay) {
        this._play()
      }
    },
    _initDots() {
      this.dots = new Array(this.children.length)
    },
    _setSliderWidth() {
      this.children = this.$refs.sliderGroup.children
      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      if (this.loop) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _play() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.slider.next()
      }, this.interval)
    }
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
.slider {
  min-height: 1px;
  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    .slider-item {
      float: left;
      text-align: center;
      box-sizing: border-box;
      overflow: hidden;
      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
        img {
          display: block;
          width: 100%;
        }
      }
    }
  }
  .dots {
    position: absolute;
    bottom: 12px;
    right: 0;
    left: 0;
    text-align: center;
    font-size: 0;
    .dot {
      width: 8px;
      display: inline-block;
      height: 8px;
      border-radius: 50%;
      background-color: @color-text-l;
      margin: 0 4px;
      &.active {
        width: 20px;
        border-radius: 5px;
        background-color: @color-text-ll;
      }
    }
  }
}
</style>
