<template>
  <transition name="slider">
    <music-List :title="name" :avatar="avatar" :songs="songs"></music-List>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singer'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song'
import musicList from 'components/music-list/music-list'
export default {
  data() {
    return {
      songs: []
    }
  },
  created() {
    // 获取歌曲列表数据
    this._getDetail(this.singer.id)
  },
  computed: {
    ...mapGetters([
      'singer'
    ]),
    avatar() {
      return this.singer ? this.singer.avatar : ''
    },
    name() {
      return this.singer ? this.singer.name : ''
    }
  },
  methods: {
    _getDetail(singerId) {
      // 判断是否获取到singer的数据，如果没有就跳转至歌手列表页面
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      // 根据歌手id获取歌手的歌曲数据并格式化
      getSingerDetail(singerId).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list)
        }
      })
    },
    _normalizeSongs(songList) {
      let songs = []
      // 如果没有传入songList就退出
      if (!songList) {
        return
      }
      songList.forEach((item) => {
        let { musicData } = item
        // 必须保证歌曲信息中有必要的数据，如果没有就不添加该歌曲
        if (musicData.songid && musicData.albummid) {
          // 使用createSong创建歌曲的实例，并添加到歌曲列表中
          songs.push(createSong(musicData))
        }
      })
      return songs
    }
  },
  components: {
    musicList
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
.slider-enter,
.slider-leave-to {
  transform: translate3d(100%, 0, 0);
}
.slider-enter-active,
.slider-leave-active {
  transition: all 0.4s linear;
}
</style>

