import * as util from '../../utils/util'
import * as tk from '../../services/default'
import api from '../../utils/api'
import { getAuth } from '../../services/auth'
import request from '../../utils/request'

const createTopicList = `mutation saveTopicInfo ($topic: TopicInput) {
  saveTopicInfo(topic: $topic)
}`
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    maxfile: 9,
    files: [],
    gpsaddr: '所在位置',
    gps: '',
    gpscity: '', // 城市定位
    text: '', // textarea显示文本
    accessToken: '',
    type: '',
    checked: false,
    loading: false, // 加载状态
    showAnonymous: '', // 匿名
  },
  onShareAppMessage () {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: '梯度公社'
        })
      }, 2000)
    })
    return {
      title: '自定义转发标题',
      path: '/pages/forum/create',
      promise
    }
  },
  onShareTimeline () {

  },

  textAreaInput: function (e) {
    this.setData({
      text: e.detail.value
    })
  },
  onChange ({ detail }) {
    this.setData({ checked: detail })
  },
  btnChooseUser: function () {
    const that = this
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    })
    wx.navigateTo({
      url: '/pages/forum/chooseUser',
      events: {
        someEvent: function (data) {
          that.setData({
            text: that.data.text.concat(data.value)
          })
        }
      },
      success: function (res) {
        console.log('选择用户')
      }
    })
  },
  btnChooseLocation: function () {
    const that = this
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          gps: `${res.latitude},${res.longitude}`,
          gpsaddr: res.name,
          gpscity: util.getCityFromStr(res.address)
        })
      }
    })
  },
  btnChooseTopic: function () {
    const that = this
    wx.showToast({
      title: '',
      icon: 'loading',
      mask: true
    })
    wx.navigateTo({
      url: '/pages/forum/chooseTopic',
      events: {
        someEvent: function (data) {
          that.setData({
            text: that.data.text.concat(data.value),
            topic: data.value,
            showAnonymous: data.anonymous, // 匿名
            type: data.id
          })
        }
      },
      success: function (res) {
      }
    })
  },

  async btnPost() {
    const that = this
    const auth = await getAuth()
    const uploadFile = that.data.files
    const imgList =  []
    console.log('img', imgList)
    uploadFile.forEach(e => imgList.push(e.fileUrl))
    if (util.trimStr(that.data.text) == '') {
      wx.showToast({
        title: '什么都没说哦',
        icon: 'error',
        mask: true
      })
      return
    }
    wx.showModal({
      title: '发布',
      content: '确定发布吗？',
      success: async function (res) {
        if (res.confirm) {
          const { data } = await request({
            url: '/graphql',
            method: 'POST',
            data: {
              query: createTopicList,
              variables: {
                topic: {
                  newpics: imgList,
                  type: that.data.type,
                  text: that.data.text,
                  gps: that.data.gps,
                  gpsaddr: that.data.gpsaddr == '所在位置' ? '' : that.data.gpsaddr,
                  gpscity: that.data.gpscity,
                  authorid: auth.openid,
                }
              }
            }
          })
          if (data.saveTopicInfo) {
            that.backAndRefresh()
          } else {
            wx.showToast({
              title: '发布失败...',
              icon: "error"
            })
          }
        }
      }
    })
  },
  backAndRefresh: function () {
    const that = this
    wx.showModal({
      title: '',
      content: '发布成功',
      showCancel: false,
      success: function (res) {
        that.setData({
          files: [],
          gpsaddr: '所在位置',
          gps: '',
          gpscity: '', // 城市定位
          text: '' // textarea显示文本
        })
        wx.switchTab({
          url: '/pages/billboard/index',
          success (e) {
            const page = getCurrentPages().pop()
            if (page == undefined || page == null) return
            page.onLoad({})
          }
        })
      }
    })
  },
  chooseImage: function (e) {
    const that = this
    const curentLength = that.data.files.length
    wx.chooseMedia({
      count: 9 - curentLength,
      sizeType: ['compressed'], // 'original', 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      mediaType: ['mix'], // 选择图片和视频
      success: function (res) {
        const files = that.data.files
        res.tempFiles.forEach(item => {
          if (item.size > 8388608) {
            wx.showToast({
              title: '图片或视频不能超过8M',
              mask: true,
              duration: 3000
            })
            return
          }
          wx.uploadFile({
            url: api.resolveUrl('file/upload'),
            filePath: `${item.tempFilePath}`,
            name: 'imgFile',
            header: {
              authorization: `Bearer ${tk.getToken()}` // token
            },
            success (res) {
              const result = JSON.parse(res.data)
              files.push({ url: item.tempFilePath, type: item.fileType, fileUrl: result.data.filename }) // 需要上传的路径
              that.setData({
                files: files
              })
            },
            fail (res) {
              wx.showToast({
                title: '上传图片失败...',
                icon: 'error',
                duration: 2000
              })
            }
          })
        })
      }
    })
  },
  previewImage: function (e) {
    const that = this
    const index = e.currentTarget.id.substr(4, e.currentTarget.id.length)// 获取选中图片下标
    const sources = that.data.files
    wx.previewMedia({
      sources: [{ url: sources[index].url, type: sources[index].type }],
      current: index,
      url: sources[index].url,
      success () {
        console.log('预览成功')
      }
    })
  },
  deleteImage (e) {
    const that = this
    const index = e.currentTarget.id.substr(4, e.currentTarget.id.length)
    const files = that.data.files
    wx.showModal({
      content: '确定要删除吗？',
      confirmText: '确认',
      success (res) {
        if (res.confirm) {
          files.splice(index, 1)
          that.setData({
            files
          })
        } else if (res.cancel) {
          return false
        }
      }
    })
  },
  getAccessToken: function () {
    const that = this
    request({
      url: 'wxapi/getAccessToken',
      success: function (res) {
        that.data.accessToken = res.data.accessToken
      },
      fail: function (res) { }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    const token = tk.getToken()
    console.log('tk', token)
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

  }
})
