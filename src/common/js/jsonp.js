import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
  // 首先应该先判断传过来的url是否已经有？传参了，如果有就把data数据通过&连接到后面
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(data)
      }
    })
  })
}

function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] === undefined ? '' : data[k]
    url += `&${k}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''
}
