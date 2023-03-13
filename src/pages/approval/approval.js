import api from '../../utils/api'
import request from '../../utils/request'
import {
  rotate,
  increase
} from '../../utils/animation'

let self = {}
const app = getApp()
const page = {
  data: {
    memberList: []
  },
  onLoad: function (options) {
    self = this
    this.onPullDownRefresh()
  },
  onPullDownRefresh () {
    request({
      url: 'wxapi/approvals',
      data: {
        openid: app.globalData.userInfo.openid,
        name: app.globalData.userInfo.nickName
      },
      success (result) {
        if (result.data) {
          const list = result.data
          list.forEach((item, index) => {
            if (index === 0) item.className = 'last'
            if (list.length - 1 === index) item.className = 'first'
          })
          setTimeout(() => {
            list.forEach(item => {
              item.animationIncrease = increase(null, null, item.ratio)
              item.animationRotate = rotate(null, null)
            })
            self.setData({
              memberList: result.data
            })
          }, 200)
        } else {
          api.showModal({
            title: '查询失败',
            message: result.data.message
          })
        }
      }
    })
    api.stopPullDownRefresh()
  },
  approve (e) {
    const item = e.currentTarget.dataset.item
    const statusCode = e.currentTarget.dataset.code
    const openid = e.currentTarget.dataset.openid
    const nickName = e.currentTarget.dataset.nickName
    const avatarUrl = item.avatarUrl
    const map = ['忽略', '通过', '拒绝']
    wx.showModal({
      title: '提示',
      content: `您确定${map[statusCode]}微信用户${nickName}？`,
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          request({
            url: 'wxapi/approve',
            method: 'PUT',
            data: {
              openid,
              nickName,
              avatarUrl,
              statusCode
            },
            success: function (res) {
              wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 2000
              })
              self.onPullDownRefresh()
            },
            fail: function (res) {
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
}

Page(page)
