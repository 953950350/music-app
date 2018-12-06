import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200

const LIKE_KEY = '__LIKE__'
const LIKE_MAX_LENGTH = 200

function insertArray(arr, val, compare, maxLength) {
  // 查找出数组中符合条件的数据的索引
  let index = arr.findIndex(compare)
  // 如果该数据已经是在第一个了就直接退出
  if (index === 0) {
    return
  }
  // 如果数组中有该数据并且数据不在第一个，就将原数据从数组中删除。
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 将数据添加到数组的第一位上去
  arr.unshift(val)
  // 如果传入了数组的最大长度，并且添加之后数组长度大于最大的长度，将数组最后一位删除。
  if (maxLength && arr.length > maxLength) {
    arr.pop()
  }
}
function deleteFromArray(arr, compare) {
  let index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

export function savePlay(song) {
  let plays = storage.get(PLAY_KEY, [])

  insertArray(plays, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)

  storage.set(PLAY_KEY, plays)
  
  return plays
}

export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

export function saveLike(song) {
  let songs = storage.get(LIKE_KEY, [])

  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, LIKE_MAX_LENGTH)

  storage.set(LIKE_KEY, songs)

  return songs
}

export function loadLike() {
  return storage.get(LIKE_KEY, [])
}

export function deleteLike(song) {
  let songs = storage.get(LIKE_KEY, [])

  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })

  storage.set(LIKE_KEY, songs)

  return songs
}