const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    urlsrc: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      urlsrc: unescape(options.url)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('pageExtraData', data => {
      // console.log('Got stuffs by event channel', data)
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onShareAppMessage: function (options) {
    const that = this
    return {
      title: app.getAppName(),
      path: `/pages/webview/index?url=${options.webViewUrl}`,
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  }
})
