<template>
  <div class="rank" ref="rank">
    <scroll class="top-list" :data="topList" ref="topList">
      <ul>
        <li class="item" v-for="item in topList" :key="item.topTitle">
          <div class="img">
            <img v-lazy="item.picUrl" width="100" height="100" alt="">
          </div>
          <ul class="song-list">
            <li class="song" @click="selectTopList(item)" v-for="(song, index) in item.songList" :key="index">
              {{song.singername}}-{{song.songname}}
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-wrapper" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <transition name="top-list">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { getRankList } from 'api/rank'
import { ERR_OK } from 'api/config'
import scroll from 'base/scroll/scroll'
import loading from 'base/loading/loading'
import { playlistMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'
export default {
  mixins: [playlistMixin],
  data() {
    return {
      topList: []
    }
  },
  methods: {
    handlePlaylist(playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.rank.style.bottom = bottom
      this.$refs.topList.refresh()
    },
    selectTopList(list) {
      this.$router.push({
        path: '/rank/' + list.id
      })
      this.setTopList(list)
    },
    _getRankList() {
      getRankList().then(res => {
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    },
    ...mapMutations({
      setTopList: 'SET_TOP_LIST'
    })
  },
  created() {
    this._getRankList()
  },
  components: {
    scroll,
    loading
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .top-list {
    height: 100%;
    overflow: hidden;
    .item {
      margin: 0 20px;
      padding-top: 20px;
      display: flex;
      height: 100px;
      &:last-child {
        padding-bottom: 20px;
      }
      .img {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }
      .song-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background-color: @color-highlight-background;
        color: @color-text-d;
        font-size: @font-size-small;
        .song {
          .no-wrap();
          line-height: 26px;
        }
      }
    }
    .loading-wrapper {
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
    }
  }
  .top-list-enter,
  .top-list-leave-to {
    transform: translate3d(100%, 0, 0);
  }
  .top-list-enter-active,
  .top-list-leave-active {
    transition: all 0.4s linear;
  }
}
</style>
