import * as util from '../../utils/util'

const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    categorys: []
  },
  updateCategorys: function () {
    const that = this
    wx.request({
      url: app.resolveApi('/topiccategorys.php'),
      method: 'POST',
      header: {
        Cookie: `PHPSESSID=${app.globalData.sessionid}`
      },
      data: {
        token: app.globalData.token,
        bv: app.getBuildVersion()
      },
      complete: function () {
        wx.stopPullDownRefresh()
      },
      success: function (res) {
        if (parseInt(res.data.err) == 0) {
          that.setData({
            categorys: res.data.result
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.updateCategorys()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!app.globalData.userInfo.islogin) {
      wx.switchTab({
        url: '/pages/me/me'
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.updateCategorys()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const that = this
    return {
      title: `社区生活——${app.getAppName()}`,
      path: '/pages/forum/index',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  }
})
