import * as util from '../../utils/util'
import request from '../../utils/request'
import api from '../../utils/api'
import { rotate, increase } from '../../utils/animation'
import { calRecStep, calWeekStep, throttleAsync } from '../../utils/util'
import { getWeRunData, getUserInfo } from '../../services/profile'

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [],
    activeIndex: 0,
    userInfo: null,
    sliderOffset: 0,
    sliderLeft: 0,
    sliderWidth: 96
  },

  init: function () {
    const that = this
    that.setData({
      sliderWidth: that.data.sysInfo.windowWidth / that.data.tabs.length,
      sliderOffset: that.data.sysInfo.windowWidth / that.data.tabs.length * that.data.activeIndex
    })
  },

  goToMember: function () {
    wx.navigateTo({
      url: '/pages/members/members?title=navigate'
    })
  },

  goToApproval: function () {
    wx.navigateTo({
      url: '/pages/approval/approval?title=navigate'
    })
  },

  goToRank () {
    wx.navigateTo({
      url: '/pages/werun/rank'
    })
  },

  async updateRunData () {
    try {
      const data = await getWeRunData()
      const days = (new Date()).getDay()
      const weekStep = calWeekStep(data.stepInfoList, days)
      const recStep = calRecStep()
      const ratio = (weekStep * 100.00 / 40000).toFixed(2)
      const recRatio = (recStep * 100.00 / 40000).toFixed(2)
      this.setData({
        weekStep,
        recStep,
        ratio,
        recRatio
      })
      increase(this, 'weekIncrease', ratio)
      increase(this, 'recIncrease', recRatio)
      return data
    } catch (e) {
      api.openSetting({
        success (result) {
          if (result.authSetting && result.authSetting['scope.werun']) {
            this.updateRunData()
          }
        }
      })
      wx.showToast({
        icon: 'error',
        title: '获取运动信息失败,请重试',
        mask: true
      })
      return e
    }
  },

  loadProfileData: throttleAsync(async function () {
    const userInfo = await getUserInfo()
    this.setData({ userInfo })
    return this.updateRunData()
  }),

  async onLoad (options) {
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          sysInfo: res
        })
        this.init()
      }
    })

    await this.loadProfileData()

    wx.hideLoading()
  },

  onShow () {
    this.loadProfileData()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }
})
