<template>
  <transition name="disc">
    <music-List :title="title" :avatar="avatar" :songs="songs"></music-List>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSongList } from 'api/recommend'
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
    this._getSongList(this.disc.dissid)
  },
  computed: {
    ...mapGetters([
      'disc'
    ]),
    avatar() {
      return this.disc ? this.disc.imgurl : ''
    },
    title() {
      return this.disc.creator ? this.disc.creator.name : ''
    }
  },
  methods: {
    _getSongList(dissid) {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      getSongList(dissid).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.cdlist[0].songlist)
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
        let musicData = item
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

