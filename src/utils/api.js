/**
 * 微信原生API封装 (处理兼容性问题, 设置默认参数，系统常量等)
 */
import { parseUrl, promisify, trimLeftSlash, noop } from './util'
import { getLogger } from './logging'

const logger = getLogger('api')

const accountInfo = wx.getAccountInfoSync()
const env = accountInfo.miniProgram.envVersion // envVersion: ‘develop’ | ‘trial’, ‘release’
const isProd = env === 'release' || env === 'trial'

const envPrefixes = {
  develop: 'http://192.168.0.34:3037',
  trial: 'https://api.tiduyun.com',
  release: 'https://api.tiduyun.com'
}

logger.info(`runtime env: ${env}`)

const {
  version = '1.0.0-dev',
  appId = '$DEVELOP'
} = accountInfo.miniProgram

const resolveUrl = (api, prefix = '') => {
  if (!prefix) {
    prefix = env === 'develop' ? '' : 'api/v2'
  }
  let host = envPrefixes[env]
  return [host, trimLeftSlash(prefix), trimLeftSlash(api)].filter(Boolean).join('/')
}

export default {
  isProd,
  appId,
  version,
  resolveUrl,
  resolveImageUrl (filename) {
    if (/^https?:\/\//.test(filename)) {
      return filename
    }
    const index = filename.split('/')[0]
    if (index.length >= 4) {
      return resolveUrl(`/upload/${trimLeftSlash(filename)}`, 'api')
    }
    return resolveUrl(`/uploads/${trimLeftSlash(filename)}`)
  },
  uploadImageUrl () {
    return `${envPrefixes[env]}`
  },
  createAnimation: wx.createAnimation,
  getSetting: promisify(wx.getSetting),
  getSystemInfoSync: wx.getSystemInfoSync,
  getStorageSync: wx.getStorageSync,
  getUserInfo: promisify(wx.getUserInfo),
  getUserProfile: promisify(wx.getUserProfile),
  getWeRunData: promisify(wx.getWeRunData),
  hideLoading: wx.hideLoading ? wx.hideLoading : wx.hideToast,
  login: promisify(wx.login),
  checkSession: promisify(wx.checkSession),
  navigateBack: wx.navigateBack,
  navigateTo: wx.navigateTo,
  openSetting: wx.openSetting,
  redirectTo: wx.redirectTo,
  reLaunch: wx.reLaunch ? wx.reLaunch : wx.redirectTo,
  request: wx.request,
  scanCode: wx.scanCode,
  setNavigationBarTitle: wx.setNavigationBarTitle,
  setStorageSync: wx.setStorageSync,
  showModal: promisify(wx.showModal),
  showLoading: wx.showLoading ? wx.showLoading : param => {
    const dftParam = {
      icon: 'loading',
      duration: 100000
    }
    wx.showToast(Object.assign(dftParam, param))
  },
  showToast: wx.showToast,
  stopPullDownRefresh: wx.stopPullDownRefresh,
  switchTab: wx.switchTab,
  async showConfirm (options) {
    const {
      onCancel = noop,
      onOK = noop,
      ...rest
    } = options
    try {
      const res = await this.showModal(rest)
      if (res.confirm) {
        onOK()
      } else {
        onCancel()
      }
    } catch (e) {
      onCancel()
      return e
    }
  }
}
