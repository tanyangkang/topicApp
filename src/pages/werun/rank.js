import api from '../../utils/api'
import request from '../../utils/request'
import { calWeekStep } from '../../utils/util'
import {
  rotate,
  increase
} from '../../utils/animation'

let self = {}
const app = getApp()
const page = {
  data: {
    code: null,
    message: null,
    list: [],
    days: {
      thisWeek: (new Date()).getDay(),
      lastWeek: (new Date()).getDay() + 7
    },
    tabList: [{
      id: 'thisWeek',
      name: '本周'
    }, {
      id: 'lastWeek',
      name: '上周'
    }],
    tabSelected: 'thisWeek',
    order: 'asc'
  },
  onLoad: function (options) {
    self = this
    self.onPullDownRefresh('thisWeek')
  },
  tabClick (e) {
    const data = e.target ? e.target.dataset : {}
    this.setData({
      tabSelected: data.id || ''
    })
    this.sort()
  },
  sort (e) {
    if (e && e.target && e.target.dataset.id) {
      self.setData({
        order: e.target.dataset.id
      })
    }
    const list = self.data.list
    list.sort((a, b) => {
      const key = self.data.tabSelected === 'thisWeek' ? 'weekStep' : 'lastWeekStep'
      return self.data.order === 'asc' ? (b[key] - a[key]) : (a[key] - b[key])
    })
    self.setData({
      list: list
    })
  },
  onPullDownRefresh (tabId = self.data.tabSelected) {
    self.setData({
      list: []
    })
    self.setData({
      [`${tabId}List`]: []
    })
    request({
      url: 'wxapi/ranks',
      data: {
        days: self.data.days[tabId]
      },
      success (result) {
        self.setData({
          code: result.data.code,
          message: result.data.message
        })
        if (result.data.list) {
          const list = result.data.list

          list.forEach((item, index) => {
            const days = (new Date()).getDay()
            item.weekStep = calWeekStep(item.stepInfoList || [], days)
            item.lastWeekStep = calWeekStep(item.stepInfoList || [], days + 7)
            item.lastWeekStep = item.lastWeekStep || 0
            item.ratio = (item.weekStep * 100.00 / 40000).toFixed(2)
            item.lastRatio = (item.lastWeekStep * 100.00 / 40000).toFixed(2)
            item.index = list.length - index
            if (index === 0) item.className = 'last'
            if (list.length - 1 === index) item.className = 'first'
          })
          list.sort((a, b) => b.weekStep - a.weekStep)
          self.setData({
            list: list,
            [`${tabId}List`]: result.data.list
          })
          setTimeout(() => {
            list.forEach(item => {
              item.animationIncrease = increase(null, null, item.ratio)
              item.lastAnimationIncrease = increase(null, null, item.lastRatio)
            })
            self.setData({
              list: list,
              [`${tabId}List`]: result.data.list
            })
          }, 200)
        }
      }
    })
    api.stopPullDownRefresh()
  }
}

Page(page)
