import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex'
import {
  playMode
} from 'common/js/config'
import {
  shuffle
} from 'common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playList)
  },
  activated() {
    this.handlePlaylist(this.playList)
  },
  watch: {
    playList(newval) {
      this.handlePlaylist(newval)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'playList',
      'currentSong',
      'mode',
      'sequenceList',
      'likeSongs'
    ])
  },
  methods: {
    changeMode() {
      // 计算出mode改变后的值
      let mode = (this.mode + 1) % 3
      // 改变mode的值
      this.setPlayMode(mode)
      let list = null
      if (this.mode === playMode.random) {
        // 如果mode是乱序播放，则调用random函数打乱当前播放列表
        list = shuffle(this.sequenceList)
      } else {
        // 如果不是乱序播放则将播放列表变成顺序播放的列表
        list = this.sequenceList
      }
      // 当播放列表改变时当前歌曲的index也会改变，
      // 所以需要修改一下currentIndex让它和当前歌曲的index保持一致
      this.resetCurrentIndex(list)
      // 修改播放列表
      this.setPlayList(list)
    },
    resetCurrentIndex(list) {
      // 找到当前播放歌曲在新播放列表中的位置
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      // 修改currentIndex为当前播放歌曲在新播放列表中的位置
      this.setCurrentIndex(index)
    },
    getLikeIcon(song) {
      return this.isLikeSong(song) ? 'icon-favorite' : 'icon-not-favorite'
    },
    toggleLike(song) {
      if (this.isLikeSong(song)) {
        this.deleteLikeSong(song)
      } else {
        this.saveLikeSong(song)
      }
    },
    isLikeSong(song) {
      const index = this.likeSongs.findIndex(item => {
        return song.id === item.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveLikeSong',
      'deleteLikeSong'
    ])
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100
    }
  },
  methods: {
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    queryChange(query) {
      this.query = query
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    saveSearch() {
      this.saveSearchHistory(this.query)
      this.$refs.topTip && this.$refs.topTip.show()
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  }
}
