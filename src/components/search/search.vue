<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="queryChange"></search-box>
    </div>
    <div class="short-cut-wrapper" ref="shortCurWrapper" v-show="!query">
      <scroll class="short-cut" ref="shortCut" :data="shortCut" :refreshDelay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul class="hot-info-box">
              <li @click="addQuery(item.k)" class="item" v-for="(item, index) in hotKey" :key="index">{{item.k}}</li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest :query="query" @listScroll="blurInput" ref="suggest" @select="saveSearch"></suggest>
    </div>
  </div>
</template>

<script>
import searchBox from 'base/search-box/search-box'
import { getHotKey } from 'api/search'
import { ERR_OK } from 'api/config'
import suggest from 'components/suggest/suggest'
import { mapActions } from 'vuex'
import scroll from 'base/scroll/scroll'
import searchList from 'base/search-list/search-list'
import confirm from 'base/confirm/confirm'
import { playlistMixin, searchMixin } from 'common/js/mixin'
export default {
  components: {
    searchBox,
    suggest,
    scroll,
    searchList,
    confirm
  },
  data() {
    return {
      hotKey: []
    }
  },
  methods: {
    showConfirm() {
      this.$refs.confirm.show()
    },
    handlePlaylist(playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.shortCurWrapper.style.bottom = bottom
      this.$refs.shortCut.refresh()
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    _getHotKey() {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10)
        }
      })
    },
    ...mapActions([
      'clearSearchHistory'
    ])
  },
  watch: {
    query(newVal) {
      if (!newVal) {
        setTimeout(_ => {
          this.$refs.shortCut.refresh()
        }, 20)
      }
    }
  },
  created() {
    this._getHotKey()
  },
  computed: {
    shortCut() {
      return this.searchHistory.concat(this.hotKey)
    }
  },
  mixins: [playlistMixin, searchMixin]
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.search {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
  .search-box-wrapper {
    margin: 20px;
  }
  .short-cut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;
    overflow: hidden;
    .short-cut {
      height: 100%;
      overflow: hidden;
      .hot-key {
        margin: 0 20px 20px 20px;
        .title {
          margin-bottom: 20px;
          font-size: @font-size-medium;
          color: @color-text-l;
        }
        .hot-info-box {
          display: flex;
          flex-wrap: wrap;
          .item {
            padding: 5px 10px;
            margin: 0 20px 10px 0;
            background-color: @color-highlight-background;
            font-size: @font-size-medium;
            color: @color-text-d;
            border-radius: 6px;
          }
        }
      }
      .search-history {
        position: relative;
        margin: 0 20px;
        .title {
          display: flex;
          align-items: center;
          height: 40px;
          color: @color-text-l;
          font-size: @font-size-medium;
          .text {
            flex: 1;
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
    }
  }
  .search-result {
    position: fixed;
    top: 178px;
    width: 100%;
    bottom: 0;
  }
}
</style>
