<template>
  <scroll class="suggest" ref="suggest" :data="result" :pullup="true" @scrollToEnd="searchMore" :beforeScroll="beforeScroll" @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="(item, index) in result" :key="index" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name" v-html="getDisplayName(item)"></div>
      </li>
      <loading v-show="hasMore" tilte=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!result.length && !hasMore">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import { search } from 'api/search'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song'
import scroll from 'base/scroll/scroll'
import loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import { mapMutations, mapActions } from 'vuex'
import noResult from 'base/no-result/no-result'

const TYPE_SINGER = 'singer'
const perpage = 20
export default {
  data() {
    return {
      page: 1,
      result: [],
      hasMore: false,
      beforeScroll: true
    }
  },
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    search(query) {
      this.page = 1
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this.result = this._getResult(res.data)
          this._checkMore(res.data.song)
        }
      })
    },
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this.result = this.result.concat(this._getResult(res.data, true))
          this._checkMore(res.data.song)
        }
      })
    },
    listScroll() {
      this.$emit('listScroll')
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      }
      return 'icon-music'
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      }
      return `${item.name}-${item.singer}`
    },
    refresh() {
      this.$refs.suggest.refresh()
    },
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        let singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    _checkMore(song) {
      if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
        this.hasMore = false
      }
    },
    _getResult(data, isSearchMore) {
      let ret = []
      if (data.zhida && data.zhida.singerid && !isSearchMore) {
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
      }
      if (data.song) {
        data.song.list.forEach(musicData => {
          if (musicData.albumid && musicData.songid) {
            ret.push(createSong(musicData))
          }
        })
      }
      return ret
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query(query) {
      this.search()
    }
  },
  components: {
    scroll,
    loading,
    noResult
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.suggest {
  height: 100%;
  overflow: hidden;
  .suggest-list {
    padding: 0 30px;
    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
      .icon {
        flex: 0 0 30px;
        width: 30px;
        [class^="icon-"] {
          font-size: @font-size-medium;
          color: @color-text-d;
        }
      }
      .name {
        flex: 1;
        font-size: @font-size-medium;
        color: @color-text-d;
        overflow: hidden;
        .text {
          .no-wrap();
        }
      }
    }
  }
  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

