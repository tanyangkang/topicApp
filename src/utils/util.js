export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

export function formatDate (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`
  const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`
  return `${year}/${month}-${day}`
}

function formatNumber (n) {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

export function trimStr (str) {
  const s = str.replace(/(^\s*)|(\s*$)/g, '') // 去除文本左右两边空格
  return s
}

export function ReplaceTopic (str) {
  let r; let k // 声明变量。
  const ss = str
  r = ss.replace(/[#＃][^#＃]+[#＃]/g, word => `<a style="color:#3498DB">${word}</a>`)
  k = r.replace(/@.*?\s/g, word => `<a style="color:#3498DB">${word}</a>`)
  return k // 返回替换后的字符串
}

export function getTimeDistance (str) {
  const ymd = str.split(' ')[0].split('-')
  const hms = str.split(' ')[1].split(':')

  const date1 = new Date(ymd[0], ymd[1] - 1, ymd[2], hms[0], hms[1], hms[2])
  const date2 = new Date() // 结束时间
  const date3 = date2.getTime() - date1.getTime() // 时间差的毫秒数
  const days = Math.floor(date3 / (24 * 3600 * 1000))

  const leave1 = date3 % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
  const hours = Math.abs(Math.floor(leave1 / (3600 * 1000)))
  const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
  const minutes = Math.floor(leave2 / (60 * 1000))

  if (days > 0) {
    if (days / 365 >= 1) {
      return `${Math.floor(days / 365)}年前`
    }
    return `${days}天前`
  }
  if (hours > 0) {
    return `${hours}小时前`
  }
  if (minutes <= 3) {
    return '刚刚'
  }
  return `${minutes}分钟前`
}

export function getCityFromLocation (gps, cb) {
  wx.request({
    url: `https://api.map.baidu.com/geocoder/v2/?coordtype=gcj02ll&location=${gps}&output=json&pois=1&ak=PCgWIW1cx4YkYcY7UIYyufosUkVCf9k4`,
    method: 'GET',
    success: function (res) {
      if (cb) cb(res.data.result)
    }
  })
}

export function getLocationFromCity (city, cb) {
  wx.request({
    url: `https://api.map.baidu.com/geocoder/v2/?address=${city}&output=json&ret_coordtype=GCJ02&ak=PCgWIW1cx4YkYcY7UIYyufosUkVCf9k4`,
    method: 'GET',
    success: function (res) {
      if (cb) cb(res.data.result)
    }
  })
}

export function getCityFromStr (str) {
  const shiIndex = str.indexOf('市')
  let city = str
  if (shiIndex >= 0) {
    city = city.substr(0, shiIndex)
    const provinceIndex = city.indexOf('省')
    if (provinceIndex >= 0) {
      city = city.substr(provinceIndex + 1, city.length)
    } else if (city.indexOf('自治区') >= 0) {
      city = city.substr(city.indexOf('自治区') + 3, city.length)
      console.log(city)
    }
  } else {
    city = city.substr(0, str.indexOf('特别行政区'))
  }
  return city
}

export const debug = (...arg) => {
  console.log.apply(null, arg)
}

export const noop = () => {}

export const combine = (target, ...source) => {
  source.forEach(arg => {
    if (typeof arg === 'object') {
      for (const p in arg) {
        if (typeof arg[p] === 'array') {
          target[p] = target[p] || arg[p].concat()
        } else if (typeof arg[p] === 'object') {
          target[p] = target[p] || {}
          Object.assign(target[p], arg[p])
        } else if (typeof arg[p] === 'function') {
          const fun = target[p]
          target[p] = function () {
            arg[p].apply(this, arguments)
            fun && fun.apply(this, arguments)
          }
        } else {
          target[p] = target[p] || arg[p]
        }
      }
    }
  })
}

export const getWeek = (weekDays = (new Date()).getDay()) => {
  const today = new Date()
  const latestDay = Math.max(weekDays - 7, 0)
  const earlestDay = weekDays === 0 ? 7 : weekDays
  const oneDay = 1000 * 60 * 60 * 24
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  today.setMilliseconds(0)
  const firstDate = new Date(today.getTime() - oneDay * earlestDay)
  const lastDate = new Date(today.getTime() - oneDay * latestDay)
  const start = firstDate.getTime() / 1000
  const end = lastDate.getTime() / 1000
  return [start, end]
}

export const calWeekStep = (list, weekDays) => {
  const week = getWeek(weekDays || (new Date()).getDay())
  const start = week[0]
  const end = week[1]
  let total = 0
  list.forEach(item => {
    if (item.timestamp > start && item.timestamp <= end) total += item.step
  })
  return total
}

export const calRecStep = (weekStep = 40000) => {
  const day = (new Date()).getDay() || 7
  const [start, end] = getWeek(day)
  return Math.ceil(weekStep / 7 * day)
}

export const trimLeftSlash = s => s.replace(/^\/+/, '')

const URL_REGEX = /^((?:[a-zA-Z0-9+\-.]+:)?)(\/\/[^/?#]*)?((?:[^/?#]*\/)*.*?)??(;.*?)?(\?.*?)?(#.*?)?$/

export const parseUrl = function (url) {
  const parts = URL_REGEX.exec(url)

  if (!parts) {
    return
  }

  return {
    scheme: parts[1] || '',
    netloc: parts[2] || '',
    path: parts[3] || '',
    params: parts[4] || '',
    query: parts[5] || '',
    fragment: parts[6] || ''
  }
}

export const promisify = (api) => (opt, ...arg) => new Promise((resolve, reject) => {
      api({ ...opt, success: resolve, fail: reject }, ...arg)
    })

export const throttleAsync = (fn) => {
  let defer = null
  return function (...args) {
    return (defer || (defer = fn.apply(this, args).finally(() => defer = null)))
  }
}
