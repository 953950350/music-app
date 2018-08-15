import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, deleteSearch, clearSearch, savePlay, saveLike, deleteLike } from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list.slice())
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList.slice())
    commit(types.SET_CURRENT_INDEX, findIndex(randomList, list[index]))
  } else {
    commit(types.SET_PLAYLIST, list.slice())
    commit(types.SET_CURRENT_INDEX, index)
  }
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULL_SCREEN, true)
  /* 
    由于数组储存的是一个对数组的引用，所以如果
    直接储存这个数组那么list可能会在vuex以外的地方被修改，
    所以需要通过list.slice()创建一个副本，对于对象可以使用Object.assign({}, list.someObj)
  */
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_SEQUENCE_LIST, list.slice())
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList.slice())
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAY_MODE, playMode.random)
}

export const insertSong = function ({commit, state}, song) {
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前的歌曲
  let currentSong = playList[currentIndex]
  // 查找要插入的歌曲是否在playList中
  let fpIndex = findIndex(playList, song)
  // 因为插入的歌曲要在当前歌曲之后，所以播放歌曲的索引要自增
  currentIndex++
  // 插入歌曲
  playList.splice(currentIndex, 0, song)
  // 如果插入的歌曲已经在playList中，那么需要把之前的删除掉
  if (fpIndex > -1) {
    if (fpIndex < currentIndex) {
      playList.splice(fpIndex, 1)
      currentIndex--
    } else {
      fpIndex++
      playList.splice(fpIndex, 1)
    }
  }
  let currentSIndex = findIndex(sequenceList, currentSong)
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (fsIndex < currentSIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULL_SCREEN, true)
}

export const deleteSong = function ({commit, state}, song) {
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let fpIndex = findIndex(playList, song)
  playList.splice(fpIndex, 1)
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(fsIndex, 1)
  if (fpIndex < currentIndex || currentIndex === playList.length) {
    currentIndex--
  }
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  const playingState = playList.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}

export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export const saveSearchHistory = function({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({ commit }, query) { 
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({ commit }) { 
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const playHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveLikeSong = function ({commit}, song) {
  commit(types.SET_LIKE_SONGS, saveLike(song))
}

export const deleteLikeSong = function ({commit}, song) {
  commit(types.SET_LIKE_SONGS, deleteLike(song))
}