// import jsonp from 'common/js/jsonp'
import axios from 'axios'
import {
  commonParams
} from './config'

export function getMusicLyric(songmid) {
  const url = 'api/getMusicLyric'
  const data = Object.assign({}, commonParams, {
    pcachetime: +new Date(),
    songmid: songmid,
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}