import api from '../../utils/api'
import { getLogger } from '../../utils/logging'
import * as appService from '../../services/app'
import { getAuth } from '../../services/auth'
import request from '../../utils/request'
import { getToken } from '../../services/default'
import { getUserInfo } from '../../services/profile'

const logger = getLogger('login')

const { resolveImageUrl, resolveUrl } = api

const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showRegiserForm: false,
    name: '',
    nickName: '',
    avatarUrl: defaultAvatarUrl,
    resolvedAvatarUrl: defaultAvatarUrl,
    type: ''
  },

  onChooseAvatar (e) {
    const { avatarUrl } = e.detail
    const that = this
    const token = getToken()
    wx.uploadFile({
      url: resolveUrl('/file/upload'),
      filePath: avatarUrl,
      name: 'imgFile',
      header: {
        authorization: `Bearer ${token}`
      },
      success: function (res) {
        const imginfo = JSON.parse(res.data || {})
        if (res.statusCode !== 200 || imginfo.err) {
          wx.showToast({
            title: '上传图片失败',
            icon: 'error',
            mask: true,
            duration: 2000
          })
        }
        const filename = imginfo.data.filename
        that.setData({
          resolvedAvatarUrl: resolveImageUrl(filename),
          avatarUrl: imginfo.data.filename,
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '上传失败',
          icon: 'error',
          mask: true
        })
      }
    })
  },

  async btnSubmitUserInfo (e) {
    const { name, nickName, avatarUrl } = this.data
    if (!name || !nickName) {
      wx.showToast({
        title: '请填写相应信息！',
        icon: 'none',
        duration: 1000
      })
      return
    }
    wx.showLoading({
      title: '正在提交个人信息...'
    })
    try {
      const { openid } = await getAuth()
      if (!openid) {
        wx.showToast({
          mask: true,
          title: 'Invalid authorize context'
        })
      }
      if (this.data.type == 'update') {
        const result = await request({
          url: 'graphql',
          method: 'POST',
          data: {
            variables: {
              member: { name, nickName, avatarUrl, openid }
            },
            query: `mutation saveMemberInfo ($member: MemberInput) {
              saveMemberInfo (member: $member)
            }`
          }
        })
        if (result.data.saveMemberInfo) {
          const userInfo = await getUserInfo({force: true})
          wx.showModal({
            title: '修改成功！',
            showCancel: false,
            complete: (res) => {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
      } else {
        // register as new user
        const { data: { approval } } = await request({
          url: 'graphql',
          method: 'POST',
          data: {
            variables: {
              approval: { name, nickName, avatarUrl }
            },
            query: `mutation approval ($approval: ApprovalInput) {
              approval (approval: $approval) {
                err,
                result,
                msg
              }
            }`
          }
        })
        const { msg } = approval
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 3000
        })
      }
    } catch (err) {
      logger.error('btnSubmitUserInfo()', err)
    }
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    logger.log('onLoad()', options)
    wx.showLoading({
      title: '加载中...',
    })
    const returnURL = options.return || '/pages/billboard/index'
    appService.onAppReady(async (err, auth) => {
      if (!err && auth?.userInfo?.statusCode === 1) {
        wx.switchTab({ url: returnURL })
      } else {
        logger.info('show register view')
        const {
          avatarUrl,
          nickName,
          name
        } = auth?.userInfo || {}
        this.setData({
          showRegiserForm: true,
          resolvedAvatarUrl: avatarUrl && resolveImageUrl(avatarUrl) || defaultAvatarUrl,
          nickName,
          name,
          avatarUrl,
          type: options.type
        })
      }
      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    logger.log('onShow()')
    wx.hideHomeButton()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {

  }
})
