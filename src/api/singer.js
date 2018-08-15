import jsonp from 'common/js/jsonp'
import axios from 'axios'
import {
  commonParams,
  options
} from './config'

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })

  return jsonp(url, data, options)
}

export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 100,
    songstatus: 1,
    singermid: singerId
  })
  return jsonp(url, data, options)
}

export function getMusicVkey(songmid) {
  const url = 'api/getMusicVkey'
  const data = Object.assign({}, commonParams, {
    g_tk: 165789314,
    platform: 'yqq',
    needNewCode: 0,
    cid: 205361747,
    songmid: songmid,
    filename: `C400${songmid}.m4a`,
    guid: 3411832458,
    hostUin: 0,
    uin: 0
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
