<template>
  <div class="singer" ref="singer">
    <list-view :listData="singerList" @selectSinger="selectSinger" ref="singerList"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from 'api/singer'
import { ERR_OK } from 'api/config'
import Singer from 'common/js/singer'
import listView from 'base/list-view/list-view'
import { mapMutations } from 'vuex'
import { playlistMixin } from 'common/js/mixin'
const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10
export default {
  mixins: [playlistMixin],
  data() {
    return {
      singerList: []
    }
  },
  methods: {
    selectSinger(singer) {
      // 监听每个歌手的点击事件，当歌手被点击时进行路由跳转
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      // 将当前歌手储存到vuex中
      this.setSinger(singer)
    },
    handlePlaylist(playList) {
      // 当播放列表出现时，mini-player会占据一部分空间，
      // 所以需要重新设置singerList的bottom值，这样mini-player就不会遮挡singerList
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.singerList.refresh()
    },
    _getSingerList() {
      // 发送请求获取歌手列表并格式化数据
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singerList = this._normalizeSinger(res.data.list)
        }
      })
    },
    _normalizeSinger(list) {
      // 创建一个用于分类的对象，对象初始化时设置一个热门的分类
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        // 取前HOT_SINGER_LEN个歌手作为热门歌手，把他们添加到热门分类中
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        // 将item的首字母取出
        let key = item.Findex
        // 判断分类对象中是否存在以key为键的属性，如果没有就创建一个
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        // 将当前歌手添加到首字母一致的分组中，并且使用Singer类对歌手进行初始化
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // 所得到的对象是无序的需要处理之后变成一个有序的数组。
      let hot = []
      let ret = []
      // 由于字母的分类是需要按照字母顺序排序的，所以将字母分类和热门分类分开分别储存成一个数组，方便之后的排序
      for (let key in map) {
        let value = map[key]
        if (value.title.match(/[a-zA-Z]/)) {
          ret.push(value)
        } else if (value.title === HOT_NAME) {
          hot.push(value)
        }
      }
      // 对字母数组按照字母顺序进行排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 将两个数组拼接起来
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  created() {
    this._getSingerList()
  },
  components: {
    listView
  }
}
</script>

<style lang="less" scoped>
.singer {
  position: fixed;
  top: 88px;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
