function getRandomInt(min, max) {
  // 获取一个从最小值到最大值的随机整数
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let k = _arr[j]
    _arr[j] = _arr[i]
    _arr[i] = k 
  }
  return _arr
}

export function debounce(func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(_ => {
      func.apply(this, args)
    }, delay)
  }
}
