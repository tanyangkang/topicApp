import api from '../../utils/api'
import request from '../../utils/request'

const app = getApp()

const query = `query topicTypeList ($page: Int!, $size: Int!, $searchKey: String) {
  topicTypeList (pager: { page: $page, size: $size }, searchKey: $searchKey) {
    list {
      id,
      title,
      icon,
      createTime,
      subtitle,
      status,
      anonymous
    },
    pager {
      page,
      size,
      total
    }
  }
}`

const variables = {
  page: 1,
  size: 1000
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    topicList: null
  },
  btnChooseTopic (e) {
    const currentIndex = e.currentTarget.dataset.index
    const current = `#${this.data.topicList[currentIndex].title}#`
    const anonymous = this.data.topicList[currentIndex].anonymous
    const id = this.data.topicList[currentIndex].id
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('someEvent', { value: current, anonymous: anonymous, id: id })
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad () {
    const that = this
    const result = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: query,
        variables: variables
      }
    })
    const { list } = result.data.topicTypeList || []
    if (list.length > 0) {
      that.setData({
        topicList: list
      })
    }
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
