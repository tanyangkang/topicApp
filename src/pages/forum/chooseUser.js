import pinyin from 'wl-pinyin'

import * as util from '../../utils/util'
import { getAuth } from '../../services/auth'
import request from '../../utils/request'

const app = getApp()
let employeeNameList = []
let searchList = []
const memberList = `query memberList ($page: Int!, $size: Int!) {
  memberList (pager: { page: $page, size: $size }) {
    list {
      id,
      name,
      avatarUrl,
      nickName,
      openid
    },
    pager {
      page,
      size,
      total
    }
  }
}`
let database = null

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userList: null,
    AlphabetList: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'],
    keywords: '',
    hightLight: false,
    page: 1,
    pageSize: 999
  },
  selectName: function (e) {
    const dataset = e.currentTarget.dataset
    const current = `@${dataset.name} `
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('someEvent', { value: current })
    wx.navigateBack({
      delta: 1
    })
  },
  inputTap (e) {
    const that = this
    const data = []
    const keywords = e.detail.value
    that.setData({
      keywords: keywords
    })
    const form = searchList.filter(Boolean) // 过滤空格null，undefined
    if (keywords.length > 0) {
      for (let i = 0; i < form.length; i++) {
        if (form[i].indexOf(keywords) > -1) {
          data.push(form[i])
        }
      }
      const searchResultList = that.dealUserList(data)
      for (const key in searchResultList) {
        if (searchResultList[key].length === 0) {
          delete searchResultList[key]
        }
      }
      that.setData({
        userList: searchResultList
      })
    } else {
      that.setData({
        userList: database
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    const that = this
    const auth = await getAuth()
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const userList = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: memberList,
        variables: {
          page: that.data.page,
          size: that.data.pageSize
        },
      }
    })
    const dealList = userList.data.memberList.list
    for (const k in dealList) {
      employeeNameList.push(dealList[k].name)
    }
    searchList = employeeNameList
    database = that.dealUserList(employeeNameList)
    that.setData({
      userList: database
    })
    if (dealList.length > 0) {
      wx.hideLoading()
    }
    employeeNameList = []
  },
  dealUserList (value) {
    const that = this
    const firstName = {}
    that.data.AlphabetList.forEach(item => {
      firstName[item] = []
      value.forEach(el => {
        const first = pinyin.getFirstLetter(el).substring(0, 1)
        if (first === item) {
          firstName[item].push(el)
        }
      })
    })
    return firstName
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
