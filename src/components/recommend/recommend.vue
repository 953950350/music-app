<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
          <slider>
            <div v-for="item in recommends" :key="item.id">
              <a :href="item.linkUrl">
                <img @load="imgOnload" :src="item.picUrl" alt="">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item" :key="item.dissid">
              <div class="icon">
                <img height="60" width="60" v-lazy="item.imgurl" alt="">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="dissname" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-wrapper" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <transition name="music-list">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { getRecommend, getDiscList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import slider from 'base/slider/slider'
import scroll from 'base/scroll/scroll'
import loading from 'base/loading/loading'
import { playlistMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'
export default {
  mixins: [playlistMixin],
  data() {
    return {
      recommends: [],
      discList: []
    }
  },
  methods: {
    imgOnload() {
      this.$refs.scroll.refresh()
    },
    handlePlaylist(playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    selectItem(item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDisc(item)
    },
    _getRecommend() {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList() {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  created() {
    this._getRecommend()
    this._getDiscList()
  },
  components: {
    slider,
    scroll,
    loading
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
.recommend {
  position: fixed;
  top: 88px;
  left: 0;
  bottom: 0;
  width: 100%;
  .recommend-content {
    height: 100%;
    overflow: hidden;
    .slider-wrapper {
      width: 100%;
      position: relative;
      overflow: hidden;
    }
    .recommend-list {
      .title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        color: @color-theme;
        font-size: @font-size-medium;
      }
      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;
        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }
        .text {
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          font-size: @font-size-medium;
          line-height: 20px;
          overflow: hidden;
          .name {
            margin-bottom: 10px;
            color: @color-text;
          }
          .dissname {
            color: @color-text-d;
          }
        }
      }
    }
    .loading-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }
  .music-list-enter,
  .music-list-leave-to {
    transform: translate3d(100%, 0, 0);
  }
  .music-list-enter-active,
  .music-list-leave-active {
    transition: all 0.4s linear;
  }
}
</style>
