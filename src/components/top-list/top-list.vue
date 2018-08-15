<template>
  <transition name="disc">
    <music-List :title="title" :avatar="avatar" :songs="songs" :rank="true"></music-List>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getTopList } from 'api/rank'
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
    this._getSongList(this.topList.id)
  },
  computed: {
    ...mapGetters([
      'topList'
    ]),
    avatar() {
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },
    title() {
      return this.topList ? this.topList.topTitle : ''
    }
  },
  methods: {
    _getSongList(id) {
      // 判断是否获取到singer的数据，如果没有就跳转至歌手列表页面
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      getTopList(id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.songlist)
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
        let musicData = item.data
        if (musicData.songid && musicData.albummid) {
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

