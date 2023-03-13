import api from '../../utils/api'
import request from '../../utils/request'
import { rotate, increase } from '../../utils/animation'
import { debug, calRecStep, calWeekStep } from '../../utils/util'

const app = getApp()
let self = {}

const getWeRunData = () => new Promise((resolve, reject) => {
  api.getWeRunData({
    success (res) {
      const encryptedData = res.encryptedData
      request({
        url: 'wxapi/workout',
        method: 'POST',
        data: {
          code: app.globalData.code,
          openid: app.globalData.userInfo.openid,
          session_key: app.globalData.session_key,
          encryptedData,
          nickName: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl,
          iv: app.globalData.iv,
          days: (new Date()).getDay()
        },
        success (result) {
          result.data ? resolve(result.data) : reject(result)
          console.log(result.data)
        }
      })
    },
    fail (e) {
      reject(e)
    }
  })
})

const page = {
  data: {
    statusBarHeight: app.globalData.statusBarHeight
  },
  onLoad: function () {
  },
  onShow: function () {
    if (!app.globalData.userInfo.islogin) {
      wx.switchTab({
        url: '/pages/me/me'
      })
      return
    }
    self = this
    self.onPullDownRefresh()
  },
  start () {
  },
  click () {
    console.error('zdl')
  },
  goToRank () {
    wx.navigateTo({
      url: '/pages/werun/rank'
    })
  },
  onPullDownRefresh () {
    self.setData({
      userInfo: app.globalData.userInfo
    })
    getWeRunData().then(data => {
      const days = (new Date()).getDay()
      const weekStep = calWeekStep(data.stepInfoList, days)
      const recStep = calRecStep()
      const ratio = (weekStep * 100.00 / 40000).toFixed(2)
      const recRatio = (recStep * 100.00 / 40000).toFixed(2)
      const msg = data.message
      self.setData({
        errorMsg: '',
        weekStep,
        recStep,
        ratio,
        recRatio,
        msg
      })
      increase(self, 'weekIncrease', ratio)
      increase(self, 'recIncrease', recRatio)
    }, () => {
      api.openSetting({
        success (result) {
          if (result.authSetting && result.authSetting['scope.werun']) self.onPullDownRefresh()
        }
      })
      self.setData({
        errorMsg: '获取运动信息失败,请下拉重试'
      })
    })
    api.stopPullDownRefresh()
  }
}

Page(page)
