import request from './utils/request'
import api from './utils/api'
import { getLogger } from './utils/logging'
import * as appService from './services/app'
import * as authService from './services/auth'
import { getWeRunData } from './services/profile'

const logger = getLogger('app')

App({
  getVersion: function () {
    return api.version
  },

  getBuildVersion: function () {
    return 1008
  },

  getAppName: function () {
    return '梯度公社'
  },

  resolveApi (url) {
    return api.resolveUrl(url)
  },

  getPrevPage: function () {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    return prevPage
  },

  getPageByNaviLevel: function (level) {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - level]

    return prevPage
  },

  authorizeCheck: function (scope) {
    const that = this
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting[scope]) {
          wx.navigateTo({
            url: '/pages/me/login'
          })
          wx.showModal({
            title: '',
            content: '请打开必须的授权设置',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting[scope]) {
                      authService.login()
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  },

  async onLaunch () {
    logger.log('launch app...')

    appService.onAppReady((err, auth) => {
      logger.log(`app launched ${!err ? 'success' : 'failed'}.`)
      if (err || !auth.userInfo) {
        logger.info('redirecting to login...')
        wx.redirectTo({ url: '/pages/me/login' })
      } else if (auth.userInfo) {
          getWeRunData().then(
            () => {
              logger.info('commit werun data ok')
            },
            (err) => {
              logger.error('commit werun data err', err)
            }
          )
        }
    })
  },

  onShow() {
    logger.info('onShow()')
  },

  getAuth () {
    return authService.getAuth()
  },

  checkAuth () {
    return !!authService.checkAuth()
  },

  async getAccessToken () {
    const data = await request({ url: 'wxapi/getAccessToken' })
    return data.accessToken
  },

  globalData: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight
  }
})
