<template>
  <scroll class="listView" :data="listData" :probeType="probeType" :listenScroll="listenScroll" @scroll="scroll" ref="scroll">
    <ul>
      <li ref="group" class="group" v-for="(group, index) in listData" :key="index">
        <h1 class="title">{{group.title}}</h1>
        <ul>
          <li @click="selectSinger(item)" class="item" v-for="item in group.items" :key="item.id">
            <img width="50" height="50" class="avatar" v-lazy="item.avatar" alt="">
            <p class="name">{{item.name}}</p>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop="onShortcutTouchMove">
      <ul>
        <li :class="{'active': currentIndex===index}" class="shortcut" v-for="(shortcut, index) in listShortcut" :key="index" :data-index="index">
          {{shortcut}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="listFixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div class="loading-wrapper" v-show="!listData.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import scroll from 'base/scroll/scroll'
import { getData } from 'common/js/dom'
import loading from 'base/loading/loading'

const ANCHOR_HEIG = 18
const TITLE_HEIG = 30

export default {
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  props: {
    listData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  created() {
    this.probeType = 3
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
  },
  computed: {
    listShortcut() {
      return this.listData.map((item) => {
        return item.title.substr(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      // 保证fixed-title的值和当前滚动的区域的字母的值相同
      return this.listData[this.currentIndex] ? this.listData[this.currentIndex].title : ''
    }
  },
  methods: {
    onShortcutTouchStart(e) {
      // 获取事件源的index属性，
      // 这里的getData()函数是从dom.js中导入的一个专门获取data-index的方法
      let anchorIndex = getData(e.target, 'index')
      // 获取第一个手指接触的点
      let firstTouch = e.touches[0]
      // 第一个点的位置保存
      this.touch.y1 = firstTouch.pageY
      // 将触发事件的index值保存，为了在下面的函数中计算
      this.touch.anchorIndex = anchorIndex
      // 跳转
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove(e) {
      // 获取在移动过程中手指的位置
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // 通过move和start的移动距离除以每个ANCHOR的高度，向下取整获取到移动的了几个ANCHOR
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIG | 0
      // 将start时的index加上移动的delta来获取到当前位置的index
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      // 跳转
      this._scrollTo(anchorIndex)
    },
    refresh() {
      this.$refs.scroll.refresh()
    },
    scroll(pos) {
      // 通过scroll组件派发的事件在歌手列表移动时获取到当前滚动的位置
      this.scrollY = pos.y
    },
    selectSinger(item) {
      // 在点击歌手时将点击事件派发出去，并且将相应的歌手信息传递出去
      this.$emit('selectSinger', item)
    },
    _scrollTo(index) {
      // 保证index不为空
      if (!index && index !== 0) {
        return
      }
      // 边界处理
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      // 修改当前的scrollY的值
      this.scrollY = -this.listHeight[index]
      // 使用scroll组件提供的接口进行跳转
      this.$refs.scroll.scrollToElement(this.$refs.group[index], 0)
    },
    _calculateHeight() {
      // 这个方法用来获取每个首字母的列表的高度，并将其储存到一个数组中
      this.listHeight = []
      const group = this.$refs.group
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < group.length; i++) {
        let item = group[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    listData() {
      // 当listData发生变化时，需要重新计算列表的高度
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    diff(newVal) {
      // 当当前滚动位置与下一个字母列表顶部的距离小于TITLE_HEIG时，给list-fixed设置向上移动的动画
      let fixedTop = (TITLE_HEIG > newVal) ? newVal - TITLE_HEIG : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.listFixed.style.transform = `translate3d(0,${this.fixedTop}px,0)`
    },
    scrollY(newY) {
      // 当scrollY发生变化时说明页面正在滚动。
      const listHeight = this.listHeight
      // 当滚动到顶部newY>0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 当滚动到中间部分的时候
      for (let i = 0; i < listHeight.length - 1; i++) {
        // 通过判断当前滚动位置在哪个区间，来确定当前的currentIndex，以及当前滚动位置和下一个字母列表顶部的距离
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部， 且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    }
  },
  components: {
    scroll,
    loading
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
.listView {
  height: 100%;
  overflow: hidden;
  position: relative;
  .group {
    padding-bottom: 30px;
    .title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: @font-size-small;
      color: @color-text-l;
      background-color: @color-highlight-background;
    }
    .item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;
      .avatar {
        flex: 0 0 50px;
        width: 50px;
        border-radius: 50%;
      }
      .name {
        flex: 1;
        margin-left: 20px;
        color: @color-text-l;
        font-size: @font-size-medium;
      }
    }
  }
  .list-shortcut {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 30;
    border-radius: 10px;
    text-align: center;
    background-color: @color-background-d;
    padding: 20px 0;
    width: 20px;
    font-family: Arial, Helvetica, sans-serif;
    .shortcut {
      padding: 3px;
      line-height: 1;
      color: @color-text-l;
      font-size: @font-size-small;
      &.active {
        color: @color-theme;
      }
    }
  }
  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: @font-size-small;
      color: @color-text-l;
      background-color: @color-highlight-background;
    }
  }
  .loading-wrapper {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    transform: translateY(-50%);
  }
}
</style>
