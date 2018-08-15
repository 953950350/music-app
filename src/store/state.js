import { playMode } from 'common/js/config'
import { loadSearch, loadPlay, loadLike } from 'common/js/cache'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playList: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  likeSongs: loadLike()
}

export default state